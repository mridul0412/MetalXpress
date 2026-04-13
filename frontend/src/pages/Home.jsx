import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, MapPin, Clock, RefreshCw, ArrowUpRight, ArrowDownRight,
  Minus, ChevronRight, ChevronDown, Zap, Globe,
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import HeroSection from '../components/HeroSection';
import LocalRatesGate from '../components/LocalRatesGate';

const METAL_META = {
  Copper:         { color: '#f59e0b', dot: '#f59e0b', emoji: '🥇' },
  Brass:          { color: '#eab308', dot: '#eab308', emoji: '🟡' },
  Aluminium:      { color: '#94a3b8', dot: '#94a3b8', emoji: '🥈' },
  Lead:           { color: '#6b7280', dot: '#6b7280', emoji: '⚫' },
  Zinc:           { color: '#60a5fa', dot: '#60a5fa', emoji: '🔵' },
  Nickel:         { color: '#a78bfa', dot: '#a78bfa', emoji: '⚡' },
  Tin:            { color: '#34d399', dot: '#34d399', emoji: '🔩' },
  'Other Metals': { color: '#fb923c', dot: '#fb923c', emoji: '⚙️' },
  'M.S.':         { color: '#818cf8', dot: '#818cf8', emoji: '🏗️' },
};
const METAL_ORDER = ['Copper', 'Brass', 'Aluminium', 'Lead', 'Zinc', 'Nickel', 'Tin', 'Other Metals', 'M.S.'];

function getMeta(metal) {
  return METAL_META[metal] ?? { color: '#CFB53B', dot: '#CFB53B', emoji: '⚙️' };
}

function fmt(n) { return Number(n).toLocaleString('en-IN'); }
function fmtNum(n, decimals = 2) {
  if (n == null) return '—';
  return Number(n).toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function ChangeChip({ value, decimals = 2 }) {
  if (value == null || value === 0) return <Minus size={12} color="rgba(255,255,255,0.25)" />;
  const up = value > 0;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 2,
      fontSize: 12, fontWeight: 700,
      color: up ? '#34d399' : '#f87171',
    }}>
      {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
      {Math.abs(value).toFixed(decimals)}%
    </span>
  );
}

// ── LOCAL RATE AUTO-REFRESH INTERVAL (5 minutes) ────────────────────────────
const LOCAL_REFRESH_MS = 5 * 60 * 1000;

export default function Home() {
  const { user } = useAuth();
  const [liveData, setLiveData]               = useState(null);
  const [localRates, setLocalRates]           = useState(null);
  const [cities, setCities]                   = useState([]);
  const [selectedCity, setSelectedCity]       = useState(null);
  // closedMetals: Set of metal names user has collapsed. Empty = all open (default).
  const [closedMetals, setClosedMetals]       = useState(new Set());
  const [loadingLme, setLoadingLme]           = useState(true);
  const [loadingLocal, setLoadingLocal]       = useState(false);
  const [refreshingLme, setRefreshingLme]     = useState(false);
  const [refreshingLocal, setRefreshingLocal] = useState(false);
  const [lmeUpdatedAt, setLmeUpdatedAt]       = useState(null);
  const [localUpdatedAt, setLocalUpdatedAt]   = useState(null);
  const localRefreshTimer = useRef(null);
  const lmeRefreshTimer   = useRef(null);

  const toggleMetal = (name) => {
    setClosedMetals(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  const toggleAll = () => {
    if (closedMetals.size > 0) {
      setClosedMetals(new Set()); // expand all
    } else {
      setClosedMetals(new Set(sortedMetals)); // collapse all
    }
  };

  // Fetch live LME + forex + indices
  const loadLme = useCallback(async (force = false) => {
    if (force) setRefreshingLme(true); else setLoadingLme(true);
    try {
      const r = await fetch('/api/rates/live');
      const d = await r.json();
      if (d.metals?.length || d.forex || d.indices) {
        setLiveData(d);
        setLmeUpdatedAt(new Date());
      }
    } catch {}
    finally { setLoadingLme(false); setRefreshingLme(false); }
  }, []);

  useEffect(() => {
    fetch('/api/cities')
      .then(r => r.json())
      .then(d => {
        const list = Array.isArray(d) ? d : (d.cities || []);
        setCities(list);
        if (list.length) setSelectedCity(list[0]);
      })
      .catch(() => {});
    loadLme();
    lmeRefreshTimer.current = setInterval(() => loadLme(true), LOCAL_REFRESH_MS);
    return () => clearInterval(lmeRefreshTimer.current);
  }, [loadLme]);

  const loadLocal = useCallback(async (hubSlug, isRefresh = false) => {
    if (!hubSlug) return;
    if (isRefresh) setRefreshingLocal(true); else setLoadingLocal(true);
    try {
      const r = await fetch(`/api/rates/local?hub=${hubSlug}`);
      const d = await r.json();
      setLocalRates(d);
      const ts = d.lastUpdated;
      setLocalUpdatedAt(ts ? new Date(ts) : new Date());
    } catch {}
    finally { setLoadingLocal(false); setRefreshingLocal(false); }
  }, []);

  useEffect(() => {
    const hubSlug = selectedCity?.hubs?.[0]?.slug;
    if (hubSlug) {
      loadLocal(hubSlug);
      clearInterval(localRefreshTimer.current);
      localRefreshTimer.current = setInterval(() => loadLocal(hubSlug, true), LOCAL_REFRESH_MS);
    }
    return () => clearInterval(localRefreshTimer.current);
  }, [selectedCity, loadLocal]);

  // Derived: group local rates by metal
  const metalGroups = {};
  if (localRates?.rates) {
    for (const { metal, grades } of localRates.rates) {
      const validGrades = grades.filter(g => g.rate);
      if (validGrades.length) metalGroups[metal.name] = { metal, grades: validGrades };
    }
  }
  const sortedMetals = Object.keys(metalGroups).sort((a, b) => {
    const ai = METAL_ORDER.indexOf(a), bi = METAL_ORDER.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const lmeRates = liveData?.metals ?? [];
  const forex    = liveData?.forex  ?? {};
  const indices  = liveData?.indices ?? {};
  const crude    = liveData?.crude  ?? {};
  const hasForex = forex.usdInr != null || forex.eurUsd != null || indices.nifty != null;

  const currentHubSlug = selectedCity?.hubs?.[0]?.slug;

  return (
    <div className="max-w-5xl mx-auto px-4 py-5 pb-24 md:pb-8 flex flex-col gap-6" style={{ position: 'relative' }}>

      {/* ── Hero for non-logged-in users ───────────────── */}
      {!user && <HeroSection />}

      {/* ── LME / MCX Table ────────────────────────────── */}
      <section id="lme-section">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={15} color="#CFB53B" />
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              LME / MCX Rates
            </span>
            {liveData && (
              <span style={{
                fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em',
                padding: '2px 6px', borderRadius: 4,
                background: liveData.lmeSource === 'admin-update'
                  ? 'rgba(52,211,153,0.15)' : 'rgba(251,191,36,0.12)',
                color: liveData.lmeSource === 'admin-update' ? '#34d399' : '#fbbf24',
                border: `1px solid ${liveData.lmeSource === 'admin-update' ? 'rgba(52,211,153,0.25)' : 'rgba(251,191,36,0.2)'}`,
              }}>
                {liveData.lmeSource === 'admin-update' ? '✓ LME' : 'COMEX'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {lmeUpdatedAt && (
              <span className="flex items-center gap-1" style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>
                <Clock size={11} />
                {format(lmeUpdatedAt, 'dd MMM, hh:mm a')}
              </span>
            )}
            <button onClick={() => loadLme(true)} disabled={refreshingLme}
              style={{ padding: '5px', borderRadius: 8, background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex',
                color: 'rgba(255,255,255,0.4)', transition: 'all 0.15s' }}>
              <RefreshCw size={13} style={{ animation: refreshingLme ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          </div>
        </div>

        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.09)', background: '#0d1420',
          boxShadow: '0 4px 24px rgba(0,0,0,0.35)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 2fr 1.2fr',
            padding: '10px 16px', background: 'rgba(255,255,255,0.025)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {['Metal', 'LME ($/MT)', 'MCX (₹/kg)', 'Chg%'].map((h, i) => (
              <span key={h} style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)', textAlign: i > 0 ? 'right' : 'left' }}>
                {h}
              </span>
            ))}
          </div>

          {loadingLme ? (
            <div>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} style={{ height: 48, borderBottom: '1px solid rgba(255,255,255,0.04)',
                  background: 'rgba(255,255,255,0.01)', animation: 'pulse 1.5s ease-in-out infinite' }} />
              ))}
            </div>
          ) : (
            <div>
              {lmeRates.map((rate, idx) => {
                const meta = getMeta(rate.metal);
                const up = rate.change > 0, dn = rate.change < 0;
                return (
                  <div key={rate.metal} className="lme-row" style={{
                    display: 'grid', gridTemplateColumns: '2fr 2fr 2fr 1.2fr',
                    padding: '12px 16px', alignItems: 'center',
                    borderBottom: idx < lmeRates.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    transition: 'background 0.15s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: meta.dot }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{rate.metal}</span>
                    </div>
                    <span style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 600,
                      color: 'rgba(255,255,255,0.75)', textAlign: 'right' }}>
                      ${fmt(rate.priceUsd)}
                    </span>
                    <span style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700,
                      color: '#CFB53B', textAlign: 'right' }}>
                      ₹{fmt(rate.priceMcx)}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2,
                      fontSize: 12, fontWeight: 700,
                      color: up ? '#34d399' : dn ? '#f87171' : 'rgba(255,255,255,0.25)' }}>
                      {up ? <ArrowUpRight size={12} /> : dn ? <ArrowDownRight size={12} /> : <Minus size={12} />}
                      {Math.abs(rate.change)}%
                    </div>
                  </div>
                );
              })}
              {lmeRates.length === 0 && (
                <div style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>
                  Live prices unavailable — backend may be offline
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Forex & Indices ─────────────────────────────── */}
      {!loadingLme && hasForex && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Globe size={15} color="#CFB53B" />
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Forex &amp; Indices
              </span>
            </div>
            <div className="flex items-center gap-2">
              {(liveData?.forexUpdatedAt || lmeUpdatedAt) && (
                <span className="flex items-center gap-1" style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>
                  <Clock size={11} />
                  {liveData?.forexUpdatedAt
                    ? format(new Date(liveData.forexUpdatedAt), 'dd MMM, hh:mm a')
                    : format(lmeUpdatedAt, 'dd MMM, hh:mm a')}
                </span>
              )}
              <button onClick={() => loadLme(true)} disabled={refreshingLme}
                style={{ padding: '5px', borderRadius: 8, background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex',
                  color: 'rgba(255,255,255,0.4)' }}>
                <RefreshCw size={13} style={{ animation: refreshingLme ? 'spin 1s linear infinite' : 'none' }} />
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
            {forex.usdInr != null && <ForexCard label="USD/INR" value={fmtNum(forex.usdInr, 3)} change={forex.usdInrChange} highlight />}
            {forex.eurUsd != null && <ForexCard label="EUR/USD" value={fmtNum(forex.eurUsd, 4)} change={forex.eurUsdChange} />}
            {indices.nifty != null && <ForexCard label="Nifty 50" value={fmtNum(indices.nifty, 2)} change={indices.niftyChange} />}
            {indices.sensex != null && <ForexCard label="Sensex" value={fmtNum(indices.sensex, 2)} change={indices.sensexChange} />}
            {crude.price != null && <ForexCard label="Crude WTI" value={`$${fmtNum(crude.price, 2)}`} change={crude.change} />}
          </div>
        </section>
      )}

      {/* ── Local Spot Rates ────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin size={15} color="#CFB53B" />
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Local Spot Rates
            </span>
            {(localRates?.messageTimestampStr || localUpdatedAt) && (
              <span className="flex items-center gap-1" style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>
                <Clock size={10} />
                {localRates?.messageTimestampStr || format(localUpdatedAt, 'dd MMM, hh:mm a')}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {sortedMetals.length > 0 && (
              <button onClick={toggleAll}
                style={{ padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.35)', cursor: 'pointer' }}>
                {closedMetals.size > 0 ? 'Expand All' : 'Collapse All'}
              </button>
            )}
            <button onClick={() => loadLocal(currentHubSlug, true)} disabled={refreshingLocal}
              style={{ padding: '5px', borderRadius: 8, background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex',
                color: 'rgba(255,255,255,0.4)' }}>
              <RefreshCw size={13} style={{ animation: refreshingLocal ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          </div>
        </div>

        {/* City selector pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: 'none' }}>
          {cities.map(city => {
            const active = selectedCity?.id === city.id;
            return (
              <button key={city.id} onClick={() => setSelectedCity(city)}
                style={{
                  flexShrink: 0, padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                  whiteSpace: 'nowrap', transition: 'all 0.15s', cursor: 'pointer',
                  background: active ? '#CFB53B' : 'rgba(255,255,255,0.05)',
                  color: active ? '#000' : 'rgba(255,255,255,0.45)',
                  border: `1px solid ${active ? '#CFB53B' : 'rgba(255,255,255,0.1)'}`,
                }}>
                {city.name}
              </button>
            );
          })}
        </div>

        {selectedCity?.hubs?.[0] && (
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginBottom: 12, marginTop: -8 }}>
            Hub: {selectedCity.hubs[0].name}
          </p>
        )}

        {/* Gated local rates — blurred for non-subscribers */}
        <LocalRatesGate>
          {loadingLocal ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ height: 144, borderRadius: 12,
                  background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)',
                  animation: 'pulse 1.5s ease-in-out infinite' }} />
              ))}
            </div>
          ) : sortedMetals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(255,255,255,0.25)', fontSize: 14 }}>
              No rates available for this hub
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {sortedMetals.map((metalName, idx) => {
                const { metal, grades } = metalGroups[metalName];
                const meta = getMeta(metalName);
                const isOpen = !closedMetals.has(metalName);

                return (
                  <motion.div key={metalName}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.2 }}
                    style={{
                      borderRadius: 12, overflow: 'hidden',
                      border: `1px solid rgba(255,255,255,${isOpen ? '0.1' : '0.07'})`,
                      background: '#0d1420',
                      boxShadow: isOpen ? `0 4px 24px rgba(0,0,0,0.35), 0 0 0 1px ${meta.color}15` : '0 2px 12px rgba(0,0,0,0.25)',
                      transition: 'box-shadow 0.2s, border-color 0.2s',
                    }}
                  >
                    <button onClick={() => toggleMetal(metalName)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 16px', background: 'transparent', border: 'none', cursor: 'pointer',
                        transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 16 }}>{meta.emoji}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em',
                          textTransform: 'uppercase', color: meta.color }}>
                          {metalName}
                        </span>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>
                          {grades.length} grade{grades.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 9, background: 'rgba(207,181,59,0.1)', color: '#CFB53B',
                          padding: '2px 6px', borderRadius: 4, fontWeight: 700, letterSpacing: '0.08em' }}>
                          ₹/KG
                        </span>
                        <ChevronRight size={13} color="rgba(255,255,255,0.2)"
                          style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                      </div>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.18 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div>
                            {grades.map(({ grade, rate }, gi) => {
                              const chgUp = rate.change > 0, chgDn = rate.change < 0;
                              const primary = rate.buyPrice ?? rate.sellPrice;
                              const secondary = rate.buyPrice && rate.sellPrice ? rate.sellPrice : null;
                              return (
                                <div key={grade.id}
                                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                  style={{
                                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                  padding: '10px 16px',
                                  borderTop: gi === 0 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                  borderBottom: gi < grades.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                                  transition: 'background 0.12s',
                                }}>
                                  <div>
                                    <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.88)', margin: 0 }}>
                                      {grade.name}
                                    </p>
                                    {rate.change != null && rate.change !== 0 && (
                                      <p style={{ fontSize: 10, fontWeight: 700, margin: '2px 0 0',
                                        display: 'flex', alignItems: 'center', gap: 2,
                                        color: chgUp ? '#34d399' : '#f87171' }}>
                                        {chgUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                        {Math.abs(rate.change)} today
                                      </p>
                                    )}
                                  </div>
                                  <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700,
                                      color: '#fff', whiteSpace: 'nowrap' }}>
                                      ₹{fmt(primary)}
                                      {secondary && (
                                        <span style={{ color: '#CFB53B' }}> / ₹{fmt(secondary)}</span>
                                      )}
                                    </span>
                                    {rate.variantPrice && (
                                      <p style={{ fontSize: 10, fontFamily: 'monospace', margin: '2px 0 0',
                                        color: 'rgba(207,181,59,0.6)', whiteSpace: 'nowrap' }}>
                                        {rate.variantLabel || 'Variant'}: ₹{fmt(rate.variantPrice)}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </LocalRatesGate>

        <p style={{ textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.18)',
          marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <Zap size={10} />
          Rates from local traders · Auto-refreshes every 5 min
        </p>
      </section>

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        .lme-row:hover { background: rgba(255,255,255,0.025) !important; }
      `}</style>
    </div>
  );
}

// ── Small forex/index card ───────────────────────────────────────────────────
function ForexCard({ label, value, change, highlight }) {
  const up = change > 0, dn = change < 0;
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 10, padding: '10px 14px',
        background: hovered ? (highlight ? 'rgba(207,181,59,0.06)' : 'rgba(255,255,255,0.03)') : '#0d1420',
        border: `1px solid ${highlight ? (hovered ? 'rgba(207,181,59,0.35)' : 'rgba(207,181,59,0.2)') : (hovered ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.07)')}`,
        boxShadow: hovered ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 10px rgba(0,0,0,0.2)',
        transition: 'all 0.15s ease',
        cursor: 'default',
      }}>
      <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
        color: 'rgba(255,255,255,0.3)', margin: '0 0 4px' }}>
        {label}
      </p>
      <p style={{ fontSize: 15, fontWeight: 700, fontFamily: 'monospace', margin: '0 0 2px',
        color: highlight ? '#CFB53B' : '#fff' }}>
        {value}
      </p>
      {change != null && change !== 0 ? (
        <span style={{ fontSize: 11, fontWeight: 700, color: up ? '#34d399' : '#f87171',
          display: 'flex', alignItems: 'center', gap: 2 }}>
          {up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
          {Math.abs(change).toFixed(2)}%
        </span>
      ) : (
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>—</span>
      )}
    </div>
  );
}
