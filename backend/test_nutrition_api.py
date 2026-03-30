"""
Test/Example usage untuk Nutrition API Endpoints
API untuk pencatatan gizi harian SnapEats
"""

import requests
import json
from datetime import datetime

# Base URL
BASE_URL = "http://localhost:8000/api/nutrition"
USER_ID = 1

# ============================================
# 1. MEMBUAT ENTRI GIZI BARU
# ============================================
def create_nutrition_entry():
    """Membuat entri pencatatan gizi baru"""
    entry_data = {
        "food_name": "Nasi Goreng",
        "calories": 450,
        "protein": 15,
        "carbs": 55,
        "fat": 18,
        "fiber": 3,
        "portion_size": "1 piring",
        "meal_type": "breakfast",
        "notes": "Dengan telur dan sayuran",
        "image_url": None
    }
    
    url = f"{BASE_URL}/entries?user_id={USER_ID}"
    response = requests.post(url, json=entry_data)
    print("✅ Membuat Entri Gizi Baru:")
    print(json.dumps(response.json(), indent=2, ensure_ascii=False, default=str))
    print("\n" + "="*60 + "\n")
    return response.json()


# ============================================
# 2. MENDAPATKAN SEMUA ENTRI GIZI PENGGUNA
# ============================================
def get_user_entries():
    """Mendapatkan semua entri gizi untuk pengguna"""
    url = f"{BASE_URL}/entries/{USER_ID}?limit=10&offset=0"
    response = requests.get(url)
    print("✅ Semua Entri Gizi Pengguna:")
    print(json.dumps(response.json(), indent=2, ensure_ascii=False, default=str))
    print("\n" + "="*60 + "\n")


# ============================================
# 3. RINGKASAN GIZI HARIAN
# ============================================
def get_daily_summary():
    """Mendapatkan ringkasan gizi untuk hari ini"""
    url = f"{BASE_URL}/daily-summary/{USER_ID}"
    response = requests.get(url)
    print("✅ Ringkasan Gizi Harian:")
    print(json.dumps(response.json(), indent=2, ensure_ascii=False, default=str))
    print("\n" + "="*60 + "\n")


# ============================================
# 4. RINGKASAN GIZI MINGGUAN
# ============================================
def get_weekly_summary():
    """Mendapatkan ringkasan gizi 7 hari"""
    url = f"{BASE_URL}/weekly-summary/{USER_ID}"
    response = requests.get(url)
    print("✅ Ringkasan Gizi Mingguan:")
    print(json.dumps(response.json(), indent=2, ensure_ascii=False, default=str))
    print("\n" + "="*60 + "\n")


# ============================================
# 5. MENETAPKAN TARGET NUTRISI
# ============================================
def set_nutrition_goals():
    """Menetapkan target nutrisi harian"""
    goals_data = {
        "daily_calories": 2500,
        "daily_protein": 125,
        "daily_carbs": 312,
        "daily_fat": 83
    }
    
    url = f"{BASE_URL}/goals/{USER_ID}"
    response = requests.post(url, json=goals_data)
    print("✅ Menetapkan Target Nutrisi:")
    print(json.dumps(response.json(), indent=2, ensure_ascii=False, default=str))
    print("\n" + "="*60 + "\n")


# ============================================
# 6. MENDAPATKAN TARGET NUTRISI
# ============================================
def get_nutrition_goals():
    """Mendapatkan target nutrisi pengguna"""
    url = f"{BASE_URL}/goals/{USER_ID}"
    response = requests.get(url)
    print("✅ Target Nutrisi Pengguna:")
    print(json.dumps(response.json(), indent=2, ensure_ascii=False, default=str))
    print("\n" + "="*60 + "\n")


# ============================================
# 7. MENDAPATKAN ENTRI BERDASARKAN JENIS MAKANAN
# ============================================
def get_entries_by_meal_type():
    """Mendapatkan entri berdasarkan jenis makanan"""
    url = f"{BASE_URL}/entries/{USER_ID}/by-meal-type?meal_type=breakfast"
    response = requests.get(url)
    print("✅ Entri Gizi Berdasarkan Jenis Makanan (Breakfast):")
    print(json.dumps(response.json(), indent=2, ensure_ascii=False, default=str))
    print("\n" + "="*60 + "\n")


# ============================================
# 8. MENGHAPUS ENTRI GIZI
# ============================================
def delete_entry(entry_id: int):
    """Menghapus entri gizi"""
    url = f"{BASE_URL}/entries/{entry_id}"
    response = requests.delete(url)
    print(f"✅ Menghapus Entri Gizi ID {entry_id}:")
    print(json.dumps(response.json(), indent=2, ensure_ascii=False, default=str))
    print("\n" + "="*60 + "\n")


# ============================================
# 9. MEMPERBARUI ENTRI GIZI
# ============================================
def update_entry(entry_id: int):
    """Memperbarui entri gizi yang sudah ada"""
    updated_data = {
        "food_name": "Nasi Goreng Istimewa",
        "calories": 500,
        "protein": 20,
        "carbs": 60,
        "fat": 20,
        "fiber": 4,
        "portion_size": "1.5 piring",
        "meal_type": "lunch",
        "notes": "Dengan extra protein"
    }
    
    url = f"{BASE_URL}/entries/{entry_id}"
    response = requests.put(url, json=updated_data)
    print(f"✅ Memperbarui Entri Gizi ID {entry_id}:")
    print(json.dumps(response.json(), indent=2, ensure_ascii=False, default=str))
    print("\n" + "="*60 + "\n")


# ============================================
# CURL EXAMPLES
# ============================================
def print_curl_examples():
    """Cetak contoh menggunakan curl"""
    print("""
╔════════════════════════════════════════════════════════════════════════════╗
║                    NUTRITION API - CURL EXAMPLES                           ║
╚════════════════════════════════════════════════════════════════════════════╝

1️⃣  MEMBUAT ENTRI GIZI BARU:
─────────────────────────────────────────────────────────────────────────────
curl -X POST http://localhost:8000/api/nutrition/entries?user_id=1 \\
  -H "Content-Type: application/json" \\
  -d '{
    "food_name": "Nasi Goreng",
    "calories": 450,
    "protein": 15,
    "carbs": 55,
    "fat": 18,
    "fiber": 3,
    "portion_size": "1 piring",
    "meal_type": "breakfast",
    "notes": "Dengan telur"
  }'

2️⃣  MENDAPATKAN RINGKASAN GIZI HARIAN:
─────────────────────────────────────────────────────────────────────────────
curl -X GET http://localhost:8000/api/nutrition/daily-summary/1

3️⃣  MENDAPATKAN RINGKASAN GIZI MINGGUAN:
─────────────────────────────────────────────────────────────────────────────
curl -X GET http://localhost:8000/api/nutrition/weekly-summary/1

4️⃣  MENETAPKAN TARGET NUTRISI:
─────────────────────────────────────────────────────────────────────────────
curl -X POST http://localhost:8000/api/nutrition/goals/1 \\
  -H "Content-Type: application/json" \\
  -d '{
    "daily_calories": 2500,
    "daily_protein": 125,
    "daily_carbs": 312,
    "daily_fat": 83
  }'

5️⃣  MENDAPATKAN SEMUA ENTRI GIZI:
─────────────────────────────────────────────────────────────────────────────
curl -X GET http://localhost:8000/api/nutrition/entries/1?limit=10&offset=0

6️⃣  MENDAPATKAN ENTRI BERDASARKAN JENIS:
─────────────────────────────────────────────────────────────────────────────
curl -X GET http://localhost:8000/api/nutrition/entries/1/by-meal-type?meal_type=breakfast

7️⃣  MEMPERBARUI ENTRI GIZI:
─────────────────────────────────────────────────────────────────────────────
curl -X PUT http://localhost:8000/api/nutrition/entries/1 \\
  -H "Content-Type: application/json" \\
  -d '{
    "food_name": "Nasi Goreng Istimewa",
    "calories": 500,
    "protein": 20,
    "carbs": 60,
    "fat": 20,
    "fiber": 4,
    "portion_size": "1.5 piring",
    "meal_type": "lunch"
  }'

8️⃣  MENGHAPUS ENTRI GIZI:
─────────────────────────────────────────────────────────────────────────────
curl -X DELETE http://localhost:8000/api/nutrition/entries/1
    """)


if __name__ == "__main__":
    print("\n╔════════════════════════════════════════════════════════════════════════════╗")
    print("║          CONTOH PENGGUNAAN NUTRITION API - SNAPEATS Backend                ║")
    print("╚════════════════════════════════════════════════════════════════════════════╝\n")
    
    # Uncomment untuk menjalani test
    print_curl_examples()
    
    # Jalankan test satu per satu (Pastikan server sudah running di port 8000)
    # try:
    #     entry = create_nutrition_entry()
    #     get_user_entries()
    #     set_nutrition_goals()
    #     get_nutrition_goals()
    #     get_daily_summary()
    #     get_weekly_summary()
    #     get_entries_by_meal_type()
    # except Exception as e:
    #     print(f"❌ Error: {e}")
