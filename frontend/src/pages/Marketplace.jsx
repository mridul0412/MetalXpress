import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Phone, Weight, Plus, Search, Filter, ShieldCheck,
  X, ArrowRight, Package, Clock, CheckCircle, AlertCircle, Eye,
} from 'lucide-react';
import { fetchListings, fetchMyListings, createListing, createDeal, payDeal, fetchMetals, fetchCities } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const inputStyle = {
  width: '100%', padding: '12px 14px', borderRadius: 10, fontSize: 13,
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff', outline: 'none', boxSizing: 'border-box', transition: 'border 0.15s',
  fontFamily: 'inherit',
};
const labelStyle = {
  fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em',
  color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 6,
};

export default function Marketplace() {
  const [tab, setTab] = useState('browse');
  const [listings, setListings] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMetal, setFilterMetal] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [selectedListing, setSelectedListing] = useState(null);
  const { user } = useAuth();

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchListings({ metal: filterMetal || undefined, city: filterCity || undefined });
      setListings(res.data?.listings || res.data || []);
    } catch { setListings([]); }
    finally { setLoading(false); }
  };

  const loadMyListings = async () => {
    if (!user) return;
    try {
      const res = await fetchMyListings();
      setMyListings(res.data || []);
    } catch { setMyListings([]); }
  };

  useEffect(() => { load(); }, [filterMetal, filterCity]);
  useEffect(() => { if (tab === 'my-listings') loadMyListings(); }, [tab, user]);

  const TABS = [
    ['browse', 'Browse'],
    ['post', 'Sell Scrap'],
    ...(user ? [['my-listings', 'My Listings']] : []),
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-5 pb-24 md:pb-8">
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
              Scrap <span style={{ color: '#CFB53B' }}>Marketplace</span>
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: '2px 0 0' }}>
              Sell scrap metal · Buyers connect directly
            </p>
          </div>

          <div style={{ display: 'flex', padding: 4, borderRadius: 12, background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)' }}>
            {TABS.map(([val, label]) => (
              <button key={val} onClick={() => setTab(val)} style={{
                padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                transition: 'all 0.15s', border: 'none', cursor: 'pointer',
                background: tab === val ? '#CFB53B' : 'transparent',
                color: tab === val ? '#000' : 'rgba(255,255,255,0.4)',
              }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      {tab === 'browse' && (
        <BrowseTab
          listings={listings} loading={loading}
          filterMetal={filterMetal} setFilterMetal={setFilterMetal}
          filterCity={filterCity} setFilterCity={setFilterCity}
          onSelect={setSelectedListing}
        />
      )}
      {tab === 'post' && (
        <PostForm onSuccess={() => { setTab('my-listings'); loadMyListings(); }} />
      )}
      {tab === 'my-listings' && (
        <MyListingsTab listings={myListings} onRefresh={loadMyListings} />
      )}

      {/* Deal / Connect Modal */}
      <AnimatePresence>
        {selectedListing && (
          <DealModal listing={selectedListing} onClose={() => setSelectedListing(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Browse Tab ────────────────────────────────────────────────────────────────
function BrowseTab({ listings, loading, filterMetal, setFilterMetal, filterCity, setFilterCity, onSelect }) {
  const METALS = ['Copper', 'Aluminium', 'Brass', 'Lead', 'Zinc', 'Nickel'];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap',
        padding: 16, borderRadius: 14, background: 'rgba(13,20,32,0.8)',
        border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ flex: 1, minWidth: 140, position: 'relative' }}>
          <Filter size={14} color="rgba(255,255,255,0.3)" style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }} />
          <select value={filterMetal} onChange={e => setFilterMetal(e.target.value)} style={{
            ...inputStyle, paddingLeft: 34, appearance: 'none',
            color: filterMetal ? '#fff' : 'rgba(255,255,255,0.4)',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
          }}>
            <option value="" style={{ background: '#0d1420', color: '#fff' }}>All Metals</option>
            {METALS.map(m => <option key={m} value={m} style={{ background: '#0d1420', color: '#fff' }}>{m}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 140, position: 'relative' }}>
          <MapPin size={14} color="rgba(255,255,255,0.3)" style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input type="text" placeholder="Filter by city…" value={filterCity}
            onChange={e => setFilterCity(e.target.value)}
            style={{ ...inputStyle, paddingLeft: 34 }} />
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ height: 200, borderRadius: 14, background: 'rgba(255,255,255,0.03)',
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
            <ListingCard key={item.id} item={item} delay={idx * 0.04} onConnect={() => onSelect(item)} />
          ))}
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </motion.div>
  );
}

// ── Listing Card ──────────────────────────────────────────────────────────────
function ListingCard({ item, delay, onConnect }) {
  const totalValue = item.price && item.qty ? item.price * item.qty : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.2 }}
      style={{
        borderRadius: 14, padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        background: 'rgba(13,20,32,0.8)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)', transition: 'border-color 0.15s',
      }}
    >
      <div>
        {/* Metal + Grade header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <span style={{
                fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                padding: '2px 6px', borderRadius: 4,
                background: 'rgba(207,181,59,0.12)', color: '#CFB53B',
                border: '1px solid rgba(207,181,59,0.25)',
              }}>
                {item.metal?.name}
              </span>
              <span style={{
                fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                padding: '2px 6px', borderRadius: 4,
                background: 'rgba(52,211,153,0.12)', color: '#34d399',
                border: '1px solid rgba(52,211,153,0.25)',
              }}>
                <ShieldCheck size={8} style={{ marginRight: 2, verticalAlign: 'middle' }} />
                Verified
              </span>
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#fff', margin: 0 }}>
              {item.grade?.name || 'Mixed Grade'}
            </h3>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '2px 0 0' }}>
              by {item.sellerName}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            {item.price ? (
              <>
                <span style={{ fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: 'monospace', display: 'block' }}>
                  ₹{item.price.toLocaleString('en-IN')}
                </span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>per kg</span>
              </>
            ) : (
              <span style={{ fontSize: 14, fontWeight: 700, color: 'rgba(207,181,59,0.7)' }}>Negotiate</span>
            )}
          </div>
        </div>

        {item.description && (
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '0 0 12px', lineHeight: 1.4,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {item.description}
          </p>
        )}
      </div>

      <div>
        {/* Qty + Location */}
        <div style={{ display: 'flex', gap: 14, fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Weight size={11} />
            {item.qty.toLocaleString('en-IN')} {item.unit || 'kg'}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <MapPin size={11} />
            {item.location}
          </span>
        </div>

        {/* Total value + Connect button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {totalValue ? (
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
              Total: ₹{totalValue.toLocaleString('en-IN')}
            </span>
          ) : <span />}
          <button onClick={onConnect} style={{
            display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700,
            color: '#000', background: '#CFB53B', padding: '8px 16px',
            borderRadius: 8, border: 'none', cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(207,181,59,0.25)',
          }}>
            Connect <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Deal Modal ────────────────────────────────────────────────────────────────
function DealModal({ listing, onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState('preview'); // 'preview' | 'paying' | 'connected'
  const [deal, setDeal] = useState(null);
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const price = listing.price || 0;
  const totalValue = price * listing.qty;
  const commission = Math.max(Math.ceil(totalValue * 0.001), 1);

  const handleInitiateDeal = async () => {
    if (!user) { navigate('/login'); return; }
    setLoading(true); setError('');
    try {
      const res = await createDeal({ listingId: listing.id });
      setDeal(res.data.deal);
      setStep('paying');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to initiate deal');
    } finally { setLoading(false); }
  };

  const handlePayCommission = async () => {
    if (!deal) return;
    setLoading(true); setError('');
    try {
      const res = await payDeal(deal.id);
      setContact(res.data.sellerContact);
      setStep('connected');
    } catch (err) {
      setError(err.response?.data?.error || 'Payment failed');
    } finally { setLoading(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 480, borderRadius: 20, padding: 28,
          background: 'rgba(13,20,32,0.95)', backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderTop: '2px solid rgba(207,181,59,0.4)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        {/* Close button */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 6,
          cursor: 'pointer', color: 'rgba(255,255,255,0.4)',
        }}><X size={16} /></button>

        {step === 'preview' && (
          <>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>
              Connect with Seller
            </h3>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '0 0 20px' }}>
              Pay a small commission to get the seller's contact details
            </p>

            {/* Listing summary */}
            <div style={{ padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Metal / Grade</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                  {listing.metal?.name} — {listing.grade?.name || 'Mixed'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Quantity</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
                  {listing.qty.toLocaleString('en-IN')} {listing.unit || 'kg'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Price</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#CFB53B' }}>
                  {price ? `₹${price.toLocaleString('en-IN')}/kg` : 'Negotiable'}
                </span>
              </div>
              {totalValue > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8,
                  borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Total Value</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>
                    ₹{totalValue.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
            </div>

            {/* Commission breakdown */}
            <div style={{ padding: 14, borderRadius: 12,
              background: 'rgba(207,181,59,0.06)', border: '1px solid rgba(207,181,59,0.15)',
              marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#CFB53B', margin: '0 0 2px' }}>
                    Connection Fee (0.1%)
                  </p>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                    One-time fee to reveal seller contact
                  </p>
                </div>
                <span style={{ fontSize: 20, fontWeight: 700, color: '#CFB53B', fontFamily: 'monospace' }}>
                  ₹{commission.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {error && (
              <p style={{ fontSize: 12, color: '#f87171', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                <AlertCircle size={13} /> {error}
              </p>
            )}

            <button onClick={handleInitiateDeal} disabled={loading} style={{
              width: '100%', padding: 14, borderRadius: 12, fontWeight: 700, fontSize: 14,
              background: '#CFB53B', color: '#000', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 4px 16px rgba(207,181,59,0.3)',
              opacity: loading ? 0.6 : 1,
            }}>
              {loading ? 'Processing...' : `Pay ₹${commission.toLocaleString('en-IN')} & Connect`}
              {!loading && <ArrowRight size={16} />}
            </button>

            {!user && (
              <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>
                You'll need to sign in first
              </p>
            )}
          </>
        )}

        {step === 'paying' && (
          <>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 16px' }}>
              Confirm Payment
            </h3>

            <div style={{ textAlign: 'center', padding: 24 }}>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>
                Commission amount
              </p>
              <p style={{ fontSize: 36, fontWeight: 700, color: '#CFB53B', fontFamily: 'monospace', margin: '0 0 4px' }}>
                ₹{commission.toLocaleString('en-IN')}
              </p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: '0 0 24px' }}>
                {listing.metal?.name} {listing.grade?.name} · {listing.qty.toLocaleString('en-IN')} kg
              </p>

              {error && (
                <p style={{ fontSize: 12, color: '#f87171', marginBottom: 12 }}>{error}</p>
              )}

              <button onClick={handlePayCommission} disabled={loading} style={{
                width: '100%', padding: 14, borderRadius: 12, fontWeight: 700, fontSize: 14,
                background: '#34d399', color: '#000', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: loading ? 0.6 : 1,
              }}>
                {loading ? 'Processing Payment...' : 'Pay Now (Dev Mode — Free)'}
                {!loading && <CheckCircle size={16} />}
              </button>

              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 8 }}>
                In production, this will open Razorpay payment
              </p>
            </div>
          </>
        )}

        {step === 'connected' && contact && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 14, margin: '0 auto 12px',
                background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CheckCircle size={28} color="#34d399" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#34d399', margin: '0 0 4px' }}>
                Connected!
              </h3>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                Contact the seller directly to negotiate and complete the deal
              </p>
            </div>

            <div style={{ padding: 16, borderRadius: 12, background: 'rgba(52,211,153,0.06)',
              border: '1px solid rgba(52,211,153,0.15)', marginBottom: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                color: 'rgba(255,255,255,0.35)', margin: '0 0 10px' }}>
                Seller Contact
              </p>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>
                {contact.name || 'Seller'}
              </p>
              {contact.listingContact && (
                <a href={`tel:${contact.listingContact}`} style={{
                  display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700,
                  color: '#34d399', textDecoration: 'none', margin: '6px 0',
                }}>
                  <Phone size={14} /> {contact.listingContact}
                </a>
              )}
              {contact.email && (
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '4px 0 0' }}>
                  {contact.email}
                </p>
              )}
            </div>

            <button onClick={onClose} style={{
              width: '100%', padding: 12, borderRadius: 12, fontWeight: 700, fontSize: 13,
              background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)',
              border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
            }}>
              Close
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── My Listings Tab ───────────────────────────────────────────────────────────
function MyListingsTab({ listings, onRefresh }) {
  const STATUS_STYLES = {
    pending: { bg: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: 'rgba(251,191,36,0.25)', label: 'Pending Review', icon: Clock },
    verified: { bg: 'rgba(52,211,153,0.1)', color: '#34d399', border: 'rgba(52,211,153,0.25)', label: 'Verified & Live', icon: CheckCircle },
    rejected: { bg: 'rgba(248,113,113,0.1)', color: '#f87171', border: 'rgba(248,113,113,0.25)', label: 'Rejected', icon: AlertCircle },
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {listings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', borderRadius: 16,
          background: 'rgba(13,20,32,0.6)', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <Package size={40} color="rgba(255,255,255,0.15)" style={{ margin: '0 auto 14px', display: 'block' }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>No listings yet</h3>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
            Post your first scrap listing to start selling.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {listings.map(item => {
            const st = STATUS_STYLES[item.status] || STATUS_STYLES.pending;
            const Icon = st.icon;
            return (
              <div key={item.id} style={{
                padding: 16, borderRadius: 14, background: 'rgba(13,20,32,0.8)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                      {item.metal?.name} — {item.grade?.name || 'Mixed'}
                    </span>
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                      background: st.bg, color: st.color, border: `1px solid ${st.border}`,
                      display: 'inline-flex', alignItems: 'center', gap: 3,
                    }}>
                      <Icon size={9} /> {st.label}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
                    {item.qty.toLocaleString('en-IN')} kg · {item.location}
                    {item.price && ` · ₹${item.price.toLocaleString('en-IN')}/kg`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

// ── Post Form ─────────────────────────────────────────────────────────────────
function PostForm({ onSuccess }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [metals, setMetals] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedMetalId, setSelectedMetalId] = useState('');
  const [selectedMetal, setSelectedMetal] = useState(null);
  const [form, setForm] = useState({
    gradeId: '', qty: '', location: '', price: '', contact: '', description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchMetals().then(r => {
      const list = r.data || [];
      setMetals(list);
    }).catch(() => {});
    fetchCities().then(r => {
      const list = Array.isArray(r.data) ? r.data : (r.data?.cities || []);
      setCities(list);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setSelectedMetal(metals.find(m => m.id === selectedMetalId) || null);
    setForm(f => ({ ...f, gradeId: '' }));
  }, [selectedMetalId, metals]);

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
        metalId: selectedMetalId,
        gradeId: form.gradeId || null,
        qty: Number(form.qty),
        location: form.location,
        price: form.price ? Number(form.price) : null,
        contact: form.contact,
        description: form.description || null,
      });
      setSuccess(true);
      setTimeout(() => onSuccess(), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post listing. Try again.');
    }
    finally { setSubmitting(false); }
  };

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 16px', borderRadius: 16,
        background: 'rgba(13,20,32,0.8)', border: '1px solid rgba(52,211,153,0.2)' }}>
        <CheckCircle size={48} color="#34d399" style={{ margin: '0 auto 14px', display: 'block' }} />
        <h3 style={{ fontSize: 20, fontWeight: 700, color: '#34d399', margin: '0 0 8px' }}>Listing Submitted!</h3>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
          Your listing is pending review. It will go live once verified by our team.
        </p>
      </div>
    );
  }

  return (
    <motion.form initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      style={{ maxWidth: 640, margin: '0 auto', padding: 24, borderRadius: 18,
        background: 'rgba(13,20,32,0.9)', border: '1px solid rgba(255,255,255,0.08)',
        borderTop: '2px solid rgba(207,181,59,0.3)', boxShadow: '0 16px 48px rgba(0,0,0,0.4)' }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>
        Sell Your Scrap Metal
      </h3>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '0 0 20px',
        paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        Your listing will be reviewed before going live. Buyers pay a small commission to connect with you.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={labelStyle}>Metal *</label>
          <select value={selectedMetalId} onChange={e => setSelectedMetalId(e.target.value)} required
            style={{ ...inputStyle, appearance: 'none',
              color: selectedMetalId ? '#fff' : 'rgba(255,255,255,0.4)',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
            }}>
            <option value="" style={{ background: '#0d1420', color: 'rgba(255,255,255,0.5)' }}>Select metal</option>
            {metals.map(m => (
              <option key={m.id} value={m.id} style={{ background: '#0d1420', color: '#fff' }}>
                {m.emoji} {m.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Grade</label>
          <select value={form.gradeId} onChange={set('gradeId')} disabled={!selectedMetal}
            style={{ ...inputStyle, appearance: 'none',
              color: form.gradeId ? '#fff' : 'rgba(255,255,255,0.4)',
              opacity: selectedMetal ? 1 : 0.5,
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
            }}>
            <option value="" style={{ background: '#0d1420', color: 'rgba(255,255,255,0.5)' }}>Any grade</option>
            {selectedMetal?.grades?.map(g => (
              <option key={g.id} value={g.id} style={{ background: '#0d1420', color: '#fff' }}>{g.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Quantity (kg) *</label>
          <input type="number" value={form.qty} onChange={set('qty')}
            placeholder="1000" min="1" required style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Price (₹/kg)</label>
          <input type="number" value={form.price} onChange={set('price')}
            placeholder="Leave blank for negotiable" min="1" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Location *</label>
          <input type="text" value={form.location} onChange={set('location')}
            placeholder="e.g. Mandoli, Delhi" required style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Contact Number *</label>
          <input type="tel" value={form.contact} onChange={set('contact')}
            placeholder="9876543210" required style={inputStyle} />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Description</label>
          <textarea value={form.description} onChange={set('description')} rows={3}
            placeholder="Condition, origin, availability, minimum order…"
            style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }} />
        </div>
      </div>

      {error && (
        <p style={{ fontSize: 13, color: '#f87171', marginTop: 12, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 4 }}>
          <AlertCircle size={14} /> {error}
        </p>
      )}

      <button type="submit" disabled={submitting || !selectedMetalId} style={{
        width: '100%', marginTop: 20, padding: '14px', borderRadius: 12, fontWeight: 700, fontSize: 15,
        background: '#CFB53B', color: '#000', border: 'none',
        cursor: (submitting || !selectedMetalId) ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        boxShadow: '0 4px 16px rgba(207,181,59,0.25)',
        opacity: (submitting || !selectedMetalId) ? 0.6 : 1,
      }}>
        {submitting ? 'Submitting…' : <><Plus size={18} /> Submit for Review</>}
      </button>

      <p style={{ textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 10 }}>
        Listings are reviewed within 24 hours. Contact info is only shared with paid buyers.
      </p>
    </motion.form>
  );
}
