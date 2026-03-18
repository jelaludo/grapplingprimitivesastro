# Concept Taxonomy Audit - 249 Primitives

## Context

Full semantic audit of all 249 concepts across 22 categories in the Grappling Primitives taxonomy. Goal: identify redundancy, underdeveloped content, missing connections, potential new primitives from articles/experiments, and plan two future features (concept hover-cards, move deconstruction).

---

## 1. CORPUS HEALTH

### Field Completion
| Field | Populated | Empty | Notes |
|---|---|---|---|
| id | 249/249 | 0 | All assigned |
| concept name | 249/249 | 0 | 3 placeholders (BJJ-202 "Unnamed", BJJ-252 "temp3", BJJ-253 "temp4") |
| short_description | 245/249 | 4 | 4 missing |
| body content (20+ words) | 190/249 | 59 | 24% are stubs |
| tags | 0/249 | 249 | **Completely empty across entire corpus** |
| related | 0/249 | 249 | **Completely empty across entire corpus** |

### Content Quality by Category (worst first)
| Category | Total | Stubs (<20 words) | % Stub |
|---|---|---|---|
| physics-of-grappling | 12 | 10 | 83% |
| player-types | 5 | 3 | 60% |
| coaching | 7 | 4 | 57% |
| do-s-don-ts | 22 | 9 | 41% |
| 21-immutable-principles | 22 | 8 | 36% |
| noteworthy-grapplers | 2 | 1 | 50% |
| internal | 3 | 1 | 33% |
| memes | 12 | 3 | 25% |
| resources | 8 | 2 | 25% |
| black-belt-wisdom | 4 | 1 | 25% |
| tactics | 14 | 3 | 21% |
| 32-principles | 31 | 6 | 19% |
| grappling-primitives | 34 | 5 | 15% |
| dojos-clubs-types | 7 | 1 | 14% |
| learning-methods | 14 | 1 | 7% |
| why-do-we-train | 17 | 1 | 6% |
| anatomy-awareness | 14 | 0 | 0% |
| strategy | 8 | 0 | 0% |
| training | 7 | 0 | 0% |
| white-belt-tips | 3 | 0 | 0% |
| competition | 3 | 0 | 0% |

### Placeholder / Broken Entries
- **BJJ-202**: "Unnamed" in grappling-primitives - needs naming or removal
- **BJJ-252**: "temp3" in coaching - placeholder, needs replacement
- **BJJ-253**: "temp4" in coaching - placeholder, needs replacement
<user> : yes, errors, let's re-assign their numbers and erase these.
### Physics Disaster Zone
10 of 12 physics concepts are 3-4 word stubs:
BJJ-205 Leverage, BJJ-206 Torque, BJJ-207 Shear, BJJ-208 Axial Load, BJJ-209 Centripetal/Centrifugal, BJJ-210 Redirection, BJJ-211 Acceleration, BJJ-212 Impulse, BJJ-213 Momentum
<user> let's develop these a bit more.  I want to keep a casual tone that sounds like user, and avoid emdashes.
---

## 2. REDUNDANCY ANALYSIS

### Intentional Overlap (OK - external frameworks)
- **21 Immutable Principles** (22 concepts) and **32 Principles** (31 concepts) are imported from other people's lists. They WILL overlap with grappling-primitives and with each other. This is by design.
- **Do's & Don'ts** (22 concepts) overlaps with training, coaching, and white-belt-tips by nature.

### Potential Redundancy (worth reviewing)
- **BJJ-004 Anticipation** (grappling-primitives) vs **BJJ-035 Anticipation** (tactics) - same concept in two categories?
 <user> for these, we should keep one and reference it in two different spots when necessary... unless the coordinates are different?  although here we could remove it as a primitive.
- **BJJ-003 Grip Fighting** (grappling-primitives) vs grip-related concepts in 32-principles
- **BJJ-102 Distance Management** (grappling-primitives) vs distance concepts in tactics/strategy
- **BJJ-031 Form Tension** (grappling-primitives) vs tension concepts in anatomy-awareness
<user> slightly different concepts, redundnacy ok.
- **Training** category (7) vs **Coaching** category (7) - significant overlap in scope
- **White Belt Tips** (3) could arguably fold into **Do's & Don'ts** (22)
      <user> potentially go playful with purple belt tips, brown belt tips, etc.
	  
### Orphaned Category
- **Techniques** (cat-techniques) exists with color and axis definitions but has ZERO concepts assigned. Either populate or remove.
   <user> placeholder.
---

## 3. MISSING CONNECTIONS

### The `related` and `tags` Fields Are 100% Empty

This is the single biggest structural gap. Every concept is an island. No cross-referencing exists except through category grouping and the 2D axis positioning.

### Recommended Connection Types
1. **Concept-to-concept**: "Rotational Control" relates to "6DoF", "Axis Awareness", "Form Tension"
   <user> yes. good... although some concepts might technically apply to so many others, that would make for interesting separate vizualisations.
2. **Concept-to-position**: Where does this primitive apply? (back control, mount, guard, etc.)
   <user> the concepts should apply everywhere, that's the idea.   There are plenty of sites that go into the details of positions and techniques.   One thing we could do is give a few concrete examples, but none would be exhaustive.
3. **Concept-to-belt**: At what level does this become relevant?
   <user> not important.  If anything concepts are even more important at the beginning, with experience one can dive into details... or with experience one can extract the essense... 
4. **Concept-to-article**: Which articles discuss this concept in depth?  
    <user> yes, long term we want to cross-reference everything for navigation.

### Priority: Populate `related` for grappling-primitives first (34 concepts)
These are the core building blocks. Cross-linking them creates the knowledge graph backbone.
<user>  let's collaborate.  we'll create a system whereby Claude proposes 5 concepts at a time and their connection, and the user will validate.

---

## 4. NEW PRIMITIVES FROM ARTICLES & EXPERIMENTS

### Articles contain rich conceptual content not yet named as primitives:

**HIGH PRIORITY (fundamental, broadly applicable):**
1. **Secondary Limb Control** - "Control the other limb" principle. Appears in RDLR, leg locks, kimura, armbar defense. Source: `Articles/Control the Other Limb.md`
2. **Intensity Drift** - Ego-driven escalation mid-roll. Source: `Articles/Training Intensity.md`, ideal-partner module
3. **Positional Spectrum** - Every position is a point on a continuous advantage scale, not binary offense/defense. Source: beyond-offense-defense module
   <user> let's create these entries.

**MEDIUM PRIORITY (useful frameworks):**
4. **Explore vs Exploit** - Multi-armed bandit applied to training strategy. White belt = explore, competition = exploit. Source: `Articles/Multi-Armed Bandit.md`
5. **Progressive Resistance (Mithridatism)** - Graduated exposure to bad positions builds resilience. Source: `Articles/Mithridatism.md`
6. **Tension Economy** - Minimum effective tension; parasitic vs productive muscular effort. Source: jibunwotsukure module, build-yourself
7. **Diagonal/Spiral Control** - Torsion through opposite corners. Generalizes beyond back control to mount, side control, guard passing. Source: back-control module, BackTakeBackControlNotes.md
<user> let's create those entries.  short an high-signal based on their respective articles.

**LOWER PRIORITY (meta-learning, already partially covered):**
8. **Insight Accumulation** - Training frequency multiplies breakthrough probability (Monte Carlo model). Source: `Articles/Hunting Insights.md`
9. **Kinetic Chain / Force Path** - Power rooted in feet, transmitted through skeleton. Source: `Articles/Esoteric Internal Power.md`, build-yourself module
10. **Shu-Ha-Ri stages** - Follow, adapt, transcend. Source: `Articles/守破離.md`
<user> let's create these.

### Mapping Against Existing List
| Potential Primitive | Closest Existing | Gap |
|---|---|---|
| Secondary Limb Control | BJJ-085 Joint Above | Different principle. Joint Above is mechanical; Secondary Limb is tactical. New concept needed. |
| Intensity Drift | No match | New concept needed. |
| Positional Spectrum | No match | New concept needed. |
| Explore vs Exploit | No match | New concept needed. |
| Progressive Resistance | No match | New concept needed. |
| Tension Economy | BJJ-031 Form Tension | Overlapping but distinct. Form Tension is about structure; Tension Economy is about efficiency. Could be same concept expanded. |
| Diagonal/Spiral Control | BJJ-261 Rotational Control | Subset. Spiral is one strategy within rotational control. Could be separate or folded in. |
| Insight Accumulation | No match | New concept, but more meta-learning than primitive. |
| Kinetic Chain | BJJ-076 Fascia Activation | Related but different scope. Fascia is tissue-specific; kinetic chain is the full pathway. |
| Shu-Ha-Ri | No match | Well-known framework. Worth adding to learning-methods. |
<user> good, let's create these.
---

## 5. FUTURE PLAN 1: Concept Hover-Cards

### Vision
Anywhere on the site where a concept name appears in text (e.g., "rotational control", "6DoF", "form tension"), it should be highlighted as a link. Hovering shows a card with: id, name, category, short_description, and a "View in QuadTree" link.

### Implementation Approach
1. Build a concept name lookup table at build time (from Content Collections)
2. Create a `<ConceptLink>` Astro component that renders highlighted text + hover card
3. For article/module prose: either manual tagging with `<ConceptLink id="BJJ-261">` or an Astro remark plugin that auto-links known concept names
4. Hover card: fixed-position tooltip (similar to sim-hover-tooltip pattern already built)

### Prerequisite
- `short_description` must be populated for all 249 concepts (currently 4 missing, 59 are stubs)
<user> do we need the short description?
I suppose upon "hover" we could show the short description. and a longer one when clicking.
---

## 6. FUTURE PLAN 2: Move Deconstruction

### Vision
A section/module where a specific technique (e.g., "rear naked choke from back control") is deconstructed into its primitive building blocks. Visual: a technique name at top, with lines connecting down to the primitives it uses.

### Possible Structure
```
TECHNIQUE: Rear Naked Choke (from back control)
  |
  +-- Rotational Control (BJJ-261) -- lock spinal axis
  +-- Grip Fighting (BJJ-003) -- negate defensive hands
  +-- Joint Above (BJJ-085) -- control elbow to expose neck
       <user> I would say this applies to armbars and kneebars and heel hooks, etc. joint locks, not strangles.
  +-- Form Tension (BJJ-031) -- maintain squeeze structure
  +-- Anticipation (BJJ-004) -- time the chin tuck
  <user> not specifically so... I would leave it out for now.
  +-- Overlapping Pressure (BJJ-200) -- chest-to-back adhesion
```
<user> soft tissue for strangles.  occlude the carotid...  maybe need new basic primitives for strangles/chokes specifically.

### Implementation Approach
1. Define a new content collection: `technique-deconstructions` with fields: technique name, position context, list of primitive IDs + role description
2. Visualization: tree/graph diagram (canvas or SVG) showing technique at root, primitives as branches
3. Each primitive node is clickable (links to QuadTree or hover-card)
4. Could start with 3-5 iconic techniques to prove the format
<user> yes, worthwhile experiment.
armbar; control the joint above, lever, fulcrum, shear, control the secondary limb, be ready with secondary attacks if they escape (new concept : map their escape routes)

### Prerequisite
- `related` field populated (or a new `used_in_techniques` field)
- Concept hover-cards working (Plan 1)

---

## 7. RECOMMENDED ACTION SEQUENCE

### Phase A: Content Cleanup (no code changes)
1. Fix 3 placeholder entries (BJJ-202, BJJ-252, BJJ-253)
2. Expand 10 physics stubs to 100+ words each
3. Fill 4 missing short_descriptions
4. Decide: keep or remove empty Techniques category

### Phase B: Populate Connections (data work)
1. Add `tags` to all 34 grappling-primitives concepts first
2. Add `related` cross-links between grappling-primitives
3. Expand to other categories progressively

### Phase C: New Primitives
1. Create BJJ-262 through BJJ-267 for the high/medium priority candidates
2. Write full body content for each

### Phase D: Feature - Concept Hover-Cards
1. Build `<ConceptLink>` component
2. Apply to back-control module as pilot
3. Roll out to other modules

### Phase E: Feature - Move Deconstruction
1. Design technique-deconstruction data model
2. Build visualization component
3. Start with 3-5 techniques

---

## Verification
This is an audit document, not an implementation plan. No code changes. The document should be reviewed and decisions made about prioritization before any implementation begins.
