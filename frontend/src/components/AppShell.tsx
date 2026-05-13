import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ChefHat, ExternalLink } from 'lucide-react';
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
      <div className="topbar">
        <Link to="/" className="brand" aria-label="SnapEats home">
          <div className="brand-mark">
            <ChefHat size={22} />
          </div>
          <div>
            <p className="brand-title">SnapEats</p>
            <p className="brand-subtitle">PWA food intelligence</p>
          </div>
        </Link>
      </div>

      <div className="shell">
        <aside className="sidebar">
          <Link to="/" className="brand">
            <div className="brand-mark">
              <ChefHat size={22} />
            </div>
            <div>
              <p className="brand-title">SnapEats</p>
              <p className="brand-subtitle">Snap. Track. Eat Smart.</p>
            </div>
          </Link>

          <nav aria-label="Primary navigation">
            <ul className="nav-list">
              {navItems.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    end={to === '/'}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="sidebar-footer">
            <span className="chip">Backend-ready</span>
            <p className="muted" style={{ marginTop: 12, lineHeight: 1.6 }}>
              Frontend ini dirancang untuk terhubung ke FastAPI di repo ini melalui endpoint
              /predict, /foods, dan /calculate.
            </p>
            <a
              className="btn btn-secondary"
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              style={{ width: '100%', marginTop: 12 }}
            >
              Open API Docs <ExternalLink size={16} />
            </a>
          </div>
        </aside>

        <main className="main">{children}</main>
      </div>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        <div className="mobile-nav-grid">
          {navItems.slice(0, 3).map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              end={to === '/'}
            >
              <Icon size={18} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
