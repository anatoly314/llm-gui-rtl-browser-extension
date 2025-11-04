<div align="center">
  <img src="icon.png" alt="AI Chat RTL Support Logo" width="128" height="128">

  # AI Chat RTL Support

  A browser extension that adds comprehensive right-to-left (RTL) text direction support to AI chat interfaces. Supports Claude.ai and ChatGPT. Perfect for users who work with RTL languages like Arabic, Hebrew, Persian, and Urdu.
</div>

## ✨ Features

### Claude.ai
- **Independent RTL Controls**: Toggle RTL separately for:
  - Chat input field
  - Main conversation content
  - Side panel
- **KaTeX Support**: Mathematical expressions automatically preserved in LTR direction
- **Configurable Panel Position**: Place the control panel at top, right, bottom, or left of the screen
- **Works Everywhere**: Functions on `/new`, `/project/*` pages and in active chats

### ChatGPT
- **KaTeX Fix**: Force mathematical expressions to display correctly in RTL responses
- **Smart Detection**: Automatically detects ChatGPT conversations

### General
- **Tabbed Interface**: Platform-specific controls with automatic tab selection
- **Per-Chat Settings**: RTL preferences are saved per conversation with automatic UUID storage
- **Modern UI**: Beautiful toggle switches with smooth animations
- **Persistent Storage**: Settings are automatically saved and restored across sessions
- **Smart Detection**: Automatically detects chat changes and applies saved settings

## 🚀 Installation

### From Release

1. Download the latest release ZIP from the [Releases page](https://github.com/anatoly314/llm-gui-rtl-browser-extension/releases)
2. Extract the ZIP file
3. Open Chrome and navigate to `chrome://extensions`
4. Enable "Developer mode" in the top right
5. Click "Load unpacked" and select the extracted folder

### From Source

1. Clone the repository: `git clone https://github.com/anatoly314/llm-gui-rtl-browser-extension.git`
2. Install dependencies: `pnpm install`
3. Build the extension: `pnpm build`
4. Load the `dist` folder in Chrome as an unpacked extension

## 📖 Usage

### On Claude.ai

1. Navigate to [Claude.ai](https://claude.ai)
2. Hover over the blue trigger bar at the top/right/bottom/left of the screen
3. The control panel will slide out with the Claude.ai tab selected
4. Configure:
   - Panel position (top, right, bottom, left)
   - Chat input direction (LTR/RTL)
   - Main content direction (LTR/RTL)
   - Side panel direction (LTR/RTL)
5. Your settings are automatically saved per chat

### On ChatGPT

1. Navigate to [ChatGPT](https://chatgpt.com)
2. Hover over the blue trigger bar at the top/right/bottom/left of the screen
3. The control panel will slide out with the ChatGPT tab selected
4. Enable "Fix KaTeX Math Expressions" to force math to display correctly in RTL responses
5. Your settings are automatically saved per chat

Note: Tabs are platform-specific - you can only use the Claude.ai tab on Claude.ai and the ChatGPT tab on ChatGPT.

## 👨‍💻 Author

Created by [Anatoly Tarnavsky](https://anatoly.dev)

## 🛠️ Built With

- React + TypeScript
- Vite
- Turborepo (monorepo architecture)
- Chrome Extension Manifest V3
- Tailwind CSS
