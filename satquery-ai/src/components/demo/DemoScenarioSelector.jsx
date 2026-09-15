import React from 'react';
import { Sparkles, Eye, Layers, Radio, FileText, ArrowRight } from 'lucide-react';

export default function DemoScenarioSelector({ onSelectScenario, activeScenarioKey }) {
  const scenarios = [
    {
      key: 'vqa',
      label: 'Try VQA Demo',
      task: 'Single-Image VQA',
      icon: Sparkles,
      desc: 'Land cover & object composition',
      badge: 'MVP 1',
    },
    {
      key: 'grounding',
      label: 'Try Grounding Demo',
      task: 'Visual Grounding',
      icon: Eye,
      desc: 'Feature bounding box localization',
      badge: 'MVP 2A',
    },
    {
      key: 'captioning',
      label: 'Try Captioning Demo',
      task: 'Scene Description',
      icon: FileText,
      desc: 'Multi-category scene description',
      badge: 'MVP 2B',
    },
    {
      key: 'bitemporal',
      label: 'Try Bi-Temporal Demo',
      task: 'Change Detection',
      icon: Layers,
      desc: 'Before vs After differential expansion',
      badge: 'MVP 3',
    },
    {
      key: 'optical_sar',
      label: 'Try Optical + SAR Demo',
      task: 'Cross-Modal Fusion',
      icon: Radio,
      desc: 'Multispectral + C-SAR radar backscatter',
      badge: 'MVP 4',
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          1-Click Mandatory MVP Presets (SIH Evaluation Ready)
        </span>
        <span className="text-[10px] font-mono text-teal-600 dark:text-[#4FD1C5] font-semibold">
          Auto-Populate Data &amp; Rasters
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          const isActive = activeScenarioKey === sc.key;

          return (
            <button
              key={sc.key}
              type="button"
              onClick={() => onSelectScenario(sc.key)}
              className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                isActive
                  ? 'bg-teal-500/10 border-teal-500/40 text-teal-700 dark:text-[#4FD1C5] ring-1 ring-teal-500/30'
                  : 'bg-white dark:bg-[#111820] border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-teal-500/30 hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isActive ? 'bg-teal-500 text-white dark:bg-[#4FD1C5] dark:text-[#080B10]' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300'
                  }`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400">
                    {sc.badge}
                  </span>
                </div>
                <p className="text-xs font-bold leading-snug">{sc.label}</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-400 mt-0.5 leading-tight font-sans">
                  {sc.desc}
                </p>
              </div>

              <div className="mt-2 pt-2 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-[10px] font-mono text-teal-600 dark:text-[#4FD1C5]">
                <span>Load Scenario</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
