# Design Document: Automated Windows Developer Environment Setup

**Date**: 2026-10-05  
**Status**: Approved (Brainstorming Phase Complete)  
**Target Folder**: `c:\Projects\my-research\DraftMaterial\Windows-Dev-Setup\`  

---

## 1. Overview & Objectives

Setting up a fresh Windows machine for software development is notoriously fraught with consumer bloatware, aggressive OS telemetry, cluttered UI defaults, and manual installer fatigue. 

This project delivers two synchronized deliverables:
1. **Production-Grade Automation Script Suite**: A robust, modular PowerShell system (`Setup-WindowsDev.ps1`) supported by declarative JSON configurations (`config/packages.json`), pluggable package management (**Winget** and **Chocolatey**), pre-execution safety checkpoints, and a standalone single-file runner (`Install-Standalone.ps1`).
2. **Comprehensive Research & Publication Package**: A complete editorial package adhering to workspace styleguides (`metadata.md`, `research.md`, `draft.md`, `post-linkedin.md`, and `note-substack.md`) offering deep architectural analysis, comparing custom scripts against community open-source suites (*Win11Debloat*, *Chris Titus Tech WinUtil*), and contrasting package managers (*Winget* vs *Chocolatey* vs *Scoop*).

---

## 2. Directory Layout & Architecture

```text
c:\Projects\my-research\DraftMaterial\Windows-Dev-Setup\
├── config\
│   └── packages.json              # Declarative profiles, package mappings, bloat list & registry tweaks
├── modules\
│   ├── Safety.psm1                # Administrator elevation & System Restore Point creation
│   ├── Telemetry.psm1             # Privacy, diagnostic data & UI decluttering tweaks
│   ├── Bloatware.psm1             # Safe AppX and provisioned package removal
│   ├── PackageInstaller.psm1      # Dual Winget & Chocolatey execution engine
│   └── Environment.psm1          # Developer Mode, LongPathsEnabled & WSL2 enablement
├── Setup-WindowsDev.ps1           # Main modular orchestrator CLI with full parameter support
├── Install-Standalone.ps1         # Self-contained, zero-dependency single-file runner
├── metadata.md                    # Target platform, GEO bracket, audiences, SEO keywords & outline
├── research.md                    # Deep-dive research, citations & analysis of community tools
├── draft.md                       # Comprehensive, publication-ready technical tutorial/article
├── post-linkedin.md               # Social post optimized for LinkedIn 2026 feed & GEO criteria
└── note-substack.md               # Substack publication note with native markdown links
```

---

## 3. Script Engine Specification

### 3.1 Declarative Configuration (`config/packages.json`)
Decouples data from logic, enabling teams to check in environment blueprints:
- **`profiles`**:
  - `core`: Git, VS Code, Python 3.11, Node.js LTS, Windows Terminal (mapped to both Winget ID and Chocolatey package name).
  - `fullstack`: Core + Docker Desktop, Postman, Insomnia.
  - `devops`: Core + Azure CLI, AWS CLI, Terraform, Kubectl.
  - `datascience`: Core + Miniconda, RStudio, PowerBI.
  - `custom`: Extensible array or custom config path.
- **`bloatware`**: Curated consumer UWP packages (`*MicrosoftSolitaireCollection*`, `*Xbox*`, `*GamingApp*`, `*ZuneMusic*`, `*ZuneVideo*`, `*FeedbackHub*`, `*GetHelp*`, `*Getstarted*`, `*OfficeHub*`, `*People*`, `*Todos*`, `*Clipchamp*`, `*BingNews*`, `*Weather*`).
- **`registryTweaks`**:
  - Telemetry: `HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection\AllowTelemetry` = `0`.
  - Privacy: `HKCU:\Software\Microsoft\Windows\CurrentVersion\Privacy\TailoredExperiencesWithDiagnosticDataEnabled` = `0`.
  - Advertising: `HKCU:\Software\Microsoft\Windows\CurrentVersion\AdvertisingInfo\Enabled` = `0`.
  - UI: `DisableSearchBoxSuggestions` = `1`, `TaskbarDa` (Widgets) = `0`.
- **`environmentFeatures`**:
  - `AllowDevelopmentWithoutDevLicense` = `1` (Windows Developer Mode).
  - `LongPathsEnabled` = `1` (`HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem`).
  - Optional Windows Feature: `Microsoft-Windows-Subsystem-Linux`.

### 3.2 Modular Components (`modules/`)
1. **`Safety.psm1`**:
   - `Assert-Elevated`: Verifies process runs as Administrator; halts with helpful error if unprivileged.
   - `New-DevSetupRestorePoint`: Enables system protection on SystemDrive if disabled; checks service status; creates named restore point (`Pre-DevSetup`) via `Checkpoint-Computer`.
2. **`Telemetry.psm1`**:
   - `Set-DeveloperPrivacyPolicies`: Idempotently applies registry DWord keys with error trapping and feedback.
   - `Set-CleanTaskbarAndStart`: Hides widgets and web search suggestions.
3. **`Bloatware.psm1`**:
   - `Remove-ConsumerBloatware`: Enumerates both installed user packages (`Get-AppxPackage`) and provisioned OS staging packages (`Get-AppxProvisionedPackage -Online`) to prevent reappearance for new user profiles.
4. **`PackageInstaller.psm1`**:
   - `Install-DevPackages`:
     - Dispatches to Winget (`winget install --id <Tool> --accept-package-agreements --accept-source-agreements --silent --disable-interactivity`).
     - Dispatches to Chocolatey (`choco install <Tool> -y --no-progress`).
     - Auto-bootstraps Chocolatey if `-PackageManager Chocolatey` is selected and `choco.exe` is absent.
5. **`Environment.psm1`**:
   - `Enable-DeveloperMode`: Unlocks sideloading and Symlink creation without admin elevation.
   - `Enable-LongPathSupport`: Fixes Git and Node.js deep `node_modules` path errors on Windows.
   - `Enable-WSLFeature`: Enables WSL optional feature without forcing immediate restart.

### 3.3 Main Orchestrator (`Setup-WindowsDev.ps1`)
CLI parameters:
- `-Profile <Core|FullStack|DevOps|DataScience|Custom>` (default: `Core`)
- `-PackageManager <Winget|Chocolatey|Both>` (default: `Winget`)
- `-ConfigPath <String>` (optional path to external custom JSON)
- `-SkipBloatware` (switch)
- `-SkipTelemetry` (switch)
- `-SkipEnvironment` (switch)
- `-SkipRestorePoint` (switch)
- `-ToolsOnly` (switch)
- `-EnableWSL` (switch)
- `-WhatIf` / `-DryRun` (switch for simulation)
- `-Force` (switch)

### 3.4 Standalone Bootstrap Script (`Install-Standalone.ps1`)
A self-contained script bundling the core logic into a single file with safe defaults, inline restore point creation, elevation check, telemetry cleanup, bloatware removal, developer mode, and Winget package installation.

---

## 4. Publication & Editorial Specification

Following `styleguides/` standards:
1. **`metadata.md`** (per `style-guide-metadata.md`):
   - Target Platform: LinkedIn & Substack.
   - GEO Bracket: Tier 1: High-Authority Growth (Score 9-10).
   - Primary Audience: Systems Architects, Senior Full-Stack Engineers, DevOps Engineers, Engineering Managers.
   - Secondary Audience: IT Administrators, Platform Engineers.
   - Audience Level: Intermediate to Advanced.
   - 5-section outline with exact word counts and visual matrix.
2. **`research.md`** (per `style-guide-research.md`):
   - Package manager comparative breakdown: **Winget vs. Chocolatey vs. Scoop**.
   - Community debloat tools analysis: **Custom Script vs. Win11Debloat vs. Chris Titus Tech WinUtil**.
   - Deep-dive technical explanations of Windows AppX provisioning (`Get-AppxProvisionedPackage` vs `Get-AppxPackage`), telemetry registry keys, Group Policy implications, and System Restore limitations.
   - Security evaluation of `irm ... | iex` remote script execution patterns.
3. **`draft.md`** (per `style-guide-draft.md`):
   - Language: UK English (*optimised*, *customised*, *prioritise*).
   - Executive Summary block at the top.
   - 5 structured sections with explicit `*[Visual: Description]*` signposts.
   - Production-ready, verified code blocks.
   - Strict avoidance of AI clichés (*delve*, *tapestry*, *testament*, *game-changer*).
4. **`post-linkedin.md`** (per `style-guide-feed-post.md`):
   - Bare links, engagement hooks, professional hashtags.
5. **`note-substack.md`** (per `style-guide-feed-post.md`):
   - Rich markdown links, no hashtags, concise delivery.

---

## 5. Verification & Testing Strategy
1. **PowerShell Script Syntax Validation**:
   - Run `Get-Command` / AST parsing (`[System.Management.Automation.Language.Parser]::ParseInput(...)`) across all `.ps1` and `.psm1` files to guarantee zero syntax or parser errors.
2. **JSON Schema Validation**:
   - Parse `config/packages.json` with `ConvertFrom-Json` to confirm valid structure and data integrity.
3. **Execution Parameter & Dry-Run Testing**:
   - Verify `Setup-WindowsDev.ps1 -WhatIf` executes without errors.
4. **Editorial & Styleguide Verification**:
   - Cross-check `metadata.md`, `research.md`, and `draft.md` against `styleguides/style-guide-article-generation.md` compatibility checklist.
