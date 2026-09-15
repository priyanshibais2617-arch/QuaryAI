import React from 'react';
import { ArrowRight, Database, Search, GitBranch, Cpu, CheckCircle2 } from 'lucide-react';

export default function WorkflowVisualization({ currentStep = 'specialist', task = 'Bi-Temporal Change', specialist = 'Change Understanding Engine' }) {
  const nodes = [
    { id: 'input', label: 'Inputs & Rasters', sub: 'Multi-Band Scenes', icon: Database },
    { id: 'classifier', label: 'Query & Intent', sub: 'Semantic Parser', icon: Search },
    { id: 'router', label: 'Workflow Router', sub: task, icon: GitBranch },
    { id: 'specialist', label: 'Specialist Engine', sub: specialist, icon: Cpu, active: true },
    { id: 'result', label: 'Evidence & Result', sub: 'Integrated Output', icon: CheckCircle2 },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111820] p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">
          Agentic Workflow Pipeline Graph
        </h4>
        <span className="text-[10px] font-mono text-teal-600 dark:text-[#4FD1C5] px-2 py-0.5 rounded-md bg-teal-500/10 border border-teal-500/20">
          Deterministic Execution
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
        {nodes.map((n, idx) => {
          const Icon = n.icon;
          const isLast = idx === nodes.length - 1;

          return (
            <div
              key={n.id}
              className={`relative p-2.5 rounded-xl border transition-all text-center flex flex-col items-center justify-center ${
                n.active
                  ? 'border-teal-500 bg-teal-500/10 text-teal-700 dark:text-[#4FD1C5] ring-1 ring-teal-500/30'
                  : 'border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-[#151C25]/50 text-gray-500 dark:text-gray-400'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-1.5 ${
                n.active ? 'bg-teal-500 text-white dark:bg-[#4FD1C5] dark:text-[#080B10]' : 'bg-gray-200/60 dark:bg-white/10 text-gray-600 dark:text-gray-300'
              }`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <p className="text-[11px] font-bold leading-tight truncate w-full">{n.label}</p>
              <p className="text-[9px] opacity-70 truncate w-full mt-0.5 font-mono">{n.sub}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
