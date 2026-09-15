const { pool } = require('../config/db');
const { sendResponse, sendError } = require('../utils/response');
const {
  uploadToStorage,
  getSignedUrl,
  getLocalFilePath,
  deleteFromStorage,
} = require('../services/storageService');
const path = require('path');
const fs = require('fs');

// ─── Upload a new resource ─────────────────────────────────────────────────
const uploadResource = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 'No file uploaded or invalid file format', 400);
    }

    const { title, description, subject_id, unit_id, resource_type_id, tags } = req.body;

    if (!title || !subject_id || !resource_type_id) {
      // With memoryStorage there is no disk file, but guard anyway for safety
      if (req.file?.path && fs.existsSync(req.file.path)) {
        try { fs.unlinkSync(req.file.path); } catch (_) {}
      }
      return sendError(res, 'Title, subject, and resource type are required', 400);
    }

    const uploaded_by = req.user.id;

    // Upload file to Supabase Storage (or local fallback).
    // Pass subject_id and unit_id so the path is organised by academic hierarchy.
    const storageResult = await uploadToStorage(req.file, { subject_id, unit_id });

    const file_path = storageResult.storagePath;
    const file_name = req.file.originalname;
    const file_type = req.file.mimetype;
    const file_size = req.file.size;

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const [result] = await connection.query(
        `INSERT INTO resources
         (title, description, subject_id, unit_id, resource_type_id, uploaded_by, file_path, file_name, file_type, file_size)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, description || null, subject_id, unit_id || null, resource_type_id, uploaded_by, file_path, file_name, file_type, file_size]
      );

      const resourceId = result.insertId;

      // Handle tags if provided
      if (tags) {
        let tagsArray = [];
        if (typeof tags === 'string') {
          tagsArray = tags.split(',').map(t => t.trim()).filter(t => t);
        } else if (Array.isArray(tags)) {
          tagsArray = tags;
        }

        for (const tagName of tagsArray) {
          const [existingTags] = await connection.query('SELECT id FROM tags WHERE name = ?', [tagName]);
          let tagId;

          if (existingTags.length > 0) {
            tagId = existingTags[0].id;
          } else {
            const [newTag] = await connection.query('INSERT INTO tags (name) VALUES (?)', [tagName]);
            tagId = newTag.insertId;
          }

          await connection.query('INSERT IGNORE INTO resource_tags (resource_id, tag_id) VALUES (?, ?)', [resourceId, tagId]);
        }
      }

      await connection.commit();
      connection.release();

      sendResponse(res, 'Resource uploaded successfully. Waiting for verification.', { id: resourceId }, 201);
    } catch (err) {
      await connection.rollback();
      connection.release();
      // Guard: with memoryStorage req.file.path is undefined — don't crash here
      if (req.file?.path && fs.existsSync(req.file.path)) {
        try { fs.unlinkSync(req.file.path); } catch (_) {}
      }
      throw err;
    }
  } catch (error) {
    next(error);
  }
};

// ─── Get Resources (Search, Filter, Sort, Pagination) ─────────────────────
const getResources = async (req, res, next) => {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;

    const { q, branch_id, semester_id, subject_id, unit_id, resource_type_id, sort, status } = req.query;

    let whereClause = 'WHERE 1=1';
    let queryParams = [];

    if (req.user && ['ADMIN', 'FACULTY'].includes(req.user.role_name) && status) {
      whereClause += ' AND r.verification_status = ?';
      queryParams.push(status);
    } else {
      whereClause += " AND r.verification_status = 'APPROVED'";
    }

    if (q) {
      whereClause += ' AND (r.title LIKE ? OR r.description LIKE ?)';
      queryParams.push(`%${q}%`, `%${q}%`);
    }
    if (branch_id)        { whereClause += ' AND sem.branch_id = ?';      queryParams.push(branch_id); }
    if (semester_id)      { whereClause += ' AND sub.semester_id = ?';    queryParams.push(semester_id); }
    if (subject_id)       { whereClause += ' AND r.subject_id = ?';       queryParams.push(subject_id); }
    if (unit_id)          { whereClause += ' AND r.unit_id = ?';          queryParams.push(unit_id); }
    if (resource_type_id) { whereClause += ' AND r.resource_type_id = ?'; queryParams.push(resource_type_id); }

    let orderClause = 'ORDER BY r.created_at DESC';
    if (sort === 'oldest')    orderClause = 'ORDER BY r.created_at ASC';
    if (sort === 'downloads') orderClause = 'ORDER BY r.download_count DESC';
    if (sort === 'views')     orderClause = 'ORDER BY r.view_count DESC';

    const countQuery = `
      SELECT COUNT(DISTINCT r.id) as total
      FROM resources r
      JOIN subjects sub ON r.subject_id = sub.id
      JOIN semesters sem ON sub.semester_id = sem.id
      ${whereClause}
    `;
    const [countResult] = await pool.query(countQuery, queryParams);
    const total = countResult[0].total;

    const dataQuery = `
      SELECT r.id, r.title, r.description, r.file_name, r.file_type, r.file_size,
             r.verification_status, r.download_count, r.view_count, r.created_at,
             sub.name as subject_name, u.name as uploader_name, rt.name as type_name,
             un.name as unit_name
      FROM resources r
      JOIN subjects sub ON r.subject_id = sub.id
      JOIN semesters sem ON sub.semester_id = sem.id
      JOIN users u ON r.uploaded_by = u.id
      JOIN resource_types rt ON r.resource_type_id = rt.id
      LEFT JOIN units un ON r.unit_id = un.id
      ${whereClause}
      ${orderClause}
      LIMIT ? OFFSET ?
    `;
    const [resources] = await pool.query(dataQuery, [...queryParams, limit, offset]);

    // Attach tags for each resource
    for (const res of resources) {
      const [tags] = await pool.query(`
        SELECT t.name FROM tags t
        JOIN resource_tags rt ON t.id = rt.tag_id
        WHERE rt.resource_id = ?
      `, [res.id]);
      res.tags = tags.map(t => t.name);
    }

    sendResponse(res, 'Resources fetched successfully', {
      data: resources,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Resource By ID ────────────────────────────────────────────────────
const getResourceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // All non-aggregated columns listed explicitly — required by PostgreSQL
    const query = `
      SELECT r.id, r.title, r.description, r.file_name, r.file_path, r.file_type, r.file_size,
             r.verification_status, r.rejection_reason, r.download_count, r.view_count,
             r.created_at, r.updated_at, r.subject_id, r.unit_id, r.resource_type_id, r.uploaded_by,
             sub.name as subject_name, sub.semester_id, sem.branch_id,
             u.name as uploader_name, rt.name as type_name,
             un.name as unit_name, un.number as unit_number,
             COALESCE(AVG(rat.rating), 0) as avg_rating,
             COUNT(DISTINCT rat.id) as total_ratings
      FROM resources r
      JOIN subjects sub ON r.subject_id = sub.id
      JOIN semesters sem ON sub.semester_id = sem.id
      JOIN users u ON r.uploaded_by = u.id
      JOIN resource_types rt ON r.resource_type_id = rt.id
      LEFT JOIN units un ON r.unit_id = un.id
      LEFT JOIN ratings rat ON r.id = rat.resource_id
      WHERE r.id = ?
      GROUP BY r.id, r.title, r.description, r.file_name, r.file_path, r.file_type, r.file_size,
               r.verification_status, r.rejection_reason, r.download_count, r.view_count,
               r.created_at, r.updated_at, r.subject_id, r.unit_id, r.resource_type_id, r.uploaded_by,
               sub.name, sub.semester_id, sem.branch_id,
               u.name, rt.name, un.name, un.number
    `;
    const [resources] = await pool.query(query, [id]);

    if (resources.length === 0) return sendError(res, 'Resource not found', 404);

    const resource = resources[0];

    // Public cannot view unapproved resources unless they own it or are faculty/admin
    if (
      resource.verification_status !== 'APPROVED' &&
      (!req.user || (req.user.role_name === 'STUDENT' && req.user.id !== resource.uploaded_by))
    ) {
      return sendError(res, 'Resource not found or not approved', 404);
    }

    // Increment view count
    await pool.query('UPDATE resources SET view_count = view_count + 1 WHERE id = ?', [id]);
    resource.view_count += 1;

    // Fetch tags
    const [tags] = await pool.query(`
      SELECT t.id, t.name FROM tags t
      JOIN resource_tags rt ON t.id = rt.tag_id
      WHERE rt.resource_id = ?
    `, [id]);
    resource.tags = tags;

    // Never expose raw storage path in the API response
    delete resource.file_path;

    sendResponse(res, 'Resource details fetched', resource);
  } catch (error) {
    next(error);
  }
};

// ─── Delete Resource ───────────────────────────────────────────────────────
const deleteResource = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [resources] = await pool.query('SELECT uploaded_by, file_path FROM resources WHERE id = ?', [id]);
    if (resources.length === 0) return sendError(res, 'Resource not found', 404);

    const resource = resources[0];

    if (req.user.role_name !== 'ADMIN' && Number(req.user.id) !== Number(resource.uploaded_by)) {
      return sendError(res, 'You can only delete resources that you uploaded.', 403);
    }

    await pool.query('DELETE FROM resources WHERE id = ?', [id]);

    if (resource.file_path) {
      await deleteFromStorage(resource.file_path);
    }

    sendResponse(res, 'Resource deleted successfully');
  } catch (error) {
    next(error);
  }
};

// ─── Verify Resource (Admin / Faculty) ────────────────────────────────────
const verifyResource = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return sendError(res, 'Invalid status', 400);
    }

    await pool.query(
      'UPDATE resources SET verification_status = ?, rejection_reason = ? WHERE id = ?',
      [status, rejection_reason || null, id]
    );
    sendResponse(res, `Resource ${status.toLowerCase()} successfully`);
  } catch (error) {
    next(error);
  }
};

// ─── Download Resource ─────────────────────────────────────────────────────
const downloadResource = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [resources] = await pool.query(
      'SELECT file_path, file_name, file_type, verification_status, uploaded_by FROM resources WHERE id = ?',
      [id]
    );

    if (resources.length === 0) return sendError(res, 'Resource not found', 404);

    const resource = resources[0];

    const userRole = req.user ? req.user.role_name : null;
    const isOwnerOrStaff =
      req.user &&
      (['ADMIN', 'FACULTY'].includes(userRole) || req.user.id === resource.uploaded_by);

    if (resource.verification_status !== 'APPROVED' && !isOwnerOrStaff) {
      return sendError(res, 'This resource is not yet approved for download', 403);
    }

    // ── Supabase Storage path → redirect to a 1-hour signed URL ───────────
    if (resource.file_path && !resource.file_path.startsWith('/uploads/')) {
      const signedUrl = await getSignedUrl(resource.file_path, 3600);
      if (!signedUrl) {
        return sendError(res, 'Could not generate download link. Please try again.', 500);
      }

      // Increment download count (fire-and-forget)
      pool.query('UPDATE resources SET download_count = download_count + 1 WHERE id = ?', [id]).catch(() => {});

      // 302 redirect to the signed URL — browser downloads directly from Supabase CDN
      return res.redirect(signedUrl);
    }

    // ── Local fallback (dev only) ──────────────────────────────────────────
    const localFile = getLocalFilePath(resource.file_path);
    if (!localFile) {
      return sendError(res, 'File not found. It may have been removed from storage.', 404);
    }

    pool.query('UPDATE resources SET download_count = download_count + 1 WHERE id = ?', [id]).catch(() => {});

    res.setHeader('Content-Disposition', `attachment; filename="${resource.file_name}"`);
    res.setHeader('Content-Type', resource.file_type || 'application/octet-stream');
    return res.sendFile(localFile.localFullPath);
  } catch (error) {
    next(error);
  }
};

// ─── Bookmarks ─────────────────────────────────────────────────────────────
const addBookmark = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('INSERT IGNORE INTO bookmarks (user_id, resource_id) VALUES (?, ?)', [req.user.id, id]);
    sendResponse(res, 'Resource bookmarked');
  } catch (error) {
    next(error);
  }
};

const removeBookmark = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM bookmarks WHERE user_id = ? AND resource_id = ?', [req.user.id, id]);
    sendResponse(res, 'Bookmark removed');
  } catch (error) {
    next(error);
  }
};

const getMyBookmarks = async (req, res, next) => {
  try {
    const query = `
      SELECT r.id, r.title, r.verification_status, r.created_at,
             sub.name as subject_name, rt.name as type_name,
             u.name as uploader_name, b.created_at as bookmarked_at
      FROM bookmarks b
      JOIN resources r ON b.resource_id = r.id
      JOIN subjects sub ON r.subject_id = sub.id
      JOIN resource_types rt ON r.resource_type_id = rt.id
      JOIN users u ON r.uploaded_by = u.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `;
    const [bookmarks] = await pool.query(query, [req.user.id]);
    sendResponse(res, 'Bookmarks fetched', bookmarks);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadResource,
  getResources,
  getResourceById,
  deleteResource,
  verifyResource,
  downloadResource,
  addBookmark,
  removeBookmark,
  getMyBookmarks,
};
