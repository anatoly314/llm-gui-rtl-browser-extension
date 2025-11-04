/**
 * RTL Manager - Main Orchestrator
 * Delegates to appropriate provider-specific RTL manager based on current site
 */

import { getCurrentChatId } from './chat-utils.js';
import {
  getCurrentChatGPTKatexRTLState as getChatGPTKatexRTLState,
  getCurrentChatGPTInputRTLState as getChatGPTInputRTLState,
  toggleChatGPTKatexRTL as toggleChatGPTKatex,
  toggleChatGPTInputRTL as toggleChatGPTInput,
  initChatGPTRTLManager,
  reapplyChatGPTStyles as reapplyChatGPT,
  applyChatGPTKatexStyle as applyChatGPTKatex,
  applyChatGPTInputRTL as applyChatGPTInput,
} from '../providers/chatgpt/chatgpt-rtl-manager.js';
import {
  getCurrentRTLState as getClaudeRTLState,
  getCurrentChatInputRTLState as getClaudeChatInputRTLState,
  getCurrentMainContentRTLState as getClaudeMainContentRTLState,
  toggleRTL as toggleClaudeRTL,
  toggleChatInputRTL as toggleClaudeChatInputRTL,
  toggleMainContentRTL as toggleClaudeMainContentRTL,
  initClaudeRTLManager,
  applyRTL as applyClaudeRTL,
  applyChatInputRTL as applyClaudeChatInputRTL,
  applyMainContentRTL as applyClaudeMainContentRTL,
} from '../providers/claude/claude-rtl-manager.js';
import { getCurrentProvider, isClaude, isChatGPT } from '../providers/provider-detector.js';

/**
 * Gets the effective chat ID - returns "new" for /new, /project/* pages, or ChatGPT home, or actual UUID in chat
 */
export const getEffectiveChatId = (): string => {
  const chatId = getCurrentChatId();
  if (chatId) return chatId;

  const path = window.location.pathname;
  const hostname = window.location.hostname;

  // If on Claude.ai /new page or /project/* page, use special "new" key
  if (path === '/new' || path.startsWith('/project/')) return 'new';

  // If on ChatGPT home page, use special "new" key
  if ((hostname === 'chatgpt.com' || hostname === 'chat.openai.com') && path === '/') return 'new';

  return '';
};

/**
 * Gets the current side panel RTL state from storage for the current chat (Claude.ai only)
 */
export const getCurrentRTLState = async (): Promise<boolean> => {
  if (!isClaude()) return false;
  return getClaudeRTLState();
};

/**
 * Gets the current chat input RTL state from storage for the current chat (Claude.ai only)
 */
export const getCurrentChatInputRTLState = async (): Promise<boolean> => {
  if (!isClaude()) return false;
  return getClaudeChatInputRTLState();
};

/**
 * Gets the current main content RTL state from storage for the current chat (Claude.ai only)
 */
export const getCurrentMainContentRTLState = async (): Promise<boolean> => {
  if (!isClaude()) return false;
  return getClaudeMainContentRTLState();
};

/**
 * Gets the current ChatGPT KaTeX RTL state from storage for the current chat (ChatGPT only)
 */
export const getCurrentChatGPTKatexRTLState = async (): Promise<boolean> => {
  if (!isChatGPT()) return false;
  return getChatGPTKatexRTLState();
};

/**
 * Gets the current ChatGPT Input RTL state from storage for the current chat (ChatGPT only)
 */
export const getCurrentChatGPTInputRTLState = async (): Promise<boolean> => {
  if (!isChatGPT()) return false;
  return getChatGPTInputRTLState();
};

/**
 * Clears the "new" temp key settings to ensure fresh start on /new page
 */
export const clearNewChatSettings = async (): Promise<void> => {
  try {
    // Clear from both storages to be safe
    const { claudeChatStorage, chatgptChatStorage } = await import('@extension/storage');
    await claudeChatStorage.resetChatSettings('new');
    await chatgptChatStorage.resetChatSettings('new');
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
    const { claudeChatStorage, chatgptChatStorage } = await import('@extension/storage');

    // Transfer Claude settings if on Claude.ai
    if (isClaude()) {
      const tempClaudeSettings = await claudeChatStorage.getChatSettings('new');

      // Only transfer if temp settings have non-default values
      if (tempClaudeSettings.isRTL || tempClaudeSettings.isChatInputRTL || tempClaudeSettings.isMainContentRTL) {
        console.debug('[RTL Manager] Transferring Claude settings from "new" to', newChatId);
        await claudeChatStorage.setChatSettings(newChatId, tempClaudeSettings);

        // Clear the "new" temp key so next time /new starts fresh
        await claudeChatStorage.resetChatSettings('new');
      }
    }

    // Transfer ChatGPT settings if on ChatGPT
    if (isChatGPT()) {
      const tempChatGPTSettings = await chatgptChatStorage.getChatSettings('new');

      // Only transfer if temp settings have non-default values
      if (tempChatGPTSettings.isChatGPTKatexRTL || tempChatGPTSettings.isChatGPTInputRTL) {
        console.debug('[RTL Manager] Transferring ChatGPT settings from "new" to', newChatId);
        await chatgptChatStorage.setChatSettings(newChatId, tempChatGPTSettings);

        // Clear the "new" temp key so next time home page starts fresh
        await chatgptChatStorage.resetChatSettings('new');
      }
    }
  } catch (error) {
    console.error('[RTL Manager] Error transferring settings:', error);
  }
};

/**
 * Toggles side panel RTL for the current chat and saves to storage (Claude.ai only)
 */
export const toggleRTL = async (): Promise<boolean> => {
  if (!isClaude()) {
    console.debug('[RTL Manager] toggleRTL only works on Claude.ai');
    return false;
  }
  return toggleClaudeRTL();
};

/**
 * Toggles chat input RTL for the current chat and saves to storage (Claude.ai only)
 */
export const toggleChatInputRTL = async (): Promise<boolean> => {
  if (!isClaude()) {
    console.debug('[RTL Manager] toggleChatInputRTL only works on Claude.ai');
    return false;
  }
  return toggleClaudeChatInputRTL();
};

/**
 * Toggles main content RTL for the current chat and saves to storage (Claude.ai only)
 */
export const toggleMainContentRTL = async (): Promise<boolean> => {
  if (!isClaude()) {
    console.debug('[RTL Manager] toggleMainContentRTL only works on Claude.ai');
    return false;
  }
  return toggleClaudeMainContentRTL();
};

/**
 * Toggles ChatGPT KaTeX RTL styling for the current chat and saves to storage (ChatGPT only)
 */
export const toggleChatGPTKatexRTL = async (): Promise<boolean> => {
  if (!isChatGPT()) {
    console.debug('[RTL Manager] toggleChatGPTKatexRTL only works on ChatGPT');
    return false;
  }
  return toggleChatGPTKatex();
};

/**
 * Toggles ChatGPT Input RTL direction for the current chat and saves to storage (ChatGPT only)
 */
export const toggleChatGPTInputRTL = async (): Promise<boolean> => {
  if (!isChatGPT()) {
    console.debug('[RTL Manager] toggleChatGPTInputRTL only works on ChatGPT');
    return false;
  }
  return toggleChatGPTInput();
};

/**
 * Initializes RTL manager - delegates to provider-specific initialization
 */
export const initRTLManager = (): (() => void) => {
  const provider = getCurrentProvider();

  if (provider === 'claude') {
    return initClaudeRTLManager();
  }

  if (provider === 'chatgpt') {
    return initChatGPTRTLManager();
  }

  // Unknown provider - return no-op cleanup function
  console.debug('[RTL Manager] Unknown provider, no RTL manager initialized');
  return () => {};
};

/**
 * Reapplies all ChatGPT styles for the current chat (useful after settings transfer)
 */
export const reapplyChatGPTStyles = async (): Promise<void> => {
  if (!isChatGPT()) return;
  return reapplyChatGPT();
};

// Re-export apply functions for backward compatibility
export const applyRTL = (enable: boolean): void => {
  if (isClaude()) {
    applyClaudeRTL(enable);
  }
};

export const applyChatInputRTL = (enable: boolean): void => {
  if (isClaude()) {
    applyClaudeChatInputRTL(enable);
  }
};

export const applyMainContentRTL = (enable: boolean): void => {
  if (isClaude()) {
    applyClaudeMainContentRTL(enable);
  }
};

export const applyChatGPTKatexStyle = (enable: boolean): void => {
  if (isChatGPT()) {
    applyChatGPTKatex(enable);
  }
};

export const applyChatGPTInputRTL = (enable: boolean): void => {
  if (isChatGPT()) {
    applyChatGPTInput(enable);
  }
};
