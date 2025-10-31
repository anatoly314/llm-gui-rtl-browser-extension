import { getCurrentChatId } from './chat-utils.js';

/**
 * Finds the side panel content element with single class 'h-full'
 */
const findSidePanelContent = (): HTMLElement | null => {
  const anchor = document.querySelector('.cursor-col-resize.max-md\\:hidden');
  if (!anchor) return null;

  const sidePanel = anchor.nextElementSibling;
  if (!sidePanel) return null;

  // Find first element with single class 'h-full'
  const elements = Array.from(sidePanel.querySelectorAll('*')) as HTMLElement[];
  return elements.find(el => el.classList.length === 1 && el.classList[0] === 'h-full') || null;
};

/**
 * Finds the chat input element
 */
const findChatInput = (): HTMLElement | null => document.querySelector('[data-testid="chat-input"]');

/**
 * Applies or removes RTL direction to the side panel content
 */
export const applyRTL = (enable: boolean): void => {
  const sidePanelContent = findSidePanelContent();
  if (!sidePanelContent) {
    console.warn('[RTL Manager] Side panel content not found');
    return;
  }

  if (enable) {
    sidePanelContent.style.direction = 'rtl';
    console.log('[RTL Manager] Side panel RTL applied');
  } else {
    sidePanelContent.style.direction = 'ltr';
    console.log('[RTL Manager] Side panel RTL removed');
  }
};

/**
 * Applies or removes RTL direction to the chat input
 */
export const applyChatInputRTL = (enable: boolean): void => {
  const chatInput = findChatInput();
  if (!chatInput) {
    console.warn('[RTL Manager] Chat input not found');
    return;
  }

  if (enable) {
    chatInput.style.direction = 'rtl';
    console.log('[RTL Manager] Chat input RTL applied');
  } else {
    chatInput.style.direction = 'ltr';
    console.log('[RTL Manager] Chat input RTL removed');
  }
};

/**
 * Gets the current side panel RTL state from storage for the current chat
 */
export const getCurrentRTLState = async (): Promise<boolean> => {
  const chatId = getCurrentChatId();
  if (!chatId) return false;

  try {
    const { chatRTLStorage } = await import('@extension/storage');
    const settings = await chatRTLStorage.getChatSettings(chatId);
    return settings.isRTL;
  } catch (error) {
    console.error('[RTL Manager] Error getting side panel RTL state:', error);
    return false;
  }
};

/**
 * Gets the current chat input RTL state from storage for the current chat
 */
export const getCurrentChatInputRTLState = async (): Promise<boolean> => {
  const chatId = getCurrentChatId();
  if (!chatId) return false;

  try {
    const { chatRTLStorage } = await import('@extension/storage');
    const settings = await chatRTLStorage.getChatSettings(chatId);
    return settings.isChatInputRTL;
  } catch (error) {
    console.error('[RTL Manager] Error getting chat input RTL state:', error);
    return false;
  }
};

/**
 * Toggles side panel RTL for the current chat and saves to storage
 */
export const toggleRTL = async (): Promise<boolean> => {
  const chatId = getCurrentChatId();
  if (!chatId) {
    console.warn('[RTL Manager] No chat ID found');
    return false;
  }

  try {
    const { chatRTLStorage } = await import('@extension/storage');
    const currentSettings = await chatRTLStorage.getChatSettings(chatId);
    const newRTLState = !currentSettings.isRTL;

    // Save to storage
    await chatRTLStorage.setChatSettings(chatId, {
      isRTL: newRTLState,
      direction: newRTLState ? 'rtl' : 'ltr',
    });

    // Apply immediately
    applyRTL(newRTLState);

    console.log(`[RTL Manager] Toggled side panel RTL for chat ${chatId}: ${newRTLState}`);
    return newRTLState;
  } catch (error) {
    console.error('[RTL Manager] Error toggling side panel RTL:', error);
    return false;
  }
};

/**
 * Toggles chat input RTL for the current chat and saves to storage
 */
export const toggleChatInputRTL = async (): Promise<boolean> => {
  const chatId = getCurrentChatId();
  if (!chatId) {
    console.warn('[RTL Manager] No chat ID found');
    return false;
  }

  try {
    const { chatRTLStorage } = await import('@extension/storage');
    const currentSettings = await chatRTLStorage.getChatSettings(chatId);
    const newRTLState = !currentSettings.isChatInputRTL;

    // Save to storage
    await chatRTLStorage.setChatSettings(chatId, {
      isChatInputRTL: newRTLState,
    });

    // Apply immediately
    applyChatInputRTL(newRTLState);

    console.log(`[RTL Manager] Toggled chat input RTL for chat ${chatId}: ${newRTLState}`);
    return newRTLState;
  } catch (error) {
    console.error('[RTL Manager] Error toggling chat input RTL:', error);
    return false;
  }
};

/**
 * Initializes RTL manager - applies saved state and watches for URL changes and DOM changes
 */
export const initRTLManager = (): (() => void) => {
  let currentChatId: string | null = null;
  let lastSidePanelElement: HTMLElement | null = null;
  let lastChatInputElement: HTMLElement | null = null;
  let lastUrl = location.href;

  // Apply RTL state for current chat (both side panel and chat input)
  const applyCurrentChatRTL = async () => {
    const chatId = getCurrentChatId();
    if (!chatId) return;

    // Check if chat changed
    const chatChanged = chatId !== currentChatId;
    if (chatChanged) {
      currentChatId = chatId;
    }

    // Handle side panel RTL
    const sidePanelContent = findSidePanelContent();
    if (sidePanelContent) {
      const elementChanged = sidePanelContent !== lastSidePanelElement;
      const isRTL = await getCurrentRTLState();
      const needsReapply = elementChanged || sidePanelContent.style.direction !== (isRTL ? 'rtl' : 'ltr');

      if (needsReapply) {
        lastSidePanelElement = sidePanelContent;
        applyRTL(isRTL);

        if (chatChanged) {
          console.log(`[RTL Manager] Applied side panel state for chat ${chatId}: RTL=${isRTL}`);
        } else if (elementChanged) {
          console.log(`[RTL Manager] Reapplied side panel RTL after DOM change: RTL=${isRTL}`);
        }
      }
    }

    // Handle chat input RTL
    const chatInput = findChatInput();
    if (chatInput) {
      const elementChanged = chatInput !== lastChatInputElement;
      const isChatInputRTL = await getCurrentChatInputRTLState();
      const needsReapply = elementChanged || chatInput.style.direction !== (isChatInputRTL ? 'rtl' : 'ltr');

      if (needsReapply) {
        lastChatInputElement = chatInput;
        applyChatInputRTL(isChatInputRTL);

        if (chatChanged) {
          console.log(`[RTL Manager] Applied chat input state for chat ${chatId}: RTL=${isChatInputRTL}`);
        } else if (elementChanged) {
          console.log(`[RTL Manager] Reapplied chat input RTL after DOM change: RTL=${isChatInputRTL}`);
        }
      }
    }
  };

  // Initial apply
  applyCurrentChatRTL();

  // Watch for URL changes and DOM changes
  const observer = new MutationObserver(() => {
    const currentUrl = location.href;

    // Always check if RTL needs to be reapplied (handles both URL changes and DOM recreation)
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      lastSidePanelElement = null; // Reset element tracking on navigation
      lastChatInputElement = null;
    }

    applyCurrentChatRTL();
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Return cleanup function
  return () => {
    observer.disconnect();
  };
};
