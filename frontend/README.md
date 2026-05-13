# SnapEats Frontend

Stack yang dipakai di folder ini dipilih untuk paling kompatibel dengan backend FastAPI di root repo:

- React 18 + TypeScript
- Vite sebagai build tool
- React Router untuk navigasi halaman
- TanStack Query untuk data fetching dan caching
- Service worker native (`public/sw.js`) untuk offline caching (app shell + endpoint `GET /foods`)
- Zustand untuk scan state management
- react-hot-toast untuk user feedback yang lebih polished
- CSS variables + custom layout system untuk styling modern, ringan, dan mudah dijaga

## Kenapa stack ini

- Cepat untuk development dan build
- Mudah diintegrasikan ke endpoint FastAPI seperti `/predict`, `/foods`, `/foods/{food_name}`, dan `/calculate`
- Cocok untuk demo akademik karena alur UI bisa dibuat jelas, responsif, dan mudah dipresentasikan
- Lebih ringan dibanding framework yang lebih berat untuk scope PWA kecil-menengah

## Struktur folder

```text
frontend/
  package.json
  vite.config.ts
  index.html
  public/
    favicon.svg
  src/
    App.tsx
    main.tsx
    components/
      AppShell.tsx
    lib/
      api.ts
    pages/
      DashboardPage.tsx
      ScanPage.tsx
      FoodsPage.tsx
      FoodDetailPage.tsx
      HistoryPage.tsx
      LoginPage.tsx
      RegisterPage.tsx
    styles/
      globals.css
    types/
      api.ts
```

## Cara jalan

```bash
cd frontend
npm install
npm run dev
```

Jika backend FastAPI berjalan di port 8000, frontend akan otomatis memakai:

```bash
VITE_API_BASE_URL=http://localhost:8000
```

## Catatan UI/UX

Desain dibuat dengan prinsip:

- Hierarki visual yang jelas
- CTA utama terlihat tegas
- Form dan konten diberi ruang napas yang cukup
- Responsif untuk desktop dan mobile
- Kontras warna aman dan mudah dibaca
- Fokus pada alur utama: scan, lihat nutrisi, simpan riwayat

## Peningkatan yang sudah diterapkan

- PWA offline-ready: app shell dicache melalui service worker, termasuk fallback cache untuk endpoint `GET /foods`.
- UI presentation mode: animasi reveal berbasis `framer-motion` di landing dashboard dan interaksi card yang lebih hidup.
- Scan flow lebih matang: state tersentralisasi via Zustand, toast feedback untuk setiap aksi utama, dan ringkasan recent scans.
