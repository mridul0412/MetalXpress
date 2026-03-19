import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Edit3, Save, ClipboardPaste, ChevronLeft, LogOut } from 'lucide-react';
import { adminParsePreview, saveParsedRates } from '../utils/api';

const ADMIN_PASS_KEY = 'mx_admin_pass';

// ── Standalone layout — no consumer Navbar ───────────────────────────────────

export default function Admin() {
  const [pass, setPass]           = useState('');
  const [authed, setAuthed]       = useState(!!localStorage.getItem(ADMIN_PASS_KEY));
  const [authError, setAuthError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (pass === (import.meta.env.VITE_ADMIN_PASSWORD || 'admin123')) {
      localStorage.setItem(ADMIN_PASS_KEY, pass);
      setAuthed(true);
    } else {
      setAuthError('Wrong password.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_PASS_KEY);
    setAuthed(false);
    setPass('');
  };

  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', background: '#080E1A', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: 16 }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          style={{ width: '100%', maxWidth: 400, borderRadius: 24, padding: 32,
            background: 'rgba(13,20,32,0.9)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)', borderTop: '2px solid rgba(248,113,113,0.4)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, margin: '0 auto 16px',
              background: 'rgba(207,181,59,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={24} color="#CFB53B" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: 0 }}>Admin Access</h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: '6px 0 0' }}>
              Restricted terminal for rate management
            </p>
          </div>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input type="password" value={pass} onChange={e => setPass(e.target.value)}
              placeholder="Admin Password" required autoFocus
              style={{ width: '100%', padding: '13px 16px', borderRadius: 12, fontSize: 15,
                fontFamily: 'monospace', textAlign: 'center', letterSpacing: '0.2em',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
            {authError && (
              <p style={{ fontSize: 13, color: '#f87171', textAlign: 'center', margin: 0 }}>{authError}</p>
            )}
            <button type="submit" style={{ width: '100%', padding: '13px', borderRadius: 12, fontWeight: 700,
              fontSize: 14, background: '#CFB53B', color: '#000', border: 'none', cursor: 'pointer' }}>
              Unlock Terminal
            </button>
            <p style={{ fontSize: 11, textAlign: 'center', color: 'rgba(255,255,255,0.2)', margin: 0 }}>
              Demo: admin123
            </p>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080E1A' }}>

      {/* ── Admin top bar ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(8,14,26,0.95)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 16px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', height: 56,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Left: logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#CFB53B',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900,
              fontSize: 13, color: '#000', letterSpacing: '-0.02em' }}>
              MX
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)',
              letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              MetalXpress Admin
            </span>
          </div>

          {/* Right: actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px',
              borderRadius: 8, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              textDecoration: 'none', transition: 'all 0.15s' }}>
              <ChevronLeft size={14} />
              Exit to App
            </a>
            <button onClick={handleLogout}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px',
                borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#f87171',
                background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
                cursor: 'pointer', transition: 'all 0.15s' }}>
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* ── Page body ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 16px 80px' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>
            Rate Management
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
            Update market prices · Changes reflect live on the app
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          <LocalRatesPanel />
          <WhatsAppParserPanel />
        </div>
      </div>
    </div>
  );
}

// ── Local Rates Panel ────────────────────────────────────────────────────────

function LocalRatesPanel() {
  const [message, setMessage]         = useState('');
  const [preview, setPreview]         = useState(null);
  const [parsing, setParsing]         = useState(false);
  const [saving, setSaving]           = useState(false);
  const [status, setStatus]           = useState('');
  const [cities, setCities]           = useState([]);
  const [selectedHub, setSelectedHub] = useState('');
  const [selectedHubName, setSelectedHubName] = useState('');

  // Load cities for hub selector
  useEffect(() => {
    fetch('/api/cities')
      .then(r => r.json())
      .then(d => {
        const list = Array.isArray(d) ? d : (d.cities || []);
        setCities(list);
        // Default to first hub
        const firstHub = list[0]?.hubs?.[0];
        if (firstHub) {
          setSelectedHub(firstHub.slug);
          setSelectedHubName(firstHub.name);
        }
      })
      .catch(() => {});
  }, []);

  const handleHubChange = (e) => {
    const slug = e.target.value;
    setSelectedHub(slug);
    // Find hub name
    for (const city of cities) {
      for (const hub of (city.hubs || [])) {
        if (hub.slug === slug) {
          setSelectedHubName(`${hub.name} — ${city.name}`);
          return;
        }
      }
    }
    setSelectedHubName(slug);
  };

  const handleParse = async () => {
    if (!message.trim()) return;
    setParsing(true); setStatus('');
    try {
      const res = await adminParsePreview(message);
      setPreview(res.data?.parsed || res.data);
    } catch { setStatus('Parse failed.'); }
    finally { setParsing(false); }
  };

  const handleSave = async () => {
    if (!preview || !selectedHub) return;
    setSaving(true); setStatus('');
    try {
      await saveParsedRates({ hubSlug: selectedHub, rawMessage: message, parsed: preview });
      setStatus(`✓ Rates updated for ${selectedHubName} — reflecting live on the app`);
      setMessage(''); setPreview(null);
      // Auto-clear success message after 3s
      setTimeout(() => setStatus(''), 3000);
    } catch { setStatus('Save failed.'); }
    finally { setSaving(false); }
  };

  const metalCount = preview?.metals?.reduce((s, m) => s + (m.rates?.length || 0), 0) || 0;

  return (
    <Panel title="Local Rates Parser" subtitle="Paste WhatsApp message for local hub rates">

      {/* Hub selector */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
          color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 6 }}>
          Target Hub
        </label>
        <select value={selectedHub} onChange={handleHubChange}
          style={{ width: '100%', padding: '10px 12px', borderRadius: 10, fontSize: 13,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
            color: '#fff', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
          {cities.map(city =>
            (city.hubs || []).map(hub => (
              <option key={hub.slug} value={hub.slug}
                style={{ background: '#0d1420', color: '#fff' }}>
                {city.name} — {hub.name}
              </option>
            ))
          )}
        </select>
      </div>

      <textarea value={message} onChange={e => setMessage(e.target.value)}
        placeholder={'COPPER\nArmature: 358 / 370\nMotor: 340 / 355\n\nALUMINIUM\nCast: 155 / 160'}
        rows={7}
        style={{ width: '100%', padding: '12px', borderRadius: 10, fontSize: 12, fontFamily: 'monospace',
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
          color: '#fff', outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6 }} />

      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button onClick={handleParse} disabled={parsing || !message.trim()} style={btnStyle('#CFB53B', '#000', parsing)}>
          {parsing ? 'Parsing…' : 'Parse Message'}
        </button>
        {preview && (
          <button onClick={handleSave} disabled={saving} style={btnStyle('rgba(255,255,255,0.1)', '#fff', saving)}>
            <Save size={13} style={{ display: 'inline', marginRight: 4 }} />
            {saving ? 'Saving…' : `Save ${metalCount} rates`}
          </button>
        )}
      </div>

      {preview?.metals?.length > 0 && (
        <div style={{ marginTop: 12, borderRadius: 10, overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.07)' }}>
          {preview.metals.map((section) => (
            <div key={section.metal} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ padding: '6px 12px', background: 'rgba(207,181,59,0.08)',
                fontSize: 11, fontWeight: 700, color: '#CFB53B', textTransform: 'uppercase',
                letterSpacing: '0.06em' }}>
                {section.metal}
              </div>
              {section.rates?.map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px',
                  fontSize: 12, borderBottom: i < section.rates.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)' }}>{r.gradeName}</span>
                  <span style={{ color: '#fff', fontFamily: 'monospace', fontWeight: 600 }}>
                    ₹{r.buyPrice} {r.sellPrice ? `/ ₹${r.sellPrice}` : ''}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {status && (
        <p style={{ fontSize: 13, color: status.startsWith('✓') ? '#34d399' : '#f87171',
          marginTop: 8, fontWeight: 600 }}>{status}</p>
      )}
    </Panel>
  );
}

// ── WhatsApp LME/MCX Parser Panel ────────────────────────────────────────────

function WhatsAppParserPanel() {
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [status, setStatus]   = useState('');

  const handleParse = async () => {
    if (!message.trim()) return;
    setParsing(true); setStatus('');
    try {
      const res = await adminParsePreview(message);
      setPreview(res.data?.parsed || res.data);
    } catch { setStatus('Parse failed.'); }
    finally { setParsing(false); }
  };

  const lmeCount = preview?.lme?.length  || 0;
  const mcxCount = preview?.mcx?.length  || 0;
  const fxCount  = (preview?.forex?.length || 0) + (preview?.indices?.length || 0);

  return (
    <Panel title="LME / MCX Update" subtitle="Paste full WhatsApp broadcast to extract global rates">
      <textarea value={message} onChange={e => setMessage(e.target.value)}
        placeholder={'Paste the full Metal Steel Xpress WhatsApp message here…'}
        rows={7}
        style={{ width: '100%', padding: '12px', borderRadius: 10, fontSize: 12, fontFamily: 'monospace',
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
          color: '#fff', outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6 }} />

      <button onClick={handleParse} disabled={parsing || !message.trim()}
        style={{ ...btnStyle('#CFB53B', '#000', parsing), marginTop: 8 }}>
        <ClipboardPaste size={13} style={{ display: 'inline', marginRight: 4 }} />
        {parsing ? 'Extracting…' : 'Extract Rates'}
      </button>

      {preview && (lmeCount > 0 || mcxCount > 0 || fxCount > 0) && (
        <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { label: 'LME metals',  count: lmeCount, color: '#60a5fa' },
            { label: 'MCX metals',  count: mcxCount, color: '#CFB53B' },
            { label: 'Forex/Index', count: fxCount,  color: '#34d399' },
          ].map(({ label, count, color }) => count > 0 && (
            <div key={label} style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: `${color}15`, color, border: `1px solid ${color}30` }}>
              {count} {label}
            </div>
          ))}
        </div>
      )}

      {status && (
        <p style={{ fontSize: 13, color: status.startsWith('✓') ? '#34d399' : '#f87171',
          marginTop: 8, fontWeight: 600 }}>{status}</p>
      )}
    </Panel>
  );
}

// ── Shared components ────────────────────────────────────────────────────────

function Panel({ title, subtitle, children }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
      borderRadius: 16, padding: 20,
      background: 'rgba(13,20,32,0.8)', backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
    }}>
      <h3 style={{ fontSize: 17, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>{title}</h3>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '0 0 16px' }}>{subtitle}</p>
      {children}
    </motion.div>
  );
}

function btnStyle(bg, color, disabled) {
  return {
    padding: '9px 16px', borderRadius: 10, fontWeight: 700, fontSize: 13,
    background: bg, color, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1, transition: 'all 0.15s', display: 'inline-flex',
    alignItems: 'center',
  };
}
