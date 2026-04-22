# Release Notes 📝

All notable changes to the **YTM Mini Mode** extension will be documented in this file.

---

## [1.3.0] - 2026-04-22
### Added
- **Draggable Like/Dislike Pill Bar**: A new, premium UI element that provides quick access to song ratings in mini-mode.
- **Native Reparenting Logic**: The Like/Dislike buttons are now 'stolen' from the native YouTube Music player and moved into our pill bar, ensuring 100% functional reliability and real-time state syncing.
- **Movable Interface**: You can now click and drag the pill bar to any position within the mini-player window.
- **Premium Glassmorphism**: Improved the pill bar aesthetics with better background blur, subtle borders, and interactive hover states.

### Fixed
- Resolved an issue where Like/Dislike buttons were hidden by YouTube Music's responsive engine in narrow windows.
- Fixed a bug that caused duplicate buttons to appear in the mini-player.

---

## [1.2.0] - 2026-04-16
### Added
- **Seamless Window Management**: One-click toggle to pop the player into a mini-window or back into the main browser session.
- **Responsive Layouts**: Optimized CSS to ensure album art and song titles scale correctly in small windows.
- **Chrome Support**: Initial preparations for Chrome Manifest V3 compatibility.
- **Support Button**: Added a "Buy Me A Coffee" link to support development.

---

## [1.1.0] - 2026-04-12
### Added
- **Core Functionality**: Initial release of the mini-player toggle.
- **Cross-Browser Polyfills**: Integration of `webextension-polyfill` for Firefox and Chrome support.
- **Privacy First**: Ensured zero tracking and no data collection.
- **Developer Experience**: Standardized linting and formatting rules (ESLint & Prettier).
- **CI/CD**: Added GitHub Actions for automated build and lint checks.

---

## [1.0.0] - 2026-04-10
### Added
- Initial project setup and boilerplate.
- Basic content script for button injection.
