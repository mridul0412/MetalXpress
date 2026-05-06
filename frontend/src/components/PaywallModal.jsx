import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, X, Check, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { grantPro } from '../utils/api';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: null,
    badge: 'Current Plan',
    badgeColor: 'rgba(255,255,255,0.15)',
    features: [
      'Live LME & MCX rates',
      'Updated throughout the day',
      'Price alerts',
      'All metal types covered',
    ],
    cta: null,
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '\u20B9299',
    period: '/month',
    badge: 'Most Popular',
    badgeColor: 'rgba(207,181,59,0.25)',
    badgeTextColor: '#CFB53B',
    features: [
      'Everything in Free',
      'Local spot rates \u2014 all cities',
      'Full marketplace access',
      'Candlestick charts & analytics',
      'LME-MCX spread tracking',
      'Verified traders & materials',
    ],
    cta: 'Subscribe',
    highlight: true,
  },
];

/**
 * PaywallModal
 * Props:
 *   isOpen    — boolean
 *   onClose   — () => void
 *   trigger   — 'local_rates' | 'listing_contact'
 */
export default function PaywallModal({ isOpen, onClose, trigger = 'local_rates' }) {
  const { user, refreshSubscription } = useAuth();
  const navigate = useNavigate();
  const [granting, setGranting] = useState(false);
  const [grantError, setGrantError] = useState('');
  const [granted, setGranted] = useState(false);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Reset state on re-open
  useEffect(() => {
    if (isOpen) {
      setGranted(false);
      setGrantError('');
    }
  }, [isOpen]);

  const headline = trigger === 'listing_contact'
    ? 'Unlock Seller Contact'
    : 'Upgrade to BhavX Pro';

  const subheadline = trigger === 'listing_contact'
    ? 'Get full access — phone numbers, WhatsApp links, and verified marketplace.'
    : 'Access local spot rates, verified marketplace, and advanced analytics.';

  const handleSubscribe = async () => {
    if (!user) {
      onClose();
      navigate('/login');
      return;
    }
    setGranting(true);
    setGrantError('');
    try {
      await grantPro();
      if (refreshSubscription) await refreshSubscription();
      setGranted(true);
      // Auto-close after showing success briefly
      setTimeout(() => { onClose(); setGranted(false); }, 1800);
    } catch (err) {
      setGrantError(err.response?.data?.error || 'Could not activate Pro. Please try again.');
    } finally {
      setGranting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 900,
              background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
            }}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              position: 'fixed', inset: 0, zIndex: 901,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 16, pointerEvents: 'none',
            }}
          >
            <div style={{
              width: '100%', maxWidth: 520, borderRadius: 24, padding: '32px 28px',
              background: 'rgba(13,20,32,0.97)', backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderTop: '2px solid rgba(207,181,59,0.4)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
              pointerEvents: 'all', position: 'relative',
              maxHeight: '90vh', overflowY: 'auto',
            }}>

              {/* Close button */}
              <button onClick={onClose} style={{
                position: 'absolute', top: 20, right: 20, width: 32, height: 32,
                borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'rgba(255,255,255,0.5)',
              }}>
                <X size={16} />
              </button>

              {/* Icon + headline */}
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 18, margin: '0 auto 16px',
                  background: 'linear-gradient(135deg, rgba(207,181,59,0.2), rgba(207,181,59,0.05))',
                  border: '1px solid rgba(207,181,59,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {trigger === 'listing_contact'
                    ? <Lock size={28} color="#CFB53B" />
                    : <Crown size={28} color="#CFB53B" />
                  }
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 8px',
                  letterSpacing: '-0.02em' }}>
                  {headline}
                </h2>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', margin: 0, maxWidth: 400,
                  marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>
                  {subheadline}
                </p>
              </div>

              {/* Plan cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
                {PLANS.map(plan => (
                  <div key={plan.id} style={{
                    borderRadius: 16, padding: '20px 16px',
                    background: plan.highlight ? 'rgba(207,181,59,0.07)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${plan.highlight ? 'rgba(207,181,59,0.35)' : 'rgba(255,255,255,0.07)'}`,
                    position: 'relative', display: 'flex', flexDirection: 'column', gap: 14,
                  }}>
                    {/* Badge */}
                    <div style={{ display: 'inline-block', padding: '3px 8px', borderRadius: 6, fontSize: 10,
                      fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                      background: plan.badgeColor || 'rgba(255,255,255,0.08)',
                      color: plan.badgeTextColor || 'rgba(255,255,255,0.4)',
                      alignSelf: 'flex-start' }}>
                      {plan.badge}
                    </div>

                    {/* Name + price */}
                    <div>
                      <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>
                        {plan.name}
                      </p>
                      {plan.price ? (
                        <div style={{ margin: 0 }}>
                          {/* Strikethrough original price + FREE badge for Month 1 launch */}
                          <p style={{ margin: 0, display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.35)',
                              fontFamily: 'monospace', textDecoration: 'line-through' }}>
                              {plan.price}{plan.period}
                            </span>
                            <span style={{ fontSize: 22, fontWeight: 800, color: '#34d399',
                              fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                              FREE
                            </span>
                          </p>
                          <p style={{ margin: '4px 0 0', fontSize: 10, color: 'rgba(207,181,59,0.7)',
                            letterSpacing: '0.5px', textTransform: 'uppercase', fontWeight: 600 }}>
                            🎉 Free for Founding Traders — Limited Time
                          </p>
                        </div>
                      ) : (
                        <p style={{ fontSize: 20, fontWeight: 800, color: 'rgba(255,255,255,0.5)',
                          margin: 0, fontFamily: 'monospace' }}>
                          Free
                        </p>
                      )}
                    </div>

                    {/* Features */}
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex',
                      flexDirection: 'column', gap: 8, flex: 1 }}>
                      {plan.features.map(f => (
                        <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12,
                          color: 'rgba(255,255,255,0.65)', lineHeight: 1.4 }}>
                          <Check size={13} color={plan.highlight ? '#CFB53B' : '#34d399'}
                            style={{ flexShrink: 0, marginTop: 1 }} />
                          {f}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    {plan.cta ? (
                      <div>
                        <button onClick={handleSubscribe} disabled={granting || granted} style={{
                          width: '100%', padding: '11px', borderRadius: 10, fontWeight: 700, fontSize: 13,
                          border: 'none', cursor: (granting || granted) ? 'default' : 'pointer',
                          background: granted ? '#34d399' : (plan.highlight ? '#CFB53B' : 'rgba(255,255,255,0.08)'),
                          color: granted ? '#000' : (plan.highlight ? '#000' : 'rgba(255,255,255,0.7)'),
                          opacity: granting ? 0.7 : 1,
                          transition: 'all 0.15s',
                          boxShadow: plan.highlight ? '0 4px 16px rgba(207,181,59,0.25)' : 'none',
                        }}>
                          {granted ? '✓ You\'re Pro!' : (granting ? 'Activating…' : (user ? 'Activate Free Pro' : 'Login to Subscribe'))}
                        </button>
                        {grantError && (
                          <p style={{ marginTop: 8, fontSize: 11, color: '#f87171', textAlign: 'center' }}>
                            {grantError}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div style={{ width: '100%', padding: '11px', borderRadius: 10, fontSize: 13,
                        textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontWeight: 600,
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        Current Plan
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Footer note */}
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', margin: '0 0 12px' }}>
                  Razorpay-secured payment · Cancel anytime · No hidden fees
                </p>
                <button onClick={onClose}
                  style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', background: 'none',
                    border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Notify me when available →
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
