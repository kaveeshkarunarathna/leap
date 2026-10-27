// After `vite build`, copy dist/ into ../server/public so the Node app serves the site.
import { cpSync, rmSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const src = join(root, 'dist');
const dest = join(root, '..', 'server', 'public');
if (!existsSync(src)) throw new Error('dist/ not found; run vite build first');
rmSync(dest, { recursive: true, force: true });
cpSync(src, dest, { recursive: true });
console.log(`Copied build to ${dest}`);
