---
role: pm
owner: Gerald
status: active
last-updated: 2026-03-23
---

# Product Management

## Scope
Feature direction, content strategy, prioritization, user goals, and conceptual framework coherence.

## Decisions
| Date | Decision | Rationale | Linked roles |
|---|---|---|---|
| 2026-03-18 | Back control module thesis: "back control IS rotation control" | Deductive arc (geometry -> mechanism -> simulation) over inductive (chaos first). Matches site's primitives-first pedagogy. | [[ux]], [[arch]] |
| 2026-03-18 | Only one new primitive (BJJ-261 Rotational Control) | Focused scope. Back Exposure, Control Decay, Cascade Pressure considered but deferred. | [[arch]] |
| 2026-03-18 | Three philosophies (Ride/Freeze/Spiral) as situational toolkit, not hierarchy | Spiral is optimal when achievable but Ride/Freeze serve when opponent is bigger/stronger/more mobile. User's domain insight. | [[ux]] |
| 2026-03-18 | Module placed in new "Experiments" homepage section | Not yet polished enough for core featured row. Signals work-in-progress to visitors. | [[arch]] |
| 2026-03-18 | QuadTree alone is insufficient for exploring 248+ primitives | Need multiple exploration paths: flash cards (client-only), improved self-assessment with skill mapping, and richer YAML metadata per primitive. | [[dev]], [[arch]], [[ux]] |
| 2026-03-18 | JA localization deferred to prime-time readiness | Current JA is placeholder. No point polishing translations while content structure is still in flux. | |
| 2026-03-18 | Toolbox framework targets post-beginner (purple+) practitioners | The ability to identify which of 5 battles you're losing requires experience. A by-belt visualization could bridge this for lower belts. | [[ux]] |
| 2026-03-19 | Full taxonomy audit: 249 concepts audited for redundancy, content quality, missing connections | tags and related fields 100% empty. 59 stubs. Physics category 83% stubs. Audit doc: `docs/2026-03-18-concept-taxonomy-audit.md` | [[arch]], [[dev]] |
| 2026-03-19 | 10 new primitives created (BJJ-262 through BJJ-271) | Extracted from articles and modules. Alternatives: could have expanded existing concepts instead. Chose new entries because each represents a distinct mechanism. | [[dev]] |
| 2026-03-19 | Gerald will personally rewrite 7 of 10 new primitives (BJJ-265 through BJJ-271) | Claude's drafts had the right structure but lacked personal nuance and voice. These are deeply personal concepts. | |
| 2026-03-19 | `related` field collaboration: Claude proposes 5 concepts + connections, Gerald validates | Alternative was batch-generating all connections. Rejected because Gerald's domain judgment is essential for accuracy. | [[dev]], [[arch]] |
| 2026-03-19 | Concept-to-position mapping: light touch only | Concepts should apply everywhere; a few concrete examples, never exhaustive. Alternative was detailed position mapping. Rejected because it would duplicate technique-focused sites. | |
| 2026-03-19 | Concept-to-belt mapping: dropped | Not important. Concepts matter at all levels. With experience you can dive into details OR extract essence. | |
| 2026-03-23 | Content management via Obsidian: `src/content/` opened as vault, text blocks editable as .md files | Gerald can edit TLDRs, landing page copy, and future text blocks directly in Obsidian without touching .astro files. Inline markdown (`**bold**`, `*italic*`) supported via `mdInline` build-time processing. | [[arch]], [[dev]] |
| 2026-03-23 | Module card descriptions rewritten as dense TLDRs | Build Yourself: "Organize your body before collecting techniques." Ideal Partner: "Intensity is a skill. Match it, modulate it, or waste your mat time." QuadTree: concept/category count + "Zoomable 2D map of grappling building blocks." | [[ux]] |
| 2026-03-23 | Landing page principle text now editable by Gerald in Obsidian | Gerald immediately edited principles 2 and 3 after extraction — added "precioussss" to principle 2, refined principle 3 wording. Validates the content management approach. | [[dev]] |

## Dead Ends
<!-- APPEND ONLY. Never delete. -->
| Date | What was tried | Why it failed / was rejected |
|---|---|---|
| 2026-03-19 | Claude-authored body text for 7 primitives (BJJ-265 through BJJ-271) | Structure was acceptable but voice and nuance were wrong. These are deeply personal concepts; the subtleties require Gerald's direct authorship. Claude's drafts will be overwritten. |

## Lessons

## Open Questions
- [ ] Should the "toolbox" framework become a reusable component/pattern for other position modules (guard pass, mount, etc.)? — owner: Gerald — since: 2026-03-18
- [ ] Entry pathways (how you GET to the back) and escape/retention dynamics were scoped out. Revisit for v2? — owner: Gerald — since: 2026-03-18
- [ ] Additional primitives (Back Exposure, Control Decay, Cascade Pressure) warranted as the taxonomy grows? — owner: Gerald — since: 2026-03-18
- [x] BRIEF CHALLENGE: QuadTree is NOT enough for exploration. Need better ways. Candidates: Anki-style flash cards (client-side only, no server/auth), improved self-assessment with real skill mapping. — owner: Gerald — since: 2026-03-18 — resolved: 2026-03-18
- [ ] Anki-style flash cards: client-only memory/spaced repetition. Open question: localStorage vs no persistence at all? User doesn't want server/storage/auth yet. — owner: Gerald — since: 2026-03-18
- [ ] Self-Assessment polish: add more YAML granularity to each primitive - WHAT it applies to, WHERE in the positional hierarchy. Real mapping of skills, not just confidence scores. — owner: Gerald — since: 2026-03-18
- [x] BRIEF CHALLENGE: JA translations are aspirational debt. Will do a serious localization pass later when the site is closer to prime-time. Not blocking anything now. — owner: Gerald — since: 2026-03-18 — resolved: 2026-03-18
- [x] BRIEF CHALLENGE: Toolbox framework requires post-beginner awareness. Correct - it targets practitioners who don't need handholding anymore. Potential separate viz: toolbox-by-belt showing which tools tend to be most helpful at each level. — owner: Gerald — since: 2026-03-18 — resolved: 2026-03-18
- [ ] New module idea: toolbox-by-belt viz. Which tools are most useful at white/blue/purple/brown/black? Could tie into self-assessment data. — owner: Gerald — since: 2026-03-18
- [ ] Move Deconstruction module: decompose techniques into primitive building blocks (tree viz). Need new strangle-specific primitives (soft tissue, carotid occlusion). Also "Map their escape routes" as a new concept. — owner: Gerald — since: 2026-03-19
- [ ] Concept Hover-Cards: short_description on hover, full content on click. Prerequisite: populate short_description for all concepts. — owner: Gerald — since: 2026-03-19
- [ ] White/purple/brown/black belt tips as playful expansion of existing white-belt-tips category? — owner: Gerald — since: 2026-03-19

## Assumptions
- Users of the site have at least beginner-level grappling vocabulary
- Conceptual framing (no technique names) is the right level of abstraction for this audience

## Dependencies
Blocked by:
Feeds into: [[ux]], [[dev]]

## Session Log
<!-- One line per session, newest first -->
2026-03-23 (session 5) — Content management strategy: Obsidian vault for text blocks. TLDRs for jibunwotsukure + ideal-partner written and refined. Module card descriptions rewritten as dense TLDRs. Gerald validated approach by immediately editing principle text in Obsidian.
2026-03-19 (session 2) — All 256 related fields done + bidirectional. where-to-start module created (CLD diagram WIP). Landing page animation. Purgatory toggle. BJJ-272 End-Game Training added. BJJ-221 removed (redundant with 271). Tags field still empty (future, possibly beginner/expert). Context window likely caused quality degradation late in session.
2026-03-19 — Full taxonomy audit (256 concepts). 10 new primitives created, 3 placeholders deleted, 10 physics stubs expanded. Gerald rewriting 7 of 10 new entries for voice/nuance. Related-field collab queued next.
2026-03-18 — Scoped back-control module: 5 acts, 1 primitive, toolbox framework, Experiments section
