/**
 * SatQuery AI - Mock Model Registry & Remote-Sensing Adaptation
 * Registry of modular vision-language specialists and conceptual representation of domain adaptation.
 */

export const MOCK_MODEL_REGISTRY = [
  {
    id: 'vqa_engine',
    name: 'Remote-Sensing VQA Engine',
    task: 'Single Image VQA',
    modality: 'Optical / Multispectral',
    version: 'v2.1-adapted',
    status: 'Simulated Prototype Specialist',
    description: 'Specialized vision-language architecture fine-tuned on earth observation imagery for complex scene attribute Q&A.',
    architecture: 'Dual-scale Swin-Transformer + Geospatial VLM Decoder',
    parameters: '350M parameters (simulated)',
  },
  {
    id: 'captioning_engine',
    name: 'Remote-Sensing Captioning Engine',
    task: 'Scene Description',
    modality: 'Optical / Multispectral',
    version: 'v1.8-adapted',
    status: 'Simulated Prototype Specialist',
    description: 'Generates cohesive natural language summaries detailing land cover distribution and structural features.',
    architecture: 'Geo-Patch Tokenizer + Autoregressive Language Head',
    parameters: '220M parameters (simulated)',
  },
  {
    id: 'grounding_engine',
    name: 'Visual Grounding Engine',
    task: 'Visual Grounding',
    modality: 'Optical / Multispectral / SAR',
    version: 'v3.2-grounding',
    status: 'Simulated Prototype Specialist',
    description: 'Localizes spatial entities referenced in text queries into precise pixel-aligned bounding boxes and confidence envelopes.',
    architecture: 'Spatial Cross-Attention Transformer + Coordinate Bounding Regressor',
    parameters: '180M parameters (simulated)',
  },
  {
    id: 'change_engine',
    name: 'Change Understanding Engine',
    task: 'Bi-Temporal Change Analysis',
    modality: 'Bi-Temporal Optical / SAR',
    version: 'v4.0-diff',
    status: 'Simulated Prototype Specialist',
    description: 'Differential Siamese network detecting anthropogenic expansion, vegetation loss, and hydrological dynamics over time.',
    architecture: 'Siamese ResNet-50 + Temporal Cross-Attention Differential Head',
    parameters: '410M parameters (simulated)',
  },
  {
    id: 'change_vqa_engine',
    name: 'Change VQA Engine',
    task: 'Change VQA',
    modality: 'Bi-Temporal Optical',
    version: 'v2.4-change-vqa',
    status: 'Simulated Prototype Specialist',
    description: 'Answers targeted temporal questions about spatial changes between two co-registered acquisition dates.',
    architecture: 'Temporal Contrastive Vision-Language Reasoner',
    parameters: '310M parameters (simulated)',
  },
  {
    id: 'optical_sar_engine',
    name: 'Optical-SAR Analysis Engine',
    task: 'Optical-SAR Cross-Modal Analysis',
    modality: 'Optical + SAR (Dual-Sensor)',
    version: 'v2.9-cross-modal',
    status: 'Simulated Prototype Specialist',
    description: 'Multi-sensor fusion engine correlating optical spectral absorption with synthetic aperture radar (SAR) microwave backscatter.',
    architecture: 'SAR-Optical Cross-Modal Attention Fusion (SOC-Net)',
    parameters: '480M parameters (simulated)',
  },
];

export const REMOTE_SENSING_ADAPTATION_METADATA = {
  title: 'Remote-Sensing Domain Adaptation Architecture',
  status: 'Prototype Representation',
  trainingSource: 'BigEarthNet.txt / Open Remote-Sensing Datasets (Sentinel-1, Sentinel-2, Landsat-9)',
  adaptationStrategy: 'Domain-Specific Pretraining + Instruction Tuning with Geospatial Visual Prompts',
  targetComponent: 'Remote-Sensing Adapted Foundation Component',
  pipelineSteps: [
    {
      id: 'step-1',
      title: 'Open RS Data Collection',
      detail: 'BigEarthNet (590k image pairs), Sentinel-2 MSI, Sentinel-1 SAR imagery.',
      icon: 'Database',
    },
    {
      id: 'step-2',
      title: 'Domain Adaptation & Fine-Tuning',
      detail: 'Contrastive pre-training on multispectral bands + geospatial vision-language adapter layers.',
      icon: 'Cpu',
    },
    {
      id: 'step-3',
      title: 'RS-Adapted Component',
      detail: 'Produces sensor-invariant embeddings capable of interpreting high-resolution earth features.',
      icon: 'Sparkles',
    },
    {
      id: 'step-4',
      title: 'Model Registry Registration',
      detail: 'Specialist engines register capabilities, modalities, and task contracts with the Agent.',
      icon: 'Boxes',
    },
    {
      id: 'step-5',
      title: 'Autonomous Agent Dispatch',
      detail: 'The SatQuery Agentic Controller matches queries and sensor rasters directly to the specialist.',
      icon: 'Satellite',
    },
  ],
  disclaimer: 'Note: Domain adaptation is architecturally mapped in this prototype. Actual deep model weights and training runs will be deployed in the backend phase.',
};
