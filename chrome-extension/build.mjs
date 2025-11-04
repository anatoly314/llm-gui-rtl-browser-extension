import { writeFileSync, cpSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import manifest
const manifestModule = await import('./manifest.js');
const manifest = manifestModule.default;

// Paths
const distPath = join(__dirname, '..', 'dist');
const publicPath = join(__dirname, 'public');

// Create dist directory
mkdirSync(distPath, { recursive: true });

// Write manifest.json
writeFileSync(join(distPath, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('✓ manifest.json created');

// Copy public assets
cpSync(publicPath, distPath, { recursive: true });
console.log('✓ Public assets copied');

console.log('Build complete!');
