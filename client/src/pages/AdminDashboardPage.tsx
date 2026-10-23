import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { TokenStatus } from '../types';
import { exportTokensToCSV, exportMetricsJSON } from '../lib/exportUtils';
import {
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Layers,
  Sparkles,
  TrendingUp,
  Sliders,
  Building,
  RefreshCw,
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  FileCode
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { tokens, departments, counters, branches, selectedBranchId, getMetrics, updateTokenStatus } = useQueue();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const metrics = getMetrics();
  const activeBranch = branches.find(b => b.id === selectedBranchId) || branches[0];

  const filteredTokens = tokens.filter(t => {
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesSearch =
      t.tokenNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.customerName && t.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.departmentName && t.departmentName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const handleExportCSV = () => {
    exportTokensToCSV(tokens, `queuesphere_${activeBranch.code.toLowerCase()}_log.csv`);
  };

  const handleExportJSON = () => {
    exportMetricsJSON(metrics, `queuesphere_${activeBranch.code.toLowerCase()}_metrics.json`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Operational Control Center</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">Executive Admin Dashboard</h1>
          <p className="text-slate-300 text-sm mt-1">
            Real-time branch telemetry, queue bottleneck analysis, and active token audit log.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV Log</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold text-xs border border-slate-700 transition active:scale-95"
          >
            <FileCode className="w-4 h-4" />
            <span>JSON Summary</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Tokens Today</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{metrics.totalTokensToday}</p>
          <span className="text-xs text-emerald-600 font-semibold inline-flex items-center space-x-1 mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>+14.2% vs yesterday</span>
          </span>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Currently Waiting</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-amber-600">{metrics.currentlyWaiting}</p>
          <span className="text-xs text-slate-500 font-medium inline-block mt-1">
            Avg wait time ~{metrics.avgWaitMinutes} mins
          </span>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Currently Serving</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-teal-600">{metrics.currentlyServing}</p>
          <span className="text-xs text-slate-500 font-medium inline-block mt-1">
            Across {counters.filter(c => c.isOnline).length} active stations
          </span>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Completed Today</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-600">{metrics.completedToday}</p>
          <span className="text-xs text-emerald-600 font-semibold inline-block mt-1">
            Service efficiency 98.4%
          </span>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Department Operational Load (Cols 6) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h3 className="font-extrabold text-slate-900 text-lg mb-4">Department Operational Load</h3>
          <div className="space-y-4">
            {departments.map((dept) => {
              const maxLoad = 10;
              const loadPercent = Math.min(100, Math.round((dept.activeQueueCount / maxLoad) * 100));
              return (
                <div key={dept.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md mr-2">
                        {dept.prefix} Series
                      </span>
                      <strong className="text-slate-900 text-sm">{dept.name}</strong>
                    </div>
                    <span className="text-xs font-extrabold text-slate-700">
                      {dept.activeQueueCount} Waiting
                    </span>
                  </div>

                  {/* Load Progress Bar */}
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        loadPercent > 70 ? 'bg-rose-500' : loadPercent > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.max(10, loadPercent)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Counter Station Status (Cols 6) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h3 className="font-extrabold text-slate-900 text-lg mb-4">Active Counter Station Overview</h3>
          <div className="space-y-3">
            {counters.map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/70 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-teal-400 font-mono font-black text-sm flex items-center justify-center">
                    {c.number}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{c.name}</h4>
                    <p className="text-xs text-slate-500">Staff: {c.assignedStaffName || 'Unassigned'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      c.isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {c.isOnline ? 'ONLINE' : 'OFFLINE'}
                  </span>
                  <span className="font-mono text-xs font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                    {c.currentTokenNumber || 'IDLE'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Operational Peak Hour & CSAT Analytics Telemetry */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Peak Hour Heatmap */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-white flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-teal-400" />
              <span>Hourly Operational Throughput Heatmap</span>
            </h4>
            <span className="text-xs text-teal-300 font-semibold">Peak: {metrics.peakHour}</span>
          </div>

          <div className="grid grid-cols-6 gap-2 pt-2">
            {[
              { hour: '09:00', load: 35 },
              { hour: '10:00', load: 85 },
              { hour: '11:00', load: 95 },
              { hour: '12:00', load: 60 },
              { hour: '13:00', load: 40 },
              { hour: '14:00', load: 75 },
            ].map(item => (
              <div key={item.hour} className="flex flex-col items-center">
                <div className="w-full bg-slate-800 h-16 rounded-xl overflow-hidden flex items-end p-1">
                  <div
                    className={`w-full rounded-lg transition-all duration-500 ${
                      item.load > 80 ? 'bg-rose-500' : item.load > 50 ? 'bg-teal-400' : 'bg-blue-500'
                    }`}
                    style={{ height: `${item.load}%` }}
                  ></div>
                </div>
                <span className="text-[10px] font-mono text-slate-400 mt-1">{item.hour}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CSAT Customer Score Widget */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Customer CSAT Score</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-extrabold text-xs">⭐ 4.9 / 5.0</span>
            </div>
            <div className="text-3xl font-black text-white">{metrics.customerSatisfaction}%</div>
            <p className="text-xs text-slate-400 mt-1">Based on 340+ digital feedback responses</p>
          </div>

          <div className="w-full bg-slate-700/50 h-2 rounded-full overflow-hidden mt-4">
            <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${metrics.customerSatisfaction}%` }}></div>
          </div>
        </div>
      </div>

      {/* Real-Time Token Master Audit Log Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-extrabold text-slate-900 text-xl">Real-Time Token Audit Master Log</h3>
            <p className="text-xs text-slate-500">Live token telemetry and administrative override actions</p>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <input
                type="text"
                placeholder="Search token, name, dept..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
            >
              <option value="ALL">All Statuses</option>
              <option value="WAITING">WAITING</option>
              <option value="CALLING">CALLING</option>
              <option value="SERVING">SERVING</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px] tracking-wider bg-slate-50/50">
                <th className="py-3 px-4">Token No</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Counter</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTokens.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No tokens match the search query.
                  </td>
                </tr>
              ) : (
                filteredTokens.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-black text-slate-900 text-sm">
                      {t.tokenNumber}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {t.departmentName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {t.customerName || 'Walk-in'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {t.counterNumber ? `Counter ${t.counterNumber}` : '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-black uppercase text-[10px] px-2.5 py-1 rounded-full ${
                          t.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-700'
                            : t.status === 'SERVING' || t.status === 'CALLING'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => updateTokenStatus(t.id, 'COMPLETED')}
                        className="text-emerald-600 hover:text-emerald-800 font-bold"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => updateTokenStatus(t.id, 'CANCELLED')}
                        className="text-rose-600 hover:text-rose-800 font-bold"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
