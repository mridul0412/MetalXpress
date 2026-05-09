import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, Briefcase, Settings, BarChart3, User as UserIcon, Key, LogOut, ChevronDown, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LMEStrip from './LMEStrip';
import { BRAND } from '../config/brand';
import BhavXLogo from './BhavXLogo';
import BhavXWordmark from './BhavXWordmark';
import { useState, useRef, useEffect } from 'react';

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
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [menuOpen]);

  // Close dropdown on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const initials = (user?.name || user?.email || user?.phone || '?').slice(0, 2).toUpperCase();
  const displayLabel = user?.name || user?.email || user?.phone || 'Account';

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
          <Link to="/" className="flex items-center gap-2" style={{ textDecoration: 'none', gap: 10 }} aria-label="BhavX — India's Metal Exchange">
            <BhavXLogo size={40} glow />
            <BhavXWordmark size="navbar" />
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
              <div ref={menuRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setMenuOpen(o => !o)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '5px 10px 5px 5px', borderRadius: 22, cursor: 'pointer',
                    background: menuOpen ? 'rgba(207,181,59,0.12)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${menuOpen ? 'rgba(207,181,59,0.35)' : 'rgba(255,255,255,0.08)'}`,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (!menuOpen) e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                  onMouseLeave={e => { if (!menuOpen) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                >
                  {/* Avatar circle with initials */}
                  <span style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #CFB53B, #A89028)',
                    color: '#000', fontSize: 11, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'monospace',
                  }}>
                    {initials}
                  </span>
                  <span className="hidden sm:block" style={{
                    fontSize: 12, fontWeight: 600, color: '#fff', maxWidth: 140,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {displayLabel}
                  </span>
                  <ChevronDown size={14} style={{
                    color: 'rgba(255,255,255,0.4)',
                    transform: menuOpen ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.15s',
                  }} />
                </button>

                {/* Dropdown panel */}
                {menuOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    minWidth: 240, borderRadius: 12, overflow: 'hidden',
                    background: 'rgba(13,20,32,0.98)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.45)',
                    backdropFilter: 'blur(20px)',
                    zIndex: 100,
                  }}>
                    {/* Header — name + email */}
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user.name || 'Trader'}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user.email || user.phone}
                      </p>
                      {user.kycVerified && (
                        <p style={{ margin: '6px 0 0', fontSize: 10, color: '#34d399', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                          <ShieldCheck size={11} /> Verified Trader
                        </p>
                      )}
                    </div>

                    {/* Menu items */}
                    {[
                      { icon: UserIcon, label: 'Profile & Settings', onClick: () => navigate('/profile') },
                      { icon: Key,      label: 'Change Password',    onClick: () => navigate('/forgot-password') },
                    ].map(({ icon: Icon, label, onClick }) => (
                      <button
                        key={label}
                        onClick={() => { setMenuOpen(false); onClick(); }}
                        style={{
                          width: '100%', textAlign: 'left',
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '11px 16px', fontSize: 13, fontWeight: 500,
                          background: 'transparent', border: 'none', cursor: 'pointer',
                          color: 'rgba(255,255,255,0.85)',
                          transition: 'background 0.1s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(207,181,59,0.06)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <Icon size={15} style={{ color: '#CFB53B', flexShrink: 0 }} />
                        {label}
                      </button>
                    ))}

                    {/* Divider + logout */}
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
                    <button
                      onClick={() => { setMenuOpen(false); logout(); }}
                      style={{
                        width: '100%', textAlign: 'left',
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '11px 16px', fontSize: 13, fontWeight: 500,
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        color: '#f87171',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut size={15} style={{ flexShrink: 0 }} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
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
