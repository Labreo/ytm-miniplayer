# Contributing to YTM Mini Mode 🎵

Thank you for your interest in contributing! YTM Mini Mode is a lightweight browser extension, and contributions of all sizes are welcome — from a one-line bug fix to an entirely new feature. Please take a moment to read through this guide before submitting.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Code Style](#code-style)
- [Commit Message Conventions](#commit-message-conventions)
- [Pull Request Format](#pull-request-format)
- [Test Expectations](#test-expectations)
- [Review Timeline](#review-timeline)
- [Reporting Issues](#reporting-issues)

---

## Getting Started

1. **Fork** the repository and clone your fork locally.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build both browser targets:
   ```bash
   bash build.sh
   ```
4. Load the appropriate unpacked extension from `dist/chrome/` or `dist/firefox/` into your browser (see [README.md](README.md) for detailed instructions).
5. Make your changes in the `src/` directory. Run `build.sh` again to verify the build succeeds before opening a PR.

> **Note:** The `dist/` directory and `*.zip` files are intentionally gitignored. Never commit build output.

---

## Code Style

This project uses **vanilla JavaScript** with no transpilers or bundlers. Keep the following conventions in mind:

### JavaScript
- Use `const` and `let`; never use `var`.
- Prefer arrow functions for callbacks and short utilities.
- Use `camelCase` for variables and functions; `UPPER_SNAKE_CASE` for module-level constants.
- Guard against duplicate injection with id-checks (e.g. `if (document.getElementById('...')) return;`) — this pattern is already established in the codebase.
- All DOM manipulation must be safe for re-entry (the extension polls every 500 ms).
- Use `browser.*` API calls (via `webextension-polyfill`) instead of `chrome.*` to keep the codebase cross-browser.
- Keep inline styles scoped and use the `cssText` assignment pattern that is already in use.

### Manifests
- `manifest.chrome.json` targets **Manifest V3** (service worker background).
- `manifest.firefox.json` targets **Manifest V2** (background scripts array).
- If a feature requires a new permission, add it to **both** manifests and explain the need in your PR description.

### Shell Scripts
- `build.sh` must remain POSIX-compatible (`#!/bin/bash`).
- Keep the build script simple and sequential; avoid adding external tooling dependencies.

### General
- Keep lines under **120 characters**.
- Prefer readability over cleverness — this codebase is intentionally simple for contributors of all levels.
- Remove any `console.log` debug statements before opening a PR.
- **No PII:** Ensure your commits and code do not contain any Personally Identifiable Information (emails, phone numbers, credentials, etc.).

---

## Commit Message Conventions

Follow the **Conventional Commits** specification. Each commit message must have the form:

```
<type>(<scope>): <short summary>
```

| Type | When to use |
|------|-------------|
| `feat` | A new feature or user-visible behaviour |
| `fix` | A bug fix |
| `style` | CSS or UI-only changes (no logic change) |
| `refactor` | Code restructuring without behaviour change |
| `chore` | Build scripts, config, dependencies |
| `docs` | Documentation only |
| `ci` | Changes to GitHub Actions workflows |

**Scope** (optional but encouraged) should be one of: `content`, `background`, `manifest`, `build`, `icons`.

### Examples

```
feat(content): add keyboard shortcut to toggle mini player
fix(background): handle missing tab gracefully in toggle_mini
style(content): improve like-button positioning on narrow screens
chore(build): remove dist artefacts from zip output
docs: add browser compatibility table to README
```

**Rules:**
- Use the **imperative mood** in the summary ("add" not "added", "fix" not "fixed").
- Keep the summary line under **72 characters**.
- Separate the summary from any body with a blank line.
- Reference relevant issue numbers in the body or footer: `Closes #42`.

---

## Pull Request Format

### Before You Open a PR

- [ ] Run `bash build.sh` — it must exit with `Build Complete!` and no errors.
- [ ] Manually load the extension in at least **one** browser (`dist/chrome/` or `dist/firefox/`) and verify your change works end-to-end on `music.youtube.com`.
- [ ] If you're adding a new permission or host, justify it in the PR description.
- [ ] Ensure your branch is up to date with `main`.

### PR Title

Use the same format as your commit messages:

```
feat(content): add keyboard shortcut to toggle mini player
```

### PR Description Template

When you open a pull request, fill in the sections as described in [PULL_REQUEST_TEMPLATE.md](PULL_REQUEST_TEMPLATE.md).

### Branch Naming

| Purpose | Branch name pattern |
|---------|---------------------|
| New feature | `feature/<short-description>` |
| Bug fix | `fix/<short-description>` |
| Documentation | `docs/<short-description>` |
| CI / tooling | `ci/<short-description>` |

---

## Test Expectations

This project does not yet have an automated test suite. Until one is in place, **manual verification is required** for every PR.

### Required Manual Tests

Every PR must confirm:

1. **Build succeeds** — `bash build.sh` exits cleanly and produces `dist/chrome/` and `dist/firefox/`.
2. **Extension loads** — The unpacked extension loads without errors in the browser console.
3. **Core toggle works** — Clicking the mini-player button pops the tab out into a popup window, clicking again brings it back.
4. **Playback is uninterrupted** — Audio does not stop during the pop-out/pop-in cycle.
5. **No regressions** — Features unrelated to your change still work (like-button visibility, support button, etc.).

If your change only affects one browser target, you must still state which browser(s) you tested in the PR description.

### Future Testing

If you'd like to help establish a proper test suite, please open a discussion issue first — contributions to testing infrastructure are very welcome.

---

## Review Timeline

| Situation | Expected response |
|-----------|-------------------|
| Bug fix or small improvement | Within **3–5 days** |
| New feature or larger change | Within **7 days** for initial feedback |
| Changes to manifests / permissions | May require additional review time |

> Reviews are done on a best-effort basis outside of working hours. If you haven't heard back within the window above, feel free to leave a polite comment on the PR.

Iterate quickly: small, focused PRs are reviewed significantly faster than large ones.

---

## Reporting Issues

Before opening a new issue:

- Check the [existing issues](https://github.com/Labreo/ytm-miniplayer/issues) to avoid duplicates.
- Include your **browser name and version**, the **extension version**, and clear steps to reproduce.
- Attach a screenshot or browser console log if relevant.

---

**Thank you for making YTM Mini Mode better! ☕**
