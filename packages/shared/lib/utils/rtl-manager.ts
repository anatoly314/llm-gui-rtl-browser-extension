import { getCurrentChatId } from './chat-utils.js';

/**
 * Detects if current site is Claude.ai
 */
const isClaude = (): boolean => {
  const hostname = window.location.hostname;
  return hostname === 'claude.ai';
};

/**
 * Detects if current site is ChatGPT
 */
const isChatGPT = (): boolean => {
  const hostname = window.location.hostname;
  return hostname === 'chatgpt.com' || hostname === 'chat.openai.com';
};

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
 * Finds the main content element by traversing up from chat input to sticky element,
 * then selecting its previous sibling (the first child with flex-1 class)
 */
const findMainContent = (): HTMLElement | null => {
  const chatInput = document.querySelector('[data-testid="chat-input"]');
  if (!chatInput) return null;

  // Traverse up to find element with sticky class
  let current: Element | null = chatInput.parentElement;
  let depth = 0;

  while (current && depth < 20) {
    depth++;
    const classes = Array.from(current.classList);

    if (classes.some(c => c.includes('sticky'))) {
      // Found sticky element (second child), get its previous sibling (first child - main content)
      const previousSibling = current.previousElementSibling;
      if (previousSibling) {
        return previousSibling as HTMLElement;
      }

      console.debug('[RTL Manager] Sticky element found but no previous sibling');
      return null;
    }

    current = current.parentElement;
  }

  console.debug('[RTL Manager] No element with sticky class found');
  return null;
};

/**
 * Applies or removes RTL direction to the side panel content
 */
const applyRTL = (enable: boolean): void => {
  // Only apply on Claude.ai
  if (!isClaude()) return;

  const sidePanelContent = findSidePanelContent();
  if (!sidePanelContent) {
    console.debug('[RTL Manager] Side panel content not found');
    return;
  }

  if (enable) {
    sidePanelContent.style.direction = 'rtl';
  } else {
    sidePanelContent.style.direction = 'ltr';
  }
};

/**
 * Applies or removes RTL direction to the chat input
 */
const applyChatInputRTL = (enable: boolean): void => {
  // Only apply on Claude.ai
  if (!isClaude()) return;

  const chatInput = findChatInput();
  if (!chatInput) {
    console.debug('[RTL Manager] Chat input not found');
    return;
  }

  if (enable) {
    chatInput.style.direction = 'rtl';
  } else {
    chatInput.style.direction = 'ltr';
  }
};

/**
 * Injects global CSS to force KaTeX elements to always be LTR (Claude.ai version)
 */
const injectKatexLTRStyle = (): void => {
  const styleId = 'katex-ltr-override';

  // Check if style already exists
  if (document.getElementById(styleId)) {
    return;
  }

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    .katex,
    .katex * {
      direction: ltr !important;
      unicode-bidi: embed !important;
    }
  `;
  document.head.appendChild(style);
};

/**
 * Applies or removes special KaTeX styling for ChatGPT
 */
const applyChatGPTKatexStyle = (enable: boolean): void => {
  // Only apply on ChatGPT
  if (!isChatGPT()) return;

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
 * Applies or removes RTL direction to the main content
 */
const applyMainContentRTL = (enable: boolean): void => {
  // Only apply on Claude.ai
  if (!isClaude()) return;

  const mainContent = findMainContent();
  if (!mainContent) {
    console.debug('[RTL Manager] Main content not found');
    return;
  }

  if (enable) {
    mainContent.style.direction = 'rtl';
  } else {
    mainContent.style.direction = 'ltr';
  }
};

/**
 * Gets the effective chat ID - returns "new" for /new or /project/* pages, or actual UUID in chat
 */
const getEffectiveChatId = (): string => {
  const chatId = getCurrentChatId();
  if (chatId) return chatId;
  // If on /new page or /project/* page, use special "new" key
  const path = window.location.pathname;
  if (path === '/new' || path.startsWith('/project/')) return 'new';
  return '';
};

/**
 * Gets the current side panel RTL state from storage for the current chat
 */
export const getCurrentRTLState = async (): Promise<boolean> => {
  const chatId = getEffectiveChatId();
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
  const chatId = getEffectiveChatId();
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
 * Gets the current main content RTL state from storage for the current chat
 */
export const getCurrentMainContentRTLState = async (): Promise<boolean> => {
  const chatId = getEffectiveChatId();
  if (!chatId) return false;

  try {
    const { chatRTLStorage } = await import('@extension/storage');
    const settings = await chatRTLStorage.getChatSettings(chatId);
    return settings.isMainContentRTL;
  } catch (error) {
    console.error('[RTL Manager] Error getting main content RTL state:', error);
    return false;
  }
};

/**
 * Gets the current ChatGPT KaTeX RTL state from storage for the current chat
 */
export const getCurrentChatGPTKatexRTLState = async (): Promise<boolean> => {
  const chatId = getEffectiveChatId();
  if (!chatId) return false;

  try {
    const { chatRTLStorage } = await import('@extension/storage');
    const settings = await chatRTLStorage.getChatSettings(chatId);
    return settings.isChatGPTKatexRTL;
  } catch (error) {
    console.error('[RTL Manager] Error getting ChatGPT KaTeX RTL state:', error);
    return false;
  }
};

/**
 * Clears the "new" temp key settings to ensure fresh start on /new page
 */
export const clearNewChatSettings = async (): Promise<void> => {
  try {
    const { chatRTLStorage } = await import('@extension/storage');
    await chatRTLStorage.resetChatSettings('new');
  } catch (error) {
    console.error('[RTL Manager] Error clearing new chat settings:', error);
  }
};

/**
 * Transfers settings from "new" temp key to actual chat UUID, then clears the temp key
 */
export const transferNewChatSettings = async (newChatId: string): Promise<void> => {
  if (!newChatId || newChatId === 'new') return;

  try {
    const { chatRTLStorage } = await import('@extension/storage');
    const tempSettings = await chatRTLStorage.getChatSettings('new');

    // Only transfer if temp settings have non-default values
    if (tempSettings.isRTL || tempSettings.isChatInputRTL || tempSettings.isMainContentRTL) {
      await chatRTLStorage.setChatSettings(newChatId, tempSettings);

      // Clear the "new" temp key so next time /new starts fresh
      await chatRTLStorage.resetChatSettings('new');
    }
  } catch (error) {
    console.error('[RTL Manager] Error transferring settings:', error);
  }
};

/**
 * Toggles side panel RTL for the current chat and saves to storage
 */
export const toggleRTL = async (): Promise<boolean> => {
  const chatId = getEffectiveChatId();
  if (!chatId) {
    console.debug('[RTL Manager] No valid context for RTL toggle');
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
  const chatId = getEffectiveChatId();
  if (!chatId) {
    console.debug('[RTL Manager] No valid context for chat input RTL toggle');
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

    return newRTLState;
  } catch (error) {
    console.error('[RTL Manager] Error toggling chat input RTL:', error);
    return false;
  }
};

/**
 * Toggles main content RTL for the current chat and saves to storage
 */
export const toggleMainContentRTL = async (): Promise<boolean> => {
  const chatId = getEffectiveChatId();
  if (!chatId) {
    console.debug('[RTL Manager] No valid context for main content RTL toggle');
    return false;
  }

  try {
    const { chatRTLStorage } = await import('@extension/storage');
    const currentSettings = await chatRTLStorage.getChatSettings(chatId);
    const newRTLState = !currentSettings.isMainContentRTL;

    // Save to storage
    await chatRTLStorage.setChatSettings(chatId, {
      isMainContentRTL: newRTLState,
    });

    // Apply immediately
    applyMainContentRTL(newRTLState);

    return newRTLState;
  } catch (error) {
    console.error('[RTL Manager] Error toggling main content RTL:', error);
    return false;
  }
};

/**
 * Toggles ChatGPT KaTeX RTL styling for the current chat and saves to storage
 */
export const toggleChatGPTKatexRTL = async (): Promise<boolean> => {
  const chatId = getEffectiveChatId();
  if (!chatId) {
    console.debug('[RTL Manager] No valid context for ChatGPT KaTeX RTL toggle');
    return false;
  }

  try {
    const { chatRTLStorage } = await import('@extension/storage');
    const currentSettings = await chatRTLStorage.getChatSettings(chatId);
    const newRTLState = !currentSettings.isChatGPTKatexRTL;

    // Save to storage
    await chatRTLStorage.setChatSettings(chatId, {
      isChatGPTKatexRTL: newRTLState,
    });

    // Apply immediately
    applyChatGPTKatexStyle(newRTLState);

    return newRTLState;
  } catch (error) {
    console.error('[RTL Manager] Error toggling ChatGPT KaTeX RTL:', error);
    return false;
  }
};

/**
 * Initializes RTL manager - applies saved state and watches for URL changes and DOM changes
 */
export const initRTLManager = (): (() => void) => {
  // ChatGPT-specific initialization
  if (isChatGPT()) {
    // Apply saved KaTeX fix state on load
    const applyChatGPTKatexState = async () => {
      const chatId = getCurrentChatId();
      if (!chatId) return;

      const isKatexRTL = await getCurrentChatGPTKatexRTLState();
      applyChatGPTKatexStyle(isKatexRTL);
    };

    // Initial apply
    applyChatGPTKatexState();

    // Watch for URL changes to reapply on navigation
    let lastUrl = location.href;
    const observer = new MutationObserver(() => {
      const currentUrl = location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        applyChatGPTKatexState();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }

  // Only initialize Claude.ai logic on Claude.ai
  if (!isClaude()) {
    return () => {}; // Return no-op cleanup function
  }

  let currentChatId: string | null = null;
  let lastSidePanelElement: HTMLElement | null = null;
  let lastChatInputElement: HTMLElement | null = null;
  let lastMainContentElement: HTMLElement | null = null;
  let lastUrl = location.href;

  // Apply RTL state for current chat (side panel, chat input, and main content)
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
      }
    }

    // Handle main content RTL
    const mainContent = findMainContent();
    if (mainContent) {
      const elementChanged = mainContent !== lastMainContentElement;
      const isMainContentRTL = await getCurrentMainContentRTLState();
      const needsReapply = elementChanged || mainContent.style.direction !== (isMainContentRTL ? 'rtl' : 'ltr');

      if (needsReapply) {
        lastMainContentElement = mainContent;
        applyMainContentRTL(isMainContentRTL);
      }
    }
  };

  // Inject global CSS to force katex to always be LTR
  injectKatexLTRStyle();

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
      lastMainContentElement = null;
    }

    applyCurrentChatRTL();
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Return cleanup function
  return () => {
    observer.disconnect();
  };
};

export { applyRTL, applyChatInputRTL, applyMainContentRTL, applyChatGPTKatexStyle };
