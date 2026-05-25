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

Untuk YOLO/OpenCV di App Service Linux, gunakan **custom container**. Repo ini sudah punya `Dockerfile` di root, dan workflow GitHub Actions sekarang membangun image container lalu mengirimkannya ke Azure App Service for Containers.

Panduan ini tetap menjelaskan deployment dengan 2 App Service secara konsep, tetapi untuk scan YOLO yang stabil, jalur yang direkomendasikan adalah container.

#### 1) Siapkan Azure SQL Database

1. Buka [portal Azure](https://portal.azure.com).
2. Klik **Create a resource**.
3. Cari **SQL Database**.
4. Klik **Create**.
5. Isi tab **Basics**:
	- **Subscription**: pilih subscription Anda.
	- **Resource group**: pilih resource group yang sudah ada.
	- **Database name**: misalnya `snapeatsdb`.
	- **Server**: klik **Create new**.
6. Pada form server baru, isi:
	- **Server name**: misalnya `snapeats-sql-server`.
	- **Location**: pilih region yang sama dengan App Service jika memungkinkan.
	- **Authentication method**: SQL authentication.
	- **Server admin login** dan **Password**: simpan dengan aman.
7. Klik **OK**.
8. Klik **Review + create** lalu **Create**.
9. Setelah resource selesai dibuat, buka SQL Database tersebut.
10. Klik **Set server firewall** atau buka **Networking**.
11. Aktifkan akses dari Azure services bila tersedia, atau tambahkan firewall rule agar App Service bisa terhubung.

#### 2) Buat App Service untuk backend

1. Di portal Azure, klik **Create a resource**.
2. Cari **Web App**.
3. Klik **Create**.
4. Pada tab **Basics**, isi:
	- **Subscription**: subscription Anda.
	- **Resource group**: resource group yang sama.
	- **Name**: misalnya `snapeats-backend`.
	- **Publish**: `Docker Container`.
	- **Operating System**: `Linux`.
	- **Region**: pilih region yang dekat dengan SQL Database.
5. Klik **Review + create** lalu **Create**.
6. Setelah App Service siap, buka resource `snapeats-backend`.
7. Buka **Configuration** > **Application settings**.
8. Klik **New application setting**.
9. Tambahkan salah satu opsi konfigurasi berikut:
	- **Opsi 1**: `AZURE_SQL_CONNECTION_STRING`
	- **Opsi 2**: `AZURE_SQL_SERVER`, `AZURE_SQL_DATABASE`, `AZURE_SQL_USERNAME`, `AZURE_SQL_PASSWORD`, `AZURE_SQL_DRIVER`
10. Tambahkan juga `PORT` dengan nilai `8000`.
11. Klik **Save**.
12. Jika memakai container pribadi dari ACR, buka **Configuration** > **Application settings** lalu tambahkan kredensial registry:

```env
DOCKER_REGISTRY_SERVER_URL=https://<registry>.azurecr.io
DOCKER_REGISTRY_SERVER_USERNAME=<registry-username>
DOCKER_REGISTRY_SERVER_PASSWORD=<registry-password>
```

13. Klik **Save**.
14. Setelah itu, deploy melalui GitHub Actions container workflow yang membangun image dari `Dockerfile`.
15. Setelah deploy selesai, buka **Log stream** atau halaman **Overview** untuk melihat URL backend.
16. Coba buka `https://<nama-backend>.azurewebsites.net/` dan pastikan endpoint root merespons.

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

11. Deploy isi folder `frontend/dist` ke App Service frontend, atau sajikan frontend dari backend container jika Anda memilih single app service.
12. Setelah deploy selesai, buka URL frontend dan pastikan halaman utama muncul.
13. Coba halaman **Scan** dan **Riwayat** untuk memastikan frontend terhubung ke backend Azure.

#### 4) Verifikasi end-to-end

1. Buka frontend App Service di browser.
2. Masuk ke halaman **Scan**.
3. Upload foto makanan lalu jalankan analisis.
4. Buka halaman **Riwayat**.
5. Jalankan perhitungan nutrisi.
6. Pastikan data baru tampil di bagian **Riwayat tersimpan di Azure SQL**.

#### 5) Hal yang sering terlupa

1. Jangan biarkan `VITE_API_BASE_URL` tetap mengarah ke `localhost`.
2. Pastikan `allow_origins` di backend disesuaikan ke domain production saat aplikasi sudah online.
3. Pastikan App Service backend bisa menjangkau Azure SQL melalui firewall / networking yang benar.
4. Jika deploy frontend gagal karena routing SPA, pastikan App Service atau static server mengarahkan request non-file ke `index.html`.

Jika Anda ingin satu App Service saja, backend FastAPI juga bisa menyajikan hasil build frontend. Untuk repo ini, dua App Service tetap lebih mudah dipisah dan dioperasikan.

### Workflow GitHub Actions container

Workflow di [.github/workflows/deploy.yml](.github/workflows/deploy.yml) sekarang:

1. login ke registry container
2. build image dari `Dockerfile`
3. push image ke registry
4. update App Service container ke image itu

Anda perlu menyiapkan secrets berikut di GitHub:

```env
ACR_LOGIN_SERVER=<registry>.azurecr.io
ACR_USERNAME=<registry-username>
ACR_PASSWORD=<registry-password>
AZURE_WEBAPP_PUBLISH_PROFILE=<publish-profile-app-service>
```

Catatan: Anda **tidak perlu** menjalankan Docker Desktop di laptop untuk deploy ini. Build image dilakukan di GitHub Actions runner, lalu image-nya di-push ke registry dan dijalankan di Azure. Docker Desktop hanya opsional kalau Anda ingin tes container secara lokal.

### Kalau muncul error `libxcb.so.1`

Error seperti ini berarti App Service Linux yang dipakai tidak punya library OS yang dibutuhkan oleh `ultralytics` / OpenCV.

```text
ultralytics import failed: libxcb.so.1: cannot open shared object file
```

Solusi yang tepat adalah memakai **custom container**. Repo ini sudah disiapkan dengan [Dockerfile](Dockerfile) di root yang:

- menginstal dependency sistem seperti `libxcb1`
- membangun frontend
- menyalin hasil build ke backend static
- menjalankan `uvicorn` di dalam container

Alur deploy yang disarankan:

1. Build image dari `Dockerfile`.
2. Push image ke Azure Container Registry atau registry yang Anda pakai.
3. Ubah App Service menjadi **Web App for Containers**.
4. Arahkan App Service ke image container tersebut.

Kalau tetap memakai zip deploy ke App Service Linux code runtime, error ini bisa muncul lagi karena library OS tidak bisa dipasang dari `requirements.txt` saja.

### Cek cepat

```powershell
curl http://localhost:8000/
curl http://localhost:8000/foods
```

Untuk frontend, buka alamat Vite yang muncul di terminal, biasanya:

```text
http://localhost:5173
```
