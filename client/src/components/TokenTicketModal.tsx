import React from 'react';
import { QueueToken } from '../types';
import { Printer, CheckCircle2, Clock, MapPin, Building2, X, QrCode } from 'lucide-react';

interface TokenTicketModalProps {
  token: QueueToken | null;
  onClose: () => void;
}

export const TokenTicketModal: React.FC<TokenTicketModalProps> = ({ token, onClose }) => {
  if (!token) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 transform transition-all duration-200 scale-100">
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 mb-3">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Ticket Successfully Issued</span>
          </div>

          <h3 className="text-xl font-extrabold tracking-tight">QueueSphere Ticket</h3>
          <p className="text-xs text-slate-400 mt-1">{token.branchName}</p>
        </div>

        {/* Printable Ticket Receipt Area */}
        <div className="p-8 bg-gradient-to-b from-slate-50 to-white text-slate-800 border-b border-dashed border-slate-300">
          <div className="text-center space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Department</span>
              <p className="font-extrabold text-slate-900 text-lg">{token.departmentName}</p>
            </div>

            {/* Token Big Number Box */}
            <div className="my-6 bg-slate-900 text-white rounded-2xl p-6 shadow-inner border border-slate-800 inline-block w-full">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-widest block mb-1">
                Your Token Number
              </span>
              <div className="text-6xl font-black tracking-tight text-teal-400 font-mono">
                {token.tokenNumber}
              </div>
              <div className="mt-3 inline-block px-3 py-1 rounded-full bg-slate-800 text-xs font-bold text-slate-300 border border-slate-700">
                Priority: <span className="text-amber-400 uppercase">{token.priority}</span>
              </div>
            </div>

            {/* Wait Details */}
            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="bg-slate-100/80 p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center space-x-1.5 text-slate-500 text-xs font-medium mb-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Est. Wait Time</span>
                </div>
                <p className="text-lg font-bold text-slate-900">~{token.estimatedWaitMinutes} mins</p>
              </div>

              <div className="bg-slate-100/80 p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center space-x-1.5 text-slate-500 text-xs font-medium mb-1">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  <span>Issued At</span>
                </div>
                <p className="text-sm font-bold text-slate-900">
                  {new Date(token.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            {/* Customer Details */}
            {token.customerName && (
              <div className="text-xs text-slate-500 bg-white p-3 rounded-xl border border-slate-200/80 text-left">
                <span className="font-semibold text-slate-700">Ticket Holder:</span> {token.customerName}{' '}
                {token.customerPhone ? `(${token.customerPhone})` : ''}
              </div>
            )}

            {/* Simulated QR Code Visual */}
            <div className="pt-2 flex flex-col items-center justify-center">
              <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm inline-block">
                <QrCode className="w-20 h-20 text-slate-800" />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 font-mono">Scan QR to track live status on mobile</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-6 bg-slate-50 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handlePrint}
            className="w-full sm:flex-1 inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition shadow-md shadow-blue-500/20 active:scale-98"
          >
            <Printer className="w-4 h-4" />
            <span>Print Thermal Ticket</span>
          </button>
          <button
            onClick={() => alert(`Digital Mobile Pass saved for Token ${token.tokenNumber}! You will receive SMS alerts.`)}
            className="w-full sm:flex-1 inline-flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-teal-300 font-bold py-3 px-4 rounded-xl transition border border-slate-700 active:scale-98"
          >
            <QrCode className="w-4 h-4" />
            <span>Save Mobile Pass</span>
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-3 px-5 rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
