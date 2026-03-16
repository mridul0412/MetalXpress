import React, { useEffect, useState } from 'react';
import { fetchLMERates, fetchMCXRates, fetchForexRates } from '../utils/api';

function formatChange(change) {
  if (change === null || change === undefined) return null;
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change}`;
}

function RateItem({ label, price, change }) {
  const isUp = change >= 0;
  return (
    <span className="inline-flex items-center gap-1 px-3 py-0.5 border-r shrink-0"
      style={{ borderColor: '#1E1E1E' }}>
      <span className="text-gray-500 text-[10px]">{label}</span>
      <span className="text-gray-100 text-xs font-bold rate-number">
        {price?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
      </span>
      {change !== null && change !== undefined && (
        <span className={`text-[10px] rate-number ${isUp ? 'text-up' : 'text-down'}`}>
          {isUp ? '▲' : '▼'}{Math.abs(change)}
        </span>
      )}
    </span>
  );
}

export default function LMEStrip() {
  const [lme, setLme] = useState([]);
  const [mcx, setMcx] = useState([]);
  const [forex, setForex] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [lmeRes, mcxRes, forexRes] = await Promise.all([
          fetchLMERates(),
          fetchMCXRates(),
          fetchForexRates(),
        ]);
        setLme(lmeRes.data.rates || []);
        setMcx(mcxRes.data.rates || []);
        setForex(forexRes.data.rates || []);
        setLastUpdated(new Date());
      } catch (err) {
        console.error('LME strip load error:', err);
      }
    }
    load();
    const interval = setInterval(load, 5 * 60 * 1000); // Refresh every 5 min
    return () => clearInterval(interval);
  }, []);

  // Combine all for marquee
  const allItems = [
    ...lme.map(r => ({ label: `${r.metal} (LME)`, price: r.price, change: r.change, unit: r.unit })),
    ...mcx.map(r => ({ label: `${r.metal} (MCX)`, price: r.price, change: r.change, unit: r.unit })),
    ...forex.map(r => ({ label: r.pair, price: r.price, change: r.change, unit: '' })),
  ];

  if (allItems.length === 0) {
    return (
      <div className="border-b h-8 flex items-center px-4 overflow-hidden"
        style={{ background: '#0A0A0A', borderColor: '#1A1A1A' }}>
        <div className="skeleton h-3 w-full max-w-2xl" />
      </div>
    );
  }

  return (
    <div className="border-b overflow-hidden relative"
      style={{ background: '#0A0A0A', borderColor: '#CFB53B15' }}>
      {/* All screens: marquee ticker */}
      <div className="overflow-hidden py-1">
        <div className="flex items-center gap-0">
          <span className="text-[9px] font-bold px-2 shrink-0 text-gold border-r mr-1"
            style={{ borderColor: '#1E1E1E' }}>
            LIVE
          </span>
        </div>
      </div>
      <div className="overflow-hidden pb-1 -mt-1">
        <div className="marquee-track">
          {[...allItems, ...allItems].map((item, i) => (
            <RateItem key={i} label={item.label} price={item.price} change={item.change} />
          ))}
        </div>
      </div>
    </div>
  );
}
