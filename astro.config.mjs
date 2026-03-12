import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import rehypeObsidianImages from './src/lib/remark-obsidian-images.mjs';
import fs   from 'node:fs/promises';
import path from 'node:path';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Slugify a filename the same way Astro does (lowercase, each char → hyphen, no collapse) */
function slugify (name) {
  return name.replace(/\.md$/i, '').toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Normalize slug for comparison (collapse hyphens so minor differences don't break matching) */
function normalizeSlug (s) {
  return s.replace(/-+/g, '-').replace(/^-|-$/g, '');
}

/** Recursive file finder — avoids relying on Dirent.path (Node 20.12+ only) */
async function findContentFile (dir, id) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const found = await findContentFile(fullPath, id);
      if (found) return found;
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      // Match by ID prefix ("BJJ-030-6dof.md" → id "BJJ-030")
      if (entry.name.startsWith(id + '-') || entry.name === id + '.md') {
        return fullPath;
      }
      // Match by Astro slug ("6DoF - Degrees of Freedom.md" → slug "6dof---degrees-of-freedom")
      if (normalizeSlug(slugify(entry.name)) === normalizeSlug(id)) {
        return fullPath;
      }
    }
  }
  return null;
}

/** Suppress HMR: unwatch before write, re-add after chokidar poll window */
async function writeWithHmrSuppression (server, filePath, content) {
  server.watcher.unwatch(filePath);
  await fs.writeFile(filePath, content, 'utf-8');
  setTimeout(() => server.watcher.add(filePath), 800);
}

/** Validate that a file path resolves inside the project root (path traversal protection) */
function resolveInsideProject (file) {
  const root = process.cwd();
  const resolved = path.resolve(root, file);
  if (!resolved.startsWith(root + path.sep) && resolved !== root) {
    throw new Error(`Path traversal blocked: ${file}`);
  }
  return resolved;
}

/** Set a value at a dot/bracket path in an object. Handles "a.b[0].c", "[2].name", etc. */
function setPath (obj, pathStr, value) {
  const keys = [];
  pathStr.replace(/\[(\d+)\]/g, '.$1').split('.').forEach(k => {
    if (k !== '') keys.push(/^\d+$/.test(k) ? Number(k) : k);
  });
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (cur[k] === undefined || cur[k] === null) {
      cur[k] = typeof keys[i + 1] === 'number' ? [] : {};
    }
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
  return obj;
}

// ── Action handlers ─────────────────────────────────────────────────────────

async function handleMoveNode (server, { id, x, y }) {
  if (!id || x === undefined || y === undefined)
    throw new Error('move-node requires { id, x, y }');

  const conceptsRoot = path.join(process.cwd(), 'src', 'content', 'concepts');
  const file = await findContentFile(conceptsRoot, id);
  if (!file) return { status: 404, body: { error: `No .md file found for id: ${id}` } };

  let content = await fs.readFile(file, 'utf-8');
  content = content.replace(/(axis_self_opponent:\s*)[-\d.]+/,  `$1${Number(x).toFixed(4)}`);
  content = content.replace(/(axis_mental_physical:\s*)[-\d.]+/, `$1${Number(y).toFixed(4)}`);

  await writeWithHmrSuppression(server, file, content);
  return { body: { ok: true, id, x: Number(x).toFixed(4), y: Number(y).toFixed(4), file: path.relative(process.cwd(), file) } };
}

async function handlePatchFrontmatter (server, { collection, fileId, field, value }) {
  if (!collection || !fileId || !field)
    throw new Error('patch-frontmatter requires { collection, fileId, field, value }');

  const collectionRoot = path.join(process.cwd(), 'src', 'content', collection);
  const file = await findContentFile(collectionRoot, fileId);
  if (!file) return { status: 404, body: { error: `No .md file found for id: ${fileId} in ${collection}` } };

  let content = await fs.readFile(file, 'utf-8');
  const escapedField = field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const formatted = typeof value === 'number' ? String(value) : `"${String(value).replace(/"/g, '\\"')}"`;
  const fieldRegex = new RegExp(`(${escapedField}:\\s*).*`);
  if (fieldRegex.test(content)) {
    // Replace existing field
    content = content.replace(fieldRegex, `$1${formatted}`);
  } else {
    // Insert new field after opening ---
    content = content.replace(/^---\s*\n/, `---\n${field}: ${formatted}\n`);
  }

  await writeWithHmrSuppression(server, file, content);
  return { body: { ok: true, collection, fileId, field, value, file: path.relative(process.cwd(), file) } };
}

async function handlePatchJson (server, { file, path: dotPath, value }) {
  if (!file || dotPath === undefined)
    throw new Error('patch-json requires { file, path, value }');

  const resolved = resolveInsideProject(file);
  const data = JSON.parse(await fs.readFile(resolved, 'utf-8'));
  setPath(data, dotPath, value);

  await writeWithHmrSuppression(server, resolved, JSON.stringify(data, null, 2) + '\n');
  return { body: { ok: true, file, path: dotPath, value } };
}

async function handlePatchAstroString (server, { file, original, replacement }) {
  if (!file || original === undefined || replacement === undefined)
    throw new Error('patch-astro-string requires { file, original, replacement }');

  const resolved = resolveInsideProject(file);
  let content = await fs.readFile(resolved, 'utf-8');
  content = content.replace(original, replacement);

  await writeWithHmrSuppression(server, resolved, content);
  return { body: { ok: true, file } };
}

// ── Kanri dev plugin ──────────────────────────────────────────────────────────
// Provides POST /api/kanri in the Vite dev server only.
// Multi-action dispatch: move-node, patch-frontmatter, patch-json, patch-astro-string.
// Never included in production builds — configureServer only runs in dev.

const actionHandlers = {
  'move-node':          handleMoveNode,
  'patch-frontmatter':  handlePatchFrontmatter,
  'patch-json':         handlePatchJson,
  'patch-astro-string': handlePatchAstroString,
};

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

        const body = JSON.parse(raw);

        // Backward compat: if no action but id/x/y present, treat as move-node
        const action = body.action || (body.id && body.x !== undefined && body.y !== undefined ? 'move-node' : undefined);
        if (!action) throw new Error('Missing "action" field. Supported: ' + Object.keys(actionHandlers).join(', '));

        const handler = actionHandlers[action];
        if (!handler) throw new Error(`Unknown action: ${action}. Supported: ${Object.keys(actionHandlers).join(', ')}`);

        const result = await handler(server, body);
        res.statusCode = result.status || 200;
        res.end(JSON.stringify(result.body));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  },
};

export default defineConfig({
  integrations: [tailwind()],
  site: 'https://www.grapplingprimitives.com',
  markdown: {
    rehypePlugins: [rehypeObsidianImages],
  },
  vite: {
    plugins: [kanriPlugin],
  },
});
