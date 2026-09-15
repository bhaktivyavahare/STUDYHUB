const { pool } = require('../config/db');
const { sendResponse, sendError } = require('../utils/response');

// ─── Comments ────────────────────────────────────────────────────────────────

const getComments = async (req, res, next) => {
  try {
    const { resourceId } = req.params;
    const [comments] = await pool.query(
      `SELECT c.id, c.content, c.created_at, c.updated_at,
              u.id as user_id, u.name as user_name
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.resource_id = ?
       ORDER BY c.created_at DESC`,
      [resourceId]
    );
    sendResponse(res, 'Comments fetched', comments);
  } catch (error) {
    next(error);
  }
};

const addComment = async (req, res, next) => {
  try {
    const { resourceId } = req.params;
    const { content } = req.body;
    if (!content || !content.trim()) {
      return sendError(res, 'Comment content is required', 400);
    }

    // Check resource exists and is approved
    const [resources] = await pool.query("SELECT id FROM resources WHERE id = ? AND verification_status = 'APPROVED'", [resourceId]);
    if (resources.length === 0) return sendError(res, 'Resource not found', 404);

    const [result] = await pool.query(
      'INSERT INTO comments (resource_id, user_id, content) VALUES (?, ?, ?)',
      [resourceId, req.user.id, content.trim()]
    );

    const [newComment] = await pool.query(
      `SELECT c.id, c.content, c.created_at, u.id as user_id, u.name as user_name
       FROM comments c JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [result.insertId]
    );

    sendResponse(res, 'Comment added', newComment[0], 201);
  } catch (error) {
    next(error);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [comments] = await pool.query('SELECT user_id FROM comments WHERE id = ?', [id]);
    if (comments.length === 0) return sendError(res, 'Comment not found', 404);

    const comment = comments[0];
    if (req.user.role_name !== 'ADMIN' && req.user.id !== comment.user_id) {
      return sendError(res, 'Unauthorized to delete this comment', 403);
    }

    await pool.query('DELETE FROM comments WHERE id = ?', [id]);
    sendResponse(res, 'Comment deleted');
  } catch (error) {
    next(error);
  }
};

// ─── Ratings ─────────────────────────────────────────────────────────────────

const rateResource = async (req, res, next) => {
  try {
    const { resourceId } = req.params;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return sendError(res, 'Rating must be between 1 and 5', 400);
    }

    const [resources] = await pool.query("SELECT id FROM resources WHERE id = ? AND verification_status = 'APPROVED'", [resourceId]);
    if (resources.length === 0) return sendError(res, 'Resource not found', 404);

    // Upsert rating
    await pool.query(
      `INSERT INTO ratings (resource_id, user_id, rating) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = VALUES(rating)`,
      [resourceId, req.user.id, rating]
    );

    // Return updated average
    const [stats] = await pool.query(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as total_ratings FROM ratings WHERE resource_id = ?',
      [resourceId]
    );

    sendResponse(res, 'Rating submitted', {
      avg_rating: parseFloat(stats[0].avg_rating).toFixed(1),
      total_ratings: stats[0].total_ratings,
      user_rating: rating
    });
  } catch (error) {
    next(error);
  }
};

const getMyRating = async (req, res, next) => {
  try {
    const { resourceId } = req.params;
    const [rows] = await pool.query(
      'SELECT rating FROM ratings WHERE resource_id = ? AND user_id = ?',
      [resourceId, req.user.id]
    );
    sendResponse(res, 'User rating fetched', { user_rating: rows.length > 0 ? rows[0].rating : null });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getComments,
  addComment,
  deleteComment,
  rateResource,
  getMyRating
};
