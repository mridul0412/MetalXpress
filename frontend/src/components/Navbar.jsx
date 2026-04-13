import { Link, useLocation } from 'react-router-dom';
import { Activity, Bell, Briefcase, Settings, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LMEStrip from './LMEStrip';

const NAV_ITEMS = [
  { href: '/',            label: 'Rates',     icon: Activity   },
  { href: '/marketplace', label: 'Market',    icon: Briefcase  },
  { href: '/analytics',   label: 'Analytics', icon: BarChart3  },
  { href: '/alerts',      label: 'Alerts',    icon: Bell       },
  { href: '/admin',       label: 'Admin',     icon: Settings   },
];

export default function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <>
      <header className="sticky top-0 z-50 w-full" style={{
        background: 'rgba(8,14,26,0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}>
        {/* Top bar */}
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5" style={{ textDecoration: 'none' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{
              background: 'linear-gradient(135deg, #E8CC5A, #CFB53B, #A89028)',
              boxShadow: '0 0 12px rgba(207,181,59,0.3)',
            }}>
              <span style={{ fontSize: 20, color: '#080E1A', fontWeight: 800, lineHeight: 1, marginTop: -1 }}>ॐ</span>
            </div>
            <span className="hidden sm:block text-base font-bold tracking-widest metallic-text">METALXPRESS</span>
            <span className="sm:hidden text-base font-bold tracking-widest metallic-text">MX⚡</span>
          </Link>

          {/* Desktop nav — app nav for logged-in, marketing links for visitors */}
          <nav className="hidden md:flex items-center gap-1">
            {user ? NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = location.pathname === href;
              return (
                <Link key={href} to={href} style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                  background: active ? 'rgba(207,181,59,0.1)' : 'transparent',
                  color: active ? '#CFB53B' : 'rgba(255,255,255,0.45)',
                  border: `1px solid ${active ? 'rgba(207,181,59,0.25)' : 'transparent'}`,
                }}>
                  <Icon size={13} />
                  {label}
                </Link>
              );
            }) : (
              <>
                {[
                  { href: '/about', label: 'About' },
                  { href: '/contact', label: 'Contact' },
                ].map(({ href, label }) => (
                  <Link key={href} to={href} style={{
                    padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                    textDecoration: 'none', color: 'rgba(255,255,255,0.45)', transition: 'color 0.15s',
                  }}>
                    {label}
                  </Link>
                ))}
              </>
            )}
          </nav>

          {/* Auth */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link to="/profile" className="hidden sm:block text-xs" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>
                  {user.name || user.email || user.phone}
                </Link>
                <button onClick={logout} style={{
                  fontSize: '12px',
                  padding: '5px 12px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.45)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}>
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" style={{
                  fontSize: '12px', padding: '6px 14px', borderRadius: '8px', fontWeight: 600,
                  textDecoration: 'none', color: 'rgba(255,255,255,0.5)', transition: 'color 0.15s',
                }}>
                  Login
                </Link>
                <Link to="/signup" style={{
                  fontSize: '12px', padding: '6px 14px', borderRadius: '8px', fontWeight: 700,
                  background: '#CFB53B', color: '#000', textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(207,181,59,0.25)',
                }}>
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* LME Ticker strip */}
        <LMEStrip />
      </header>

      {/* Mobile bottom nav — only for logged-in users */}
      {user && <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe" style={{
        background: 'rgba(8,14,26,0.97)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div className="flex justify-around items-center h-16 px-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = location.pathname === href;
            return (
              <Link key={href} to={href} className="flex flex-col items-center justify-center w-full h-full gap-1"
                style={{ color: active ? '#CFB53B' : 'rgba(255,255,255,0.35)', textDecoration: 'none', transition: 'color 0.15s' }}>
                <Icon size={19} />
                <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.04em' }}>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>}
    </>
  );
}
