/**
 * Cloudinary service — image/video upload + URL helpers
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Auto-detects CLOUDINARY_URL env var (cloudinary://api_key:api_secret@cloud_name).
 * If unset, exports `enabled: false` and the upload route falls back to disk
 * storage (dev-only mode).
 *
 * Folder strategy:
 *   - dev assets:  bhavx-dev/listings/*  and bhavx-dev/seed/*
 *   - prod assets: bhavx-prod/listings/* and bhavx-prod/seed/*
 *   Set CLOUDINARY_FOLDER in .env to override.
 *
 * Public IDs are generated as `${folder}/listings/<timestamp>-<hex>` so deletes
 * + lookups are deterministic.
 */

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const URL = process.env.CLOUDINARY_URL;
const FOLDER = process.env.CLOUDINARY_FOLDER || 'bhavx-dev';
const enabled = Boolean(URL && URL.startsWith('cloudinary://'));

if (enabled) {
  // SDK auto-reads CLOUDINARY_URL — config() not strictly required, but explicit
  // call here surfaces config errors early (at boot, not on first upload).
  cloudinary.config({ secure: true });
}

/**
 * Multer storage adapter — drop-in replacement for multer.diskStorage().
 * Returns null when Cloudinary is disabled so caller can fall back to disk.
 */
function makeStorage() {
  if (!enabled) return null;
  return new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      const isVideo = /\.(mp4|mov|webm)$/i.test(file.originalname);
      return {
        folder: `${FOLDER}/listings`,
        resource_type: isVideo ? 'video' : 'image',
        // Auto-format + auto-quality for images. Videos keep original.
        ...(isVideo ? {} : { format: undefined, transformation: [{ quality: 'auto', fetch_format: 'auto' }] }),
        // Allow common formats; deny everything else at the upload boundary.
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'webm'],
      };
    },
  });
}

/**
 * Extract a Cloudinary public_id from a delivery URL.
 * Used for deletion when a listing is removed.
 *
 * Input:  https://res.cloudinary.com/dbaumhjh7/image/upload/v1234/bhavx-dev/listings/abc.jpg
 * Output: bhavx-dev/listings/abc
 */
function extractPublicId(url) {
  if (!url || typeof url !== 'string') return null;
  const m = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z0-9]+)?$/i);
  return m ? m[1] : null;
}

/**
 * Upload a local file to Cloudinary. Used by the migration script.
 * Returns the secure HTTPS URL.
 */
async function uploadFile(localPath, options = {}) {
  if (!enabled) throw new Error('Cloudinary not configured');
  const isVideo = /\.(mp4|mov|webm)$/i.test(localPath);
  const result = await cloudinary.uploader.upload(localPath, {
    folder: options.folder || `${FOLDER}/seed`,
    resource_type: isVideo ? 'video' : 'image',
    public_id: options.publicId,
    overwrite: options.overwrite !== false,
    use_filename: !options.publicId,
    unique_filename: !options.publicId,
  });
  return result.secure_url;
}

/**
 * Delete a single asset by URL. Used when a listing is removed.
 * No-op (resolves) if Cloudinary is disabled or URL doesn't match.
 */
async function deleteByUrl(url) {
  if (!enabled) return;
  const publicId = extractPublicId(url);
  if (!publicId) return;
  const isVideo = /\.(mp4|mov|webm)$/i.test(url);
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: isVideo ? 'video' : 'image',
    });
  } catch (err) {
    // Don't fail the listing-delete just because Cloudinary cleanup failed.
    console.warn(`[cloudinary] delete failed for ${publicId}:`, err.message);
  }
}

/**
 * Health-check ping for boot-time diagnostics.
 */
async function ping() {
  if (!enabled) return { ok: false, reason: 'CLOUDINARY_URL not set' };
  try {
    const r = await cloudinary.api.ping();
    return { ok: r.status === 'ok' };
  } catch (err) {
    return { ok: false, reason: err.message };
  }
}

module.exports = {
  enabled,
  cloudinary,
  makeStorage,
  uploadFile,
  deleteByUrl,
  extractPublicId,
  ping,
  FOLDER,
};
