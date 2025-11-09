# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Browser extension that adds comprehensive right-to-left (RTL) text direction support to AI chat interfaces. Supports Claude.ai and ChatGPT. Built on Turborepo monorepo with React, TypeScript, Vite, and pnpm. Key features:
- **Claude.ai**: Independent RTL controls for chat input, main content, and side panel with KaTeX math preservation
- **ChatGPT**: KaTeX math expression fix for RTL responses + home page input RTL toggle
- **Platform-aware tabbed interface** that automatically selects the appropriate tab based on current website
- **Provider-based architecture** enabling easy addition of new AI platforms
- Per-conversation settings persistence with automatic UUID-based storage

## Commands

### Development
- `pnpm dev` - Start development mode for Chrome (run as administrator on Windows)
- `pnpm dev:firefox` - Start development mode for Firefox
- Development includes Hot Module Reload (HMR) via custom WebSocket-based plugin

### Building
- `pnpm build` - Production build for Chrome
- `pnpm build:firefox` - Production build for Firefox
- Output directory: `./dist/`

### Testing & Quality
- `pnpm type-check` - Run TypeScript type checking across all packages
- `pnpm lint` - Run ESLint on all packages
- `pnpm lint:fix` - Run ESLint with auto-fix
- `pnpm format` - Format code with Prettier
- `pnpm e2e` - Run end-to-end tests (builds Chrome zip first)
- `pnpm e2e:firefox` - Run end-to-end tests for Firefox

### Packaging
- `pnpm zip` - Create production Chrome extension zip
- `pnpm zip:firefox` - Create production Firefox extension zip
- Zipped extensions are placed in `./dist-zip/`

### Maintenance
- `pnpm update-version <version>` - Update extension version across all package.json files
- `pnpm clean` - Complete cleanup (bundle, turbo cache, node_modules)
- `pnpm clean:bundle` - Remove dist directories
- `pnpm clean:install` - Clean reinstall with frozen lockfile (troubleshooting)

### Installing Dependencies
- Root: `pnpm i <package> -w`
- Specific module: `pnpm i <package> -F <module-name>` (e.g., `pnpm i lodash -F popup`)

## Architecture

### Content-Script-Only Design

This extension is a **content-script-only** extension with **NO background service worker**:

- **Zero context invalidation errors** - content scripts never lose their context
- **Simpler & more reliable** - no IPC overhead or service worker termination issues
- **Lower resource usage** - no background process running
- **Direct chrome.storage access** - content script accesses storage API directly

All functionality runs in the content script:
- MutationObserver watches for URL and DOM changes
- chrome.storage is accessed directly without message passing
- No background worker means no 30-second termination issues

**When you would need a service worker**:
- Browser-level events (downloads, bookmarks, history)
- Cross-tab communication
- Background tasks when all tabs are closed
- Persistent alarms or scheduled tasks
- Chrome API access that requires background context

This extension doesn't need any of these, so the service worker was eliminated entirely.

### Design Philosophy

This extension follows a **provider-based architecture** with strict separation of concerns:

1. **Loose Coupling**: Each AI provider (Claude, ChatGPT) has its own independent module
2. **Isolated Storage**: Separate storage namespaces prevent data collision
3. **Self-Contained UI**: Each provider has its own tab component with all necessary logic
4. **Easy Extensibility**: Adding new providers (Gemini, Perplexity, etc.) requires no changes to existing code

### Active Extension Pages

1. **pages/content-ui/** - Main RTL control panel injected into Claude.ai and ChatGPT
   - Sliding panel UI with hover trigger bar
   - Position configurable (top, right, bottom, left)
   - Provider dropdown selector with automatic platform detection
   - **Claude.ai provider**: Three independent RTL toggles (chat input, main content, side panel)
   - **ChatGPT provider**: KaTeX math expression fix toggle + home page input RTL toggle
   - Platform-specific restrictions with inline warning notifications
   - Dropdown shows all providers but only allows selecting the current platform

2. **pages/popup/** - Browser toolbar popup
3. **pages/options/** - Extension options/about page

### Provider System

The extension uses a modular provider architecture where each AI platform has its own self-contained module. Functions follow a consistent naming pattern with provider prefixes (e.g., `toggleClaudeRTL`, `toggleChatGPTKatexRTL`) to avoid naming conflicts and make imports explicit.

**Key architectural principle:** Each provider module is a **completely self-contained unit** with:
- Its own DOM detection logic (internal, not exported)
- Its own RTL application functions (internal)
- Its own state management functions (exported)
- Its own MutationObserver initialization (exported)
- Zero dependencies on other providers
- Zero shared state between providers

This means adding a new provider (Gemini, Perplexity, etc.) requires **zero changes** to existing provider code.

#### Provider Detection

**`packages/shared/lib/providers/provider-detector.ts`**

Central detection logic for identifying which AI platform is currently active:
- `isClaude()` - Returns true if on claude.ai
- `isChatGPT()` - Returns true if on chatgpt.com or chat.openai.com
- `getCurrentProvider()` - Returns 'claude' | 'chatgpt' | 'unknown'

#### Claude.ai Provider

**`packages/shared/lib/providers/claude/claude-rtl-manager.ts`**

Self-contained module handling all Claude.ai RTL functionality.

**Module Structure (follows standard provider pattern):**

1. **DOM Detection** (internal, not exported):
   - `findSidePanelContent()` - Locates side panel by traversing from `.cursor-col-resize` anchor
   - `findChatInput()` - Finds chat input via `[data-testid="chat-input"]`
   - `findMainContent()` - Traverses up from chat input to sticky element, then selects previous sibling

2. **RTL Application** (internal, not exported):
   - `applyClaudeRTL(enable: boolean)` - Apply/remove RTL to side panel
   - `applyClaudeChatInputRTL(enable: boolean)` - Apply/remove RTL to chat input
   - `applyClaudeMainContentRTL(enable: boolean)` - Apply/remove RTL to main content
   - `injectKatexLTRStyle()` - Injects global CSS to force KaTeX math elements to always render in LTR

3. **State Management** (EXPORTED - public API):
   - `getCurrentClaudeRTLState()` - Get side panel RTL state from storage
   - `getCurrentClaudeChatInputRTLState()` - Get chat input RTL state from storage
   - `getCurrentClaudeMainContentRTLState()` - Get main content RTL state from storage
   - `toggleClaudeRTL()` - Toggle side panel RTL and save to storage
   - `toggleClaudeChatInputRTL()` - Toggle chat input RTL and save to storage
   - `toggleClaudeMainContentRTL()` - Toggle main content RTL and save to storage

4. **Initialization** (EXPORTED):
   - `initClaudeRTLManager()` - Initialize MutationObserver to watch for URL and DOM changes, returns cleanup function

**Pattern:** Only state management and initialization are exported. DOM detection and RTL application are implementation details.

#### ChatGPT Provider

**`packages/shared/lib/providers/chatgpt/chatgpt-rtl-manager.ts`**

Self-contained module handling all ChatGPT RTL functionality.

**Module Structure (follows standard provider pattern):**

1. **DOM Detection** (internal, not exported):
   - `findChatGPTInput()` - Finds ChatGPT prompt textarea by ID `#prompt-textarea`

2. **RTL Application** (internal, not exported):
   - `applyChatGPTInputRTL(enable: boolean)` - Apply/remove RTL to ChatGPT input
   - `applyChatGPTKatexStyle(enable: boolean)` - Injects/removes KaTeX fix CSS for RTL responses

3. **State Management** (EXPORTED - public API):
   - `getCurrentChatGPTKatexRTLState()` - Get KaTeX fix state from storage
   - `getCurrentChatGPTInputRTLState()` - Get input RTL state from storage
   - `toggleChatGPTKatexRTL()` - Toggle KaTeX fix and save to storage
   - `toggleChatGPTInputRTL()` - Toggle input RTL and save to storage
   - `reapplyChatGPTStyles()` - Reapply all styles (useful after settings transfer from "new" → UUID)

4. **Initialization** (EXPORTED):
   - `initChatGPTRTLManager()` - Initialize MutationObserver to watch for URL and DOM changes, returns cleanup function

**Pattern:** Only state management and initialization are exported. DOM detection and RTL application are implementation details.

#### RTL Initialization

**`packages/shared/lib/utils/rtl-init.ts`**

Thin orchestration layer for initialization and settings transfer. This module does NOT contain provider-specific logic - it only delegates to the appropriate provider module based on platform detection.

Key functions:
- `initRTLManager()` - Delegates to `initClaudeRTLManager()` or `initChatGPTRTLManager()` based on provider
- `transferNewChatSettings(newChatId)` - Transfers settings from "new" temp key to actual UUID (provider-aware)
  - Reads "new" settings from both Claude and ChatGPT storage
  - Writes them to the actual chat UUID
  - Provider-specific: only transfers settings for current platform
- `clearNewChatSettings()` - Clears "new" temp key from both provider storages
- `reapplyChatGPTStyles()` - Reapplies ChatGPT styles after settings transfer (ChatGPT-specific workaround)

### Storage System

The extension uses **separate storage namespaces** for each provider to ensure complete data isolation and prevent migration issues when adding new platforms.

#### Claude.ai Storage

**`packages/storage/lib/providers/claude-storage.ts`**

Storage key: `'claude_chats_storage'`

Settings structure:
```typescript
interface ClaudeSettings {
  isRTL: boolean;              // Side panel RTL
  isChatInputRTL: boolean;      // Chat input RTL
  isMainContentRTL: boolean;    // Main content RTL
  direction: 'ltr' | 'rtl';
  textAlign: 'left' | 'right' | 'center';
}
```

API:
- `getChatSettings(chatId)` - Returns settings for chat ID or defaults
- `setChatSettings(chatId, settings)` - Merges partial settings into existing settings
- `resetChatSettings(chatId)` - Deletes settings for specific chat ID

#### ChatGPT Storage

**`packages/storage/lib/providers/chatgpt-storage.ts`**

Storage key: `'chatgpt_chats_storage'`

Settings structure:
```typescript
interface ChatGPTSettings {
  isChatGPTKatexRTL: boolean;   // KaTeX math expression fix
  isChatGPTInputRTL: boolean;   // Chat input RTL
}
```

API:
- `getChatSettings(chatId)` - Returns settings for chat ID or defaults
- `setChatSettings(chatId, settings)` - Merges partial settings into existing settings
- `resetChatSettings(chatId)` - Deletes settings for specific chat ID

#### Legacy Storage

**`packages/storage/lib/impl/chat-rtl-storage.ts`**

Storage key: `'chat-rtl-storage-key'` (deprecated, kept for migration)

Contains mixed Claude and ChatGPT settings in one namespace. Used only during automatic migration on first load of new version.

#### Position Storage

**`packages/storage/lib/impl/rtl-position-storage.ts`**

Storage key: `'rtl-position-storage-key'`

Global setting (not per-chat) for control panel position:
- Supports: 'top', 'right', 'bottom', 'left'
- Persists user preference for where the sliding panel appears
- Shared across all providers

#### Storage Abstraction Layer

All storages use a **reactive storage wrapper** built on chrome.storage API:

```typescript
const storage = createStorage<StateType>(
  'storage-key',
  defaultValue,
  {
    storageEnum: StorageEnum.Local,  // Local vs Session
    liveUpdate: true,                 // Subscribe to changes
  }
);

// Usage:
const settings = await storage.get();
await storage.set({ newSettings });
const unsubscribe = storage.subscribe(() => { /* react to changes */ });
```

**Features:**
- **Reactive**: `liveUpdate: true` watches `chrome.storage.onChanged` events
- **Cached**: Maintains in-memory cache for fast reads (reduces chrome.storage API calls)
- **Type-safe**: Full TypeScript support with generic types
- **Subscribe pattern**: Multiple subscribers can listen to same storage changes
- **Automatic cleanup**: Unsubscribe functions prevent memory leaks

**How it works:**
1. `createStorage()` registers listener on `chrome.storage.onChanged`
2. When storage changes (from any source: popup, content-ui, or external), listener fires
3. All subscribers are notified
4. React components re-render with new state
5. This enables **live synchronization** between UI components and storage without polling

#### Storage Migration

**`packages/storage/lib/migrations/storage-migration.ts`**

One-time automatic migration from v1 (unified storage) to v2 (provider-specific storage):

Migration process:
1. Checks if migration already completed via `'storage_migration_v1'` key
2. Reads old unified storage at `'chat-rtl-storage-key'`
3. Separates Claude settings (`isRTL`, `isChatInputRTL`, `isMainContentRTL`) into Claude storage
4. Separates ChatGPT settings (`isChatGPTKatexRTL`, `isChatGPTInputRTL`) into ChatGPT storage
5. Marks migration as complete with timestamp
6. Preserves old storage for potential rollback

See `MIGRATION.md` in the repository root for detailed migration documentation.

### UI Components

The UI follows a component-based architecture with a provider dropdown selector:

#### Provider Container

**`pages/content-ui/src/components/tabs/TabContainer.tsx`**

Orchestrates provider selection and platform validation:
- Dropdown selector showing all available providers (Claude.ai, ChatGPT)
- Automatically selects correct provider based on `currentPlatform` prop
- All providers visible in dropdown, but only current platform is selectable
- Disabled providers shown with grayed out text and `cursor: not-allowed`
- Shows inline warning when user attempts to select wrong provider for current platform
- Warning auto-dismisses after 2 seconds
- Click-outside detection to close dropdown
- Visual feedback: selected provider has blue checkmark icon

#### Claude Provider Component

**`pages/content-ui/src/components/tabs/ClaudeTab.tsx`**

Self-contained Claude.ai UI component:
- Three toggle switches: Side Panel RTL, Chat Input RTL, Main Content RTL
- Imports from Claude provider module: `toggleRTL`, `toggleChatInputRTL`, `toggleMainContentRTL`
- Imports from Claude storage: `claudeChatStorage`
- Subscribes to Claude storage changes for live updates
- Only rendered when Claude.ai is selected

#### ChatGPT Provider Component

**`pages/content-ui/src/components/tabs/ChatGPTTab.tsx`**

Self-contained ChatGPT UI component:
- Two toggle switches: Fix KaTeX Math Expressions, Input Direction RTL
- Imports from ChatGPT provider module: `toggleChatGPTKatexRTL`, `toggleChatGPTInputRTL`
- Imports from ChatGPT storage: `chatgptChatStorage`
- Subscribes to ChatGPT storage changes for live updates
- Only rendered when ChatGPT is selected

### Key Patterns

#### "new" Chat Handling

When user is on a new/temporary page, settings are stored with key "new":
- **Claude.ai**: `/new` or `/project/*` pages use "new" key
- **ChatGPT**: Home page `/` uses "new" key

**Settings Transfer Flow:**

When user sends first message and URL changes to actual chat UUID:
1. `App.tsx` polls for URL changes every 500ms (via `setInterval`)
2. When chat ID changes from "new" to actual UUID:
   - `transferNewChatSettings(actualUUID)` copies "new" → UUID for current provider
   - `reapplyChatGPTStyles()` immediately reapplies ChatGPT styles if on ChatGPT
   - Settings are provider-isolated: only current platform's settings are transferred
3. "new" key is cleared for fresh start next time
4. Each provider's settings are transferred independently

**Why polling?** MutationObserver doesn't catch URL changes reliably on all platforms. The 500ms polling ensures settings transfer happens quickly after the first message is sent.

#### KaTeX LTR Preservation

Mathematical expressions are kept in LTR direction even when content is RTL:
- **Claude.ai**: Global CSS injected targeting `.katex` with `direction: ltr !important`
- **ChatGPT**: Toggleable CSS injection with `direction: ltr; unicode-bidi: bidi-override`

#### DOM Reapplication Strategy

Each provider's manager uses MutationObserver to watch for:
1. URL changes (navigation between chats or to/from new pages)
2. DOM recreation (platforms dynamically rebuild elements)

**Element Tracking Pattern** (prevents infinite loops):

```typescript
let lastSidePanelElement: HTMLElement | null = null;

const reapplySidePanel = async () => {
  const currentElement = findSidePanelContent();

  // Only reapply if:
  // 1. Element reference changed (DOM was recreated)
  // 2. Style doesn't match expected state
  const needsReapply =
    currentElement !== lastSidePanelElement ||
    currentElement?.style.direction !== expectedDirection;

  if (needsReapply && currentElement) {
    lastSidePanelElement = currentElement;
    applyClaudeRTL(savedRTLState);
  }
};
```

This pattern:
- Tracks element references (not just existence)
- Compares current style against expected state
- Only applies styles when truly needed
- Prevents infinite MutationObserver loops (where applying style triggers observer, which applies style again)

#### Control Panel Visibility

Panel shows when `shouldShowPanel` is true:
- **Claude.ai**: Path is `/new` OR starts with `/project/` OR valid chat UUID exists
- **ChatGPT**: Path is `/` (home page) OR starts with `/c/` (conversation page)

This prevents panel from appearing on landing pages or non-chat routes.

#### Platform-Aware Dropdown System

- Dropdown automatically selects correct provider based on `currentPlatform` prop
- All providers visible in dropdown menu
- Only current platform's provider is selectable (others are disabled)
- Disabled providers have grayed text (50% opacity) and `cursor: not-allowed`
- Attempting to select wrong provider shows inline warning: "This provider is only available on [correct platform]"
- Warning auto-dismisses after 2 seconds
- Dropdown closes automatically on selection or click-outside

### Monorepo Structure

Built on Turborepo with shared packages:

**packages/**:
- `shared/` - Provider modules, RTL orchestrator, chat utilities, hooks, common components
  - `lib/providers/` - Provider-specific modules
    - `claude/` - Claude.ai RTL manager
    - `chatgpt/` - ChatGPT RTL manager
    - `provider-detector.ts` - Platform detection
    - `index.ts` - Provider exports
  - `lib/utils/` - Shared utilities
    - `rtl-manager.ts` - Main orchestrator (delegates to providers)
    - `chat-utils.ts` - Chat ID extraction
- `storage/` - Chrome storage API wrappers
  - `lib/providers/` - Provider-specific storages
    - `claude-storage.ts` - Claude.ai settings storage
    - `chatgpt-storage.ts` - ChatGPT settings storage
  - `lib/impl/` - Legacy and global storages
    - `chat-rtl-storage.ts` - Legacy unified storage (deprecated)
    - `rtl-position-storage.ts` - Global panel position
  - `lib/migrations/` - Migration utilities
    - `storage-migration.ts` - v1 to v2 migration logic
- `hmr/` - Custom HMR plugin with WebSocket-based rebuild notifications
- `ui/` - Shared UI components and Tailwind utilities
- `vite-config/` - Shared Vite configurations
- `tsconfig/` - Shared TypeScript configurations
- `tailwind-config/` - Shared Tailwind configuration
- `dev-utils/` - Development utilities (manifest parser, logger)
- `zipper/` - Extension packaging utility
- `env/` - Environment variable management

**chrome-extension/**:
- `manifest.ts` - Generates manifest.json (Manifest V3) with permissions for Claude.ai and ChatGPT
- `build.mjs` - Simple build script that generates manifest.json from manifest.ts and copies assets
- `public/` - Static assets (icons)

**pages/**:
- `content-ui/src/components/tabs/` - Provider-specific components
  - `ClaudeTab.tsx` - Self-contained Claude UI
  - `ChatGPTTab.tsx` - Self-contained ChatGPT UI
  - `TabContainer.tsx` - Provider dropdown orchestration

### Build System

Turborepo orchestrates parallel builds:
- `ready` task runs first (dependencies/setup)
- `dev` task is persistent with file watching
- `build` task depends on `ready` and sibling `build` tasks
- All output goes to `./dist/` directory
- Firefox builds auto-remove unsupported features from manifest

## Adding New AI Providers

The provider-based architecture makes it easy to add support for new AI platforms (e.g., Gemini, Perplexity, DeepSeek).

### Step 1: Create Provider Module

Create `packages/shared/lib/providers/{provider}/`:

```typescript
// packages/shared/lib/providers/gemini/gemini-rtl-manager.ts

// DOM detection functions
const findGeminiInput = (): HTMLElement | null => {
  // Your selector logic
};

// RTL application functions
const applyGeminiInputRTL = (enable: boolean): void => {
  const input = findGeminiInput();
  if (!input) return;
  input.style.direction = enable ? 'rtl' : 'ltr';
};

// State management functions
export const getCurrentGeminiInputRTLState = async (): Promise<boolean> => {
  const chatId = getEffectiveChatId();
  if (!chatId) return false;

  const { geminiChatStorage } = await import('@extension/storage');
  const settings = await geminiChatStorage.getChatSettings(chatId);
  return settings.isInputRTL;
};

export const toggleGeminiInputRTL = async (): Promise<boolean> => {
  const chatId = getEffectiveChatId();
  if (!chatId) return false;

  const { geminiChatStorage } = await import('@extension/storage');
  const currentSettings = await geminiChatStorage.getChatSettings(chatId);
  const newRTLState = !currentSettings.isInputRTL;

  await geminiChatStorage.setChatSettings(chatId, {
    isInputRTL: newRTLState,
  });

  applyGeminiInputRTL(newRTLState);
  return newRTLState;
};

// MutationObserver initialization
export const initGeminiRTLManager = (): (() => void) => {
  // Apply saved states on load
  // Watch for URL and DOM changes
  // Return cleanup function
};
```

### Step 2: Create Storage Module

Create `packages/storage/lib/providers/gemini-storage.ts`:

```typescript
import { createStorage, StorageEnum } from '../base/index.js';
import type { BaseStorageType } from '../base/index.js';

interface GeminiSettings {
  isInputRTL: boolean;
  // Add more settings as needed
}

interface GeminiStorageState {
  chats: Record<string, GeminiSettings>;
}

type GeminiStorageType = BaseStorageType<GeminiStorageState> & {
  getChatSettings: (chatId: string) => Promise<GeminiSettings>;
  setChatSettings: (chatId: string, settings: Partial<GeminiSettings>) => Promise<void>;
  resetChatSettings: (chatId: string) => Promise<void>;
};

const DEFAULT_GEMINI_SETTINGS: GeminiSettings = {
  isInputRTL: false,
};

const storage = createStorage<GeminiStorageState>(
  'gemini_chats_storage', // Unique storage key
  { chats: {} },
  { storageEnum: StorageEnum.Local, liveUpdate: true }
);

export const geminiChatStorage: GeminiStorageType = {
  ...storage,
  getChatSettings: async (chatId: string): Promise<GeminiSettings> => {
    const state = await storage.get();
    return state.chats[chatId] || DEFAULT_GEMINI_SETTINGS;
  },
  setChatSettings: async (chatId: string, settings: Partial<GeminiSettings>): Promise<void> => {
    const state = await storage.get();
    const currentSettings = state.chats[chatId] || DEFAULT_GEMINI_SETTINGS;
    await storage.set({
      chats: { ...state.chats, [chatId]: { ...currentSettings, ...settings } },
    });
  },
  resetChatSettings: async (chatId: string): Promise<void> => {
    const state = await storage.get();
    const { [chatId]: _removed, ...remainingChats } = state.chats;
    await storage.set({ chats: remainingChats });
  },
};

export type { GeminiSettings, GeminiStorageState, GeminiStorageType };
```

Export from `packages/storage/lib/index.ts`:
```typescript
export { geminiChatStorage } from './providers/gemini-storage.js';
export type { GeminiSettings, GeminiStorageState, GeminiStorageType } from './providers/gemini-storage.js';
```

### Step 3: Update Provider Detection

Update `packages/shared/lib/providers/provider-detector.ts`:

```typescript
export type AIProvider = 'claude' | 'chatgpt' | 'gemini' | 'unknown';

export const isGemini = (): boolean => {
  const hostname = window.location.hostname;
  return hostname === 'gemini.google.com';
};

export const getCurrentProvider = (): AIProvider => {
  if (isClaude()) return 'claude';
  if (isChatGPT()) return 'chatgpt';
  if (isGemini()) return 'gemini';
  return 'unknown';
};
```

Export from `packages/shared/lib/providers/index.ts`:
```typescript
export { isGemini } from './provider-detector.js';
export {
  getCurrentGeminiInputRTLState,
  toggleGeminiInputRTL,
  initGeminiRTLManager,
} from './gemini/gemini-rtl-manager.js';
```

### Step 4: Update RTL Manager Orchestrator

Update `packages/shared/lib/utils/rtl-manager.ts`:

```typescript
import { isGemini } from '../providers/provider-detector.js';
import {
  initGeminiRTLManager,
  getCurrentGeminiInputRTLState as getGeminiInputRTLState,
  toggleGeminiInputRTL as toggleGeminiInput,
} from '../providers/gemini/gemini-rtl-manager.js';

export const getCurrentGeminiInputRTLState = async (): Promise<boolean> => {
  if (!isGemini()) return false;
  return getGeminiInputRTLState();
};

export const toggleGeminiInputRTL = async (): Promise<boolean> => {
  if (!isGemini()) {
    console.debug('[RTL Manager] toggleGeminiInputRTL only works on Gemini');
    return false;
  }
  return toggleGeminiInput();
};

export const initRTLManager = (): (() => void) => {
  const provider = getCurrentProvider();

  if (provider === 'claude') return initClaudeRTLManager();
  if (provider === 'chatgpt') return initChatGPTRTLManager();
  if (provider === 'gemini') return initGeminiRTLManager();

  return () => {};
};

// Update clearNewChatSettings and transferNewChatSettings to include Gemini
```

### Step 5: Create UI Tab Component

Create `pages/content-ui/src/components/tabs/GeminiTab.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { geminiChatStorage } from '@extension/storage';
import {
  getCurrentGeminiInputRTLState,
  toggleGeminiInputRTL,
} from '@extension/shared';

export const GeminiTab = () => {
  const [isInputRTL, setIsInputRTL] = useState(false);

  useEffect(() => {
    const loadStates = async () => {
      const inputRTL = await getCurrentGeminiInputRTLState();
      setIsInputRTL(inputRTL);
    };

    loadStates();

    const unsubscribe = geminiChatStorage.subscribe(async () => {
      loadStates();
    });

    return () => unsubscribe();
  }, []);

  const handleToggleInputRTL = async () => {
    const newState = await toggleGeminiInputRTL();
    setIsInputRTL(newState);
  };

  return (
    <div style={{ padding: '12px 16px' }}>
      <ToggleSwitch
        checked={isInputRTL}
        onChange={handleToggleInputRTL}
        label="Input Direction RTL"
      />
    </div>
  );
};
```

### Step 6: Update Provider Container

Update `pages/content-ui/src/components/tabs/TabContainer.tsx`:

```typescript
import { GeminiTab } from './GeminiTab';

type TabType = 'claude' | 'chatgpt' | 'gemini';

interface TabContainerProps {
  currentPlatform: 'claude' | 'chatgpt' | 'gemini';
  initialTab: TabType;
}

// Add Gemini to PROVIDER_OPTIONS array:
const PROVIDER_OPTIONS = [
  { value: 'claude' as const, label: 'Claude.ai' },
  { value: 'chatgpt' as const, label: 'ChatGPT' },
  { value: 'gemini' as const, label: 'Gemini' },  // Add this
];

// Add Gemini rendering in Provider Content section:
<div style={{ flex: 1, overflowY: 'auto' }}>
  {activeTab === 'claude' && <ClaudeTab />}
  {activeTab === 'chatgpt' && <ChatGPTTab />}
  {activeTab === 'gemini' && <GeminiTab />}  {/* Add this */}
</div>
```

### Step 7: Update Manifest Permissions

Update `chrome-extension/manifest.ts`:

```typescript
export default defineManifest(async env => ({
  // ...
  permissions: ['storage', 'activeTab'],
  host_permissions: [
    'https://claude.ai/*',
    'https://chatgpt.com/*',
    'https://chat.openai.com/*',
    'https://gemini.google.com/*', // Add new provider
  ],
  content_scripts: [
    {
      matches: [
        'https://claude.ai/*',
        'https://chatgpt.com/*',
        'https://chat.openai.com/*',
        'https://gemini.google.com/*', // Add new provider
      ],
      // ...
    },
  ],
}));
```

### Step 8: Test and Document

1. Test on Gemini to verify:
   - DOM detection works
   - RTL applies correctly
   - Settings persist per chat
   - MutationObserver catches changes
   - Tab UI responds properly

2. Update documentation:
   - Add Gemini to supported platforms list
   - Document Gemini-specific features
   - Update architecture diagrams if needed

### Benefits of This Approach

1. **Zero Impact on Existing Providers**: Adding Gemini requires no changes to Claude or ChatGPT code
2. **Isolated Storage**: Each provider has its own storage namespace, preventing conflicts
3. **Independent Development**: Different developers can work on different providers simultaneously
4. **Easy Testing**: Test each provider in isolation
5. **Clean Codebase**: No if/else chains or mixed logic
6. **Type Safety**: TypeScript ensures correct usage of provider-specific types

## Important Notes

- **Node Version**: Requires Node.js >= 22.15.1
- **Package Manager**: Must use pnpm 10.11.0
- **Target Sites**: Works on:
  - `https://claude.ai/*` (full RTL controls)
  - `https://chatgpt.com/*` (KaTeX fix + home page input RTL)
  - `https://chat.openai.com/*` (legacy ChatGPT domain)
- **Windows**: Requires WSL with Linux distribution installed
- **Firefox Limitations**:
  - Add-ons load in temporary mode and disappear on browser close
  - Shadow DOM uses inline styles due to Firefox bug with adoptedStyleSheets
- **DOM Selectors**: Provider functionality relies on specific DOM structures. May break if providers redesign their UI:
  - **Claude.ai**:
    - Side panel: anchored to `.cursor-col-resize.max-md\:hidden`
    - Chat input: `[data-testid="chat-input"]`
    - Main content: element with `sticky` class and its previous sibling
  - **ChatGPT**:
    - Chat input: `#prompt-textarea`
- **Platform Guards**: Each provider module is fully isolated. RTL manager orchestrator uses platform detection to ensure provider-specific logic only runs on correct platform.
- **Storage Migration**: First load after upgrade automatically migrates from v1 unified storage to v2 provider-specific storage. See `MIGRATION.md` for details.
