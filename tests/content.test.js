const { test, describe, beforeEach } = require("node:test");
const assert = require("node:assert");
const { JSDOM } = require("jsdom");

describe("injectMiniCSS", () => {
    let dom;
    let window;
    let document;
    let injectMiniCSS;

    beforeEach(() => {
        dom = new JSDOM("<!DOCTYPE html><html><head></head><body></body></html>", {
            url: "https://music.youtube.com/",
        });
        window = dom.window;
        document = window.document;

        global.window = window;
        global.document = document;
        global.MutationObserver = window.MutationObserver;
        global.requestAnimationFrame = (cb) => setTimeout(cb, 0);

        // Load content.js exported function
        delete require.cache[require.resolve("../src/content.js")];
        const content = require("../src/content.js");
        injectMiniCSS = content.injectMiniCSS;
    });

    test("injectMiniCSS creates and appends <style id='ytm-mini-css'> to document.head", () => {
        assert.strictEqual(document.getElementById("ytm-mini-css"), null);

        injectMiniCSS();

        const styleEl = document.getElementById("ytm-mini-css");
        assert.notStrictEqual(styleEl, null);
        assert.strictEqual(styleEl.tagName, "STYLE");
        assert.strictEqual(styleEl.parentElement, document.head);
    });

    test("injectMiniCSS populates style tag with expected CSS content", () => {
        injectMiniCSS();

        const styleEl = document.getElementById("ytm-mini-css");
        const cssText = styleEl.innerHTML;

        assert.ok(cssText.includes("@media (max-width: 600px)"), "CSS should include max-width media query");
        assert.ok(cssText.includes("#ytm-pill-container"), "CSS should include #ytm-pill-container styles");
        assert.ok(
            cssText.includes("body.ytm-mini-mode ytmusic-like-button-renderer"),
            "CSS should include like-button-renderer overrides"
        );
    });

    test("injectMiniCSS is idempotent and does not create duplicate style tags on multiple invocations", () => {
        injectMiniCSS();
        injectMiniCSS();
        injectMiniCSS();

        const styles = document.querySelectorAll("style#ytm-mini-css");
        assert.strictEqual(styles.length, 1);
    });

    test("injectMiniCSS does not overwrite or duplicate if element with id 'ytm-mini-css' already exists", () => {
        const existingStyle = document.createElement("style");
        existingStyle.id = "ytm-mini-css";
        existingStyle.innerHTML = "/* pre-existing css */";
        document.head.appendChild(existingStyle);

        injectMiniCSS();

        const styles = document.querySelectorAll("#ytm-mini-css");
        assert.strictEqual(styles.length, 1);
        assert.strictEqual(styles[0].innerHTML, "/* pre-existing css */");
    });
});

describe("createNavButtons", () => {
    let dom;
    let window;
    let document;
    let contentModule;
    let sentMessages;
    let windowTypeResponse;

    beforeEach(() => {
        dom = new JSDOM("<!DOCTYPE html><html><head></head><body></body></html>", {
            url: "https://music.youtube.com/",
        });
        window = dom.window;
        document = window.document;

        global.window = window;
        global.document = document;
        global.sessionStorage = window.sessionStorage;
        global.MutationObserver = window.MutationObserver;
        global.requestAnimationFrame = (cb) => setTimeout(cb, 0);

        sentMessages = [];
        windowTypeResponse = { windowType: "normal" };

        const mockRuntime = {
            getURL: (pathStr) => `chrome-extension://mock-id/${pathStr}`,
            sendMessage: async (msg) => {
                sentMessages.push(msg);
                if (msg.action === "get_window_type") {
                    return windowTypeResponse;
                }
                return {};
            },
        };

        window.chrome = { runtime: mockRuntime };
        window.browser = { runtime: mockRuntime };
        global.chrome = window.chrome;
        global.browser = window.browser;

        Object.defineProperty(window, "toolbar", {
            value: { visible: true },
            writable: true,
            configurable: true,
        });

        window.matchMedia = (query) => ({
            matches: false,
            media: query,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => {},
        });

        Object.defineProperty(window, "innerWidth", { value: 1024, writable: true, configurable: true });
        Object.defineProperty(window, "innerHeight", { value: 768, writable: true, configurable: true });
        Object.defineProperty(window, "outerWidth", { value: 1024, writable: true, configurable: true });
        Object.defineProperty(window, "outerHeight", { value: 768, writable: true, configurable: true });
        Object.defineProperty(window, "screenX", { value: 0, writable: true, configurable: true });
        Object.defineProperty(window, "screenY", { value: 0, writable: true, configurable: true });
        Object.defineProperty(window, "screen", {
            value: { availWidth: 1920, availHeight: 1080 },
            writable: true,
            configurable: true,
        });

        delete require.cache[require.resolve("../src/content.js")];
        contentModule = require("../src/content.js");
    });

    test("should do nothing if nav bar right-content element is not present", () => {
        contentModule.createNavButtons();
        assert.strictEqual(document.getElementById("ytm-mini-btn"), null);
    });

    test("should create mini toggle button and coffee support button in nav bar", () => {
        const navBar = document.createElement("ytmusic-nav-bar");
        const rightContent = document.createElement("div");
        rightContent.className = "right-content";
        navBar.appendChild(rightContent);
        document.body.appendChild(navBar);

        contentModule.createNavButtons();

        const miniBtn = document.getElementById("ytm-mini-btn");
        assert.notStrictEqual(miniBtn, null);
        assert.strictEqual(miniBtn.title, "Toggle Mini Player (Pop Out/In)");

        const img = miniBtn.querySelector("img");
        assert.notStrictEqual(img, null);
        assert.strictEqual(img.src, "chrome-extension://mock-id/icons/icon-48.png");

        const supportBtn = rightContent.querySelector('a[href="https://www.buymeacoffee.com/kakeroth"]');
        assert.notStrictEqual(supportBtn, null);
        assert.strictEqual(supportBtn.innerText, "☕");
        assert.strictEqual(supportBtn.target, "_blank");

        // Hover handlers
        miniBtn.onmouseover();
        assert.strictEqual(miniBtn.style.backgroundColor, "rgba(255, 255, 255, 0.1)");
        miniBtn.onmouseout();
        assert.strictEqual(miniBtn.style.backgroundColor, "transparent");

        supportBtn.onmouseover();
        assert.strictEqual(supportBtn.style.backgroundColor, "rgb(79, 79, 79)");
        supportBtn.onmouseout();
        assert.strictEqual(supportBtn.style.backgroundColor, "rgb(51, 51, 51)");
    });

    test("should not create duplicate nav buttons if already injected", () => {
        const navBar = document.createElement("ytmusic-nav-bar");
        const rightContent = document.createElement("div");
        rightContent.className = "right-content";
        navBar.appendChild(rightContent);
        document.body.appendChild(navBar);

        contentModule.createNavButtons();
        contentModule.createNavButtons();

        const miniBtns = document.querySelectorAll("#ytm-mini-btn");
        assert.strictEqual(miniBtns.length, 1);
    });

    test("should handle mini player toggle click to enter mini mode", async () => {
        const navBar = document.createElement("ytmusic-nav-bar");
        const rightContent = document.createElement("div");
        rightContent.className = "right-content";
        navBar.appendChild(rightContent);
        document.body.appendChild(navBar);

        contentModule.createNavButtons();
        const miniBtn = document.getElementById("ytm-mini-btn");

        miniBtn.click();
        await new Promise((resolve) => setTimeout(resolve, 200));

        assert.strictEqual(window.sessionStorage.getItem("ytm_in_mini_mode"), "true");
        assert.ok(sentMessages.some((m) => m.action === "get_window_type"));
        assert.ok(sentMessages.some((m) => m.action === "toggle_mini" && m.isEntering === true));
    });

    test("should handle mini player toggle click to exit mini mode", async () => {
        window.sessionStorage.setItem("ytm_in_mini_mode", "true");
        windowTypeResponse = { windowType: "popup" };

        const navBar = document.createElement("ytmusic-nav-bar");
        const rightContent = document.createElement("div");
        rightContent.className = "right-content";
        navBar.appendChild(rightContent);
        document.body.appendChild(navBar);

        contentModule.createNavButtons();
        const miniBtn = document.getElementById("ytm-mini-btn");

        miniBtn.click();
        await new Promise((resolve) => setTimeout(resolve, 200));

        assert.strictEqual(window.sessionStorage.getItem("ytm_in_mini_mode"), null);
        assert.ok(sentMessages.some((m) => m.action === "toggle_mini" && m.isEntering === false));
    });

    test("should store original dimensions when entering mini mode in standalone display mode", async () => {
        window.matchMedia = (query) => ({
            matches: query.includes("standalone"),
            media: query,
        });

        const navBar = document.createElement("ytmusic-nav-bar");
        const rightContent = document.createElement("div");
        rightContent.className = "right-content";
        navBar.appendChild(rightContent);
        document.body.appendChild(navBar);

        contentModule.createNavButtons();
        const miniBtn = document.getElementById("ytm-mini-btn");

        miniBtn.click();
        await new Promise((resolve) => setTimeout(resolve, 200));

        assert.strictEqual(window.sessionStorage.getItem("ytm_in_mini_mode"), "true");
        const storedDimensions = JSON.parse(window.sessionStorage.getItem("ytm_original_dimensions"));
        assert.deepStrictEqual(storedDimensions, {
            width: 1024,
            height: 768,
            left: 0,
            top: 0,
            state: "normal",
        });
    });
});

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

        global.window = window;
        global.document = document;
        global.MutationObserver = window.MutationObserver;
        global.requestAnimationFrame = (cb) => setTimeout(cb, 0);

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
            window.innerWidth = 400;
            watchPlayerState();
            assert.strictEqual(document.body.classList.contains("ytm-mini-mode"), true);
            assert.strictEqual(document.body.classList.contains("ytm-mini-safe"), true);

            window.innerWidth = 1024;
            watchPlayerState();
            assert.strictEqual(document.body.classList.contains("ytm-mini-mode"), false);
            assert.strictEqual(document.body.classList.contains("ytm-mini-safe"), false);

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

            watchPlayerState();
            assert.strictEqual(document.body.classList.contains("ytm-mini-safe"), true);

            playerPage.style.display = "block";
            Object.defineProperty(playerPage, "offsetHeight", { configurable: true, value: 600 });
            watchPlayerState();
            assert.strictEqual(document.body.classList.contains("ytm-mini-safe"), false);

            playerPage.style.display = "none";
            watchPlayerState();
            assert.strictEqual(document.body.classList.contains("ytm-mini-safe"), true);
        });
    });
});

describe("managePillBar", () => {
    let dom;
    let window;
    let document;
    let contentModule;

    beforeEach(() => {
        dom = new JSDOM("<!DOCTYPE html><html><head></head><body></body></html>", {
            url: "https://music.youtube.com/",
        });
        window = dom.window;
        document = window.document;

        global.window = window;
        global.document = document;
        global.MutationObserver = window.MutationObserver;
        global.requestAnimationFrame = (cb) => setTimeout(cb, 0);

        delete require.cache[require.resolve("../src/content.js")];
        contentModule = require("../src/content.js");
    });

    test("should hide container and restore native renderer on desktop view", () => {
        window.innerWidth = 500;

        const parentDiv = document.createElement("div");
        parentDiv.id = "original-parent";
        const siblingDiv = document.createElement("div");
        siblingDiv.id = "original-sibling";
        const renderer = document.createElement("ytmusic-like-button-renderer");

        parentDiv.appendChild(renderer);
        parentDiv.appendChild(siblingDiv);
        document.body.appendChild(parentDiv);

        contentModule.managePillBar();

        const pillContainer = document.getElementById("ytm-pill-container");
        assert.notStrictEqual(pillContainer, null);
        assert.strictEqual(pillContainer.style.display, "flex");
        assert.ok(pillContainer.contains(renderer));

        // Switch to desktop view
        window.innerWidth = 800;
        contentModule.managePillBar();

        assert.strictEqual(pillContainer.style.display, "none");
        assert.ok(parentDiv.contains(renderer));
        assert.strictEqual(renderer.nextSibling, siblingDiv);
    });

    test("should create pill bar container and move primary renderer in mobile view", () => {
        window.innerWidth = 400;

        const renderer = document.createElement("ytmusic-like-button-renderer");
        document.body.appendChild(renderer);

        contentModule.managePillBar();

        const pillContainer = document.getElementById("ytm-pill-container");
        assert.notStrictEqual(pillContainer, null);
        assert.strictEqual(pillContainer.style.display, "flex");
        assert.strictEqual(renderer.parentElement, pillContainer);
    });
});

describe("initDraggable", () => {
    let dom;
    let window;
    let document;
    let contentModule;

    beforeEach(() => {
        dom = new JSDOM("<!DOCTYPE html><html><head></head><body></body></html>", {
            url: "https://music.youtube.com/",
        });
        window = dom.window;
        document = window.document;

        global.window = window;
        global.document = document;
        global.MutationObserver = window.MutationObserver;
        global.requestAnimationFrame = (cb) => setTimeout(cb, 0);

        delete require.cache[require.resolve("../src/content.js")];
        contentModule = require("../src/content.js");
    });

    test("should attach drag handlers and respond to mouse drag events", () => {
        const el = document.createElement("div");
        el.id = "drag-target";
        document.body.appendChild(el);

        el.getBoundingClientRect = () => ({
            left: 100,
            top: 100,
            width: 100,
            height: 50,
            right: 200,
            bottom: 150,
        });

        contentModule.initDraggable(el);

        // Mouse down on element (left click button 0)
        const mouseDownEvent = new window.MouseEvent("mousedown", {
            button: 0,
            clientX: 120,
            clientY: 110,
            bubbles: true,
        });
        el.dispatchEvent(mouseDownEvent);

        assert.strictEqual(el.style.transition, "none");

        // Mouse move on document
        const mouseMoveEvent = new window.MouseEvent("mousemove", {
            clientX: 150,
            clientY: 140,
            bubbles: true,
        });
        document.dispatchEvent(mouseMoveEvent);

        assert.strictEqual(el.style.left, "180px");
        assert.strictEqual(el.style.top, "130px");

        // Mouse up
        const mouseUpEvent = new window.MouseEvent("mouseup", { bubbles: true });
        document.dispatchEvent(mouseUpEvent);

        assert.strictEqual(el.style.transition, "background 0.3s, border 0.3s, box-shadow 0.3s");
    });

    test("should ignore right clicks or clicks on buttons/icons inside element", () => {
        const el = document.createElement("div");
        const innerButton = document.createElement("button");
        el.appendChild(innerButton);
        document.body.appendChild(el);

        contentModule.initDraggable(el);

        // Right click should be ignored
        const rightClickEvent = new window.MouseEvent("mousedown", { button: 2, bubbles: true });
        el.dispatchEvent(rightClickEvent);
        assert.notStrictEqual(el.style.transition, "none");

        // Click on inner button should be ignored
        const buttonClickEvent = new window.MouseEvent("mousedown", { button: 0, bubbles: true });
        innerButton.dispatchEvent(buttonClickEvent);
        assert.notStrictEqual(el.style.transition, "none");
    });

    test("should handle touch drag events", () => {
        const el = document.createElement("div");
        document.body.appendChild(el);

        el.getBoundingClientRect = () => ({
            left: 100,
            top: 100,
            width: 100,
            height: 50,
            right: 200,
            bottom: 150,
        });

        contentModule.initDraggable(el);

        const touchStartEvent = new window.Event("touchstart", { bubbles: true });
        touchStartEvent.touches = [{ clientX: 120, clientY: 110 }];
        el.dispatchEvent(touchStartEvent);

        const touchMoveEvent = new window.Event("touchmove", { bubbles: true });
        touchMoveEvent.touches = [{ clientX: 160, clientY: 130 }];
        document.dispatchEvent(touchMoveEvent);

        assert.strictEqual(el.style.left, "190px");
        assert.strictEqual(el.style.top, "120px");

        const touchEndEvent = new window.Event("touchend", { bubbles: true });
        document.dispatchEvent(touchEndEvent);

        assert.strictEqual(el.style.transition, "background 0.3s, border 0.3s, box-shadow 0.3s");
    });
});

describe("initObserver", () => {
    let dom;
    let window;
    let document;
    let contentModule;

    beforeEach(() => {
        dom = new JSDOM("<!DOCTYPE html><html><head></head><body></body></html>", {
            url: "https://music.youtube.com/",
        });
        window = dom.window;
        document = window.document;

        global.window = window;
        global.document = document;
        global.MutationObserver = window.MutationObserver;
        global.requestAnimationFrame = (cb) => setTimeout(cb, 0);

        delete require.cache[require.resolve("../src/content.js")];
        contentModule = require("../src/content.js");
    });

    test("should set up MutationObserver and window resize listener", async () => {
        contentModule.initObserver();

        // Trigger resize event in mobile viewport
        window.innerWidth = 500;
        window.dispatchEvent(new window.Event("resize"));

        await new Promise((resolve) => setTimeout(resolve, 50));

        assert.strictEqual(document.body.classList.contains("ytm-mini-mode"), true);
    });
});
