# 📊 Dokumentasi API Pencatatan Gizi Harian - SnapEats Backend

## 🎯 Daftar Isi
1. [Pengenalan](#pengenalan)
2. [Endpoint List](#endpoint-list)
3. [Detail Endpoint](#detail-endpoint)
4. [Contoh Penggunaan](#contoh-penggunaan)
5. [Error Handling](#error-handling)

---

## 🔍 Pengenalan

API ini menyediakan endpoint untuk pencatatan gizi harian dengan fitur:
- ✅ Membuat entri gizi baru (nama makanan, kalori, protein, karb, lemak)
- ✅ Melihat ringkasan gizi harian
- ✅ Melihat ringkasan gizi mingguan
- ✅ Menetapkan target nutrisi harianMenetapkan target nutrisi harian
- ✅ Mengupdate dan menghapus entri gizi
- ✅ Filter berdasarkan jenis makanan (breakfast, lunch, dinner, snack)

**Base URL:** `http://localhost:8000/api/nutrition`

---

## 📋 Endpoint List

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/entries?user_id={id}` | Membuat entri gizi baru |
| GET | `/entries/{user_id}` | Mendapatkan semua entri gizi |
| GET | `/daily-summary/{user_id}` | Ringkasan gizi harian |
| GET | `/weekly-summary/{user_id}` | Ringkasan gizi mingguan |
| GET | `/entries/{user_id}/by-meal-type` | Entri berdasarkan jenis makanan |
| PUT | `/entries/{entry_id}` | Memperbarui entri gizi |
| DELETE | `/entries/{entry_id}` | Menghapus entri gizi |
| POST | `/goals/{user_id}` | Menetapkan target nutrisi |
| GET | `/goals/{user_id}` | Mendapatkan target nutrisi |

---

## 🔧 Detail Endpoint

### 1. ✅ Membuat Entri Gizi Baru

**Endpoint:** `POST /entries?user_id={user_id}`

**Parameter Query:**
- `user_id` (required): ID pengguna

**Request Body:**
```json
{
  "food_name": "Nasi Goreng",
  "calories": 450,
  "protein": 15,
  "carbs": 55,
  "fat": 18,
  "fiber": 3,
  "portion_size": "1 piring",
  "meal_type": "breakfast",
  "image_url": null,
  "notes": "Dengan telur dan sayuran"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "user_id": 1,
  "food_name": "Nasi Goreng",
  "calories": 450,
  "protein": 15,
  "carbs": 55,
  "fat": 18,
  "fiber": 3,
  "portion_size": "1 piring",
  "meal_type": "breakfast",
  "timestamp": "2026-03-30T10:30:45.123456",
  "image_url": null,
  "notes": "Dengan telur dan sayuran"
}
```

**Catatan:**
- Jenis makanan harus salah satu: `breakfast`, `lunch`, `dinner`, `snack`
- Semua nilai nutrisi dalam gram atau kcal
- `timestamp` akan otomatis diisi dengan waktu saat ini

---

### 2. 📝 Mendapatkan Semua Entri Gizi

**Endpoint:** `GET /entries/{user_id}`

**Parameter:**
- `user_id` (path, required): ID pengguna
- `limit` (query, optional): Jumlah maksimal hasil (default: 100, max: 1000)
- `offset` (query, optional): Offset untuk pagination (default: 0)

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "food_name": "Nasi Goreng",
    "calories": 450,
    "protein": 15,
    "carbs": 55,
    "fat": 18,
    "fiber": 3,
    "portion_size": "1 piring",
    "meal_type": "breakfast",
    "timestamp": "2026-03-30T10:30:45.123456",
    "image_url": null,
    "notes": "Dengan telur dan sayuran"
  }
]
```

**Catatan:**
- Data diurutkan berdasarkan timestamp (terbaru dulu)
- Mendukung pagination dengan `limit` dan `offset`

---

### 3. 📅 Ringkasan Gizi Harian

**Endpoint:** `GET /daily-summary/{user_id}`

**Parameter:**
- `user_id` (path, required): ID pengguna
- `date` (query, optional): Tanggal dalam format `YYYY-MM-DD` (default: hari ini)

**Response:**
```json
{
  "date": "2026-03-30",
  "total_calories": 2000,
  "total_protein": 100,
  "total_carbs": 250,
  "total_fat": 60,
  "total_fiber": 30,
  "meal_count": 3,
  "entries": [...]
}
```

**Contoh Request:**
```
GET /daily-summary/1
GET /daily-summary/1?date=2026-03-25
```

---

### 4. 📊 Ringkasan Gizi Mingguan

**Endpoint:** `GET /weekly-summary/{user_id}`

**Parameter:**
- `user_id` (path, required): ID pengguna
- `end_date` (query, optional): Tanggal akhir (default: hari ini)

**Response:**
```json
{
  "start_date": "2026-03-24",
  "end_date": "2026-03-30",
  "avg_daily_calories": 1850,
  "days": [
    {
      "date": "2026-03-24",
      "total_calories": 2000,
      "total_protein": 100,
      "total_carbs": 250,
      "total_fat": 60,
      "total_fiber": 30,
      "meal_count": 3
    },
    ...
  ]
}
```

---

### 5. 🍽️ Entri Berdasarkan Jenis Makanan

**Endpoint:** `GET /entries/{user_id}/by-meal-type`

**Parameter:**
- `user_id` (path, required): ID pengguna
- `meal_type` (query, required): `breakfast`, `lunch`, `dinner`, atau `snack`
- `date` (query, optional): Tanggal (default: hari ini)

**Response:**
```json
{
  "meal_type": "breakfast",
  "date": "2026-03-30",
  "total_calories": 450,
  "entries": [...]
}
```

---

### 6. ✏️ Memperbarui Entri Gizi

**Endpoint:** `PUT /entries/{entry_id}`

**Parameter:**
- `entry_id` (path, required): ID entri gizi

**Request Body:** (sama seperti membuat entri)
```json
{
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
```

**Response:** Entri yang sudah diperbarui

---

### 7. 🗑️ Menghapus Entri Gizi

**Endpoint:** `DELETE /entries/{entry_id}`

**Parameter:**
- `entry_id` (path, required): ID entri gizi

**Response:**
```json
{
  "success": true,
  "message": "Entri gizi 'Nasi Goreng' berhasil dihapus",
  "data": {
    "deleted_id": 1
  }
}
```

---

### 8. 🎯 Menetapkan Target Nutrisi

**Endpoint:** `POST /goals/{user_id}`

**Parameter:**
- `user_id` (path, required): ID pengguna

**Request Body:**
```json
{
  "daily_calories": 2500,
  "daily_protein": 125,
  "daily_carbs": 312,
  "daily_fat": 83
}
```

**Response:**
```json
{
  "id": 1,
  "user_id": 1,
  "daily_calories": 2500,
  "daily_protein": 125,
  "daily_carbs": 312,
  "daily_fat": 83,
  "created_at": "2026-03-30T10:30:45.123456",
  "updated_at": "2026-03-30T10:30:45.123456"
}
```

---

### 9. 📌 Mendapatkan Target Nutrisi

**Endpoint:** `GET /goals/{user_id}`

**Parameter:**
- `user_id` (path, required): ID pengguna

**Response:** Target nutrisi pengguna

---

## 💡 Contoh Penggunaan

### cURL

#### Membuat Entri Gizi
```bash
curl -X POST http://localhost:8000/api/nutrition/entries?user_id=1 \
  -H "Content-Type: application/json" \
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
```

#### Mendapatkan Ringkasan Harian
```bash
curl -X GET http://localhost:8000/api/nutrition/daily-summary/1
```

#### Mendapatkan Ringkasan Mingguan
```bash
curl -X GET http://localhost:8000/api/nutrition/weekly-summary/1
```

### Python

```python
import requests

BASE_URL = "http://localhost:8000/api/nutrition"

# Membuat entri
entry_data = {
    "food_name": "Nasi Goreng",
    "calories": 450,
    "protein": 15,
    "carbs": 55,
    "fat": 18,
    "fiber": 3,
    "portion_size": "1 piring",
    "meal_type": "breakfast"
}

response = requests.post(f"{BASE_URL}/entries?user_id=1", json=entry_data)
print(response.json())

# Mendapatkan ringkasan harian
response = requests.get(f"{BASE_URL}/daily-summary/1")
print(response.json())
```

### JavaScript/Fetch

```javascript
const BASE_URL = "http://localhost:8000/api/nutrition";

// Membuat entri
const entryData = {
  food_name: "Nasi Goreng",
  calories: 450,
  protein: 15,
  carbs: 55,
  fat: 18,
  fiber: 3,
  portion_size: "1 piring",
  meal_type: "breakfast"
};

fetch(`${BASE_URL}/entries?user_id=1`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(entryData)
})
.then(res => res.json())
.then(data => console.log(data));

// Mendapatkan ringkasan harian
fetch(`${BASE_URL}/daily-summary/1`)
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## ⚠️ Error Handling

### Status Code

| Code | Deskripsi |
|------|-----------|
| 200 | OK - Request berhasil |
| 201 | Created - Resource berhasil dibuat |
| 400 | Bad Request - Parameter tidak valid |
| 404 | Not Found - Resource tidak ditemukan |
| 500 | Internal Server Error - Error di server |

### Contoh Error Response

```json
{
  "detail": "User ID harus lebih dari 0"
}
```

---

## 🔐 Validasi Input

### Meal Type
Harus salah satu:
- `breakfast` - Sarapan
- `lunch` - Makan siang
- `dinner` - Makan malam
- `snack` - Cemilan

### Format Tanggal
`YYYY-MM-DD` (contoh: 2026-03-30)

### Nutrisi
- Kalori, Protein, Karb, Lemak: Bilangan positif (>= 0)
- Serat: Bilangan positif (>= 0), opsional

---

## 📚 Referensi Cepat

| Kebutuhan | Endpoint |
|-----------|----------|
| Catat makanan baru | `POST /entries?user_id=1` |
| Lihat history | `GET /entries/1?limit=50` |
| Lihat hari ini | `GET /daily-summary/1` |
| Lihat minggu ini | `GET /weekly-summary/1` |
| Lihat sarapan hari ini | `GET /entries/1/by-meal-type?meal_type=breakfast` |
| Set target | `POST /goals/1` |
| Ubah makanan | `PUT /entries/1` |
| Hapus makanan | `DELETE /entries/1` |

---

## 🚀 Menjalankan Server

```bash
# Dari direktori backend
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

Akses dokumentasi interaktif:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

**Dibuat oleh:** Backend Team  
**Terakhir diupdate:** 30 Maret 2026
