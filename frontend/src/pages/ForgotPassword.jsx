import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { forgotPassword } from '../utils/api';

const inputStyle = {
  width: '100%', padding: '13px 14px', borderRadius: 12, fontSize: 14,
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
};

export default function ForgotPassword() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email.trim()) return setError('Please enter your email address');
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#080E1A',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px',
    }}>
      {/* Gold radial glow */}
      <div style={{
        position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 300, borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(ellipse, rgba(207,181,59,0.08) 0%, transparent 70%)',
      }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>

        {/* Back link */}
        <Link to="/login" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: 13,
          marginBottom: 24, fontFamily: 'monospace',
          transition: 'color 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.color = '#CFB53B'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
        >
          <ArrowLeft size={14} /> Back to Login
        </Link>

        {/* Card */}
        <div style={{
          background: '#0D1420', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16, padding: '36px 32px',
        }}>

          {sent ? (
            /* ── Success state ── */
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', margin: '0 auto 20px',
                background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CheckCircle size={28} color="#34d399" />
              </div>
              <h2 style={{ margin: '0 0 12px', fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>
                Check your email
              </h2>
              <p style={{ margin: '0 0 8px', fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                We've sent a password reset link to:
              </p>
              <p style={{ margin: '0 0 24px', fontSize: 14, color: '#CFB53B', fontWeight: 600, fontFamily: 'monospace' }}>
                {email}
              </p>
              <p style={{ margin: '0 0 28px', fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>
                The link expires in 1 hour. Check your spam folder if you don't see it.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                style={{
                  width: '100%', padding: '13px', borderRadius: 12, fontSize: 14,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', cursor: 'pointer', fontFamily: 'monospace',
                }}
              >
                Try a different email
              </button>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              {/* Icon */}
              <div style={{
                width: 52, height: 52, borderRadius: 12, marginBottom: 20,
                background: 'rgba(207,181,59,0.1)', border: '1px solid rgba(207,181,59,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Mail size={22} color="#CFB53B" />
              </div>

              <h1 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>
                Forgot password?
              </h1>
              <p style={{ margin: '0 0 28px', fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                Enter your email and we'll send you a link to reset your password.
              </p>

              {error && (
                <div style={{
                  background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)',
                  borderRadius: 10, padding: '12px 14px', marginBottom: 20,
                  fontSize: 13, color: '#f87171',
                }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <label style={{ display: 'block', marginBottom: 20 }}>
                  <span style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                    EMAIL ADDRESS
                  </span>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} color="rgba(255,255,255,0.25)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      style={{ ...inputStyle, paddingLeft: 40 }}
                      onFocus={e => e.target.style.borderColor = 'rgba(207,181,59,0.5)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 12, fontSize: 14,
                    fontWeight: 700, background: loading ? 'rgba(207,181,59,0.5)' : '#CFB53B',
                    color: '#000', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                    fontFamily: 'monospace', letterSpacing: '0.5px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <p style={{ margin: '20px 0 0', textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
                Remember your password?{' '}
                <Link to="/login" style={{ color: '#CFB53B', textDecoration: 'none' }}>Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
