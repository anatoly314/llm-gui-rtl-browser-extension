/**
 * RTL Initialization
 * Orchestrates provider-specific RTL manager initialization and settings transfer
 */

import { initChatGPTRTLManager } from '../providers/chatgpt/chatgpt-rtl-manager.js';
import { initClaudeRTLManager } from '../providers/claude/claude-rtl-manager.js';
import { getCurrentProvider, isClaude, isChatGPT } from '../providers/provider-detector.js';

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
  console.debug('[RTL Init] Unknown provider, no RTL manager initialized');
  return () => {};
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
    console.error('[RTL Init] Error clearing new chat settings:', error);
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
        console.debug('[RTL Init] Transferring Claude settings from "new" to', newChatId);
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
        console.debug('[RTL Init] Transferring ChatGPT settings from "new" to', newChatId);
        await chatgptChatStorage.setChatSettings(newChatId, tempChatGPTSettings);

        // Clear the "new" temp key so next time home page starts fresh
        await chatgptChatStorage.resetChatSettings('new');
      }
    }
  } catch (error) {
    console.error('[RTL Init] Error transferring settings:', error);
  }
};
