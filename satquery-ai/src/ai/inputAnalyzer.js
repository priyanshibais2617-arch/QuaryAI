/**
 * SatQuery AI - Input Analyzer
 * Analyzes staged image files and user input configurations to infer metadata,
 * modalities, temporal relationships, and structural compatibility.
 */

export function analyzeInput(inputs = [], options = {}) {
  const imageCount = Array.isArray(inputs) ? inputs.length : 0;

  // Infer individual modalities from input metadata or filenames
  const modalities = (inputs || []).map((img, idx) => {
    if (typeof img === 'string') {
      const lower = img.toLowerCase();
      if (lower.includes('sar') || lower.includes('sentinel-1') || lower.includes('radar')) return 'SAR';
      if (lower.includes('landsat') || lower.includes('multispectral')) return 'Multispectral';
      return 'Optical';
    }

    if (img && img.modality) {
      const lowerMod = img.modality.toLowerCase();
      if (lowerMod.includes('sar') || lowerMod.includes('radar')) return 'SAR';
      if (lowerMod.includes('multispectral')) return 'Multispectral';
      return 'Optical';
    }

    if (img && img.name) {
      const lowerName = img.name.toLowerCase();
      if (lowerName.includes('sar') || lowerName.includes('sentinel-1') || lowerName.includes('radar')) return 'SAR';
      if (lowerName.includes('landsat') || lowerName.includes('multispectral')) return 'Multispectral';
      return 'Optical';
    }

    return idx === 1 && options.pairType === 'optical_sar' ? 'SAR' : 'Optical';
  });

  const hasOptical = modalities.some(m => m === 'Optical' || m === 'Multispectral');
  const hasSAR = modalities.some(m => m === 'SAR');
  const isCrossModal = hasOptical && hasSAR;

  // Temporal analysis: 2 images with same sensor/modality or explicit temporal flags
  let isTemporal = false;
  if (imageCount === 2 && !isCrossModal) {
    isTemporal = true;
  } else if (options.temporal === true || options.analysisType === 'bitemporal') {
    isTemporal = true;
  }

  // Determine overall input type
  let inputType = 'single';
  if (imageCount === 1) {
    inputType = 'single';
  } else if (imageCount === 2) {
    if (isCrossModal) {
      inputType = 'cross_modal_pair';
    } else {
      inputType = 'bitemporal_pair';
    }
  } else if (imageCount > 2) {
    inputType = 'multi_image_stack';
  } else {
    inputType = 'empty';
  }

  // Summary modality string
  let detectedModalitySummary = 'Optical';
  if (isCrossModal) {
    detectedModalitySummary = 'Optical + SAR';
  } else if (modalities.length > 0) {
    detectedModalitySummary = modalities.join(', ');
  }

  return {
    imageCount,
    modalities,
    modalitySummary: detectedModalitySummary,
    temporal: isTemporal,
    crossModal: isCrossModal,
    inputType,
    compatible: imageCount > 0,
    hasOptical,
    hasSAR,
    rawInputs: inputs,
  };
}
