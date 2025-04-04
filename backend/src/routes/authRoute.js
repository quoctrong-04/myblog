const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Route đăng ký & đăng nhập
router.post('/register', UserController.register.bind(UserController));
router.post('/login', UserController.login.bind(UserController));

// Lấy thông tin người dùng hiện tại (yêu cầu xác thực)
router.get('/me', verifyToken, UserController.getCurrentUser.bind(UserController));

// Đổi mật khẩu (yêu cầu xác thực)
router.post('/change-password', verifyToken, UserController.changePassword.bind(UserController));

module.exports = router;