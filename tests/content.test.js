const { test, describe, beforeEach } = require("node:test");
const assert = require("node:assert");
const { JSDOM } = require("jsdom");

describe("watchPlayerState", () => {
  let dom;
  let window;
  let document;
  let watchPlayerState;

  beforeEach(() => {
    dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
      url: "https://music.youtube.com/",
    });
    window = dom.window;
    document = window.document;

    // Attach JSDOM window/document globals for content.js
    global.window = window;
    global.document = document;
    global.MutationObserver = window.MutationObserver;

    // Load content.js exported function
    delete require.cache[require.resolve("../src/content.js")];
    const content = require("../src/content.js");
    watchPlayerState = content.watchPlayerState;
  });

  describe("window.innerWidth > 600", () => {
    test("removes ytm-mini-mode and ytm-mini-safe when window innerWidth is greater than 600px", () => {
      window.innerWidth = 800;
      document.body.classList.add("ytm-mini-mode", "ytm-mini-safe");

      watchPlayerState();

      assert.strictEqual(document.body.classList.contains("ytm-mini-mode"), false);
      assert.strictEqual(document.body.classList.contains("ytm-mini-safe"), false);
    });

    test("handles boundary at 601px correctly", () => {
      window.innerWidth = 601;
      document.body.classList.add("ytm-mini-mode", "ytm-mini-safe");

      watchPlayerState();

      assert.strictEqual(document.body.classList.contains("ytm-mini-mode"), false);
      assert.strictEqual(document.body.classList.contains("ytm-mini-safe"), false);
    });
  });

  describe("window.innerWidth <= 600", () => {
    beforeEach(() => {
      window.innerWidth = 600;
    });

    test("adds ytm-mini-mode and ytm-mini-safe when ytmusic-player-page element is absent", () => {
      watchPlayerState();

      assert.strictEqual(document.body.classList.contains("ytm-mini-mode"), true);
      assert.strictEqual(document.body.classList.contains("ytm-mini-safe"), true);
    });

    test("adds ytm-mini-safe when ytmusic-player-page exists but is collapsed (display: none)", () => {
      const playerPage = document.createElement("ytmusic-player-page");
      playerPage.style.display = "none";
      Object.defineProperty(playerPage, "offsetHeight", { configurable: true, value: 500 });
      document.body.appendChild(playerPage);

      watchPlayerState();

      assert.strictEqual(document.body.classList.contains("ytm-mini-mode"), true);
      assert.strictEqual(document.body.classList.contains("ytm-mini-safe"), true);
    });

    test("adds ytm-mini-safe when ytmusic-player-page exists but offsetHeight is <= 100", () => {
      const playerPage = document.createElement("ytmusic-player-page");
      playerPage.style.display = "block";
      Object.defineProperty(playerPage, "offsetHeight", { configurable: true, value: 100 });
      document.body.appendChild(playerPage);

      watchPlayerState();

      assert.strictEqual(document.body.classList.contains("ytm-mini-mode"), true);
      assert.strictEqual(document.body.classList.contains("ytm-mini-safe"), true);
    });

    test("removes ytm-mini-safe when ytmusic-player-page is expanded (display !== none and offsetHeight > 100)", () => {
      const playerPage = document.createElement("ytmusic-player-page");
      playerPage.style.display = "block";
      Object.defineProperty(playerPage, "offsetHeight", { configurable: true, value: 300 });
      document.body.appendChild(playerPage);

      document.body.classList.add("ytm-mini-safe");

      watchPlayerState();

      assert.strictEqual(document.body.classList.contains("ytm-mini-mode"), true);
      assert.strictEqual(document.body.classList.contains("ytm-mini-safe"), false);
    });

    test("handles boundary condition at exactly 600px innerWidth", () => {
      window.innerWidth = 600;
      watchPlayerState();

      assert.strictEqual(document.body.classList.contains("ytm-mini-mode"), true);
    });
  });

  describe("dynamic transitions", () => {
    test("correctly updates body classes when switching from narrow to wide window and back", () => {
      // 1. Start in narrow window without player page
      window.innerWidth = 400;
      watchPlayerState();
      assert.strictEqual(document.body.classList.contains("ytm-mini-mode"), true);
      assert.strictEqual(document.body.classList.contains("ytm-mini-safe"), true);

      // 2. Resize to wide window
      window.innerWidth = 1024;
      watchPlayerState();
      assert.strictEqual(document.body.classList.contains("ytm-mini-mode"), false);
      assert.strictEqual(document.body.classList.contains("ytm-mini-safe"), false);

      // 3. Resize back to narrow window
      window.innerWidth = 500;
      watchPlayerState();
      assert.strictEqual(document.body.classList.contains("ytm-mini-mode"), true);
      assert.strictEqual(document.body.classList.contains("ytm-mini-safe"), true);
    });

    test("correctly updates body classes when player page expands and collapses dynamically", () => {
      window.innerWidth = 500;
      const playerPage = document.createElement("ytmusic-player-page");
      playerPage.style.display = "none";
      Object.defineProperty(playerPage, "offsetHeight", { configurable: true, value: 0 });
      document.body.appendChild(playerPage);

      // Collapsed state
      watchPlayerState();
      assert.strictEqual(document.body.classList.contains("ytm-mini-safe"), true);

      // Expand player page
      playerPage.style.display = "block";
      Object.defineProperty(playerPage, "offsetHeight", { configurable: true, value: 600 });
      watchPlayerState();
      assert.strictEqual(document.body.classList.contains("ytm-mini-safe"), false);

      // Collapse player page again
      playerPage.style.display = "none";
      watchPlayerState();
      assert.strictEqual(document.body.classList.contains("ytm-mini-safe"), true);
    });
  });
});
