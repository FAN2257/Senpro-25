import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MotionSection } from '../components/MotionSection';

export function DashboardPage() {
  return (
    <>
      <MotionSection className="hero" style={{ gridTemplateColumns: '1fr' }}>
        <div className="hero-panel hero-copy">
          <h1 className="page-title" style={{ maxWidth: '14ch' }}>SnapEats</h1>
          <p className="page-subtitle" style={{ marginTop: 0 }}>
            Pindai makanan dari foto dan lihat ringkasan yang Anda butuhkan dalam hitungan detik.
          </p>

          <div className="hero-actions">
            <Link className="btn btn-primary btn-hero" to="/scan">
              Mulai Scan <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </MotionSection>
    </>
  );
}
