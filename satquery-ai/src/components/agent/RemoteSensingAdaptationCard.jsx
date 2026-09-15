import React from 'react';
import { Database, Cpu, Sparkles, Boxes, Satellite, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { REMOTE_SENSING_ADAPTATION_METADATA } from '../../data/mockModelRegistry';

export default function RemoteSensingAdaptationCard() {
  const meta = REMOTE_SENSING_ADAPTATION_METADATA;

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111820] p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/20 dark:text-indigo-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-gray-900 dark:text-[#F5F7FA]">
              {meta.title}
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Foundation model fine-tuning &amp; multispectral adapter lineage
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-500/20">
            {meta.status}
          </span>
        </div>
      </div>

      {/* Conceptual Flow Diagram */}
      <div className="p-4 rounded-xl bg-gray-50/60 dark:bg-[#151C25]/80 border border-gray-100 dark:border-white/5 space-y-3">
        <span className="text-[10px] font-mono uppercase font-bold text-gray-400 tracking-wider block">
          Domain Adaptation Flow Pipeline
        </span>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
          {meta.pipelineSteps.map((step, idx) => (
            <div
              key={step.id}
              className="p-3 rounded-xl bg-white dark:bg-[#1B222D] border border-gray-200/60 dark:border-white/5 space-y-1 text-left relative"
            >
              <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 mb-1">
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-500/10">
                  STEP 0{idx + 1}
                </span>
              </div>
              <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                {step.title}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-snug font-sans">
                {step.detail}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Architecture Spec Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/40 dark:bg-[#151C25]/40">
          <span className="text-[10px] font-mono uppercase text-gray-400 block font-bold">Training Source</span>
          <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{meta.trainingSource}</p>
        </div>

        <div className="p-3 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/40 dark:bg-[#151C25]/40">
          <span className="text-[10px] font-mono uppercase text-gray-400 block font-bold">Adaptation Strategy</span>
          <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{meta.adaptationStrategy}</p>
        </div>

        <div className="p-3 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/40 dark:bg-[#151C25]/40">
          <span className="text-[10px] font-mono uppercase text-gray-400 block font-bold">Target Artifact</span>
          <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{meta.targetComponent}</p>
        </div>

        <div className="p-3 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/40 dark:bg-[#151C25]/40">
          <span className="text-[10px] font-mono uppercase text-gray-400 block font-bold">Execution Target</span>
          <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5">SatQuery Agentic Dispatch</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-gray-400 italic">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
        <span>{meta.disclaimer}</span>
      </div>
    </div>
  );
}
