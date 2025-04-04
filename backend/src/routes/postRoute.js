const express = require('express');
const router = express.Router();
const PostController = require('../controllers/PostController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Routes không yêu cầu xác thực
router.get('/', PostController.getAllPosts);
router.get('/popular', PostController.getPopularPosts);
router.get('/:id', PostController.getPostById);
router.get('/:id/comments', PostController.getPostComments);

// Routes yêu cầu xác thực
router.post('/', verifyToken, PostController.createPost);
router.put('/:id', verifyToken, PostController.updatePost);
router.delete('/:id', verifyToken, PostController.deletePost);
router.post('/:id/comments', verifyToken, PostController.addComment);
router.post('/:id/toggle-like', verifyToken, PostController.toggleLike);

// Route để xóa comment - thêm mới
router.delete('/comment/:comment_id', verifyToken, PostController.deleteComment);

module.exports = router;
