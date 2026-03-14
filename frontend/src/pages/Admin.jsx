import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import {
  fetchAdminDashboard, adminParsePreview, saveParsedRates,
  fetchRateHistory, fetchContributors, createContributor,
  saveLMEOverride, saveMCXOverride, fetchCities
} from '../utils/api';

const TABS = ['Dashboard', 'Paste Rates', 'Rate History', 'Contributors', 'LME/MCX Override'];

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
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="text-3xl mb-2">⚙️</div>
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          </div>
          <div className="bg-surface border border-border rounded-xl p-6">
            <form onSubmit={handleLogin}>
              <label className="text-xs text-gray-500 mb-1 block">Admin Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="admin123"
                className="input-field mb-4"
                required
              />
              <button type="submit" className="btn-primary w-full">Access Admin</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg pb-16 sm:pb-0">
      <Navbar />
      <main className="max-w-4xl mx-auto px-3 pt-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold text-white">⚙️ Admin Panel</h1>
          <button
            onClick={() => { localStorage.removeItem('mx_admin_pass'); setAuthed(false); }}
            className="text-xs text-gray-500 hover:text-red-500"
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
              className={`px-3 py-1.5 text-xs font-semibold rounded whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-[#4A90D9] text-white'
                  : 'bg-surface text-gray-400 hover:text-white border border-border'
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

        {/* Paste Rates */}
        {activeTab === 'Paste Rates' && (
          <div className="space-y-4">
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

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Paste WhatsApp Rate Message</label>
              <textarea
                value={rawMessage}
                onChange={e => setRawMessage(e.target.value)}
                placeholder="Paste the full WhatsApp rate message here..."
                className="input-field resize-none text-xs"
                rows={12}
              />
            </div>

            <button
              onClick={handleParse}
              disabled={!rawMessage.trim() || parseLoading}
              className="btn-primary"
            >
              {parseLoading ? 'Parsing...' : '🔍 Parse Message'}
            </button>

            {/* Parsed preview */}
            {parsed && (
              <div className="bg-[#0A1A0A] border border-green-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-green-400 font-bold text-sm">
                    ✅ Parsed — Confidence: {parsed.confidence}%
                  </h3>
                  {!saveResult && (
                    <button
                      onClick={handleSaveParsed}
                      disabled={saveLoading}
                      className="text-xs bg-green-900/40 border border-green-700 text-green-400 px-3 py-1.5 rounded font-semibold hover:bg-green-900/60"
                    >
                      {saveLoading ? 'Saving...' : '💾 Confirm & Save'}
                    </button>
                  )}
                  {saveResult && (
                    <span className="text-green-400 text-xs">
                      ✅ Saved {saveResult.savedRates} rates
                    </span>
                  )}
                </div>

                <div className="text-xs text-gray-400 mb-2">
                  City: {parsed.cityHub?.city} | Hub: {parsed.cityHub?.hub}
                </div>

                {parsed.metals?.map((section, i) => (
                  <div key={i} className="mb-3">
                    <div className="text-yellow-400 font-bold text-xs mb-1">{section.metal}</div>
                    {section.rates?.map((r, j) => (
                      <div key={j} className="flex items-center gap-3 text-xs py-0.5">
                        <span className="text-gray-400 w-32 truncate">{r.gradeName}</span>
                        {r.buyPrice && <span className="text-green-400">{r.buyPrice}</span>}
                        {r.sellPrice && <span className="text-gray-400">/ {r.sellPrice}</span>}
                        {r.variantPrice && (
                          <span className="text-blue-400 text-[10px]">
                            ({r.variantLabel}: {r.variantPrice})
                          </span>
                        )}
                        <span className="text-gray-700 text-[10px]">
                          {Math.round(r.confidence * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                ))}

                {parsed.lme?.length > 0 && (
                  <div className="mt-2">
                    <div className="text-blue-400 font-bold text-xs mb-1">LME Rates</div>
                    {parsed.lme.map((r, i) => (
                      <div key={i} className="text-xs text-gray-400">
                        {r.metal}: {r.price} ({r.change > 0 ? '+' : ''}{r.change})
                      </div>
                    ))}
                  </div>
                )}

                {parsed.unparsedLines?.length > 0 && (
                  <div className="mt-2">
                    <div className="text-red-400 text-xs font-bold">Unparsed lines:</div>
                    {parsed.unparsedLines.map((u, i) => (
                      <div key={i} className="text-xs text-gray-600">{u.line}</div>
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

        {/* LME/MCX Override */}
        {activeTab === 'LME/MCX Override' && (
          <div className="space-y-4">
            <div className="bg-surface border border-border rounded-lg p-4">
              <h3 className="text-white font-bold text-sm mb-2">LME Rates Override</h3>
              <p className="text-xs text-gray-500 mb-2">One per line: Metal, Price, Change (e.g. Copper, 13141.5, -69)</p>
              <textarea
                value={lmeRates}
                onChange={e => setLmeRates(e.target.value)}
                placeholder="Copper, 13141.5, -69&#10;Aluminium, 3332, 22&#10;Nickel, 17505, -196"
                className="input-field resize-none text-xs mb-2"
                rows={8}
              />
              <button onClick={handleLMESave} className="btn-primary text-xs">Save LME Rates</button>
            </div>

            <div className="bg-surface border border-border rounded-lg p-4">
              <h3 className="text-white font-bold text-sm mb-2">MCX Rates Override</h3>
              <p className="text-xs text-gray-500 mb-2">One per line: Metal, Price, Change (e.g. Copper, 1206, 12.55)</p>
              <textarea
                value={mcxRates}
                onChange={e => setMcxRates(e.target.value)}
                placeholder="Copper, 1206, 12.55&#10;Aluminium, 333.6, -2.35&#10;Nickel, 1586.5, 0.3"
                className="input-field resize-none text-xs mb-2"
                rows={8}
              />
              <button onClick={handleMCXSave} className="btn-primary text-xs">Save MCX Rates</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
