import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Marketplace from './pages/Marketplace';
import Alerts from './pages/Alerts';
import Admin from './pages/Admin';
import About from './pages/About';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import { resendVerification } from './utils/api';

const COOLDOWN = 60;

// Amber banner shown on every page for unverified users
function EmailVerifyBanner() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [sending, setSending]   = useState(false);
  const [sent, setSent]         = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError]       = useState('');
  const timerRef                = useRef(null);

  useEffect(() => () => clearInterval(timerRef.current), []);

  // Don't show on auth / email-flow pages
  const hideOn = ['/login', '/signup', '/verify-email', '/forgot-password', '/reset-password'];
  if (!user || user.emailVerified !== false || hideOn.includes(location.pathname)) return null;

  function startCooldown(secs = COOLDOWN) {
    setCooldown(secs);
    timerRef.current = setInterval(() => {
      setCooldown(s => { if (s <= 1) { clearInterval(timerRef.current); return 0; } return s - 1; });
    }, 1000);
  }

  async function handleResend(e) {
    e.stopPropagation();
    if (cooldown > 0 || sending) return;
    setSending(true);
    setError('');
    try {
      await resendVerification();
      setSent(true);
      startCooldown();
    } catch (err) {
      const retryAfter = err.response?.data?.retryAfter;
      if (retryAfter) { startCooldown(retryAfter); }
      setError(err.response?.data?.error || 'Failed to resend. Try again.');
    } finally {
      setSending(false);
    }
  }

  const resendDisabled = sending || cooldown > 0;
  const resendLabel = sending ? 'Sending…' : cooldown > 0 ? `Resend in ${cooldown}s` : sent ? '✓ Sent' : 'Resend';

  return (
    <div style={{
      background: 'linear-gradient(90deg, #92400e, #78350f)',
      borderBottom: '1px solid rgba(251,191,36,0.3)',
      padding: '10px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 12, flexWrap: 'wrap',
    }}>
      <span style={{ fontSize: 13, color: '#fde68a', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 6 }}>
        ⚠️ <strong>Email not verified</strong> — check <span style={{ color: '#fbbf24' }}>{user.email}</span> and click the link to unlock full access.
      </span>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          onClick={() => navigate('/verify-email')}
          style={{
            padding: '5px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
            background: '#fbbf24', color: '#000', border: 'none', cursor: 'pointer',
            fontFamily: 'monospace', whiteSpace: 'nowrap',
          }}
        >
          Verify Now →
        </button>
        <button
          onClick={handleResend}
          disabled={resendDisabled}
          style={{
            padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
            background: 'transparent',
            border: '1px solid rgba(251,191,36,0.4)',
            color: resendDisabled ? 'rgba(253,230,138,0.4)' : '#fde68a',
            cursor: resendDisabled ? 'not-allowed' : 'pointer',
            fontFamily: 'monospace', whiteSpace: 'nowrap',
          }}
        >
          {resendLabel}
        </button>
      </div>
      {error && <span style={{ fontSize: 11, color: '#fca5a5', width: '100%', textAlign: 'center' }}>{error}</span>}
    </div>
  );
}

// Layout with Navbar + verification banner + Footer
function AppShell({ children }) {
  return (
    <>
      <Navbar />
      <EmailVerifyBanner />
      <main>{children}</main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Admin — standalone */}
          <Route path="/admin" element={<Admin />} />
          {/* Consumer pages */}
          <Route path="/" element={<AppShell><Home /></AppShell>} />
          <Route path="/login" element={<AppShell><Login /></AppShell>} />
          <Route path="/signup" element={<AppShell><Signup /></AppShell>} />
          <Route path="/marketplace" element={<AppShell><Marketplace /></AppShell>} />
          <Route path="/alerts" element={<AppShell><Alerts /></AppShell>} />
          <Route path="/about" element={<AppShell><About /></AppShell>} />
          <Route path="/terms" element={<AppShell><Terms /></AppShell>} />
          <Route path="/privacy" element={<AppShell><Privacy /></AppShell>} />
          <Route path="/contact" element={<AppShell><Contact /></AppShell>} />
          <Route path="/profile" element={<AppShell><Profile /></AppShell>} />
          <Route path="/forgot-password" element={<AppShell><ForgotPassword /></AppShell>} />
          <Route path="/reset-password" element={<AppShell><ResetPassword /></AppShell>} />
          <Route path="/verify-email" element={<AppShell><VerifyEmail /></AppShell>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
