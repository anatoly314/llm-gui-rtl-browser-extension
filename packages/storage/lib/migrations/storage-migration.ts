/**
 * Storage Migration Utility
 * One-time migration from unified chat-rtl-storage to platform-specific storages
 */

import { createStorage, StorageEnum } from '../base/index.js';
import { chatgptChatStorage } from '../providers/chatgpt-storage.js';
import { claudeChatStorage } from '../providers/claude-storage.js';
import type { BaseStorageType } from '../base/index.js';

interface MigrationState {
  migrated: boolean;
  migratedAt?: string;
}

type MigrationStorageType = BaseStorageType<MigrationState>;

// Storage to track migration status
const migrationStorage: MigrationStorageType = createStorage<MigrationState>(
  'storage_migration_v1',
  {
    migrated: false,
  },
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: false,
  },
);

// Old storage key for reading legacy data
const OLD_STORAGE_KEY = 'chat-rtl-storage-key';

interface OldChatRTLSettings {
  isRTL: boolean;
  isChatInputRTL: boolean;
  isMainContentRTL: boolean;
  direction: 'ltr' | 'rtl';
  textAlign: 'left' | 'right' | 'center';
  isChatGPTKatexRTL: boolean;
  isChatGPTInputRTL: boolean;
}

interface OldChatRTLStorageState {
  chats: Record<string, OldChatRTLSettings>;
}

/**
 * Migrates data from old unified storage to new platform-specific storages
 */
export const migrateStorage = async (): Promise<void> => {
  try {
    // Check if migration already completed
    const migrationState = await migrationStorage.get();
    if (migrationState.migrated) {
      console.debug('[Storage Migration] Already migrated, skipping');
      return;
    }

    console.log('[Storage Migration] Starting migration from unified to platform-specific storage...');

    // Read old storage data
    const oldData = await chrome.storage.local.get(OLD_STORAGE_KEY);
    const oldState = oldData[OLD_STORAGE_KEY] as OldChatRTLStorageState | undefined;

    if (!oldState || !oldState.chats || Object.keys(oldState.chats).length === 0) {
      console.log('[Storage Migration] No old data found, marking as migrated');
      await migrationStorage.set({
        migrated: true,
        migratedAt: new Date().toISOString(),
      });
      return;
    }

    console.log(`[Storage Migration] Found ${Object.keys(oldState.chats).length} chat settings to migrate`);

    // Migrate Claude settings
    const claudeChats: Record<
      string,
      {
        isRTL: boolean;
        isChatInputRTL: boolean;
        isMainContentRTL: boolean;
        direction: 'ltr' | 'rtl';
        textAlign: 'left' | 'right' | 'center';
      }
    > = {};
    let claudeCount = 0;

    // Migrate ChatGPT settings
    const chatgptChats: Record<string, { isChatGPTKatexRTL: boolean; isChatGPTInputRTL: boolean }> = {};
    let chatgptCount = 0;

    for (const [chatId, settings] of Object.entries(oldState.chats)) {
      // Extract Claude-specific fields
      if (settings.isRTL || settings.isChatInputRTL || settings.isMainContentRTL) {
        claudeChats[chatId] = {
          isRTL: settings.isRTL || false,
          isChatInputRTL: settings.isChatInputRTL || false,
          isMainContentRTL: settings.isMainContentRTL || false,
          direction: settings.direction || 'ltr',
          textAlign: settings.textAlign || 'left',
        };
        claudeCount++;
      }

      // Extract ChatGPT-specific fields
      if (settings.isChatGPTKatexRTL || settings.isChatGPTInputRTL) {
        chatgptChats[chatId] = {
          isChatGPTKatexRTL: settings.isChatGPTKatexRTL || false,
          isChatGPTInputRTL: settings.isChatGPTInputRTL || false,
        };
        chatgptCount++;
      }
    }

    // Write to new storages
    if (claudeCount > 0) {
      await claudeChatStorage.set({ chats: claudeChats });
      console.log(`[Storage Migration] Migrated ${claudeCount} Claude chat settings`);
    }

    if (chatgptCount > 0) {
      await chatgptChatStorage.set({ chats: chatgptChats });
      console.log(`[Storage Migration] Migrated ${chatgptCount} ChatGPT chat settings`);
    }

    // Mark migration as complete
    await migrationStorage.set({
      migrated: true,
      migratedAt: new Date().toISOString(),
    });

    console.log('[Storage Migration] Migration completed successfully');

    // Optional: Remove old storage key to clean up
    // Commented out to allow rollback if needed
    // await chrome.storage.local.remove(OLD_STORAGE_KEY);
  } catch (error) {
    console.error('[Storage Migration] Migration failed:', error);
    // Don't mark as migrated on error - will retry next time
  }
};

/**
 * Checks if migration has been completed
 */
export const isMigrationComplete = async (): Promise<boolean> => {
  const state = await migrationStorage.get();
  return state.migrated;
};

/**
 * Resets migration state (for testing purposes)
 */
export const resetMigration = async (): Promise<void> => {
  await migrationStorage.set({
    migrated: false,
  });
  console.log('[Storage Migration] Migration state reset');
};
