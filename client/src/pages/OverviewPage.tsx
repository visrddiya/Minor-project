import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueue } from '../context/QueueContext';
import {
  Monitor,
  Users,
  MonitorPlay,
  Search,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Building,
  CheckCircle2,
  Clock,
  Layers,
  Lock,
  Ticket,
  UserCheck,
  Settings,
  HelpCircle
} from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const { branches, selectedBranchId, tokens, getMetrics, currentUser, activeRole, loginUser } = useQueue();
  const navigate = useNavigate();
  const metrics = getMetrics();

  const activeBranch = branches.find(b => b.id === selectedBranchId) || branches[0];
  const userRole = currentUser?.role || activeRole;

  const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'BRANCH_ADMIN'].includes(userRole);
  const isStaff = ['STAFF', 'RECEPTIONIST'].includes(userRole);

  const handleQuickRole = (role: 'CUSTOMER' | 'STAFF' | 'SUPER_ADMIN', targetPath: string) => {
    if (role === 'CUSTOMER') {
      loginUser({ email: 'customer@queuesphere.com', firstName: 'Customer User', role: 'CUSTOMER' });
    } else if (role === 'STAFF') {
      loginUser({ email: 'staff@queuesphere.com', firstName: 'Staff Operator', role: 'STAFF' });
    } else if (role === 'SUPER_ADMIN') {
      loginUser({ email: 'admin@queuesphere.com', firstName: 'Admin Manager', role: 'SUPER_ADMIN' });
    }
    navigate(targetPath);
  };

  const modules = [
    {
      title: 'Self-Service Kiosk',
      desc: 'Touchscreen dispenser for walk-in token issuance & queue tickets.',
      path: '/kiosk',
      icon: Monitor,
      color: 'from-blue-600 to-indigo-600',
      badge: 'Public Kiosk',
      isAllowed: true,
    },
    {
      title: 'Counter Operator Station',
      desc: 'Staff portal to call next token, recall, transfer, skip, or complete.',
      path: '/counter',
      icon: Users,
      color: 'from-teal-600 to-emerald-600',
      badge: isStaff || isAdmin ? 'Staff Access' : 'Staff Only',
      isAllowed: isStaff || isAdmin,
    },
    {
      title: 'Digital Signage Live TV',
      desc: 'High-visibility dark-mode TV display board with voice announcement chime.',
      path: '/display',
      icon: MonitorPlay,
      color: 'from-purple-600 to-indigo-700',
      badge: 'Waiting Room TV',
      isAllowed: true,
    },
    {
      title: 'Mobile Ticket Tracker',
      desc: 'Live position tracking and SMS alert notifications for mobile phones.',
      path: '/track',
      icon: Search,
      color: 'from-amber-600 to-orange-600',
      badge: 'Public Tracker',
      isAllowed: true,
    },
    {
      title: 'Online Appointment Booking',
      desc: 'Schedule advance time slots and fast-track kiosk check-in.',
      path: '/appointments',
      icon: Calendar,
      color: 'from-sky-600 to-cyan-600',
      badge: 'Reservation',
      isAllowed: true,
    },
    {
      title: 'Admin Operations Control',
      desc: 'Executive analytics, department telemetry, and master token audit log.',
      path: '/admin',
      icon: Sparkles,
      color: 'from-slate-800 to-slate-900',
      badge: isAdmin ? 'Admin Access' : 'Admin Only',
      isAllowed: isAdmin,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      {/* Banner */}
      {currentUser ? (
        /* Logged In Personalized Welcome Banner */
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30 mb-3">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Signed In as {currentUser.role}</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight">
              Welcome back, {currentUser.firstName}!
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Active Branch: <strong className="text-teal-300">{activeBranch?.name}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isStaff && (
              <Link
                to="/counter"
                className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs shadow-lg transition active:scale-95"
              >
                <Users className="w-4 h-4" />
                <span>Go to Counter Station</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-lg transition active:scale-95"
              >
                <Settings className="w-4 h-4" />
                <span>Go to Admin Control</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            {!isStaff && !isAdmin && (
              <Link
                to="/kiosk"
                className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs shadow-lg transition active:scale-95"
              >
                <Ticket className="w-4 h-4" />
                <span>Get Ticket (Kiosk)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      ) : (
        /* Guest Quick Mode Switcher Banner */
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
          <div className="flex items-center space-x-2 text-teal-300 text-xs font-bold uppercase tracking-wider mb-2">
            <HelpCircle className="w-4 h-4" />
            <span>How would you like to use QueueSphere today?</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-black mb-6">
            Choose Your Mode below for 1-Click Access
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Customer Mode */}
            <button
              onClick={() => handleQuickRole('CUSTOMER', '/kiosk')}
              className="bg-white/10 hover:bg-white/20 border border-white/20 p-5 rounded-2xl text-left transition group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center font-bold mb-3 shadow-md">
                <Ticket className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-white text-base group-hover:text-teal-300 transition">
                I am a Customer
              </h3>
              <p className="text-slate-300 text-xs mt-1">
                Get a ticket, track your turn in line, or book an appointment.
              </p>
              <div className="mt-4 text-xs font-bold text-teal-300 flex items-center space-x-1">
                <span>Get Ticket Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>

            {/* Staff Mode */}
            <button
              onClick={() => handleQuickRole('STAFF', '/counter')}
              className="bg-white/10 hover:bg-white/20 border border-white/20 p-5 rounded-2xl text-left transition group"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center font-bold mb-3 shadow-md">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-white text-base group-hover:text-teal-300 transition">
                I am Staff / Counter Operator
              </h3>
              <p className="text-slate-300 text-xs mt-1">
                Open your counter, call waiting customers, and complete tickets.
              </p>
              <div className="mt-4 text-xs font-bold text-teal-300 flex items-center space-x-1">
                <span>Open Counter Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>

            {/* Admin Mode */}
            <button
              onClick={() => handleQuickRole('SUPER_ADMIN', '/admin')}
              className="bg-white/10 hover:bg-white/20 border border-white/20 p-5 rounded-2xl text-left transition group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center font-bold mb-3 shadow-md">
                <Settings className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-white text-base group-hover:text-teal-300 transition">
                I am an Administrator
              </h3>
              <p className="text-slate-300 text-xs mt-1">
                View queue analytics, branch telemetry, and master logs.
              </p>
              <div className="mt-4 text-xs font-bold text-teal-300 flex items-center space-x-1">
                <span>Open Admin Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Real-time Branch Live Telemetry */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Branch Live Telemetry</h2>
            <p className="text-xs text-slate-500">Real-time stats for {activeBranch?.name}</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
            Live Updates
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="text-xs text-slate-500 block font-semibold">Total Tokens Today</span>
            <span className="text-2xl font-black text-slate-900">{metrics.totalTokensToday}</span>
          </div>
          <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-100">
            <span className="text-xs text-amber-700 block font-semibold">Currently Waiting</span>
            <span className="text-2xl font-black text-amber-600">{metrics.currentlyWaiting}</span>
          </div>
          <div className="bg-teal-50/60 p-4 rounded-2xl border border-teal-100">
            <span className="text-xs text-teal-700 block font-semibold">Currently Serving</span>
            <span className="text-2xl font-black text-teal-600">{metrics.currentlyServing}</span>
          </div>
          <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100">
            <span className="text-xs text-blue-700 block font-semibold">Avg Wait Time</span>
            <span className="text-2xl font-black text-blue-600">~{metrics.avgWaitMinutes} min</span>
          </div>
        </div>
      </div>

      {/* Module Quick-Jump Grid */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Explore All Feature Modules</h2>
        <p className="text-xs text-slate-500 mb-6">Select any module below to interact directly</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.path}
                to={mod.path}
                className={`group bg-white rounded-3xl p-6 border shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between ${
                  mod.isAllowed
                    ? 'border-slate-200 hover:border-slate-300'
                    : 'border-slate-200/60 bg-slate-50/50 opacity-90'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${mod.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        mod.isAllowed
                          ? 'bg-slate-100 text-slate-700 group-hover:bg-slate-900 group-hover:text-white'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {mod.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition flex items-center justify-between">
                    <span>{mod.title}</span>
                    {!mod.isAllowed && <Lock className="w-4 h-4 text-slate-400 shrink-0" />}
                  </h3>
                  <p className="text-slate-500 text-xs mt-2 leading-relaxed">{mod.desc}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-teal-600 transition">
                  <span>{mod.isAllowed ? 'LAUNCH MODULE' : 'SIGN IN REQUIRED'}</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
