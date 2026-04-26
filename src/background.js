// background.js

/**
 * 1. Robust Polyfill Initialization
 * Ensures 'browser' namespace is available, falling back to 'chrome' if necessary.
 */
try {
  if (typeof importScripts === 'function') {
    importScripts('browser-polyfill.min.js');
  }
} catch (e) {
  console.warn("Background: Polyfill import skipped or failed:", e);
}

// Fallback for environments where polyfill might not have attached to global scope correctly
const messenger = (typeof browser !== 'undefined') ? browser : chrome;

/**
 * 2. Message Listener
 * Handles the 'toggle_mini' action to switch between normal and popup windows.
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