import React, { useState } from 'react';
import {
  Bot,
  Play,
  Sparkles,
  Layers,
  Eye,
  Radio,
  FileText,
  RotateCcw,
  CheckCircle2,
  Cpu,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import DemoScenarioSelector from './DemoScenarioSelector';
import AgentDecisionCard from '../agent/AgentDecisionCard';
import ExecutionTrace from '../agent/ExecutionTrace';
import WorkflowVisualization from '../agent/WorkflowVisualization';
import RemoteSensingAdaptationCard from '../agent/RemoteSensingAdaptationCard';
import EvidencePanel from '../results/EvidencePanel';
import ConfidenceDisplay from '../results/ConfidenceDisplay';
import { runAgentDemo, inspectAgentDecision } from '../../services/mockAgentService';
import { getSatelliteSvgUrl } from '../../utils/satelliteGenerators';
import { useToast } from '../../hooks/useToast';

export default function AgentPlayground({ onNavigate }) {
  const { toast } = useToast();

  // Playground state
  const [selectedScenarioKey, setSelectedScenarioKey] = useState('vqa');
  const [query, setQuery] = useState('Describe the land cover and major objects visible in this image.');
  const [imageCount, setImageCount] = useState(1);
  const [modalities, setModalities] = useState(['Optical']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [agentResult, setAgentResult] = useState(null);

  // Pre-configured preset data
  const presetMap = {
    vqa: {
      query: 'Describe the land cover and major objects visible in this image.',
      count: 1,
      modalities: ['Optical'],
      inputs: [{ name: 'Mumbai_TrueColor_Optical.tif', modality: 'Optical' }],
      pairType: 'single',
    },
    grounding: {
      query: 'Where is the water body?',
      count: 1,
      modalities: ['Multispectral'],
      inputs: [{ name: 'Bengaluru_Reservoir_Landsat9.png', modality: 'Multispectral' }],
      pairType: 'single',
    },
    captioning: {
      query: 'Describe the scene in detail.',
      count: 1,
      modalities: ['Optical'],
      inputs: [{ name: 'PeriUrban_Mosaic_SuperDove.tif', modality: 'Optical' }],
      pairType: 'single',
    },
    bitemporal: {
      query: 'What changed between these two dates?',
      count: 2,
      modalities: ['Optical', 'Optical'],
      inputs: [
        { name: 'Delhi_NCR_T1_2024.tif', modality: 'Optical' },
        { name: 'Delhi_NCR_T2_2026.tif', modality: 'Optical' }
      ],
      pairType: 'bitemporal',
    },
    optical_sar: {
      query: 'Use the optical and SAR images together to identify built-up and water-covered regions.',
      count: 2,
      modalities: ['Optical', 'SAR'],
      inputs: [
        { name: 'Kolkata_Delta_Optical_Sentinel2.tif', modality: 'Optical' },
        { name: 'Kolkata_Delta_SAR_Sentinel1.tif', modality: 'SAR' }
      ],
      pairType: 'optical_sar',
    },
  };

  const handleSelectPreset = (key) => {
    const preset = presetMap[key];
    if (!preset) return;

    setSelectedScenarioKey(key);
    setQuery(preset.query);
    setImageCount(preset.count);
    setModalities(preset.modalities);
    setAgentResult(null);
    toast.info(`Configured demo scenario for ${key.toUpperCase()}.`, 'Preset Staged');
  };

  const handleRunDemo = async () => {
    if (!query.trim()) {
      toast.warning('Please provide an inquiry for the agent to analyze.', 'Query Required');
      return;
    }

    setIsProcessing(true);
    try {
      const simulatedInputs = Array.from({ length: imageCount }, (_, idx) => ({
        id: `demo-img-${idx + 1}`,
        name: `Raster_Channel_${idx + 1}.tif`,
        modality: modalities[idx] || 'Optical',
      }));

      const result = await runAgentDemo({
        query,
        inputs: simulatedInputs,
        inputConfiguration: {
          pairType: imageCount === 2 && modalities.includes('SAR') ? 'optical_sar' : imageCount === 2 ? 'bitemporal' : 'single',
        },
      });

      setAgentResult(result);
      toast.success('Agent completed autonomous execution trace.', 'Inference Complete');
    } catch (err) {
      toast.error('Agent encountered an issue while evaluating pipeline.', 'Error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Inspect preliminary decision preview
  const previewDecision = inspectAgentDecision(
    query,
    Array.from({ length: imageCount }, (_, idx) => ({ modality: modalities[idx] || 'Optical' })),
    { pairType: imageCount === 2 && modalities.includes('SAR') ? 'optical_sar' : imageCount === 2 ? 'bitemporal' : 'single' }
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase text-teal-600 dark:text-[#4FD1C5]">
              SIH Evaluator Sandbox
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-xs font-mono text-gray-500">Autonomous Orchestration Playground</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-[#F5F7FA] mt-0.5">
            Agentic AI Playground &amp; Engine Inspector
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Evaluate how SatQuery AI deterministically parses natural queries, determines tasks, routes workflows, and isolates spatial evidence.
          </p>
        </div>

        {/* Prototype disclaimer pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs font-mono text-teal-700 dark:text-[#4FD1C5]">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <span>PROTOTYPE MODE: SIMULATED RS SPECIALISTS</span>
        </div>
      </div>

      {/* 1-Click Preset Scenario Buttons */}
      <DemoScenarioSelector
        activeScenarioKey={selectedScenarioKey}
        onSelectScenario={handleSelectPreset}
      />

      {/* Playground Config Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Input Configuration & Query */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111820] shadow-sm space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
              <span>Input Simulation Setup</span>
              <span className="text-teal-600 dark:text-[#4FD1C5] font-sans lowercase font-normal">
                {imageCount} image{imageCount > 1 ? 's' : ''} staged
              </span>
            </h3>

            {/* Image Count & Modality Controls */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 dark:text-gray-300">Staged Images</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setImageCount(1);
                      setModalities(['Optical']);
                    }}
                    className={`flex-1 py-1.5 rounded-lg border font-mono font-semibold transition-all ${
                      imageCount === 1
                        ? 'bg-teal-500/10 border-teal-500 text-teal-600 dark:text-[#4FD1C5]'
                        : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500'
                    }`}
                  >
                    1 Scene
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImageCount(2);
                      setModalities(['Optical', 'Optical']);
                    }}
                    className={`flex-1 py-1.5 rounded-lg border font-mono font-semibold transition-all ${
                      imageCount === 2
                        ? 'bg-teal-500/10 border-teal-500 text-teal-600 dark:text-[#4FD1C5]'
                        : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500'
                    }`}
                  >
                    2 Scenes
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 dark:text-gray-300">Sensor Mix</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setModalities(imageCount === 2 ? ['Optical', 'Optical'] : ['Optical'])}
                    className={`flex-1 py-1.5 rounded-lg border font-mono font-semibold transition-all ${
                      !modalities.includes('SAR')
                        ? 'bg-teal-500/10 border-teal-500 text-teal-600 dark:text-[#4FD1C5]'
                        : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500'
                    }`}
                  >
                    Optical
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImageCount(2);
                      setModalities(['Optical', 'SAR']);
                    }}
                    className={`flex-1 py-1.5 rounded-lg border font-mono font-semibold transition-all ${
                      modalities.includes('SAR')
                        ? 'bg-teal-500/10 border-teal-500 text-teal-600 dark:text-[#4FD1C5]'
                        : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500'
                    }`}
                  >
                    Opt + SAR
                  </button>
                </div>
              </div>
            </div>

            {/* Query Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center justify-between">
                <span>Natural Language Query</span>
                <span className="text-[10px] text-gray-400 font-mono">No Manual Model Selection</span>
              </label>
              <textarea
                rows={3}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask any remote sensing question..."
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-[#151C25] text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none font-sans"
              />
            </div>

            {/* Run Button */}
            <button
              onClick={handleRunDemo}
              disabled={isProcessing}
              className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white dark:bg-[#4FD1C5] dark:text-[#080B10] dark:hover:bg-[#4FD1C5]/90 font-bold text-xs shadow-md shadow-teal-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isProcessing ? 'Executing Agent Pipeline...' : 'Run Autonomous Agent Demo'}</span>
            </button>
          </div>

          {/* Preliminary Decision Preview Card */}
          <div className="p-4 rounded-2xl border border-gray-200/80 dark:border-white/5 bg-gray-50/50 dark:bg-[#111820]/60 text-xs space-y-2">
            <span className="text-[10px] font-mono uppercase font-bold text-gray-400 tracking-wider block">
              Static Router Prediction
            </span>
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="text-gray-500">PREDICTED TASK:</span>
              <span className="font-bold text-teal-600 dark:text-[#4FD1C5]">{previewDecision.routing.task}</span>
            </div>
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="text-gray-500">ASSIGNED SPECIALIST:</span>
              <span className="font-bold text-gray-800 dark:text-gray-200 truncate ml-2">{previewDecision.routing.specialistName}</span>
            </div>

            {previewDecision.routing.warnings.length > 0 && (
              <div className="pt-2 text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{previewDecision.routing.warnings[0]}</span>
              </div>
            )}
          </div>

          {/* Domain adaptation component */}
          <RemoteSensingAdaptationCard />
        </div>

        {/* RIGHT COLUMN: Live Execution Results */}
        <div className="lg:col-span-7 space-y-5">
          {/* Active Workflow Visualization */}
          <WorkflowVisualization
            task={agentResult?.task || previewDecision.routing.task}
            specialist={agentResult?.specialist || previewDecision.routing.specialistName}
          />

          {agentResult ? (
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* Agent Decision Inferred */}
              <AgentDecisionCard
                task={agentResult.task}
                workflow={agentResult.workflow}
                specialist={agentResult.specialist}
                reason={agentResult.reason}
              />

              {/* AI Answer & Findings */}
              <div className="p-5 rounded-2xl border border-teal-500/20 bg-white dark:bg-[#111820] shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-teal-600 dark:text-[#4FD1C5]">
                    Agent Synthesis Findings
                  </span>
                  <ConfidenceDisplay confidence={agentResult.confidence} />
                </div>

                <p className="text-sm font-semibold text-gray-900 dark:text-white leading-relaxed">
                  {agentResult.answer}
                </p>
              </div>

              {/* Task-Specific Evidence Display */}
              <div className="p-5 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111820] shadow-sm space-y-4">
                <EvidencePanel
                  result={agentResult}
                  imageSrc={
                    agentResult.taskKey === 'GROUNDING' ? getSatelliteSvgUrl('grounding-target') :
                    getSatelliteSvgUrl('optical-target')
                  }
                  imageSrcA={getSatelliteSvgUrl('optical-baseline')}
                  imageSrcB={getSatelliteSvgUrl('optical-highlight')}
                  imageSrcOptical={getSatelliteSvgUrl('optical-baseline')}
                  imageSrcSAR={getSatelliteSvgUrl('sar-radar')}
                />
              </div>

              {/* Auditable Execution Trace */}
              <ExecutionTrace trace={agentResult.executionTrace} defaultExpanded={true} />
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl border border-dashed border-gray-200 dark:border-white/10 bg-white/50 dark:bg-[#111820]/50 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-[#4FD1C5] mx-auto flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                Playground Standing By
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                Click <strong>Run Autonomous Agent Demo</strong> or select one of the 1-click presets above to observe automatic query understanding, specialist dispatch, and evidence generation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
