import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import {
  fetchAdminDashboard, adminParsePreview, saveParsedRates,
  fetchRateHistory, fetchContributors, createContributor,
  saveLMEOverride, saveMCXOverride, fetchCities
} from '../utils/api';

const TABS = ['Dashboard', 'Local Rates', 'LME/MCX Update', 'Rate History', 'Contributors'];

export default function Admin() {
  const [authed, setAuthed] = useState(() => {
    return !!localStorage.getItem('mx_admin_pass');
  });
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('Dashboard');

  // Dashboard
  const [dashboard, setDashboard] = useState(null);

  // Paste rates
  const [rawMessage, setRawMessage] = useState('');
  const [parsed, setParsed] = useState(null);
  const [selectedHub, setSelectedHub] = useState('mandoli-delhi');
  const [cities, setCities] = useState([]);
  const [parseLoading, setParseLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveResult, setSaveResult] = useState(null);

  // Rate history
  const [history, setHistory] = useState([]);

  // Contributors
  const [contributors, setContributors] = useState([]);
  const [newContrib, setNewContrib] = useState({ name: '', phone: '', cityId: '' });

  // LME override
  const [lmeRates, setLmeRates] = useState('');
  const [mcxRates, setMcxRates] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    localStorage.setItem('mx_admin_pass', password);
    setAuthed(true);
    setPassword('');
  };

  useEffect(() => {
    if (!authed) return;
    fetchCities().then(r => setCities(r.data || [])).catch(console.error);
  }, [authed]);

  useEffect(() => {
    if (!authed) return;
    if (activeTab === 'Dashboard') loadDashboard();
    if (activeTab === 'Rate History') loadHistory();
    if (activeTab === 'Contributors') loadContributors();
  }, [activeTab, authed]);

  const loadDashboard = async () => {
    try {
      const res = await fetchAdminDashboard();
      setDashboard(res.data);
    } catch (err) {
      if (err.response?.status === 403) {
        localStorage.removeItem('mx_admin_pass');
        setAuthed(false);
      }
    }
  };

  const loadHistory = async () => {
    try {
      const res = await fetchRateHistory({ limit: 30 });
      setHistory(res.data || []);
    } catch (err) { console.error(err); }
  };

  const loadContributors = async () => {
    try {
      const res = await fetchContributors();
      setContributors(res.data || []);
    } catch (err) { console.error(err); }
  };

  const handleParse = async () => {
    if (!rawMessage.trim()) return;
    setParseLoading(true);
    setParsed(null);
    setSaveResult(null);
    try {
      const res = await adminParsePreview(rawMessage);
      setParsed(res.data.parsed);
    } catch (err) {
      console.error(err);
    } finally {
      setParseLoading(false);
    }
  };

  const handleSaveParsed = async () => {
    if (!parsed) return;
    setSaveLoading(true);
    try {
      const res = await saveParsedRates({
        hubSlug: selectedHub,
        rawMessage,
        parsed,
      });
      setSaveResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCreateContributor = async (e) => {
    e.preventDefault();
    try {
      await createContributor(newContrib);
      setNewContrib({ name: '', phone: '', cityId: '' });
      loadContributors();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLMESave = async () => {
    try {
      const rates = lmeRates.trim().split('\n').map(line => {
        const [metal, price, change] = line.split(',').map(s => s.trim());
        return { metal, price: parseFloat(price), change: parseFloat(change || 0) };
      }).filter(r => r.metal && !isNaN(r.price));
      await saveLMEOverride(rates);
      alert(`Saved ${rates.length} LME rates`);
    } catch (err) { console.error(err); }
  };

  const handleMCXSave = async () => {
    try {
      const rates = mcxRates.trim().split('\n').map(line => {
        const [metal, price, change] = line.split(',').map(s => s.trim());
        return { metal, price: parseFloat(price), change: parseFloat(change || 0) };
      }).filter(r => r.metal && !isNaN(r.price));
      await saveMCXOverride(rates);
      alert(`Saved ${rates.length} MCX rates`);
    } catch (err) { console.error(err); }
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-bg flex flex-col">
        <div className="px-4 py-4 border-b flex items-center gap-2"
          style={{ borderColor: '#CFB53B22' }}>
          <span className="text-lg">⚡</span>
          <span className="font-bold text-gold text-base">MetalXpress</span>
          <span className="text-gray-600 text-xs ml-1">· Admin</span>
        </div>
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-sm">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4"
                style={{ background: '#1A1500', border: '1px solid #CFB53B33' }}>
                <span className="text-2xl">⚙️</span>
              </div>
              <h1 className="text-lg font-bold text-white">Admin Panel</h1>
              <p className="text-gray-600 text-xs mt-1">Restricted access — enter password to continue</p>
            </div>
            <div className="rounded-2xl p-6 border" style={{ background: '#141414', borderColor: '#CFB53B22' }}>
              <form onSubmit={handleLogin}>
                <label className="text-xs text-gray-500 font-semibold mb-2 block uppercase tracking-wide">
                  Admin Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field mb-4"
                  autoFocus
                  required
                />
                <button type="submit" className="btn-primary w-full py-3">
                  Access Admin Panel →
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg pb-20 sm:pb-4">
      <Navbar />
      <main className="max-w-4xl mx-auto px-3 pt-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              <span className="text-gold">⚙️</span> Admin Panel
            </h1>
            <p className="text-[10px] text-gray-600 mt-0.5">Manage rates and platform data</p>
          </div>
          <button
            onClick={() => { localStorage.removeItem('mx_admin_pass'); setAuthed(false); }}
            className="text-xs text-gray-600 hover:text-red-400 transition-colors border border-transparent hover:border-red-900 px-2 py-1 rounded"
          >
            Logout Admin
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto scrollbar-hide mb-4 pb-1">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-gold text-black'
                  : 'bg-surface text-gray-400 hover:text-white border border-border hover:border-border-light'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {activeTab === 'Dashboard' && (
          <div>
            {dashboard ? (
              <>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: 'Users', value: dashboard.stats?.users, icon: '👤' },
                    { label: 'Listings', value: dashboard.stats?.listings, icon: '📦' },
                    { label: 'Alerts', value: dashboard.stats?.alerts, icon: '🔔' },
                  ].map(stat => (
                    <div key={stat.label} className="bg-surface border border-border rounded-lg p-3 text-center">
                      <div className="text-xl mb-1">{stat.icon}</div>
                      <div className="text-xl font-bold text-white">{stat.value}</div>
                      <div className="text-xs text-gray-500">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <h3 className="text-white font-bold mb-2 text-sm">Cities & Last Update</h3>
                <div className="space-y-2">
                  {dashboard.cities?.map(city => (
                    <div key={city.id} className="bg-surface border border-border rounded-lg p-3">
                      <div className="text-sm font-semibold text-white mb-1">{city.name}</div>
                      {city.hubs?.map(hub => {
                        const lastUpdate = hub.rateUpdates?.[0];
                        return (
                          <div key={hub.id} className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">{hub.name}</span>
                            <span className={lastUpdate ? 'text-green-400' : 'text-gray-600'}>
                              {lastUpdate
                                ? new Date(lastUpdate.createdAt).toLocaleString('en-IN')
                                : 'No rates yet'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="skeleton h-40 rounded-lg" />
            )}
          </div>
        )}

        {/* Local Rates — WhatsApp Parser for hub rates only */}
        {activeTab === 'Local Rates' && (
          <div className="space-y-4">
            <div className="rounded-xl p-3 border text-xs text-gray-500"
              style={{ background: '#0D1200', borderColor: '#CFB53B22' }}>
              ⚡ Paste a WhatsApp rate message below. The parser will extract <strong className="text-gold">local hub rates only</strong> (Copper, Brass, Aluminium etc.). LME/MCX rates in the message are ignored here — update those in the <strong className="text-gold">LME/MCX Update</strong> tab.
            </div>

            <div className="flex items-center gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Target Hub</label>
                <select
                  value={selectedHub}
                  onChange={e => setSelectedHub(e.target.value)}
                  className="input-field text-xs w-auto"
                >
                  {cities.flatMap(c => c.hubs?.map(h => (
                    <option key={h.slug} value={h.slug}>{c.name} — {h.name}</option>
                  )) || [])}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1.5 block font-semibold uppercase tracking-wide">
                WhatsApp Rate Message
              </label>
              <textarea
                value={rawMessage}
                onChange={e => setRawMessage(e.target.value)}
                placeholder="Paste the full WhatsApp rate message here...&#10;&#10;Example:&#10;🥇 COPPER&#10;Armature Bhatti: 1140 / 1230&#10;Armature Plant: 1142 / 1232&#10;..."
                className="input-field resize-none text-xs font-mono"
                rows={14}
              />
            </div>

            <button
              onClick={handleParse}
              disabled={!rawMessage.trim() || parseLoading}
              className="btn-primary"
            >
              {parseLoading ? '⏳ Parsing...' : '🔍 Parse Local Rates'}
            </button>

            {/* Parsed preview */}
            {parsed && (
              <div className="rounded-xl p-4 border" style={{ background: '#0A1A0A', borderColor: '#166534' }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-green-400 font-bold text-sm">
                    ✅ Parsed — Confidence: {parsed.confidence}%
                  </h3>
                  <div className="flex items-center gap-2">
                    {!saveResult && (
                      <button
                        onClick={handleSaveParsed}
                        disabled={saveLoading}
                        className="text-xs bg-green-900/40 border border-green-700 text-green-400 px-3 py-1.5 rounded-lg font-bold hover:bg-green-900/60 transition-colors"
                      >
                        {saveLoading ? 'Saving...' : '💾 Save Rates'}
                      </button>
                    )}
                    {saveResult && (
                      <span className="text-green-400 text-xs font-bold">
                        ✅ Saved {saveResult.savedRates} rates
                      </span>
                    )}
                  </div>
                </div>

                {parsed.metals?.length === 0 && (
                  <div className="text-yellow-500 text-xs mb-2">
                    ⚠️ No local metal rates found. Check the message format.
                  </div>
                )}

                {parsed.metals?.map((section, i) => (
                  <div key={i} className="mb-3">
                    <div className="text-gold font-bold text-xs mb-1 uppercase">{section.metal}</div>
                    {section.rates?.map((r, j) => (
                      <div key={j} className="flex items-center gap-3 text-xs py-0.5 border-b border-green-900/30 last:border-0">
                        <span className="text-gray-300 w-36 truncate">{r.gradeName}</span>
                        <span className="text-up font-semibold">{r.buyPrice || '—'}</span>
                        {r.sellPrice && <span className="text-gray-400">/ {r.sellPrice}</span>}
                        {r.variantPrice && (
                          <span className="text-zinc text-[10px]">
                            ({r.variantLabel}: {r.variantPrice})
                          </span>
                        )}
                        <span className="text-gray-600 text-[10px] ml-auto">
                          {Math.round(r.confidence * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                ))}

                {parsed.unparsedLines?.length > 0 && (
                  <div className="mt-3 border-t border-green-900/30 pt-2">
                    <div className="text-yellow-500 text-xs font-bold mb-1">
                      ⚠️ Could not parse ({parsed.unparsedLines.length} lines):
                    </div>
                    {parsed.unparsedLines.map((u, i) => (
                      <div key={i} className="text-xs text-gray-600 font-mono">{u.line}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Rate History */}
        {activeTab === 'Rate History' && (
          <div className="space-y-2">
            {history.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No rate updates yet</p>
            ) : (
              history.map(update => (
                <div key={update.id} className="bg-surface border border-border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm font-semibold">
                      {update.hub?.city?.name} — {update.hub?.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(update.createdAt).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {update.rates?.length} rates · By: {update.contributor?.name || 'Manual'}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Contributors */}
        {activeTab === 'Contributors' && (
          <div className="space-y-4">
            <form onSubmit={handleCreateContributor} className="bg-surface border border-border rounded-lg p-3">
              <h3 className="text-white font-bold text-sm mb-3">Add Contributor</h3>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input
                  type="text" value={newContrib.name}
                  onChange={e => setNewContrib({...newContrib, name: e.target.value})}
                  placeholder="Name" className="input-field text-xs" required
                />
                <input
                  type="tel" value={newContrib.phone}
                  onChange={e => setNewContrib({...newContrib, phone: e.target.value})}
                  placeholder="Phone" className="input-field text-xs"
                />
              </div>
              <select
                value={newContrib.cityId}
                onChange={e => setNewContrib({...newContrib, cityId: e.target.value})}
                className="input-field text-xs mb-2" required
              >
                <option value="">Select city</option>
                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <button type="submit" className="btn-primary text-xs">Add Contributor</button>
            </form>

            <div className="space-y-2">
              {contributors.map(c => (
                <div key={c.id} className="bg-surface border border-border rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <span className="text-white text-sm">{c.name}</span>
                    <div className="text-xs text-gray-500">{c.city?.name} {c.phone && `· ${c.phone}`}</div>
                  </div>
                  {c.isVerified && <span className="text-xs text-green-400">✓ Verified</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LME/MCX Update */}
        {activeTab === 'LME/MCX Update' && (
          <div className="space-y-4">
            <div className="rounded-xl p-3 border text-xs text-gray-500"
              style={{ background: '#0D0D1A', borderColor: '#4A90D933' }}>
              📊 Paste the full WhatsApp message to auto-extract LME + MCX + Forex rates, or manually enter them below in CSV format.
            </div>

            {/* Quick paste — extract LME/MCX from WhatsApp message */}
            <div className="bg-surface border border-border rounded-xl p-4">
              <h3 className="text-white font-bold text-sm mb-1">Quick Update from WhatsApp Message</h3>
              <p className="text-xs text-gray-500 mb-3">
                Paste the full Metal Steel Xpress message — only LME/MCX/Forex sections will be extracted and saved.
              </p>
              <textarea
                value={lmeRates.startsWith('PASTE:') ? lmeRates.slice(6) : ''}
                onChange={e => setLmeRates('PASTE:' + e.target.value)}
                placeholder="Paste full WhatsApp message here (LME/MCX/Forex will be extracted)..."
                className="input-field resize-none text-xs font-mono mb-3"
                rows={10}
              />
              <button
                onClick={async () => {
                  const msg = lmeRates.startsWith('PASTE:') ? lmeRates.slice(6) : '';
                  if (!msg.trim()) return;
                  try {
                    const res = await (await import('../utils/api')).adminParsePreview(msg);
                    const p = res.data.parsed;
                    const lme = p.lme || [];
                    const mcx = p.mcx || [];
                    const forex = [...(p.forex || []), ...(p.indices || [])];
                    if (lme.length > 0) await (await import('../utils/api')).saveLMEOverride(lme);
                    if (mcx.length > 0) await (await import('../utils/api')).saveMCXOverride(mcx);
                    alert(`✅ Saved: ${lme.length} LME, ${mcx.length} MCX, ${forex.length} Forex rates`);
                    setLmeRates('');
                  } catch (err) {
                    alert('Error: ' + (err.response?.data?.error || err.message));
                  }
                }}
                disabled={!lmeRates.startsWith('PASTE:') || lmeRates.length < 10}
                className="btn-primary text-xs"
              >
                📥 Extract & Save LME/MCX/Forex
              </button>
            </div>

            <div className="text-xs text-gray-600 text-center">— or update manually —</div>

            <div className="bg-surface border border-border rounded-xl p-4">
              <h3 className="text-white font-bold text-sm mb-1">Manual LME Override <span className="text-gray-600 font-normal text-xs">($/MT)</span></h3>
              <p className="text-xs text-gray-500 mb-2">One per line: Metal, Price, Change</p>
              <textarea
                value={lmeRates.startsWith('PASTE:') ? '' : lmeRates}
                onChange={e => setLmeRates(e.target.value)}
                placeholder="Copper, 12746.5, -100&#10;Aluminium, 3414.5, 41&#10;Nickel, 17245, -196&#10;Lead, 1886.5, -46&#10;Zinc, 3270, -33"
                className="input-field resize-none text-xs font-mono mb-2"
                rows={6}
              />
              <button onClick={handleLMESave} className="btn-primary text-xs">Save LME Rates</button>
            </div>

            <div className="bg-surface border border-border rounded-xl p-4">
              <h3 className="text-white font-bold text-sm mb-1">Manual MCX Override <span className="text-gray-600 font-normal text-xs">(₹/Kg)</span></h3>
              <p className="text-xs text-gray-500 mb-2">One per line: Metal, Price, Change</p>
              <textarea
                value={mcxRates}
                onChange={e => setMcxRates(e.target.value)}
                placeholder="Copper, 1172.65, -14.75&#10;Aluminium, 343.35, -2.75&#10;Nickel, 1561, -12.9&#10;Lead, 186.05, -2.55&#10;Zinc, 321.8, -2.65"
                className="input-field resize-none text-xs font-mono mb-2"
                rows={6}
              />
              <button onClick={handleMCXSave} className="btn-primary text-xs">Save MCX Rates</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
