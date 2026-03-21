import { useState, useEffect, useCallback } from 'react';
import {
  MapPin, Weight, Plus, ShieldCheck, X, ArrowRight, Package,
  Clock, CheckCircle, AlertCircle, Trash2, MessageSquare, Send,
  ChevronRight, DollarSign, Handshake,
} from 'lucide-react';
import {
  fetchListings, fetchMyListings, createListing, createDeal, counterOffer,
  acceptOffer, rejectDeal, payDeal, fetchMyDeals, fetchDealDetail,
  completeDeal, disputeDeal, deleteListing, fetchMetals, fetchCities,
} from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/* ── shared styles ─────────────────────────────────────────────────── */
const inputStyle = {
  width: '100%', padding: '12px 14px', borderRadius: 10, fontSize: 13,
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
};
const labelStyle = {
  fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em',
  color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 6,
};
const selectStyle = {
  ...inputStyle, appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='rgba(255,255,255,0.3)' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
};
const optionStyle = { background: '#0D1420', color: '#fff' };
const fmt = n => n?.toLocaleString('en-IN') ?? '—';
const STATUS_COLORS = {
  negotiating: '#CFB53B', agreed: '#34d399', connected: '#38bdf8',
  completed: '#22c55e', cancelled: '#6b7280', expired: '#6b7280', paid: '#38bdf8',
  disputed: '#f87171',
};

/* ══════════════════════════════════════════════════════════════════════ */
export default function Marketplace() {
  const [tab, setTab] = useState('browse');
  const [listings, setListings] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMetal, setFilterMetal] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [offerListing, setOfferListing] = useState(null); // listing to make offer on
  const [activeDeal, setActiveDeal] = useState(null);     // deal detail view
  const { user } = useAuth();
  const navigate = useNavigate();

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
    try { setMyListings((await fetchMyListings()).data || []); } catch { setMyListings([]); }
  };

  const loadDeals = async () => {
    if (!user) return;
    try { setDeals((await fetchMyDeals()).data || []); } catch { setDeals([]); }
  };

  useEffect(() => { load(); }, [filterMetal, filterCity]);
  useEffect(() => { if (tab === 'my-listings') loadMyListings(); }, [tab, user]);
  useEffect(() => { if (tab === 'my-deals') loadDeals(); }, [tab, user]);

  // Poll deals every 30s when on deals tab
  useEffect(() => {
    if (tab !== 'my-deals' || !user) return;
    const iv = setInterval(loadDeals, 30000);
    return () => clearInterval(iv);
  }, [tab, user]);

  const TABS = [
    ['browse', 'Browse'],
    ['post', 'Sell Scrap'],
    ...(user ? [['my-listings', 'My Listings'], ['my-deals', 'My Deals']] : []),
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-5 pb-24 md:pb-8">
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: 0 }}>
              Scrap <span style={{ color: '#CFB53B' }}>Marketplace</span>
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: '2px 0 0' }}>
              Sell scrap metal · Negotiate · Connect
            </p>
          </div>
          <div style={{ display: 'flex', padding: 4, borderRadius: 12, background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)', flexWrap: 'wrap' }}>
            {TABS.map(([val, label]) => (
              <button key={val} onClick={() => setTab(val)} style={{
                padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                border: 'none', cursor: 'pointer',
                background: tab === val ? '#CFB53B' : 'transparent',
                color: tab === val ? '#000' : 'rgba(255,255,255,0.4)',
              }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      {tab === 'browse' && <BrowseTab listings={listings} loading={loading}
        filterMetal={filterMetal} setFilterMetal={setFilterMetal}
        filterCity={filterCity} setFilterCity={setFilterCity}
        user={user} navigate={navigate} onMakeOffer={setOfferListing} />}

      {tab === 'post' && (user
        ? <PostForm user={user} onSuccess={() => { setTab('my-listings'); loadMyListings(); }} />
        : <LoginPrompt navigate={navigate} />)}

      {tab === 'my-listings' && <MyListingsTab listings={myListings} onRefresh={loadMyListings} onBrowseRefresh={load} />}

      {tab === 'my-deals' && <MyDealsTab deals={deals} user={user}
        onRefresh={loadDeals} onViewDeal={setActiveDeal} />}

      {/* Offer Modal */}
      {offerListing && <OfferModal listing={offerListing}
        onClose={() => setOfferListing(null)}
        onSuccess={(deal) => { setOfferListing(null); setActiveDeal(deal); setTab('my-deals'); loadDeals(); }} />}

      {/* Deal Detail Panel */}
      {activeDeal && <DealDetailPanel dealId={typeof activeDeal === 'string' ? activeDeal : activeDeal.id}
        user={user} onClose={() => { setActiveDeal(null); loadDeals(); }} />}
    </div>
  );
}

/* ── Browse Tab ───────────────────────────────────────────────────── */
function BrowseTab({ listings, loading, filterMetal, setFilterMetal, filterCity, setFilterCity, user, navigate, onMakeOffer }) {
  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <div style={{ position: 'relative' }}>
          <select value={filterMetal} onChange={e => setFilterMetal(e.target.value)} style={selectStyle}>
            <option value="" style={optionStyle}>All Metals</option>
            {['Copper','Aluminium','Brass','Lead','Zinc','Nickel'].map(m =>
              <option key={m} value={m} style={optionStyle}>{m}</option>)}
          </select>
        </div>
        <input value={filterCity} onChange={e => setFilterCity(e.target.value)}
          placeholder="Filter by city…" style={inputStyle} />
      </div>

      {loading ? <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 40 }}>Loading…</p>
      : listings.length === 0
        ? <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 40 }}>No listings found</p>
        : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {listings.map(l => <ListingCard key={l.id} listing={l}
              onAction={() => user ? onMakeOffer(l) : navigate('/login')}
              actionLabel="Make Offer" />)}
          </div>}
    </div>
  );
}

/* ── Listing Card ─────────────────────────────────────────────────── */
function ListingCard({ listing: l, onAction, actionLabel, showStatus, onDelete }) {
  const metalName = l.metal?.name || 'Metal';
  const gradeName = l.grade?.name || metalName;
  const priceStr = l.price ? `₹${fmt(l.price)}` : 'Negotiate';
  const totalVal = l.price && l.qty ? l.price * l.qty : null;

  return (
    <div style={{ background: '#0D1420', borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)', padding: 18, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
            background: 'rgba(207,181,59,0.15)', color: '#CFB53B', textTransform: 'uppercase' }}>{metalName}</span>
          {l.status === 'verified' && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px',
            borderRadius: 6, background: 'rgba(52,211,153,0.15)', color: '#34d399',
            display: 'flex', alignItems: 'center', gap: 3 }}><ShieldCheck size={10} /> VERIFIED</span>}
          {showStatus && l.status === 'pending' && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px',
            borderRadius: 6, background: 'rgba(207,181,59,0.15)', color: '#CFB53B' }}>Pending Review</span>}
          {showStatus && l.status === 'rejected' && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px',
            borderRadius: 6, background: 'rgba(248,113,113,0.15)', color: '#f87171' }}>Rejected</span>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{priceStr}</span>
          {l.price && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginLeft: 4 }}>per kg</span>}
        </div>
      </div>

      <h3 style={{ fontSize: 17, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>{gradeName}</h3>
      {l.sellerName && <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '0 0 8px' }}>by {l.sellerName}</p>}

      {/* Image thumbnails */}
      {l.imageUrls?.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 10, overflowX: 'auto' }}>
          {l.imageUrls.slice(0, 3).map((url, i) => (
            <img key={i} src={url} alt={`${gradeName} ${i + 1}`}
              style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }} />
          ))}
          {l.imageUrls.length > 3 && (
            <div style={{ width: 72, height: 72, borderRadius: 8, background: 'rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
              +{l.imageUrls.length - 3}
            </div>
          )}
        </div>
      )}

      {l.description && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '0 0 10px', lineHeight: 1.5 }}>
        {l.description.length > 100 ? l.description.slice(0, 100) + '…' : l.description}</p>}

      <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Weight size={12} /> {fmt(l.qty)} {l.unit || 'kg'}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {l.location}</span>
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {totalVal && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Total: ₹{fmt(totalVal)}</span>}
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          {onDelete && <button onClick={onDelete} style={{
            padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
            border: '1px solid rgba(248,113,113,0.3)', background: 'transparent', color: '#f87171', cursor: 'pointer',
          }}><Trash2 size={12} /></button>}
          {onAction && <button onClick={onAction} style={{
            padding: '8px 18px', borderRadius: 8, fontSize: 12, fontWeight: 700,
            background: '#CFB53B', color: '#000', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>{actionLabel || 'View'} <ArrowRight size={14} /></button>}
        </div>
      </div>
    </div>
  );
}

/* ── Offer Modal (Make Offer) ─────────────────────────────────────── */
function OfferModal({ listing: l, onClose, onSuccess }) {
  const [price, setPrice] = useState(l.price || '');
  const [qty, setQty] = useState(l.qty || '');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const totalVal = price && qty ? parseFloat(price) * parseFloat(qty) : 0;
  const commission = Math.max(Math.ceil(totalVal * 0.001), 1);

  const handleSubmit = async () => {
    if (!price || !qty) return setError('Price and quantity required');
    setSubmitting(true); setError('');
    try {
      const res = await createDeal({ listingId: l.id, pricePerKg: parseFloat(price), qty: parseFloat(qty), message });
      onSuccess(res.data.deal);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send offer');
    } finally { setSubmitting(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.7)', padding: 16 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 420, borderRadius: 16,
        background: '#0D1420', border: '1px solid rgba(207,181,59,0.2)', padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: 0 }}>Make an Offer</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        {/* Listing summary */}
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 14, marginBottom: 16,
          border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 13, color: '#CFB53B', fontWeight: 700 }}>{l.metal?.name} — {l.grade?.name || l.metal?.name}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
            Listed: {l.qty} kg {l.price ? `@ ₹${fmt(l.price)}/kg` : '(Negotiable)'} · {l.location}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>by {l.sellerName || 'Seller'}</div>
        </div>

        {/* Offer form */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={labelStyle}>Your Offer (₹/kg) *</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)}
              placeholder={l.price ? String(l.price) : 'Enter price'} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Quantity (kg) *</label>
            <input type="number" value={qty} onChange={e => setQty(e.target.value)} style={inputStyle} />
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Message (optional)</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)}
            placeholder="Any details about your requirements…"
            style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} />
        </div>

        {/* Commission preview */}
        {totalVal > 0 && (
          <div style={{ background: 'rgba(207,181,59,0.08)', borderRadius: 10, padding: 12, marginBottom: 16,
            border: '1px solid rgba(207,181,59,0.15)', fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.5)' }}>
              <span>Deal value</span><span>₹{fmt(totalVal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#CFB53B', fontWeight: 700, marginTop: 4 }}>
              <span>Commission (0.1%)</span><span>₹{fmt(commission)}</span>
            </div>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', margin: '6px 0 0' }}>
              Commission is only charged after both parties agree on price
            </p>
          </div>
        )}

        {error && <p style={{ color: '#f87171', fontSize: 12, marginBottom: 12 }}>{error}</p>}

        <button onClick={handleSubmit} disabled={submitting} style={{
          width: '100%', padding: '14px', borderRadius: 10, fontSize: 14, fontWeight: 700,
          background: '#CFB53B', color: '#000', border: 'none', cursor: 'pointer',
          opacity: submitting ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}><Send size={16} /> {submitting ? 'Sending…' : 'Send Offer'}</button>
      </div>
    </div>
  );
}

/* ── Deal Detail Panel (full negotiation view) ────────────────────── */
function DealDetailPanel({ dealId, user, onClose }) {
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [counterPrice, setCounterPrice] = useState('');
  const [counterQty, setCounterQty] = useState('');
  const [counterMsg, setCounterMsg] = useState('');
  const [showCounter, setShowCounter] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');
  const [showDispute, setShowDispute] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');

  const loadDeal = useCallback(async () => {
    try {
      const res = await fetchDealDetail(dealId);
      setDeal(res.data);
      setLoading(false);
    } catch { setLoading(false); }
  }, [dealId]);

  useEffect(() => { loadDeal(); }, [loadDeal]);

  // Auto-refresh every 15s
  useEffect(() => {
    const iv = setInterval(loadDeal, 15000);
    return () => clearInterval(iv);
  }, [loadDeal]);

  if (loading) return <Overlay onClose={onClose}><p style={{ color: '#fff', textAlign: 'center' }}>Loading…</p></Overlay>;
  if (!deal) return <Overlay onClose={onClose}><p style={{ color: '#f87171', textAlign: 'center' }}>Deal not found</p></Overlay>;

  const myRole = deal.buyerId === user?.id ? 'buyer' : 'seller';
  const otherParty = myRole === 'buyer' ? deal.seller : deal.buyer;
  const lastOffer = deal.offers?.[deal.offers.length - 1];
  const canRespond = lastOffer && lastOffer.fromUserId !== user?.id && lastOffer.status === 'pending' && deal.status === 'negotiating';
  const isMyTurn = canRespond;
  const isConnected = ['connected', 'completed'].includes(deal.status);

  const handleAction = async (action) => {
    setActionLoading(action); setError('');
    try {
      if (action === 'accept') {
        await acceptOffer(deal.id);
      } else if (action === 'reject') {
        await rejectDeal(deal.id);
      } else if (action === 'counter') {
        if (!counterPrice) { setError('Price required'); setActionLoading(''); return; }
        await counterOffer(deal.id, {
          pricePerKg: parseFloat(counterPrice),
          qty: counterQty ? parseFloat(counterQty) : undefined,
          message: counterMsg || undefined,
        });
        setShowCounter(false); setCounterPrice(''); setCounterQty(''); setCounterMsg('');
      } else if (action === 'pay') {
        await payDeal(deal.id);
      } else if (action === 'complete') {
        await completeDeal(deal.id);
      } else if (action === 'dispute') {
        if (!disputeReason || disputeReason.trim().length < 10) {
          setError('Please describe the issue in detail (at least 10 characters)');
          setActionLoading('');
          return;
        }
        await disputeDeal(deal.id, disputeReason);
        setShowDispute(false);
        setDisputeReason('');
      }
      await loadDeal();
    } catch (err) {
      setError(err.response?.data?.error || 'Action failed');
    } finally { setActionLoading(''); }
  };

  return (
    <Overlay onClose={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 480, maxHeight: '90vh',
        borderRadius: 16, background: '#0D1420', border: '1px solid rgba(207,181,59,0.2)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>
              {deal.listing?.metal?.name} — {deal.listing?.grade?.name || deal.listing?.metal?.name}
            </h3>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '2px 0 0' }}>
              {myRole === 'buyer' ? 'Seller' : 'Buyer'}: {otherParty?.name || 'Anonymous'}
              {otherParty?.city && ` · ${otherParty.city}`}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 6,
              background: `${STATUS_COLORS[deal.status] || '#666'}20`,
              color: STATUS_COLORS[deal.status] || '#666', textTransform: 'uppercase' }}>{deal.status}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}><X size={18} /></button>
          </div>
        </div>

        {/* Offer history (chat-like) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {deal.offers?.map((offer, i) => {
            const isMine = offer.fromUserId === user?.id;
            return (
              <div key={offer.id} style={{
                display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: 12,
              }}>
                <div style={{
                  maxWidth: '80%', padding: '10px 14px', borderRadius: 12,
                  background: isMine ? 'rgba(207,181,59,0.1)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${isMine ? 'rgba(207,181,59,0.2)' : 'rgba(255,255,255,0.08)'}`,
                }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>
                    {isMine ? 'You' : otherParty?.name || 'Other'} · {new Date(offer.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>
                    ₹{fmt(offer.pricePerKg)}/kg × {fmt(offer.qty)} kg
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                    = ₹{fmt(offer.pricePerKg * offer.qty)}
                  </div>
                  {offer.message && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '6px 0 0', fontStyle: 'italic' }}>"{offer.message}"</p>}
                  {offer.status !== 'pending' && (
                    <span style={{ fontSize: 9, fontWeight: 700, color: offer.status === 'accepted' ? '#34d399' : '#6b7280',
                      textTransform: 'uppercase', marginTop: 4, display: 'inline-block' }}>{offer.status}</span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Waiting indicator */}
          {deal.status === 'negotiating' && lastOffer?.fromUserId === user?.id && (
            <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.25)', padding: '12px 0' }}>
              <Clock size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Waiting for {otherParty?.name || 'the other party'} to respond…
            </p>
          )}
        </div>

        {/* Action bar */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {error && <p style={{ color: '#f87171', fontSize: 12, marginBottom: 8 }}>{error}</p>}

          {/* Negotiation actions */}
          {isMyTurn && !showCounter && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => handleAction('accept')} disabled={!!actionLoading}
                style={{ flex: 1, padding: '12px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                  background: '#34d399', color: '#000', border: 'none', cursor: 'pointer' }}>
                {actionLoading === 'accept' ? 'Accepting…' : 'Accept Offer'}
              </button>
              <button onClick={() => setShowCounter(true)}
                style={{ flex: 1, padding: '12px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                  background: '#CFB53B', color: '#000', border: 'none', cursor: 'pointer' }}>
                Counter
              </button>
              <button onClick={() => handleAction('reject')} disabled={!!actionLoading}
                style={{ padding: '12px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                  background: 'transparent', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)', cursor: 'pointer' }}>
                Reject
              </button>
            </div>
          )}

          {/* Counter-offer form */}
          {showCounter && (
            <div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '0 0 8px' }}>
                Edit both price and quantity to counter-offer:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                <div>
                  <label style={{ ...labelStyle, marginBottom: 4 }}>Price (₹/kg) *</label>
                  <input type="number" value={counterPrice} onChange={e => setCounterPrice(e.target.value)}
                    placeholder={lastOffer?.pricePerKg ? String(lastOffer.pricePerKg) : 'Price'}
                    style={{ ...inputStyle, padding: '10px 12px' }} />
                </div>
                <div>
                  <label style={{ ...labelStyle, marginBottom: 4 }}>Quantity (kg)</label>
                  <input type="number" value={counterQty} onChange={e => setCounterQty(e.target.value)}
                    placeholder={lastOffer?.qty ? String(lastOffer.qty) : 'Qty'}
                    style={{ ...inputStyle, padding: '10px 12px' }} />
                </div>
              </div>
              <input value={counterMsg} onChange={e => setCounterMsg(e.target.value)}
                placeholder="Message (optional)" style={{ ...inputStyle, padding: '10px 12px', marginBottom: 8 }} />
              {counterPrice && (counterQty || lastOffer?.qty) && (
                <div style={{ fontSize: 11, color: 'rgba(207,181,59,0.6)', marginBottom: 8 }}>
                  New deal value: ₹{fmt(parseFloat(counterPrice) * parseFloat(counterQty || lastOffer?.qty))}
                  {' · '}Commission: ₹{fmt(Math.max(Math.ceil(parseFloat(counterPrice) * parseFloat(counterQty || lastOffer?.qty) * 0.001), 1))}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => handleAction('counter')} disabled={!!actionLoading}
                  style={{ flex: 1, padding: '12px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                    background: '#CFB53B', color: '#000', border: 'none', cursor: 'pointer' }}>
                  {actionLoading === 'counter' ? 'Sending…' : 'Send Counter Offer'}
                </button>
                <button onClick={() => setShowCounter(false)}
                  style={{ padding: '12px 16px', borderRadius: 10, fontSize: 13,
                    background: 'transparent', color: '#666', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Agreed — pay commission */}
          {deal.status === 'agreed' && myRole === 'buyer' && (
            <div>
              <div style={{ background: 'rgba(52,211,153,0.08)', borderRadius: 10, padding: 14, marginBottom: 12,
                border: '1px solid rgba(52,211,153,0.15)' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#34d399', marginBottom: 4 }}>
                  <Handshake size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Deal Agreed!
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                  ₹{fmt(deal.agreedPrice)}/kg × {fmt(deal.agreedQty)} kg = ₹{fmt(deal.dealAmount)}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#CFB53B', marginTop: 6 }}>
                  Commission (0.1%): ₹{fmt(deal.commission)}
                </div>
              </div>
              <button onClick={() => handleAction('pay')} disabled={!!actionLoading}
                style={{ width: '100%', padding: '14px', borderRadius: 10, fontSize: 14, fontWeight: 700,
                  background: '#34d399', color: '#000', border: 'none', cursor: 'pointer' }}>
                {actionLoading === 'pay' ? 'Processing…' : `Pay ₹${fmt(deal.commission)} & Connect`}
              </button>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 6 }}>
                Dev mode — instant payment. Production will use Razorpay.
              </p>
            </div>
          )}
          {deal.status === 'agreed' && myRole === 'seller' && (
            <div style={{ background: 'rgba(52,211,153,0.08)', borderRadius: 10, padding: 14,
              border: '1px solid rgba(52,211,153,0.15)', textAlign: 'center' }}>
              <Handshake size={20} style={{ color: '#34d399', marginBottom: 6 }} />
              <p style={{ fontSize: 13, fontWeight: 700, color: '#34d399' }}>Deal agreed! Waiting for buyer to pay commission.</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                ₹{fmt(deal.agreedPrice)}/kg × {fmt(deal.agreedQty)} kg · Commission: ₹{fmt(deal.commission)}
              </p>
            </div>
          )}

          {/* Connected — show contacts */}
          {isConnected && (
            <div>
              <div style={{ background: 'rgba(56,189,248,0.08)', borderRadius: 10, padding: 16, marginBottom: 8,
                border: '1px solid rgba(56,189,248,0.15)' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#38bdf8', marginBottom: 8 }}>
                  <CheckCircle size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                  {deal.status === 'completed' ? 'Deal Completed' : 'Connected!'}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 4 }}>
                  {myRole === 'buyer' ? 'Seller' : 'Buyer'} Contact
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>
                  {(myRole === 'buyer' ? deal.seller : deal.buyer)?.name || 'N/A'}
                </div>
                {(myRole === 'buyer' ? deal.seller : deal.buyer)?.phone && (
                  <a href={`tel:${(myRole === 'buyer' ? deal.seller : deal.buyer).phone}`}
                    style={{ fontSize: 14, color: '#34d399', textDecoration: 'none', display: 'block', marginTop: 4 }}>
                    📞 {(myRole === 'buyer' ? deal.seller : deal.buyer).phone}
                  </a>
                )}
                {(myRole === 'buyer' ? deal.seller : deal.buyer)?.email && (
                  <a href={`mailto:${(myRole === 'buyer' ? deal.seller : deal.buyer).email}`}
                    style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', display: 'block', marginTop: 2 }}>
                    ✉ {(myRole === 'buyer' ? deal.seller : deal.buyer).email}
                  </a>
                )}
              </div>
              {deal.status === 'connected' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button onClick={() => handleAction('complete')} disabled={!!actionLoading}
                    style={{ width: '100%', padding: '12px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                      background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)', cursor: 'pointer' }}>
                    {actionLoading === 'complete' ? 'Completing…' : 'Mark Deal as Completed'}
                  </button>
                  {!showDispute ? (
                    <button onClick={() => setShowDispute(true)}
                      style={{ width: '100%', padding: '10px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                        background: 'transparent', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)', cursor: 'pointer' }}>
                      Report Issue / Raise Dispute
                    </button>
                  ) : (
                    <div style={{ background: 'rgba(248,113,113,0.06)', borderRadius: 10, padding: 14,
                      border: '1px solid rgba(248,113,113,0.15)' }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#f87171', margin: '0 0 8px' }}>
                        Raise a Dispute
                      </p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '0 0 10px' }}>
                        Commission is held in escrow. Our team will review and resolve within 48 hours.
                      </p>
                      <textarea value={disputeReason} onChange={e => setDisputeReason(e.target.value)}
                        placeholder="Describe the issue: e.g., seller not responding, material quality mismatch, deal done outside app…"
                        style={{ ...inputStyle, minHeight: 70, resize: 'vertical', fontSize: 12, marginBottom: 8 }} />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => handleAction('dispute')} disabled={!!actionLoading}
                          style={{ flex: 1, padding: '10px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                            background: '#f87171', color: '#000', border: 'none', cursor: 'pointer' }}>
                          {actionLoading === 'dispute' ? 'Submitting…' : 'Submit Dispute'}
                        </button>
                        <button onClick={() => { setShowDispute(false); setDisputeReason(''); }}
                          style={{ padding: '10px 16px', borderRadius: 8, fontSize: 12,
                            background: 'transparent', color: '#666', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Disputed */}
          {deal.status === 'disputed' && (
            <div style={{ background: 'rgba(248,113,113,0.06)', borderRadius: 10, padding: 14,
              border: '1px solid rgba(248,113,113,0.15)' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#f87171', margin: '0 0 6px' }}>
                Dispute Raised
              </p>
              {deal.disputeReason && (
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '0 0 6px', fontStyle: 'italic' }}>
                  "{deal.disputeReason}"
                </p>
              )}
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                Commission is held in escrow. Our team is reviewing — expect resolution within 48 hours.
              </p>
            </div>
          )}

          {/* Cancelled/expired */}
          {['cancelled', 'expired'].includes(deal.status) && (
            <p style={{ textAlign: 'center', fontSize: 13, color: '#6b7280', padding: '8px 0' }}>
              This deal has been {deal.status}.
            </p>
          )}
        </div>
      </div>
    </Overlay>
  );
}

/* ── My Deals Tab ─────────────────────────────────────────────────── */
function MyDealsTab({ deals, user, onRefresh, onViewDeal }) {
  if (!deals.length) return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <MessageSquare size={40} style={{ color: 'rgba(255,255,255,0.1)', marginBottom: 12 }} />
      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>No deals yet</p>
      <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>Make an offer on a listing to start negotiating</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {deals.map(d => {
        const lastOffer = d.lastOffer || d.offers?.[0];
        const hasNew = d.hasNewOffer;
        return (
          <div key={d.id} onClick={() => onViewDeal(d.id)}
            style={{ background: '#0D1420', borderRadius: 14, border: `1px solid ${hasNew ? 'rgba(207,181,59,0.3)' : 'rgba(255,255,255,0.07)'}`,
              padding: 16, cursor: 'pointer', transition: 'border-color 0.15s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                    background: 'rgba(207,181,59,0.15)', color: '#CFB53B', textTransform: 'uppercase' }}>
                    {d.listing?.metal?.name}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                    background: `${STATUS_COLORS[d.status] || '#666'}20`,
                    color: STATUS_COLORS[d.status], textTransform: 'uppercase' }}>{d.status}</span>
                  {hasNew && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                    background: '#CFB53B', color: '#000' }}>NEW</span>}
                </div>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 2px' }}>
                  {d.listing?.grade?.name || d.listing?.metal?.name}
                </h4>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                  {d.myRole === 'buyer' ? 'Seller' : 'Buyer'}: {d.otherParty?.name || 'Anonymous'}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                {lastOffer && <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>₹{fmt(lastOffer.pricePerKg)}/kg</div>}
                {lastOffer && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{fmt(lastOffer.qty)} kg</div>}
                <ChevronRight size={16} style={{ color: 'rgba(255,255,255,0.2)', marginTop: 4 }} />
              </div>
            </div>
            {d.agreedPrice && (
              <div style={{ marginTop: 8, fontSize: 12, color: '#34d399' }}>
                Agreed: ₹{fmt(d.agreedPrice)}/kg × {fmt(d.agreedQty)} kg = ₹{fmt(d.dealAmount)} · Fee: ₹{fmt(d.commission)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── My Listings Tab ──────────────────────────────────────────────── */
function MyListingsTab({ listings, onRefresh, onBrowseRefresh }) {
  const [deleting, setDeleting] = useState(null);

  const handleDelete = async (id) => {
    if (!confirm('Remove this listing?')) return;
    setDeleting(id);
    try {
      await deleteListing(id);
      onRefresh();
      if (onBrowseRefresh) onBrowseRefresh();
    } catch { alert('Failed to delete'); }
    finally { setDeleting(null); }
  };

  if (!listings.length) return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <Package size={40} style={{ color: 'rgba(255,255,255,0.1)', marginBottom: 12 }} />
      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>No listings yet</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {listings.map(l => (
        <div key={l.id} style={{ background: '#0D1420', borderRadius: 14,
          border: '1px solid rgba(255,255,255,0.07)', padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                  background: 'rgba(207,181,59,0.15)', color: '#CFB53B' }}>{l.metal?.name}</span>
                {l.status === 'verified' && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px',
                  borderRadius: 6, background: 'rgba(52,211,153,0.15)', color: '#34d399' }}>Verified & Live</span>}
                {l.status === 'pending' && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px',
                  borderRadius: 6, background: 'rgba(207,181,59,0.15)', color: '#CFB53B' }}>Pending Review</span>}
                {l.status === 'rejected' && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px',
                  borderRadius: 6, background: 'rgba(248,113,113,0.15)', color: '#f87171' }}>Rejected</span>}
              </div>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 2px' }}>
                {l.grade?.name || l.metal?.name}
              </h4>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                {fmt(l.qty)} kg · {l.location} {l.price ? `· ₹${fmt(l.price)}/kg` : '· Negotiable'}
              </p>
            </div>
            <button onClick={() => handleDelete(l.id)} disabled={deleting === l.id}
              style={{ padding: '8px', borderRadius: 8, background: 'transparent',
                border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', cursor: 'pointer' }}>
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Post Form ────────────────────────────────────────────────────── */
function PostForm({ user, onSuccess }) {
  const [metals, setMetals] = useState([]);
  const [metalId, setMetalId] = useState('');
  const [gradeId, setGradeId] = useState('');
  const [qty, setQty] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrls, setImageUrls] = useState([]);
  const [imageInput, setImageInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMetals().then(r => setMetals(r.data || [])).catch(() => {});
  }, []);

  const selectedMetal = metals.find(m => m.id === metalId);
  const grades = selectedMetal?.grades || [];

  const handleSubmit = async () => {
    if (!metalId || !qty || !location || !contact) return setError('Metal, quantity, location, and contact are required');
    setSubmitting(true); setError('');
    try {
      await createListing({ metalId, gradeId: gradeId || undefined, qty, price: price || undefined, location, contact, description: description || undefined, images: imageUrls.length > 0 ? imageUrls : undefined });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to publish');
    } finally { setSubmitting(false); }
  };

  return (
    <div style={{ background: '#0D1420', borderRadius: 16, border: '1px solid rgba(207,181,59,0.15)', padding: 24, maxWidth: 600 }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>Sell Your Scrap Metal</h3>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '0 0 20px' }}>
        Your listing will be reviewed before going live. Buyers negotiate and pay a small commission to connect.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={labelStyle}>Metal *</label>
          <select value={metalId} onChange={e => { setMetalId(e.target.value); setGradeId(''); }} style={selectStyle}>
            <option value="" style={optionStyle}>Select metal</option>
            {metals.map(m => <option key={m.id} value={m.id} style={optionStyle}>{m.emoji} {m.name}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Grade</label>
          <select value={gradeId} onChange={e => setGradeId(e.target.value)} style={selectStyle} disabled={!grades.length}>
            <option value="" style={optionStyle}>Any grade</option>
            {grades.map(g => <option key={g.id} value={g.id} style={optionStyle}>{g.name}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={labelStyle}>Quantity (kg) *</label>
          <input type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="1000" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Price (₹/kg)</label>
          <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="Leave blank for negotiable" style={inputStyle} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={labelStyle}>Location *</label>
          <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Mandoli, Delhi" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Contact Number *</label>
          <input value={contact} onChange={e => setContact(e.target.value)} placeholder="9876543210" style={inputStyle} />
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)}
          placeholder="Condition, origin, availability, minimum order…"
          style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} />
      </div>

      {/* Image URLs */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Photos (up to 5 image URLs)</label>
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', margin: '0 0 8px' }}>
          Upload photos to Google Drive / Imgur and paste the direct image link. Photos increase buyer trust significantly.
        </p>
        {imageUrls.map((url, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
            <img src={url} alt={`img ${i + 1}`} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)' }}
              onError={e => { e.target.style.display = 'none'; }} />
            <span style={{ flex: 1, fontSize: 11, color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{url}</span>
            <button onClick={() => setImageUrls(imageUrls.filter((_, j) => j !== i))}
              style={{ padding: '4px 8px', borderRadius: 6, fontSize: 11, background: 'transparent',
                color: '#f87171', border: '1px solid rgba(248,113,113,0.2)', cursor: 'pointer' }}>✕</button>
          </div>
        ))}
        {imageUrls.length < 5 && (
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={imageInput} onChange={e => setImageInput(e.target.value)}
              placeholder="Paste image URL (https://...)" style={{ ...inputStyle, flex: 1, padding: '8px 12px', fontSize: 12 }}
              onKeyDown={e => {
                if (e.key === 'Enter' && imageInput.trim()) {
                  e.preventDefault();
                  setImageUrls([...imageUrls, imageInput.trim()]);
                  setImageInput('');
                }
              }} />
            <button onClick={() => { if (imageInput.trim()) { setImageUrls([...imageUrls, imageInput.trim()]); setImageInput(''); } }}
              disabled={!imageInput.trim()}
              style={{ padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                background: imageInput.trim() ? '#CFB53B' : 'rgba(255,255,255,0.05)',
                color: imageInput.trim() ? '#000' : 'rgba(255,255,255,0.2)',
                border: 'none', cursor: imageInput.trim() ? 'pointer' : 'default' }}>Add</button>
          </div>
        )}
      </div>

      {error && <p style={{ color: '#f87171', fontSize: 12, marginBottom: 12 }}>{error}</p>}

      <button onClick={handleSubmit} disabled={submitting} style={{
        width: '100%', padding: '14px', borderRadius: 10, fontSize: 14, fontWeight: 700,
        background: '#CFB53B', color: '#000', border: 'none', cursor: 'pointer', opacity: submitting ? 0.6 : 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}><Plus size={16} /> {submitting ? 'Submitting…' : 'Submit for Review'}</button>

      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 8 }}>
        Listings are reviewed within 24 hours. Contact info is only shared with paid buyers.
      </p>
    </div>
  );
}

/* ── Login Prompt ─────────────────────────────────────────────────── */
function LoginPrompt({ navigate }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <Package size={40} style={{ color: 'rgba(255,255,255,0.1)', marginBottom: 12 }} />
      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, marginBottom: 12 }}>Login to sell your scrap metal</p>
      <button onClick={() => navigate('/login')} style={{
        padding: '12px 32px', borderRadius: 10, fontSize: 14, fontWeight: 700,
        background: '#CFB53B', color: '#000', border: 'none', cursor: 'pointer',
      }}>Login / Sign Up</button>
    </div>
  );
}

/* ── Overlay wrapper ──────────────────────────────────────────────── */
function Overlay({ onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'rgba(0,0,0,0.7)', padding: 16 }} onClick={onClose}>
      {children}
    </div>
  );
}
