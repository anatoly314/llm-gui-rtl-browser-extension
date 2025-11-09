/**
 * Provider Detection
 * Determines which AI provider is currently active
 */

export type AIProvider = 'claude' | 'chatgpt' | 'notebooklm' | 'unknown';

/**
 * Detects if current site is Claude.ai
 */
export const isClaude = (): boolean => {
  const hostname = window.location.hostname;
  return hostname === 'claude.ai';
};

/**
 * Detects if current site is ChatGPT
 */
export const isChatGPT = (): boolean => {
  const hostname = window.location.hostname;
  return hostname === 'chatgpt.com' || hostname === 'chat.openai.com';
};

/**
 * Detects if current site is NotebookLM
 */
export const isNotebookLM = (): boolean => {
  const hostname = window.location.hostname;
  return hostname === 'notebooklm.google.com';
};

/**
 * Gets the current active AI provider
 */
export const getCurrentProvider = (): AIProvider => {
  if (isClaude()) return 'claude';
  if (isChatGPT()) return 'chatgpt';
  if (isNotebookLM()) return 'notebooklm';
  return 'unknown';
};
