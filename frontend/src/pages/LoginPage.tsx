export function LoginPage() {
  return (
    <section className="section">
      <div className="section-header">
        <div>
          <h3 className="section-title">Login</h3>
          <p className="section-description">Halaman autentikasi dibuat sederhana, fokus, dan mudah dipahami.</p>
        </div>
      </div>

      <div className="grid-2">
        <div className="form-card">
          <span className="chip">Secure access</span>
          <h4 className="form-title" style={{ marginTop: 12 }}>Masuk ke SnapEats</h4>
          <div className="stack" style={{ marginTop: 18 }}>
            <div className="field">
              <label className="field-label" htmlFor="login-email">Email</label>
              <input id="login-email" className="input" type="email" placeholder="nama@kampus.ac.id" />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="login-password">Password</label>
              <input id="login-password" className="input" type="password" placeholder="••••••••" />
            </div>
          </div>
          <div className="form-actions" style={{ marginTop: 18 }}>
            <button className="btn btn-primary" type="button">Masuk</button>
            <button className="btn btn-secondary" type="button">Lupa password</button>
          </div>
        </div>

        <div className="panel">
          <h4 className="card-title">Kenapa halaman ini dibuat ringan</h4>
          <p className="muted" style={{ lineHeight: 1.7 }}>
            Untuk demo, halaman login tidak perlu penuh distraksi. Cukup kontras yang jelas, label yang eksplisit,
            dan CTA yang tegas agar user tidak bingung.
          </p>
          <div className="footer-note">Selanjutnya bisa dihubungkan ke auth backend atau layanan identitas yang dipilih.</div>
        </div>
      </div>
    </section>
  );
}
