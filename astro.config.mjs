import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import rehypeObsidianImages from './src/lib/remark-obsidian-images.mjs';
import fs   from 'node:fs/promises';
import path from 'node:path';

// ── Kanri dev plugin ──────────────────────────────────────────────────────────
// Provides POST /api/kanri in the Vite dev server only.
// Updates axis_self_opponent / axis_mental_physical in the matching .md file.
// Never included in production builds — configureServer only runs in dev.
const kanriPlugin = {
  name: 'kanri-dev',
  configureServer (server) {
    server.middlewares.use('/api/kanri', async (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');

      if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return; }
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
      }

      try {
        // Buffer request body
        const raw = await new Promise((resolve, reject) => {
          let buf = '';
          req.on('data',  chunk => { buf += chunk; });
          req.on('end',   ()    => resolve(buf));
          req.on('error', reject);
        });

        const { id, x, y } = JSON.parse(raw);
        if (!id || x === undefined || y === undefined)
          throw new Error('Body must contain { id, x, y }');

        // Walk src/content/concepts/** to find the matching file
        const conceptsRoot = path.join(process.cwd(), 'src', 'content', 'concepts');
        const file = await findConceptFile(conceptsRoot, id);
        if (!file) {
          res.statusCode = 404;
          res.end(JSON.stringify({ error: `No .md file found for id: ${id}` }));
          return;
        }

        // Patch axis values in frontmatter (regex replace, preserves everything else)
        let content = await fs.readFile(file, 'utf-8');
        content = content.replace(/(axis_self_opponent:\s*)[-\d.]+/,  `$1${Number(x).toFixed(4)}`);
        content = content.replace(/(axis_mental_physical:\s*)[-\d.]+/, `$1${Number(y).toFixed(4)}`);

        // Suppress HMR: unwatch before write, re-add after chokidar poll window
        server.watcher.unwatch(file);
        await fs.writeFile(file, content, 'utf-8');
        setTimeout(() => server.watcher.add(file), 800);

        res.end(JSON.stringify({ ok: true, id, x: Number(x).toFixed(4), y: Number(y).toFixed(4), file: path.relative(process.cwd(), file) }));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  },
};

// Recursive file finder — avoids relying on Dirent.path (Node 20.12+ only)
async function findConceptFile (dir, id) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const found = await findConceptFile(fullPath, id);
      if (found) return found;
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      // Match "BJJ-030-6dof.md" → id "BJJ-030"
      if (entry.name.startsWith(id + '-') || entry.name === id + '.md') {
        return fullPath;
      }
    }
  }
  return null;
}

export default defineConfig({
  integrations: [tailwind()],
  site: 'https://jelaludo.github.io',
  base: '/grapplingprimitivesastro',
  markdown: {
    rehypePlugins: [rehypeObsidianImages],
  },
  vite: {
    plugins: [kanriPlugin],
  },
});
