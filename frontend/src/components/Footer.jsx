import { Link } from 'react-router-dom';
import { BRAND } from '../config/brand';
import BhavXLogo from './BhavXLogo';
import BhavXWordmark from './BhavXWordmark';
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <BhavXLogo size={28} glow />
              <BhavXWordmark size="footer" />
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', lineHeight: 1.5, margin: 0 }}>
              India&apos;s Metal Exchange. Live LME &amp; MCX rates, verified marketplace, dharmic dispute mediation.
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
