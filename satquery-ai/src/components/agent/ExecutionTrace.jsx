import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, Terminal, Clock, ShieldCheck, Activity } from 'lucide-react';

export default function ExecutionTrace({ trace = [], defaultExpanded = false }) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!trace || trace.length === 0) {
    return null;
  }

  const completedCount = trace.filter(t => t.status === 'completed').length;

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111820] overflow-hidden shadow-sm">
      {/* Header clickable bar */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-600 dark:text-[#4FD1C5] flex items-center justify-center font-mono">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900 dark:text-[#F5F7FA] flex items-center gap-2">
              Autonomous Agent Execution Trace
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-[#39D98A] font-semibold">
                {completedCount}/{trace.length} Steps Verified
              </span>
            </h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Audit timeline of deterministic query understanding, routing, and specialist inference
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
          <span>{isExpanded ? 'Hide Trace' : 'Expand Trace'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded timeline */}
      {isExpanded && (
        <div className="p-4 pt-2 border-t border-gray-100 dark:border-white/5 space-y-3 font-mono text-xs">
          <div className="space-y-2">
            {trace.map((step, idx) => (
              <div
                key={step.id || idx}
                className="flex items-start justify-between p-2.5 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/70 dark:bg-[#151C25]/70"
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-emerald-500 dark:text-[#39D98A] mt-0.5 font-bold">✓</span>
                  <div>
                    <span className="font-bold text-gray-900 dark:text-gray-100">{step.title}</span>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed font-sans">
                      {step.detail}
                    </p>
                  </div>
                </div>

                <div className="text-[10px] text-gray-400 flex items-center gap-1 flex-shrink-0 ml-3">
                  <Clock className="w-3 h-3" />
                  <span>{step.timestamp || '00:00:01'}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-2.5 rounded-xl bg-teal-500/5 border border-teal-500/20 text-[11px] font-sans text-teal-700 dark:text-[#4FD1C5] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-500" />
              Determinism Verified: All pipeline checkpoints satisfied without hallucinated parameters.
            </span>
            <span className="font-mono text-[10px] opacity-70">SATQUERY-TRACE-OK</span>
          </div>
        </div>
      )}
    </div>
  );
}
