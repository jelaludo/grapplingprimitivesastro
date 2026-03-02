/**
 * json-to-md.mjs
 *
 * Converts BJJMasterList.json → individual .md files in src/content/
 * Run once:   node scripts/json-to-md.mjs
 *
 * Output structure:
 *   src/content/concepts/
 *     coaching/
 *       BJJ-100-concept-name.md    ← nested by category
 *     grappling-primitives/
 *       BJJ-002-collapse-frames.md
 *     ...
 *   src/content/categories/
 *     coaching.md
 *     grappling-primitives.md
 *     ...
 *
 * Each concept file contains [[CategoryName]] wikilink → powers Obsidian graph.
 * After running, open src/content/ as an Obsidian vault.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ── Config ────────────────────────────────────────────────────────────────────
const SOURCE = 'C:/01_Projects/01a_Coding/02_CodingProjects/grapplingprimitives/public/data/BJJMasterList.json';
const CONCEPTS_DIR   = join(ROOT, 'src/content/concepts');
const CATEGORIES_DIR = join(ROOT, 'src/content/categories');

// ── Helpers ───────────────────────────────────────────────────────────────────
function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

/**
 * Serialize a value as a YAML scalar.
 * - strings → double-quoted (safe for all chars)
 * - numbers / booleans → raw
 * - null/undefined → skip (caller should filter)
 */
function yamlVal(v) {
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return String(v);
  // Escape string: use JSON.stringify which produces valid YAML double-quoted string
  return JSON.stringify(String(v));
}

/**
 * Build a YAML frontmatter block from a plain object.
 * Supports one level of nesting (objects → block mapping).
 * Arrays of scalars use flow style.
 */
function frontmatter(obj) {
  const lines = ['---'];

  for (const [key, val] of Object.entries(obj)) {
    if (val === null || val === undefined) continue;

    if (Array.isArray(val)) {
      if (val.length === 0) {
        lines.push(`${key}: []`);
      } else {
        lines.push(`${key}: [${val.map(v => yamlVal(v)).join(', ')}]`);
      }
    } else if (typeof val === 'object') {
      lines.push(`${key}:`);
      for (const [k, v] of Object.entries(val)) {
        if (v !== null && v !== undefined) {
          lines.push(`  ${k}: ${yamlVal(v)}`);
        }
      }
    } else {
      lines.push(`${key}: ${yamlVal(val)}`);
    }
  }

  lines.push('---');
  return lines.join('\n');
}

// ── Load source ───────────────────────────────────────────────────────────────
const raw  = readFileSync(SOURCE, 'utf-8');
const data = JSON.parse(raw);

const { categories, skillsMasterList: rawConcepts } = data;

if (!categories || !rawConcepts) {
  console.error('❌  Unexpected JSON shape — expected { categories, skillsMasterList }');
  process.exit(1);
}

mkdirSync(CONCEPTS_DIR,   { recursive: true });
mkdirSync(CATEGORIES_DIR, { recursive: true });

// Pre-build category slug map  { "Coaching" → "coaching" }
const catSlugMap = new Map(categories.map(c => [c.name, slugify(c.name)]));

// ── Export categories ─────────────────────────────────────────────────────────
let catCount = 0;

for (const cat of categories) {
  const slug = slugify(cat.name);
  const fm   = frontmatter({
    id:    `cat-${slug}`,
    name:  cat.name,
    color: cat.color,
    ...(cat.xAxis ? { xAxis: cat.xAxis } : {}),
    ...(cat.yAxis ? { yAxis: cat.yAxis } : {}),
  });

  const body = `\n\n# ${cat.name}\n\n_Category description — add notes here in Obsidian._\n`;
  writeFileSync(join(CATEGORIES_DIR, `${slug}.md`), fm + body, 'utf-8');
  catCount++;
}

// ── Export concepts ───────────────────────────────────────────────────────────
let conceptCount  = 0;
let skippedCount  = 0;
const seen = new Set(); // avoid duplicate filenames

// Filter out duplicate-marker entries (IDs like "BJJ-001-dup-1")
const cleanConcepts = rawConcepts.filter(c => !c.id || !c.id.includes('-dup-'));
console.log(`   (skipped ${rawConcepts.length - cleanConcepts.length} legacy -dup- entries)`);

for (const c of cleanConcepts) {
  const id       = c.id || `BJJ-${String(++conceptCount).padStart(3, '0')}`;
  const name     = c.concept || 'Unnamed';
  const catName  = c.category || 'Uncategorised';
  const catSlug  = catSlugMap.get(catName) || slugify(catName);

  // Clamp axis values to [-1, 1]
  const ax_so = Math.max(-1, Math.min(1, c.axis_self_opponent   ?? 0));
  const ax_mp = Math.max(-1, Math.min(1, c.axis_mental_physical ?? 0));

  // ── Category subfolder ───────────────────────────────────────────────────
  // e.g. src/content/concepts/coaching/BJJ-100-name.md
  const catDir = join(CONCEPTS_DIR, catSlug);
  mkdirSync(catDir, { recursive: true });

  const nameSlug = slugify(name);
  let filename   = `${id}-${nameSlug}.md`;

  // Handle duplicate filenames (shouldn't happen with unique IDs but be safe)
  if (seen.has(filename)) {
    filename = `${id}-${nameSlug}-${conceptCount}.md`;
    skippedCount++;
  }
  seen.add(filename);

  const description = c.description || c.short_description || '';
  const short       = c.short_description || description.slice(0, 160) || '';

  const fm = frontmatter({
    id,
    concept:              name,
    category:             catName,
    axis_self_opponent:   ax_so,
    axis_mental_physical: ax_mp,
    color:                c.color || null,
    short_description:    short   || null,
    tags:                 [],
    related:              [],
  });

  // Body: description + category wikilink (powers Obsidian graph view)
  const descBlock  = description ? `${description}\n` : '_No description yet._\n';
  const wikilink   = `\n---\nCategory: [[${catName}]]\n`;
  writeFileSync(join(catDir, filename), fm + '\n\n' + descBlock + wikilink, 'utf-8');
  conceptCount++;
}

// ── Report ────────────────────────────────────────────────────────────────────
console.log(`\n✅  Migration complete`);
console.log(`   ${catCount}       categories → src/content/categories/`);
console.log(`   ${conceptCount}  concepts    → src/content/concepts/`);
if (skippedCount) console.log(`   ⚠️  ${skippedCount} duplicate filenames resolved`);
console.log(`\nNext steps:`);
console.log(`  1. In Obsidian: reload vault (Ctrl+R) or re-open src/content/`);
console.log(`  2. Concepts are now nested: concepts/{category}/BJJ-xxx.md`);
console.log(`  3. Each concept contains [[CategoryName]] → open Graph View to see links\n`);
