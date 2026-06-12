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

document.addEventListener('DOMContentLoaded', async () => {
  const s = await load();
  initSponsored(s);
  initImages(s);
  initFiletypes(s);
  initLanguage(s);
});

function initLanguage(s) {
  const el = document.getElementById('language');
  el.value = s.language;
  el.addEventListener('change', () => save({ language: el.value }));
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

function initImages(s) {
  const el = document.getElementById('showImages');
  el.checked = s.showImages;
  el.addEventListener('change', () => save({ showImages: el.checked }));
}

function initSponsored(s) {
  const el = document.getElementById('hideSponsored');
  el.checked = s.hideSponsored;
  el.addEventListener('change', () => save({ hideSponsored: el.checked }));
});
