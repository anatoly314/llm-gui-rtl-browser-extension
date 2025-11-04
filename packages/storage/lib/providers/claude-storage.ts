import { createStorage, StorageEnum } from '../base/index.js';
import type { BaseStorageType } from '../base/index.js';

type TextAlignType = 'left' | 'right' | 'center';
type DirectionType = 'ltr' | 'rtl';

interface ClaudeSettings {
  isRTL: boolean; // Side panel RTL
  isChatInputRTL: boolean; // Chat input RTL
  isMainContentRTL: boolean; // Main content RTL
  direction: DirectionType;
  textAlign: TextAlignType;
}

interface ClaudeStorageState {
  chats: Record<string, ClaudeSettings>;
}

type ClaudeStorageType = BaseStorageType<ClaudeStorageState> & {
  getChatSettings: (chatId: string) => Promise<ClaudeSettings>;
  setChatSettings: (chatId: string, settings: Partial<ClaudeSettings>) => Promise<void>;
  resetChatSettings: (chatId: string) => Promise<void>;
};

const DEFAULT_CLAUDE_SETTINGS: ClaudeSettings = {
  isRTL: false,
  isChatInputRTL: false,
  isMainContentRTL: false,
  direction: 'ltr',
  textAlign: 'left',
};

const storage = createStorage<ClaudeStorageState>(
  'claude_chats_storage',
  {
    chats: {},
  },
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

const claudeChatStorage: ClaudeStorageType = {
  ...storage,

  getChatSettings: async (chatId: string): Promise<ClaudeSettings> => {
    const state = await storage.get();
    return state.chats[chatId] || DEFAULT_CLAUDE_SETTINGS;
  },

  setChatSettings: async (chatId: string, settings: Partial<ClaudeSettings>): Promise<void> => {
    const state = await storage.get();
    const currentSettings = state.chats[chatId] || DEFAULT_CLAUDE_SETTINGS;

    await storage.set({
      chats: {
        ...state.chats,
        [chatId]: {
          ...currentSettings,
          ...settings,
        },
      },
    });
  },

  resetChatSettings: async (chatId: string): Promise<void> => {
    const state = await storage.get();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [chatId]: _removed, ...remainingChats } = state.chats;

    await storage.set({
      chats: remainingChats,
    });
  },
};

export { claudeChatStorage };
export type { TextAlignType, DirectionType, ClaudeSettings, ClaudeStorageState, ClaudeStorageType };
