import { test, describe } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const backgroundJsCode = fs.readFileSync(path.join(process.cwd(), "src/background.js"), "utf8");

function createMockExtensionContext(customGlobals = {}) {
    let messageListener = null;

    const mockWindows = {
        get: async () => ({ type: "normal" }),
        getAll: async () => [],
        update: async () => {},
        create: async () => {},
    };

    const mockTabs = {
        move: async () => {},
        update: async () => {},
    };

    const mockRuntime = {
        onMessage: {
            addListener: (listener) => {
                messageListener = listener;
            },
        },
    };

    const mockChromeOrBrowser = {
        runtime: mockRuntime,
        windows: mockWindows,
        tabs: mockTabs,
    };

    const contextGlobals = {
        console: {
            log: () => {},
            warn: () => {},
            error: () => {},
        },
        chrome: mockChromeOrBrowser,
        ...customGlobals,
    };

    const context = vm.createContext(contextGlobals);
    vm.runInContext(backgroundJsCode, context);

    return {
        context,
        getMessageListener: () => messageListener,
        mockWindows,
        mockTabs,
        mockRuntime,
    };
}

describe("Background Script - Polyfill & Setup", () => {
    test("uses 'browser' global if available", () => {
        let addListenerCalled = false;
        const mockBrowser = {
            runtime: {
                onMessage: {
                    addListener: () => {
                        addListenerCalled = true;
                    },
                },
            },
        };

        createMockExtensionContext({ browser: mockBrowser });
        assert.strictEqual(addListenerCalled, true);
    });

    test("uses 'chrome' global when 'browser' is undefined", () => {
        let addListenerCalled = false;
        const mockChrome = {
            runtime: {
                onMessage: {
                    addListener: () => {
                        addListenerCalled = true;
                    },
                },
            },
        };

        createMockExtensionContext({ chrome: mockChrome, browser: undefined });
        assert.strictEqual(addListenerCalled, true);
    });

    test("attempts importScripts if function exists", () => {
        let importedScript = "";
        const importScripts = (scriptName) => {
            importedScript = scriptName;
        };

        createMockExtensionContext({ importScripts });
        assert.strictEqual(importedScript, "browser-polyfill.min.js");
    });

    test("handles importScripts failure gracefully", () => {
        let warnLogged = false;
        const importScripts = () => {
            throw new Error("Import failed");
        };

        const customConsole = {
            log: () => {},
            warn: () => {
                warnLogged = true;
            },
            error: () => {},
        };

        createMockExtensionContext({
            importScripts,
            console: customConsole,
        });

        assert.strictEqual(warnLogged, true);
    });
});

describe("Background Script - Message Handler: get_window_type", () => {
    test("returns 'normal' fallback if tab or tab.windowId is missing", async () => {
        const { getMessageListener } = createMockExtensionContext();
        const listener = getMessageListener();

        const res1 = await listener({ action: "get_window_type" }, {});
        assert.deepEqual(JSON.parse(JSON.stringify(res1)), { windowType: "normal" });

        const res2 = await listener({ action: "get_window_type" }, { tab: {} });
        assert.deepEqual(JSON.parse(JSON.stringify(res2)), { windowType: "normal" });
    });

    test("returns window.type when windows.get succeeds", async () => {
        const { getMessageListener, mockWindows } = createMockExtensionContext();
        mockWindows.get = async (id) => {
            if (id === 123) {
                return { type: "popup" };
            }
            return { type: "normal" };
        };

        const listener = getMessageListener();
        const res = await listener({ action: "get_window_type" }, { tab: { windowId: 123 } });
        assert.deepEqual(JSON.parse(JSON.stringify(res)), { windowType: "popup" });
    });

    test("returns 'normal' fallback when windows.get throws error", async () => {
        let warnLogged = false;
        const customConsole = {
            log: () => {},
            warn: () => {
                warnLogged = true;
            },
            error: () => {},
        };

        const { getMessageListener, mockWindows } = createMockExtensionContext({
            console: customConsole,
        });

        mockWindows.get = async () => {
            throw new Error("Window not found");
        };

        const listener = getMessageListener();
        const res = await listener({ action: "get_window_type" }, { tab: { windowId: 123 } });
        assert.deepEqual(JSON.parse(JSON.stringify(res)), { windowType: "normal" });
        assert.strictEqual(warnLogged, true);
    });
});

describe("Background Script - Message Handler: toggle_mini", () => {
    test("logs error and aborts if sender tab or tab.id is missing", async () => {
        let errorLogged = false;
        const customConsole = {
            log: () => {},
            warn: () => {},
            error: () => {
                errorLogged = true;
            },
        };

        const { getMessageListener } = createMockExtensionContext({ console: customConsole });
        const listener = getMessageListener();

        await listener({ action: "toggle_mini" }, {});
        assert.strictEqual(errorLogged, true);

        errorLogged = false;
        await listener({ action: "toggle_mini" }, { tab: {} });
        assert.strictEqual(errorLogged, true);
    });

    describe("Non-PWA Mode", () => {
        test("creates popup window when current window is normal", async () => {
            const { getMessageListener, mockWindows } = createMockExtensionContext();
            mockWindows.get = async () => ({ type: "normal" });

            const createCalls = [];
            mockWindows.create = async (options) => {
                createCalls.push(options);
            };

            const listener = getMessageListener();
            await listener({ action: "toggle_mini", matchesStandalone: false }, { tab: { id: 10, windowId: 100 } });

            assert.strictEqual(createCalls.length, 1);
            assert.deepEqual(JSON.parse(JSON.stringify(createCalls[0])), {
                tabId: 10,
                type: "popup",
                width: 380,
                height: 700,
                focused: true,
            });
        });

        test("moves tab to existing normal window when current window is popup", async () => {
            const { getMessageListener, mockWindows, mockTabs } = createMockExtensionContext();
            mockWindows.get = async () => ({ type: "popup" });
            mockWindows.getAll = async () => [{ id: 200, type: "normal" }];

            const moveCalls = [];
            const updateTabCalls = [];
            const updateWinCalls = [];

            mockTabs.move = async (tabId, options) => {
                moveCalls.push({ tabId, options });
            };
            mockTabs.update = async (tabId, options) => {
                updateTabCalls.push({ tabId, options });
            };
            mockWindows.update = async (winId, options) => {
                updateWinCalls.push({ winId, options });
            };

            const listener = getMessageListener();
            await listener({ action: "toggle_mini", matchesStandalone: false }, { tab: { id: 10, windowId: 100 } });

            assert.deepEqual(JSON.parse(JSON.stringify(moveCalls)), [
                { tabId: 10, options: { windowId: 200, index: -1 } },
            ]);
            assert.deepEqual(JSON.parse(JSON.stringify(updateTabCalls)), [{ tabId: 10, options: { active: true } }]);
            assert.deepEqual(JSON.parse(JSON.stringify(updateWinCalls)), [{ winId: 200, options: { focused: true } }]);
        });

        test("creates new normal window when current window is popup and no normal window exists", async () => {
            const { getMessageListener, mockWindows } = createMockExtensionContext();
            mockWindows.get = async () => ({ type: "popup" });
            mockWindows.getAll = async () => [];

            const createCalls = [];
            mockWindows.create = async (options) => {
                createCalls.push(options);
            };

            const listener = getMessageListener();
            await listener({ action: "toggle_mini", matchesStandalone: false }, { tab: { id: 10, windowId: 100 } });

            assert.deepEqual(JSON.parse(JSON.stringify(createCalls)), [{ tabId: 10, type: "normal" }]);
        });
    });

    describe("PWA Mode", () => {
        test("enters mini mode in PWA (state normal then width/height)", async () => {
            const { getMessageListener, mockWindows } = createMockExtensionContext();
            mockWindows.get = async () => ({ type: "normal" });

            const updateCalls = [];
            mockWindows.update = async (winId, options) => {
                updateCalls.push({ winId, options });
            };

            const listener = getMessageListener();
            await listener(
                { action: "toggle_mini", matchesStandalone: true, isEntering: true },
                { tab: { id: 10, windowId: 100 } }
            );

            assert.strictEqual(updateCalls.length, 2);
            assert.deepEqual(JSON.parse(JSON.stringify(updateCalls[0])), { winId: 100, options: { state: "normal" } });
            assert.deepEqual(JSON.parse(JSON.stringify(updateCalls[1])), {
                winId: 100,
                options: { width: 380, height: 700 },
            });
        });

        test("exits mini mode in PWA (state updated and bounds restored when normal)", async () => {
            const { getMessageListener, mockWindows } = createMockExtensionContext();
            mockWindows.get = async () => ({ type: "normal" });

            const updateCalls = [];
            mockWindows.update = async (winId, options) => {
                updateCalls.push({ winId, options });
            };

            const listener = getMessageListener();
            await listener(
                {
                    action: "toggle_mini",
                    matchesStandalone: true,
                    isEntering: false,
                    originalDimensions: { state: "normal", width: 1200, height: 800, left: 10, top: 20 },
                },
                { tab: { id: 10, windowId: 100 } }
            );

            assert.strictEqual(updateCalls.length, 2);
            assert.deepEqual(JSON.parse(JSON.stringify(updateCalls[0])), { winId: 100, options: { state: "normal" } });
            assert.deepEqual(JSON.parse(JSON.stringify(updateCalls[1])), {
                winId: 100,
                options: { width: 1200, height: 800, left: 10, top: 20 },
            });
        });

        test("exits mini mode in PWA to non-normal targetState without updating bounds", async () => {
            const { getMessageListener, mockWindows } = createMockExtensionContext();
            mockWindows.get = async () => ({ type: "normal" });

            const updateCalls = [];
            mockWindows.update = async (winId, options) => {
                updateCalls.push({ winId, options });
            };

            const listener = getMessageListener();
            await listener(
                {
                    action: "toggle_mini",
                    matchesStandalone: true,
                    isEntering: false,
                    originalDimensions: { state: "maximized", width: 1200, height: 800 },
                },
                { tab: { id: 10, windowId: 100 } }
            );

            assert.strictEqual(updateCalls.length, 1);
            assert.deepEqual(JSON.parse(JSON.stringify(updateCalls[0])), {
                winId: 100,
                options: { state: "maximized" },
            });
        });
    });

    test("handles errors gracefully in toggle_mini", async () => {
        let errorLogged = false;
        const customConsole = {
            log: () => {},
            warn: () => {},
            error: () => {
                errorLogged = true;
            },
        };

        const { getMessageListener, mockWindows } = createMockExtensionContext({
            console: customConsole,
        });

        mockWindows.get = async () => {
            throw new Error("API call failed");
        };

        const listener = getMessageListener();
        await listener({ action: "toggle_mini" }, { tab: { id: 10, windowId: 100 } });

        assert.strictEqual(errorLogged, true);
    });
});
