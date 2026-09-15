const { v2: cloudinary } = require('cloudinary');
const { Readable } = require('stream');
const fs   = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// ─── Cloudinary configuration ──────────────────────────────────────────────
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY    = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

// Base folder inside your Cloudinary account where all files are stored
const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || 'studyhub-resources';

let cloudinaryReady = false;
if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key:    CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure:     true,
  });
  cloudinaryReady = true;
  console.log(`[Cloudinary Storage] Initialized → folder: ${CLOUDINARY_FOLDER}`);
} else {
  console.warn(
    '[Cloudinary Storage] Credentials not set (CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET). ' +
    'File uploads will fall back to local disk (NOT suitable for production). ' +
    'Add the three CLOUDINARY_* vars to backend/.env to enable cloud storage.'
  );
}

// ─── Path / public_id builder ──────────────────────────────────────────────
/**
 * Build a deterministic Cloudinary public_id.
 * Cloudinary uses "/" as a folder separator in public_ids.
 *
 * Pattern: <folder>/subjects/<subject_id>/units/<unit_id>/<timestamp>-<clean-name>
 *
 * NOTE: Cloudinary strips the file extension from public_id automatically;
 *       we keep the original extension in the filename but NOT in the public_id.
 */
function buildPublicId(file, { subject_id, unit_id } = {}) {
  const ext = path.extname(file.originalname).toLowerCase();
  const baseName = path
    .basename(file.originalname, ext)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 80);
  const uniqueName = `${Date.now()}-${baseName}`;

  const subjectSegment = subject_id ? `subjects/${subject_id}` : 'subjects/unknown';
  const unitSegment    = unit_id    ? `units/${unit_id}`        : 'units/general';

  return `${CLOUDINARY_FOLDER}/${subjectSegment}/${unitSegment}/${uniqueName}`;
}

// ─── Helper: buffer → readable stream ─────────────────────────────────────
function bufferToStream(buffer) {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
}

// ─── Upload ────────────────────────────────────────────────────────────────
/**
 * Upload a document to Cloudinary.
 *
 * @param {object} file         - multer file object (memoryStorage: file.buffer is set)
 * @param {object} [context]    - { subject_id, unit_id } for path building
 * @returns {{ storagePath, isRemote }}
 *   storagePath is the Cloudinary public_id (used for signed URLs & deletion)
 */
async function uploadToStorage(file, context = {}) {
  const publicId = buildPublicId(file, context);

  // Prefer buffer (memoryStorage); fall back to reading from disk (legacy)
  const fileBuffer = file.buffer ?? (file.path ? fs.readFileSync(file.path) : null);
  if (!fileBuffer) {
    throw new Error('No file buffer available for upload.');
  }

  if (cloudinaryReady) {
    // Upload via upload_stream (supports buffers without writing to disk)
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id:     publicId,
          resource_type: 'raw',        // 'raw' = non-image files (PDF, DOCX, PPT …)
          use_filename:  false,        // we control the name via public_id
          unique_filename: false,      // timestamp already guarantees uniqueness
          overwrite:     false,
          folder:        '',           // folder is embedded in public_id
          format:        path.extname(file.originalname).replace('.', ''), // preserve ext
        },
        (error, result) => {
          if (error) return reject(new Error(`Cloudinary upload failed: ${error.message}`));
          resolve(result);
        }
      );
      bufferToStream(fileBuffer).pipe(uploadStream);
    });

    // Clean up temp disk file if Multer diskStorage was used (legacy path)
    if (file.path && fs.existsSync(file.path)) {
      try { fs.unlinkSync(file.path); } catch (_) {}
    }

    // Store the full public_id (includes folder) so we can sign/delete later
    const storagePath = uploadResult.public_id;
    console.log(`[Cloudinary Storage] Uploaded → ${storagePath}`);
    return { storagePath, isRemote: true };
  }

  // ── Local fallback (development only) ─────────────────────────────────────
  const uploadsDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const ext           = path.extname(file.originalname).toLowerCase();
  const localFileName = `${Date.now()}-${path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_')}${ext}`;
  const localFullPath = path.join(uploadsDir, localFileName);
  fs.writeFileSync(localFullPath, fileBuffer);
  const localRelativePath = `/uploads/${localFileName}`;

  console.warn(`[Cloudinary Storage] Using LOCAL fallback → ${localRelativePath}`);
  return { storagePath: localRelativePath, isRemote: false };
}

// ─── Signed URL ────────────────────────────────────────────────────────────
/**
 * Generate a short-lived signed URL for a file stored in Cloudinary.
 * Signed URLs require a private delivery type — files uploaded with
 * resource_type:'raw' default to 'upload' (public). We generate a signed
 * URL that expires after `expiresIn` seconds so the download link is time-limited.
 *
 * @param {string} storagePath  - Cloudinary public_id, e.g. "studyhub-resources/subjects/4/…"
 * @param {number} [expiresIn]  - seconds until the URL expires (default 3600 = 1 hour)
 * @returns {string|null}       - signed URL string, or null on failure
 */
async function getSignedUrl(storagePath, expiresIn = 3600) {
  if (!cloudinaryReady || !storagePath || storagePath.startsWith('/uploads/')) {
    return null;
  }

  try {
    // Cloudinary's url() with sign:true produces a signed URL synchronously.
    // expiresAt is a Unix timestamp.
    const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;
    const signedUrl = cloudinary.url(storagePath, {
      resource_type: 'raw',
      type:          'upload',
      sign_url:      true,
      expires_at:    expiresAt,
      secure:        true,
    });
    return signedUrl;
  } catch (err) {
    console.error(`[Cloudinary Storage] Signed URL error: ${err.message}`);
    return null;
  }
}

// ─── Local file path helper (for local fallback only) ─────────────────────
/**
 * Returns the absolute local path for files stored on disk (fallback only).
 * For Cloudinary-hosted files, use getSignedUrl() instead.
 *
 * @param {string} storedFilePath
 * @returns {{ localFullPath } | null}
 */
function getLocalFilePath(storedFilePath) {
  if (!storedFilePath || !storedFilePath.startsWith('/uploads/')) return null;

  const cleanPath   = storedFilePath.replace(/^[/\\]+/, '');
  const localFullPath = path.join(__dirname, '../../', cleanPath);
  if (fs.existsSync(localFullPath)) {
    return { localFullPath };
  }
  return null;
}

// ─── Delete ────────────────────────────────────────────────────────────────
/**
 * Delete a document from Cloudinary (or local disk for fallback files).
 *
 * @param {string} storedFilePath - Cloudinary public_id or local relative path
 */
async function deleteFromStorage(storedFilePath) {
  if (!storedFilePath) return;

  if (cloudinaryReady && !storedFilePath.startsWith('/uploads/')) {
    try {
      const result = await cloudinary.uploader.destroy(storedFilePath, {
        resource_type: 'raw',
        invalidate:    true,    // purge CDN cache
      });
      if (result.result === 'ok' || result.result === 'not found') {
        console.log(`[Cloudinary Storage] Deleted → ${storedFilePath}`);
      } else {
        console.warn(`[Cloudinary Storage] Unexpected delete result: ${result.result}`);
      }
    } catch (err) {
      console.warn(`[Cloudinary Storage] Delete error: ${err.message}`);
    }
    return;
  }

  // Local file cleanup
  const cleanPath     = storedFilePath.replace(/^[/\\]+/, '');
  const localFullPath = path.join(__dirname, '../../', cleanPath);
  if (fs.existsSync(localFullPath)) {
    try { fs.unlinkSync(localFullPath); } catch (_) {}
  }
}

module.exports = {
  uploadToStorage,
  getSignedUrl,
  getLocalFilePath,
  deleteFromStorage,
};
