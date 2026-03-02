# SnapEats
> Snap. Eat Smart. Live Healthy.

---

## Kelompok King Em Yu
**Project Senior Project TI**
Departemen Teknologi Elektro dan Teknologi Informasi, Fakultas Teknik, Universitas Gadjah Mada

### Anggota Kelompok
| Nama | NIM | Peran |
|------|-----|-------|
| Fadel Aulia Naldi | 23/519144/TK/57236 | Project Manager & AI Engineer |
| Lalu Kevin Proudy Handal | 23/515833/TK/56745 | UI/UX Designer |
| Mirsad Alganawi Azma | 23/522716/TK/57737 | Software Engineer |
| Bintang Mahardika Shandy | 23/517449/TK/56919 | Cloud Engineer |

---

## Nama & Jenis Produk
**SnapEats** — Progressive Web App (PWA)

Dipilih karena PWA dapat diakses lintas platform (Android, iOS, Desktop) tanpa perlu install dari app store, sehingga memperluas jangkauan pengguna dan mempermudah proses deployment di Azure.

---

## Latar Belakang & Permasalahan

Berdasarkan data Riskesdas 2018, prevalensi obesitas di Indonesia meningkat menjadi **21,8%**. Masalah utama adalah sulitnya memantau asupan nutrisi harian karena metode pencatatan manual yang memakan waktu dan tidak praktis.

**Rumusan Masalah:**
Bagaimana menyediakan platform pemantau nutrisi otomatis berbasis AI yang mampu mengidentifikasi makanan secara real-time dengan latensi rendah melalui integrasi cloud?

---

## Ide Solusi & Rancangan Fitur

Aplikasi web progresif (PWA) yang menggunakan **Computer Vision** untuk deteksi makanan otomatis, di-deploy di **Azure App Service**, dan menggunakan **Azure SQL** untuk penyimpanan riwayat nutrisi.

| Fitur | Keterangan |
|-------|-----------|
| **Instant Snap-AI** | Foto makanan → deteksi kalori otomatis via AI |
| **Azure Health Log** | Sinkronisasi riwayat makan ke cloud secara real-time |
| **Nutri-Dash** | Visualisasi grafik makronutrisi harian & mingguan |

---

## Analisis Kompetitor

| Kompetitor | Jenis | Kelebihan | Kekurangan | Keunggulan SnapEats |
|-----------|-------|-----------|------------|---------------------|
| MyFitnessPal | Direct | Database global luas, komunitas kuat | Input manual, iklan di versi gratis | AI Image Recognition untuk makanan lokal Indonesia |
| FatSecret | Direct | Gratis, database lokal cukup baik | UI ketinggalan zaman, latensi tinggi | Azure Cloud → latensi rendah, UI modern |
| Google Lens | Indirect | Deteksi objek kuat, gratis | Tidak ada riwayat kesehatan/nutrisi | Manajemen database nutrisi personal terintegrasi |