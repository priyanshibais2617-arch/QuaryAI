import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_SCENARIOS, RECENT_ANALYSES } from '../data/mockData';
import { getSatelliteSvgUrl } from '../utils/satelliteGenerators';
import { runAgentDemo, inspectAgentDecision } from '../services/mockAgentService';

const AnalysisContext = createContext();

export const ALLOWED_BENCHMARK_SOURCES = ['BigEarthNet', 'VRSBench', 'RSVQA', 'CDVQA'];

export function AnalysisProvider({ children }) {
  const [analysisType, setAnalysisType] = useState('bitemporal'); // 'single', 'bitemporal', 'optical_sar'
  const [scenarioKey, setScenarioKey] = useState('bitemporal');
  const [stagedFiles, setStagedFiles] = useState([]);
  const [query, setQuery] = useState(DEMO_SCENARIOS['bitemporal'].query);
  const [validationStatus, setValidationStatus] = useState({
    isValidating: false,
    isComplete: true,
    hasWarnings: false,
    warningMessage: null,
    checks: [
      { id: 'format', name: 'File Format & Encodings', status: 'valid', desc: 'Compliant GeoTIFF/PNG multi-channel buffers' },
      { id: 'count', name: 'Temporal Image Pair Check', status: 'valid', desc: 'Exact 2 temporal intervals provided (T1, T2)' },
      { id: 'sensor', name: 'Sensor & Modality Compatibility', status: 'valid', desc: 'Sentinel-2 Level-2A surface reflectance' },
      { id: 'geo', name: 'Geographic Projection Metadata', status: 'valid', desc: 'EPSG:32643 (UTM Zone 43N) WGS84 matched' },
      { id: 'spatial', name: 'Spatial Resolution Alignment', status: 'valid', desc: 'Native 10.0m Ground Sampling Distance (GSD)' },
      { id: 'coreg', name: 'Sub-Pixel Co-Registration', status: 'valid', desc: 'Phase correlation error < 0.12 pixels' },
    ]
  });

  const [activeResult, setActiveResult] = useState(null);
  const [isAgentExecuting, setIsAgentExecuting] = useState(false);
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('satquery-history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return RECENT_ANALYSES;
      }
    }
    return RECENT_ANALYSES;
  });

  useEffect(() => {
    localStorage.setItem('satquery-history', JSON.stringify(history));
  }, [history]);

  // Load a demo scenario pre-populating files and query
  const loadScenario = (key) => {
    const normalizedKey = key === 'vqa' ? 'single' : key;
    const scenario = DEMO_SCENARIOS[normalizedKey] || DEMO_SCENARIOS['bitemporal'];

    setScenarioKey(key);
    setQuery(scenario.query);

    let type = 'single';
    let mockFiles = [];

    if (key === 'bitemporal') {
      type = 'bitemporal';
      mockFiles = [
        {
          id: 'f-1',
          name: 'Delhi_NCR_T1_20240315.tif',
          size: 44879000,
          type: 'image/tiff',
          preview: getSatelliteSvgUrl('optical-baseline'),
          modality: 'Optical (Sentinel-2)',
          date: '2024-03-15',
          status: 'Valid'
        },
        {
          id: 'f-2',
          name: 'Delhi_NCR_T2_20260228.tif',
          size: 45210000,
          type: 'image/tiff',
          preview: getSatelliteSvgUrl('optical-target'),
          modality: 'Optical (Sentinel-2)',
          date: '2026-02-28',
          status: 'Valid'
        }
      ];
    } else if (key === 'optical_sar') {
      type = 'optical_sar';
      mockFiles = [
        {
          id: 'f-1',
          name: 'Kolkata_Delta_Optical_B432.tif',
          size: 42100000,
          type: 'image/tiff',
          preview: getSatelliteSvgUrl('optical-baseline'),
          modality: 'Optical Multi-band',
          date: '2026-02-20',
          status: 'Valid'
        },
        {
          id: 'f-2',
          name: 'Kolkata_Delta_SAR_C_Band.tif',
          size: 58900000,
          type: 'image/tiff',
          preview: getSatelliteSvgUrl('sar-radar'),
          modality: 'SAR Microwave (VV+VH)',
          date: '2026-02-20',
          status: 'Valid'
        }
      ];
    } else if (key === 'grounding') {
      type = 'single';
      mockFiles = [
        {
          id: 'f-1',
          name: 'Bengaluru_Reservoir_L9.png',
          size: 19400000,
          type: 'image/png',
          preview: getSatelliteSvgUrl('grounding-target'),
          modality: 'Multispectral (Landsat-9)',
          date: '2026-01-14',
          status: 'Valid'
        }
      ];
    } else if (key === 'captioning') {
      type = 'single';
      mockFiles = [
        {
          id: 'f-1',
          name: 'PeriUrban_Mosaic_SuperDove.tif',
          size: 28400000,
          type: 'image/tiff',
          preview: getSatelliteSvgUrl('optical-target'),
          modality: 'High-Res Optical',
          date: '2026-02-15',
          status: 'Valid'
        }
      ];
    } else {
      // VQA / Single
      type = 'single';
      mockFiles = [
        {
          id: 'f-1',
          name: 'Mumbai_PeriUrban_TrueColor.tif',
          size: 32700000,
          type: 'image/tiff',
          preview: getSatelliteSvgUrl('optical-target'),
          modality: 'High-Res Optical',
          date: '2026-02-10',
          status: 'Valid'
        }
      ];
    }

    setAnalysisType(type);
    setStagedFiles(mockFiles);
    validateInputs(mockFiles, type, scenario.query);
  };

  // Re-run mock validation checks & check query compatibility
  const validateInputs = (files = stagedFiles, type = analysisType, currentQuery = query) => {
    setValidationStatus(prev => ({ ...prev, isValidating: true }));

    setTimeout(() => {
      const requiredCount = type === 'single' ? 1 : 2;
      const countValid = files.length >= requiredCount;

      // Check input format policy
      let formatStatus = 'valid';
      let formatDesc = 'Compliant GeoTIFF/TIFF or prescribed benchmark raster buffers';
      const invalidFiles = [];
      const untaggedBenchmarkFiles = [];

      files.forEach((file) => {
        const fname = (file.name || '').toLowerCase();
        const ext = fname.substring(fname.lastIndexOf('.'));
        const isGeoTiff = ext === '.tif' || ext === '.tiff' || ext === '.geotiff';
        const isPngJpg = ext === '.png' || ext === '.jpg' || ext === '.jpeg';
        const bSource = file.benchmarkSource || file.benchmark_source;

        if (isGeoTiff) {
          // GeoTIFF is the default format, always valid
        } else if (isPngJpg) {
          if (!bSource || !ALLOWED_BENCHMARK_SOURCES.includes(bSource)) {
            untaggedBenchmarkFiles.push(file.name);
          }
        } else if (ext) {
          invalidFiles.push(file.name);
        }
      });

      if (invalidFiles.length > 0) {
        formatStatus = 'error';
        formatDesc = `Unsupported format: ${invalidFiles.join(', ')}. Supported: GeoTIFF (.tif/.tiff) or benchmark-tagged PNG/JPEG.`;
      } else if (untaggedBenchmarkFiles.length > 0) {
        formatStatus = 'warning';
        formatDesc = `Benchmark tag required for ${untaggedBenchmarkFiles.join(', ')} (BigEarthNet, VRSBench, RSVQA, CDVQA).`;
      }

      const formatValid = formatStatus === 'valid';

      // Check query-input mismatch
      const inspection = inspectAgentDecision(currentQuery, files, { pairType: type });
      const warningMessage = inspection.routing.warnings.length > 0 ? inspection.routing.warnings[0] : null;

      const checks = [
        {
          id: 'format',
          name: 'File Format & Benchmark Tagging',
          status: formatStatus,
          desc: formatDesc
        },
        {
          id: 'count',
          name: `${type === 'bitemporal' ? 'Temporal Pair' : type === 'optical_sar' ? 'Cross-Sensor Pair' : 'Single Scene'} Image Count`,
          status: countValid ? 'valid' : 'warning',
          desc: countValid ? `Found ${files.length} valid images for ${type} analysis` : `Requires at least ${requiredCount} images for ${type}`
        },
        {
          id: 'sensor',
          name: 'Sensor & Modality Compatibility',
          status: type === 'optical_sar' && (!inspection.inputInfo.hasSAR || !inspection.inputInfo.hasOptical) ? 'warning' : 'valid',
          desc: type === 'optical_sar' && (!inspection.inputInfo.hasSAR || !inspection.inputInfo.hasOptical)
            ? 'Optical + SAR requires both optical and radar sensors'
            : 'Sensor band calibrations validated against metadata registry'
        },
        {
          id: 'geo',
          name: 'Geographic Projection Metadata',
          status: 'valid',
          desc: 'Bounding box overlap verified (>98.4% spatial intersection)'
        },
        {
          id: 'spatial',
          name: 'Spatial Ground Sampling Distance (GSD)',
          status: 'valid',
          desc: 'Co-registered to common reference grid (10.0m)'
        },
        {
          id: 'coreg',
          name: 'Cross-Modal Co-Registration',
          status: 'valid',
          desc: 'Sub-pixel tie-point correlation verified'
        },
      ];

      setValidationStatus({
        isValidating: false,
        isComplete: true,
        hasWarnings: !countValid || !formatValid || !!warningMessage,
        warningMessage: warningMessage || (untaggedBenchmarkFiles.length > 0 ? `Benchmark dataset tag required for ${untaggedBenchmarkFiles.join(', ')}` : null),
        checks,
      });
    }, 250);
  };

  const addFile = (fileObj) => {
    const maxAllowed = analysisType === 'single' ? 1 : 2;
    if (stagedFiles.length >= maxAllowed) return;
    const newFiles = [...stagedFiles, fileObj];
    setStagedFiles(newFiles);
    validateInputs(newFiles, analysisType, query);
  };

  const setSlotFile = (slotIdx, fileObj) => {
    const updated = [...stagedFiles];
    updated[slotIdx] = fileObj;
    // Clean any empty slots
    const finalFiles = updated.filter(Boolean);
    setStagedFiles(finalFiles);
    validateInputs(finalFiles, analysisType, query);
  };

  const updateFileModality = (index, newModality) => {
    const updated = stagedFiles.map((file, idx) => {
      if (idx === index) {
        return {
          ...file,
          modality: newModality,
          preview: newModality === 'SAR' ? getSatelliteSvgUrl('sar-radar') : getSatelliteSvgUrl('optical-target'),
        };
      }
      return file;
    });
    setStagedFiles(updated);
    validateInputs(updated, analysisType, query);
  };

  const updateFileBenchmarkSource = (index, newBenchmarkSource) => {
    const updated = stagedFiles.map((file, idx) => {
      if (idx === index) {
        return {
          ...file,
          benchmarkSource: newBenchmarkSource,
          benchmark_source: newBenchmarkSource,
        };
      }
      return file;
    });
    setStagedFiles(updated);
    validateInputs(updated, analysisType, query);
  };


  const clearStagedFiles = () => {
    setStagedFiles([]);
    validateInputs([], analysisType, query);
  };

  const changeAnalysisType = (newType) => {
    setAnalysisType(newType);
    let updatedFiles = [...stagedFiles];
    if (newType === 'single' && updatedFiles.length > 1) {
      updatedFiles = updatedFiles.slice(0, 1);
    }
    setStagedFiles(updatedFiles);
    validateInputs(updatedFiles, newType, query);
  };

  const removeFile = (index) => {
    const updated = stagedFiles.filter((_, i) => i !== index);
    setStagedFiles(updated);
    validateInputs(updated, analysisType, query);
  };

  // Run autonomous agent pipeline
  const executeAgentAnalysis = async () => {
    setIsAgentExecuting(true);
    try {
      const result = await runAgentDemo({
        query: query || DEMO_SCENARIOS[scenarioKey]?.query,
        inputs: stagedFiles,
        inputConfiguration: { pairType: analysisType },
      });
      setActiveResult(result);
      return result;
    } finally {
      setIsAgentExecuting(false);
    }
  };

  const saveCurrentAnalysisToHistory = (customResult = null) => {
    const res = customResult || activeResult;
    if (!res) return;

    const confVal = res.confidence?.percentage || (typeof res.confidence === 'number' ? Math.round(res.confidence * 100) : 91);

    const newEntry = {
      id: `ana-${Date.now().toString().slice(-4)}`,
      query: res.query || query,
      type: res.task || 'Satellite Analysis',
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'Completed',
      confidence: confVal,
      scenarioKey: scenarioKey,
      imagesCount: stagedFiles.length || 1,
      sensor: res.inputInfo?.modalitySummary || 'Optical Multi-band',
    };
    setHistory(prev => [newEntry, ...prev]);
  };

  // Initial setup with bitemporal scenario
  useEffect(() => {
    if (stagedFiles.length === 0) {
      loadScenario('bitemporal');
    }
  }, []);

  return (
    <AnalysisContext.Provider value={{
      analysisType,
      setAnalysisType,
      scenarioKey,
      setScenarioKey,
      stagedFiles,
      setStagedFiles,
      query,
      setQuery,
      validationStatus,
      validateInputs,
      activeResult,
      setActiveResult,
      isAgentExecuting,
      executeAgentAnalysis,
      history,
      loadScenario,
      addFile,
      setSlotFile,
      updateFileModality,
      updateFileBenchmarkSource,
      clearStagedFiles,
      changeAnalysisType,
      removeFile,
      saveCurrentAnalysisToHistory,
    }}>

      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
}
