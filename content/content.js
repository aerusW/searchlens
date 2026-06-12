const DEFAULTS = {
  hideSponsored: true,
  showImages:    true,
  filetypes:     [],
  language:      '',
  domains:       [],
  siteFilter:    '',
};

const IMAGE_SELECTORS = {
  google:     ['g-section-with-header .ULSxyf', '.YiHbdc'],
  duckduckgo: ['.zci--images'],
  bing:       ['#vm-web'],
};

const SPONSORED_SELECTORS = {
  google: [
    '#tads', '#tadsb', '[data-text-ad]',
    '.commercial-unit-desktop-top', '.commercial-unit-desktop-rhs',
    'div[id^="tvcap"]', '[data-sokoban-feature]',
  ],
  duckduckgo: ['.result--ad', '[data-testid="ad"]', '[data-area="promoted"]'],
  bing:       ['.b_ad', '.b_adLastChild', '#b_results > li.b_ad'],
  brave:      ['.search-result-ads', '[data-type="ad"]'],
  yahoo:      ['[data-test-locator="sponsored"]', '.dd.algo-sr'],
};

let settings = { ...DEFAULTS };
let engine   = null;

function detectEngine() {
  const h = location.hostname;
  if (h.startsWith('www.google.'))  return 'google';
  if (h === 'duckduckgo.com')       return 'duckduckgo';
  if (h === 'www.bing.com')         return 'bing';
  if (h === 'search.brave.com')     return 'brave';
  if (h === 'search.yahoo.com')     return 'yahoo';
  return null;
}

function getResultElements() {
  switch (engine) {
    case 'google':     return document.querySelectorAll('#search .g');
    case 'duckduckgo': return document.querySelectorAll('.result:not(.result--ad)');
    case 'bing':       return document.querySelectorAll('#b_results > li.b_algo');
    case 'brave':      return document.querySelectorAll('[data-type="web"]');
    case 'yahoo':      return document.querySelectorAll('.algo');
    default:           return [];
  }
}

function getResultURL(el) {
  const a = el.querySelector('a[href]');
  if (!a) return null;
  try { return new URL(a.href); } catch { return null; }
}

// --- Sponsored ---
function applySponsored() {
  const sels = SPONSORED_SELECTORS[engine];
  if (!sels) return;
  for (const sel of sels) {
    document.querySelectorAll(sel).forEach(el =>
      el.classList.toggle('searchlens-hidden', settings.hideSponsored));
  }
}

// --- Images ---
function applyImages() {
  const sels = IMAGE_SELECTORS[engine];
  if (!sels) return;
  for (const sel of sels) {
    document.querySelectorAll(sel).forEach(el =>
      el.classList.toggle('searchlens-hidden', !settings.showImages));
  }
}

// --- Filetypes ---
function applyFiletypes() {
  const results = getResultElements();
  results.forEach(el => {
    if (!settings.filetypes.length) {
      if (el.dataset.slFiletype) {
        el.classList.remove('searchlens-hidden');
        delete el.dataset.slFiletype;
      }
      return;
    }
    const url = getResultURL(el);
    if (!url) return;
    const path = url.pathname.toLowerCase();
    const matches = settings.filetypes.some(ext => path.endsWith('.' + ext));
    el.classList.toggle('searchlens-hidden', !matches);
    if (!matches) el.dataset.slFiletype = '1';
    else delete el.dataset.slFiletype;
  });
}

// --- Domains ---
function applyDomains() {
  const results = getResultElements();
  results.forEach(el => {
    if (!settings.domains.length) {
      if (el.dataset.slDomain) {
        el.classList.remove('searchlens-hidden');
        delete el.dataset.slDomain;
      }
      return;
    }
    const url = getResultURL(el);
    if (!url) return;
    const host = url.hostname;
    const matches = settings.domains.some(d => host.endsWith(d));
    el.classList.toggle('searchlens-hidden', !matches);
    if (!matches) el.dataset.slDomain = '1';
    else delete el.dataset.slDomain;
  });
}

function applyDOM() {
  applySponsored();
  applyImages();
  applyFiletypes();
  applyDomains();
}

function applyURLParams() {
  if (engine !== 'google') return;
  const url = new URL(location.href);
  let changed = false;

  // Language (lr=lang_XX)
  if (settings.language) {
    const want = 'lang_' + settings.language;
    if (url.searchParams.get('lr') !== want) {
      url.searchParams.set('lr', want);
      changed = true;
    }
  } else if (url.searchParams.has('lr')) {
    url.searchParams.delete('lr');
    changed = true;
  }

  if (changed) location.replace(url.toString());
}

function observe() {
  const root = document.body ?? document.documentElement;
  new MutationObserver(applyDOM).observe(root, { childList: true, subtree: true });
}

function init() {
  engine = detectEngine();
  if (!engine) return;

  browser.storage.local.get(DEFAULTS).then(s => {
    settings = s;
    applyURLParams();
    applyDOM();
    observe();
  });

  browser.storage.onChanged.addListener((changes) => {
    const urlKeys = new Set(['language', 'siteFilter']);
    let needsURL = false;
    for (const [k, { newValue }] of Object.entries(changes)) {
      settings[k] = newValue;
      if (urlKeys.has(k)) needsURL = true;
    }
    if (needsURL) applyURLParams();
    applyDOM();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
