import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  // State to toggle between Login and Signup modes
  const [isLogin, setIsLogin] = useState(true);
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        // Handle Login Route
        const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
        login(res.data.user, res.data.token);
        
        if (res.data.user.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/events');
        }
      } else {
        // Handle Registration Route
        await axios.post('http://localhost:5000/api/auth/register', { 
          name, 
          email, 
          password, 
          role: 'USER' 
        });
        
        setSuccess('Account created successfully! Please sign in.');
        setIsLogin(true); // Switch back to login view automatically
        setPassword(''); // Clear password field for security
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="bg-slate-800 p-10 rounded-3xl shadow-2xl w-full max-w-md border border-slate-700">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-slate-400 text-sm">
            {isLogin 
              ? 'Enter your credentials to access your tickets.' 
              : 'Join EventHub to start booking exclusive event tickets.'}
          </p>
        </div>
        
        {error && <div className="bg-rose-500/10 text-rose-400 p-3 rounded-xl mb-6 text-center text-sm border border-rose-500/20">{error}</div>}
        {success && <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl mb-6 text-center text-sm border border-emerald-500/20">{success}</div>}

        <form onSubmit={handleAuth} className="space-y-5">
          {/* Name field only shows during Signup */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
              <input 
                type="text" 
                required={!isLogin}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="John Doe"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="name@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="••••••••"
              minLength="6"
            />
          </div>
          
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/30 mt-6">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        {/* Toggle between Login and Signup */}
        <div className="mt-8 text-center border-t border-slate-700 pt-6">
          <p className="text-slate-400 text-sm">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button 
              type="button"
              onClick={toggleMode}
              className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
            >
              {isLogin ? 'Sign up here' : 'Log in instead'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}