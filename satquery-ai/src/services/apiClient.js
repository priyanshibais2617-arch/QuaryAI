/**
 * SatQuery AI - API Client
 * Centralized HTTP client for FastAPI backend communication.
 */

let currentAuthToken = null;

export const setAuthToken = (token) => {
  currentAuthToken = token;
  if (typeof localStorage !== 'undefined') {
    if (token) {
      localStorage.setItem('satquery-token', token);
    } else {
      localStorage.removeItem('satquery-token');
    }
  }
};

export const getAuthToken = () => {
  if (currentAuthToken) return currentAuthToken;
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('satquery-token') || null;
  }
  return null;
};

const getApiBaseUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
  }
  if (typeof process !== 'undefined' && process.env && process.env.VITE_API_BASE_URL) {
    return process.env.VITE_API_BASE_URL.replace(/\/$/, '');
  }
  return '';
};

const DEFAULT_TIMEOUT_MS = 15000;

async function request(endpoint, options = {}) {
  const { timeout = DEFAULT_TIMEOUT_MS, headers = {}, token = null, ...fetchOptions } = options;
  const baseUrl = getApiBaseUrl();
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const cleanEndpoint = (baseUrl.endsWith('/api') && normalizedEndpoint.startsWith('/api/'))
    ? normalizedEndpoint.slice(4)
    : normalizedEndpoint;
  const url = `${baseUrl}${cleanEndpoint}`;

  const activeToken = token || getAuthToken();
  const authHeaders = activeToken ? { Authorization: `Bearer ${activeToken}` } : {};

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorDetail = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        errorDetail = errorJson.detail || errorJson.message || errorText;
      } catch (_) {
        // use raw text
      }
      throw new Error(`API Error [${response.status}]: ${errorDetail}`);
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Request to ${endpoint} timed out after ${timeout}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function executeAnalysis({ query = '', inputs = [], configuration = {}, task = null, token = null }) {
  return await request('/api/v1/analysis/execute', {
    method: 'POST',
    token,
    body: JSON.stringify({
      query,
      inputs,
      configuration,
      task,
    }),
  });
}

export async function uploadFileMetadata(metadata, token = null) {
  const payload = {
    ...metadata,
    benchmark_source: metadata.benchmark_source || metadata.benchmarkSource || null,
  };
  return await request('/api/v1/analysis/upload', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}


export async function uploadRasterFile(file, benchmark = null) {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl.replace(/\/$/, '')}/api/v1/analysis/upload`;

  const formData = new FormData();
  formData.append('file', file);
  if (benchmark) {
    formData.append('benchmark', benchmark);
  }

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorDetail = errorText;
    try {
      const errorJson = JSON.parse(errorText);
      errorDetail = errorJson.detail || errorJson.message || errorText;
    } catch (_) {}
    throw new Error(errorDetail || `Upload failed with status ${response.status}`);
  }

  return await response.json();
}

export async function executeLiveAnalysis({ query, filePaths = [], modalities = [], task = null }) {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl.replace(/\/$/, '')}/api/v1/analysis/execute`;

  const formData = new FormData();
  formData.append('query', query || '');
  filePaths.forEach((path) => formData.append('file_paths', path));
  modalities.forEach((mod) => formData.append('modalities', mod));
  if (task) {
    formData.append('task', task);
  }

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorDetail = errorText;
    try {
      const errorJson = JSON.parse(errorText);
      errorDetail = errorJson.detail || errorJson.message || errorText;
    } catch (_) {}
    throw new Error(errorDetail || `Execution failed with status ${response.status}`);
  }

  return await response.json();
}

export async function downloadReportPdf(payload = null) {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl.replace(/\/$/, '')}/api/v1/export/report`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/pdf',
    },
    body: JSON.stringify(payload || {}),
  });

  if (!response.ok) {
    let errDetail = `Status ${response.status}`;
    try {
      const errJson = await response.json();
      errDetail = errJson.detail || errDetail;
    } catch (_) {
      try {
        errDetail = await response.text();
      } catch (_) {}
    }
    throw new Error(`Report export failed: ${errDetail}`);
  }

  const blob = await response.blob();
  const pdfBlob = new Blob([blob], { type: 'application/pdf' });
  const downloadUrl = window.URL.createObjectURL(pdfBlob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = 'satquery_dossier.pdf';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 5000);
}

export async function checkBackendHealth() {
  try {
    const baseUrl = getApiBaseUrl();
    const healthUrl = baseUrl ? `${baseUrl}/health` : '/api/health';
    const response = await fetch(healthUrl, {
      method: 'GET',
    });
    return response.ok;
  } catch (_) {
    return false;
  }
}
