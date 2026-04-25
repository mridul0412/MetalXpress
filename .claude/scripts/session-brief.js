#!/usr/bin/env node
/**
 * BhavX Session Brief Hook
 * ─────────────────────────────────────────────────────────────────────────────
 * Fires on SessionStart (startup, resume, clear) and injects the current week's
 * open items from BUSINESS_ROADMAP.md + critical-path items from ROADMAP.md as
 * additionalContext. Claude sees this and surfaces it to the user at session
 * start.
 *
 * Activation: silent before 2026-05-01, fully active on/after that date.
 *   → User wants to focus on tech sprint Apr 27-30 before business mode begins.
 *
 * Edit ACTIVATION_DATE below to change the cutover. Edit START_DATE if Month 1
 * Week 1 should map to a different calendar date.
 */

const fs = require('fs');
const path = require('path');

// ─── Config ───────────────────────────────────────────────────────────────
const ACTIVATION_DATE = new Date('2026-05-01T00:00:00');
const START_DATE      = new Date('2026-05-01T00:00:00'); // Month 1 Week 1 begins
const REPO_ROOT       = path.resolve(__dirname, '..', '..');
const BIZ_FILE        = path.join(REPO_ROOT, 'BUSINESS_ROADMAP.md');
const PROD_FILE       = path.join(REPO_ROOT, 'ROADMAP.md');
const MAX_BIZ_ITEMS   = 8;
const MAX_PROD_ITEMS  = 5;

// ─── Silent exit if before activation ────────────────────────────────────
const today = new Date();
if (today < ACTIVATION_DATE) {
  // Output empty JSON so the hook is well-formed but injects nothing.
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: '' } }));
  process.exit(0);
}

// ─── Calculate current Month + Week since START_DATE ─────────────────────
const dayDelta  = Math.floor((today - START_DATE) / (1000 * 60 * 60 * 24));
const monthIdx  = Math.floor(dayDelta / 30);                    // 0-indexed
const weekIdx   = Math.floor((dayDelta % 30) / 7);              // 0-indexed within month
const month     = monthIdx + 1;                                  // 1-6
const week      = Math.min(weekIdx + 1, 4);                      // 1-4 (cap at week 4)
const monthName = ['Foundation', 'Public Launch', 'Angel Round', 'VC Pipeline', 'VC Pitches', 'Close + Announce'][monthIdx] || 'Post-Plan';

// If we're past Month 6 (Week 24+), show post-plan message
if (month > 6) {
  const briefing = [
    '🎯 BHAVX — Post-Plan Period',
    '─────────────────────────────────────',
    'You\'re past the original 6-month roadmap.',
    'Time to plan Series A or next growth phase.',
    'Update BUSINESS_ROADMAP.md with new targets.',
  ].join('\n');
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: briefing } }));
  process.exit(0);
}

// ─── Helpers ──────────────────────────────────────────────────────────────
function safeRead(file) {
  try { return fs.readFileSync(file, 'utf8'); }
  catch { return null; }
}

/**
 * Extract `- [ ]` checkbox items from a slice of markdown bounded by
 * (startHeader regex match) and (endHeader regex match — first occurrence
 * after start, or end of file). Skips already-completed `[x]` items.
 */
function extractOpenItems(md, startRegex, endRegex, max) {
  if (!md) return [];
  const startMatch = md.match(startRegex);
  if (!startMatch) return [];
  const startIdx = startMatch.index + startMatch[0].length;
  const tail = md.slice(startIdx);
  const endMatch = endRegex ? tail.match(endRegex) : null;
  const slice = endMatch ? tail.slice(0, endMatch.index) : tail;
  const items = [];
  const lineRegex = /^[ \t]*- \[ \] (.+)$/gm;
  let m;
  while ((m = lineRegex.exec(slice)) !== null) {
    if (items.length >= max) break;
    // Strip wiki-link suffixes and trailing detail blobs to keep one-liner clean
    let text = m[1].replace(/\[(.+?)\]\(.+?\)/g, '$1').trim();
    if (text.length > 90) text = text.slice(0, 87) + '…';
    items.push(text);
  }
  return items;
}

// ─── Pull current month/week items from BUSINESS_ROADMAP ──────────────────
const bizMd  = safeRead(BIZ_FILE);
const bizStart = new RegExp(`### Week ${week}:[^\\n]*\\n`, 'i');
const bizEnd   = /\n### Week \d+:|^## /m;
let bizItems = extractOpenItems(bizMd, bizStart, bizEnd, MAX_BIZ_ITEMS);

// Fallback: if we can't find Week N for current Month, show Month-level items
if (bizItems.length === 0 && bizMd) {
  // Find the Month section — match the emoji + "Month N" header
  const monthEmojis = ['🔴', '🟡', '🟢', '🔵', '🟣', '🌟'];
  const emoji = monthEmojis[monthIdx] || '🔴';
  const monthStart = new RegExp(`## ${emoji} Month ${month}[^\\n]*\\n`, 'i');
  const monthEnd   = /\n## (?:🔴|🟡|🟢|🔵|🟣|🌟|📊|⚠️|💰|🎯|📞|🤖|📅)/;
  bizItems = extractOpenItems(bizMd, monthStart, monthEnd, MAX_BIZ_ITEMS);
}

// ─── Pull critical-path items from product ROADMAP ────────────────────────
const prodMd   = safeRead(PROD_FILE);
const prodStart = /## 🔴 CRITICAL[^\n]*\n/;
const prodEnd   = /\n## /;
const prodItems = extractOpenItems(prodMd, prodStart, prodEnd, MAX_PROD_ITEMS);

// ─── Build briefing ───────────────────────────────────────────────────────
const dateStr = today.toISOString().slice(0, 10);
const lines = [
  `🎯 BHAVX — Month ${month} (${monthName}), Week ${week}    [${dateStr}]`,
  '─────────────────────────────────────────────────────────',
];

if (bizItems.length > 0) {
  lines.push('', '💼 BUSINESS — this week (BUSINESS_ROADMAP.md)');
  bizItems.forEach(t => lines.push(`  □ ${t}`));
} else {
  lines.push('', '💼 BUSINESS — no open items found for this week');
  lines.push('   Either everything ticked off, or section header changed.');
}

if (prodItems.length > 0) {
  lines.push('', '⚙️  PRODUCT — critical-path blockers (ROADMAP.md)');
  prodItems.forEach(t => lines.push(`  □ ${t}`));
}

lines.push(
  '',
  `🎯 6-mo goal: ₹10-25 Cr seed (realistic) | ₹50 Cr (stretch)`,
  '📁 Plans: BUSINESS_ROADMAP.md  |  ROADMAP.md',
  '',
  '⚠️ Mark items done by editing `[ ]` → `[x] (done YYYY-MM-DD)` —',
  '   keep history, don\'t delete lines.',
);

const briefing = lines.join('\n');

// ─── Emit ─────────────────────────────────────────────────────────────────
process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: 'SessionStart',
    additionalContext: briefing,
  },
}));
process.exit(0);
