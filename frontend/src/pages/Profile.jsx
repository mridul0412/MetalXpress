import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, MapPin, Shield, Save, LogOut, Clock,
  CheckCircle, AlertCircle, Smartphone, ChevronRight, Edit3,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, checkSubscription, requestOTP } from '../utils/api';
import ChakraLoader from '../components/ChakraLoader';

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
  { value: 'BUYER', label: 'Buyer', desc: 'I buy metals' },
  { value: 'SELLER', label: 'Seller', desc: 'I sell metals' },
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
  // KYC fields
  const [panNumber, setPanNumber] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [legalName, setLegalName] = useState('');

  // Phone OTP flow (for phone number changes)
  const [originalPhone, setOriginalPhone] = useState('');
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);

  // Original values for dirty tracking
  const [origValues, setOrigValues] = useState({});

  // Save state
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // KYC verification state
  const [verifying, setVerifying] = useState(false);
  const [kycMessage, setKycMessage] = useState('');

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
    setPanNumber(user.panNumber || '');
    setGstNumber(user.gstNumber || '');
    setLegalName(user.legalName || '');
    const tt = user.traderType || 'CHECKING_RATES';
    const initialTypes = tt === 'BOTH' ? ['BUYER', 'SELLER'] : [tt];
    setTraderTypes(initialTypes);
    setOrigValues({ name: user.name || '', email: user.email || '', city: user.city || '', traderType: tt });
  }, [user, authLoading]);

  const cleanPhone = (p) => p.replace(/[\s\-()]/g, '').replace(/^\+?91/, '').slice(-10);
  const phoneChanged = phone && cleanPhone(phone) !== (originalPhone || '');

  const origTraderTypes = origValues.traderType === 'BOTH' ? ['BUYER', 'SELLER']
    : origValues.traderType ? [origValues.traderType] : ['CHECKING_RATES'];
  const isDirty = name !== (origValues.name || '') ||
    email !== (origValues.email || '') ||
    city !== (origValues.city || '') ||
    JSON.stringify([...traderTypes].sort()) !== JSON.stringify([...origTraderTypes].sort());

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
      setOrigValues({ name, email: email || '', city, traderType: mappedType });
      setMessage('Profile saved!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally { setSaving(false); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  if (authLoading) return (
    <div style={{ padding: 40, textAlign: 'center' }}><ChakraLoader size={48} layout="block" label="Loading profile" /></div>
  );

  const isKycDone = user?.kycVerified;
  const kycPending = !!user?.kycSubmittedAt && !isKycDone && !user?.kycRejectionReason;
  const kycRejected = !!user?.kycRejectionReason;
  const isBuyer = traderTypes.includes('BUYER');
  const isSeller = traderTypes.includes('SELLER');
  // Show KYC section to ALL unverified users so it's discoverable upfront.
  // Hide form when pending review — user can't change anything during review.
  const needsKyc = !isKycDone && !kycPending;
  const kycRequired = (isBuyer || isSeller); // visual emphasis only — required vs optional

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

      {/* KYC status banner — 4 states: verified, pending, rejected, not-submitted */}
      <div style={{
        background: isKycDone ? 'rgba(52,211,153,0.08)' : kycPending ? 'rgba(99,102,241,0.08)' : kycRejected ? 'rgba(248,113,113,0.08)' : 'rgba(207,181,59,0.08)',
        border: `1px solid ${isKycDone ? 'rgba(52,211,153,0.2)' : kycPending ? 'rgba(99,102,241,0.25)' : kycRejected ? 'rgba(248,113,113,0.3)' : 'rgba(207,181,59,0.2)'}`,
        borderRadius: 12, padding: '14px 18px', marginBottom: 16,
        display: 'flex', alignItems: 'flex-start', gap: 12,
      }}>
        {isKycDone
          ? <CheckCircle size={20} color="#34d399" style={{ flexShrink: 0, marginTop: 2 }} />
          : kycPending
          ? <Clock size={20} color="#818cf8" style={{ flexShrink: 0, marginTop: 2 }} />
          : <AlertCircle size={20} color={kycRejected ? '#f87171' : '#CFB53B'} style={{ flexShrink: 0, marginTop: 2 }} />}
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 2px',
            color: isKycDone ? '#34d399' : kycPending ? '#818cf8' : kycRejected ? '#f87171' : '#CFB53B' }}>
            {isKycDone ? 'Identity Verified ✓'
              : kycPending ? 'Verification Submitted — Awaiting Review'
              : kycRejected ? 'Verification Rejected'
              : kycRequired ? 'Verification Required for Marketplace + Analytics'
              : 'Verification Recommended'}
          </p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.5 }}>
            {isKycDone
              ? 'You can browse listings, post metal, and make deals. Your verified badge is visible to other traders.'
              : kycPending
              ? 'We\'ll review your details against the NSDL PAN database within 24 hours. You\'ll be notified once approved.'
              : kycRejected
              ? `Reason: ${user?.kycRejectionReason}. Please correct the details below and resubmit.`
              : kycRequired
              ? 'Submit PAN below for review. Takes 1 minute. Approved within 24 hours.'
              : 'Verify now to unlock marketplace + analytics if you ever want to trade.'}
          </p>
        </div>
      </div>

      {/* KYC inline section */}
      {needsKyc && !isKycDone && (
        <div style={{ background: '#0D1420', borderRadius: 14, border: '1px solid rgba(207,181,59,0.2)', padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#CFB53B', margin: '0 0 4px' }}>
            🔒 Identity Verification
          </h3>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '0 0 16px' }}>
            Quick PAN-based verification to confirm you're a real trader. Required for marketplace access.
          </p>

          {/* Privacy promise — professional, no government/tax mentions */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.7 }}>
              🛡️ <strong style={{ color: 'rgba(255,255,255,0.7)' }}>Your data is secure.</strong> Identity details are stored with bank-grade encryption and used solely for trader verification on BhavX. We never share your information with external parties.
            </p>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>PAN Card Number <span style={{ color: '#f87171' }}>*</span></label>
            <input value={panNumber} onChange={e => setPanNumber(e.target.value.toUpperCase())}
              placeholder="ABCDE1234F" maxLength={10}
              style={{ ...inputStyle, fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase' }}
              onFocus={e => e.target.style.borderColor = '#CFB53B'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            {panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(panNumber) && (
              <p style={{ fontSize: 10, color: '#f87171', margin: '4px 0 0' }}>Format: 5 letters + 4 digits + 1 letter (e.g. ABCDE1234F)</p>
            )}
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Legal Name <span style={{ color: '#f87171' }}>*</span> <span style={{ fontWeight: 400, textTransform: 'none' }}>(as on PAN card)</span></label>
            <input value={legalName} onChange={e => setLegalName(e.target.value)}
              placeholder="Full name as printed on your PAN card" style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#CFB53B'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            {legalName && legalName.trim().length < 2 && (
              <p style={{ fontSize: 10, color: '#f87171', margin: '4px 0 0' }}>Name must be at least 2 characters</p>
            )}
            {legalName && legalName.trim().length >= 2 && !/^[A-Za-z][A-Za-z\s.\-']*$/.test(legalName.trim()) && (
              <p style={{ fontSize: 10, color: '#f87171', margin: '4px 0 0' }}>Letters, spaces, dots, hyphens only — no digits</p>
            )}
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Trade Category <span style={{ color: '#f87171' }}>*</span></label>
            <select value={tradeCategory} onChange={e => setTradeCategory(e.target.value)}
              style={{ ...inputStyle, background: '#0a1020', color: tradeCategory ? '#fff' : 'rgba(255,255,255,0.3)' }}>
              <option value="" style={{ background: '#0D1420' }}>Select your trade type…</option>
              {TRADE_CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#0D1420' }}>{c}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Business / Trade Name <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
            <input value={businessName} onChange={e => setBusinessName(e.target.value)}
              placeholder="e.g. Ram Kumar Scrap Traders" style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#CFB53B'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>GSTIN <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400, textTransform: 'none' }}>(optional — for GST-registered businesses)</span></label>
            <input value={gstNumber} onChange={e => setGstNumber(e.target.value.toUpperCase())}
              placeholder="22ABCDE1234F1Z5" maxLength={15}
              style={{ ...inputStyle, fontFamily: 'monospace', letterSpacing: '0.05em', textTransform: 'uppercase' }}
              onFocus={e => e.target.style.borderColor = '#CFB53B'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            {gstNumber && gstNumber.length > 0 && gstNumber.length < 15 && (
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', margin: '4px 0 0' }}>GSTIN is 15 characters</p>
            )}
          </div>

          {(() => {
            const panValid = /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(panNumber);
            const nameValid = legalName.trim().length >= 2 && /^[A-Za-z][A-Za-z\s.\-']*$/.test(legalName.trim());
            const kycReady = panValid && nameValid && tradeCategory !== '';
            const handleVerify = async () => {
              setVerifying(true); setKycMessage('');
              try {
                await updateProfile({
                  panNumber,
                  legalName,
                  tradeCategory,
                  businessName: businessName || undefined,
                  gstNumber: gstNumber || undefined,
                  kycComplete: true,
                });
                await refreshUser();
                setKycMessage('Verification submitted!');
              } catch (err) {
                setKycMessage(err.response?.data?.error || 'Verification failed. Please try again.');
              } finally { setVerifying(false); }
            };
            return (
              <>
                {!kycReady && (
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '0 0 10px', fontStyle: 'italic' }}>
                    Fill in PAN, Legal Name and Trade Category to continue.
                  </p>
                )}
                {kycMessage && (
                  <p style={{ fontSize: 12, color: kycMessage.includes('submitted') ? '#34d399' : '#f87171', margin: '0 0 10px' }}>
                    {kycMessage}
                  </p>
                )}
                <button onClick={handleVerify} disabled={!kycReady || verifying} style={{
                  width: '100%', padding: '12px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                  background: kycReady ? '#CFB53B' : 'rgba(255,255,255,0.07)',
                  color: kycReady ? '#000' : 'rgba(255,255,255,0.25)',
                  border: 'none', cursor: kycReady ? 'pointer' : 'not-allowed',
                  opacity: verifying ? 0.6 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  <ChevronRight size={15} /> {verifying ? 'Submitting…' : 'Complete Verification →'}
                </button>
              </>
            );
          })()}
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

        <button onClick={handleSave} disabled={!isDirty || saving} style={{
          width: '100%', padding: '14px', borderRadius: 10, fontSize: 14, fontWeight: 700,
          background: '#CFB53B', color: '#000', border: 'none',
          cursor: isDirty ? 'pointer' : 'default',
          opacity: isDirty ? (saving ? 0.6 : 1) : 0.4,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
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
