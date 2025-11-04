# Provider Architecture

This directory contains provider-specific RTL managers for different AI platforms. Each provider is completely isolated with no shared logic.

## Structure

```
providers/
├── provider-detector.ts     # Detects which provider is active
├── claude/                  # Claude.ai provider
│   └── claude-rtl-manager.ts
├── chatgpt/                 # ChatGPT provider
│   └── chatgpt-rtl-manager.ts
└── index.ts                 # Central export point
```

## Design Principles

1. **Complete Isolation**: Each provider is self-contained with no shared logic
2. **Code Duplication is Intentional**: Providers duplicate code to remain independent
3. **Platform-Specific Logic**: Each provider only runs on its designated platform
4. **Easy to Extend**: Adding new providers (Gemini, Perplexity, etc.) is straightforward

## Claude.ai Provider

**Location**: `claude/claude-rtl-manager.ts`

**Features**:
- Side panel RTL toggle
- Chat input RTL toggle
- Main content RTL toggle
- KaTeX math preservation (always LTR)
- DOM mutation observer for dynamic content
- Settings persistence per chat UUID

**Key Functions**:
- `initClaudeRTLManager()` - Initialize Claude RTL system
- `toggleRTL()` - Toggle side panel RTL
- `toggleChatInputRTL()` - Toggle chat input RTL
- `toggleMainContentRTL()` - Toggle main content RTL

## ChatGPT Provider

**Location**: `chatgpt/chatgpt-rtl-manager.ts`

**Features**:
- Input RTL toggle
- KaTeX math fix for RTL responses
- DOM mutation observer for navigation
- Settings persistence per conversation UUID

**Key Functions**:
- `initChatGPTRTLManager()` - Initialize ChatGPT RTL system
- `toggleChatGPTInputRTL()` - Toggle input RTL
- `toggleChatGPTKatexRTL()` - Toggle KaTeX fix
- `reapplyChatGPTStyles()` - Reapply all styles

## Adding a New Provider

To add support for a new AI platform (e.g., Gemini):

1. **Create provider directory**:
   ```bash
   mkdir packages/shared/lib/providers/gemini
   ```

2. **Create provider RTL manager**:
   ```typescript
   // packages/shared/lib/providers/gemini/gemini-rtl-manager.ts

   // Implement provider-specific functions:
   // - DOM element finders
   // - RTL apply functions
   // - Storage state getters/setters
   // - Toggle functions
   // - Initialization function

   export const initGeminiRTLManager = (): (() => void) => {
     // Provider-specific initialization
   };
   ```

3. **Update provider detector**:
   ```typescript
   // packages/shared/lib/providers/provider-detector.ts

   export type AIProvider = 'claude' | 'chatgpt' | 'gemini' | 'unknown';

   export const isGemini = (): boolean => {
     return window.location.hostname === 'gemini.google.com';
   };

   export const getCurrentProvider = (): AIProvider => {
     if (isClaude()) return 'claude';
     if (isChatGPT()) return 'chatgpt';
     if (isGemini()) return 'gemini';
     return 'unknown';
   };
   ```

4. **Update main orchestrator**:
   ```typescript
   // packages/shared/lib/utils/rtl-manager.ts

   import {
     initGeminiRTLManager,
     // ... other Gemini functions
   } from '../providers/gemini/gemini-rtl-manager.js';

   export const initRTLManager = (): (() => void) => {
     const provider = getCurrentProvider();

     if (provider === 'claude') return initClaudeRTLManager();
     if (provider === 'chatgpt') return initChatGPTRTLManager();
     if (provider === 'gemini') return initGeminiRTLManager();

     return () => {};
   };
   ```

5. **Update exports** (optional):
   ```typescript
   // packages/shared/lib/providers/index.ts

   // Add Gemini exports
   export {
     initGeminiRTLManager,
     // ... other Gemini functions
   } from './gemini/gemini-rtl-manager.js';
   ```

## Important Notes

- **No Shared Logic**: Do NOT extract "common" functions. Duplication is intentional.
- **Platform Guards**: Each provider should validate it's on the correct platform before executing.
- **Storage**: All providers use the same storage format but access it independently.
- **Testing**: Test each provider in isolation on its respective platform.
