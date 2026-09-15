import React from 'react';
import { Bot, Cpu, Layers, GitBranch, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AgentDecisionCard({ task, workflow, specialist, reason, warnings = [] }) {
  return (
    <div className="rounded-2xl border border-teal-500/30 bg-gradient-to-br from-teal-500/5 via-indigo-500/5 to-transparent p-5 dark:border-[#4FD1C5]/30 dark:bg-[#111820]/90 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-200/80 dark:border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:bg-[#4FD1C5]/20 dark:text-[#4FD1C5] flex items-center justify-center font-bold">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-gray-900 dark:text-[#F5F7FA] flex items-center gap-2">
              Autonomous Agent Decision
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-[#4FD1C5] border border-teal-500/20">
                Inferred
              </span>
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Deterministic routing based on multimodal input &amp; query semantics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-[#39D98A] text-[11px] font-mono font-bold border border-emerald-500/20">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Optimal Route</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-white/70 dark:bg-[#151C25] border border-gray-100 dark:border-white/5 space-y-1">
          <div className="flex items-center gap-1.5 text-gray-400 font-mono text-[10px] uppercase font-bold">
            <Layers className="w-3 h-3 text-teal-500" />
            <span>Detected Task</span>
          </div>
          <p className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm">{task || 'Remote-Sensing VQA'}</p>
        </div>

        <div className="p-3 rounded-xl bg-white/70 dark:bg-[#151C25] border border-gray-100 dark:border-white/5 space-y-1">
          <div className="flex items-center gap-1.5 text-gray-400 font-mono text-[10px] uppercase font-bold">
            <GitBranch className="w-3 h-3 text-indigo-500" />
            <span>Selected Workflow</span>
          </div>
          <p className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm">{workflow || 'Spatial Reasoning'}</p>
        </div>

        <div className="p-3 rounded-xl bg-white/70 dark:bg-[#151C25] border border-gray-100 dark:border-white/5 space-y-1">
          <div className="flex items-center gap-1.5 text-gray-400 font-mono text-[10px] uppercase font-bold">
            <Cpu className="w-3 h-3 text-violet-500" />
            <span>Specialist Engine</span>
          </div>
          <p className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm truncate">{specialist || 'VQA Engine'}</p>
        </div>
      </div>

      {reason && (
        <div className="p-3 rounded-xl bg-gray-50/80 dark:bg-[#151C25]/80 border border-gray-200/50 dark:border-white/5 text-xs text-gray-700 dark:text-gray-300">
          <span className="font-mono text-[10px] uppercase font-bold text-teal-600 dark:text-[#4FD1C5] block mb-0.5">
            Agent Reasoning:
          </span>
          <p className="italic leading-relaxed">{reason}</p>
        </div>
      )}

      {warnings && warnings.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-300 space-y-1">
          <span className="font-bold uppercase tracking-wider text-[10px] font-mono block">Input Notice:</span>
          {warnings.map((w, idx) => (
            <p key={idx}>• {w}</p>
          ))}
        </div>
      )}
    </div>
  );
}
