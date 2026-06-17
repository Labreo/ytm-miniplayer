// background.js

try {
    if (typeof importScripts === "function") {
        importScripts("browser-polyfill.min.js");
    }
} catch (e) {
    console.warn("Background: Polyfill import skipped or failed:", e);
}

const messenger = typeof browser !== "undefined" ? browser : chrome;
const MINI_WINDOW_BOUNDS = { width: 380, height: 700 };
const PWA_STATE_KEY = "ytmMiniPwaTabs";

function removeUndefinedValues(bounds) {
    return Object.fromEntries(Object.entries(bounds).filter(([, value]) => value !== undefined));
}

async function getPwaWindowStates() {
    if (!messenger.storage || !messenger.storage.local) {
        return {};
    }

    const result = await messenger.storage.local.get(PWA_STATE_KEY);
    return result[PWA_STATE_KEY] || {};
}

async function setPwaWindowStates(states) {
    if (!messenger.storage || !messenger.storage.local) {
        return;
    }

    await messenger.storage.local.set({ [PWA_STATE_KEY]: states });
}

function getRestorableBounds(windowInfo) {
    return removeUndefinedValues({
        left: windowInfo.left,
        top: windowInfo.top,
        width: windowInfo.width,
        height: windowInfo.height,
        state: windowInfo.state,
    });
}

function getRestoreUpdateInfo(bounds) {
    const focused = true;

    if (bounds.state && bounds.state !== "normal") {
        return { state: bounds.state, focused };
    }

    return {
        ...bounds,
        state: "normal",
        focused,
    };
}

async function cleanupPwaWindowStates({ tabId, windowId }) {
    const states = await getPwaWindowStates();
    let changed = false;

    for (const [savedTabId, savedState] of Object.entries(states)) {
        if (
            (tabId !== undefined && Number(savedTabId) === tabId) ||
            (windowId !== undefined && savedState.windowId === windowId)
        ) {
            delete states[savedTabId];
            changed = true;
        }
    }

    if (changed) {
        await setPwaWindowStates(states);
    }
}

async function toggleStandalonePwaWindow(currentWindow, tabId) {
    const states = await getPwaWindowStates();
    const savedState = states[String(tabId)];

    if (savedState && savedState.windowId === currentWindow.id) {
        delete states[String(tabId)];
        await setPwaWindowStates(states);
        await messenger.windows.update(currentWindow.id, getRestoreUpdateInfo(savedState.bounds));
        return;
    }

    states[String(tabId)] = {
        windowId: currentWindow.id,
        bounds: getRestorableBounds(currentWindow),
    };

    await setPwaWindowStates(states);
    await messenger.windows.update(currentWindow.id, {
        state: "normal",
        ...MINI_WINDOW_BOUNDS,
        focused: true,
    });
}

messenger.runtime.onMessage.addListener(async (message, sender) => {
    if (message.action === "toggle_mini") {
        console.log("Background: Received toggle_mini request");

        if (!sender.tab || typeof sender.tab.id !== "number") {
            console.error("Background: No tab information in sender context.");
            return;
        }

        try {
            const currentWindow = await messenger.windows.get(sender.tab.windowId);

            if (message.isStandalonePwa) {
                console.log("Background: Toggling standalone PWA window size...");
                await toggleStandalonePwaWindow(currentWindow, sender.tab.id);
            } else if (currentWindow.type === "popup") {
                console.log("Background: Reverting to main window...");
                const normalWindows = await messenger.windows.getAll({ windowTypes: ["normal"] });

                if (normalWindows.length > 0) {
                    await messenger.tabs.move(sender.tab.id, { windowId: normalWindows[0].id, index: -1 });
                    await messenger.tabs.update(sender.tab.id, { active: true });
                    await messenger.windows.update(normalWindows[0].id, { focused: true });
                } else {
                    await messenger.windows.create({ tabId: sender.tab.id, type: "normal" });
                }
            } else {
                console.log("Background: Entering Mini Mode...");
                await messenger.windows.create({
                    tabId: sender.tab.id,
                    type: "popup",
                    ...MINI_WINDOW_BOUNDS,
                    focused: true,
                });
            }
        } catch (error) {
            console.error("Background: Failed to toggle window.", error);
        }
    }
});

if (messenger.tabs && messenger.tabs.onRemoved) {
    messenger.tabs.onRemoved.addListener((tabId) => {
        cleanupPwaWindowStates({ tabId }).catch((error) => {
            console.error("Background: Failed to clean up PWA tab state.", error);
        });
    });
}

if (messenger.windows && messenger.windows.onRemoved) {
    messenger.windows.onRemoved.addListener((windowId) => {
        cleanupPwaWindowStates({ windowId }).catch((error) => {
            console.error("Background: Failed to clean up PWA window state.", error);
        });
    });
}
