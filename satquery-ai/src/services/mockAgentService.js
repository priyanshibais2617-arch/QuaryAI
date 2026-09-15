/**
 * SatQuery AI - Frontend Service Boundary
 * Clean abstraction layer between UI components and AI intelligence.
 * Can be swapped with real HTTP/WebSocket API client in future backend phases.
 */

import { runAgent } from '../ai/mockAgent.js';
import { analyzeInput } from '../ai/inputAnalyzer.js';
import { classifyQuery } from '../ai/queryClassifier.js';
import { selectWorkflow } from '../ai/workflowRouter.js';
import { MOCK_MODEL_REGISTRY, REMOTE_SENSING_ADAPTATION_METADATA } from '../data/mockModelRegistry.js';
import { executeAnalysis } from './apiClient.js';

const isRealBackendEnabled = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_USE_REAL_BACKEND === 'true';
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env.VITE_USE_REAL_BACKEND === 'true';
  }
  return false;
};

export async function runAgentDemo({ query, inputs, inputConfiguration }) {
  if (isRealBackendEnabled()) {
    return await executeAnalysis({
      query,
      inputs,
      configuration: inputConfiguration,
    });
  }

  // Simulate network latency if desired
  return await runAgent({
    query,
    inputs,
    configuration: inputConfiguration,
  });
}

export function inspectAgentDecision(query, inputs, configuration = {}) {
  const inputInfo = analyzeInput(inputs, configuration);
  const classification = classifyQuery(query, inputInfo);
  const routing = selectWorkflow(classification, inputInfo, configuration);

  return {
    inputInfo,
    classification,
    routing,
  };
}

export function getModelRegistry() {
  return MOCK_MODEL_REGISTRY;
}

export function getRemoteSensingAdaptationInfo() {
  return REMOTE_SENSING_ADAPTATION_METADATA;
}
