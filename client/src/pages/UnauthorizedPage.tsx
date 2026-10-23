import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogIn, Home } from 'lucide-react';
import { useQueue } from '../context/QueueContext';

export const UnauthorizedPage: React.FC = () => {
  const { currentUser, logoutUser } = useQueue();
  const navigate = useNavigate();

  const handleSwitchAccount = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto mb-6 shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
          403 - Access Restricted
        </h1>
        
        <p className="text-slate-600 text-sm mb-6 leading-relaxed">
          You do not have administrative permissions to view this section.
          {currentUser ? (
            <span className="block mt-2 font-medium text-slate-800">
              Logged in as <strong className="text-slate-900 font-bold">{currentUser.email}</strong> ({currentUser.role}).
            </span>
          ) : (
            <span className="block mt-2 font-medium text-slate-800">
              Please sign in with an Admin or Staff account.
            </span>
          )}
        </p>

        <div className="flex flex-col space-y-3">
          <Link
            to="/"
            className="flex items-center justify-center space-x-2 w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Return to Public Overview</span>
          </Link>

          <button
            onClick={handleSwitchAccount}
            className="flex items-center justify-center space-x-2 w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm border border-slate-200 transition active:scale-95"
          >
            <LogIn className="w-4 h-4 text-slate-500" />
            <span>Sign In with Different Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
