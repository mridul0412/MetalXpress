import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader, Mail } from 'lucide-react';
import { verifyEmail, resendVerification } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function VerifyEmail() {
  const [searchParams]  = useSearchParams();
  const navigate        = useNavigate();
  const { user, refreshUser } = useAuth();
  const token           = searchParams.get('token');

  const [status, setStatus]   = useState('loading'); // loading | success | error | pending
  const [message, setMessage] = useState('');
  const [resending, setResending] = useState(false);
  const [resent, setResent]       = useState(false);

  useEffect(() => {
    if (!token) {
      // No token = user just signed up, showing "check email" screen
      setStatus('pending');
      return;
    }

    // Token present = user clicked link in email → verify it
    verifyEmail(token)
      .then(async () => {
        setStatus('success');
        // Refresh auth context so emailVerified updates immediately
        if (refreshUser) await refreshUser();
      })
      .catch(err => {
        setStatus('error');
        setMessage(err.response?.data?.error || 'Verification failed. The link may have expired.');
      });
  }, [token]);

  async function handleResend() {
    setResending(true);
    try {
      await resendVerification();
      setResent(true);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to resend. Please try again.');
    } finally {
      setResending(false);
    }
  }

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
      body: 'Your MetalXpress account is now fully active. You can access all features.',
    },
    error: {
      icon: <AlertCircle size={28} color="#f87171" />,
      iconBg: 'rgba(248,113,113,0.1)', iconBorder: 'rgba(248,113,113,0.3)',
      title: 'Verification failed',
      body: message || 'This link is invalid or has expired.',
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

          {/* Actions per status */}
          {status === 'success' && (
            <button
              onClick={() => navigate('/')}
              style={{
                width: '100%', padding: '14px', borderRadius: 12, fontSize: 14,
                fontWeight: 700, background: '#CFB53B', color: '#000',
                border: 'none', cursor: 'pointer', fontFamily: 'monospace',
              }}
            >
              Go to MetalXpress →
            </button>
          )}

          {status === 'error' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Link to="/forgot-password" style={{
                display: 'block', padding: '14px', borderRadius: 12, fontSize: 14,
                fontWeight: 700, background: '#CFB53B', color: '#000',
                textDecoration: 'none', fontFamily: 'monospace',
              }}>
                Request New Link
              </Link>
              <Link to="/login" style={{
                display: 'block', padding: '13px', borderRadius: 12, fontSize: 14,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff', textDecoration: 'none', fontFamily: 'monospace',
              }}>
                Back to Login
              </Link>
            </div>
          )}

          {status === 'pending' && (
            <>
              {/* Info box */}
              <div style={{
                background: 'rgba(207,181,59,0.07)', border: '1px solid rgba(207,181,59,0.15)',
                borderRadius: 10, padding: '14px 16px', marginBottom: 20, textAlign: 'left',
              }}>
                <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                  📬 Can't find the email? Check your <strong style={{ color: 'rgba(255,255,255,0.7)' }}>spam or junk folder</strong>.
                  The link expires in 24 hours.
                </p>
              </div>

              {resent ? (
                <p style={{ fontSize: 13, color: '#34d399', margin: '0 0 16px' }}>
                  ✓ Verification email resent! Check your inbox.
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resending || !user}
                  style={{
                    width: '100%', padding: '13px', borderRadius: 12, fontSize: 13,
                    background: 'rgba(207,181,59,0.1)', border: '1px solid rgba(207,181,59,0.2)',
                    color: '#CFB53B', cursor: resending ? 'not-allowed' : 'pointer',
                    fontFamily: 'monospace', marginBottom: 12,
                  }}
                >
                  {resending ? 'Sending...' : 'Resend verification email'}
                </button>
              )}

              <button
                onClick={() => navigate('/')}
                style={{
                  width: '100%', padding: '13px', borderRadius: 12, fontSize: 13,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontFamily: 'monospace',
                }}
              >
                Skip for now — verify later
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
