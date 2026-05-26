import { useEffect, useState } from 'react';
import { ArrowRight, ArrowDown, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MotionSection } from '../components/MotionSection';
import { getCurrentUserProfile } from '../lib/api';

export function DashboardPage() {
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      const profile = await getCurrentUserProfile();
      if (active) {
        setDisplayName(profile?.displayName ?? null);
      }
    };

    void loadProfile();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="home-landing">
      <div className="landing-ambient" aria-hidden="true">
        <span className="ambient-blob ambient-blob-1" />
        <span className="ambient-blob ambient-blob-2" />
        <span className="ambient-blob ambient-blob-3" />
      </div>

      {/* Full-page Landing Section */}
      <div className="landing-hero">
        <div className="landing-hero-content">
          <div className="landing-logo">
            <img src="/LogoSnapEats.png" alt="SnapEats" />
          </div>
          <h1 className="landing-title">{displayName ? `Halo, ${displayName}` : 'SnapEats'}</h1>
          <p className="landing-tagline">Snap. Track. Eat Well</p>
          <p className="landing-description">
            Savor the Flavor, Track the Nutrition: Balance Your Nusantara Diet with a single snap
          </p>
          <div className="chip" style={{ marginBottom: 14 }}>
            <Sparkles size={14} /> {displayName ? 'Akun siap dipakai untuk tracking harian' : 'Masuk untuk menyimpan tracker harian'}
          </div>
          <Link to="/scan" className="btn btn-primary btn-large">
            Scan Now <ArrowRight size={20} />
          </Link>
        </div>
      </div>

      {/* About & Capabilities Section */}
      <MotionSection className="about-section">
        <div className="about-cards">
          <div className="about-card">
            <span className="about-card-badge">Tentang Kami</span>
            <h2 className="about-card-title">Apa itu SnapEats?</h2>
            <p className="about-card-text">
              SnapEats adalah aplikasi web modern yang membantu Anda memahami nutrisi makanan nusantara dengan teknologi AI. Cukup ambil foto makanan Anda, dan kami akan mengidentifikasi jenis makanan serta memberikan informasi nutrisi yang lengkap dan mudah dipahami. Dirancang untuk mendukung gaya hidup sehat Anda di Indonesia.
            </p>
          </div>

          <div className="about-card">
            <span className="about-card-badge">Kemampuan</span>
            <h2 className="about-card-title">Apa yang Bisa Kami Lakukan?</h2>
            <p className="about-card-text">
              Kami menyediakan deteksi makanan otomatis, ringkasan nutrisi terperinci, riwayat makan yang tersimpan permanen, dan tracker harian yang menggabungkan semua scan pada hari yang sama. Dengan integrasi akun yang aman, semua data Anda selalu tersimpan dan dapat diakses kapan pun Anda membutuhkannya untuk membuat keputusan diet yang lebih baik.
            </p>
            <Link to="/features" className="learn-more-link">
              Pelajari lebih lanjut <ArrowDown size={16} />
            </Link>
          </div>
        </div>
      </MotionSection>
    </div>
  );
}
