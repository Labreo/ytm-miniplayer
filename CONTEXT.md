# Project Context - YTM Mini Player

## Overview

YTM Mini Player is a lightweight browser extension that enables YouTube Music playback in a detachable mini-window. The extension allows users to continue listening to music while multitasking without keeping the full YouTube Music interface open.

The project focuses on:

* Minimal resource usage
* Cross-browser compatibility
* Native browser APIs
* Simple and maintainable code
* Privacy-friendly implementation

---

## Primary Goal

Provide a distraction-free YouTube Music experience by moving the active YouTube Music tab into a small floating window and restoring it back when requested.

---

## Tech Stack

### Languages

* JavaScript (Vanilla)
* CSS
* HTML

### Browser Extension Technologies

* Manifest V3 (Chrome/Edge)
* Manifest V2 (Firefox)
* WebExtension APIs
* webextension-polyfill

### Development Tools

* ESLint
* Prettier
* npm

---

## Repository Structure

```text
src/
├── content.js
├── background.js
├── browser-polyfill.min.js
└── icons/

.github/
├── workflows/
└── templates/

manifest.chrome.json
manifest.firefox.json
build.sh
README.md
CONTRIBUTING.md
```

---

## Key Files

### src/content.js

Responsible for:

* Injecting UI elements into YouTube Music
* Detecting user interaction
* Sending messages to background scripts

### src/background.js

Responsible for:

* Managing popup windows
* Browser tab manipulation
* Extension lifecycle events

### manifest.chrome.json

Chrome and Edge extension configuration.

### manifest.firefox.json

Firefox extension configuration.

### build.sh

Build script that prepares browser-specific distributions.

---

## Extension Workflow

1. User opens YouTube Music.
2. Content script injects mini-player button.
3. User clicks button.
4. Message is sent to background script.
5. Background script creates popup window.
6. Current tab moves into popup window.
7. Playback continues.
8. Clicking again restores tab to normal browser window.

---

## Common Development Tasks

### Modify Button UI

Primary file:

```text
src/content.js
```

### Modify Window Behavior

Primary file:

```text
src/background.js
```

### Update Browser Permissions

Files:

```text
manifest.chrome.json
manifest.firefox.json
```

Always keep both manifests synchronized.

---

## Browser Compatibility Notes

This project supports:

* Chrome
* Edge
* Firefox

When adding features:

* Avoid browser-specific implementations.
* Use webextension-polyfill whenever possible.
* Verify functionality across supported browsers.

---

## Manifest Differences

The project maintains separate manifests for Chromium-based browsers and Firefox.

| Feature           | Chrome / Edge  | Firefox                      |
| ----------------- | -------------- | ---------------------------- |
| Manifest Version  | V3             | V2                           |
| Background Script | Service Worker | Persistent Background Script |
| Action API        | `action`       | `browser_action`             |
| Target Browsers   | Chrome, Edge   | Firefox                      |

### Important Notes

* Any permission changes must be reflected in both manifests.
* Browser compatibility should always be verified before submitting a PR.
* Future migration of Firefox to Manifest V3 may require architectural updates.

---

## Development Workflow

Recommended workflow for contributors:

1. Fork the repository.
2. Create a feature branch.
3. Make changes inside the `src/` directory.
4. Run formatting checks.
5. Run linting checks.
6. Build the extension.
7. Test in supported browsers.
8. Submit a Pull Request.

Example:

```bash
npm run format
npm run lint
npm run build
```

---

## Known Pitfalls

### Content Script Isolation

Content scripts run in an isolated environment and cannot directly access page JavaScript variables.

### YouTube UI Changes

Selectors may break whenever YouTube Music updates its interface.

### Manifest Differences

Firefox and Chrome extension systems differ. Test both manifests before submitting changes.

---

## Troubleshooting Guide

### Mini-player button does not appear

Possible causes:

* Content script failed to load.
* YouTube Music DOM structure changed.
* Extension permissions are incorrect.

### Popup window does not open

Possible causes:

* Background script error.
* Browser window API issue.
* Unsupported browser behavior.

### Playback stops unexpectedly

Possible causes:

* Tab was closed instead of moved.
* Window restoration logic failed.
* Browser suspended background execution.

---

## Testing Checklist

Before opening a Pull Request:

* Extension loads successfully.
* Mini-player button appears.
* Popup window opens.
* Music playback continues.
* Window restores correctly.
* Chrome works.
* Firefox works.
* No console errors.
* ESLint passes.

---

## AI / LLM Development Guidelines

When generating code:

1. Prefer modifying existing files over creating new ones.
2. Do not introduce frameworks.
3. Preserve browser compatibility.
4. Keep implementation lightweight.
5. Reuse existing utility functions.
6. Follow existing project structure.
7. Avoid unnecessary dependencies.
8. Keep extension permissions minimal.

---

## Contribution Expectations

Good contributions:

* Bug fixes
* Browser compatibility improvements
* UI polish
* Documentation improvements
* Performance optimizations

Avoid:

* Large architectural rewrites
* New frameworks
* Unnecessary dependencies

---

## Quick File Reference

| Task                         | Primary File            |
| ---------------------------- | ----------------------- |
| Modify UI button             | `src/content.js`        |
| Change popup window behavior | `src/background.js`     |
| Update Chrome configuration  | `manifest.chrome.json`  |
| Update Firefox configuration | `manifest.firefox.json` |
| Build extension packages     | `build.sh`              |
| Configure linting            | `eslint.config.js`      |
| Configure formatting         | `.prettierrc.json`      |

---

## Quick Start

```bash
git clone <repo-url>
cd ytm-miniplayer
npm install
npm run build
```

Load the generated extension from the appropriate browser build directory.

---

## Purpose of This File

This document helps both human contributors and AI-assisted development tools quickly understand the architecture, workflows, constraints, and contribution practices of the project.
