import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, Wallet, AlertCircle } from 'lucide-react';

export default function BookingPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useContext(AuthContext);
  
  const [event, setEvent] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Fetch Event Details & Seats
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all events (since we don't have a single event endpoint, we filter it here)
        const eventRes = await axios.get('https://eventhub-ticket-booking.onrender.com/api/bookings/events', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const currentEvent = eventRes.data.find(e => e._id === eventId);
        setEvent(currentEvent);

        // Fetch Seats for this event
        const seatRes = await axios.get(`https://eventhub-ticket-booking.onrender.com/api/bookings/seats/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSeats(seatRes.data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
      // Optional: Poll every 10 seconds to keep seat status updated for the user
      const interval = setInterval(fetchData, 10000);
      return () => clearInterval(interval);
    }
  }, [eventId, token]);

  // 1. Reserve the Seat (Locks for 5 mins)
  const handleSeatClick = async (seat) => {
    if (seat.status === 'BOOKED' || (seat.status === 'RESERVED' && seat.lockedBy !== user?.id)) {
      return; // Prevent clicking unavailable seats
    }

    try {
      const res = await axios.post('https://eventhub-ticket-booking.onrender.com/api/bookings/reserve', 
        { seatId: seat._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSelectedSeat(res.data.seat);
      
      // Update local state instantly so UI feels fast
      setSeats(prev => prev.map(s => s._id === seat._id ? res.data.seat : s));
    } catch (err) {
      alert(`Could not reserve seat: ${err.response?.data?.message || err.message}`);
    }
  };

  // 2. Pay and Confirm Booking
  const handlePayment = async () => {
    if (!selectedSeat) return;
    setProcessing(true);

    try {
      // Generate a random string for the Idempotency-Key header to prevent double charges
      const idempotencyKey = Math.random().toString(36).substring(2) + Date.now().toString(36);

      await axios.post('https://eventhub-ticket-booking.onrender.com/api/bookings/confirm',
        { seatId: selectedSeat._id },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Idempotency-Key': idempotencyKey
          } 
        }
      );
      
      alert('🎉 Ticket Booked Successfully!');
      navigate('/history'); // Send them to view their shiny new ticket
      
    } catch (err) {
      const realError = err.response?.data?.error || err.response?.data?.message || err.message;
      alert(`Transaction Rejected: ${realError}`);
      
      // If it failed because the lock expired or funds were low, refresh the seats
      if (realError.includes('expired') || realError.includes('funds')) {
        setSelectedSeat(null);
        window.location.reload();
      }
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-emerald-400 font-bold">Loading Seat Matrix...</div>;
  if (!event) return <div className="min-h-screen flex items-center justify-center text-rose-400">Event not found.</div>;

  return (
    <div className="min-h-screen bg-slate-900 p-8 text-white max-w-6xl mx-auto flex flex-col md:flex-row gap-10">
      
      {/* LEFT COLUMN: Seat Matrix */}
      <div className="flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
          <p className="text-slate-400">{new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} • {event.location}</p>
        </div>

        {/* 🎬 STAGE / SCREEN INDICATOR */}
        <div className="w-full max-w-2xl mx-auto mb-16 mt-4 relative">
          <div className="h-3 w-full bg-gradient-to-r from-cyan-500/20 via-emerald-400 to-cyan-500/20 rounded-t-[100%] shadow-[0_-15px_40px_rgba(52,211,153,0.3)]"></div>
          <p className="text-center text-slate-400 text-xs font-bold tracking-[0.4em] mt-4 uppercase">
            All eyes this way (Stage)
          </p>
          <div className="absolute top-3 left-0 w-full h-24 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none"></div>
        </div>

        {/* 🪑 SEAT GRID */}
        <div className="grid grid-cols-10 gap-3 max-w-2xl mx-auto">
          {seats.map(seat => {
            const isMyReservation = seat.status === 'RESERVED' && seat.lockedBy === user?.id;
            const isSelected = selectedSeat?._id === seat._id;
            
            // Determine styling based on real-time status
            let seatStyle = "bg-slate-800 border-slate-700 hover:border-emerald-400 hover:bg-emerald-500/20 text-slate-300 cursor-pointer"; // Default Available
            
            if (seat.status === 'BOOKED') {
              seatStyle = "bg-rose-500/10 border-rose-500/30 text-rose-500/50 cursor-not-allowed";
            } else if (seat.status === 'RESERVED' && !isMyReservation) {
              seatStyle = "bg-amber-500/10 border-amber-500/30 text-amber-500/50 cursor-not-allowed";
            } else if (isSelected || isMyReservation) {
              seatStyle = "bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]";
            }

            return (
              <button
                key={seat._id}
                onClick={() => handleSeatClick(seat)}
                disabled={seat.status === 'BOOKED' || (seat.status === 'RESERVED' && !isMyReservation)}
                className={`aspect-square rounded-t-lg rounded-b-sm border-2 flex items-center justify-center text-xs font-bold transition-all ${seatStyle}`}
              >
                {seat.seatNumber}
              </button>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="flex justify-center gap-6 mt-12 text-sm text-slate-400">
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-slate-800 border border-slate-600"></div> Available</div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-cyan-500/20 border-2 border-cyan-400"></div> Selected</div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-amber-500/10 border border-amber-500/30"></div> Reserved</div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-rose-500/10 border border-rose-500/30"></div> Booked</div>
        </div>
      </div>

      {/* RIGHT COLUMN: Checkout Panel */}
      <div className="w-full md:w-96">
        <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-8 sticky top-24 shadow-2xl">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Wallet className="text-emerald-400" /> Checkout
          </h2>

          {!selectedSeat ? (
            <div className="text-slate-400 text-center py-8 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
              Click a green seat on the map to start your reservation.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-cyan-500/10 border border-cyan-500/30 p-4 rounded-2xl">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400 text-sm">Selected Seat</span>
                  <span className="text-cyan-400 font-bold">{selectedSeat.seatNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Ticket Price</span>
                  <span className="text-white font-bold">₹{(event.ticketPrice / 100).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-3 text-amber-400 text-sm bg-amber-400/10 p-4 rounded-xl border border-amber-400/20">
                <AlertCircle size={20} className="shrink-0" />
                <p>This seat is locked for <strong>5 minutes</strong>. Complete payment to secure your booking.</p>
              </div>

              <div className="pt-4 border-t border-slate-700 flex justify-between items-center mb-6">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-2xl text-emerald-400">₹{(event.ticketPrice / 100).toFixed(2)}</span>
              </div>

              <button 
                onClick={handlePayment}
                disabled={processing}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                {processing ? 'Processing...' : (
                  <>
                    <ShieldCheck size={20} /> Pay from Wallet
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}