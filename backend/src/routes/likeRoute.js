const express = require('express');
const router = express.Router();
const PostController = require('../controllers/PostController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Các route cho likes sẽ được xử lý thông qua PostController
// vì likes liên quan chặt chẽ đến posts

// Route này là placeholder để giữ cấu trúc API nhất quán
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Like API - Sử dụng /api/posts/:id/like và /api/posts/:id/unlike để thao tác với likes'
  });
});

module.exports = router;
