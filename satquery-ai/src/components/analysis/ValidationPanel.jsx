import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Loader2, RefreshCw, ShieldCheck } from 'lucide-react';

export default function ValidationPanel({ validationStatus, onRevalidate, onReplaceImage }) {
  const { isValidating, checks, hasWarnings } = validationStatus;

  return (
    <div className="p-5 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111820] shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-500/10 dark:bg-[#4FD1C5]/10 text-teal-600 dark:text-[#4FD1C5]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-gray-100 font-mono">
              Automated Input Validation
            </h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              6-point client-side raster and spatial compatibility checks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isValidating ? (
            <span className="flex items-center gap-1.5 text-xs text-teal-600 dark:text-[#4FD1C5] font-mono">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Validating...
            </span>
          ) : hasWarnings ? (
            <span className="flex items-center gap-1.5 text-xs text-amber-500 font-mono font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              Action Recommended
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-[#39D98A] font-mono font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              All Criteria Passed
            </span>
          )}

          <button
            onClick={onRevalidate}
            disabled={isValidating}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
            title="Re-run validation"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isValidating ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Checklist grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {checks.map((c) => {
          let Icon = CheckCircle2;
          let color = 'text-emerald-500 dark:text-[#39D98A]';
          let border = 'border-gray-100 dark:border-white/5 bg-gray-50/60 dark:bg-[#151C25]/60';

          if (isValidating) {
            Icon = Loader2;
            color = 'text-teal-500 animate-spin';
          } else if (c.status === 'warning') {
            Icon = AlertTriangle;
            color = 'text-amber-500';
            border = 'border-amber-500/20 bg-amber-500/5';
          } else if (c.status === 'error') {
            Icon = XCircle;
            color = 'text-rose-500';
            border = 'border-rose-500/20 bg-rose-500/5';
          }

          return (
            <div
              key={c.id}
              className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${border}`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${color}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-none">
                  {c.name}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  {c.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {hasWarnings && onReplaceImage && (
        <div className="pt-2 flex items-center justify-between">
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Image count or co-registration does not match the active analysis mode.
          </p>
          <button
            onClick={onReplaceImage}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white transition-colors"
          >
            Adjust Imagery
          </button>
        </div>
      )}
    </div>
  );
}
