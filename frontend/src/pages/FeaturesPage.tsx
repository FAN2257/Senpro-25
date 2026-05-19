import { Camera, Activity, History, Lock, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MotionSection } from '../components/MotionSection';
import { FoodsPage } from './FoodsPage';

const features = [
  {
    icon: Camera,
    title: 'Scan Makanan Instan',
    description: 'Ambil foto makanan dan AI Anda akan mengenalinya dalam sekejap. Setiap makanan nusantara, dari Rendang hingga Gado-gado, diproses dengan akurat.'
  },
  {
    icon: Activity,
    title: 'Ringkasan Nutrisi Lengkap',
    description: 'Lihat detail kalori, protein, lemak, karbohidrat, dan mineral penting. Informasi tersaji sederhana sehingga mudah dipahami tanpa perlu ahli gizi.'
  },
  {
    icon: History,
    title: 'Riwayat Makan Terpancar',
    description: 'Setiap scan tersimpan otomatis. Lihat pola makan Anda, temukan tren, dan buat keputusan yang lebih sadar tentang diet Anda setiap hari.'
  },
  {
    icon: Lock,
    title: 'Akun Pribadi & Aman',
    description: 'Daftar akun untuk menyimpan semua riwayat Anda secara permanen. Data Anda tersimpan aman di server dan dapat diakses kapan saja.'
  },
  {
    icon: Zap,
    title: 'Kecepatan & Efisiensi',
    description: 'Akses instan tanpa loading lama. Dirancang untuk mobile dan desktop, bekerja dengan baik bahkan di koneksi yang lambat.'
  },
  {
    icon: ArrowRight,
    title: 'Integrasi Mudah',
    description: 'Gunakan di mana saja, kapan saja. Aksesnya fleksibel, dari browser ponsel hingga desktop—semua terkoneksi dengan akun Anda.'
  }
];

const benefits = [
  'Pantau asupan nutrisi harian Anda dengan presisi.',
  'Pahami komposisi makanan nusantara secara mendalam.',
  'Buat keputusan diet yang lebih sehat dan terukur.',
  'Simpan riwayat makan yang dapat diakses selamanya.',
  'Capai target kesehatan Anda dengan data yang akurat.'
];

export function FeaturesPage() {
  return (
    <div className="features-page">
      <MotionSection className="section features-hero" style={{ marginTop: 0 }}>
        <div className="features-hero-copy">
          <h1 className="page-title" style={{ marginBottom: '16px' }}>
            Fitur-Fitur SnapEats
          </h1>
          <p className="page-subtitle" style={{ maxWidth: '70ch', margin: '0 auto' }}>
            Temukan semua cara SnapEats dapat membantu Anda menjalani gaya hidup yang lebih sehat dan terinformasi tentang pilihan makanan Anda.
          </p>
        </div>

        <div className="grid-3 features-grid">
          {features.map(({ icon: Icon, title, description }) => (
            <article className="feature-card" key={title}>
              <div className="feature-icon">
                <Icon size={28} />
              </div>
              <h3 className="feature-title">{title}</h3>
              <p className="feature-description">{description}</p>
            </article>
          ))}
        </div>
      </MotionSection>

      <MotionSection className="section" delay={0.1}>
        <div style={{ textAlign: 'center' }}>
          <h2 className="section-title" style={{ marginBottom: '24px' }}>
            Apa yang Bisa Anda Capai
          </h2>
          <p className="section-description" style={{ marginBottom: '40px', maxWidth: '70ch', margin: '0 auto 40px' }}>
            Dengan SnapEats, Anda akan memiliki kontrol penuh atas kesehatan nutrisi Anda dan dapat membuat pilihan yang lebih cerdas setiap hari.
          </p>

          <div className="benefits-list">
            {benefits.map((benefit, idx) => (
              <div className="benefit-item" key={idx}>
                <div className="benefit-icon">✓</div>
                <p>{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </MotionSection>

      <MotionSection className="section" delay={0.2} style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h2 className="section-title" style={{ marginBottom: '24px' }}>
          Siap untuk Memulai?
        </h2>
        <p className="section-description" style={{ marginBottom: '32px' }}>
          Coba SnapEats sekarang dan lihat sendiri bagaimana mudahnya melacak nutrisi makanan Anda.
        </p>
        <Link to="/scan" className="btn btn-primary" style={{ marginRight: '16px' }}>
          Mulai Scan Sekarang
        </Link>
        <Link to="/" className="btn btn-secondary">
          Kembali ke Beranda
        </Link>
      </MotionSection>

      <MotionSection className="section" delay={0.25}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 className="section-title">Referensi Makanan</h2>
          <p className="section-description">Contoh daftar makanan yang tersedia di SnapEats.</p>
        </div>
        <FoodsPage />
      </MotionSection>
    </div>
  );
}
