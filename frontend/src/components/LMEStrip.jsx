import React, { useEffect, useState } from 'react';
import { fetchLMERates, fetchMCXRates, fetchForexRates } from '../utils/api';

function formatChange(change) {
  if (change === null || change === undefined) return null;
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change}`;
}

function RateItem({ label, price, change, unit }) {
  const isUp = change >= 0;
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 border-r border-[#2A2A2A] shrink-0">
      <span className="text-gray-400 text-xs">{label}</span>
      <span className="text-white text-sm font-semibold rate-number">
        {price?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
      </span>
      {change !== null && change !== undefined && (
        <span className={`text-xs rate-number ${isUp ? 'text-up' : 'text-down'}`}>
          {isUp ? '▲' : '▼'} {Math.abs(change)}
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
      <div className="bg-[#111111] border-b border-[#2A2A2A] h-9 flex items-center px-4">
        <div className="skeleton h-4 w-full" />
      </div>
    );
  }

  return (
    <div className="bg-[#111111] border-b border-[#2A2A2A] overflow-hidden relative">
      {/* Desktop: two rows */}
      <div className="hidden md:block">
        <div className="flex items-center overflow-x-auto scrollbar-hide border-b border-[#1E1E1E] py-1">
          <span className="text-xs text-[#B87333] font-bold px-3 py-0.5 border-r border-[#2A2A2A] shrink-0">
            LME $/MT
          </span>
          {lme.map(r => (
            <RateItem key={r.metal} label={r.metal} price={r.price} change={r.change} unit={r.unit} />
          ))}
        </div>
        <div className="flex items-center overflow-x-auto scrollbar-hide py-1">
          <span className="text-xs text-[#CFB53B] font-bold px-3 py-0.5 border-r border-[#2A2A2A] shrink-0">
            MCX ₹/Kg
          </span>
          {mcx.map(r => (
            <RateItem key={r.metal} label={r.metal} price={r.price} change={r.change} unit={r.unit} />
          ))}
          <span className="text-xs text-[#4A90D9] font-bold px-3 py-0.5 border-l border-[#2A2A2A] shrink-0 ml-2">
            FOREX
          </span>
          {forex.map(r => (
            <RateItem key={r.pair} label={r.pair} price={r.price} change={r.change} unit="" />
          ))}
          {lastUpdated && (
            <span className="text-[10px] text-gray-600 px-3 ml-auto shrink-0">
              Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      {/* Mobile: marquee */}
      <div className="md:hidden overflow-hidden py-1.5">
        <div className="marquee-track">
          {[...allItems, ...allItems].map((item, i) => (
            <RateItem key={i} label={item.label} price={item.price} change={item.change} unit={item.unit} />
          ))}
        </div>
      </div>
    </div>
  );
}
