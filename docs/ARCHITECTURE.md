# YTM Mini Mode Architecture

## Overview

YTM Mini Mode is a lightweight browser extension that makes YouTube Music easier to control while working.
It injects a mini-player toggle into the YouTube Music interface and moves the current tab into a popup window when requested.

The extension is intentionally small and keeps behavior simple:

- `src/content.js` modifies the page and sends toggle commands.
- `src/background.js` receives those commands and manages browser windows.
- `browser-polyfill.min.js` ensures extension APIs behave consistently across supported browsers.

## Runtime Components

### src/content.js

This file runs inside `music.youtube.com` as a content script.
Its main responsibilities are:

- Add a mini-player toggle button into the YouTube Music navigation UI.
- Inject CSS that supports the mini-player layout on mobile-width pages.
- Create a floating "pill" UI for quick access on narrow screens.
- Observe page state and apply safe display classes.
- Send a `toggle_mini` runtime message to the background runtime.

### src/background.js

This file runs as the extension background context.
For Chrome/Edge it runs as a Manifest V3 service worker.
For Firefox it is loaded via the Thunderbird-style background script array.

Its responsibilities are:

- Normalize the runtime API using `browser-polyfill.min.js`.
- Receive and process runtime messages from `src/content.js`.
- Manage tab and window state by creating or restoring popup and normal windows.

### src/browser-polyfill.min.js

This file is included in both injection contexts to provide a normalized API.
It makes the extension code compatible across Firefox and Chromium-based browsers by exposing `browser.*` semantics.

## Message Flow

The extension uses a simple one-way communication flow:

```text
User Click
↓
content.js
↓
toggle_mini message
↓
background.js
↓
window management
```

When the mini-player button is clicked, `content.js` sends:

```js
browser.runtime.sendMessage({ action: 'toggle_mini' })
```

The background runtime then toggles the current tab between:

- `popup` window type
- `normal` window type

If the active window is already a popup, the extension attempts to restore the tab to the first available normal window.
If no normal window exists, it creates one.

## Browser Compatibility

- `manifest.chrome.json`
  - Used for Chrome and Microsoft Edge.
  - Targets Manifest V3.
  - Uses `service_worker` for the background runtime.
- `manifest.firefox.json`
  - Used for Firefox.
  - Uses a background script list and remains compatible with current Firefox extension patterns.

Both manifests use the same host permission:

```json
"host_permissions": ["*://music.youtube.com/*"]
```

## Build Process

The build script is intentionally simple and does not use a bundler.

`build.sh` performs the following steps:

1. Remove the existing `dist/` directory.
2. Create `dist/firefox`, `dist/chrome`, and `dist/edge`.
3. Copy the source files from `src/` into each target directory.
4. Copy the appropriate manifest file into each target directory.
5. Create zip packages for each browser output.

The generated artifacts are:

- `dist/chrome/`
- `dist/firefox/`
- `dist/edge/`
- `ytm-mini-chrome.zip`
- `ytm-mini-firefox.zip`
- `ytm-mini-edge.zip`

## Future Development Notes

- The current content script relies on a polling interval because YouTube Music's DOM updates frequently and does not expose stable insertion events for the target UI elements.
- A future improvement would be to replace the polling logic with a targeted `MutationObserver` if the page structure stabilizes.
- When adding new permissions or host patterns, update both manifest files and document the change clearly in the PR.
- Keep the extension small and avoid adding bundling or transpilation unless there is a strong benefit.
