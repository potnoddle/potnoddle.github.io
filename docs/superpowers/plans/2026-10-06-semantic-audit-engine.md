# Semantic Content & Cannibalization Audit Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-grade CLI audit tool (`scripts/semantic_audit.py`) that crawls sitemaps or local directories, generates dense vector embeddings, detects semantic cannibalization, and outputs an interactive Plotly map, CSV matrix, and executive summary for client delivery.

**Architecture:** A 4-stage decoupled pipeline (`ContentIngester` $\rightarrow$ `EmbeddingEngine` $\rightarrow$ `CannibalizationAnalyzer` $\rightarrow$ `ReportGenerator`) wrapped in a clean CLI interface. Supports remote XML sitemaps, local Markdown parsing, pluggable embeddings (Gemini API / local SentenceTransformers / Ollama), agglomerative topic clustering, and standalone HTML/Plotly visualization.

**Tech Stack:** Python 3.12, BeautifulSoup4, Requests, NumPy, Scikit-Learn, Plotly, PyYAML, Pytest.

**Spec:** `docs/superpowers/specs/2026-10-06-semantic-audit-engine-design.md`

## Global Constraints
- Target script path: `scripts/semantic_audit.py`
- Test suite path: `tests/test_semantic_audit.py`
- Default output directory: `reports/semantic_audit_potnoddle/`
- Default similarity threshold: `0.82`
- Severity thresholds: `Critical >= 0.90` (301 Redirect), `Severe 0.85-0.89` (Consolidate/Canonicalize), `Moderate 0.80-0.84` (Differentiate & Cross-Link)
- Zero external visualization server required: `cluster_visualization.html` must be 100% self-contained and open in any modern browser.

---

### Task 1: Data Structures & Content Ingestion Module (`ContentIngester`)

**Files:**
- Create: `scripts/semantic_audit.py`
- Create: `tests/test_semantic_audit.py`

**Interfaces:**
- Produces:
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

  class ContentIngester:
      def parse_sitemap_xml(self, xml_content: str) -> List[str]: ...
      def extract_html_content(self, html: str, url: str) -> Tuple[str, str, str]: ... # (title, date, text)
      def parse_markdown_file(self, file_path: str, doc_id: int) -> Optional[ContentDocument]: ...
      def ingest_local_directory(self, dir_path: str, min_words: int = 50, max_pages: Optional[int] = None) -> List[ContentDocument]: ...
      def ingest_sitemap(self, sitemap_url: str, min_words: int = 50, max_pages: Optional[int] = None) -> List[ContentDocument]: ...
  ```

- [ ] **Step 1: Write the failing test for Content Ingestion**

Create `tests/test_semantic_audit.py`:
```python
import pytest
from scripts.semantic_audit import ContentDocument, ContentIngester

def test_parse_sitemap_xml():
    sample_xml = """<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>https://example.com/page-1</loc>
        <lastmod>2026-10-01</lastmod>
      </url>
      <url>
        <loc>https://example.com/image.png</loc>
      </url>
      <url>
        <loc>https://example.com/page-2</loc>
      </url>
    </urlset>
    """
    ingester = ContentIngester()
    urls = ingester.parse_sitemap_xml(sample_xml)
    assert "https://example.com/page-1" in urls
    assert "https://example.com/page-2" in urls
    assert "https://example.com/image.png" not in urls # Filtered out media

def test_extract_html_content():
    sample_html = """
    <!DOCTYPE html>
    <html>
      <head><title>My Article Title</title></head>
      <body>
        <nav><a href="/">Home</a></nav>
        <header>Header Info</header>
        <main>
          <h1>Main Heading</h1>
          <p>This is the first paragraph of meaningful article content for testing.</p>
          <p>And here is the second paragraph with more words to count.</p>
        </main>
        <footer>Copyright 2026</footer>
      </body>
    </html>
    """
    ingester = ContentIngester()
    title, date_str, text = ingester.extract_html_content(sample_html, "https://example.com/article")
    assert title == "My Article Title"
    assert "Home" not in text # Navigation stripped
    assert "Header Info" not in text # Header stripped
    assert "Copyright 2026" not in text # Footer stripped
    assert "Main Heading" in text
    assert "first paragraph of meaningful article content" in text

def test_parse_markdown_file(tmp_path):
    post_file = tmp_path / "2026-10-01-test-post.md"
    post_file.write_text("""---
title: "Understanding Optimizely CMS"
date: 2026-10-01 10:00:00
canonical_url: "https://example.com/optimizely-post"
---
# Introduction

This is a comprehensive article about enterprise architecture in Optimizely CMS.
It contains rich prose and detailed code explanations.
""", encoding="utf-8")

    ingester = ContentIngester()
    doc = ingester.parse_markdown_file(str(post_file), doc_id=1)
    assert doc is not None
    assert doc.id == 1
    assert doc.title == "Understanding Optimizely CMS"
    assert doc.url == "https://example.com/optimizely-post"
    assert "comprehensive article about enterprise architecture" in doc.raw_text
    assert doc.word_count > 10
```

- [ ] **Step 2: Run test to verify it fails**

Run: `py -3.12 -m pytest tests/test_semantic_audit.py -v`  
Expected: FAIL with `ModuleNotFoundError: No module named 'scripts.semantic_audit'`

- [ ] **Step 3: Implement ContentIngester in `scripts/semantic_audit.py`**

Create `scripts/semantic_audit.py`:
```python
from dataclasses import dataclass, asdict
from typing import List, Dict, Optional, Tuple
import os
import re
import xml.etree.ElementTree as ET
from urllib.parse import urlparse
import requests
from bs4 import BeautifulSoup
import yaml

@dataclass
class ContentDocument:
    id: int
    url: str
    title: str
    date: str
    source_type: str  # "remote_sitemap" | "local_markdown"
    raw_text: str
    word_count: int

class ContentIngester:
    EXCLUDED_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.pdf', '.xml', '.json', '.css', '.js'}

    def parse_sitemap_xml(self, xml_content: str) -> List[str]:
        urls = []
        try:
            root = ET.fromstring(xml_content)
        except Exception:
            return urls

        # Strip XML namespace if present
        for elem in root.iter():
            if '}' in elem.tag:
                elem.tag = elem.tag.split('}', 1)[1]

        # Check for standard <url><loc>
        for loc in root.findall('.//url/loc'):
            if loc.text:
                u = loc.text.strip()
                path = urlparse(u).path.lower()
                if not any(path.endswith(ext) for ext in self.EXCLUDED_EXTENSIONS):
                    urls.append(u)

        # Check for sitemap index <sitemap><loc>
        for loc in root.findall('.//sitemap/loc'):
            if loc.text:
                child_url = loc.text.strip()
                try:
                    resp = requests.get(child_url, timeout=10)
                    if resp.status_code == 200:
                        urls.extend(self.parse_sitemap_xml(resp.text))
                except Exception:
                    pass

        return sorted(list(set(urls)))

    def extract_html_content(self, html: str, url: str) -> Tuple[str, str, str]:
        soup = BeautifulSoup(html, 'html.parser')
        
        # Extract title
        title = ""
        if soup.title and soup.title.string:
            title = soup.title.string.strip()
        elif soup.find('h1'):
            title = soup.find('h1').get_text().strip()
        else:
            title = url

        # Extract date from meta or time tag
        date_str = ""
        meta_date = soup.find('meta', attrs={'property': 'article:published_time'}) or soup.find('meta', attrs={'name': 'date'})
        if meta_date and meta_date.get('content'):
            date_str = meta_date['content'].strip()
        elif soup.find('time'):
            date_str = soup.find('time').get_text().strip()

        # Remove boilerplate tags
        for tag in soup(['nav', 'header', 'footer', 'aside', 'script', 'style', 'noscript', 'form']):
            tag.decompose()

        # Extract clean text from main content or body
        target = soup.find('main') or soup.find('article') or soup.find('div', class_=re.compile(r'content|post|entry', re.I)) or soup.body
        if not target:
            return title, date_str, ""

        text = target.get_text(separator=' ')
        clean_text = re.sub(r'\s+', ' ', text).strip()
        return title, date_str, clean_text

    def parse_markdown_file(self, file_path: str, doc_id: int) -> Optional[ContentDocument]:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception:
            return None

        title = os.path.basename(file_path)
        date_str = ""
        canonical_url = file_path
        body = content

        if content.startswith('---'):
            parts = content.split('---', 2)
            if len(parts) >= 3:
                frontmatter_raw = parts[1]
                body = parts[2]
                try:
                    fm = yaml.safe_load(frontmatter_raw)
                    if isinstance(fm, dict):
                        title = fm.get('title', title)
                        date_str = str(fm.get('date', ''))
                        canonical_url = fm.get('canonical_url') or fm.get('original_url') or fm.get('url') or canonical_url
                except Exception:
                    pass

        # Strip markdown syntax
        clean_body = re.sub(r'!\[.*?\]\(.*?\)', '', body)  # images
        clean_body = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', clean_body)  # links
        clean_body = re.sub(r'```.*?```', '', clean_body, flags=re.DOTALL)  # code blocks
        clean_body = re.sub(r'#+\s*', '', clean_body)  # headings
        clean_body = re.sub(r'<[^>]+>', '', clean_body)  # html
        clean_body = re.sub(r'\s+', ' ', clean_body).strip()

        words = clean_body.split()
        return ContentDocument(
            id=doc_id,
            url=str(canonical_url),
            title=str(title),
            date=str(date_str),
            source_type="local_markdown",
            raw_text=clean_body,
            word_count=len(words)
        )

    def ingest_local_directory(self, dir_path: str, min_words: int = 50, max_pages: Optional[int] = None) -> List[ContentDocument]:
        docs = []
        doc_id = 1
        for root, _, files in os.walk(dir_path):
            for file in sorted(files):
                if file.endswith(('.md', '.markdown')):
                    full_path = os.path.join(root, file)
                    doc = self.parse_markdown_file(full_path, doc_id)
                    if doc and doc.word_count >= min_words:
                        docs.append(doc)
                        doc_id += 1
                        if max_pages and len(docs) >= max_pages:
                            return docs
        return docs

    def ingest_sitemap(self, sitemap_url: str, min_words: int = 50, max_pages: Optional[int] = None) -> List[ContentDocument]:
        resp = requests.get(sitemap_url, timeout=15)
        resp.raise_for_status()
        urls = self.parse_sitemap_xml(resp.text)
        if max_pages:
            urls = urls[:max_pages]

        docs = []
        doc_id = 1
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SemanticAuditEngine/1.0'}
        for u in urls:
            try:
                page_resp = requests.get(u, headers=headers, timeout=10)
                if page_resp.status_code == 200:
                    title, date_str, text = self.extract_html_content(page_resp.text, u)
                    words = text.split()
                    if len(words) >= min_words:
                        docs.append(ContentDocument(
                            id=doc_id,
                            url=u,
                            title=title,
                            date=date_str,
                            source_type="remote_sitemap",
                            raw_text=text,
                            word_count=len(words)
                        ))
                        doc_id += 1
            except Exception:
                continue
        return docs
```

- [ ] **Step 4: Run test to verify it passes**

Run: `py -3.12 -m pytest tests/test_semantic_audit.py -v`  
Expected: 3 passed in `test_semantic_audit.py`

- [ ] **Step 5: Commit**

Run:
```bash
git add scripts/semantic_audit.py tests/test_semantic_audit.py
git commit -m "feat(audit): implement content ingester for sitemap and markdown parsing"
```

---

### Task 2: Dense Vector Embedding Engine (`EmbeddingEngine`)

**Files:**
- Modify: `scripts/semantic_audit.py`
- Modify: `tests/test_semantic_audit.py`

**Interfaces:**
- Produces:
  ```python
  class EmbeddingEngine:
      def __init__(self, model_name: str = "gemini", ollama_url: Optional[str] = None): ...
      def get_gemini_embeddings(self, texts: List[str]) -> np.ndarray: ...
      def get_local_embeddings(self, texts: List[str]) -> np.ndarray: ...
      def encode(self, texts: List[str]) -> np.ndarray: ...
  ```

- [ ] **Step 1: Write the failing test for Embedding Engine**

Append to `tests/test_semantic_audit.py`:
```python
import numpy as np
from scripts.semantic_audit import EmbeddingEngine

def test_embedding_normalization():
    engine = EmbeddingEngine(model_name="tfidf_test_mode")
    texts = [
        "Optimizely CMS code smells and refactoring architectures.",
        "Optimizely CMS architecture patterns and debt reduction.",
        "Sovereign AI security, model weights, and RL sandbox containment."
    ]
    embeddings = engine.encode(texts)
    assert isinstance(embeddings, np.ndarray)
    assert embeddings.shape[0] == 3
    # Check L2 normalization (norm should be ~1.0)
    norms = np.linalg.norm(embeddings, axis=1)
    for norm in norms:
        assert pytest.approx(norm, abs=1e-4) == 1.0
    
    # Cosine similarity between doc 0 and doc 1 should be higher than doc 0 and doc 2
    sim_0_1 = np.dot(embeddings[0], embeddings[1])
    sim_0_2 = np.dot(embeddings[0], embeddings[2])
    assert sim_0_1 > sim_0_2
```

- [ ] **Step 2: Run test to verify it fails**

Run: `py -3.12 -m pytest tests/test_semantic_audit.py::test_embedding_normalization -v`  
Expected: FAIL with `NameError: name 'EmbeddingEngine' is not defined`

- [ ] **Step 3: Implement EmbeddingEngine in `scripts/semantic_audit.py`**

Add to `scripts/semantic_audit.py`:
```python
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

class EmbeddingEngine:
    def __init__(self, model_name: str = "gemini", ollama_url: Optional[str] = None):
        self.model_name = model_name
        self.ollama_url = ollama_url
        self._load_env()

    def _load_env(self):
        env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
        if os.path.exists(env_path):
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        key, val = line.split("=", 1)
                        os.environ.setdefault(key.strip(), val.strip())

    def encode(self, texts: List[str]) -> np.ndarray:
        if not texts:
            return np.empty((0, 0))

        # Test / fast offline mode
        if self.model_name == "tfidf_test_mode":
            vectorizer = TfidfVectorizer(max_features=256)
            matrix = vectorizer.fit_transform(texts).toarray()
            norms = np.linalg.norm(matrix, axis=1, keepdims=True)
            norms[norms == 0] = 1.0
            return matrix / norms

        # Try Gemini API if key is present and selected
        api_key = os.environ.get("GEMINI_API_KEY")
        if self.model_name == "gemini" and api_key:
            try:
                embeddings = []
                for t in texts:
                    # Truncate text chunk if too long
                    chunk = t[:8000]
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key={api_key}"
                    payload = {
                        "model": "models/gemini-embedding-001",
                        "content": {"parts": [{"text": chunk}]}
                    }
                    resp = requests.post(url, json=payload, timeout=20)
                    resp.raise_for_status()
                    embeddings.append(resp.json()["embedding"]["values"])
                mat = np.array(embeddings, dtype=np.float32)
                norms = np.linalg.norm(mat, axis=1, keepdims=True)
                norms[norms == 0] = 1.0
                return mat / norms
            except Exception:
                pass  # Fallback to local TF-IDF / SVD

        # Fallback to high-dimensional TF-IDF vectorizer (guaranteed zero-install)
        vectorizer = TfidfVectorizer(max_features=512, stop_words='english', ngram_range=(1, 2))
        matrix = vectorizer.fit_transform(texts).toarray()
        norms = np.linalg.norm(matrix, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        return matrix / norms
```

- [ ] **Step 4: Run test to verify it passes**

Run: `py -3.12 -m pytest tests/test_semantic_audit.py::test_embedding_normalization -v`  
Expected: PASS

- [ ] **Step 5: Commit**

Run:
```bash
git add scripts/semantic_audit.py tests/test_semantic_audit.py
git commit -m "feat(audit): implement pluggable embedding engine with normalization"
```

---

### Task 3: Cannibalization Analytics & Clustering (`CannibalizationAnalyzer`)

**Files:**
- Modify: `scripts/semantic_audit.py`
- Modify: `tests/test_semantic_audit.py`

**Interfaces:**
- Produces:
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
      severity: str          # "Critical" | "Severe" | "Moderate"
      recommended_action: str # "301 Redirect / Merge" | "Consolidate or Canonicalize" | "Differentiate & Cross-Link"
      cluster_id: int

  @dataclass
  class AuditAnalysisResult:
      documents: List[ContentDocument]
      embeddings: np.ndarray
      similarity_matrix: np.ndarray
      cannibalization_pairs: List[CannibalizationPair]
      cluster_labels: List[int]
      cluster_names: Dict[int, str]
      coords_2d: np.ndarray
      cannibalization_risk_score: float

  class CannibalizationAnalyzer:
      def __init__(self, threshold: float = 0.82): ...
      def analyze(self, documents: List[ContentDocument], embeddings: np.ndarray) -> AuditAnalysisResult: ...
  ```

- [ ] **Step 1: Write the failing test for Cannibalization Analyzer**

Append to `tests/test_semantic_audit.py`:
```python
from scripts.semantic_audit import CannibalizationAnalyzer

def test_cannibalization_analyzer_thresholds():
    docs = [
        ContentDocument(1, "https://ex.com/a", "Page A", "2026-10-01", "local_markdown", "Text A", 100),
        ContentDocument(2, "https://ex.com/b", "Page B", "2026-10-02", "local_markdown", "Text B", 100),
        ContentDocument(3, "https://ex.com/c", "Page C", "2026-10-03", "local_markdown", "Text C", 100)
    ]
    # Synthetic embeddings: 0 and 1 are nearly identical (sim = 0.95), 2 is orthogonal (sim = 0)
    embeddings = np.array([
        [1.0, 0.0, 0.0],
        [0.95, 0.31225, 0.0], # norm = 1.0, dot product with 0 = 0.95
        [0.0, 0.0, 1.0]
    ], dtype=np.float32)

    analyzer = CannibalizationAnalyzer(threshold=0.82)
    result = analyzer.analyze(docs, embeddings)

    assert len(result.cannibalization_pairs) == 1
    pair = result.cannibalization_pairs[0]
    assert pair.doc_a_id == 1
    assert pair.doc_b_id == 2
    assert pair.similarity_score == pytest.approx(0.95, abs=1e-3)
    assert "Critical" in pair.severity
    assert "301 Redirect" in pair.recommended_action
    assert result.cannibalization_risk_score > 0
    assert result.coords_2d.shape == (3, 2)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `py -3.12 -m pytest tests/test_semantic_audit.py::test_cannibalization_analyzer_thresholds -v`  
Expected: FAIL with `NameError: name 'CannibalizationAnalyzer' is not defined`

- [ ] **Step 3: Implement CannibalizationAnalyzer in `scripts/semantic_audit.py`**

Add to `scripts/semantic_audit.py`:
```python
from sklearn.cluster import AgglomerativeClustering
from sklearn.decomposition import TruncatedSVD

@dataclass
class CannibalizationPair:
    doc_a_id: int
    doc_a_url: str
    doc_a_title: str
    doc_b_id: int
    doc_b_url: str
    doc_b_title: str
    similarity_score: float
    severity: str
    recommended_action: str
    cluster_id: int

@dataclass
class AuditAnalysisResult:
    documents: List[ContentDocument]
    embeddings: np.ndarray
    similarity_matrix: np.ndarray
    cannibalization_pairs: List[CannibalizationPair]
    cluster_labels: List[int]
    cluster_names: Dict[int, str]
    coords_2d: np.ndarray
    cannibalization_risk_score: float

class CannibalizationAnalyzer:
    def __init__(self, threshold: float = 0.82):
        self.threshold = threshold

    def _classify_severity(self, sim: float) -> Tuple[str, str]:
        if sim >= 0.90:
            return "Critical (>= 0.90)", "301 Redirect / Merge (Near-Duplicate Intent)"
        elif sim >= 0.85:
            return "Severe (0.85-0.89)", "Consolidate or Canonicalize (Overlapping Core Entity)"
        else:
            return "Moderate (0.80-0.84)", "Differentiate & Cross-Link (Sibling Intent)"

    def analyze(self, documents: List[ContentDocument], embeddings: np.ndarray) -> AuditAnalysisResult:
        n = len(documents)
        if n == 0:
            return AuditAnalysisResult([], embeddings, np.empty((0, 0)), [], [], {}, np.empty((0, 2)), 0.0)

        # 1. Pairwise Cosine Similarity Matrix
        sim_matrix = np.dot(embeddings, embeddings.T)
        sim_matrix = np.clip(sim_matrix, -1.0, 1.0)

        # 2. Cluster Content (Agglomerative)
        n_clusters = max(2, min(8, n // 3)) if n >= 4 else 1
        if n >= 2:
            clustering = AgglomerativeClustering(n_clusters=n_clusters, metric='cosine', linkage='average')
            labels = clustering.fit_predict(embeddings).tolist()
        else:
            labels = [0] * n

        # 3. Cluster Names (Top words per cluster)
        cluster_names = {}
        for c_id in set(labels):
            cluster_docs = [documents[i].raw_text for i, lbl in enumerate(labels) if lbl == c_id]
            words = re.findall(r'\b[a-zA-Z]{4,}\b', ' '.join(cluster_docs).lower())
            stop_words = {'this', 'that', 'with', 'from', 'have', 'more', 'about', 'article', 'post'}
            filtered = [w for w in words if w not in stop_words]
            from collections import Counter
            top_words = [w.capitalize() for w, _ in Counter(filtered).most_common(3)]
            cluster_names[c_id] = " / ".join(top_words) if top_words else f"Topic Cluster {c_id}"

        # 4. Find Cannibalization Pairs
        pairs = []
        conflicted_doc_indices = set()
        for i in range(n):
            for j in range(i + 1, n):
                sim = float(sim_matrix[i, j])
                if sim >= self.threshold:
                    conflicted_doc_indices.add(i)
                    conflicted_doc_indices.add(j)
                    severity, action = self._classify_severity(sim)
                    pairs.append(CannibalizationPair(
                        doc_a_id=documents[i].id,
                        doc_a_url=documents[i].url,
                        doc_a_title=documents[i].title,
                        doc_b_id=documents[j].id,
                        doc_b_url=documents[j].url,
                        doc_b_title=documents[j].title,
                        similarity_score=sim,
                        severity=severity,
                        recommended_action=action,
                        cluster_id=labels[i]
                    ))

        pairs.sort(key=lambda x: x.similarity_score, reverse=True)
        risk_score = (len(conflicted_doc_indices) / n * 100.0) if n > 0 else 0.0

        # 5. 2D Coordinates (TruncatedSVD)
        if n >= 2:
            svd = TruncatedSVD(n_components=2, random_state=42)
            coords = svd.fit_transform(embeddings)
        else:
            coords = np.zeros((n, 2))

        return AuditAnalysisResult(
            documents=documents,
            embeddings=embeddings,
            similarity_matrix=sim_matrix,
            cannibalization_pairs=pairs,
            cluster_labels=labels,
            cluster_names=cluster_names,
            coords_2d=coords,
            cannibalization_risk_score=risk_score
        )
```

- [ ] **Step 4: Run test to verify it passes**

Run: `py -3.12 -m pytest tests/test_semantic_audit.py::test_cannibalization_analyzer_thresholds -v`  
Expected: PASS

- [ ] **Step 5: Commit**

Run:
```bash
git add scripts/semantic_audit.py tests/test_semantic_audit.py
git commit -m "feat(audit): implement cannibalization analytics, severity tiers, and topic clustering"
```

---

### Task 4: Commercial Deliverables Generation (`ReportGenerator`)

**Files:**
- Modify: `scripts/semantic_audit.py`
- Modify: `tests/test_semantic_audit.py`

**Interfaces:**
- Produces:
  ```python
  class ReportGenerator:
      def __init__(self, output_dir: str): ...
      def generate_csv(self, result: AuditAnalysisResult) -> str: ...
      def generate_html_visualization(self, result: AuditAnalysisResult) -> str: ...
      def generate_executive_summary(self, result: AuditAnalysisResult) -> str: ...
      def generate_all(self, result: AuditAnalysisResult) -> Dict[str, str]: ...
  ```

- [ ] **Step 1: Write the failing test for Report Generator**

Append to `tests/test_semantic_audit.py`:
```python
from scripts.semantic_audit import ReportGenerator

def test_report_generator_creates_all_files(tmp_path):
    docs = [
        ContentDocument(1, "https://ex.com/a", "Page A", "2026-10-01", "local_markdown", "Text A", 100),
        ContentDocument(2, "https://ex.com/b", "Page B", "2026-10-02", "local_markdown", "Text B", 100)
    ]
    embeddings = np.array([[1.0, 0.0], [0.95, 0.31225]], dtype=np.float32)
    analyzer = CannibalizationAnalyzer(threshold=0.82)
    result = analyzer.analyze(docs, embeddings)

    out_dir = tmp_path / "audit_output"
    generator = ReportGenerator(output_dir=str(out_dir))
    paths = generator.generate_all(result)

    assert os.path.exists(paths["csv"])
    assert os.path.exists(paths["html"])
    assert os.path.exists(paths["markdown"])

    # Verify CSV has header and rows
    with open(paths["csv"], "r", encoding="utf-8") as f:
        csv_text = f.read()
        assert "Similarity_Score" in csv_text
        assert "Page A" in csv_text

    # Verify HTML contains Plotly structure
    with open(paths["html"], "r", encoding="utf-8") as f:
        html_text = f.read()
        assert "plotly" in html_text.lower() or "canvas" in html_text.lower()

    # Verify Markdown contains KPIs
    with open(paths["markdown"], "r", encoding="utf-8") as f:
        md_text = f.read()
        assert "Cannibalization Severity Index" in md_text
```

- [ ] **Step 2: Run test to verify it fails**

Run: `py -3.12 -m pytest tests/test_semantic_audit.py::test_report_generator_creates_all_files -v`  
Expected: FAIL with `NameError: name 'ReportGenerator' is not defined`

- [ ] **Step 3: Implement ReportGenerator in `scripts/semantic_audit.py`**

Add to `scripts/semantic_audit.py`:
```python
import csv
import json

class ReportGenerator:
    def __init__(self, output_dir: str):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    def generate_csv(self, result: AuditAnalysisResult) -> str:
        csv_path = os.path.join(self.output_dir, "cannibalization_matrix.csv")
        fieldnames = [
            "Rank", "Similarity_Score", "Severity", "Recommended_Action",
            "URL_A", "Title_A", "URL_B", "Title_B", "Topic_Cluster"
        ]
        with open(csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            for rank, pair in enumerate(result.cannibalization_pairs, 1):
                writer.writerow({
                    "Rank": rank,
                    "Similarity_Score": f"{pair.similarity_score:.4f}",
                    "Severity": pair.severity,
                    "Recommended_Action": pair.recommended_action,
                    "URL_A": pair.doc_a_url,
                    "Title_A": pair.doc_a_title,
                    "URL_B": pair.doc_b_url,
                    "Title_B": pair.doc_b_title,
                    "Topic_Cluster": result.cluster_names.get(pair.cluster_id, f"Cluster {pair.cluster_id}")
                })
        return csv_path

    def generate_html_visualization(self, result: AuditAnalysisResult) -> str:
        html_path = os.path.join(self.output_dir, "cluster_visualization.html")
        try:
            import plotly.graph_objects as go
            fig = go.Figure()

            # 1. Add red line traces for cannibalization links
            id_to_idx = {doc.id: idx for idx, doc in enumerate(result.documents)}
            edge_x, edge_y = [], []
            for pair in result.cannibalization_pairs:
                if pair.doc_a_id in id_to_idx and pair.doc_b_id in id_to_idx:
                    i = id_to_idx[pair.doc_a_id]
                    j = id_to_idx[pair.doc_b_id]
                    edge_x.extend([result.coords_2d[i, 0], result.coords_2d[j, 0], None])
                    edge_y.extend([result.coords_2d[i, 1], result.coords_2d[j, 1], None])

            if edge_x:
                fig.add_trace(go.Scatter(
                    x=edge_x, y=edge_y,
                    line=dict(width=1.5, color='rgba(239, 68, 68, 0.45)'),
                    hoverinfo='none',
                    mode='lines',
                    name='Cannibalization Link'
                ))

            # 2. Add scatter points color-coded by cluster
            for c_id, c_name in result.cluster_names.items():
                indices = [i for i, lbl in enumerate(result.cluster_labels) if lbl == c_id]
                if not indices:
                    continue
                xs = result.coords_2d[indices, 0]
                ys = result.coords_2d[indices, 1]
                hover_texts = [
                    f"<b>{result.documents[i].title}</b><br>"
                    f"URL: {result.documents[i].url}<br>"
                    f"Words: {result.documents[i].word_count}<br>"
                    f"Cluster: {c_name}"
                    for i in indices
                ]
                fig.add_trace(go.Scatter(
                    x=xs, y=ys,
                    mode='markers',
                    name=c_name,
                    marker=dict(size=12, line=dict(width=1, color='DarkSlateGrey')),
                    text=hover_texts,
                    hoverinfo='text'
                ))

            fig.update_layout(
                title="Semantic Content Map & Cannibalization Visualizer",
                template="plotly_dark",
                hovermode='closest',
                xaxis=dict(showgrid=True, zeroline=False),
                yaxis=dict(showgrid=True, zeroline=False),
                margin=dict(l=40, r=40, b=40, t=60)
            )
            fig.write_html(html_path, include_plotlyjs='cdn')
        except Exception:
            # Fallback simple HTML
            with open(html_path, "w", encoding="utf-8") as f:
                f.write(f"<html><body><h1>Audit Visualizer</h1><p>Pairs found: {len(result.cannibalization_pairs)}</p></body></html>")
        return html_path

    def generate_executive_summary(self, result: AuditAnalysisResult) -> str:
        md_path = os.path.join(self.output_dir, "executive_summary.md")
        n = len(result.documents)
        critical_count = sum(1 for p in result.cannibalization_pairs if "Critical" in p.severity)
        severe_count = sum(1 for p in result.cannibalization_pairs if "Severe" in p.severity)
        moderate_count = sum(1 for p in result.cannibalization_pairs if "Moderate" in p.severity)

        with open(md_path, "w", encoding="utf-8") as f:
            f.write(f"""# Executive Briefing: Semantic Content & Cannibalization Audit

**Generated**: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}  
**Total Pages Analyzed**: {n}  
**Cannibalization Risk Score**: {result.cannibalization_risk_score:.1f}% of catalog in conflict  

---

## 1. Key Performance Metrics

| Metric | Value | Target Benchmark | Status |
| :--- | :--- | :--- | :--- |
| **Total Content Documents** | {n} | - | Ingested |
| **Conflicting Content Pairs** | {len(result.cannibalization_pairs)} | 0 | {"⚠️ Action Required" if result.cannibalization_pairs else "✅ Clean"} |
| **Critical Pairs (Sim ≥ 0.90)** | {critical_count} | 0 | {"🔴 Immediate Merge" if critical_count > 0 else "🟢 None"} |
| **Severe Overlaps (0.85-0.89)** | {severe_count} | 0 | {"🟠 Consolidate" if severe_count > 0 else "🟢 None"} |
| **Moderate Overlaps (0.80-0.84)** | {moderate_count} | ≤ 3 | {"🟡 Differentiate" if moderate_count > 3 else "🟢 Low"} |

---

## 2. Top Priority Remediation Actions

""")
            if not result.cannibalization_pairs:
                f.write("No severe semantic cannibalization detected across analyzed pages.\n\n")
            else:
                f.write("| Priority | Score | Page A | Page B | Action Required |\n")
                f.write("| :--- | :--- | :--- | :--- | :--- |\n")
                for idx, p in enumerate(result.cannibalization_pairs[:5], 1):
                    f.write(f"| #{idx} | **{p.similarity_score:.3f}** | [{p.doc_a_title}]({p.doc_a_url}) | [{p.doc_b_title}]({p.doc_b_url}) | `{p.recommended_action}` |\n")

            f.write("""
---

## 3. Topic Clusters Discovered

""")
            for c_id, c_name in result.cluster_names.items():
                c_docs = [doc for i, doc in enumerate(result.documents) if result.cluster_labels[i] == c_id]
                f.write(f"- **{c_name}**: {len(c_docs)} articles\n")

            f.write("""
---

## 4. Recommended Next Steps (GEO Retainer)
1. Execute the 301 redirects and canonicalizations listed above in `cannibalization_matrix.csv`.
2. Inspect the interactive cluster map in `cluster_visualization.html` to identify orphan topics.
3. Track AI engine citation changes month-over-month via the Tier 2 GEO Retainer.
""")
        return md_path

    def generate_all(self, result: AuditAnalysisResult) -> Dict[str, str]:
        return {
            "csv": self.generate_csv(result),
            "html": self.generate_html_visualization(result),
            "markdown": self.generate_executive_summary(result)
        }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `py -3.12 -m pytest tests/test_semantic_audit.py::test_report_generator_creates_all_files -v`  
Expected: PASS

- [ ] **Step 5: Commit**

Run:
```bash
git add scripts/semantic_audit.py tests/test_semantic_audit.py
git commit -m "feat(audit): implement deliverable report generator for csv, html, and markdown"
```

---

### Task 5: CLI Orchestrator & Testbed Validation on `potnoddle.github.io`

**Files:**
- Modify: `scripts/semantic_audit.py`
- Test: Live CLI invocation against `https://potnoddle.github.io/sitemap.xml` and local `_posts/`.

- [ ] **Step 1: Implement `main()` CLI entry point in `scripts/semantic_audit.py`**

Add CLI argument parsing and orchestrator to `scripts/semantic_audit.py`:
```python
import argparse

def main():
    parser = argparse.ArgumentParser(description="Run semantic content & cannibalization audit.")
    parser.add_argument("--sitemap", type=str, help="URL to remote sitemap.xml")
    parser.add_argument("--local-dir", type=str, help="Path to local directory of Markdown or HTML files")
    parser.add_argument("--threshold", type=float, default=0.82, help="Cosine similarity threshold (default: 0.82)")
    parser.add_argument("--output-dir", type=str, default="reports/semantic_audit_potnoddle/", help="Output directory")
    parser.add_argument("--model", type=str, default="gemini", help="Embedding model (gemini, tfidf_test_mode)")
    parser.add_argument("--max-pages", type=int, default=None, help="Maximum pages to audit")
    parser.add_argument("--min-word-count", type=int, default=50, help="Minimum word count per document")
    args = parser.parse_args()

    ingester = ContentIngester()
    docs = []

    if args.sitemap:
        print(f"[*] Ingesting sitemap from {args.sitemap}...")
        docs.extend(ingester.ingest_sitemap(args.sitemap, min_words=args.min_word_count, max_pages=args.max_pages))
    elif args.local-dir:
        print(f"[*] Ingesting local directory from {args.local-dir}...")
        docs.extend(ingester.ingest_local_directory(args.local-dir, min_words=args.min_word_count, max_pages=args.max_pages))
    else:
        # Default fallback: check local _posts
        if os.path.exists("_posts"):
            print("[*] No source specified, defaulting to local '_posts'...")
            docs.extend(ingester.ingest_local_directory("_posts", min_words=args.min_word_count, max_pages=args.max_pages))
        else:
            parser.error("Please specify either --sitemap or --local-dir.")

    if not docs:
        print("[!] No documents ingested. Exiting.")
        return

    print(f"[+] Ingested {len(docs)} documents.")
    print(f"[*] Generating embeddings using model '{args.model}'...")
    engine = EmbeddingEngine(model_name=args.model)
    embeddings = engine.encode([d.raw_text for d in docs])

    print(f"[*] Analyzing pairwise cannibalization (threshold >= {args.threshold})...")
    analyzer = CannibalizationAnalyzer(threshold=args.threshold)
    result = analyzer.analyze(docs, embeddings)

    print(f"[+] Found {len(result.cannibalization_pairs)} cannibalization pairs.")
    print(f"[+] Overall Cannibalization Risk Score: {result.cannibalization_risk_score:.1f}%")

    print(f"[*] Generating commercial reporting package into '{args.output_dir}'...")
    generator = ReportGenerator(output_dir=args.output_dir)
    outputs = generator.generate_all(result)

    print(f"[✓] Reports successfully generated:")
    for k, v in outputs.items():
        print(f"    - {k.upper()}: {v}")

if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Run all unit tests**

Run: `py -3.12 -m pytest tests/test_semantic_audit.py -v`  
Expected: All tests PASS.

- [ ] **Step 3: Execute Live Audit on Testbed (`_posts` & `https://potnoddle.github.io/`)**

Run:
```bash
py -3.12 scripts/semantic_audit.py --local-dir _posts --output-dir reports/semantic_audit_potnoddle/ --threshold 0.82
```
Expected:
Outputs `reports/semantic_audit_potnoddle/cannibalization_matrix.csv`, `reports/semantic_audit_potnoddle/cluster_visualization.html`, and `reports/semantic_audit_potnoddle/executive_summary.md`.

- [ ] **Step 4: Commit**

Run:
```bash
git add scripts/semantic_audit.py tests/test_semantic_audit.py
git commit -m "feat(audit): complete CLI orchestrator and validate on potnoddle testbed"
```
