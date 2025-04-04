const express = require('express');
const router = express.Router();
const PostController = require('../controllers/PostController');
const { verifyToken } = require('../middlewares/authMiddleware');
const CommentController = require('../controllers/commentController');

// Các route cho comments sẽ được xử lý thông qua PostController
// vì comments liên quan chặt chẽ đến posts

// Route này là placeholder để giữ cấu trúc API nhất quán
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Comment API - Sử dụng /api/posts/:id/comments để thao tác với comments'
  });
});

// Các route cho comments - cần đầy đủ CRUD
router.get('/', CommentController.getComments);
router.delete('/:comment_id', verifyToken, CommentController.deleteComment);

module.exports = router;
