/**
 * Accessibility & Usability Enhancements
 * Handles:
 * 1. Accessibility Panel (Settings for Contrast, Font, Text Size, Spacing)
 * 2. Persistent Settings via LocalStorage
 * 3. Text-to-Speech Reader with Highlight Support
 * 4. Homepage Search & Tag Filter
 * 5. Dynamic Table of Contents (TOC)
 * 6. Scrolling Reading Progress Bar
 */

document.addEventListener('DOMContentLoaded', () => {
  initA11ySettings();
  initA11yWidget();
  initReadingProgressBar();
  initTableOfContents();
  initSearchAndFilter();
});

// ==========================================
// 1. Accessibility Settings & LocalStorage
// ==========================================
const A11Y_CONFIGS = {
  theme: ['default', 'dark', 'light', 'dyslexia'],
  font: ['default', 'sans', 'serif', 'dyslexic'],
  size: ['default', 'large', 'xlarge'],
  spacing: ['default', 'spacious']
};

function initA11ySettings() {
  // Load and apply settings from localStorage
  Object.keys(A11Y_CONFIGS).forEach(key => {
    const savedVal = localStorage.getItem(`a11y-${key}`);
    if (savedVal && A11Y_CONFIGS[key].includes(savedVal)) {
      applySetting(key, savedVal);
    }
  });
}

function applySetting(key, value) {
  // Remove existing classes for this key
  A11Y_CONFIGS[key].forEach(val => {
    document.body.classList.remove(`a11y-${key}-${val}`);
  });

  // Apply new class (except for default)
  if (value !== 'default') {
    document.body.classList.add(`a11y-${key}-${value}`);
  }

  // Save to localStorage
  localStorage.setItem(`a11y-${key}`, value);

  // Update active state in panel buttons
  updateActivePanelButtons();
}

function updateActivePanelButtons() {
  Object.keys(A11Y_CONFIGS).forEach(key => {
    const activeVal = localStorage.getItem(`a11y-${key}`) || 'default';
    const buttons = document.querySelectorAll(`.a11y-btn[data-type="${key}"]`);
    buttons.forEach(btn => {
      if (btn.getAttribute('data-value') === activeVal) {
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      }
    });
  });
}

// ==========================================
// 2. Accessibility Widget DOM & Trap Focus
// ==========================================
function initA11yWidget() {
  // Check if widget container already exists
  if (document.querySelector('.a11y-widget')) return;

  const widgetHTML = `
    <div class="a11y-widget" id="a11y-widget-container">
      <button class="a11y-toggle-btn" id="a11y-toggle-btn" aria-haspopup="dialog" aria-expanded="false" aria-label="Open Accessibility & Reading Settings" title="Accessibility Settings">
        <i class="fas fa-universal-access" aria-hidden="true"></i>
      </button>
      <div class="a11y-panel" id="a11y-panel" role="dialog" aria-modal="true" aria-labelledby="a11y-title" aria-hidden="true" tabindex="-1">
        <div class="a11y-header">
          <h2 id="a11y-title"><i class="fas fa-sliders-h" aria-hidden="true"></i> Settings</h2>
          <button class="a11y-close-btn" id="a11y-close-btn" aria-label="Close settings dialog" title="Close Settings">
            <i class="fas fa-times" aria-hidden="true"></i>
          </button>
        </div>

        <div class="a11y-section">
          <h3>Contrast & Themes</h3>
          <div class="a11y-grid">
            <button class="a11y-btn" data-type="theme" data-value="default">Default</button>
            <button class="a11y-btn" data-type="theme" data-value="dark">High Dark</button>
            <button class="a11y-btn" data-type="theme" data-value="light">High Light</button>
            <button class="a11y-btn" data-type="theme" data-value="dyslexia">Warm Ivory</button>
          </div>
        </div>

        <div class="a11y-section">
          <h3>Typography</h3>
          <div class="a11y-grid">
            <button class="a11y-btn" data-type="font" data-value="default">Default</button>
            <button class="a11y-btn" data-type="font" data-value="sans">Sans Serif</button>
            <button class="a11y-btn" data-type="font" data-value="serif">Serif</button>
            <button class="a11y-btn" data-type="font" data-value="dyslexic">Dyslexia Friendly</button>
          </div>
        </div>

        <div class="a11y-section">
          <h3>Text Size</h3>
          <div class="a11y-grid">
            <button class="a11y-btn" data-type="size" data-value="default">Default</button>
            <button class="a11y-btn" data-type="size" data-value="large">Large</button>
            <button class="a11y-btn" data-type="size" data-value="xlarge" style="grid-column: span 2;">Extra Large</button>
          </div>
        </div>

        <div class="a11y-section">
          <h3>Line Spacing</h3>
          <div class="a11y-grid">
            <button class="a11y-btn" data-type="spacing" data-value="default">Normal</button>
            <button class="a11y-btn" data-type="spacing" data-value="spacious">Spacious</button>
          </div>
        </div>

        <div class="a11y-section" id="tts-container" style="display:none;">
          <h3>Listen to Article</h3>
          <div class="a11y-grid">
            <button class="a11y-btn" id="tts-play-btn"><i class="fas fa-play"></i> Play</button>
            <button class="a11y-btn" id="tts-stop-btn"><i class="fas fa-stop"></i> Stop</button>
            <button class="a11y-btn a11y-btn-full" id="tts-speed-btn" style="flex-direction:row; gap:8px;">
              <i class="fas fa-tachometer-alt"></i> Speed: <span id="tts-speed-val">1.0x</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', widgetHTML);

  const container = document.getElementById('a11y-widget-container');
  const toggleBtn = document.getElementById('a11y-toggle-btn');
  const panel = document.getElementById('a11y-panel');
  const closeBtn = document.getElementById('a11y-close-btn');

  // Show TTS section only on article pages
  const articleBody = document.getElementById('article-body');
  if (articleBody) {
    document.getElementById('tts-container').style.display = 'block';
    initTTS(articleBody);
  }

  // Toggle Panel Open/Close
  function openPanel() {
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    toggleBtn.setAttribute('aria-expanded', 'true');
    closeBtn.focus();
    document.addEventListener('keydown', trapFocus);
  }

  function closePanel() {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.focus();
    document.removeEventListener('keydown', trapFocus);
  }

  toggleBtn.addEventListener('click', () => {
    panel.classList.contains('open') ? closePanel() : openPanel();
  });

  closeBtn.addEventListener('click', closePanel);

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('open')) {
      closePanel();
    }
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target) && panel.classList.contains('open')) {
      closePanel();
    }
  });

  // Handle panel option buttons
  panel.querySelectorAll('.a11y-btn[data-type]').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-type');
      const val = btn.getAttribute('data-value');
      applySetting(type, val);
    });
  });

  // Keyboard accessibility: Focus trapping inside dialog when open
  function trapFocus(e) {
    if (e.key !== 'Tab') return;

    const focusables = panel.querySelectorAll('button, [tabindex="0"]');
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        last.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }
  }

  updateActivePanelButtons();
}

// ==========================================
// 3. Text-To-Speech (TTS) Reader Logic
// ==========================================
let ttsUtterance = null;
let ttsSpeaking = false;
let ttsPaused = false;
let ttsBlocks = [];
let currentBlockIndex = -1;
let ttsSpeed = 1.0;

function initTTS(articleBody) {
  if (!('speechSynthesis' in window)) return;

  const playBtn = document.getElementById('tts-play-btn');
  const stopBtn = document.getElementById('tts-stop-btn');
  const speedBtn = document.getElementById('tts-speed-btn');
  const speedVal = document.getElementById('tts-speed-val');

  // Parse readable blocks (headings, paragraphs, lists)
  // Exclude script, style, banners or comments
  const rawBlocks = articleBody.querySelectorAll('p, h2, h3, h4, li');
  ttsBlocks = Array.from(rawBlocks).filter(block => {
    // Only read elements that contain meaningful text and are visible
    return block.textContent.trim().length > 0 && 
           !block.closest('.post-toc') && 
           !block.closest('.social-links');
  });

  playBtn.addEventListener('click', () => {
    if (ttsSpeaking) {
      if (ttsPaused) {
        window.speechSynthesis.resume();
        ttsPaused = false;
        playBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        playBtn.setAttribute('aria-label', 'Pause speaking');
      } else {
        window.speechSynthesis.pause();
        ttsPaused = true;
        playBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
        playBtn.setAttribute('aria-label', 'Resume speaking');
      }
    } else {
      startSpeech();
    }
  });

  stopBtn.addEventListener('click', () => {
    stopSpeech();
  });

  speedBtn.addEventListener('click', () => {
    // Cycles speed: 1.0x -> 1.25x -> 1.5x -> 1.75x -> 2.0x -> 0.75x -> 1.0x
    if (ttsSpeed === 1.0) ttsSpeed = 1.25;
    else if (ttsSpeed === 1.25) ttsSpeed = 1.5;
    else if (ttsSpeed === 1.5) ttsSpeed = 1.75;
    else if (ttsSpeed === 1.75) ttsSpeed = 2.0;
    else if (ttsSpeed === 2.0) ttsSpeed = 0.75;
    else ttsSpeed = 1.0;

    speedVal.textContent = `${ttsSpeed.toFixed(2)}x`;

    // If currently speaking, restart with new speed from current block
    if (ttsSpeaking) {
      window.speechSynthesis.cancel();
      readBlock(currentBlockIndex);
    }
  });

  window.addEventListener('beforeunload', () => {
    window.speechSynthesis.cancel();
  });
}

function startSpeech() {
  ttsSpeaking = true;
  ttsPaused = false;
  currentBlockIndex = 0;
  
  const playBtn = document.getElementById('tts-play-btn');
  playBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
  playBtn.setAttribute('aria-label', 'Pause speaking');

  readBlock(currentBlockIndex);
}

function stopSpeech() {
  window.speechSynthesis.cancel();
  clearTTSHighlight();
  ttsSpeaking = false;
  ttsPaused = false;
  currentBlockIndex = -1;

  const playBtn = document.getElementById('tts-play-btn');
  if (playBtn) {
    playBtn.innerHTML = '<i class="fas fa-play"></i> Play';
    playBtn.setAttribute('aria-label', 'Play reading aloud');
  }
}

function readBlock(index) {
  if (index < 0 || index >= ttsBlocks.length) {
    stopSpeech();
    return;
  }

  currentBlockIndex = index;
  const block = ttsBlocks[index];

  // Highlight block
  clearTTSHighlight();
  block.classList.add('tts-highlight');
  
  // Scroll to block smoothly
  block.scrollIntoView({ behavior: 'smooth', block: 'center' });

  // Synthesize text
  // Filter out link target text or formatting hints to make speech natural
  const text = block.textContent;

  ttsUtterance = new SpeechSynthesisUtterance(text);
  ttsUtterance.rate = ttsSpeed;

  ttsUtterance.onend = () => {
    if (ttsSpeaking && !ttsPaused) {
      readBlock(index + 1);
    }
  };

  ttsUtterance.onerror = (e) => {
    if (e.error !== 'interrupted') {
      stopSpeech();
    }
  };

  window.speechSynthesis.speak(ttsUtterance);
}

function clearTTSHighlight() {
  document.querySelectorAll('.tts-highlight').forEach(el => {
    el.classList.remove('tts-highlight');
  });
}

// ==========================================
// 4. Reading Progress Bar
// ==========================================
function initReadingProgressBar() {
  const container = document.querySelector('.reading-progress-container');
  if (!container) return;

  const bar = container.querySelector('.reading-progress-bar');
  if (!bar) return;

  let cachedHeight = 0;
  const updateCachedHeight = () => {
    cachedHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  };

  // Calculate height once page is fully loaded to prevent forced reflows during DOMContentLoaded
  window.addEventListener('load', updateCachedHeight, { passive: true });

  // Reset cached height on resize/hydration so it is lazy-recalculated on next scroll
  window.addEventListener('resize', () => { cachedHeight = 0; }, { passive: true });
  document.addEventListener('posts-hydrated', () => { cachedHeight = 0; });

  window.addEventListener('scroll', () => {
    if (cachedHeight <= 0) {
      updateCachedHeight();
    }
    const winScroll = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
    
    if (cachedHeight > 0) {
      const scrolled = (winScroll / cachedHeight) * 100;
      bar.style.width = scrolled + '%';
    } else {
      bar.style.width = '0%';
    }
  }, { passive: true });
}

// ==========================================
// 5. Dynamic Table of Contents (TOC)
// ==========================================
function initTableOfContents() {
  const tocColumn = document.querySelector('.post-toc-column');
  const articleBody = document.getElementById('article-body');
  
  if (!tocColumn || !articleBody) return;

  const headers = articleBody.querySelectorAll('h2, h3');
  if (headers.length === 0) {
    tocColumn.style.display = 'none';
    return;
  }

  let tocHTML = `
    <nav class="post-toc" aria-label="Table of contents">
      <h2>In This Article</h2>
      <ul>
  `;

  headers.forEach((header, index) => {
    // Generate an ID if not present
    if (!header.id) {
      header.id = header.textContent
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      // Ensure uniqueness
      if (document.getElementById(header.id)) {
        header.id += `-${index}`;
      }
    }

    const tag = header.tagName.toLowerCase();
    const linkClass = tag === 'h2' ? 'post-toc-h2' : 'post-toc-h3';
    
    tocHTML += `
      <li class="${linkClass}">
        <a href="#${header.id}">${header.textContent}</a>
      </li>
    `;
  });

  tocHTML += `
      </ul>
    </nav>
  `;

  tocColumn.innerHTML = tocHTML;
}

// ==========================================
// 6. Homepage Search & Tag Filter
// ==========================================
function initSearchAndFilter() {
  const postsList = document.querySelector('.post-list');
  
  if (!postsList) return;

  let postItems = Array.from(postsList.querySelectorAll('.post-item'));
  if (postItems.length === 0) return;

  let activeTag = null;
  let hydrated = false;

  const triggerHydration = () => {
    if (hydrated) return;
    hydrated = true;
    hydratePosts();
  };

  // Helper to validate and clean up tags (excluding hex codes, numbers, and navigation keywords)
  const isValidTag = (tag) => {
    if (!tag) return false;
    const clean = tag.trim().toLowerCase();
    
    // Filter out 3 or 6 character hex color codes
    if (/^[0-9a-f]{3}$|^[0-9a-f]{6}$/.test(clean)) return false;
    
    // Filter out menu/system links
    const ignored = ["about", "contact", "home", "services", "html", "paul graham"];
    if (ignored.includes(clean)) return false;
    
    // Filter out pure numbers
    if (/^\d+$/.test(clean)) return false;
    
    return true;
  };

  // Helper to format lowercase tags back into readable Title Case/Acronyms
  const formatTagName = (tag) => {
    const acronyms = ["ai", "agi", "api", "amp", "css", "cmp", "cms", "dxp", "odp", "mcp", "seo", "sdd", "opfs", "pwa", "tts", "llm", "llms", "vr", "kpis", "fbi", "foi", "dod", "risc", "lora", "c2pa"];
    return tag.split(' ').map(word => {
      const lower = word.toLowerCase();
      if (acronyms.includes(lower)) {
        return word.toUpperCase();
      }
      if (lower === "dotnet") return "DotNet";
      if (lower === "nextjs") return "NextJS";
      if (lower === "reactjs") return "ReactJS";
      if (lower === "vuejs") return "VueJS";
      if (lower === "nhsengland") return "NHS England";
      return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
  };

  // Function to bind event listeners to statically rendered tag buttons
  const bindTags = () => {
    const tagsContainer = document.getElementById('tags-filter-container');
    if (!tagsContainer) return;

    // Add event listener to the toggle button
    const toggleBtn = document.getElementById('tag-toggle-btn');
    let extraTagsLoaded = false;

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
        
        if (!extraTagsLoaded) {
          const template = document.getElementById('hidden-tags-template');
          if (template) {
            const clone = template.content.cloneNode(true);
            
            // Bind click event listeners to the new buttons
            const newButtons = clone.querySelectorAll('.tag-btn');
            newButtons.forEach(btn => {
              btn.classList.add('tag-peek-hidden');
              btn.style.display = 'inline-block';
              
              btn.addEventListener('click', () => {
                triggerHydration();
                const tag = btn.getAttribute('data-tag');
                const allTagButtons = tagsContainer.querySelectorAll('.tag-btn');

                if (btn.classList.contains('active')) {
                  btn.classList.remove('active');
                  btn.removeAttribute('aria-pressed');
                  activeTag = null;
                } else {
                  allTagButtons.forEach(b => {
                    b.classList.remove('active');
                    b.removeAttribute('aria-pressed');
                  });
                  btn.classList.add('active');
                  btn.setAttribute('aria-pressed', 'true');
                  activeTag = tag;
                }
                filterPosts();
              });
            });
            
            // Insert clone before the toggle button
            tagsContainer.insertBefore(clone, toggleBtn);
            extraTagsLoaded = true;
          }
        } else {
          const hiddenTags = tagsContainer.querySelectorAll('.tag-peek-hidden');
          hiddenTags.forEach(btn => {
            btn.style.display = isExpanded ? 'none' : 'inline-block';
          });
        }
        
        toggleBtn.setAttribute('aria-expanded', !isExpanded);
        toggleBtn.innerHTML = isExpanded 
            ? `<i class="fas fa-chevron-down" style="margin-right: 5px;"></i> Show More`
            : `<i class="fas fa-chevron-up" style="margin-right: 5px;"></i> Show Less`;
        toggleBtn.setAttribute('aria-label', isExpanded ? "Show all topics" : "Show fewer topics");
      });
    }

    // Add event listeners to initial tag buttons
    const tagButtons = tagsContainer.querySelectorAll('.tag-btn');
    tagButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        triggerHydration();
        const tag = btn.getAttribute('data-tag');
        const allTagButtons = tagsContainer.querySelectorAll('.tag-btn');

        if (btn.classList.contains('active')) {
          btn.classList.remove('active');
          btn.removeAttribute('aria-pressed');
          activeTag = null;
        } else {
          allTagButtons.forEach(b => {
            b.classList.remove('active');
            b.removeAttribute('aria-pressed');
          });
          btn.classList.add('active');
          btn.setAttribute('aria-pressed', 'true');
          activeTag = tag;
        }
        filterPosts();
      });
    });
  };

  const filterPosts = () => {
    let visibleCount = 0;

    postItems.forEach(item => {
      const tags = (item.getAttribute('data-tags') || '').toLowerCase();
      const matchesTag = !activeTag || tags.split(',').map(t=>t.trim()).includes(activeTag);

      if (matchesTag) {
        item.style.display = '';
        visibleCount++;
      } else {
        item.style.display = 'none';
      }
    });

    // Update results info
    const info = document.getElementById('search-results-info');
    const label = document.getElementById('search-results-label');
    
    if (label) {
      const totalPosts = parseInt(postsList.getAttribute('data-total-posts')) || postItems.length;
      const displayTotal = hydrated ? postItems.length : totalPosts;
      const displayVisible = activeTag ? visibleCount : displayTotal;
      label.textContent = `Showing ${displayVisible} of ${displayTotal} articles`;
    }

    if (info) {
      info.textContent = `Articles filtered. ${visibleCount} articles found.`;
    }
  };

  const progressiveLimit = parseInt(postsList.getAttribute('data-progressive-limit')) || 0;

  // Always bind click listeners to statically pre-rendered tags
  bindTags();

  // Dynamic hydration of remaining posts
  const hydratePosts = async () => {
    try {
      const response = await fetch('/posts.json');
      if (!response.ok) return;
      const data = await response.json();
      if (!Array.isArray(data)) return;

      const fragment = document.createDocumentFragment();

      data.forEach(post => {
        const li = document.createElement('li');
        li.className = 'post-item';
        li.setAttribute('data-title', (post.title || '').toLowerCase());
        li.setAttribute('data-description', (post.description || '').toLowerCase());
        li.setAttribute('data-tags', (post.tags || '').toLowerCase());

        let bannerHTML = '';
        if (post.banner) {
          const thumbBanner = post.banner.replace('/images/', '/images/thumbnails/');
          const lastDotIdx = thumbBanner.lastIndexOf('.');
          const base = thumbBanner.substring(0, lastDotIdx);
          const avifThumb = base + '.avif';
          const webpThumb = base + '.webp';
          bannerHTML = `
            <a href="${post.url}" class="post-banner-link">
              <picture>
                <source srcset="${avifThumb}" type="image/avif">
                <source srcset="${webpThumb}" type="image/webp">
                <img src="${thumbBanner}" alt="${post.title}" class="post-list-banner" width="200" height="120" loading="lazy" decoding="async">
              </picture>
            </a>
          `;
        }

        const descHTML = post.description ? `<p>${post.description}</p>` : '';

        li.innerHTML = `
          ${bannerHTML}
          <div class="post-item-content">
            <span class="post-meta">${post.date}</span>
            <h3>
              <a class="post-link" href="${post.url}">
                ${post.title}
              </a>
            </h3>
            ${descHTML}
          </div>
        `;
        fragment.appendChild(li);
      });

      postsList.appendChild(fragment);

      // Re-query the postItems to include newly hydrated posts
      postItems = Array.from(postsList.querySelectorAll('.post-item'));

      // Filter the newly loaded posts if a tag is active
      filterPosts();

      // Dispatch custom event to notify that page height has changed
      document.dispatchEvent(new CustomEvent('posts-hydrated'));

    } catch (e) {
      console.warn("Failed to progressively hydrate articles:", e);
    }
  };

  // Hydrate remaining posts when the user scrolls near the bottom or clicks/searches
  if (progressiveLimit > 0) {
    // 1. Trigger when scrolling near the bottom (IntersectionObserver)
    const sentinel = document.querySelector('.rss-subscribe') || postsList;
    if (sentinel && window.IntersectionObserver) {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          triggerHydration();
          observer.unobserve(sentinel);
        }
      }, { rootMargin: '300px' });
      observer.observe(sentinel);
    } else {
      // Fallback for older browsers
      const handleScroll = () => {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
          triggerHydration();
          window.removeEventListener('scroll', handleScroll);
        }
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    // 2. Trigger on search input focus/interaction (if search exists in footer/nav/etc)
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
      searchInput.addEventListener('focus', triggerHydration);
      searchInput.addEventListener('input', triggerHydration);
    }
  }
}
