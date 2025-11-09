/**
 * Extracts the chat UUID from Claude.ai, ChatGPT, or NotebookLM URL
 * Claude.ai example: https://claude.ai/chat/abc123-def456-ghi789
 * ChatGPT example: https://chatgpt.com/c/abc123-def456-ghi789
 * NotebookLM example: https://notebooklm.google.com/notebook/abc123-def456-ghi789
 * Returns: 'abc123-def456-ghi789' or null
 */
export const getCurrentChatId = (): string | null => {
  const url = window.location.href;
  const hostname = window.location.hostname;

  // ChatGPT pattern: /c/{id}
  if (hostname === 'chatgpt.com' || hostname === 'chat.openai.com') {
    const chatMatch = url.match(/\/c\/([a-f0-9-]+)/i);
    return chatMatch ? chatMatch[1] : null;
  }

  // NotebookLM pattern: /notebook/{id}
  if (hostname === 'notebooklm.google.com') {
    const chatMatch = url.match(/\/notebook\/([a-f0-9-]+)/i);
    return chatMatch ? chatMatch[1] : null;
  }

  // Claude.ai pattern: /chat/{id}
  const chatMatch = url.match(/\/chat\/([a-f0-9-]+)/i);
  return chatMatch ? chatMatch[1] : null;
};

/**
 * Checks if the current page is a chat page
 */
export const isChatPage = (): boolean => {
  const pathname = window.location.pathname;
  const hostname = window.location.hostname;

  // ChatGPT check
  if (hostname === 'chatgpt.com' || hostname === 'chat.openai.com') {
    return pathname.startsWith('/c/');
  }

  // NotebookLM check
  if (hostname === 'notebooklm.google.com') {
    return pathname.startsWith('/notebook/');
  }

  // Claude.ai check
  return pathname.startsWith('/chat/');
};
