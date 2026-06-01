/**
 * background.js
 *
 * Background runtime for YTM Mini Mode.
 *
 * Responsibilities:
 * - Normalize extension runtime APIs across browsers.
 * - Receive toggle requests from the content script.
 * - Move the current YouTube Music tab into or out of a popup window.
 */

/**
 * Robust polyfill initialization.
 * Ensures the `browser` namespace is available, falling back to `chrome` if necessary.
 */
try {
  if (typeof importScripts === 'function') {
    importScripts('browser-polyfill.min.js');
  }
} catch (e) {
  console.warn("Background: Polyfill import skipped or failed:", e);
}

// Fallback for environments where the polyfill may not attach to global scope correctly.
const messenger = (typeof browser !== 'undefined') ? browser : chrome;

/**
 * Listen for runtime messages from the content script.
 * @param {{action:string}} message
 * @param {browser.runtime.MessageSender|chrome.runtime.MessageSender} sender
 */
messenger.runtime.onMessage.addListener(async (message, sender) => {
  if (message.action === "toggle_mini") {
    console.log("Background: Received toggle_mini request");
    
    // Safety check: Ensure we have a valid tab to move
    if (!sender.tab || !sender.tab.id) {
      console.error("Background: No tab information in sender context.");
      return;
    }

    try {
      const currentWindow = await messenger.windows.get(sender.tab.windowId);

      if (currentWindow.type === "popup") {
        console.log("Background: Reverting to main window...");
        const normalWindows = await messenger.windows.getAll({ windowTypes: ["normal"] });
        
        if (normalWindows.length > 0) {
          // Move tab back to the first available normal window
          await messenger.tabs.move(sender.tab.id, { windowId: normalWindows[0].id, index: -1 });
          await messenger.tabs.update(sender.tab.id, { active: true });
          await messenger.windows.update(normalWindows[0].id, { focused: true });
        } else {
          // Create a new normal window if none exist
          await messenger.windows.create({ tabId: sender.tab.id, type: "normal" });
        }
      } 
      else {
        console.log("Background: Entering Mini Mode...");
        // Create the popup window
        // Note: Edge sometimes requires 'focused: true' to be explicitly set for the new window to appear
        await messenger.windows.create({
          tabId: sender.tab.id,
          type: "popup",
          width: 380,   
          height: 700,  
          focused: true
        });
      }
    } catch (error) {
      console.error("Background: Failed to toggle window.", error);
      // In case of a failure, we could notify the content script here if needed
    }
  }
});