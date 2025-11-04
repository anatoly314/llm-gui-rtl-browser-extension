# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a browser extension that adds comprehensive right-to-left (RTL) text direction support to AI chat interfaces. Supports Claude.ai and ChatGPT. Built on a Turborepo monorepo with React, TypeScript, Vite, and pnpm. The extension provides:
- **Claude.ai**: Independent RTL controls for chat input, main content, and side panel with KaTeX math preservation
- **ChatGPT**: KaTeX math expression fix for RTL responses
- **Platform-aware tabbed interface** that automatically selects the appropriate tab based on current website
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

### Packaging
- `pnpm zip` - Create production Chrome extension zip
- `pnpm zip:firefox` - Create production Firefox extension zip
- Zipped extensions are placed in `./dist-zip/`

### Utilities
- `pnpm update-version <version>` - Update extension version across all package.json files
- `pnpm clean:bundle` - Remove dist directories
- `pnpm clean:node_modules` - Remove all node_modules
- `pnpm clean` - Complete cleanup (bundle, turbo cache, node_modules)

### Installing Dependencies
- Root: `pnpm i <package> -w`
- Specific module: `pnpm i <package> -F <module-name>` (e.g., `pnpm i lodash -F popup`)

## Architecture

### Active Extension Pages

This extension uses only three of the available page types:

1. **pages/content-ui/** - Main RTL control panel injected into Claude.ai and ChatGPT
   - Sliding panel UI with hover trigger bar
   - Position configurable (top, right, bottom, left)
   - Tabbed interface with automatic platform detection
   - **Claude.ai tab**: Three independent RTL toggles (chat input, main content, side panel)
   - **ChatGPT tab**: KaTeX math expression fix toggle
   - Platform-specific tab restrictions with inline warning notifications
   - Automatically detects chat changes and applies saved settings

2. **pages/popup/** - Browser toolbar popup
   - Simple extension popup accessed from browser toolbar

3. **pages/options/** - Extension options/about page
   - Shows extension features and author info
   - Accessible via right-click extension icon → Options

### Core RTL System

**RTL Manager** (`packages/shared/lib/utils/rtl-manager.ts`):
The heart of the extension. Handles DOM element detection, RTL state management, and per-chat persistence with platform-aware logic.

Platform detection:
- `isClaude()` - Detects if current site is Claude.ai
- `isChatGPT()` - Detects if current site is ChatGPT

Claude.ai-specific functions:
- `findSidePanelContent()` - Locates side panel by traversing from `.cursor-col-resize` anchor
- `findChatInput()` - Finds chat input via `[data-testid="chat-input"]`
- `findMainContent()` - Traverses up from chat input to sticky element, then selects previous sibling
- `injectKatexLTRStyle()` - Injects global CSS to force KaTeX math elements to always render in LTR
- `applyRTL()` / `applyChatInputRTL()` / `applyMainContentRTL()` - Apply RTL styles (guarded to only run on Claude.ai)
- `toggleRTL()` / `toggleChatInputRTL()` / `toggleMainContentRTL()` - Toggle and persist RTL state

ChatGPT-specific functions:
- `applyChatGPTKatexStyle()` - Injects/removes KaTeX fix CSS (only runs on ChatGPT)
- `toggleChatGPTKatexRTL()` - Toggle ChatGPT KaTeX fix setting

Common functions:
- `getEffectiveChatId()` - Returns actual chat UUID or "new" for `/new` and `/project/*` pages
- `initRTLManager()` - Starts MutationObserver (only on Claude.ai, no-op on ChatGPT)
- `transferNewChatSettings()` - Transfers settings from "new" temp key to actual chat UUID
- `clearNewChatSettings()` - Clears temporary "new" settings when navigating to `/new`

**Chat Utilities** (`packages/shared/lib/utils/chat-utils.ts`):
- `getCurrentChatId()` - Extracts chat UUID from URL with platform support:
  - Claude.ai: `/chat/[uuid]` pattern
  - ChatGPT: `/c/[uuid]` pattern
- `isChatPage()` - Checks if current path is a chat page (platform-aware)

### Storage System

**Chat RTL Storage** (`packages/storage/lib/impl/chat-rtl-storage.ts`):
- Uses Chrome Local Storage with live updates
- Stores settings per chat UUID: `{ chats: { [chatId]: ChatRTLSettings } }`
- Each chat has: `isRTL`, `isChatInputRTL`, `isMainContentRTL`, `isChatGPTKatexRTL`, `direction`, `textAlign`
- Special "new" key for `/new` page settings that transfer to actual chat UUID on first message
- `getChatSettings()` - Returns settings for chat ID or defaults
- `setChatSettings()` - Merges partial settings into existing settings
- `resetChatSettings()` - Deletes settings for specific chat ID

**Position Storage** (`packages/storage/lib/impl/rtl-position-storage.ts`):
- Global setting (not per-chat) for control panel position
- Supports: 'top', 'right', 'bottom', 'left'
- Persists user preference for where the sliding panel appears

### Key Patterns

**"new" Chat Handling**:
When user is on `/new` or `/project/*` pages, settings are stored with key "new". When they send first message and URL changes to `/chat/[uuid]`, settings are transferred from "new" to the actual UUID and "new" key is cleared. This ensures:
- Settings work immediately on `/new` and `/project/*` pages
- Settings persist when chat gets a real UUID
- Fresh start every time user navigates to `/new`

**KaTeX LTR Preservation**:
Mathematical expressions rendered by KaTeX are automatically kept in LTR direction even when main content is RTL. This is achieved by injecting global CSS that targets `.katex` and all its children with `direction: ltr !important` and `unicode-bidi: embed !important`. The style is injected once on initialization.

**DOM Reapplication Strategy**:
MutationObserver watches for:
1. URL changes (navigation between chats or to/from `/new`)
2. DOM recreation (Claude.ai dynamically rebuilds elements)
3. Element tracking prevents unnecessary reapplications (compares element references and current styles)

**Control Panel Visibility**:
Panel only shows when `shouldShowPanel` is true, which requires:
- On Claude.ai: Current path is `/new` OR starts with `/project/` OR valid chat UUID exists
- On ChatGPT: Current path starts with `/c/` (conversation page)
This prevents panel from appearing on landing pages or other non-chat routes.

**Platform-Aware Tab System**:
- Tabs automatically select based on current hostname
- Claude.ai tab is disabled on ChatGPT, ChatGPT tab is disabled on Claude.ai
- Clicking wrong tab shows inline warning: "This tab is only available on [correct platform]"
- Warning auto-dismisses after 2 seconds

### Monorepo Structure

Built on Turborepo with shared packages:

**packages/**:
- `shared/` - RTL manager, chat utilities, hooks, common components
- `storage/` - Chrome storage API wrappers (chat RTL storage, position storage)
- `hmr/` - Custom HMR plugin with WebSocket-based rebuild notifications
- `ui/` - Shared UI components (ErrorDisplay, LoadingSpinner, etc.) and Tailwind utilities
- `vite-config/` - Shared Vite configurations
- `tsconfig/` - Shared TypeScript configurations
- `tailwind-config/` - Shared Tailwind configuration
- `dev-utils/` - Development utilities (manifest parser, logger)
- `zipper/` - Extension packaging utility
- `env/` - Environment variable management

**chrome-extension/**:
- `manifest.ts` - Generates manifest.json (Manifest V3) with permissions for:
  - `https://claude.ai/*`
  - `https://chatgpt.com/*`
- `src/background/` - Background service worker
- `public/` - Static assets (icons)

### Build System

Turborepo orchestrates parallel builds:
- `ready` task runs first (dependencies/setup)
- `dev` task is persistent with file watching
- `build` task depends on `ready` and sibling `build` tasks
- All output goes to `./dist/` directory
- Firefox builds auto-remove unsupported features from manifest

## Important Notes

- **Node Version**: Requires Node.js >= 22.15.1
- **Package Manager**: Must use pnpm 10.11.0
- **Target Sites**: Works on:
  - `https://claude.ai/*` (full RTL controls)
  - `https://chatgpt.com/*` (KaTeX fix only)
- **Windows**: Requires WSL with Linux distribution installed
- **Firefox Limitations**:
  - Add-ons load in temporary mode and disappear on browser close
  - Shadow DOM uses inline styles due to Firefox bug with adoptedStyleSheets
- **DOM Selectors**: Claude.ai functionality relies on specific DOM structure. May break if Claude.ai redesigns their UI:
  - Side panel: anchored to `.cursor-col-resize.max-md\:hidden`
  - Chat input: `[data-testid="chat-input"]`
  - Main content: element with `sticky` class and its previous sibling
- **Platform Guards**: RTL manager uses platform detection to ensure Claude.ai-specific logic doesn't run on ChatGPT and vice versa
