import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorState({
  title = 'Analysis Pipeline Warning',
  message = 'An unexpected condition occurred while resolving satellite telemetry.',
  onRetry,
}) {
  return (
    <div className="flex items-start gap-4 p-5 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-rose-600 dark:text-rose-400 my-4">
      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="text-sm font-semibold">{title}</h4>
        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry Check
          </button>
        )}
      </div>
    </div>
  );
}
