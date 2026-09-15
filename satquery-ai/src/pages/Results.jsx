import React, { useState } from 'react';
import {
  Sparkles,
  Download,
  Bookmark,
  RotateCcw,
  CheckCircle2,
  Cpu,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
import ResultCard from '../components/results/ResultCard';
import ResultSummary from '../components/results/ResultSummary';
import EvidencePanel from '../components/results/EvidencePanel';
import ConfidenceDisplay from '../components/results/ConfidenceDisplay';
import AgentDecisionCard from '../components/agent/AgentDecisionCard';
import ExecutionTrace from '../components/agent/ExecutionTrace';
import RemoteSensingAdaptationCard from '../components/agent/RemoteSensingAdaptationCard';
import Modal from '../components/ui/Modal';
import { useAnalysis } from '../context/AnalysisContext';
import { useToast } from '../hooks/useToast';
import { DEMO_SCENARIOS } from '../data/mockData';
import { getSatelliteSvgUrl } from '../utils/satelliteGenerators';
import confetti from 'canvas-confetti';

export default function Results({ onNavigate }) {
  const { activeResult, scenarioKey, query, stagedFiles, saveCurrentAnalysisToHistory } = useAnalysis();
  const { toast } = useToast();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [showAdaptationDetails, setShowAdaptationDetails] = useState(false);

  // Fallback to scenario if activeResult is not yet set
  const fallbackScenario = DEMO_SCENARIOS[scenarioKey] || DEMO_SCENARIOS['bitemporal'];
  const res = activeResult || fallbackScenario;

  const currentTask = res.task || fallbackScenario.task;
  const currentWorkflow = res.workflow || fallbackScenario.workflow;
  const currentSpecialist = res.specialist || res.specialistTool || fallbackScenario.specialistTool;
  const currentReason = res.reason || 'Autonomous agentic pipeline mapped to remote-sensing domain specialist.';
  const currentConfidence = res.confidence?.percentage || (typeof res.confidence === 'number' ? Math.round(res.confidence * 100) : 91);
  const currentAnswer = res.answer || fallbackScenario.answer;

  const handleExport = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch (e) {}

    setIsExportModalOpen(true);
  };

  const handleSaveToHistory = () => {
    saveCurrentAnalysisToHistory(res);
    toast.success('Analysis result pinned to your personal session archive.', 'Saved to History');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase text-teal-600 dark:text-[#4FD1C5]">
              Mission Accomplished
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-xs font-mono text-gray-500">Autonomous Agent Inference</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-[#F5F7FA] mt-0.5">
            Analysis Findings &amp; Visual Evidence
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSaveToHistory}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Save to History</span>
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white dark:bg-[#4FD1C5] dark:text-[#080B10] dark:hover:bg-[#4FD1C5]/90 text-xs font-bold shadow-md shadow-teal-500/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>

          <button
            onClick={() => onNavigate('analysis')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-teal-500/30 text-teal-600 dark:text-[#4FD1C5] hover:bg-teal-500/10 text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Query</span>
          </button>
        </div>
      </div>

      {/* Prototype Mode Subtle Disclaimer */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-teal-500/5 dark:bg-[#4FD1C5]/5 border border-teal-500/20 text-xs text-teal-800 dark:text-[#4FD1C5]/90">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 flex-shrink-0 text-teal-600 dark:text-[#4FD1C5]" />
          <span>
            <strong>Prototype Mode:</strong> AI responses, specialist workflows, and confidence metrics are simulated for this demonstration.
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 uppercase tracking-wider font-bold">
          SIH Prototype
        </span>
      </div>

      {/* Autonomous Agent Decision Card */}
      <AgentDecisionCard
        task={currentTask}
        workflow={currentWorkflow}
        specialist={currentSpecialist}
        reason={currentReason}
      />

      {/* AI Answer & Findings */}
      <ResultCard
        query={query || res.query || fallbackScenario.query}
        answer={currentAnswer}
        confidence={currentConfidence}
        badge={res.taskKey || res.task || fallbackScenario.badge}
        type={res.inputInfo?.modalitySummary || fallbackScenario.type}
      />

      {/* Confidence Meter */}
      <ConfidenceDisplay
        confidence={currentConfidence}
        label="Confidence Score"
      />

      {/* Result Metrics Summary Cards */}
      <ResultSummary summaryCards={res.summaryCards || fallbackScenario.summaryCards} />

      {/* Task-Specific Evidence Section */}
      <div className="p-5 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111820] shadow-sm space-y-4">
        <EvidencePanel
          result={res}
          imageSrc={
            res.taskKey === 'GROUNDING' || scenarioKey === 'grounding'
              ? getSatelliteSvgUrl('grounding-target')
              : getSatelliteSvgUrl('optical-target')
          }
          imageSrcA={getSatelliteSvgUrl('optical-baseline')}
          imageSrcB={getSatelliteSvgUrl('optical-highlight')}
          imageSrcOptical={getSatelliteSvgUrl('optical-baseline')}
          imageSrcSAR={getSatelliteSvgUrl('sar-radar')}
        />
      </div>

      {/* Auditable Execution Trace (Expandable) */}
      <ExecutionTrace
        trace={res.executionTrace || [
          { title: 'Input received', detail: 'Staged satellite raster scene(s).', status: 'completed' },
          { title: 'Input validated', detail: 'Projection geometries & GSD verified.', status: 'completed' },
          { title: 'Modality identified', detail: 'Optical / Multispectral / SAR identified.', status: 'completed' },
          { title: 'Query understood', detail: 'Extracted semantic query intention.', status: 'completed' },
          { title: 'Task classified', detail: `Classified as ${currentTask}.`, status: 'completed' },
          { title: 'Workflow selected', detail: `Selected ${currentWorkflow}.`, status: 'completed' },
          { title: 'Specialist selected', detail: `Dispatched to ${currentSpecialist}.`, status: 'completed' },
          { title: 'Specialist executed', detail: 'Model inference completed.', status: 'completed' },
          { title: 'Evidence prepared', detail: 'Spatial bounding & masks synthesized.', status: 'completed' },
          { title: 'Result integrated', detail: 'Payload normalized and signed.', status: 'completed' },
        ]}
        defaultExpanded={false}
      />

      {/* Remote-Sensing Domain Adaptation Architecture (Collapsible) */}
      <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111820] overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={() => setShowAdaptationDetails(!showAdaptationDetails)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-[#F5F7FA]">
                Remote-Sensing Domain Adaptation Details
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                BigEarthNet foundation pre-training &amp; specialist fine-tuning architecture
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
            <span>{showAdaptationDetails ? 'Hide Architecture' : 'View Architecture'}</span>
            {showAdaptationDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>
        {showAdaptationDetails && (
          <div className="p-4 pt-0 border-t border-gray-100 dark:border-white/5">
            <RemoteSensingAdaptationCard />
          </div>
        )}
      </div>

      {/* Export Report Dialog */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Analysis Report"
        subtitle="Generate signed Earth Observation executive summary"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4 text-xs text-gray-600 dark:text-gray-300">
          <p className="leading-relaxed">
            Your simulated mission report has been synthesized. It includes all differential rasters, calibrated prototype confidence bounds ({currentConfidence}%), and spatial bounding envelopes.
          </p>

          <div className="p-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#151C25] space-y-1 font-mono text-[11px]">
            <div className="text-gray-400">DOCUMENT ID: SATQUERY-REP-2026-039</div>
            <div className="text-gray-400">TASK: {currentTask}</div>
            <div className="text-gray-400">ENGINE: {currentSpecialist}</div>
            <div className="text-emerald-500 font-bold">STATUS: READY TO DOWNLOAD</div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              onClick={() => setIsExportModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 font-semibold text-xs text-gray-700 dark:text-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setIsExportModalOpen(false);
                toast.success('Simulated PDF report downloaded to your local device.', 'Download Complete');
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white dark:bg-[#4FD1C5] dark:text-[#080B10] font-bold text-xs shadow-md transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF (4.8 MB)</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
