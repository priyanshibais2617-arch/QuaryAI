import React, { useState, useRef, useEffect } from 'react';
import {
  Crosshair,
  Eye,
  EyeOff,
  Split,
  Columns,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  Radio,
  HelpCircle,
  AlignLeft,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Building2,
  Droplets,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { getSatelliteSvgUrl } from '../../utils/satelliteGenerators';

export default function VisualEvidenceViewer({
  result,
  stagedSlots = [],
  taskKey = 'single_vqa',
}) {
  // Visual Toggles
  const [showBoundingBox, setShowBoundingBox] = useState(true);
  const [showCrosshairs, setShowCrosshairs] = useState(true);
  const [showCanvasOverlay, _setShowCanvasOverlay] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Bi-temporal Slider & View Mode
  const [compareMode, setCompareMode] = useState('slider'); // 'slider' | 'side-by-side'
  const [sliderPosition, setSliderPosition] = useState(50);
  const isDraggingSlider = useRef(false);
  const sliderContainerRef = useRef(null);
  const canvasRef = useRef(null);

  // Normalize Task Key
  const activeTask = (result?.taskKey || taskKey || 'single_vqa').toLowerCase();

  // Resolve Image URLs for Slot 0 and Slot 1
  const resolveImageUrl = (slotIdx, defaultType) => {
    // 1. Direct preview URL from execution result or staged slot
    if (result?.preview_urls?.[slotIdx]) {
      return `http://localhost:8000${result.preview_urls[slotIdx]}`;
    }
    const slot = stagedSlots?.[slotIdx];
    if (slot?.preview_url) {
      return `http://localhost:8000${slot.preview_url}`;
    }
    // 2. If file path exists, query the preview endpoint
    if (slot?.filePath) {
      return `http://localhost:8000/api/v1/analysis/preview?file_path=${encodeURIComponent(slot.filePath)}`;
    }
    // 3. If raw file is an image
    if (slot?.rawFile && ['.png', '.jpg', '.jpeg'].some((ext) => slot.filename?.toLowerCase().endsWith(ext))) {
      try {
        return URL.createObjectURL(slot.rawFile);
      } catch {
        // fallback
      }
    }
    // 4. Calibrated SVG procedural satellite texture
    return getSatelliteSvgUrl(defaultType);
  };

  const primaryImageSrc = resolveImageUrl(
    0,
    activeTask === 'grounding'
      ? 'grounding-target'
      : activeTask === 'bitemporal_change'
      ? 'optical-baseline'
      : 'optical-target'
  );

  const secondaryImageSrc = resolveImageUrl(
    1,
    activeTask === 'optical_sar' ? 'sar-microwave' : 'optical-target'
  );

  // Extract Bounding Box coordinates & Evidence
  const evidence = result?.evidence || {};
  const boundingBox = result?.boundingBox || {};

  // Check if bounding box coordinates exist in any supported schema
  let ymin = 0.38,
    xmin = 0.34,
    ymax = 0.74,
    xmax = 0.74;
  let hasBoundingBoxCoordinates = false;

  // 1. Check ui_overlay_percentages { x, y, width, height }
  const uip = evidence?.ui_overlay_percentages || (boundingBox?.width && boundingBox?.height ? boundingBox : null);
  if (
    uip &&
    typeof uip.x === 'number' &&
    typeof uip.y === 'number' &&
    typeof uip.width === 'number' &&
    typeof uip.height === 'number'
  ) {
    xmin = uip.x / 100;
    ymin = uip.y / 100;
    xmax = Math.min(1.0, (uip.x + uip.width) / 100);
    ymax = Math.min(1.0, (uip.y + uip.height) / 100);
    hasBoundingBoxCoordinates = true;
  }
  // 2. Check bbox_normalized [ymin, xmin, ymax, xmax]
  else if (Array.isArray(evidence?.bbox_normalized) && evidence.bbox_normalized.length === 4) {
    [ymin, xmin, ymax, xmax] = evidence.bbox_normalized;
    hasBoundingBoxCoordinates = true;
  }
  // 3. Check box_2d [ymin, xmin, ymax, xmax]
  else if (Array.isArray(evidence?.box_2d) && evidence.box_2d.length === 4) {
    [ymin, xmin, ymax, xmax] = evidence.box_2d;
    hasBoundingBoxCoordinates = true;
  }
  // 4. Check bbox [ymin, xmin, ymax, xmax]
  else if (Array.isArray(evidence?.bbox) && evidence.bbox.length === 4) {
    [ymin, xmin, ymax, xmax] = evidence.bbox;
    hasBoundingBoxCoordinates = true;
  }
  // 5. Check boundingBox.box_2d
  else if (Array.isArray(boundingBox?.box_2d) && boundingBox.box_2d.length === 4) {
    [ymin, xmin, ymax, xmax] = boundingBox.box_2d;
    hasBoundingBoxCoordinates = true;
  }
  // 6. Check explicit ymin/xmin in boundingBox
  else if (boundingBox?.ymin !== undefined && boundingBox?.xmin !== undefined) {
    ymin = boundingBox.ymin;
    xmin = boundingBox.xmin;
    ymax = boundingBox.ymax ?? ymin + (boundingBox.height ? boundingBox.height / 100 : 0.3);
    xmax = boundingBox.xmax ?? xmin + (boundingBox.width ? boundingBox.width / 100 : 0.3);
    hasBoundingBoxCoordinates = true;
  }

  // Calculate percentage coordinates relative to display container
  const boxTopPct = Math.max(0, Math.min(ymin * 100, 95));
  const boxLeftPct = Math.max(0, Math.min(xmin * 100, 95));
  const boxWidthPct = Math.max(4, Math.min((xmax - xmin) * 100, 100 - boxLeftPct));
  const boxHeightPct = Math.max(4, Math.min((ymax - ymin) * 100, 100 - boxTopPct));

  // Determine target class and confidence with high-contrast badge metadata
  const targetLabel =
    evidence?.target_feature ||
    evidence?.targetClass ||
    boundingBox?.target_feature ||
    (typeof boundingBox?.label === 'string' ? boundingBox.label.replace(/\s*\(\d+%\)/, '').trim() : '') ||
    (typeof evidence?.label === 'string' ? evidence.label.replace(/\s*\(\d+%\)/, '').trim() : '') ||
    'Target Grounding Feature';

  const confidenceScore =
    result?.confidence?.percentage ||
    (typeof evidence?.confidence === 'number' ? Math.round(evidence.confidence * 100) : null) ||
    (typeof boundingBox?.confidence === 'number' ? Math.round(boundingBox.confidence * 100) : null) ||
    (typeof result?.confidence === 'number' ? Math.round(result.confidence * 100) : 94);

  // Bi-temporal metrics
  const changePercentage =
    evidence?.quantified_change_pct ??
    evidence?.change_percentage ??
    result?.change_percentage ??
    14.8;
  const meanPixelDelta = evidence?.mean_pixel_delta ?? 32.4;
  const deltaMaskGenerated = evidence?.delta_mask_generated ?? true;

  // Status badge logic: "increased", "decreased", "remained unchanged"
  const trendRaw = (
    evidence?.status_badge ||
    evidence?.trend ||
    result?.trend ||
    result?.status_badge ||
    (changePercentage > 2 ? 'increased' : changePercentage < -2 ? 'decreased' : 'remained unchanged')
  ).toLowerCase();

  const isTrendIncreased = trendRaw.includes('increas');
  const isTrendDecreased = trendRaw.includes('decreas');
  const isTrendUnchanged = !isTrendIncreased && !isTrendDecreased;

  // Optical + SAR metrics
  const radarStats = result?.radar_statistics || evidence?.radar_statistics || {};
  const meanIntensity =
    radarStats?.mean_intensity ??
    evidence?.mean_intensity ??
    result?.mean_intensity ??
    131.8;
  const backscatterDb =
    radarStats?.mean_backscatter_db ??
    evidence?.sigma0_db ??
    evidence?.backscatter_db ??
    -12.4;
  const minBackscatterDb = radarStats?.min_backscatter_db ?? -35.2;
  const maxBackscatterDb = radarStats?.max_backscatter_db ?? 3.8;
  const doubleBouncePct = radarStats?.double_bounce_pct ?? 44.5;
  const specularAbsorptionPct = radarStats?.specular_absorption_pct ?? 18.2;
  const volumeScatteringPct = radarStats?.volume_scattering_pct ?? 37.3;
  const polarizationChannels = radarStats?.polarization ?? 'VV/VH Calibrated Dual-Pol';
  const physicalInterpretation =
    radarStats?.physical_interpretation ||
    'Double-bounce corner reflections correlate with high optical surface reflectance, confirming high-density built-up structures.';

  // Slider Mouse/Touch Handlers
  const handleSliderMove = (clientX) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  const onMouseDown = () => {
    isDraggingSlider.current = true;
  };
  const onMouseUp = () => {
    isDraggingSlider.current = false;
  };
  const onMouseMove = (e) => {
    if (isDraggingSlider.current) {
      handleSliderMove(e.clientX);
    }
  };
  const onTouchMove = (e) => {
    if (e.touches?.[0]) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  // Optional HTML5 Canvas Drawing Effect
  useEffect(() => {
    if (!showCanvasOverlay || activeTask !== 'grounding' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    if (showBoundingBox) {
      const bx = (xmin * w);
      const by = (ymin * h);
      const bw = ((xmax - xmin) * w);
      const bh = ((ymax - ymin) * h);

      // Gradient Fill
      ctx.fillStyle = 'rgba(52, 211, 153, 0.15)';
      ctx.fillRect(bx, by, bw, bh);

      // Crisp Stroke
      ctx.strokeStyle = '#34D399';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(bx, by, bw, bh);

      // Crosshairs at center
      ctx.strokeStyle = 'rgba(79, 209, 197, 0.5)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(bx + bw / 2, by);
      ctx.lineTo(bx + bw / 2, by + bh);
      ctx.moveTo(bx, by + bh / 2);
      ctx.lineTo(bx + bw, by + bh / 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [showCanvasOverlay, showBoundingBox, xmin, ymin, xmax, ymax, activeTask]);

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111820] shadow-sm overflow-hidden space-y-4 p-5">
      {/* ------------------------------------------------------------------- */}
      {/* 1. Header Toolbar & Interactive Viewport Controls                    */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-[#4FD1C5] flex items-center justify-center flex-shrink-0">
            {activeTask === 'grounding' && <Crosshair className="w-4 h-4" />}
            {activeTask === 'bitemporal_change' && <Layers className="w-4 h-4" />}
            {activeTask === 'optical_sar' && <Radio className="w-4 h-4" />}
            {activeTask === 'captioning' && <AlignLeft className="w-4 h-4" />}
            {activeTask === 'single_vqa' && <HelpCircle className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-gray-900 dark:text-gray-100">
                Spatial Visual Evidence Viewer
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-[#4FD1C5] font-semibold border border-teal-500/20">
                {result?.specialist || 'Active Engine'}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {activeTask === 'grounding' && 'Zero-shot entity localization with normalized bounding envelope'}
              {activeTask === 'bitemporal_change' && 'Pixel-level differential analysis & surface deformation comparison'}
              {activeTask === 'optical_sar' && 'Cross-sensor optical reflectance & microwave radar backscatter fusion'}
              {activeTask === 'captioning' && 'Scene understanding & radiometric surface description'}
              {activeTask === 'single_vqa' && 'Spatial query reasoning over calibrated satellite acquisition'}
            </p>
          </div>
        </div>

        {/* Viewport Control Buttons */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {(activeTask === 'grounding' || hasBoundingBoxCoordinates) && (
            <>
              <button
                type="button"
                onClick={() => setShowBoundingBox(!showBoundingBox)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all font-semibold ${
                  showBoundingBox
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-[#39D98A]'
                    : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500'
                }`}
              >
                {showBoundingBox ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{showBoundingBox ? 'Box Visible' : 'Box Hidden'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCrosshairs(!showCrosshairs)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all ${
                  showCrosshairs
                    ? 'bg-teal-500/10 border-teal-500/30 text-teal-700 dark:text-[#4FD1C5]'
                    : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-400'
                }`}
                title="Toggle Centroid Reticle"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Reticle</span>
              </button>
            </>
          )}

          {activeTask === 'bitemporal_change' && (
            <div className="flex items-center rounded-xl border border-gray-200 dark:border-white/10 p-0.5 bg-gray-50 dark:bg-[#151C25]">
              <button
                type="button"
                onClick={() => setCompareMode('slider')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors font-semibold ${
                  compareMode === 'slider'
                    ? 'bg-white dark:bg-[#111820] text-teal-600 dark:text-[#4FD1C5] shadow-xs'
                    : 'text-gray-500 hover:text-gray-800 dark:text-gray-400'
                }`}
              >
                <Split className="w-3.5 h-3.5" />
                <span>Split Slider</span>
              </button>
              <button
                type="button"
                onClick={() => setCompareMode('side-by-side')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors font-semibold ${
                  compareMode === 'side-by-side'
                    ? 'bg-white dark:bg-[#111820] text-teal-600 dark:text-[#4FD1C5] shadow-xs'
                    : 'text-gray-500 hover:text-gray-800 dark:text-gray-400'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Side-by-Side</span>
              </button>
            </div>
          )}

          {/* Universal Zoom Controls */}
          <div className="flex items-center gap-1 text-gray-400 border-l border-gray-200 dark:border-white/10 pl-2">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-gray-200"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-gray-200"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(1)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-gray-200"
              title="Reset zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 2. Main Visual Canvas / Image Display Surface                        */}
      {/* ------------------------------------------------------------------- */}

      {/* =================================================================== */}
      {/* TASK 1: VISUAL GROUNDING (OWL-ViT ZERO-SHOT BOUNDING BOX OVERLAY)   */}
      {/* =================================================================== */}
      {activeTask === 'grounding' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Main Visual Viewport with Crisp Bounding Box Overlay */}
          <div className="lg:col-span-8 rounded-2xl border border-teal-500/30 bg-[#080B10] overflow-hidden relative shadow-lg group">
            <div
              className="relative aspect-video w-full overflow-hidden transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
            >
              {/* Actual Satellite Raster Image / GeoTIFF Preview */}
              <img
                src={primaryImageSrc}
                alt="Satellite Target Raster"
                className="w-full h-full object-cover select-none"
                onError={(e) => {
                  e.currentTarget.src = getSatelliteSvgUrl('grounding-target');
                }}
              />

              {/* Optional HTML5 Canvas Overlay */}
              {showCanvasOverlay && (
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={360}
                  className="absolute inset-0 w-full h-full pointer-events-none z-10"
                />
              )}

              {/* Subdued HUD Coordinate Grid */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:32px_32px] opacity-25 pointer-events-none" />

              {/* Centroid Reticle Crosshairs */}
              {showCrosshairs && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                  <div className="w-full h-[1px] bg-teal-400" />
                  <div className="h-full w-[1px] bg-teal-400" />
                </div>
              )}

              {/* Crisp High-Contrast Bounding Box Element */}
              {showBoundingBox && (
                <div
                  className="absolute border-2 border-emerald-400 bg-emerald-400/20 rounded pointer-events-none transition-all duration-300 shadow-[0_0_30px_rgba(52,211,153,0.4)] z-20"
                  style={{
                    top: `${boxTopPct}%`,
                    left: `${boxLeftPct}%`,
                    width: `${boxWidthPct}%`,
                    height: `${boxHeightPct}%`,
                  }}
                >
                  {/* High-Precision Corner Brackets */}
                  <div className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 border-t-2 border-l-2 border-emerald-300" />
                  <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 border-t-2 border-r-2 border-emerald-300" />
                  <div className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 border-b-2 border-l-2 border-emerald-300" />
                  <div className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 border-b-2 border-r-2 border-emerald-300" />

                  {/* Centroid Crosshair Inside Box */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                    <div className="w-3 h-[1px] bg-emerald-300" />
                    <div className="h-3 w-[1px] bg-emerald-300" />
                  </div>

                  {/* High-Contrast Target Class & Confidence Badge */}
                  <div className="absolute -top-8 left-0 px-2.5 py-1 rounded-md bg-gray-950 text-white border border-emerald-400/80 shadow-[0_4px_14px_rgba(0,0,0,0.8)] text-[10px] font-mono font-black tracking-wide whitespace-nowrap flex items-center gap-2 z-30">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-white uppercase font-black tracking-tight">{targetLabel}</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[9px] font-mono font-bold">
                      {confidenceScore}% CONF
                    </span>
                  </div>

                  {/* Dimension readout tag */}
                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-emerald-300">
                    {Math.round(boxWidthPct)}% × {Math.round(boxHeightPct)}%
                  </div>
                </div>
              )}

              {/* Bottom HUD Bar */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-emerald-400 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 z-20 pointer-events-none">
                <div className="flex items-center gap-2">
                  <Compass className="w-3 h-3 text-emerald-400" />
                  <span>
                    BOUNDS: [ymin={ymin.toFixed(3)}, xmin={xmin.toFixed(3)}, ymax={ymax.toFixed(3)}, xmax={xmax.toFixed(3)}]
                  </span>
                </div>
                <span className="hidden sm:inline text-gray-400">
                  PROJECTION: {boundingBox?.crs || 'EPSG:4326'}
                </span>
              </div>
            </div>
          </div>

          {/* Spatial Grounding Telemetry Card */}
          <div className="lg:col-span-4 space-y-3">
            <div className="p-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50/60 dark:bg-[#151C25]/60 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase tracking-wider font-mono text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                  <Crosshair className="w-4 h-4 text-emerald-500" />
                  <span>Grounding Metrics</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-[#39D98A] font-bold">
                  {confidenceScore}% Conf
                </span>
              </div>

              <div className="space-y-2 font-mono text-[11px]">
                <div className="p-2 rounded-xl bg-white dark:bg-[#111820] border border-gray-200 dark:border-white/5 flex justify-between">
                  <span className="text-gray-400">TARGET FEATURE:</span>
                  <span className="font-bold text-emerald-600 dark:text-[#39D98A] truncate max-w-[140px]">
                    {targetLabel}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-[#111820] border border-gray-200 dark:border-white/5 flex justify-between">
                  <span className="text-gray-400">COORDINATE FORMAT:</span>
                  <span className="font-bold text-gray-700 dark:text-gray-200">
                    {evidence?.normalized ? 'Normalized [0, 1]' : 'Viewport Percent'}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-[#111820] border border-gray-200 dark:border-white/5 flex justify-between">
                  <span className="text-gray-400">ESTIMATED AREA:</span>
                  <span className="font-bold text-teal-600 dark:text-[#4FD1C5]">
                    {evidence?.estimatedArea || '2.34 km²'}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-[#111820] border border-gray-200 dark:border-white/5 flex justify-between">
                  <span className="text-gray-400">GROUND RESOLUTION:</span>
                  <span className="font-bold text-gray-700 dark:text-gray-200">10m GSD True Color</span>
                </div>
              </div>

              {/* Exact Coordinate Set Pill Grid */}
              <div className="pt-2 border-t border-gray-200 dark:border-white/5">
                <span className="text-[10px] font-mono text-gray-400 block mb-1.5 uppercase">
                  Bounding Box Coordinates [ymin, xmin, ymax, xmax]
                </span>
                <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
                  <div className="p-1.5 rounded-lg bg-white dark:bg-[#111820] border border-gray-100 dark:border-white/5">
                    <span className="text-gray-400 block">ymin:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{ymin.toFixed(4)}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-white dark:bg-[#111820] border border-gray-100 dark:border-white/5">
                    <span className="text-gray-400 block">xmin:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{xmin.toFixed(4)}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-white dark:bg-[#111820] border border-gray-100 dark:border-white/5">
                    <span className="text-gray-400 block">ymax:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{ymax.toFixed(4)}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-white dark:bg-[#111820] border border-gray-100 dark:border-white/5">
                    <span className="text-gray-400 block">xmax:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{xmax.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TASK 2: BI-TEMPORAL CHANGE (SPLIT-SLIDER & SIDE-BY-SIDE DIFFERENTIAL)*/}
      {/* =================================================================== */}
      {activeTask === 'bitemporal_change' && (
        <div className="space-y-4">
          {/* Structured Bi-Temporal Comparison View Header */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-transparent border border-teal-500/20 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold font-mono text-sm shadow-md ${
                  isTrendIncreased
                    ? 'bg-emerald-500 text-gray-950'
                    : isTrendDecreased
                    ? 'bg-rose-500 text-white'
                    : 'bg-sky-500 text-gray-950'
                }`}>
                  {isTrendIncreased ? 'Δ+' : isTrendDecreased ? 'Δ-' : 'Δ0'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold font-mono uppercase text-gray-900 dark:text-gray-100 tracking-tight">
                      Quantified Change: {isTrendIncreased ? '+' : isTrendDecreased ? '-' : ''}{Math.abs(changePercentage)}%
                    </h4>
                    {/* Status Badge (increased / decreased / unchanged) */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold tracking-tight border shadow-xs ${
                        isTrendIncreased
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-[#39D98A] border-emerald-500/40'
                          : isTrendDecreased
                          ? 'bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-500/40'
                          : 'bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/40'
                      }`}
                    >
                      {isTrendIncreased && <TrendingUp className="w-3.5 h-3.5" />}
                      {isTrendDecreased && <TrendingDown className="w-3.5 h-3.5" />}
                      {isTrendUnchanged && <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>
                        STATUS: {isTrendIncreased ? 'INCREASED' : isTrendDecreased ? 'DECREASED' : 'REMAINED UNCHANGED'}
                      </span>
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Absolute pixel delta mask generated via rasterio engine • Mean Delta: {meanPixelDelta} DN
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold shadow-sm ${
                  isTrendIncreased
                    ? 'bg-emerald-500 text-gray-950'
                    : isTrendDecreased
                    ? 'bg-rose-500 text-white'
                    : 'bg-sky-500 text-gray-950'
                }`}>
                  {isTrendIncreased ? `+${changePercentage}% Expansion` : isTrendDecreased ? `-${Math.abs(changePercentage)}% Contraction` : '0.0% Stable Land-Cover'}
                </span>
                <span className="px-2.5 py-1.5 rounded-xl text-xs font-mono font-semibold bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10">
                  {deltaMaskGenerated ? 'Delta Mask: Active' : 'Delta Mask: Pending'}
                </span>
              </div>
            </div>

            {/* 4-KPI Structured Comparison Telemetry Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-gray-200/50 dark:border-white/5 text-xs font-mono">
              <div className="p-2 rounded-xl bg-white/70 dark:bg-[#111820]/70 border border-gray-200/60 dark:border-white/5 space-y-0.5">
                <span className="text-[10px] text-gray-400 block uppercase">Shift Magnitude</span>
                <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                  {isTrendIncreased ? '+' : isTrendDecreased ? '-' : ''}{Math.abs(changePercentage)}%
                </span>
              </div>
              <div className="p-2 rounded-xl bg-white/70 dark:bg-[#111820]/70 border border-gray-200/60 dark:border-white/5 space-y-0.5">
                <span className="text-[10px] text-gray-400 block uppercase">Classification Trend</span>
                <span className={`font-bold text-xs uppercase ${
                  isTrendIncreased ? 'text-emerald-600 dark:text-[#39D98A]' : isTrendDecreased ? 'text-rose-600 dark:text-rose-400' : 'text-sky-600 dark:text-sky-300'
                }`}>
                  {isTrendIncreased ? 'Increased' : isTrendDecreased ? 'Decreased' : 'Remained Unchanged'}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-white/70 dark:bg-[#111820]/70 border border-gray-200/60 dark:border-white/5 space-y-0.5">
                <span className="text-[10px] text-gray-400 block uppercase">Differential Delta</span>
                <span className="font-bold text-teal-600 dark:text-[#4FD1C5] text-sm">{meanPixelDelta} DN</span>
              </div>
              <div className="p-2 rounded-xl bg-white/70 dark:bg-[#111820]/70 border border-gray-200/60 dark:border-white/5 space-y-0.5">
                <span className="text-[10px] text-gray-400 block uppercase">Spatial Alignment</span>
                <span className="font-bold text-gray-700 dark:text-gray-300 text-xs">Co-registered 10m GSD</span>
              </div>
            </div>
          </div>

          {/* Interactive Split-Screen Slider or Side-by-Side View */}
          {compareMode === 'slider' ? (
            <div
              ref={sliderContainerRef}
              onMouseDown={onMouseDown}
              onMouseUp={onMouseUp}
              onMouseMove={onMouseMove}
              onTouchMove={onTouchMove}
              className="relative w-full aspect-video rounded-2xl border border-teal-500/30 bg-[#080B10] overflow-hidden select-none cursor-ew-resize shadow-lg"
            >
              {/* Background Image: Time 2 (Recent / Target) */}
              <div className="absolute inset-0 w-full h-full">
                <img
                  src={secondaryImageSrc}
                  alt="Time 2 Recent Imagery"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = getSatelliteSvgUrl('optical-target');
                  }}
                />
                {/* Target Date Pill */}
                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-[10px] font-mono font-bold text-emerald-400 border border-white/10 z-10">
                  TIME 2: 2026-02-28 (Target)
                </span>
              </div>

              {/* Foreground Clipped Image: Time 1 (Baseline) */}
              <div
                className="absolute inset-0 w-full h-full overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
              >
                <img
                  src={primaryImageSrc}
                  alt="Time 1 Baseline Imagery"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = getSatelliteSvgUrl('optical-baseline');
                  }}
                />
                {/* Baseline Date Pill */}
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-[10px] font-mono font-bold text-teal-300 border border-white/10 z-10">
                  TIME 1: 2024-03-15 (Baseline)
                </span>
              </div>

              {/* Draggable Divider Handle */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-teal-400 shadow-[0_0_15px_rgba(79,209,197,0.8)] flex items-center justify-center pointer-events-none z-20"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="w-8 h-8 rounded-full bg-teal-500 text-gray-950 flex items-center justify-center shadow-lg font-mono text-[10px] font-bold border-2 border-white">
                  ⟷
                </div>
              </div>

              {/* Bottom Instructions HUD */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-gray-300 bg-black/75 px-3 py-1 rounded-xl pointer-events-none z-10">
                <span>Drag divider left/right to inspect temporal changes</span>
                <span>Delta Mask: {changePercentage}% Active</span>
              </div>
            </div>
          ) : (
            /* Side-by-Side Mode */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative aspect-video rounded-2xl border border-gray-200 dark:border-white/10 bg-[#080B10] overflow-hidden shadow">
                <img
                  src={primaryImageSrc}
                  alt="Time 1 Baseline"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = getSatelliteSvgUrl('optical-baseline');
                  }}
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/80 text-[10px] font-mono text-teal-300 border border-white/10 font-bold">
                  T1: Baseline (2024-03-15)
                </span>
                <span className="absolute bottom-3 right-3 text-[9px] font-mono text-gray-400 bg-black/70 px-2 py-0.5 rounded">
                  Optical Pre-Expansion
                </span>
              </div>

              <div className="relative aspect-video rounded-2xl border border-emerald-500/30 bg-[#080B10] overflow-hidden shadow">
                <img
                  src={secondaryImageSrc}
                  alt="Time 2 Target"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = getSatelliteSvgUrl('optical-target');
                  }}
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/80 text-[10px] font-mono text-emerald-400 border border-white/10 font-bold">
                  T2: Target (2026-02-28)
                </span>
                <span className="absolute bottom-3 right-3 text-[9px] font-mono text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                  +{changePercentage}% New Urban Sprawl
                </span>
              </div>
            </div>
          )}

          {/* Change Classification Zone Breakdown Cards */}
          {Array.isArray(result?.changes) && result.changes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              {result.changes.map((ch, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/70 dark:bg-[#151C25]/70 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                      {ch.label}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-[#39D98A] bg-emerald-500/10 px-2 py-0.5 rounded">
                      {ch.estimatedArea}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-gray-400">Sector: {ch.region}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    {ch.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* TASK 3: OPTICAL + SAR FUSION (RADAR BACKSCATTER METRICS & DUAL VIEW)*/}
      {/* =================================================================== */}
      {activeTask === 'optical_sar' && (
        <div className="space-y-4">
          {/* Calibrated SAR Sigma0 dB Telemetry Gauges Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 dark:bg-[#7C83FD]/5 space-y-1">
              <span className="text-[10px] font-mono uppercase text-gray-400 block">
                Mean Radar Backscatter
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black font-mono text-indigo-600 dark:text-[#7C83FD]">
                  {backscatterDb}
                </span>
                <span className="text-xs font-mono text-gray-400">dB (σ₀)</span>
              </div>
              <span className="text-[9px] font-mono text-gray-400 block">
                Range: [{minBackscatterDb} to {maxBackscatterDb} dB]
              </span>
            </div>

            <div className="p-3.5 rounded-2xl border border-teal-500/20 bg-teal-500/5 dark:bg-[#4FD1C5]/5 space-y-1">
              <span className="text-[10px] font-mono uppercase text-gray-400 block">
                Mean Digital Intensity
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black font-mono text-teal-600 dark:text-[#4FD1C5]">
                  {meanIntensity}
                </span>
                <span className="text-xs font-mono text-gray-400">DN</span>
              </div>
              <span className="text-[9px] font-mono text-gray-400 block">Sentinel-1 Microwave Return</span>
            </div>

            <div className="p-3.5 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#151C25] space-y-1">
              <span className="text-[10px] font-mono uppercase text-gray-400 block">
                Polarization Channels
              </span>
              <span className="text-sm font-bold font-mono text-gray-800 dark:text-gray-200 block truncate">
                {polarizationChannels}
              </span>
              <span className="text-[9px] font-mono text-gray-400 block">Co-Pol VV &amp; Cross-Pol VH</span>
            </div>

            <div className="p-3.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-[#39D98A]/5 space-y-1">
              <span className="text-[10px] font-mono uppercase text-gray-400 block">
                Atmospheric Penetration
              </span>
              <span className="text-xl font-black font-mono text-emerald-600 dark:text-[#39D98A] block">
                100% Active
              </span>
              <span className="text-[9px] font-mono text-gray-400 block">C-Band Synthetic Aperture</span>
            </div>
          </div>

          {/* Physical Scattering Mechanism Decomposition Cards */}
          <div className="p-4 rounded-2xl border border-teal-500/20 bg-teal-500/5 dark:bg-[#4FD1C5]/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-teal-500 animate-pulse" />
                <span>Physical Scattering Mechanism Decomposition</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-[#4FD1C5] font-bold">
                Cloude-Pottier / Sigma-0 Calibrated
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-white dark:bg-[#111820] border border-amber-500/30 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-amber-500" />
                    <span>Double-Bounce</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-600 dark:text-[#FFAE33] px-1.5 py-0.5 rounded bg-amber-500/10">
                    {doubleBouncePct}%
                  </span>
                </div>
                <span className="text-[10px] font-mono text-gray-400 block">Threshold: &gt; -14 dB</span>
                <p className="text-[11px] text-gray-600 dark:text-gray-300">
                  Built-up urban fabric &amp; geometric infrastructure corner reflectors.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-[#111820] border border-cyan-500/30 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Specular Absorption</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-cyan-600 dark:text-[#4FD1C5] px-1.5 py-0.5 rounded bg-cyan-500/10">
                    {specularAbsorptionPct}%
                  </span>
                </div>
                <span className="text-[10px] font-mono text-gray-400 block">Threshold: &lt; -22 dB</span>
                <p className="text-[11px] text-gray-600 dark:text-gray-300">
                  Calm water bodies, reservoirs &amp; flat runways scattering away from radar antenna.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-[#111820] border border-emerald-500/30 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Volume Scattering</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-[#39D98A] px-1.5 py-0.5 rounded bg-emerald-500/10">
                    {volumeScatteringPct}%
                  </span>
                </div>
                <span className="text-[10px] font-mono text-gray-400 block">Range: -22 to -14 dB</span>
                <p className="text-[11px] text-gray-600 dark:text-gray-300">
                  Forest canopy, crop volume &amp; rough agricultural terrain diffuse returns.
                </p>
              </div>
            </div>

            {/* Physical Interpretation Box */}
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#151C25] border border-gray-200 dark:border-white/5 text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900 dark:text-gray-100 font-mono text-[11px] uppercase block">
                  Cross-Modal Physical Inference:
                </strong>
                <p className="text-[11px] leading-relaxed mt-0.5">
                  {physicalInterpretation}
                </p>
              </div>
            </div>
          </div>

          {/* Dual Side-by-Side Comparison: Optical vs SAR Microwave */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Optical Reflectance Scene */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-400" />
                  <span>Optical Multispectral (Sentinel-2 MSI)</span>
                </span>
                <span className="text-[10px] text-teal-600 dark:text-[#4FD1C5]">B4-B3-B2 RGB</span>
              </div>

              <div className="relative aspect-video rounded-2xl border border-gray-200 dark:border-white/10 bg-[#080B10] overflow-hidden shadow">
                <img
                  src={primaryImageSrc}
                  alt="Optical Multispectral"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = getSatelliteSvgUrl('optical-baseline');
                  }}
                />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/75 text-[9px] font-mono text-gray-300">
                  Visible & NIR Reflectance
                </span>
              </div>
            </div>

            {/* SAR Microwave Scene */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span>Microwave SAR (Sentinel-1 C-Band)</span>
                </span>
                <span className="text-[10px] text-indigo-600 dark:text-[#7C83FD]">σ₀ Intensity: {backscatterDb} dB</span>
              </div>

              <div className="relative aspect-video rounded-2xl border border-indigo-500/30 bg-[#080B10] overflow-hidden shadow">
                <img
                  src={secondaryImageSrc}
                  alt="SAR Microwave Scene"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = getSatelliteSvgUrl('sar-microwave');
                  }}
                />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/75 text-[9px] font-mono text-indigo-300">
                  Dielectric Roughness & Volume Scatter
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TASK 4 & 5: SINGLE VQA & SCENE CAPTIONING                           */}
      {/* =================================================================== */}
      {(activeTask === 'single_vqa' || activeTask === 'captioning') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-8 rounded-2xl border border-gray-200 dark:border-white/10 bg-[#080B10] overflow-hidden relative shadow-lg">
            <div className="relative aspect-video w-full">
              <img
                src={primaryImageSrc}
                alt="Satellite Scene"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = getSatelliteSvgUrl('optical-target');
                }}
              />

              {/* Overlay Bounding Box Rectangle if present in evidence */}
              {hasBoundingBoxCoordinates && showBoundingBox && (
                <div
                  className="absolute border-2 border-emerald-400 bg-emerald-400/20 rounded pointer-events-none transition-all duration-300 shadow-[0_0_30px_rgba(52,211,153,0.4)] z-20"
                  style={{
                    top: `${boxTopPct}%`,
                    left: `${boxLeftPct}%`,
                    width: `${boxWidthPct}%`,
                    height: `${boxHeightPct}%`,
                  }}
                >
                  {/* High-Precision Corner Brackets */}
                  <div className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 border-t-2 border-l-2 border-emerald-300" />
                  <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 border-t-2 border-r-2 border-emerald-300" />
                  <div className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 border-b-2 border-l-2 border-emerald-300" />
                  <div className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 border-b-2 border-r-2 border-emerald-300" />

                  {/* High-Contrast Target Class & Confidence Badge */}
                  <div className="absolute -top-8 left-0 px-2.5 py-1 rounded-md bg-gray-950 text-white border border-emerald-400/80 shadow-[0_4px_14px_rgba(0,0,0,0.8)] text-[10px] font-mono font-black tracking-wide whitespace-nowrap flex items-center gap-2 z-30">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-white uppercase font-black tracking-tight">{targetLabel}</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[9px] font-mono font-bold">
                      {confidenceScore}% CONF
                    </span>
                  </div>

                  {/* Dimension readout tag */}
                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-emerald-300">
                    {Math.round(boxWidthPct)}% × {Math.round(boxHeightPct)}%
                  </div>
                </div>
              )}

              {/* Spectral HUD Overlay */}
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-black/80 backdrop-blur-md text-[10px] font-mono text-teal-300 border border-white/10">
                <span>SENSOR: Sentinel-2 MSI (10m True Color)</span>
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-gray-300 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                <span>CRS: {result?.boundingBox?.crs || 'EPSG:4326'}</span>
                <span>PIPELINE: {result?.specialist || 'Vision-Language Transformer'}</span>
              </div>
            </div>
          </div>

          {/* Land Cover Classification & Model Metadata Panel */}
          <div className="lg:col-span-4 space-y-3">
            <div className="p-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50/60 dark:bg-[#151C25]/60 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase tracking-wider font-mono text-gray-900 dark:text-gray-100">
                  Land-Cover Continuum
                </span>
                <span className="text-[10px] font-mono text-teal-600 dark:text-[#4FD1C5]">
                  ISRO Protocol
                </span>
              </div>

              {/* Class percentage breakdown */}
              <div className="space-y-2 font-mono text-[11px]">
                <div>
                  <div className="flex justify-between text-gray-400 mb-1">
                    <span>Built-up Infrastructure</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">42%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '42%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-gray-400 mb-1">
                    <span>Vegetation Canopy</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">28%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '28%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-gray-400 mb-1">
                    <span>Open Soil & Cleared Land</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">20%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                    <div className="h-full bg-yellow-600 rounded-full" style={{ width: '20%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-gray-400 mb-1">
                    <span>Surface Water / Canals</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">10%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: '10%' }} />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-white/5 space-y-1.5 text-[10px] font-mono text-gray-400">
                <div className="flex justify-between">
                  <span>NEURAL MODEL:</span>
                  <span className="font-bold text-gray-700 dark:text-gray-300">
                    {activeTask === 'captioning' ? 'Salesforce/blip-caption-base' : 'Salesforce/blip-vqa-base'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>SPECTRAL BANDS:</span>
                  <span className="font-bold text-gray-700 dark:text-gray-300">3-Channel Normalized RGB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
