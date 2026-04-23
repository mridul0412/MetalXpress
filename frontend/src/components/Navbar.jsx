import { Link, useLocation } from 'react-router-dom';
import { Activity, Bell, Briefcase, Settings, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LMEStrip from './LMEStrip';
import { BRAND } from '../config/brand';

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
          <Link to="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
            {/* BhavX Logo Mark */}
            <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, filter: 'drop-shadow(0 0 8px rgba(207,181,59,0.4))' }}>
              <defs>
                <linearGradient id="ng1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E8CC5A"/>
                  <stop offset="50%" stopColor="#CFB53B"/>
                  <stop offset="100%" stopColor="#A89028"/>
                </linearGradient>
              </defs>
              <polygon points="32,3 58,17.5 58,46.5 32,61 6,46.5 6,17.5" fill="url(#ng1)"/>
              <polygon points="32,7 54,19.5 54,44.5 32,57 10,44.5 10,19.5" fill="#080E1A"/>
              <path d="M17 20h11c3.5 0 6 2 6 5.5 0 2-1 3.5-2.5 4.2C34 30.5 35.5 32.5 35.5 35c0 4-3 6-7 6H17V20zm4 4v6h6.5c1.5 0 2.5-1 2.5-3s-1-3-2.5-3H21zm0 10v7h7c2 0 3-1.2 3-3.5S30 31 28 31H21z" fill="url(#ng1)"/>
              <path d="M38 20l5.5 8 5.5-8h4.5l-7.5 11 7.5 10h-4.5L43.5 33 38 41h-4.5l7.5-10L33.5 20H38z" fill="url(#ng1)"/>
            </svg>
            <span className="hidden sm:block font-bold metallic-text" style={{ fontSize: 16, letterSpacing: '0.08em' }}>BhavX</span>
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
                <Link
                  to="/profile"
                  className="hidden sm:block text-xs"
                  style={{ color: '#CFB53B', textDecoration: 'none', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                >
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
