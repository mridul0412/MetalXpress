import React, { useState, useEffect, useCallback } from 'react';
import { fetchLMERates, fetchMCXRates, fetchForexRates } from '../utils/api';

const METAL_EMOJIS = {
  Copper: '🥇', Aluminium: '🥈', Nickel: '⚡', Lead: '⚫',
  Zinc: '🔵', Tin: '🔩', Crude: '🛢️', Gold: '💎', 'Gold Oz': '💎',
  Silver: '💎', 'Silver Oz': '💎', 'Natural Gas': '🔥',
  'USD/INR': '💱', 'EUR/USD': '💱', Nifty: '📊', Sensex: '📊',
};

function ChangeTag({ change }) {
  if (change === null || change === undefined) return null;
  const isUp = change >= 0;
  return (
    <span className={`text-[10px] font-semibold rate-number ${isUp ? 'text-up' : 'text-down'}`}>
      {isUp ? '▲' : '▼'} {Math.abs(change).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
    </span>
  );
}

function RateRow({ emoji, name, price, change, unit }) {
  const isUp = change >= 0;
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border last:border-0 group hover:bg-surface3 px-3 -mx-3 rounded transition-colors">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm leading-none shrink-0">{emoji || '●'}</span>
        <span className="text-gray-300 text-xs font-medium truncate">{name}</span>
        {unit && <span className="text-[9px] text-gray-600 shrink-0 hidden sm:block">{unit}</span>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-sm font-bold rate-number ${isUp ? 'text-white' : 'text-white'}`}>
          {price?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </span>
        <ChangeTag change={change} />
      </div>
    </div>
  );
}

export default function LMERatesPanel({ defaultExpanded = true }) {
  const [lme, setLme] = useState([]);
  const [mcx, setMcx] = useState([]);
  const [forex, setForex] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [activeTab, setActiveTab] = useState('LME');

  const load = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
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
      console.error('LME panel load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(() => load(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [load]);

  const formatTime = (d) => {
    if (!d) return '';
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const tabs = [
    { id: 'LME', label: '🌐 LME', unit: '$/MT', data: lme, keyField: 'metal' },
    { id: 'MCX', label: '🇮🇳 MCX', unit: '₹/Kg', data: mcx, keyField: 'metal' },
    { id: 'FOREX', label: '💱 Forex', unit: '', data: forex, keyField: 'pair' },
  ];

  const currentTab = tabs.find(t => t.id === activeTab);

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden mb-3"
      style={{ borderColor: '#CFB53B22' }}>

      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-2.5"
        style={{ background: 'linear-gradient(135deg, #1A1500, #141414)' }}>
        <div className="flex items-center gap-2">
          <span className="text-gold text-sm">📈</span>
          <span className="text-gold font-bold text-sm tracking-wide">Global Markets</span>
          {lastUpdated && (
            <span className="text-[10px] text-gray-600 hidden sm:block">
              · Updated {formatTime(lastUpdated)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className={`text-[10px] text-gray-500 hover:text-gold transition-colors flex items-center gap-1 ${refreshing ? 'opacity-50' : ''}`}
          >
            <span className={refreshing ? 'animate-spin' : ''}>↺</span>
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => setExpanded(e => !e)}
            className="text-gray-500 hover:text-gold transition-colors text-sm ml-1"
          >
            {expanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {expanded && (
        <>
          {/* Tab selector */}
          <div className="flex border-b border-border">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 text-xs font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'text-gold border-b-2 border-gold -mb-px bg-surface2'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab.label}
                {tab.unit && <span className="text-[9px] text-gray-600 ml-1">{tab.unit}</span>}
              </button>
            ))}
          </div>

          {/* Rate rows */}
          <div className="px-3 py-2">
            {loading ? (
              <div className="space-y-2 py-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="skeleton h-3 w-28" />
                    <div className="skeleton h-3 w-20" />
                  </div>
                ))}
              </div>
            ) : currentTab?.data.length === 0 ? (
              <div className="text-center py-4 text-gray-600 text-xs">
                No {activeTab} data available
              </div>
            ) : (
              currentTab?.data.map((r, i) => (
                <RateRow
                  key={i}
                  emoji={METAL_EMOJIS[r.metal || r.pair]}
                  name={r.metal || r.pair}
                  price={r.price}
                  change={r.change}
                  unit={currentTab.id !== 'FOREX' ? currentTab.unit : ''}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {lastUpdated && (
            <div className="px-4 py-2 border-t border-border text-[10px] text-gray-600 text-right">
              Last updated: {lastUpdated.toLocaleString('en-IN', {
                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
              })} · Auto-refresh every 5 min
            </div>
          )}
        </>
      )}
    </div>
  );
}
