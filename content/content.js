const DEFAULTS = {
  hideSponsored: true,
  showImages:    true,
  filetypes:     [],
  language:      '',
  domains:       [],
  siteFilter:    '',
};

// ── Sponsored selectors ─────────────────────────────────────────────────────
const SPONSORED_SELECTORS = {
  google: [
    '#tads',
    '#tadsb',
    '[data-text-ad]',
    '.commercial-unit-desktop-top',
    '.commercial-unit-desktop-rhs',
    'div[id^="tvcap"]',
  ],
  // DDG 2024+ uses article[data-testid] with a promoted badge
  duckduckgo: [
    '[data-testid="result-sponsored"]',
    'article[data-area="promoted"]',
    '.result--ad',
  ],
  bing:  ['.b_ad', '#b_results > li.b_ad'],
  brave: ['[data-type="ad"]', '.search-result-ads'],
  yahoo: ['[data-test-locator="sponsored"]'],
};

// ── Image-block selectors ───────────────────────────────────────────────────
const IMAGE_SELECTORS = {
  google:     ['.Lv2Cle'],
  duckduckgo: ['.zci--images', '.tile--img'],
  bing:       ['#vm-web', '.b_imageCaptionCell'],
};

// ── State ───────────────────────────────────────────────────────────────────
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

// ── Result element helpers ──────────────────────────────────────────────────
function getResultElements() {
  switch (engine) {
    case 'google':
      // :not(.g .g) avoids double-counting nested containers (featured snippets)
      return document.querySelectorAll(
        '#rso .g:not(.g .g), #search .g:not(.g .g)'
      );
    case 'duckduckgo':
      return document.querySelectorAll(
        'article[data-testid="result"]:not([data-area="promoted"])'
      );
    case 'bing':
      return document.querySelectorAll('#b_results > li.b_algo');
    case 'brave':
      return document.querySelectorAll('[data-type="web"]');
    case 'yahoo':
      return document.querySelectorAll('.algo');
    default:
      return [];
  }
}

// Resolves Google's /url?q= redirects so we get the real destination hostname.
function resolveGoogleRedirect(href) {
  try {
    const u = new URL(href);
    if (u.hostname.includes('google.') && u.pathname === '/url') {
      const dest = u.searchParams.get('q') || u.searchParams.get('url');
      if (dest) return new URL(dest);
    }
    return u;
  } catch {
    return null;
  }
}

function getResultURL(el) {
  const a = el.querySelector('a[href]');
  if (!a) return null;
  return engine === 'google' ? resolveGoogleRedirect(a.href) : (() => {
    try { return new URL(a.href); } catch { return null; }
  })();
}

// ── Filter: sponsored ───────────────────────────────────────────────────────
function applySponsored() {
  const sels = SPONSORED_SELECTORS[engine];
  if (!sels) return;
  for (const sel of sels) {
    try {
      document.querySelectorAll(sel).forEach(el =>
        el.classList.toggle('searchlens-hidden', settings.hideSponsored));
    } catch { /* invalid selector on this engine */ }
  }
}

// ── Filter: images ──────────────────────────────────────────────────────────
function applyImages() {
  const sels = IMAGE_SELECTORS[engine];
  if (!sels) return;
  for (const sel of sels) {
    try {
      document.querySelectorAll(sel).forEach(el =>
        el.classList.toggle('searchlens-hidden', !settings.showImages));
    } catch { /* invalid selector */ }
  }
}


// ── Filter: domains ─────────────────────────────────────────────────────────
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
    // domains are stored as ".com" so we check hostname ends with that string
    const hit  = settings.domains.some(d => host.endsWith(d));
    el.classList.toggle('searchlens-hidden', !hit);
    if (!hit) el.dataset.slDomain = '1';
    else delete el.dataset.slDomain;
  });
}

// ── Filter: URL params (language + site, Google only) ───────────────────────
function applyURLParams() {
  if (engine !== 'google') return;
  const url     = new URL(location.href);
  let   changed = false;

  // Language
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

  // Site filter
  const q           = url.searchParams.get('q') || '';
  const currentSite = (q.match(/(?:^|\s)site:(\S+)/i) || [])[0] || '';
  const wantedSite  = settings.siteFilter ? ` site:${settings.siteFilter}` : '';

  if (wantedSite && !currentSite.includes(settings.siteFilter)) {
    const cleanQ = q.replace(/\s*site:\S+/gi, '').trim();
    url.searchParams.set('q', (cleanQ + wantedSite).trim());
    changed = true;
  } else if (!wantedSite && currentSite) {
    url.searchParams.set('q', q.replace(/\s*site:\S+/gi, '').trim());
    changed = true;
  }

  // File types — adds filetype:pdf OR filetype:doc … to the query
  const ftOps = settings.filetypes.map(f => `filetype:${f}`);
  const ftRe  = /\s*\(filetype:[^)]+\)|\s*filetype:\S+/gi;
  const qNoFt = q.replace(ftRe, '').trim();

  if (ftOps.length) {
    const ftStr = ftOps.length === 1 ? ftOps[0] : `(${ftOps.join(' OR ')})`;
    const alreadySet = settings.filetypes.every(f => q.includes(`filetype:${f}`));
    if (!alreadySet) {
      url.searchParams.set('q', `${qNoFt} ${ftStr}`.trim());
      changed = true;
    }
  } else if (ftRe.test(q)) {
    url.searchParams.set('q', qNoFt);
    changed = true;
  }

  if (changed) location.replace(url.toString());
}

// ── Main apply ──────────────────────────────────────────────────────────────
function applyDOM() {
  applySponsored();
  applyImages();
  applyDomains();
}

// ── Observer (debounced so rapid DOM changes don't thrash) ──────────────────
let _debounce;
function observe() {
  const root = document.body ?? document.documentElement;
  new MutationObserver(() => {
    clearTimeout(_debounce);
    _debounce = setTimeout(applyDOM, 80);
  }).observe(root, { childList: true, subtree: true });
}

// ── Init ─────────────────────────────────────────────────────────────────────
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
    let applyURL = false;
    for (const [k, { newValue }] of Object.entries(changes)) {
      if (k === '_apply') { applyURL = true; continue; }
      if (k in settings) settings[k] = newValue;
    }
    if (applyURL) applyURLParams();
    applyDOM();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
