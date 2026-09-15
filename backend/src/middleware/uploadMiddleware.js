const multer = require('multer');
const path = require('path');

// Use memoryStorage — no temp files written to disk.
// The file buffer is available as req.file.buffer and uploaded
// directly to Supabase Storage by storageService.
const storage = multer.memoryStorage();

// Allowed MIME types for academic documents
const ALLOWED_MIMETYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]);

// Allowed extensions
const ALLOWED_EXTENSIONS = /\.(pdf|doc|docx|ppt|pptx)$/i;

// File filter — validates both extension AND MIME type
const fileFilter = (req, file, cb) => {
  const extOk = ALLOWED_EXTENSIONS.test(path.extname(file.originalname));
  const mimeOk = ALLOWED_MIMETYPES.has(file.mimetype);

  if (extOk && mimeOk) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, DOCX, PPT, and PPTX files are allowed.'));
  }
};

// Multer instance — 50 MB hard limit
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter,
});

module.exports = upload;
