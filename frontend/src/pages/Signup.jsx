import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Lock, User, Eye, EyeOff, ArrowRight, Smartphone, CheckCircle } from 'lucide-react';
import { registerEmail, requestOTP, verifyOTP as verifyOTPApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const TRADER_TYPES = [
  { value: 'BUYER',          label: 'Buyer',          desc: 'I buy scrap metal' },
  { value: 'SELLER',         label: 'Seller',         desc: 'I sell scrap metal' },
  { value: 'CHECKING_RATES', label: 'Just Checking',  desc: 'Market observer' },
];

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

const inputStyle = {
  width: '100%', padding: '13px 14px', borderRadius: 12, fontSize: 14, fontWeight: 500,
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff', outline: 'none', boxSizing: 'border-box', transition: 'border 0.15s',
  fontFamily: 'inherit',
};

const TRADE_CATEGORIES = [
  'Scrap Collector / Kabadiwala',
  'Scrap Dealer / Merchant',
  'Factory / Manufacturer',
  'Recycler / Smelter',
  'Individual Trader',
  'Broker / Agent',
  'Other',
];

export default function Signup() {
  // Step: 'details' → 'otp' → 'kyc' (for buyers/sellers) → done
  const [step, setStep] = useState('details');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [traderTypes, setTraderTypes] = useState(['CHECKING_RATES']);
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  // KYC step
  const [tradeCategory, setTradeCategory] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [legalName, setLegalName] = useState('');
  // Temp token/user for KYC step after registration
  const [pendingToken, setPendingToken] = useState(null);
  const [pendingUser, setPendingUser] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const googleAvailable = GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'undefined' && GOOGLE_CLIENT_ID.length > 8;

  // Normalize phone for display/send
  const cleanPhone = phone.replace(/[\s\-()]/g, '').replace(/^\+?91/, '').slice(-10);

  // Step 1: Validate details and send OTP
  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (!phone || cleanPhone.length < 10) { setError('Valid 10-digit phone number required'); return; }
    if (traderTypes.length === 0) { setError('Please select at least one trader type'); return; }
    setLoading(true); setError('');
    try {
      await requestOTP(cleanPhone);
      setOtpSent(true);
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. Try again.');
    } finally { setLoading(false); }
  };

  // Step 2: Verify OTP then register
  const handleOTPVerify = async (e) => {
    e.preventDefault();
    if (otp.length < 4) return;
    setLoading(true); setError('');
    try {
      const hasBuyer = traderTypes.includes('BUYER');
      const hasSeller = traderTypes.includes('SELLER');
      const mappedType = (hasBuyer && hasSeller) ? 'BOTH'
        : hasBuyer ? 'BUYER'
        : hasSeller ? 'SELLER'
        : 'CHECKING_RATES';

      const res = await registerEmail({
        email, password, name: name || undefined,
        traderType: mappedType,
        phone: cleanPhone,
        otp,
        termsAccepted: true,
      });

      // If buyer or seller — go to KYC step before logging in
      if (hasBuyer || hasSeller) {
        setPendingToken(res.data.token);
        setPendingUser(res.data.user);
        setStep('kyc');
      } else {
        login(res.data.token, res.data.user);
        navigate('/verify-email'); // Show "check your email" screen
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Check OTP and try again.');
    } finally { setLoading(false); }
  };

  // Step 3: Submit KYC (PAN + legal name + trade category + optional business name + optional GST)
  const handleKYCSubmit = async (e) => {
    e.preventDefault();
    if (!panNumber || !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(panNumber.toUpperCase())) {
      setError('Valid PAN Card number required (e.g. ABCDE1234F)'); return;
    }
    if (!legalName.trim()) { setError('Legal name (as on PAN) is required'); return; }
    if (!tradeCategory) { setError('Please select your trade category'); return; }
    setLoading(true); setError('');
    try {
      // Temporarily set token so updateProfile can make an authenticated request
      localStorage.setItem('mx_token', pendingToken);
      const { updateProfile } = await import('../utils/api');
      await updateProfile({
        tradeCategory,
        businessName: businessName || undefined,
        panNumber: panNumber.toUpperCase().trim(),
        legalName: legalName.trim(),
        gstNumber: gstNumber ? gstNumber.toUpperCase().trim() : undefined,
        kycComplete: true,
      });
      login(pendingToken, { ...pendingUser, kycVerified: true, tradeCategory, businessName, panNumber, legalName });
      navigate('/verify-email'); // Show "check your email" screen after KYC
    } catch (err) {
      localStorage.removeItem('mx_token');
      setError(err.response?.data?.error || 'KYC submission failed');
    } finally { setLoading(false); }
  };

  const handleSkipKYC = () => {
    login(pendingToken, pendingUser);
    navigate('/verify-email'); // Still show verify email even if KYC skipped
  };

  const handleResendOTP = async () => {
    setLoading(true); setError('');
    try {
      await requestOTP(cleanPhone);
      setError(''); // clear any previous error
    } catch { setError('Failed to resend OTP'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '24px 16px', position: 'relative',
    }}>
      <div style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 500, height: 500, background: 'rgba(207,181,59,0.05)',
        borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        style={{
          width: '100%', maxWidth: 440, borderRadius: 24, padding: 32, position: 'relative', zIndex: 1,
          background: 'rgba(13,20,32,0.85)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderTop: '2px solid rgba(207,181,59,0.35)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, margin: '0 auto 14px',
            background: 'linear-gradient(135deg, #CFB53B, #A89028)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(207,181,59,0.3)',
          }}>
            {step === 'otp' ? <Smartphone size={24} color="#000" strokeWidth={2.5} /> : step === 'kyc' ? <CheckCircle size={24} color="#000" strokeWidth={2.5} /> : <Shield size={24} color="#000" strokeWidth={2.5} />}
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>
            {step === 'otp' ? 'Verify Your Phone' : step === 'kyc' ? 'Almost Done!' : 'Create Your Account'}
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            {step === 'otp' ? `OTP sent to ${phone}` : step === 'kyc' ? 'Tell us about your trade — 30 seconds' : 'Both email & phone required for security'}
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, justifyContent: 'center' }}>
          {['Details', 'Verify Phone', 'Trade Profile'].map((label, i) => {
            const stepOrder = ['details', 'otp', 'kyc'];
            const currentIdx = stepOrder.indexOf(step);
            const done = i < currentIdx;
            const active = i === currentIdx;
            return (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', fontSize: 11, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: done ? '#34d399' : active ? '#CFB53B' : 'rgba(255,255,255,0.1)',
                  color: (done || active) ? '#000' : 'rgba(255,255,255,0.3)',
                }}>
                  {done ? <CheckCircle size={14} /> : i + 1}
                </div>
                <span style={{ fontSize: 11, color: active ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.4)' }}>{label}</span>
                {i < 2 && <div style={{ width: 20, height: 1, background: 'rgba(255,255,255,0.1)' }} />}
              </div>
            );
          })}
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)',
                borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#f87171', textAlign: 'center', marginBottom: 16 }}>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Step 1: Details ── */}
        {step === 'details' && (
          <>
            {/* Google OAuth */}
            <div style={{ marginBottom: 16 }}>
              {googleAvailable ? (
                <a href="/api/auth/google" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  padding: '12px 20px', borderRadius: 12, fontWeight: 700, fontSize: 13,
                  background: '#fff', color: '#1a1a1a', textDecoration: 'none', width: '100%', boxSizing: 'border-box',
                }}>
                  <GoogleIcon /> Sign up with Google
                </a>
              ) : (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  padding: '12px 20px', borderRadius: 12, fontWeight: 700, fontSize: 13,
                  background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)', cursor: 'not-allowed',
                }}>
                  <GoogleIcon /> Sign up with Google
                  <span style={{ fontSize: 9, background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4 }}>Soon</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '0 0 16px' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>OR</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            </div>

            <form onSubmit={handleDetailsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Name */}
              <div style={{ position: 'relative' }}>
                <User size={15} color="rgba(255,255,255,0.3)" style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Full Name" style={{ ...inputStyle, paddingLeft: 42 }}
                  onFocus={e => e.target.style.borderColor = '#CFB53B'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              </div>

              {/* Email */}
              <div style={{ position: 'relative' }}>
                <Mail size={15} color="rgba(255,255,255,0.3)" style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Email Address *" required style={{ ...inputStyle, paddingLeft: 42 }}
                  onFocus={e => e.target.style.borderColor = '#CFB53B'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              </div>

              {/* Phone */}
              <div style={{ position: 'relative' }}>
                <Smartphone size={15} color="rgba(255,255,255,0.3)" style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="Phone Number * (for OTP verification)" required
                  style={{ ...inputStyle, paddingLeft: 42 }}
                  onFocus={e => e.target.style.borderColor = '#CFB53B'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              </div>

              {/* Password */}
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="rgba(255,255,255,0.3)" style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password (min 6 chars) *" required
                  style={{ ...inputStyle, paddingLeft: 42, paddingRight: 42 }}
                  onFocus={e => e.target.style.borderColor = '#CFB53B'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  {showPassword ? <EyeOff size={15} color="rgba(255,255,255,0.3)" /> : <Eye size={15} color="rgba(255,255,255,0.3)" />}
                </button>
              </div>

              {/* Confirm Password */}
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="rgba(255,255,255,0.3)" style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input type={showPassword ? 'text' : 'password'} value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password *" required
                  style={{ ...inputStyle, paddingLeft: 42 }}
                  onFocus={e => e.target.style.borderColor = '#CFB53B'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              </div>

              {/* Trader type (multi-select) */}
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 8 }}>
                  I am a <span style={{ fontWeight: 400, textTransform: 'none' }}>(select all that apply)</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                  {TRADER_TYPES.map(t => {
                    const active = traderTypes.includes(t.value);
                    return (
                      <button key={t.value} type="button" onClick={() => {
                        setTraderTypes(prev => prev.includes(t.value)
                          ? prev.filter(v => v !== t.value)
                          : [...prev, t.value]);
                      }}
                        style={{
                          padding: '8px 10px', borderRadius: 8, textAlign: 'left', cursor: 'pointer',
                          background: active ? 'rgba(207,181,59,0.12)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${active ? 'rgba(207,181,59,0.5)' : 'rgba(255,255,255,0.08)'}`,
                          position: 'relative',
                        }}>
                        {active && <span style={{ position: 'absolute', top: 4, right: 6, fontSize: 10, color: '#CFB53B' }}>✓</span>}
                        <p style={{ fontSize: 11, fontWeight: 700, color: active ? '#CFB53B' : '#fff', margin: '0 0 1px' }}>{t.label}</p>
                        <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', margin: 0 }}>{t.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button type="submit" disabled={loading || !email || password.length < 6 || !phone || traderTypes.length === 0 || !termsAccepted}
                style={{
                  width: '100%', padding: '13px', borderRadius: 12, fontWeight: 700, fontSize: 14,
                  background: '#CFB53B', color: '#000', border: 'none', cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(207,181,59,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  opacity: (loading || !email || password.length < 6 || !phone || traderTypes.length === 0 || !termsAccepted) ? 0.5 : 1,
                }}>
                {loading ? 'Sending OTP...' : 'Verify Phone & Create Account'}
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>
          </>
        )}

        {/* ── Step 2: OTP Verification ── */}
        {step === 'otp' && (
          <form onSubmit={handleOTPVerify} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Summary of details */}
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 14,
              border: '1px solid rgba(255,255,255,0.06)', marginBottom: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '0 0 2px' }}>{email}</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0 }}>{phone}</p>
                </div>
                <button type="button" onClick={() => { setStep('details'); setOtp(''); setError(''); }}
                  style={{ fontSize: 11, color: '#CFB53B', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                  Edit
                </button>
              </div>
            </div>

            <div>
              <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 8 }}>
                Enter OTP sent to your phone
              </label>
              <input type="text" value={otp} onChange={e => setOtp(e.target.value)}
                placeholder="1234" maxLength={4} required autoFocus
                style={{ ...inputStyle, fontSize: 28, fontWeight: 700, textAlign: 'center',
                  letterSpacing: '0.5em', fontFamily: 'monospace' }}
                onFocus={e => e.target.style.borderColor = '#CFB53B'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            </div>

            <button type="submit" disabled={loading || otp.length < 4}
              style={{ width: '100%', padding: '13px', borderRadius: 12, fontWeight: 700, fontSize: 14,
                background: '#CFB53B', color: '#000', border: 'none', cursor: 'pointer',
                opacity: (loading || otp.length < 4) ? 0.5 : 1 }}>
              {loading ? 'Creating Account...' : 'Verify & Create Account'}
            </button>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
              <button type="button" onClick={handleResendOTP} disabled={loading}
                style={{ fontSize: 12, color: '#CFB53B', background: 'none', border: 'none', cursor: 'pointer' }}>
                Resend OTP
              </button>
            </div>

            <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: 0 }}>
              Dev mode: use 1234
            </p>
          </form>
        )}

        {/* ── Step 3: KYC / Identity Verification ── */}
        {step === 'kyc' && (
          <form onSubmit={handleKYCSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Privacy promise — professional tone */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.7 }}>
                🛡️ <strong style={{ color: 'rgba(255,255,255,0.7)' }}>Your data is secure.</strong> Identity details are stored with bank-grade encryption and used solely for trader verification on MetalXpress. We never share your information with external parties.
              </p>
            </div>

            <div>
              <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 8 }}>
                PAN Card Number <span style={{ color: '#f87171' }}>*</span>
              </label>
              <input value={panNumber} onChange={e => setPanNumber(e.target.value.toUpperCase())}
                placeholder="ABCDE1234F" maxLength={10}
                style={{ ...inputStyle, fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase' }}
                onFocus={e => e.target.style.borderColor = '#CFB53B'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              {panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(panNumber) && (
                <p style={{ fontSize: 10, color: '#f87171', margin: '4px 0 0' }}>Format: 5 letters + 4 digits + 1 letter</p>
              )}
            </div>

            <div>
              <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 8 }}>
                Legal Name <span style={{ color: '#f87171' }}>*</span> <span style={{ fontWeight: 400, textTransform: 'none' }}>(as on PAN card)</span>
              </label>
              <input value={legalName} onChange={e => setLegalName(e.target.value)}
                placeholder="Full name as printed on your PAN card"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#CFB53B'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            </div>

            <div>
              <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 8 }}>
                Trade Category <span style={{ color: '#f87171' }}>*</span>
              </label>
              <select value={tradeCategory} onChange={e => setTradeCategory(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, fontSize: 13, background: '#0a1020', border: '1px solid rgba(255,255,255,0.1)', color: tradeCategory ? '#fff' : 'rgba(255,255,255,0.4)', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}>
                <option value="" style={{ background: '#0D1420' }}>Select your trade type…</option>
                {TRADE_CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#0D1420' }}>{c}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 8 }}>
                Business / Trade Name <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400, textTransform: 'none' }}>(optional)</span>
              </label>
              <input value={businessName} onChange={e => setBusinessName(e.target.value)}
                placeholder="e.g. Ram Kumar Scrap Traders"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#CFB53B'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            </div>

            <div>
              <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 8 }}>
                GSTIN <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400, textTransform: 'none' }}>(optional — for GST-registered businesses)</span>
              </label>
              <input value={gstNumber} onChange={e => setGstNumber(e.target.value.toUpperCase())}
                placeholder="22ABCDE1234F1Z5" maxLength={15}
                style={{ ...inputStyle, fontFamily: 'monospace', letterSpacing: '0.05em', textTransform: 'uppercase' }}
                onFocus={e => e.target.style.borderColor = '#CFB53B'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            </div>

            <button type="submit" disabled={loading || !panNumber || !legalName || !tradeCategory}
              style={{ width: '100%', padding: '13px', borderRadius: 12, fontWeight: 700, fontSize: 14,
                background: '#CFB53B', color: '#000', border: 'none', cursor: 'pointer',
                opacity: (loading || !panNumber || !legalName || !tradeCategory) ? 0.5 : 1 }}>
              {loading ? 'Verifying…' : 'Complete Verification & Enter →'}
            </button>

            <button type="button" onClick={handleSkipKYC}
              style={{ width: '100%', padding: '10px', borderRadius: 10, fontWeight: 600, fontSize: 12,
                background: 'transparent', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)',
                cursor: 'pointer' }}>
              Skip for now — I'll verify later
            </button>
            <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.2)', margin: 0 }}>
              You can complete verification anytime from your Profile page. Marketplace access requires verification.
            </p>
          </form>
        )}

        {/* Login link — only show on details/otp steps */}
        {step !== 'kyc' && (
        <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 14, marginBottom: 0 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#CFB53B', fontWeight: 700, textDecoration: 'none' }}>Login</Link>
        </p>
        )}

        {step === 'details' && (
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginTop: 16 }}>
            <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)}
              style={{ marginTop: 3, accentColor: '#CFB53B', width: 16, height: 16, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, fontFamily: 'monospace' }}>
              I agree to the <a href="/terms" target="_blank" style={{ color: '#CFB53B', textDecoration: 'underline' }}>Terms of Service</a> including the{' '}
              <a href="/terms#commission" target="_blank" style={{ color: '#CFB53B', textDecoration: 'underline' }}>commission policy</a>,{' '}
              <a href="/terms#refund-policy" target="_blank" style={{ color: '#CFB53B', textDecoration: 'underline' }}>refund policy</a>,{' '}
              <a href="/terms#ban-policy" target="_blank" style={{ color: '#CFB53B', textDecoration: 'underline' }}>ban policy</a>, and{' '}
              <a href="/privacy" target="_blank" style={{ color: '#CFB53B', textDecoration: 'underline' }}>Privacy Policy</a>
            </span>
          </label>
        )}
      </motion.div>
    </div>
  );
}
