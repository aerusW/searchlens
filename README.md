# SearchLens

A Firefox extension to refine search results. Hides sponsored content by default, with a configurable filter panel to control what you see across Google, DuckDuckGo, Bing, Brave Search, and Yahoo.

## Filter panel

Click the extension icon to open the panel. Settings save automatically.

![SearchLens filter panel](assets/panel.svg)

## What gets filtered

![Overview of filtered zones on Google Search](assets/overview.svg)

## Features

| Feature | Type | Description |
|---|---|---|
| **Hide sponsored** | Page filter | Toggle sponsored/ad results on or off — applies instantly |
| **Hide products** | Page filter | Toggle the product/shopping carousel — applies instantly |
| **Show images** | Page filter | Toggle the image-results strip — applies instantly |
| **Domain** | Page filter | Show only results from selected TLDs (`.com`, `.it`, `.be`, …); supports custom entries |
| **File type** | Search filter | Show only results of selected types (PDF, DOC, XLS…) via `filetype:` operator |
| **Language** | Search filter | Restrict Google results to a specific language via `lr=lang_XX` |
| **Site** | Search filter | Restrict results to a specific site via `site:example.com` |

**Page filters** apply instantly as you toggle them. **Search filters** require clicking **Apply to search**, which modifies the search query and reloads the page.

## Installation

SearchLens is designed for **Zen Browser** (and other Firefox forks with extension signature enforcement disabled), so no AMO signing is required.

### Temporary (development)

1. Open `about:debugging` → **This Firefox** → **Load Temporary Add-on**
2. Select `manifest.json` from this folder

### Permanent (.xpi)

```bash
npx web-ext build
# or, if web-ext is installed globally:
web-ext build
```

Then install the generated `.xpi` via **about:addons** → gear icon → **Install Add-on From File**.

## How it works

A content script is injected into matching search pages. On load it reads settings from `browser.storage.local`, applies DOM-based filters (hide/show elements by CSS class), and sets up a `MutationObserver` to handle dynamically injected content. URL-based filters (language, site, filetype) modify the search query and redirect once when **Apply to search** is clicked.

## Supported engines

- Google (`.com`, `.it`, `.co.uk`, `.de`, `.fr`, `.be`)
- DuckDuckGo
- Bing
- Brave Search
- Yahoo Search

## Development

No build step required — plain JavaScript, HTML, and CSS.

```bash
git clone https://github.com/aerusW/searchlens
cd searchlens
# load via about:debugging as described above
```

Branches follow the [Praxisum-Facta git guidelines](https://github.com/GitAlexein/Praxisum-Facta/blob/alpha-development/GIT_GUIDELINES.md): all work on `feature/`, `fix/`, `style/`, `refactor/`, or `docs/` branches off `main`, merged via PR.
