import { Link } from 'react-router-dom';
import { BRAND } from '../config/brand';
export default function Footer() {
  return (
    <footer style={{
      background: '#060B15',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '32px 0 24px',
      marginTop: 40,
      position: 'relative', overflow: 'hidden',
    }}>
      <div className="max-w-5xl mx-auto px-4" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 24, marginBottom: 24 }}>
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg width="32" height="32" viewBox="0 0 64 64" style={{ flexShrink: 0, filter: 'drop-shadow(0 0 6px rgba(207,181,59,0.45))' }} aria-label="BhavX">
                <defs>
                  <linearGradient id="ftBlade" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
                    <stop offset="0%"   stopColor="#FFE9A8"/>
                    <stop offset="35%"  stopColor="#E8CC5A"/>
                    <stop offset="65%"  stopColor="#CFB53B"/>
                    <stop offset="100%" stopColor="#7A5A18"/>
                  </linearGradient>
                </defs>
                {[0,45,90,135,180,225,270,315].map(a => (
                  <path key={a} d="M 21,7 L 43,7 L 29,22 L 26,23 Z" fill="url(#ftBlade)" transform={`rotate(${a} 32 32)`} />
                ))}
              </svg>
              <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.06em', color: '#CFB53B' }}>BhavX</span>
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', lineHeight: 1.5, margin: 0 }}>
              Real-time metal intelligence for Indian traders.
            </p>
          </div>

          {/* Links */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
              color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
              Company
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { to: '/about', label: 'About' },
                { to: '/contact', label: 'Contact' },
              ].map(({ to, label }) => (
                <Link key={to} to={to} style={{
                  fontSize: 12, color: 'rgba(255,255,255,0.45)', textDecoration: 'none',
                  transition: 'color 0.15s',
                }}>{label}</Link>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
              color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
              Legal
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { to: '/terms', label: 'Terms of Service' },
                { to: '/privacy', label: 'Privacy Policy' },
              ].map(({ to, label }) => (
                <Link key={to} to={to} style={{
                  fontSize: 12, color: 'rgba(255,255,255,0.45)', textDecoration: 'none',
                  transition: 'color 0.15s',
                }}>{label}</Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
        }}>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', margin: 0 }}>
            &copy; {new Date().getFullYear()} BhavX. All rights reserved.
          </p>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', margin: 0 }}>
            Made in India 🇮🇳
          </p>
        </div>
      </div>
    </footer>
  );
}
