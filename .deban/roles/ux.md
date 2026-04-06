---
role: ux
owner: Gerald
status: active
last-updated: 2026-04-06
---

# User Experience

## Scope
Readability, interaction design, responsive behavior, visual hierarchy, and information density.

## Decisions
| Date | Decision | Rationale | Linked roles |
|---|---|---|---|
| 2026-03-18 | Event log uses fixed height (140px) instead of max-height | Prevents simulation from shifting vertically as log entries append. Log scrolls internally. | [[dev]] |
| 2026-03-18 | Hover tooltip on simulation stage columns | Simulation text is necessarily small (5 columns). Tooltip shows enlarged stage name, goal, state, and active tools on hover. | [[dev]] |
| 2026-03-18 | Toolbox section placed below simulation, not above | User sees the simulation first (experiential), then reads the structural breakdown. Show then explain. | [[pm]] |
| 2026-03-18 | Quadrant SVG label positioned above dot, not to the right | Right-positioned label was clipped. Top placement fits within viewBox. | [[dev]] |
| 2026-03-18 | Primitive card clickable with confirmation modal before navigation | Prevents accidental navigation away from the essay. Modal confirms intent to leave for QuadTree. | [[dev]] |
| 2026-03-23 | Landing page principles section: calligraphy flanking each principle, alternating left/right | Calligraphy images at 85% opacity (hover to 100%) alongside numbered principles. Creates visual rhythm. Principles are clickable links to their corresponding modules. | [[dev]] |
| 2026-03-23 | Hero module card order: Build Yourself → Ideal Partner → QuadTree | Matches the "three things" priority order in the principles section. Previously was Ideal Partner → QuadTree → Build Yourself. | [[pm]] |
| 2026-03-23 | TLDRs placed at top of page (above hero), collapsed by default | Reader sees the option immediately without scrolling. Collapsible `<details>` so it doesn't compete with the hero. Alternative rejected: TLDR inside hero section (buried below the visual centerpiece). | [[dev]] |
| 2026-03-23 | Jibunwotsukure hero: "Build Yourself First" text repositioned to top-left of enso image | Occupies blank space above the brush circle. Previously overlaid left-center of the image. | [[dev]] |
| 2026-04-06 | Articles-reader: split title at Latin→CJK boundary into headline + subhead | Fused titles ("Mithridatism毒の免疫を養う") destroyed hierarchy. Split gives proper reading cascade: headline → italic subhead → epigraph → lead. Matches mise-en-page semantic slot model. | [[dev]] |
| 2026-04-06 | Articles-reader: prefix all `.r-story-body` CSS rules with `#reader-app` | The universal reset `#reader-app * { margin:0 }` (specificity 1,0,0) overrode all content spacing rules (specificity 0,1,x). Prefixing lifts content rules to (1,1,x). | [[dev]] |
| 2026-04-06 | Articles-reader: drop cap excludes `.r-epigraph` and `.r-dateline` via `:not()` | `::first-letter` includes preceding punctuation — an epigraph starting with `"…t` rendered all three glyphs at 3.4em. Exclusion ensures drop cap only fires on the Lead paragraph. | [[dev]] |
| 2026-04-06 | Articles-reader: auto-strip redundant first paragraph matching title | Some articles open with "Mithridatism:" which repeats the headline, wastes the drop cap, and pushes the epigraph to second-child position (losing its first-child spacing rule). Detected and removed in mdToHtml. | [[dev]] |
| 2026-04-06 | Articles-reader: removed `fullscreen={true}` from BaseLayout | fullscreen hides site header/nav. Articles have no canvas — immersive mode was punitive, not functional. Restored back-to-home navigation. Related to P0 issue: `maximum-scale=1` audit. | [[dev]] |

## Dead Ends
<!-- APPEND ONLY. Never delete. -->
| Date | What was tried | Why it failed / was rejected |
|---|---|---|
| 2026-03-24 | Horseshoe: remapping to site blue/cyan palette (#4C8DFF, #00d4ff) | User rejected as "looks like a cheap Google." The blue/orange/red combination lacked cohesion. Iterated through 3 color schemes before settling on the beyond-offense-defense red-to-green gradient. |
| 2026-03-24 | Horseshoe: flanking side quote zones (3-column grid) | Quotes overflowed on mobile. Side zones hidden at 600px breakpoint meant mobile users saw no quotes at all. |
| 2026-03-24 | Horseshoe: 3 fixed positions (top/center/bottom) inside arc with max 2 visible | Text at top and bottom positions overlapped with the horseshoe arc stroke, making quotes hard to read. Simplified to single centered quote. |
| 2026-03-24 | Horseshoe: interval-based quote spawning with rate tiers (1.2s/2.4s/3.2s/4s) | Quotes desynced from slider position during autoplay. A green quote could persist while the dot moved to red. Zone-change-triggered display is cleaner. |
| 2026-03-24 | Horseshoe: inline event handlers (onmouseover/onmouseout) on deeplink button | Astro strips inline handlers during processing. Button appeared but hover effects didn't work. Fixed with CSS class + :hover. |
| 2026-03-20 | Keeping original article visual identities (paper-light theme for bjj, dark-amber for theory) | User explicitly wanted both adapted to site terminal palette. Preserving original themes would create visual inconsistency with the rest of the site. Both articles now use the same dark/monospace/accent-blue identity. |
| 2026-03-18 | Small font sizes across toolbox (10-11px, --text-xs) | User reported "extremely hard to read on desktop." Bumped to --text-sm/--text-base throughout. |
| 2026-03-18 | Toolbox placed above simulation | Disrupted flow. User wanted simulation first, explanation after. Moved below. |
| 2026-03-19 | ModuleCard status 'wip' renders as greyed-out and unclickable in production | Back-control card was invisible on the Experiments tab. Changed to status 'live' and unified homepage section with Experiments tab page. |
| 2026-03-19 | SVG overlay + absolute positioned HTML nodes for CLD diagram | Font size changes break node positions, mobile stacking makes no semantic sense, coordinates are fragile. Tried 3 times, failed 3 times. Needs pure flexbox or static image approach. |
| 2026-03-19 | CSS grid + JS-drawn SVG overlay (second attempt at hybrid) | Same root cause as above. getBoundingClientRect depends on rendered DOM; CLI cannot provide it. Edges drew from wrong positions. Resolved by switching to pure SVG with baked coordinates. |
| 2026-03-19 | Animated border-width on Confidence node to show "confidence growing" | border-width changes cause layout reflow, making surrounding elements jitter unnaturally. User rejected immediately. |
| 2026-03-19 | Global font scale with low clamp ceilings (max 16-18px) | Unreadable on 2560px+ monitors. Monospace needs larger sizes than sans-serif. Bumped to 16-24px range with vw+px formula. |
| 2026-04-06 | Articles-reader: CSS specificity trap from `#reader-app *` reset | Universal reset with ID selector created a specificity ceiling (1,0,0) that silently overrode every content spacing rule. All paragraph gaps, list indentation, heading margins, epigraph separation collapsed to zero. Invisible in code review — only visible when rendered. |
| 2026-04-06 | Articles-reader: `fullscreen={true}` on a non-canvas page | Hid site navigation for no functional reason. Articles are not immersive visualizations. Discovery: side-by-side comparison with mise-en-page reference output. |

## Lessons
- When adapting a standalone HTML widget to a site, borrow the site's existing module palette (e.g. beyond-offense-defense colors) rather than inventing a new one or using the site's primary accent. The module needs to feel part of the family, not identical to the chrome. -- from dead end on 2026-03-24
- Interactive quote/text overlays inside SVG containers: use a single centered position with constrained max-width. Multiple positions cause overlap with the visualization. One quote at a time, triggered by state change, is cleaner than interval spawning. -- from dead end on 2026-03-24
- Astro strips inline event handlers (onmouseover etc.) from non-is:inline elements. Always use CSS :hover or addEventListener for interactive styling. -- from dead end on 2026-03-24
- Default font sizes for data-dense sections should start at --text-sm minimum, not --text-xs — from dead end on 2026-03-18
- "Show then explain" ordering: let the user experience the interactive before reading the structural breakdown — from dead end on 2026-03-18
- Never mix SVG coordinate positioning with HTML nodes styled by CSS font variables. The two systems are decoupled and will break independently. — from dead end on 2026-03-19
- For diagrams with connecting lines, use pure SVG with a fixed viewBox. Edit coordinates in an external tool, not in code. The trade-off (manual pixel work) is worth the reliability. — from dead end on 2026-03-19
- Never animate border-width or any box-model property that causes reflow. Use transforms, opacity, or box-shadow instead. — from dead end on 2026-03-19
- Monospace fonts need 20-30% larger pixel sizes than sans-serif to achieve equivalent readability. Compare against real sites (claude.ai, submeta.io) not just "looks OK on my screen." — from dead end on 2026-03-19
- Font size sweep is safe as batch replace_all when rules are clear (7→10, 8→11, 9→12). Toolbar chrome (tracking-heavy uppercase) is the exception — intentionally small at 10-11px. — from audit on 2026-03-23
- CSS resets with ID selectors (`#id * { margin:0 }`) create a specificity trap: specificity (1,0,0) silently overrides class-based content rules (0,1,x). The bug is invisible in code review and only manifests in rendering. Use `:where()` for resets, or ensure all downstream rules carry the same ID prefix. — from dead end on 2026-04-06
- `::first-letter` pseudo-element includes preceding punctuation (quotes, ellipsis). A drop cap on `"…the` renders all of `"…t` at display size. Always exclude elements whose content starts with non-letter characters, or use `:not()` to limit drop caps to known-safe semantic slots. — from dead end on 2026-04-06
- "Classify before styling" (mise-en-page workflow) catches structural bugs that CSS inspection misses. The epigraph/drop-cap/spacing failures were all symptoms of one root cause: HTML elements not assigned to correct semantic slots. The CSS was fine; the classification was wrong. — from session on 2026-04-06

## Open Questions
- [x] Mobile (iPhone) readability not yet tested. Simulation 5-column layout may need further work. — owner: Gerald — since: 2026-03-18 — **resolved 2026-03-24: full mobile audit completed, see Mobile-First Audit TODO below**

## Mobile-First Audit TODO (2026-03-24)
Priority order. User feedback: fonts hard to read, items break on small screens, zoom feels half-assed.

### P0 — Critical (address first)
- [ ] **Swap body font**: Courier New is hostile to mobile readability (~30% wider than proportional, thin strokes vanish on low-DPI). Keep monospace for UI chrome (header, labels, toolbars, act-numbers). Use a proportional or screen-optimized mono for body text. Test candidates on `/modules/font-test` page. — [[dev]]
- [ ] **Remove `maximum-scale=1` from essay pages**: jibunwotsukure, ideal-partner, flow-roll, back-control all set fullscreen=true which locks zoom via viewport meta. This is an accessibility violation (WCAG 1.4.4). Essays have NO canvas — zoom lock is purely punitive. Canvas pages can keep `touch-action:none` on the canvas element itself. — [[dev]]
- [ ] **Extract inline styles from toolbars**: 14 module toolbars use inline styles exclusively (~50+ lines each). Inline styles cannot be overridden by media queries, making responsive adaptation impossible. Create shared `.module-toolbar` CSS class. — [[dev]], [[arch]]
- [ ] **Add intermediate breakpoints**: Essays have ONE breakpoint (600px or 640px). Missing tablet (768px) and small-phone (480px). Content either fits or doesn't — no graceful degradation. — [[dev]]

### P1 — High (directly cited in user feedback)
- [ ] **Canvas touch UX**: QuadTree and ConceptMatrix pinch-zoom is functional but incomplete. Missing: double-tap-to-zoom, zoom level indicator, reset button visible on mobile, momentum/inertia on pan. Add brief onboarding overlay on first visit. — [[dev]]
- [ ] **Module card text clipping**: `line-clamp-1` on descriptions wastes full-width mobile cards. Use `line-clamp-2` on mobile or remove clamp in single-column layout. — [[dev]]
- [ ] **Scroll progress for essays**: 6-8 acts at 100vh each with no progress indicator. Add thin progress bar or side dots. — [[dev]]
- [ ] **Splash overlay persistence**: Uses `sessionStorage` (reappears every tab). Switch to `localStorage` with 24h or permanent expiry. — [[dev]]

### P2 — Medium (structural improvements)
- [ ] **Auto-hide toolbar on scroll-down**: Fixed 36px toolbar + browser chrome = ~20% viewport loss on iPhone. Show on scroll-up only. — [[dev]]
- [ ] **Replace hardcoded pixel spacing with clamp()**: `.act { padding: 80px 24px }` is excessive on 667px screens. Use `clamp(40px, 8vh, 80px)` pattern. Same for margins (32px fixed). — [[dev]]
- [ ] **Mobile modal overflow**: Modals in jibunwotsukure have no max-height or overflow handling. Add `max-height: 85vh; overflow-y: auto;` and safe-area padding. — [[dev]]
- [ ] **Safe-area insets for notched phones**: No `env(safe-area-inset-*)` usage anywhere. Toolbar and footer collide with system UI on iPhones with notch/Dynamic Island. — [[dev]]
- [ ] **Japanese text handling**: No CJK font in stack, no `word-break` or `overflow-wrap` for long JP strings. Add CJK font fallback. — [[dev]]

### P3 — Polish
- [ ] **Reduce text glow on mobile**: `text-shadow: 0 0 12px` blur halo makes text edges fuzzy on OLED. Reduce or remove for body-adjacent text on small screens. — [[dev]]
- [ ] **Wider scrollbars on touch devices**: 4px custom scrollbar is ungrabable on touch. Consider native scrollbar on mobile. — [[dev]]
- [ ] **Increase line-height for monospace on mobile**: 1.7-1.8 is fine for proportional, but monospace benefits from 1.9-2.0 on small screens. — [[dev]]
- [ ] **`prefers-reduced-motion` support**: `.fade-up` and act transitions ignore system preferences. — [[dev]]
- [ ] **Convert DS-Digital TTF to WOFF2**: TTF files are larger, slower on mobile connections. — [[devops]]

## Assumptions
- ~~Desktop is the primary consumption device for this content~~ **Invalidated 2026-03-24**: mobile-first audit reveals significant mobile traffic issues. Reframing to mobile-first.
- CSS filter inversion of black-on-white PNGs reads well on dark backgrounds

## Dependencies
Blocked by:
Feeds into: [[dev]], [[qa]]

## Session Log
<!-- One line per session, newest first -->
2026-04-06 (session 8) — Articles-reader mise-en-page audit. Side-by-side with pure mise-en-page skill output exposed 4 structural bugs: CSS specificity trap (reset overriding all content spacing), drop cap misfiring on epigraph, fused headline/subhead, redundant first paragraph stealing the lead. Also removed fullscreen={true} to restore site navigation. 5 decisions, 2 dead ends, 3 lessons.
2026-03-24 (session 7) — Full mobile-first audit completed. 18 issues identified across 4 priority tiers. Font test page created at /modules/font-test with 7 candidates (3 monospace upgrades, 4 proportional hybrids). Assumption invalidated: desktop-primary. TODO list written.
2026-03-24 (session 6) — Horseshoe module UX: 3 color scheme iterations (site blue rejected, beyond-offense-defense palette adopted). Quote display iterated 4 times: side zones -> inner 3-slot -> single centered. Auto/manual mode split. User dislikes emdashes. 5 dead ends recorded, 3 lessons extracted.
2026-03-23 (session 5 audit) — Site-wide font size sweep completed: 13 modules fixed, zero remain with sub-10px readable text. Rules: 7-8→10-11 (labels), 9→12 (body), toolbar chrome stays 10-11px. Audit found 669 inline styles and 432 hardcoded colors across 17 modules — deferred to incremental cleanup.
2026-03-23 (session 5) — Landing page: calligraphy-flanked principles layout, module reorder, clickable principle links. TLDRs moved to page top. Jibunwotsukure hero text repositioned top-left. "Basic Components" dropped from title rotation (now 3 words).
2026-03-20 (session 4) — Flow-Roll module visual adaptation: two articles with distinct themes (paper-light, dark-amber) unified under site terminal palette. Slider zones mapped to 6 distinguishable colors (dim/green/cyan/amber/accent/red). Cyan used for Tab 2 hero em to visually differentiate research tab from sparring tab. Chinese characters use system CJK fallback (platform-dependent rendering, accepted).
2026-03-19 (session 3) — CLD diagram resolved via pure SVG. Animated border-width rejected (reflow jitter). Title changed from "Confidence Creates a Fork" to "Confidence Creates Options" (Gerald's correction: confidence opens possibilities, not a binary choice). explore/exploit labels color-coded and linked to BJJ-265.
2026-03-19 (session 2) — Font scale overhaul (3 iterations to get right). CLD diagram failed 3 times (SVG overlay approach is dead). where-to-start module text/UX is solid, diagram WIP.
2026-03-19 — Fixed Experiments card visibility (wip->live). Unified homepage section with Experiments tab.
2026-03-18 — Fixed readability issues (font sizes, log shifting, label clipping), reordered toolbox
