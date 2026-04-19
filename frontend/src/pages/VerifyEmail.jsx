import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader, Mail } from 'lucide-react';
import { verifyEmail, resendVerification } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const COOLDOWN_SECS = 60;

export default function VerifyEmail() {
  const [searchParams]  = useSearchParams();
  const navigate        = useNavigate();
  const { user, refreshUser } = useAuth();
  const token           = searchParams.get('token');

  const [status, setStatus]         = useState('loading');
  const [resendError, setResendError] = useState('');
  const [resending, setResending]   = useState(false);
  const [resent, setResent]         = useState(false);
  const [cooldown, setCooldown]   = useState(0); // seconds remaining
  const timerRef                  = useRef(null);
  const verifiedRef               = useRef(false); // prevent StrictMode double-fire

  // Start cooldown countdown
  function startCooldown() {
    setCooldown(COOLDOWN_SECS);
    timerRef.current = setInterval(() => {
      setCooldown(s => {
        if (s <= 1) { clearInterval(timerRef.current); return 0; }
        return s - 1;
      });
    }, 1000);
  }

  useEffect(() => () => clearInterval(timerRef.current), []);

  useEffect(() => {
    if (!token) {
      setStatus('pending');
      return;
    }
    if (verifiedRef.current) return; // StrictMode guard — only call once
    verifiedRef.current = true;
    verifyEmail(token)
      .then(async () => {
        setStatus('success');
        try { if (refreshUser) await refreshUser(); } catch (_) {}
      })
      .catch(() => {
        setStatus('error');
      });
  }, [token]);

  async function handleResend() {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setResendError('');
    try {
      await resendVerification();
      setResent(true);
      startCooldown();
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to resend. Please try again.';
      setResendError(errMsg);
      // If server says wait, start cooldown from retryAfter value
      const retryAfter = err.response?.data?.retryAfter;
      if (retryAfter) {
        setCooldown(retryAfter);
        timerRef.current = setInterval(() => {
          setCooldown(s => {
            if (s <= 1) { clearInterval(timerRef.current); return 0; }
            return s - 1;
          });
        }, 1000);
      }
    } finally {
      setResending(false);
    }
  }

  const resendDisabled = resending || cooldown > 0 || !user;
  const resendLabel = resending
    ? 'Sending...'
    : cooldown > 0
    ? `Resend in ${cooldown}s`
    : resent
    ? '✓ Sent — check your inbox'
    : 'Resend verification email';

  const states = {
    loading: {
      icon: <Loader size={28} color="#CFB53B" style={{ animation: 'spin 1s linear infinite' }} />,
      iconBg: 'rgba(207,181,59,0.1)', iconBorder: 'rgba(207,181,59,0.2)',
      title: 'Verifying your email...',
      body: 'Please wait a moment.',
    },
    success: {
      icon: <CheckCircle size={28} color="#34d399" />,
      iconBg: 'rgba(52,211,153,0.1)', iconBorder: 'rgba(52,211,153,0.3)',
      title: 'Email verified!',
      body: 'Your BhavX account is now fully active. You can access all features.',
    },
    error: {
      icon: <AlertCircle size={28} color="#f87171" />,
      iconBg: 'rgba(248,113,113,0.1)', iconBorder: 'rgba(248,113,113,0.3)',
      title: 'Link expired or already used',
      body: 'This link is no longer valid. Request a fresh one below.',
    },
    pending: {
      icon: <Mail size={28} color="#CFB53B" />,
      iconBg: 'rgba(207,181,59,0.1)', iconBorder: 'rgba(207,181,59,0.2)',
      title: 'Check your email',
      body: `We've sent a verification link to ${user?.email || 'your email address'}. Click it to activate your account.`,
    },
  };

  const s = states[status];

  return (
    <div style={{
      minHeight: '100vh', background: '#080E1A',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px',
    }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      <div style={{
        position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 300, borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(ellipse, rgba(207,181,59,0.08) 0%, transparent 70%)',
      }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        <div style={{
          background: '#0D1420', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16, padding: '40px 32px', textAlign: 'center',
        }}>
          {/* Icon */}
          <div style={{
            width: 72, height: 72, borderRadius: '50%', margin: '0 auto 24px',
            background: s.iconBg, border: `1px solid ${s.iconBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {s.icon}
          </div>

          <h1 style={{ margin: '0 0 12px', fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>
            {s.title}
          </h1>
          <p style={{ margin: '0 0 28px', fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
            {s.body}
          </p>

          {/* Success */}
          {status === 'success' && (
            <button
              onClick={() => navigate('/')}
              style={{
                width: '100%', padding: '14px', borderRadius: 12, fontSize: 14,
                fontWeight: 700, background: '#CFB53B', color: '#000',
                border: 'none', cursor: 'pointer', fontFamily: 'monospace',
              }}
            >
              Go to BhavX →
            </button>
          )}

          {/* Error — resend fresh link */}
          {status === 'error' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {resendError && (
                <div style={{
                  background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
                  borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#f87171',
                }}>
                  {resendError}
                </div>
              )}
              {user ? (
                <button
                  onClick={handleResend}
                  disabled={resendDisabled}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 12, fontSize: 14,
                    fontWeight: 700,
                    background: resendDisabled ? 'rgba(207,181,59,0.4)' : '#CFB53B',
                    color: '#000', border: 'none',
                    cursor: resendDisabled ? 'not-allowed' : 'pointer',
                    fontFamily: 'monospace',
                  }}
                >
                  {resendLabel}
                </button>
              ) : (
                <Link to="/login" style={{
                  display: 'block', padding: '14px', borderRadius: 12, fontSize: 14,
                  fontWeight: 700, background: '#CFB53B', color: '#000',
                  textDecoration: 'none', fontFamily: 'monospace', textAlign: 'center',
                }}>
                  Log in to Resend
                </Link>
              )}
              <Link to="/login" style={{
                display: 'block', padding: '13px', borderRadius: 12, fontSize: 14,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff', textDecoration: 'none', fontFamily: 'monospace', textAlign: 'center',
              }}>
                Back to Login
              </Link>
            </div>
          )}

          {/* Pending — check inbox */}
          {status === 'pending' && (
            <>
              <div style={{
                background: 'rgba(207,181,59,0.07)', border: '1px solid rgba(207,181,59,0.15)',
                borderRadius: 10, padding: '14px 16px', marginBottom: 20, textAlign: 'left',
              }}>
                <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                  📬 Can't find the email? Check your <strong style={{ color: 'rgba(255,255,255,0.7)' }}>spam or junk folder</strong>.
                  The link expires in 24 hours.
                </p>
              </div>

              {resendError && (
                <div style={{
                  background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
                  borderRadius: 10, padding: '10px 14px', marginBottom: 12,
                  fontSize: 13, color: '#f87171',
                }}>
                  {resendError}
                </div>
              )}

              <button
                onClick={handleResend}
                disabled={resendDisabled}
                style={{
                  width: '100%', padding: '13px', borderRadius: 12, fontSize: 13,
                  background: resendDisabled
                    ? 'rgba(207,181,59,0.05)'
                    : 'rgba(207,181,59,0.1)',
                  border: '1px solid rgba(207,181,59,0.2)',
                  color: resendDisabled ? 'rgba(207,181,59,0.4)' : '#CFB53B',
                  cursor: resendDisabled ? 'not-allowed' : 'pointer',
                  fontFamily: 'monospace',
                }}
              >
                {resendLabel}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
