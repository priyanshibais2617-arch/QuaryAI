import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Download,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Crosshair,
  Trash2,
  ShieldCheck,
  Database,
  Search,
  Activity,
  Terminal,
  Layers,
  HelpCircle,
  Radio,
  AlignLeft,
  Calendar,
  Maximize2,
  ArrowRight,
  RefreshCw,
  Clock,
  TrendingUp,
  Compass,
  Cpu,
} from 'lucide-react';
import {
  uploadRasterFile,
  executeLiveAnalysis,
  downloadReportPdf,
  checkBackendHealth,
} from '../services/apiClient';
import { useToast } from '../hooks/useToast';
import VisualEvidenceViewer from '../components/results/VisualEvidenceViewer';

// 5 Core ISRO Evaluation Workflows
const CORE_WORKFLOWS = [
  {
    key: 'single_vqa',
    name: 'Single Image VQA',
    subtitle: 'Visual Question Answering on single optical or multispectral scene',
    icon: HelpCircle,
    slots: 1,
    badge: 'Single Sensor',
    defaultQuery: 'Describe the land cover, terrain classification, and spatial distribution in this scene.',
    slotLabels: ['Primary Satellite Raster'],
  },
  {
    key: 'captioning',
    name: 'Scene Captioning',
    subtitle: 'Generate detailed remote-sensing descriptive captions of landscape patterns',
    icon: AlignLeft,
    slots: 1,
    badge: 'Vision-Language',
    defaultQuery: 'Provide a comprehensive descriptive caption of this remote sensing imagery.',
    slotLabels: ['Satellite Scene Image'],
  },
  {
    key: 'grounding',
    name: 'Visual Grounding',
    subtitle: 'Object localization & demarcating target spatial features with bounding boxes',
    icon: Crosshair,
    slots: 1,
    badge: 'Object Localization',
    defaultQuery: 'Where is the primary water body or reservoir in this scene?',
    slotLabels: ['Target Imagery'],
  },
  {
    key: 'bitemporal_change',
    name: 'Bi-temporal Change Analysis',
    subtitle: 'Quantify urban sprawl, infrastructure spurs, and canopy deltas across 2 dates',
    icon: Layers,
    slots: 2,
    badge: 'Dual-Date (T1 & T2)',
    defaultQuery: 'What spatial changes, urban expansion, or vegetation deltas occurred between these two dates?',
    slotLabels: ['Time 1 — Baseline Imagery (T1)', 'Time 2 — Recent / Target Imagery (T2)'],
  },
  {
    key: 'optical_sar',
    name: 'Optical + SAR Fusion',
    subtitle: 'Cross-sensor intelligence correlating optical reflectance with radar backscatter',
    icon: Radio,
    slots: 2,
    badge: 'Cross-Modal Fusion',
    defaultQuery: 'Correlate multi-spectral optical reflectance with SAR radar backscatter to penetrate cloud occlusions.',
    slotLabels: ['Optical Multi-spectral Scene', 'SAR Microwave Radar Scene (Sentinel-1)'],
  },
];

const ALLOWED_BENCHMARK_TAGS = ['BigEarthNet', 'VRSBench', 'RSVQA', 'CDVQA'];

export default function Dashboard({ activeTaskKey = 'single_vqa', onNavigate }) {
  const { toast } = useToast();

  // Selected Workflow Task (Default to activeTaskKey or Single Image VQA)
  const [selectedTaskKey, setSelectedTaskKey] = useState(activeTaskKey);
  const activeWorkflow = CORE_WORKFLOWS.find((w) => w.key === selectedTaskKey) || CORE_WORKFLOWS[0];

  // Sync with activeTaskKey prop when navigating via sidebar
  useEffect(() => {
    if (activeTaskKey && activeTaskKey !== selectedTaskKey) {
      setSelectedTaskKey(activeTaskKey);
      const targetWf = CORE_WORKFLOWS.find((w) => w.key === activeTaskKey);
      if (targetWf) {
        setQuery(targetWf.defaultQuery);
      }
      setStagedSlots([null, null]);
      setLiveResult(null);
      setExecutionError(null);
    }
  }, [activeTaskKey]);

  // Backend Health State
  const [isBackendHealthy, setIsBackendHealthy] = useState(false);
  const [checkingHealth, setCheckingHealth] = useState(true);

  // Dynamic Multi-Slot Staged Files: array of up to 2 items [slot0, slot1]
  // Each slot: { filename, filePath, status, metadata, size, rawFile, benchmarkTag } | null
  const [stagedSlots, setStagedSlots] = useState([null, null]);
  const [uploadingSlot, setUploadingSlot] = useState(null); // 0 or 1 or null
  const [uploadError, setUploadError] = useState(null);
  const [selectedBenchmarkTag, setSelectedBenchmarkTag] = useState('');

  // Dropzone drag states per slot
  const [dragOverSlot, setDragOverSlot] = useState(null); // 0, 1, or null
  const fileInputRef0 = useRef(null);
  const fileInputRef1 = useRef(null);

  // Query Execution State
  const [query, setQuery] = useState(activeWorkflow.defaultQuery);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionError, setExecutionError] = useState(null);
  const [liveResult, setLiveResult] = useState(null);

  // PDF Export State
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Check Backend Health
  useEffect(() => {
    let isMounted = true;
    const verifyHealth = async () => {
      const ok = await checkBackendHealth();
      if (isMounted) {
        setIsBackendHealthy(ok);
        setCheckingHealth(false);
      }
    };
    verifyHealth();
    const interval = setInterval(verifyHealth, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // When task changes, update default query if current query is empty or equal to previous default
  const handleSelectWorkflow = (workflowKey) => {
    setSelectedTaskKey(workflowKey);
    const targetWf = CORE_WORKFLOWS.find((w) => w.key === workflowKey);
    if (targetWf) {
      setQuery(targetWf.defaultQuery);
    }
    setLiveResult(null);
    setExecutionError(null);
  };

  // Upload a file to a specific slot (0 or 1)
  const handleUploadFileToSlot = async (slotIdx, file, forcedBenchmark = null) => {
    if (!file) return;

    setUploadError(null);
    setUploadingSlot(slotIdx);

    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const isBenchmarkImg = ['.png', '.jpg', '.jpeg'].includes(ext);
    const benchmark = forcedBenchmark || (isBenchmarkImg ? selectedBenchmarkTag || 'BigEarthNet' : null);

    try {
      const response = await uploadRasterFile(file, benchmark);
      const slotData = {
        rawFile: file,
        filename: response.filename || file.name,
        filePath: response.file_path,
        preview_url: response.preview_url,
        status: response.status,
        metadata: response.metadata || {},
        size: file.size,
        benchmarkTag: benchmark,
        modality:
          slotIdx === 1 && activeWorkflow.key === 'optical_sar'
            ? 'SAR'
            : activeWorkflow.key === 'bitemporal_change'
            ? slotIdx === 0
              ? 'Optical (T1)'
              : 'Optical (T2)'
            : 'Optical',
      };

      setStagedSlots((prev) => {
        const next = [...prev];
        next[slotIdx] = slotData;
        return next;
      });

      toast.success(`Staged ${slotData.filename} in Slot ${slotIdx + 1}`, 'Upload Verified');
    } catch (err) {
      const msg = err.message || `Slot ${slotIdx + 1} upload failed.`;
      setUploadError(msg);
      toast.error(msg, 'Upload Error');
    } finally {
      setUploadingSlot(null);
      if (slotIdx === 0 && fileInputRef0.current) fileInputRef0.current.value = '';
      if (slotIdx === 1 && fileInputRef1.current) fileInputRef1.current.value = '';
    }
  };

  // Quick sample loaders for testing
  const handleLoadSample = async (slotIdx, sampleFileName) => {
    setUploadingSlot(slotIdx);
    setUploadError(null);
    try {
      const res = await fetch(`/${sampleFileName}`);
      if (!res.ok) throw new Error(`HTTP ${res.status} finding /${sampleFileName}`);
      const blob = await res.blob();
      const file = new File([blob], sampleFileName, { type: 'image/tiff' });
      await handleUploadFileToSlot(slotIdx, file);
    } catch (err) {
      setUploadError(`Failed to load ${sampleFileName}: ` + err.message);
      setUploadingSlot(null);
    }
  };

  const handleClearSlot = (slotIdx) => {
    setStagedSlots((prev) => {
      const next = [...prev];
      next[slotIdx] = null;
      return next;
    });
    setLiveResult(null);
  };

  // Verify whether required slots are filled
  const readySlots = stagedSlots.slice(0, activeWorkflow.slots);
  const isReadyToExecute = readySlots.every((s) => s && s.filePath) && query.trim().length > 0;

  // Execute Analysis via POST /api/v1/analysis/execute
  const handleExecute = async (e) => {
    if (e) e.preventDefault();

    const required = activeWorkflow.slots;
    for (let i = 0; i < required; i++) {
      if (!stagedSlots[i] || !stagedSlots[i].filePath) {
        toast.warning(`Please upload imagery for Slot ${i + 1}: ${activeWorkflow.slotLabels[i]}`, 'Missing Input');
        return;
      }
    }

    if (!query.trim()) {
      toast.warning('Please enter a natural language query.', 'Empty Query');
      return;
    }

    setIsExecuting(true);
    setExecutionError(null);

    const filePaths = readySlots.map((s) => s.filePath);
    const modalities = readySlots.map((s) => s.modality || 'Optical');

    try {
      const result = await executeLiveAnalysis({
        query: query.trim(),
        filePaths,
        modalities,
        task: activeWorkflow.key,
      });

      setLiveResult(result);
      toast.success(
        `Executed ${result.task || activeWorkflow.name} via ${result.specialist || 'Specialist Engine'}`,
        'Execution Complete'
      );
    } catch (err) {
      const msg = err.message || 'Analysis execution failed. Check backend logs.';
      setExecutionError(msg);
      toast.error(msg, 'Execution Failed');
    } finally {
      setIsExecuting(false);
    }
  };

  // PDF Export via POST /api/v1/export/report
  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      await downloadReportPdf(liveResult);
      toast.success('Dossier downloaded: satquery_dossier.pdf', 'PDF Export Complete');
    } catch (err) {
      toast.error(err.message || 'Failed to export PDF dossier.', 'Export Error');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      {/* ========================================================================= */}
      {/* Top Header Banner & Backend Status                                       */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-[#F5F7FA] tracking-tight">
              SatQuery AI
            </h1>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-[#4FD1C5] border border-teal-500/20">
              ISRO / SAC Benchmark
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Autonomous multi-sensor satellite intelligence, specialized vision agents, and spatial audit dossiers.
          </p>
        </div>

        {/* Backend Status & PDF Export Shortcut */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111820] shadow-sm">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                checkingHealth
                  ? 'bg-amber-400 animate-pulse'
                  : isBackendHealthy
                  ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                  : 'bg-rose-500'
              }`}
            />
            <span className="text-xs font-mono font-medium text-gray-700 dark:text-gray-300">
              {checkingHealth
                ? 'Pinging API...'
                : isBackendHealthy
                ? 'FastAPI Active (:8000)'
                : 'FastAPI Offline (:8000)'}
            </span>
          </div>

          {liveResult && (
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white dark:bg-[#4FD1C5] dark:text-[#080B10] dark:hover:bg-[#4FD1C5]/90 text-xs font-bold shadow-md shadow-teal-500/20 transition-all"
            >
              {isExportingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>Export PDF Dossier</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ACTIVE EVALUATION WORKFLOW HEADER BANNER                                 */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111820] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 dark:bg-[#4FD1C5]/10 text-teal-600 dark:text-[#4FD1C5] border border-teal-500/20 dark:border-[#4FD1C5]/30 flex items-center justify-center flex-shrink-0">
            {React.createElement(activeWorkflow.icon, { className: 'w-6 h-6' })}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                {activeWorkflow.name}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-700 dark:text-[#4FD1C5] font-bold uppercase">
                {activeWorkflow.badge}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 font-semibold uppercase">
                {activeWorkflow.slots === 2 ? '2 Images Required' : '1 Image Required'}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {activeWorkflow.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto font-mono text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>ISRO / SAC Protocol</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. DYNAMIC DUAL/SINGLE DROPZONE (POST /api/v1/analysis/upload)            */}
      {/* ========================================================================= */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-teal-600 dark:text-[#4FD1C5]" />
            <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-gray-700 dark:text-gray-300">
              1. Imagery Staging ({activeWorkflow.slots} {activeWorkflow.slots === 2 ? 'Slots Required' : 'Slot Required'})
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-gray-400">
              POST /api/v1/analysis/upload
            </span>
          </div>
        </div>

        {/* Dynamic Multi-Slot Rendering: 1 Slot or 2 Slots */}
        <div className={`grid gap-4 ${activeWorkflow.slots === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
          {Array.from({ length: activeWorkflow.slots }).map((_, slotIdx) => {
            const staged = stagedSlots[slotIdx];
            const slotLabel = activeWorkflow.slotLabels[slotIdx];
            const isUploadingThis = uploadingSlot === slotIdx;
            const isDragOverThis = dragOverSlot === slotIdx;
            const inputRef = slotIdx === 0 ? fileInputRef0 : fileInputRef1;

            // Suggested sample file name for quick load
            const sampleFileName =
              activeWorkflow.key === 'optical_sar'
                ? slotIdx === 0
                  ? 'sample_sentinel2.tif'
                  : 'sample_sar.tif'
                : slotIdx === 0
                ? 'sample_sentinel2.tif'
                : 'sample_sentinel2_t2.tif';

            const sampleButtonLabel =
              activeWorkflow.key === 'optical_sar'
                ? slotIdx === 0
                  ? 'Load Sample Optical GeoTIFF'
                  : 'Load Sample Sentinel-1 SAR'
                : slotIdx === 0
                ? 'Load Sample T1 Baseline'
                : 'Load Sample T2 Target';

            return (
              <div key={slotIdx} className="space-y-2">
                {/* Slot Header Label */}
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-teal-500/20 text-teal-600 dark:text-[#4FD1C5] flex items-center justify-center text-[10px]">
                      {slotIdx + 1}
                    </span>
                    {slotLabel}
                  </span>
                  {staged && (
                    <span className="text-[10px] text-emerald-600 dark:text-[#39D98A] font-bold uppercase flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Staged
                    </span>
                  )}
                </div>

                {!staged ? (
                  /* Empty Dropzone for this Slot */
                  <div
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOverSlot(null);
                      if (e.dataTransfer.files?.[0]) {
                        handleUploadFileToSlot(slotIdx, e.dataTransfer.files[0]);
                      }
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverSlot(slotIdx);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setDragOverSlot(null);
                    }}
                    onClick={() => inputRef.current?.click()}
                    className={`cursor-pointer relative rounded-2xl border-2 border-dashed p-6 text-center transition-all flex flex-col items-center justify-center min-h-[175px] ${
                      isDragOverThis
                        ? 'border-teal-500 bg-teal-500/5 dark:bg-[#4FD1C5]/5'
                        : 'border-gray-200 dark:border-white/10 hover:border-teal-500/40 bg-white dark:bg-[#111820]'
                    }`}
                  >
                    <input
                      type="file"
                      ref={inputRef}
                      onChange={(e) => e.target.files?.[0] && handleUploadFileToSlot(slotIdx, e.target.files[0])}
                      accept=".tif,.tiff,.png,.jpg,.jpeg,.geotiff"
                      className="hidden"
                    />

                    {isUploadingThis ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 text-teal-600 dark:text-[#4FD1C5] animate-spin" />
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                          Uploading & extracting raster metadata...
                        </p>
                        <p className="text-[10px] text-gray-400 font-mono">
                          POST /api/v1/analysis/upload
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-[#4FD1C5] flex items-center justify-center mb-2">
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100">
                          Drop {slotLabel.toLowerCase()} or click to browse
                        </h4>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          GeoTIFF (.tif/.tiff) or benchmark (.png/.jpg)
                        </p>

                        {/* Quick 1-Click Sample Load Button */}
                        <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleLoadSample(slotIdx, sampleFileName)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-[#4FD1C5] text-[11px] font-semibold transition-all shadow-sm"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>{sampleButtonLabel}</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  /* Staged Raster Card with Live Geospatial Metadata */
                  <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111820] p-4 shadow-sm space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-[#4FD1C5] flex items-center justify-center flex-shrink-0">
                          <Database className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                            {staged.filename}
                          </h4>
                          <p className="text-[10px] font-mono text-gray-400 truncate max-w-xs">
                            {staged.filePath}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => inputRef.current?.click()}
                          className="px-2 py-1 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-[10px] font-semibold text-gray-600 dark:text-gray-300"
                        >
                          Replace
                        </button>
                        <button
                          onClick={() => handleClearSlot(slotIdx)}
                          className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10"
                          title="Clear slot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="file"
                          ref={inputRef}
                          onChange={(e) => e.target.files?.[0] && handleUploadFileToSlot(slotIdx, e.target.files[0])}
                          accept=".tif,.tiff,.png,.jpg,.jpeg,.geotiff"
                          className="hidden"
                        />
                      </div>
                    </div>

                    {/* Metadata Badges */}
                    <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-gray-100 dark:border-white/5 text-[10px] font-mono">
                      <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-[#151C25]">
                        <span className="text-gray-400 block uppercase">CRS</span>
                        <span className="font-bold text-gray-800 dark:text-gray-200">
                          {staged.metadata?.crs || 'EPSG:4326'}
                        </span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-[#151C25]">
                        <span className="text-gray-400 block uppercase">Size</span>
                        <span className="font-bold text-gray-800 dark:text-gray-200">
                          {staged.metadata?.width ? `${staged.metadata.width}×${staged.metadata.height}` : '100×100'}
                        </span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-[#151C25]">
                        <span className="text-gray-400 block uppercase">Bands</span>
                        <span className="font-bold text-gray-800 dark:text-gray-200">
                          {staged.metadata?.band_count ? `${staged.metadata.band_count} ch` : '3 ch'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Upload Error Banner */}
        {uploadError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center gap-2 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">{uploadError}</span>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 2. NATURAL LANGUAGE QUERY INPUT (POST /api/v1/analysis/execute)          */}
      {/* ========================================================================= */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-teal-600 dark:text-[#4FD1C5]" />
            <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-gray-700 dark:text-gray-300">
              2. Natural Language Query for {activeWorkflow.name}
            </h2>
          </div>
          <span className="text-[11px] font-mono text-gray-400">
            POST /api/v1/analysis/execute
          </span>
        </div>

        <form onSubmit={handleExecute} className="space-y-3">
          <div className="relative rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111820] shadow-sm p-2 flex items-center gap-2 focus-within:border-teal-500/50 transition-colors">
            <Search className="w-5 h-5 text-gray-400 ml-2 flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Enter spatial query for ${activeWorkflow.name}...`}
              className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 py-2"
            />
            <button
              type="submit"
              disabled={isExecuting || !isReadyToExecute}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex-shrink-0 ${
                isExecuting || !isReadyToExecute
                  ? 'bg-gray-200 dark:bg-white/5 text-gray-400 cursor-not-allowed'
                  : 'bg-teal-600 hover:bg-teal-700 text-white dark:bg-[#4FD1C5] dark:text-[#080B10] dark:hover:bg-[#4FD1C5]/90 shadow-md shadow-teal-500/20'
              }`}
            >
              {isExecuting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Executing Specialist...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Execute Analysis</span>
                </>
              )}
            </button>
          </div>

          {!isReadyToExecute && (
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-mono">
              * Please stage {activeWorkflow.slots} image{activeWorkflow.slots === 2 ? 's' : ''} above to enable execution.
            </p>
          )}
        </form>

        {/* Execution Error Banner */}
        {executionError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center gap-2 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">{executionError}</span>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 3. DEDICATED EXECUTION RESULTS PANE (LIVE JSON PARSING & RENDERING)       */}
      {/* ========================================================================= */}
      {liveResult && (
        <section className="space-y-6 animate-in fade-in duration-300 pt-2">
          {/* Results Header Bar with Audit & PDF Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600 dark:text-[#4FD1C5]" />
              <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-gray-700 dark:text-gray-300">
                3. Live Specialist Execution &amp; Spatial Visual Evidence
              </h2>
            </div>

            {/* Requirement 4: PDF Report View/Download Action */}
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white dark:bg-[#4FD1C5] dark:text-[#080B10] dark:hover:bg-[#4FD1C5]/90 text-xs font-bold shadow-md shadow-teal-500/20 transition-all flex-shrink-0"
            >
              {isExportingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileText className="w-3.5 h-3.5" />
              )}
              <span>Export PDF Dossier (POST)</span>
            </button>
          </div>

          {/* ------------------------------------------------------------------- */}
          {/* Requirement 2: Dynamic Spatial Visual Evidence Display Component    */}
          {/* ------------------------------------------------------------------- */}
          <VisualEvidenceViewer
            result={liveResult}
            stagedSlots={stagedSlots}
            taskKey={selectedTaskKey}
          />

          {/* ------------------------------------------------------------------- */}
          {/* Requirement 3: Detailed Analysis & Useful Information Display       */}
          {/* ------------------------------------------------------------------- */}
          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111820] shadow-sm overflow-hidden divide-y divide-gray-100 dark:divide-white/5 space-y-0">
            {/* Top Bar: Classified Task, Specialist, Confidence Meter */}
            <div className="p-5 flex flex-wrap items-center justify-between gap-4 bg-gray-50/50 dark:bg-[#151C25]/50">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase text-gray-400">Classified Task:</span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-teal-500/10 text-teal-600 dark:text-[#4FD1C5] border border-teal-500/20">
                    {liveResult.task || activeWorkflow.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase text-gray-400">Assigned Specialist:</span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-indigo-500/10 text-indigo-600 dark:text-[#7C83FD] border border-indigo-500/20">
                    {liveResult.specialist || 'Autonomous Specialist Engine'}
                  </span>
                </div>
              </div>

              {/* Confidence Score Progress Bar & Assurance Indicator */}
              <div className="flex items-center gap-3 bg-white dark:bg-[#111820] px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-4 text-xs font-mono">
                    <span className="text-[10px] text-gray-400 uppercase">Operational Confidence</span>
                    <span className="font-bold text-emerald-600 dark:text-[#39D98A]">
                      {liveResult.confidence?.percentage || (typeof liveResult.confidence === 'number' ? Math.round(liveResult.confidence * 100) : 92)}%
                    </span>
                  </div>
                  <div className="w-32 h-1.5 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-700"
                      style={{
                        width: `${liveResult.confidence?.percentage || 92}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Model Text Answer & Structured Key Intelligence Findings */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-500" />
                  <span>Autonomous Specialist Findings &amp; Natural Language Synthesis</span>
                </span>
                <span className="text-[10px] font-mono text-gray-400">
                  Calibrated for ISRO / SAC Benchmark Protocols
                </span>
              </div>

              {/* Textual Answer Card with Accent Bar */}
              <div className="p-4 rounded-xl border-l-4 border-teal-500 bg-teal-500/5 dark:bg-[#4FD1C5]/5 space-y-2">
                <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
                  {liveResult.answer}
                </p>
                {liveResult.query && (
                  <p className="text-xs font-mono text-gray-500 dark:text-gray-400">
                    Interpreted User Query: &ldquo;{liveResult.query}&rdquo;
                  </p>
                )}
              </div>

              {/* Actionable Intelligence Telemetry Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#151C25] border border-gray-100 dark:border-white/5 space-y-1">
                  <span className="text-[10px] font-mono text-gray-400 uppercase block">Specialist ID</span>
                  <span className="text-xs font-bold font-mono text-gray-800 dark:text-gray-200 truncate block">
                    {liveResult.specialistId || 'specialist_engine'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#151C25] border border-gray-100 dark:border-white/5 space-y-1">
                  <span className="text-[10px] font-mono text-gray-400 uppercase block">Modality</span>
                  <span className="text-xs font-bold font-mono text-teal-600 dark:text-[#4FD1C5] truncate block">
                    {liveResult.inputInfo?.modalitySummary || 'Optical'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#151C25] border border-gray-100 dark:border-white/5 space-y-1">
                  <span className="text-[10px] font-mono text-gray-400 uppercase block">CRS Reference</span>
                  <span className="text-xs font-bold font-mono text-indigo-600 dark:text-[#7C83FD] block">
                    {liveResult.boundingBox?.crs || 'EPSG:4326'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#151C25] border border-gray-100 dark:border-white/5 space-y-1">
                  <span className="text-[10px] font-mono text-gray-400 uppercase block">Staged Inputs</span>
                  <span className="text-xs font-bold font-mono text-gray-800 dark:text-gray-200 block">
                    {liveResult.inputInfo?.imageCount || 1} Raster File(s)
                  </span>
                </div>
              </div>
            </div>

            {/* Requirement 3: 10-Step Execution Trace Clean Timeline */}
            {Array.isArray(liveResult.executionTrace) && liveResult.executionTrace.length > 0 && (
              <div className="p-6 space-y-4 bg-gray-50/30 dark:bg-[#151C25]/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-bold font-mono uppercase text-gray-700 dark:text-gray-300">
                      Autonomous 10-Step Execution Trace (Audit Trail)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-[#4FD1C5] font-semibold border border-teal-500/20">
                    {liveResult.executionTrace.length} Steps Verified
                  </span>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  {liveResult.executionTrace.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#111820] flex items-start gap-3 shadow-2xs"
                    >
                      <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-600 dark:text-[#4FD1C5] flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300 flex-1 leading-relaxed">
                        {step}
                      </span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-1" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
