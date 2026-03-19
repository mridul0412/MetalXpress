import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, MapPin, Clock, RefreshCw, ArrowUpRight, ArrowDownRight, Minus, ChevronRight, Zap } from 'lucide-react';
import { format } from 'date-fns';

const METAL_META = {
  Copper:        { color: '#f59e0b', dot: '#f59e0b', emoji: '🥇' },
  Brass:         { color: '#eab308', dot: '#eab308', emoji: '🟡' },
  Aluminium:     { color: '#94a3b8', dot: '#94a3b8', emoji: '🥈' },
  Lead:          { color: '#6b7280', dot: '#6b7280', emoji: '⚫' },
  Zinc:          { color: '#60a5fa', dot: '#60a5fa', emoji: '🔵' },
  Nickel:        { color: '#a78bfa', dot: '#a78bfa', emoji: '⚡' },
  'Other Metals':{ color: '#fb923c', dot: '#fb923c', emoji: '⚙️' },
  'M.S.':        { color: '#818cf8', dot: '#818cf8', emoji: '🏗️' },
};
const METAL_ORDER = ['Copper','Brass','Aluminium','Lead','Zinc','Nickel','Other Metals','M.S.'];

function getMeta(metal) {
  return METAL_META[metal] ?? { color: '#CFB53B', dot: '#CFB53B', emoji: '⚙️' };
}

function fmt(n) { return Number(n).toLocaleString('en-IN'); }

export default function Home() {
  const [lmeRates, setLmeRates]           = useState([]);
  const [localRates, setLocalRates]       = useState(null);
  const [hubs, setHubs]                   = useState([]);
  const [selectedHub, setSelectedHub]     = useState('');
  const [openMetal, setOpenMetal]         = useState(null);
  const [loadingLme, setLoadingLme]       = useState(true);
  const [loadingLocal, setLoadingLocal]   = useState(false);
  const [refreshingLme, setRefreshingLme] = useState(false);
  const [refreshingLocal, setRefreshingLocal] = useState(false);
  const [lmeUpdatedAt, setLmeUpdatedAt]   = useState(null);
  const [localUpdatedAt, setLocalUpdatedAt] = useState(null);

  // Fetch live LME rates
  const loadLme = useCallback(async (force = false) => {
    if (force) setRefreshingLme(true); else setLoadingLme(true);
    try {
      const r = await fetch('/api/rates/live');
      const d = await r.json();
      if (d.rates?.length) {
        setLmeRates(d.rates);
        setLmeUpdatedAt(new Date());
      }
    } catch {}
    finally { setLoadingLme(false); setRefreshingLme(false); }
  }, []);

  // Fetch hubs list
  useEffect(() => {
    fetch('/api/cities')
      .then(r => r.json())
      .then(d => {
        const cities = Array.isArray(d) ? d : (d.cities || []);
        const allHubs = cities.flatMap(c => c.hubs || []);
        setHubs(allHubs);
        if (allHubs.length) setSelectedHub(allHubs[0].slug);
      })
      .catch(() => {});
    loadLme();
  }, [loadLme]);

  // Fetch local rates when hub changes
  const loadLocal = useCallback(async (hubSlug, isRefresh = false) => {
    if (!hubSlug) return;
    if (isRefresh) setRefreshingLocal(true); else setLoadingLocal(true);
    try {
      const r = await fetch(`/api/rates/local?hub=${hubSlug}`);
      const d = await r.json();
      setLocalRates(d);
      setLocalUpdatedAt(new Date());
    } catch {}
    finally { setLoadingLocal(false); setRefreshingLocal(false); }
  }, []);

  useEffect(() => {
    if (selectedHub) loadLocal(selectedHub);
  }, [selectedHub, loadLocal]);

  // Group local rates by metal
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-5 pb-24 md:pb-8 flex flex-col gap-6">

      {/* ── LME / MCX Table ─────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={15} color="#CFB53B" />
            <span className="section-label" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>LME / MCX Rates</span>
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

        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', background: '#0d1420' }}>
          {/* Header row */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 2fr 1.2fr',
            padding: '10px 16px', background: 'rgba(255,255,255,0.025)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {['Metal','LME ($/MT)','MCX (₹/kg)','Chg%'].map((h, i) => (
              <span key={h} style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)', textAlign: i > 0 ? 'right' : 'left' }}>
                {h}
              </span>
            ))}
          </div>

          {loadingLme ? (
            <div style={{ padding: '0' }}>
              {[1,2,3,4,5].map(i => (
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
                  <div key={rate.metal} style={{
                    display: 'grid', gridTemplateColumns: '2fr 2fr 2fr 1.2fr',
                    padding: '12px 16px', alignItems: 'center',
                    borderBottom: idx < lmeRates.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
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
            </div>
          )}
        </div>
      </section>

      {/* ── Local Spot Rates ────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin size={15} color="#CFB53B" />
            <span className="section-label" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Local Spot Rates</span>
            {localUpdatedAt && (
              <span className="flex items-center gap-1" style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>
                <Clock size={10} />
                {format(localUpdatedAt, 'hh:mm a')}
              </span>
            )}
          </div>
          <button onClick={() => loadLocal(selectedHub, true)} disabled={refreshingLocal}
            style={{ padding: '5px', borderRadius: 8, background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex',
              color: 'rgba(255,255,255,0.4)' }}>
            <RefreshCw size={13} style={{ animation: refreshingLocal ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </div>

        {/* Hub selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: 'none' }}>
          {hubs.map(hub => {
            const active = selectedHub === hub.slug;
            return (
              <button key={hub.slug} onClick={() => setSelectedHub(hub.slug)}
                style={{
                  flexShrink: 0, padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                  whiteSpace: 'nowrap', transition: 'all 0.15s', cursor: 'pointer',
                  background: active ? '#CFB53B' : 'rgba(255,255,255,0.05)',
                  color: active ? '#000' : 'rgba(255,255,255,0.45)',
                  border: `1px solid ${active ? '#CFB53B' : 'rgba(255,255,255,0.1)'}`,
                }}>
                {hub.name}
              </button>
            );
          })}
        </div>

        {/* Metal accordion cards */}
        {loadingLocal ? (
          <div className="flex flex-col gap-3">
            {[1,2,3,4].map(i => (
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
              const isOpen = openMetal === null || openMetal === metalName;

              return (
                <motion.div key={metalName}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04, duration: 0.2 }}
                  style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', background: '#0d1420' }}
                >
                  {/* Metal header button */}
                  <button onClick={() => setOpenMetal(openMetal === metalName ? null : metalName)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px', background: 'transparent', border: 'none', cursor: 'pointer',
                      transition: 'background 0.15s' }}>
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

                  {/* Grades */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        style={{ overflow: 'hidden' }}
                      >
                        {/* Column headers */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto',
                          padding: '6px 16px', background: 'rgba(255,255,255,0.02)',
                          borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                            letterSpacing: '0.1em', color: 'rgba(255,255,255,0.2)' }}>Grade</span>
                          <div style={{ display: 'flex', gap: 24 }}>
                            <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                              letterSpacing: '0.1em', color: 'rgba(255,255,255,0.2)', width: 72, textAlign: 'right' }}>Buy</span>
                            <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                              letterSpacing: '0.1em', color: 'rgba(255,255,255,0.2)', width: 72, textAlign: 'right' }}>Sell</span>
                          </div>
                        </div>

                        <div>
                          {grades.map(({ grade, rate }, gi) => {
                            const chgUp = rate.change > 0, chgDn = rate.change < 0;
                            return (
                              <div key={grade.id} style={{
                                display: 'grid', gridTemplateColumns: '1fr auto',
                                padding: '10px 16px', alignItems: 'center',
                                borderBottom: gi < grades.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
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
                                <div style={{ display: 'flex', gap: 24 }}>
                                  <span style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700,
                                    color: '#fff', width: 72, textAlign: 'right' }}>
                                    ₹{fmt(rate.buyPrice ?? rate.sellPrice)}
                                  </span>
                                  <span style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 600,
                                    color: rate.sellPrice ? '#CFB53B' : 'rgba(255,255,255,0.15)',
                                    width: 72, textAlign: 'right' }}>
                                    {rate.sellPrice ? `₹${fmt(rate.sellPrice)}` : '—'}
                                  </span>
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

        <p style={{ textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.18)',
          marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <Zap size={10} />
          Rates from local traders · Updated daily
        </p>
      </section>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
      `}</style>
    </div>
  );
}
