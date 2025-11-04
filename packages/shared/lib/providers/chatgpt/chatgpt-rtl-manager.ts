/**
 * ChatGPT RTL Manager
 * Handles all RTL functionality for ChatGPT platform
 */

/**
 * Finds the ChatGPT prompt textarea
 */
const findChatGPTInput = (): HTMLElement | null => document.getElementById('prompt-textarea');

/**
 * Applies or removes RTL direction to the ChatGPT input
 */
const applyChatGPTInputRTL = (enable: boolean): void => {
  const input = findChatGPTInput();
  if (!input) {
    console.debug('[ChatGPT RTL Manager] ChatGPT input not found');
    return;
  }

  if (enable) {
    input.style.direction = 'rtl';
  } else {
    input.style.direction = 'ltr';
  }
};

/**
 * Applies or removes special KaTeX styling for ChatGPT
 */
const applyChatGPTKatexStyle = (enable: boolean): void => {
  const styleId = 'chatgpt-katex-rtl-override';
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
 * Extracts the chat UUID from ChatGPT URL
 * Example: https://chatgpt.com/c/abc123-def456-ghi789
 * Returns: 'abc123-def456-ghi789' or null
 */
const getCurrentChatId = (): string | null => {
  const url = window.location.href;
  const hostname = window.location.hostname;

  // ChatGPT pattern: /c/{id}
  if (hostname === 'chatgpt.com' || hostname === 'chat.openai.com') {
    const chatMatch = url.match(/\/c\/([a-f0-9-]+)/i);
    return chatMatch ? chatMatch[1] : null;
  }

  return null;
};

/**
 * Gets the effective chat ID - returns "new" for ChatGPT home page or actual UUID in chat
 */
const getEffectiveChatId = (): string => {
  const chatId = getCurrentChatId();
  if (chatId) return chatId;

  const path = window.location.pathname;
  const hostname = window.location.hostname;

  // If on ChatGPT home page, use special "new" key
  if ((hostname === 'chatgpt.com' || hostname === 'chat.openai.com') && path === '/') return 'new';

  return '';
};

/**
 * Gets the current ChatGPT KaTeX RTL state from storage for the current chat
 */
export const getCurrentChatGPTKatexRTLState = async (): Promise<boolean> => {
  const chatId = getEffectiveChatId();
  if (!chatId) return false;

  try {
    const { chatgptChatStorage } = await import('@extension/storage');
    const settings = await chatgptChatStorage.getChatSettings(chatId);
    return settings.isChatGPTKatexRTL;
  } catch (error) {
    console.error('[ChatGPT RTL Manager] Error getting ChatGPT KaTeX RTL state:', error);
    return false;
  }
};

/**
 * Gets the current ChatGPT Input RTL state from storage for the current chat
 */
export const getCurrentChatGPTInputRTLState = async (): Promise<boolean> => {
  const chatId = getEffectiveChatId();
  if (!chatId) return false;

  try {
    const { chatgptChatStorage } = await import('@extension/storage');
    const settings = await chatgptChatStorage.getChatSettings(chatId);
    return settings.isChatGPTInputRTL;
  } catch (error) {
    console.error('[ChatGPT RTL Manager] Error getting ChatGPT Input RTL state:', error);
    return false;
  }
};

/**
 * Toggles ChatGPT KaTeX RTL styling for the current chat and saves to storage
 */
export const toggleChatGPTKatexRTL = async (): Promise<boolean> => {
  const chatId = getEffectiveChatId();
  if (!chatId) {
    console.debug('[ChatGPT RTL Manager] No valid context for ChatGPT KaTeX RTL toggle');
    return false;
  }

  try {
    const { chatgptChatStorage } = await import('@extension/storage');
    const currentSettings = await chatgptChatStorage.getChatSettings(chatId);
    const newRTLState = !currentSettings.isChatGPTKatexRTL;

    // Save to storage
    await chatgptChatStorage.setChatSettings(chatId, {
      isChatGPTKatexRTL: newRTLState,
    });

    // Apply immediately
    applyChatGPTKatexStyle(newRTLState);

    return newRTLState;
  } catch (error) {
    console.error('[ChatGPT RTL Manager] Error toggling ChatGPT KaTeX RTL:', error);
    return false;
  }
};

/**
 * Toggles ChatGPT Input RTL direction for the current chat and saves to storage
 */
export const toggleChatGPTInputRTL = async (): Promise<boolean> => {
  const chatId = getEffectiveChatId();
  if (!chatId) {
    console.debug('[ChatGPT RTL Manager] No valid context for ChatGPT Input RTL toggle');
    return false;
  }

  try {
    const { chatgptChatStorage } = await import('@extension/storage');
    const currentSettings = await chatgptChatStorage.getChatSettings(chatId);
    const newRTLState = !currentSettings.isChatGPTInputRTL;

    // Save to storage
    await chatgptChatStorage.setChatSettings(chatId, {
      isChatGPTInputRTL: newRTLState,
    });

    // Apply immediately
    applyChatGPTInputRTL(newRTLState);

    return newRTLState;
  } catch (error) {
    console.error('[ChatGPT RTL Manager] Error toggling ChatGPT Input RTL:', error);
    return false;
  }
};

/**
 * Initializes ChatGPT RTL manager - applies saved state and watches for URL changes and DOM changes
 */
export const initChatGPTRTLManager = (): (() => void) => {
  // Apply saved states on load
  const applyChatGPTStates = async () => {
    const chatId = getEffectiveChatId();
    if (!chatId) {
      console.debug('[ChatGPT RTL Manager] No effective chat ID for ChatGPT, skipping apply');
      return;
    }

    const isKatexRTL = await getCurrentChatGPTKatexRTLState();
    const isInputRTL = await getCurrentChatGPTInputRTLState();

    applyChatGPTKatexStyle(isKatexRTL);
    applyChatGPTInputRTL(isInputRTL);
  };

  // Initial apply
  applyChatGPTStates();

  // Watch for URL changes and DOM changes to reapply on navigation
  let lastUrl = location.href;
  let lastInputElement: HTMLElement | null = null;

  const observer = new MutationObserver(async () => {
    const currentUrl = location.href;
    const currentInputElement = findChatGPTInput();

    // Reapply on URL change
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      await applyChatGPTStates();
    }

    // Reapply if input element changed
    if (currentInputElement && currentInputElement !== lastInputElement) {
      lastInputElement = currentInputElement;
      const chatId = getEffectiveChatId();
      if (chatId) {
        const isInputRTL = await getCurrentChatGPTInputRTLState();
        applyChatGPTInputRTL(isInputRTL);
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  return () => {
    observer.disconnect();
  };
};

/**
 * Reapplies all ChatGPT styles for the current chat (useful after settings transfer)
 */
export const reapplyChatGPTStyles = async (): Promise<void> => {
  const chatId = getEffectiveChatId();
  if (!chatId) return;

  const isKatexRTL = await getCurrentChatGPTKatexRTLState();
  const isInputRTL = await getCurrentChatGPTInputRTLState();

  applyChatGPTKatexStyle(isKatexRTL);
  applyChatGPTInputRTL(isInputRTL);
};

export { applyChatGPTKatexStyle, applyChatGPTInputRTL };
