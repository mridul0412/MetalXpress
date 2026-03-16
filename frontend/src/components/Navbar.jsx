import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/', label: 'Rates', icon: '📊' },
    { path: '/marketplace', label: 'Market', icon: '🏪' },
    { path: '/alerts', label: 'Alerts', icon: '🔔' },
  ];

  return (
    <>
      {/* Top header */}
      <header className="bg-[#0D0D0D] border-b border-border px-4 py-0 flex items-center justify-between sticky top-0 z-40"
        style={{ borderBottomColor: '#CFB53B22' }}>
        <Link to="/" className="flex items-center gap-2.5 no-underline py-3">
          <span className="text-xl leading-none">⚡</span>
          <div>
            <span className="text-base font-bold text-gold-light tracking-tight leading-none">
              MetalXpress
            </span>
            <span className="hidden sm:block text-[9px] text-gray-600 leading-none mt-0.5 tracking-widest uppercase">
              India Scrap Rates
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <div className="text-xs text-white font-semibold leading-none">
                  {user.name || 'Trader'}
                </div>
                <div className="text-[10px] text-gray-500 leading-none mt-0.5">
                  {user.phone}
                </div>
              </div>
              <button
                onClick={logout}
                className="text-xs text-gray-500 hover:text-red-400 transition-colors px-2 py-1 rounded border border-transparent hover:border-red-900"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-xs font-bold px-4 py-2 rounded-lg transition-colors"
              style={{ background: '#CFB53B', color: '#000' }}
            >
              Login
            </Link>
          )}
          <Link
            to="/admin"
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors hidden sm:block"
          >
            Admin
          </Link>
        </div>
      </header>

      {/* Bottom mobile nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t sm:hidden"
        style={{ background: '#0D0D0D', borderColor: '#CFB53B22' }}>
        <div className="flex">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex-1 flex flex-col items-center py-2 text-center transition-colors ${
                  isActive ? 'text-gold' : 'text-gray-600'
                }`}
              >
                <span className="text-lg leading-none">{item.icon}</span>
                <span className={`text-[10px] mt-0.5 font-semibold ${isActive ? 'text-gold' : ''}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
          <Link
            to="/admin"
            className={`flex-1 flex flex-col items-center py-2 text-center transition-colors ${
              location.pathname === '/admin' ? 'text-gold' : 'text-gray-600'
            }`}
          >
            <span className="text-lg leading-none">⚙️</span>
            <span className="text-[10px] mt-0.5 font-semibold">Admin</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
