/**
 * Extracts the chat UUID from Claude.ai URL
 * Example URL: https://claude.ai/chat/abc123-def456-ghi789
 * Returns: 'abc123-def456-ghi789'
 */
export const getCurrentChatId = (): string | null => {
  const url = window.location.href;
  const chatMatch = url.match(/\/chat\/([a-f0-9-]+)/i);
  return chatMatch ? chatMatch[1] : null;
};

/**
 * Checks if the current page is a chat page
 */
export const isChatPage = (): boolean => window.location.pathname.startsWith('/chat/');
