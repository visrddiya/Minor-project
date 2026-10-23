import React from 'react';
import { NavLink, useLocation, Link, useNavigate } from 'react-router-dom';
import { useQueue } from '../context/QueueContext';
import {
  Monitor,
  MonitorPlay,
  Users,
  Search,
  Calendar,
  LayoutDashboard,
  Building2,
  Bell,
  Sparkles,
  LogIn,
  UserPlus,
  LogOut
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    branches,
    selectedBranchId,
    setSelectedBranchId,
    activeRole,
    currentUser,
    logoutUser
  } = useQueue();
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === '/display') {
    return null;
  }

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const userRole = currentUser?.role || activeRole;

  const allNavItems = [
    { path: '/', label: 'Overview', icon: LayoutDashboard, roles: ['CUSTOMER', 'ADMIN', 'SUPER_ADMIN', 'BRANCH_ADMIN'] },
    { path: '/kiosk', label: 'Kiosk Dispenser', icon: Monitor, roles: ['ADMIN', 'SUPER_ADMIN', 'BRANCH_ADMIN', 'KIOSK'] },
    { path: '/counter', label: 'Counter Station', icon: Users, roles: ['STAFF', 'RECEPTIONIST', 'ADMIN', 'SUPER_ADMIN', 'BRANCH_ADMIN'] },
    { path: '/display', label: 'Live TV Display', icon: MonitorPlay, roles: ['STAFF', 'RECEPTIONIST', 'ADMIN', 'SUPER_ADMIN', 'BRANCH_ADMIN'] },
    { path: '/track', label: 'Ticket Tracker', icon: Search, roles: ['CUSTOMER', 'ADMIN', 'SUPER_ADMIN', 'BRANCH_ADMIN'] },
    { path: '/appointments', label: 'Appointments', icon: Calendar, roles: ['CUSTOMER', 'ADMIN', 'SUPER_ADMIN', 'BRANCH_ADMIN'] },
    { path: '/admin', label: 'Admin Control', icon: Sparkles, roles: ['ADMIN', 'SUPER_ADMIN', 'BRANCH_ADMIN'] },
  ];

  const visibleNavItems = allNavItems.filter((item) => {
    if (!currentUser) {
      return ['/', '/display', '/track'].includes(item.path);
    }
    return item.roles ? item.roles.includes(userRole) : false;
  });

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <NavLink to="/" className="flex items-center space-x-3 group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-teal-500 to-emerald-400 flex items-center justify-center font-black text-white text-xl shadow-md group-hover:scale-105 transition-transform duration-200">
                Q
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400">
                  QueueSphere
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  Enterprise Queue OS
                </span>
              </div>
            </NavLink>
          </div>

          {/* Branch, Role & Auth Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Branch Selector */}
            <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg text-xs">
              <Building2 className="w-4 h-4 text-teal-400" />
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer font-medium"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id} className="bg-slate-900 text-slate-200">
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Badge */}
            <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg text-xs">
              <span className="text-slate-400 font-semibold">Status:</span>
              {currentUser ? (
                <span className="font-bold text-teal-400 uppercase tracking-wider">{currentUser.role}</span>
              ) : (
                <span className="font-bold text-slate-400 uppercase tracking-wider">Guest (Not Signed In)</span>
              )}
            </div>

            {/* Auth State */}
            {currentUser ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl text-xs">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-teal-400 to-blue-500 text-slate-950 font-black flex items-center justify-center text-xs">
                    {currentUser.firstName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-white leading-none">{currentUser.firstName}</span>
                    <span className="text-[9px] text-teal-400 font-semibold uppercase">{currentUser.role}</span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                >
                  <LogIn className="w-3.5 h-3.5 text-teal-400" />
                  <span>Sign In</span>
                </Link>

                <Link
                  to="/register"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 border-t border-slate-800 scrollbar-none">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600/90 text-white shadow-sm shadow-blue-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
