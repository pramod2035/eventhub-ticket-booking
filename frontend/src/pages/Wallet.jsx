import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CreditCard, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export default function Wallet() {
  const { token } = useContext(AuthContext);
  const [balance, setBalance] = useState(0);
  const [amountToAdd, setAmountToAdd] = useState('');
  const [history, setHistory] = useState([]);

  const fetchWalletData = async () => {
    try {
      const balRes = await axios.get('https://eventhub-ticket-booking.onrender.com/api/wallet/balance');
      setBalance(balRes.data.balance);
      
      // Assume you created a route for history in walletRoutes.js
      const histRes = await axios.get('https://eventhub-ticket-booking.onrender.com/api/wallet/history');
      setHistory(histRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) fetchWalletData();
  }, [token]);

  const handleTopUp = async (e) => {
    e.preventDefault();
    try {
      // Send as paise/cents
      await axios.post('https://eventhub-ticket-booking.onrender.com/api/wallet/topup', { 
        amount: parseInt(amountToAdd) * 100 
      });
      setAmountToAdd('');
      fetchWalletData(); // Refresh data
    } catch (err) {
      alert('Failed to add funds');
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">My Wallet</h1>
      
      <div className="grid md:grid-cols-2 gap-8 mb-10">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-cyan-600 p-8 rounded-3xl shadow-lg relative overflow-hidden text-slate-900">
          <p className="text-emerald-900/80 font-semibold mb-2 uppercase tracking-wide">Current Balance</p>
          <h2 className="text-5xl font-bold mb-6">₹{(balance / 100).toFixed(2)}</h2>
          <CreditCard size={48} className="absolute bottom-6 right-6 text-emerald-900/20" />
        </div>

        {/* Top Up Form */}
        <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-4">Add Funds</h3>
          <form onSubmit={handleTopUp} className="flex gap-4">
            <input 
              type="number" 
              value={amountToAdd}
              onChange={(e) => setAmountToAdd(e.target.value)}
              placeholder="Amount in ₹"
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
              required
            />
            <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold px-6 py-3 rounded-xl transition-colors">
              Top Up
            </button>
          </form>
        </div>
      </div>

      {/* Transaction Ledger */}
      <h3 className="text-xl font-semibold text-white mb-4">Transaction Ledger</h3>
      <div className="bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden">
        {history.map((tx) => (
          <div key={tx._id} className="flex items-center justify-between p-5 border-b border-slate-700/50 last:border-0 hover:bg-slate-700/20 transition-colors">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${tx.type === 'CREDIT' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                {tx.type === 'CREDIT' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
              </div>
              <div>
                <p className="text-white font-medium">{tx.description}</p>
                <p className="text-xs text-slate-400">{new Date(tx.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <span className={`font-bold ${tx.type === 'CREDIT' ? 'text-emerald-400' : 'text-white'}`}>
              {tx.type === 'CREDIT' ? '+' : '-'} ₹{(tx.amount / 100).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}