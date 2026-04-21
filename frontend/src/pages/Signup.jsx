import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Lock, User, Eye, EyeOff, ArrowRight, Smartphone, CheckCircle } from 'lucide-react';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth, isConfigured as firebaseConfigured } from '../config/firebase';
import { registerEmail } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const TRADER_TYPES = [
  { value: 'BUYER',          label: 'Buyer',         desc: 'I buy metals' },
  { value: 'SELLER',         label: 'Seller',        desc: 'I sell metals' },
  { value: 'CHECKING_RATES', label: 'Just Checking', desc: 'Market observer' },
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

export default function Signup() {
  // step: 'form' | 'otp'
  const [step, setStep]                     = useState('form');

  // Form fields
  const [name, setName]                     = useState('');
  const [email, setEmail]                   = useState('');
  const [phone, setPhone]                   = useState('');
  const [password, setPassword]             = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword]     = useState(false);
  const [traderTypes, setTraderTypes]       = useState(['CHECKING_RATES']);
  const [termsAccepted, setTermsAccepted]   = useState(false);

  // OTP step
  const [otp, setOtp]                       = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const recaptchaVerifierRef                = useRef(null);

  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();
  const googleAvailable = GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'undefined' && GOOGLE_CLIENT_ID.length > 8;

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try { recaptchaVerifierRef.current.clear(); } catch (_) {}
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  // Build a fresh RecaptchaVerifier each time we need one.
  // Clears the container's DOM first so Firebase doesn't complain about re-use.
  async function buildVerifier() {
    // Destroy old instance if any
    if (recaptchaVerifierRef.current) {
      try { recaptchaVerifierRef.current.clear(); } catch (_) {}
      recaptchaVerifierRef.current = null;
    }
    // Clear any Firebase-injected widget from the container
    const container = document.getElementById('recaptcha-container-signup');
    if (!container) throw new Error('reCAPTCHA container element not found in DOM');
    container.innerHTML = '';

    // Create verifier pointing at the element directly (not the ID string)
    const verifier = new RecaptchaVerifier(auth, container, { size: 'invisible' });
    // Render it and wait — this is what actually contacts Google's servers
    await verifier.render();
    recaptchaVerifierRef.current = verifier;
    return verifier;
  }

  // Normalize to +91XXXXXXXXXX for Firebase
  const toFirebasePhone = (raw) => {
    let p = raw.replace(/[\s\-()]/g, '');
    if (p.startsWith('+91')) return p;
    if (p.startsWith('91') && p.length === 12) return '+' + p;
    if (/^[6-9]\d{9}$/.test(p)) return '+91' + p;
    return null;
  };

  // ── Step 1: Validate form + send Firebase OTP ──────────────────────────────
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (password !== confirmPassword) return setError('Passwords do not match');
    if (password.length < 8) return setError('Password must be at least 8 characters');
    if (!/[0-9]/.test(password) && !/[!@#$%^&*(),.?":{}|<>_\-]/.test(password))
      return setError('Password must include at least one number or special character');
    if (traderTypes.length === 0) return setError('Please select at least one trader type');

    const firebasePhone = toFirebasePhone(phone.trim());
    if (!firebasePhone) return setError('Enter a valid 10-digit Indian mobile number');

    if (!firebaseConfigured || !auth) {
      return setError('Phone verification is not configured. Please contact support.');
    }

    setLoading(true);
    try {
      const verifier = await buildVerifier();
      const confirmation = await signInWithPhoneNumber(auth, firebasePhone, verifier);
      setConfirmationResult(confirmation);
      setStep('otp');
    } catch (err) {
      console.error('[Firebase] OTP send error:', err.code, err.message, err);
      if (err.code === 'auth/invalid-phone-number') {
        setError('Invalid phone number. Use a valid Indian 10-digit number.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many OTP requests. Please wait a few minutes and try again.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Phone sign-in is disabled in Firebase Console.');
      } else if (err.code === 'auth/captcha-check-failed') {
        setError('reCAPTCHA failed. Please refresh the page and try again.');
      } else {
        setError(`OTP failed: ${err.code || err.message || 'unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP + create account ────────────────────────────────────
  const handleOtpVerify = async (e) => {
    e.preventDefault();
    if (otp.length < 6) return;
    if (!confirmationResult) {
      setError('Session expired. Go back and try again.');
      setStep('form');
      return;
    }

    setLoading(true); setError('');
    try {
      // Confirm OTP with Firebase
      const credential = await confirmationResult.confirm(otp);
      // Get Firebase ID token (proves phone ownership to our backend)
      const firebaseToken = await credential.user.getIdToken();

      // Map multi-select trader types to DB enum
      const hasBuyer  = traderTypes.includes('BUYER');
      const hasSeller = traderTypes.includes('SELLER');
      const mappedType = (hasBuyer && hasSeller) ? 'BOTH'
        : hasBuyer ? 'BUYER'
        : hasSeller ? 'SELLER'
        : 'CHECKING_RATES';

      // Create account — backend verifies the Firebase token to get the phone
      const res = await registerEmail({
        email,
        password,
        name: name || undefined,
        traderType: mappedType,
        firebaseToken,    // ← backend extracts + verifies phone from here
        termsAccepted: true,
      });

      login(res.data.token, res.data.user);
      navigate('/verify-email');
    } catch (err) {
      console.error('Signup OTP verify error:', err);
      if (err.code === 'auth/invalid-verification-code') {
        setError('Incorrect OTP. Please check and try again.');
      } else if (err.code === 'auth/code-expired') {
        setError('OTP expired. Go back and request a new one.');
        setStep('form');
        setConfirmationResult(null);
      } else {
        setError(err.response?.data?.error || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const goBackToForm = () => {
    setStep('form');
    setOtp('');
    setConfirmationResult(null);
    setError('');
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '24px 16px', position: 'relative',
    }}>
      {/* Invisible reCAPTCHA container */}
      <div id="recaptcha-container-signup" />

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
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, margin: '0 auto 14px',
            background: 'linear-gradient(135deg, #CFB53B, #A89028)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(207,181,59,0.3)',
          }}>
            <Shield size={24} color="#000" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>
            {step === 'form' ? 'Create Your Account' : 'Verify Your Number'}
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            {step === 'form'
              ? 'Free to join. Takes 60 seconds.'
              : `We sent a 6-digit code to +91 ${phone.replace(/\D/g, '')}`}
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, justifyContent: 'center' }}>
          {['Details', 'Verify Phone'].map((label, i) => {
            const active = (i === 0 && step === 'form') || (i === 1 && step === 'otp');
            const done = i === 0 && step === 'otp';
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: done ? '#34d399' : active ? '#CFB53B' : 'rgba(255,255,255,0.08)',
                  color: (done || active) ? '#000' : 'rgba(255,255,255,0.3)',
                }}>
                  {done ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 11, color: active ? '#CFB53B' : 'rgba(255,255,255,0.3)', fontWeight: active ? 700 : 400 }}>
                  {label}
                </span>
                {i === 0 && (
                  <div style={{ width: 24, height: 1, background: 'rgba(255,255,255,0.1)', margin: '0 2px' }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              style={{
                background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)',
                borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#f87171',
                textAlign: 'center', marginBottom: 16,
              }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── STEP 1: Account Details ─────────────────────────────────────────── */}
        {step === 'form' && (
          <>
            {/* Google OAuth */}
            <div style={{ marginBottom: 16 }}>
              {googleAvailable ? (
                <a href="/api/auth/google" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  padding: '12px 20px', borderRadius: 12, fontWeight: 700, fontSize: 13,
                  background: '#fff', color: '#1a1a1a', textDecoration: 'none',
                  width: '100%', boxSizing: 'border-box',
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

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Name */}
              <div style={{ position: 'relative' }}>
                <User size={15} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Full Name"
                  style={{ ...inputStyle, paddingLeft: 42 }}
                  onFocus={e => e.target.style.borderColor = '#CFB53B'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              </div>

              {/* Email */}
              <div style={{ position: 'relative' }}>
                <Mail size={15} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Email Address *" required
                  style={{ ...inputStyle, paddingLeft: 42 }}
                  onFocus={e => e.target.style.borderColor = '#CFB53B'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              </div>

              {/* Phone — required, verified via Firebase OTP */}
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.4)', pointerEvents: 'none',
                }}>+91</span>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="Mobile Number *" required maxLength={10}
                  style={{ ...inputStyle, paddingLeft: 52 }}
                  onFocus={e => e.target.style.borderColor = '#CFB53B'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              </div>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', margin: '-8px 0 0', paddingLeft: 2 }}>
                We'll send a 6-digit code to verify your number
              </p>

              {/* Password */}
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password * (min 8 chars + number or symbol)" required
                  style={{ ...inputStyle, paddingLeft: 42, paddingRight: 42 }}
                  onFocus={e => e.target.style.borderColor = '#CFB53B'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  {showPassword ? <EyeOff size={15} color="rgba(255,255,255,0.3)" /> : <Eye size={15} color="rgba(255,255,255,0.3)" />}
                </button>
              </div>

              {/* Confirm Password */}
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input type={showPassword ? 'text' : 'password'} value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password *" required
                  style={{ ...inputStyle, paddingLeft: 42 }}
                  onFocus={e => e.target.style.borderColor = '#CFB53B'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              </div>

              {/* Trader type */}
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 8 }}>
                  I am a <span style={{ fontWeight: 400, textTransform: 'none' }}>(select all that apply)</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: 6 }}>
                  {TRADER_TYPES.map(t => {
                    const active = traderTypes.includes(t.value);
                    return (
                      <button key={t.value} type="button"
                        onClick={() => setTraderTypes(prev =>
                          prev.includes(t.value) ? prev.filter(v => v !== t.value) : [...prev, t.value]
                        )}
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

              {/* T&C */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginTop: 4 }}>
                <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)}
                  style={{ marginTop: 3, accentColor: '#CFB53B', width: 16, height: 16, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, fontFamily: 'monospace' }}>
                  I agree to the{' '}
                  <a href="/terms" target="_blank" style={{ color: '#CFB53B', textDecoration: 'underline' }}>Terms of Service</a>,{' '}
                  <a href="/terms#commission" target="_blank" style={{ color: '#CFB53B', textDecoration: 'underline' }}>commission policy</a>,{' '}
                  and{' '}
                  <a href="/privacy" target="_blank" style={{ color: '#CFB53B', textDecoration: 'underline' }}>Privacy Policy</a>
                </span>
              </label>

              <button type="submit"
                disabled={loading || !email || !phone || password.length < 8 || traderTypes.length === 0 || !termsAccepted}
                style={{
                  width: '100%', padding: '13px', borderRadius: 12, fontWeight: 700, fontSize: 14,
                  background: '#CFB53B', color: '#000', border: 'none', cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(207,181,59,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  opacity: (loading || !email || !phone || password.length < 8 || traderTypes.length === 0 || !termsAccepted) ? 0.5 : 1,
                }}>
                {loading ? 'Sending OTP...' : 'Send Verification Code'}
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 14, marginBottom: 0 }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#CFB53B', fontWeight: 700, textDecoration: 'none' }}>Login</Link>
            </p>
          </>
        )}

        {/* ── STEP 2: OTP Verification ─────────────────────────────────────────── */}
        {step === 'otp' && (
          <form onSubmit={handleOtpVerify} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* What we're verifying */}
            <div style={{
              background: 'rgba(207,181,59,0.08)', border: '1px solid rgba(207,181,59,0.2)',
              borderRadius: 10, padding: '12px 16px',
              display: 'flex', flexDirection: 'column', gap: 4,
            }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                Verifying phone
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#CFB53B', fontFamily: 'monospace' }}>
                +91 {phone.replace(/\D/g, '')}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                Also creating account for: {email}
              </div>
            </div>

            {/* OTP input */}
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 8 }}>
                6-Digit Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="• • • • • •"
                maxLength={6}
                required
                autoFocus
                inputMode="numeric"
                style={{
                  ...inputStyle, fontSize: 28, fontWeight: 700, textAlign: 'center',
                  letterSpacing: '0.4em', fontFamily: 'monospace',
                }}
                onFocus={e => e.target.style.borderColor = '#CFB53B'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            <button type="submit" disabled={loading || otp.length < 6}
              style={{
                width: '100%', padding: '13px', borderRadius: 12, fontWeight: 700, fontSize: 14,
                background: '#CFB53B', color: '#000', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: (loading || otp.length < 6) ? 0.5 : 1,
              }}>
              {loading ? 'Creating Account...' : 'Verify & Create Account'}
              {!loading && <CheckCircle size={16} />}
            </button>

            {/* Resend / back */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
              <button type="button" onClick={goBackToForm}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', padding: 0, fontSize: 11 }}>
                ← Change details
              </button>
              <button type="button" onClick={goBackToForm}
                style={{ background: 'none', border: 'none', color: '#CFB53B', cursor: 'pointer', padding: 0, fontSize: 11, fontWeight: 700 }}>
                Resend OTP
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
