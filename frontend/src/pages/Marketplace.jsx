import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Weight, Plus, Search, Filter, ShieldCheck, Tag } from 'lucide-react';
import { fetchListings, createListing } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const METALS = ['Copper','Aluminium','Brass','Lead','Zinc','Nickel'];

export default function Marketplace() {
  const [tab, setTab]               = useState('browse');
  const [listings, setListings]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filterMetal, setFilterMetal] = useState('');
  const [filterCity, setFilterCity]   = useState('');
  const { user } = useAuth();

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchListings({ metal: filterMetal || undefined, city: filterCity || undefined });
      setListings(res.data?.listings || res.data || []);
    } catch { setListings([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filterMetal, filterCity]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-5 pb-24 md:pb-8">
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
              Scrap <span style={{ color: '#CFB53B' }}>Marketplace</span>
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: '2px 0 0' }}>
              Direct buyer/seller matching
            </p>
          </div>

          {/* Tab toggle */}
          <div style={{ display: 'flex', padding: 4, borderRadius: 12, background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)' }}>
            {[['browse','Browse'],['post','Post Listing']].map(([val, label]) => (
              <button key={val} onClick={() => setTab(val)} style={{
                padding: '7px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                transition: 'all 0.15s', border: 'none', cursor: 'pointer',
                background: tab === val ? '#CFB53B' : 'transparent',
                color: tab === val ? '#000' : 'rgba(255,255,255,0.4)',
              }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      {tab === 'browse' ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap',
            padding: 16, borderRadius: 14, background: 'rgba(13,20,32,0.8)',
            border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ flex: 1, minWidth: 140, position: 'relative' }}>
              <Filter size={14} color="rgba(255,255,255,0.3)" style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <select value={filterMetal} onChange={e => setFilterMetal(e.target.value)} style={{
                width: '100%', padding: '9px 12px 9px 34px', borderRadius: 10, fontSize: 13,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: filterMetal ? '#fff' : 'rgba(255,255,255,0.4)', outline: 'none', appearance: 'none' }}>
                <option value="">All Metals</option>
                {METALS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 140, position: 'relative' }}>
              <MapPin size={14} color="rgba(255,255,255,0.3)" style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input type="text" placeholder="Filter by city…" value={filterCity}
                onChange={e => setFilterCity(e.target.value)} style={{
                  width: '100%', padding: '9px 12px 9px 34px', borderRadius: 10, fontSize: 13,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ height: 160, borderRadius: 14, background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)', animation: 'pulse 1.5s ease-in-out infinite' }} />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 0', borderRadius: 16,
              background: 'rgba(13,20,32,0.6)', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <Search size={40} color="rgba(255,255,255,0.15)" style={{ margin: '0 auto 14px', display: 'block' }} />
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>No listings found</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
                Try adjusting your filters or be the first to post.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {listings.map((item, idx) => (
                <ListingCard key={item.id} item={item} delay={idx * 0.04} />
              ))}
            </div>
          )}
        </motion.div>
      ) : (
        <PostForm onSuccess={() => { setTab('browse'); load(); }} />
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}

function ListingCard({ item, delay }) {
  const isBuy = item.listingType === 'buy';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.2 }}
      style={{ borderRadius: 14, padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        background: 'rgba(13,20,32,0.8)', backdropFilter: 'blur(20px)',
        border: `1px solid ${item.isVerified ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.08)'}`,
        transition: 'border-color 0.15s' }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                color: '#CFB53B' }}>
                {item.metal?.name || item.metalType}
              </span>
              <span style={{
                fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                padding: '1px 5px', borderRadius: 4,
                background: isBuy ? 'rgba(96,165,250,0.12)' : 'rgba(52,211,153,0.12)',
                color: isBuy ? '#60a5fa' : '#34d399',
                border: `1px solid ${isBuy ? 'rgba(96,165,250,0.25)' : 'rgba(52,211,153,0.25)'}`,
              }}>
                {isBuy ? 'BUY' : 'SELL'}
              </span>
              {item.isVerified && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 9, fontWeight: 700,
                  color: '#34d399', padding: '1px 5px', borderRadius: 4,
                  background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
                  <ShieldCheck size={9} /> Verified
                </span>
              )}
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>
              {item.grade?.name || item.grade || 'Mixed'}
            </h3>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', display: 'block' }}>
              {isBuy ? 'Willing to pay' : 'Asking price'}
            </span>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>
              {(item.price || item.priceExpectation) ? `₹${(item.price || item.priceExpectation).toLocaleString('en-IN')}` : 'Negotiate'}
            </span>
          </div>
        </div>
        {item.description && (
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: '0 0 12px',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {item.description}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Weight size={12} />
            {(item.qty || item.quantity || 0).toLocaleString('en-IN')} kg
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <MapPin size={12} />
            {item.location || item.city}
          </span>
        </div>
        <a href={`tel:${item.contact || item.contactNumber}`} style={{
          display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 700,
          color: '#CFB53B', background: 'rgba(207,181,59,0.1)', padding: '6px 12px',
          borderRadius: 8, textDecoration: 'none', border: '1px solid rgba(207,181,59,0.2)',
        }}>
          <Phone size={13} /> Call
        </a>
      </div>
    </motion.div>
  );
}

function PostForm({ onSuccess }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    metalType: 'Copper', grade: '', quantity: '', city: '', hub: '',
    priceExpectation: '', contactNumber: '', description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 16px', borderRadius: 16,
        background: 'rgba(13,20,32,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>Sign in required</h3>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: '0 0 20px' }}>
          You must be logged in to post a listing.
        </p>
        <button onClick={() => navigate('/login')} style={{
          padding: '12px 28px', borderRadius: 12, fontWeight: 700, fontSize: 14,
          background: '#CFB53B', color: '#000', border: 'none', cursor: 'pointer' }}>
          Go to Login
        </button>
      </div>
    );
  }

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      await createListing({
        ...form,
        quantity: Number(form.quantity),
        priceExpectation: Number(form.priceExpectation),
      });
      onSuccess();
    } catch { setError('Failed to post listing. Try again.'); }
    finally { setSubmitting(false); }
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: 10, fontSize: 13,
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff', outline: 'none', boxSizing: 'border-box', transition: 'border 0.15s',
  };
  const labelStyle = {
    fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em',
    color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 6,
  };

  return (
    <motion.form initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      style={{ maxWidth: 640, margin: '0 auto', padding: 24, borderRadius: 18,
        background: 'rgba(13,20,32,0.9)', border: '1px solid rgba(255,255,255,0.08)',
        borderTop: '2px solid rgba(207,181,59,0.3)', boxShadow: '0 16px 48px rgba(0,0,0,0.4)' }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 20px',
        paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        New Market Listing
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={labelStyle}>Metal Type *</label>
          <select value={form.metalType} onChange={set('metalType')} required style={{ ...inputStyle, appearance: 'none' }}>
            {METALS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Grade *</label>
          <input type="text" value={form.grade} onChange={set('grade')}
            placeholder="e.g. Armature, Super D" required style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Quantity (kg) *</label>
          <input type="number" value={form.quantity} onChange={set('quantity')}
            placeholder="1000" min="1" required style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Price (₹/kg) *</label>
          <input type="number" value={form.priceExpectation} onChange={set('priceExpectation')}
            placeholder="850" min="1" required style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>City *</label>
          <input type="text" value={form.city} onChange={set('city')}
            placeholder="New Delhi" required style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Hub/Area *</label>
          <input type="text" value={form.hub} onChange={set('hub')}
            placeholder="Mandoli" required style={inputStyle} />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Contact Number *</label>
          <input type="tel" value={form.contactNumber} onChange={set('contactNumber')}
            placeholder="9876543210" required style={inputStyle} />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Details</label>
          <textarea value={form.description} onChange={set('description')} rows={3}
            placeholder="Condition, origin, availability…"
            style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }} />
        </div>
      </div>

      {error && (
        <p style={{ fontSize: 13, color: '#f87171', marginTop: 12, fontWeight: 600 }}>{error}</p>
      )}

      <button type="submit" disabled={submitting} style={{
        width: '100%', marginTop: 20, padding: '14px', borderRadius: 12, fontWeight: 700, fontSize: 15,
        background: '#CFB53B', color: '#000', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        boxShadow: '0 4px 16px rgba(207,181,59,0.25)', opacity: submitting ? 0.6 : 1,
      }}>
        {submitting ? 'Posting…' : <><Plus size={18} /> Publish Listing</>}
      </button>
    </motion.form>
  );
}
