import React, { useState, useRef } from 'react';
import { Columns, Split, Calendar, ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';
import { getSatelliteSvgUrl } from '../../utils/satelliteGenerators';

export default function BeforeAfterViewer({
  beforeUrl = getSatelliteSvgUrl('optical-baseline'),
  afterUrl = getSatelliteSvgUrl('optical-target'),
  beforeDate = '2024-03-15 (Baseline)',
  afterDate = '2026-02-28 (Target)',
  sensor = 'Sentinel-2 MSI (10m True Color)',
}) {
  const [mode, setMode] = useState('slider'); // 'slider' or 'side-by-side'
  const [sliderPos, setSliderPos] = useState(50);
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  const handleMouseDown = () => {
    isDragging.current = true;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  };

  const handleTouchMove = (e) => {
    if (!containerRef.current || !e.touches[0]) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111820] shadow-sm overflow-hidden space-y-3 p-4">
      {/* Viewer Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider font-mono text-gray-900 dark:text-gray-100">
            Bi-Temporal Differential Inspector
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-[#4FD1C5]">
            10m GSD Co-registered
          </span>
        </div>

        {/* View Mode Toggle & Zoom Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl border border-gray-200 dark:border-white/10 p-0.5 bg-gray-50 dark:bg-[#151C25] text-xs">
            <button
              onClick={() => setMode('slider')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors font-medium ${
                mode === 'slider'
                  ? 'bg-white dark:bg-[#111820] text-teal-600 dark:text-[#4FD1C5] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <Split className="w-3.5 h-3.5" />
              <span>Split Slider</span>
            </button>
            <button
              onClick={() => setMode('side-by-side')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors font-medium ${
                mode === 'side-by-side'
                  ? 'bg-white dark:bg-[#111820] text-teal-600 dark:text-[#4FD1C5] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Side-by-Side</span>
            </button>
          </div>

          <div className="flex items-center gap-1 text-gray-400">
            <button
              onClick={() => setZoom(prev => Math.min(prev + 0.25, 2.5))}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.75))}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              title="Reset view"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Visual Display */}
      {mode === 'slider' ? (
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          className="relative w-full h-80 sm:h-[420px] rounded-xl overflow-hidden bg-black select-none cursor-ew-resize border border-gray-200 dark:border-white/10"
        >
          {/* Base / After Image (Full width background) */}
          <div
            className="absolute inset-0 w-full h-full flex items-center justify-center transition-transform duration-100"
            style={{ transform: `scale(${zoom})` }}
          >
            <img
              src={afterUrl}
              alt="Target scene"
              className="w-full h-full object-cover pointer-events-none"
            />
          </div>

          {/* Top / Before Image (Clipped by sliderPos) */}
          <div
            className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center transition-transform duration-100 pointer-events-none"
            style={{
              clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`,
              transform: `scale(${zoom})`
            }}
          >
            <img
              src={beforeUrl}
              alt="Baseline scene"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Slider Divider Bar */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl pointer-events-none flex items-center justify-center"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="w-8 h-8 rounded-full bg-teal-500 dark:bg-[#4FD1C5] text-[#080B10] shadow-lg flex items-center justify-center text-xs font-bold ring-2 ring-white">
              ⇄
            </div>
          </div>

          {/* Date Badges */}
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#080B10]/80 backdrop-blur-md border border-white/10 text-white text-[10px] font-mono flex items-center gap-1.5 shadow-md">
            <Calendar className="w-3 h-3 text-teal-400" />
            <span>BEFORE: {beforeDate}</span>
          </div>

          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-[#080B10]/80 backdrop-blur-md border border-white/10 text-white text-[10px] font-mono flex items-center gap-1.5 shadow-md">
            <Calendar className="w-3 h-3 text-indigo-400" />
            <span>AFTER: {afterDate}</span>
          </div>

          {/* Instruction hint */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#080B10]/80 backdrop-blur-md border border-white/10 text-white/70 text-[10px] font-mono">
            Drag slider to inspect northern scrubland transition into new structures
          </div>
        </div>
      ) : (
        /* Side-by-side mode */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative rounded-xl overflow-hidden bg-black border border-gray-200 dark:border-white/10 h-72 sm:h-96">
            <div
              className="w-full h-full flex items-center justify-center transition-transform duration-100"
              style={{ transform: `scale(${zoom})` }}
            >
              <img src={beforeUrl} alt="Baseline scene" className="w-full h-full object-cover" />
            </div>
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#080B10]/80 backdrop-blur-md border border-white/10 text-white text-[10px] font-mono">
              BASELINE: {beforeDate}
            </div>
          </div>

          <div className="relative rounded-xl overflow-hidden bg-black border border-gray-200 dark:border-white/10 h-72 sm:h-96">
            <div
              className="w-full h-full flex items-center justify-center transition-transform duration-100"
              style={{ transform: `scale(${zoom})` }}
            >
              <img src={afterUrl} alt="Target scene" className="w-full h-full object-cover" />
            </div>
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#080B10]/80 backdrop-blur-md border border-white/10 text-white text-[10px] font-mono">
              TARGET: {afterDate}
            </div>
          </div>
        </div>
      )}

      {/* Metadata bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] font-mono text-gray-500 dark:text-gray-400">
        <span>Sensor: {sensor}</span>
        <span>Co-registration Error: &lt; 0.12 px</span>
      </div>
    </div>
  );
}
