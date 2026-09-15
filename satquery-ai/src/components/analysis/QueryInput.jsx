import React from 'react';
import { Sparkles, Bot, CornerDownLeft, Lightbulb } from 'lucide-react';

export default function QueryInput({
  query,
  setQuery,
  onSubmit,
  isSubmitting,
  suggestedQueries = [],
  disabled = false,
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (query.trim() && !disabled && !isSubmitting) {
        onSubmit();
      }
    }
  };

  return (
    <div className="p-5 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111820] shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600 dark:text-[#4FD1C5]" />
            Natural Language Query
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Ask any question regarding changes, land cover, spatial grounding, or multi-sensor correlation.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/10 dark:bg-[#4FD1C5]/10 text-teal-600 dark:text-[#4FD1C5] text-[10px] font-mono font-semibold">
          <Bot className="w-3.5 h-3.5" />
          <span>Agentic Routing Active</span>
        </div>
      </div>

      {/* Query Textarea */}
      <div className="relative">
        <textarea
          rows={3}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about your satellite imagery... (e.g. 'What changed between these two dates and where did new construction appear?')"
          disabled={disabled || isSubmitting}
          className="w-full p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#080B10] text-gray-900 dark:text-[#F5F7FA] text-xs placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500/50 dark:focus:ring-[#4FD1C5]/50 focus:border-teal-500/50 resize-none leading-relaxed"
        />

        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <span className="hidden sm:inline-block text-[10px] font-mono text-gray-400">
            Ctrl + Enter to run
          </span>
          <button
            onClick={onSubmit}
            disabled={disabled || isSubmitting || !query.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white dark:bg-[#4FD1C5] dark:text-[#080B10] dark:hover:bg-[#4FD1C5]/90 text-xs font-bold transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>Analyze Image</span>
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Suggested Queries */}
      {suggestedQueries.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>Suggested prompts for this modality:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggestedQueries.map((sq, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setQuery(sq)}
                className="text-left px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:border-teal-500/40 dark:hover:border-[#4FD1C5]/40 text-gray-700 dark:text-gray-300 text-xs transition-colors"
              >
                &ldquo;{sq}&rdquo;
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Agent Workflow Explanation Banner */}
      <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-[11px] text-gray-600 dark:text-gray-400 flex items-start gap-2.5">
        <Bot className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-gray-800 dark:text-gray-200">Autonomous Execution: </strong>
          SatQuery AI determines the specialist model pipeline (Differential CNN, Transformer, or Cross-Modal Alignment) based on your question and spectral bands.
        </p>
      </div>
    </div>
  );
}
