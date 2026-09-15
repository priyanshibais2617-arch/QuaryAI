/**
 * SatQuery AI - Real Backend Integration Smoke Test
 * Tests both mock default path and VITE_USE_REAL_BACKEND=true path against FastAPI.
 */

import crypto from 'crypto';
import { runAgentDemo } from '../src/services/mockAgentService.js';
import { getCatalogImages, uploadFileMetadata, getAnalysisStatus, setAuthToken } from '../src/services/apiClient.js';

function createTestJwt(payload, secret = process.env.SUPABASE_JWT_SECRET || 'satquery-super-secret-jwt-key-minimum-32-chars') {
  const header = { alg: 'HS256', typ: 'JWT' };
  const base64url = (str) => Buffer.from(str).toString('base64url');
  const unsignedToken = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;
  const signature = crypto.createHmac('sha256', secret).update(unsignedToken).digest('base64url');
  return `${unsignedToken}.${signature}`;
}


async function runSmokeTest() {
  console.log('=== SATQUERY AI: RUNNING BACKEND INTEGRATION SMOKE TEST ===\n');

  // 1. Test default mock mode (VITE_USE_REAL_BACKEND is false/unset)
  console.log('--- 1. Testing Default Mock Mode ---');
  process.env.VITE_USE_REAL_BACKEND = 'false';
  setAuthToken(null);
  const mockRes = await runAgentDemo({
    query: 'Describe the land cover in this image.',
    inputs: [{ name: 'Mumbai_Optical.tif', modality: 'Optical' }],
  });

  if (mockRes.task === 'Single Image VQA' && mockRes.confidence.percentage === 91 && mockRes.executionTrace.length === 10) {
    console.log('[PASS] Default mock mode functions properly without network call.');
  } else {
    console.error('[FAIL] Default mock mode output did not match expected shape.', mockRes);
    process.exit(1);
  }

  // 2. Test Real Backend Mode (VITE_USE_REAL_BACKEND = true)
  console.log('\n--- 2. Testing Real FastAPI Backend Mode & Auth Enforcement ---');
  process.env.VITE_USE_REAL_BACKEND = 'true';
  process.env.VITE_API_BASE_URL = 'http://localhost:8000';

  // 2a. Unauthenticated request to protected endpoint should fail with 401
  setAuthToken(null);
  console.log('Testing unauthenticated access rejection (expect 401)...');
  try {
    await uploadFileMetadata({ filename: 'Unauth.tif' });
    console.error('[FAIL] Expected 401 unauthenticated error, but request succeeded.');
    process.exit(1);
  } catch (err) {
    if (err.message.includes('401')) {
      console.log('[PASS] Protected endpoint properly rejected unauthenticated request with 401.');
    } else {
      console.error('[FAIL] Unexpected error on unauthenticated request:', err.message);
      process.exit(1);
    }
  }

  // 2b. Authenticated request with Supabase JWT
  console.log('Generating test Supabase JWT and setting auth token...');
  const testToken = createTestJwt({
    sub: 'smoke-test-uuid-999',
    email: 'smoke@satquery.ai',
    role: 'authenticated',
    user_metadata: { role: 'GIS Analyst' },
    exp: Math.floor(Date.now() / 1000) + 3600,
  });
  setAuthToken(testToken);

  console.log('Calling POST /api/v1/analysis/execute via runAgentDemo with auth token...');
  const realRes = await runAgentDemo({
    query: 'Describe the land cover in this image.',
    inputs: [{ name: 'Mumbai_Optical.tif', modality: 'Optical' }],
    inputConfiguration: { pairType: 'single' },
  });

  console.log('Real backend response received:', {
    task: realRes.task,
    specialist: realRes.specialist,
    confidence: realRes.confidence?.percentage,
    traceSteps: realRes.executionTrace?.length,
    analysisId: realRes.analysis_id,
  });

  if (
    realRes.task === 'Single Image VQA' &&
    realRes.workflow === 'Remote-Sensing VQA' &&
    realRes.confidence?.percentage === 91 &&
    Array.isArray(realRes.categories) &&
    realRes.categories.length === 4 &&
    Array.isArray(realRes.executionTrace) &&
    realRes.executionTrace.length === 10 &&
    realRes.analysis_id &&
    realRes.analysis_id.startsWith('ana-')
  ) {
    console.log('[PASS] Real backend returned exact unified result contract (10-step trace, categories, confidence).');
  } else {
    console.error('[FAIL] Real backend response did not match expected contract shape.', realRes);
    process.exit(1);
  }

  // 3. Test catalog and status helper endpoints
  console.log('\n--- 3. Testing Catalog and Status Endpoints ---');
  const catalog = await getCatalogImages();
  if (catalog.total === 6 && catalog.images.length === 6) {
    console.log(`[PASS] GET /api/v1/catalog/images returned ${catalog.total} images.`);
  } else {
    console.error('[FAIL] Catalog images response invalid:', catalog);
    process.exit(1);
  }

  const upload = await uploadFileMetadata({ filename: 'Test_Scene.tif', modality: 'Optical' });
  if (upload.id && upload.status === 'staged') {
    console.log(`[PASS] POST /api/v1/analysis/upload created upload id: ${upload.id}`);
  } else {
    console.error('[FAIL] Upload response invalid:', upload);
    process.exit(1);
  }

  const status = await getAnalysisStatus(realRes.analysis_id);
  if (status.id === realRes.analysis_id && status.status === 'completed' && status.result) {
    console.log(`[PASS] GET /api/v1/analysis/status/${realRes.analysis_id} verified completed.`);
  } else {
    console.error('[FAIL] Status response invalid:', status);
    process.exit(1);
  }

  console.log('\n=== ALL SMOKE TESTS PASSED SUCCESSFULLY! ===\n');
}

runSmokeTest().catch(err => {
  console.error('\n[ERROR] Smoke test encountered an error:', err.message);
  process.exit(1);
});

