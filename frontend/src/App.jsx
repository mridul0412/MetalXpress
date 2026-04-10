import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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

// Layout with Navbar + Footer for consumer-facing pages
function AppShell({ children }) {
  return (
    <>
      <Navbar />
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
          {/* Admin — standalone, no consumer Navbar/Footer */}
          <Route path="/admin" element={<Admin />} />
          {/* Consumer app — all wrapped with Navbar + Footer */}
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
