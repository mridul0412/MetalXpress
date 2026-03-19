import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, Smartphone } from 'lucide-react';
import { requestOTP, verifyOTP } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [phone, setPhone]   = useState('');
  const [otp, setOtp]       = useState('');
  const [step, setStep]     = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSend = async (e) => {
    e.preventDefault();
    if (phone.length < 10) return;
    setLoading(true); setError('');
    try {
      await requestOTP(phone);
      setStep(2);
    } catch {
      setError('Failed to send OTP. Try again.');
    } finally { setLoading(false); }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length < 4) return;
    setLoading(true); setError('');
    try {
      const res = await verifyOTP({ phone, otp });
      const data = res.data;
      login(data.token, data.user || { phone });
      navigate('/');
    } catch {
      setError('Invalid OTP. Try 1234.');
    } finally { setLoading(false); }
  };

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
          width: '100%', maxWidth: 420, borderRadius: 24, padding: 32, position: 'relative', zIndex: 1,
          background: 'rgba(13,20,32,0.8)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderTop: '2px solid rgba(207,181,59,0.3)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}
      >
        {/* Icon + heading */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16, margin: '0 auto 20px',
            background: 'linear-gradient(135deg, #CFB53B, #A89028)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(207,181,59,0.3)',
          }}>
            <Shield size={28} color="#000" strokeWidth={2} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
            Trader Access
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '8px 0 0' }}>
            Enter your registered mobile number
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 8 }}>
                Phone Number
              </label>
              <div style={{ position: 'relative' }}>
                <Smartphone size={17} color="rgba(255,255,255,0.3)" style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none',
                }} />
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="9876543210" required
                  style={{
                    width: '100%', padding: '14px 14px 14px 42px', borderRadius: 12, fontSize: 16, fontWeight: 500,
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff', outline: 'none', boxSizing: 'border-box', transition: 'border 0.15s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#CFB53B'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
            </div>

            {error && (
              <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)',
                borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#f87171', textAlign: 'center' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading || phone.length < 10} style={{
              width: '100%', padding: '14px', borderRadius: 12, fontWeight: 700, fontSize: 15,
              background: '#CFB53B', color: '#000', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 4px 16px rgba(207,181,59,0.25)', transition: 'background 0.15s',
              opacity: (loading || phone.length < 10) ? 0.5 : 1,
            }}>
              {loading ? 'Sending…' : 'Get OTP'}
              {!loading && <ArrowRight size={18} />}
            </button>
            <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: 0 }}>
              Demo: any 10-digit number works
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)' }}>
                  Secure OTP
                </label>
                <button type="button" onClick={() => setStep(1)} style={{
                  fontSize: 12, color: '#CFB53B', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600,
                }}>
                  Change Number
                </button>
              </div>
              <input type="text" value={otp} onChange={e => setOtp(e.target.value)}
                placeholder="1234" maxLength={4} required
                style={{
                  width: '100%', padding: '14px', borderRadius: 12, fontSize: 28, fontWeight: 700,
                  textAlign: 'center', letterSpacing: '0.5em', fontFamily: 'monospace',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', outline: 'none', boxSizing: 'border-box', transition: 'border 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = '#CFB53B'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            {error && (
              <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)',
                borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#f87171', textAlign: 'center' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading || otp.length < 4} style={{
              width: '100%', padding: '14px', borderRadius: 12, fontWeight: 700, fontSize: 15,
              background: '#CFB53B', color: '#000', border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(207,181,59,0.25)', transition: 'background 0.15s',
              opacity: (loading || otp.length < 4) ? 0.5 : 1,
            }}>
              {loading ? 'Verifying…' : 'Verify & Enter'}
            </button>
            <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: 0 }}>
              Demo: use 1234
            </p>
          </form>
        )}
      </motion.div>
    </div>
  );
}
