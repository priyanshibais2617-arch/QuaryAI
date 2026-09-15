import React from 'react';
import VQAResultView from './VQAResultView';
import GroundingResultView from './GroundingResultView';
import ChangeResultView from './ChangeResultView';
import OpticalSARResultView from './OpticalSARResultView';

export default function EvidencePanel({ result, imageSrc, imageSrcA, imageSrcB, imageSrcOptical, imageSrcSAR }) {
  if (!result) return null;

  const taskKey = result.taskKey || (
    result.task?.includes('Grounding') ? 'GROUNDING' :
    result.task?.includes('Change') ? 'CHANGE_ANALYSIS' :
    result.task?.includes('SAR') || result.task?.includes('Cross-Modal') ? 'OPTICAL_SAR_ANALYSIS' :
    'VQA'
  );

  switch (taskKey) {
    case 'GROUNDING':
      return <GroundingResultView result={result} imageSrc={imageSrc} />;

    case 'CHANGE_ANALYSIS':
    case 'CHANGE_VQA':
      return <ChangeResultView result={result} imageSrcA={imageSrcA} imageSrcB={imageSrcB} />;

    case 'OPTICAL_SAR_ANALYSIS':
      return <OpticalSARResultView result={result} imageSrcOptical={imageSrcOptical} imageSrcSAR={imageSrcSAR} />;

    case 'CAPTIONING':
    case 'VQA':
    default:
      return <VQAResultView result={result} imageSrc={imageSrc} />;
  }
}
