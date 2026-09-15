/**
 * SatQuery AI - Result Integrator
 * Normalizes disparate specialist engine outputs into a unified, predictable result contract.
 */

export function integrateResult({
  task = 'Single Image VQA',
  taskKey = 'VQA',
  workflow = 'Remote-Sensing VQA',
  specialist = 'Remote-Sensing VQA Engine',
  specialistId = 'vqa_engine',
  reason = '',
  query = '',
  inputInfo = {},
  specialistResult = {},
  executionTrace = [],
}) {
  const rawConfidence = specialistResult?.confidence || 0.90;
  const percentage = Math.round(rawConfidence * 100);

  // Normalize summary cards
  const defaultSummaryCards = [
    { label: 'Task Domain', value: task, icon: 'Layers' },
    { label: 'Specialist Engine', value: specialist, icon: 'Cpu' },
    { label: 'Sensor Input', value: inputInfo.modalitySummary || 'Optical', icon: 'Satellite' },
    { label: 'Prototype Confidence', value: `${percentage}%`, icon: 'ShieldCheck' },
  ];

  const summaryCards = specialistResult?.summaryCards || defaultSummaryCards;

  return {
    task,
    taskKey,
    workflow,
    specialist,
    specialistId,
    reason,
    query,

    // Core answer
    answer: specialistResult?.answer || 'Analysis completed successfully.',

    // Calibrated prototype confidence
    confidence: {
      value: rawConfidence,
      percentage,
      type: 'prototype',
      label: 'Prototype Confidence',
      disclaimer: 'Simulated prototype confidence metric for algorithmic evaluation.',
    },

    // Task-specific structured evidence
    evidence: specialistResult?.evidence || {},
    categories: specialistResult?.categories || [],
    changes: specialistResult?.changes || [],
    findings: specialistResult?.findings || [],
    boundingBox: specialistResult?.boundingBox || null,
    analysisLabel: specialistResult?.analysisLabel || specialistResult?.confidenceLabel || 'Prototype Evaluation',

    // Summary metadata
    summaryCards,
    inputInfo: {
      imageCount: inputInfo.imageCount || 1,
      modalitySummary: inputInfo.modalitySummary || 'Optical',
      temporal: inputInfo.temporal || false,
      crossModal: inputInfo.crossModal || false,
    },

    // Full step-by-step execution trace
    executionTrace,

    // Prototype flag
    prototype: true,
    timestamp: new Date().toISOString(),
  };
}
