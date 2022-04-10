# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome/Firefox extension boilerplate built with React, TypeScript, Vite, and Turborepo. It uses a monorepo architecture with Turbo for build orchestration and pnpm for package management.

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
- `pnpm e2e` - Build, zip, and run E2E tests with WebdriverIO for Chrome
- `pnpm e2e:firefox` - Build, zip, and run E2E tests for Firefox

### Packaging
- `pnpm zip` - Create production Chrome extension zip
- `pnpm zip:firefox` - Create production Firefox extension zip
- Zipped extensions are placed in `./dist-zip/`

### Utilities
- `pnpm module-manager` - Interactive CLI to enable/disable extension pages (popup, options, etc.)
- `pnpm update-version <version>` - Update extension version across all package.json files
- `pnpm clean:bundle` - Remove dist directories
- `pnpm clean:node_modules` - Remove all node_modules
- `pnpm clean` - Complete cleanup (bundle, turbo cache, node_modules)

### Installing Dependencies
- Root: `pnpm i <package> -w`
- Specific module: `pnpm i <package> -F <module-name>` (e.g., `pnpm i lodash -F popup`)

## Architecture

### Monorepo Structure

This is a Turborepo-based monorepo with three main categories:

1. **chrome-extension/** - Core extension configuration
   - `manifest.ts` - Generates manifest.json (Manifest V3)
   - `src/background/` - Background service worker
   - `public/` - Static assets (icons, CSS)

2. **pages/** - Extension UI pages (each is a separate Vite app)
   - `content/` - Scripts injected into web pages (console-visible)
   - `content-ui/` - React components injected into web pages (shadow DOM)
   - `content-runtime/` - Runtime-injectable content scripts
   - `popup/` - Toolbar popup UI
   - `options/` - Extension options page
   - `new-tab/` - New tab override page
   - `side-panel/` - Chrome side panel (Chrome 114+, auto-removed for Firefox)
   - `devtools/` - DevTools extension entry point
   - `devtools-panel/` - DevTools panel UI

3. **packages/** - Shared utilities and configs
   - `shared/` - Common types, hooks, utilities, components
   - `storage/` - Chrome storage API wrappers with type safety
   - `hmr/` - Custom HMR plugin with WebSocket-based rebuild notifications
   - `i18n/` - Type-safe internationalization with Chrome i18n API
   - `env/` - Environment variable management
   - `ui/` - Shared UI components and Tailwind utilities
   - `vite-config/` - Shared Vite configurations
   - `tsconfig/` - Shared TypeScript configurations
   - `tailwind-config/` - Shared Tailwind configuration
   - `dev-utils/` - Development utilities (manifest parser, logger)
   - `module-manager/` - CLI tool for managing extension pages
   - `zipper/` - Extension packaging utility

### Key Architecture Patterns

**Content Script Injection**: Uses a pattern-based system where content scripts are matched to specific URL patterns. Content UI components use Shadow DOM to isolate styles from host pages (see `initAppWithShadow` in `packages/shared/lib/utils/init-app-with-shadow.ts`).

**Storage System**: Wrapper around Chrome Storage API providing:
- Type-safe storage operations
- Reactive state management across extension contexts
- Session storage with optional content script access
- Local storage for persistent data

**HMR System**: Custom Vite plugin (`packages/hmr/`) that:
- Runs WebSocket server on build completion
- Injects reload/refresh code into extension pages
- Supports both full reloads and React component refreshes
- Automatically reconnects after connection loss

**Manifest Generation**: TypeScript-based manifest (`chrome-extension/manifest.ts`) is parsed and transformed for Firefox compatibility, automatically removing unsupported features like `sidePanel`.

**Module Management**: The `module-manager` package allows disabling unused pages by:
- Compressing and archiving page directories
- Removing entries from manifest.json
- Allowing recovery from archived snapshots

**Build System**: Turborepo orchestrates parallel builds with dependency awareness:
- `ready` task runs first (dependencies/setup)
- `dev` task is persistent with file watching
- `build` task depends on `ready` and sibling `build` tasks
- All output goes to `./dist/` directory

## Important Notes

- **Node Version**: Requires Node.js >= 22.15.1 (see engines in package.json)
- **Package Manager**: Must use pnpm 10.11.0
- **Windows**: Requires WSL with Linux distribution installed
- **Firefox Limitations**:
  - Add-ons load in temporary mode and disappear on browser close
  - Shadow DOM uses inline styles due to Firefox bug with adoptedStyleSheets
  - Side panel feature is auto-removed from manifest
- **Permissions**: Development manifest includes `<all_urls>` for convenience; restrict in production
- **Module Manager**: If editing content script matches, update `packages/module-manager/lib/const.ts` MODULE_CONFIG to ensure proper recovery
