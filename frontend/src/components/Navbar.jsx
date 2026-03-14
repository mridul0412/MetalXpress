import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchAlerts } from '../utils/api';

export default function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [alertCount, setAlertCount] = useState(0);

  const navItems = [
    { path: '/', label: 'Rates', icon: '📊' },
    { path: '/marketplace', label: 'Market', icon: '🏪' },
    { path: '/alerts', label: 'Alerts', icon: '🔔' },
  ];

  return (
    <>
      {/* Top header */}
      <header className="bg-[#111111] border-b border-[#2A2A2A] px-4 py-2.5 flex items-center justify-between sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <span className="text-lg">⚡</span>
          <span className="text-base font-bold text-white tracking-tight">MetalXpress</span>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 hidden sm:block">
                {user.name || user.phone}
              </span>
              <button
                onClick={logout}
                className="text-xs text-gray-500 hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-xs bg-[#4A90D9] text-white px-3 py-1.5 rounded font-semibold hover:bg-blue-500 transition-colors"
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
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#111111] border-t border-[#2A2A2A] sm:hidden">
        <div className="flex">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex-1 flex flex-col items-center py-2 text-center transition-colors ${
                  isActive ? 'text-[#4A90D9]' : 'text-gray-600'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-[10px] mt-0.5">{item.label}</span>
              </Link>
            );
          })}
          <Link
            to="/admin"
            className={`flex-1 flex flex-col items-center py-2 text-center transition-colors ${
              location.pathname === '/admin' ? 'text-[#4A90D9]' : 'text-gray-600'
            }`}
          >
            <span className="text-lg">⚙️</span>
            <span className="text-[10px] mt-0.5">Admin</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
