import os
import json
import io
import traceback
from pathlib import Path
from typing import Any, Optional

from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
# Import ultralytics lazily inside startup to avoid import-time native dependency
# errors on App Service (e.g. missing libxcb). We'll attempt to import when
# initializing the model and continue without persistence/AI if unavailable.
from PIL import Image
import uvicorn

from db import initialize_database, is_database_ready, list_meal_history, save_meal_history

BASE_DIR = os.path.dirname(__file__)
BASE_PATH = Path(__file__).resolve().parent
API_PREFIX = "/api"

app = FastAPI(title="Senpro Food & Nutrition API", description="API untuk mendeteksi makanan Indonesia dan mengeluarkan informasi gizi.")

# Konfigurasi CORS agar bisa diakses dari Frontend (PWA/Web)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Ganti dengan URL domain Frontend di production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Path model & json: dukung lokasi di folder backend atau di root repo
possible_model_paths = [
    os.path.join(BASE_DIR, "best.pt"),
    os.path.join(os.path.dirname(BASE_DIR), "best.pt"),
]
MODEL_PATH = next((p for p in possible_model_paths if os.path.exists(p)), possible_model_paths[0])

possible_json_paths = [
    os.path.join(BASE_DIR, "nutrition_mapping.json"),
    os.path.join(os.path.dirname(BASE_DIR), "nutrition_mapping.json"),
]
JSON_PATH = next((p for p in possible_json_paths if os.path.exists(p)), possible_json_paths[0])

# Inisialisasi variabel global
model = None
nutrition_data = {}


class MealHistoryItem(BaseModel):
    food_name: str
    quantity_gram: float = 100.0


class MealHistoryEntry(BaseModel):
    meal_label: Optional[str] = None
    user_email: Optional[str] = None
    food_items: list[MealHistoryItem]
    total_nutrition: dict[str, float]
    details: list[dict[str, Any]] = []
    source: str = "manual"


@app.on_event("startup")
def load_assets():
    global model, nutrition_data
    # Load Model YOLO
    try:
        try:
            from ultralytics import YOLO
        except Exception as ie:
            raise RuntimeError(f"ultralytics import failed: {ie}") from ie

        model = YOLO(MODEL_PATH)
        print(f"[INFO] Model loaded from {MODEL_PATH}")
    except Exception as e:
        print(f"[WARNING] Model tidak dapat dimuat. AI inference akan dinonaktifkan. Error: {e}")
        print(traceback.format_exc())

    # Load Dataset JSON
    try:
        with open(JSON_PATH, 'r', encoding='utf-8') as file:
            nutrition_data = json.load(file)
            print(f"[INFO] Nutrition data loaded ({len(nutrition_data)} items)")
    except Exception as e:
        print(f"[WARNING] Gagal memuat data JSON: {e}")

    if initialize_database():
        print("[INFO] Azure SQL connection ready")
    else:
        print("[INFO] Azure SQL not configured; running without persistent history")


@app.get("/")
def read_root():
    return _serve_spa_or_status()


def _get_spa_dir() -> Path | None:
    candidates = [
        BASE_PATH / "static",
        BASE_PATH / "frontend_dist",
        BASE_PATH.parent / "frontend" / "dist",
    ]

    for candidate in candidates:
        if (candidate / "index.html").exists():
            return candidate

    return None


def _serve_spa_or_status():
    spa_dir = _get_spa_dir()
    if spa_dir is not None:
        return FileResponse(spa_dir / "index.html")

    return {"status": "success", "message": "Senpro Food API Berjalan Normal"}


def _serve_root_static(filename: str):
    spa_dir = _get_spa_dir()
    if spa_dir is None:
        raise HTTPException(status_code=404, detail="Static assets not found")

    file_path = spa_dir / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail=f"File '{filename}' not found")

    return FileResponse(file_path)


@app.get("/LogoSnapEats.png")
def logo_asset():
    return _serve_root_static("LogoSnapEats.png")


@app.get("/favicon.svg")
def favicon_asset():
    return _serve_root_static("favicon.svg")


@app.get("/manifest.webmanifest")
def manifest_asset():
    return _serve_root_static("manifest.webmanifest")


@app.get("/sw.js")
def service_worker_asset():
    return _serve_root_static("sw.js")


@app.post(f"{API_PREFIX}/predict")
async def predict_food(file: UploadFile = File(...)):
    if model is None:
        raise HTTPException(status_code=500, detail="Model YOLO belum tersedia/tidak terbaca. Pastikan proses training sudah selesai.")

    # Membaca file gambar dari request API
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="File yang diupload bukan format gambar yang valid.")

    # Menjalankan inferensi model AI
    results = model(image)

    response_data = {"status": "success", "detections": []}

    for result in results:
        boxes = result.boxes
        for box in boxes:
            # Dapatkan Class ID & Nama
            class_id = int(box.cls[0].item())
            class_name = model.names[class_id]
            confidence = float(box.conf[0].item())

            # Abaikan prediksi yang nilai percayanya rendah (opsional, misal < 30%)
            if confidence < 0.3:
                continue

            # Dapatkan Box coordinates [x_min, y_min, x_max, y_max]
            x1, y1, x2, y2 = box.xyxy[0].tolist()

            # Cari informasi gizi
            gizi = nutrition_data.get(class_name, None)

            detection = {
                "food_name": class_name,
                "confidence": round(confidence, 4),
                "bounding_box": {
                    "x_min": round(x1, 2),
                    "y_min": round(y1, 2),
                    "x_max": round(x2, 2),
                    "y_max": round(y2, 2)
                },
                "nutrition_info": gizi if gizi else "Data gizi belum tersedia"
            }

            response_data["detections"].append(detection)

    return response_data


from pydantic import BaseModel
from typing import List


class FoodItem(BaseModel):
    food_name: str
    quantity_gram: float = 100.0


class MealRequest(BaseModel):
    foods: List[FoodItem]


@app.get(f"{API_PREFIX}/foods")
def get_all_foods():
    """Mengembalikan daftar semua makanan nusantara yang disupport oleh model beserta data gizinya."""
    if not nutrition_data:
        raise HTTPException(status_code=404, detail="Data gizi belum dimuat.")
    return {
        "status": "success",
        "total_items": len(nutrition_data),
        "foods": list(nutrition_data.keys())
    }


@app.get(f"{API_PREFIX}/foods/{{food_name}}")
def get_food_nutrition(food_name: str):
    """Mengembalikan informasi gizi untuk satu spesifik makanan."""
    gizi = nutrition_data.get(food_name)
    if not gizi:
        raise HTTPException(status_code=404, detail=f"Makanan '{food_name}' tidak ditemukan dalam database.")

    return {
        "status": "success",
        "food_name": food_name,
        "nutrition_info": gizi
    }


@app.post(f"{API_PREFIX}/calculate")
def calculate_meal(meal: MealRequest):
    """
    Menghitung total gizi dari beberapa makanan sekaligus.
    Berguna jika pengguna ingin melihat akumulasi gizi dari satu piring makanannya.
    Misal: 1 porsi ayam goreng (100g) + 1 porsi nasi padang (200g).
    """
    total_nutrition = {
        "Energy": 0.0, "Protein": 0.0, "Fat": 0.0, "CHO": 0.0,
        "Ca": 0.0, "P": 0.0, "Fe": 0.0, "Water": 0.0
    }

    details = []

    for item in meal.foods:
        gizi = nutrition_data.get(item.food_name)
        if not gizi:
            continue

        ratio = item.quantity_gram / 100.0

        item_nut = {
            "Energy": round(gizi.get("Energy", 0) * ratio, 2),
            "Protein": round(gizi.get("Protein", 0) * ratio, 2),
            "Fat": round(gizi.get("Fat", 0) * ratio, 2),
            "CHO": round(gizi.get("CHO", 0) * ratio, 2),
            "Ca": round(gizi.get("Ca", 0) * ratio, 2),
            "Fe": round(gizi.get("Fe", 0) * ratio, 2)
        }

        for key in item_nut:
            total_nutrition[key] += item_nut[key]
            total_nutrition[key] = round(total_nutrition[key], 2)

        details.append({
            "food_name": item.food_name,
            "quantity_gram": item.quantity_gram,
            "nutrition_calculated": item_nut
        })

    return {
        "status": "success",
        "total_nutrition": total_nutrition,
        "details": details
    }


@app.post(f"{API_PREFIX}/history/meals")
def create_meal_history(entry: MealHistoryEntry):
    saved = save_meal_history(entry.model_dump())
    if not saved:
        raise HTTPException(status_code=503, detail="Riwayat belum bisa disimpan ke Azure SQL.")

    return {
        "status": "success",
        "message": "Riwayat makan tersimpan.",
        "record": saved
    }


@app.get(f"{API_PREFIX}/history/meals")
def get_meal_history(limit: int = Query(default=10, ge=1, le=100)):
    if not is_database_ready():
        raise HTTPException(status_code=503, detail="Azure SQL belum dikonfigurasi.")

    records = list_meal_history(limit=limit)
    return {
        "status": "success",
        "total_items": len(records),
        "items": records
    }


spa_dir = _get_spa_dir()
if spa_dir is not None:
    app.mount("/assets", StaticFiles(directory=spa_dir / "assets"), name="assets")


@app.get("/{full_path:path}")
def spa_fallback(full_path: str):
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="Not found")

    return _serve_spa_or_status()


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv('PORT', 8000)))
