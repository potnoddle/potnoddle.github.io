# System One Decision Models Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish production-grade System One decision engine ingestion harnesses, OpenAPI 3.0 tool contracts, OpenClaw daemon hooks, and holdout benchmark suites across three distinct platforms for Bespoke Nimble 9B and TypeSafe Jev.

**Architecture:** Bypasses autoregressive token decoding by terminating inference at the transformer encoder's final hidden state, extracting typed logit probabilities across candidate labels in sub-100ms. Ingests via a local Ollama daemon (`/v1/systemone`) for OpenClaw agents, a two-tier FastAPI/OpenAPI gateway for Optimizely Opal DXP, and an async benchmarking client evaluating 324 holdout cases.

**Tech Stack:** Python 3.10+ (FastAPI, uvicorn, pydantic, urllib, asyncio), Node.js (fetch, child_process), Bash/cURL, Ollama 0.35+ (`nimble`), OpenAPI 3.0, JSONSchema.

**Spec:**
- [DraftMaterial/AI/System-One-Models/spec.md](file:///c:/Projects/my-research/DraftMaterial/AI/System-One-Models/spec.md)
- [DraftMaterial/Optimizely/Opal/System-One/spec.md](file:///c:/Projects/my-research/DraftMaterial/Optimizely/Opal/System-One/spec.md)
- [DraftMaterial/AI/System-One-Models/code-samples/](file:///c:/Projects/my-research/DraftMaterial/AI/System-One-Models/code-samples/)
- [potnoddle/articles-code-samples/System-One-Models/spec.md](https://github.com/potnoddle/articles-code-samples/blob/main/System-One-Models/spec.md)

## Global Constraints

- **UK English**: Enforce standard British spelling conventions (e.g. *optimised*, *quantisation*, *categorisation*, *prioritise*) across prose and documentation.
- **Sub-100ms SLA Target**: Decision endpoints and triage hooks must resolve typical classification payloads in <100ms on modern silicon.
- **Zero Output Metering**: No generated explanatory natural language tokens; outputs strictly confined to typed enums, booleans, and floats.
- **Bounded Hallucinations**: Enforce rigid candidate label sets across all ingress schemas to mathematically prevent syntax or schema drift.
- **Two-Brain Topology**: Primary Brain (Generative LLM) handles conversational synthesis; Secondary Brain (System One) handles high-speed deterministic routing.

---

### Task 1: OpenClaw Heartbeat & Triage Integration (`01-openclaw-heartbeat-triage`)

**Files:**
- Create: `System-One-Models/01-openclaw-heartbeat-triage/spec.md`
- Create: `System-One-Models/01-openclaw-heartbeat-triage/README.md`
- Create: `System-One-Models/01-openclaw-heartbeat-triage/heartbeat_triage_hook.py`
- Create: `System-One-Models/01-openclaw-heartbeat-triage/heartbeat_triage_hook.js`
- Create: `System-One-Models/01-openclaw-heartbeat-triage/sample-workspace/AGENTS.md`
- Create: `System-One-Models/01-openclaw-heartbeat-triage/sample-workspace/HEARTBEAT.md`

**Interfaces:**
- Consumes: Local Ollama `/v1/systemone` HTTP endpoint or TypeSafe Jev Bearer token.
- Produces: CLI exit code `0` (silent clean pulse) or `1` (escalation required) with structured decision payload printed to stdout.

- [x] **Step 1: Write platform specification (`spec.md`)**
  Define Two-Brain interaction model, `/v1/systemone` request/response schemas, and 30-minute heartbeat SLAs.
- [x] **Step 2: Implement Python daemon hook (`heartbeat_triage_hook.py`)**
  Inspect `git status` and `HEARTBEAT.md`, dispatch single-pass payload to Ollama Nimble, and enforce silence rule.
- [x] **Step 3: Implement Node.js daemon hook (`heartbeat_triage_hook.js`)**
  Provide native JavaScript/TypeScript equivalent for OpenClaw runtime event loop.
- [x] **Step 4: Create sample workspace files**
  Configure `AGENTS.md` (mandatory System One pre-execution guardrail SOP) and `HEARTBEAT.md` (machine-readable checks).
- [x] **Step 5: Verify execution**
  Run: `python heartbeat_triage_hook.py --workspace ./sample-workspace` -> verified clean exit (0 tokens).

---

### Task 2: Optimizely Opal Two-Tier Integration Harness (`02-optimizely-opal-harness`)

**Files:**
- Create: `System-One-Models/02-optimizely-opal-harness/spec.md`
- Create: `System-One-Models/02-optimizely-opal-harness/README.md`
- Create: `System-One-Models/02-optimizely-opal-harness/openapi.yaml`
- Create: `System-One-Models/02-optimizely-opal-harness/serving_gateway.py`
- Create: `System-One-Models/02-optimizely-opal-harness/n8n_opal_workflow.json`
- Create: `System-One-Models/02-optimizely-opal-harness/requirements.txt`

**Interfaces:**
- Consumes: Inbound HTTP POST from Optimizely CMP/CMS with `X-Sovereign-Auth-Token`.
- Produces: `DecisionResponse` with `selected_label`, `confidence`, `passed`, and `scores`.

- [x] **Step 1: Write enterprise platform specification (`spec.md`)**
  Document SaaS boundary isolation, two-tier topology, and 250-page compliance batch audit flow.
- [x] **Step 2: Author OpenAPI 3.0 manifest (`openapi.yaml`)**
  Define `/v1/decision` tool contract, security schemes, and enum constraints for CMP Developer Console registration.
- [x] **Step 3: Implement FastAPI serving gateway (`serving_gateway.py`)**
  Enforce API token authentication, log latency in milliseconds, and bridge to local Nimble or cloud Jev.
- [x] **Step 4: Build n8n webhook workflow (`n8n_opal_workflow.json`)**
  Create low-code connector between CMS publish events and the decision engine.
- [x] **Step 5: Define requirements (`requirements.txt`)**
  Pin `fastapi`, `uvicorn`, `pydantic`, and `requests`.

---

### Task 3: Direct Benchmarking Suite & Holdout Validation (`03-direct-benchmarking-clients`)

**Files:**
- Create: `System-One-Models/03-direct-benchmarking-clients/spec.md`
- Create: `System-One-Models/03-direct-benchmarking-clients/README.md`
- Create: `System-One-Models/03-direct-benchmarking-clients/test_systemone_clients.py`
- Create: `System-One-Models/03-direct-benchmarking-clients/benchmark_curl_suite.sh`
- Create: `System-One-Models/03-direct-benchmarking-clients/benchmark_results_schema.json`

**Interfaces:**
- Consumes: 324-example holdout dataset prompts across security, routing, and compliance.
- Produces: Benchmark JSON report conforming to `benchmark_results_schema.json`.

- [x] **Step 1: Write benchmarking specification (`spec.md`)**
  Formalise 324-holdout suite taxonomy and latency standards (**TypeSafe Jev: 302/324**, **Nimble: 292/324**).
- [x] **Step 2: Author JSON validation schema (`benchmark_results_schema.json`)**
  Ensure CI/CD telemetry outputs strictly validate fields (P50, P95, accuracy, token cost).
- [x] **Step 3: Implement async benchmarking client (`test_systemone_clients.py`)**
  Benchmark latency distributions, calculate percentile statistics, and output JSON summaries.
- [x] **Step 4: Author portable shell suite (`benchmark_curl_suite.sh`)**
  Provide cURL latency verification script for deployment validation.
- [x] **Step 5: Verify execution**
  Run: `python test_systemone_clients.py --iterations 1` -> verified 100% test pass and schema export.

---

### Task 4: Repository Documentation & GitHub Upstream Packaging

**Files:**
- Create: `System-One-Models/spec.md`
- Create: `System-One-Models/README.md`
- Modify: `README.md` (root directory)

**Interfaces:**
- Consumes: Platform submodules 01, 02, and 03.
- Produces: Consolidated GitHub repository documentation and published roadmap entries.

- [x] **Step 1: Create master specification (`System-One-Models/spec.md`)**
  Aggregate theoretical foundations, latency comparisons, and platform references.
- [x] **Step 2: Create master README (`System-One-Models/README.md`)**
  Provide cross-platform navigation, model comparison matrix, and quickstart commands.
- [x] **Step 3: Update repository root `README.md`**
  Add `System-One-Models/` to repository directory tree, navigation links, and article matrix.
- [x] **Step 4: Commit & push upstream**
  Commit all files to `main` branch (`2c1a83b`) and push to `https://github.com/potnoddle/articles-code-samples.git`.
