import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

// Components & Pages
import Navbar from './components/Navbar';
import Home from './pages/Home'; 
import Dashboard from './pages/Dashboard';
import BookingPage from './pages/BookingPage';
import Login from './pages/Login';
import BookingHistory from './pages/BookingHistory';
import WalletDashboard from './pages/WalletDashboard';
import AdminDashboard from './pages/AdminDashboard';

// 🛡️ SECURITY GUARD 1
const ProtectedRoute = ({ children }) => {
  const { token } = useContext(AuthContext);
  if (!token) return <Navigate to="/" replace />;
  
  // Wrap protected pages in the Navbar layout
  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      {children}
    </div>
  );
};

// 🛡️ SECURITY GUARD 2
const AdminRoute = ({ children }) => {
  const { token, user } = useContext(AuthContext);
  if (!token) return <Navigate to="/" replace />;
  if (user?.role !== 'ADMIN') return <Navigate to="/events" replace />;
  
  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      {children}
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* PROTECTED USER ROUTES */}
        <Route path="/events" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/book/:eventId" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><BookingHistory /></ProtectedRoute>} />
        <Route path="/wallet" element={<ProtectedRoute><WalletDashboard /></ProtectedRoute>} />

        {/* STRICT ADMIN ROUTE */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        
        {/* CATCH-ALL */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}