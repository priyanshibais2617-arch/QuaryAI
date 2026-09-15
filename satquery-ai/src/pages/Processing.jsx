import React, { useState, useEffect } from 'react';
import {
  Satellite,
  Cpu,
  CheckCircle2,
  Loader2,
  Sparkles,
  ArrowRight,
  Terminal,
  Activity,
  Layers,
  Radio,
  Eye,
  FastForward,
} from 'lucide-react';
import AgentActivity from '../components/analysis/AgentActivity';
import WorkflowVisualization from '../components/agent/WorkflowVisualization';
import { useAnalysis } from '../context/AnalysisContext';

export default function Processing({ onNavigate }) {
  const {
    activeResult,
    scenarioKey,
    query,
    executeAgentAnalysis,
    saveCurrentAnalysisToHistory
  } = useAnalysis();

  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [progress, setProgress] = useState(15);
  const [logs, setLogs] = useState([
    'Initializing SatQuery Deterministic Agent Controller v3.0...',
    'Analyzing raster inputs, channel metadata, and spatial projection...',
  ]);
  const [resolvedResult, setResolvedResult] = useState(null);

  const steps = [
    { title: 'Input Verification', desc: 'Verify multi-band raster format and coordinate projection alignment' },
    { title: 'Query Semantic Parsing', desc: 'Deconstruct natural language request into geospatial intent tokens' },
    { title: 'Task Classification', desc: 'Classify remote-sensing vision-language task domain' },
    { title: 'Workflow & Specialist Selection', desc: 'Autonomous routing to matching specialist engine' },
    { title: 'Specialist Execution', desc: 'Run domain-adapted vision-language specialist inference' },
    { title: 'Spatial Evidence Synthesis', desc: 'Generate bounding boxes, differential masks, or category breakdown' },
    { title: 'Result Integration', desc: 'Normalize confidence, auditable trace, and response payload' },
  ];

  useEffect(() => {
    let isCancelled = false;

    // Trigger agent execution
    const run = async () => {
      try {
        const result = await executeAgentAnalysis();
        if (!isCancelled) {
          setResolvedResult(result);
        }
      } catch (e) {
        console.error('Agent execution error:', e);
      }
    };
    run();

    const stepDuration = 500;
    const interval = setInterval(() => {
      setCurrentStepIdx((prev) => {
        const next = prev + 1;
        if (next < steps.length) {
          setProgress(Math.round(((next + 1) / steps.length) * 100));
          const newLogEntries = [
            `Verified: ${steps[next - 1].title}`,
            `Executing: ${steps[next].title}...`,
          ];
          setLogs((l) => [...l, ...newLogEntries]);
          return next;
        } else {
          clearInterval(interval);
          setProgress(100);
          setLogs((l) => [
            ...l,
            'Specialist engine executed successfully.',
            'Spatial evidence grounded and calibrated. Transitioning to findings...',
          ]);
          saveCurrentAnalysisToHistory(resolvedResult);
          setTimeout(() => {
            onNavigate('results');
          }, 700);
          return prev;
        }
      });
    }, stepDuration);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, []);

  const handleSkip = () => {
    saveCurrentAnalysisToHistory(resolvedResult);
    onNavigate('results');
  };

  const currentTask = resolvedResult?.task || activeResult?.task || 'Remote-Sensing Understanding';
  const currentWorkflow = resolvedResult?.workflow || activeResult?.workflow || 'Vision-Language Specialist Pipeline';
  const currentSpecialist = resolvedResult?.specialist || activeResult?.specialist || 'SatQuery Expert Engine';

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4">
      {/* Title Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 dark:bg-[#4FD1C5]/10 border border-teal-500/20 text-teal-600 dark:text-[#4FD1C5] text-xs font-mono">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>AUTONOMOUS AGENT PIPELINE IN EXECUTION</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-[#F5F7FA]">
          SatQuery AI Agent
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          Inferring user intent, selecting optimal remote-sensing specialist, and extracting spatial evidence.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* CENTER RADAR VISUALIZATION & PROGRESS STEPS */}
        <div className="lg:col-span-7 p-6 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111820] shadow-sm space-y-6">
          {/* Animated Orbital Radar Dish graphic */}
          <div className="relative h-44 sm:h-52 w-full rounded-xl bg-[#080B10] border border-white/10 overflow-hidden flex items-center justify-center">
            <div className="absolute w-36 h-36 rounded-full border border-teal-500/20 animate-ping" />
            <div className="absolute w-52 h-52 rounded-full border border-teal-500/15" />
            <div className="absolute w-72 h-72 rounded-full border border-teal-500/10" />

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="w-full h-full bg-gradient-to-tr from-transparent via-transparent to-teal-500/20 animate-radar-sweep rounded-full"
                style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 50%)' }}
              />
            </div>

            <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-teal-500/30">
              <Satellite className="w-8 h-8 animate-pulse-slow" />
            </div>

            <div className="absolute top-4 left-6 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-teal-400">
              TASK: {currentTask.toUpperCase()}
            </div>
            <div className="absolute bottom-4 right-6 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-indigo-400">
              ENGINE: {currentSpecialist.toUpperCase()}
            </div>
          </div>

          {/* Sequential Milestone Steps */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-gray-400">
              Autonomous Pipeline Milestones
            </h4>
            <div className="space-y-2">
              {steps.map((st, idx) => {
                const isDone = idx < currentStepIdx;
                const isCurrent = idx === currentStepIdx;

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                      isDone
                        ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-[#39D98A]'
                        : isCurrent
                        ? 'border-teal-500/30 bg-teal-500/10 text-teal-600 dark:text-[#4FD1C5] ring-1 ring-teal-500/30'
                        : 'border-gray-100 dark:border-white/5 text-gray-400 bg-gray-50/50 dark:bg-[#151C25]/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-500 dark:text-[#39D98A]" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 flex-shrink-0 animate-spin text-teal-600 dark:text-[#4FD1C5]" />
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-gray-300 dark:border-white/20 flex items-center justify-center text-[9px]">
                          {idx + 1}
                        </span>
                      )}
                      <div>
                        <p className="text-xs font-bold leading-none">{st.title}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{st.desc}</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-semibold">
                      {isDone ? 'COMPLETED' : isCurrent ? 'EXECUTING' : 'QUEUED'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Skip Button */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-gray-400">
              Live automated agent simulation running...
            </span>
            <button
              onClick={handleSkip}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-xs font-semibold text-teal-600 dark:text-[#4FD1C5] transition-colors"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>Skip to Findings</span>
            </button>
          </div>
        </div>

        {/* SIDE PANEL: LIVE TELEMETRY LOGS */}
        <div className="lg:col-span-5 space-y-4">
          <AgentActivity
            taskDetected={currentTask}
            workflow={currentWorkflow}
            specialistTool={currentSpecialist}
            currentProgress={progress}
            logs={logs}
            status={progress === 100 ? 'Completed' : 'Running...'}
          />

          <div className="p-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111820] text-xs space-y-2">
            <span className="font-bold uppercase text-[10px] font-mono text-gray-400 block">
              Inferred Query Under Evaluation
            </span>
            <p className="italic text-gray-700 dark:text-gray-300">
              &ldquo;{query}&rdquo;
            </p>
          </div>

          <WorkflowVisualization
            task={currentTask}
            specialist={currentSpecialist}
          />
        </div>
      </div>
    </div>
  );
}
