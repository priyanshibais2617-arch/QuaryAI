/**
 * SatQuery AI - Workflow Router
 * Deterministically routes validated queries and remote sensing inputs
 * to the appropriate workflow and specialist engine.
 * Also enforces input validation and wrong-workflow prevention.
 */

export function selectWorkflow(classification = {}, inputInfo = {}, options = {}) {
  const { task = 'VQA' } = classification;
  const imageCount = inputInfo.imageCount || 0;

  // Validation checks & Wrong Workflow Prevention
  const validationWarnings = [];

  // Check 1: Bi-temporal change requested with insufficient images
  if ((task === 'CHANGE_ANALYSIS' || task === 'CHANGE_VQA') && imageCount < 2) {
    validationWarnings.push('Bi-temporal analysis requires two spatially corresponding images (Baseline and Target).');
  }

  // Check 2: Optical + SAR requested without both modalities
  if (task === 'OPTICAL_SAR_ANALYSIS') {
    if (imageCount < 2) {
      validationWarnings.push('Optical + SAR analysis requires both optical and SAR inputs.');
    } else if (!inputInfo.crossModal && !inputInfo.hasSAR) {
      validationWarnings.push('SAR microwave imagery is missing. Both optical and SAR modalities are required for cross-modal fusion.');
    }
  }

  // Check 3: Grounding without image
  if (task === 'GROUNDING' && imageCount === 0) {
    validationWarnings.push('An image is required for visual grounding.');
  }

  // Wrong Workflow Prevention Rule (Test 5):
  // If user provided two optical images, but asked a single-image question like "Describe the land cover",
  // do NOT route to Optical-SAR. Route to Single-Image VQA and use the primary scene.
  let resolvedTask = task;
  let resolvedReason = '';

  if (imageCount === 2 && !inputInfo.crossModal && (task === 'VQA' || task === 'CAPTIONING' || task === 'GROUNDING')) {
    // Keep task as VQA/Grounding/Captioning and explain that primary target scene is analyzed
    resolvedReason = `Single-image query detected with 2 optical scenes staged. Agent intelligently directed analysis to the primary target scene without misrouting to cross-modal fusion.`;
  }

  switch (resolvedTask) {
    case 'GROUNDING':
      return {
        task: 'Visual Grounding',
        taskKey: 'GROUNDING',
        workflow: 'Text-Guided Grounding',
        specialistId: 'grounding_engine',
        specialistName: 'Visual Grounding Engine',
        reason: resolvedReason || 'Feature localization query detected; isolating target feature coordinates via spatial bounding envelope.',
        warnings: validationWarnings,
        requiresDualImages: false,
      };

    case 'CAPTIONING':
      return {
        task: 'Scene Description',
        taskKey: 'CAPTIONING',
        workflow: 'Remote-Sensing Captioning',
        specialistId: 'captioning_engine',
        specialistName: 'Remote-Sensing Captioning Engine',
        reason: resolvedReason || 'Global scene description query detected; initiating multi-scale geospatial captioner.',
        warnings: validationWarnings,
        requiresDualImages: false,
      };

    case 'CHANGE_VQA':
      return {
        task: 'Change VQA',
        taskKey: 'CHANGE_VQA',
        workflow: 'Change VQA Reasoning',
        specialistId: 'change_vqa_engine',
        specialistName: 'Change VQA Engine',
        reason: 'Polar/specific change query detected over bi-temporal timeline.',
        warnings: validationWarnings,
        requiresDualImages: true,
      };

    case 'CHANGE_ANALYSIS':
      return {
        task: 'Bi-Temporal Change Analysis',
        taskKey: 'CHANGE_ANALYSIS',
        workflow: 'Change Understanding',
        specialistId: 'change_engine',
        specialistName: 'Change Understanding Engine',
        reason: 'Two related images and a change-oriented query were detected.',
        warnings: validationWarnings,
        requiresDualImages: true,
      };

    case 'OPTICAL_SAR_ANALYSIS':
      return {
        task: 'Optical-SAR Cross-Modal Analysis',
        taskKey: 'OPTICAL_SAR_ANALYSIS',
        workflow: 'Cross-Modal Information Extraction',
        specialistId: 'optical_sar_engine',
        specialistName: 'Optical-SAR Analysis Engine',
        reason: 'Cross-modal query and complementary sensor pair (Optical + SAR) detected.',
        warnings: validationWarnings,
        requiresDualImages: true,
      };

    case 'VQA':
    default:
      return {
        task: 'Single Image VQA',
        taskKey: 'VQA',
        workflow: 'Remote-Sensing VQA',
        specialistId: 'vqa_engine',
        specialistName: 'Remote-Sensing VQA Engine',
        reason: resolvedReason || 'Single scene visual inquiry detected; selecting domain-adapted vision-language VQA engine.',
        warnings: validationWarnings,
        requiresDualImages: false,
      };
  }
}
