import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket, ArrowRight, Zap, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Simple Header for Landing Page */}
      <header className="px-8 py-6 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-2xl">
          <Ticket size={28} /> EventHub
        </div>
        <Link 
          to="/login" 
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-full font-semibold transition-all shadow-lg hover:shadow-indigo-500/30"
        >
          Sign In
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 mt-12 md:mt-0">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight">
            Book Your Next <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              Unforgettable Experience
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            The most secure, lightning-fast platform to reserve seats for top-tier tech conferences, concerts, and exclusive meetups.
          </p>

          <div className="pt-8">
            <Link 
              to="/login" 
              className="inline-flex items-center gap-3 bg-white text-slate-900 hover:bg-indigo-50 px-8 py-4 rounded-full text-lg font-bold transition-transform hover:scale-105"
            >
              Get Started Now <ArrowRight size={20} />
            </Link>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-24 text-left pb-16">
          <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50">
            <Zap className="text-amber-400 mb-4" size={32} />
            <h3 className="text-xl font-bold text-white mb-2">Atomic Transactions</h3>
            <p className="text-slate-400">Guaranteed secure payments. No double spending, no double bookings. Your wallet is always synced.</p>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50">
            <ShieldCheck className="text-emerald-400 mb-4" size={32} />
            <h3 className="text-xl font-bold text-white mb-2">Real-Time Seat Locking</h3>
            <p className="text-slate-400">Select a seat and it is yours for 5 minutes. No race conditions, just peace of mind while you check out.</p>
          </div>
        </div>
      </main>
    </div>
  );
}