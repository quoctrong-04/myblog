const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { verifyToken, isAdmin, isOwnerOrAdmin } = require('../middlewares/authMiddleware');

// Routes chỉ dành cho Admin
router.get('/', verifyToken, isAdmin, UserController.getAllUsers);

// Routes cho người dùng đã xác thực
router.get('/profile', verifyToken, UserController.getUserProfile);
router.put('/profile', verifyToken, UserController.updateUser);

// Routes yêu cầu quyền sở hữu hoặc admin
router.put('/:id', verifyToken, isOwnerOrAdmin, UserController.updateUser);

// Lấy user theo ID 
router.get('/:user_id', verifyToken, isAdmin, UserController.checkUserById);

// Reset password route
router.post('/:user_id/reset-password', UserController.resetPassword);

// Xóa user (chỉ cho phép admin)
router.delete('/:user_id', verifyToken, isAdmin, UserController.deleteUser);

// Route bảo vệ, kiểm tra token
router.get('/protected', verifyToken, (req, res) => {
    res.status(200).json({ 
      success: true,
      message: 'Đây là route được bảo vệ', 
      user: req.user 
    });
});

module.exports = router;
