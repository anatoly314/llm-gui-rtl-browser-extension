/**
 * Provider System Exports
 * Central export point for all provider modules
 */

// Provider detection
export { getCurrentProvider, isClaude, isChatGPT, type AIProvider } from './provider-detector.js';

// Claude.ai provider
export {
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
} from './claude/claude-rtl-manager.js';

// ChatGPT provider
export {
  getCurrentChatGPTKatexRTLState,
  getCurrentChatGPTInputRTLState,
  toggleChatGPTKatexRTL,
  toggleChatGPTInputRTL,
  initChatGPTRTLManager,
  reapplyChatGPTStyles,
  applyChatGPTKatexStyle,
  applyChatGPTInputRTL,
} from './chatgpt/chatgpt-rtl-manager.js';
