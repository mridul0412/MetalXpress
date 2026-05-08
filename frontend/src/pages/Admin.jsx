import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Lock, Save, ClipboardPaste, ChevronLeft, LogOut,
  CheckCircle, AlertCircle, MapPin, Zap,
} from 'lucide-react';
import { adminParsePreview, saveParsedRates, fetchPendingListings, verifyListing, fetchDisputes, resolveDispute, fetchPendingKyc, approveKyc, rejectKyc } from '../utils/api';

const ADMIN_PASS_KEY = 'mx_admin_pass';

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
      <div style={{ minHeight: '100vh', background: '#080E1A', display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: 16 }}>
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
            <button type="submit" style={{ width: '100%', padding: '13px', borderRadius: 12,
              fontWeight: 700, fontSize: 14, background: '#CFB53B', color: '#000',
              border: 'none', cursor: 'pointer' }}>
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
        borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 16px',
      }}>
        <div style={{ maxWidth: 760, margin: '0 auto', height: 56,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#CFB53B',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 13, color: '#000', letterSpacing: '-0.02em' }}>
              MX
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)',
              letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              BhavX Admin
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px',
              borderRadius: 8, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              textDecoration: 'none' }}>
              <ChevronLeft size={14} /> Exit to App
            </a>
            <button onClick={handleLogout}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px',
                borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#f87171',
                background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
                cursor: 'pointer' }}>
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* ── Page body ── */}
      <AdminBody />
    </div>
  );
}

// ── Admin Body with Tabs ──────────────────────────────────────────────────────
function AdminBody() {
  const [adminTab, setAdminTab] = useState('rates');
  const ADMIN_TABS = [['rates', 'Rate Management'], ['marketplace', 'Listings'], ['kyc', 'KYC Review'], ['disputes', 'Disputes']];

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '28px 16px 80px' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {ADMIN_TABS.map(([val, label]) => (
          <button key={val} onClick={() => setAdminTab(val)} style={{
            padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700,
            border: 'none', cursor: 'pointer',
            background: adminTab === val ? '#CFB53B' : 'rgba(255,255,255,0.05)',
            color: adminTab === val ? '#000' : 'rgba(255,255,255,0.4)',
          }}>{label}</button>
        ))}
      </div>

      {adminTab === 'rates' && (
        <div>
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>Rate Management</h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
              Paste any WhatsApp broadcast · The parser auto-detects the type
            </p>
          </div>
          <UnifiedParserPanel />
        </div>
      )}

      {adminTab === 'marketplace' && <MarketplaceAdmin />}
      {adminTab === 'kyc' && <KycAdmin />}
      {adminTab === 'disputes' && <DisputesAdmin />}
    </div>
  );
}

// ── Marketplace Admin (detailed listing verification) ─────────────────────────
function MarketplaceAdmin() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [loadError, setLoadError] = useState('');

  const load = async () => {
    setLoading(true);
    setLoadError('');
    try {
      setListings((await fetchPendingListings()).data || []);
    } catch (err) {
      setListings([]);
      const status = err.response?.status;
      if (status === 403) {
        setLoadError('Admin password incorrect. Click "Reset admin password" below.');
      } else if (status === 401) {
        setLoadError('Admin authentication failed. Check password.');
      } else {
        setLoadError(err.response?.data?.error || err.message || 'Failed to load pending listings');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetAdminPassword = () => {
    localStorage.removeItem('mx_admin_pass');
    const newPass = prompt('Enter admin password (production value, not dev):');
    if (newPass) {
      localStorage.setItem('mx_admin_pass', newPass);
      load();
    }
  };

  useEffect(() => { load(); }, []);

  const handleVerify = async (id, status) => {
    setActionId(id);
    try {
      await verifyListing(id, status);
      load();
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
    finally { setActionId(''); }
  };

  const cardBg = '#0D1420';
  const sectionStyle = { background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 12, marginTop: 10, border: '1px solid rgba(255,255,255,0.05)' };
  const kvStyle = { display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12, borderBottom: '1px solid rgba(255,255,255,0.04)' };
  const kvLabel = { color: 'rgba(255,255,255,0.4)' };
  const kvValue = { color: '#fff', fontWeight: 600, fontFamily: 'monospace' };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>Pending Listings</h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
          Review listing details, seller info, and photos before approving
        </p>
      </div>

      {loading ? <p style={{ color: 'rgba(255,255,255,0.3)' }}>Loading…</p>
      : loadError
        ? <div style={{ background: 'rgba(248,113,113,0.08)', borderRadius: 14, padding: 24,
            border: '1px solid rgba(248,113,113,0.3)' }}>
            <p style={{ color: '#f87171', fontSize: 14, fontWeight: 700, margin: '0 0 8px' }}>⚠ {loadError}</p>
            <button onClick={resetAdminPassword} style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700,
              background: '#CFB53B', color: '#000', border: 'none', cursor: 'pointer',
            }}>Reset admin password</button>
          </div>
      : listings.length === 0
        ? <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: 40,
            textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
            <CheckCircle size={32} style={{ color: 'rgba(52,211,153,0.4)', marginBottom: 8 }} />
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>No pending listings</p>
          </div>
        : <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {listings.map(l => {
              const isExpanded = expandedId === l.id;
              const imgs = l.imageUrls || [];
              const seller = l.user || {};
              const daysSinceJoin = seller.createdAt ? Math.floor((Date.now() - new Date(seller.createdAt)) / 86400000) : null;

              return (
                <div key={l.id} style={{ background: cardBg, borderRadius: 14,
                  border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>

                  {/* Summary row (always visible) */}
                  <div style={{ padding: 18, cursor: 'pointer' }} onClick={() => setExpandedId(isExpanded ? null : l.id)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', gap: 6, marginBottom: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                            background: 'rgba(207,181,59,0.15)', color: '#CFB53B' }}>{l.metal?.name}</span>
                          {l.grade && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6,
                            background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}>{l.grade.name}</span>}
                          {imgs.length > 0 && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6,
                            background: 'rgba(56,189,248,0.1)', color: '#38bdf8' }}>{imgs.length} photos</span>}
                          {seller.kycVerified && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                            background: 'rgba(52,211,153,0.15)', color: '#34d399' }}>KYC ✓</span>}
                          {seller.phoneVerified && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6,
                            background: 'rgba(52,211,153,0.08)', color: 'rgba(52,211,153,0.6)' }}>Phone ✓</span>}
                        </div>
                        <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 2px' }}>
                          {l.qty} kg · {l.location} {l.price ? `· ₹${l.price}/kg` : '· Negotiable'}
                        </p>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                          by {seller.name || 'N/A'} · {seller.city || 'Unknown city'} · Joined {daysSinceJoin != null ? `${daysSinceJoin}d ago` : 'N/A'}
                        </p>
                      </div>
                      <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.2)', transition: 'transform 0.2s',
                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div style={{ padding: '0 18px 18px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>

                      {/* Photos */}
                      {imgs.length > 0 && (
                        <div style={{ ...sectionStyle }}>
                          <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Photos</p>
                          <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
                            {imgs.map((url, i) => (
                              <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                                <img src={url} alt={`listing ${i + 1}`}
                                  style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }} />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Listing details */}
                      <div style={sectionStyle}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Listing Details</p>
                        <div style={kvStyle}><span style={kvLabel}>Metal</span><span style={kvValue}>{l.metal?.name}</span></div>
                        <div style={kvStyle}><span style={kvLabel}>Grade</span><span style={kvValue}>{l.grade?.name || 'Any'}</span></div>
                        <div style={kvStyle}><span style={kvLabel}>Quantity</span><span style={kvValue}>{l.qty} {l.unit || 'kg'}</span></div>
                        <div style={kvStyle}><span style={kvLabel}>Price</span><span style={kvValue}>{l.price ? `₹${l.price}/kg` : 'Negotiable'}</span></div>
                        {l.price && l.qty && <div style={kvStyle}><span style={kvLabel}>Total Value</span><span style={kvValue}>₹{(l.price * l.qty).toLocaleString('en-IN')}</span></div>}
                        <div style={kvStyle}><span style={kvLabel}>Location</span><span style={kvValue}>{l.location}</span></div>
                        <div style={kvStyle}><span style={kvLabel}>Contact</span><span style={kvValue}>{l.contact}</span></div>
                        <div style={{ ...kvStyle, borderBottom: 'none' }}><span style={kvLabel}>Posted</span><span style={kvValue}>{new Date(l.createdAt).toLocaleString('en-IN')}</span></div>
                        {l.description && (
                          <div style={{ marginTop: 8, padding: '8px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.03)', fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
                            {l.description}
                          </div>
                        )}
                      </div>

                      {/* Seller profile */}
                      <div style={sectionStyle}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Seller Profile</p>
                        <div style={kvStyle}><span style={kvLabel}>Name</span><span style={kvValue}>{seller.name || 'N/A'}</span></div>
                        <div style={kvStyle}><span style={kvLabel}>Phone</span><span style={kvValue}>{seller.phone || 'N/A'}</span></div>
                        <div style={kvStyle}><span style={kvLabel}>Email</span><span style={kvValue}>{seller.email || 'N/A'}</span></div>
                        <div style={kvStyle}><span style={kvLabel}>City</span><span style={kvValue}>{seller.city || 'N/A'}</span></div>
                        <div style={kvStyle}><span style={kvLabel}>Trader Type</span><span style={kvValue}>{seller.traderType || 'N/A'}</span></div>
                        <div style={kvStyle}><span style={kvLabel}>Phone Verified</span><span style={{ ...kvValue, color: seller.phoneVerified ? '#34d399' : '#f87171' }}>{seller.phoneVerified ? 'Yes' : 'No'}</span></div>
                        <div style={{ ...kvStyle, borderBottom: 'none' }}><span style={kvLabel}>KYC Verified</span><span style={{ ...kvValue, color: seller.kycVerified ? '#34d399' : '#f87171' }}>{seller.kycVerified ? 'Yes' : 'No'}</span></div>
                      </div>

                      {/* Verification checks */}
                      <div style={{ ...sectionStyle, background: 'rgba(207,181,59,0.04)', border: '1px solid rgba(207,181,59,0.1)' }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: '#CFB53B', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Verification Checklist</p>
                        {[
                          { label: 'Phone verified', ok: seller.phoneVerified },
                          { label: 'KYC documents', ok: seller.kycVerified },
                          { label: 'Photos attached', ok: imgs.length > 0 },
                          { label: 'Description provided', ok: !!l.description },
                          { label: 'Price set (not negotiable)', ok: !!l.price },
                          { label: 'Account age > 1 day', ok: daysSinceJoin > 0 },
                        ].map((check, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0', fontSize: 12 }}>
                            <span style={{ color: check.ok ? '#34d399' : '#6b7280' }}>{check.ok ? '✓' : '○'}</span>
                            <span style={{ color: check.ok ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)' }}>{check.label}</span>
                          </div>
                        ))}
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                        <button onClick={() => handleVerify(l.id, 'verified')} disabled={actionId === l.id}
                          style={{ flex: 1, padding: '12px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                            background: '#34d399', color: '#000', border: 'none', cursor: 'pointer' }}>
                          {actionId === l.id ? 'Processing…' : '✓ Approve & Go Live'}
                        </button>
                        <button onClick={() => handleVerify(l.id, 'rejected')} disabled={actionId === l.id}
                          style={{ padding: '12px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                            background: 'transparent', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)', cursor: 'pointer' }}>
                          ✗ Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>}
    </div>
  );
}

// ── KYC Admin ────────────────────────────────────────────────────────────────
function KycAdmin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState('');
  const [loadError, setLoadError] = useState('');
  const [rejectingId, setRejectingId] = useState(null); // user ID currently being rejected (shows inline form)
  const [rejectReason, setRejectReason] = useState('');

  const load = async () => {
    setLoading(true);
    setLoadError('');
    try {
      setUsers((await fetchPendingKyc()).data || []);
    } catch (err) {
      setUsers([]);
      setLoadError(err.response?.status === 403 ? 'Admin password incorrect.' : 'Failed to load pending KYC');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (userId) => {
    setActionId(userId);
    try {
      await approveKyc(userId);
      await load();
    } catch (err) {
      alert(err.response?.data?.error || 'Approval failed');
    } finally {
      setActionId('');
    }
  };

  const startReject = (userId) => {
    setRejectingId(userId);
    setRejectReason('');
  };
  const cancelReject = () => {
    setRejectingId(null);
    setRejectReason('');
  };
  const submitReject = async (userId) => {
    if (rejectReason.trim().length < 5) return;
    setActionId(userId);
    try {
      await rejectKyc(userId, rejectReason.trim());
      setRejectingId(null);
      setRejectReason('');
      await load();
    } catch (err) {
      alert(err.response?.data?.error || 'Rejection failed');
    } finally {
      setActionId('');
    }
  };

  const cardBg = '#0D1420';
  const kvStyle = { display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12, borderBottom: '1px solid rgba(255,255,255,0.04)' };
  const kvLabel = { color: 'rgba(255,255,255,0.4)' };
  const kvValue = { color: '#fff', fontWeight: 600, fontFamily: 'monospace' };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>KYC Review</h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '0 0 12px' }}>
          Manual review for Founding Traders. Auto-PAN-verify lands when Surepass token arrives.
        </p>

        <div style={{ background: 'rgba(207,181,59,0.06)', border: '1px solid rgba(207,181,59,0.2)',
          borderRadius: 10, padding: 14 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#CFB53B', margin: '0 0 6px' }}>
            ⚠️ No free public PAN-to-name verification API exists in India
          </p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.6 }}>
            Until Surepass is wired (paid PAN+name match via approved Protean reseller), use these
            manual sanity checks: <strong style={{ color: '#fff' }}>(1)</strong> Does the legal name
            look like a real Indian name? <strong style={{ color: '#fff' }}>(2)</strong> Does it
            roughly match the display name they signed up with?{' '}
            <strong style={{ color: '#fff' }}>(3)</strong> Does the trade category fit the
            business name? <strong style={{ color: '#fff' }}>(4)</strong> Account age — newer
            accounts deserve more scrutiny.
          </p>
        </div>
      </div>

      {loading ? <p style={{ color: 'rgba(255,255,255,0.3)' }}>Loading…</p>
      : loadError
        ? <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 14, padding: 24 }}>
            <p style={{ color: '#f87171', fontSize: 14, fontWeight: 700, margin: 0 }}>⚠ {loadError}</p>
          </div>
      : users.length === 0
        ? <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: 40, textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
            <CheckCircle size={32} style={{ color: 'rgba(52,211,153,0.4)', marginBottom: 8 }} />
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>No KYC submissions awaiting review</p>
          </div>
        : <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {users.map(u => (
              <div key={u.id} style={{ background: cardBg, borderRadius: 14, padding: 20, border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>
                      {u.name || '(no display name)'}
                      {u.name && u.legalName && u.name !== u.legalName && (
                        <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.4)', fontSize: 13 }}> · {u.legalName}</span>
                      )}
                    </p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                      {u.email} · {u.phone} · {u.city || '(no city)'}
                    </p>
                  </div>
                  <span style={{ fontSize: 10, padding: '4px 8px', borderRadius: 99, background: 'rgba(99,102,241,0.15)', color: '#818cf8', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                    {u.kycSubmittedAt ? new Date(u.kycSubmittedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 14, marginBottom: 14 }}>
                  <div style={kvStyle}><span style={kvLabel}>PAN Number</span>
                    <span style={{ ...kvValue, color: '#CFB53B', letterSpacing: '0.1em' }}>{u.panNumber}</span></div>
                  <div style={kvStyle}><span style={kvLabel}>Display Name (signup)</span><span style={kvValue}>{u.name || '—'}</span></div>
                  <div style={kvStyle}><span style={kvLabel}>Legal Name (PAN claim)</span><span style={{ ...kvValue, color: '#34d399' }}>{u.legalName}</span></div>
                  <div style={kvStyle}><span style={kvLabel}>Trade Category</span><span style={kvValue}>{u.tradeCategory}</span></div>
                  {u.businessName && <div style={kvStyle}><span style={kvLabel}>Business Name</span><span style={kvValue}>{u.businessName}</span></div>}
                  {u.gstNumber && <div style={kvStyle}><span style={kvLabel}>GSTIN</span><span style={kvValue}>{u.gstNumber}</span></div>}
                  <div style={kvStyle}><span style={kvLabel}>Trader Type</span><span style={kvValue}>{u.traderType}</span></div>
                  <div style={{ ...kvStyle, borderBottom: 'none' }}><span style={kvLabel}>Account age</span>
                    <span style={kvValue}>{u.createdAt ? Math.floor((Date.now() - new Date(u.createdAt)) / 86400000) : '?'} days</span></div>
                </div>

                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '0 0 12px', lineHeight: 1.6 }}>
                  Manual sanity check: does <strong style={{ color: '#CFB53B' }}>{u.legalName}</strong> read like
                  a real name in <strong style={{ color: '#CFB53B' }}>{u.tradeCategory}</strong>?
                  {u.name && u.legalName && u.name.toLowerCase() !== u.legalName.toLowerCase() && (
                    <span style={{ color: '#fbbf24' }}> Note: signup name "{u.name}" differs from claimed legal name.</span>
                  )}
                </p>

                {rejectingId === u.id ? (
                  <div style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)',
                    borderRadius: 10, padding: 14 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#f87171', margin: '0 0 8px' }}>
                      Reject reason — visible to user, min 5 chars
                    </p>
                    <textarea
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      placeholder="e.g. PAN does not match the registered name on NSDL"
                      style={{ width: '100%', minHeight: 70, padding: 10, borderRadius: 8,
                        background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff', fontSize: 13, fontFamily: 'monospace', resize: 'vertical' }}
                      autoFocus />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                      <span style={{ fontSize: 11, color: rejectReason.trim().length >= 5 ? '#34d399' : 'rgba(255,255,255,0.4)' }}>
                        {rejectReason.trim().length}/5 chars min
                      </span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={cancelReject} disabled={actionId === u.id}
                          style={{ padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                            background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)',
                            border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                          Cancel
                        </button>
                        <button onClick={() => submitReject(u.id)}
                          disabled={actionId === u.id || rejectReason.trim().length < 5}
                          style={{ padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                            background: '#f87171', color: '#000', border: 'none',
                            cursor: rejectReason.trim().length >= 5 ? 'pointer' : 'not-allowed',
                            opacity: rejectReason.trim().length >= 5 ? 1 : 0.5 }}>
                          {actionId === u.id ? 'Rejecting…' : 'Submit Rejection'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => handleApprove(u.id)} disabled={actionId === u.id}
                      style={{ flex: 1, padding: '11px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                        background: '#34d399', color: '#000', border: 'none', cursor: 'pointer' }}>
                      {actionId === u.id ? 'Working…' : '✓ Approve'}
                    </button>
                    <button onClick={() => startReject(u.id)} disabled={actionId === u.id}
                      style={{ flex: 1, padding: '11px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                        background: 'rgba(248,113,113,0.15)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)', cursor: 'pointer' }}>
                      ✗ Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
      }
    </div>
  );
}

// ── Disputes Admin ────────────────────────────────────────────────────────────
function DisputesAdmin() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState('');

  const load = async () => {
    setLoading(true);
    try { setDisputes((await fetchDisputes()).data || []); }
    catch { setDisputes([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleResolve = async (dealId, resolution) => {
    setActionId(dealId);
    try {
      await resolveDispute(dealId, resolution);
      load();
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
    finally { setActionId(''); }
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>Deal Disputes</h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
          Review disputes where commission is held in escrow. Resolve by refunding, completing, or cancelling.
        </p>
      </div>

      {loading ? <p style={{ color: 'rgba(255,255,255,0.3)' }}>Loading…</p>
      : disputes.length === 0
        ? <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: 40,
            textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
            <CheckCircle size={32} style={{ color: 'rgba(52,211,153,0.4)', marginBottom: 8 }} />
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>No open disputes</p>
          </div>
        : <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {disputes.map(d => {
              const lastOffer = d.offers?.[d.offers.length - 1];
              return (
                <div key={d.id} style={{ background: '#0D1420', borderRadius: 14,
                  border: '1px solid rgba(248,113,113,0.15)', padding: 18 }}>

                  <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                      background: 'rgba(248,113,113,0.15)', color: '#f87171' }}>DISPUTED</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                      background: 'rgba(207,181,59,0.15)', color: '#CFB53B' }}>{d.listing?.metal?.name}</span>
                  </div>

                  <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>
                    {d.listing?.grade?.name || d.listing?.metal?.name} · {d.agreedQty ? `${d.agreedQty} kg @ ₹${d.agreedPrice}/kg` : 'N/A'}
                  </p>

                  {/* Parties */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 10 }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', margin: '0 0 4px', textTransform: 'uppercase' }}>Buyer</p>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: '0 0 2px' }}>{d.buyer?.name || 'N/A'}</p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{d.buyer?.phone || d.buyer?.email || 'No contact'}</p>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 10 }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', margin: '0 0 4px', textTransform: 'uppercase' }}>Seller</p>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: '0 0 2px' }}>{d.seller?.name || 'N/A'}</p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{d.seller?.phone || d.seller?.email || 'No contact'}</p>
                    </div>
                  </div>

                  {/* Financials */}
                  <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                    <span>Deal: ₹{d.dealAmount?.toLocaleString('en-IN') || '—'}</span>
                    <span>Commission: ₹{d.commission?.toLocaleString('en-IN') || '—'}</span>
                    <span>Paid: {d.paidAt ? new Date(d.paidAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
                  </div>

                  {/* Dispute reason */}
                  <div style={{ marginTop: 10, background: 'rgba(248,113,113,0.06)', borderRadius: 8, padding: 12,
                    border: '1px solid rgba(248,113,113,0.1)' }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: '#f87171', margin: '0 0 4px', textTransform: 'uppercase' }}>Dispute Reason</p>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: 0, fontStyle: 'italic', lineHeight: 1.5 }}>
                      "{d.disputeReason}"
                    </p>
                    {d.disputedAt && <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', margin: '6px 0 0' }}>
                      Filed: {new Date(d.disputedAt).toLocaleString('en-IN')}
                    </p>}
                  </div>

                  {/* Resolution actions */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                    <button onClick={() => handleResolve(d.id, 'refund')} disabled={actionId === d.id}
                      style={{ flex: 1, padding: '10px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                        background: 'rgba(248,113,113,0.15)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)', cursor: 'pointer' }}>
                      Refund & Cancel
                    </button>
                    <button onClick={() => handleResolve(d.id, 'completed')} disabled={actionId === d.id}
                      style={{ flex: 1, padding: '10px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                        background: '#34d399', color: '#000', border: 'none', cursor: 'pointer' }}>
                      Mark Completed
                    </button>
                    <button onClick={() => handleResolve(d.id, 'cancelled')} disabled={actionId === d.id}
                      style={{ padding: '10px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                        background: 'transparent', color: '#6b7280', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              );
            })}
          </div>}
    </div>
  );
}

// ── Unified Smart Parser ──────────────────────────────────────────────────────
// Accepts ANY BhavX broadcast.
// After parsing, auto-detects: local spot rates vs LME/MCX global broadcast.
// Routes save to the right endpoint automatically — no manual selection needed.

function UnifiedParserPanel() {
  const [message, setMessage]   = useState('');
  const [preview, setPreview]   = useState(null);
  const [parsing, setParsing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [status, setStatus]     = useState(null);
  const [cities, setCities]     = useState([]);
  const [resolvedHub, setResolvedHub] = useState(null); // { slug, cityName } — only for local rates

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || ''}/api/cities`)
      .then(r => r.json())
      .then(d => setCities(Array.isArray(d) ? d : (d.cities || [])))
      .catch(() => {});
  }, []);

  // Match parsed cityHub to our cities list
  function resolveHub(cityHub) {
    if (!cityHub || cityHub.city === 'UNKNOWN') return null;
    const detectedCity = cityHub.city.toUpperCase();
    const detectedHub  = cityHub.hub?.toUpperCase();
    for (const city of cities) {
      const cityUp = city.name.toUpperCase();
      if (cityUp === detectedCity || cityUp.includes(detectedCity) || detectedCity.includes(cityUp)) {
        if (detectedHub && city.hubs?.length > 1) {
          const hub = city.hubs.find(h => {
            const h2 = h.name.toUpperCase();
            return h2 === detectedHub || h2.includes(detectedHub) || detectedHub.includes(h2);
          });
          if (hub) return { slug: hub.slug, cityName: city.name };
        }
        const hub = city.hubs?.[0];
        if (hub) return { slug: hub.slug, cityName: city.name };
      }
    }
    return null;
  }

  const handleParse = async () => {
    if (!message.trim()) return;
    setParsing(true); setStatus(null); setResolvedHub(null); setPreview(null);
    try {
      const res = await adminParsePreview(message);
      const parsed = res.data?.parsed || res.data;
      setPreview(parsed);
      if (parsed?.messageType === 'local-rates' || parsed?.messageType === 'mixed') {
        setResolvedHub(resolveHub(parsed?.cityHub));
      }
    } catch {
      setStatus({ type: 'error', text: 'Parse failed — check backend connection.' });
    } finally { setParsing(false); }
  };

  const handleSave = async () => {
    if (!preview) return;
    setSaving(true); setStatus(null);
    try {
      const type = preview.messageType;

      if (type === 'local-rates') {
        // Hub required for local rates
        await saveParsedRates({ hubSlug: resolvedHub.slug, rawMessage: message, parsed: preview });
        const count = preview.metals?.reduce((s, m) => s + (m.rates?.length || 0), 0) || 0;
        setStatus({ type: 'success', text: `✓ ${count} local rates saved for ${resolvedHub.cityName} — live on app` });

      } else if (type === 'lme-mcx') {
        await saveParsedRates({ rawMessage: message, parsed: preview });
        const lc = preview.lme?.length || 0;
        const mc = preview.mcx?.length || 0;
        const fx = (preview.forex?.length || 0) + (preview.indices?.length || 0);
        setStatus({ type: 'success', text: `✓ Saved: ${lc} LME · ${mc} MCX · ${fx} Forex — live on app` });

      } else if (type === 'mixed') {
        // Save both global and local
        await saveParsedRates({
          hubSlug: resolvedHub?.slug,
          rawMessage: message,
          parsed: preview,
        });
        const localCount = preview.metals?.reduce((s, m) => s + (m.rates?.length || 0), 0) || 0;
        const lc = preview.lme?.length || 0;
        setStatus({ type: 'success', text: `✓ Saved: ${lc} LME + ${localCount} local rates — live on app` });
      }

      setMessage(''); setPreview(null); setResolvedHub(null);
      setTimeout(() => setStatus(null), 5000);
    } catch {
      setStatus({ type: 'error', text: 'Save failed. Check admin password.' });
    } finally { setSaving(false); }
  };

  // Derive counts
  const localGrades = preview?.metals?.reduce((s, m) => s + (m.rates?.length || 0), 0) || 0;
  const lmeCount    = preview?.lme?.length    || 0;
  const mcxCount    = preview?.mcx?.length    || 0;
  const fxCount     = (preview?.forex?.length || 0) + (preview?.indices?.length || 0);

  // Can we save?
  const type = preview?.messageType;
  const canSave = preview && (
    (type === 'local-rates' && localGrades > 0 && resolvedHub) ||
    (type === 'lme-mcx'    && (lmeCount + mcxCount + fxCount) > 0) ||
    (type === 'mixed'      && (localGrades > 0 || lmeCount > 0))
  );

  // Type badge config
  const TYPE_CONFIG = {
    'local-rates': { label: 'Local Spot Rates',   color: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.25)' },
    'lme-mcx':     { label: 'LME / MCX Broadcast', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.25)' },
    'mixed':       { label: 'Mixed (LME + Local)',  color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.25)' },
    'unknown':     { label: 'No rates detected',    color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)' },
  };
  const typeCfg = type ? TYPE_CONFIG[type] : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
      borderRadius: 16, padding: 20,
      background: 'rgba(13,20,32,0.8)', backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <Zap size={16} color="#CFB53B" />
        <h3 style={{ fontSize: 17, fontWeight: 700, color: '#fff', margin: 0 }}>Smart Rate Parser</h3>
      </div>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '0 0 16px' }}>
        Paste any broadcast — LME/MCX global or city local rates. Parser auto-detects and routes.
      </p>

      <textarea
        value={message}
        onChange={e => { setMessage(e.target.value); setPreview(null); setResolvedHub(null); setStatus(null); }}
        placeholder={'Paste any BhavX WhatsApp broadcast here…\n\nWorks for both:\n• LME/MCX/Forex global broadcast\n• City local spot rates (Delhi, Mumbai, etc.)'}
        rows={9}
        style={{ width: '100%', padding: '12px', borderRadius: 10, fontSize: 12,
          fontFamily: 'monospace', background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none',
          resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6 }}
      />

      <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={handleParse} disabled={parsing || !message.trim()}
          style={btnStyle('#CFB53B', '#000', parsing || !message.trim())}>
          <ClipboardPaste size={13} style={{ marginRight: 5 }} />
          {parsing ? 'Parsing…' : 'Parse Message'}
        </button>

        {canSave && (
          <button onClick={handleSave} disabled={saving}
            style={btnStyle('#34d399', '#000', saving)}>
            <Save size={13} style={{ marginRight: 5 }} />
            {saving ? 'Saving…' : buildSaveLabel(type, resolvedHub, localGrades, lmeCount, mcxCount, fxCount)}
          </button>
        )}
      </div>

      {/* ── Detected type badge ── */}
      {preview && typeCfg && (
        <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 8,
          background: typeCfg.bg, border: `1px solid ${typeCfg.border}`,
          display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: typeCfg.color }}>
            {type === 'unknown' ? '⚠' : '✓'} Detected: {typeCfg.label}
          </span>

          {/* Data counts */}
          {type !== 'unknown' && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {lmeCount   > 0 && <Chip label={`${lmeCount} LME`}   color="#60a5fa" />}
              {mcxCount   > 0 && <Chip label={`${mcxCount} MCX`}   color="#CFB53B" />}
              {fxCount    > 0 && <Chip label={`${fxCount} Forex`}  color="#34d399" />}
              {localGrades > 0 && <Chip label={`${localGrades} local grades`} color="#f472b6" />}
            </div>
          )}

          {type === 'unknown' && (
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
              The message doesn't match any known format. Check the paste or message structure.
            </span>
          )}
        </div>
      )}

      {/* ── City auto-detect (local rates only) ── */}
      {preview && (type === 'local-rates' || type === 'mixed') && (
        <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 8,
          background: resolvedHub ? 'rgba(52,211,153,0.06)' : 'rgba(251,191,36,0.06)',
          border: `1px solid ${resolvedHub ? 'rgba(52,211,153,0.18)' : 'rgba(251,191,36,0.18)'}`,
          display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
          <MapPin size={13} color={resolvedHub ? '#34d399' : '#fbbf24'} />
          {resolvedHub ? (
            <span style={{ color: '#34d399' }}>
              City auto-detected: <strong>{resolvedHub.cityName}</strong>
            </span>
          ) : (
            <span style={{ color: '#fbbf24' }}>
              City "{preview.cityHub?.city || 'unknown'}" not in database —
              add it first or check the message header
            </span>
          )}
        </div>
      )}

      {/* ── LME preview ── */}
      {preview?.lme?.length > 0 && (
        <PreviewTable
          title="LME Rates ($/MT)"
          color="#60a5fa"
          rows={preview.lme.map(r => ({
            label: r.metal,
            value: `$${r.price.toLocaleString()}`,
            change: r.change,
          }))}
        />
      )}

      {/* ── MCX preview ── */}
      {preview?.mcx?.length > 0 && (
        <PreviewTable
          title="MCX Rates (₹/Kg)"
          color="#CFB53B"
          rows={preview.mcx.map(r => ({
            label: r.metal,
            value: `₹${r.price}`,
            change: r.change,
          }))}
        />
      )}

      {/* ── Forex preview ── */}
      {(preview?.forex?.length > 0 || preview?.indices?.length > 0) && (
        <PreviewTable
          title="Forex & Indices"
          color="#34d399"
          rows={[...(preview.forex || []), ...(preview.indices || [])].map(r => ({
            label: r.pair,
            value: r.price,
            change: r.change,
          }))}
        />
      )}

      {/* ── Local rates preview ── */}
      {preview?.metals?.length > 0 && (
        <div style={{ marginTop: 10, borderRadius: 10, overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.07)', maxHeight: 320, overflowY: 'auto' }}>
          {preview.metals.map((section) => (
            <div key={section.metal} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ padding: '6px 12px', background: 'rgba(244,114,182,0.08)',
                fontSize: 10, fontWeight: 700, color: '#f472b6', textTransform: 'uppercase',
                letterSpacing: '0.06em' }}>
                {section.metal} · {section.rates?.length} grades
              </div>
              {section.rates?.map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between',
                  padding: '5px 12px', fontSize: 12,
                  borderBottom: i < section.rates.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)' }}>{r.gradeName}</span>
                  <span style={{ color: '#fff', fontFamily: 'monospace', fontWeight: 600 }}>
                    ₹{r.buyPrice}{r.sellPrice ? ` / ₹${r.sellPrice}` : ''}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <StatusMsg status={status} />
    </motion.div>
  );
}

// ── Helper to build contextual save button label ─────────────────────────────
function buildSaveLabel(type, resolvedHub, localGrades, lmeCount, mcxCount, fxCount) {
  if (type === 'local-rates')
    return `Save ${localGrades} grades → ${resolvedHub?.cityName || '?'} · Go Live`;
  if (type === 'lme-mcx')
    return `Save ${lmeCount} LME · ${mcxCount} MCX · ${fxCount} Forex · Go Live`;
  if (type === 'mixed')
    return `Save All (LME + ${resolvedHub?.cityName || 'local'}) · Go Live`;
  return 'Save & Go Live';
}

// ── Shared UI components ──────────────────────────────────────────────────────

function PreviewTable({ title, color, rows }) {
  return (
    <div style={{ marginTop: 10, borderRadius: 10, overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.07)' }}>
      <div style={{ padding: '6px 12px', background: `${color}12`,
        fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {title}
      </div>
      {rows.map((r, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between',
          padding: '5px 12px', fontSize: 12,
          borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
          <span style={{ color: 'rgba(255,255,255,0.7)' }}>{r.label}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#fff', fontFamily: 'monospace', fontWeight: 600 }}>{r.value}</span>
            {r.change != null && r.change !== 0 && (
              <span style={{ fontSize: 11, color: r.change > 0 ? '#34d399' : '#f87171' }}>
                {r.change > 0 ? '+' : ''}{r.change}
              </span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}

function Chip({ label, color }) {
  return (
    <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700,
      background: `${color}18`, color, border: `1px solid ${color}30` }}>
      {label}
    </span>
  );
}

function StatusMsg({ status }) {
  if (!status) return null;
  const ok = status.type === 'success';
  return (
    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 12px', borderRadius: 10, fontSize: 13, fontWeight: 600,
      background: ok ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)',
      border: `1px solid ${ok ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}`,
      color: ok ? '#34d399' : '#f87171' }}>
      {ok ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
      {status.text}
    </div>
  );
}

function btnStyle(bg, color, disabled) {
  return {
    padding: '9px 16px', borderRadius: 10, fontWeight: 700, fontSize: 13,
    background: bg, color, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1, transition: 'all 0.15s',
    display: 'inline-flex', alignItems: 'center',
  };
}
