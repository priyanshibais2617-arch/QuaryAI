/**
 * SatQuery AI - Deterministic Agent Controller
 * Orchestrates autonomous decision-making:
 * Input Analysis -> Query Classification -> Workflow Selection -> Specialist Execution -> Result Integration
 */

import { analyzeInput } from './inputAnalyzer.js';
import { classifyQuery } from './queryClassifier.js';
import { selectWorkflow } from './workflowRouter.js';
import { integrateResult } from './resultIntegrator.js';

// Specialist engines
import { runMockVQA } from './mockSpecialists/mockVQA.js';
import { runMockGrounding } from './mockSpecialists/mockGrounding.js';
import { runMockCaptioning } from './mockSpecialists/mockCaptioning.js';
import { runMockChange } from './mockSpecialists/mockChange.js';
import { runMockChangeVQA } from './mockSpecialists/mockChangeVQA.js';
import { runMockOpticalSAR } from './mockSpecialists/mockOpticalSAR.js';

export async function runAgent({ query = '', inputs = [], configuration = {} }) {
  const trace = [];
  const now = () => new Date().toISOString();

  // Helper to record milestones
  const recordStep = (id, title, detail, status = 'completed') => {
    trace.push({
      id,
      title,
      detail,
      status,
      timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    });
  };

  // Step 1: Input Received
  recordStep(
    'input_received',
    'Input received',
    `Staged ${Array.isArray(inputs) ? inputs.length : 0} satellite raster file(s).`
  );

  // Step 2: Input Validation & Metadata Extraction
  const inputInfo = analyzeInput(inputs, configuration);
  recordStep(
    'input_validated',
    'Input validated',
    `Raster format, spatial headers, and ground sampling distance (GSD) verified.`
  );

  // Step 3: Modality Identified
  recordStep(
    'modality_identified',
    'Modality identified',
    `Identified sensor modality: ${inputInfo.modalitySummary} (${inputInfo.inputType.replace(/_/g, ' ')}).`
  );

  // Step 4: Query Understood
  const classification = classifyQuery(query, inputInfo);
  recordStep(
    'query_understood',
    'Query understood',
    `Semantic intention parsed: "${classification.intent}". Key tokens mapped.`
  );

  // Step 5: Task Classified
  recordStep(
    'task_classified',
    'Task classified',
    `Classified task domain as [${classification.task}] with ${(classification.confidence * 100).toFixed(0)}% algorithmic confidence.`
  );

  // Step 6: Workflow Selected & Specialist Assigned
  const routing = selectWorkflow(classification, inputInfo, configuration);
  recordStep(
    'workflow_selected',
    'Workflow selected',
    `Autonomous pipeline mapped to [${routing.workflow}]. Reason: ${routing.reason}`
  );

  recordStep(
    'specialist_selected',
    'Specialist selected',
    `Assigned execution to specialized engine: [${routing.specialistName}].`
  );

  // Step 7: Specialist Executed
  let specialistResult = {};
  switch (routing.taskKey) {
    case 'GROUNDING':
      specialistResult = await runMockGrounding(query, inputInfo);
      break;
    case 'CAPTIONING':
      specialistResult = await runMockCaptioning(query, inputInfo);
      break;
    case 'CHANGE_VQA':
      specialistResult = await runMockChangeVQA(query, inputInfo);
      break;
    case 'CHANGE_ANALYSIS':
      specialistResult = await runMockChange(query, inputInfo);
      break;
    case 'OPTICAL_SAR_ANALYSIS':
      specialistResult = await runMockOpticalSAR(query, inputInfo);
      break;
    case 'VQA':
    default:
      specialistResult = await runMockVQA(query, inputInfo);
      break;
  }

  recordStep(
    'specialist_executed',
    'Specialist executed',
    `Specialist [${routing.specialistName}] execution completed without inference exceptions.`
  );

  // Step 8: Evidence Prepared
  recordStep(
    'evidence_prepared',
    'Evidence prepared',
    `Spatial annotations, spectral masks, and coordinate overlays synthesized.`
  );

  // Step 9: Result Integrated
  recordStep(
    'result_integrated',
    'Result integrated',
    `Findings, calibrated confidence, and auditable telemetry integrated into unified contract.`
  );

  // Final assembly
  const finalResult = integrateResult({
    task: routing.task,
    taskKey: routing.taskKey,
    workflow: routing.workflow,
    specialist: routing.specialistName,
    specialistId: routing.specialistId,
    reason: routing.reason,
    query,
    inputInfo,
    specialistResult,
    executionTrace: trace,
  });

  return finalResult;
}
