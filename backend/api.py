import os
# Ensure headless operation for libraries that may pull GUI/Qt/X11 backends.
# This helps App Service's linux image where libxcb and related X11 libraries
# are not available. Set these before any import that may trigger GUI libs
# (e.g. matplotlib, Qt, or other visualization components inside ultralytics).
import tempfile

# Prefer a writable temp directory for matplotlib's config to avoid permission issues.
mpl_config_dir = os.path.join(tempfile.gettempdir(), "matplotlib")
os.environ.setdefault("MPLBACKEND", "Agg")
os.environ.setdefault("QT_QPA_PLATFORM", "offscreen")
os.environ.setdefault("DISPLAY", "")
os.environ.setdefault("MPLCONFIGDIR", mpl_config_dir)
os.makedirs(mpl_config_dir, exist_ok=True)

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
from pydantic import ConfigDict
# Import ultralytics lazily inside startup to avoid import-time native dependency
# errors on App Service (e.g. missing libxcb). We'll attempt to import when
# initializing the model and continue without persistence/AI if unavailable.
from PIL import Image
import uvicorn

from db import get_database_backend_name, get_database_connection_configured, initialize_database, is_database_ready, list_meal_history, save_meal_history

# PyTorch 2.6 changes torch.load() to weights_only=True by default, which can
# block older Ultralytics checkpoints during startup on Azure App Service.
# Force the legacy load path so best.pt can be deserialized normally.
os.environ.setdefault("TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD", "1")

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
model_load_error = None


def _public_model_load_error(message: str) -> str:
    normalized = message.lower()

    if 'libxcb.so.1' in normalized or 'xcb' in normalized:
        return 'Model belum siap di environment App Service. Dependency native untuk backend vision belum tersedia.'

    if 'ultralytics import failed' in normalized:
        return 'Model belum siap dimuat di server saat ini.'

    return 'Model belum siap dimuat di server saat ini.'


class MealHistoryItem(BaseModel):
    food_name: str
    quantity_gram: float = 100.0


class MealHistoryEntry(BaseModel):
    model_config = ConfigDict(extra="allow")

    meal_label: Optional[str] = None
    user_email: Optional[str] = None
    food_items: list[MealHistoryItem]
    total_nutrition: dict[str, float]
    details: list[dict[str, Any]] = []
    source: str = "manual"


@app.on_event("startup")
def load_assets():
    global model, nutrition_data, model_load_error
    # Load Model YOLO
    try:
        # Ensure matplotlib backend is set to Agg and pre-initialize font cache
        # inside the writable MPLCONFIGDIR to avoid font/cache operations later
        try:
            import matplotlib
            matplotlib.use('Agg')
            # importing pyplot will build font cache in MPLCONFIGDIR if needed
            import matplotlib.pyplot as _plt
            _plt.close('all')
        except Exception:
            # Not fatal; proceed. We set MPLBACKEND and MPLCONFIGDIR at process start.
            pass
        try:
            from ultralytics import YOLO
        except Exception as ie:
            raise RuntimeError(f"ultralytics import failed: {ie}") from ie

        model = YOLO(MODEL_PATH)
        model_load_error = None
        print(f"[INFO] Model loaded from {MODEL_PATH}")
    except Exception as e:
        model_load_error = str(e)
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
        print(f"[INFO] Database ready via {get_database_backend_name()}")
    else:
        print("[INFO] Database not configured; running without persistent history")


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
async def predict_food(
    file: UploadFile = File(...),
    detect_conf: float = Query(0.15, ge=0.0, le=1.0),
    primary_conf: float = Query(0.25, ge=0.0, le=1.0),
    iou: float = Query(0.6, ge=0.0, le=1.0),
    max_det: int = Query(100, ge=1, le=1000),
    multi_label: bool = Query(True)
):
    if model is None:
        detail = "Model YOLO belum tersedia/tidak terbaca. Pastikan proses training sudah selesai."
        if model_load_error:
            detail = f"{detail} Penyebab runtime: {model_load_error}"
        raise HTTPException(status_code=503, detail=detail)

    # Membaca file gambar dari request API
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="File yang diupload bukan format gambar yang valid.")

    # Menjalankan inferensi model AI dengan parameter yang bisa dituning
    results = model.predict(image, conf=detect_conf, iou=iou, max_det=max_det, multi_label=multi_label, verbose=False)

    response_data = {"status": "success", "detections": [], "other_candidates": [], "meta": {"detect_conf": detect_conf, "primary_conf": primary_conf, "iou": iou, "max_det": max_det, "multi_label": multi_label}}

    for result in results:
        boxes = result.boxes
        for box in boxes:
            try:
                class_id = int(box.cls[0].item())
                class_name = model.names[class_id]
                confidence = float(box.conf[0].item())
            except Exception:
                # If parsing fails, skip this box
                continue

            # Dapatkan Box coordinates [x_min, y_min, x_max, y_max]
            try:
                x1, y1, x2, y2 = box.xyxy[0].tolist()
            except Exception:
                x1 = y1 = x2 = y2 = 0.0

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

            # Split into primary detections and other candidates based on primary_conf
            if confidence >= primary_conf:
                response_data["detections"].append(detection)
            else:
                response_data["other_candidates"].append(detection)

    return response_data


@app.get(f"{API_PREFIX}/model-status")
def get_model_status():
    public_load_error = _public_model_load_error(model_load_error) if model_load_error else None
    return {
        "status": "success",
        "model_path": MODEL_PATH,
        "model_path_exists": os.path.exists(MODEL_PATH),
        "model_loaded": model is not None,
        "load_error": public_load_error,
    }


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
        raise HTTPException(status_code=503, detail="Riwayat belum bisa disimpan ke database.")

    return {
        "status": "success",
        "message": "Riwayat makan tersimpan.",
        "record": saved
    }


@app.get(f"{API_PREFIX}/history/meals")
def get_meal_history(limit: int = Query(default=10, ge=1, le=100)):
    if not is_database_ready():
        raise HTTPException(status_code=503, detail="Database belum dikonfigurasi.")

    records = list_meal_history(limit=limit)
    return {
        "status": "success",
        "total_items": len(records),
        "items": records
    }


@app.get(f"{API_PREFIX}/db-status")
def get_db_status():
    db_ready = initialize_database()
    return {
        "status": "success",
        "db_ready": is_database_ready(),
        "connection_configured": get_database_connection_configured(),
        "backend": get_database_backend_name(),
        "meal_history_table_ready": db_ready,
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
