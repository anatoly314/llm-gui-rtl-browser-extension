/**
 * Claude.ai RTL Manager
 * Handles all RTL functionality for Claude.ai platform
 */

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

      console.debug('[Claude RTL Manager] Sticky element found but no previous sibling');
      return null;
    }

    current = current.parentElement;
  }

  console.debug('[Claude RTL Manager] No element with sticky class found');
  return null;
};

/**
 * Applies or removes RTL direction to the side panel content
 */
const applyClaudeRTL = (enable: boolean): void => {
  const sidePanelContent = findSidePanelContent();
  if (!sidePanelContent) {
    console.debug('[Claude RTL Manager] Side panel content not found');
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
const applyClaudeChatInputRTL = (enable: boolean): void => {
  const chatInput = findChatInput();
  if (!chatInput) {
    console.debug('[Claude RTL Manager] Chat input not found');
    return;
  }

  if (enable) {
    chatInput.style.direction = 'rtl';
  } else {
    chatInput.style.direction = 'ltr';
  }
};

/**
 * Applies or removes RTL direction to the main content
 */
const applyClaudeMainContentRTL = (enable: boolean): void => {
  const mainContent = findMainContent();
  if (!mainContent) {
    console.debug('[Claude RTL Manager] Main content not found');
    return;
  }

  if (enable) {
    mainContent.style.direction = 'rtl';
  } else {
    mainContent.style.direction = 'ltr';
  }
};

/**
 * Injects global CSS to force KaTeX elements to always be LTR
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
 * Extracts the chat UUID from Claude.ai URL
 * Example: https://claude.ai/chat/abc123-def456-ghi789
 * Returns: 'abc123-def456-ghi789' or null
 */
const getCurrentChatId = (): string | null => {
  const url = window.location.href;
  const chatMatch = url.match(/\/chat\/([a-f0-9-]+)/i);
  return chatMatch ? chatMatch[1] : null;
};

/**
 * Gets the effective chat ID - returns "new" for /new, /project/* pages, or actual UUID in chat
 */
const getEffectiveChatId = (): string => {
  const chatId = getCurrentChatId();
  if (chatId) return chatId;

  const path = window.location.pathname;

  // If on /new page or /project/* page, use special "new" key
  if (path === '/new' || path.startsWith('/project/')) return 'new';

  return '';
};

/**
 * Gets the current side panel RTL state from storage for the current chat
 */
export const getCurrentClaudeRTLState = async (): Promise<boolean> => {
  const chatId = getEffectiveChatId();
  if (!chatId) return false;

  try {
    const { claudeChatStorage } = await import('@extension/storage');
    const settings = await claudeChatStorage.getChatSettings(chatId);
    return settings.isRTL;
  } catch (error) {
    console.error('[Claude RTL Manager] Error getting side panel RTL state:', error);
    return false;
  }
};

/**
 * Gets the current chat input RTL state from storage for the current chat
 */
export const getCurrentClaudeChatInputRTLState = async (): Promise<boolean> => {
  const chatId = getEffectiveChatId();
  if (!chatId) return false;

  try {
    const { claudeChatStorage } = await import('@extension/storage');
    const settings = await claudeChatStorage.getChatSettings(chatId);
    return settings.isChatInputRTL;
  } catch (error) {
    console.error('[Claude RTL Manager] Error getting chat input RTL state:', error);
    return false;
  }
};

/**
 * Gets the current main content RTL state from storage for the current chat
 */
export const getCurrentClaudeMainContentRTLState = async (): Promise<boolean> => {
  const chatId = getEffectiveChatId();
  if (!chatId) return false;

  try {
    const { claudeChatStorage } = await import('@extension/storage');
    const settings = await claudeChatStorage.getChatSettings(chatId);
    return settings.isMainContentRTL;
  } catch (error) {
    console.error('[Claude RTL Manager] Error getting main content RTL state:', error);
    return false;
  }
};

/**
 * Toggles side panel RTL for the current chat and saves to storage
 */
export const toggleClaudeRTL = async (): Promise<boolean> => {
  const chatId = getEffectiveChatId();
  if (!chatId) {
    console.debug('[Claude RTL Manager] No valid context for RTL toggle');
    return false;
  }

  try {
    const { claudeChatStorage } = await import('@extension/storage');
    const currentSettings = await claudeChatStorage.getChatSettings(chatId);
    const newRTLState = !currentSettings.isRTL;

    // Save to storage
    await claudeChatStorage.setChatSettings(chatId, {
      isRTL: newRTLState,
      direction: newRTLState ? 'rtl' : 'ltr',
    });

    // Apply immediately
    applyClaudeRTL(newRTLState);

    return newRTLState;
  } catch (error) {
    console.error('[Claude RTL Manager] Error toggling side panel RTL:', error);
    return false;
  }
};

/**
 * Toggles chat input RTL for the current chat and saves to storage
 */
export const toggleClaudeChatInputRTL = async (): Promise<boolean> => {
  const chatId = getEffectiveChatId();
  if (!chatId) {
    console.debug('[Claude RTL Manager] No valid context for chat input RTL toggle');
    return false;
  }

  try {
    const { claudeChatStorage } = await import('@extension/storage');
    const currentSettings = await claudeChatStorage.getChatSettings(chatId);
    const newRTLState = !currentSettings.isChatInputRTL;

    // Save to storage
    await claudeChatStorage.setChatSettings(chatId, {
      isChatInputRTL: newRTLState,
    });

    // Apply immediately
    applyClaudeChatInputRTL(newRTLState);

    return newRTLState;
  } catch (error) {
    console.error('[Claude RTL Manager] Error toggling chat input RTL:', error);
    return false;
  }
};

/**
 * Toggles main content RTL for the current chat and saves to storage
 */
export const toggleClaudeMainContentRTL = async (): Promise<boolean> => {
  const chatId = getEffectiveChatId();
  if (!chatId) {
    console.debug('[Claude RTL Manager] No valid context for main content RTL toggle');
    return false;
  }

  try {
    const { claudeChatStorage } = await import('@extension/storage');
    const currentSettings = await claudeChatStorage.getChatSettings(chatId);
    const newRTLState = !currentSettings.isMainContentRTL;

    // Save to storage
    await claudeChatStorage.setChatSettings(chatId, {
      isMainContentRTL: newRTLState,
    });

    // Apply immediately
    applyClaudeMainContentRTL(newRTLState);

    return newRTLState;
  } catch (error) {
    console.error('[Claude RTL Manager] Error toggling main content RTL:', error);
    return false;
  }
};

/**
 * Initializes Claude.ai RTL manager - applies saved state and watches for URL changes and DOM changes
 */
export const initClaudeRTLManager = (): (() => void) => {
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
      const isRTL = await getCurrentClaudeRTLState();
      const needsReapply = elementChanged || sidePanelContent.style.direction !== (isRTL ? 'rtl' : 'ltr');

      if (needsReapply) {
        lastSidePanelElement = sidePanelContent;
        applyClaudeRTL(isRTL);
      }
    }

    // Handle chat input RTL
    const chatInput = findChatInput();
    if (chatInput) {
      const elementChanged = chatInput !== lastChatInputElement;
      const isChatInputRTL = await getCurrentClaudeChatInputRTLState();
      const needsReapply = elementChanged || chatInput.style.direction !== (isChatInputRTL ? 'rtl' : 'ltr');

      if (needsReapply) {
        lastChatInputElement = chatInput;
        applyClaudeChatInputRTL(isChatInputRTL);
      }
    }

    // Handle main content RTL
    const mainContent = findMainContent();
    if (mainContent) {
      const elementChanged = mainContent !== lastMainContentElement;
      const isMainContentRTL = await getCurrentClaudeMainContentRTLState();
      const needsReapply = elementChanged || mainContent.style.direction !== (isMainContentRTL ? 'rtl' : 'ltr');

      if (needsReapply) {
        lastMainContentElement = mainContent;
        applyClaudeMainContentRTL(isMainContentRTL);
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

export { applyClaudeRTL, applyClaudeChatInputRTL, applyClaudeMainContentRTL };
