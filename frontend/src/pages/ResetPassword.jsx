import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { resetPassword } from '../utils/api';

const inputStyle = {
  width: '100%', padding: '13px 14px', borderRadius: 12, fontSize: 14,
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
};

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate        = useNavigate();
  const token           = searchParams.get('token');

  const [password, setPassword]         = useState('');
  const [confirmPass, setConfirmPass]   = useState('');
  const [showPass, setShowPass]         = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [loading, setLoading]           = useState(false);
  const [done, setDone]                 = useState(false);
  const [error, setError]               = useState('');

  useEffect(() => {
    if (!token) setError('Invalid reset link. Please request a new one.');
  }, [token]);

  const strength = (() => {
    if (password.length === 0) return null;
    if (password.length < 6)   return { label: 'Too short', color: '#f87171', pct: 25 };
    if (password.length < 8)   return { label: 'Weak', color: '#fbbf24', pct: 50 };
    if (!/[0-9]/.test(password) || !/[A-Z]/.test(password)) return { label: 'Fair', color: '#a3e635', pct: 75 };
    return { label: 'Strong', color: '#34d399', pct: 100 };
  })();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    if (password !== confirmPass) return setError('Passwords do not match');
    setLoading(true);
    try {
      await resetPassword({ token, password });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. The link may have expired.');
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
      <div style={{
        position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 300, borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(ellipse, rgba(207,181,59,0.08) 0%, transparent 70%)',
      }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        <Link to="/login" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: 13,
          marginBottom: 24, fontFamily: 'monospace',
        }}
          onMouseEnter={e => e.currentTarget.style.color = '#CFB53B'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
        >
          <ArrowLeft size={14} /> Back to Login
        </Link>

        <div style={{
          background: '#0D1420', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16, padding: '36px 32px',
        }}>
          {done ? (
            /* ── Success ── */
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', margin: '0 auto 20px',
                background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CheckCircle size={28} color="#34d399" />
              </div>
              <h2 style={{ margin: '0 0 12px', fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>
                Password reset!
              </h2>
              <p style={{ margin: '0 0 28px', fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                Your password has been updated successfully. You can now sign in with your new password.
              </p>
              <button
                onClick={() => navigate('/login')}
                style={{
                  width: '100%', padding: '14px', borderRadius: 12, fontSize: 14,
                  fontWeight: 700, background: '#CFB53B', color: '#000',
                  border: 'none', cursor: 'pointer', fontFamily: 'monospace',
                }}
              >
                Sign In Now →
              </button>
            </div>
          ) : !token ? (
            /* ── Invalid token ── */
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', margin: '0 auto 20px',
                background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <AlertCircle size={28} color="#f87171" />
              </div>
              <h2 style={{ margin: '0 0 12px', fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>
                Invalid link
              </h2>
              <p style={{ margin: '0 0 28px', fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                This reset link is missing or invalid. Please request a new one.
              </p>
              <Link to="/forgot-password" style={{
                display: 'block', width: '100%', padding: '14px', borderRadius: 12, fontSize: 14,
                fontWeight: 700, background: '#CFB53B', color: '#000',
                border: 'none', cursor: 'pointer', fontFamily: 'monospace',
                textDecoration: 'none', textAlign: 'center',
              }}>
                Request New Link
              </Link>
            </div>
          ) : (
            /* ── Form ── */
            <>
              <div style={{
                width: 52, height: 52, borderRadius: 12, marginBottom: 20,
                background: 'rgba(207,181,59,0.1)', border: '1px solid rgba(207,181,59,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Lock size={22} color="#CFB53B" />
              </div>

              <h1 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>
                Set new password
              </h1>
              <p style={{ margin: '0 0 28px', fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                Choose a strong password for your MetalXpress account.
              </p>

              {error && (
                <div style={{
                  background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)',
                  borderRadius: 10, padding: '12px 14px', marginBottom: 20,
                  fontSize: 13, color: '#f87171',
                }}>
                  {error}{' '}
                  {error.includes('expired') && (
                    <Link to="/forgot-password" style={{ color: '#CFB53B' }}>Request new link →</Link>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* New password */}
                <label style={{ display: 'block', marginBottom: 4 }}>
                  <span style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                    NEW PASSWORD
                  </span>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} color="rgba(255,255,255,0.25)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                      style={{ ...inputStyle, paddingLeft: 40, paddingRight: 40 }}
                      onFocus={e => e.target.style.borderColor = 'rgba(207,181,59,0.5)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                    <button type="button" onClick={() => setShowPass(p => !p)} style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    }}>
                      {showPass ? <EyeOff size={16} color="rgba(255,255,255,0.3)" /> : <Eye size={16} color="rgba(255,255,255,0.3)" />}
                    </button>
                  </div>
                </label>

                {/* Strength bar */}
                {strength && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${strength.pct}%`, background: strength.color, transition: 'all 0.3s' }} />
                    </div>
                    <span style={{ fontSize: 11, color: strength.color, marginTop: 4, display: 'block' }}>{strength.label}</span>
                  </div>
                )}

                {/* Confirm password */}
                <label style={{ display: 'block', marginBottom: 24 }}>
                  <span style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                    CONFIRM PASSWORD
                  </span>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} color="rgba(255,255,255,0.25)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPass}
                      onChange={e => setConfirmPass(e.target.value)}
                      placeholder="Re-enter password"
                      required
                      style={{
                        ...inputStyle, paddingLeft: 40, paddingRight: 40,
                        borderColor: confirmPass && password !== confirmPass ? 'rgba(248,113,113,0.5)' : undefined,
                      }}
                      onFocus={e => e.target.style.borderColor = 'rgba(207,181,59,0.5)'}
                      onBlur={e => e.target.style.borderColor = confirmPass && password !== confirmPass ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.1)'}
                    />
                    <button type="button" onClick={() => setShowConfirm(p => !p)} style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    }}>
                      {showConfirm ? <EyeOff size={16} color="rgba(255,255,255,0.3)" /> : <Eye size={16} color="rgba(255,255,255,0.3)" />}
                    </button>
                  </div>
                  {confirmPass && password !== confirmPass && (
                    <span style={{ fontSize: 12, color: '#f87171', marginTop: 6, display: 'block' }}>Passwords do not match</span>
                  )}
                </label>

                <button
                  type="submit"
                  disabled={loading || (confirmPass && password !== confirmPass)}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 12, fontSize: 14,
                    fontWeight: 700, background: loading ? 'rgba(207,181,59,0.5)' : '#CFB53B',
                    color: '#000', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                    fontFamily: 'monospace', letterSpacing: '0.5px',
                  }}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
