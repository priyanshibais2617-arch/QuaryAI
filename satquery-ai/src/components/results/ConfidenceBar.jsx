import React, { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';

export default function ConfidenceBar({ confidence = 91, label = 'Model Confidence' }) {
  const [animatedWidth, setAnimatedWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedWidth(confidence);
    }, 150);
    return () => clearTimeout(timer);
  }, [confidence]);

  let barColor = 'from-teal-500 to-emerald-400';
  let badgeColor = 'text-emerald-500 dark:text-[#39D98A]';

  if (confidence < 75 && confidence >= 50) {
    barColor = 'from-amber-500 to-yellow-400';
    badgeColor = 'text-amber-500';
  } else if (confidence < 50) {
    barColor = 'from-rose-500 to-red-400';
    badgeColor = 'text-rose-500';
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
          <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-[#4FD1C5]" />
          <span>{label}</span>
        </div>
        <span className={`font-mono font-bold text-sm ${badgeColor}`}>
          {confidence}%
        </span>
      </div>

      <div className="h-2.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden p-0.5 border border-gray-200 dark:border-white/10">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-1000 ease-out`}
          style={{ width: `${animatedWidth}%` }}
        />
      </div>
    </div>
  );
}
