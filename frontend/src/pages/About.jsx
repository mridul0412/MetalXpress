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
          About MetalXpress
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>
          India's first real-time scrap metal rate platform, built for traders who need accurate prices without the WhatsApp chaos.
        </p>
      </div>

      {/* Content sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Section icon={<Zap size={18} color="#CFB53B" />} title="What We Do">
          <p>MetalXpress replaces WhatsApp broadcast groups with a clean, organized platform for scrap metal rates.
          Admin operators paste WhatsApp broadcast messages into our smart parser, which automatically extracts LME,
          MCX, forex, and local spot rates — then publishes them instantly to all users.</p>
          <p>Our platform covers Copper, Aluminium, Zinc, Nickel, Lead, Tin, Brass, and more — with city-wise
          local spot rates for hubs like Delhi Mandoli, Mumbai, Chennai, and others across India.</p>
        </Section>

        <Section icon={<Globe size={18} color="#CFB53B" />} title="Live Data Sources">
          <p>We pull live metal prices from global exchanges (LME via Yahoo Finance, COMEX), convert them to
          MCX-equivalent INR prices, and overlay admin-verified local spot rates from WhatsApp trader networks.</p>
          <p>Forex rates (USD/INR, EUR/USD), market indices (Nifty 50, Sensex), and Crude Oil WTI prices are
          refreshed automatically every 5 minutes.</p>
        </Section>

        <Section icon={<Shield size={18} color="#CFB53B" />} title="Our Mission">
          <p>Indian scrap metal trading runs on trust, speed, and accurate information. We're building the digital
          infrastructure that traders need — starting with live rates, expanding to a full marketplace, price alerts,
          and analytics.</p>
          <p>MetalXpress is built in India, for Indian traders. We understand the nuances of the market —
          from Mandoli to Mundra.</p>
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
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
        {children}
      </div>
    </div>
  );
}
