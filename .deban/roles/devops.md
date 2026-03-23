---
role: devops
owner: Gerald
status: active
last-updated: 2026-03-23
---

# DevOps

## Scope
Build pipeline, deployment, hosting, and infrastructure.

## Decisions
| Date | Decision | Rationale | Linked roles |
|---|---|---|---|
| 2026-03-23 | `sharp` installed + `scripts/optimize-images.mjs` for PNG/JPG→WebP batch conversion | Quality 80, skips memory/ dir (already has webp/avif). Manual run, not build-time. 113 files converted, 79% size reduction. | [[dev]], [[arch]] |
| 2026-03-23 | Delete originals after WebP conversion (except articles/) | Articles use Obsidian `![[image.png]]` embeds resolved by rehype plugin at build time. Deleting those would break article rendering. All other originals safe to remove — code refs updated to .webp. | [[arch]] |

## Dead Ends
<!-- APPEND ONLY. Never delete. -->
| Date | What was tried | Why it failed / was rejected |
|---|---|---|

## Lessons

## Open Questions
- [ ] What is the production hosting setup? (GitHub Pages, Vercel, Netlify, etc.) — owner: Gerald — since: 2026-03-18

## Assumptions
- `git push` to main triggers production deployment (observed behavior)
- Static site build, no server-side rendering required

## Dependencies
Blocked by:
Feeds into: [[qa]]

## Session Log
<!-- One line per session, newest first -->
2026-03-23 (session 5 optimization) — First real devops work. sharp installed, optimize-images.mjs script created. 113 images converted PNG/JPG→WebP. Build size 79→43MB. Originals deleted (except 13 article PNGs for Obsidian compat).
2026-03-18 — INIT. No devops changes this session.
