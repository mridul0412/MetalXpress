import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { requestOTP, verifyOTP } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const TRADER_TYPES = [
  { value: 'BUYER', label: 'Buyer', icon: '📥', desc: 'I buy scrap' },
  { value: 'SELLER', label: 'Seller', icon: '📤', desc: 'I sell scrap' },
  { value: 'BOTH', label: 'Buyer & Seller', icon: '🔄', desc: 'Both ways' },
  { value: 'CHECKING_RATES', label: 'Rate Checker', icon: '📊', desc: 'Just watching' },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [traderType, setTraderType] = useState('CHECKING_RATES');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await requestOTP(phone);
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await verifyOTP({ phone, otp, name, traderType });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 border-b flex items-center justify-between"
        style={{ borderColor: '#CFB53B22', background: '#0D0D0D' }}>
        <Link to="/" className="flex items-center gap-2 no-underline">
          <span className="text-lg">⚡</span>
          <span className="font-bold text-gold text-base">MetalXpress</span>
        </Link>
        <Link to="/" className="text-xs text-gray-600 hover:text-gray-400">← Back to Rates</Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">

          {/* Logo section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{ background: 'linear-gradient(135deg, #1A1500, #252000)', border: '1px solid #CFB53B44' }}>
              <span className="text-3xl">⚡</span>
            </div>
            <h1 className="text-xl font-bold text-white leading-tight">
              {step === 'phone' ? 'Welcome to MetalXpress' : 'Verify Your Number'}
            </h1>
            <p className="text-gray-500 text-sm mt-1.5">
              {step === 'phone'
                ? "India's scrap metal rate platform"
                : `OTP sent to +91 ${phone}`}
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl p-6 border"
            style={{ background: '#141414', borderColor: '#CFB53B22' }}>

            {/* Step: Phone */}
            {step === 'phone' && (
              <form onSubmit={handleRequestOTP}>
                <div className="mb-5">
                  <label className="text-xs text-gray-500 font-semibold mb-2 block uppercase tracking-wide">
                    Mobile Number
                  </label>
                  <div className="flex gap-2">
                    <div className="flex items-center bg-surface3 border border-border rounded-lg px-3 shrink-0 text-sm text-gray-400 font-semibold">
                      🇮🇳 +91
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="9876543210"
                      maxLength={10}
                      className="input-field flex-1"
                      autoFocus
                      required
                    />
                  </div>
                  <p className="text-[10px] text-gray-600 mt-1.5">
                    New users will be registered automatically
                  </p>
                </div>

                {error && (
                  <div className="rounded-lg px-3 py-2 mb-4 border" style={{ background: '#1A0505', borderColor: '#7f1d1d' }}>
                    <p className="text-red-400 text-xs">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || phone.length < 10}
                  className="btn-primary w-full py-3 text-sm"
                >
                  {loading ? 'Sending OTP...' : 'Send OTP →'}
                </button>

                <p className="text-center text-[10px] text-gray-700 mt-3">
                  Dev mode: OTP is always <span className="text-gray-500 font-bold">1234</span>
                </p>
              </form>
            )}

            {/* Step: OTP + Profile */}
            {step === 'otp' && (
              <form onSubmit={handleVerifyOTP}>
                <div className="mb-4">
                  <label className="text-xs text-gray-500 font-semibold mb-2 block uppercase tracking-wide">
                    4-Digit OTP
                  </label>
                  <input
                    type="number"
                    value={otp}
                    onChange={e => setOtp(e.target.value.slice(0, 4))}
                    placeholder="1234"
                    className="input-field text-center text-3xl tracking-[0.6em] font-bold py-4"
                    autoFocus
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="text-xs text-gray-500 font-semibold mb-2 block uppercase tracking-wide">
                    Your Name <span className="text-gray-700 normal-case font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Rajesh Kumar"
                    className="input-field"
                  />
                </div>

                <div className="mb-5">
                  <label className="text-xs text-gray-500 font-semibold mb-2 block uppercase tracking-wide">
                    I am a...
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {TRADER_TYPES.map(t => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setTraderType(t.value)}
                        className={`text-left px-3 py-2.5 rounded-lg border transition-all ${
                          traderType === t.value
                            ? 'border-gold bg-[#1A1500] text-gold'
                            : 'border-border text-gray-500 hover:border-border-light hover:text-gray-300'
                        }`}
                      >
                        <div className="text-base leading-none mb-0.5">{t.icon}</div>
                        <div className="text-xs font-semibold">{t.label}</div>
                        <div className="text-[9px] text-gray-600 mt-0.5">{t.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg px-3 py-2 mb-4 border" style={{ background: '#1A0505', borderColor: '#7f1d1d' }}>
                    <p className="text-red-400 text-xs">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || otp.length < 4}
                  className="btn-primary w-full py-3 text-sm"
                >
                  {loading ? 'Verifying...' : 'Verify & Enter ⚡'}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep('phone'); setError(''); setOtp(''); }}
                  className="w-full text-center text-xs text-gray-600 mt-3 hover:text-gray-400 transition-colors py-1"
                >
                  ← Change number
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-[10px] text-gray-700 mt-4">
            By logging in you agree to our terms of service
          </p>
        </div>
      </div>
    </div>
  );
}
