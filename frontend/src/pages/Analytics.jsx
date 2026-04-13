import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ReactApexChart from 'react-apexcharts';
import {
  BarChart3, TrendingUp, TrendingDown, Minus, Lock,
  ArrowUpRight, ArrowDownRight, Activity, Clock, Zap,
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || '';

const METALS = ['Copper', 'Aluminium', 'Zinc', 'Nickel', 'Lead', 'Tin'];
const PERIODS = [
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
];
const METAL_COLORS = {
  Copper: '#E87040', Aluminium: '#8B9DC3', Zinc: '#5B8DEF',
  Nickel: '#34d399', Lead: '#9CA3AF', Tin: '#CFB53B',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n, decimals = 2) =>
  n != null ? n.toLocaleString('en-IN', { maximumFractionDigits: decimals }) : '—';
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

// ── Pro Gate ──────────────────────────────────────────────────────────────────
function ProGate() {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight: 'calc(100vh - 200px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '40px 16px',
    }}>
      <div style={{
        maxWidth: 460, width: '100%', textAlign: 'center', padding: '48px 32px',
        background: '#0D1420', border: '1px solid rgba(255,255,255,0.07)',
        borderTop: '2px solid rgba(207,181,59,0.4)', borderRadius: 20,
      }}>
        <div style={{
          width: 68, height: 68, borderRadius: '50%', margin: '0 auto 24px',
          background: 'rgba(207,181,59,0.08)', border: '1px solid rgba(207,181,59,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Lock size={26} color="#CFB53B" />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 10px', fontFamily: 'monospace' }}>
          Market Intelligence
        </h2>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, margin: '0 0 28px' }}>
          Price trends, buy/sell signals, and market depth are available for Pro subscribers.
        </p>
        <button onClick={() => navigate('/')} style={{
          padding: '13px 32px', borderRadius: 12, fontSize: 14, fontWeight: 700,
          background: '#CFB53B', color: '#000', border: 'none', cursor: 'pointer',
          fontFamily: 'monospace', width: '100%',
        }}>
          Upgrade to Pro — ₹299/mo
        </button>
      </div>
    </div>
  );
}

// ── Signal Card ───────────────────────────────────────────────────────────────
function SignalCard({ label, value, sub, color = '#CFB53B', icon: Icon, trend }) {
  return (
    <div style={{
      background: '#0D1420', border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 16, padding: '20px 22px',
      transition: 'border-color 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)',
        }}>{label}</span>
        {Icon && (
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={14} color={color} />
          </div>
        )}
      </div>
      <p style={{
        fontSize: 26, fontWeight: 700, fontFamily: 'monospace',
        color: '#fff', margin: '0 0 6px', lineHeight: 1,
      }}>{value}</p>
      {sub && (
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', margin: 0 }}>{sub}</p>
      )}
    </div>
  );
}

// ── Activity Bar ─────────────────────────────────────────────────────────────
function ActivityBar({ metal, listings, totalQty, maxListings }) {
  const pct = maxListings > 0 ? Math.round((listings / maxListings) * 100) : 0;
  const mc = METAL_COLORS[metal] || '#CFB53B';
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>{metal}</span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
          {listings} listing{listings !== 1 ? 's' : ''}
          {totalQty > 0 && <span style={{ color: 'rgba(255,255,255,0.25)' }}> · {(totalQty/1000).toFixed(0)}T</span>}
        </span>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: `linear-gradient(90deg, ${mc}, ${mc}88)`,
          borderRadius: 99, transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function Analytics() {
  const { user, subscription } = useAuth();
  const [overview, setOverview] = useState(null);
  const [priceHistory, setPriceHistory] = useState(null);
  const [liveData, setLiveData] = useState(null);
  const [selectedMetal, setSelectedMetal] = useState('Copper');
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);

  const isPro = subscription?.plan === 'pro' || subscription?.plan === 'business';

  // Initial load
  useEffect(() => {
    if (!isPro) { setLoading(false); return; }
    const headers = { Authorization: `Bearer ${localStorage.getItem('mx_token')}` };
    Promise.all([
      fetch(`${API}/api/analytics/overview`, { headers }).then(r => r.json()),
      fetch(`${API}/api/rates/live`).then(r => r.json()),
    ]).then(([ov, live]) => {
      setOverview(ov);
      setLiveData(live);
    }).catch(console.error).finally(() => setLoading(false));
  }, [isPro]);

  // Price history when metal/period changes
  useEffect(() => {
    if (!isPro) return;
    setChartLoading(true);
    const headers = { Authorization: `Bearer ${localStorage.getItem('mx_token')}` };
    fetch(`${API}/api/analytics/price-history?metal=${selectedMetal}&period=${period}`, { headers })
      .then(r => r.json())
      .then(setPriceHistory)
      .catch(console.error)
      .finally(() => setChartLoading(false));
  }, [selectedMetal, period, isPro]);

  if (!user || !isPro) return <ProGate />;
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
      <Activity size={22} color="#CFB53B" style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  // Current metal live data
  const currentMetal = liveData?.metals?.find(m => m.metal === selectedMetal);
  const color = METAL_COLORS[selectedMetal] || '#CFB53B';
  const changeUp = (currentMetal?.change || 0) > 0;
  const changeDn = (currentMetal?.change || 0) < 0;

  // Daily OHLC chart data — LME
  const lmeOHLC = priceHistory?.lme?.[selectedMetal] || [];
  // Range band series: y: [low, high] shows daily volatility
  const lmeRangeSeries = lmeOHLC.map(d => ({
    x: new Date(d.date).getTime(),
    y: [parseFloat(d.low.toFixed(2)), parseFloat(d.high.toFixed(2))],
  }));
  // Close line series: y: close price
  const lmeCloseSeries = lmeOHLC.map(d => ({
    x: new Date(d.date).getTime(),
    y: parseFloat(d.close.toFixed(2)),
  }));

  // Daily OHLC chart data — MCX
  const mcxOHLC = priceHistory?.mcx?.[selectedMetal] || [];
  const mcxRangeSeries = mcxOHLC.map(d => ({
    x: new Date(d.date).getTime(),
    y: [parseFloat(d.low.toFixed(2)), parseFloat(d.high.toFixed(2))],
  }));
  const mcxCloseSeries = mcxOHLC.map(d => ({
    x: new Date(d.date).getTime(),
    y: parseFloat(d.close.toFixed(2)),
  }));

  // Signal computations from close prices
  const closePrices = lmeCloseSeries.map(d => d.y);
  const avg30 = closePrices.length ? closePrices.reduce((a, b) => a + b, 0) / closePrices.length : null;
  const latestPrice = closePrices[closePrices.length - 1] || currentMetal?.priceUsd;
  const vsAvg = avg30 && latestPrice ? ((latestPrice - avg30) / avg30 * 100).toFixed(1) : null;

  // 7-day momentum (last 7 data points)
  const recent7 = closePrices.slice(-7);
  const momentum = recent7.length >= 2
    ? ((recent7[recent7.length - 1] - recent7[0]) / recent7[0] * 100).toFixed(2)
    : null;

  // Today's high/low from latest OHLC day
  const todayOHLC = lmeOHLC[lmeOHLC.length - 1];
  const todayHigh = todayOHLC?.high;
  const todayLow = todayOHLC?.low;

  // Market depth
  const depthData = overview?.marketplace?.volumeByMetal || [];

  // Shared chart base options
  const baseChartOptions = {
    chart: {
      background: 'transparent',
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { enabled: true, easing: 'easeinout', speed: 500 },
      fontFamily: '"JetBrains Mono", monospace',
    },
    theme: { mode: 'dark' },
    grid: {
      borderColor: 'rgba(255,255,255,0.05)',
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    xaxis: {
      type: 'datetime',
      labels: {
        style: { colors: 'rgba(255,255,255,0.3)', fontSize: '10px', fontFamily: 'monospace' },
        datetimeUTC: false,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      crosshairs: {
        show: true,
        stroke: { color: 'rgba(255,255,255,0.18)', width: 1, dashArray: 0 },
      },
      tooltip: { enabled: true, style: { fontSize: '10px', fontFamily: 'monospace' } },
    },
    dataLabels: { enabled: false },
    legend: { show: false },
  };

  // LME combined chart: rangeArea (high/low band) + line (close)
  const lmeChartOptions = {
    ...baseChartOptions,
    chart: { ...baseChartOptions.chart, type: 'rangeArea', stacked: false },
    colors: [`${color}50`, color],   // band is semi-transparent, close is solid
    fill: {
      opacity: [0.25, 1],
    },
    stroke: {
      curve: 'smooth',
      width: [0, 2.5],
      colors: [`${color}00`, color],
    },
    markers: {
      size: [0, 0],
      hover: { size: 5 },
    },
    crosshairs: {
      show: true,
      position: 'front',
      stroke: { color: color, width: 1, dashArray: 4 },
    },
    yaxis: {
      crosshairs: {
        show: true, position: 'front',
        stroke: { color: 'rgba(255,255,255,0.1)', width: 1, dashArray: 3 },
      },
      labels: {
        style: { colors: 'rgba(255,255,255,0.3)', fontSize: '10px', fontFamily: 'monospace' },
        formatter: (v) => `$${v >= 1000 ? (v / 1000).toFixed(1) + 'K' : v?.toFixed(0)}`,
      },
    },
    tooltip: {
      theme: 'dark',
      shared: true,
      x: { format: 'dd MMM yyyy' },
      y: [
        { formatter: (v) => v != null ? `Range: $${fmt(v[0])} – $${fmt(v[1])}` : '' },
        { formatter: (v) => v != null ? `Close: $${fmt(v)} /MT` : '' },
      ],
      style: { fontSize: '11px', fontFamily: 'monospace' },
    },
  };

  // MCX combined chart
  const mcxChartOptions = {
    ...baseChartOptions,
    chart: { ...baseChartOptions.chart, type: 'rangeArea', stacked: false },
    colors: [`#E8CC5A50`, '#E8CC5A'],
    fill: { opacity: [0.22, 1] },
    stroke: { curve: 'smooth', width: [0, 2], colors: [`#E8CC5A00`, '#E8CC5A'] },
    markers: { size: [0, 0], hover: { size: 5 } },
    crosshairs: {
      show: true, position: 'front',
      stroke: { color: '#E8CC5A', width: 1, dashArray: 4 },
    },
    yaxis: {
      ...baseChartOptions.yaxis,
      labels: {
        style: { colors: 'rgba(255,255,255,0.3)', fontSize: '10px', fontFamily: 'monospace' },
        formatter: (v) => `₹${v >= 1000 ? (v / 1000).toFixed(1) + 'K' : v?.toFixed(0)}`,
      },
    },
    tooltip: {
      theme: 'dark', shared: true,
      x: { format: 'dd MMM yyyy' },
      y: [
        { formatter: (v) => v != null ? `Range: ₹${fmt(v[0])} – ₹${fmt(v[1])}` : '' },
        { formatter: (v) => v != null ? `Close: ₹${fmt(v)} /kg` : '' },
      ],
      style: { fontSize: '11px', fontFamily: 'monospace' },
    },
  };

  return (
    <div style={{
      maxWidth: 1100, margin: '0 auto', padding: '24px 16px 100px',
      fontFamily: '"JetBrains Mono", monospace',
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <BarChart3 size={22} color="#CFB53B" />
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: 0 }}>Market Intelligence</h1>
          <span style={{
            fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
            background: 'rgba(52,211,153,0.12)', color: '#34d399', letterSpacing: '0.06em',
          }}>PRO</span>
        </div>
        {liveData?.fetchedAt && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 6px #34d399' }} />
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
              Live · {new Date(liveData.fetchedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}
      </div>

      {/* ── Metal Selector Cards ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 10, marginBottom: 24,
      }}>
        {METALS.map(metal => {
          const m = liveData?.metals?.find(x => x.metal === metal);
          const up = (m?.change || 0) > 0;
          const dn = (m?.change || 0) < 0;
          const active = selectedMetal === metal;
          const mc = METAL_COLORS[metal];
          return (
            <button key={metal} onClick={() => setSelectedMetal(metal)} style={{
              padding: '14px 14px', borderRadius: 14, textAlign: 'left', cursor: 'pointer',
              background: active ? `${mc}12` : 'rgba(13,20,32,0.8)',
              border: `1px solid ${active ? mc : 'rgba(255,255,255,0.07)'}`,
              transition: 'all 0.15s ease',
              boxShadow: active ? `0 0 20px ${mc}20` : 'none',
            }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: active ? mc : 'rgba(255,255,255,0.5)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {metal}
              </p>
              <p style={{ fontSize: 16, fontWeight: 700, fontFamily: 'monospace', color: '#fff', margin: '0 0 4px' }}>
                {m ? `$${fmt(m.priceUsd)}` : '—'}
              </p>
              {m && (
                <span style={{
                  fontSize: 11, fontWeight: 700, fontFamily: 'monospace',
                  color: up ? '#34d399' : dn ? '#f87171' : 'rgba(255,255,255,0.3)',
                  display: 'flex', alignItems: 'center', gap: 2,
                }}>
                  {up ? <ArrowUpRight size={11} /> : dn ? <ArrowDownRight size={11} /> : <Minus size={11} />}
                  {Math.abs(m.change || 0)}%
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Live Price Hero + Period Toggle ── */}
      <div style={{
        background: `linear-gradient(135deg, #0D1420, ${color}08)`,
        border: `1px solid ${color}25`,
        borderRadius: 20, padding: '22px 24px', marginBottom: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {selectedMetal} · LME Spot Price
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
            <span style={{ fontSize: 38, fontWeight: 700, fontFamily: 'monospace', color: '#fff' }}>
              ${fmt(currentMetal?.priceUsd)}
            </span>
            <span style={{
              fontSize: 15, fontWeight: 700, fontFamily: 'monospace',
              color: changeUp ? '#34d399' : changeDn ? '#f87171' : 'rgba(255,255,255,0.3)',
              display: 'flex', alignItems: 'center', gap: 4,
              background: changeUp ? 'rgba(52,211,153,0.1)' : changeDn ? 'rgba(248,113,113,0.1)' : 'rgba(255,255,255,0.05)',
              padding: '4px 10px', borderRadius: 8,
            }}>
              {changeUp ? <ArrowUpRight size={14} /> : changeDn ? <ArrowDownRight size={14} /> : <Minus size={14} />}
              {Math.abs(currentMetal?.change || 0)}%
            </span>
          </div>
          {currentMetal?.priceMcx && (
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '6px 0 0', fontFamily: 'monospace' }}>
              MCX: ₹{fmt(currentMetal.priceMcx)}/kg · USD/INR: {fmt(liveData?.forex?.usdInr)}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {PERIODS.map(p => (
            <button key={p.value} onClick={() => setPeriod(p.value)} style={{
              padding: '7px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700,
              background: period === p.value ? color : 'rgba(255,255,255,0.06)',
              color: period === p.value ? '#000' : 'rgba(255,255,255,0.45)',
              border: 'none', cursor: 'pointer', fontFamily: 'monospace',
              transition: 'all 0.15s',
            }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── LME Price Chart ── */}
      <div style={{
        background: '#0D1420', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 20, padding: '20px 16px 8px', marginBottom: 16, position: 'relative',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px 2px' }}>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
            {selectedMetal} — LME Daily High/Low + Close ($/MT)
          </p>
          {todayOHLC && (
            <div style={{ display: 'flex', gap: 14, fontSize: 11, fontFamily: 'monospace' }}>
              <span style={{ color: '#34d399' }}>H: ${fmt(todayHigh)}</span>
              <span style={{ color: '#f87171' }}>L: ${fmt(todayLow)}</span>
            </div>
          )}
        </div>
        {chartLoading ? (
          <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={20} color={color} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : lmeRangeSeries.length > 1 ? (
          <ReactApexChart
            options={lmeChartOptions}
            series={[
              { name: `${selectedMetal} Daily Range`, type: 'rangeArea', data: lmeRangeSeries },
              { name: `${selectedMetal} Close`, type: 'line', data: lmeCloseSeries },
            ]}
            type="rangeArea" height={300}
          />
        ) : (
          <div style={{ height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <BarChart3 size={28} color="rgba(255,255,255,0.1)" />
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, margin: 0, textAlign: 'center' }}>
              No price history yet.<br />Auto-fetching every 15 min · Paste LME broadcasts in Admin to backfill.
            </p>
          </div>
        )}
      </div>

      {/* ── MCX Chart (if data) ── */}
      {mcxRangeSeries.length > 1 && (
        <div style={{
          background: '#0D1420', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 20, padding: '20px 16px 8px', marginBottom: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px 2px' }}>
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
              {selectedMetal} — MCX Daily High/Low + Close (₹/kg)
            </p>
            {mcxOHLC.length > 0 && (() => {
              const last = mcxOHLC[mcxOHLC.length - 1];
              return (
                <div style={{ display: 'flex', gap: 14, fontSize: 11, fontFamily: 'monospace' }}>
                  <span style={{ color: '#34d399' }}>H: ₹{fmt(last.high)}</span>
                  <span style={{ color: '#f87171' }}>L: ₹{fmt(last.low)}</span>
                </div>
              );
            })()}
          </div>
          <ReactApexChart
            options={mcxChartOptions}
            series={[
              { name: `${selectedMetal} MCX Range`, type: 'rangeArea', data: mcxRangeSeries },
              { name: `${selectedMetal} MCX Close`, type: 'line', data: mcxCloseSeries },
            ]}
            type="rangeArea" height={240}
          />
        </div>
      )}

      {/* ── Signal Cards ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 14, marginBottom: 24,
      }}>
        <SignalCard
          label="vs 30-Day Average"
          value={vsAvg != null ? `${vsAvg > 0 ? '+' : ''}${vsAvg}%` : '—'}
          sub={avg30 ? `30D avg: $${fmt(avg30)}` : 'Not enough data'}
          color={vsAvg > 0 ? '#34d399' : vsAvg < 0 ? '#f87171' : '#CFB53B'}
          icon={vsAvg > 0 ? TrendingUp : TrendingDown}
        />
        <SignalCard
          label="7-Day Momentum"
          value={momentum != null ? `${momentum > 0 ? '+' : ''}${momentum}%` : '—'}
          sub={momentum > 1 ? 'Rising — watch for correction' : momentum < -1 ? 'Falling — potential buy zone' : 'Sideways range'}
          color={momentum > 0 ? '#34d399' : momentum < 0 ? '#f87171' : '#8B9DC3'}
          icon={Zap}
        />
        <SignalCard
          label="Today's High"
          value={todayHigh ? `$${fmt(todayHigh)}` : '—'}
          sub={todayLow ? `Low: $${fmt(todayLow)} · Range: $${fmt(todayHigh - todayLow)}` : 'Daily range not available'}
          color="#34d399"
          icon={TrendingUp}
        />
        <SignalCard
          label="MCX Price"
          value={currentMetal?.priceMcx ? `₹${fmt(currentMetal.priceMcx)}` : '—'}
          sub={currentMetal?.priceMcx ? `Per kg · via USD/INR ${fmt(liveData?.forex?.usdInr, 2)}` : 'No MCX data'}
          color="#E8CC5A"
          icon={Activity}
        />
      </div>

      {/* ── Market Depth + Price Extremes ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 16, marginBottom: 24,
      }}>
        {/* Market Activity */}
        <div style={{
          background: '#0D1420', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 20, padding: '22px 24px',
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)', margin: '0 0 18px' }}>
            Marketplace Activity by Metal
          </p>
          {depthData.length > 0 ? (() => {
            const maxL = Math.max(...depthData.map(d => d.listings));
            return depthData.map(d => (
              <ActivityBar key={d.metal} metal={d.metal} listings={d.listings} totalQty={d.totalQty} maxListings={maxL} />
            ));
          })() : (
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>No active listings yet.</p>
          )}
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', margin: '14px 0 0' }}>
            Bar length = relative listing volume &nbsp;·&nbsp; T = tonnes
          </p>
        </div>

        {/* Price Extremes */}
        <div style={{
          background: '#0D1420', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 20, padding: '22px 24px',
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)', margin: '0 0 18px' }}>
            All-Time High / Low (LME $/MT)
          </p>
          {overview?.priceExtremes && Object.keys(overview.priceExtremes).length > 0 ? (
            METALS.map(metal => {
              const d = overview.priceExtremes[metal];
              if (!d) return null;
              return (
                <div key={metal} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <span style={{ fontSize: 12, color: '#fff', fontWeight: 600, minWidth: 90 }}>{metal}</span>
                  <div style={{ display: 'flex', gap: 18 }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 9, color: '#34d399', margin: '0 0 1px', letterSpacing: '0.06em' }}>HIGH</p>
                      <p style={{ margin: 0, fontSize: 12, fontFamily: 'monospace', color: '#34d399', fontWeight: 700 }}>
                        ${fmt(d.high)}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 9, color: '#f87171', margin: '0 0 1px', letterSpacing: '0.06em' }}>LOW</p>
                      <p style={{ margin: 0, fontSize: 12, fontFamily: 'monospace', color: '#f87171', fontWeight: 700 }}>
                        ${fmt(d.low)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>
              No history yet — paste LME broadcasts in Admin.
            </p>
          )}
        </div>
      </div>

      {/* ── All Metals Live Snapshot ── */}
      {liveData?.metals && (
        <div style={{
          background: '#0D1420', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 20, padding: '22px 24px',
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)', margin: '0 0 16px' }}>
            Live LME Snapshot — Click to Analyse
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
            {liveData.metals.map(m => {
              const up = m.change > 0, dn = m.change < 0;
              const mc = METAL_COLORS[m.metal] || '#CFB53B';
              const active = selectedMetal === m.metal;
              return (
                <div key={m.metal} onClick={() => setSelectedMetal(m.metal)} style={{
                  padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                  background: active ? `${mc}10` : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${active ? `${mc}40` : 'rgba(255,255,255,0.05)'}`,
                  transition: 'all 0.15s',
                }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: active ? mc : 'rgba(255,255,255,0.4)', margin: '0 0 5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {m.metal}
                  </p>
                  <p style={{ fontSize: 17, fontWeight: 700, fontFamily: 'monospace', color: '#fff', margin: '0 0 3px' }}>
                    ${fmt(m.priceUsd)}
                  </p>
                  <span style={{
                    fontSize: 11, fontWeight: 700, fontFamily: 'monospace',
                    color: up ? '#34d399' : dn ? '#f87171' : 'rgba(255,255,255,0.3)',
                    display: 'flex', alignItems: 'center', gap: 2,
                  }}>
                    {up ? <ArrowUpRight size={11} /> : dn ? <ArrowDownRight size={11} /> : <Minus size={11} />}
                    {Math.abs(m.change || 0)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
