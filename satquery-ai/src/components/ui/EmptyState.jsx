import React from 'react';
import { Satellite, Plus } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Satellite,
  title = 'No records found',
  description = 'There are currently no items available to display in this view.',
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-[#111820]/30 my-6">
      <div className="w-14 h-14 rounded-2xl bg-teal-500/10 dark:bg-[#4FD1C5]/10 flex items-center justify-center text-teal-600 dark:text-[#4FD1C5] mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mt-1 mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-teal-600 hover:bg-teal-700 text-white dark:bg-[#4FD1C5] dark:text-[#080B10] dark:hover:bg-[#4FD1C5]/90 transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
