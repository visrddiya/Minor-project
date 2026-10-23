import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueue } from '../context/QueueContext';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Building,
  UserCheck,
  Sparkles,
  KeyRound,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginUser } = useQueue();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    setTimeout(() => {
      if (!email || !password) {
        setErrorMsg('Please enter both email and password.');
        setIsSubmitting(false);
        return;
      }

      loginUser({
        email,
        firstName: email.split('@')[0],
      });

      setIsSubmitting(false);
      if (email.includes('admin')) {
        navigate('/admin');
      } else if (email.includes('staff') || email.includes('counter')) {
        navigate('/counter');
      } else {
        navigate('/');
      }
    }, 400);
  };

  const handleDemoAccount = (role: 'SUPER_ADMIN' | 'STAFF' | 'CUSTOMER', demoEmail: string, demoName: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    loginUser({
      email: demoEmail,
      firstName: demoName,
      role: role as any,
    });
    if (role === 'SUPER_ADMIN') {
      navigate('/admin');
    } else if (role === 'STAFF') {
      navigate('/counter');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header Branding */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-teal-500 to-emerald-400 flex items-center justify-center font-black text-white text-3xl shadow-xl shadow-blue-500/20 mb-4">
            Q
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Sign In to QueueSphere
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Access your Queue OS portal, counter workspace, or admin telemetry.
          </p>
        </div>

        {/* Demo Account Quick Prefills */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 text-xs">
          <span className="text-[10px] uppercase font-bold text-teal-400 tracking-widest block mb-2">
            ⚡ Demo Accounts (One-Touch Sign In)
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoAccount('SUPER_ADMIN', 'admin@queuesphere.com', 'Admin Alex')}
              className="bg-slate-800 hover:bg-slate-700 p-2 rounded-xl border border-slate-700 text-left transition"
            >
              <span className="font-bold text-teal-300 block">Admin</span>
              <span className="text-[10px] text-slate-400">Full System</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoAccount('STAFF', 'staff@queuesphere.com', 'Sarah Jenkins')}
              className="bg-slate-800 hover:bg-slate-700 p-2 rounded-xl border border-slate-700 text-left transition"
            >
              <span className="font-bold text-blue-300 block">Staff Operator</span>
              <span className="text-[10px] text-slate-400">Counter 01</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoAccount('CUSTOMER', 'customer@queuesphere.com', 'Arthur Dent')}
              className="bg-slate-800 hover:bg-slate-700 p-2 rounded-xl border border-slate-700 text-left transition"
            >
              <span className="font-bold text-amber-300 block">Customer</span>
              <span className="text-[10px] text-slate-400">Self Service</span>
            </button>
          </div>
        </div>

        {/* Main Login Form Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Work Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-slate-600 font-medium">Keep me signed in</span>
              </label>

              <a href="#forgot" onClick={(e) => e.preventDefault()} className="font-bold text-blue-600 hover:text-blue-700">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 transition active:scale-98 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'SIGNING IN...' : 'SIGN IN TO PORTAL'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-200 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-extrabold text-blue-600 hover:text-blue-700">
              Register New Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
