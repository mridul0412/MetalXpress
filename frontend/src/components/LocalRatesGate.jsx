import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PaywallModal from './PaywallModal';

export default function LocalRatesGate({ children }) {
  const { user, subscription } = useAuth();
  const [showPaywall, setShowPaywall] = useState(false);

  const canView = subscription?.plan === 'pro' || subscription?.plan === 'business';

  // Logged in with active subscription — show full content
  if (user && canView) return children;

  // Otherwise show blurred preview with CTA overlay
  return (
    <div style={{ position: 'relative' }}>
      {/* Blurred content behind */}
      <div style={{
        maxHeight: 320, overflow: 'hidden',
        filter: 'blur(6px)', opacity: 0.5,
        pointerEvents: 'none', userSelect: 'none',
      }}>
        {children}
      </div>

      {/* Gradient fade overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(8,14,26,0.2) 0%, rgba(8,14,26,0.85) 60%, rgba(8,14,26,0.98) 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 24, textAlign: 'center',
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: 'linear-gradient(135deg, rgba(207,181,59,0.2), rgba(207,181,59,0.08))',
          border: '1px solid rgba(207,181,59,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 14,
        }}>
          {user ? <Crown size={22} color="#CFB53B" /> : <Lock size={22} color="#CFB53B" />}
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>
          {user ? 'Upgrade to Pro' : 'Sign Up to View Local Rates'}
        </h3>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '0 0 16px', maxWidth: 280, lineHeight: 1.4 }}>
          {user
            ? 'Get access to real-time local spot rates, price analytics, and more with MetalXpress Pro.'
            : 'Create a free account to explore. Upgrade to Pro for full access to local spot rates across all cities.'}
        </p>

        {user ? (
          <button onClick={() => setShowPaywall(true)} style={{
            padding: '10px 24px', borderRadius: 10, fontWeight: 700, fontSize: 13,
            background: '#CFB53B', color: '#000', border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(207,181,59,0.3)',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            <Crown size={14} /> Upgrade to Pro — ₹299/mo
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/signup" style={{
              padding: '10px 24px', borderRadius: 10, fontWeight: 700, fontSize: 13,
              background: '#CFB53B', color: '#000', textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(207,181,59,0.3)',
            }}>
              Sign Up Free
            </Link>
            <Link to="/login" style={{
              padding: '10px 24px', borderRadius: 10, fontWeight: 700, fontSize: 13,
              background: 'transparent', color: '#CFB53B', textDecoration: 'none',
              border: '1px solid rgba(207,181,59,0.35)',
            }}>
              Login
            </Link>
          </div>
        )}
      </div>

      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} trigger="local_rates" />
    </div>
  );
}
