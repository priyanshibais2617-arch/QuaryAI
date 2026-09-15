/**
 * SatQuery AI - Mock Change VQA Specialist
 * Handles direct questions asking about temporal trends, gains, losses, or states between two dates.
 */

export async function runMockChangeVQA(query = '', inputInfo = {}) {
  await new Promise(r => setTimeout(r, 180));

  const q = (query || '').toLowerCase();

  let answer = 'Yes. The built-up area appears to have increased.';
  if (q.includes('vegetation') || q.includes('forest') || q.includes('crop')) {
    answer = 'Vegetative cover in the northern scrubland sector has decreased by approximately 14.8 hectares due to new construction.';
  } else if (q.includes('water') || q.includes('lake') || q.includes('reservoir')) {
    answer = 'The surface area of the primary water body remained stable across both dates with less than 1.5% boundary variance.';
  } else if (q.includes('decreased')) {
    answer = 'Natural scrubland and unpaved soil decreased, while impervious surfaces increased.';
  }

  return {
    answer,
    confidence: 0.92,
    confidenceLabel: 'Prototype Confidence',
    evidence: {
      type: 'bitemporal-change',
      queryAffirmation: true,
      baselineDate: '2024-03-15',
      targetDate: '2026-02-28',
      boundingHighlight: {
        x: 52,
        y: 6,
        width: 44,
        height: 38,
        label: 'Demo Change Evidence: Detected Built-Up Expansion',
      },
    },
    summaryCards: [
      { label: 'Temporal Verdict', value: 'Confirmed Increase', icon: 'CheckCircle2' },
      { label: 'Observed Trajectory', value: 'Scrubland to Urban', icon: 'TrendingUp' },
      { label: 'Baseline -> Target', value: '2024 -> 2026 (23 Mo)', icon: 'Calendar' },
      { label: 'Prototype Confidence', value: '92%', icon: 'ShieldCheck' },
    ],
    prototype: true,
  };
}
