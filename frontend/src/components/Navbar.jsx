import { Link, useLocation } from 'react-router-dom';
import { Activity, Briefcase, Settings, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LMEStrip from './LMEStrip';
import { BRAND } from '../config/brand';

// Alerts hidden from nav until FCM push notifications wired (Day 5 of sprint).
// Route still works via direct URL — just not visible/discoverable yet.
const NAV_ITEMS = [
  { href: '/',            label: 'Rates',     icon: Activity   },
  { href: '/marketplace', label: 'Market',    icon: Briefcase  },
  { href: '/analytics',   label: 'Analytics', icon: BarChart3  },
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
            <svg width="44" height="44" viewBox="0 0 64 64" style={{ flexShrink: 0, filter: 'drop-shadow(0 0 6px rgba(207,181,59,0.45))' }} aria-label="BhavX">
              <defs>
                <linearGradient id="navBlade" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
                  <stop offset="0%"   stopColor="#FFE9A8"/>
                  <stop offset="35%"  stopColor="#E8CC5A"/>
                  <stop offset="65%"  stopColor="#CFB53B"/>
                  <stop offset="100%" stopColor="#7A5A18"/>
                </linearGradient>
              </defs>
              {[0,45,90,135,180,225,270,315].map(a => (
                <path key={a} d="M 21,7 L 43,7 L 29,22 L 26,23 Z" fill="url(#navBlade)" transform={`rotate(${a} 32 32)`} />
              ))}
            </svg>
            <span className="font-bold metallic-text" style={{ fontSize: 16, letterSpacing: '0.08em' }}>BhavX</span>
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
