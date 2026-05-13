export function RegisterPage() {
  return (
    <section className="section">
      <div className="section-header">
        <div>
          <h3 className="section-title">Register</h3>
          <p className="section-description">Onboarding dibuat singkat agar cocok untuk pengguna baru yang ingin langsung mencoba scan makanan.</p>
        </div>
      </div>

      <div className="grid-2">
        <div className="form-card">
          <span className="chip">Create account</span>
          <h4 className="form-title" style={{ marginTop: 12 }}>Buat akun SnapEats</h4>
          <div className="stack" style={{ marginTop: 18 }}>
            <div className="field">
              <label className="field-label" htmlFor="register-name">Nama lengkap</label>
              <input id="register-name" className="input" type="text" placeholder="Nama pengguna" />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="register-email">Email</label>
              <input id="register-email" className="input" type="email" placeholder="nama@kampus.ac.id" />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="register-password">Password</label>
              <input id="register-password" className="input" type="password" placeholder="Minimal 8 karakter" />
            </div>
          </div>
          <div className="form-actions" style={{ marginTop: 18 }}>
            <button className="btn btn-primary" type="button">Daftar</button>
            <button className="btn btn-secondary" type="button">Gunakan akun demo</button>
          </div>
        </div>

        <div className="panel">
          <h4 className="card-title">Value proposition onboarding</h4>
          <p className="muted" style={{ lineHeight: 1.7 }}>
            Registration tidak perlu rumit. Tujuannya adalah mengurangi friksi awal dan langsung mengantar user ke momen nilai utama: foto makanan, lihat gizi, simpan riwayat.
          </p>
          <div className="footer-note">Desain seperti ini biasanya lebih kuat saat dipresentasikan karena alurnya terasa jelas.</div>
        </div>
      </div>
    </section>
  );
}
