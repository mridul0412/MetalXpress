import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, MapPin, Shield, Save, LogOut,
  CheckCircle, AlertCircle, Smartphone, ChevronRight, Edit3,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, checkSubscription, requestOTP } from '../utils/api';

const inputStyle = {
  width: '100%', padding: '12px 14px', borderRadius: 10, fontSize: 13,
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
};
const labelStyle = {
  fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em',
  color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 6,
};

const TRADER_TYPES = [
  { value: 'BUYER', label: 'Buyer', desc: 'I buy scrap metal' },
  { value: 'SELLER', label: 'Seller', desc: 'I sell scrap metal' },
  { value: 'CHECKING_RATES', label: 'Just Checking', desc: 'Market observer' },
];

const TRADE_CATEGORIES = [
  'Scrap Collector / Kabadiwala',
  'Scrap Dealer / Merchant',
  'Factory / Manufacturer',
  'Recycler / Smelter',
  'Individual Trader',
  'Broker / Agent',
  'Other',
];

export default function Profile() {
  const { user, logout, subscription, loading: authLoading, refreshUser } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [traderTypes, setTraderTypes] = useState([]);
  const [businessName, setBusinessName] = useState('');
  const [tradeCategory, setTradeCategory] = useState('');

  // Phone OTP flow (for phone number changes)
  const [originalPhone, setOriginalPhone] = useState('');
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);

  // Save state
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // KYC section toggle
  const [showKyc, setShowKyc] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    setName(user.name || '');
    setEmail(user.email || '');
    setPhone(user.phone || '');
    setOriginalPhone(user.phone || '');
    setCity(user.city || '');
    setBusinessName(user.businessName || '');
    setTradeCategory(user.tradeCategory || '');
    const tt = user.traderType || 'CHECKING_RATES';
    if (tt === 'BOTH') setTraderTypes(['BUYER', 'SELLER']);
    else setTraderTypes([tt]);
  }, [user, authLoading]);

  const cleanPhone = (p) => p.replace(/[\s\-()]/g, '').replace(/^\+?91/, '').slice(-10);
  const phoneChanged = phone && cleanPhone(phone) !== (originalPhone || '');

  const handleSendPhoneOtp = async () => {
    setSendingOtp(true); setError('');
    try {
      await requestOTP(cleanPhone(phone));
      setPhoneOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally { setSendingOtp(false); }
  };

  const handleSave = async () => {
    // If phone changed, require OTP verification first
    if (phoneChanged && !phoneOtpSent) {
      setError('Please verify your new phone number first — click "Send OTP"');
      return;
    }
    if (phoneChanged && phoneOtpSent && phoneOtp.length < 4) {
      setError('Enter the OTP sent to your new phone number');
      return;
    }

    setSaving(true); setError(''); setMessage('');
    try {
      const hasBuyer = traderTypes.includes('BUYER');
      const hasSeller = traderTypes.includes('SELLER');
      const mappedType = (hasBuyer && hasSeller) ? 'BOTH'
        : hasBuyer ? 'BUYER'
        : hasSeller ? 'SELLER'
        : 'CHECKING_RATES';

      // If phone changed, pass OTP for backend to verify
      const payload = {
        name, email: email || undefined, city, traderType: mappedType,
        businessName: businessName || undefined,
        tradeCategory: tradeCategory || undefined,
        ...(tradeCategory && !user.kycVerified ? { kycComplete: true } : {}),
      };
      if (phoneChanged && phoneOtp) {
        payload.phone = cleanPhone(phone);
        payload.phoneOtp = phoneOtp;
      }

      await updateProfile(payload);
      await refreshUser(); // ← refresh AuthContext so changes show immediately
      setOriginalPhone(phone);
      setPhoneOtpSent(false);
      setPhoneOtp('');
      setMessage('Profile saved!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally { setSaving(false); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  if (authLoading) return (
    <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Loading…</div>
  );

  const isKycDone = user?.kycVerified;
  const isBuyer = traderTypes.includes('BUYER');
  const isSeller = traderTypes.includes('SELLER');
  const needsKyc = (isBuyer || isSeller) && !isKycDone;

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24 md:pb-8">
      <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 24 }}>
        <User size={22} style={{ verticalAlign: 'middle', marginRight: 8, color: '#CFB53B' }} />
        Profile & Settings
      </h2>

      {/* Subscription card */}
      <div style={{ background: '#0D1420', borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)', padding: 18, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 4px' }}>Subscription</p>
            <p style={{ fontSize: 16, fontWeight: 700, margin: 0,
              color: subscription?.plan === 'pro' || subscription?.plan === 'business' ? '#34d399' : '#CFB53B' }}>
              {subscription?.plan === 'pro' ? 'Pro Plan' : subscription?.plan === 'business' ? 'Business Plan' : 'Free Plan'}
            </p>
          </div>
          <Shield size={24} style={{ color: subscription?.plan === 'pro' || subscription?.plan === 'business' ? '#34d399' : 'rgba(255,255,255,0.15)' }} />
        </div>
        {(!subscription?.plan || subscription?.plan === 'free') && (
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '8px 0 0' }}>
            Upgrade to Pro for local spot rates, analytics, and more.
          </p>
        )}
      </div>

      {/* KYC status banner */}
      <div style={{
        background: isKycDone ? 'rgba(52,211,153,0.08)' : needsKyc ? 'rgba(207,181,59,0.08)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${isKycDone ? 'rgba(52,211,153,0.2)' : needsKyc ? 'rgba(207,181,59,0.2)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 12, padding: '14px 18px', marginBottom: 16,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        {isKycDone
          ? <CheckCircle size={20} color="#34d399" style={{ flexShrink: 0 }} />
          : <AlertCircle size={20} color={needsKyc ? '#CFB53B' : 'rgba(255,255,255,0.2)'} style={{ flexShrink: 0 }} />}
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 2px',
            color: isKycDone ? '#34d399' : needsKyc ? '#CFB53B' : 'rgba(255,255,255,0.4)' }}>
            {isKycDone ? 'Identity Verified ✓' : needsKyc ? 'Verification Required for Trading' : 'No Verification Needed'}
          </p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            {isKycDone
              ? 'You can post listings and make deals. Your verified badge is visible to other traders.'
              : needsKyc
              ? 'Complete your trade profile below to post listings and make deals.'
              : 'Buyers and sellers need verification. Rate watchers don\'t.'}
          </p>
        </div>
        {needsKyc && (
          <button onClick={() => setShowKyc(true)} style={{
            padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
            background: '#CFB53B', color: '#000', border: 'none', cursor: 'pointer', flexShrink: 0,
          }}>Verify</button>
        )}
      </div>

      {/* KYC inline section */}
      {(showKyc || (needsKyc)) && !isKycDone && (
        <div style={{ background: '#0D1420', borderRadius: 14, border: '1px solid rgba(207,181,59,0.2)', padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#CFB53B', margin: '0 0 4px' }}>
            🔒 Trader Verification (KYC)
          </h3>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '0 0 16px' }}>
            Just 2 quick fields. No government forms, no GST, no Aadhaar required.
          </p>

          {/* Privacy promise */}
          <div style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
            <p style={{ fontSize: 11, color: '#34d399', fontWeight: 700, margin: '0 0 4px' }}>🛡️ Your Privacy is Protected</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.6 }}>
              MetalXpress does <strong style={{ color: '#fff' }}>not</strong> report any transaction data to GST, Income Tax, or any government body.
              Verification is only to confirm you're a real trader — to protect the community from fraud.
              Your trade volume stays strictly between you and your counterparty.
            </p>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Trade Category <span style={{ color: '#f87171' }}>*</span></label>
            <select value={tradeCategory} onChange={e => setTradeCategory(e.target.value)}
              style={{ ...inputStyle, background: '#0a1020', color: tradeCategory ? '#fff' : 'rgba(255,255,255,0.3)' }}>
              <option value="" style={{ background: '#0D1420' }}>Select your trade type…</option>
              {TRADE_CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#0D1420' }}>{c}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Business / Trade Name <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400, textTransform: 'none' }}>(optional — can be just your name)</span></label>
            <input value={businessName} onChange={e => setBusinessName(e.target.value)}
              placeholder="e.g. Ram Kumar Scrap Traders" style={inputStyle} />
          </div>

          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '0 0 12px', fontStyle: 'italic' }}>
            Submitting this verifies you as a real trader and enables you to post listings and make offers.
          </p>
        </div>
      )}

      {/* Personal info form */}
      <div style={{ background: '#0D1420', borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)', padding: 20, marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 16px' }}>Personal Information</h3>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Full Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#CFB53B'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#CFB53B'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
        </div>

        {/* Phone with OTP verification if changed */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Phone
            {user?.phoneVerified && <span style={{ color: '#34d399', fontWeight: 400, marginLeft: 8, textTransform: 'none' }}>✓ Verified</span>}
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={phone} onChange={e => { setPhone(e.target.value); setPhoneOtpSent(false); setPhoneOtp(''); }}
              placeholder="+91 XXXXX XXXXX" style={{ ...inputStyle, flex: 1 }}
              onFocus={e => e.target.style.borderColor = '#CFB53B'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            {phoneChanged && !phoneOtpSent && (
              <button onClick={handleSendPhoneOtp} disabled={sendingOtp} style={{
                padding: '0 16px', borderRadius: 10, fontSize: 12, fontWeight: 700, flexShrink: 0,
                background: '#CFB53B', color: '#000', border: 'none', cursor: 'pointer',
                opacity: sendingOtp ? 0.6 : 1,
              }}>{sendingOtp ? '…' : 'Send OTP'}</button>
            )}
          </div>
          {phoneChanged && phoneOtpSent && (
            <div style={{ marginTop: 8 }}>
              <p style={{ fontSize: 11, color: '#34d399', margin: '0 0 6px' }}>
                ✓ OTP sent to {phone} (dev: use 1234)
              </p>
              <input value={phoneOtp} onChange={e => setPhoneOtp(e.target.value)}
                placeholder="Enter OTP" maxLength={4}
                style={{ ...inputStyle, width: 140, fontSize: 20, fontWeight: 700, textAlign: 'center', fontFamily: 'monospace', letterSpacing: '0.4em' }}
                onFocus={e => e.target.style.borderColor = '#CFB53B'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            </div>
          )}
          {phoneChanged && !phoneOtpSent && (
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '4px 0 0' }}>
              Changing your phone requires OTP verification
            </p>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>City</label>
          <input value={city} onChange={e => setCity(e.target.value)} placeholder="Delhi, Mumbai, etc." style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#CFB53B'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>I am a <span style={{ fontWeight: 400, textTransform: 'none' }}>(select all that apply)</span></label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {TRADER_TYPES.map(t => {
              const active = traderTypes.includes(t.value);
              return (
                <button key={t.value} onClick={() => {
                  setTraderTypes(prev => prev.includes(t.value)
                    ? prev.filter(v => v !== t.value) : [...prev, t.value]);
                }} style={{
                  padding: '10px 12px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                  background: active ? 'rgba(207,181,59,0.12)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${active ? 'rgba(207,181,59,0.3)' : 'rgba(255,255,255,0.06)'}`,
                  color: active ? '#CFB53B' : 'rgba(255,255,255,0.4)',
                  cursor: 'pointer', textAlign: 'left', position: 'relative',
                }}>
                  {active && <span style={{ position: 'absolute', top: 4, right: 6, fontSize: 10, color: '#CFB53B' }}>✓</span>}
                  <div>{t.label}</div>
                  <div style={{ fontSize: 10, opacity: 0.6, marginTop: 2 }}>{t.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {error && <p style={{ color: '#f87171', fontSize: 12, margin: '0 0 10px' }}>{error}</p>}
        {message && <p style={{ color: '#34d399', fontSize: 12, margin: '0 0 10px' }}>{message}</p>}

        <button onClick={handleSave} disabled={saving} style={{
          width: '100%', padding: '14px', borderRadius: 10, fontSize: 14, fontWeight: 700,
          background: '#CFB53B', color: '#000', border: 'none', cursor: 'pointer',
          opacity: saving ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <Save size={16} /> {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {/* Sign out */}
      <button onClick={handleLogout} style={{
        width: '100%', padding: '14px', borderRadius: 10, fontSize: 14, fontWeight: 700,
        background: 'transparent', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}><LogOut size={16} /> Sign Out</button>
    </div>
  );
}
