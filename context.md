# YTM Mini Mode — Project Context

A lightweight browser extension that adds a mini-player toggle to YouTube Music, letting users pop the player into a small persistent window without interrupting playback.

## Repository layout

```
ytm-miniplayer/
├── src/
│   ├── content.js          # Injected into music.youtube.com — injects CSS + toggle button
│   ├── background.js       # Service worker — handles window pop-out/pop-in via messaging
│   └── browser-polyfill.min.js  # webextension-polyfill for cross-browser API compat
├── manifest.chrome.json    # Manifest V3 (Chrome / Edge)
├── manifest.firefox.json   # Manifest V2 (Firefox)
├── build.sh                # Copies manifests + src into dist/chrome/ and dist/firefox/
├── eslint.config.js
└── package.json
```

## How it works

1. `content.js` runs on every `music.youtube.com` page. It:
   - Injects a CSS block (`<style id="ytm-mini-css">`) that applies responsive mini-mode styles controlled by a `ytm-mini-mode` class on `<body>`.
   - Injects a draggable pill button into the YouTube Music player bar.
   - On button click, sends a `toggle_mini` message to the background service worker.

2. `background.js` listens for `toggle_mini`. It:
   - If the current tab is in a normal window, pops it out into a new popup window (small fixed dimensions).
   - If the current tab is already in a popup window, moves it back into the last known normal window.
   - Persists window state in `chrome.storage.local` / `browser.storage.local`.

## Key invariants

- The extension never reads or modifies user data; no network requests beyond what YouTube Music itself makes.
- `browser` namespace is used everywhere (via polyfill); `chrome` is only the fallback in `background.js` when polyfill is unavailable.
- Manifest V3 (Chrome) uses a service worker for `background.js`; Manifest V2 (Firefox) uses a persistent background page.
- The mini-mode CSS only activates when `body.ytm-mini-mode` is present, so styles are scoped and never leak.

## Development commands

```bash
npm install          # install ESLint + Prettier dev dependencies
npm run build        # runs build.sh → outputs dist/chrome/ and dist/firefox/
npm run lint         # ESLint on src/
npm run lint:fix     # ESLint with auto-fix
npm run format       # Prettier over src/**/*.js + root *.json *.sh *.md
npm run format:check # Prettier check (CI-safe, no writes)
```

## Loading the extension locally

**Chrome / Edge:**
1. `npm run build`
2. Go to `chrome://extensions` → enable **Developer mode**
3. **Load unpacked** → select `dist/chrome/`

**Firefox:**
1. `npm run build`
2. Go to `about:debugging` → **This Firefox** → **Load Temporary Add-on**
3. Select `dist/firefox/manifest.json`

## Common extension APIs used

| API | Purpose |
|-----|---------|
| `browser.runtime.sendMessage` / `onMessage` | content ↔ background communication |
| `browser.windows.create` | pop out to mini window |
| `browser.windows.update` | move tab back to normal window |
| `browser.storage.local` | persist last normal window ID across page navigations |
| `browser.tabs.get` | inspect current tab's window context |

## Testing guidance

There is no automated test suite. Manual testing covers:
- Toggle pop-out from a playing track → window shrinks to mini dimensions.
- Toggle pop-in → tab returns to the original normal window, playback continues.
- Drag the pill to a new position → position is remembered within the session.
- Repeat on both Chrome and Firefox builds.

## Contribution tips for LLM agents

- The full logic lives in two files: `src/content.js` and `src/background.js`. Read both before making changes.
- CSS changes go in the `injectMiniCSS()` function in `content.js`; keep selectors scoped under `body.ytm-mini-mode` or `#ytm-pill-container`.
- Message passing: content sends `{ action: "toggle_mini" }`; background replies with `{ success: true/false }`.
- Always run `npm run lint` and `npm run format:check` before committing.
- Build output in `dist/` is gitignored; never commit it.
