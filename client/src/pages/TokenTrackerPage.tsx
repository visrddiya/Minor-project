import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { QueueToken } from '../types';
import {
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  QrCode,
  Bell,
  Smartphone,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const TokenTrackerPage: React.FC = () => {
  const { tokens } = useQueue();
  const [searchQuery, setSearchQuery] = useState<string>('A-102');
  const [smsAlertEnabled, setSmsAlertEnabled] = useState<boolean>(true);

  // Search by token number or phone
  const matchedToken: QueueToken | undefined = tokens.find(
    t =>
      t.tokenNumber.toLowerCase() === searchQuery.trim().toLowerCase() ||
      (t.customerPhone && t.customerPhone.includes(searchQuery.trim()))
  );

  // Calculate position ahead in queue
  const positionAhead = matchedToken
    ? tokens.filter(
        t =>
          t.departmentId === matchedToken.departmentId &&
          t.status === 'WAITING' &&
          new Date(t.createdAt).getTime() < new Date(matchedToken.createdAt).getTime()
      ).length
    : 0;

  const statuses = ['WAITING', 'CALLING', 'SERVING', 'COMPLETED'];
  const currentStatusIndex = matchedToken ? statuses.indexOf(matchedToken.status) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Search Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl mb-8 relative overflow-hidden text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30 mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Mobile Patient & Customer Portal</span>
        </div>

        <h1 className="text-3xl font-black tracking-tight">Live Queue Ticket Tracker</h1>
        <p className="text-slate-300 text-sm mt-2 max-w-md mx-auto">
          Enter your Token Ticket Number or Phone Number to monitor your live position in line.
        </p>

        {/* Search Bar */}
        <div className="mt-6 max-w-md mx-auto relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Enter Token No (e.g. A-102, P-201)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-28 py-4 rounded-2xl bg-white text-slate-900 font-bold placeholder-slate-400 text-base focus:outline-none focus:ring-4 focus:ring-teal-400/40 shadow-lg"
            />
            <Search className="w-6 h-6 text-slate-400 absolute left-4 top-4" />
            <button className="absolute right-2 top-2 bottom-2 bg-slate-900 hover:bg-slate-800 text-teal-400 font-bold px-4 rounded-xl text-xs transition">
              TRACK
            </button>
          </div>
        </div>
      </div>

      {/* Tracker Status Display */}
      {matchedToken ? (
        <div className="space-y-6">
          {/* Main Status Hero Card */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-200/80">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-2xl bg-slate-900 text-teal-400 font-mono font-black text-3xl flex items-center justify-center shadow-lg border border-slate-800">
                  {matchedToken.tokenNumber}
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                    {matchedToken.branchName}
                  </span>
                  <h2 className="text-2xl font-black text-slate-900">{matchedToken.departmentName}</h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-slate-500 font-medium">Holder: {matchedToken.customerName || 'Guest'}</span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="text-right">
                <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">
                  Current Status
                </span>
                <span
                  className={`inline-block px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-wider mt-1 ${
                    matchedToken.status === 'CALLING'
                      ? 'bg-amber-100 text-amber-700 border border-amber-300 animate-pulse'
                      : matchedToken.status === 'SERVING'
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                      : matchedToken.status === 'COMPLETED'
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-slate-100 text-slate-700 border border-slate-300'
                  }`}
                >
                  {matchedToken.status}
                </span>
              </div>
            </div>

            {/* Progress Timeline Stepper */}
            <div className="py-8">
              <div className="grid grid-cols-4 gap-2 relative">
                {statuses.map((step, idx) => {
                  const isDone = idx <= currentStatusIndex;
                  const isCurrent = idx === currentStatusIndex;
                  return (
                    <div key={step} className="flex flex-col items-center text-center relative z-10">
                      <div
                        className={`w-10 h-10 rounded-full font-extrabold text-sm flex items-center justify-center transition-all ${
                          isDone
                            ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                            : 'bg-slate-100 text-slate-400 border border-slate-300'
                        } ${isCurrent ? 'ring-4 ring-teal-300/40 scale-110' : ''}`}
                      >
                        {isDone ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                      </div>
                      <span className={`text-xs font-bold mt-2 uppercase ${isDone ? 'text-slate-900' : 'text-slate-400'}`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200/80 text-center">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-xs text-slate-500 font-semibold block">People Ahead</span>
                <span className="text-2xl font-black text-slate-900">{positionAhead} Customers</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-xs text-slate-500 font-semibold block">Est. Wait Time</span>
                <span className="text-2xl font-black text-blue-600">~{matchedToken.estimatedWaitMinutes} Mins</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-xs text-slate-500 font-semibold block">Assigned Station</span>
                <span className="text-2xl font-black text-teal-600">
                  {matchedToken.counterNumber ? `Counter ${matchedToken.counterNumber}` : 'Assigning...'}
                </span>
              </div>
            </div>

            {/* Prescription, Diagnostic Report & Billing Details Card */}
            {(matchedToken.prescriptionNotes || matchedToken.diagnosticReport || matchedToken.billingDetails) && (
              <div className="mt-6 pt-6 border-t border-slate-200 space-y-4">
                {matchedToken.diagnosticReport && (
                  <div className="bg-slate-900 border-2 border-teal-500/40 p-5 rounded-3xl text-white shadow-xl space-y-3 text-xs">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="font-extrabold text-teal-300 text-sm">
                        🔬 Digital Diagnostic Report Verified
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {matchedToken.diagnosticReport.conductedAt}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-slate-300 pt-1">
                      <h5 className="font-extrabold text-white text-sm">{matchedToken.diagnosticReport.title}</h5>
                      <p className="text-xs text-teal-200 leading-relaxed font-medium">
                        <strong className="text-teal-400">Lab Findings:</strong> {matchedToken.diagnosticReport.findings}
                      </p>
                      <span className="text-[10px] text-slate-400 block pt-1 border-t border-slate-800/80">
                        Verified by: {matchedToken.diagnosticReport.technicianName}
                      </span>
                    </div>
                  </div>
                )}

                {matchedToken.prescriptionNotes && (
                  <div className="bg-teal-50 border border-teal-200 p-4 rounded-2xl text-xs text-teal-900">
                    <span className="font-extrabold text-teal-800 uppercase tracking-wider block mb-1">
                      🩺 Doctor Prescription Notes
                    </span>
                    <p className="text-slate-700 font-medium">{matchedToken.prescriptionNotes}</p>
                  </div>
                )}

                {matchedToken.billingDetails && (
                  <div className="bg-gradient-to-r from-slate-900 to-blue-950 p-6 rounded-3xl text-white shadow-xl space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                        💳 Pharmacy Invoice & UPI Payment
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 font-extrabold text-xs">
                        STATUS: {matchedToken.billingDetails.paymentStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      <div className="space-y-2 text-xs">
                        <span className="text-slate-400 font-semibold block">Prescribed Medicines:</span>
                        {matchedToken.billingDetails.items.map((item, i) => (
                          <div key={i} className="flex justify-between border-b border-slate-800/60 pb-1">
                            <span className="text-slate-300">{item.name}</span>
                            <span className="font-bold text-teal-300">₹{item.cost}</span>
                          </div>
                        ))}
                        <div className="pt-2 flex justify-between font-black text-base text-white">
                          <span>Total Payment:</span>
                          <span className="text-emerald-400">₹{matchedToken.billingDetails.totalAmount}</span>
                        </div>
                      </div>

                      {/* UPI QR Code Scanner */}
                      <div className="bg-white p-3 rounded-2xl text-center flex flex-col items-center">
                        <img
                          src={matchedToken.billingDetails.upiQrUrl}
                          alt="Scan UPI QR Code to Pay"
                          className="w-32 h-32 rounded-lg"
                        />
                        <span className="text-[10px] font-extrabold text-slate-900 mt-1">
                          Scan to pay via GPay / PhonePe / Paytm
                        </span>
                        <span className="text-[9px] font-mono text-slate-500">{matchedToken.billingDetails.upiId}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm text-slate-400">
          <Search className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <h3 className="text-lg font-bold text-slate-700">No token found for "{searchQuery}"</h3>
          <p className="text-xs text-slate-500 mt-1">Please verify your ticket number or try searching "A-102"</p>
        </div>
      )}
    </div>
  );
};
