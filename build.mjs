import { cpSync, mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = __dirname;
const dist = `${root}/dist`;

// 1. Create dist folder
if (!existsSync(dist)) mkdirSync(dist, { recursive: true });

// 2. Copy all static files
cpSync(`${root}/index.html`, `${dist}/index.html`);
cpSync(`${root}/styles.css`, `${dist}/styles.css`);
cpSync(`${root}/script.js`, `${dist}/script.js`);
cpSync(`${root}/assets`, `${dist}/assets`, { recursive: true });

console.log('Build complete → dist/');
