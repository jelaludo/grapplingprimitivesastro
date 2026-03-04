/**
 * generate-gif-manifest.mjs
 *
 * Scans the local GIF folder, auto-detects instructors + techniques from
 * filenames, and writes public/gifs-manifest.json + public/gifs-config.json.
 *
 * Usage:
 *   node scripts/generate-gif-manifest.mjs
 *
 * After running:
 *   1. Review public/gifs-manifest.json — manually fix any mis-categorised items
 *   2. Set cdn_base in the manifest to your R2 public URL
 *   3. Upload GIFs to R2 (see rclone instructions at bottom of this file)
 */

import fs   from 'fs';
import path from 'path';

// ── Config ────────────────────────────────────────────────────────────────────

const GIF_FOLDER  = 'L:/Gifs_BJJ_4_GrapplingPrimitives_936gifs_2GB';
const MANIFEST_OUT = './public/gifs-manifest.json';
const CONFIG_OUT   = './public/gifs-config.json';

// Replace with your actual R2 public URL once enabled
// e.g. "https://pub-abc123.r2.dev"
const CDN_BASE = 'PASTE_YOUR_R2_PUBLIC_URL_HERE';

// ── Instructor rules ──────────────────────────────────────────────────────────
// First match wins per rule, but a file CAN match multiple instructors
// (e.g. a collaborative clip). Add patterns in order of specificity.

const INSTRUCTOR_RULES = [
  {
    id: 'wim', label: 'Wim de Putter',
    patterns: [/\bwim\b/i, /dePutter/i, /babybridge/i, /mirroring.*wim/i],
  },
  {
    id: 'danaher', label: 'John Danaher',
    patterns: [/danaher/i, /\bJD_/i, /^D10/i],
  },
  {
    id: 'lachlan', label: 'Lachlan Giles',
    patterns: [/lachlan/i, /\blach\b/i, /5050Vol/i, /50_50/i, /LegLockAnthology/i],
  },
  {
    id: 'tonon', label: 'Gordon Tonon',
    patterns: [/\btonon\b/i, /\bGT_/i, /^GT\d/i],
  },
  {
    id: 'craig', label: 'Craig Jones',
    patterns: [/craigJones/i, /\bcraig\b/i, /jonesz/i, /p-jones/i, /CraigJonesVol/i],
  },
  {
    id: 'keenan', label: 'Keenan Cornelius',
    patterns: [/keenan/i],
  },
  {
    id: 'camarillo', label: 'Dave Camarillo',
    patterns: [/camarillo/i],
  },
  {
    id: 'budojake', label: 'Budo Jake',
    patterns: [/budojake/i, /budo.?jake/i],
  },
  {
    id: 'yoshioka', label: 'Yoshioka',
    patterns: [/yoshioka/i],
  },
  {
    id: 'vlad', label: 'Vlad',
    patterns: [/\bvlad\b/i, /vlad-/i],
  },
];

// ── Technique rules ───────────────────────────────────────────────────────────
// Multiple can match the same file — that's intentional.

const TECHNIQUE_RULES = [
  { id: 'armbar',          label: 'Armbar',          pattern: /armbar|juji/i },
  { id: 'triangle',        label: 'Triangle',         pattern: /triangle|sankaku/i },
  { id: 'kimura',          label: 'Kimura',           pattern: /kimura/i },
  { id: 'toe-hold',        label: 'Toe Hold',         pattern: /toehold|toe.hold|toeHold/i },
  { id: 'heel-hook',       label: 'Heel Hook',        pattern: /heelhook|heel.hook|heelHook/i },
  { id: 'kneebar',         label: 'Kneebar',          pattern: /kneebar|knee.bar/i },
  { id: 'rnc',             label: 'Rear Naked Choke', pattern: /\brnc\b|rear.?naked/i },
  { id: 'k-guard',         label: 'K-Guard',          pattern: /kguard|k.guard|KGuard/i },
  { id: '50-50',           label: '50/50',            pattern: /5050|50_50/i },
  { id: 'leg-lock',        label: 'Leg Lock',         pattern: /leglock|leg.lock|ankle.?lock|toeHold|heelHook|kneebar/i },
  { id: 'sweep',           label: 'Sweep',            pattern: /sweep/i },
  { id: 'takedown',        label: 'Takedown',         pattern: /takedown|osoto|tai.?otoshi|ankle.?pick|ouchi|kouchi|seoi|ippons/i },
  { id: 'back',            label: 'Back Control',     pattern: /back.?take|back.?control|back.?offense|backHeel|BackControl/i },
  { id: 'guard-pass',      label: 'Guard Pass',       pattern: /guard.?pass|passguard|GuardPass/i },
  { id: 'escape',          label: 'Escape',           pattern: /escape|hip.?escape/i },
  { id: 'de-la-riva',      label: 'De La Riva',       pattern: /\bdlr\b|de.?la.?riva/i },
  { id: 'slx',             label: 'SLX',              pattern: /\bslx\b/i },
  { id: 'half-guard',      label: 'Half Guard',       pattern: /half.?guard|halfguard/i },
  { id: 'single-leg',      label: 'Single Leg',       pattern: /single.?leg|singleleg/i },
  { id: 'double-leg',      label: 'Double Leg',       pattern: /double.?leg|doubleleg/i },
  { id: 'bridging',        label: 'Bridging',         pattern: /bridge|babybridge|bridg/i },
  { id: 'pummeling',       label: 'Pummeling',        pattern: /pummel/i },
  { id: 'wrist-lock',      label: 'Wrist Lock',       pattern: /wristlock|wrist.?lock/i },
  { id: 'body-lock',       label: 'Body Lock',        pattern: /body.?lock|bodylock/i },
];

// ── Tag rules (cross-cutting concerns) ───────────────────────────────────────

const TAG_RULES = [
  { id: 'slow-mo',     label: 'Slow Mo',     pattern: /slow.?mo|slomo|SloMo|SlowMo|Back2x|_2x\b/i },
  { id: 'drill',       label: 'Drill',       pattern: /drill/i },
  { id: 'competition', label: 'Competition', pattern: /competition|comp\b/i },
  { id: 'concept',     label: 'Concept',     pattern: /concept/i },
];

// ── Detection helpers ─────────────────────────────────────────────────────────

function detect(filename, rules, multiMatch = true) {
  const hits = [];
  for (const rule of rules) {
    const patterns = rule.patterns ?? [rule.pattern];
    if (patterns.some(p => p.test(filename))) {
      hits.push(rule.id);
      if (!multiMatch) break;
    }
  }
  return hits;
}

function detectInstructors(filename) {
  const hits = detect(filename, INSTRUCTOR_RULES, true);
  return hits.length ? hits : ['other'];
}

// ── Main ──────────────────────────────────────────────────────────────────────

if (!fs.existsSync(GIF_FOLDER)) {
  console.error(`ERROR: GIF folder not found: ${GIF_FOLDER}`);
  process.exit(1);
}

const files = fs.readdirSync(GIF_FOLDER)
  .filter(f => f.toLowerCase().endsWith('.gif') && !f.startsWith('._'))
  .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

console.log(`Found ${files.length} GIF files in ${GIF_FOLDER}\n`);

const gifs = files.map(filename => {
  const fullPath = path.join(GIF_FOLDER, filename);
  const size_kb  = Math.round(fs.statSync(fullPath).size / 1024);

  return {
    file:        filename,
    size_kb,
    instructors: detectInstructors(filename),
    techniques:  detect(filename, TECHNIQUE_RULES, true),
    tags:        detect(filename, TAG_RULES, true),
  };
});

// ── Print stats ───────────────────────────────────────────────────────────────

const count = (arr, key) => {
  const c = {};
  arr.forEach(g => g[key].forEach(v => { c[v] = (c[v] || 0) + 1; }));
  return Object.entries(c).sort((a, b) => b[1] - a[1]);
};

console.log('── Instructor breakdown ──────────────────────────');
count(gifs, 'instructors').forEach(([k, v]) => console.log(`  ${k.padEnd(14)} ${v}`));

console.log('\n── Technique breakdown ───────────────────────────');
count(gifs, 'techniques').forEach(([k, v]) => console.log(`  ${k.padEnd(18)} ${v}`));

console.log('\n── Tag breakdown ─────────────────────────────────');
count(gifs, 'tags').forEach(([k, v]) => console.log(`  ${k.padEnd(14)} ${v}`));

const noTechnique = gifs.filter(g => g.techniques.length === 0);
const totalMB     = Math.round(gifs.reduce((s, g) => s + g.size_kb, 0) / 1024);

console.log(`\n── Summary ───────────────────────────────────────`);
console.log(`  Total GIFs      : ${gifs.length}`);
console.log(`  Total size      : ${totalMB} MB`);
console.log(`  No technique tag: ${noTechnique.length} files (review these manually)`);
console.log(`\n  First 10 untagged technique files:`);
noTechnique.slice(0, 10).forEach(g => console.log(`    ${g.file}`));

// ── Write manifest ────────────────────────────────────────────────────────────

const manifest = {
  generated: new Date().toISOString().split('T')[0],
  total:     gifs.length,
  cdn_base:  CDN_BASE,
  taxonomy: {
    instructors: [
      ...INSTRUCTOR_RULES.map(r => ({ id: r.id, label: r.label })),
      { id: 'other', label: 'Other' },
    ],
    techniques: TECHNIQUE_RULES.map(r => ({ id: r.id, label: r.label })),
    tags:        TAG_RULES.map(r => ({ id: r.id, label: r.label })),
  },
  gifs,
};

fs.mkdirSync(path.dirname(MANIFEST_OUT), { recursive: true });
fs.writeFileSync(MANIFEST_OUT, JSON.stringify(manifest, null, 2));
console.log(`\n✓ Manifest written → ${MANIFEST_OUT}`);

// ── Write kill-switch config ──────────────────────────────────────────────────
// Upload this to R2 root as "gifs-config.json".
// To disable GIFs without a redeploy: edit this file in R2 dashboard.

const config = { enabled: true, reason: '' };
fs.writeFileSync(CONFIG_OUT, JSON.stringify(config, null, 2));
console.log(`✓ Config written  → ${CONFIG_OUT}`);
console.log(`  (upload gifs-config.json to R2 root alongside the GIFs)\n`);

// ── rclone upload instructions ────────────────────────────────────────────────
console.log(`
── NEXT: Upload to R2 via rclone ─────────────────────────────────────────────

1. Install rclone:  https://rclone.org/downloads/  (Windows: winget install Rclone.Rclone)

2. Configure R2 remote (run once):
     rclone config
     → New remote → name: r2gp
     → Storage type: s3
     → Provider: Cloudflare
     → Access key ID + Secret: from Cloudflare R2 → Manage API Tokens
     → Endpoint: https://<ACCOUNT_ID>.r2.cloudflarestorage.com

3. Test connection:
     rclone ls r2gp:r2grapplingprimitives

4. Upload all GIFs (dry-run first):
     rclone copy "L:/Gifs_BJJ_4_GrapplingPrimitives_936gifs_2GB" r2gp:r2grapplingprimitives --dry-run --progress

5. Real upload (will take a few minutes on a fast connection):
     rclone copy "L:/Gifs_BJJ_4_GrapplingPrimitives_936gifs_2GB" r2gp:r2grapplingprimitives --progress

6. Upload the kill-switch config:
     rclone copy "public/gifs-config.json" r2gp:r2grapplingprimitives --progress

──────────────────────────────────────────────────────────────────────────────
`);
