import React, { useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Eye,
  EyeOff,
  Layers,
  Radio,
  Sparkles,
  Info
} from 'lucide-react';
import { getSatelliteSvgUrl } from '../../utils/satelliteGenerators';

export default function EvidenceViewer({
  scenarioKey = 'bitemporal',
  coordinates = '28°36\'12"N, 77°13\'48"E',
  resolution = '10m / pixel',
  sensor = 'Sentinel-2 L2A',
}) {
  const [showHighlight, setShowHighlight] = useState(true);
  const [activeLayer, setActiveLayer] = useState('optical'); // 'optical', 'sar', 'fused'
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isGrounding = scenarioKey === 'grounding';
  const isOpticalSar = scenarioKey === 'optical_sar';

  // Determine current image source
  let currentImageUrl = '';
  if (isGrounding) {
    currentImageUrl = showHighlight
      ? getSatelliteSvgUrl('grounding-target')
      : getSatelliteSvgUrl('optical-target');
  } else if (isOpticalSar) {
    if (activeLayer === 'sar') currentImageUrl = getSatelliteSvgUrl('sar-radar');
    else if (activeLayer === 'fused') currentImageUrl = getSatelliteSvgUrl('optical-highlight');
    else currentImageUrl = getSatelliteSvgUrl('optical-baseline');
  } else {
    currentImageUrl = showHighlight
      ? getSatelliteSvgUrl('optical-highlight')
      : getSatelliteSvgUrl('optical-target');
  }

  return (
    <div className={`rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111820] shadow-sm p-4 space-y-3 ${
      isFullscreen ? 'fixed inset-4 z-50 overflow-auto bg-white dark:bg-[#080B10]' : ''
    }`}>
      {/* Viewer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider font-mono text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-[#4FD1C5]" />
            Visual Evidence & Grounding
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-[#4FD1C5]">
            {isOpticalSar ? 'Multi-Sensor Fusion' : isGrounding ? 'Bounding Grounding' : 'Differential Heatmap'}
          </span>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Highlight Toggle (for Grounding & Bitemporal) */}
          {!isOpticalSar && (
            <button
              onClick={() => setShowHighlight(!showHighlight)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                showHighlight
                  ? 'bg-teal-500/10 dark:bg-[#4FD1C5]/10 text-teal-600 dark:text-[#4FD1C5] border-teal-500/30'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10'
              }`}
            >
              {showHighlight ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{showHighlight ? 'Highlight Overlay: ON' : 'Original Scene Only'}</span>
            </button>
          )}

          {/* Layer Selector for Optical + SAR */}
          {isOpticalSar && (
            <div className="flex items-center rounded-xl border border-gray-200 dark:border-white/10 p-0.5 bg-gray-50 dark:bg-[#151C25] text-xs">
              <button
                onClick={() => setActiveLayer('optical')}
                className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                  activeLayer === 'optical'
                    ? 'bg-white dark:bg-[#111820] text-teal-600 dark:text-[#4FD1C5] shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
                }`}
              >
                Optical RGB
              </button>
              <button
                onClick={() => setActiveLayer('sar')}
                className={`px-2.5 py-1 rounded-lg transition-colors font-medium flex items-center gap-1 ${
                  activeLayer === 'sar'
                    ? 'bg-white dark:bg-[#111820] text-indigo-500 dark:text-[#7C83FD] shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
                }`}
              >
                <Radio className="w-3 h-3" />
                SAR Radar
              </button>
              <button
                onClick={() => setActiveLayer('fused')}
                className={`px-2.5 py-1 rounded-lg transition-colors font-medium flex items-center gap-1 ${
                  activeLayer === 'fused'
                    ? 'bg-white dark:bg-[#111820] text-emerald-500 dark:text-[#39D98A] shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                Fused Overlay
              </button>
            </div>
          )}

          {/* Zoom & Fullscreen Controls */}
          <div className="flex items-center gap-1 text-gray-400">
            <button
              onClick={() => setZoom(prev => Math.min(prev + 0.25, 3))}
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
              title="Reset zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Display Frame */}
      <div className={`relative w-full rounded-xl overflow-hidden bg-[#080B10] flex items-center justify-center border border-gray-200 dark:border-white/10 ${
        isFullscreen ? 'h-[75vh]' : 'h-80 sm:h-[420px]'
      }`}>
        <div
          className="w-full h-full flex items-center justify-center transition-transform duration-150"
          style={{ transform: `scale(${zoom})` }}
        >
          <img
            src={currentImageUrl}
            alt="Visual evidence raster"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Telemetry HUD Overlays */}
        <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-[#080B10]/80 backdrop-blur-md border border-white/10 text-white text-[10px] font-mono space-y-0.5 pointer-events-none">
          <div>COORDS: {coordinates}</div>
          <div>GSD: {resolution} | SENSOR: {sensor}</div>
        </div>

        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-[#080B10]/80 backdrop-blur-md border border-white/10 text-teal-400 text-[10px] font-mono pointer-events-none flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
          <span>EVIDENCE GROUNDED</span>
        </div>
      </div>

      {/* Footer Notes */}
      <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 pt-1 font-mono">
        <span className="flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-teal-500" />
          Synthetic demonstration raster output for prototype review
        </span>
        <span>Zoom: {Math.round(zoom * 100)}%</span>
      </div>
    </div>
  );
}
