export type * from './types.js';

// Legacy storage (kept for backward compatibility during migration)
export * from './impl/rtl-position-storage.js';
export { chatRTLStorage } from './impl/chat-rtl-storage.js';
export type { ChatRTLSettings, ChatRTLStorageState, ChatRTLStorageType } from './impl/chat-rtl-storage.js';

// New platform-specific storages
export { claudeChatStorage } from './providers/claude-storage.js';
export type { ClaudeSettings, ClaudeStorageState, ClaudeStorageType } from './providers/claude-storage.js';

export { chatgptChatStorage } from './providers/chatgpt-storage.js';
export type { ChatGPTSettings, ChatGPTStorageState, ChatGPTStorageType } from './providers/chatgpt-storage.js';

// Migration utilities
export { migrateStorage, isMigrationComplete, resetMigration } from './migrations/storage-migration.js';
