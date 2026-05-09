import os
import json
import io
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from PIL import Image
import uvicorn

app = FastAPI(title="Senpro Food & Nutrition API", description="API untuk mendeteksi makanan Indonesia dan mengeluarkan informasi gizi.")

# Konfigurasi CORS agar bisa diakses dari Frontend (PWA/Web)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Ganti dengan URL domain Frontend di production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Konfigurasi Path
# Pastikan URL model mengarah ke hasil training (berdasarkan output yolo_training.ipynb)
MODEL_PATH = "best.pt"
JSON_PATH = "nutrition_mapping.json"

# Inisialisasi variabel global
model = None
nutrition_data = {}

# Fungsi untuk memuat data & model saat proses startup
@app.on_event("startup")
def load_assets():
    global model, nutrition_data
    
    # Load Model YOLO
    try:
        model = YOLO(MODEL_PATH)
        print(f"[INFO] Model loaded from {MODEL_PATH}")
    except Exception as e:
        print(f"[WARNING] Model tidak ditemukan di {MODEL_PATH}. Pastikan Anda sudah menjalankan training.")
    
    # Load Dataset JSON
    try:
        with open(JSON_PATH, 'r') as file:
            nutrition_data = json.load(file)
            print(f"[INFO] Nutrition data loaded ({len(nutrition_data)} items)")
    except Exception as e:
        print(f"[WARNING] Gagal memuat data JSON: {e}")

@app.get("/")
def read_root():
    return {"status": "success", "message": "Senpro Food API Berjalan Normal"}

@app.post("/predict")
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

@app.get("/foods")
def get_all_foods():
    """Mengembalikan daftar semua makanan nusantara yang disupport oleh model beserta data gizinya."""
    if not nutrition_data:
        raise HTTPException(status_code=404, detail="Data gizi belum dimuat.")
    return {
        "status": "success", 
        "total_items": len(nutrition_data),
        "foods": list(nutrition_data.keys())
    }

@app.get("/foods/{food_name}")
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

@app.post("/calculate")
def calculate_meal_nutrition(meal: MealRequest):
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
            
        # Hitung rasio berat (karena data di database biasanya per 100g)
        # Asumsi default database adalah per 100g, jadi rasio = berat_dimakan / 100
        ratio = item.quantity_gram / 100.0
        
        item_nut = {
            "Energy": round(gizi.get("Energy", 0) * ratio, 2),
            "Protein": round(gizi.get("Protein", 0) * ratio, 2),
            "Fat": round(gizi.get("Fat", 0) * ratio, 2),
            "CHO": round(gizi.get("CHO", 0) * ratio, 2),
            "Ca": round(gizi.get("Ca", 0) * ratio, 2),
            "Fe": round(gizi.get("Fe", 0) * ratio, 2)
        }
        
        # Tambahkan ke total
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

if __name__ == "__main__":
    # Menjalankan server pada port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)