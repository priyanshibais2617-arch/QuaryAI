import React from 'react';
import { Satellite, Home, ArrowLeft, Radio } from 'lucide-react';

export default function NotFound({ onNavigate }) {
  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors duration-200 flex flex-col items-center justify-center p-6 text-center">
      {/* Radar Dish Visual */}
      <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-[#080B10] border border-teal-500/20 flex items-center justify-center mb-8 shadow-2xl overflow-hidden">
        {/* Radar Rings */}
        <div className="absolute w-24 h-24 rounded-full border border-teal-500/30 animate-ping" />
        <div className="absolute w-32 h-32 rounded-full border border-teal-500/20" />
        
        {/* Sweep */}
        <div
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-teal-500/20 animate-radar-sweep rounded-full"
          style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 50%)' }}
        />

        <Satellite className="relative z-10 w-14 h-14 text-teal-400 animate-pulse-slow" />
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-mono mb-4">
        <Radio className="w-3.5 h-3.5 animate-pulse" />
        <span>NO TELEMETRY CARRIER DETECTED</span>
      </div>

      <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-gray-900 dark:text-[#F5F7FA]">
        404 — Signal Not Found
      </h1>

      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mt-2 mb-8 leading-relaxed">
        The satellite coordinate or view you are attempting to locate is out of orbital coverage or does not exist.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white dark:bg-[#4FD1C5] dark:text-[#080B10] font-bold text-xs shadow-md shadow-teal-500/20 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111820] text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go Home</span>
        </button>
      </div>
    </div>
  );
}
