---
title: Content Vault
---

# Content Vault

This folder is an Astro content collection that doubles as an Obsidian vault.
Edit files here in Obsidian; they are consumed at build time by the site.

## Folders

| Folder | Purpose |
|--------|---------|
| `module-text/` | Reusable text blocks for site pages (TLDRs, landing page copy, intros) |
| `Articles/` | Long-form Obsidian-authored articles |
| `concepts/` | Individual grappling concepts (QuadTree map data) |
| `categories/` | Concept category definitions |
| `WordLists/` | Word lists for BJJ Wordle |

## module-text/ convention

Each `.md` file has **frontmatter only** (the markdown body is ignored).

```yaml
---
module: jibunwotsukure     # which module/page this belongs to
block: tldr                # block identifier (tldr, intro, principle-1, etc.)
en: "English text here"
ja: "Japanese text here"
---
```

### Formatting

Inline markdown works in `en` and `ja` fields:

- `**bold**` renders as **bold**
- `*italic*` renders as *italic*
- `~~strikethrough~~` renders as ~~strikethrough~~

Block-level markdown (headings, lists, code blocks) does **not** work — these are inline text fragments, not full documents.

### Dynamic placeholders

Some blocks use placeholders that get replaced at build time:

- `{{conceptCount}}` — total number of concepts
- `{{categoryCount}}` — total number of categories
- `[link text](/modules/slug)` — internal links (use relative paths from site root)

### Adding a new text block

1. Create a new `.md` file in `module-text/`
2. Name it `{module}-{block}.md` (e.g. `landing-intro.md`)
3. Add the frontmatter with `module`, `block`, `en`, and `ja` fields
4. In the `.astro` page, load it with `getEntry('module-text', '{module}-{block}')`
5. Render with `mdInline(entry.data.en)` inside a `set:html` fragment
