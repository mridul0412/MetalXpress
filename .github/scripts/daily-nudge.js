#!/usr/bin/env node
/**
 * BhavX Daily Nudge — runs in GitHub Actions (cloud), NOT on the laptop.
 * Fires once a day regardless of whether Mridul's machine is on.
 * Reads the roadmaps, counts what's pending, sends an ntfy push to his phone.
 *
 * Topic: bhavx-mridul-alerts  (subscribe in the ntfy app)
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const NTFY_TOPIC = 'bhavx-mridul-alerts';
const ROOT = path.resolve(__dirname, '..', '..');

function read(file) {
  try { return fs.readFileSync(path.join(ROOT, file), 'utf8'); }
  catch { return ''; }
}

// Pull the first N open "- [ ]" items from a markdown file (skip sub-bullets noise)
function openItems(md, max = 8) {
  const out = [];
  const re = /^[ \t]*-\s*\[ \]\s+(.+)$/gm;
  let m;
  while ((m = re.exec(md)) !== null && out.length < max) {
    let t = m[1].replace(/\*\*/g, '').replace(/`/g, '').replace(/\[(.+?)\]\(.+?\)/g, '$1').trim();
    if (t.length > 70) t = t.slice(0, 67) + '…';
    if (t.length > 4) out.push(t);
  }
  return out;
}

const biz = read('BUSINESS_ROADMAP.md');
const prod = read('ROADMAP.md');

const bizOpen = openItems(biz, 30);
const prodOpen = openItems(prod, 30);
const totalPending = bizOpen.length + prodOpen.length;

// Day counter since the build started (anchor: 2026-03-19, first session)
const START = new Date('2026-03-19T00:00:00Z');
const dayNum = Math.floor((Date.now() - START) / 86400000);

// Pick the headline "next thing" — business comes first (traders > code right now)
const nextUp = bizOpen.slice(0, 3);

// Build message
const title = `🛡️ BhavX · Day ${dayNum} — keep moving`;
const lines = [
  `${totalPending} items still open across both roadmaps.`,
  '',
  'Next up:',
  ...nextUp.map(t => `• ${t}`),
  '',
  '⛳ The wall: your first 20 traders.',
  'See the road → bhavx.com/roadmap.html',
];
const message = lines.join('\n');

// Fire the push (fire-and-forget)
const body = JSON.stringify({
  topic: NTFY_TOPIC,
  title,
  message,
  priority: 4,            // ntfy JSON needs a NUMBER 1-5 (not a string)
  tags: ['rotating_light'],
  click: 'https://bhavx.com/roadmap.html',
});

const req = https.request({
  hostname: 'ntfy.sh', port: 443, path: '/', method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
}, res => {
  console.log('ntfy response:', res.statusCode);
  console.log('Pushed:', totalPending, 'pending |', nextUp.length, 'next items');
});
req.on('error', e => { console.error('push failed:', e.message); process.exit(0); });
req.write(body);
req.end();
