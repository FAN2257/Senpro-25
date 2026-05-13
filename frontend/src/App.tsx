import { Navigate, Route, Routes } from 'react-router-dom';
import { LayoutDashboard, ScanSearch, BookOpenText, ListChecks, Shield, UserPlus, Sparkles } from 'lucide-react';
import { AppShell } from './components/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { ScanPage } from './pages/ScanPage';
import { FoodsPage } from './pages/FoodsPage';
import { FoodDetailPage } from './pages/FoodDetailPage';
import { HistoryPage } from './pages/HistoryPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/scan', label: 'Scan', icon: ScanSearch },
  { to: '/foods', label: 'Foods', icon: BookOpenText },
  { to: '/history', label: 'History', icon: ListChecks },
  { to: '/login', label: 'Login', icon: Shield },
  { to: '/register', label: 'Register', icon: UserPlus }
];

export function App() {
  return (
    <AppShell navItems={navItems}>
      <div className="page-intro">
        <div>
          <span className="eyebrow">
            <Sparkles size={14} /> SnapEats PWA
          </span>
          <h1 className="page-title">AI food tracking yang ramah pengguna, cepat, dan siap demo.</h1>
          <p className="page-subtitle">
            Frontend ini dirancang untuk terhubung langsung ke FastAPI backend pada repo ini,
            dengan alur: foto makanan, deteksi otomatis, baca nutrisi, lalu simpan ke riwayat.
          </p>
        </div>
      </div>

      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/foods" element={<FoodsPage />} />
        <Route path="/foods/:foodName" element={<FoodDetailPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
