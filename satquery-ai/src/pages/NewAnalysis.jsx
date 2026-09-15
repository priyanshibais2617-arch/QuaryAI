import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Layers,
  ShieldCheck,
  CheckCircle2,
  FileText,
  RefreshCw,
  Eye,
  Info,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import ProgressSteps from '../components/analysis/ProgressSteps';
import WorkflowSelector from '../components/analysis/WorkflowSelector';
import UploadZone from '../components/analysis/UploadZone';
import ValidationPanel from '../components/analysis/ValidationPanel';
import QueryInput from '../components/analysis/QueryInput';
import DemoScenarioSelector from '../components/demo/DemoScenarioSelector';
import Modal from '../components/ui/Modal';
import { useAnalysis } from '../context/AnalysisContext';
import { useToast } from '../hooks/useToast';
import { DEMO_SCENARIOS } from '../data/mockData';
import { inspectAgentDecision } from '../services/mockAgentService';

export default function NewAnalysis({ onNavigate }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [previewFile, setPreviewFile] = useState(null);
  const [activePresetKey, setActivePresetKey] = useState('bitemporal');

  const {
    analysisType,
    setAnalysisType,
    changeAnalysisType,
    scenarioKey,
    stagedFiles,
    addFile,
    setSlotFile,
    updateFileModality,
    updateFileBenchmarkSource,
    clearStagedFiles,
    removeFile,
    query,
    setQuery,
    validationStatus,
    validateInputs,
    loadScenario,
  } = useAnalysis();

  const { toast } = useToast();

  const ALLOWED_BENCHMARKS = ['BigEarthNet', 'VRSBench', 'RSVQA', 'CDVQA'];

  // Validate requirement per mode
  const getStep1Readiness = () => {
    const hasUntaggedPngJpg = stagedFiles.some((f) => {
      const fname = (f.name || '').toLowerCase();
      const ext = fname.substring(fname.lastIndexOf('.'));
      const isPngJpg = ext === '.png' || ext === '.jpg' || ext === '.jpeg';
      const bSource = f.benchmarkSource || f.benchmark_source;
      return isPngJpg && (!bSource || !ALLOWED_BENCHMARKS.includes(bSource));
    });

    if (hasUntaggedPngJpg) {
      return { canContinue: false, label: 'Select Benchmark Source for PNG/JPEG to Continue' };
    }

    if (analysisType === 'single') {
      if (stagedFiles.length === 0) return { canContinue: false, label: 'Upload 1 Image to Continue' };
      return { canContinue: true, label: 'Continue to Validation →' };
    }
    if (analysisType === 'bitemporal') {
      if (stagedFiles.length === 0) return { canContinue: false, label: 'Upload Before & After Images to Continue' };
      if (stagedFiles.length === 1) return { canContinue: false, label: 'Upload After Image to Continue (1 of 2 staged)' };
      return { canContinue: true, label: 'Continue to Validation →' };
    }
    if (analysisType === 'optical_sar') {
      if (stagedFiles.length === 0) return { canContinue: false, label: 'Upload Optical & SAR Images to Continue' };
      if (stagedFiles.length === 1) return { canContinue: false, label: 'Upload Second Sensor to Continue (1 of 2 staged)' };
      return { canContinue: true, label: 'Continue to Validation →' };
    }
    return { canContinue: stagedFiles.length > 0, label: 'Continue to Validation →' };
  };

  const readiness = getStep1Readiness();

  const handleNext = () => {
    if (currentStep === 1) {
      const untaggedFile = stagedFiles.find((f) => {
        const fname = (f.name || '').toLowerCase();
        const ext = fname.substring(fname.lastIndexOf('.'));
        const isPngJpg = ext === '.png' || ext === '.jpg' || ext === '.jpeg';
        const bSource = f.benchmarkSource || f.benchmark_source;
        return isPngJpg && (!bSource || !ALLOWED_BENCHMARKS.includes(bSource));
      });

      if (untaggedFile) {
        toast.warning(
          `"${untaggedFile.name}" is a PNG/JPEG image. Please select an approved benchmark dataset (BigEarthNet, VRSBench, RSVQA, CDVQA) before continuing.`,
          'Benchmark Tag Required'
        );
        return;
      }

      if (!readiness.canContinue) {
        if (analysisType === 'single') {
          toast.warning('Please upload a satellite image before proceeding.', 'Image Required');
        } else if (analysisType === 'bitemporal') {
          toast.warning('Bi-temporal analysis requires two images (Before & After).', 'Two Images Required');
        } else {
          toast.warning('Optical + SAR analysis requires both optical and SAR inputs.', 'Two Modalities Required');
        }
        return;
      }
      validateInputs(stagedFiles, analysisType, query);
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {

      if (!query.trim()) {
        toast.warning('Please enter a query or question to analyze.', 'Query Required');
        return;
      }

      // Input Validation Tests (Section 40)
      const inspection = inspectAgentDecision(query, stagedFiles, { pairType: analysisType });
      const imageCount = stagedFiles.length;

      // 1. One image + bi-temporal query
      if ((inspection.routing.taskKey === 'CHANGE_ANALYSIS' || inspection.routing.taskKey === 'CHANGE_VQA') && imageCount < 2) {
        toast.error('Bi-temporal analysis requires two images.', 'Input Validation Notice');
        return;
      }

      // 2. Optical + SAR query + only optical image
      if (inspection.routing.taskKey === 'OPTICAL_SAR_ANALYSIS' && (!inspection.inputInfo.hasSAR || imageCount < 2)) {
        toast.error('Optical + SAR analysis requires both optical and SAR inputs.', 'Sensor Modality Mismatch');
        return;
      }

      // 3. Grounding query without image
      if (inspection.routing.taskKey === 'GROUNDING' && imageCount === 0) {
        toast.error('An image is required for grounding.', 'Image Required');
        return;
      }

      onNavigate('processing');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSelectPreset = (key) => {
    setActivePresetKey(key);
    loadScenario(key);
    toast.info(`Configured benchmark scenario: ${key.toUpperCase()}`, 'Preset Activated');
  };

  const activeScenario = DEMO_SCENARIOS[scenarioKey] || DEMO_SCENARIOS['bitemporal'];

  return (
    <div className="space-y-6">
      {/* Header & Quick Scenario Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-white/10">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-[#F5F7FA]">
            Configure Satellite Analysis
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Stage satellite scenes, verify spatial alignment, and query with natural language.
          </p>
        </div>

        {/* SIH Fast Jump to Playground */}
        <button
          onClick={() => onNavigate('agent-demo')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-600 dark:text-[#4FD1C5] hover:bg-teal-500/20 text-xs font-mono font-bold transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>SIH Agent Playground &rarr;</span>
        </button>
      </div>

      {/* 1-Click Demo Presets Bar */}
      <DemoScenarioSelector
        activeScenarioKey={activePresetKey}
        onSelectScenario={handleSelectPreset}
      />

      {/* Progress Stepper */}
      <div className="bg-white dark:bg-[#111820] p-4 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
        <ProgressSteps
          currentStep={currentStep}
          onStepClick={(step) => {
            // Only allow jumping forward if step 1 is satisfied
            if (step > 1 && !readiness.canContinue) {
              toast.warning('Please stage the required images for this mode first.', 'Step Incomplete');
              return;
            }
            setCurrentStep(step);
          }}
        />
      </div>

      {/* STEP 1: Input Setup & Upload */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <WorkflowSelector
            selectedType={analysisType}
            onSelectType={(type) => {
              if (changeAnalysisType) {
                changeAnalysisType(type);
              } else {
                setAnalysisType(type);
                validateInputs(stagedFiles, type, query);
              }
            }}
          />

          {/* Staging & Upload Slots */}
          <div className="p-6 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111820] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-white/10">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Stage Satellite Imagery
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {analysisType === 'single'
                    ? 'Upload 1 scene for single-image VQA, captioning, or visual grounding'
                    : analysisType === 'bitemporal'
                    ? 'Upload 2 spatially matching scenes (Baseline T1 & Target T2) for change detection'
                    : 'Upload 1 Optical and 1 SAR microwave radar scene for cross-modal fusion'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => loadScenario(scenarioKey)}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono text-teal-600 dark:text-[#4FD1C5] hover:bg-teal-500/10 border border-teal-500/20 transition-colors flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reload Preset Files</span>
                </button>
              </div>
            </div>

            {/* Modular Slot-based UploadZone */}
            <UploadZone
              analysisType={analysisType}
              stagedFiles={stagedFiles}
              onAddFile={addFile}
              onSetSlotFile={setSlotFile}
              onRemoveFile={removeFile}
              onPreviewFile={(f) => setPreviewFile(f)}
              onUpdateModality={updateFileModality}
              onUpdateBenchmarkSource={updateFileBenchmarkSource}
              onClearAll={clearStagedFiles}
            />

          </div>
        </div>
      )}

      {/* STEP 2: Input Validation */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <ValidationPanel
            validationStatus={validationStatus}
            onRevalidate={() => validateInputs(stagedFiles, analysisType, query)}
            onReplaceImage={() => setCurrentStep(1)}
          />

          <div className="p-5 rounded-2xl border border-teal-500/20 bg-teal-500/5 text-xs space-y-2">
            <h4 className="font-bold text-teal-800 dark:text-[#4FD1C5] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Automated Agent Readiness Summary
            </h4>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Spatial extent intersection is confirmed at 98.6%. Projection geometries (EPSG:32643) and ground resolution grids (10.0m GSD) have been normalized. Staged imagery is certified ready for agentic execution.
            </p>
          </div>
        </div>
      )}

      {/* STEP 3: Natural Language Query */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <QueryInput
            query={query}
            setQuery={setQuery}
            onSubmit={handleNext}
            isSubmitting={false}
            suggestedQueries={activeScenario.suggestedQueries || []}
          />
        </div>
      )}

      {/* Bottom Navigation Buttons */}
      <div className="pt-4 border-t border-gray-200 dark:border-white/10 flex items-center justify-between">
        {currentStep > 1 ? (
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        ) : (
          <div />
        )}

        <button
          onClick={handleNext}
          disabled={currentStep === 1 ? !readiness.canContinue : currentStep === 3 ? !query.trim() : false}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all ${
            (currentStep === 1 && !readiness.canContinue) || (currentStep === 3 && !query.trim())
              ? 'bg-gray-200 text-gray-400 dark:bg-white/5 dark:text-gray-500 cursor-not-allowed border border-gray-300/50 dark:border-white/10 shadow-none'
              : 'bg-teal-600 hover:bg-teal-700 text-white dark:bg-[#4FD1C5] dark:text-[#080B10] dark:hover:bg-[#4FD1C5]/90 shadow-teal-500/20'
          }`}
        >
          <span>
            {currentStep === 1
              ? readiness.label
              : currentStep === 2
              ? 'Continue to Query →'
              : 'Run Agentic Analysis →'}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Raster Preview Modal */}
      <Modal
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
        title={previewFile?.name || 'Satellite Raster Preview'}
        subtitle={`${previewFile?.modality || 'Multi-band'} • Client-side Buffer`}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          <div className="h-80 w-full bg-black rounded-xl overflow-hidden flex items-center justify-center border border-gray-200 dark:border-white/10">
            {previewFile?.preview && (
              <img
                src={previewFile.preview}
                alt={previewFile.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="flex items-center justify-between text-xs font-mono text-gray-400">
            <span>Size: {previewFile?.size ? (previewFile.size / (1024 * 1024)).toFixed(1) + ' MB' : '38 MB'}</span>
            <span className="text-teal-500">Co-registered &amp; Calibrated</span>
          </div>
        </div>
      </Modal>
    </div>
  );
}
