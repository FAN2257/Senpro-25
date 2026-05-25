# SnapEats

Snap. Track. Eat Well.

Anggota 1: Fadel Aulia Naldi - 23/519144/TK/57236

Anggota 2: Lalu Kevin Proudy Handal - 23/515833/TK/56745

Anggota 3: Mirsad Alganawi Azma - 23/522716/TK/57737

Anggota 4: Bintang Mahardika Shandy - 23/517449/TK/56919

## Development Setup

Workspace ini dikonfigurasi agar backend dan frontend otomatis berjalan ketika folder ini dibuka di VS Code.

### Otomatis saat buka VS Code

- Task auto-start ada di [.vscode/tasks.json](.vscode/tasks.json).
- Backend dijalankan dari `backend/.venv` dengan `uvicorn api:app --host 0.0.0.0 --port 8000 --reload`.
- Frontend dijalankan dari `frontend`; skripnya akan install dependency hanya jika `node_modules` belum ada, lalu menjalankan `npm run dev`.

### Manual fallback

Kalau perlu menjalankan manual, pakai dua script ini:

- `scripts/start-backend.cmd`
- `scripts/start-frontend.cmd`

Catatan:
- `scripts/start-backend.cmd` akan membuat `.venv` jika belum ada, lalu memasang dependency backend dari `requirements.txt`.
- `scripts/start-frontend.cmd` akan memasang dependency frontend hanya saat `node_modules` belum ada, lalu menjalankan Vite dev server.

### Langkah run dari clone baru

Kalau baru clone repo di device lain, urutan yang paling aman adalah:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt

cd ..\frontend
npm install
```

Setelah itu jalankan salah satu opsi berikut:

```powershell
scripts\start-backend.cmd
scripts\start-frontend.cmd
```

Atau jalankan lewat task VS Code yang sudah disediakan.

### Environment frontend

Pastikan `frontend/.env.local` berisi:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_URL=https://pxgikjslgycxgbehjrop.supabase.co
VITE_SUPABASE_ANON_KEY=<SUPABASE_ANON_OR_PUBLISHABLE_KEY>
```

Jika Anda memakai key publishable dari dashboard Supabase, isi `VITE_SUPABASE_PUBLISHABLE_KEY` sebagai gantinya:

```env
VITE_SUPABASE_PUBLISHABLE_KEY=<SUPABASE_PUBLISHABLE_KEY>
```

Panduan tes akun Supabase ada di [docs/supabase-auth-testing.md](docs/supabase-auth-testing.md).

### Environment backend untuk Azure SQL

Di App Service backend, set application settings berikut:

```env
AZURE_SQL_CONNECTION_STRING=Driver={ODBC Driver 18 for SQL Server};Server=tcp:<server>.database.windows.net,1433;Database=<database>;Uid=<username>;Pwd=<password>;Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;
```

Jika ingin memecah variabelnya, backend juga menerima:

```env
AZURE_SQL_SERVER=tcp:<server>.database.windows.net,1433
AZURE_SQL_DATABASE=<database>
AZURE_SQL_USERNAME=<username>
AZURE_SQL_PASSWORD=<password>
AZURE_SQL_DRIVER=ODBC Driver 18 for SQL Server
```

Backend akan membuat tabel `dbo.meal_history` otomatis saat koneksi Azure SQL berhasil.

### Deploy ke Azure App Service

Struktur yang paling aman untuk repo ini adalah 2 App Service:

1. `snapeats-backend` untuk FastAPI.
2. `snapeats-frontend` untuk hasil build Vite.

Langkah backend:

1. Buat App Service Python di Linux.
2. Set startup command:

```bash
python -m uvicorn api:app --host 0.0.0.0 --port 8000
```

3. Set application settings backend:
	- `AZURE_SQL_CONNECTION_STRING` atau empat variabel `AZURE_SQL_*`
	- `PORT=8000`
4. Deploy folder `backend/`.
5. Pastikan firewall Azure SQL mengizinkan outbound App Service atau aktifkan opsi koneksi yang sesuai di portal Azure.

Langkah frontend:

1. Set build env `VITE_API_BASE_URL` ke URL backend App Service, misalnya `https://snapeats-backend.azurewebsites.net`.
2. Jalankan `npm run build` di folder `frontend/`.
3. Deploy isi folder `frontend/dist` ke App Service kedua.
4. Untuk SPA routing, pastikan server frontend mengarahkan request selain file statis ke `index.html`.

Jika Anda ingin satu App Service saja, backend FastAPI bisa juga menyajikan hasil build frontend, tetapi untuk repo ini 2 App Service lebih sederhana dan lebih mudah dipelihara.

### Cek cepat

```powershell
curl http://localhost:8000/
curl http://localhost:8000/foods
```

Untuk frontend, buka alamat Vite yang muncul di terminal, biasanya:

```text
http://localhost:5173
```
