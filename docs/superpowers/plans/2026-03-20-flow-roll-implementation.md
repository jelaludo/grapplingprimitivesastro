# Flow-Roll Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate two standalone HTML flow articles into a single tabbed Astro module at `/modules/flow-roll`, adapted to the site's terminal/monospace visual identity.

**Architecture:** Single `.astro` file with scoped `<style>` and inline `<script>`. Two tab panels toggled via JS. All content is static HTML with three interactive features: an intensity slider (Tab 1), an 8-channel canvas diagram (Tab 2), and condition/characteristic/consequence tab toggles (Tab 2). Intersection observer animates Tab 2 sections on scroll.

**Tech Stack:** Astro, vanilla JS, CSS (no Tailwind classes in module -- all scoped inline styles matching site palette values), inline SVG.

**Spec:** `docs/superpowers/specs/2026-03-20-flow-roll-module-design.md`

**Source files:**
- `G:\L_Download2026\flow-bjj_Specific_jelastyle.html` (Tab 1 content)
- `G:\L_Download2026\flow-theory_jelastyle.html` (Tab 2 content)

**Site reference files:**
- `src/layouts/BaseLayout.astro` -- layout wrapper
- `src/pages/modules/where-to-start.astro` -- toolbar pattern reference
- `src/pages/modules/ideal-partner.astro` -- toolbar pattern reference
- `src/styles/global.css` -- CSS variables (--text-xs through --text-lg)
- `tailwind.config.mjs` -- color palette values
- `src/pages/experiments.astro` -- registration target

**Color palette (use these exact values throughout):**
- `--fr-bg: #050509` / `--fr-surface: #0E1014` / `--fr-border: #1C1F26`
- `--fr-accent: #4C8DFF` / `--fr-cyan: #00FFFF` / `--fr-accent-soft: #A970FF`
- `--fr-text: #E5E7EB` / `--fr-muted: #9CA3AF` / `--fr-dim: #6B7280`
- Zone colors: dim `#6B7280`, green `#34D399`, cyan `#00FFFF`, amber `#F59E0B`, accent `#4C8DFF`, red `#EF4444`

**Font stack (use everywhere, including SVG text attributes and canvas font strings):**
`"Courier New", Consolas, Monaco, monospace`

**CSS variable actual values (for reference when sizing inline elements):**
- `--text-xs`: `clamp(12px, 0.9vw + 4px, 16px)` -- labels, eyebrows, badges
- `--text-sm`: `clamp(14px, 1.0vw + 5px, 18px)` -- captions, card text
- `--text-base`: `clamp(16px, 1.1vw + 6px, 21px)` -- body paragraphs
- `--text-lg`: `clamp(18px, 1.2vw + 7px, 24px)` -- lead text, emphasis

**Important notes for implementer:**
- Do NOT port Google Fonts `<link>` or `<link rel="preconnect">` tags from source files
- Do NOT port the nav active-state IntersectionObserver from `flow-theory_jelastyle.html` (source lines 1229-1240) -- only port the section fade-in observer
- In SVG `fill`/`stroke` attributes, use literal hex values (e.g., `#6B7280`), not CSS variables -- SVG attributes don't reliably resolve CSS custom properties
- Tab switch should use `window.scrollTo({top:0, behavior:'instant'})` to avoid smooth-scroll animation
- Support both `#sparring` and `#research` URL hashes

---

## Task 1: Page Shell -- Toolbar, Tab Bar, Tab Switching

**Files:**
- Create: `src/pages/modules/flow-roll.astro`

This task creates the empty page scaffold that all subsequent tasks build into. It must be visually verifiable: toolbar renders, both tabs toggle, placeholder content appears.

- [ ] **Step 1: Create the Astro page with frontmatter, toolbar, and tab bar**

Port the toolbar pattern from `where-to-start.astro` (lines 9-15). Add a sticky tab bar at `top:36px`. Add two tab content divs (empty placeholders with section labels). Add the tab-switching JS and base CSS custom properties.

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
---

<BaseLayout title="Flow & Roll — Grappling Primitives" fullscreen={true}>

<!-- Toolbar (fixed, 36px) -->
<div id="toolbar" style="position:fixed;top:0;left:0;right:0;height:36px;z-index:50;display:flex;align-items:center;gap:8px;padding:0 12px;border-bottom:1px solid #21262d;background:rgba(5,5,9,0.97);backdrop-filter:blur(8px);font-family:'Courier New',Consolas,Monaco,monospace;">
  <a href={`${base}/`} style="font-size:10px;letter-spacing:0.2em;color:#6b7280;text-transform:uppercase;text-decoration:none;" onmouseover="this.style.color='#00d4ff'" onmouseout="this.style.color='#6b7280'">← Home</a>
  <span style="color:#21262d;">|</span>
  <span style="font-size:11px;letter-spacing:0.2em;color:#6b7280;text-transform:uppercase;">Flow & Roll</span>
  <div style="flex:1;"></div>
  <button id="deeplink-btn" style="font-family:inherit;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;padding:3px 10px;border-radius:3px;cursor:pointer;border:1px solid #21262d;background:transparent;color:#6b7280;transition:all 0.15s;" onmouseover="this.style.borderColor='rgba(0,212,255,0.4)';this.style.color='#00d4ff'" onmouseout="if(this.textContent==='Link'){this.style.borderColor='#21262d';this.style.color='#6b7280'}">Link</button>
</div>

<!-- Tab Bar (sticky, below toolbar) -->
<div class="fr-tab-bar">
  <button class="fr-tab active" data-tab="sparring">Flow in Sparring</button>
  <button class="fr-tab" data-tab="research">The Research</button>
</div>

<!-- Tab Content -->
<div class="fr-content">
  <div id="tab-sparring" class="fr-panel active">
    <p style="padding:2rem;color:#9CA3AF;">Tab 1: Flow in Sparring (content coming)</p>
  </div>
  <div id="tab-research" class="fr-panel">
    <p style="padding:2rem;color:#9CA3AF;">Tab 2: The Research (content coming)</p>
  </div>
</div>

<style> /* see step for full CSS */ </style>
<script> /* see step for tab switching + deeplink JS */ </script>
</BaseLayout>
```

The `<style>` block must include:
- CSS custom properties (all `--fr-*` vars listed in palette above)
- `.fr-tab-bar`: sticky, `top:36px`, z-index 49, flex row, `--fr-surface` bg, border-bottom `--fr-border`
- `.fr-tab`: monospace, `var(--text-xs)`, uppercase, tracking 0.15em, padding `8px 16px`, `--fr-dim` color, no border, transparent bg, cursor pointer, transition
- `.fr-tab.active`: `--fr-accent` color, border-bottom 2px solid `--fr-accent`
- `.fr-panel`: hidden by default (`display:none`)
- `.fr-panel.active`: `display:block`
- `.fr-content`: `padding-top:72px` (36px toolbar + 36px tab bar)

The `<script>` block must include:
- Tab switching: querySelectorAll `.fr-tab`, on click toggle `.active` on tabs and panels, scroll window to top
- Deeplink button: copy current URL to clipboard, change text to "Copied!" briefly
- Hash support: on load, if `#research` hash, activate research tab

- [ ] **Step 2: Verify in browser**

Run: `npm run dev` (or `npx astro dev`)
Verify:
- Toolbar renders at top with "Home" link and "Flow & Roll" title
- Tab bar sticks below toolbar on scroll
- Clicking tabs toggles placeholder content
- Deeplink button copies URL

- [ ] **Step 3: Commit**

```bash
git add src/pages/modules/flow-roll.astro
git commit -m "feat(flow-roll): scaffold page shell with toolbar and tab switching"
```

---

## Task 2: Tab 1 -- Header + Sections S01-S03 (Static Content)

**Files:**
- Modify: `src/pages/modules/flow-roll.astro`

Port the header and first three sections from `flow-bjj_Specific_jelastyle.html`. These are all static HTML content (no JS interactivity). Apply the site palette and typography.

- [ ] **Step 1: Replace Tab 1 placeholder with header + S01-S03 content**

Source reference lines in `flow-bjj_Specific_jelastyle.html`:
- Header: lines 471-481
- S01 (The Core Problem): lines 483-515
- S02 (The Aliveness Condition): lines 517-541
- S03 (Disambiguating): lines 543-567

Port the HTML structure. Key adaptations:
- Strip all original inline styles and classes
- Apply new class names prefixed with `fr-` to avoid conflicts
- Header: render title as `<h1>` with `fr-hero-title` class, subtitle as `<p class="fr-hero-sub">`, status badge as small monospace span, back-link becomes a JS call to switch to research tab
- S01-S03: use `fr-section`, `fr-eyebrow`, `fr-heading`, `fr-two-col`, `fr-problem-grid`, `fr-problem-cell`, `fr-callout`, `fr-musing` classes
- Chinese characters in S02 callout: keep the `<div>` with large font size, no special font needed
- S03 problem grid: set `grid-template-columns: repeat(3, 1fr)` for the three-concept disambiguation

- [ ] **Step 2: Add CSS for all static content components**

Add to the `<style>` block:
- `fr-section`: padding `3rem 8vw`, border-bottom `1px solid var(--fr-border)`
- `fr-eyebrow`: `var(--text-xs)`, `var(--fr-dim)`, uppercase, letter-spacing 0.15em, margin-bottom 0.8rem
- `fr-heading`: `clamp(1.4rem, 3vw, 2rem)`, `var(--fr-text)`, line-height 1.2, margin-bottom 1.2rem
- `fr-hero-title`: `clamp(2rem, 5vw, 3.5rem)`, `var(--fr-text)`, line-height 1.1
- `fr-hero-title em`: `var(--fr-accent)`, font-style italic
- `fr-hero-sub`: `var(--text-base)`, `var(--fr-muted)`, max-width 56ch, font-style italic
- `fr-two-col`: grid, 2 columns, gap 3rem, responsive 1 column below 760px
- `fr-problem-grid`: grid, gap 1px, `var(--fr-border)` bg, border 1px solid `var(--fr-border)`
- `fr-problem-cell`: `var(--fr-surface)` bg, padding 1.2rem
- `fr-problem-cell .label`: `var(--text-xs)`, `var(--fr-accent)`, uppercase
- `fr-callout`: `var(--fr-surface)` bg, left border 3px solid `var(--fr-accent)`, padding 1.4rem
- `fr-callout-zh`: font-size 1.5rem, `var(--fr-text)`, letter-spacing 0.06em
- `fr-callout-pinyin`: `var(--text-xs)`, `var(--fr-dim)`
- `fr-musing`: `var(--fr-surface)` bg, border 1px solid `var(--fr-border)`, padding 1.4rem, position relative
- `fr-musing::before`: content from `data-n` attr, absolute positioned above box, `var(--fr-accent)`, `var(--fr-surface)` bg, `var(--text-xs)`, uppercase
- `p` inside `fr-panel`: `var(--text-base)`, `var(--fr-muted)`, line-height 1.7, margin-bottom 1.1rem
- `strong` inside `fr-panel`: `var(--fr-text)`
- `em` inside `fr-panel`: `var(--fr-text)`, font-style italic

- [ ] **Step 3: Verify in browser**

Check Tab 1 renders correctly:
- Hero title with accent-colored italic "Sparring"
- Status badge visible
- S01 two-column with problem grid (4 cells)
- S02 Chinese callout box with left accent border
- S03 three-column concept grid + musing box
- Responsive: columns collapse on narrow viewport

- [ ] **Step 4: Commit**

```bash
git add src/pages/modules/flow-roll.astro
git commit -m "feat(flow-roll): port Tab 1 header and sections S01-S03"
```

---

## Task 3: Tab 1 -- S04 Interactive Intensity Slider

**Files:**
- Modify: `src/pages/modules/flow-roll.astro`

This is the most interactive element in Tab 1. Port the slider section with its 6-zone data model, threshold markers, meter bar, zone display, and detail grid.

- [ ] **Step 1: Add S04 HTML structure**

Source: `flow-bjj_Specific_jelastyle.html` lines 570-611.

Port the structure into the Tab 1 panel after S03. Key elements:
- Section with `fr-section` class (no special dark inversion needed -- site is already dark)
- Eyebrow + heading
- Intro paragraph
- Slider container: `.fr-slider-container`
  - `.fr-slider-labels` (flex row: "No resistance" / "Threshold" / "Full intensity")
  - `<input type="range" id="intensitySlider" min="0" max="100" value="40" step="1">`
  - `.fr-threshold-marks` with 3 positioned markers (aliveness 18%, ego 52%, threat 78%)
- Zone display: `.fr-zone-display` (grid: meter + content)
  - `.fr-zone-meter` with `.fr-meter-bar` > `.fr-meter-fill` + `.fr-meter-pct`
  - `.fr-zone-content` (filled by JS)

- [ ] **Step 2: Add S04 CSS**

Add to `<style>`:
- Range input styling (webkit + moz): track `var(--fr-border)` 3px, thumb 22px circle `var(--fr-text)` with `var(--fr-bg)` border
- `.fr-slider-labels`: flex, space-between, `var(--text-xs)`, `var(--fr-dim)`
- `.fr-threshold-marks`: relative, height 28px. `.fr-t-mark`: absolute, flex column, centered
- `.fr-t-mark .tick`: 1px wide, 8px tall, `var(--fr-border)`
- `.fr-t-mark .t-label`: `var(--text-xs)` equivalent (0.52rem), `var(--fr-dim)`
- `.fr-zone-display`: grid `auto 1fr`, gap 2rem, min-height 260px, responsive 1 column below 680px
- `.fr-zone-meter`: 52px wide, flex column
- `.fr-meter-bar`: 6px wide, 180px tall, `rgba(229,231,235,0.1)` bg, rounded
- `.fr-meter-fill`: absolute bottom, transition height + bg 0.4s
- `.fr-zone-name`: `clamp(1.6rem, 4vw, 2.5rem)`, transition color 0.4s
- `.fr-zone-subtitle`: `var(--text-xs)`, uppercase, opacity 0.55
- `.fr-zone-desc`: `var(--text-sm)` equivalent, `var(--fr-muted)`, max-width 58ch
- `.fr-zone-details`: grid 3 columns, 1px gap, `rgba(229,231,235,0.08)` bg
- `.fr-detail-cell`: `rgba(5,5,9,0.4)` bg, padding 0.85rem
- `.fr-detail-cell .d-label`: `var(--text-xs)`, `var(--fr-dim)`, uppercase
- `.fr-detail-cell .d-value`: `var(--text-sm)` equivalent, `rgba(229,231,235,0.8)`
- `.fr-threshold-alert`: left border 2px, monospace, `var(--text-xs)`, opacity 0/1 transition

- [ ] **Step 3: Add S04 JavaScript**

Add to `<script>` block. Port from source lines 716-826 with these changes:
- Update zone colors to site palette:
  - Dead Drilling: `#6B7280`
  - Soft Flow Roll: `#34D399`
  - Technical Flow Zone: `#00FFFF`
  - Ego Threshold Zone: `#F59E0B`
  - Hard Flow / Competition Sim: `#4C8DFF`
  - Survival Mode: `#EF4444`
- All zone text content preserved exactly as-is
- `render()` function innerHTML class-name mapping (original -> new):
  - `zone-name` -> `fr-zone-name`
  - `zone-subtitle` -> `fr-zone-subtitle`
  - `zone-desc` -> `fr-zone-desc`
  - `zone-details` -> `fr-zone-details`
  - `detail-cell` -> `fr-detail-cell`
  - `d-label` -> `fr-d-label`
  - `d-value` -> `fr-d-value`
  - `threshold-alert` -> `fr-threshold-alert`
  - `threshold-alert visible` -> `fr-threshold-alert visible`
- Element IDs: `meterFill`, `meterPct`, `zoneContent` -- keep as-is (IDs don't conflict)
- Initialize with `render(40)` after DOM ready

- [ ] **Step 4: Verify in browser**

- Slider moves smoothly
- Zone display updates: name, subtitle, description, detail cells, meter bar
- Threshold alerts appear at zone boundaries (18%, 52%, 78%)
- Colors change per zone
- Responsive: detail grid collapses to single column on mobile

- [ ] **Step 5: Commit**

```bash
git add src/pages/modules/flow-roll.astro
git commit -m "feat(flow-roll): port interactive intensity slider (Tab 1 S04)"
```

---

## Task 4: Tab 1 -- S05 SVG Diagram, S06 Open Questions, Footer

**Files:**
- Modify: `src/pages/modules/flow-roll.astro`

- [ ] **Step 1: Add S05 (Two Axes SVG) HTML**

Source: lines 613-686. Port the section with:
- Eyebrow + heading + intro paragraph
- `.fr-axis-wrap` containing the SVG diagram
- SVG: update all `font-family` attributes to `"Courier New",Consolas,Monaco,monospace`
- SVG: update zone fill colors per spec quadrant mapping:
  - Bottom-left (passive): `rgba(107,114,128,0.1)`
  - Top-left (technical flow): `rgba(0,255,255,0.12)`
  - Bottom-right (muscling): `rgba(239,68,68,0.08)`
  - Top-right (hard technical): `rgba(76,141,255,0.1)`
- SVG: update text colors to match (cyan for technical flow label, red-ish for muscling, accent for hard technical, dim for passive)
- SVG: axis lines and labels use `var(--fr-dim)` equivalents (`#6B7280`)
- Two musing boxes below the SVG

- [ ] **Step 2: Add S06 (Open Questions) HTML**

Source: lines 688-708. Four `fr-musing` boxes with questions.

- [ ] **Step 3: Add Tab 1 footer**

Simple text line: "Working document - practitioner theory - Have fun!" and "Companion to: The Research tab - Cheers, Gerald"

- [ ] **Step 4: Add CSS for axis-wrap**

- `.fr-axis-wrap`: `var(--fr-surface)` bg, border 1px solid `var(--fr-border)`, padding 1.5rem
- `.fr-axis-title`: `var(--text-xs)`, `var(--fr-dim)`, uppercase, centered

- [ ] **Step 5: Verify in browser**

- SVG diagram renders with correct colors and monospace fonts
- Quadrant labels readable
- Four musing boxes render correctly
- Footer visible

- [ ] **Step 6: Commit**

```bash
git add src/pages/modules/flow-roll.astro
git commit -m "feat(flow-roll): complete Tab 1 with SVG diagram, questions, footer"
```

---

## Task 5: Tab 2 -- Hero, Section Nav, S01 Timeline

**Files:**
- Modify: `src/pages/modules/flow-roll.astro`

- [ ] **Step 1: Replace Tab 2 placeholder with hero + section nav + S01**

Source: `flow-theory_jelastyle.html`

**Hero** (lines 637-643): Adapt to section header (not full-viewport). Keep:
- Hero label (eyebrow style)
- `<h1>` title with `<em>` in accent color
- Subtitle paragraph
- Meta line
- Drop: `::before` gradient, scroll-hint, staggered animation-delays

**Section nav** (lines 626-634): Inline row of anchor links at top of tab content. Style as `fr-section-nav`: flex, gap 0, monospace, `var(--text-xs)`, `var(--fr-dim)`, uppercase, each link has right border, hover color `var(--fr-accent)`.

**S01 -- Origins** (lines 646-700): Two-column layout:
- Left: narrative paragraphs
- Right: timeline with 8 items

Timeline markup: `.fr-timeline` with `.fr-timeline-item` children. Each has `.fr-year` + `<h4>` + `<p>`. Key items get `.key` class for brighter dot.

- [ ] **Step 2: Add CSS for Tab 2 components**

- `.fr-hero`: padding 4rem 8vw, border-bottom
- `.fr-hero-label`: `var(--text-xs)`, `var(--fr-accent)`, uppercase, letter-spacing 0.18em
- `.fr-hero h1`: `clamp(2.5rem, 6vw, 5rem)`, `var(--fr-text)`, line-height 1.05
- `.fr-hero h1 em`: `var(--fr-cyan)` (use cyan for research tab accent to differentiate from Tab 1)
- `.fr-hero-meta`: `var(--text-xs)`, `var(--fr-dim)`
- `.fr-section-nav`: flex, overflow-x auto, border-bottom `var(--fr-border)`
- `.fr-section-nav a`: `var(--fr-dim)`, padding `0 1rem`, height 40px, flex align center, border-right `var(--fr-border)`, monospace, hover `var(--fr-accent)`
- `.fr-timeline`: padding-left 2rem, position relative
- `.fr-timeline::before`: 1px vertical line, left 0, `var(--fr-dim)` fading to transparent
- `.fr-timeline-item`: margin-bottom 2rem, padding-left 1.5rem, relative
- `.fr-timeline-item::before`: 8px dot, `var(--fr-dim)` bg, `var(--fr-accent)` border
- `.fr-timeline-item.key::before`: `var(--fr-accent)` bg, box-shadow glow
- `.fr-year`: `var(--text-xs)`, `var(--fr-accent)`
- `.fr-timeline-item h4`: `var(--text-sm)`, `var(--fr-text)`
- `.fr-timeline-item p`: `var(--text-xs)`, `var(--fr-muted)`

- [ ] **Step 3: Add intersection observer for Tab 2 sections**

In `<script>`, add observer that watches all `#tab-research section` elements. On intersect, add `visible` class (one-shot: never remove it, even on tab switch). CSS: `#tab-research section` starts `opacity:0; transform:translateY(24px); transition: opacity 0.6s, transform 0.6s`. `.visible` sets `opacity:1; transform:none`.

- [ ] **Step 4: Verify in browser**

- Switch to Research tab
- Hero renders as section header (not full-viewport)
- Section nav scrolls horizontally, links styled correctly
- S01 two-column with timeline, dots and year badges visible
- Sections fade in on scroll

- [ ] **Step 5: Commit**

```bash
git add src/pages/modules/flow-roll.astro
git commit -m "feat(flow-roll): port Tab 2 hero, section nav, S01 timeline"
```

---

## Task 6: Tab 2 -- S02 Interactive Canvas + Condition Tabs

**Files:**
- Modify: `src/pages/modules/flow-roll.astro`

The most complex interactive element. Port the 8-channel canvas diagram and the conditions/characteristics/consequence tab toggles.

- [ ] **Step 1: Add S02 HTML structure**

Source: lines 703-763. Two-column layout:
- Left column: canvas diagram wrap
  - `.fr-diagram-wrap`: `var(--fr-surface)` bg, border
  - `.fr-diagram-title`: centered label
  - `<canvas id="channelCanvas" width="420" height="380">`
  - Axis labels below canvas
  - Hint text
  - `.fr-channel-info` panel (filled by JS)
- Right column: Nine Components
  - `<h3>` heading
  - Intro paragraph
  - Tab row: 3 buttons (Conditions / Characteristics / Consequence)
  - 3 tab content divs with the component descriptions
  - Pull quote at bottom

- [ ] **Step 2: Add S02 CSS**

- `.fr-diagram-wrap`: `var(--fr-surface)` bg, border `var(--fr-border)`, padding 2rem
- `.fr-diagram-title`: `var(--text-xs)`, `var(--fr-dim)`, uppercase, centered
- `#channelCanvas`: display block, width 100%, cursor pointer
- `.fr-channel-info`: margin-top 1.2rem, min-height 4rem, padding 1rem, `rgba(14,16,20,0.8)` bg, left border 2px `var(--fr-accent)`
- `.fr-channel-info .ch-name`: `var(--text-xs)`, `var(--fr-accent)`, uppercase
- `.fr-tab-row`: flex, border `var(--fr-border)`, overflow hidden, margin-bottom 2rem
- `.fr-tab-btn`: flex 1, padding 0.7rem 1rem, monospace, `var(--text-xs)`, uppercase, `var(--fr-dim)`, border-right `var(--fr-border)`, cursor pointer, transition
- `.fr-tab-btn.active`: `rgba(76,141,255,0.1)` bg, `var(--fr-accent)` color
- `.fr-tab-content`: display none. `.fr-tab-content.active`: display block
- `.fr-pull-quote`: left border 3px `var(--fr-accent)`, padding 1rem 1.5rem, font-style italic, `var(--fr-text)`, `clamp(1rem, 2vw, 1.25rem)`
- `.fr-pull-quote cite`: display block, margin-top 0.6rem, `var(--text-xs)`, `var(--fr-dim)`, font-style normal
- `.fr-axis-labels`: flex, space-between, `var(--text-xs)`, `var(--fr-muted)`
- `.fr-diagram-hint`: `var(--text-xs)`, `var(--fr-dim)`, centered

- [ ] **Step 3: Add canvas JS**

Port from source lines 1253-1425 with these changes:

Channel data -- update fill, stroke, and add a `hoverFill` property for each:
- APATHY: fill `rgba(107,114,128,0.5)`, stroke `#4a4a5a`, hoverFill `rgba(107,114,128,0.7)`
- BOREDOM: fill `rgba(107,114,128,0.4)`, stroke `#4a4a5a`, hoverFill `rgba(107,114,128,0.6)`
- RELAXATION: fill `rgba(52,211,153,0.2)`, stroke `#2a6a4a`, hoverFill `rgba(52,211,153,0.4)`
- WORRY: fill `rgba(239,68,68,0.25)`, stroke `#6a3030`, hoverFill `rgba(239,68,68,0.45)`
- ANXIETY: fill `rgba(239,68,68,0.35)`, stroke `#8a3030`, hoverFill `rgba(239,68,68,0.55)`
- AROUSAL: fill `rgba(245,158,11,0.35)`, stroke `#7a6020`, hoverFill `rgba(245,158,11,0.55)`
- CONTROL: fill `rgba(76,141,255,0.25)`, stroke `#2a4a7a`, hoverFill `rgba(76,141,255,0.45)`
- FLOW: fill `rgba(0,255,255,0.3)`, stroke `#00FFFF`, hoverFill `rgba(0,255,255,0.5)`

**Important:** The source uses a string-replace hack on opacity values (`ch.fill.replace('0.8','1')`) for hover brightness. This will NOT work with the new fill values. Replace it with explicit `hoverFill` property per channel:
```js
ctx.fillStyle = isHov ? ch.hoverFill : ch.fill;
```

Canvas font strings: change all `Space Mono, monospace` to `"Courier New", Consolas, Monaco, monospace`.

Hover state: stroke color `#4C8DFF`, text color `#00FFFF`.

Channel info panel: update element IDs/classes to `fr-channel-info`, `ch-name`.

All channel description text preserved exactly.

- [ ] **Step 4: Add condition/characteristic/consequence tab toggle JS**

Port from source lines 1243-1251. Scope selectors explicitly to avoid conflict with the page-level tab switcher:
```js
document.querySelectorAll('#tab-research .fr-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tabId = btn.dataset.tab;
    document.querySelectorAll('#tab-research .fr-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('#tab-research .fr-tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(tabId)?.classList.add('active');
  });
});
```

- [ ] **Step 5: Verify in browser**

- Canvas renders 8 channels with site-palette colors
- Hover/click highlights channel and updates info panel
- Flow channel is visually prominent (cyan)
- Conditions/Characteristics/Consequence tabs toggle content
- Pull quote visible

- [ ] **Step 6: Commit**

```bash
git add src/pages/modules/flow-roll.astro
git commit -m "feat(flow-roll): port 8-channel canvas and condition tabs (Tab 2 S02)"
```

---

## Task 7: Tab 2 -- S02b Visualizations, S03 Method, S04 Neuroscience

**Files:**
- Modify: `src/pages/modules/flow-roll.astro`

Three sections of mostly static content with inline SVGs.

- [ ] **Step 1: Add S02b (Three Representations) HTML**

Source: lines 766-909. Three vis-cards in a grid, each containing an SVG diagram.

- `.fr-vis-grid`: grid, 3 columns, gap 1.5rem, responsive 1 column below 900px
- `.fr-vis-card`: `var(--fr-surface)` bg, border `var(--fr-border)`, padding 1.2rem, hover border `var(--fr-accent)`
- `.fr-vis-label`: `var(--text-xs)`, `var(--fr-accent)`, uppercase
- `.fr-vis-caption`: `var(--text-xs)`, `var(--fr-muted)`, italic
- `.fr-vis-note`: `var(--text-xs)`, `var(--fr-muted)`, italic, border-top, padding-top

All three SVGs: update every `font-family` attribute to `"Courier New",Consolas,Monaco,monospace`. Update fill colors on axis lines, labels, and zone fills to use site palette equivalents (keep same relative transparency). Fix typo: "diretionally" -> "directionally" in the pull quote after the grid.

- [ ] **Step 2: Add S03 (Methodology) HTML**

Source: lines 911-936. Method box + two-column strengths/limitations.

- `.fr-method-box`: `var(--fr-surface)` bg, border 1px solid `rgba(76,141,255,0.2)`, padding 2rem, position relative
- `.fr-method-box::before`: content "METHOD", absolute positioned, `var(--fr-accent)`, `var(--fr-surface)` bg

- [ ] **Step 3: Add S04 (Neuroscience) HTML**

Source: lines 938-989. Two-column: narrative + brain diagram SVG + EEG paragraph.

Brain SVG: update colors:
- PFC region: keep red-ish `rgba(239,68,68,0.25)`, stroke `#EF4444`, label `#EF4444`
- Basal ganglia: keep green `rgba(52,211,153,0.2)`, stroke `#34D399`, label `#34D399`
- Brain silhouette: `#0E1014` fill, `#3a3a50` stroke
- Labels: `#6B7280`
- Arrow marker: `var(--fr-dim)` equivalent

`.fr-brain-diagram`: `var(--fr-surface)` bg, border, flex row, gap 2rem, wrap

- [ ] **Step 4: Verify in browser**

- Three SVG vis-cards render in a row (collapse on mobile)
- Method box has labeled border
- Brain diagram SVG renders with PFC (red) and basal ganglia (green)
- Typo "directionally" is fixed

- [ ] **Step 5: Commit**

```bash
git add src/pages/modules/flow-roll.astro
git commit -m "feat(flow-roll): port Tab 2 visualizations, methodology, neuroscience"
```

---

## Task 8: Tab 2 -- S05 Evidence, S06 Verdict, S07 Papers, Footer

**Files:**
- Modify: `src/pages/modules/flow-roll.astro`

- [ ] **Step 1: Add S05 (Replication) HTML**

Source: lines 991-1062.

Stat callouts: 3 items in flex row.
- `.fr-stat-callout`: flex, gap 2rem, wrap
- `.fr-stat-item`: flex 1, min-width 140px, left border 2px `var(--fr-accent)`
- `.fr-stat-num`: `clamp(2rem, 4vw, 3rem)`, `var(--fr-accent)`, line-height 1
- `.fr-stat-label`: `var(--text-xs)`, `var(--fr-muted)`

Evidence cards: 8 cards in auto-fill grid.
- `.fr-evidence-grid`: grid, auto-fill minmax(280px, 1fr), gap 1.2rem
- `.fr-evidence-card`: `var(--fr-surface)` bg, border, padding 1.4rem, hover border `var(--fr-accent)`
- Status badges: `.fr-status` base + modifier classes:
  - `.replicated`: `rgba(52,211,153,0.15)` bg, `#34D399` text, border
  - `.partial`: `rgba(245,158,11,0.12)` bg, `#F59E0B` text, border
  - `.failed`: `rgba(239,68,68,0.12)` bg, `#EF4444` text, border
  - `.open`: `rgba(76,141,255,0.12)` bg, `#4C8DFF` text, border

Pull quote from Jackman et al.

- [ ] **Step 2: Add S06 (Verdict) HTML**

Source: lines 1064-1124. Verdict table + bottom line.

- `.fr-verdict-table`: width 100%, border-collapse
- `th`: `var(--text-xs)`, `var(--fr-accent)`, uppercase, border-bottom `rgba(76,141,255,0.35)`
- `td`: padding 0.9rem, border-bottom `var(--fr-border)`, `var(--fr-muted)`
- `td:first-child`: `var(--fr-text)`, italic
- Status dots: `.fr-dot` 8px circle inline-block. `.yes` `#34D399`, `.partial` `#F59E0B`, `.no` `#EF4444`

- [ ] **Step 3: Add S07 (Papers) HTML**

Source: lines 1126-1213. 10 paper items.

- `.fr-paper-list`: border `var(--fr-border)`, overflow hidden
- `.fr-paper-item`: grid `auto 1fr auto`, gap 1rem, padding 1.2rem, border-bottom, hover `var(--fr-surface)` bg
- `.fr-paper-num`: `var(--text-xs)`, `var(--fr-dim)`
- `.fr-paper-title`: `var(--text-sm)`, `var(--fr-text)`, italic
- `.fr-paper-meta`: `var(--text-xs)`, `var(--fr-muted)`
- `.fr-paper-link`: `var(--text-xs)`, `var(--fr-accent)`, border `var(--fr-dim)`, padding, hover invert

Paper link URLs preserved exactly as-is (they point to PubMed, DOIs, etc.).

- [ ] **Step 4: Add Tab 2 footer**

Source: line 1217. Simple centered text: "Research synthesis; sources link to primary peer-reviewed literature only - Have fun! - Cheers, Gerald"

`.fr-footer`: padding 2.5rem 8vw, border-top `var(--fr-border)`, `var(--text-xs)`, `var(--fr-dim)`, uppercase, centered

- [ ] **Step 5: Verify in browser**

- Stat callouts render with large accent numbers
- 8 evidence cards with colored status badges
- Verdict table with dot indicators
- 10 paper items with clickable links
- Footer visible
- Full scroll through Tab 2 works, sections fade in

- [ ] **Step 6: Commit**

```bash
git add src/pages/modules/flow-roll.astro
git commit -m "feat(flow-roll): complete Tab 2 with evidence, verdict, papers, footer"
```

---

## Task 9: Register in Experiments Page

**Files:**
- Modify: `src/pages/experiments.astro`

- [ ] **Step 1: Add Flow & Roll entry to experiments array**

In `src/pages/experiments.astro`, add to the `experiments` array (after the last entry, before the closing `]`):

```js
{
  title: 'Flow & Roll',
  description: 'What does "flow" actually mean in sparring? A practitioner model for intensity, problem density, and the science behind it.',
  href: `${base}/modules/flow-roll`,
  status: 'live' as const,
  tag: 'INTERACTIVE ESSAY',
},
```

- [ ] **Step 2: Verify**

Navigate to `/experiments` page. Confirm "Flow & Roll" card appears with gradient placeholder thumbnail, correct title, description, and "INTERACTIVE ESSAY" tag. Click through to `/modules/flow-roll`.

- [ ] **Step 3: Commit**

```bash
git add src/pages/experiments.astro
git commit -m "feat(flow-roll): register module in experiments page"
```

---

## Task 10: Visual QA Pass

**Files:**
- Modify: `src/pages/modules/flow-roll.astro` (if fixes needed)

- [ ] **Step 1: Full walkthrough -- Tab 1**

Open `/modules/flow-roll` in browser. Check:
- [ ] Toolbar renders correctly
- [ ] Tab bar is sticky below toolbar
- [ ] Hero title and subtitle readable
- [ ] S01 two-column and problem grid
- [ ] S02 Chinese callout renders (characters visible even without CJK font)
- [ ] S03 three-column grid
- [ ] S04 slider: drag through all 6 zones, verify all zone data displays
- [ ] S05 SVG diagram: quadrant labels and colors correct
- [ ] S06 four musing boxes
- [ ] Footer

- [ ] **Step 2: Full walkthrough -- Tab 2**

Switch to Research tab. Check:
- [ ] Scroll resets to top
- [ ] Hero section header (not full-viewport)
- [ ] Section nav links (inline, horizontal)
- [ ] S01 timeline with dots and year badges
- [ ] S02 canvas: hover/click all 8 channels, info panel updates
- [ ] S02 condition tabs toggle
- [ ] S02b three SVG vis-cards
- [ ] S03 method box
- [ ] S04 brain SVG
- [ ] S05 stat callouts and 8 evidence cards with badges
- [ ] S06 verdict table with dots
- [ ] S07 paper list with 10 items and working links
- [ ] Sections fade in on scroll
- [ ] Footer

- [ ] **Step 3: Responsive check**

Resize to 375px width. Check:
- [ ] Two-column layouts collapse to single column
- [ ] Problem grids collapse
- [ ] Slider and zone display remain usable
- [ ] Canvas diagram scales
- [ ] Evidence cards stack
- [ ] Tab bar tabs remain accessible

- [ ] **Step 4: Fix any issues found and commit**

```bash
git add src/pages/modules/flow-roll.astro
git commit -m "fix(flow-roll): visual QA fixes"
```
