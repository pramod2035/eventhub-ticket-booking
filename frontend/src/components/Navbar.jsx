import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Ticket, LogOut, Wallet, Clock, Shield } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
      <Link to="/events" className="flex items-center gap-2 text-indigo-400 font-bold text-2xl">
        <Ticket size={28} /> EventHub
      </Link>
      
      <div className="flex items-center gap-6">
        <Link to="/events" className="text-slate-300 hover:text-white font-medium">Events</Link>
        <Link to="/history" className="text-slate-300 hover:text-white font-medium flex items-center gap-2">
          <Clock size={18} /> History
        </Link>
        <Link to="/wallet" className="text-slate-300 hover:text-white font-medium flex items-center gap-2">
          <Wallet size={18} /> Wallet
        </Link>
        
        {user?.role === 'ADMIN' && (
          <Link to="/admin" className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-2 ml-4 bg-amber-400/10 px-4 py-1.5 rounded-full border border-amber-400/20">
            <Shield size={18} /> Admin Panel
          </Link>
        )}

        <button 
          onClick={handleLogout}
          className="ml-4 flex items-center gap-2 bg-slate-800 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 px-4 py-2 rounded-full transition-colors border border-slate-700 hover:border-rose-500/30"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </nav>
  );
}