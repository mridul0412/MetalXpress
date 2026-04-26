/**
 * One-time migration: backend/uploads/ → Cloudinary
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Walks backend/uploads/, uploads each file to Cloudinary under bhavx-{env}/seed/,
 * then patches Listing.images JSON columns in the DB to swap /uploads/foo.jpg →
 * https://res.cloudinary.com/.../foo.jpg.
 *
 * Idempotent: skipped files already on Cloudinary are detected via public_id.
 *
 * Usage:
 *   cd backend
 *   node src/scripts/migrate-uploads-to-cloudinary.js
 *
 * After this runs successfully, the seed.js file should be updated separately
 * to point IMG/VID maps at Cloudinary URLs (so future re-seeds don't reintroduce
 * /uploads/ paths). This script generates the new IMG/VID map and prints it.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const cloudinary = require('cloudinary').v2;

const prisma = new PrismaClient();
const FOLDER = process.env.CLOUDINARY_FOLDER || 'bhavx-dev';
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');

if (!process.env.CLOUDINARY_URL) {
  console.error('✗ CLOUDINARY_URL not set in .env — aborting.');
  process.exit(1);
}

cloudinary.config({ secure: true });

async function uploadOne(file) {
  const localPath = path.join(UPLOADS_DIR, file);
  const isVideo = /\.(mp4|mov|webm)$/i.test(file);
  // Stable public_id derived from filename (without ext) → re-running is idempotent
  const publicId = path.basename(file, path.extname(file));

  try {
    const r = await cloudinary.uploader.upload(localPath, {
      folder: `${FOLDER}/seed`,
      public_id: publicId,
      resource_type: isVideo ? 'video' : 'image',
      overwrite: false, // don't re-upload if already there
    });
    return { file, url: r.secure_url, status: r.existing ? 'skipped' : 'uploaded' };
  } catch (err) {
    // overwrite:false returns 200 but with `existing:true` on most SDK versions;
    // some return 409. Treat both as "already there".
    if (err.http_code === 409 || /already exists/i.test(err.message)) {
      const url = cloudinary.url(`${FOLDER}/seed/${publicId}`, {
        resource_type: isVideo ? 'video' : 'image',
        secure: true,
      });
      return { file, url, status: 'skipped' };
    }
    throw err;
  }
}

async function migrateDbReferences(urlMap) {
  const listings = await prisma.listing.findMany({
    where: { images: { not: null } },
    select: { id: true, images: true },
  });

  let patched = 0;
  for (const l of listings) {
    let arr;
    try { arr = JSON.parse(l.images); }
    catch { continue; }
    if (!Array.isArray(arr)) continue;

    let dirty = false;
    const next = arr.map(u => {
      if (typeof u !== 'string') return u;
      if (!u.startsWith('/uploads/')) return u;
      const filename = u.replace(/^\/uploads\//, '');
      const newUrl = urlMap[filename];
      if (newUrl) { dirty = true; return newUrl; }
      return u;
    });

    if (dirty) {
      await prisma.listing.update({
        where: { id: l.id },
        data: { images: JSON.stringify(next) },
      });
      patched++;
    }
  }
  return patched;
}

async function main() {
  console.log(`→ Migrating backend/uploads/ → Cloudinary (folder: ${FOLDER}/seed)\n`);

  if (!fs.existsSync(UPLOADS_DIR)) {
    console.error(`✗ ${UPLOADS_DIR} does not exist.`);
    process.exit(1);
  }

  const files = fs.readdirSync(UPLOADS_DIR).filter(f =>
    /\.(jpg|jpeg|png|gif|webp|mp4|mov|webm)$/i.test(f)
  );

  if (files.length === 0) {
    console.log('No files to migrate.');
    return;
  }

  console.log(`Found ${files.length} files. Uploading…\n`);

  const urlMap = {}; // filename → Cloudinary URL
  let uploaded = 0, skipped = 0, failed = 0;

  for (const file of files) {
    try {
      const r = await uploadOne(file);
      urlMap[file] = r.url;
      const tag = r.status === 'uploaded' ? '↑' : '·';
      console.log(`  ${tag} ${file.padEnd(40)} → ${r.url}`);
      if (r.status === 'uploaded') uploaded++; else skipped++;
    } catch (err) {
      console.error(`  ✗ ${file}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nSummary: ${uploaded} uploaded · ${skipped} skipped (already there) · ${failed} failed`);

  // Patch DB references
  console.log('\n→ Patching DB Listing.images references…');
  const patchedCount = await migrateDbReferences(urlMap);
  console.log(`  ✓ Updated ${patchedCount} listings\n`);

  // Print new IMG/VID map for seed.js update
  console.log('\n📋 New IMG/VID map for seed.js — copy-paste into seed.js manually:\n');
  console.log('  const IMG = {');
  for (const [f, u] of Object.entries(urlMap).filter(([f]) => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))) {
    const key = path.basename(f, path.extname(f)).replace(/^seed-/, '').replace(/-(\d|\w)/g, m => m[1].toUpperCase());
    console.log(`    ${key.padEnd(14)}: '${u}',`);
  }
  console.log('  };');
  console.log('\n  const VID = {');
  for (const [f, u] of Object.entries(urlMap).filter(([f]) => /\.(mp4|mov|webm)$/i.test(f))) {
    const key = path.basename(f, path.extname(f)).replace(/^seed-/, '').replace(/-(\d|\w)/g, m => m[1].toUpperCase());
    console.log(`    ${key.padEnd(12)}: '${u}',`);
  }
  console.log('  };\n');

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
