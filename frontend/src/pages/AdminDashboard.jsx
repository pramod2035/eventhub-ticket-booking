import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; // Added
import { PlusCircle, RefreshCcw, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('events');
  
  // Event State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [totalSeats, setTotalSeats] = useState(60);

  // Bookings State for Refunds
  const [bookings, setBookings] = useState([]);
  const { token, user } = useContext(AuthContext); 
  const navigate = useNavigate();

  // 🚨 THE SECURITY BOUNCER - THIS WAS MISSING
  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    if (user && user.role !== 'ADMIN') {
      navigate('/events'); 
    }
  }, [token, user, navigate]);

  // Fetch Bookings Effect
  useEffect(() => {
    if (activeTab === 'refunds' && token && user?.role === 'ADMIN') {
      fetchBookings();
    }
  }, [activeTab, token, user]);

  const fetchBookings = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/admin/events', {
        title, date, location, ticketPrice: parseInt(ticketPrice) * 100, totalSeats: parseInt(totalSeats)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Event and seats generated successfully!');
      setTitle(''); setDate(''); setLocation(''); setTicketPrice('');
    } catch (err) {
      alert(`Event Creation Failed: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleRefund = async (bookingId) => {
    if (!window.confirm("Are you sure you want to refund and cancel this booking?")) return;
    
    try {
      await axios.post(`http://localhost:5000/api/admin/refund/${bookingId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Refund processed successfully!');
      fetchBookings(); // Refresh the list
    } catch (err) {
      alert(`Refund Failed: ${err.response?.data?.error || err.message}`);
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Control Panel</h1>
        <p className="text-slate-400">Manage events, monitor transactions, and handle refunds.</p>
      </header>

      <div className="flex gap-4 mb-8 border-b border-slate-800 pb-4">
        <button 
          onClick={() => setActiveTab('events')}
          className={`px-6 py-2 rounded-full font-semibold transition-colors ${activeTab === 'events' ? 'bg-emerald-500 text-slate-900' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
        >
          Event Management
        </button>
        <button 
          onClick={() => setActiveTab('refunds')}
          className={`px-6 py-2 rounded-full font-semibold transition-colors ${activeTab === 'refunds' ? 'bg-emerald-500 text-slate-900' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
        >
          Refunds & Cancellations
        </button>
      </div>

      {activeTab === 'events' && (
        <div className="bg-slate-800/40 border border-slate-700 p-8 rounded-3xl max-w-2xl">
          <div className="flex items-center gap-4 mb-6 text-emerald-400">
            <PlusCircle size={28} />
            <h2 className="text-xl font-bold text-white">Create New Event</h2>
          </div>
          
          <form className="space-y-5" onSubmit={handleCreateEvent}>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Event Title</label>
              <input required value={title} onChange={(e) => setTitle(e.target.value)} type="text" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500" placeholder="e.g., Tech Summit 2026" />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Date & Time</label>
                <input required value={date} onChange={(e) => setDate(e.target.value)} type="datetime-local" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Location</label>
                <input required value={location} onChange={(e) => setLocation(e.target.value)} type="text" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500" placeholder="Auditorium A" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Ticket Price (₹)</label>
                <input required value={ticketPrice} onChange={(e) => setTicketPrice(e.target.value)} type="number" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500" placeholder="1500" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Total Seats</label>
                <input required value={totalSeats} onChange={(e) => setTotalSeats(e.target.value)} type="number" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500" placeholder="60" />
              </div>
            </div>

            <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold py-3.5 rounded-xl transition-colors mt-4 cursor-pointer">
              Generate Event & Seat Matrix
            </button>
          </form>
        </div>
      )}

      {activeTab === 'refunds' && (
        <div className="bg-slate-800/40 border border-slate-700 p-8 rounded-3xl">
          <div className="flex items-center gap-4 mb-6 text-amber-400">
            <AlertCircle size={28} />
            <h2 className="text-xl font-bold text-white">Active Bookings</h2>
          </div>
          
          <div className="space-y-4">
            {bookings.length === 0 ? <p className="text-slate-400">No active bookings found.</p> : null}
            {bookings.map((booking) => (
              <div key={booking._id} className="bg-slate-900 border border-slate-700 p-5 rounded-2xl flex justify-between items-center">
                <div>
                  <p className="text-white font-semibold mb-1">
                    {booking.eventId?.title || 'Unknown Event'} - Seat {booking.seatId?.seatNumber}
                  </p>
                  <p className="text-sm text-slate-400">
                    Amount: ₹{(booking.amountPaid / 100).toFixed(2)} | Status: {booking.status}
                  </p>
                </div>
                {booking.status === 'CONFIRMED' && (
                  <button 
                    onClick={() => handleRefund(booking._id)}
                    className="flex items-center gap-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white px-5 py-2.5 rounded-xl transition-colors font-medium border border-rose-500/20 cursor-pointer"
                  >
                    <RefreshCcw size={16} />
                    Process Refund
                  </button>
                )}
                {booking.status === 'CANCELLED' && (
                  <span className="text-rose-500 font-bold px-4 py-2 bg-rose-500/10 rounded-xl border border-rose-500/20">Refunded</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}