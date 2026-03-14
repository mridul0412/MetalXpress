import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestOTP, verifyOTP } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const TRADER_TYPES = [
  { value: 'BUYER', label: 'Buyer' },
  { value: 'SELLER', label: 'Seller' },
  { value: 'BOTH', label: 'Buyer & Seller' },
  { value: 'CHECKING_RATES', label: 'Just Checking Rates' },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState('phone'); // 'phone' | 'otp' | 'profile'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [traderType, setTraderType] = useState('CHECKING_RATES');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await requestOTP(phone);
      setMessage(res.data.message);
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await verifyOTP({ phone, otp, name, traderType, city });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">⚡</div>
          <h1 className="text-2xl font-bold text-white">MetalXpress</h1>
          <p className="text-gray-500 text-sm mt-1">India's Scrap Metal Rate Platform</p>
        </div>

        <div className="bg-surface rounded-xl border border-border p-6">
          {step === 'phone' && (
            <form onSubmit={handleRequestOTP}>
              <h2 className="text-white font-bold mb-4">Login / Register</h2>
              <div className="mb-4">
                <label className="text-xs text-gray-500 mb-1 block">Mobile Number</label>
                <div className="flex gap-2">
                  <span className="input-field w-14 text-center shrink-0 text-gray-400">+91</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    maxLength={10}
                    className="input-field flex-1"
                    required
                  />
                </div>
              </div>
              {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
              <button
                type="submit"
                disabled={loading || phone.length < 10}
                className="btn-primary w-full"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
              <p className="text-center text-[10px] text-gray-600 mt-3">
                Dev mode: OTP is always <strong className="text-gray-400">1234</strong>
              </p>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP}>
              <h2 className="text-white font-bold mb-1">Enter OTP</h2>
              <p className="text-gray-500 text-xs mb-4">{message || `Sent to +91 ${phone}`}</p>

              <div className="mb-4">
                <input
                  type="number"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="1234"
                  maxLength={4}
                  className="input-field text-center text-2xl tracking-[0.5em] font-bold"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="text-xs text-gray-500 mb-1 block">Your Name (optional)</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Rajesh Kumar"
                  className="input-field"
                />
              </div>

              <div className="mb-4">
                <label className="text-xs text-gray-500 mb-1 block">I am a...</label>
                <div className="grid grid-cols-2 gap-2">
                  {TRADER_TYPES.map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setTraderType(t.value)}
                      className={`text-xs px-2 py-1.5 rounded border transition-colors ${
                        traderType === t.value
                          ? 'border-[#4A90D9] bg-[#1A2A3A] text-[#4A90D9]'
                          : 'border-border text-gray-500 hover:border-gray-500'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
              <button
                type="submit"
                disabled={loading || otp.length < 4}
                className="btn-primary w-full"
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
              <button
                type="button"
                onClick={() => { setStep('phone'); setError(''); setOtp(''); }}
                className="w-full text-center text-xs text-gray-600 mt-3 hover:text-gray-400"
              >
                ← Change number
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
