import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Calendar, MapPin } from 'lucide-react';

export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get('https://eventhub-ticket-booking.onrender.com/api/bookings/history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(res.data);
      } catch (err) {
        console.error("Failed to fetch history", err);
      }
    };
    
    if (token) {
      fetchHistory();
    }
  }, [token]);

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
        My Ticket History
      </h1>
      
      {bookings.length === 0 ? (
        <p className="text-slate-400 bg-slate-800/40 p-6 rounded-2xl border border-slate-700">You haven't booked any tickets yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {bookings.map(booking => (
            <div key={booking._id} className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700 hover:border-emerald-500/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold">{booking.eventId?.title || 'Unknown Event'}</h2>
                  <p className="text-emerald-400 font-bold mt-1">Seat: {booking.seatId?.seatNumber}</p>
                </div>
                <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                  {booking.status}
                </div>
              </div>
              
              <div className="space-y-2 mt-4 pt-4 border-t border-slate-700/50">
                <div className="flex items-center gap-3 text-slate-400 text-sm">
                  <Calendar size={16} />
                  {booking.eventId?.date ? new Date(booking.eventId.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'long', day: 'numeric' }) : 'N/A'}
                </div>
                <div className="flex items-center gap-3 text-slate-400 text-sm">
                  <MapPin size={16} />
                  {booking.eventId?.location || 'N/A'}
                </div>
                <div className="text-sm text-slate-500 mt-3 font-mono">
                  Amount Paid: ₹{(booking.amountPaid / 100).toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}