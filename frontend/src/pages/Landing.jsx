import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, MapPin, BarChart3, Bell, ChevronRight,
  CheckCircle, ArrowRight, Users, Briefcase, Shield, ChevronDown,
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || '';
const METAL_COLORS = {
  Copper: '#E87040', Aluminium: '#8B9DC3', Zinc: '#5B8DEF',
  Nickel: '#34d399', Lead: '#9CA3AF', Tin: '#CFB53B',
};

const FAQ_ITEMS = [
  {
    q: 'Where do the local spot rates come from?',
    a: 'Rates are sourced directly from real-time market broadcast messages — the same ones traders share via WhatsApp groups. Our admin team verifies and publishes them within minutes, covering Delhi Mandoli, Ahmedabad, Mumbai, Ludhiana, and more hubs.',
  },
  {
    q: 'How is the marketplace different from WhatsApp groups?',
    a: 'Every trader on the marketplace is PAN-verified through our KYC process. You negotiate price and quantity in-app before any contact details are shared. Commission (0.1% of agreed value) is only charged after both parties agree — no upfront fees.',
  },
  {
    q: 'Are the LME and MCX prices accurate?',
    a: 'LME prices are fetched from Yahoo Finance and Stooq every 15 minutes. MCX prices are calculated using the live USD/INR rate. When an admin pastes a fresh broadcast, those values take priority for immediate accuracy.',
  },
  {
    q: 'What do I get with the Pro plan?',
    a: 'Pro unlocks local city spot rates (grade-wise buy/sell), the full B2B marketplace (post listings, negotiate, connect), market analytics (candlestick charts, trend signals, period highs/lows), and unlimited price alerts. Free users get live LME/MCX rates and basic alerts.',
  },
  {
    q: 'Is my data safe? Do you report to any authorities?',
    a: 'Your identity details are stored with bank-grade encryption and used solely for trader verification on MetalXpress. We never share your information with external parties. Deal amounts remain strictly between you and your counterparty.',
  },
];

function FAQAccordion() {
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <div>
      {FAQ_ITEMS.map((item, i) => {
        const open = openIdx === i;
        return (
          <div key={i} style={{
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <button onClick={() => setOpenIdx(open ? null : i)} style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '18px 0', background: 'none', border: 'none', cursor: 'pointer',
              textAlign: 'left', gap: 16,
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: open ? '#CFB53B' : 'rgba(255,255,255,0.7)', lineHeight: 1.5, fontFamily: 'inherit' }}>
                {item.q}
              </span>
              <ChevronDown size={16} color={open ? '#CFB53B' : 'rgba(255,255,255,0.25)'}
                style={{ flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </button>
            {open && (
              <p style={{
                fontSize: 12, color: 'rgba(255,255,255,0.38)', lineHeight: 1.75,
                margin: '0 0 18px', paddingRight: 32,
              }}>
                {item.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Landing() {
  const [liveData, setLiveData] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/rates/live`).then(r => r.json()).then(setLiveData).catch(() => {});
  }, []);

  return (
    <div style={{ fontFamily: '"JetBrains Mono", monospace', overflowX: 'hidden' }}>

      {/* ── 1. HERO ── */}
      <section style={{
        minHeight: '88vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', textAlign: 'center', padding: '60px 16px 48px',
      }}>
        {/* Gold radial glow */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 70% 55% at 50% 0%, rgba(207,181,59,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* OM watermark — sits above the glow, below the text, clearly visible */}
        <div style={{
          position: 'absolute', top: '58%', left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: 'min(72vw, 560px)', lineHeight: 1,
          color: 'rgba(207,181,59,0.11)', fontWeight: 900,
          pointerEvents: 'none', userSelect: 'none', zIndex: 1,
          filter: 'blur(0.5px)',
        }}>ॐ</div>

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 660, margin: '0 auto' }}>
          {/* Live badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '5px 14px', borderRadius: 99, marginBottom: 28,
            background: 'rgba(207,181,59,0.07)', border: '1px solid rgba(207,181,59,0.18)',
            fontSize: 10, fontWeight: 700, color: '#CFB53B', letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399' }} />
            Live · LME · MCX · Local Rates
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(30px, 5.5vw, 54px)', fontWeight: 800, lineHeight: 1.12,
            margin: '0 0 18px', letterSpacing: '-0.025em',
            background: 'linear-gradient(145deg, #fff 0%, #E8CC5A 55%, #A89028 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Metal Rates.<br />Local to Global.
          </h1>

          {/* City emphasis line */}
          <p style={{
            fontSize: 'clamp(11px, 1.6vw, 14px)',
            color: '#CFB53B', margin: '0 auto 14px', letterSpacing: '0.06em',
            fontWeight: 700, textTransform: 'uppercase',
          }}>
            Delhi · Mumbai · Ahmedabad · Ludhiana · and more
          </p>

          {/* Sub */}
          <p style={{
            fontSize: 'clamp(13px, 2vw, 15px)', color: 'rgba(255,255,255,0.4)',
            maxWidth: 500, margin: '0 auto 36px', lineHeight: 1.8,
          }}>
            Accurate local spot rates updated from real market broadcasts.
            Live LME & MCX benchmarks every 15 minutes.
            A verified B2B marketplace where you negotiate, agree, then connect.
            Pro analytics with price trends, signals, and period highs.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
            <Link to="/signup" style={{
              padding: '13px 28px', borderRadius: 12, fontWeight: 700, fontSize: 14,
              background: '#CFB53B', color: '#000', textDecoration: 'none',
              boxShadow: '0 4px 28px rgba(207,181,59,0.28)',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
              Start for Free <ChevronRight size={16} />
            </Link>
            <Link to="/login" style={{
              padding: '13px 28px', borderRadius: 12, fontWeight: 700, fontSize: 14,
              background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.65)',
              textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
              Sign In
            </Link>
          </div>

          {/* Trust strip */}
          <div style={{
            display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap',
            fontSize: 11, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.03em',
          }}>
            {['Verified traders only', 'Live every 15 min', '0.1% commission on deals', 'PAN-verified KYC'].map(t => (
              <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <CheckCircle size={11} color="#34d399" strokeWidth={2.5} /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. LIVE PRICE PREVIEW ── */}
      {liveData?.metals && (
        <section style={{ padding: '0 16px 68px', maxWidth: 920, margin: '0 auto' }}>
          <p style={{
            fontSize: 10, textAlign: 'center', color: 'rgba(255,255,255,0.2)',
            letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14,
          }}>Live LME spot prices</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(128px, 1fr))', gap: 8 }}>
            {liveData.metals.slice(0, 6).map(m => {
              const up = m.change > 0, dn = m.change < 0;
              const mc = METAL_COLORS[m.metal] || '#CFB53B';
              return (
                <div key={m.metal} style={{
                  padding: '14px 16px', borderRadius: 14,
                  background: 'rgba(13,20,32,0.85)', border: '1px solid rgba(255,255,255,0.05)',
                  borderTop: `2px solid ${mc}45`,
                }}>
                  <p style={{ fontSize: 10, color: mc, margin: '0 0 5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.metal}</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 3px', fontFamily: 'monospace' }}>
                    ${m.priceUsd >= 1000 ? (m.priceUsd / 1000).toFixed(1) + 'K' : m.priceUsd?.toFixed(0)}
                  </p>
                  <p style={{ fontSize: 11, margin: 0, fontFamily: 'monospace', fontWeight: 700, color: up ? '#34d399' : dn ? '#f87171' : 'rgba(255,255,255,0.3)' }}>
                    {up ? '+' : ''}{m.change?.toFixed(2)}%
                  </p>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: 10, textAlign: 'center', color: 'rgba(255,255,255,0.15)', marginTop: 10 }}>
            <Link to="/signup" style={{ color: '#CFB53B', textDecoration: 'none' }}>Sign up free</Link>
            {' '}to unlock local city rates, MCX prices, and market analytics
          </p>
        </section>
      )}

      {/* ── 3. HOW IT WORKS ── */}
      <section style={{ padding: '64px 16px', maxWidth: 920, margin: '0 auto' }}>
        <p style={{ textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>How it works</p>
        <h2 style={{ textAlign: 'center', fontSize: 26, fontWeight: 700, color: '#fff', margin: '0 0 40px' }}>
          Set up in <span style={{ color: '#CFB53B' }}>minutes</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          {[
            { step: '01', icon: Users, title: 'Create your account', desc: 'Sign up free with your email. No credit card needed. Verify your email to get started.' },
            { step: '02', icon: TrendingUp, title: 'Explore live rates', desc: 'LME, MCX, and local hub prices refreshed every 15 minutes. Forex, indices, crude — all in one view.' },
            { step: '03', icon: BarChart3, title: 'Trade & analyse', desc: 'Post buy/sell listings, negotiate deals in-app, and track price trends with Pro analytics.' },
          ].map(({ step, icon: Icon, title, desc }) => (
            <div key={step} style={{
              padding: '28px 22px', borderRadius: 18,
              background: 'rgba(13,20,32,0.7)', border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <p style={{ fontSize: 34, fontWeight: 800, color: 'rgba(207,181,59,0.1)', margin: '0 0 18px', lineHeight: 1, fontFamily: 'monospace' }}>{step}</p>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(207,181,59,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <Icon size={18} color="#CFB53B" />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>{title}</h3>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', margin: 0, lineHeight: 1.7 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. WHAT YOU GET ── */}
      <section style={{ padding: '64px 16px', background: 'rgba(13,20,32,0.5)' }}>
        <div style={{ maxWidth: 920, margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>What you get</p>
          <h2 style={{ textAlign: 'center', fontSize: 26, fontWeight: 700, color: '#fff', margin: '0 0 40px' }}>
            Free to start.{' '}
            <span style={{ color: '#CFB53B' }}>Pro when you're ready.</span>
          </h2>

          {/* FREE */}
          <p style={{ fontSize: 11, fontWeight: 700, color: '#34d399', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>✓ Always Free</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 10, marginBottom: 36 }}>
            {[
              { icon: TrendingUp, title: 'LME / MCX Live Rates', desc: 'Global metal prices in $/MT and ₹/kg. Auto-refreshed from Yahoo Finance & Stooq.' },
              { icon: Bell, title: 'Price Alerts', desc: 'Set price thresholds and get notified when a metal crosses your target.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{
                padding: '18px 20px', borderRadius: 14,
                background: 'rgba(13,20,32,0.7)', border: '1px solid rgba(52,211,153,0.1)',
                display: 'flex', alignItems: 'flex-start', gap: 14,
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(52,211,153,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={17} color="#34d399" />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: '0 0 5px' }}>{title}</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: 0, lineHeight: 1.6 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* PRO */}
          <p style={{ fontSize: 11, fontWeight: 700, color: '#CFB53B', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>⚡ Pro — ₹299/month</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 10 }}>
            {[
              { icon: MapPin, title: 'Local Spot Rates', desc: 'City-wise buy/sell prices per grade, sourced from trade broadcast messages in real time.' },
              { icon: Briefcase, title: 'Metal Marketplace', desc: 'Post buy/sell listings, negotiate deals in-app. Commission only charged after both parties agree.' },
              { icon: BarChart3, title: 'Market Analytics', desc: 'Candlestick & line charts, period highs/lows, momentum signals, MCX spread analysis.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{
                padding: '18px 20px', borderRadius: 14,
                background: 'rgba(207,181,59,0.02)', border: '1px solid rgba(207,181,59,0.13)',
                display: 'flex', alignItems: 'flex-start', gap: 14,
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(207,181,59,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={17} color="#CFB53B" />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: '0 0 5px' }}>{title}</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: 0, lineHeight: 1.6 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. PRICING ── */}
      <section style={{ padding: '64px 16px', maxWidth: 920, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
          {[
            {
              name: 'Free', price: '₹0', period: 'forever',
              features: ['LME / MCX live rates', 'Forex & indices', 'Price alerts (3 active)', 'Mobile-first access'],
              cta: 'Get Started', ctaLink: '/signup', highlight: false,
            },
            {
              name: 'Pro', price: '₹299', period: 'per month',
              features: ['Everything in Free', 'Local city spot rates', 'Metal marketplace', 'Market analytics & charts', 'Unlimited price alerts'],
              cta: 'Start Pro', ctaLink: '/signup', highlight: true,
            },
            {
              name: 'Business', price: '₹999', period: 'per month',
              features: ['Everything in Pro', 'Bulk listings', 'Unlimited deal contacts', 'API access (coming soon)', 'Dedicated account manager'],
              cta: 'Contact Us', ctaLink: '/contact', highlight: false,
            },
          ].map(({ name, price, period, features, cta, ctaLink, highlight }) => (
            <div key={name} style={{
              padding: '28px 24px', borderRadius: 20, position: 'relative',
              background: highlight ? 'rgba(207,181,59,0.04)' : 'rgba(13,20,32,0.7)',
              border: `1px solid ${highlight ? 'rgba(207,181,59,0.28)' : 'rgba(255,255,255,0.06)'}`,
              boxShadow: highlight ? '0 0 60px rgba(207,181,59,0.06)' : 'none',
            }}>
              {highlight && (
                <div style={{
                  position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)',
                  background: '#CFB53B', color: '#000', fontSize: 9, fontWeight: 800,
                  padding: '3px 12px', borderRadius: 99, letterSpacing: '0.1em', textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}>Most Popular</div>
              )}
              <p style={{ fontSize: 11, fontWeight: 700, color: highlight ? '#CFB53B' : 'rgba(255,255,255,0.38)', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{name}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 22 }}>
                <span style={{ fontSize: 34, fontWeight: 800, color: '#fff', fontFamily: 'monospace' }}>{price}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)' }}>/{period}</span>
              </div>
              <div style={{ marginBottom: 24 }}>
                {features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: 10 }}>
                    <CheckCircle size={13} color={highlight ? '#CFB53B' : '#34d399'} style={{ marginTop: 1, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.45 }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link to={ctaLink} style={{
                display: 'block', textAlign: 'center', padding: '12px',
                borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none',
                background: highlight ? '#CFB53B' : 'rgba(255,255,255,0.05)',
                color: highlight ? '#000' : 'rgba(255,255,255,0.6)',
                border: highlight ? 'none' : '1px solid rgba(255,255,255,0.09)',
              }}>{cta}</Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. FAQ ── */}
      <section style={{ padding: '64px 16px', maxWidth: 720, margin: '0 auto' }}>
        <p style={{ textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Questions?</p>
        <h2 style={{ textAlign: 'center', fontSize: 24, fontWeight: 700, color: '#fff', margin: '0 0 32px' }}>
          Frequently asked
        </h2>
        <FAQAccordion />
      </section>

      {/* ── 7. FINAL CTA ── */}
      <section style={{ padding: '0 16px 96px', textAlign: 'center' }}>
        <div style={{
          maxWidth: 560, margin: '0 auto', padding: '52px 32px',
          background: 'rgba(13,20,32,0.7)', borderRadius: 24,
          border: '1px solid rgba(207,181,59,0.13)',
          boxShadow: '0 0 80px rgba(207,181,59,0.04)',
        }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: '0 0 12px' }}>
            Stay ahead of the market
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', margin: '0 0 30px', lineHeight: 1.7 }}>
            Join traders across India who use MetalXpress to track prices,
            discover deals, and make smarter decisions.
          </p>
          <Link to="/signup" style={{
            display: 'inline-flex', alignItems: 'center', gap: 9,
            padding: '13px 32px', borderRadius: 12, fontWeight: 700, fontSize: 14,
            background: '#CFB53B', color: '#000', textDecoration: 'none',
            boxShadow: '0 4px 28px rgba(207,181,59,0.22)',
          }}>
            Create Free Account <ArrowRight size={15} />
          </Link>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)', marginTop: 14 }}>No credit card required</p>
        </div>
      </section>

    </div>
  );
}
