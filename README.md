# SearchLens

A Firefox extension to refine search results. Hides sponsored content by default, with a configurable filter panel to control what you see across Google, DuckDuckGo, Bing, Brave Search, and Yahoo.

## Features

| Feature | Description |
|---|---|
| **Hide sponsored** | Toggle sponsored/ad results on or off |
| **Show images** | Toggle image-result blocks (e.g. Google's "Images for…" rows) |
| **File type** | Show only results linking to selected file types (PDF, DOC, XLS, PPT, TXT, CSV) |
| **Language** | Restrict Google results to a specific language via `lr=lang_XX` |
| **Domain** | Show only results from selected TLDs (`.com`, `.it`, `.be`, …); supports custom entries |
| **Site** | Restrict results to a specific site via `site:example.com` appended to the query |

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

A content script is injected into matching search pages. On load it reads settings from `browser.storage.local`, applies DOM-based filters (hide/show elements by CSS class), and sets up a `MutationObserver` to handle dynamically injected content. URL-based filters (language, site) modify the search URL and redirect once if needed.

Clicking the extension icon opens the filter panel where every setting persists automatically.

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
