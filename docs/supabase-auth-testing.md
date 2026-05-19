# Supabase Auth Testing

Use this guide to verify SnapEats login and registration with Supabase.

## 1. Local environment

Make sure `frontend/.env.local` contains:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_URL=https://pxgikjslgycxgbehjrop.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Do not put the service role secret in the frontend. Keep it only on the server side if you ever need admin access.

## 2. Start the app

Open two terminals from the repository root:

```powershell
cd "C:\Users\Kevin TIF 23\Downloads\Senpro25\Senpro-25\backend"
python -m uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```

```powershell
cd "C:\Users\Kevin TIF 23\Downloads\Senpro25\Senpro-25\frontend"
npm run dev
```

## 3. Test registration

1. Open the frontend in the browser.
2. Go to the `Masuk / Daftar` page.
3. Switch to `Daftar`.
4. Fill in:
   - Nama lengkap
   - Email baru yang belum pernah dipakai di Supabase
   - Password minimal 6 karakter
5. Click `Daftar`.

Expected result:
- If email confirmation is enabled in Supabase, the app shows a success message asking you to verify the email.
- If email confirmation is disabled, the app signs in immediately and redirects to the home page.

## 4. Test login

1. After the account is created, switch to `Masuk`.
2. Enter the same email and password.
3. Click `Masuk`.

Expected result:
- The app shows a success toast.
- You return to the home page.
- The auth card shows your signed-in email.

## 5. Check the new user in Supabase

Use the Supabase dashboard for the project `SnapEats`.

1. Open the project.
2. Go to `Authentication`.
3. Open `Users`.
4. Find the new email address.

What to check:
- `email` matches the account you just created.
- `created_at` is recent.
- `confirmed_at` exists if email confirmation is turned on or if the account has been verified.

## 6. Optional direct verification

If you need to inspect the auth table via SQL in Supabase, use the dashboard SQL editor and run a query like:

```sql
select id, email, created_at, confirmed_at
from auth.users
order by created_at desc
limit 10;
```

## 7. Common issues

- Wrong or missing env vars: the auth page will show a warning that Supabase is not configured.
- Invalid email or password: the app shows the Supabase error toast.
- No new user in the dashboard: the account may have failed to create, or email confirmation is waiting.
