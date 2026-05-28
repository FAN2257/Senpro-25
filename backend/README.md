# Backend (SnapEats)

Folder ini berisi backend API untuk SnapEats (FastAPI) yang menyediakan endpoint:
- `GET /` - health check
- `POST /predict` - upload gambar, jalankan YOLO, kembalikan deteksi + info gizi
- `GET /foods` - daftar makanan yang didukung
- `GET /foods/{food_name}` - detail data nutrisi per makanan
- `POST /calculate` - akumulasi gizi dari beberapa makanan (request JSON)

Persiapan & cara jalan (Windows / Linux):

1. Buat virtualenv dan aktifkan

```bash
python -m venv .venv
# Windows
.venv\Scripts\Activate
# macOS / Linux
source .venv/bin/activate
```

2. Install dependencies

```bash
pip install -r requirements.txt
```

3. Jalankan server (dev)

```bash
uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```

Catatan:
- File model (`best.pt`) dan data nutrisi (`nutrition_mapping.json`) harus berada di folder ini. Jika Anda melakukan training ulang, letakkan model hasil training dengan nama `best.pt` di folder `backend/`.
- Untuk deployment, ganti `allow_origins` pada CORS middleware menjadi domain frontend production.

Supabase:
- Backend akan mencoba membaca `SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` terlebih dahulu.
- Jika Supabase tidak dikonfigurasi, backend masih menerima `AZURE_SQL_CONNECTION_STRING` sebagai fallback.
- Riwayat meal disimpan ke tabel `public.meal_history` dan bisa dibaca lewat endpoint `GET /history/meals`.
- Schema Supabase ada di `supabase_schema.sql`.
- Di Supabase Dashboard, buka **SQL Editor** > **New query**, tempel `supabase_schema.sql`, lalu klik **Run** sekali untuk membuat tabel.
