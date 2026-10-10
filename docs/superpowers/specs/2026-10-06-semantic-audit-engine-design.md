# Design Document: Semantic Content & Cannibalization Audit Engine

**Date**: 2026-10-06  
**Status**: Approved (Brainstorming Complete)  
**Target Script**: `scripts/semantic_audit.py`  
**Testbed Target**: `https://potnoddle.github.io/` (and local `_posts/`)  
**Commercial Context**: Tier 1 Productized Service (£1,250 – £2,500 deliverable) from `docs/playbooks/rtx-spark-commercial-blueprint.md`  

---

## 1. Overview & Objectives

In modern search and Answer Engine Optimization (GEO/AEO), high-intent traffic is lost not only to external competitors, but to internal **semantic cannibalization**: multiple pages on the same domain competing for the exact same semantic vector space. Search engines (and AI models like ChatGPT Search and Perplexity) become confused about which page is authoritative, diluting rankings and missing citation opportunities.

This project implements **`scripts/semantic_audit.py`**, a high-performance Python engine that:
1. **Dual-Mode Ingests**: Ingests content either from live remote XML sitemaps (e.g. `https://potnoddle.github.io/sitemap.xml`) or local repositories (e.g. `_posts/*.md`).
2. **Dense Vector Embeddings**: Generates dense embeddings using pluggable backends (default: local zero-config `sentence-transformers` such as `all-MiniLM-L6-v2` or `bge-small-en-v1.5`, with optional local Ollama/OpenAI-compatible server support).
3. **Cannibalization Analysis**: Computes pairwise cosine similarity, flags overlapping pairs, assigns actionable remediation categories (`301 Redirect / Merge`, `Consolidate / Canonicalize`, `Differentiate & Cross-Link`), clusters pages into topic hubs, and calculates 2D projection coordinates.
4. **Commercial Deliverable Generation**: Produces a complete 3-asset client reporting package:
   - `cannibalization_matrix.csv`: Granular pairwise audit data with conflict severity and recommended fixes.
   - `cluster_visualization.html`: Interactive, standalone 2D Plotly scatter map color-coded by topic cluster with red cannibalization conflict links.
   - `executive_summary.md`: C-level executive briefing with Cannibalization Severity Index, cluster distributions, and top 5 priority action items.

---

## 2. Architecture & Component Interfaces

The script is organized into four decoupled, testable components:

```text
[Input Sources]
   ├── Remote Sitemap XML (e.g. https://potnoddle.github.io/sitemap.xml)
   └── Local Directory (e.g. _posts/*.md)
          │
          ▼
┌────────────────────────────────────────────────────────┐
│ 1. ContentIngester                                     │
│    - Sitemap XML & Sitemap Index Parser                │
│    - HTML Content Extractor (boilerpipe / tag stripper)│
│    - Local Markdown YAML frontmatter & body parser     │
└────────────────────────────────────────────────────────┘
          │ (List[ContentDocument])
          ▼
┌────────────────────────────────────────────────────────┐
│ 2. EmbeddingEngine                                     │
│    - Pluggable: SentenceTransformers (local CPU/GPU)   │
│    - Optional: Ollama / OpenAI-compatible endpoint     │
└────────────────────────────────────────────────────────┘
          │ (numpy.ndarray [N, D])
          ▼
┌────────────────────────────────────────────────────────┐
│ 3. CannibalizationAnalyzer                             │
│    - Pairwise Cosine Similarity Matrix                 │
│    - Threshold Filtering & Action Classification       │
│    - Agglomerative Topic Clustering                    │
│    - 2D Dimensionality Reduction (PCA / TruncatedSVD)  │
└────────────────────────────────────────────────────────┘
          │ (AuditAnalysisResult)
          ▼
┌────────────────────────────────────────────────────────┐
│ 4. ReportGenerator                                     │
│    - cannibalization_matrix.csv                        │
│    - cluster_visualization.html (Plotly standalone)    │
│    - executive_summary.md                              │
└────────────────────────────────────────────────────────┘
```

---

## 3. Data Structures & Schemas

### 3.1 `ContentDocument`
```python
@dataclass
class ContentDocument:
    id: int
    url: str
    title: str
    date: str
    source_type: str  # "remote_sitemap" | "local_markdown"
    raw_text: str
    word_count: int
```

### 3.2 `CannibalizationPair`
```python
@dataclass
class CannibalizationPair:
    doc_a_id: int
    doc_a_url: str
    doc_a_title: str
    doc_b_id: int
    doc_b_url: str
    doc_b_title: str
    similarity_score: float
    severity: str          # "Critical (>= 0.90)" | "Severe (0.85-0.89)" | "Moderate (0.80-0.84)"
    recommended_action: str # "301 Redirect / Merge" | "Consolidate or Canonicalize" | "Differentiate & Cross-Link"
    cluster_id: int
```

### 3.3 `AuditAnalysisResult`
```python
@dataclass
class AuditAnalysisResult:
    documents: List[ContentDocument]
    embeddings: np.ndarray
    similarity_matrix: np.ndarray
    cannibalization_pairs: List[CannibalizationPair]
    cluster_labels: List[int]
    cluster_names: Dict[int, str]
    coords_2d: np.ndarray  # [N, 2]
    cannibalization_risk_score: float # Percentage of pages in conflict
```

---

## 4. Detailed Component Specifications

### 4.1 `ContentIngester`
- **Sitemap Parsing**:
  - Handles namespaces (`http://www.sitemaps.org/schemas/sitemap/0.9`).
  - Supports `<sitemapindex>` recursion if the root XML contains child sitemaps.
  - Filters out binary/media extensions (`.png`, `.jpg`, `.pdf`, `.xml`, `.css`, `.js`).
- **HTML Scraping & Boilerplate Removal**:
  - Fetches pages with a realistic `User-Agent` and a configurable timeout (default 10s).
  - Uses `BeautifulSoup` to strip navigation (`<nav>`, `<header>`, `<footer>`, `<aside>`, `<script>`, `<style>`).
  - Extracts `<title>`, `<meta name="description">`, and `<h1>`–`<h3>` tags to form a clean semantic text representation.
  - Handles rate limiting gracefully (0.2s pause between HTTP requests).
- **Local Markdown Ingestion**:
  - Scans directory recursively for `.md` and `.markdown` files.
  - Splits frontmatter (`--- ... ---`) to extract `title:`, `date:`, and `permalink:` or `canonical_url:`.
  - Cleans markdown formatting (links, images, bolding, code fences) to produce plain prose.

### 4.2 `EmbeddingEngine`
- **SentenceTransformers Mode (Default)**:
  - Loads model (e.g. `all-MiniLM-L6-v2` or `BAAI/bge-small-en-v1.5`).
  - Encodes text list into normalized dense float vectors with progress bar.
- **Ollama / API Mode (Optional)**:
  - If `--ollama-url` is specified, calls the `/api/embeddings` endpoint with batching.
- Returns $(N \times D)$ normalized NumPy array.

### 4.3 `CannibalizationAnalyzer`
- **Similarity Calculation**:
  - Computes dot product matrix: $M = E \times E^T$.
  - Iterates through upper triangle ($i < j$).
  - Evaluates pairs where similarity $\ge \text{threshold}$ (default `0.82`).
- **Severity & Action Assignment**:
  - $\text{Score} \ge 0.90$: **Critical** $\rightarrow$ `301 Redirect / Merge (Near-Duplicate Intent)`.
  - $0.85 \le \text{Score} < 0.90$: **Severe** $\rightarrow$ `Consolidate or Canonicalize (Overlapping Core Entity)`.
  - $0.80 \le \text{Score} < 0.85$: **Moderate** $\rightarrow$ `Differentiate & Cross-Link (Sibling Intent)`.
- **Clustering & Top Terms**:
  - Applies `AgglomerativeClustering` (metric=`cosine`, linkage=`average`) to automatically detect $K$ natural clusters.
  - Uses TF-IDF or top term frequency per cluster to generate human-readable cluster labels (e.g. *"Optimizely CMS & Standards"*, *"Sovereign AI Security"*).
- **2D Dimensionality Reduction**:
  - Uses `TruncatedSVD` (or PCA) to project $D$-dimensional vectors to $(x, y)$ coordinates for visualization.

### 4.4 `ReportGenerator`
- **CSV Matrix**:
  - Writes `cannibalization_matrix.csv` sorted descending by `similarity_score`.
- **Plotly Visual Cluster Map (`cluster_visualization.html`)**:
  - Standalone HTML (zero external server required, contains bundled Plotly.js).
  - Each document is a scatter point $(x, y)$, colored by topic cluster.
  - Hover tooltip displays: `Title`, `URL`, `Word Count`, `Cluster`, and `Conflicting URLs Count`.
  - Draws semi-transparent red lines connecting documents that have a cannibalization link $\ge \text{threshold}$.
- **Executive Summary (`executive_summary.md`)**:
  - Formatted with clean GitHub Flavored Markdown and tables.
  - Metrics:
    - Total Pages Analyzed.
    - Cannibalization Severity Score: $\frac{\text{Unique Pages in Conflict}}{\text{Total Pages}} \times 100\%$.
    - Distribution of conflicts (Critical vs. Severe vs. Moderate).
    - Top 5 High-Impact Conflicts requiring immediate editorial attention.
    - Orphan / Isolated Topics (clusters with $\le 2$ articles and 0 cross-links).

---

## 5. CLI Interface Specification

```text
usage: semantic_audit.py [-h] [--sitemap URL] [--local-dir PATH]
                         [--threshold FLOAT] [--output-dir PATH]
                         [--model MODEL_NAME] [--ollama-url URL]
                         [--max-pages INT] [--min-word-count INT]

Run semantic content & cannibalization audit on a website or local content directory.

options:
  -h, --help            show this help message and exit
  --sitemap URL         URL to remote sitemap.xml
  --local-dir PATH      Path to local directory of Markdown or HTML files
  --threshold FLOAT     Cosine similarity threshold for cannibalization (default: 0.82)
  --output-dir PATH     Directory to write audit reports (default: reports/semantic_audit/)
  --model MODEL_NAME    SentenceTransformers model name (default: all-MiniLM-L6-v2)
  --ollama-url URL      Optional Ollama API base URL (e.g. http://localhost:11434)
  --max-pages INT       Maximum pages to ingest (useful for quick validation/spikes)
  --min-word-count INT  Ignore pages with fewer words than this limit (default: 100)
```

---

## 6. Test & Validation Plan

### 6.1 Unit Tests (`tests/test_semantic_audit.py`)
- `test_sitemap_xml_parsing()`: Parses sample XML string with standard `<url>` elements and extracts correct URLs.
- `test_local_markdown_parsing()`: Parses frontmatter and body from sample `.md` files.
- `test_pairwise_cosine_similarity()`: Validates math against known synthetic orthogonal and parallel vectors.
- `test_action_assignment()`: Confirms $0.92 \rightarrow$ `301 Redirect`, $0.87 \rightarrow$ `Consolidate`, $0.81 \rightarrow$ `Differentiate`.
- `test_report_generation()`: Verifies that CSV, HTML, and MD files are generated with valid structure.

### 6.2 Integration Smoke Test on Testbed
- Run CLI against `https://potnoddle.github.io/sitemap.xml` with local fallback to `_posts/`.
- Validate output directory `reports/semantic_audit_potnoddle/`:
  - `cannibalization_matrix.csv` contains parsed entries.
  - `cluster_visualization.html` opens cleanly in browser without JavaScript errors.
  - `executive_summary.md` renders accurate summary metrics.
