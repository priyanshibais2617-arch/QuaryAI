import React from 'react';
import { Terminal, Cpu, CheckCircle2, Loader2, Sparkles, Activity } from 'lucide-react';

export default function AgentActivity({
  taskDetected = 'Bi-Temporal Change Analysis',
  workflow = 'Change Understanding & Differential Mapping',
  specialistTool = 'Differential Siamese CNN + Transformer',
  currentProgress = 65,
  logs = [],
  status = 'Running...',
}) {
  return (
    <div className="p-5 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111820] shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-500/10 dark:bg-[#4FD1C5]/10 text-teal-600 dark:text-[#4FD1C5]">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider font-mono text-gray-900 dark:text-gray-100">
            Live Agentic Execution
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-500 dark:bg-[#4FD1C5] animate-ping" />
          <span className="text-xs font-mono font-semibold text-teal-600 dark:text-[#4FD1C5]">
            {status}
          </span>
        </div>
      </div>

      {/* Telemetry Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#151C25] border border-gray-100 dark:border-white/5">
          <span className="text-[10px] font-mono uppercase text-gray-400 block">Identified Task</span>
          <span className="font-bold text-gray-800 dark:text-gray-200 mt-0.5 block">{taskDetected}</span>
        </div>
        <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#151C25] border border-gray-100 dark:border-white/5">
          <span className="text-[10px] font-mono uppercase text-gray-400 block">Specialist Model Tool</span>
          <span className="font-bold text-teal-600 dark:text-[#4FD1C5] mt-0.5 block truncate">{specialistTool}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-gray-500 dark:text-gray-400">Agent Controller Pipeline</span>
          <span className="font-bold text-teal-600 dark:text-[#4FD1C5]">{currentProgress}%</span>
        </div>
        <div className="h-2 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-indigo-500 rounded-full transition-all duration-300"
            style={{ width: `${currentProgress}%` }}
          />
        </div>
      </div>

      {/* Live Stream Terminal Box */}
      <div className="rounded-xl bg-[#080B10] border border-white/10 p-3.5 font-mono text-[11px] space-y-1.5 text-gray-300 max-h-48 overflow-y-auto">
        <div className="flex items-center gap-1.5 text-gray-500 pb-1 border-b border-white/5 text-[10px]">
          <Terminal className="w-3 h-3 text-teal-400" />
          <span>AUTONOMOUS AGENT ORCHESTRATION LOG</span>
        </div>
        {logs.map((log, idx) => (
          <div key={idx} className="flex items-start gap-2 leading-relaxed">
            <span className="text-teal-400/80 flex-shrink-0">›</span>
            <span className={idx === logs.length - 1 ? 'text-[#4FD1C5] font-semibold' : 'text-gray-400'}>
              {log}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
