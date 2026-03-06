// Syncs image files from src/content/ (Obsidian vault) to public/images/articles/
// so they are available as static assets at build time.
// Only copies files that are new or have been modified.

import fs from 'node:fs';
import path from 'node:path';

const CONTENT_DIR = path.resolve('src/content');
const TARGET_DIR = path.resolve('public/images/articles');
const EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp']);

fs.mkdirSync(TARGET_DIR, { recursive: true });

let copied = 0;
let skipped = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      const dest = path.join(TARGET_DIR, entry.name);

      // Skip if target exists and is same size + same or newer mtime
      if (fs.existsSync(dest)) {
        const srcStat = fs.statSync(full);
        const dstStat = fs.statSync(dest);
        if (dstStat.size === srcStat.size && dstStat.mtimeMs >= srcStat.mtimeMs) {
          skipped++;
          continue;
        }
      }

      fs.copyFileSync(full, dest);
      copied++;
    }
  }
}

walk(CONTENT_DIR);
console.log(`[sync-images] ${copied} copied, ${skipped} unchanged`);
