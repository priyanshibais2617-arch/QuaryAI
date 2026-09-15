import React from 'react';
import { useToast } from '../../hooks/useToast';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4">
      {toasts.map((t) => {
        let Icon = Info;
        let borderClass = 'border-teal-500/30 dark:border-teal-500/40 text-teal-400';
        let bgClass = 'bg-white dark:bg-[#111820] shadow-xl border';

        if (t.type === 'success') {
          Icon = CheckCircle2;
          borderClass = 'border-emerald-500/30 text-emerald-500 dark:text-emerald-400';
        } else if (t.type === 'warning') {
          Icon = AlertTriangle;
          borderClass = 'border-amber-500/30 text-amber-500 dark:text-amber-400';
        } else if (t.type === 'error') {
          Icon = XCircle;
          borderClass = 'border-rose-500/30 text-rose-500 dark:text-rose-400';
        }

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl transition-all duration-300 transform translate-y-0 ${bgClass} ${borderClass}`}
          >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              {t.title && <p className="font-semibold text-gray-900 dark:text-gray-100">{t.title}</p>}
              <p className="text-gray-600 dark:text-gray-300 text-xs mt-0.5 leading-relaxed">{t.message}</p>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
