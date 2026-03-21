import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      background: '#060B15',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '32px 0 24px',
      marginTop: 40,
    }}>
      <div className="max-w-5xl mx-auto px-4">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 24, marginBottom: 24 }}>
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div style={{
                width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #CFB53B, #A89028)',
              }}>
                <TrendingUp size={14} color="#000" strokeWidth={3} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', color: '#CFB53B' }}>
                METALXPRESS
              </span>
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', lineHeight: 1.5, margin: 0 }}>
              India's real-time scrap metal rate platform for traders.
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
            &copy; {new Date().getFullYear()} MetalXpress. All rights reserved.
          </p>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', margin: 0 }}>
            Made in India 🇮🇳
          </p>
        </div>
      </div>
    </footer>
  );
}
