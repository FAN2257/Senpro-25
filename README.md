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
- Frontend dijalankan dari `frontend` dengan `npm run dev`.

### Manual fallback

Kalau perlu menjalankan manual, pakai dua script ini:

- `scripts/start-backend.cmd`
- `scripts/start-frontend.cmd`

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

### Cek cepat

```powershell
curl http://localhost:8000/
curl http://localhost:8000/foods
```
