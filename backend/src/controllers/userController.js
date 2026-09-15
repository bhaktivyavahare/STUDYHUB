const { pool } = require('../config/db');
const { sendResponse, sendError } = require('../utils/response');

// Get user's own profile
const getMyProfile = async (req, res, next) => {
  try {
    const [users] = await pool.query(
      `SELECT u.id, u.name, u.email, u.bio, u.profile_image, u.created_at,
              r.name as role_name, b.name as branch_name, s.name as semester_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       LEFT JOIN branches b ON u.branch_id = b.id
       LEFT JOIN semesters s ON u.semester_id = s.id
       WHERE u.id = ?`,
      [req.user.id]
    );
    if (users.length === 0) return sendError(res, 'User not found', 404);

    // Fetch stats
    const [uploadStats] = await pool.query(
      'SELECT COUNT(*) as total_uploads FROM resources WHERE uploaded_by = ?',
      [req.user.id]
    );
    const [downloadStats] = await pool.query(
      'SELECT COUNT(*) as total_downloads FROM downloads WHERE user_id = ?',
      [req.user.id]
    );
    const [bookmarkStats] = await pool.query(
      'SELECT COUNT(*) as total_bookmarks FROM bookmarks WHERE user_id = ?',
      [req.user.id]
    );

    const profile = {
      ...users[0],
      stats: {
        total_uploads: uploadStats[0].total_uploads,
        total_downloads: downloadStats[0].total_downloads,
        total_bookmarks: bookmarkStats[0].total_bookmarks,
      }
    };

    sendResponse(res, 'Profile fetched', profile);
  } catch (error) {
    next(error);
  }
};

// Update own profile
const updateMyProfile = async (req, res, next) => {
  try {
    const { name, bio } = req.body;
    if (!name || !name.trim()) {
      return sendError(res, 'Name is required', 400);
    }

    await pool.query(
      'UPDATE users SET name = ?, bio = ? WHERE id = ?',
      [name.trim(), bio || null, req.user.id]
    );

    sendResponse(res, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

// Get my uploaded resources
const getMyUploads = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [total] = await pool.query(
      'SELECT COUNT(*) as count FROM resources WHERE uploaded_by = ?',
      [req.user.id]
    );

    const [resources] = await pool.query(
      `SELECT r.id, r.title, r.description, r.file_name, r.file_size, r.file_type,
              r.verification_status, r.rejection_reason, r.download_count, r.view_count, r.created_at,
              sub.name as subject_name, rt.name as type_name
       FROM resources r
       JOIN subjects sub ON r.subject_id = sub.id
       JOIN resource_types rt ON r.resource_type_id = rt.id
       WHERE r.uploaded_by = ?
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [req.user.id, limit, offset]
    );

    sendResponse(res, 'My uploads fetched', {
      data: resources,
      pagination: {
        page,
        limit,
        total: total[0].count,
        totalPages: Math.ceil(total[0].count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get dashboard stats for current user
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const role = req.user.role_name;

    const [myUploads] = await pool.query(
      'SELECT COUNT(*) as count FROM resources WHERE uploaded_by = ?', [userId]
    );
    const [myBookmarks] = await pool.query(
      'SELECT COUNT(*) as count FROM bookmarks WHERE user_id = ?', [userId]
    );
    const [myDownloads] = await pool.query(
      'SELECT COUNT(*) as count FROM downloads WHERE user_id = ?', [userId]
    );

    let stats = {
      my_uploads: myUploads[0].count,
      my_bookmarks: myBookmarks[0].count,
      my_downloads: myDownloads[0].count,
    };

    // Extra stats for Admin/Faculty
    if (role === 'ADMIN' || role === 'FACULTY') {
      const [pendingApprovals] = await pool.query(
        "SELECT COUNT(*) as count FROM resources WHERE verification_status = 'PENDING'"
      );
      const [totalResources] = await pool.query(
        "SELECT COUNT(*) as count FROM resources WHERE verification_status = 'APPROVED'"
      );
      const [totalUsers] = await pool.query('SELECT COUNT(*) as count FROM users');

      stats.pending_approvals = pendingApprovals[0].count;
      stats.total_resources = totalResources[0].count;
      stats.total_users = totalUsers[0].count;
    }

    sendResponse(res, 'Dashboard stats fetched', stats);
  } catch (error) {
    next(error);
  }
};

// Admin: Get all pending resources
const getPendingResources = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [total] = await pool.query(
      "SELECT COUNT(*) as count FROM resources WHERE verification_status = 'PENDING'"
    );

    const [resources] = await pool.query(
      `SELECT r.id, r.title, r.description, r.file_name, r.file_size,
              r.verification_status, r.created_at,
              sub.name as subject_name, rt.name as type_name,
              u.name as uploader_name, u.email as uploader_email
       FROM resources r
       JOIN subjects sub ON r.subject_id = sub.id
       JOIN resource_types rt ON r.resource_type_id = rt.id
       JOIN users u ON r.uploaded_by = u.id
       WHERE r.verification_status = 'PENDING'
       ORDER BY r.created_at ASC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    sendResponse(res, 'Pending resources fetched', {
      data: resources,
      pagination: {
        page, limit, total: total[0].count,
        totalPages: Math.ceil(total[0].count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Admin: get all users
const getAllUsers = async (req, res, next) => {
  try {
    const [users] = await pool.query(
      `SELECT u.id, u.name, u.email, u.created_at,
              r.name as role_name, b.name as branch_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       LEFT JOIN branches b ON u.branch_id = b.id
       ORDER BY u.created_at DESC`
    );
    sendResponse(res, 'Users fetched', users);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getMyUploads,
  getDashboardStats,
  getPendingResources,
  getAllUsers
};
