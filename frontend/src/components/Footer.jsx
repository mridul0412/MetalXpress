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
      {/* Subtle ॐ watermark in footer */}
      <div style={{
        position: 'absolute', bottom: -20, right: 20,
        fontSize: 120, fontWeight: 800, lineHeight: 1,
        color: 'rgba(207,181,59,0.02)',
        pointerEvents: 'none', userSelect: 'none',
      }}>ॐ</div>

      <div className="max-w-5xl mx-auto px-4" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 24, marginBottom: 24 }}>
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg width="24" height="24" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="fg1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#E8CC5A"/>
                    <stop offset="50%" stopColor="#CFB53B"/>
                    <stop offset="100%" stopColor="#A89028"/>
                  </linearGradient>
                </defs>
                <polygon points="32,3 58,17.5 58,46.5 32,61 6,46.5 6,17.5" fill="url(#fg1)"/>
                <polygon points="32,7 54,19.5 54,44.5 32,57 10,44.5 10,19.5" fill="#060B15"/>
                <path d="M17 20h11c3.5 0 6 2 6 5.5 0 2-1 3.5-2.5 4.2C34 30.5 35.5 32.5 35.5 35c0 4-3 6-7 6H17V20zm4 4v6h6.5c1.5 0 2.5-1 2.5-3s-1-3-2.5-3H21zm0 10v7h7c2 0 3-1.2 3-3.5S30 31 28 31H21z" fill="url(#fg1)"/>
                <path d="M38 20l5.5 8 5.5-8h4.5l-7.5 11 7.5 10h-4.5L43.5 33 38 41h-4.5l7.5-10L33.5 20H38z" fill="url(#fg1)"/>
              </svg>
              <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.06em', color: '#CFB53B' }}>
                BhavX
              </span>
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
