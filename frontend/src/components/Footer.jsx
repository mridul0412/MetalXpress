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
              <div style={{
                width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #E8CC5A, #CFB53B, #A89028)',
              }}>
                <span style={{ fontSize: 17, color: '#080E1A', fontWeight: 800, lineHeight: 1, marginTop: -1 }}>ॐ</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', color: '#CFB53B' }}>
                {BRAND.name.toUpperCase()}
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
