import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { QueueToken } from '../types';
import { TokenTicketModal } from '../components/TokenTicketModal';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Building,
  CheckCircle2,
  Sparkles,
  QrCode,
  ArrowRight,
  Plus
} from 'lucide-react';

export const AppointmentsPage: React.FC = () => {
  const {
    branches,
    departments,
    appointments,
    selectedBranchId,
    bookAppointment,
    checkInAppointment
  } = useQueue();

  const [departmentId, setDepartmentId] = useState<string>(departments[0]?.id || '');
  const [customerName, setCustomerName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState<string>('10:00 AM');
  const [checkInIssuedToken, setCheckInIssuedToken] = useState<QueueToken | null>(null);

  const activeBranch = branches.find(b => b.id === selectedBranchId) || branches[0];
  const activeDepartments = departments.filter(d => d.branchId === activeBranch.id);

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentId || !customerName || !phone) return;

    bookAppointment({
      branchId: activeBranch.id,
      departmentId,
      customerName,
      phone,
      email: email || `${customerName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      date,
      timeSlot,
    });

    setCustomerName('');
    setPhone('');
    setEmail('');
  };

  const handleCheckIn = (appId: string) => {
    const token = checkInAppointment(appId);
    if (token) {
      setCheckInIssuedToken(token);
    }
  };

  const timeSlots = ['09:00 AM', '09:45 AM', '10:30 AM', '11:15 AM', '01:30 PM', '02:15 PM', '03:00 PM'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Online Reservation Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Appointment Booking & Check-In</h1>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            Book scheduled appointments or check-in upon arrival for instant queue token generation.
          </p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex items-center space-x-4">
          <Calendar className="w-8 h-8 text-teal-400" />
          <div>
            <span className="text-xs text-slate-400 block">Total Active Bookings</span>
            <span className="text-xl font-extrabold text-white">{appointments.length} Scheduled</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Booking Form (Cols 5) */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleBook} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-slate-900 font-extrabold text-lg pb-3 border-b border-slate-200">
              <Plus className="w-5 h-5 text-blue-600" />
              <span>Book New Appointment</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Department</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {activeDepartments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.prefix} Series)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Time Slot</label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-bold"
                >
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Arthur Dent"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone</label>
              <input
                type="tel"
                required
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="customer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 text-sm text-slate-900"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-extrabold py-3.5 px-4 rounded-xl text-sm shadow-md shadow-blue-500/20 transition active:scale-98"
            >
              CONFIRM APPOINTMENT
            </button>
          </form>
        </div>

        {/* Appointments List & Check-in Controls (Cols 7) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg mb-1">Scheduled Appointments & Kiosk Check-In</h3>
            <p className="text-xs text-slate-500 mb-6">
              When customers arrive at the facility, click "Check In" to convert their appointment to an immediate queue token ticket.
            </p>

            <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
              {appointments.map((app) => (
                <div
                  key={app.id}
                  className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-900 text-teal-400 font-mono text-xs font-bold">
                        {app.bookingRef}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          app.status === 'CHECKED_IN'
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                            : 'bg-blue-100 text-blue-700 border border-blue-300'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-base">{app.customerName}</h4>
                    <p className="text-xs text-slate-500">{app.departmentName}</p>

                    <div className="flex items-center space-x-4 text-xs text-slate-600 mt-2">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        <span>{app.date}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-teal-600" />
                        <span>{app.timeSlot}</span>
                      </span>
                    </div>
                  </div>

                  <div>
                    {app.status === 'SCHEDULED' ? (
                      <button
                        onClick={() => handleCheckIn(app.id)}
                        className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-md shadow-emerald-500/20 transition active:scale-95"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>CHECK IN NOW</span>
                      </button>
                    ) : (
                      <div className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-center">
                        Checked In
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Modal after Check in */}
      <TokenTicketModal token={checkInIssuedToken} onClose={() => setCheckInIssuedToken(null)} />
    </div>
  );
};
