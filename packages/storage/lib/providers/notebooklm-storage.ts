import { createStorage, StorageEnum } from '../base/index.js';
import type { BaseStorageType } from '../base/index.js';

interface NotebookLMSettings {
  isKatexRTL: boolean; // KaTeX math expression fix
  isChatPanelRTL: boolean; // Chat panel RTL
}

interface NotebookLMStorageState {
  chats: Record<string, NotebookLMSettings>;
}

type NotebookLMStorageType = BaseStorageType<NotebookLMStorageState> & {
  getChatSettings: (chatId: string) => Promise<NotebookLMSettings>;
  setChatSettings: (chatId: string, settings: Partial<NotebookLMSettings>) => Promise<void>;
  resetChatSettings: (chatId: string) => Promise<void>;
};

const DEFAULT_NOTEBOOKLM_SETTINGS: NotebookLMSettings = {
  isKatexRTL: false,
  isChatPanelRTL: false,
};

const storage = createStorage<NotebookLMStorageState>(
  'notebooklm_chats_storage',
  {
    chats: {},
  },
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

const notebooklmChatStorage: NotebookLMStorageType = {
  ...storage,

  getChatSettings: async (chatId: string): Promise<NotebookLMSettings> => {
    const state = await storage.get();
    return state.chats[chatId] || DEFAULT_NOTEBOOKLM_SETTINGS;
  },

  setChatSettings: async (chatId: string, settings: Partial<NotebookLMSettings>): Promise<void> => {
    const state = await storage.get();
    const currentSettings = state.chats[chatId] || DEFAULT_NOTEBOOKLM_SETTINGS;

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

export { notebooklmChatStorage };
export type { NotebookLMSettings, NotebookLMStorageState, NotebookLMStorageType };
