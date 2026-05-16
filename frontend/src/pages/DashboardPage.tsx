import { ArrowRight, Camera, ChartNoAxesColumnIncreasing, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MotionSection } from '../components/MotionSection';

const highlights = [
  {
    icon: Camera,
    title: 'Scan foto makanan',
    description: 'Unggah foto makanan lalu lihat ringkasan yang penting dengan cepat.'
  },
  {
    icon: ChartNoAxesColumnIncreasing,
    title: 'Ringkasan gizi',
    description: 'Lihat energi, protein, lemak, karbohidrat, dan mineral yang mudah dibaca.'
  },
  {
    icon: ShieldCheck,
    title: 'Riwayat makan',
    description: 'Simpan pilihan yang sering Anda konsumsi agar mudah dibuka lagi nanti.'
  }
];

const stats = [
  { label: 'Langkah utama', value: '1 tombol', note: 'Scan dimulai dari satu aksi yang jelas' },
  { label: 'Informasi', value: 'Ringkas', note: 'Yang tampil hanya hal yang berguna untuk Anda' },
  { label: 'Kegunaan', value: 'Harian', note: 'Membantu lihat makanan yang sering dipilih' },
  { label: 'Riwayat', value: 'Tersimpan', note: 'Mudah dibuka kembali saat dibutuhkan' }
];

export function DashboardPage() {
  return (
    <>
      <MotionSection className="hero">
        <div className="hero-panel hero-copy">
          <span className="eyebrow">
            <Sparkles size={14} /> SnapEats
          </span>
          <h2 className="section-title" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
            Pindai makanan, lihat gizi, dan simpan riwayat dengan cepat.
          </h2>
          <p className="page-subtitle" style={{ marginTop: 0 }}>
            SnapEats membantu Anda mengenali makanan dari foto, memahami isinya, dan menyimpan pilihan yang sering dipakai.
          </p>

          <div className="hero-actions">
            <Link className="btn btn-primary" to="/scan">
              Mulai Scan <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div className="illustration">
          <div className="illustration-card">
            <div className="kpi">
              <span className="chip">Langkah cepat</span>
              <strong>Foto makanan → hasil ringkas → simpan bila perlu</strong>
              <span className="muted">Alur dibuat singkat agar Anda langsung sampai ke informasi yang dicari.</span>
            </div>
          </div>
          <div className="illustration-card">
            <div className="stat-row">
              <div className="kpi">
                <strong>3</strong>
                <span className="muted">Bagian utama yang sering dipakai</span>
              </div>
              <div className="kpi">
                <strong>1</strong>
                <span className="muted">Aksi utama untuk mulai</span>
              </div>
              <div className="kpi">
                <strong>Riwayat</strong>
                <span className="muted">Mudah dicek ulang</span>
              </div>
            </div>
          </div>
        </div>
      </MotionSection>

      <MotionSection className="section" delay={0.08}>
        <div className="section-header">
          <div>
            <h3 className="section-title">Apa yang Anda dapat</h3>
            <p className="section-description">Semua elemen disusun untuk membantu Anda memilih makanan dengan lebih sadar dan lebih cepat.</p>
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
            <h3 className="section-title">Alasan fitur disusun seperti ini</h3>
            <p className="section-description">Tujuannya supaya pengguna langsung mengerti manfaatnya tanpa harus melihat detail teknis.</p>
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
