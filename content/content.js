const DEFAULTS = {
  hideSponsored: true,
  showImages:    true,
  filetypes:     [],
  language:      '',
  domains:       [],
  siteFilter:    '',
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

function applyDOM() {
  applySponsored();
}

function applyURLParams() {
  // implemented by feature/language-filter and feature/site-search
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
