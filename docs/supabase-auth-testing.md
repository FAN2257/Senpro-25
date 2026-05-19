# Supabase Auth Testing

Panduan singkat untuk memverifikasi proses pendaftaran dan masuk menggunakan Supabase pada proyek SnapEats.

**1. Variabel lingkungan (frontend)**

Buat file `.env.local` di folder `frontend/` (atau tambahkan variabel ke environment Anda) dengan isi minimal berikut:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_URL=https://<YOUR-PROJECT>.supabase.co
VITE_SUPABASE_ANON_KEY=<YOUR_SUPABASE_ANON_KEY>
```

- Ambil `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` dari halaman Project > Settings > API di dashboard Supabase.
- Jangan pernah menaruh `service_role` (secret) pada frontend; simpan hanya pada server jika diperlukan.

**2. Menjalankan aplikasi (lokal)**

Dari root repository Anda ada skrip helper untuk memulai backend dan frontend. Contoh menjalankan dari PowerShell (jalankan dua terminal terpisah):

```powershell
.\scripts\start-backend.cmd
.\scripts\start-frontend.cmd
```

Atau jalankan manual jika perlu:

```powershell
cd frontend
npm install
npm run dev

cd ..\backend
python -m uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```

Jika Anda menggunakan VS Code, task `snapeats: start on folder open` tersedia untuk menjalankan keduanya.

**3. Test pendaftaran (Registration)**

1. Buka aplikasi frontend di browser (biasanya `http://localhost:5173` atau alamat yang ditampilkan oleh Vite).
2. Buka halaman `Masuk / Daftar`.
3. Pilih tab `Daftar`.
4. Isi formulir dengan:
   - Nama lengkap
   - Email baru (belum terdaftar di proyek Supabase Anda)
   - Password (minimal 6 karakter)
5. Klik `Daftar`.

Hasil yang diharapkan:
- Jika verifikasi email diaktifkan di Supabase, aplikasi menampilkan pesan sukses meminta verifikasi email.
- Jika verifikasi email dimatikan, akun akan langsung masuk dan diarahkan ke halaman utama.

**4. Test masuk (Login)**

1. Setelah akun dibuat (dan/atau terkonfirmasi), buka tab `Masuk`.
2. Masukkan email dan password yang sama.
3. Klik `Masuk`.

Hasil yang diharapkan:
- Muncul toast/indikator sukses.
- Anda diarahkan kembali ke halaman utama.
- Komponen auth menampilkan email pengguna yang sedang masuk.

**5. Verifikasi pengguna di dashboard Supabase**

1. Buka dashboard Supabase project Anda.
2. Masuk ke `Authentication` → `Users`.
3. Cari email yang baru saja didaftarkan.

Periksa kolom `email`, `created_at`, dan `confirmed_at` (jika verifikasi email diaktifkan).

**6. Verifikasi langsung dengan SQL (opsional)**

Gunakan SQL editor di dashboard Supabase dan jalankan:

```sql
select id, email, created_at, confirmed_at
from auth.users
order by created_at desc
limit 10;
```

**7. Masalah umum**

- Variabel environment salah atau tidak ada: frontend menampilkan peringatan bahwa Supabase belum dikonfigurasi.
- Email atau password tidak valid: akan tampil error dari Supabase.
- Tidak ada user baru di dashboard: pendaftaran mungkin gagal atau menunggu verifikasi email.

Jika Anda ingin, saya dapat menambahkan instruksi langkah-demi-langkah untuk mengambil `ANON KEY` dari panel Supabase.
