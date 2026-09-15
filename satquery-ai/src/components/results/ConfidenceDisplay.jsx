import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

export default function ConfidenceDisplay({ confidence = 0.91, label = 'Confidence Score' }) {
  const percentage = typeof confidence === 'object' && confidence.percentage !== undefined
    ? confidence.percentage
    : Math.round((typeof confidence === 'number' && confidence <= 1 ? confidence * 100 : confidence) || 91);

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/60 dark:bg-[#151C25]/80">
      <div className="w-9 h-9 rounded-lg bg-teal-500/10 text-teal-600 dark:text-[#4FD1C5] flex items-center justify-center flex-shrink-0">
        <ShieldCheck className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-900 dark:text-white uppercase font-mono tracking-wider">
            {label}
          </span>
          <span className="text-sm font-black font-mono text-teal-600 dark:text-[#4FD1C5]">
            {percentage}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden mt-1.5">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <p className="text-[10px] text-gray-400 mt-1 italic flex items-center gap-1 font-sans">
          <Info className="w-3 h-3 flex-shrink-0" />
          <span>Simulated score for MVP evaluation; not calibrated for scientific publication.</span>
        </p>
      </div>
    </div>
  );
}
