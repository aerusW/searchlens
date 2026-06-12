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
});

function initSponsored(s) {
  const el = document.getElementById('hideSponsored');
  el.checked = s.hideSponsored;
  el.addEventListener('change', () => save({ hideSponsored: el.checked }));
});
