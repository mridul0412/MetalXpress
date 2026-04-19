import { TrendingUp, Shield, Zap, Globe } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24 md:pb-8">
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16, margin: '0 auto 16px',
          background: 'linear-gradient(135deg, #CFB53B, #A89028)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(207,181,59,0.3)',
        }}>
          <TrendingUp size={28} color="#000" strokeWidth={2.5} />
        </div>
        <h1 style={{
          fontSize: 28, fontWeight: 800, margin: '0 0 8px',
          background: 'linear-gradient(135deg, #CFB53B, #E8CC5A, #A89028)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          About BhavX
        </h1>
        <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>
          India's Biggest Metal Trading Platform
        </p>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>
          Live rates. Verified marketplace. Pro analytics. Built for traders who need accuracy — not WhatsApp forwards.
        </p>
      </div>

      {/* Content sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Section icon={<Zap size={18} color="#CFB53B" />} title="What We Do">
          <p>BhavX brings everything a metal trader needs into one platform. Live LME & MCX rates
          updated throughout the day. Local spot prices from major trading hubs. A verified marketplace
          where every trader and every metal is checked before a deal happens.</p>
          <p>We cover Copper, Aluminium, Zinc, Nickel, Lead, Tin, Brass, and more — ferrous, non-ferrous,
          scrap, alloys. City-wise local spot rates for Delhi, Mumbai, Ahmedabad, Ludhiana, Chennai,
          and new cities being added every month.</p>
          <p>No more scrolling through broadcast messages. No more stale screenshots. Same rates you trust — better platform.</p>
        </Section>

        <Section icon={<Globe size={18} color="#CFB53B" />} title="Live Data">
          <p>Real-time metal prices from global exchanges, MCX-equivalent INR prices, forex rates, market
          indices, and crude oil — all updated frequently and formatted cleanly. Local spot rates sourced
          from real market broadcasts across India's biggest trading hubs.</p>
          <p>Everything a trader checks daily — in one place, always current, always accurate.</p>
        </Section>

        <Section icon={<Shield size={18} color="#CFB53B" />} title="Our Mission">
          <p>Indian metal trading runs on trust, speed, and accurate information. We're building the platform
          this industry deserves — starting with live rates, expanding into a full verified marketplace,
          price alerts, and advanced analytics.</p>
          <p>BhavX is built in India, for Indian traders. From tier-1 cities to tier-3 mandis —
          wherever metal is traded, we're there.</p>
        </Section>
      </div>
    </div>
  );
}

function Section({ icon, title, children }) {
  return (
    <div style={{
      borderRadius: 16, padding: '24px',
      background: 'rgba(13,20,32,0.7)', border: '1px solid rgba(255,255,255,0.07)',
    }}>
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>{title}</h2>
      </div>
      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
        {children}
      </div>
    </div>
  );
}
