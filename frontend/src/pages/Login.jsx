import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight, Smartphone, User } from 'lucide-react';
import { loginEmail, requestOTP, verifyOTP } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const TRADER_TYPES = [
  { value: 'BUYER',          label: 'Buyer',          desc: 'I buy metals' },
  { value: 'SELLER',         label: 'Seller',         desc: 'I sell metals' },
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

export default function Login() {
  // mode: 'email' | 'phone' | 'otp'
  const [searchParams] = useSearchParams();
  const initialMethod = searchParams.get('method') === 'phone' ? 'phone' : 'email';
  const [mode, setMode] = useState(initialMethod);

  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone]             = useState('');
  const [otp, setOtp]                 = useState('');
  const [name, setName]               = useState('');
  const [traderTypes, setTraderTypes]   = useState(['CHECKING_RATES']);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
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

  // Phone OTP send
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (phone.length < 10) return;
    setLoading(true); setError('');
    try {
      await requestOTP(phone);
      setMode('otp');
    } catch { setError('Failed to send OTP. Try again.'); }
    finally { setLoading(false); }
  };

  // OTP verify
  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length < 4) return;
    setLoading(true); setError('');
    try {
      // Map multi-select to enum: BUYER+SELLER → BOTH
      const hasBuyer = traderTypes.includes('BUYER');
      const hasSeller = traderTypes.includes('SELLER');
      const mappedType = (hasBuyer && hasSeller) ? 'BOTH' : hasBuyer ? 'BUYER' : hasSeller ? 'SELLER' : 'CHECKING_RATES';
      const res = await verifyOTP({ phone, otp, name: name || undefined, traderType: mappedType });
      login(res.data.token, res.data.user || { phone });
      navigate('/');
    } catch { setError('Invalid OTP. In dev mode, use 1234.'); }
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
            <Shield size={24} color="#000" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>
            {mode === 'email' ? 'Login to MetalXpress' : mode === 'phone' ? 'Phone Login' : 'Verify OTP'}
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            {mode === 'email' ? 'Enter your email and password' :
             mode === 'phone' ? 'We\'ll send a one-time code' : `OTP sent to ${phone}`}
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
              <Smartphone size={16} color="rgba(255,255,255,0.3)" style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="9876543210" required autoFocus
                style={{ ...inputStyle, paddingLeft: 42, fontSize: 16 }}
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
              <button type="submit" disabled={loading || phone.length < 10}
                style={{ flex: 1, padding: '13px', borderRadius: 12, fontWeight: 700, fontSize: 14,
                  background: '#CFB53B', color: '#000', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  opacity: (loading || phone.length < 10) ? 0.5 : 1 }}>
                {loading ? 'Sending...' : 'Get OTP'} {!loading && <ArrowRight size={16} />}
              </button>
            </div>
            <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: 0 }}>
              Dev mode: any 10-digit number works, OTP is 1234
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
                  One-Time Code
                </label>
                <button type="button" onClick={() => setMode('phone')}
                  style={{ fontSize: 11, color: '#CFB53B', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                  Change Number
                </button>
              </div>
              <input type="text" value={otp} onChange={e => setOtp(e.target.value)}
                placeholder="1234" maxLength={4} required autoFocus
                style={{ ...inputStyle, fontSize: 28, fontWeight: 700, textAlign: 'center',
                  letterSpacing: '0.5em', fontFamily: 'monospace' }}
                onFocus={e => e.target.style.borderColor = '#CFB53B'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            </div>

            {/* Optional profile setup */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontWeight: 600, textTransform: 'uppercase' }}>
                Optional Profile
              </span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            </div>

            <div style={{ position: 'relative' }}>
              <User size={15} color="rgba(255,255,255,0.3)" style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Your Name" style={{ ...inputStyle, paddingLeft: 42 }}
                onFocus={e => e.target.style.borderColor = '#CFB53B'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            </div>

            <div>
              <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 8 }}>
                I am a <span style={{ fontWeight: 400, textTransform: 'none' }}>(select all that apply)</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: 6 }}>
                {TRADER_TYPES.map(t => {
                  const active = traderTypes.includes(t.value);
                  return (
                    <button key={t.value} type="button" onClick={() => {
                      setTraderTypes(prev => prev.includes(t.value)
                        ? prev.filter(v => v !== t.value) : [...prev, t.value]);
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

            <button type="submit" disabled={loading || otp.length < 4}
              style={{ width: '100%', padding: '13px', borderRadius: 12, fontWeight: 700, fontSize: 14,
                background: '#CFB53B', color: '#000', border: 'none', cursor: 'pointer',
                opacity: (loading || otp.length < 4) ? 0.5 : 1 }}>
              {loading ? 'Verifying...' : 'Verify & Enter'}
            </button>
            <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: 0 }}>
              Dev mode: use 1234
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
