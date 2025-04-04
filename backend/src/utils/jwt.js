const jwt = require('jsonwebtoken');
require('dotenv').config();

// Tạo token xác thực
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id || user.user_id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1h' }
  );
};

// Tạo refresh token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id || user.user_id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
  );
};

// Xác minh token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error('Lỗi xác minh token:', error.message);
    return null;
  }
};

// Middleware xác thực người dùng
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Không tìm thấy token xác thực'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Lỗi xác thực token:', error.message);
    return res.status(403).json({
      success: false,
      message: 'Token không hợp lệ hoặc đã hết hạn'
    });
  }
};

// Middleware kiểm tra quyền admin
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Không có thông tin xác thực'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Không có quyền truy cập, yêu cầu quyền admin'
    });
  }

  next();
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  authenticateToken,
  isAdmin
}; 