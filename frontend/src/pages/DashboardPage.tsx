import { ArrowRight, Camera, ChartNoAxesColumnIncreasing, ShieldCheck, Sparkles, UtensilsCrossed } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MotionSection } from '../components/MotionSection';

const highlights = [
  {
    icon: Camera,
    title: 'Instant Snap-AI',
    description: 'Upload foto, jalankan deteksi YOLO, dan tampilkan hasil nutrisi dalam satu alur yang mudah dipahami.'
  },
  {
    icon: ChartNoAxesColumnIncreasing,
    title: 'Nutri-Dash',
    description: 'Ringkasan kalori, protein, lemak, dan karbohidrat untuk presentasi yang terasa konkret dan bernilai.'
  },
  {
    icon: ShieldCheck,
    title: 'Cloud-ready',
    description: 'Dirancang agar mudah disambungkan ke backend FastAPI dan siap dikembangkan ke auth, riwayat, dan sinkronisasi cloud.'
  }
];

const stats = [
  { label: 'Backend API', value: 'FastAPI', note: 'Compatible dengan endpoint repo ini' },
  { label: 'PWA Stack', value: 'Offline-ready', note: 'App shell + cache foods endpoint via service worker' },
  { label: 'UI System', value: 'Accessible', note: 'Responsive, jelas, dan user-friendly' },
  { label: 'Data Flow', value: 'Predict → Toast → History', note: 'State scan tersimpan dan mudah dipresentasikan' }
];

export function DashboardPage() {
  return (
    <>
      <MotionSection className="hero">
        <div className="hero-panel hero-copy">
          <span className="eyebrow">
            <Sparkles size={14} /> Product pitch ready
          </span>
          <h2 className="section-title" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
            Desain frontend yang terasa premium, informatif, dan meyakinkan saat demo.
          </h2>
          <p className="page-subtitle" style={{ marginTop: 0 }}>
            Ini adalah landing dashboard untuk SnapEats PWA, dibuat agar cocok untuk alur
            presentasi: jelaskan masalah, tunjukkan AI scan, lalu perlihatkan riwayat dan insight nutrisi.
          </p>

          <div className="hero-actions">
            <Link className="btn btn-primary" to="/scan">
              Mulai Scan <ArrowRight size={16} />
            </Link>
            <Link className="btn btn-secondary" to="/foods">
              Lihat Database <UtensilsCrossed size={16} />
            </Link>
          </div>
        </div>

        <div className="illustration">
          <div className="illustration-card">
            <div className="kpi">
              <span className="chip">Demo flow</span>
              <strong>Foto makanan → AI detect → Nutrisi tampil</strong>
              <span className="muted">User journey sederhana, cepat, dan mudah dipahami audiens non-teknis.</span>
            </div>
          </div>
          <div className="illustration-card">
            <div className="stat-row">
              <div className="kpi">
                <strong>6+</strong>
                <span className="muted">Halaman utama</span>
              </div>
              <div className="kpi">
                <strong>4</strong>
                <span className="muted">Endpoint inti</span>
              </div>
              <div className="kpi">
                <strong>PWA</strong>
                <span className="muted">Installable</span>
              </div>
            </div>
          </div>
        </div>
      </MotionSection>

      <MotionSection className="section" delay={0.08}>
        <div className="section-header">
          <div>
            <h3 className="section-title">Kenapa frontend ini efektif</h3>
            <p className="section-description">Pilihannya dibuat agar cepat dikembangkan, mudah dibaca, dan kompatibel dengan backend FastAPI.</p>
          </div>
        </div>

        <div className="grid-3">
          {highlights.map(({ icon: Icon, title, description }) => (
            <article className="card" key={title}>
              <div className="brand-mark" style={{ width: 42, height: 42, marginBottom: 16 }}>
                <Icon size={18} />
              </div>
              <h4 className="card-title">{title}</h4>
              <p className="muted" style={{ lineHeight: 1.7, marginBottom: 0 }}>{description}</p>
            </article>
          ))}
        </div>
      </MotionSection>

      <MotionSection className="section" delay={0.16}>
        <div className="section-header">
          <div>
            <h3 className="section-title">Stack yang dipilih</h3>
            <p className="section-description">Ini komposisi yang paling efisien untuk PWA modern dengan backend Python.</p>
          </div>
        </div>

        <div className="grid-4">
          {stats.map((item) => (
            <article className="metric" key={item.label}>
              <p className="metric-label">{item.label}</p>
              <h4 className="metric-value">{item.value}</h4>
              <p className="metric-note">{item.note}</p>
            </article>
          ))}
        </div>
      </MotionSection>
    </>
  );
}
