import React, { useEffect, useState } from 'react';
import * as Icons from 'lucide-react';

export default function StatCard({
  title,
  value,
  suffix = '',
  iconName = 'Activity',
  change,
  subtext,
  delay = 0,
}) {
  const [displayValue, setDisplayValue] = useState(0);

  // Animated count-up
  useEffect(() => {
    const numValue = typeof value === 'number' ? value : parseInt(value, 10);
    if (isNaN(numValue)) {
      setDisplayValue(value);
      return;
    }

    let start = 0;
    const duration = 1200;
    const stepTime = 25;
    const totalSteps = duration / stepTime;
    const increment = numValue / totalSteps;

    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        start += increment;
        if (start >= numValue) {
          setDisplayValue(numValue);
          clearInterval(interval);
        } else {
          setDisplayValue(Math.floor(start));
        }
      }, stepTime);
      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  const IconComponent = Icons[iconName] || Icons.Activity;

  return (
    <div className="relative group p-5 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111820] shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</span>
        <div className="p-2.5 rounded-xl bg-teal-500/10 dark:bg-[#4FD1C5]/10 text-teal-600 dark:text-[#4FD1C5] group-hover:scale-105 transition-transform">
          <IconComponent className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-1.5">
        <span className="text-3xl font-extrabold text-gray-900 dark:text-[#F5F7FA] font-mono tracking-tight">
          {displayValue}
        </span>
        {suffix && (
          <span className="text-base font-bold text-teal-600 dark:text-[#4FD1C5] font-mono">
            {suffix}
          </span>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{subtext}</span>
        {change && (
          <span className="font-semibold text-emerald-500 dark:text-[#39D98A] flex items-center gap-0.5">
            {change}
          </span>
        )}
      </div>

      <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-teal-500/20 dark:via-[#4FD1C5]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
