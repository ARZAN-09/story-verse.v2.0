import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        throw error;
      }
      
      // We manually evaluate this right here as a fallback to give direct feedback if context is slow
      if (data.user) {
         const isHardcodedAdmin = data.user.email?.toLowerCase() === 'www.arzan07@gmail.com';
         
         if (isHardcodedAdmin) {
            // Direct override route in case ProtectedRoute hasn't updated its Context yet
            setTimeout(() => {
               navigate('/admin');
            }, 500);
         } else {
            // Will show the yellow warning below as long as `user` populates from Context
            setIsLoggingIn(false);
         }
      }
      
    } catch (err: any) {
      setError(err.message);
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-24 bg-[#1e293b] p-8 rounded-2xl shadow-xl border border-[#334155]">
      <h1 className="text-2xl font-serif mb-6 text-white text-center">Admin Login</h1>
      
      {error && <div className="mb-4 text-red-400 text-sm p-3 bg-red-500/10 border border-red-500/20 rounded-lg">{error}</div>}
      {user && !isAdmin && <div className="mb-4 text-yellow-400 text-sm p-3 bg-yellow-400/10 rounded">You are logged in, but not recognized as an admin.</div>}
      
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm text-[#94a3b8] mb-1">Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" 
            required 
            disabled={isLoggingIn}
          />
        </div>
        <div>
          <label className="block text-sm text-[#94a3b8] mb-1">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" 
            required 
            disabled={isLoggingIn}
          />
        </div>
        <button 
          type="submit" 
          disabled={isLoggingIn}
          className="mt-4 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {isLoggingIn ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
