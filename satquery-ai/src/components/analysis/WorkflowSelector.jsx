import React from 'react';
import { Image, Layers, Radio, CheckCircle2 } from 'lucide-react';

export default function WorkflowSelector({ selectedType, onSelectType }) {
  const modes = [
    {
      id: 'single',
      title: 'Single Scene',
      subtitle: '1 Optical or SAR Image',
      description: 'Single-acquisition understanding: VQA, general land cover description, scene captioning, and spatial grounding.',
      icon: Image,
      badge: '1 Input Raster',
      tag: 'VQA / Grounding',
    },
    {
      id: 'bitemporal',
      title: 'Bi-Temporal Pair',
      subtitle: '2 Time-Stamped Images',
      description: 'Spatially corresponding baseline (T1) and target (T2) scenes for differential change analysis and expansion tracking.',
      icon: Layers,
      badge: '2 Temporal Rasters',
      tag: 'Change Understanding',
    },
    {
      id: 'optical_sar',
      title: 'Optical + SAR Fusion',
      subtitle: 'Co-registered Multi-Sensor',
      description: 'Complementary multi-sensor pair combining optical spectral fidelity with all-weather microwave radar backscatter.',
      icon: Radio,
      badge: 'Multi-Modal Pair',
      tag: 'Sensor Fusion',
    },
  ];

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-mono">
          Input Configuration Type
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Select the modality setup of your satellite data. The Agentic Controller will automatically determine the specialist model.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selectedType === mode.id;

          return (
            <div
              key={mode.id}
              onClick={() => onSelectType(mode.id)}
              className={`relative cursor-pointer p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'border-teal-500 dark:border-[#4FD1C5] bg-teal-500/5 dark:bg-[#4FD1C5]/10 ring-1 ring-teal-500/40 shadow-sm'
                  : 'border-gray-200 dark:border-white/10 bg-white dark:bg-[#111820] hover:border-gray-300 dark:hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`p-2 rounded-xl ${
                      isSelected
                        ? 'bg-teal-500 dark:bg-[#4FD1C5] text-white dark:text-[#080B10]'
                        : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400">
                    {mode.badge}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">{mode.title}</h4>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-[#4FD1C5]" />}
                </div>
                <p className="text-[11px] font-mono text-teal-600 dark:text-[#4FD1C5] mt-0.5">{mode.subtitle}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                  {mode.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-[10px] font-mono text-gray-400">
                <span>Task Auto-routed</span>
                <span className="font-semibold text-gray-700 dark:text-gray-300">{mode.tag}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
