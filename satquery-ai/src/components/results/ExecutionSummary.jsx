import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Cpu, Sliders, ShieldCheck, Clock, FileCode, CheckCircle2 } from 'lucide-react';

export default function ExecutionSummary({
  task = 'Bi-Temporal Change Analysis',
  workflow = 'Change Understanding & Differential Mapping',
  inputDesc = '2 Satellite Images (Sentinel-2 L2A Multi-band)',
  specialistTool = 'Differential Siamese CNN + Transformer',
  confidence = 91,
  parameters = 'Co-registered Sentinel-2 MSI, 10m GSD, Temporal Gap: 23 Mo',
  executionTime = '1.42 seconds (Client-simulated)',
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111820] shadow-sm overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-teal-500/10 dark:bg-[#4FD1C5]/10 text-teal-600 dark:text-[#4FD1C5]">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-gray-900 dark:text-gray-100">
              Auditable Execution Workflow Summary
            </h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Transparent pipeline routing and specialist tool parameterization
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isExpanded && (
        <div className="px-5 pb-5 pt-1 border-t border-gray-100 dark:border-white/5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#151C25] border border-gray-100 dark:border-white/5">
              <span className="text-[10px] font-mono uppercase text-gray-400 block">Orchestrated Task</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5 block">{task}</span>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#151C25] border border-gray-100 dark:border-white/5">
              <span className="text-[10px] font-mono uppercase text-gray-400 block">Agentic Workflow</span>
              <span className="font-semibold text-teal-600 dark:text-[#4FD1C5] mt-0.5 block">{workflow}</span>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#151C25] border border-gray-100 dark:border-white/5">
              <span className="text-[10px] font-mono uppercase text-gray-400 block">Specialist Model / Tool</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5 block truncate">{specialistTool}</span>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#151C25] border border-gray-100 dark:border-white/5">
              <span className="text-[10px] font-mono uppercase text-gray-400 block">Sensors & Input</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5 block truncate">{inputDesc}</span>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#151C25] border border-gray-100 dark:border-white/5">
              <span className="text-[10px] font-mono uppercase text-gray-400 block">Execution Latency</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5 block font-mono flex items-center gap-1">
                <Clock className="w-3 h-3 text-gray-400" />
                {executionTime}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#151C25] border border-gray-100 dark:border-white/5">
              <span className="text-[10px] font-mono uppercase text-gray-400 block">Calibrated Confidence</span>
              <span className="font-semibold text-emerald-500 dark:text-[#39D98A] mt-0.5 block font-mono">
                {confidence}% (High Certainty)
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#151C25] border border-gray-100 dark:border-white/5 text-[11px] font-mono text-gray-500 dark:text-gray-400 flex items-start gap-2">
            <Sliders className="w-3.5 h-3.5 text-teal-600 dark:text-[#4FD1C5] flex-shrink-0 mt-0.5" />
            <span className="break-all">
              <strong className="text-gray-700 dark:text-gray-300">Parameters: </strong>
              {parameters}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
