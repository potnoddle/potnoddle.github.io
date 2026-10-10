# MiroFish Multi-Language Domain Suites Implementation Plan

Implement symmetrical 5-language simulation suites (`python`, `csharp`, `typescript`, `rust`, `cpp`) across all 5 industrial domains documented in `DraftMaterial/RTX-Spark/MiroFish/applications.md`.

## User Intent & Requirements
- **Scope**: 5 domains $\times$ 5 languages = 25 total domain implementations.
- **Directory Layout**: Each domain directory will house `SPEC.md` and a dedicated `samples/` subfolder containing:
  - `samples/python/app.py` & `README.md`
  - `samples/csharp/Program.cs`, `<Domain>Sample.csproj`, `README.md`
  - `samples/typescript/src/index.ts`, `package.json`, `tsconfig.json`, `README.md`
  - `samples/rust/src/main.rs`, `Cargo.toml`, `README.md`
  - `samples/cpp/main.cpp`, `CMakeLists.txt`, `README.md`
  - `samples/README.md` (domain language catalog)
- **Migration**: Move root `app.py` from each domain into `samples/python/app.py`.

---

## Proposed Tasks

### Task 1: Domain 1 — Geopolitical-Energy-Chokepoints
- Move `Geopolitical-Energy-Chokepoints/app.py` into `Geopolitical-Energy-Chokepoints/samples/python/app.py` and write `samples/python/README.md`.
- Copy & adapt `MiroFish/samples/csharp`, `typescript`, `rust`, `cpp` into `Geopolitical-Energy-Chokepoints/samples/`.
- Add master `Geopolitical-Energy-Chokepoints/samples/README.md`.
- Verification: Run Python, Node.js (`node --experimental-strip-types src/index.ts`), and `dotnet run`.

### Task 2: Domain 2 — Bank-Contagion
- Move `Bank-Contagion/app.py` into `Bank-Contagion/samples/python/app.py` and write `samples/python/README.md`.
- Implement `Bank-Contagion/samples/csharp/` (`Program.cs`, `BankContagionSample.csproj`, `README.md`) modeling interbank clearing, HTM losses, and wire runs.
- Implement `Bank-Contagion/samples/typescript/` (`src/index.ts`, `package.json`, `tsconfig.json`, `README.md`).
- Implement `Bank-Contagion/samples/rust/` (`src/main.rs`, `Cargo.toml`, `README.md`).
- Implement `Bank-Contagion/samples/cpp/` (`main.cpp`, `CMakeLists.txt`, `README.md`).
- Add master `Bank-Contagion/samples/README.md`.
- Verification: Run Python, Node.js, and `dotnet run`.

### Task 3: Domain 3 — Autonomous-Cyber-Warfare
- Move `Autonomous-Cyber-Warfare/app.py` into `Autonomous-Cyber-Warfare/samples/python/app.py` and write `samples/python/README.md`.
- Implement `Autonomous-Cyber-Warfare/samples/csharp/` (`Program.cs`, `CyberWarfareSample.csproj`, `README.md`) modeling Red/Blue wargame and HVAC IoT air-gap traversal.
- Implement `Autonomous-Cyber-Warfare/samples/typescript/` (`src/index.ts`, `package.json`, `tsconfig.json`, `README.md`).
- Implement `Autonomous-Cyber-Warfare/samples/rust/` (`src/main.rs`, `Cargo.toml`, `README.md`).
- Implement `Autonomous-Cyber-Warfare/samples/cpp/` (`main.cpp`, `CMakeLists.txt`, `README.md`).
- Add master `Autonomous-Cyber-Warfare/samples/README.md`.
- Verification: Run Python, Node.js, and `dotnet run`.

### Task 4: Domain 4 — Supply-Chain-Rerouting
- Move `Supply-Chain-Rerouting/app.py` into `Supply-Chain-Rerouting/samples/python/app.py` and write `samples/python/README.md`.
- Implement `Supply-Chain-Rerouting/samples/csharp/` (`Program.cs`, `SupplyChainSample.csproj`, `README.md`) modeling port strikes, air cargo bidding, and tier-3 micro-connector shortages.
- Implement `Supply-Chain-Rerouting/samples/typescript/` (`src/index.ts`, `package.json`, `tsconfig.json`, `README.md`).
- Implement `Supply-Chain-Rerouting/samples/rust/` (`src/main.rs`, `Cargo.toml`, `README.md`).
- Implement `Supply-Chain-Rerouting/samples/cpp/` (`main.cpp`, `CMakeLists.txt`, `README.md`).
- Add master `Supply-Chain-Rerouting/samples/README.md`.
- Verification: Run Python, Node.js, and `dotnet run`.

### Task 5: Domain 5 — Synthetic-Consumer-Markets
- Move `Synthetic-Consumer-Markets/app.py` into `Synthetic-Consumer-Markets/samples/python/app.py` and write `samples/python/README.md`.
- Implement `Synthetic-Consumer-Markets/samples/csharp/` (`Program.cs`, `ConsumerMarketsSample.csproj`, `README.md`) modeling SaaS seat-to-credit pricing pivot, Big Five OCEAN churn, and NRR forecasting.
- Implement `Synthetic-Consumer-Markets/samples/typescript/` (`src/index.ts`, `package.json`, `tsconfig.json`, `README.md`).
- Implement `Synthetic-Consumer-Markets/samples/rust/` (`src/main.rs`, `Cargo.toml`, `README.md`).
- Implement `Synthetic-Consumer-Markets/samples/cpp/` (`main.cpp`, `CMakeLists.txt`, `README.md`).
- Add master `Synthetic-Consumer-Markets/samples/README.md`.
- Verification: Run Python, Node.js, and `dotnet run`.

### Task 6: Master Indexing & Documentation Updates
- Update `DraftMaterial/RTX-Spark/MiroFish/applications.md` and `DraftMaterial/RTX-Spark/task_list.md` with links to all 5 domain sample suites.
- Merge branch `feat/mirofish-multilang-domains` to `main` and push to `origin/main`.
