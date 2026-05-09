import { useState, useEffect, useCallback, useRef } from 'react';
import {
  MapPin, Weight, Plus, ShieldCheck, X, ArrowRight, Package,
  Clock, CheckCircle, AlertCircle, Trash2, MessageSquare, Send,
  ChevronRight, DollarSign, Handshake, Camera, Image as ImageIcon,
  Shield, AlertTriangle, ChevronLeft, ZoomIn, Play,
} from 'lucide-react';
import {
  fetchListings, fetchMyListings, createListing, createDeal, counterOffer,
  acceptOffer, rejectDeal, payDeal, fetchMyDeals, fetchDealDetail,
  completeDeal, disputeDeal, deleteListing, fetchMetals, fetchCities,
  uploadMedia, rateDeal,
} from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PaywallModal from '../components/PaywallModal';
import ChakraLoader from '../components/ChakraLoader';

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
  const [showPaywall, setShowPaywall] = useState(false);
  const [activeDeal, setActiveDeal] = useState(null);     // deal detail view
  const { user, subscription } = useAuth();
  const navigate = useNavigate();

  const isOnCooldown = user?.cooldownUntil && new Date(user.cooldownUntil) > new Date();
  const cooldownDate = isOnCooldown ? new Date(user.cooldownUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null;

  // PRO gate — Marketplace requires Pro subscription
  if (user && subscription !== undefined && subscription?.plan !== 'pro' && subscription?.plan !== 'business') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-5 pb-24 md:pb-8">
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: 0 }}>
            Metal <span style={{ color: '#CFB53B' }}>Marketplace</span>
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: '2px 0 0' }}>
            Trade metals · Negotiate · Connect
          </p>
        </div>
        <div style={{
          maxWidth: 460, margin: '60px auto', textAlign: 'center', padding: '48px 32px',
          background: '#0D1420', border: '1px solid rgba(255,255,255,0.07)',
          borderTop: '2px solid rgba(207,181,59,0.4)', borderRadius: 20,
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', margin: '0 auto 22px',
            background: 'rgba(207,181,59,0.08)', border: '1px solid rgba(207,181,59,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#CFB53B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 10px', fontFamily: 'monospace' }}>
            Pro Feature
          </h3>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', margin: '0 0 28px', lineHeight: 1.7 }}>
            The Metal Marketplace is available on the Pro plan. Post listings, negotiate deals, and connect with verified traders.
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '0 0 18px', textAlign: 'center' }}>
            <span style={{ textDecoration: 'line-through' }}>₹299/mo</span>
            {'  '}<span style={{ color: '#34d399', fontWeight: 700 }}>Free for Founding Traders</span>
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setShowPaywall(true)} style={{
              padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 700,
              background: '#CFB53B', color: '#000', border: 'none', cursor: 'pointer',
              fontFamily: 'monospace', flex: 1, maxWidth: 200,
            }}>
              Get Pro — Free
            </button>
            <button onClick={() => window.history.back()} style={{
              padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 600,
              background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)',
              border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontFamily: 'monospace',
              flex: 1, maxWidth: 200,
            }}>
              Go Back
            </button>
          </div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 20 }}>
            Free for Month 1 · No payment required · Founding Trader perk
          </p>
        </div>
        <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} trigger="listing_contact" />
      </div>
    );
  }

  // KYC gate — blocks entire marketplace for unverified users
  if (user && !user.kycVerified) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-5 pb-24 md:pb-8">
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: 0 }}>
            Metal <span style={{ color: '#CFB53B' }}>Marketplace</span>
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: '2px 0 0' }}>
            Trade metals · Negotiate · Connect
          </p>
        </div>
        <KycGate user={user} navigate={navigate} />
      </div>
    );
  }

  if (user?.isBanned) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <AlertTriangle size={48} style={{ color: '#f87171', margin: '0 auto 16px' }} />
        <h3 style={{ fontFamily: 'monospace', color: '#f87171', fontSize: 20, marginBottom: 8 }}>Account Suspended</h3>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, maxWidth: 400, margin: '0 auto', lineHeight: 1.6 }}>
          {user.banReason || 'Your account has been suspended due to policy violations.'}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 16 }}>
          Contact support@metalxpress.in for assistance
        </p>
      </div>
    );
  }

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
  useEffect(() => { if (tab === 'my-listings') { loadMyListings(); loadDeals(); } }, [tab, user]);
  useEffect(() => { if (tab === 'my-deals') loadDeals(); }, [tab, user]);

  // Poll deals every 30s when on deals tab
  useEffect(() => {
    if (tab !== 'my-deals' || !user) return;
    const iv = setInterval(loadDeals, 30000);
    return () => clearInterval(iv);
  }, [tab, user]);

  const TABS = [
    ['browse', 'Browse'],
    ['post', 'Sell Metal'],
    ...(user ? [['my-listings', 'My Listings'], ['my-deals', 'My Deals']] : []),
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-5 pb-24 md:pb-8">
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: 0 }}>
              Metal <span style={{ color: '#CFB53B' }}>Marketplace</span>
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: '2px 0 0' }}>
              Trade metals · Negotiate · Connect
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
        {/* Subtle trust micro-strip — full version on landing page */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 10,
          fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
          {['PAN-verified', '0% commission', 'Dispute mediation', 'Ratings + history', 'All India deals'].map(t => (
            <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: '#34d399' }}>✓</span> {t}
            </span>
          ))}
        </div>
      </div>

      {tab === 'browse' && <BrowseTab listings={listings} loading={loading}
        filterMetal={filterMetal} setFilterMetal={setFilterMetal}
        filterCity={filterCity} setFilterCity={setFilterCity}
        user={user} navigate={navigate} onMakeOffer={setOfferListing}
        activeDeals={deals} onViewDeal={(dealId) => { setActiveDeal(dealId); setTab('my-deals'); }} />}

      {tab === 'post' && (user
        ? <>
              {isOnCooldown && (
                <div style={{ background: 'rgba(207,181,59,0.1)', border: '1px solid rgba(207,181,59,0.25)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 12, color: '#CFB53B', fontFamily: 'monospace' }}>
                  <AlertTriangle size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                  Your account is on a 7-day cooldown due to multiple disputes. You cannot create new deals or listings until {cooldownDate}.
                </div>
              )}
              <PostForm user={user} onSuccess={() => { setTab('my-listings'); loadMyListings(); }} />
            </>
        : <LoginPrompt navigate={navigate} />)}

      {tab === 'my-listings' && <MyListingsTab listings={myListings} onRefresh={loadMyListings} onBrowseRefresh={load} deals={deals} />}

      {tab === 'my-deals' && <>
        {isOnCooldown && (
          <div style={{ background: 'rgba(207,181,59,0.1)', border: '1px solid rgba(207,181,59,0.25)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 12, color: '#CFB53B', fontFamily: 'monospace' }}>
            <AlertTriangle size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Your account is on a 7-day cooldown due to multiple disputes. You cannot create new deals or listings until {cooldownDate}.
          </div>
        )}
        <MyDealsTab deals={deals} user={user}
          onRefresh={loadDeals} onViewDeal={setActiveDeal} />
      </>}

      {/* Offer Modal */}
      {offerListing && <OfferModal listing={offerListing}
        isOnCooldown={isOnCooldown} cooldownDate={cooldownDate}
        onClose={() => setOfferListing(null)}
        onSuccess={(deal) => { setOfferListing(null); setActiveDeal(deal); setTab('my-deals'); loadDeals(); }} />}

      {/* Deal Detail Panel */}
      {activeDeal && <DealDetailPanel dealId={typeof activeDeal === 'string' ? activeDeal : activeDeal.id}
        user={user} onClose={() => { setActiveDeal(null); loadDeals(); }} />}
    </div>
  );
}

/* ── Browse Tab ───────────────────────────────────────────────────── */
function BrowseTab({ listings, loading, filterMetal, setFilterMetal, filterCity, setFilterCity, user, navigate, onMakeOffer, activeDeals, onViewDeal }) {
  // Filter out the current user's own listings (can't make offer on own listing)
  const visibleListings = listings.filter(l => !user || l.userId !== user.id);

  // Build a map: listingId → dealId for active (negotiating/agreed) deals
  const activeDealMap = {};
  if (activeDeals) {
    activeDeals.forEach(d => {
      if (['negotiating', 'agreed'].includes(d.status) && d.listing?.id) {
        activeDealMap[d.listing.id] = d.id;
      }
    });
  }

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
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

      {!user ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Package size={48} style={{ color: 'rgba(207,181,59,0.2)', marginBottom: 16 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>
            Browse Metal Listings
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 20, maxWidth: 340, marginInline: 'auto' }}>
            Sign up or login to view listings, make offers, and connect with verified traders across India.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/signup')} style={{
              padding: '12px 32px', borderRadius: 10, fontSize: 14, fontWeight: 700,
              background: '#CFB53B', color: '#000', border: 'none', cursor: 'pointer',
            }}>Sign Up Free</button>
            <button onClick={() => navigate('/login')} style={{
              padding: '12px 32px', borderRadius: 10, fontSize: 14, fontWeight: 700,
              background: 'transparent', color: '#CFB53B', border: '1px solid rgba(207,181,59,0.4)', cursor: 'pointer',
            }}>Login</button>
          </div>
        </div>
      ) : loading ? <div style={{ textAlign: 'center', padding: 40 }}><ChakraLoader size={48} layout="block" label="Loading listings" /></div>
      : visibleListings.length === 0
        ? <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 40 }}>No listings found. Be the first to post!</p>
        : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: 16 }}>
            {visibleListings.map(l => {
              const existingDealId = user ? activeDealMap[l.id] : null;
              return (
                <ListingCard key={l.id} listing={l}
                  onAction={existingDealId
                    ? () => onViewDeal(existingDealId)
                    : () => onMakeOffer(l)}
                  actionLabel={existingDealId ? '📋 View My Offer' : 'Make Offer'} />
              );
            })}
          </div>}
    </div>
  );
}

/* ── Lightbox ─────────────────────────────────────────────────────── */
function Lightbox({ items, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex || 0);
  const videoRef = useRef(null);
  const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

  const toSrc = (url) => url.startsWith('/uploads/') ? `${BACKEND}${url}` : url;
  const isVideo = (url) => /\.(mp4|mov|webm)$/i.test(url);

  const prev = () => setIdx((i) => (i - 1 + items.length) % items.length);
  const next = () => setIdx((i) => (i + 1) % items.length);

  // keyboard nav
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [items.length]);

  const current = items[idx];
  const src = toSrc(current);

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.95)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Close */}
      <button onClick={onClose} style={{
        position: 'absolute', top: 16, right: 16, zIndex: 1,
        background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
        width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: '#fff',
      }}><X size={20} /></button>

      {/* Counter */}
      <div style={{
        position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
        fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace',
        background: 'rgba(0,0,0,0.5)', padding: '4px 12px', borderRadius: 20,
      }}>{idx + 1} / {items.length}</div>

      {/* Main media */}
      <div onClick={(e) => e.stopPropagation()} style={{
        maxWidth: '90vw', maxHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isVideo(current)
          ? <video ref={videoRef} src={src} controls autoPlay
              style={{ maxWidth: '90vw', maxHeight: '80vh', borderRadius: 10, outline: 'none' }} />
          : <img src={src} alt={`Media ${idx + 1}`}
              style={{ maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain', borderRadius: 10, userSelect: 'none' }} />
        }
      </div>

      {/* Prev / Next arrows */}
      {items.length > 1 && <>
        <button onClick={(e) => { e.stopPropagation(); prev(); }} style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
          width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#fff',
        }}><ChevronLeft size={22} /></button>
        <button onClick={(e) => { e.stopPropagation(); next(); }} style={{
          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
          background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
          width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#fff',
        }}><ChevronRight size={22} /></button>
      </>}

      {/* Thumbnail strip */}
      {items.length > 1 && (
        <div onClick={(e) => e.stopPropagation()} style={{
          position: 'absolute', bottom: 20,
          display: 'flex', gap: 8, padding: '8px 12px',
          background: 'rgba(0,0,0,0.5)', borderRadius: 12,
          maxWidth: '90vw', overflowX: 'auto',
        }}>
          {items.map((item, i) => {
            const s = toSrc(item);
            return (
              <div key={i} onClick={() => setIdx(i)} style={{
                width: 52, height: 52, borderRadius: 8, overflow: 'hidden', cursor: 'pointer', flexShrink: 0,
                border: i === idx ? '2px solid #CFB53B' : '2px solid transparent',
                position: 'relative',
              }}>
                {isVideo(item)
                  ? <div style={{ width: '100%', height: '100%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Play size={16} color="#CFB53B" />
                    </div>
                  : <img src={s} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                }
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Listing Card (image-first, clickable) ────────────────────────── */
function ListingCard({ listing: l, onAction, actionLabel, showStatus, onDelete, onPreview }) {
  const metalName = l.metal?.name || 'Metal';
  const gradeName = l.grade?.name || metalName;
  const priceStr = l.price ? `₹${fmt(l.price)}` : 'Negotiate';
  const totalVal = l.price && l.qty ? l.price * l.qty : null;
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

  const toSrc = (url) => url.startsWith('/uploads/') ? `${BACKEND}${url}` : url;
  const isVideo = (url) => /\.(mp4|mov|webm)$/i.test(url);
  const heroImage = l.imageUrls?.find(u => !isVideo(u));
  const extraCount = (l.imageUrls?.length || 0) - 1;

  const handleCardClick = (e) => {
    if (e.target.closest('button, a')) return; // ignore clicks on nested buttons
    if (onAction) onAction();
    else if (onPreview) onPreview();
  };

  const [cardHovered, setCardHovered] = useState(false);
  return (
    <>
    <div
      onClick={handleCardClick}
      onMouseEnter={() => setCardHovered(true)}
      onMouseLeave={() => setCardHovered(false)}
      style={{
        background: '#0D1420', borderRadius: 14, display: 'flex', flexDirection: 'column',
        border: `1px solid ${cardHovered ? 'rgba(207,181,59,0.3)' : 'rgba(255,255,255,0.07)'}`,
        boxShadow: cardHovered ? '0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(207,181,59,0.15)' : '0 2px 12px rgba(0,0,0,0.25)',
        transform: cardHovered ? 'translateY(-3px)' : 'none',
        transition: 'all 0.2s ease',
        cursor: (onAction || onPreview) ? 'pointer' : 'default',
        overflow: 'hidden',
      }}>
      {/* Hero image / placeholder */}
      <div onClick={(e) => { if (heroImage) { e.stopPropagation(); setLightboxIdx(0); } }}
        style={{ position: 'relative', height: 168, background: heroImage ? '#000' : '#0a0f1a',
          borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {heroImage ? (
          <img src={toSrc(heroImage)} alt={gradeName}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', cursor: 'zoom-in' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.15)' }}>
            <Package size={48} />
          </div>
        )}
        {/* Top-left badges overlay */}
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 6,
            background: 'rgba(207,181,59,0.95)', color: '#000', textTransform: 'uppercase', letterSpacing: '0.05em',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>{metalName}</span>
          {l.status === 'verified' && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 6,
              background: 'rgba(52,211,153,0.95)', color: '#000',
              display: 'flex', alignItems: 'center', gap: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
              <ShieldCheck size={11} /> VERIFIED
            </span>
          )}
          {showStatus && l.status === 'pending' && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 6,
              background: 'rgba(251,191,36,0.95)', color: '#000', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
              Pending Review
            </span>
          )}
          {showStatus && l.status === 'rejected' && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 6,
              background: 'rgba(248,113,113,0.95)', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
              Rejected
            </span>
          )}
        </div>
        {extraCount > 0 && (
          <span style={{ position: 'absolute', bottom: 12, right: 12, fontSize: 11, fontWeight: 700,
            padding: '4px 10px', borderRadius: 6, background: 'rgba(0,0,0,0.7)', color: '#fff',
            display: 'flex', alignItems: 'center', gap: 4, backdropFilter: 'blur(6px)' }}>
            <ImageIcon size={11} /> +{extraCount}
          </span>
        )}
        <div style={{ position: 'absolute', bottom: 12, left: 12, padding: '6px 12px', borderRadius: 8,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#fff', fontFamily: 'monospace' }}>{priceStr}</span>
          {l.price && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginLeft: 4 }}>/kg</span>}
        </div>
      </div>

      {/* Body — padded container */}
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>{gradeName}</h3>
      {l.sellerName && (
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, margin: '0 0 8px' }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>
            by <strong style={{ color: '#fff' }}>{l.sellerName}</strong>
          </span>
          {l.sellerKycVerified && (
            <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
              background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)',
              letterSpacing: '0.04em', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <ShieldCheck size={9} /> VERIFIED
            </span>
          )}
          {l.sellerCompletedDeals > 0 && (
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>
              {l.sellerCompletedDeals} prior deal{l.sellerCompletedDeals === 1 ? '' : 's'}
            </span>
          )}
          {l.sellerAvgRating > 0 && (
            <span style={{ fontSize: 9, color: '#fbbf24' }}>★ {l.sellerAvgRating.toFixed(1)}</span>
          )}
        </div>
      )}

      {/* Image thumbnail strip removed — hero image at top now handles primary preview */}

      {l.description && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '0 0 10px', lineHeight: 1.5 }}>
        {l.description.length > 100 ? l.description.slice(0, 100) + '…' : l.description}</p>}

      <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Weight size={12} /> {fmt(l.qty)} {l.unit || 'kg'}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {l.location}</span>
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {totalVal && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Total: ₹{fmt(totalVal)}</span>}
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          {onDelete && <button onClick={onDelete}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)'; }}
            style={{
              padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
              border: '1px solid rgba(248,113,113,0.3)', background: 'transparent', color: '#f87171', cursor: 'pointer',
              transition: 'all 0.15s',
            }}><Trash2 size={12} /></button>}
          {onAction && <button onClick={onAction}
            onMouseEnter={e => { e.currentTarget.style.background = '#D4A830'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(207,181,59,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#CFB53B'; e.currentTarget.style.boxShadow = 'none'; }}
            style={{
              padding: '8px 18px', borderRadius: 8, fontSize: 12, fontWeight: 700,
              background: '#CFB53B', color: '#000', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.15s',
            }}>{actionLabel || 'View'} <ArrowRight size={14} /></button>}
        </div>
      </div>
      </div>{/* close padded body */}
    </div>
    {lightboxIdx !== null && (
      <Lightbox items={l.imageUrls} startIndex={lightboxIdx} onClose={() => setLightboxIdx(null)} />
    )}
    </>
  );
}

/* ── Offer Modal (Make Offer) ─────────────────────────────────────── */
function OfferModal({ listing: l, onClose, onSuccess, isOnCooldown, cooldownDate }) {
  const [price, setPrice] = useState(l.price || '');
  const qty = l.qty; // qty comes from the listing, buyer can't change it
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [termsChecked, setTermsChecked] = useState(false);

  const totalVal = price && qty ? parseFloat(price) * parseFloat(qty) : 0;
  const commission = Math.max(Math.ceil(totalVal * 0.001), 1);

  const handleSubmit = async () => {
    if (!price) return setError('Please enter your offer price');
    setSubmitting(true); setError('');
    try {
      const res = await createDeal({ listingId: l.id, pricePerKg: parseFloat(price), qty: parseFloat(qty), message });
      onSuccess(res.data.deal);
    } catch (err) {
      const data = err.response?.data;
      // If an active deal already exists for this listing, go to it instead of showing error
      if (data?.dealId) {
        onSuccess({ id: data.dealId });
        return;
      }
      setError(data?.error || 'Failed to send offer. Please try again.');
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
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Your Offer (₹/kg) *</label>
          <input type="number" value={price} onChange={e => setPrice(e.target.value)}
            placeholder={l.price ? String(l.price) : 'Enter price'} style={inputStyle} />
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: '6px 0 0' }}>
            Quantity: <strong style={{ color: 'rgba(255,255,255,0.5)' }}>{fmt(l.qty)} kg</strong> (as listed by seller)
          </p>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Message (optional)</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)}
            placeholder="Any details about your requirements…"
            style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} />
        </div>

        {/* Commission preview — FREE for Founding Traders */}
        {totalVal > 0 && (
          <div style={{ background: 'rgba(52,211,153,0.08)', borderRadius: 10, padding: 12, marginBottom: 16,
            border: '1px solid rgba(52,211,153,0.2)', fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.5)' }}>
              <span>Deal value</span><span>₹{fmt(totalVal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4, gap: 8, flexWrap: 'wrap' }}>
              <span style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through', fontSize: 11 }}>
                Commission (0.1%): ₹{fmt(commission)}
              </span>
              <span style={{ color: '#34d399', fontWeight: 800, letterSpacing: '0.5px' }}>FREE</span>
            </div>
            <p style={{ fontSize: 10, color: 'rgba(207,181,59,0.7)', margin: '6px 0 0', fontWeight: 600 }}>
              🎉 0% commission for Founding Traders — limited time
            </p>
          </div>
        )}

        {error && <p style={{ color: '#f87171', fontSize: 12, marginBottom: 12 }}>{error}</p>}

        {isOnCooldown && (
          <p style={{ fontSize: 11, color: '#CFB53B', marginBottom: 12, fontFamily: 'monospace' }}>
            <AlertTriangle size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Your account is on cooldown until {cooldownDate}. You cannot make offers.
          </p>
        )}

        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 12, lineHeight: 1.5 }}>
          0% commission for Founding Traders — limited time. We'll honor this rate for life on your account.
          <a href="/terms#refund-policy" style={{ color: '#CFB53B' }}> View refund policy</a>
        </p>

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginBottom: 12 }}>
          <input type="checkbox" checked={termsChecked} onChange={e => setTermsChecked(e.target.checked)}
            style={{ marginTop: 3, accentColor: '#CFB53B', width: 16, height: 16, flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, fontFamily: 'monospace' }}>
            I agree to BhavX <a href="/terms" target="_blank" style={{ color: '#CFB53B' }}>Terms of Service</a>, the{' '}
            <a href="/terms#commission" target="_blank" style={{ color: '#CFB53B' }}>0.1% commission policy</a> (charged only after mutual agreement), and the{' '}
            <a href="/terms#refund-policy" target="_blank" style={{ color: '#CFB53B' }}>Refund Policy</a>.
          </span>
        </label>

        <button onClick={handleSubmit} disabled={submitting || isOnCooldown || !termsChecked} style={{
          width: '100%', padding: '14px', borderRadius: 10, fontSize: 14, fontWeight: 700,
          background: (submitting || isOnCooldown || !termsChecked) ? 'rgba(207,181,59,0.3)' : '#CFB53B', color: '#000', border: 'none',
          cursor: (submitting || isOnCooldown || !termsChecked) ? 'not-allowed' : 'pointer',
          opacity: submitting ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}><Send size={16} /> {submitting ? 'Sending…' : isOnCooldown ? 'On Cooldown' : 'Send Offer'}</button>
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
  const [disputeCategory, setDisputeCategory] = useState('');
  const [disputeEvidence, setDisputeEvidence] = useState([]);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);
  const [showRating, setShowRating] = useState(false);

  const refreshDeal = useCallback(async () => {
    try {
      const res = await fetchDealDetail(dealId);
      setDeal(res.data);
    } catch {}
  }, [dealId]);

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
        await loadDeal();
        setActionLoading('');
        setShowRating(true);
        return;
      } else if (action === 'dispute') {
        if (!disputeCategory) {
          setError('Please select an issue type');
          setActionLoading('');
          return;
        }
        if (!disputeReason || disputeReason.trim().length < 10) {
          setError('Please describe the issue in detail (at least 10 characters)');
          setActionLoading('');
          return;
        }
        await disputeDeal(deal.id, { reason: disputeReason, category: disputeCategory, evidence: disputeEvidence });
        setShowDispute(false);
        setDisputeReason('');
        setDisputeCategory('');
        setDisputeEvidence([]);
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
        display: 'flex', flexDirection: 'column', overflowY: 'auto', overflowX: 'hidden' }}>

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

        {/* Offer history (chat-like) — natural height, parent panel scrolls */}
        <div style={{ padding: '16px 20px' }}>
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

        {/* Action bar — non-scrolling. Outer panel (90vh) handles overflow. */}
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, marginBottom: 8 }}>
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

          {/* Agreed — pay commission (FREE for Founding Traders) */}
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
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through' }}>
                    Commission (0.1%): ₹{fmt(deal.commission)}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#34d399', letterSpacing: '0.5px' }}>
                    FREE
                  </span>
                </div>
                <p style={{ fontSize: 10, color: 'rgba(207,181,59,0.8)', margin: '4px 0 0', fontWeight: 600, letterSpacing: '0.3px' }}>
                  🎉 0% commission for Founding Traders — limited time
                </p>
              </div>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 8, lineHeight: 1.5 }}>
                We're not charging you commission on this deal. Click below to instantly reveal the seller's contact and complete your trade off-platform.
              </p>
              <button onClick={() => handleAction('pay')} disabled={!!actionLoading}
                style={{ width: '100%', padding: '14px', borderRadius: 10, fontSize: 14, fontWeight: 700,
                  background: '#34d399', color: '#000', border: 'none', cursor: 'pointer' }}>
                {actionLoading === 'pay' ? 'Processing…' : 'Reveal Contact — Free'}
              </button>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 6 }}>
                Founding Trader perk — no payment required.
              </p>
            </div>
          )}
          {deal.status === 'agreed' && myRole === 'seller' && (
            <div style={{ background: 'rgba(52,211,153,0.08)', borderRadius: 10, padding: 14,
              border: '1px solid rgba(52,211,153,0.15)', textAlign: 'center' }}>
              <Handshake size={20} style={{ color: '#34d399', marginBottom: 6 }} />
              <p style={{ fontSize: 13, fontWeight: 700, color: '#34d399' }}>Deal agreed! Waiting for buyer to confirm.</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                ₹{fmt(deal.agreedPrice)}/kg × {fmt(deal.agreedQty)} kg · 0% commission (Founding Trader)
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
              {/* Show fraud-safety banner when completed by either side */}
              {deal.status === 'completed' && (
                <div style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)',
                  borderRadius: 10, padding: 12, marginBottom: 10 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24', margin: '0 0 4px' }}>
                    ⚠️ Marked complete — Did you actually receive the goods/payment?
                  </p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.5 }}>
                    Either party can mark complete. If you didn't get what was promised,
                    raise a dispute below within 48 hours and our admin will mediate.
                  </p>
                </div>
              )}

              {(deal.status === 'connected' || deal.status === 'completed') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {deal.status === 'connected' && (
                    <button onClick={() => handleAction('complete')} disabled={!!actionLoading}
                      style={{ width: '100%', padding: '12px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                        background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)', cursor: 'pointer' }}>
                      {actionLoading === 'complete' ? 'Completing…' : 'Mark Deal as Completed'}
                    </button>
                  )}
                  {!showDispute ? (
                    <button onClick={() => setShowDispute(true)}
                      style={{ width: '100%', padding: '10px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                        background: deal.status === 'completed' ? 'rgba(248,113,113,0.12)' : 'transparent',
                        color: '#f87171', border: '1px solid rgba(248,113,113,0.3)', cursor: 'pointer' }}>
                      🚨 Report Issue / Raise Dispute
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

                      {/* Dispute category */}
                      <select value={disputeCategory} onChange={e => setDisputeCategory(e.target.value)}
                        style={{ ...selectStyle, fontSize: 12, padding: '10px 14px', marginBottom: 12 }}>
                        <option value="" style={optionStyle}>Select issue type...</option>
                        <option value="seller_no_response" style={optionStyle}>Seller never responded after connection</option>
                        <option value="buyer_ghosted" style={optionStyle}>Buyer stopped responding</option>
                        <option value="material_quality" style={optionStyle}>Material quality doesn't match listing</option>
                        <option value="fake_listing" style={optionStyle}>Fake listing / scam attempt</option>
                        <option value="both_claim_no_deal" style={optionStyle}>Deal didn't happen</option>
                        <option value="other" style={optionStyle}>Other issue</option>
                      </select>

                      {/* Refund eligibility hint */}
                      {disputeCategory && (
                        <div style={{ padding: '8px 12px', borderRadius: 6, marginBottom: 12, fontSize: 11, fontFamily: 'monospace',
                          background: ['seller_no_response','fake_listing'].includes(disputeCategory) ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
                          color: ['seller_no_response','fake_listing'].includes(disputeCategory) ? '#34d399' : '#f87171',
                          border: `1px solid ${['seller_no_response','fake_listing'].includes(disputeCategory) ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}`
                        }}>
                          {['seller_no_response','fake_listing'].includes(disputeCategory) ? '\u2713 Eligible for commission refund' : '\u2717 Not eligible for refund \u2014 see Terms of Service'}
                        </div>
                      )}

                      <textarea value={disputeReason} onChange={e => setDisputeReason(e.target.value)}
                        placeholder="Describe the issue: e.g., seller not responding, material quality mismatch, deal done outside app…"
                        style={{ ...inputStyle, minHeight: 70, resize: 'vertical', fontSize: 12, marginBottom: 12 }} />

                      {/* Evidence upload */}
                      <div style={{ marginBottom: 12 }}>
                        <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6, display: 'block' }}>
                          Upload Evidence (photos, screenshots)
                        </label>
                        <input type="file" accept="image/*" multiple onChange={async (e) => {
                          const files = Array.from(e.target.files);
                          if (files.length === 0) return;
                          setUploadingEvidence(true);
                          try {
                            const res = await uploadMedia(files);
                            setDisputeEvidence(prev => [...prev, ...(res.data.urls || res.data.files || [])]);
                          } catch (err) { alert('Upload failed'); }
                          setUploadingEvidence(false);
                          e.target.value = '';
                        }} style={{ display: 'none' }} id="evidence-upload" />
                        <label htmlFor="evidence-upload" style={{
                          display: 'inline-block', padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
                          border: '1px dashed rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.4)', fontSize: 12, fontFamily: 'monospace'
                        }}>{uploadingEvidence ? 'Uploading...' : '\uD83D\uDCCE Attach Evidence'}</label>
                        {disputeEvidence.length > 0 && (
                          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                            {disputeEvidence.map((f, i) => (
                              <div key={i} style={{ position: 'relative' }}>
                                <img src={f.startsWith('/uploads/') ? `${import.meta.env.VITE_API_URL?.replace('/api','') || 'http://localhost:3001'}${f}` : f}
                                  style={{ width: 56, height: 56, borderRadius: 6, objectFit: 'cover' }} />
                                <button onClick={() => setDisputeEvidence(prev => prev.filter((_,j) => j!==i))} style={{
                                  position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%',
                                  background: '#f87171', border: 'none', color: '#fff', fontSize: 10, cursor: 'pointer', lineHeight: 1
                                }}>{'\u00d7'}</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {(() => {
                        const reasonValid = disputeReason.trim().length >= 10;
                        const canSubmit = !!disputeCategory && reasonValid && !actionLoading;
                        const hint = !disputeCategory
                          ? 'Select an issue type to continue'
                          : !reasonValid
                          ? `Describe the issue — ${10 - disputeReason.trim().length} more characters`
                          : null;
                        return (
                          <>
                            {error && <p style={{ color: '#f87171', fontSize: 11, margin: '0 0 8px', fontFamily: 'monospace' }}>{error}</p>}
                            {hint && !error && (
                              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: '0 0 8px', fontFamily: 'monospace' }}>{hint}</p>
                            )}
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button onClick={() => handleAction('dispute')} disabled={!canSubmit}
                                style={{ flex: 1, padding: '10px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                                  background: canSubmit ? '#f87171' : 'rgba(248,113,113,0.3)',
                                  color: canSubmit ? '#000' : 'rgba(0,0,0,0.5)',
                                  border: 'none', cursor: canSubmit ? 'pointer' : 'not-allowed' }}>
                                {actionLoading === 'dispute' ? 'Submitting…' : 'Submit Dispute'}
                              </button>
                              <button onClick={() => { setShowDispute(false); setDisputeReason(''); setDisputeCategory(''); setDisputeEvidence([]); setError(''); }}
                                style={{ padding: '10px 16px', borderRadius: 8, fontSize: 12,
                                  background: 'transparent', color: '#666', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                                Cancel
                              </button>
                            </div>
                          </>
                        );
                      })()}
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

          {/* Cancelled / expired — show meaningful reason */}
          {['cancelled', 'expired'].includes(deal.status) && (
            <div style={{ background: 'rgba(107,114,128,0.08)', borderRadius: 10,
              border: '1px solid rgba(107,114,128,0.2)', padding: 14, textAlign: 'center' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.65)', margin: '0 0 4px' }}>
                Deal {deal.status}
              </p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.5 }}>
                {deal.cancellationReason === 'listing_sold_to_another_buyer'
                  ? 'The seller accepted another buyer\'s offer. Browse other listings to find a similar match.'
                  : deal.status === 'expired'
                  ? 'No activity for 7+ days — auto-expired.'
                  : 'This negotiation was cancelled.'}
              </p>
            </div>
          )}
        </div>
      </div>
      {showRating && (
        <RatingModal dealId={deal.id} counterpartyName={myRole === 'buyer' ? deal.seller?.name : deal.buyer?.name}
          onClose={() => { setShowRating(false); refreshDeal(); }}
          onSubmit={() => { setShowRating(false); refreshDeal(); }} />
      )}
    </Overlay>
  );
}

/* ── Rating Modal ────────────────────────────────────────────────── */
function RatingModal({ dealId, counterpartyName, onClose, onSubmit }) {
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (score === 0) return;
    setSubmitting(true);
    try {
      await rateDeal(dealId, { score, comment });
      onSubmit?.();
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to submit rating');
    }
    setSubmitting(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#0D1420', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 24, maxWidth: 400, width: '100%' }}>
        <h3 style={{ fontFamily: 'monospace', color: '#CFB53B', fontSize: 18, marginBottom: 4 }}>Rate Your Experience</h3>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 20 }}>How was your deal with {counterpartyName}?</p>

        {/* 5 stars */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
          {[1,2,3,4,5].map(s => (
            <span key={s} onClick={() => setScore(s)} style={{
              fontSize: 32, cursor: 'pointer', color: s <= score ? '#CFB53B' : 'rgba(255,255,255,0.15)',
              transition: 'color 0.2s'
            }}>{'★'}</span>
          ))}
        </div>
        <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>
          {score === 0 ? 'Tap a star to rate' : ['', 'Poor', 'Below Average', 'Good', 'Very Good', 'Excellent'][score]}
        </p>

        <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Optional: share your experience..."
          maxLength={500} rows={3} style={{
            width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8, padding: 12, color: '#fff', fontFamily: 'monospace', fontSize: 12, resize: 'none', marginBottom: 16,
            boxSizing: 'border-box',
          }} />

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleSubmit} disabled={score === 0 || submitting} style={{
            flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', cursor: score > 0 ? 'pointer' : 'default',
            backgroundColor: score > 0 ? '#CFB53B' : 'rgba(207,181,59,0.3)', color: '#000', fontWeight: 700, fontFamily: 'monospace', fontSize: 13
          }}>{submitting ? 'Submitting...' : 'Submit Rating'}</button>
          <button onClick={onClose} style={{
            padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
            background: 'transparent', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace', fontSize: 13
          }}>Skip</button>
        </div>
      </div>
    </div>
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
function MyListingsTab({ listings, onRefresh, onBrowseRefresh, deals = [] }) {
  const [deleting, setDeleting] = useState(null);
  const [previewListing, setPreviewListing] = useState(null); // listing being previewed-as-buyer

  // Build map of listing → most-relevant deal status.
  // Priority: completed/connected/paid (sold) > agreed > negotiating.
  // We need this priority because a listing can have multiple historical deals
  // (e.g. one completed + one negotiating from a different buyer who didn't know
  // the listing was sold yet).
  const listingDealMap = {};
  const statusPriority = { completed: 5, connected: 4, paid: 4, agreed: 3, negotiating: 2 };
  deals.forEach(d => {
    if (!d.listing?.id) return;
    if (['cancelled', 'expired'].includes(d.status)) return;
    const cur = listingDealMap[d.listing.id];
    if (!cur || (statusPriority[d.status] || 0) > (statusPriority[cur] || 0)) {
      listingDealMap[d.listing.id] = d.status;
    }
  });

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
                {/* Suppress "Verified & Live" when listing has been sold (deal completed/connected/paid).
                    Otherwise it looks like the listing is still available for new offers. */}
                {l.status === 'verified' && !['completed', 'connected', 'paid'].includes(listingDealMap[l.id]) && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px',
                    borderRadius: 6, background: 'rgba(52,211,153,0.15)', color: '#34d399' }}>Verified & Live</span>
                )}
                {l.status === 'verified' && listingDealMap[l.id] === 'completed' && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px',
                    borderRadius: 6, background: 'rgba(148,163,184,0.18)', color: '#94a3b8' }}>Sold</span>
                )}
                {l.status === 'pending' && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px',
                  borderRadius: 6, background: 'rgba(207,181,59,0.15)', color: '#CFB53B' }}>Pending Review</span>}
                {l.status === 'rejected' && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px',
                  borderRadius: 6, background: 'rgba(248,113,113,0.15)', color: '#f87171' }}>Rejected</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: 0 }}>
                  {l.grade?.name || l.metal?.name}
                </h4>
                {listingDealMap[l.id] === 'negotiating' && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#CFB53B', color: '#000' }}>Offer Pending</span>
                )}
                {listingDealMap[l.id] === 'agreed' && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#34d399', color: '#000' }}>Deal Agreed</span>
                )}
                {(listingDealMap[l.id] === 'connected' || listingDealMap[l.id] === 'paid') && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#38bdf8', color: '#000' }}>Connected</span>
                )}
                {listingDealMap[l.id] === 'completed' && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#94a3b8', color: '#000' }}>Deal Completed</span>
                )}
              </div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                {fmt(l.qty)} kg · {l.location} {l.price ? `· ₹${fmt(l.price)}/kg` : '· Negotiable'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setPreviewListing(l)}
                title="Preview how buyers see your listing"
                style={{ padding: '8px 12px', borderRadius: 8, background: 'transparent',
                  border: '1px solid rgba(207,181,59,0.3)', color: '#CFB53B', cursor: 'pointer',
                  fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                👁 Preview
              </button>
              <button onClick={() => handleDelete(l.id)} disabled={deleting === l.id}
                title="Remove listing"
                style={{ padding: '8px', borderRadius: 8, background: 'transparent',
                  border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', cursor: 'pointer' }}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      ))}
      {previewListing && (
        <ListingPreviewModal listing={previewListing} onClose={() => setPreviewListing(null)} />
      )}
    </div>
  );
}

/* ── Listing Preview Modal (owner sees what buyers see) ───────────── */
function ListingPreviewModal({ listing: l, onClose }) {
  const metalName = l.metal?.name || 'Metal';
  const gradeName = l.grade?.name || metalName;
  const priceStr = l.price ? `₹${fmt(l.price)}` : 'Negotiable';
  const totalVal = l.price && l.qty ? l.price * l.qty : null;
  const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
  const toSrc = (url) => url?.startsWith('/uploads/') ? `${BACKEND}${url}` : url;
  const isVideo = (url) => /\.(mp4|mov|webm)$/i.test(url || '');
  const images = l.imageUrls || (l.images ? (typeof l.images === 'string' ? JSON.parse(l.images) : l.images) : []);
  const heroImage = images.find(u => !isVideo(u));
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 520, maxHeight: '92vh',
        borderRadius: 16, background: '#0D1420', border: '1px solid rgba(207,181,59,0.2)',
        overflowY: 'auto', overflowX: 'hidden' }}>
        {/* Preview banner */}
        <div style={{ background: 'rgba(207,181,59,0.12)', borderBottom: '1px solid rgba(207,181,59,0.25)',
          padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#CFB53B', margin: 0, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            👁 Preview as Buyer
          </p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#CFB53B', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Hero image carousel */}
        <div style={{ position: 'relative', height: 240, background: '#000' }}>
          {images.length > 0 ? (
            isVideo(images[activeIdx]) ? (
              <video src={toSrc(images[activeIdx])} controls
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <img src={toSrc(images[activeIdx] || heroImage)} alt={gradeName}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.15)' }}>
              <Package size={64} />
            </div>
          )}
          {images.length > 1 && (
            <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
              display: 'flex', gap: 6 }}>
              {images.map((_, i) => (
                <button key={i} onClick={() => setActiveIdx(i)}
                  style={{ width: 8, height: 8, borderRadius: '50%', border: 'none', cursor: 'pointer',
                    background: activeIdx === i ? '#CFB53B' : 'rgba(255,255,255,0.4)' }} />
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: 20 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6,
              background: 'rgba(207,181,59,0.15)', color: '#CFB53B', textTransform: 'uppercase' }}>{metalName}</span>
            {l.status === 'verified' && (
              <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6,
                background: 'rgba(52,211,153,0.15)', color: '#34d399',
                display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <ShieldCheck size={11} /> VERIFIED
              </span>
            )}
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>{gradeName}</h2>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: '#CFB53B', fontFamily: 'monospace' }}>{priceStr}</span>
            {l.price && <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>per kg</span>}
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 16, flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Weight size={14} /> {fmt(l.qty)} {l.unit || 'kg'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={14} /> {l.location}
            </span>
          </div>
          {totalVal && (
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: '0 0 16px' }}>
              Total deal value: <strong style={{ color: '#fff' }}>₹{fmt(totalVal)}</strong>
            </p>
          )}
          {l.description && (
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 12, marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', margin: '0 0 6px',
                letterSpacing: '0.05em', textTransform: 'uppercase' }}>Description</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {l.description}
              </p>
            </div>
          )}
          <div style={{ background: 'rgba(207,181,59,0.06)', border: '1px solid rgba(207,181,59,0.2)',
            borderRadius: 8, padding: 12 }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.5 }}>
              ℹ️ This is how buyers see your listing. They'd see a "Make Offer" button here. As the owner,
              you can edit by deleting + reposting.
            </p>
          </div>
        </div>
      </div>
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
  const [imageUrls, setImageUrls] = useState([]); // uploaded file paths
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [termsChecked, setTermsChecked] = useState(false);

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

  if (user && !user.kycVerified) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <Shield size={48} style={{ color: 'rgba(207,181,59,0.3)', margin: '0 auto 16px' }} />
        <h3 style={{ fontFamily: 'monospace', color: '#CFB53B', fontSize: 18, marginBottom: 8 }}>KYC Verification Required</h3>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, maxWidth: 400, margin: '0 auto 16px', lineHeight: 1.6 }}>
          Complete identity verification (Aadhaar/PAN) before posting listings. This protects all traders on the platform.
        </p>
        <button onClick={() => window.location.href = '/profile'} style={{
          padding: '10px 24px', borderRadius: 8, border: 'none', cursor: 'pointer',
          backgroundColor: '#CFB53B', color: '#000', fontWeight: 700, fontFamily: 'monospace', fontSize: 13
        }}>Complete KYC &rarr;</button>
      </div>
    );
  }

  return (
    <div style={{ background: '#0D1420', borderRadius: 16, border: '1px solid rgba(207,181,59,0.15)', padding: 24, maxWidth: 600 }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>Sell Your Metal</h3>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '0 0 20px' }}>
        Your listing will be reviewed before going live. Buyers negotiate and pay a small commission to connect.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 12 }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={labelStyle}>Quantity (kg) *</label>
          <input type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="1000" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Price (₹/kg)</label>
          <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="Leave blank for negotiable" style={inputStyle} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={labelStyle}>Location *</label>
          <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Delhi, Mumbai" style={inputStyle} />
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

      {/* Photo/Video Upload */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Photos / Videos (up to 5)</label>
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', margin: '0 0 8px' }}>
          Upload at least 4 clear photos or a video to help buyers verify quality
        </p>
        {/* Preview thumbnails */}
        {imageUrls.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            {imageUrls.map((url, i) => (
              <div key={i} style={{ position: 'relative' }}>
                {url.match(/\.(mp4|mov|webm)$/i) ? (
                  <video src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}${url}`}
                    style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }} />
                ) : (
                  <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}${url}`}
                    alt={`upload ${i + 1}`}
                    style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }} />
                )}
                <button onClick={() => setImageUrls(imageUrls.filter((_, j) => j !== i))}
                  style={{ position: 'absolute', top: -4, right: -4, width: 20, height: 20, borderRadius: '50%',
                    background: '#f87171', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              </div>
            ))}
          </div>
        )}
        {imageUrls.length < 5 && (
          <label style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '16px 20px', borderRadius: 10, cursor: uploading ? 'wait' : 'pointer',
            border: '2px dashed rgba(207,181,59,0.3)', background: 'rgba(207,181,59,0.05)',
            transition: 'all 0.15s',
          }}>
            <input type="file" accept="image/*,video/mp4,video/mov,video/webm" multiple
              style={{ display: 'none' }}
              disabled={uploading}
              onChange={async (e) => {
                const files = Array.from(e.target.files || []);
                if (files.length === 0) return;
                const remaining = 5 - imageUrls.length;
                const toUpload = files.slice(0, remaining);
                setUploading(true); setError('');
                try {
                  const res = await uploadMedia(toUpload);
                  setImageUrls(prev => [...prev, ...(res.data.urls || [])]);
                } catch (err) {
                  setError(err.response?.data?.error || 'Upload failed. Max 5MB per file.');
                } finally { setUploading(false); e.target.value = ''; }
              }} />
            <Camera size={18} color="#CFB53B" />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#CFB53B' }}>
              {uploading ? 'Uploading…' : `Add Photos${imageUrls.length > 0 ? ` (${5 - imageUrls.length} left)` : ''}`}
            </span>
          </label>
        )}
        <p style={{ fontSize: 11, fontFamily: 'monospace', marginTop: 8, color: imageUrls.length >= 4 ? '#34d399' : '#CFB53B' }}>
          {imageUrls.length}/4 minimum
        </p>
      </div>

      {error && <p style={{ color: '#f87171', fontSize: 12, marginBottom: 12 }}>{error}</p>}

      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginBottom: 12 }}>
        <input type="checkbox" checked={termsChecked} onChange={e => setTermsChecked(e.target.checked)}
          style={{ marginTop: 3, accentColor: '#CFB53B', width: 16, height: 16, flexShrink: 0 }} />
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, fontFamily: 'monospace' }}>
          I confirm this listing is accurate and I agree to the{' '}
          <a href="/terms" target="_blank" style={{ color: '#CFB53B' }}>Terms of Service</a>,{' '}
          <a href="/terms#dispute" target="_blank" style={{ color: '#CFB53B' }}>Dispute Policy</a>, and that BhavX may verify this listing before publishing.
        </span>
      </label>

      <button onClick={handleSubmit} disabled={submitting || !termsChecked || imageUrls.length < 4} style={{
        width: '100%', padding: '14px', borderRadius: 10, fontSize: 14, fontWeight: 700,
        background: (submitting || !termsChecked || imageUrls.length < 4) ? 'rgba(207,181,59,0.3)' : '#CFB53B',
        color: '#000', border: 'none',
        cursor: (submitting || !termsChecked || imageUrls.length < 4) ? 'not-allowed' : 'pointer',
        opacity: submitting ? 0.6 : 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        <Plus size={16} />
        {submitting ? 'Submitting…' : imageUrls.length < 4 ? 'Add at least 4 photos/videos' : 'Submit for Review'}
      </button>

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
      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, marginBottom: 12 }}>Login to sell your metal</p>
      <button onClick={() => navigate('/login')} style={{
        padding: '12px 32px', borderRadius: 10, fontSize: 14, fontWeight: 700,
        background: '#CFB53B', color: '#000', border: 'none', cursor: 'pointer',
      }}>Login / Sign Up</button>
    </div>
  );
}

/* ── KYC / Verification Gate (blocks entire marketplace) ──────────── */
function KycGate({ user, navigate }) {
  const isJustChecking = user?.traderType === 'CHECKING_RATES';

  return (
    <div style={{ textAlign: 'center', padding: '40px 24px', maxWidth: 520, margin: '0 auto' }}>
      <div style={{
        width: 64, height: 64, borderRadius: 16, margin: '0 auto 20px',
        background: 'linear-gradient(135deg, rgba(207,181,59,0.15), rgba(207,181,59,0.05))',
        border: '1px solid rgba(207,181,59,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Shield size={28} color="#CFB53B" />
      </div>

      <h3 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
        {isJustChecking ? 'Join as a Trader to Access Marketplace' : 'Verify Your Identity to Continue'}
      </h3>

      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: 400, margin: '0 auto 24px' }}>
        {isJustChecking
          ? 'Marketplace features are available to verified traders. Update your profile and complete a quick identity check — it takes under 2 minutes.'
          : 'To keep the marketplace safe for everyone, we verify all participants before they can browse, post, or trade. Quick PAN-based check — under 2 minutes.'}
      </p>

      {/* Trust indicators */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, maxWidth: 360, margin: '0 auto 28px', textAlign: 'left' }}>
        {[
          'PAN-based identity check',
          'End-to-end encrypted',
          'Verified trader badge',
          'Industry-standard security',
        ].map(t => (
          <span key={t} style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle size={12} color="#34d399" style={{ flexShrink: 0 }} /> {t}
          </span>
        ))}
      </div>

      {/* Professional data promise */}
      <div style={{
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12, padding: '14px 18px', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px',
      }}>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.7 }}>
          Your identity details are stored securely with bank-grade encryption. We use PAN only for trader verification —
          your data is never shared with external parties or used for any purpose beyond confirming your identity on BhavX.
        </p>
      </div>

      <button onClick={() => navigate('/profile')} style={{
        padding: '14px 36px', borderRadius: 12, fontWeight: 700, fontSize: 15,
        background: '#CFB53B', color: '#000', border: 'none', cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(207,181,59,0.25)',
      }}>
        {isJustChecking ? 'Update Profile & Verify' : 'Complete Verification →'}
      </button>

      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 16 }}>
        Takes less than 2 minutes · Secure & confidential
      </p>
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
