import React from 'react';
import * as Icons from 'lucide-react';

export default function ResultSummary({ summaryCards = [] }) {
  if (!summaryCards || summaryCards.length === 0) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      {summaryCards.map((card, idx) => {
        const IconComponent = Icons[card.icon] || Icons.CheckCircle2;

        return (
          <div
            key={idx}
            className="p-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111820] shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                {card.label}
              </span>
              <div className="p-1.5 rounded-lg bg-teal-500/10 dark:bg-[#4FD1C5]/10 text-teal-600 dark:text-[#4FD1C5]">
                <IconComponent className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="mt-1">
              <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-[#F5F7FA] font-mono block truncate">
                {card.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
