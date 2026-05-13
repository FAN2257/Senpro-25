# SnapEats

Snap. Track. Eat Well.

Anggota 1: Fadel Aulia Naldi - 23/519144/TK/57236

Anggota 2: Lalu Kevin Proudy Handal - 23/515833/TK/56745

Anggota 3: Mirsad Alganawi Azma - 23/522716/TK/57737

Anggota 4: Bintang Mahardika Shandy - 23/517449/TK/56919

## Quick Start Demo

Pakai alur ini supaya backend dan frontend bisa dijalankan ulang dengan cepat dari root repo.

### 1) Backend

```powershell
cd D:\Senpro25\backend
if (-not (Test-Path .venv)) { python -m venv .venv }
. .\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```

### 2) Frontend

Pastikan file `frontend\.env` berisi:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Lalu jalankan:

```powershell
cd D:\Senpro25\frontend
npm install
npm run dev
```

### 3) Jalankan Keduanya Sekaligus

```powershell
cd D:\Senpro25
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
.\scripts\start-demo.ps1
```

### 4) Script Individual

- `scripts\start-backend.ps1` untuk membuka backend saja.
- `scripts\start-frontend.ps1` untuk membuka frontend saja.

### 5) Cek Cepat

```powershell
curl http://localhost:8000/
curl http://localhost:8000/foods
```

Catatan:
- Untuk demo PWA offline, gunakan frontend build/preview jika ingin service worker aktif.
- Jika Anda menjalankan demo berulang kali, gunakan `scripts\start-demo.ps1` agar tidak perlu mengingat urutan command.
