import React, { useState } from 'react';
import { Sparkles, Copy, Check, Share2, Tag, ShieldCheck } from 'lucide-react';
import ConfidenceBar from './ConfidenceBar';
import { useToast } from '../../hooks/useToast';

export default function ResultCard({
  query,
  answer,
  confidence = 91,
  badge = 'Change Understanding',
  type = 'Bi-Temporal',
}) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(answer);
    setCopied(true);
    toast.success('AI findings summary copied to clipboard.', 'Copied');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111820] shadow-sm space-y-5">
      {/* Query Banner */}
      <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#151C25] border border-gray-200 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-[#4FD1C5]">
              {type} Analysis
            </span>
            <span className="text-[10px] font-mono text-gray-400">
              SIMULATED FRONTEND DEMO
            </span>
          </div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 italic">
            &ldquo;{query}&rdquo;
          </h2>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleCopy}
            className="p-2 rounded-xl border border-gray-200 dark:border-white/10 text-gray-500 hover:text-teal-600 dark:text-gray-400 dark:hover:text-[#4FD1C5] hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            title="Copy answer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* AI Findings Body */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 font-mono flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-[#4FD1C5]" />
            AI Analytical Assessment
          </h3>
          <span className="text-[10px] font-mono text-emerald-600 dark:text-[#39D98A] font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Specialist Verified
          </span>
        </div>

        <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-normal">
          {answer}
        </p>
      </div>

      {/* Confidence Section */}
      <div className="pt-2 border-t border-gray-100 dark:border-white/5">
        <ConfidenceBar confidence={confidence} label="Specialist Grounded Confidence" />
      </div>
    </div>
  );
}
