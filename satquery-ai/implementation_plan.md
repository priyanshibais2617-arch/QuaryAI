# SatQuery AI — Mandatory MVP AI Prototype Implementation Plan

We are implementing the **SatQuery AI MVP AI Prototype** to demonstrate the core intelligence flow and all mandatory remote-sensing vision-language capabilities required by the problem statement:
1. **Single-Image VQA** (Remote-Sensing Scene Understanding)
2. **Second Single-Image Capability**: **Visual Grounding** (Spatial localization with bounding boxes) AND **Scene Captioning**
3. **Bi-Temporal Change Analysis** (Before/After differential mapping & Change VQA)
4. **Optical + SAR Cross-Modal Analysis** (Multi-sensor complementary fusion)
5. **Deterministic Agentic Orchestration** (Automatic input analysis, query classification, workflow routing, specialist selection, execution trace, and result integration)
6. **Remote-Sensing Adaptation Representation** (BigEarthNet / Open RS domain adaptation architecture)
7. **SIH Agent Playground** (`/dashboard/agent-demo`) & 1-click evaluation scenarios

---

## User Review Required

> [!IMPORTANT]
> **Prototype Simulation vs. Production AI**: As specified in the prompt, this implementation provides a robust, modular, client-side deterministic agent controller with simulated specialist engines, realistic structured outputs, and clean service boundaries (`mockAgentService.js`). No real GPU training or heavy external LLM calls are used, ensuring 100% offline reliability for evaluation.

> [!NOTE]
> All existing dashboard pages (Analytics, Images, History, Reports, Settings) will remain intact and will now reflect the dynamic agent outputs. A dedicated **Agent Playground** (`/dashboard/agent-demo`) is added to give evaluators and judges instant interactive access to the agentic decision flow.

---

## Architecture & Data Flow

```text
Natural Language Query + Remote-Sensing Image(s)
                      │
                      ▼
         [Input Analyzer (inputAnalyzer.js)]
   (Detects count: 1/2, modalities, temporal/cross-modal)
                      │
                      ▼
       [Query Classifier (queryClassifier.js)]
   (Deterministic keyword/intent matching: VQA, Grounding,
    Captioning, Change, Change-VQA, Optical-SAR)
                      │
                      ▼
        [Workflow Router (workflowRouter.js)]
   (Validates compatibility, prevents wrong workflows,
    maps to target workflow & specialist engine)
                      │
                      ▼
        [Agent Controller (mockAgent.js)]
   (Executes specialist, generates step-by-step execution trace)
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
[Specialist Engines]        [Model Registry & RS Adaptation]
- mockVQA.js                - BigEarthNet / Open RS data
- mockGrounding.js          - 6 registered specialist engines
- mockCaptioning.js
- mockChange.js
- mockChangeVQA.js
- mockOpticalSAR.js
        │
        ▼
   [Result Integrator (resultIntegrator.js)]
   (Standardized contract: task, workflow, specialist, answer,
    confidence, evidence, executionTrace, prototype: true)
                      │
                      ▼
     [Frontend Service (mockAgentService.js)]
                      │
                      ▼
  [Unified Results Shell + Task-Specific Result Views]
  - VQAResultView
  - GroundingResultView (Interactive bounding box overlay)
  - ChangeResultView (Before / After / Highlighted Change)
  - OpticalSARResultView (Optical vs. SAR dual visualizer)
  - AgentDecisionCard & ExecutionTrace
```

---

## Proposed Changes

### 1. AI Core Engine (`src/ai/`)

#### [NEW] [`inputAnalyzer.js`](file:///c:/Users/USER/OneDrive/Desktop/satquery-ai/src/ai/inputAnalyzer.js)
- Inspects staged files and metadata:
  - `imageCount` (1 or 2)
  - `modalities` (`['Optical']`, `['Optical', 'SAR']`, `['Multispectral']`, etc.)
  - `isTemporalPair` (true if two optical/multispectral images separated by time)
  - `isCrossModalPair` (true if one optical and one SAR)
  - `validationIssues` (flags missing pairs or modality mismatches)

#### [NEW] [`queryClassifier.js`](file:///c:/Users/USER/OneDrive/Desktop/satquery-ai/src/ai/queryClassifier.js)
- Deterministic keyword and semantic pattern matcher:
  - `VQA`: "describe", "what is visible", "land cover", "what objects", "vegetation", "is there"
  - `GROUNDING`: "where", "locate", "highlight", "identify the water body", "pinpoint", "bounding box"
  - `CAPTIONING`: "describe the scene", "generate caption", "summarize scene"
  - `CHANGE_ANALYSIS`: "what changed", "change between", "increased", "decreased", "before and after", "expansion"
  - `CHANGE_VQA`: "has the built-up area increased", "has vegetation decreased", "did water bodies change"
  - `OPTICAL_SAR_ANALYSIS`: "optical and sar", "both images", "combine optical and sar", "cross-modal", "microwave"
  - Fallback: `GENERAL_RS_QUERY` (with graceful guidance)

#### [NEW] [`workflowRouter.js`](file:///c:/Users/USER/OneDrive/Desktop/satquery-ai/src/ai/workflowRouter.js)
- Validates query against input metadata:
  - Wrong workflow prevention (e.g., 2 optical images with "describe land cover" routes to single-scene interpretation with notice, or explains pairing)
  - Enforces preconditions: Bi-temporal requires 2 images, Optical+SAR requires both optical and SAR images, Grounding requires at least 1 image.
  - Determines: `task`, `workflow`, `specialistId`, `rationale`

#### [NEW] [`mockAgent.js`](file:///c:/Users/USER/OneDrive/Desktop/satquery-ai/src/ai/mockAgent.js)
- The main agent controller:
  - `runAgent({ query, inputs, inputConfiguration })`
  - Assembles realistic `executionTrace` steps with timestamps and status:
    1. Input received
    2. Input validated & sensor modalities identified
    3. Query parsed & intention extracted
    4. Task classified
    5. Agentic workflow & specialist engine selected
    6. Specialist execution completed
    7. Visual evidence synthesized
    8. Confidence calibrated & normalized
    9. Final result integrated

#### [NEW] [`resultIntegrator.js`](file:///c:/Users/USER/OneDrive/Desktop/satquery-ai/src/ai/resultIntegrator.js)
- Normalizes all specialist outputs into the unified contract:
  - `task`, `workflow`, `specialist`, `answer`, `confidence: { value, type: "prototype", label: "Prototype Confidence" }`, `evidence`, `summaryCards`, `executionTrace`, `prototype: true`.

#### [NEW] Specialist Engines (`src/ai/mockSpecialists/`)
- [`mockVQA.js`](file:///c:/Users/USER/OneDrive/Desktop/satquery-ai/src/ai/mockSpecialists/mockVQA.js): Returns land cover breakdown, detected categories, detailed reasoning, 91% confidence.
- [`mockGrounding.js`](file:///c:/Users/USER/OneDrive/Desktop/satquery-ai/src/ai/mockSpecialists/mockGrounding.js): Returns localized feature answer, spatial coordinates, bounding box (`{ x: 34, y: 38, width: 40, height: 36 }`), 94% confidence.
- [`mockCaptioning.js`](file:///c:/Users/USER/OneDrive/Desktop/satquery-ai/src/ai/mockSpecialists/mockCaptioning.js): Returns multi-category natural scene captions, detected classes, 93% confidence.
- [`mockChange.js`](file:///c:/Users/USER/OneDrive/Desktop/satquery-ai/src/ai/mockSpecialists/mockChange.js): Returns built-up expansion description, affected region, change clusters, 91% confidence.
- [`mockChangeVQA.js`](file:///c:/Users/USER/OneDrive/Desktop/satquery-ai/src/ai/mockSpecialists/mockChangeVQA.js): Returns direct affirmative/negative change answers with supporting metrics, 92% confidence.
- [`mockOpticalSAR.js`](file:///c:/Users/USER/OneDrive/Desktop/satquery-ai/src/ai/mockSpecialists/mockOpticalSAR.js): Returns fused optical spectral fidelity + SAR microwave backscatter analysis, double-bounce detection, cloud immunity, 89% confidence.

---

### 2. Service Layer & Model Registry

#### [NEW] [`src/services/mockAgentService.js`](file:///c:/Users/USER/OneDrive/Desktop/satquery-ai/src/services/mockAgentService.js)
- Clean, backend-ready abstraction layer:
  - `runAgentDemo(params)`: Executes agent controller asynchronously (simulating latency).
  - `validateInputs(inputs, expectedTask)`: Pre-execution validation.
  - Ready to be swapped with real REST/WebSocket API in the future.

#### [NEW] [`src/data/mockModelRegistry.js`](file:///c:/Users/USER/OneDrive/Desktop/satquery-ai/src/data/mockModelRegistry.js)
- Complete registry of the 6 specialist engines:
  - `Remote-Sensing VQA Engine`
  - `Remote-Sensing Captioning Engine`
  - `Visual Grounding Engine`
  - `Change Understanding Engine`
  - `Change VQA Engine`
  - `Optical-SAR Analysis Engine`
- Remote-Sensing Adaptation Architecture section:
  - `BigEarthNet.txt` / Open Remote-Sensing Data -> Domain Adaptation / Fine-Tuning -> RS-Adapted Foundation Component -> Model Registry -> Agent.

---

### 3. UI Components (`src/components/`)

#### [NEW] Agentic Inspection Components (`src/components/agent/`)
- [`AgentDecisionCard.jsx`](file:///c:/Users/USER/OneDrive/Desktop/satquery-ai/src/components/agent/AgentDecisionCard.jsx): Prominently showcases the agent's autonomous decisions: Detected Task, Selected Workflow, Specialist Engine, and Reasoning.
- [`ExecutionTrace.jsx`](file:///c:/Users/USER/OneDrive/Desktop/satquery-ai/src/components/agent/ExecutionTrace.jsx): Expandable timeline displaying every execution milestone, timestamp, and status tag.
- [`WorkflowVisualization.jsx`](file:///c:/Users/USER/OneDrive/Desktop/satquery-ai/src/components/agent/WorkflowVisualization.jsx): Interactive node diagram of the active pipeline.
- [`RemoteSensingAdaptationCard.jsx`](file:///c:/Users/USER/OneDrive/Desktop/satquery-ai/src/components/agent/RemoteSensingAdaptationCard.jsx): Visualizes the BigEarthNet domain adaptation pipeline.

#### [NEW] Task-Specific Result Views (`src/components/results/`)
- [`VQAResultView.jsx`](file:///c:/Users/USER/OneDrive/Desktop/satquery-ai/src/components/results/VQAResultView.jsx): Image inspector with categorical land cover distribution (Vegetation, Built-up, Open Land, Water) and spectral attributes.
- [`GroundingResultView.jsx`](file:///c:/Users/USER/OneDrive/Desktop/satquery-ai/src/components/results/GroundingResultView.jsx): Dynamic bounding box overlay with crosshairs, toggleable bounding envelope, and target coordinates.
- [`ChangeResultView.jsx`](file:///c:/Users/USER/OneDrive/Desktop/satquery-ai/src/components/results/ChangeResultView.jsx): Synchronized Before (T1) vs. After (T2) visualizer with highlighted change region toggle and expansion statistics.
- [`OpticalSARResultView.jsx`](file:///c:/Users/USER/OneDrive/Desktop/satquery-ai/src/components/results/OpticalSARResultView.jsx): Side-by-side / split Optical RGB vs. SAR Microwave backscatter with fused feature highlights.
- [`ConfidenceDisplay.jsx`](file:///c:/Users/USER/OneDrive/Desktop/satquery-ai/src/components/results/ConfidenceDisplay.jsx): Calibrated confidence badge explicitly labeled "Prototype Confidence".
- [`EvidencePanel.jsx`](file:///c:/Users/USER/OneDrive/Desktop/satquery-ai/src/components/results/EvidencePanel.jsx): Container routing to the appropriate specialist result view.

#### [NEW] Demo & Evaluation Components (`src/components/demo/`)
- [`DemoScenarioSelector.jsx`](file:///c:/Users/USER/OneDrive/Desktop/satquery-ai/src/components/demo/DemoScenarioSelector.jsx): 1-click preset bar:
  - "Try VQA Demo"
  - "Try Grounding Demo"
  - "Try Bi-Temporal Demo"
  - "Try Optical + SAR Demo"
  - "Try Captioning Demo"
- [`AgentPlayground.jsx`](file:///c:/Users/USER/OneDrive/Desktop/satquery-ai/src/components/demo/AgentPlayground.jsx): Dedicated SIH demonstration page (`/dashboard/agent-demo`) allowing live evaluation of arbitrary queries, instant preset loading, and inspection of input analysis, query classification, workflow selection, execution trace, and results.

---

### 4. Integration into Pages & Context

#### [MODIFY] [`src/context/AnalysisContext.jsx`](file:///c:/Users/USER/OneDrive/Desktop/satquery-ai/src/context/AnalysisContext.jsx)
- Connect with `mockAgentService.js`:
  - Run `runAgentDemo` during analysis execution.
  - Store full normalized agent response (`task`, `workflow`, `specialist`, `executionTrace`, `evidence`, `confidence`, `summary`).
  - Pre-configure 1-click demo scenarios for all mandatory MVPs.

#### [MODIFY] [`src/pages/Processing.jsx`](file:///c:/Users/USER/OneDrive/Desktop/satquery-ai/src/pages/Processing.jsx)
- Show dynamic agent logs driven by the agent's actual execution trace.
- Display Agent Decision preview in real time.

#### [MODIFY] [`src/pages/Results.jsx`](file:///c:/Users/USER/OneDrive/Desktop/satquery-ai/src/pages/Results.jsx)
- Render the common result shell:
  - Result Header + Prototype Mode notice
  - Agent Decision Card (Task, Workflow, Specialist, Reason)
  - AI Answer Card
  - Evidence View (dynamically selects `VQAResultView`, `GroundingResultView`, `ChangeResultView`, or `OpticalSARResultView`)
  - Confidence Display with "Prototype Confidence"
  - Summary Cards
  - Expandable Execution Trace
  - Remote-Sensing Adaptation reference panel

#### [MODIFY] [`src/pages/NewAnalysis.jsx`](file:///c:/Users/USER/OneDrive/Desktop/satquery-ai/src/pages/NewAnalysis.jsx)
- Add 1-click Demo Scenario Buttons directly in the configuration view.
- Support validation alerts for incompatible image/query pairs (e.g. 1 image for bi-temporal query).

#### [MODIFY] [`src/App.jsx`](file:///c:/Users/USER/OneDrive/Desktop/satquery-ai/src/App.jsx) & [`src/components/layout/Sidebar.jsx`](file:///c:/Users/USER/OneDrive/Desktop/satquery-ai/src/components/layout/Sidebar.jsx)
- Add `/dashboard/agent-demo` route (`AgentPlayground`) and sidebar navigation item "Agent Playground" with a prominent "SIH Demo" badge.

---

## Verification Plan

### Automated / Syntax Verification
- Run `npm run build` or `npx oxlint` to ensure 0 syntax or bundling errors.

### Manual Acceptance Tests (per Section 39 of User Request)
1. **Test 1 — VQA**:
   - Staging: 1 optical image
   - Query: "Describe the land cover in this image."
   - Verify: Task = `VQA`, Workflow = `Remote-Sensing VQA`, Specialist = `Remote-Sensing VQA Engine`, Confidence = 91%, Land cover categories displayed.
2. **Test 2 — Grounding**:
   - Staging: 1 image
   - Query: "Where is the water body?"
   - Verify: Task = `Visual Grounding`, Specialist = `Visual Grounding Engine`, Bounding box overlay and spatial coordinates displayed.
3. **Test 3 — Bi-Temporal Change**:
   - Staging: 2 images (Before & After)
   - Query: "What changed between these two dates?"
   - Verify: Task = `Bi-Temporal Change Analysis`, Specialist = `Change Understanding Engine`, Before/After visualizer + highlighted change region displayed.
4. **Test 4 — Optical + SAR**:
   - Staging: 1 Optical + 1 SAR image
   - Query: "Identify built-up and water-covered regions using both optical and SAR."
   - Verify: Task = `Optical-SAR Cross-Modal Analysis`, Specialist = `Optical-SAR Analysis Engine`, Dual optical/SAR views + combined findings displayed.
5. **Test 5 — Wrong Workflow Prevention & Validation**:
   - Test 1 image + "What changed between these dates?" -> Validation message informs that bi-temporal analysis requires 2 images.
   - Test 1 optical image + "Combine optical and SAR" -> Informs that optical + SAR requires both modalities.
6. **Test 6 — Agent Playground (`/dashboard/agent-demo`)**:
   - Test 1-click demo buttons ("Try VQA Demo", "Try Grounding Demo", "Try Bi-Temporal Demo", "Try Optical + SAR Demo").
   - Confirm instant population, execution, decision card display, and trace expansion.
