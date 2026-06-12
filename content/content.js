// Sponsored-result selectors per engine, ordered most-to-least stable
const SPONSORED_SELECTORS = {
  google: [
    '#tads',
    '#tadsb',
    '[data-text-ad]',
    '.commercial-unit-desktop-top',
    '.commercial-unit-desktop-rhs',
    'div[id^="tvcap"]',
    '[data-sokoban-feature]',
  ],
  duckduckgo: [
    '.result--ad',
    '[data-testid="ad"]',
    '[data-area="promoted"]',
  ],
  bing: [
    '.b_ad',
    '.b_adLastChild',
    '#b_results > li.b_ad',
  ],
  brave: [
    '.search-result-ads',
    '[data-type="ad"]',
  ],
  yahoo: [
    '[data-test-locator="sponsored"]',
    '.dd.algo-sr',
  ],
};

function detectEngine() {
  const host = location.hostname;
  if (host.startsWith('www.google.')) return 'google';
  if (host === 'duckduckgo.com')       return 'duckduckgo';
  if (host === 'www.bing.com')         return 'bing';
  if (host === 'search.brave.com')     return 'brave';
  if (host === 'search.yahoo.com')     return 'yahoo';
  return null;
}

function hideSponsored(engine) {
  const selectors = SPONSORED_SELECTORS[engine];
  if (!selectors) return;

  for (const sel of selectors) {
    document.querySelectorAll(sel).forEach(el => {
      el.classList.add('searchlens-hidden');
    });
  }
}

function observe(engine) {
  const root = document.body ?? document.documentElement;
  const observer = new MutationObserver(() => hideSponsored(engine));
  observer.observe(root, { childList: true, subtree: true });
}

function init() {
  const engine = detectEngine();
  if (!engine) return;

  hideSponsored(engine);
  observe(engine);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
