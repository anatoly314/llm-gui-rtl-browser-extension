<div align="center">
  <img src="icon.png" alt="Claude.ai RTL Support Logo" width="128" height="128">

  # Claude.ai RTL Support

  A Chrome extension that adds comprehensive right-to-left (RTL) text direction support to Claude.ai. Perfect for users who work with RTL languages like Arabic, Hebrew, Persian, and Urdu.
</div>

## ✨ Features

- **Independent RTL Controls**: Toggle RTL separately for:
  - Chat input field
  - Main conversation content
  - Side panel
- **Per-Chat Settings**: RTL preferences are saved per conversation using UUID storage
- **Configurable Panel Position**: Place the control panel at top, right, bottom, or left of the screen
- **Works Everywhere**: Functions on both the `/new` page and in active chats
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

1. Navigate to [Claude.ai](https://claude.ai)
2. Hover over the blue trigger bar at the top/right/bottom/left of the screen
3. The control panel will slide out with options for:
   - Panel position (top, right, bottom, left)
   - Chat input direction (LTR/RTL)
   - Main content direction (LTR/RTL)
   - Side panel direction (LTR/RTL)
4. Your settings are automatically saved per chat

## 👨‍💻 Author

Created by [Anatoly Tarnavsky](https://anatoly.dev)

## 🛠️ Built With

This extension is built using the excellent [Chrome Extension Boilerplate with React + Vite](https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite) by [Jonghakseo](https://jonghakseo.github.io/).
