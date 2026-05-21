# Project Context — YTM Mini Mode

> This file provides structured context for LLM-assisted development on this project.
> It covers architecture, file roles, conventions, browser differences, and contribution guidelines.
> Keep this file updated when the project structure or conventions change.

---

## What This Project Does

**YTM Mini Mode** is a cross-browser extension for YouTube Music (`music.youtube.com`).

It injects a toggle button into the YouTube Music UI. When clicked:
1. The current YTM tab is popped out into a small, floating mini-window using the browser's native `window` APIs.
2. Clicking the toggle again collapses the mini-window back into the main browser session — **without interrupting playback**.

No custom audio player is built. The extension simply **repositions the existing YouTube Music tab** into a smaller window frame.

---

## Repository Structure

```
ytm-miniplayer/
├── .github/                  # GitHub Actions CI workflows and PR templates
├── src/                      # All extension source code lives here
├── .gitignore
├── .prettierignore
├── .prettierrc.json          # Prettier formatting config
├── CONTRIBUTING.md           # PR expectations, code style rules
├── LICENSE                   # MIT
├── PULL_REQUEST_TEMPLATE.md
├── README.md
├── build.sh                  # Build script: copies src + correct manifest into dist/
├── eslint.config.js          # ESLint config
├── manifest.chrome.json      # Manifest V3 — for Chrome and Edge
├── manifest.firefox.json     # Manifest V2 — for Firefox
├── package.json
├── package-lock.json
├── release_notes.md
└── CONTEXT.md                # This file
```

### `src/` directory (primary working directory)

The `src/` folder contains the actual extension logic. Key files to expect:

| File | Role |
|------|------|
| `content.js` | Injected into `music.youtube.com`. Adds the toggle button to the DOM, handles click events. |
| `background.js` | Service worker (MV3) or background page (MV2). Manages `chrome.windows` / `browser.windows` API calls to pop out and collapse the window. |
| `browser-polyfill.min.js'
| `icons` |  

---

## How It Works — Technical Flow

```
User clicks toggle button (injected by content.js)
        │
        ▼
content.js sends message to background.js
        │
        ▼
background.js calls browser.windows.create() with type: "popup"
and specific width/height to create the mini-window
        │
        ▼
YTM tab moves into the new popup window
        │
        ▼ (on second click)
background.js calls browser.windows.remove() or moves tab back
into the original window using browser.tabs.move()
```

All browser API calls go through **`webextension-polyfill`**, which normalizes the `chrome.*` and `browser.*` API differences so the same JS works on both Chrome and Firefox.

---

## Manifest Differences (Important)

This project maintains **two separate manifests**:

| | `manifest.chrome.json` | `manifest.firefox.json` |
|---|---|---|
| Version | Manifest V3 | Manifest V2 |
| Background | `service_worker` | `scripts` array (persistent background page) |
| Browser Action | `action` | `browser_action` |
| Target | Chrome, Edge | Firefox |

The `build.sh` script copies the right manifest as `manifest.json` into each browser's `dist/` folder.

**Firefox MV3 note:** Firefox has begun supporting Manifest V3 but with differences from Chrome's MV3 implementation. Migration is a known future task.

---

## Build System

No bundler (no Webpack/Vite/Rollup). The build process is a plain bash script.

```bash
npm run build       # Runs build.sh
# Or directly:
bash build.sh
```

**What `build.sh` does:**
1. Copies `src/` into `dist/chrome/`, `dist/firefox/`, and `dist/edge/`
2. Places the correct manifest into each folder
3. Output in `dist/` is store-ready and `.gitignore`d

**Dev tooling (npm) is only for:**
- ESLint (`npm run lint`)
- Prettier (`npm run format`)
- `webextension-polyfill` package

---

## Code Conventions

- **Language:** Vanilla JavaScript. No TypeScript, no frameworks.
- **Formatting:** Prettier (see `.prettierrc.json`). Run `npm run format` before committing.
- **Linting:** ESLint (see `eslint.config.js`). Run `npm run lint` before committing.
- **No bundler assumptions:** Do not introduce `import`/`export` ES module syntax unless the manifests are updated to support it. Use plain scripts.
- **Cross-browser first:** All browser API calls must go through `webextension-polyfill`. Never call `chrome.*` directly without the polyfill wrapper.

---

## Permissions

The extension requests minimal permissions (privacy-first). When suggesting new features, avoid introducing new manifest permissions unless absolutely necessary. Check both `manifest.chrome.json` and `manifest.firefox.json` when adding permissions.

As of v1.3.1, the `tabs` permission was explicitly removed as unused — be aware this limits what tab metadata is directly accessible.

---

## Known Constraints for LLM Assistants

- **Do not assume a bundler is available.** There is no Webpack, Vite, or Rollup. Code must run as-is in the browser extension context.
- **Content scripts run in an isolated world.** They cannot directly access the YTM page's JavaScript variables. Communication between `content.js` and `background.js` happens via `browser.runtime.sendMessage`.
- **Service workers (MV3) have no DOM access and no persistent state.** Use `chrome.storage` / `browser.storage` for any state that needs to persist.
- **MV2 background pages are persistent** but deprecated. Do not write code that assumes persistence in the MV3 background script.
- **YouTube Music's DOM changes frequently.** Any selectors used to inject UI elements are brittle and may break with YTM updates. Add comments near selectors explaining what they target.
- **The `dist/` folder is gitignored.** Never commit build output.

---

## Testing

There is no automated test suite for the extension logic itself. Manual testing is done by loading the unpacked extension:

- **Chrome/Edge:** `chrome://extensions` → Developer Mode → Load Unpacked → `dist/chrome/`
- **Firefox:** `about:debugging` → Load Temporary Add-on → select `dist/firefox/manifest.json`

CI checks (GitHub Actions) cover only linting and formatting, not runtime behavior.

---

## Contribution Notes for AI Assistants

When helping with this project:
1. **Always check both manifests** when changes touch permissions, background scripts, or browser actions.
2. **Run `build.sh` mentally** — remember that `dist/` is generated. Source of truth is `src/`.
3. **Prefer additive changes** — this is a published extension with real users. Avoid breaking existing window management behavior.
4. **Follow the existing vanilla JS style** — no framework introductions without maintainer discussion.
5. **Check `CONTRIBUTING.md`** for PR-specific requirements before generating a pull request description.

---

 
