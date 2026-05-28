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

Supaya deployment berjalan penuh, siapkan secrets berikut di GitHub Actions:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AZURE_WEBAPP_PUBLISH_PROFILE`

Di Supabase Dashboard, pastikan juga **Authentication** > **URL Configuration** berisi:

- **Site URL**: `https://snapeats-backend.azurewebsites.net`
- **Redirect URLs**: tambahkan `https://snapeats-backend.azurewebsites.net/auth`

Kalau frontend Anda nanti dipindah ke domain sendiri, tambahkan domain itu juga ke daftar redirect.

### Environment backend untuk Supabase

Di App Service backend, set application settings berikut:

```env
SUPABASE_URL=https://pxgikjslgycxgbehjrop.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<SUPABASE_SERVICE_ROLE_KEY>
PORT=8000
TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD=1
MPLBACKEND=Agg
QT_QPA_PLATFORM=offscreen
DISPLAY=
MPLCONFIGDIR=/tmp/matplotlib
PYTHONUNBUFFERED=1
```

Backend sekarang memprioritaskan Supabase sebagai penyimpanan riwayat. `SUPABASE_SERVICE_ROLE_KEY` hanya untuk backend dan jangan pernah dipasang di frontend.

Frontend tetap memakai key publik/publishable dari Supabase:

```env
VITE_SUPABASE_URL=https://pxgikjslgycxgbehjrop.supabase.co
VITE_SUPABASE_ANON_KEY=<SUPABASE_ANON_OR_PUBLISHABLE_KEY>
```

Schema riwayat ada di [backend/supabase_schema.sql](backend/supabase_schema.sql). Buka **SQL Editor** di Supabase, klik **New query**, lalu jalankan isi file itu sekali untuk membuat tabel `meal_history`.

Jika Anda tetap ingin memakai Azure SQL sebagai fallback, backend masih mendukung `AZURE_SQL_CONNECTION_STRING`, tetapi Supabase sekarang adalah jalur utama.

### Deploy ke Azure App Service

Panduan ini memakai 2 App Service: satu untuk backend FastAPI dan satu untuk frontend Vite.

1. Siapkan Supabase project

1. Buka [Supabase Dashboard](https://supabase.com/dashboard).
2. Klik **New project**.
3. Pilih organization.
4. Isi **Project name**, **Database password**, dan region.
5. Tunggu provisioning selesai.
6. Buka **Settings** > **API** dan salin `Project URL`, `anon public key`, serta `service_role key`.
7. Buka **SQL Editor** > **New query**.
8. Tempel isi [backend/supabase_schema.sql](backend/supabase_schema.sql) lalu klik **Run**.

#### 2) Buat App Service untuk backend

1. Di portal Azure, klik **Create a resource**.
2. Cari **Web App**.
3. Klik **Create**.
4. Pada tab **Basics**, isi:
	- **Subscription**: subscription Anda.
	- **Resource group**: resource group yang sama.
	- **Name**: misalnya `snapeats-backend`.
	- **Publish**: `Code`.
	- **Runtime stack**: `Python 3.11` atau versi Python yang tersedia.
	- **Operating System**: `Linux`.
	- **Region**: pilih region yang dekat dengan SQL Database.
5. Klik **Review + create** lalu **Create**.
9. Setelah App Service siap, buka resource `snapeats-backend`.
7. Buka **Configuration** > **Application settings**.
8. Klik **New application setting**.
9. Tambahkan application settings berikut:
	- `SUPABASE_URL`
	- `SUPABASE_SERVICE_ROLE_KEY`
	- `PORT` = `8000`
	- `TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD` = `1`
	- `MPLBACKEND` = `Agg`
	- `QT_QPA_PLATFORM` = `offscreen`
	- `DISPLAY` = kosong
	- `MPLCONFIGDIR` = `/tmp/matplotlib`
	- `PYTHONUNBUFFERED` = `1`
10. Klik **Save**.
11. Buka **Configuration** > **General settings**.
12. Pada bagian **Startup Command**, isi:

```bash
python -m uvicorn api:app --host 0.0.0.0 --port 8000
```

13. Klik **Save**.
14. Buka **Deployment Center**.
15. Pilih cara deploy yang Anda pakai, misalnya GitHub Actions, Local Git, atau upload package.
16. Deploy folder `backend/` ke App Service ini.
17. Setelah deploy selesai, buka **Log stream** atau halaman **Overview** untuk melihat URL backend.
18. Coba buka `https://<nama-backend>.azurewebsites.net/` dan pastikan endpoint root merespons.

#### 3) Buat App Service untuk frontend

1. Klik **Create a resource** lagi.
2. Cari **Web App**.
3. Klik **Create**.
4. Pada tab **Basics**, isi:
	- **Name**: misalnya `snapeats-frontend`.
	- **Publish**: `Code`.
	- **Runtime stack**: pilih Node.js jika tersedia.
	- **Operating System**: `Linux`.
	- **Region**: gunakan region yang sama jika memungkinkan.
5. Klik **Review + create** lalu **Create**.
6. Setelah App Service siap, buka resource `snapeats-frontend`.
7. Buka **Configuration** > **Application settings**.
8. Tambahkan `VITE_API_BASE_URL` dengan isi URL backend App Service, misalnya:

```text
https://snapeats-backend.azurewebsites.net
```

9. Klik **Save**.
10. Di lokal, buka folder `frontend/` lalu jalankan:

```powershell
npm run build
```

11. Deploy isi folder `frontend/dist` ke App Service frontend.
12. Setelah deploy selesai, buka URL frontend dan pastikan halaman utama muncul.
13. Coba halaman **Scan** dan **Riwayat** untuk memastikan frontend terhubung ke backend.

#### 4) Verifikasi end-to-end

1. Buka frontend App Service di browser.
2. Masuk ke halaman **Scan**.
3. Upload foto makanan lalu jalankan analisis.
4. Buka halaman **Riwayat**.
5. Jalankan perhitungan nutrisi.
6. Pastikan data baru tampil di bagian **Riwayat tersimpan di Supabase**.

#### 5) Hal yang sering terlupa

1. Jangan biarkan `VITE_API_BASE_URL` tetap mengarah ke `localhost`.
2. Pastikan `allow_origins` di backend disesuaikan ke domain production saat aplikasi sudah online.
3. Pastikan `SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` sudah benar di App Service backend.
4. Jika deploy frontend gagal karena routing SPA, pastikan App Service atau static server mengarahkan request non-file ke `index.html`.

Jika Anda ingin satu App Service saja, backend FastAPI juga bisa menyajikan hasil build frontend. Untuk repo ini, dua App Service tetap lebih mudah dipisah dan dioperasikan.

### Cek cepat

```powershell
curl http://localhost:8000/
curl http://localhost:8000/foods
```

Untuk frontend, buka alamat Vite yang muncul di terminal, biasanya:

```text
http://localhost:5173
```
