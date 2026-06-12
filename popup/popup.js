const DEFAULTS = {
  hideSponsored: true,
  showImages:    true,
  filetypes:     [],
  language:      '',
  domains:       [],
  siteFilter:    '',
};

async function load()        { return browser.storage.local.get(DEFAULTS); }
async function save(updates) { return browser.storage.local.set(updates);  }

// --- Page filters (auto-apply via storage.onChanged in content script) ---

function initSponsored(s) {
  const el = document.getElementById('hideSponsored');
  el.checked = s.hideSponsored;
  el.addEventListener('change', () => save({ hideSponsored: el.checked }));
}

function initImages(s) {
  const el = document.getElementById('showImages');
  el.checked = s.showImages;
  el.addEventListener('change', () => save({ showImages: el.checked }));
}

function initFiletypes(s) {
  document.querySelectorAll('#filetypeChips input').forEach(cb => {
    cb.checked = s.filetypes.includes(cb.value);
    cb.addEventListener('change', () => {
      const active = [...document.querySelectorAll('#filetypeChips input:checked')]
        .map(i => i.value);
      save({ filetypes: active });
    });
  });
}

function renderDomainChips(domains) {
  const container = document.getElementById('domainChips');
  container.innerHTML = '';
  domains.forEach(d => {
    const chip = document.createElement('span');
    chip.className = 'sl-chip-rm';
    chip.textContent = d;
    const btn = document.createElement('button');
    btn.textContent = '×';
    btn.title = 'Remove';
    btn.addEventListener('click', async () => {
      const s = await load();
      const updated = s.domains.filter(x => x !== d);
      await save({ domains: updated });
      renderDomainChips(updated);
    });
    chip.appendChild(btn);
    container.appendChild(chip);
  });
}

function initDomains(s) {
  renderDomainChips(s.domains);
  const input  = document.getElementById('domainInput');
  const addBtn = document.getElementById('domainAdd');

  async function addDomain() {
    let val = input.value.trim().toLowerCase();
    if (!val) return;
    if (!val.startsWith('.')) val = '.' + val;
    const current = await load();
    if (current.domains.includes(val)) { input.value = ''; return; }
    const updated = [...current.domains, val];
    await save({ domains: updated });
    renderDomainChips(updated);
    input.value = '';
  }

  addBtn.addEventListener('click', addDomain);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') addDomain(); });
}

// --- Search filters (saved on change, applied only when Apply is clicked) ---

function initLanguage(s) {
  const el = document.getElementById('language');
  el.value = s.language;
  el.addEventListener('change', () => save({ language: el.value }));
}

function initSiteFilter(s) {
  const el = document.getElementById('siteFilter');
  el.value = s.siteFilter;
  let timer;
  el.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => save({ siteFilter: el.value.trim() }), 400);
  });
}

function initApplyButton() {
  const btn = document.getElementById('applySearch');
  btn.addEventListener('click', async () => {
    // Writing _apply signals the content script to call applyURLParams()
    await browser.storage.local.set({ _apply: Date.now() });
    btn.classList.add('sl-applied');
    btn.textContent = 'Applied ✓';
    setTimeout(() => {
      btn.classList.remove('sl-applied');
      btn.textContent = 'Apply to search';
    }, 1500);
  });
}

// --- Init ---

document.addEventListener('DOMContentLoaded', async () => {
  const s = await load();
  initSponsored(s);
  initImages(s);
  initFiletypes(s);
  initDomains(s);
  initLanguage(s);
  initSiteFilter(s);
  initApplyButton();
});
