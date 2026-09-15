/**
 * SatQuery AI - Query Classifier
 * Lightweight, deterministic rule-based classifier for remote sensing queries.
 * Evaluates semantic patterns, geospatial keywords, and input compatibility without external LLMs.
 */

export function classifyQuery(query = '', inputInfo = {}) {
  const q = (query || '').toLowerCase().trim();

  // Pattern matchers
  const matches = (...keywords) => keywords.some(k => q.includes(k.toLowerCase()));

  // 1. Cross-Modal Optical + SAR Analysis patterns
  const crossModalKeywords = [
    'optical and sar',
    'sar and optical',
    'combine optical',
    'both images',
    'both sensors',
    'cross-modal',
    'cross modal',
    'radar and optical',
    'fusion',
    'microwave',
    'backscatter and spectral',
  ];
  if (matches(...crossModalKeywords)) {
    return {
      task: 'OPTICAL_SAR_ANALYSIS',
      confidence: 0.96,
      intent: 'Cross-modal Optical and SAR sensor interpretation',
      detectedKeywords: crossModalKeywords.filter(k => q.includes(k)),
    };
  }

  // 2. Change VQA Pattern (Polar or quantitative change question)
  const changeVQAKeywords = [
    'has the built-up area increased',
    'has the built up area increased',
    'has vegetation decreased',
    'did the water body shrink',
    'did the built-up area expand',
    'has there been deforestation',
    'increased, decreased, or remained unchanged',
    'increased or decreased',
    'has it changed',
  ];
  if (matches(...changeVQAKeywords)) {
    return {
      task: 'CHANGE_VQA',
      confidence: 0.95,
      intent: 'Polar / quantitative change question over bi-temporal series',
      detectedKeywords: changeVQAKeywords.filter(k => q.includes(k)),
    };
  }

  // 3. Bi-Temporal Change Analysis patterns
  const changeKeywords = [
    'what changed',
    'change between',
    'changes between',
    'difference between',
    'before and after',
    'expansion',
    'deforestation',
    'new construction',
    'urban growth',
    'encroachment',
    'timeline',
    'decreased',
    'increased',
    'two dates',
  ];
  if (matches(...changeKeywords)) {
    return {
      task: 'CHANGE_ANALYSIS',
      confidence: 0.94,
      intent: 'Bi-temporal differential change detection and spatial localization',
      detectedKeywords: changeKeywords.filter(k => q.includes(k)),
    };
  }

  // 4. Visual Grounding / Localization patterns
  const groundingKeywords = [
    'where is',
    'where are',
    'locate',
    'pinpoint',
    'highlight',
    'identify the water body',
    'identify the water',
    'bounding box',
    'find the water',
    'find the reservoir',
    'isolate the',
    'show me where',
    'demarcate',
    'coordinates of',
  ];
  if (matches(...groundingKeywords)) {
    return {
      task: 'GROUNDING',
      confidence: 0.95,
      intent: 'Text-guided visual grounding and spatial feature localization',
      detectedKeywords: groundingKeywords.filter(k => q.includes(k)),
    };
  }

  // 5. Scene Captioning / High-level scene description
  const captioningKeywords = [
    'describe the scene',
    'generate caption',
    'summarize the scene',
    'scene caption',
    'caption this image',
    'overall scene',
  ];
  if (matches(...captioningKeywords)) {
    return {
      task: 'CAPTIONING',
      confidence: 0.92,
      intent: 'Dense remote-sensing scene captioning and categorization',
      detectedKeywords: captioningKeywords.filter(k => q.includes(k)),
    };
  }

  // 6. Visual Question Answering (VQA) / General Scene Understanding
  const vqaKeywords = [
    'describe',
    'what is visible',
    'what is in this image',
    'what objects',
    'land cover',
    'is there vegetation',
    'are there',
    'what type of terrain',
    'estimate the percentage',
    'classify',
    'how many',
    'what sensor',
  ];
  if (matches(...vqaKeywords)) {
    return {
      task: 'VQA',
      confidence: 0.91,
      intent: 'Open-ended remote-sensing visual question answering',
      detectedKeywords: vqaKeywords.filter(k => q.includes(k)),
    };
  }

  // 7. Contextual Fallback based on input type
  if (inputInfo.crossModal || (inputInfo.hasOptical && inputInfo.hasSAR)) {
    return {
      task: 'OPTICAL_SAR_ANALYSIS',
      confidence: 0.85,
      intent: 'Inferred cross-modal analysis from optical + SAR input pair',
      detectedKeywords: ['cross_modal_input_inferred'],
    };
  }

  if (inputInfo.temporal || inputInfo.imageCount === 2) {
    return {
      task: 'CHANGE_ANALYSIS',
      confidence: 0.85,
      intent: 'Inferred change analysis from bi-temporal image pair',
      detectedKeywords: ['temporal_pair_inferred'],
    };
  }

  // Fallback: General VQA or general query
  return {
    task: 'VQA',
    confidence: 0.80,
    intent: 'General remote-sensing scene understanding query',
    detectedKeywords: ['default_fallback'],
  };
}
