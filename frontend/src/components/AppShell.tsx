import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

interface AppShellProps {
  navItems: NavItem[];
  children: ReactNode;
}

export function AppShell({ navItems, children }: AppShellProps) {
  return (
    <div className="app-frame">
      <header className="topbar">
        <Link to="/" className="brand" aria-label="SnapEats home">
          <div className="brand-mark brand-mark-logo">
            <img src="/LogoSnapEats.png" alt="" aria-hidden="true" />
          </div>
          <div>
            <p className="brand-title">SnapEats</p>
            <p className="brand-subtitle">Bantu pilih makanan dengan lebih cepat dan jelas</p>
          </div>
        </Link>
        <nav className="topnav" aria-label="Primary navigation">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              end={to === '/'}
            >
              <Icon size={16} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <Link className="btn btn-secondary topbar-cta" to="/scan">
          Mulai scan <ArrowUpRight size={16} />
        </Link>
      </header>

      <main className="main">{children}</main>
    </div>
  );
}
