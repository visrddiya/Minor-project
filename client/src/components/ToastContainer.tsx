import React from 'react';
import { CheckCircle2, AlertCircle, Megaphone, BellRing, Info } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning';
  title: string;
  desc?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-slate-900/95 backdrop-blur-xl border border-slate-700 text-white rounded-2xl p-4 shadow-2xl flex items-start space-x-3 transform transition-all duration-300 animate-slideUp"
        >
          <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 mt-0.5">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : toast.type === 'warning' ? (
              <AlertCircle className="w-5 h-5 text-amber-400" />
            ) : (
              <Megaphone className="w-5 h-5 text-teal-400" />
            )}
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-white">{toast.title}</h4>
            {toast.desc && <p className="text-xs text-slate-300 mt-0.5">{toast.desc}</p>}
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-slate-500 hover:text-white p-1 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};
