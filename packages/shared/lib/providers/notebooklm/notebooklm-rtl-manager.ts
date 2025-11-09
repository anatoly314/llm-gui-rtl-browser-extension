/**
 * NotebookLM RTL Manager
 * Handles all RTL functionality for NotebookLM platform
 */

/**
 * Finds the chat-panel HTML element
 */
const findChatPanel = (): HTMLElement | null => document.querySelector('chat-panel');

/**
 * Applies or removes RTL direction to the chat panel
 */
const applyChatPanelRTL = (enable: boolean): void => {
  const chatPanel = findChatPanel();
  if (!chatPanel) {
    console.debug('[NotebookLM RTL Manager] Chat panel not found');
    return;
  }

  if (enable) {
    chatPanel.style.direction = 'rtl';
  } else {
    chatPanel.style.direction = 'ltr';
  }
};

/**
 * Applies or removes special KaTeX styling for NotebookLM
 */
const applyNotebookLMKatexStyle = (enable: boolean): void => {
  const styleId = 'notebooklm-katex-rtl-override';
  const existingStyle = document.getElementById(styleId);

  if (enable) {
    // Add style if it doesn't exist
    if (!existingStyle) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .katex {
          direction: ltr;
          unicode-bidi: bidi-override;
        }
      `;
      document.head.appendChild(style);
    }
  } else {
    // Remove style if it exists
    if (existingStyle) {
      existingStyle.remove();
    }
  }
};

/**
 * Extracts the notebook UUID from NotebookLM URL
 * Example: https://notebooklm.google.com/notebook/abc123-def456-ghi789
 * Returns: 'abc123-def456-ghi789' or null
 */
const getCurrentChatId = (): string | null => {
  const url = window.location.href;
  const hostname = window.location.hostname;

  // NotebookLM pattern: /notebook/{id}
  if (hostname === 'notebooklm.google.com') {
    const chatMatch = url.match(/\/notebook\/([a-f0-9-]+)/i);
    return chatMatch ? chatMatch[1] : null;
  }

  return null;
};

/**
 * Gets the effective chat ID - returns "new" for potential future homepage or actual UUID in notebook
 */
const getEffectiveChatId = (): string => {
  const chatId = getCurrentChatId();
  if (chatId) return chatId;

  // Currently no "new" page concept for NotebookLM, but keeping for future compatibility
  return '';
};

/**
 * Gets the current NotebookLM KaTeX RTL state from storage for the current chat
 */
export const getCurrentNotebookLMKatexRTLState = async (): Promise<boolean> => {
  const chatId = getEffectiveChatId();
  if (!chatId) return false;

  try {
    const { notebooklmChatStorage } = await import('@extension/storage');
    const settings = await notebooklmChatStorage.getChatSettings(chatId);
    return settings.isKatexRTL;
  } catch (error) {
    console.error('[NotebookLM RTL Manager] Error getting NotebookLM KaTeX RTL state:', error);
    return false;
  }
};

/**
 * Gets the current NotebookLM Chat Panel RTL state from storage for the current chat
 */
export const getCurrentNotebookLMChatPanelRTLState = async (): Promise<boolean> => {
  const chatId = getEffectiveChatId();
  if (!chatId) return false;

  try {
    const { notebooklmChatStorage } = await import('@extension/storage');
    const settings = await notebooklmChatStorage.getChatSettings(chatId);
    return settings.isChatPanelRTL;
  } catch (error) {
    console.error('[NotebookLM RTL Manager] Error getting NotebookLM Chat Panel RTL state:', error);
    return false;
  }
};

/**
 * Toggles NotebookLM KaTeX RTL styling for the current chat and saves to storage
 */
export const toggleNotebookLMKatexRTL = async (): Promise<boolean> => {
  const chatId = getEffectiveChatId();
  if (!chatId) {
    console.debug('[NotebookLM RTL Manager] No valid context for NotebookLM KaTeX RTL toggle');
    return false;
  }

  try {
    const { notebooklmChatStorage } = await import('@extension/storage');
    const currentSettings = await notebooklmChatStorage.getChatSettings(chatId);
    const newRTLState = !currentSettings.isKatexRTL;

    // Save to storage
    await notebooklmChatStorage.setChatSettings(chatId, {
      isKatexRTL: newRTLState,
    });

    // Apply immediately
    applyNotebookLMKatexStyle(newRTLState);

    return newRTLState;
  } catch (error) {
    console.error('[NotebookLM RTL Manager] Error toggling NotebookLM KaTeX RTL:', error);
    return false;
  }
};

/**
 * Toggles NotebookLM Chat Panel RTL direction for the current chat and saves to storage
 */
export const toggleNotebookLMChatPanelRTL = async (): Promise<boolean> => {
  const chatId = getEffectiveChatId();
  if (!chatId) {
    console.debug('[NotebookLM RTL Manager] No valid context for NotebookLM Chat Panel RTL toggle');
    return false;
  }

  try {
    const { notebooklmChatStorage } = await import('@extension/storage');
    const currentSettings = await notebooklmChatStorage.getChatSettings(chatId);
    const newRTLState = !currentSettings.isChatPanelRTL;

    // Save to storage
    await notebooklmChatStorage.setChatSettings(chatId, {
      isChatPanelRTL: newRTLState,
    });

    // Apply immediately
    applyChatPanelRTL(newRTLState);

    return newRTLState;
  } catch (error) {
    console.error('[NotebookLM RTL Manager] Error toggling NotebookLM Chat Panel RTL:', error);
    return false;
  }
};

/**
 * Initializes NotebookLM RTL manager - applies saved state and watches for URL changes and DOM changes
 */
export const initNotebookLMRTLManager = (): (() => void) => {
  // Apply saved states on load
  const applyNotebookLMStates = async () => {
    const chatId = getEffectiveChatId();
    if (!chatId) {
      console.debug('[NotebookLM RTL Manager] No effective chat ID for NotebookLM, skipping apply');
      return;
    }

    const isKatexRTL = await getCurrentNotebookLMKatexRTLState();
    const isChatPanelRTL = await getCurrentNotebookLMChatPanelRTLState();

    applyNotebookLMKatexStyle(isKatexRTL);
    applyChatPanelRTL(isChatPanelRTL);
  };

  // Initial apply
  applyNotebookLMStates();

  // Watch for URL changes and DOM changes to reapply on navigation
  let lastUrl = location.href;
  let lastChatPanelElement: HTMLElement | null = null;

  const observer = new MutationObserver(async () => {
    const currentUrl = location.href;
    const currentChatPanelElement = findChatPanel();

    // Reapply on URL change
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      await applyNotebookLMStates();
    }

    // Reapply if chat panel element changed or style doesn't match
    if (currentChatPanelElement && currentChatPanelElement !== lastChatPanelElement) {
      lastChatPanelElement = currentChatPanelElement;
      const chatId = getEffectiveChatId();
      if (chatId) {
        const isChatPanelRTL = await getCurrentNotebookLMChatPanelRTLState();
        applyChatPanelRTL(isChatPanelRTL);
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  return () => {
    observer.disconnect();
  };
};

/**
 * Reapplies all NotebookLM styles for the current chat (useful after settings transfer)
 */
export const reapplyNotebookLMStyles = async (): Promise<void> => {
  const chatId = getEffectiveChatId();
  if (!chatId) return;

  const isKatexRTL = await getCurrentNotebookLMKatexRTLState();
  const isChatPanelRTL = await getCurrentNotebookLMChatPanelRTLState();

  applyNotebookLMKatexStyle(isKatexRTL);
  applyChatPanelRTL(isChatPanelRTL);
};

export { applyNotebookLMKatexStyle, applyChatPanelRTL };
