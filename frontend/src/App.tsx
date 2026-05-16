import { Navigate, Route, Routes } from 'react-router-dom';
import { LayoutDashboard, ListChecks, Shield } from 'lucide-react';
import { AppShell } from './components/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { ScanPage } from './pages/ScanPage';
import { FoodsPage } from './pages/FoodsPage';
import { FoodDetailPage } from './pages/FoodDetailPage';
import { HistoryPage } from './pages/HistoryPage';
import { AuthPage } from './pages/AuthPage';

const navItems = [
  { to: '/', label: 'Beranda', icon: LayoutDashboard },
  { to: '/history', label: 'Riwayat', icon: ListChecks },
  { to: '/auth', label: 'Masuk / Daftar', icon: Shield }
];

export function App() {
  return (
    <AppShell navItems={navItems}>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/foods" element={<FoodsPage />} />
        <Route path="/foods/:foodName" element={<FoodDetailPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/register" element={<Navigate to="/auth" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
