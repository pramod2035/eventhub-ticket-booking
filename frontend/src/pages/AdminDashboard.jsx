import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, RefreshCcw, AlertCircle, Edit2, Trash2, List } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('events');
  
  // Event Creation State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [totalSeats, setTotalSeats] = useState(60);

  // Lists State
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  
  // Edit State
  const [editingEventId, setEditingEventId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', date: '', location: '', ticketPrice: '', totalSeats: '' });
  const { token, user } = useContext(AuthContext); 
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    if (user && user.role !== 'ADMIN') {
      navigate('/events'); 
    }
  }, [token, user, navigate]);

  // Fetch Data Effects
  useEffect(() => {
    if (activeTab === 'refunds' && token && user?.role === 'ADMIN') {
      fetchBookings();
    }
    if (activeTab === 'events' && token && user?.role === 'ADMIN') {
      fetchEvents();
    }
  }, [activeTab, token, user]);

  const fetchBookings = async () => {
    try {
      const res = await axios.get('https://eventhub-ticket-booking.onrender.com/api/admin/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    }
  };

  const fetchEvents = async () => {
    try {
      // Assuming your public events route works for admins too, or use an admin-specific one
      const res = await axios.get('https://eventhub-ticket-booking.onrender.com/api/bookings/events', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(res.data);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    }
  };

  // --- HANDLERS ---

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://eventhub-ticket-booking.onrender.com/api/admin/events', {
        title, date, location, ticketPrice: parseInt(ticketPrice) * 100, totalSeats: parseInt(totalSeats)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Event and seats generated successfully!');
      setTitle(''); setDate(''); setLocation(''); setTicketPrice(''); setTotalSeats(60);
      setEvents([...events, res.data.event || res.data]); // Update list immediately
      fetchEvents();
    } catch (err) {
      alert(`Event Creation Failed: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event? This will wipe out all associated seats.")) return;
    try {
      await axios.delete(`https://eventhub-ticket-booking.onrender.com/api/admin/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(events.filter((event) => event._id !== eventId));
      alert("✅ Event deleted successfully!");
    } catch (error) {
      console.error("Failed to delete event", error);
      alert("❌ Error deleting event.");
    }
  };

  const startEditing = (event) => {
    setEditingEventId(event._id);
    setEditForm({
      title: event.title,
      date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
      location: event.location || '',
      ticketPrice: event.ticketPrice / 100, 
      totalSeats: event.totalSeats
    });
  };
  
  const submitEdit = async (eventId) => {
    try {
      const payload = {
        title: editForm.title,
        date: editForm.date, // Added
        location: editForm.location, // Added
        ticketPrice: Number(editForm.ticketPrice) * 100, 
        totalSeats: Number(editForm.totalSeats)
      };
      const response = await axios.put(`https://eventhub-ticket-booking.onrender.com/api/admin/events/${eventId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setEvents((prev) => prev.map((e) => (e._id === eventId ? response.data : e)));
      setEditingEventId(null);
      alert("✅ Event updated successfully!");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "❌ Error updating event.");
    }
  };

  const handleRefund = async (bookingId) => {
    if (!window.confirm("Are you sure you want to refund and cancel this booking?")) return;
    try {
      await axios.post(`https://eventhub-ticket-booking.onrender.com/api/admin/refund/${bookingId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Refund processed successfully!');
      fetchBookings(); 
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

      {/* EVENTS TAB */}
      {activeTab === 'events' && (
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* CREATE EVENT FORM */}
          <div className="bg-slate-800/40 border border-slate-700 p-8 rounded-3xl h-fit">
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

          {/* LIST OF EVENTS */}
          <div className="bg-slate-800/40 border border-slate-700 p-8 rounded-3xl">
            <div className="flex items-center gap-4 mb-6 text-blue-400">
              <List size={28} />
              <h2 className="text-xl font-bold text-white">Manage Existing Events</h2>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {events.length === 0 ? <p className="text-slate-400">No events found.</p> : null}
              {events.map((event) => (
                <div key={event._id} className="bg-slate-900 border border-slate-700 p-5 rounded-2xl">
                  
                  {editingEventId === event._id ? (
                    // EDIT MODE
                    <div className="flex flex-col gap-3">
                      <input type="text" value={editForm.title} onChange={(e) => setEditForm({...editForm, title: e.target.value})} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white" placeholder="Event Title" />
                      <div className="flex gap-2">
                        <input type="number" value={editForm.ticketPrice} onChange={(e) => setEditForm({...editForm, ticketPrice: e.target.value})} className="w-1/2 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white" placeholder="Price (₹)" />
                        <input type="number" value={editForm.totalSeats} onChange={(e) => setEditForm({...editForm, totalSeats: e.target.value})} className="w-1/2 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white" placeholder="Seats" />
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => submitEdit(event._id)} className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-900 px-4 py-2 rounded-lg font-medium transition-colors w-full border border-emerald-500/30">Save</button>
                        <button onClick={() => setEditingEventId(null)} className="bg-slate-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-600 transition-colors w-full">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    // VIEW MODE
                    <div>
                      <h3 className="font-bold text-lg text-white mb-1">{event.title}</h3>
                      
                      {/* NEWLY ADDED: Date and Location Display */}
                      <p className="text-sm text-slate-300 mb-1">
                        📍 {event.location || 'Location TBD'} &nbsp;|&nbsp; 🕒 {event.date ? new Date(event.date).toLocaleString() : 'Date TBD'}
                      </p>
                      
                      <p className="text-sm text-slate-400 mb-4">Price: ₹{event.ticketPrice / 100} | Seats: {event.totalSeats}</p>
                      <div className="flex gap-2">
                        <button onClick={() => startEditing(event)} className="flex items-center justify-center gap-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white px-4 py-2 rounded-lg font-medium transition-colors border border-blue-500/20 w-full cursor-pointer">
                          <Edit2 size={16} /> Edit
                        </button>
                        <button onClick={() => handleDeleteEvent(event._id)} className="flex items-center justify-center gap-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white px-4 py-2 rounded-lg font-medium transition-colors border border-rose-500/20 w-full cursor-pointer">
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* REFUNDS TAB */}
      {activeTab === 'refunds' && (
        <div className="bg-slate-800/40 border border-slate-700 p-8 rounded-3xl max-w-4xl">
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