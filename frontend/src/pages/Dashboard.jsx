import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Ticket, Wallet } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [wallet, setWallet] = useState(0);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch real events only. No dummy data fallback!
        const eventRes = await axios.get('https://eventhub-ticket-booking.onrender.com/api/bookings/events', {
           headers: { Authorization: `Bearer ${token}` }
        });
        setEvents(eventRes.data);

        // Fetch actual wallet balance
        const walletRes = await axios.get('https://eventhub-ticket-booking.onrender.com/api/wallet/balance', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWallet(walletRes.data.balance);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
        setError("Failed to load events. Please check your backend connection.");
      }
    };

    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-12 border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          EventHub Booking
        </h1>
        <div className="flex items-center gap-4 bg-slate-800/50 px-6 py-3 rounded-2xl border border-slate-700">
          <Wallet className="text-emerald-400" />
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Wallet Balance</p>
            <p className="text-xl font-bold text-white">₹{(wallet / 100).toFixed(2)}</p>
          </div>
        </div>
      </header>

      {error && <div className="bg-rose-500/10 text-rose-400 p-4 rounded-xl mb-6 text-center font-bold border border-rose-500/20">{error}</div>}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <div key={event._id} className="bg-slate-800/40 border border-slate-700 p-6 rounded-3xl hover:border-emerald-500/50 transition-colors group">
            <div className="bg-emerald-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Ticket className="text-emerald-400" />
            </div>
            
            <h2 className="text-xl font-bold text-white mb-4">{event.title}</h2>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-slate-400 text-sm">
                <Calendar size={16} className="text-slate-500"/>
                {new Date(event.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'long', day: 'numeric' })}
              </div>
              <div className="flex items-center gap-3 text-slate-400 text-sm">
                <MapPin size={16} className="text-slate-500"/>
                {event.location}
              </div>
            </div>

            <div className="flex justify-between items-center mt-auto">
              <div>
                <p className="text-xs text-slate-500 mb-1">Price</p>
                <p className="text-lg font-bold text-emerald-400">₹{(event.ticketPrice / 100).toFixed(2)}</p>
              </div>
              <button 
                onClick={() => navigate(`/book/${event._id}`)}
                className="bg-white text-slate-900 px-6 py-2.5 rounded-full font-semibold hover:bg-emerald-400 hover:text-white transition-colors cursor-pointer"
              >
                Book Seats
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}