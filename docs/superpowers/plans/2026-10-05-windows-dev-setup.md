# Automated Windows Developer Environment Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-grade automated Windows developer setup script suite (modular PowerShell engine, pluggable Winget/Chocolatey package manager, declarative JSON configuration, standalone runner) and a comprehensive research-backed editorial publication package in `DraftMaterial/Windows-Dev-Setup/`.

**Architecture:** The solution is divided into a declarative config layer (`config/packages.json`), discrete reusable PowerShell modules (`modules/Safety.psm1`, `Telemetry.psm1`, `Bloatware.psm1`, `PackageInstaller.psm1`, `Environment.psm1`), an orchestrator CLI (`Setup-WindowsDev.ps1`), an inlined copy-pasteable runner (`Install-Standalone.ps1`), and a full publication editorial suite (`metadata.md`, `research.md`, `draft.md`, `post-linkedin.md`, `note-substack.md`) complying with workspace GEO, UK English, and formatting styleguides.

**Tech Stack:** PowerShell 5.1 & PowerShell Core 7+, Winget (Windows Package Manager), Chocolatey (`choco`), Windows AppX/DISM APIs, Windows Registry (Policies & Explorer), JSON Schema, GitHub Flavored Markdown.

**Spec:**
- [docs/superpowers/specs/2026-10-05-windows-dev-setup-design.md](file:///c:/Projects/my-research/docs/superpowers/specs/2026-10-05-windows-dev-setup-design.md)
- [styleguides/style-guide-article-generation.md](file:///c:/Projects/my-research/styleguides/style-guide-article-generation.md)
- [styleguides/style-guide-draft.md](file:///c:/Projects/my-research/styleguides/style-guide-draft.md)
- [styleguides/style-guide-metadata.md](file:///c:/Projects/my-research/styleguides/style-guide-metadata.md)
- [styleguides/style-guide-research.md](file:///c:/Projects/my-research/styleguides/style-guide-research.md)
- [styleguides/style-guide-feed-post.md](file:///c:/Projects/my-research/styleguides/style-guide-feed-post.md)

## Global Constraints

- **Directory Target**: All deliverables must be placed inside `c:\Projects\my-research\DraftMaterial\Windows-Dev-Setup\`.
- **UK English**: Enforce standard British spelling conventions (*optimised*, *customised*, *prioritise*, *behaviour*) across all markdown prose.
- **Safety First**: Elevation assertions and System Restore Point creation (`Checkpoint-Computer`) must guard system-modifying actions.
- **Dual Package Managers**: Explicit, parity-mapped package support across both **Winget** and **Chocolatey**.
- **No AI Slop / Clichés**: Avoid prohibited words (*delve*, *tapestry*, *testament*, *beacon*, *revolutionise*, *game-changer*).
- **Executive Summary & Visual Signposts**: All drafts must feature an Executive Summary block and `*[Visual: Description]*` anchors for diagrams and tables.

---

### Task 1: Declarative Configuration Schema (`config/packages.json`)

**Files:**
- Create: `DraftMaterial/Windows-Dev-Setup/config/packages.json`

**Interfaces:**
- Produces: JSON configuration parsed by `Setup-WindowsDev.ps1` and `PackageInstaller.psm1`.

- [x] **Step 1: Write `packages.json` structure**
  Include tiered profiles (`core`, `fullstack`, `devops`, `datascience`), dual mappings (`winget` and `chocolatey`), bloatware wildcards, registry telemetry keys, and environment settings.

- [x] **Step 2: Validate JSON syntax**
  Verify parsing using PowerShell `Get-Content DraftMaterial/Windows-Dev-Setup/config/packages.json | ConvertFrom-Json`.

---

### Task 2: Safety & Elevation Module (`modules/Safety.psm1`)

**Files:**
- Create: `DraftMaterial/Windows-Dev-Setup/modules/Safety.psm1`

**Interfaces:**
- Produces: `Assert-Elevated`, `New-DevSetupRestorePoint`.

- [x] **Step 1: Implement `Assert-Elevated`**
  Check `[Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent().IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)` and throw or exit with clear warning if not elevated.

- [x] **Step 2: Implement `New-DevSetupRestorePoint`**
  Inspect Volume Shadow Copy and System Restore status; call `Checkpoint-Computer -Description "Pre-DevSetup" -RestorePointType "MODIFY_SETTINGS" -ErrorAction SilentlyContinue`; handle client SKU limitations gracefully.

- [x] **Step 3: Syntax check `Safety.psm1`**
  Run AST parser to ensure zero syntax errors.

---

### Task 3: Telemetry & UI Decluttering Module (`modules/Telemetry.psm1`)

**Files:**
- Create: `DraftMaterial/Windows-Dev-Setup/modules/Telemetry.psm1`

**Interfaces:**
- Consumes: Registry definitions from `config/packages.json`.
- Produces: `Set-DeveloperPrivacyPolicies`, `Set-CleanTaskbarAndStart`.

- [x] **Step 1: Implement `Set-DeveloperPrivacyPolicies`**
  Set `AllowTelemetry` = 0, `TailoredExperiencesWithDiagnosticDataEnabled` = 0, `AdvertisingInfo\Enabled` = 0 with `-WhatIf` awareness.

- [x] **Step 2: Implement `Set-CleanTaskbarAndStart`**
  Set `DisableSearchBoxSuggestions` = 1, `TaskbarDa` (Widgets) = 0, `ShowCopilotButton` = 0.

- [x] **Step 3: Syntax check `Telemetry.psm1`**
  Run AST parser to verify PowerShell code validity.

---

### Task 4: Bloatware Removal Module (`modules/Bloatware.psm1`)

**Files:**
- Create: `DraftMaterial/Windows-Dev-Setup/modules/Bloatware.psm1`

**Interfaces:**
- Consumes: Bloatware array from `config/packages.json`.
- Produces: `Remove-ConsumerBloatware`.

- [x] **Step 1: Implement `Remove-ConsumerBloatware`**
  Iterate bloatware wildcard patterns, remove user-installed packages via `Get-AppxPackage`, and de-provision staging packages via `Get-AppxProvisionedPackage -Online` with `-WhatIf` support.

- [x] **Step 2: Syntax check `Bloatware.psm1`**
  Run AST parser to verify PowerShell code validity.

---

### Task 5: Dual Package Installer Engine (`modules/PackageInstaller.psm1`)

**Files:**
- Create: `DraftMaterial/Windows-Dev-Setup/modules/PackageInstaller.psm1`

**Interfaces:**
- Consumes: Package lists from `config/packages.json`.
- Produces: `Install-DevPackages`, `Assert-ChocolateyInstalled`.

- [x] **Step 1: Implement `Assert-ChocolateyInstalled`**
  Detect if `choco.exe` exists in `PATH`. If missing and requested, download and bootstrap official Chocolatey installation.

- [x] **Step 2: Implement `Install-DevPackages`**
  Support `-PackageManager Winget|Chocolatey|Both`.
  - For Winget: `winget install --id $tool --accept-package-agreements --accept-source-agreements --silent --disable-interactivity`.
  - For Chocolatey: `choco install $tool -y --no-progress`.

- [x] **Step 3: Syntax check `PackageInstaller.psm1`**
  Run AST parser to verify PowerShell code validity.

---

### Task 6: Developer Environment & WSL Module (`modules/Environment.psm1`)

**Files:**
- Create: `DraftMaterial/Windows-Dev-Setup/modules/Environment.psm1`

**Interfaces:**
- Produces: `Enable-DeveloperMode`, `Enable-LongPathSupport`, `Enable-WSLFeature`.

- [x] **Step 1: Implement `Enable-DeveloperMode`**
  Set `HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\AppModelUnlock\AllowDevelopmentWithoutDevLicense` = 1.

- [x] **Step 2: Implement `Enable-LongPathSupport`**
  Set `HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem\LongPathsEnabled` = 1.

- [x] **Step 3: Implement `Enable-WSLFeature`**
  Execute `Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux -NoRestart`.

- [x] **Step 4: Syntax check `Environment.psm1`**
  Run AST parser to verify PowerShell code validity.

---

### Task 7: Orchestrator CLI (`Setup-WindowsDev.ps1`) & Standalone Runner (`Install-Standalone.ps1`)

**Files:**
- Create: `DraftMaterial/Windows-Dev-Setup/Setup-WindowsDev.ps1`
- Create: `DraftMaterial/Windows-Dev-Setup/Install-Standalone.ps1`

**Interfaces:**
- `Setup-WindowsDev.ps1`: Imports modules, processes parameters (`-Profile`, `-PackageManager`, `-ConfigPath`, `-SkipBloatware`, `-SkipTelemetry`, `-ToolsOnly`, `-EnableWSL`, `-WhatIf`, `-Force`), and executes workflow.
- `Install-Standalone.ps1`: Self-contained, zero-dependency script packaging the entire workflow into a single file for quick copy-paste or remote execution.

- [x] **Step 1: Write `Setup-WindowsDev.ps1`**
  Define `[CmdletBinding(SupportsShouldProcess=$true)]`, parse parameters, load config JSON, invoke modules in sequence, and display summary output.

- [x] **Step 2: Write `Install-Standalone.ps1`**
  Assemble all safety, telemetry, bloatware, Winget, Chocolatey, and environment functions into a single standalone script.

- [x] **Step 3: Verify AST syntax on both scripts**
  Execute AST parser on both `.ps1` files.

---

### Task 8: In-Depth Research Document (`research.md`)

**Files:**
- Create: `DraftMaterial/Windows-Dev-Setup/research.md`

**Requirements:**
- Adheres strictly to `styleguides/style-guide-research.md`.
- Deep-dive technical comparison: **Winget vs. Chocolatey vs. Scoop** (architecture, enterprise feeds, signing, elevation, repository moderation).
- Architectural comparison: **Custom PowerShell Scripts vs. Win11Debloat vs. Chris Titus Tech WinUtil**.
- Windows internals: `Get-AppxProvisionedPackage` vs `Get-AppxPackage`, Telemetry GPO/Registry keys (`AllowTelemetry`), and System Restore Point limitations.
- Security analysis of `irm ... | iex` execution patterns.

- [x] **Step 1: Write `research.md`**
  Include full comparative tables, code breakdowns, and citations.

---

### Task 9: Article Metadata & Visual Matrix (`metadata.md`)

**Files:**
- Create: `DraftMaterial/Windows-Dev-Setup/metadata.md`

**Requirements:**
- Adheres strictly to `styleguides/style-guide-metadata.md`.
- Target Platform: LinkedIn & Substack.
- GEO Bracket: Tier 1: High-Authority Growth (Score 9-10).
- Primary/Secondary Audience and Audience Level.
- SEO Keywords.
- 5-section outline with exact word count allocations and visual matrix (`*[Visual: ...]*`).
- Follow-up article ideas.

- [x] **Step 1: Write `metadata.md`**
  Ensure all fields match the design document and research topic.

---

### Task 10: Publication Technical Tutorial Draft (`draft.md`)

**Files:**
- Create: `DraftMaterial/Windows-Dev-Setup/draft.md`

**Requirements:**
- Adheres strictly to `styleguides/style-guide-draft.md`.
- Language: UK English (*optimised*, *customised*, *prioritise*).
- Bolded Executive Summary block at the top.
- 5 structured sections matching `metadata.md` outline:
  1. The Fresh Install Illusion: Deconstructing Consumer Bloat & Background Telemetry
  2. The Package Manager Shootout: Winget vs. Chocolatey vs. Scoop
  3. Pre-Flight Safety Architecture: System Restore Points & Failure Domains
  4. Building the Production-Grade PowerShell Automation Engine
  5. The Open-Source Landscape: Custom Scripts vs. Win11Debloat vs. CTT WinUtil
- Concrete, verified code blocks and ASCII/Mermaid architectural diagrams.
- Every visual anchored with `*[Visual: Description]*`.
- Zero banned AI clichés (*delve*, *tapestry*, *testament*).

- [x] **Step 1: Write `draft.md`**
  Produce complete, publication-grade tutorial.

---

### Task 11: Social Feed Publications (`post-linkedin.md` & `note-substack.md`)

**Files:**
- Create: `DraftMaterial/Windows-Dev-Setup/post-linkedin.md`
- Create: `DraftMaterial/Windows-Dev-Setup/note-substack.md`

**Requirements:**
- Adheres strictly to `styleguides/style-guide-feed-post.md`.
- `post-linkedin.md`: High-engagement hook, 2026 GEO optimization, bare URLs, targeted hashtags (#DevOps #PowerShell #Windows11 #SoftwareEngineering).
- `note-substack.md`: Concise, rich markdown links, no hashtags, reader-focused takeaway.

- [x] **Step 1: Write `post-linkedin.md` and `note-substack.md`**

---

### Task 12: End-to-End Syntax, Schema & Dry-Run Validation

**Files:**
- Create/Execute: Verification runner to test AST syntax, JSON validity, and `-WhatIf` dry-run.

- [x] **Step 1: Run JSON parser test**
  Ensure `packages.json` loads cleanly with zero errors.

- [x] **Step 2: Run PowerShell AST parser on all `.ps1` and `.psm1` files**
  Confirm zero syntax errors or parsing exceptions.

- [x] **Step 3: Run `Setup-WindowsDev.ps1 -WhatIf` simulation**
  Confirm dry-run runs cleanly and reports planned actions without side effects.

- [x] **Step 4: Check styleguide compliance**
  Verify word counts, visual anchors, UK spelling, and absence of AI tropes across all markdown files.
