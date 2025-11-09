import { readFileSync } from 'node:fs';
import type { ManifestType } from '@extension/shared';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));

/**
 * @prop browser_specific_settings
 * Must be unique to your extension to upload to addons.mozilla.org
 * (you can delete if you only want a chrome extension)
 *
 * @prop permissions
 * Firefox doesn't support sidePanel (It will be deleted in manifest parser)
 *
 * @prop content_scripts
 * css: ['content.css'], // public folder
 */
const manifest = {
  manifest_version: 3,
  name: 'AI Chat RTL Support',
  browser_specific_settings: {
    gecko: {
      id: 'ai-chat-rtl@anatoly.dev',
      strict_min_version: '109.0',
    },
  },
  version: packageJson.version,
  description:
    'Add right-to-left text direction support to AI chat interfaces with independent toggles for input, content, and side panels',
  host_permissions: ['https://claude.ai/*', 'https://chatgpt.com/*', 'https://notebooklm.google.com/*'],
  permissions: ['storage'],
  options_page: 'options/index.html',
  action: {
    default_popup: 'popup/index.html',
    default_icon: 'icon-34.png',
  },
  icons: {
    '128': 'icon-128.png',
  },
  content_scripts: [
    {
      matches: ['https://claude.ai/*', 'https://chatgpt.com/*', 'https://notebooklm.google.com/*'],
      js: ['content-ui/all.iife.js'],
    },
  ],
  web_accessible_resources: [
    {
      resources: ['*.js', '*.css', '*.svg', 'icon-128.png', 'icon-34.png'],
      matches: ['https://claude.ai/*', 'https://chatgpt.com/*', 'https://notebooklm.google.com/*'],
    },
  ],
} satisfies ManifestType;

export default manifest;
