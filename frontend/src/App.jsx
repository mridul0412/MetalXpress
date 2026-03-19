import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Marketplace from './pages/Marketplace';
import Alerts from './pages/Alerts';
import Admin from './pages/Admin';

// Layout with Navbar for consumer-facing pages
function AppShell({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Admin — standalone, no consumer Navbar */}
          <Route path="/admin" element={<Admin />} />
          {/* Consumer app — all wrapped with Navbar */}
          <Route path="/" element={<AppShell><Home /></AppShell>} />
          <Route path="/login" element={<AppShell><Login /></AppShell>} />
          <Route path="/marketplace" element={<AppShell><Marketplace /></AppShell>} />
          <Route path="/alerts" element={<AppShell><Alerts /></AppShell>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
