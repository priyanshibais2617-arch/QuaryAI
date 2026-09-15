import React, { useState } from 'react';
import { Layers, Eye, Compass, ZoomIn, PieChart, ShieldCheck } from 'lucide-react';
import { getSatelliteSvgUrl } from '../../utils/satelliteGenerators';

export default function VQAResultView({ result, imageSrc }) {
  const [activeCategory, setActiveCategory] = useState(null);

  const categories = result?.categories?.length > 0
    ? result.categories
    : [
        { name: 'Built-up Area', percentage: 42, color: '#f59e0b', description: 'Impervious surfaces, roofs, paved transit' },
        { name: 'Vegetation', percentage: 28, color: '#10b981', description: 'Canopy cover, active cropland parcels' },
        { name: 'Open Land', percentage: 20, color: '#8b5cf6', description: 'Scrubland, unpaved soil, fallow ground' },
        { name: 'Water Body', percentage: 10, color: '#06b6d4', description: 'Reservoir basin and natural drainage channels' },
      ];

  const previewImage = imageSrc || getSatelliteSvgUrl('optical-target');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-mono font-bold uppercase text-gray-400 tracking-wider">
          Visual Evidence: Scene Composition &amp; Spectral Attributes
        </h4>
        <span className="text-[11px] font-mono text-teal-600 dark:text-[#4FD1C5] px-2 py-0.5 rounded bg-teal-500/10">
          Single-Image VQA Mode
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Raster Viewer */}
        <div className="lg:col-span-7 rounded-2xl border border-gray-200 dark:border-white/10 bg-[#080B10] overflow-hidden relative shadow-md">
          <div className="relative aspect-[4/3] w-full">
            <img
              src={previewImage}
              alt="Satellite Scene"
              className="w-full h-full object-cover"
            />

            {/* Raster HUD Overlay */}
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-[#080B10]/85 border border-white/10 backdrop-blur-sm text-[11px] font-mono text-teal-400">
              PLANETSCOPE SUPERDOVE • 3.1M GSD
            </div>

            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-[#080B10]/85 border border-white/10 backdrop-blur-sm text-[10px] font-mono text-gray-300">
              RGB (B4-B3-B2) TRUE COLOR
            </div>
          </div>
        </div>

        {/* Categorical Distribution Breakdown */}
        <div className="lg:col-span-5 space-y-3">
          <div className="p-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111820] shadow-sm space-y-3">
            <h5 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-teal-500" />
              <span>Detected Land Cover Categories</span>
            </h5>

            <div className="space-y-2.5 pt-1">
              {categories.map((cat) => (
                <div
                  key={cat.name}
                  onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    activeCategory === cat.name
                      ? 'border-teal-500 bg-teal-500/10 ring-1 ring-teal-500/30'
                      : 'border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-[#151C25]/50 hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-gray-900 dark:text-white">{cat.name}</span>
                    </div>
                    <span className="font-mono font-bold text-gray-700 dark:text-gray-300">{cat.percentage}%</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 dark:bg-white/10 h-1 rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                    />
                  </div>

                  {cat.description && (
                    <p className="text-[10px] text-gray-400 mt-1.5 font-sans leading-tight">
                      {cat.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl border border-teal-500/20 bg-teal-500/5 text-xs text-teal-800 dark:text-teal-200 leading-relaxed font-sans space-y-1">
            <span className="font-bold text-[10px] font-mono uppercase block text-teal-600 dark:text-[#4FD1C5]">
              Specialist Explanation:
            </span>
            <p className="text-gray-600 dark:text-gray-300">
              The VQA engine tokenized the scene into 16x16 patch embeddings, matching red-edge spectral peaks to high chlorophyll vegetation and high spatial frequency boundaries to urban structures.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
