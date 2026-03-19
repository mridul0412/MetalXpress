import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ArrowRight, Smartphone, User, ChevronRight } from 'lucide-react';
import { requestOTP, verifyOTP } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const TRADER_TYPES = [
  { value: 'BUYER',          label: 'Buyer',              desc: 'I buy scrap metal' },
  { value: 'SELLER',         label: 'Seller',             desc: 'I sell scrap metal' },
  { value: 'BOTH',           label: 'Buyer & Seller',     desc: 'I do both' },
  { value: 'CHECKING_RATES', label: 'Just Checking',      desc: 'Market observer' },
];

// Google G icon SVG
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      <path fill="none" d="M0 0h48v48H0z"/>
    </svg>
  );
}

// Input field with gold focus ring
function Field({ label, children }) {
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 8 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '13px 14px', borderRadius: 12, fontSize: 15, fontWeight: 500,
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff', outline: 'none', boxSizing: 'border-box', transition: 'border 0.15s',
  fontFamily: 'inherit',
};

export default function Login() {
  // step: 'welcome' | 'phone' | 'otp'
  const [step, setStep]               = useState('welcome');
  const [phone, setPhone]             = useState('');
  const [otp, setOtp]                 = useState('');
  const [name, setName]               = useState('');
  const [traderType, setTraderType]   = useState('CHECKING_RATES');
  const [city, setCity]               = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();

  // Handle Google OAuth redirect: ?token=<jwt>
  useEffect(() => {
    const token = searchParams.get('token');
    const authError = searchParams.get('error');
    if (token) {
      // Auto-login from Google callback
      login(token, {});
      navigate('/');
    } else if (authError) {
      if (authError === 'google_not_configured') {
        setError('Google login is not configured. Use phone instead.');
      } else {
        setError('Google login failed. Please try phone login.');
      }
      setStep('welcome');
    }
  }, [searchParams, login, navigate]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (phone.length < 10) return;
    setLoading(true); setError('');
    try {
      await requestOTP(phone);
      setStep('otp');
    } catch {
      setError('Failed to send OTP. Try again.');
    } finally { setLoading(false); }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length < 4) return;
    setLoading(true); setError('');
    try {
      const res = await verifyOTP({ phone, otp, name: name || undefined, traderType, city: city || undefined });
      const data = res.data;
      login(data.token, data.user || { phone });
      navigate('/');
    } catch {
      setError('Invalid OTP. In dev mode, use 1234.');
    } finally { setLoading(false); }
  };

  const googleAvailable = GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'undefined' && GOOGLE_CLIENT_ID.length > 8;

  return (
    <div style={{
      minHeight: '100vh', background: '#080E1A', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 16, position: 'relative', overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '25%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 500, height: 500, background: 'rgba(207,181,59,0.06)',
        borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          width: '100%', maxWidth: 440, borderRadius: 24, padding: 32, position: 'relative', zIndex: 1,
          background: 'rgba(13,20,32,0.85)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderTop: '2px solid rgba(207,181,59,0.35)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}
      >
        {/* MetalXpress logo + heading */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #CFB53B, #A89028)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(207,181,59,0.3)',
          }}>
            <Shield size={28} color="#000" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: '0 0 4px',
            letterSpacing: '-0.02em' }}>
            {step === 'welcome' ? 'Welcome to MetalXpress' :
             step === 'phone'   ? 'Enter Phone Number' :
                                  'Verify & Set Up'}
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            {step === 'welcome' ? 'India\'s scrap metal rate platform' :
             step === 'phone'   ? 'We\'ll send a one-time code' :
                                  `OTP sent to ${phone}`}
          </p>
        </div>

        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)',
                borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#f87171',
                textAlign: 'center', marginBottom: 16 }}>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Step: Welcome ── */}
        {step === 'welcome' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Google OAuth button */}
            {googleAvailable ? (
              <a href="/api/auth/google"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  padding: '13px 20px', borderRadius: 12, fontWeight: 700, fontSize: 14,
                  background: '#fff', color: '#1a1a1a', border: 'none', cursor: 'pointer',
                  textDecoration: 'none', transition: 'background 0.15s',
                }}>
                <GoogleIcon />
                Continue with Google
              </a>
            ) : (
              <div title="Set VITE_GOOGLE_CLIENT_ID in frontend/.env to enable"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  padding: '13px 20px', borderRadius: 12, fontWeight: 700, fontSize: 14,
                  background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)', cursor: 'not-allowed',
                }}>
                <GoogleIcon />
                Continue with Google
                <span style={{ fontSize: 10, background: 'rgba(255,255,255,0.1)',
                  padding: '2px 6px', borderRadius: 4 }}>Not configured</span>
              </div>
            )}

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>OR</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            </div>

            {/* Phone button */}
            <button onClick={() => setStep('phone')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: '13px 20px', borderRadius: 12, fontWeight: 700, fontSize: 14,
                background: '#CFB53B', color: '#000', border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(207,181,59,0.25)', transition: 'background 0.15s',
              }}>
              <Smartphone size={18} />
              Continue with Phone
              <ArrowRight size={16} />
            </button>

            <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.2)', margin: '4px 0 0' }}>
              By continuing, you agree to MetalXpress Terms of Service
            </p>
          </div>
        )}

        {/* ── Step: Phone entry ── */}
        {step === 'phone' && (
          <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Mobile Number">
              <div style={{ position: 'relative' }}>
                <Smartphone size={16} color="rgba(255,255,255,0.3)" style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none',
                }} />
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="9876543210" required autoFocus
                  style={{ ...inputStyle, paddingLeft: 42, fontSize: 16 }}
                  onFocus={e => e.target.style.borderColor = '#CFB53B'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
            </Field>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setStep('welcome')}
                style={{ padding: '13px 16px', borderRadius: 12, fontWeight: 700, fontSize: 14,
                  background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)',
                  border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                Back
              </button>
              <button type="submit" disabled={loading || phone.length < 10}
                style={{ flex: 1, padding: '13px', borderRadius: 12, fontWeight: 700, fontSize: 14,
                  background: '#CFB53B', color: '#000', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 4px 16px rgba(207,181,59,0.25)',
                  opacity: (loading || phone.length < 10) ? 0.5 : 1 }}>
                {loading ? 'Sending…' : 'Get OTP'}
                {!loading && <ArrowRight size={16} />}
              </button>
            </div>
            <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: 0 }}>
              Dev mode: any 10-digit number works
            </p>
          </form>
        )}

        {/* ── Step: OTP + profile setup ── */}
        {step === 'otp' && (
          <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* OTP input */}
            <Field label={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>One-Time Code</span>
                <button type="button" onClick={() => setStep('phone')}
                  style={{ fontSize: 12, color: '#CFB53B', background: 'none', border: 'none',
                    cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>
                  Change Number
                </button>
              </div>
            }>
              <input type="text" value={otp} onChange={e => setOtp(e.target.value)}
                placeholder="1234" maxLength={4} required autoFocus
                style={{ ...inputStyle, fontSize: 28, fontWeight: 700, textAlign: 'center',
                  letterSpacing: '0.5em', fontFamily: 'monospace' }}
                onFocus={e => e.target.style.borderColor = '#CFB53B'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </Field>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Optional Profile
              </span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            </div>

            {/* Name */}
            <Field label="Your Name">
              <div style={{ position: 'relative' }}>
                <User size={15} color="rgba(255,255,255,0.3)" style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none',
                }} />
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Ramesh Gupta"
                  style={{ ...inputStyle, paddingLeft: 42 }}
                  onFocus={e => e.target.style.borderColor = '#CFB53B'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
            </Field>

            {/* Trader type */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 8 }}>
                I am a
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {TRADER_TYPES.map(t => {
                  const active = traderType === t.value;
                  return (
                    <button key={t.value} type="button" onClick={() => setTraderType(t.value)}
                      style={{
                        padding: '10px 12px', borderRadius: 10, textAlign: 'left', cursor: 'pointer',
                        background: active ? 'rgba(207,181,59,0.12)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${active ? 'rgba(207,181,59,0.5)' : 'rgba(255,255,255,0.08)'}`,
                        transition: 'all 0.15s',
                      }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: active ? '#CFB53B' : '#fff',
                        margin: '0 0 2px' }}>{t.label}</p>
                      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', margin: 0 }}>{t.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <button type="submit" disabled={loading || otp.length < 4}
              style={{ width: '100%', padding: '14px', borderRadius: 12, fontWeight: 700, fontSize: 15,
                background: '#CFB53B', color: '#000', border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(207,181,59,0.25)',
                opacity: (loading || otp.length < 4) ? 0.5 : 1 }}>
              {loading ? 'Verifying…' : 'Verify & Enter'}
            </button>

            <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: 0 }}>
              Dev mode: use 1234
            </p>
          </form>
        )}
      </motion.div>
    </div>
  );
}
