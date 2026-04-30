#!/usr/bin/env node
/**
 * BhavX Session Brief Hook — v2 (pace-aware, auto-advance, criticality)
 * ─────────────────────────────────────────────────────────────────────────────
 * Fires on SessionStart and injects:
 *   1. Current Month/Week from BUSINESS_ROADMAP.md (auto-advances past completed weeks)
 *   2. Pending tech blockers from ROADMAP.md (CRITICAL → REVENUE if CRITICAL all done)
 *   3. Pace tracking: counts items completed in last 7 days, warns if behind
 *   4. Criticality banner during Month 1 (VC-readiness window)
 *
 * Activation: 2026-05-01. Edit ACTIVATION_DATE to override.
 */

const fs        = require('fs');
const path      = require('path');
const { execSync } = require('child_process');

// ─── Config ───────────────────────────────────────────────────────────────
const ACTIVATION_DATE = new Date('2026-05-01T00:00:00');
const START_DATE      = new Date('2026-05-01T00:00:00'); // Month 1 Week 1 begins
const REPO_ROOT       = path.resolve(__dirname, '..', '..');
const BIZ_FILE        = path.join(REPO_ROOT, 'BUSINESS_ROADMAP.md');
const PROD_FILE       = path.join(REPO_ROOT, 'ROADMAP.md');
const MAX_BIZ_ITEMS   = 10;
const MAX_PROD_ITEMS  = 6;
const PACE_TARGET     = 6; // Items expected to complete per week (Month 1 sprint pace)

// ─── Silent exit if before activation ────────────────────────────────────
const today = new Date();
if (today < ACTIVATION_DATE) {
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: '' } }));
  process.exit(0);
}

// ─── Calculate current Month + Week since START_DATE ─────────────────────
const dayDelta  = Math.floor((today - START_DATE) / (1000 * 60 * 60 * 24));
const monthIdx  = Math.floor(dayDelta / 30);
const weekIdx   = Math.floor((dayDelta % 30) / 7);
const month     = monthIdx + 1;
let   week      = Math.min(weekIdx + 1, 4);
const monthName = ['Foundation', 'Public Launch', 'Angel Round', 'VC Pipeline', 'VC Pitches', 'Close + Announce'][monthIdx] || 'Post-Plan';
const monthEmojis = ['🔴', '🟡', '🟢', '🔵', '🟣', '🌟'];
const emoji = monthEmojis[monthIdx] || '🔴';

// Past Month 6
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
    let text = m[1].replace(/\[(.+?)\]\(.+?\)/g, '$1').trim();
    if (text.length > 90) text = text.slice(0, 87) + '…';
    items.push(text);
  }
  return items;
}

// Auto-advance: find first week in current month that has open items
function findActiveWeek(md, currentWeek) {
  for (let w = currentWeek; w <= 4; w++) {
    const startRe = new RegExp(`### Week ${w}:[^\\n]*\\n`, 'i');
    const endRe   = /\n### Week \d+:|\n## /;  // either next week or next H2
    const items   = extractOpenItems(md, startRe, endRe, MAX_BIZ_ITEMS);
    if (items.length > 0) return { week: w, items };
  }
  return { week: currentWeek, items: [] };
}

// Pace tracking: count items completed in last N days
// Accepts any of these date stamp formats on `[x]` lines:
//   ✅ (done YYYY-MM-DD)    ✅ (YYYY-MM-DD)
//   (done YYYY-MM-DD)
function countRecentlyCompleted(md, days = 7) {
  if (!md) return { count: 0 };
  const cutoff = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  // Walk every `- [x]` line, find the LAST date stamp on that line
  const lineRe = /^[ \t]*- \[x\][^\n]*$/gm;
  const dateRe = /(\d{4}-\d{2}-\d{2})/g;
  let count = 0;
  let m;
  while ((m = lineRe.exec(md)) !== null) {
    const dates = [...m[0].matchAll(dateRe)].map(x => x[1]);
    if (dates.length === 0) continue;
    const latest = dates[dates.length - 1];
    if (latest >= cutoffStr) count++;
  }
  return { count, cutoffStr };
}

// ─── Pull items from BUSINESS_ROADMAP ─────────────────────────────────────
// In Month 1 (sprint mode), always combine current week + next week so user
// sees a 2-week look-ahead. Weeks with all items checked are silently skipped.
const bizMd = safeRead(BIZ_FILE);

function pullWeekItems(md, w) {
  const startRe = new RegExp(`### Week ${w}:[^\\n]*\\n`, 'i');
  const endRe   = /\n### Week \d+:|\n## /;
  return extractOpenItems(md, startRe, endRe, MAX_BIZ_ITEMS);
}

// Find first 2 weeks (current onwards) that have any open items
let bizSections = [];  // [{ week: N, items: [...] }, ...]
for (let w = week; w <= 4 && bizSections.length < 2; w++) {
  const items = pullWeekItems(bizMd, w);
  if (items.length > 0) bizSections.push({ week: w, items });
}

// Track if first section is past-current-calendar (auto-advance)
const firstWeekShown = bizSections[0]?.week ?? week;
const advanced = firstWeekShown !== week;

// Fallback: month-level if no week items found at all
let bizFallback = false;
if (bizSections.length === 0 && bizMd) {
  const monthStart = new RegExp(`## ${emoji} Month ${month}[^\\n]*\\n`, 'i');
  const monthEnd   = /\n## (?:🔴|🟡|🟢|🔵|🟣|🌟|📊|⚠️|💰|🎯|📞|🤖|📅)/;
  const monthItems = extractOpenItems(bizMd, monthStart, monthEnd, MAX_BIZ_ITEMS);
  if (monthItems.length > 0) {
    bizSections = [{ week: 'month', items: monthItems }];
    bizFallback = true;
  }
}

// ─── Pull tech blockers (CRITICAL first, then REVENUE if CRITICAL is done) ──
const prodMd = safeRead(PROD_FILE);
const critStart = /## 🔴 CRITICAL[^\n]*\n/;
const critEnd   = /\n## /;
let prodItems   = extractOpenItems(prodMd, critStart, critEnd, MAX_PROD_ITEMS);
let prodSection = 'CRITICAL — Before Go-Live';
if (prodItems.length === 0) {
  // CRITICAL all done — promote REVENUE blockers
  const revStart = /## 🟡 REVENUE[^\n]*\n/;
  const revEnd   = /\n## /;
  prodItems = extractOpenItems(prodMd, revStart, revEnd, MAX_PROD_ITEMS);
  prodSection = 'REVENUE — Next-Priority Tech (CRITICAL ✅ done)';
}

// ─── Pace tracking ───────────────────────────────────────────────────────
const bizPace  = countRecentlyCompleted(bizMd, 7);
const prodPace = countRecentlyCompleted(prodMd, 7);
const totalDone = bizPace.count + prodPace.count;
let paceLabel, paceEmoji;
if (totalDone >= PACE_TARGET) {
  paceLabel = `On pace — ${totalDone} items completed in last 7 days (target ${PACE_TARGET}+)`;
  paceEmoji = '🟢';
} else if (totalDone >= PACE_TARGET / 2) {
  paceLabel = `Mid-pace — ${totalDone} items completed in last 7 days (target ${PACE_TARGET}+)`;
  paceEmoji = '🟡';
} else {
  paceLabel = `BEHIND PACE — only ${totalDone} items in last 7 days (target ${PACE_TARGET}+). Push harder.`;
  paceEmoji = '🔴';
}

// ─── Build briefing ───────────────────────────────────────────────────────
const dateStr = today.toISOString().slice(0, 10);
const lines = [];

// Criticality banner — Month 1 only
if (month === 1) {
  lines.push(
    '╔═══════════════════════════════════════════════════════════════════╗',
    '║  🔴 MONTH 1 IS CRITICAL — VC-READINESS WINDOW                     ║',
    '║  This month decides whether BhavX is fundable in the next 6 mo.   ║',
    '║  Goal: Live in prod ✅ + 20 onboarded users + co-founder + deck.  ║',
    '╚═══════════════════════════════════════════════════════════════════╝',
    ''
  );
}

lines.push(
  `🎯 BHAVX — Month ${month} (${monthName}), Week ${week}    [${dateStr}]`,
  '─────────────────────────────────────────────────────────'
);

// Pace
lines.push('', `${paceEmoji} PACE: ${paceLabel}`);

// Auto-advance notice
if (advanced) {
  lines.push('', `↪ Calendar Week ${week} fully complete — auto-advanced to Week ${firstWeekShown}+`);
}

// Business items
if (bizSections.length > 0) {
  if (bizFallback) {
    lines.push('', '💼 BUSINESS — Month-level open items (BUSINESS_ROADMAP.md)');
    bizSections[0].items.forEach(t => lines.push(`  □ ${t}`));
  } else {
    bizSections.forEach((sec, idx) => {
      const tag = idx === 0 ? 'NOW' : 'NEXT';
      lines.push('', `💼 BUSINESS — Week ${sec.week} [${tag}] (BUSINESS_ROADMAP.md)`);
      sec.items.forEach(t => lines.push(`  □ ${t}`));
    });
  }
} else {
  lines.push('', '💼 BUSINESS — all items in this month complete!');
  lines.push('   Update BUSINESS_ROADMAP.md or move to next month.');
}

// Tech items
if (prodItems.length > 0) {
  lines.push('', `⚙️  PRODUCT — ${prodSection} (ROADMAP.md)`);
  prodItems.forEach(t => lines.push(`  □ ${t}`));
}

// Footer
lines.push(
  '',
  '🎯 6-mo goal: ₹10-25 Cr seed (realistic) | ₹50 Cr (stretch)',
  '📁 Plans: BUSINESS_ROADMAP.md  |  ROADMAP.md',
  '',
  '⚠️ Mark items done by editing `[ ]` → `[x] (done YYYY-MM-DD)` —',
  '   pace tracker depends on the YYYY-MM-DD date stamp.'
);

const briefing = lines.join('\n');

process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: 'SessionStart',
    additionalContext: briefing,
  },
}));
process.exit(0);
