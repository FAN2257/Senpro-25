import { useState, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ArrowUpRight, Menu, X } from 'lucide-react';
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

const isMobileNav = () => (typeof window !== 'undefined' ? window.innerWidth < 900 : false);

export function AppShell({ navItems, children }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile] = useState(isMobileNav());

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="app-frame">
      <header className="topbar">
        <Link to="/" className="brand" aria-label="SnapEats home" onClick={closeMobileMenu}>
          <div className="brand-mark brand-mark-logo">
            <img src="/LogoSnapEats.png" alt="" aria-hidden="true" />
          </div>
          <div>
            <p className="brand-title">SnapEats</p>
            <p className="brand-subtitle">Pilih makanan lebih cepat</p>
          </div>
        </Link>

        {isMobile ? (
          <button 
            className="mobile-menu-toggle" 
            onClick={toggleMobileMenu}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        ) : (
          <>
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
          </>
        )}

        {isMobile && mobileMenuOpen && (
          <nav className="mobile-menu" aria-label="Mobile navigation">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                end={to === '/'}
                onClick={closeMobileMenu}
              >
                <Icon size={20} />
                <span>{label}</span>
              </NavLink>
            ))}
            <Link 
              className="btn btn-secondary mobile-scan-btn" 
              to="/scan"
              onClick={closeMobileMenu}
            >
              Mulai scan <ArrowUpRight size={16} />
            </Link>
          </nav>
        )}
      </header>

      <main className="main">{children}</main>
    </div>
  );
}
