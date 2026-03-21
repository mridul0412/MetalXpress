import { Link } from 'react-router-dom';
import { TrendingUp, MapPin, Briefcase, Bell, ChevronRight } from 'lucide-react';

const FEATURES = [
  { icon: TrendingUp, label: 'LME / MCX Live', desc: 'Real-time global metal prices', badge: 'FREE', badgeColor: '#34d399' },
  { icon: MapPin,     label: 'Local Spot Rates', desc: 'City-wise buy/sell prices', badge: 'PRO', badgeColor: '#CFB53B' },
  { icon: Briefcase,  label: 'Marketplace',      desc: 'Buy & sell scrap metal', badge: 'FREE', badgeColor: '#34d399' },
  { icon: Bell,       label: 'Price Alerts',     desc: 'Get notified on price moves', badge: 'FREE', badgeColor: '#34d399' },
];

export default function HeroSection() {
  return (
    <section style={{ textAlign: 'center', paddingBottom: 8, position: 'relative' }}>
      {/* Gold glow behind hero — clipped independently */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 400, background: 'radial-gradient(circle, rgba(207,181,59,0.08) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0, overflow: 'hidden',
      }} />

      {/* ॐ watermark — overlay layer, pointer-events:none so clicks pass through */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        pointerEvents: 'none', userSelect: 'none', zIndex: 2,
        backgroundImage: `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 260"><text x="100" y="200" text-anchor="middle" font-size="180" font-weight="800" fill="rgba(207,181,59,0.12)">ॐ</text></svg>')}")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        backgroundSize: 'contain',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <h1 style={{
          fontSize: 26, fontWeight: 800, lineHeight: 1.2, margin: '0 0 12px',
          background: 'linear-gradient(135deg, #CFB53B, #E8CC5A, #A89028)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.02em',
        }}>
          India's Real-Time<br />Scrap Metal Rate Platform
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', maxWidth: 380, margin: '0 auto 20px', lineHeight: 1.5 }}>
          Live LME, MCX, and local spot rates. Updated every 5 minutes. Trusted by Indian scrap metal traders.
        </p>

        <div className="flex items-center justify-center gap-3 mb-6">
          <Link to="/signup" style={{
            padding: '10px 22px', borderRadius: 10, fontWeight: 700, fontSize: 13,
            background: '#CFB53B', color: '#000', textDecoration: 'none',
            boxShadow: '0 4px 16px rgba(207,181,59,0.3)',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            Get Started Free <ChevronRight size={14} />
          </Link>
          <a href="#lme-section" style={{
            padding: '10px 22px', borderRadius: 10, fontWeight: 700, fontSize: 13,
            background: 'transparent', color: '#CFB53B', textDecoration: 'none',
            border: '1px solid rgba(207,181,59,0.35)',
          }}>
            View Live Rates
          </a>
        </div>

        {/* Feature cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, maxWidth: 440, margin: '0 auto' }}>
          {FEATURES.map(({ icon: Icon, label, desc, badge, badgeColor }) => (
            <div key={label} style={{
              padding: '12px', borderRadius: 10,
              background: 'rgba(13,20,32,0.7)', border: '1px solid rgba(255,255,255,0.07)',
              textAlign: 'left',
            }}>
              <div className="flex items-center gap-2 mb-1">
                <Icon size={14} color="#CFB53B" />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{label}</span>
                <span style={{
                  fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 3, marginLeft: 'auto',
                  background: `${badgeColor}20`, color: badgeColor, letterSpacing: '0.06em',
                }}>{badge}</span>
              </div>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
