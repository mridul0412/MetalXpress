import React, { useState, useEffect } from 'react';
import { fetchAlerts, createAlert, deleteAlert, fetchMetals, fetchCities } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Alerts() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState([]);
  const [metals, setMetals] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    gradeId: '', hubId: '', threshold: '', direction: 'above'
  });
  const [selectedMetalId, setSelectedMetalId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return; // wait for auth to resolve
    if (!user) { navigate('/login'); return; }
    loadAlerts();
    fetchMetals().then(r => setMetals(r.data || [])).catch(console.error);
    fetchCities().then(r => setCities(r.data || [])).catch(console.error);
  }, [user, authLoading]);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetchAlerts();
      setAlerts(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedMetal = metals.find(m => m.id === selectedMetalId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await createAlert(form);
      setShowCreate(false);
      setForm({ gradeId: '', hubId: '', threshold: '', direction: 'above' });
      setSelectedMetalId('');
      loadAlerts();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create alert');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAlert(id);
      setAlerts(alerts.filter(a => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen pb-16 sm:pb-0">
      <main className="max-w-2xl mx-auto px-3 pt-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-white">Price Alerts</h1>
            <p className="text-xs text-gray-500">Get notified when rates hit your target</p>
          </div>
          <button onClick={() => setShowCreate(!showCreate)} className="btn-primary">
            + New Alert
          </button>
        </div>

        {/* Create alert form */}
        {showCreate && (
          <div className="bg-surface border border-border rounded-xl p-4 mb-4">
            <h3 className="text-white font-bold mb-3">Create Price Alert</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Metal</label>
                <select
                  value={selectedMetalId}
                  onChange={e => { setSelectedMetalId(e.target.value); setForm({...form, gradeId: ''}); }}
                  className="input-field text-xs"
                  required
                >
                  <option value="">Select metal</option>
                  {metals.map(m => <option key={m.id} value={m.id}>{m.emoji} {m.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Grade *</label>
                <select
                  value={form.gradeId}
                  onChange={e => setForm({...form, gradeId: e.target.value})}
                  className="input-field text-xs"
                  required
                  disabled={!selectedMetal}
                >
                  <option value="">Select grade</option>
                  {selectedMetal?.grades?.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Hub / Market *</label>
                <select
                  value={form.hubId}
                  onChange={e => setForm({...form, hubId: e.target.value})}
                  className="input-field text-xs"
                  required
                >
                  <option value="">Select hub</option>
                  {cities.flatMap(c => c.hubs?.map(h => (
                    <option key={h.id} value={h.id}>{c.name} — {h.name}</option>
                  )) || [])}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Alert when price is *</label>
                  <select
                    value={form.direction}
                    onChange={e => setForm({...form, direction: e.target.value})}
                    className="input-field text-xs"
                  >
                    <option value="above">Above ▲</option>
                    <option value="below">Below ▼</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Threshold (₹/kg) *</label>
                  <input
                    type="number"
                    value={form.threshold}
                    onChange={e => setForm({...form, threshold: e.target.value})}
                    placeholder="1200"
                    className="input-field text-xs"
                    required
                    min="1"
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-xs">{error}</p>}
              <div className="flex gap-2">
                <button type="submit" disabled={submitting} className="btn-primary flex-1">
                  {submitting ? 'Saving...' : 'Create Alert'}
                </button>
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Alerts list */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2].map(i => <div key={i} className="skeleton h-16 rounded-lg" />)}
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🔔</div>
            <p className="text-white font-semibold mb-1">No alerts set</p>
            <p className="text-gray-500 text-sm">Create alerts to get notified when scrap rates hit your target price.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.map(alert => (
              <div key={alert.id} className="bg-surface border border-border rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-semibold">
                        {alert.grade?.metal?.emoji} {alert.grade?.name}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        alert.isActive ? 'bg-green-900/30 text-green-400' : 'bg-gray-900 text-gray-500'
                      }`}>
                        {alert.isActive ? 'Active' : 'Triggered'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {alert.hub?.city?.name} — {alert.hub?.name}
                    </div>
                    <div className="text-xs mt-1">
                      <span className="text-gray-400">Alert when </span>
                      <span className={alert.direction === 'above' ? 'text-up' : 'text-down'}>
                        {alert.direction === 'above' ? '▲ above' : '▼ below'}
                      </span>
                      <span className="text-white font-bold ml-1">
                        ₹{alert.threshold.toLocaleString('en-IN')}
                      </span>
                    </div>
                    {alert.triggeredAt && (
                      <div className="text-[10px] text-gray-600 mt-1">
                        Triggered: {new Date(alert.triggeredAt).toLocaleString('en-IN')}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(alert.id)}
                    className="text-gray-600 hover:text-red-500 text-sm p-1"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
