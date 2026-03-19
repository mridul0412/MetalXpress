import { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function LMEStrip() {
  const [rates, setRates] = useState([]);

  useEffect(() => {
    fetch('/api/rates/live')
      .then(r => r.json())
      .then(d => { if (d.rates?.length) setRates(d.rates); })
      .catch(() => {});
  }, []);

  if (!rates.length) {
    return (
      <div style={{ height: 32, background: '#0d1117', borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Loading live rates…
        </span>
      </div>
    );
  }

  const items = [...rates, ...rates, ...rates];

  return (
    <div style={{ height: 32, background: '#0a0f1a', borderBottom: '1px solid rgba(255,255,255,0.06)',
      overflow: 'hidden', display: 'flex', alignItems: 'center', position: 'relative' }}>
      {/* fade edges */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 32,
        background: 'linear-gradient(to right, #0a0f1a, transparent)', zIndex: 1, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 32,
        background: 'linear-gradient(to left, #0a0f1a, transparent)', zIndex: 1, pointerEvents: 'none' }} />

      <div className="animate-marquee" style={{ alignItems: 'center' }}>
        {items.map((rate, i) => {
          const up = rate.change > 0;
          const dn = rate.change < 0;
          const Icon = up ? ArrowUpRight : dn ? ArrowDownRight : Minus;
          return (
            <span key={`${rate.metal}-${i}`} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '0 20px',
              borderRight: '1px solid rgba(255,255,255,0.07)',
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>
                {rate.metal}
              </span>
              <span style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
                ${rate.priceUsd?.toLocaleString('en-IN')}
              </span>
              <span style={{ fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1,
                color: up ? '#34d399' : dn ? '#f87171' : 'rgba(255,255,255,0.3)' }}>
                <Icon size={10} />
                {Math.abs(rate.change)}%
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
