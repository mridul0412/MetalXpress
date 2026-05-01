#!/usr/bin/env node
/**
 * BhavX Session Brief Hook — v3 (push notifications, pace-aware, auto-advance, criticality)
 * ─────────────────────────────────────────────────────────────────────────────
 * Fires on SessionStart and injects:
 *   1. Current Month/Week from BUSINESS_ROADMAP.md (auto-advances past completed weeks)
 *   2. Pending tech blockers from ROADMAP.md (CRITICAL → REVENUE if CRITICAL all done)
 *   3. Pace tracking: counts items completed in last 7 days, warns if behind
 *   4. Criticality banner during Month 1 (VC-readiness window)
 *   5. 🔔 Push notification to phone via ntfy.sh when pace is RED or YELLOW
 *
 * Activation: 2026-05-01. Edit ACTIVATION_DATE to override.
 *
 * ── Push notification setup (one-time, 30 seconds) ────────────────────────
 *   1. Install "ntfy" app on your phone (Android/iOS — free, no account)
 *   2. Subscribe to topic: bhavx-mridul-alerts
 *      (or change NTFY_TOPIC below to any unique string)
 *   3. That's it. Notifications fire automatically when pace is behind.
 *
 * ── Standalone daily nudge (Windows Task Scheduler) ──────────────────────
 *   To get nudged even on days you don't open Claude, run this script daily:
 *   1. Open Task Scheduler → Create Basic Task
 *   2. Trigger: Daily at 9:00 AM
 *   3. Action: Start Program → node
 *   4. Arguments: "C:\Users\Lenovo\Downloads\MetalXpress\.claude\worktrees\great-goldwasser\.claude\scripts\session-brief.js" --notify-only
 *   5. Start in: C:\Users\Lenovo\Downloads\MetalXpress\.claude\worktrees\great-goldwasser
 */

const fs           = require('fs');
const path         = require('path');
const https        = require('https');
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

// ─── Push notification config (ntfy.sh — free, no account needed) ────────
const NTFY_TOPIC   = 'bhavx-mridul-alerts'; // Change this to something unique to you
const NTFY_ENABLED = true;                   // Set false to disable all push notifications

// ─── CLI flag: --notify-only skips Claude output, just sends push ─────────
const NOTIFY_ONLY = process.argv.includes('--notify-only');

// ─── Silent exit if before activation ────────────────────────────────────
const today = new Date();
if (today < ACTIVATION_DATE && !NOTIFY_ONLY) {
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: '' } }));
  process.exit(0);
}

// ─── Calculate current Month + Week since START_DATE ─────────────────────
const dayDelta  = Math.floor((today - START_DATE) / (1000 * 60 * 60 * 24));
const monthIdx  = Math.max(0, Math.floor(dayDelta / 30));
const weekIdx   = Math.floor((dayDelta % 30) / 7);
const month     = monthIdx + 1;
let   week      = Math.min(weekIdx + 1, 4);
const monthName = ['Foundation', 'Public Launch', 'Angel Round', 'VC Pipeline', 'VC Pitches', 'Close + Announce'][monthIdx] || 'Post-Plan';
const monthEmojis = ['🔴', '🟡', '🟢', '🔵', '🟣', '🌟'];
const emoji = monthEmojis[monthIdx] || '🔴';

// ─── Push notification helper ─────────────────────────────────────────────
function sendPush(title, message, priority = 'default', tags = []) {
  if (!NTFY_ENABLED) return;
  const body = JSON.stringify({ topic: NTFY_TOPIC, title, message, priority, tags });
  const req = https.request({
    hostname: 'ntfy.sh',
    port: 443,
    path: '/',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
  }, () => {}); // fire-and-forget
  req.on('error', () => {}); // silent on failure — don't break Claude session
  req.write(body);
  req.end();
}

// Past Month 6
if (month > 6) {
  if (NOTIFY_ONLY) {
    sendPush('BhavX 🎯', 'Past the 6-month roadmap. Time to plan Series A!', 'default', ['tada']);
    process.exit(0);
  }
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
    const endRe   = /\n### Week \d+:|\n## /;
    const items   = extractOpenItems(md, startRe, endRe, MAX_BIZ_ITEMS);
    if (items.length > 0) return { week: w, items };
  }
  return { week: currentWeek, items: [] };
}

// Pace tracking: count items completed in last N days
// Accepts any of these date stamp formats on `[x]` lines:
//   ✅ (done YYYY-MM-DD)    ✅ (YYYY-MM-DD)    (done YYYY-MM-DD)
function countRecentlyCompleted(md, days = 7) {
  if (!md) return { count: 0 };
  const cutoff = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
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
const bizMd = safeRead(BIZ_FILE);

function pullWeekItems(md, w) {
  const startRe = new RegExp(`### Week ${w}:[^\\n]*\\n`, 'i');
  const endRe   = /\n### Week \d+:|\n## /;
  return extractOpenItems(md, startRe, endRe, MAX_BIZ_ITEMS);
}

// Find first 2 weeks (current onwards) that have any open items
let bizSections = [];
for (let w = week; w <= 4 && bizSections.length < 2; w++) {
  const items = pullWeekItems(bizMd, w);
  if (items.length > 0) bizSections.push({ week: w, items });
}

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

// ─── Pull tech blockers (priority chain: CRITICAL → PRE-BETA → REVENUE) ──
const prodMd = safeRead(PROD_FILE);
const sectionChain = [
  { regex: /## 🔴 CRITICAL[^\n]*\n/, label: 'CRITICAL — Before Go-Live' },
  { regex: /## 🟠 PRE-BETA[^\n]*\n/, label: 'PRE-BETA — Week 1 Sprint (BLOCKERS for trader onboarding)' },
  { regex: /## 🟡 REVENUE[^\n]*\n/, label: 'REVENUE — Public Launch (Month 2)' },
];
const sectionEnd = /\n## /;
let prodItems = [];
let prodSection = '';
for (const sec of sectionChain) {
  const items = extractOpenItems(prodMd, sec.regex, sectionEnd, MAX_PROD_ITEMS);
  if (items.length > 0) {
    prodItems = items;
    prodSection = sec.label;
    break;
  }
}

// ─── Pace tracking ───────────────────────────────────────────────────────
const bizPace   = countRecentlyCompleted(bizMd, 7);
const prodPace  = countRecentlyCompleted(prodMd, 7);
const totalDone = bizPace.count + prodPace.count;
let paceLabel, paceEmoji, paceStatus;
if (totalDone >= PACE_TARGET) {
  paceLabel  = `On pace — ${totalDone} items completed in last 7 days (target ${PACE_TARGET}+)`;
  paceEmoji  = '🟢';
  paceStatus = 'green';
} else if (totalDone >= PACE_TARGET / 2) {
  paceLabel  = `Mid-pace — ${totalDone} items completed in last 7 days (target ${PACE_TARGET}+)`;
  paceEmoji  = '🟡';
  paceStatus = 'yellow';
} else {
  paceLabel  = `BEHIND PACE — only ${totalDone} items in last 7 days (target ${PACE_TARGET}+). Push harder.`;
  paceEmoji  = '🔴';
  paceStatus = 'red';
}

// ─── Push notification logic ─────────────────────────────────────────────
// Fire push if pace is red or yellow (behind or mid-pace)
// Also fires on --notify-only mode (daily Task Scheduler nudge)
const nextItems = bizSections[0]?.items?.slice(0, 3) ?? [];
const nextItemsStr = nextItems.map(t => `• ${t}`).join('\n');

// ── Push logic ──
// Session start (default mode): only push if pace is yellow/red (never spam green)
// --notify-only mode (hourly Task Scheduler): smart — push every hour for red,
//   every 3rd hour for yellow, once-per-day for green (morning kickoff)
const hour = today.getHours();
const isFirstHourOfDay = hour <= 9; // 9 AM kickoff push regardless of pace

if (NOTIFY_ONLY) {
  // Hourly Task Scheduler mode
  if (paceStatus === 'red') {
    sendPush(
      `🔴 BhavX — BEHIND PACE (M${month}W${week})`,
      `Only ${totalDone}/${PACE_TARGET} items this week.\n\nNext:\n${nextItemsStr}\n\nShip something. Now.`,
      'high', ['rotating_light', 'bhavx']
    );
  } else if (paceStatus === 'yellow' && hour % 3 === 0) {
    // yellow: every 3 hours
    sendPush(
      `🟡 BhavX — Mid-Pace (M${month}W${week})`,
      `${totalDone}/${PACE_TARGET} items this week.\n\nNext:\n${nextItemsStr}`,
      'default', ['bhavx']
    );
  } else if (paceStatus === 'green' && isFirstHourOfDay) {
    // green: morning kickoff only
    sendPush(
      `📋 BhavX — M${month}W${week} kickoff`,
      `On pace (${totalDone}/${PACE_TARGET}). Today's focus:\n${nextItemsStr}`,
      'low', ['bhavx']
    );
  }
} else {
  // Session start mode — only push on yellow or red, never green
  if (paceStatus === 'red') {
    sendPush(
      `🔴 BhavX — BEHIND PACE (M${month}W${week})`,
      `Only ${totalDone}/${PACE_TARGET} items this week.\n\nNext:\n${nextItemsStr}\n\nOpen Claude and ship.`,
      'high', ['rotating_light', 'bhavx']
    );
  } else if (paceStatus === 'yellow') {
    sendPush(
      `🟡 BhavX — Mid-Pace (M${month}W${week})`,
      `${totalDone}/${PACE_TARGET} items this week.\n\nNext:\n${nextItemsStr}`,
      'default', ['bhavx']
    );
  }
}

// If --notify-only, stop here (no Claude output needed)
if (NOTIFY_ONLY) process.exit(0);

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
if (paceStatus === 'red') {
  lines.push('   ⚠️  Push notification sent to your phone.');
}

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
  '   pace tracker depends on the YYYY-MM-DD date stamp.',
  '',
  '🔔 Push notifications: install ntfy app → subscribe to "bhavx-mridul-alerts"'
);

const briefing = lines.join('\n');

process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: 'SessionStart',
    additionalContext: briefing,
  },
}));
process.exit(0);
