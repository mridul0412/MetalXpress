import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Shield, Save, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, checkSubscription } from '../utils/api';

const inputStyle = {
  width: '100%', padding: '12px 14px', borderRadius: 10, fontSize: 13,
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
};
const labelStyle = {
  fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em',
  color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 6,
};

export default function Profile() {
  const { user, logout, subscription, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [traderType, setTraderType] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    setName(user.name || '');
    setEmail(user.email || '');
    setPhone(user.phone || '');
    setCity(user.city || '');
    setTraderType(user.traderType || 'CHECKING_RATES');
  }, [user, authLoading]);

  const handleSave = async () => {
    setSaving(true); setError(''); setMessage('');
    try {
      await updateProfile({ name, email: email || undefined, phone: phone || undefined, city, traderType });
      setMessage('Profile updated!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update');
    } finally { setSaving(false); }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (authLoading) return <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Loading…</div>;

  const TRADER_TYPES = [
    { value: 'BUYER', label: 'Buyer', desc: 'I buy scrap metal' },
    { value: 'SELLER', label: 'Seller', desc: 'I sell scrap metal' },
    { value: 'BOTH', label: 'Buyer & Seller', desc: 'I do both' },
    { value: 'CHECKING_RATES', label: 'Just Checking Rates', desc: 'Browsing market data' },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24 md:pb-8">
      <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 24 }}>
        <User size={22} style={{ verticalAlign: 'middle', marginRight: 8, color: '#CFB53B' }} />
        Profile & Settings
      </h2>

      {/* Subscription status */}
      <div style={{ background: '#0D1420', borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)',
        padding: 18, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 4px' }}>
              Subscription
            </p>
            <p style={{ fontSize: 16, fontWeight: 700, color: subscription?.plan === 'pro' || subscription?.plan === 'business' ? '#34d399' : '#CFB53B', margin: 0 }}>
              {subscription?.plan === 'pro' ? 'Pro Plan' : subscription?.plan === 'business' ? 'Business Plan' : 'Free Plan'}
            </p>
          </div>
          <Shield size={24} style={{ color: subscription?.plan === 'pro' || subscription?.plan === 'business' ? '#34d399' : 'rgba(255,255,255,0.15)' }} />
        </div>
        {(!subscription?.plan || subscription?.plan === 'free') && (
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '8px 0 0' }}>
            Upgrade to Pro for local spot rates, analytics, and more.
          </p>
        )}
      </div>

      {/* Profile form */}
      <div style={{ background: '#0D1420', borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)',
        padding: 20, marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 16px' }}>Personal Information</h3>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={inputStyle} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Phone</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" style={inputStyle} />
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>City</label>
          <input value={city} onChange={e => setCity(e.target.value)} placeholder="Delhi, Mumbai, etc." style={inputStyle} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>I am a</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {TRADER_TYPES.map(t => (
              <button key={t.value} onClick={() => setTraderType(t.value)} style={{
                padding: '10px 12px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                background: traderType === t.value ? 'rgba(207,181,59,0.12)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${traderType === t.value ? 'rgba(207,181,59,0.3)' : 'rgba(255,255,255,0.06)'}`,
                color: traderType === t.value ? '#CFB53B' : 'rgba(255,255,255,0.4)',
                cursor: 'pointer', textAlign: 'left',
              }}>
                <div>{t.label}</div>
                <div style={{ fontSize: 10, opacity: 0.6, marginTop: 2 }}>{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {error && <p style={{ color: '#f87171', fontSize: 12, marginBottom: 8 }}>{error}</p>}
        {message && <p style={{ color: '#34d399', fontSize: 12, marginBottom: 8 }}>{message}</p>}

        <button onClick={handleSave} disabled={saving} style={{
          width: '100%', padding: '14px', borderRadius: 10, fontSize: 14, fontWeight: 700,
          background: '#CFB53B', color: '#000', border: 'none', cursor: 'pointer',
          opacity: saving ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}><Save size={16} /> {saving ? 'Saving…' : 'Save Changes'}</button>
      </div>

      {/* Logout */}
      <button onClick={handleLogout} style={{
        width: '100%', padding: '14px', borderRadius: 10, fontSize: 14, fontWeight: 700,
        background: 'transparent', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}><LogOut size={16} /> Sign Out</button>
    </div>
  );
}
