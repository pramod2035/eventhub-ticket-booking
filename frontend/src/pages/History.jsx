import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Calendar, MapPin, Hash } from 'lucide-react';

export default function History() {
  const { token } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/bookings/history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(res.data);
      } catch (err) {
        console.error('Failed to fetch history', err);
      }
    };
    if (token) fetchHistory();
  }, [token]);

  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">My Tickets</h1>

      {bookings.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 p-10 rounded-3xl text-center text-slate-400">
          You haven't booked any tickets yet.
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-slate-800 border border-slate-700 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
              
              {/* Status Ribbon */}
              <div className={`absolute top-0 left-0 w-2 h-full ${booking.status === 'CONFIRMED' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>

              <div className="flex-1 pl-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${booking.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {booking.status}
                  </span>
                  <p className="text-slate-400 text-sm flex items-center gap-1"><Hash size={14}/> {booking._id}</p>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-4">{booking.eventId?.title || 'Event Details Unavailable'}</h3>
                
                <div className="flex flex-wrap gap-6 text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-slate-500" />
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-slate-500" />
                    Seat: <strong className="text-emerald-400 ml-1 text-base">{booking.seatId?.seatNumber}</strong>
                  </div>
                </div>
              </div>

              <div className="text-right border-l border-slate-700 pl-6 shrink-0 hidden md:block">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Amount Paid</p>
                <p className="text-2xl font-bold text-white">₹{(booking.amountPaid / 100).toFixed(2)}</p>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}