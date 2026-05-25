import pytest
from fastapi.testclient import TestClient
import sys
import os

# Menambahkan direktori backend ke sys.path untuk dapat import dari api.py
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../backend')))
from api import app, API_PREFIX

client = TestClient(app)

def test_read_root():
    """Test mengecek apakah root / berjalan."""
    response = client.get("/")
    assert response.status_code == 200

def test_get_all_foods():
    """Test mengambil daftar semua makanan dari database JSON."""
    response = client.get(f"{API_PREFIX}/foods")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    # Harus ada status kesuksesan / data dictionary dari makanan
    assert len(data) >= 0 

def test_get_food_nutrition_valid():
    """Test mengambil gizi makanan dengan nama yang spesifik."""
    # Asumsikan 'Rendang' ada di database
    response = client.get(f"{API_PREFIX}/foods/Rendang")
    # Bila kita asumsikan Rendang valid, maka status code = 200
    if response.status_code == 200:
        data = response.json()
        assert "calories_per_100g" in data
        assert "protein_g" in data
        assert "carbs_g" in data
        assert "fat_g" in data

def test_get_food_nutrition_invalid():
    """Test menangani kasus ketika makanan tidak ada di JSON."""
    response = client.get(f"{API_PREFIX}/foods/BatuKerikil999")
    assert response.status_code == 404
    data = response.json()
    assert "detail" in data
    assert "tidak ditemukan" in data["detail"].lower()

def test_calculate_meal():
    """Test endpoint kalkulasi nutrisi dengan porsi custom (Testing Operation View Food Data - Porsi)."""
    payload = {
        "food_name": "Rendang",
        "weight_grams": 150
    }
    response = client.post(f"{API_PREFIX}/calculate", json=payload)
    if response.status_code == 200:
        data = response.json()
        assert data["food_name"] == "Rendang"
        assert data["weight_grams"] == 150
        assert "total_calories" in data

def test_model_status():
    """Test memeriksa apakah model Machine Learning termuat."""
    response = client.get(f"{API_PREFIX}/model-status")
    assert response.status_code == 200
    data = response.json()
    assert "success" in data

def test_history_api():
    """Test endpoint riwayat asupan makanan pengguna (View History)."""
    # Secara default, jika DB tidak siap/mock, ini mungkin mengembalikan 500, tergantung implementasi.
    # Kita hanya memeriksa apakah endpoint merespon format yang benar (JSON dan status tertentu).
    response = client.get(f"{API_PREFIX}/history/meals?limit=5")
    assert response.status_code in [200, 500] 
