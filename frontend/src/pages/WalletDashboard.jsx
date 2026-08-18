import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Wallet, PlusCircle, CheckCircle } from 'lucide-react';

export default function WalletDashboard() {
  const [amount, setAmount] = useState('');
  const [currentBalance, setCurrentBalance] = useState(null);
  const { token } = useContext(AuthContext);

  const handleTopUp = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) return alert("Enter a valid amount");

    try {
      const res = await axios.post('https://eventhub-ticket-booking.onrender.com/api/wallet/topup', {
        amount: parseInt(amount) * 100 // Convert to paise
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCurrentBalance(res.data.balance);
      setAmount('');
      alert('✅ Funds added successfully!');
    } catch (err) {
      alert(`Top-up Failed: ${err.response?.data?.error || err.message}`);
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
        My Wallet
      </h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl border border-slate-700 shadow-xl">
          <div className="flex items-center gap-4 text-slate-400 mb-4">
            <Wallet size={32} className="text-emerald-400" />
            <h2 className="text-xl font-semibold">Available Balance</h2>
          </div>
          <p className="text-5xl font-bold text-white mb-4">
            {currentBalance !== null ? `₹${(currentBalance / 100).toFixed(2)}` : '***'}
          </p>
          <p className="text-sm text-slate-500">Add funds to check your updated balance.</p>
        </div>

        {/* Top-up Form */}
        <div className="bg-slate-800/40 p-8 rounded-3xl border border-slate-700">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <PlusCircle className="text-cyan-400" /> Add Funds
          </h2>
          <form onSubmit={handleTopUp} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Amount in Rupees (₹)</label>
              <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500" 
                placeholder="e.g., 1500"
                required
              />
            </div>
            <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold py-3.5 rounded-xl transition-colors">
              Process Payment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}