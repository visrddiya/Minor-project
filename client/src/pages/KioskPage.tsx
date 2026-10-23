import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { QueueToken } from '../types';
import { TokenTicketModal } from '../components/TokenTicketModal';
import {
  Sparkles,
  Ticket,
  CheckCircle2,
  ChevronRight,
  Building
} from 'lucide-react';

export const KioskPage: React.FC = () => {
  const { branches, departments, selectedBranchId, issueToken } = useQueue();
  const activeBranch = branches.find(b => b.id === selectedBranchId) || branches[0];
  const activeDepartments = departments.filter(d => d.branchId === activeBranch.id);

  const [selectedDeptId, setSelectedDeptId] = useState<string>(activeDepartments[0]?.id || departments[0]?.id || '');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [issuedToken, setIssuedToken] = useState<QueueToken | null>(null);

  // Sync selected department when active branch changes
  React.useEffect(() => {
    if (activeDepartments.length > 0 && !activeDepartments.some(d => d.id === selectedDeptId)) {
      setSelectedDeptId(activeDepartments[0].id);
    }
  }, [selectedBranchId, activeDepartments]);

  const handleIssueToken = (e: React.FormEvent) => {
    e.preventDefault();
    const deptToUse = selectedDeptId || activeDepartments[0]?.id;
    if (!deptToUse) return;

    const token = issueToken({
      branchId: activeBranch.id,
      departmentId: deptToUse,
      priority: 'NORMAL',
      customerName: customerName.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
    });

    setIssuedToken(token);

    // Reset inputs for next walk-in customer
    setCustomerName('');
    setCustomerPhone('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-blue-500/10 blur-3xl rounded-full"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Touchscreen Kiosk Mode</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Self-Service Token Dispenser
            </h1>
            <p className="text-slate-300 text-sm mt-2 max-w-xl">
              Welcome to <span className="text-teal-300 font-bold">{activeBranch?.name}</span>. Select your service department below to receive your instant queue ticket.
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Branch Hours</span>
              <span className="text-sm font-extrabold text-white">
                {activeBranch?.openingTime} - {activeBranch?.closingTime}
              </span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleIssueToken} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Step 1: Department Selection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm">
                1
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Select Service Department</h2>
                <p className="text-xs text-slate-500">Choose the service area you require assistance with today</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeDepartments.map((dept) => {
                const isSelected = selectedDeptId === dept.id;
                return (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => setSelectedDeptId(dept.id)}
                    className={`p-5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/30 shadow-md'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-1 rounded-md bg-slate-900 text-teal-300 font-mono text-xs font-black">
                          {dept.prefix} Series
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          ~{dept.avgServiceMinutes} min / ticket
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base">{dept.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{dept.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-semibold">
                        Waiting in queue: <strong className="text-blue-600">{dept.activeQueueCount}</strong>
                      </span>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step 2: Customer Details & Print Action */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm sticky top-24">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 font-bold flex items-center justify-center text-sm">
                2
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Contact Info (Optional)</h2>
                <p className="text-xs text-slate-500">Receive SMS alert when turn arrives</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Connor"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone (SMS Alert)</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm text-slate-900"
                />
              </div>

              {/* Summary Card */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2 mt-4">
                <div className="flex justify-between">
                  <span className="text-slate-500">Branch:</span>
                  <span className="font-bold text-slate-800">{activeBranch?.name.split(' ')[0]}</span>
                </div>
              </div>

              {/* Submit Ticket Action */}
              <button
                type="submit"
                disabled={!selectedDeptId}
                className="w-full mt-4 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-extrabold py-4 px-6 rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all duration-150 active:scale-98 disabled:opacity-50"
              >
                <Ticket className="w-5 h-5" />
                <span className="text-base">ISSUE TICKET NOW</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Ticket Modal */}
      <TokenTicketModal token={issuedToken} onClose={() => setIssuedToken(null)} />
    </div>
  );
};
