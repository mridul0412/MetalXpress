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
    q: 'What is MetalXpress?',
    a: "MetalXpress is India's metal trading platform. Live LME & MCX rates, local spot prices, and a verified B2B marketplace \u2014 all in one place. Built for traders who are tired of relying on WhatsApp broadcasts and phone calls to get rates and find buyers.",
  },
  {
    q: 'What metals are covered?',
    a: 'All types \u2014 ferrous, non-ferrous, scrap, alloys, and more. Copper, Aluminium, Zinc, Nickel, Lead, Tin, and the list keeps growing. If you trade it, we cover it.',
  },
  {
    q: 'How are local rates sourced?',
    a: 'From real market broadcasts \u2014 the same sources dealers and brokers rely on daily. These are actual buy/sell prices from active market participants in each city, not estimates or recycled data.',
  },
  {
    q: 'How accurate are the rates?',
    a: "Same rates you'd get on WhatsApp \u2014 but updated frequently from exchange data feeds, formatted properly, and always available. No stale screenshots from two days ago, no confusion about which rate is current.",
  },
  {
    q: 'Is this better than WhatsApp groups?',
    a: "Same market information, but hassle-free. No scrolling through 200 messages to find one rate. No forwarded screenshots you can't trust. Everything live, organized, accurate, and in one place. Plus a proper marketplace to actually close deals \u2014 not just talk about them.",
  },
  {
    q: 'Are sellers and metals verified?',
    a: "Yes. Every trader on MetalXpress is verified before they can list or negotiate. And the metal being sold is checked too. Person verified. Material verified. You always know who you're dealing with and what you're buying.",
  },
  {
    q: 'How does commission work on deals?',
    a: "You're charged a commission of 0.1% on the deal value only after both buyer and seller agree on price and quantity. Browsing, listing, negotiating \u2014 all completely free. You pay only when a deal is confirmed and both sides are happy.",
  },
  {
    q: 'What does the Pro plan include?',
    a: 'Full marketplace access to post and negotiate deals, local city spot rates for Delhi Mandoli, Mumbai, Ahmedabad, Ludhiana, Chennai, candlestick charts, trend analysis, momentum signals, and LME-MCX spread tracking. All for \u20B9299/month.',
  },
  {
    q: 'Which cities do you cover?',
    a: "Delhi Mandoli, Mumbai, Ahmedabad, Ludhiana, Chennai \u2014 with more cities being added every month. If your market isn't listed yet, tell us and we'll prioritise it.",
  },
  {
    q: 'Is my data private and secure?',
    a: 'Yes. Your activity, listings, and personal details are never shared with anyone. Contact information is revealed only when both parties agree to a deal. We don\'t sell your data, ever.',
  },
  {
    q: 'Can I use this on mobile?',
    a: 'Yes. MetalXpress works on any smartphone \u2014 Android or iPhone, no heavy app download needed. Same live rates, same marketplace, same analytics. Trade from anywhere.',
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
              <span style={{ fontSize: 14, fontWeight: 600, color: open ? '#CFB53B' : 'rgba(255,255,255,0.7)', lineHeight: 1.5, fontFamily: 'inherit' }}>
                {item.q}
              </span>
              <ChevronDown size={16} color={open ? '#CFB53B' : 'rgba(255,255,255,0.25)'}
                style={{ flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </button>
            {open && (
              <p style={{
                fontSize: 13, color: 'rgba(255,255,255,0.42)', lineHeight: 1.75,
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
        }}>{'\u0950'}</div>

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
            India's Biggest<br />Metal Trading Platform
          </h1>

          {/* City emphasis line */}
          <p style={{
            fontSize: 'clamp(11px, 1.6vw, 14px)',
            color: '#CFB53B', margin: '0 auto 14px', letterSpacing: '0.06em',
            fontWeight: 700, textTransform: 'uppercase',
          }}>
            Live spot rates from: Delhi Mandoli · Mumbai · Ahmedabad · Ludhiana · Chennai · +more
          </p>

          {/* Sub */}
          <p style={{
            fontSize: 'clamp(13px, 2vw, 15px)', color: 'rgba(255,255,255,0.4)',
            maxWidth: 540, margin: '0 auto 36px', lineHeight: 1.8,
          }}>
            The same rates you get on WhatsApp — but faster, cleaner, and always accurate.
            Live LME & MCX prices updated throughout the day.
            A verified marketplace where every trader and every metal is checked.
            Ferrous, non-ferrous, scrap, alloys — all in one place.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
            <Link to="/signup" style={{
              padding: '13px 28px', borderRadius: 12, fontWeight: 700, fontSize: 14,
              background: '#CFB53B', color: '#000', textDecoration: 'none',
              boxShadow: '0 4px 28px rgba(207,181,59,0.28)',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
              Join MetalXpress Free <ChevronRight size={16} />
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
            fontSize: 12, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.03em',
          }}>
            {['Real-time rate updates', 'Every trader verified', 'Every metal checked', 'Trusted by traders across India'].map(t => (
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
            fontSize: 11, textAlign: 'center', color: 'rgba(255,255,255,0.2)',
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
                  <p style={{ fontSize: 11, color: mc, margin: '0 0 5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.metal}</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 3px', fontFamily: 'monospace' }}>
                    ${m.priceUsd >= 1000 ? (m.priceUsd / 1000).toFixed(1) + 'K' : m.priceUsd?.toFixed(0)}
                  </p>
                  <p style={{ fontSize: 12, margin: 0, fontFamily: 'monospace', fontWeight: 700, color: up ? '#34d399' : dn ? '#f87171' : 'rgba(255,255,255,0.3)' }}>
                    {up ? '+' : ''}{m.change?.toFixed(2)}%
                  </p>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: 11, textAlign: 'center', color: 'rgba(255,255,255,0.15)', marginTop: 10 }}>
            <Link to="/signup" style={{ color: '#CFB53B', textDecoration: 'none' }}>Sign up free</Link>
            {' '}to unlock local city rates, marketplace, and market analytics
          </p>
        </section>
      )}

      {/* ── 3. HOW IT WORKS ── */}
      <section style={{ padding: '64px 16px', maxWidth: 920, margin: '0 auto' }}>
        <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>How it works</p>
        <h2 style={{ textAlign: 'center', fontSize: 26, fontWeight: 700, color: '#fff', margin: '0 0 40px' }}>
          How <span style={{ color: '#CFB53B' }}>MetalXpress</span> Works
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          {[
            { step: '01', icon: TrendingUp, title: 'Check Live Rates', desc: 'No more waiting for someone to forward today\'s rate. Live LME, MCX, and local spot prices for Copper, Aluminium, Zinc, Nickel, Lead, Tin and more. Updated throughout the day. Set price alerts and get notified the moment rates cross your number.' },
            { step: '02', icon: Briefcase, title: 'Buy & Sell on the Marketplace', desc: 'Post your listing \u2014 ferrous, non-ferrous, scrap, alloys, anything. Every seller is verified. Every metal listed is checked. Negotiate price and quantity in-app. Contacts revealed only after both parties agree.' },
            { step: '03', icon: BarChart3, title: 'Upgrade for the Full Edge', desc: 'Unlock city-level spot rates, advanced analytics with candlestick charts and momentum signals, LME vs MCX spread tracking, and unlimited listings. Everything a serious trader needs \u2014 starting at \u20B9299/month.' },
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
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', margin: 0, lineHeight: 1.7 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. WHAT YOU GET ── */}
      <section style={{ padding: '64px 16px', background: 'rgba(13,20,32,0.5)' }}>
        <div style={{ maxWidth: 920, margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>What you get</p>
          <h2 style={{ textAlign: 'center', fontSize: 26, fontWeight: 700, color: '#fff', margin: '0 0 40px' }}>
            Free to start.{' '}
            <span style={{ color: '#CFB53B' }}>Pro when you're ready.</span>
          </h2>

          {/* FREE */}
          <p style={{ fontSize: 11, fontWeight: 700, color: '#34d399', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>{'\u2713'} Free Plan — Start Instantly</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 10, marginBottom: 36 }}>
            {[
              { icon: TrendingUp, title: 'LME / MCX Live Rates', desc: 'Live metal prices for all major metals, updated throughout the day. All metal types \u2014 ferrous, non-ferrous, scrap, alloys.' },
              { icon: Bell, title: 'Price Alerts', desc: 'Set price thresholds and get notified when a metal crosses your target. Works on any phone or browser.' },
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
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 5px' }}>{title}</p>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', margin: 0, lineHeight: 1.6 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* PRO */}
          <p style={{ fontSize: 11, fontWeight: 700, color: '#CFB53B', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>{'\u26A1'} Pro — {'\u20B9'}299/month</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 10 }}>
            {[
              { icon: MapPin, title: 'Local Spot Rates', desc: 'City-wise buy/sell prices per grade: Delhi Mandoli, Mumbai, Ahmedabad, Ludhiana, Chennai. Sourced from real market broadcasts.' },
              { icon: Briefcase, title: 'Verified Marketplace', desc: 'Post buy/sell listings, negotiate deals in-app. Every trader verified. Every metal checked. Commission only after both parties agree.' },
              { icon: BarChart3, title: 'Market Analytics', desc: 'Candlestick charts, trend analysis, momentum signals, and LME vs MCX spread tracking.' },
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
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 5px' }}>{title}</p>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', margin: 0, lineHeight: 1.6 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. PRICING ── */}
      <section style={{ padding: '64px 16px', maxWidth: 700, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
          {[
            {
              name: 'Free', price: '\u20B90', period: 'forever',
              features: ['Live LME & MCX rates', 'Updated throughout the day', 'Price alerts', 'All metal types covered', 'Works on any phone or browser'],
              cta: 'Start Free \u2192', ctaLink: '/signup', highlight: false,
            },
            {
              name: 'Pro', price: '\u20B9299', period: 'per month',
              features: ['Everything in Free', 'Full marketplace access', 'Local spot rates by city', 'Candlestick charts & advanced analytics', 'LME-MCX spread tracking', 'Verified traders & materials'],
              cta: 'Go Pro \u2192', ctaLink: '/signup', highlight: true,
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
              <p style={{ fontSize: 12, fontWeight: 700, color: highlight ? '#CFB53B' : 'rgba(255,255,255,0.38)', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{name}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 22 }}>
                <span style={{ fontSize: 34, fontWeight: 800, color: '#fff', fontFamily: 'monospace' }}>{price}</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)' }}>/{period}</span>
              </div>
              <div style={{ marginBottom: 24 }}>
                {features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: 10 }}>
                    <CheckCircle size={13} color={highlight ? '#CFB53B' : '#34d399'} style={{ marginTop: 1, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{f}</span>
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
        <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Got questions?</p>
        <h2 style={{ textAlign: 'center', fontSize: 24, fontWeight: 700, color: '#fff', margin: '0 0 32px' }}>
          Questions Traders Ask Us
        </h2>
        <FAQAccordion />
      </section>

      {/* ── 7. FINAL CTA ── */}
      <section style={{ padding: '0 16px 96px', textAlign: 'center' }}>
        <div style={{
          maxWidth: 600, margin: '0 auto', padding: '52px 32px',
          background: 'rgba(13,20,32,0.7)', borderRadius: 24,
          border: '1px solid rgba(207,181,59,0.13)',
          boxShadow: '0 0 80px rgba(207,181,59,0.04)',
        }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 12px', lineHeight: 1.35 }}>
            Stop Trading on WhatsApp.<br />Start Trading on MetalXpress.
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.42)', margin: '0 0 30px', lineHeight: 1.7 }}>
            Same rates you trust. A better, verified platform.
            Every trader checked. Every metal checked. Every deal transparent.
            Join India's fastest-growing metal trading platform — free to start, no card needed.
          </p>
          <Link to="/signup" style={{
            display: 'inline-flex', alignItems: 'center', gap: 9,
            padding: '13px 32px', borderRadius: 12, fontWeight: 700, fontSize: 14,
            background: '#CFB53B', color: '#000', textDecoration: 'none',
            boxShadow: '0 4px 28px rgba(207,181,59,0.22)',
          }}>
            Join MetalXpress Free <ArrowRight size={15} />
          </Link>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.18)', marginTop: 14 }}>No credit card required</p>
        </div>
      </section>

    </div>
  );
}
