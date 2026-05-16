import { useState } from 'react';
import { CheckCircle2, LockKeyhole, UserRound } from 'lucide-react';

type AuthMode = 'login' | 'register';

const benefits = [
  'Simpan riwayat scan agar mudah dibuka lagi.',
  'Pilih makanan favorit tanpa mengisi ulang dari awal.',
  'Lebih mudah memantau kebiasaan makan dari waktu ke waktu.'
];

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');

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
            <>
              <h4 className="form-title" style={{ marginTop: 18 }}>Masuk ke akun Anda</h4>
              <div className="stack" style={{ marginTop: 18 }}>
                <div className="field">
                  <label className="field-label" htmlFor="login-email">Email</label>
                  <input id="login-email" className="input" type="email" placeholder="nama@contoh.com" />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="login-password">Password</label>
                  <input id="login-password" className="input" type="password" placeholder="••••••••" />
                </div>
              </div>
              <div className="form-actions" style={{ marginTop: 18 }}>
                <button className="btn btn-primary" type="button">Masuk</button>
                <button className="btn btn-secondary" type="button" onClick={() => setMode('register')}>Buat akun</button>
              </div>
            </>
          ) : (
            <>
              <h4 className="form-title" style={{ marginTop: 18 }}>Buat akun baru</h4>
              <div className="stack" style={{ marginTop: 18 }}>
                <div className="field">
                  <label className="field-label" htmlFor="register-name">Nama lengkap</label>
                  <input id="register-name" className="input" type="text" placeholder="Nama Anda" />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="register-email">Email</label>
                  <input id="register-email" className="input" type="email" placeholder="nama@contoh.com" />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="register-password">Password</label>
                  <input id="register-password" className="input" type="password" placeholder="Minimal 8 karakter" />
                </div>
              </div>
              <div className="form-actions" style={{ marginTop: 18 }}>
                <button className="btn btn-primary" type="button">Daftar</button>
                <button className="btn btn-secondary" type="button" onClick={() => setMode('login')}>Sudah punya akun</button>
              </div>
            </>
          )}

          <div className="footer-note">
            Akun membantu Anda menyimpan hasil scan dan kembali ke riwayat kapan saja.
          </div>
        </div>
      </div>
    </section>
  );
}