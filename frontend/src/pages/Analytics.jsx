import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BarChart3, TrendingUp, TrendingDown, Activity, Package,
  Users, ArrowUpRight, ArrowDownRight, Minus, Lock, DollarSign,
  ShoppingCart, Percent, Clock,
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

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
const PIE_COLORS = ['#E87040', '#CFB53B', '#5B8DEF', '#34d399', '#9CA3AF', '#8B9DC3'];

// ── Styles ────────────────────────────────────────────────────────────────────
const cardStyle = {
  background: '#0D1420', border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 16, padding: '20px 24px',
};
const labelStyle = {
  fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
  letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)', margin: '0 0 4px',
};
const valueStyle = {
  fontSize: 28, fontWeight: 700, color: '#fff', fontFamily: 'monospace', margin: 0,
};
const subStyle = { fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '4px 0 0' };

// ── Format helpers ────────────────────────────────────────────────────────────
const fmt = (n) => n?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) ?? '—';
const fmtCurrency = (n) => {
  if (!n || n === 0) return '₹0';
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${fmt(n)}`;
};
const fmtDate = (d) => {
  const dt = new Date(d);
  return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

// ── Custom tooltip ────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#0D1420', border: '1px solid rgba(207,181,59,0.3)',
      borderRadius: 10, padding: '10px 14px', fontSize: 12, fontFamily: 'monospace',
    }}>
      <p style={{ margin: '0 0 6px', color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: '2px 0', color: p.color, fontWeight: 600 }}>
          {p.name}: ${fmt(p.value)}
        </p>
      ))}
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = '#CFB53B' }) {
  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} color={color} />
        </div>
        <p style={labelStyle}>{label}</p>
      </div>
      <p style={valueStyle}>{value}</p>
      {sub && <p style={subStyle}>{sub}</p>}
    </div>
  );
}

// ── Price Extremes Card ───────────────────────────────────────────────────────
function PriceExtremeRow({ metal, data }) {
  if (!data) return null;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
    }}>
      <span style={{ fontSize: 13, color: '#fff', fontWeight: 600, minWidth: 90 }}>{metal}</span>
      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: 10, color: '#34d399' }}>HIGH</span>
          <p style={{ margin: 0, fontSize: 13, fontFamily: 'monospace', color: '#34d399', fontWeight: 600 }}>
            ${fmt(data.high)}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: 10, color: '#f87171' }}>LOW</span>
          <p style={{ margin: 0, fontSize: 13, fontFamily: 'monospace', color: '#f87171', fontWeight: 600 }}>
            ${fmt(data.low)}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Pro Gate ───────────────────────────────────────────────────────────────────
function ProGate() {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight: 'calc(100vh - 200px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 16px',
    }}>
      <div style={{
        ...cardStyle, maxWidth: 480, textAlign: 'center', padding: '48px 32px',
        borderTop: '2px solid rgba(207,181,59,0.35)',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%', margin: '0 auto 24px',
          background: 'rgba(207,181,59,0.1)', border: '1px solid rgba(207,181,59,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Lock size={28} color="#CFB53B" />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: '0 0 12px' }}>
          Analytics — Pro Feature
        </h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: '0 0 28px' }}>
          Price trends, market intelligence, and deal analytics are available for Pro subscribers.
          Upgrade to unlock powerful trading insights.
        </p>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '14px 32px', borderRadius: 12, fontSize: 14, fontWeight: 700,
            background: '#CFB53B', color: '#000', border: 'none', cursor: 'pointer',
            fontFamily: 'monospace',
          }}
        >
          Upgrade to Pro — ₹299/mo
        </button>
      </div>
    </div>
  );
}

// ── Main Analytics Page ───────────────────────────────────────────────────────
export default function Analytics() {
  const { user, subscription } = useAuth();
  const [overview, setOverview] = useState(null);
  const [priceData, setPriceData] = useState(null);
  const [selectedMetal, setSelectedMetal] = useState('Copper');
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [liveData, setLiveData] = useState(null);

  const isPro = subscription?.plan === 'pro' || subscription?.plan === 'business';

  // Fetch data
  useEffect(() => {
    if (!isPro) { setLoading(false); return; }

    const headers = { Authorization: `Bearer ${localStorage.getItem('mx_token')}` };

    Promise.all([
      fetch(`${API}/api/analytics/overview`, { headers }).then(r => r.json()),
      fetch(`${API}/api/analytics/price-history?period=${period}`, { headers }).then(r => r.json()),
      fetch(`${API}/api/rates/live`).then(r => r.json()),
    ])
      .then(([ov, ph, live]) => {
        setOverview(ov);
        setPriceData(ph);
        setLiveData(live);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isPro, period]);

  // Re-fetch price history when metal/period changes
  useEffect(() => {
    if (!isPro) return;
    const headers = { Authorization: `Bearer ${localStorage.getItem('mx_token')}` };
    fetch(`${API}/api/analytics/price-history?metal=${selectedMetal}&period=${period}`, { headers })
      .then(r => r.json())
      .then(setPriceData)
      .catch(console.error);
  }, [selectedMetal, period, isPro]);

  if (!user) return <ProGate />;
  if (!isPro) return <ProGate />;
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
      <Activity size={24} color="#CFB53B" style={{ animation: 'spin 1s linear infinite' }} />
    </div>
  );

  // Prepare chart data from LME history
  const chartData = priceData?.lme?.[selectedMetal]?.map(d => ({
    date: fmtDate(d.date),
    price: d.price,
    change: d.change,
  })) || [];

  // MCX chart data
  const mcxChartData = priceData?.mcx?.[selectedMetal]?.map(d => ({
    date: fmtDate(d.date),
    price: d.price,
  })) || [];

  // Current live prices
  const currentMetal = liveData?.metals?.find(m => m.metal === selectedMetal);
  const changeUp = currentMetal?.change > 0;
  const changeDn = currentMetal?.change < 0;

  // Marketplace pie data
  const pieData = overview?.marketplace?.volumeByMetal?.map((v, i) => ({
    name: v.metal, value: v.listings, color: PIE_COLORS[i % PIE_COLORS.length],
  })) || [];

  return (
    <div style={{
      maxWidth: 1200, margin: '0 auto', padding: '24px 16px 80px',
      fontFamily: '"JetBrains Mono", monospace',
    }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Page Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <BarChart3 size={24} color="#CFB53B" />
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: 0 }}>Analytics</h1>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
            background: 'rgba(52,211,153,0.15)', color: '#34d399',
          }}>PRO</span>
        </div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
          Market trends, price analytics, and trading insights
        </p>
      </div>

      {/* ── Live Price Card ── */}
      {currentMetal && (
        <div style={{
          ...cardStyle, marginBottom: 24,
          background: 'linear-gradient(135deg, rgba(13,20,32,0.9), rgba(207,181,59,0.05))',
          borderTop: '2px solid rgba(207,181,59,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={labelStyle}>Live {selectedMetal} Price</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <p style={{ ...valueStyle, fontSize: 36 }}>${fmt(currentMetal.priceUsd)}</p>
                <span style={{
                  fontSize: 16, fontWeight: 700, fontFamily: 'monospace',
                  color: changeUp ? '#34d399' : changeDn ? '#f87171' : 'rgba(255,255,255,0.3)',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  {changeUp ? <ArrowUpRight size={16} /> : changeDn ? <ArrowDownRight size={16} /> : <Minus size={16} />}
                  {Math.abs(currentMetal.change || 0)}%
                </span>
              </div>
              {currentMetal.priceMcx && (
                <p style={subStyle}>MCX: ₹{fmt(currentMetal.priceMcx)}/kg</p>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={12} color="rgba(255,255,255,0.3)" />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                {liveData?.fetchedAt ? new Date(liveData.fetchedAt).toLocaleTimeString('en-IN') : '—'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Metal Selector + Period ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {METALS.map(m => (
            <button key={m} onClick={() => setSelectedMetal(m)} style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: selectedMetal === m ? 'rgba(207,181,59,0.15)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${selectedMetal === m ? 'rgba(207,181,59,0.4)' : 'rgba(255,255,255,0.08)'}`,
              color: selectedMetal === m ? '#CFB53B' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer', fontFamily: 'monospace',
            }}>
              {m}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {PERIODS.map(p => (
            <button key={p.value} onClick={() => setPeriod(p.value)} style={{
              padding: '6px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700,
              background: period === p.value ? '#CFB53B' : 'rgba(255,255,255,0.06)',
              color: period === p.value ? '#000' : 'rgba(255,255,255,0.4)',
              border: 'none', cursor: 'pointer', fontFamily: 'monospace',
            }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── LME Price Chart ── */}
      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <p style={{ ...labelStyle, marginBottom: 16 }}>{selectedMetal} — LME Price Trend ($/MT)</p>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={METAL_COLORS[selectedMetal] || '#CFB53B'} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={METAL_COLORS[selectedMetal] || '#CFB53B'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} domain={['auto', 'auto']} />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone" dataKey="price" name={selectedMetal}
                stroke={METAL_COLORS[selectedMetal] || '#CFB53B'}
                fill="url(#goldGrad)" strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
              No price data available for this period. Admin needs to paste LME broadcasts to build history.
            </p>
          </div>
        )}
      </div>

      {/* ── MCX Price Chart ── */}
      {mcxChartData.length > 0 && (
        <div style={{ ...cardStyle, marginBottom: 24 }}>
          <p style={{ ...labelStyle, marginBottom: 16 }}>{selectedMetal} — MCX Price Trend (₹/Kg)</p>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={mcxChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} domain={['auto', 'auto']} />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone" dataKey="price" name="MCX"
                stroke="#E8CC5A" strokeWidth={2} dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Stats Grid ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16, marginBottom: 24,
      }}>
        <StatCard
          icon={ShoppingCart} label="Active Listings"
          value={overview?.marketplace?.activeListings ?? '—'}
          sub={`${overview?.marketplace?.verifiedListings ?? 0} verified`}
        />
        <StatCard
          icon={Activity} label="Total Deals"
          value={overview?.marketplace?.totalDeals ?? '—'}
          sub={`${overview?.marketplace?.activeDeals ?? 0} active`}
          color="#5B8DEF"
        />
        <StatCard
          icon={DollarSign} label="Platform GMV"
          value={fmtCurrency(overview?.marketplace?.gmv)}
          sub={`Commission: ${fmtCurrency(overview?.marketplace?.totalCommission)}`}
          color="#34d399"
        />
        <StatCard
          icon={Percent} label="Deal Close Rate"
          value={`${overview?.marketplace?.closeRate ?? 0}%`}
          sub={`Avg deal: ${fmtCurrency(overview?.marketplace?.avgDealSize)}`}
          color="#E87040"
        />
        <StatCard
          icon={Users} label="Registered Users"
          value={overview?.users?.total ?? '—'}
          sub={`${overview?.users?.verified ?? 0} KYC verified`}
          color="#8B9DC3"
        />
        <StatCard
          icon={Package} label="Completed Deals"
          value={overview?.marketplace?.completedDeals ?? '—'}
          sub={`of ${overview?.marketplace?.totalDeals ?? 0} total`}
          color="#CFB53B"
        />
      </div>

      {/* ── Bottom Row: Volume by Metal + Price Extremes ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 16, marginBottom: 24,
      }}>
        {/* Volume by Metal */}
        <div style={cardStyle}>
          <p style={{ ...labelStyle, marginBottom: 16 }}>Listings by Metal</p>
          {pieData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                    outerRadius={70} innerRadius={40} paddingAngle={2}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {pieData.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: d.color }} />
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{d.name}</span>
                    <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#fff', fontWeight: 600 }}>
                      {d.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>No listing data yet</p>
          )}
        </div>

        {/* Price Extremes */}
        <div style={cardStyle}>
          <p style={{ ...labelStyle, marginBottom: 12 }}>LME All-Time High / Low ($/MT)</p>
          {overview?.priceExtremes && Object.keys(overview.priceExtremes).length > 0 ? (
            METALS.map(m => (
              <PriceExtremeRow key={m} metal={m} data={overview.priceExtremes[m]} />
            ))
          ) : (
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
              No historical data yet. Build history by pasting LME broadcasts in Admin.
            </p>
          )}
        </div>
      </div>

      {/* ── Latest LME Snapshot ── */}
      {liveData?.metals && (
        <div style={{ ...cardStyle, marginBottom: 24 }}>
          <p style={{ ...labelStyle, marginBottom: 16 }}>Current LME Snapshot</p>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12,
          }}>
            {liveData.metals.map(m => {
              const up = m.change > 0;
              const dn = m.change < 0;
              return (
                <div key={m.metal} style={{
                  padding: '14px 16px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                  cursor: 'pointer',
                  ...(selectedMetal === m.metal ? { borderColor: 'rgba(207,181,59,0.3)', background: 'rgba(207,181,59,0.05)' } : {}),
                }}
                  onClick={() => setSelectedMetal(m.metal)}
                >
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', margin: '0 0 6px' }}>
                    {m.metal}
                  </p>
                  <p style={{ fontSize: 18, fontWeight: 700, fontFamily: 'monospace', color: '#fff', margin: '0 0 4px' }}>
                    ${fmt(m.priceUsd)}
                  </p>
                  <span style={{
                    fontSize: 12, fontWeight: 700, fontFamily: 'monospace',
                    color: up ? '#34d399' : dn ? '#f87171' : 'rgba(255,255,255,0.3)',
                    display: 'flex', alignItems: 'center', gap: 3,
                  }}>
                    {up ? <ArrowUpRight size={12} /> : dn ? <ArrowDownRight size={12} /> : <Minus size={12} />}
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
