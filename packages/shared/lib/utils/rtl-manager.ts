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
    console.log('[RTL Manager] RTL applied');
  } else {
    sidePanelContent.style.direction = 'ltr';
    console.log('[RTL Manager] RTL removed');
  }
};

/**
 * Gets the current RTL state from storage for the current chat
 */
export const getCurrentRTLState = async (): Promise<boolean> => {
  const chatId = getCurrentChatId();
  if (!chatId) return false;

  try {
    const { chatRTLStorage } = await import('@extension/storage');
    const settings = await chatRTLStorage.getChatSettings(chatId);
    return settings.isRTL;
  } catch (error) {
    console.error('[RTL Manager] Error getting RTL state:', error);
    return false;
  }
};

/**
 * Toggles RTL for the current chat and saves to storage
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

    console.log(`[RTL Manager] Toggled RTL for chat ${chatId}: ${newRTLState}`);
    return newRTLState;
  } catch (error) {
    console.error('[RTL Manager] Error toggling RTL:', error);
    return false;
  }
};

/**
 * Initializes RTL manager - applies saved state and watches for URL changes
 */
export const initRTLManager = (): (() => void) => {
  let currentChatId: string | null = null;

  // Apply RTL state for current chat
  const applyCurrentChatRTL = async () => {
    const chatId = getCurrentChatId();
    if (!chatId || chatId === currentChatId) return;

    currentChatId = chatId;
    const isRTL = await getCurrentRTLState();
    applyRTL(isRTL);
    console.log(`[RTL Manager] Applied state for chat ${chatId}: RTL=${isRTL}`);
  };

  // Initial apply
  applyCurrentChatRTL();

  // Watch for URL changes (when switching between chats)
  let lastUrl = location.href;
  const urlObserver = new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      applyCurrentChatRTL();
    }
  });

  urlObserver.observe(document.body, { childList: true, subtree: true });

  // Return cleanup function
  return () => {
    urlObserver.disconnect();
  };
};
