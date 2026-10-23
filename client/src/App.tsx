import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { QueueProvider } from './context/QueueContext';
import { Navbar } from './components/Navbar';

import { OverviewPage } from './pages/OverviewPage';
import { KioskPage } from './pages/KioskPage';
import { CounterPage } from './pages/CounterPage';
import { LiveDisplayPage } from './pages/LiveDisplayPage';
import { TokenTrackerPage } from './pages/TokenTrackerPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { ProtectedRoute } from './components/ProtectedRoute';

import { ToastContainer } from './components/ToastContainer';
import { useQueue } from './context/QueueContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AppToastWrapper() {
  const { toasts, removeToast } = useQueue();
  return <ToastContainer toasts={toasts} onDismiss={removeToast} />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <QueueProvider>
        <Router>
          <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-sans text-slate-900 selection:bg-teal-500 selection:text-white">
            {/* Header / Navbar */}
            <Navbar />

            {/* Main Application Routes */}
            <main className="flex-1 w-full">
              <Routes>
                <Route path="/" element={<OverviewPage />} />
                <Route
                  path="/kiosk"
                  element={
                    <ProtectedRoute allowedRoles={['CUSTOMER', 'STAFF', 'RECEPTIONIST', 'ADMIN', 'SUPER_ADMIN', 'BRANCH_ADMIN', 'KIOSK']}>
                      <KioskPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/counter"
                  element={
                    <ProtectedRoute allowedRoles={['STAFF', 'RECEPTIONIST', 'ADMIN', 'SUPER_ADMIN', 'BRANCH_ADMIN']}>
                      <CounterPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/display" element={<LiveDisplayPage />} />
                <Route path="/track" element={<TokenTrackerPage />} />
                <Route
                  path="/appointments"
                  element={
                    <ProtectedRoute allowedRoles={['CUSTOMER', 'STAFF', 'RECEPTIONIST', 'ADMIN', 'SUPER_ADMIN', 'BRANCH_ADMIN', 'KIOSK']}>
                      <AppointmentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'BRANCH_ADMIN']}>
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
              </Routes>
            </main>

            {/* Global Micro-Toast Container */}
            <AppToastWrapper />

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-6 mt-12">
              <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-white">QueueSphere</span>
                  <span>• Smart Queue Management System</span>
                </div>
                <p className="text-slate-500">© 2026 QueueSphere Inc. Enterprise v1.0</p>
              </div>
            </footer>
          </div>
        </Router>
      </QueueProvider>
    </QueryClientProvider>
  );
}
