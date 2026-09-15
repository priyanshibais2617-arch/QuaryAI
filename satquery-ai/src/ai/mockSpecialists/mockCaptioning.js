/**
 * SatQuery AI - Mock Captioning Specialist
 * Simulates high-level semantic caption generation and multi-class classification for satellite scenes.
 */

export async function runMockCaptioning(query = '', inputInfo = {}) {
  await new Promise(r => setTimeout(r, 180));

  const answer = 'A mixed landscape containing vegetation, open terrain, built-up areas and a water feature.';

  const detectedCategories = [
    { label: 'Vegetation Canopy', confidence: 0.95 },
    { label: 'Built-Up Infrastructure', confidence: 0.92 },
    { label: 'Open / Fallow Land', confidence: 0.88 },
    { label: 'Hydrological Feature', confidence: 0.94 },
    { label: 'Paved Arterial Network', confidence: 0.91 },
  ];

  return {
    answer,
    confidence: 0.93,
    confidenceLabel: 'Prototype Confidence',
    detectedCategories,
    evidence: {
      type: 'scene-captioning',
      summary: 'Caption synthesizes dual-scale spatial patch embeddings with cross-attentive token vocabularies.',
      categories: detectedCategories,
    },
    summaryCards: [
      { label: 'Scene Profile', value: 'Peri-Urban Mosaic', icon: 'Grid' },
      { label: 'Detected Classes', value: '5 Major Categories', icon: 'Layers' },
      { label: 'Semantic Coherence', value: 'High (0.93 BLEU-4)', icon: 'FileText' },
      { label: 'Prototype Confidence', value: '93%', icon: 'ShieldCheck' },
    ],
    prototype: true,
  };
}
