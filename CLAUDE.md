# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome/Firefox extension that adds comprehensive right-to-left (RTL) text direction support to Claude.ai. Built on a Turborepo monorepo with React, TypeScript, Vite, and pnpm. The extension allows users to independently control RTL direction for chat input, main conversation content, and side panel on a per-conversation basis.

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

1. **pages/content-ui/** - Main RTL control panel injected into Claude.ai
   - Sliding panel UI with hover trigger bar
   - Position configurable (top, right, bottom, left)
   - Three independent RTL toggles (chat input, main content, side panel)
   - Automatically detects chat changes and applies saved settings

2. **pages/popup/** - Browser toolbar popup
   - Simple extension popup accessed from browser toolbar

3. **pages/options/** - Extension options/about page
   - Shows extension features and author info
   - Accessible via right-click extension icon → Options

### Core RTL System

**RTL Manager** (`packages/shared/lib/utils/rtl-manager.ts`):
The heart of the extension. Handles DOM element detection, RTL state management, and per-chat persistence.

Key functions:
- `findSidePanelContent()` - Locates side panel by traversing from `.cursor-col-resize` anchor
- `findChatInput()` - Finds chat input via `[data-testid="chat-input"]`
- `findMainContent()` - Traverses up from chat input to sticky element, then selects previous sibling
- `getEffectiveChatId()` - Returns actual chat UUID or "new" for `/new` page
- `toggleRTL()` / `toggleChatInputRTL()` / `toggleMainContentRTL()` - Toggle and persist RTL state
- `initRTLManager()` - Starts MutationObserver to reapply RTL on DOM changes and URL navigation
- `transferNewChatSettings()` - Transfers settings from "new" temp key to actual chat UUID
- `clearNewChatSettings()` - Clears temporary "new" settings when navigating to `/new`

**Chat Utilities** (`packages/shared/lib/utils/chat-utils.ts`):
- `getCurrentChatId()` - Extracts chat UUID from URL using regex `/chat\/([a-f0-9-]+)/i`
- `isChatPage()` - Checks if current path starts with `/chat/`

### Storage System

**Chat RTL Storage** (`packages/storage/lib/impl/chat-rtl-storage.ts`):
- Uses Chrome Local Storage with live updates
- Stores settings per chat UUID: `{ chats: { [chatId]: ChatRTLSettings } }`
- Each chat has: `isRTL`, `isChatInputRTL`, `isMainContentRTL`, `direction`, `textAlign`
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
When user is on `/new` page, settings are stored with key "new". When they send first message and URL changes to `/chat/[uuid]`, settings are transferred from "new" to the actual UUID and "new" key is cleared. This ensures:
- Settings work immediately on `/new` page
- Settings persist when chat gets a real UUID
- Fresh start every time user navigates to `/new`

**DOM Reapplication Strategy**:
MutationObserver watches for:
1. URL changes (navigation between chats or to/from `/new`)
2. DOM recreation (Claude.ai dynamically rebuilds elements)
3. Element tracking prevents unnecessary reapplications (compares element references and current styles)

**Control Panel Visibility**:
Panel only shows when `shouldShowPanel` is true, which requires:
- Current path is `/new` OR
- A valid chat UUID exists in URL
This prevents panel from appearing on landing pages or other non-chat routes.

### Monorepo Structure

Built on Turborepo with shared packages:

**packages/**:
- `shared/` - RTL manager, chat utilities, hooks, common components
- `storage/` - Chrome storage API wrappers (chat RTL storage, position storage)
- `hmr/` - Custom HMR plugin with WebSocket-based rebuild notifications
- `i18n/` - Type-safe internationalization with Chrome i18n API
- `ui/` - Shared UI components (Toast, LoadingSpinner, etc.) and Tailwind utilities
- `vite-config/` - Shared Vite configurations
- `tsconfig/` - Shared TypeScript configurations
- `tailwind-config/` - Shared Tailwind configuration
- `dev-utils/` - Development utilities (manifest parser, logger)
- `zipper/` - Extension packaging utility

**chrome-extension/**:
- `manifest.ts` - Generates manifest.json (Manifest V3) with Claude.ai permissions
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
- **Target Site**: Only works on https://claude.ai/* (see manifest host_permissions)
- **Windows**: Requires WSL with Linux distribution installed
- **Firefox Limitations**:
  - Add-ons load in temporary mode and disappear on browser close
  - Shadow DOM uses inline styles due to Firefox bug with adoptedStyleSheets
- **DOM Selectors**: Extension relies on specific Claude.ai DOM structure. May break if Claude.ai redesigns their UI:
  - Side panel: anchored to `.cursor-col-resize.max-md\:hidden`
  - Chat input: `[data-testid="chat-input"]`
  - Main content: element with `sticky` class and its previous sibling
