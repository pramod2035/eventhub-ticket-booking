import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function SeatGrid({ eventId, onSeatSelected, token }) {
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  const fetchSeats = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/bookings/seats/${eventId}`);
      setSeats(res.data);
    } catch (err) {
      console.error('Failed to fetch seats:', err);
    }
  };

  // Poll for seat updates every 5 seconds so users see real-time availability
  useEffect(() => {
    if (!eventId) return;
    fetchSeats();
    const interval = setInterval(fetchSeats, 5000); 
    return () => clearInterval(interval);
  }, [eventId]);

  const handleReserve = async (seat) => {
    if (seat.status !== 'AVAILABLE') return;

    try {
      // Calls the backend to securely lock the seat for 5 minutes
      const res = await axios.post(
        'http://localhost:5000/api/bookings/reserve',
        { seatId: seat._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSelectedSeat(seat);
      setTimeLeft(300); // Starts the 5-minute (300 seconds) countdown timer
      onSeatSelected(seat);
      fetchSeats(); // Refresh immediately to show it as reserved
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to lock seat. It may have just been taken!');
      fetchSeats();
    }
  };

  // Timer countdown logic
  useEffect(() => {
    if (!timeLeft || timeLeft <= 0) {
      if (timeLeft === 0 && selectedSeat) {
        setSelectedSeat(null);
        onSeatSelected(null);
      }
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, selectedSeat, onSeatSelected]);

  return (
    <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-lg border border-slate-800">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Select Your Seat</h3>
        {timeLeft > 0 && (
          <div className="bg-amber-500/10 text-amber-400 px-4 py-1.5 rounded-lg text-sm font-mono border border-amber-500/30 font-bold tracking-wide">
            Lock expires in: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
        )}
      </div>

      {/* Grid uses responsive sizing for mobile screens */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
        {seats.map((seat) => {
          let bgClass = 'bg-emerald-600 hover:bg-emerald-500 cursor-pointer shadow-sm';
          
          if (seat.status === 'RESERVED') {
            bgClass = 'bg-amber-600 cursor-not-allowed opacity-60';
          }
          if (seat.status === 'BOOKED') {
            bgClass = 'bg-rose-900 cursor-not-allowed opacity-40';
          }
          if (selectedSeat?._id === seat._id) {
            bgClass = 'bg-indigo-600 ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900 shadow-[0_0_15px_rgba(79,70,229,0.5)]';
          }

          return (
            <button
              key={seat._id}
              onClick={() => handleReserve(seat)}
              disabled={seat.status !== 'AVAILABLE'}
              className={`p-3 rounded-xl text-center font-bold text-sm transition-all duration-200 ${bgClass}`}
            >
              {seat.seatNumber}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-5 mt-8 justify-center text-xs text-slate-400 font-medium">
        <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 bg-emerald-600 rounded-full"></span> Available</span>
        <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 bg-amber-600 rounded-full opacity-60"></span> Reserved</span>
        <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 bg-rose-900 rounded-full opacity-40"></span> Booked</span>
        <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 bg-indigo-600 rounded-full"></span> Selected</span>
      </div>
    </div>
  );
}