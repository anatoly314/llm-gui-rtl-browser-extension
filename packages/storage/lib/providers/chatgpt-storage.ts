import { createStorage, StorageEnum } from '../base/index.js';
import type { BaseStorageType } from '../base/index.js';

interface ChatGPTSettings {
  isChatGPTKatexRTL: boolean; // KaTeX math expression fix
  isChatGPTInputRTL: boolean; // Chat input RTL
}

interface ChatGPTStorageState {
  chats: Record<string, ChatGPTSettings>;
}

type ChatGPTStorageType = BaseStorageType<ChatGPTStorageState> & {
  getChatSettings: (chatId: string) => Promise<ChatGPTSettings>;
  setChatSettings: (chatId: string, settings: Partial<ChatGPTSettings>) => Promise<void>;
  resetChatSettings: (chatId: string) => Promise<void>;
};

const DEFAULT_CHATGPT_SETTINGS: ChatGPTSettings = {
  isChatGPTKatexRTL: false,
  isChatGPTInputRTL: false,
};

const storage = createStorage<ChatGPTStorageState>(
  'chatgpt_chats_storage',
  {
    chats: {},
  },
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

const chatgptChatStorage: ChatGPTStorageType = {
  ...storage,

  getChatSettings: async (chatId: string): Promise<ChatGPTSettings> => {
    const state = await storage.get();
    return state.chats[chatId] || DEFAULT_CHATGPT_SETTINGS;
  },

  setChatSettings: async (chatId: string, settings: Partial<ChatGPTSettings>): Promise<void> => {
    const state = await storage.get();
    const currentSettings = state.chats[chatId] || DEFAULT_CHATGPT_SETTINGS;

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

export { chatgptChatStorage };
export type { ChatGPTSettings, ChatGPTStorageState, ChatGPTStorageType };
