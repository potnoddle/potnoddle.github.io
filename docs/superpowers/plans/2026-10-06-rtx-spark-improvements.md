# RTX-Spark Audit & Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct all typographical errors, legacy broken file paths, severe formatting defects, structural duplications, and outdated audit registries across the entire `DraftMaterial/RTX-Spark` directory.

**Architecture:** A 6-phase systematic cleanup and normalization workflow:
1. Rename mistyped folders and files, fixing in-text typos.
2. Batch-repair legacy hardcoded file paths (`c:/Work/Projects/My-Articles/` and `c:/Projects/My-Articles/`) to portable relative links or current workspace roots.
3. Clean up formatting in `PulseIQ_Research_Draft.md` (strip pervasive bold-italics `***` artifacts) and standardize `Health/draft.md`.
4. Deduplicate redundant files in `JEPA` and consolidate `security-pipelines` into `Security-Suite`.
5. Fix content defects, copy-paste errors, and establish `Economics/draft.md` + `metadata.md`.
6. Rebuild `task_list.md` into a comprehensive 28-folder audit and status registry.

**Tech Stack:** PowerShell 7 (pwsh), Python 3.12, Markdown, Git.

**Spec:** The audit analysis conducted in conversation ID `c51624c9-d803-4e69-ba7f-38216e956f7f`.

## Global Constraints
- All file operations must preserve existing file content and technical substance unless specifically targeting typos, duplicate formatting, or broken URLs.
- Clickable markdown file links must use valid forward-slash paths or clean relative links.
- Do not introduce breaking changes to existing runnable Python scripts or test files.

---

### Task 1: Folder & File Typo Renaming & Text Typo Fixes

**Files:**
- Rename: `c:\Projects\my-research\DraftMaterial\RTX-Spark\esclation-trap` -> `c:\Projects\my-research\DraftMaterial\RTX-Spark\escalation-trap`
- Rename: `c:\Projects\my-research\DraftMaterial\RTX-Spark\Optimizley` -> `c:\Projects\my-research\DraftMaterial\RTX-Spark\Optimizely`
- Rename: `c:\Projects\my-research\DraftMaterial\RTX-Spark\Master-Debator` -> `c:\Projects\my-research\DraftMaterial\RTX-Spark\Master-Debater`
- Rename: `c:\Projects\my-research\DraftMaterial\RTX-Spark\Agents\reseach.md` -> `c:\Projects\my-research\DraftMaterial\RTX-Spark\Agents\research.md`
- Rename: `c:\Projects\my-research\DraftMaterial\RTX-Spark\Financial\reseach.md` -> `c:\Projects\my-research\DraftMaterial\RTX-Spark\Financial\research.md`
- Rename: `c:\Projects\my-research\DraftMaterial\RTX-Spark\Images\cluade.md` -> `c:\Projects\my-research\DraftMaterial\RTX-Spark\Images\claude.md`
- Rename: `c:\Projects\my-research\DraftMaterial\RTX-Spark\Images\reseach.md` -> `c:\Projects\my-research\DraftMaterial\RTX-Spark\Images\research.md`
- Rename: `c:\Projects\my-research\DraftMaterial\RTX-Spark\Mixture-of-Experts\merge the following research and ensure you have....md` -> `c:\Projects\my-research\DraftMaterial\RTX-Spark\Mixture-of-Experts\research-merged.md`
- Modify: `c:\Projects\my-research\DraftMaterial\RTX-Spark\OpenCV\SPEC.md:30`
- Modify: `c:\Projects\my-research\DraftMaterial\RTX-Spark\escalation-trap\draft.md:65`
- Modify: `c:\Projects\my-research\DraftMaterial\RTX-Spark\Mixture-of-Experts\draft.md:9`

- [ ] **Step 1: Rename directories via PowerShell**
  Rename `esclation-trap` -> `escalation-trap`, `Optimizley` -> `Optimizely`, `Master-Debator` -> `Master-Debater`.
  ```powershell
  Move-Item -Path "c:\Projects\my-research\DraftMaterial\RTX-Spark\esclation-trap" -Destination "c:\Projects\my-research\DraftMaterial\RTX-Spark\escalation-trap"
  Move-Item -Path "c:\Projects\my-research\DraftMaterial\RTX-Spark\Optimizley" -Destination "c:\Projects\my-research\DraftMaterial\RTX-Spark\Optimizely"
  Move-Item -Path "c:\Projects\my-research\DraftMaterial\RTX-Spark\Master-Debator" -Destination "c:\Projects\my-research\DraftMaterial\RTX-Spark\Master-Debater"
  ```

- [ ] **Step 2: Rename mistyped markdown files**
  Rename `reseach.md`, `cluade.md`, and raw prompt file in `Mixture-of-Experts`.
  ```powershell
  Move-Item -Path "c:\Projects\my-research\DraftMaterial\RTX-Spark\Agents\reseach.md" -Destination "c:\Projects\my-research\DraftMaterial\RTX-Spark\Agents\research.md"
  Move-Item -Path "c:\Projects\my-research\DraftMaterial\RTX-Spark\Financial\reseach.md" -Destination "c:\Projects\my-research\DraftMaterial\RTX-Spark\Financial\research.md"
  Move-Item -Path "c:\Projects\my-research\DraftMaterial\RTX-Spark\Images\cluade.md" -Destination "c:\Projects\my-research\DraftMaterial\RTX-Spark\Images\claude.md"
  Move-Item -Path "c:\Projects\my-research\DraftMaterial\RTX-Spark\Images\reseach.md" -Destination "c:\Projects\my-research\DraftMaterial\RTX-Spark\Images\research.md"
  Move-Item -Path "c:\Projects\my-research\DraftMaterial\RTX-Spark\Mixture-of-Experts\merge the following research and ensure you have....md" -Destination "c:\Projects\my-research\DraftMaterial\RTX-Spark\Mixture-of-Experts\research-merged.md"
  ```

- [ ] **Step 3: Fix in-text typos**
  - In `c:\Projects\my-research\DraftMaterial\RTX-Spark\OpenCV\SPEC.md:30`: change `monter` to `monitor`.
  - In `c:\Projects\my-research\DraftMaterial\RTX-Spark\escalation-trap\draft.md:65`: change `permutuations` to `permutations`.
  - In `c:\Projects\my-research\DraftMaterial\RTX-Spark\Mixture-of-Experts\draft.md:9`: change `frontier frontier AI models` to `frontier AI models`.

- [ ] **Step 4: Verify renamed paths exist and typos are resolved**
  Run:
  ```powershell
  Test-Path "c:\Projects\my-research\DraftMaterial\RTX-Spark\escalation-trap"
  Test-Path "c:\Projects\my-research\DraftMaterial\RTX-Spark\Optimizely"
  Test-Path "c:\Projects\my-research\DraftMaterial\RTX-Spark\Master-Debater"
  ```

---

### Task 2: Broken Legacy Paths & Cross-Reference Link Repairs

**Files:**
- Modify: `c:\Projects\my-research\DraftMaterial\RTX-Spark\Industries\README.md`
- Modify: `c:\Projects\my-research\DraftMaterial\RTX-Spark\projects.md`
- Modify: `c:\Projects\my-research\DraftMaterial\RTX-Spark\Master-Debater\neil-hansen-debate-analysis.md`
- Modify: `c:\Projects\my-research\DraftMaterial\RTX-Spark\MiroFish\applications.md`
- Modify: `c:\Projects\my-research\DraftMaterial\RTX-Spark\MiroFish\research.md`
- Modify: `c:\Projects\my-research\DraftMaterial\RTX-Spark\Behavioural\Economics\draft.md`
- Modify: `c:\Projects\my-research\DraftMaterial\RTX-Spark\Behavioural\Science\draft.md`
- Modify: `c:\Projects\my-research\DraftMaterial\RTX-Spark\escalation-trap\draft.md`
- Modify: `c:\Projects\my-research\DraftMaterial\RTX-Spark\Mixture-of-Experts\metadata.md`

- [ ] **Step 1: Replace hardcoded paths in `Industries/README.md`**
  Replace all `file:///c:/Projects/My-Articles/DraftMaterial/RTX-Spark/Industries/` occurrences with clean relative links `./` (e.g. `[aec.md](./aec.md)`).
- [ ] **Step 2: Fix legacy links in `projects.md`**
  Update line 83 and 90 to link to `c:/Projects/my-research/DraftMaterial/RTX-Spark/Industries/README.md` or `./Industries/README.md`.
- [ ] **Step 3: Fix legacy links in `Master-Debater/neil-hansen-debate-analysis.md`**
  Update line 3 to link to `./chats.md`.
- [ ] **Step 4: Fix legacy links in `MiroFish` markdown files**
  In `applications.md` and `research.md`, update references to Digital Oracle.
- [ ] **Step 5: Fix extract path comments in drafts**
  In `Behavioural/Economics/draft.md`, `Behavioural/Science/draft.md`, and `escalation-trap/draft.md`, fix `# Extract from c/Work/Projects/My-Articles/...` to point to current workspace paths.
- [ ] **Step 6: Verify zero stale path occurrences remain**
  Run:
  ```powershell
  pwsh -Command 'Get-ChildItem -Path "c:\Projects\my-research\DraftMaterial\RTX-Spark" -Recurse -Include *.md | Select-String -Pattern "c:[\\/]Work[\\/]Projects[\\/]My-Articles|c:[\\/]Projects[\\/]My-Articles"'
  ```
  Expected: No matches returned.

---

### Task 3: Formatting Normalization of `Health/PulseIQ_Research_Draft.md`

**Files:**
- Modify: `c:\Projects\my-research\DraftMaterial\RTX-Spark\Health\PulseIQ_Research_Draft.md`
- Create: `c:\Projects\my-research\DraftMaterial\RTX-Spark\Health\draft.md`
- Create: `c:\Projects\my-research\DraftMaterial\RTX-Spark\Health\metadata.md`

- [ ] **Step 1: Write python cleaner script to strip `***` bold-italic wraps**
  Write a script that replaces `***([^*\n]+)***` with `$1` (or bold `**$1**` only for table headers and definition keys) across `PulseIQ_Research_Draft.md`.
- [ ] **Step 2: Execute normalization script and verify formatting**
  Run script, review diff to verify clean readable markdown with proper standard headings and tables.
- [ ] **Step 3: Create `Health/draft.md`**
  Copy/link the cleaned `PulseIQ_Research_Draft.md` content to `Health/draft.md` so that standard article discovery tools find it.
- [ ] **Step 4: Create `Health/metadata.md`**
  Add standard article frontmatter/metadata:
  - Title: PulseIQ: On-Premises Health Intelligence on NVIDIA DGX/RTX Spark
  - Categories: Healthcare, Sovereign AI, RTX Spark
  - Target audience, keywords, and outline metrics.

---

### Task 4: Deduplication & Structural Consolidation

**Files:**
- Delete: `c:\Projects\my-research\DraftMaterial\RTX-Spark\JEPA\grok-research.md` (duplicate of `grok-research_draft.md`)
- Delete: `c:\Projects\my-research\DraftMaterial\RTX-Spark\JEPA\tutorials.md` (duplicate of `tutorials_draft.md`)
- Move: `c:\Projects\my-research\DraftMaterial\RTX-Spark\Sovereign-Agent-Stack\security-pipelines\install_emdash_windows.ps1` -> `...\Security-Suite\install_emdash_windows.ps1`
- Move: `c:\Projects\my-research\DraftMaterial\RTX-Spark\Sovereign-Agent-Stack\security-pipelines\install_emdash_wsl2.sh` -> `...\Security-Suite\install_emdash_wsl2.sh`
- Delete: `c:\Projects\my-research\DraftMaterial\RTX-Spark\Sovereign-Agent-Stack\security-pipelines` directory
- Link/Copy: `c:\Projects\my-research\DraftMaterial\RTX-Spark\deepseek-harness.md` into `c:\Projects\my-research\DraftMaterial\RTX-Spark\Articles\OpenClaw\deepseek-harness.md`

- [ ] **Step 1: Remove redundant files in `JEPA`**
  ```powershell
  Remove-Item -Path "c:\Projects\my-research\DraftMaterial\RTX-Spark\JEPA\grok-research.md" -Force
  Remove-Item -Path "c:\Projects\my-research\DraftMaterial\RTX-Spark\JEPA\tutorials.md" -Force
  ```
- [ ] **Step 2: Consolidate `security-pipelines` into `Security-Suite`**
  Move install scripts into `Security-Suite/` and remove redundant directory:
  ```powershell
  Move-Item -Path "c:\Projects\my-research\DraftMaterial\RTX-Spark\Sovereign-Agent-Stack\security-pipelines\install_emdash_windows.ps1" -Destination "c:\Projects\my-research\DraftMaterial\RTX-Spark\Sovereign-Agent-Stack\Security-Suite\" -Force
  Move-Item -Path "c:\Projects\my-research\DraftMaterial\RTX-Spark\Sovereign-Agent-Stack\security-pipelines\install_emdash_wsl2.sh" -Destination "c:\Projects\my-research\DraftMaterial\RTX-Spark\Sovereign-Agent-Stack\Security-Suite\" -Force
  Remove-Item -Path "c:\Projects\my-research\DraftMaterial\RTX-Spark\Sovereign-Agent-Stack\security-pipelines" -Recurse -Force
  ```
- [ ] **Step 3: Place `deepseek-harness.md` in `Articles/OpenClaw`**
  Copy `deepseek-harness.md` into `Articles/OpenClaw/` so Article 4 has direct access to the harness architecture notes.

---

### Task 5: Content Corrections & Canonical File Additions

**Files:**
- Modify: `c:\Projects\my-research\DraftMaterial\RTX-Spark\Behavioural\Science\draft.md`
- Create: `c:\Projects\my-research\DraftMaterial\RTX-Spark\Economics\draft.md`
- Create: `c:\Projects\my-research\DraftMaterial\RTX-Spark\Economics\metadata.md`

- [ ] **Step 1: Fix Asch Conformity copy-paste bug in `Behavioural/Science/draft.md`**
  Change line 57:
  From: `We instantiated proposer-responder agent pairings using Llama 3.3 70B via Ollama.`
  To: `We instantiated participant and confederate agent personas using Llama 3.3 70B via Ollama.`
- [ ] **Step 2: Standardize `Economics/keen.md` into `Economics/draft.md`**
  Create `Economics/draft.md` formatted cleanly with title, executive summary, architecture blueprint, and simulation methodology based on `keen.md`.
- [ ] **Step 3: Create `Economics/metadata.md`**
  Generate target audience, GEO keywords (Steve Keen, Ravel, Godley Tables, Stock-Flow Consistent Modeling, RTX Spark), and section outline.

---

### Task 6: Comprehensive Rebuild of `task_list.md`

**Files:**
- Modify: `c:\Projects\my-research\DraftMaterial\RTX-Spark\task_list.md`

- [ ] **Step 1: Gather accurate inventory of all 28 subdirectories**
  Script an audit script that checks each directory in `RTX-Spark` for:
  - Total files & types
  - `draft.md` status
  - `research.md` status
  - `metadata.md` status
  - Brief functional description of the directory's role
- [ ] **Step 2: Generate modern, structured `task_list.md`**
  Write updated `task_list.md` covering all 28 directories with clean relative links, clear status flags (Ready / In Progress / Research Only / Code Lab), and priority follow-ups.
- [ ] **Step 3: Verify markdown formatting and link integrity**
  Ensure every link in `task_list.md` is valid and resolves correctly.
