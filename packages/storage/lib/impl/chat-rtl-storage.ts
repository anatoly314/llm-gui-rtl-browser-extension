import { createStorage, StorageEnum } from '../base/index.js';
import type { BaseStorageType } from '../base/index.js';

type TextAlignType = 'left' | 'right' | 'center';
type DirectionType = 'ltr' | 'rtl';

interface ChatRTLSettings {
  isRTL: boolean;
  isChatInputRTL: boolean;
  isMainContentRTL: boolean;
  direction: DirectionType;
  textAlign: TextAlignType;
  isChatGPTKatexRTL: boolean; // ChatGPT-specific KaTeX styling
  isChatGPTInputRTL: boolean; // ChatGPT-specific input RTL
  // Add more properties as needed:
  // fontSize?: number;
  // fontFamily?: string;
  // lineHeight?: number;
}

interface ChatRTLStorageState {
  chats: Record<string, ChatRTLSettings>;
}

type ChatRTLStorageType = BaseStorageType<ChatRTLStorageState> & {
  getChatSettings: (chatId: string) => Promise<ChatRTLSettings>;
  setChatSettings: (chatId: string, settings: Partial<ChatRTLSettings>) => Promise<void>;
  resetChatSettings: (chatId: string) => Promise<void>;
};

const DEFAULT_CHAT_SETTINGS: ChatRTLSettings = {
  isRTL: false,
  isChatInputRTL: false,
  isMainContentRTL: false,
  direction: 'ltr',
  textAlign: 'left',
  isChatGPTKatexRTL: false,
  isChatGPTInputRTL: false,
};

const storage = createStorage<ChatRTLStorageState>(
  'chat-rtl-storage-key',
  {
    chats: {},
  },
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

const chatRTLStorage: ChatRTLStorageType = {
  ...storage,

  getChatSettings: async (chatId: string): Promise<ChatRTLSettings> => {
    const state = await storage.get();
    return state.chats[chatId] || DEFAULT_CHAT_SETTINGS;
  },

  setChatSettings: async (chatId: string, settings: Partial<ChatRTLSettings>): Promise<void> => {
    const state = await storage.get();
    const currentSettings = state.chats[chatId] || DEFAULT_CHAT_SETTINGS;

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

export { chatRTLStorage };
export type { TextAlignType, DirectionType, ChatRTLSettings, ChatRTLStorageState, ChatRTLStorageType };
