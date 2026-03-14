import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import MarketplaceListing from '../components/MarketplaceListing';
import { fetchListings, createListing, deleteListing, fetchMetals, fetchCities } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Marketplace() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [metals, setMetals] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filterMetal, setFilterMetal] = useState('');
  const [filterCity, setFilterCity] = useState('');

  // Create form state
  const [form, setForm] = useState({
    metalId: '', gradeId: '', qty: '', unit: 'kg',
    location: '', price: '', description: '', contact: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
    fetchMetals().then(r => setMetals(r.data || [])).catch(console.error);
    fetchCities().then(r => setCities(r.data || [])).catch(console.error);
  }, [filterMetal, filterCity]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterMetal) params.metalId = filterMetal;
      if (filterCity) params.city = filterCity;
      const res = await fetchListings(params);
      setListings(res.data.listings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedMetal = metals.find(m => m.id === form.metalId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setSubmitting(true);
    setError('');
    try {
      await createListing({
        ...form,
        qty: parseFloat(form.qty),
        price: form.price ? parseFloat(form.price) : null,
        gradeId: form.gradeId || null,
      });
      setShowCreate(false);
      setForm({ metalId: '', gradeId: '', qty: '', unit: 'kg', location: '', price: '', description: '', contact: '' });
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post listing');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteListing(id);
      setListings(listings.filter(l => l.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-bg pb-16 sm:pb-0">
      <Navbar />
      <main className="max-w-2xl mx-auto px-3 pt-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-white">Scrap Marketplace</h1>
            <p className="text-xs text-gray-500">Buy & sell scrap metal directly</p>
          </div>
          <button
            onClick={() => user ? setShowCreate(!showCreate) : navigate('/login')}
            className="btn-primary"
          >
            + Post Lot
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
          <select
            value={filterMetal}
            onChange={e => setFilterMetal(e.target.value)}
            className="input-field w-auto text-xs"
          >
            <option value="">All Metals</option>
            {metals.map(m => <option key={m.id} value={m.id}>{m.emoji} {m.name}</option>)}
          </select>
          <select
            value={filterCity}
            onChange={e => setFilterCity(e.target.value)}
            className="input-field w-auto text-xs"
          >
            <option value="">All Cities</option>
            {cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>

        {/* Create listing form */}
        {showCreate && (
          <div className="bg-surface border border-border rounded-xl p-4 mb-4">
            <h3 className="text-white font-bold mb-3">Post a Scrap Lot</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Metal *</label>
                  <select
                    value={form.metalId}
                    onChange={e => setForm({...form, metalId: e.target.value, gradeId: ''})}
                    className="input-field text-xs"
                    required
                  >
                    <option value="">Select metal</option>
                    {metals.map(m => <option key={m.id} value={m.id}>{m.emoji} {m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Grade</label>
                  <select
                    value={form.gradeId}
                    onChange={e => setForm({...form, gradeId: e.target.value})}
                    className="input-field text-xs"
                    disabled={!selectedMetal}
                  >
                    <option value="">Any grade</option>
                    {selectedMetal?.grades?.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Quantity *</label>
                  <input type="number" value={form.qty} onChange={e => setForm({...form, qty: e.target.value})}
                    placeholder="500" className="input-field text-xs" required min="1" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Unit</label>
                  <select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} className="input-field text-xs">
                    <option value="kg">kg</option>
                    <option value="MT">MT</option>
                    <option value="pieces">pieces</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Location (City, Area) *</label>
                <input type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})}
                  placeholder="Mandoli, Delhi" className="input-field text-xs" required />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Price/kg (₹)</label>
                  <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                    placeholder="Optional" className="input-field text-xs" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Contact * </label>
                  <input type="tel" value={form.contact} onChange={e => setForm({...form, contact: e.target.value})}
                    placeholder="9876543210" className="input-field text-xs" required />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="Quality details, availability, etc."
                  className="input-field text-xs resize-none" rows={2} />
              </div>

              {error && <p className="text-red-500 text-xs">{error}</p>}
              <div className="flex gap-2">
                <button type="submit" disabled={submitting} className="btn-primary flex-1">
                  {submitting ? 'Posting...' : 'Post Listing'}
                </button>
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Listings */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-surface rounded-lg border border-border p-4">
                <div className="skeleton h-4 w-2/3 mb-2" />
                <div className="skeleton h-3 w-1/2 mb-3" />
                <div className="skeleton h-8 w-24" />
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🏪</div>
            <p className="text-gray-500 text-sm">No listings yet. Be the first to post!</p>
          </div>
        ) : (
          listings.map(listing => (
            <MarketplaceListing
              key={listing.id}
              listing={listing}
              onDelete={user && listing.userId === user.id ? handleDelete : null}
            />
          ))
        )}
      </main>
    </div>
  );
}
