/**
 * SatQuery AI - Mock Grounding Specialist
 * Simulates text-guided visual feature grounding and spatial bounding envelope extraction.
 */

export async function runMockGrounding(query = '', inputInfo = {}) {
  await new Promise(r => setTimeout(r, 180));

  const q = (query || '').toLowerCase();

  let targetName = 'water body';
  let boundingBox = {
    x: 34,
    y: 38,
    width: 40,
    height: 36,
    label: 'Demo Grounding Region: Water Body',
  };

  if (q.includes('junction') || q.includes('road') || q.includes('transport')) {
    targetName = 'transport junction';
    boundingBox = {
      x: 18,
      y: 45,
      width: 32,
      height: 28,
      label: 'Demo Grounding Region: Transport Arterial Junction',
    };
  } else if (q.includes('building') || q.includes('built-up') || q.includes('industrial')) {
    targetName = 'industrial facility';
    boundingBox = {
      x: 55,
      y: 15,
      width: 35,
      height: 30,
      label: 'Demo Grounding Region: Structural Complex',
    };
  }

  const answer = `A ${targetName} is located in the demarcated coordinates with high spectral absorption and localized spatial boundaries.`;

  return {
    answer,
    confidence: 0.94,
    confidenceLabel: 'Prototype Confidence',
    groundingLabel: 'Demo Grounding Region',
    evidence: {
      type: 'bounding-box',
      ...boundingBox,
      coordinates: '12°58\'23"N, 77°35\'45"E',
      estimatedArea: '2.34 km²',
    },
    boundingBox,
    summaryCards: [
      { label: 'Target Feature', value: targetName.toUpperCase(), icon: 'Crosshair' },
      { label: 'Spatial Bounding', value: `X:${boundingBox.x}%, Y:${boundingBox.y}%`, icon: 'Maximize2' },
      { label: 'Surface Extent', value: '2.34 km²', icon: 'Layers' },
      { label: 'Prototype Confidence', value: '94%', icon: 'ShieldCheck' },
    ],
    prototype: true,
  };
}
