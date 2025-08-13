import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 10C27.9086 10 10 27.9086 10 50C10 72.0914 27.9086 90 50 90V10Z" fill="url(#paint0_linear_1_2)"/>
    <path d="M50 10C72.0914 10 90 27.9086 90 50C90 72.0914 72.0914 90 50 90V10Z" fill="url(#paint1_linear_1_2)" fillOpacity="0.7"/>
    <defs>
      <linearGradient id="paint0_linear_1_2" x1="50" y1="10" x2="50" y2="90" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366F1"/>
        <stop offset="1" stopColor="#3B82F6"/>
      </linearGradient>
      <linearGradient id="paint1_linear_1_2" x1="50" y1="10" x2="50" y2="90" gradientUnits="userSpaceOnUse">
        <stop stopColor="#A5B4FC"/>
        <stop offset="1" stopColor="#60A5FA"/>
      </linearGradient>
    </defs>
  </svg>
);


const LoginScreen: React.FC = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');
        
        if (isSignUp) {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) setError(error.message);
            else setMessage('Pendaftaran berhasil! Silakan periksa email Anda untuk verifikasi.');
        } else {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) setError(error.message);
        }
        setLoading(false);
    };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950 p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-900/50 backdrop-blur-sm rounded-3xl shadow-2xl shadow-blue-900/20 text-center ring-1 ring-white/10">
        <div className="flex justify-center">
            <Logo className="w-24 h-24"/>
        </div>
        <div className="space-y-2">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                {isSignUp ? 'Buat Akun Baru' : 'Manajer Keuangan Cerdas'}
            </h1>
            <p className="text-gray-400">
                {isSignUp ? 'Isi form di bawah untuk mendaftar.' : 'Mulai kelola keuangan Anda dengan pintar dan mudah.'}
            </p>
        </div>
        
        {message && <p className="text-green-400 bg-green-900/50 p-3 rounded-md ring-1 ring-green-500/30">{message}</p>}
        {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-md ring-1 ring-red-500/30">{error}</p>}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <input id="email" name="email" type="email" required className="w-full px-4 py-3 text-lg bg-gray-800/60 border border-gray-700 text-gray-200 rounded-lg focus:outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500/70 focus:shadow-[0_0_15px_rgba(59,130,246,0.4)] placeholder:text-gray-500 transition-all" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input id="password" name="password" type="password" required className="w-full px-4 py-3 text-lg bg-gray-800/60 border border-gray-700 text-gray-200 rounded-lg focus:outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500/70 focus:shadow-[0_0_15px_rgba(59,130,246,0.4)] placeholder:text-gray-500 transition-all" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-950 focus:ring-blue-500 transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-blue-600/30 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:shadow-none">
            {loading ? (isSignUp ? 'Mendaftarkan...' : 'Masuk...') : (isSignUp ? 'Daftar' : 'Masuk')}
          </button>
        </form>
        <p className="text-sm text-gray-500">
          {isSignUp ? 'Sudah punya akun? ' : 'Belum punya akun? '}
          <button onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage(''); }} className="font-medium text-blue-400 hover:text-blue-300">
            {isSignUp ? 'Masuk di sini' : 'Daftar di sini'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;