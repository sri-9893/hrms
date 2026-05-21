import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!email || !password) {
      setFormError('Please fill in all fields');
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      navigate('/');
    } else {
      setFormError(res.message || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-700"></div>

      <div className="w-full max-w-md bg-slate-950/40 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10">
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="p-4 bg-primary-600/10 border border-primary-500/20 text-primary-500 rounded-2xl shadow-inner">
            <img
              src="/logo.jpg.jpeg"
              alt="Company Logo"
              className="w-10 h-10 object-contain"
            />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wide">IT COMPANY HRMS</h1>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Secure Portal Sign In</p>
        </div>

        {formError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-4 py-3 rounded-2xl mb-6">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 font-semibold text-sm transition duration-150"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 font-semibold text-sm transition duration-150"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold transition duration-150 shadow-lg shadow-primary-900/30 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Demo Credentials:</p>
          <div className="mt-2 text-xs text-slate-400 flex justify-around gap-2 bg-slate-900/50 p-3 rounded-2xl">
            <div>
              <p className="font-bold text-primary-400">Admin</p>
              <p>admin@hrms.com</p>
              <p className="font-semibold text-[10px]">admin123</p>
            </div>
            <div className="border-l border-slate-800"></div>
            <div>
              <p className="font-bold text-primary-400">Employee</p>
              <p>employee@hrms.com</p>
              <p className="font-semibold text-[10px]">employee123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
