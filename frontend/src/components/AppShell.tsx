import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ArrowUpRight, LogOut, Menu, Shield, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

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
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile] = useState(isMobileNav());
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let active = true;
    const client = supabase;

    if (!client) {
      setAuthReady(true);
      return () => {
        active = false;
      };
    }

    const syncAuth = async () => {
      const { data, error } = await client.auth.getUser();

      if (!active) {
        return;
      }

      if (error || !data.user) {
        setSessionEmail(null);
        setAuthReady(true);
        return;
      }

      setSessionEmail(data.user.email ?? null);
      setAuthReady(true);
    };

    void syncAuth();

    const { data: authListener } = client.auth.onAuthStateChange((_event, session) => {
      if (!active) {
        return;
      }

      setSessionEmail(session?.user?.email ?? null);
      setAuthReady(true);
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const isSignedIn = authReady && Boolean(sessionEmail);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleAuthAction = async () => {
    if (!isSignedIn || !supabase) {
      navigate('/auth');
      closeMobileMenu();
      return;
    }

    setSigningOut(true);
    const { error } = await supabase.auth.signOut();
    setSigningOut(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success('Berhasil keluar.');
    navigate('/auth', { replace: true });
    closeMobileMenu();
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
            {isSignedIn ? (
              <button className="btn btn-secondary topbar-cta" type="button" onClick={handleAuthAction} disabled={signingOut}>
                <LogOut size={16} /> {signingOut ? 'Keluar...' : 'Keluar akun'}
              </button>
            ) : (
              <Link className="btn btn-secondary topbar-cta" to="/auth">
                <Shield size={16} /> Masuk / Daftar
              </Link>
            )}
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
            {isSignedIn ? (
              <button className="btn btn-secondary mobile-scan-btn" type="button" onClick={handleAuthAction} disabled={signingOut}>
                <LogOut size={16} /> {signingOut ? 'Keluar...' : 'Keluar akun'}
              </button>
            ) : (
              <Link className="btn btn-secondary mobile-scan-btn" to="/auth" onClick={closeMobileMenu}>
                <Shield size={16} /> Masuk / Daftar
              </Link>
            )}
          </nav>
        )}
      </header>

      <main className="main">{children}</main>
    </div>
  );
}
