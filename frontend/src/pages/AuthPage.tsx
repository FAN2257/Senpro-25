import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { CheckCircle2, LockKeyhole, UserRound } from 'lucide-react';
import { hasSupabaseConfig, supabase } from '../lib/supabase';

type AuthMode = 'login' | 'register';

const benefits = [
  'Simpan riwayat scan agar mudah dibuka lagi.',
  'Pilih makanan favorit tanpa mengisi ulang dari awal.',
  'Lebih mudah memantau kebiasaan makan dari waktu ke waktu.'
];

export function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const client = supabase;

    if (!client) {
      setSessionReady(true);
      return () => {
        isMounted = false;
      };
    }

    const syncSession = async () => {
      const { data, error } = await client.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (error) {
        toast.error(error.message);
      }

      setSessionEmail(data.session?.user.email ?? null);
      setSessionReady(true);
    };

    syncSession();

    const { data: authListener } = client.auth.onAuthStateChange((_event, session) => {
      setSessionEmail(session?.user.email ?? null);
      setSessionReady(true);
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const client = supabase;

    if (!client) {
      toast.error('Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.');
      return;
    }

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    setLoading(true);

    const { error } = await client.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success('Berhasil masuk ke akun SnapEats.');
    navigate('/');
  };

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const client = supabase;

    if (!client) {
      toast.error('Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.');
      return;
    }

    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get('name') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    setLoading(true);

    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    if (data.session) {
      toast.success('Akun berhasil dibuat dan Anda sudah masuk.');
      navigate('/');
      return;
    }

    toast.success('Akun dibuat. Silakan cek email untuk verifikasi akun.');
    setMode('login');
  };

  const handleSignOut = async () => {
    const client = supabase;

    if (!client) {
      toast.error('Supabase belum dikonfigurasi.');
      return;
    }

    setLoading(true);
    const { error } = await client.auth.signOut();
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success('Berhasil keluar.');
    setSessionEmail(null);
  };

  return (
    <section className="section">
      <div className="section-header">
        <div>
          <h3 className="section-title">Masuk atau buat akun</h3>
          <p className="section-description">
            Gunakan akun jika Anda ingin menyimpan hasil scan dan riwayat makanan. Kalau hanya ingin coba cepat, Anda tetap bisa memakai fitur utama tanpa akun.
          </p>
        </div>
      </div>

      <div className="grid-2">
        <div className="panel">
          <span className="chip">Kenapa akun berguna</span>
          <div className="stack" style={{ marginTop: 16 }}>
            <div className="auth-compare">
              <div>
                <h4 className="card-title">Tanpa akun</h4>
                <p className="muted" style={{ lineHeight: 1.7 }}>
                  Cocok untuk coba cepat, lihat hasil scan, dan berpindah halaman tanpa langkah tambahan.
                </p>
              </div>
              <div>
                <h4 className="card-title">Dengan akun</h4>
                <p className="muted" style={{ lineHeight: 1.7 }}>
                  Hasil scan, riwayat makan, dan preferensi Anda bisa disimpan agar lebih mudah dipakai kembali.
                </p>
              </div>
            </div>

            <div className="list">
              {benefits.map((item) => (
                <div className="list-item" key={item}>
                  <strong>{item}</strong>
                  <CheckCircle2 size={16} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="form-card">
          {!hasSupabaseConfig ? (
            <div className="empty-state" style={{ marginBottom: 20 }}>
              Konfigurasi Supabase belum lengkap. Isi <strong>VITE_SUPABASE_URL</strong> dan <strong>VITE_SUPABASE_ANON_KEY</strong> di file env frontend agar login dan pendaftaran benar-benar aktif.
            </div>
          ) : null}

          {sessionReady && sessionEmail ? (
            <div className="empty-state" style={{ marginBottom: 20 }}>
              Anda masuk sebagai {sessionEmail}
              <div style={{ marginTop: 12 }}>
                <button className="btn btn-secondary" type="button" onClick={handleSignOut} disabled={loading}>
                  Keluar
                </button>
              </div>
            </div>
          ) : null}

          <div className="auth-switch" role="tablist" aria-label="Pilih mode akun">
            <button
              className={`auth-switch-btn ${mode === 'login' ? 'active' : ''}`}
              type="button"
              onClick={() => setMode('login')}
            >
              <LockKeyhole size={16} /> Masuk
            </button>
            <button
              className={`auth-switch-btn ${mode === 'register' ? 'active' : ''}`}
              type="button"
              onClick={() => setMode('register')}
            >
              <UserRound size={16} /> Daftar
            </button>
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLogin}>
              <h4 className="form-title" style={{ marginTop: 18 }}>Masuk ke akun Anda</h4>
              <div className="stack" style={{ marginTop: 18 }}>
                <div className="field">
                  <label className="field-label" htmlFor="login-email">Email</label>
                  <input id="login-email" name="email" className="input" type="email" placeholder="nama@contoh.com" required />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="login-password">Password</label>
                  <input id="login-password" name="password" className="input" type="password" placeholder="••••••••" required minLength={6} />
                </div>
              </div>
              <div className="form-actions" style={{ marginTop: 18 }}>
                <button className="btn btn-primary" type="submit" disabled={loading}>
                  {loading ? 'Memproses...' : 'Masuk'}
                </button>
                <button className="btn btn-secondary" type="button" onClick={() => setMode('register')} disabled={loading}>
                  Buat akun
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <h4 className="form-title" style={{ marginTop: 18 }}>Buat akun baru</h4>
              <div className="stack" style={{ marginTop: 18 }}>
                <div className="field">
                  <label className="field-label" htmlFor="register-name">Nama lengkap</label>
                  <input id="register-name" name="name" className="input" type="text" placeholder="Nama Anda" required />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="register-email">Email</label>
                  <input id="register-email" name="email" className="input" type="email" placeholder="nama@contoh.com" required />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="register-password">Password</label>
                  <input id="register-password" name="password" className="input" type="password" placeholder="Minimal 8 karakter" required minLength={6} />
                </div>
              </div>
              <div className="form-actions" style={{ marginTop: 18 }}>
                <button className="btn btn-primary" type="submit" disabled={loading}>
                  {loading ? 'Memproses...' : 'Daftar'}
                </button>
                <button className="btn btn-secondary" type="button" onClick={() => setMode('login')} disabled={loading}>
                  Sudah punya akun
                </button>
              </div>
            </form>
          )}

          <div className="footer-note">
            Akun membantu Anda menyimpan hasil scan dan kembali ke riwayat kapan saja.
          </div>
        </div>
      </div>
    </section>
  );
}