# YTM Mini Mode 🎵

![YTM Mini Mode Screenshot](https://addons.mozilla.org/user-media/previews/full/349/349205.png?modified=1769414896)

A lightweight, distraction-free mini-player extension for YouTube Music, available for Firefox and Chrome. 

![Version](https://img.shields.io/badge/version-1.3-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📥 Installation

<a href="https://addons.mozilla.org/en-US/firefox/addon/ytm-mini-mode/"><img src="https://user-images.githubusercontent.com/585534/107280546-7b9b2a00-6a26-11eb-8f9f-f95932f4bfec.png" alt="Get YTM Mini Mode for Firefox" height="40"></a>

<a href="https://microsoftedge.microsoft.com/addons/detail/ytm-mini-mode/cccmmkfhbjgchhgfacbllhkpgblfaodj"><img src="https://user-images.githubusercontent.com/585534/107280673-a5ece780-6a26-11eb-9cc7-9fa9f9f81180.png" alt="Get YTM Mini Mode for Microsoft Edge" height="40"></a>

<a href="https://chromewebstore.google.com/detail/ytm-mini-mode/lpfejlnnjobhdpbhdlmhmmhhmphhbdda?authuser=2&hl=en"><img src="https://user-images.githubusercontent.com/585534/107280622-91a8ea80-6a26-11eb-8d07-77c548b28665.png" alt="Get YTM Mini Mode for Chrome" height="40"></a>


## 📖 Project Purpose

YouTube Music is great, but managing playback while coding or studying often means hunting through dozens of open tabs. **YTM Mini Mode** solves this by adding a native toggle button directly to the YouTube Music interface. 

With one click, your music pops out into a clean, responsive, and persistent mini-window. Click it again, and it seamlessly pops back into your main browser window without interrupting playback.

### ✨ Features
* **Seamless Window Management:** Pop the player out into a mini-window, or pop it back into your main browser session.
* **Responsive Design:** Optimized CSS ensures album art and song titles scale perfectly.
* **Privacy First:** No tracking, no data collection. 

---

## 🛠️ Tech Stack

This project is built using:
* **Vanilla JavaScript** & **CSS**
* **webextension-polyfill** for cross-browser API compatibility.
* **Manifest V3** (Chrome) and **Manifest V2** (Firefox).
* **Bash** for standard build automation without heavy webpack/bundlers.
* **ESLint** & **Prettier** for code formatting and standardisation.

---

## 🧠 Architecture Overview

YTM Mini Mode is a small browser extension with two runtime components:

- `src/content.js`
  - Injects the mini-player toggle button into the YouTube Music page.
  - Applies responsive mini-player CSS and manages the floating pill UI.
  - Observes page state and sends `toggle_mini` runtime messages.
- `src/background.js`
  - Runs in the extension background context.
  - Receives toggle requests and moves the current tab into or out of a popup window.
- `src/browser-polyfill.min.js`
  - Normalizes `browser.*` APIs across Chrome/Edge and Firefox.

### Browser extension flow

1. The browser loads the extension from `manifest.chrome.json` or `manifest.firefox.json`.
2. When the user opens `music.youtube.com`, the content script is injected.
3. `content.js` creates the mini-player button and manages page styling.
4. When the button is clicked, `content.js` sends a runtime message.
5. `background.js` receives the message and toggles the window state.

### Browser compatibility

- `manifest.chrome.json` is used for Chrome/Edge with Manifest V3 and a service worker background.
- `manifest.firefox.json` is used for Firefox with a background script array.
- Both manifests share the same host permission for `*://music.youtube.com/*`.

For a deeper architecture reference, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## 📁 Project Structure

- `src/content.js` — page UI injection, custom styling, mini-player state, and message sending.
- `src/background.js` — background message handler and window management.
- `src/browser-polyfill.min.js` — cross-browser runtime API compatibility.
- `build.sh` — generates `dist/` artifacts for Chrome, Firefox, and Edge.
- `manifest.chrome.json` — Chrome/Edge MV3 extension manifest.
- `manifest.firefox.json` — Firefox-compatible extension manifest.
- `README.md` — user-facing setup and project overview.
- `CONTRIBUTING.md` — contributor workflow, style rules, and PR guidance.

## 🔄 Extension Workflow

```text
User Click
↓
content.js
↓
runtime message
↓
background.js
↓
window management
```

---

## 💻 Local Setup Instructions

These instructions have been designed and tested for a clean local machine environment.

### Prerequisites
* [Node.js](https://nodejs.org/en) (v18+ recommended)
* `npm` (comes with Node.js)
* Git

### Step-by-Step Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Labreo/ytm-miniplayer.git
   cd ytm-miniplayer
   ```

2. **Install development dependencies:**
   This project uses npm purely for linting, formatting, and polyfills.
   ```bash
   npm install
   ```

3. **Build the extension:**
   Generate the clean, store-ready browser distributions:
   ```bash
   npm run build
   # Or run directly: bash build.sh
   ```
   *This will create a `dist/` directory containing `chrome/`, `firefox/`, and `edge/` builds.*

4. **Load the extension manually into your browser:**
   * **For Chrome:** Navigate to `chrome://extensions/`, toggle on "Developer mode" in the top right, click "Load unpacked", and select the `dist/chrome/` folder.
   * **For Edge:** Navigate to `edge://extensions/`, toggle on "Developer mode", click "Load unpacked", and select `dist/edge/`.
   * **For Firefox:** Navigate to `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on", and select the `manifest.json` inside the `dist/firefox/` folder.

---

## 🤝 Contribution Guidelines

Contributions, issues, and feature requests are highly encouraged! 

We follow standard GitHub flow and require that all pull requests pass our automated CI/CD checks (linting, formatting, building). Before starting major work, please review our comprehensive **[CONTRIBUTING.md](CONTRIBUTING.md)** for our full code style rules, PR expectations, and standard practices.

* Quick commands you'll need:
  * `npm run lint` / `npm run format`

---

## 💬 Contact & Support

**Have questions or want to discuss a major feature?**
Reach out to me directly on **Discord**: `.kakaroth`

If this extension makes your daily workflow a little smoother, consider supporting the development! 

[![Buy Me A Coffee](https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png)](https://www.buymeacoffee.com/kakeroth)

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

**Built by Kanak Waradkar**
