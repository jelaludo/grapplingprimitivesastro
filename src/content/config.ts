import { defineCollection, z } from 'astro:content';

// ── Concepts ──────────────────────────────────────────────────────────────────
// Each .md file in src/content/concepts/ is one grappling concept.
// Frontmatter fields are validated here; the .md body is the full description.
const concepts = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),                              // e.g. "BJJ-042"
    concept: z.string(),                         // display name
    category: z.string(),                        // category name
    axis_self_opponent: z.number().min(-1).max(1),  // -1=Opponent  +1=Self
    axis_mental_physical: z.number().min(-1).max(1), // -1=Physical  +1=Mental
    color: z.string().optional(),               // hex colour from category
    short_description: z.string().optional(),
    tags: z.array(z.string()).default([]),
    related: z.array(z.string()).default([]),    // wikilink slugs
  }),
});

// ── Categories ────────────────────────────────────────────────────────────────
// Each .md file in src/content/categories/ defines one category.
const categories = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),          // e.g. "cat-grappling-primitives"
    name: z.string(),        // display name
    color: z.string(),       // hex colour
    xAxis: z.object({ left: z.string(), right: z.string() }).optional(),
    yAxis: z.object({ bottom: z.string(), top: z.string() }).optional(),
  }),
});

// ── Articles ─────────────────────────────────────────────────────────────────
// Obsidian-authored long-form articles. No required frontmatter.
const Articles = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().optional(),
    date: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

// ── Module Text ──────────────────────────────────────────────────────────────
// Obsidian-editable text blocks for module pages (TLDRs, intros, etc.)
// Frontmatter carries en/ja text; markdown body is unused.
const module_text = defineCollection({
  type: 'content',
  schema: z.object({
    module: z.string(),                   // e.g. "jibunwotsukure"
    block: z.string(),                    // e.g. "tldr"
    en: z.string(),                       // English text
    ja: z.string(),                       // Japanese text
  }),
});

// ── Word Lists ──────────────────────────────────────────────────────────────
// Word lists for BJJ Wordle (4–7 letter words). No required frontmatter.
const WordLists = defineCollection({
  type: 'content',
  schema: z.object({}).passthrough(),
});

export const collections = { concepts, categories, Articles, 'module-text': module_text, WordLists };
