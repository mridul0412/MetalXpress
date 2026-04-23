import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight, Smartphone } from 'lucide-react';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth, isConfigured as firebaseConfigured } from '../config/firebase';
import { loginEmail, verifyFirebaseOTP, checkPhone } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

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

export default function Login() {
  // mode: 'email' | 'phone' | 'otp'
  const [searchParams] = useSearchParams();
  const initialMethod = searchParams.get('method') === 'phone' ? 'phone' : 'email';
  const [mode, setMode] = useState(initialMethod);

  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone]               = useState('');
  const [otp, setOtp]                   = useState('');
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

  // Firebase phone auth state
  const [confirmationResult, setConfirmationResult] = useState(null);
  const recaptchaVerifierRef = useRef(null);

  const navigate = useNavigate();
  const { login, user } = useAuth();

  const googleAvailable = GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'undefined' && GOOGLE_CLIENT_ID.length > 8;

  // Handle Google OAuth redirect: ?token=<jwt>
  useEffect(() => {
    const token = searchParams.get('token');
    const authError = searchParams.get('error');
    if (token) { login(token, {}); navigate('/'); }
    else if (authError) {
      setError(authError === 'google_not_configured'
        ? 'Google login is not configured yet. Use email or phone instead.'
        : 'Google login failed. Please try another method.');
    }
  }, [searchParams, login, navigate]);

  // Already logged in
  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try { recaptchaVerifierRef.current.clear(); } catch (_) {}
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  async function buildVerifier() {
    if (recaptchaVerifierRef.current) {
      try { recaptchaVerifierRef.current.clear(); } catch (_) {}
      recaptchaVerifierRef.current = null;
    }
    const container = document.getElementById('recaptcha-container');
    if (!container) throw new Error('reCAPTCHA container not found');
    container.innerHTML = '';
    // Use string ID — more reliable. Let signInWithPhoneNumber handle render internally.
    const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
    recaptchaVerifierRef.current = verifier;
    return verifier;
  }

  // Email login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await loginEmail({ email, password });
      login(res.data.token, res.data.user);
      navigate(res.data.user?.emailVerified === false ? '/verify-email' : '/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally { setLoading(false); }
  };

  // Normalize phone to +91XXXXXXXXXX format for Firebase
  const toFirebasePhone = (raw) => {
    let p = raw.replace(/[\s\-()]/g, '');
    if (p.startsWith('+91')) return p;
    if (p.startsWith('91') && p.length === 12) return '+' + p;
    if (/^[6-9]\d{9}$/.test(p)) return '+91' + p;
    return null;
  };

  // Phone OTP send — uses Firebase signInWithPhoneNumber
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    const firebasePhone = toFirebasePhone(phone);
    if (!firebasePhone) {
      setError('Enter a valid 10-digit Indian mobile number');
      return;
    }

    if (!firebaseConfigured || !auth) {
      setError('Phone OTP is not configured. Please use email login.');
      return;
    }

    setLoading(true);
    try {
      // Check if phone is registered before spending Firebase quota
      const checkRes = await checkPhone(toFirebasePhone(phone));
      if (!checkRes.data.exists) {
        setError('No account found with this number. Please sign up first.');
        setLoading(false);
        return;
      }

      const verifier = await buildVerifier();
      const confirmation = await signInWithPhoneNumber(auth, firebasePhone, verifier);
      setConfirmationResult(confirmation);
      setMode('otp');
    } catch (err) {
      console.error('[Firebase] OTP send error:', err.code, err.message, err);
      if (err.code === 'auth/invalid-phone-number') {
        setError('Invalid phone number. Use a valid Indian 10-digit number.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait a few minutes and try again.');
      } else if (err.code === 'auth/quota-exceeded') {
        setError('OTP quota exceeded. Please try again later.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Phone sign-in not enabled in Firebase Console.');
      } else if (err.code === 'auth/captcha-check-failed') {
        setError('reCAPTCHA failed. Please refresh the page and try again.');
      } else {
        setError(`OTP failed: ${err.code || err.message || 'unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // OTP verify — confirms with Firebase, then exchanges for our JWT
  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length < 6) return;
    if (!confirmationResult) {
      setError('Session expired. Please request a new OTP.');
      setMode('phone');
      return;
    }
    setLoading(true); setError('');
    try {
      // Confirm OTP with Firebase
      const credential = await confirmationResult.confirm(otp);
      // Get Firebase ID token
      const firebaseToken = await credential.user.getIdToken();

      // Exchange Firebase token for our app JWT (loginOnly — no new account creation)
      const res = await verifyFirebaseOTP({ firebaseToken, loginOnly: true });

      login(res.data.token, res.data.user || {});
      navigate('/');
    } catch (err) {
      console.error('Firebase OTP verify error:', err);
      if (err.code === 'auth/invalid-verification-code') {
        setError('Incorrect OTP. Please check and try again.');
      } else if (err.code === 'auth/code-expired') {
        setError('OTP expired. Please request a new one.');
        setMode('phone');
        setConfirmationResult(null);
      } else {
        setError(err.response?.data?.error || 'Verification failed. Please try again.');
      }
    } finally {
      setLoading(false); }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '24px 16px', position: 'relative',
    }}>
      {/* Invisible reCAPTCHA container — Firebase requires a DOM element */}
      <div id="recaptcha-container" style={{ position: 'fixed', bottom: 0, left: 0 }} />

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
            <Shield size={24} color="#000" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>
            {mode === 'email' ? 'Login to BhavX' : mode === 'phone' ? 'Phone Login' : 'Enter OTP'}
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            {mode === 'email' ? 'Enter your email and password' :
             mode === 'phone' ? 'We\'ll send a 6-digit code to your number' :
             `Code sent to +91 ${phone}`}
          </p>
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

        {/* ── Email Login ── */}
        {mode === 'email' && (
          <>
            {/* Google */}
            <div style={{ marginBottom: 16 }}>
              {googleAvailable ? (
                <a href="/api/auth/google" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  padding: '12px 20px', borderRadius: 12, fontWeight: 700, fontSize: 13,
                  background: '#fff', color: '#1a1a1a', textDecoration: 'none', width: '100%', boxSizing: 'border-box',
                }}>
                  <GoogleIcon /> Continue with Google
                </a>
              ) : (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  padding: '12px 20px', borderRadius: 12, fontWeight: 700, fontSize: 13,
                  background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)', cursor: 'not-allowed',
                }}>
                  <GoogleIcon /> Continue with Google
                  <span style={{ fontSize: 9, background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4 }}>Soon</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '0 0 16px' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>OR</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            </div>

            <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color="rgba(255,255,255,0.3)" style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Email Address" required autoFocus
                  style={{ ...inputStyle, paddingLeft: 42 }}
                  onFocus={e => e.target.style.borderColor = '#CFB53B'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              </div>

              <div style={{ position: 'relative' }}>
                <Lock size={15} color="rgba(255,255,255,0.3)" style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password" required
                  style={{ ...inputStyle, paddingLeft: 42, paddingRight: 42 }}
                  onFocus={e => e.target.style.borderColor = '#CFB53B'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  {showPassword ? <EyeOff size={15} color="rgba(255,255,255,0.3)" /> : <Eye size={15} color="rgba(255,255,255,0.3)" />}
                </button>
              </div>

              <button type="submit" disabled={loading || !email || !password}
                style={{
                  width: '100%', padding: '13px', borderRadius: 12, fontWeight: 700, fontSize: 14,
                  background: '#CFB53B', color: '#000', border: 'none', cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(207,181,59,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  opacity: (loading || !email || !password) ? 0.5 : 1,
                }}>
                {loading ? 'Signing in...' : 'Sign In'}
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>

            {/* Forgot password */}
            <div style={{ textAlign: 'center', marginTop: 10 }}>
              <Link to="/forgot-password" style={{
                fontSize: 12, color: 'rgba(255,255,255,0.35)', textDecoration: 'none',
              }}
                onMouseEnter={e => e.currentTarget.style.color = '#CFB53B'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
              >
                Forgot your password?
              </Link>
            </div>

            {/* Phone OTP alternative */}
            <div style={{ textAlign: 'center', marginTop: 10 }}>
              <button onClick={() => { setMode('phone'); setError(''); }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  fontSize: 12, color: 'rgba(255,255,255,0.4)',
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                }}>
                <Smartphone size={12} /> Login with Phone OTP
              </button>
            </div>
          </>
        )}

        {/* ── Phone Entry ── */}
        {mode === 'phone' && (
          <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ position: 'relative' }}>
              {/* +91 prefix badge */}
              <span style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.4)', pointerEvents: 'none',
              }}>+91</span>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="9876543210" required autoFocus maxLength={10}
                style={{ ...inputStyle, paddingLeft: 52, fontSize: 16 }}
                onFocus={e => e.target.style.borderColor = '#CFB53B'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => { setMode('email'); setError(''); }}
                style={{ padding: '13px 16px', borderRadius: 12, fontWeight: 700, fontSize: 14,
                  background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)',
                  border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                Back
              </button>
              <button type="submit" disabled={loading || phone.replace(/\D/g, '').length < 10}
                style={{ flex: 1, padding: '13px', borderRadius: 12, fontWeight: 700, fontSize: 14,
                  background: '#CFB53B', color: '#000', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  opacity: (loading || phone.replace(/\D/g, '').length < 10) ? 0.5 : 1 }}>
                {loading ? 'Sending OTP...' : 'Get OTP'} {!loading && <ArrowRight size={16} />}
              </button>
            </div>
            <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: 0 }}>
              A 6-digit code will be sent via SMS
            </p>
          </form>
        )}

        {/* ── OTP Verify + Profile ── */}
        {mode === 'otp' && (
          <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)' }}>
                  6-Digit Code
                </label>
                <button type="button" onClick={() => { setMode('phone'); setOtp(''); setConfirmationResult(null); setError(''); }}
                  style={{ fontSize: 11, color: '#CFB53B', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                  Change Number
                </button>
              </div>
              <input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="• • • • • •" maxLength={6} required autoFocus inputMode="numeric"
                style={{ ...inputStyle, fontSize: 28, fontWeight: 700, textAlign: 'center',
                  letterSpacing: '0.4em', fontFamily: 'monospace' }}
                onFocus={e => e.target.style.borderColor = '#CFB53B'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            </div>

            <button type="submit" disabled={loading || otp.length < 6}
              style={{ width: '100%', padding: '13px', borderRadius: 12, fontWeight: 700, fontSize: 14,
                background: '#CFB53B', color: '#000', border: 'none', cursor: 'pointer',
                opacity: (loading || otp.length < 6) ? 0.5 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading ? 'Verifying...' : 'Verify & Enter'}
              {!loading && <ArrowRight size={16} />}
            </button>

            {/* Resend OTP */}
            <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: 0 }}>
              Didn't get the code?{' '}
              <button type="button" onClick={() => { setMode('phone'); setOtp(''); setConfirmationResult(null); setError(''); }}
                style={{ background: 'none', border: 'none', color: '#CFB53B', cursor: 'pointer',
                  fontSize: 11, fontWeight: 700, padding: 0 }}>
                Resend OTP
              </button>
            </p>
          </form>
        )}

        {/* Sign up link */}
        <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 16, marginBottom: 0 }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: '#CFB53B', fontWeight: 700, textDecoration: 'none' }}>Sign Up</Link>
        </p>
      </motion.div>
    </div>
  );
}
