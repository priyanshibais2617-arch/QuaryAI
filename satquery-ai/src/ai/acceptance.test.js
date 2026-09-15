/**
 * SatQuery AI - Minimum Working Acceptance Tests
 * Validates Test 1 (VQA), Test 2 (Grounding), Test 3 (Change), Test 4 (Optical+SAR),
 * Test 5 (Wrong Workflow Prevention), and Input Validation Tests.
 */

import { runAgent } from './mockAgent.js';
import { analyzeInput } from './inputAnalyzer.js';
import { classifyQuery } from './queryClassifier.js';
import { selectWorkflow } from './workflowRouter.js';

async function runTests() {
  console.log('=== SATQUERY AI: RUNNING ACCEPTANCE TESTS ===\n');
  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
    }
  }

  // --- Test 1: Single Image VQA ---
  console.log('--- TEST 1: SINGLE IMAGE VQA ---');
  const res1 = await runAgent({
    query: 'Describe the land cover in this image.',
    inputs: [{ name: 'Mumbai_Optical.tif', modality: 'Optical' }],
  });
  assert(res1.task === 'Single Image VQA', 'Test 1.1: Detected Task is Single Image VQA');
  assert(res1.workflow === 'Remote-Sensing VQA', 'Test 1.2: Selected Workflow is Remote-Sensing VQA');
  assert(res1.specialist === 'Remote-Sensing VQA Engine', 'Test 1.3: Selected Specialist is Remote-Sensing VQA Engine');
  assert(res1.confidence.percentage === 91, 'Test 1.4: Prototype Confidence is 91%');
  assert(res1.categories.length === 4, 'Test 1.5: Land cover categories provided');
  assert(res1.executionTrace.length === 10, 'Test 1.6: Execution trace has 10 steps (matching Section 23)');

  // --- Test 2: Visual Grounding ---
  console.log('\n--- TEST 2: VISUAL GROUNDING ---');
  const res2 = await runAgent({
    query: 'Where is the water body?',
    inputs: [{ name: 'Bengaluru_Landsat.tif', modality: 'Multispectral' }],
  });
  assert(res2.task === 'Visual Grounding', 'Test 2.1: Detected Task is Visual Grounding');
  assert(res2.workflow === 'Text-Guided Grounding', 'Test 2.2: Selected Workflow is Text-Guided Grounding');
  assert(res2.specialist === 'Visual Grounding Engine', 'Test 2.3: Selected Specialist is Visual Grounding Engine');
  assert(res2.boundingBox && res2.boundingBox.width > 0, 'Test 2.4: Bounding box coordinates generated');
  assert(res2.confidence.percentage === 94, 'Test 2.5: Prototype Confidence is 94%');

  // --- Test 3: Bi-Temporal Change Analysis ---
  console.log('\n--- TEST 3: BI-TEMPORAL CHANGE ANALYSIS ---');
  const res3 = await runAgent({
    query: 'What changed between these two dates?',
    inputs: [
      { name: 'Delhi_NCR_2024.tif', modality: 'Optical' },
      { name: 'Delhi_NCR_2026.tif', modality: 'Optical' },
    ],
    configuration: { temporal: true },
  });
  assert(res3.task === 'Bi-Temporal Change Analysis', 'Test 3.1: Detected Task is Bi-Temporal Change Analysis');
  assert(res3.workflow === 'Change Understanding', 'Test 3.2: Selected Workflow is Change Understanding');
  assert(res3.specialist === 'Change Understanding Engine', 'Test 3.3: Selected Specialist is Change Understanding Engine');
  assert(res3.confidence.percentage === 91, 'Test 3.4: Prototype Confidence is 91%');
  assert(res3.changes.length > 0, 'Test 3.5: Detected change regions provided');

  // --- Test 3B: Change VQA ---
  console.log('\n--- TEST 3B: CHANGE VQA ---');
  const res3b = await runAgent({
    query: 'Has the built-up area increased?',
    inputs: [
      { name: 'Delhi_NCR_2024.tif', modality: 'Optical' },
      { name: 'Delhi_NCR_2026.tif', modality: 'Optical' },
    ],
    configuration: { temporal: true },
  });
  assert(res3b.task === 'Change VQA', 'Test 3B.1: Detected Task is Change VQA');
  assert(res3b.specialist === 'Change VQA Engine', 'Test 3B.2: Selected Specialist is Change VQA Engine');
  assert(res3b.answer.startsWith('Yes'), 'Test 3B.3: Direct affirmative answer provided');

  // --- Test 4: Optical + SAR Cross-Modal Analysis ---
  console.log('\n--- TEST 4: OPTICAL + SAR CROSS-MODAL ANALYSIS ---');
  const res4 = await runAgent({
    query: 'Use the optical and SAR images together to identify built-up and water-covered regions.',
    inputs: [
      { name: 'Kolkata_Optical.tif', modality: 'Optical' },
      { name: 'Kolkata_SAR.tif', modality: 'SAR' },
    ],
  });
  assert(res4.task === 'Optical-SAR Cross-Modal Analysis', 'Test 4.1: Detected Task is Optical-SAR Cross-Modal Analysis');
  assert(res4.workflow === 'Cross-Modal Information Extraction', 'Test 4.2: Selected Workflow is Cross-Modal Information Extraction');
  assert(res4.specialist === 'Optical-SAR Analysis Engine', 'Test 4.3: Selected Specialist is Optical-SAR Analysis Engine');
  assert(res4.confidence.percentage === 89, 'Test 4.4: Prototype Confidence is 89%');
  assert(res4.findings.length > 0, 'Test 4.5: Combined Optical+SAR findings synthesized');

  // --- Test 5: Wrong Workflow Prevention ---
  console.log('\n--- TEST 5: WRONG WORKFLOW PREVENTION ---');
  // Two optical images with single-image VQA query: should NOT choose Optical-SAR
  const inputInfo5 = analyzeInput([
    { name: 'SceneA.tif', modality: 'Optical' },
    { name: 'SceneB.tif', modality: 'Optical' },
  ]);
  const class5 = classifyQuery('Describe the land cover.', inputInfo5);
  const routing5 = selectWorkflow(class5, inputInfo5);
  assert(routing5.taskKey !== 'OPTICAL_SAR_ANALYSIS', 'Test 5.1: Did not misroute to Optical-SAR');
  assert(routing5.taskKey === 'VQA', 'Test 5.2: Intelligently selected Single Image VQA');

  // --- Test 6: Input Validation Checks ---
  console.log('\n--- TEST 6: INPUT VALIDATION CHECKS ---');
  // 1 image with bi-temporal query
  const inputInfo6A = analyzeInput([{ name: 'SingleOptical.tif', modality: 'Optical' }]);
  const class6A = classifyQuery('What changed between these two dates?', inputInfo6A);
  const routing6A = selectWorkflow(class6A, inputInfo6A);
  assert(routing6A.warnings.some(w => w.includes('requires two spatially corresponding images')), 'Test 6.1: Warns bi-temporal requires two images');

  // Optical only with optical+SAR query
  const inputInfo6B = analyzeInput([{ name: 'OnlyOptical.tif', modality: 'Optical' }]);
  const class6B = classifyQuery('Combine optical and SAR images to identify water bodies.', inputInfo6B);
  const routing6B = selectWorkflow(class6B, inputInfo6B);
  assert(routing6B.warnings.some(w => w.includes('requires both optical and SAR inputs')), 'Test 6.2: Warns optical+SAR requires both inputs');

  console.log(`\n=== SUMMARY: ${passed}/${total} TESTS PASSED ===\n`);
  if (passed === total) {
    console.log('ALL ACCEPTANCE TESTS MET WITH 100% SUCCESS!');
  } else {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
