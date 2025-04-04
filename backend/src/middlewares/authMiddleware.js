const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware xác thực JWT
const verifyToken = (req, res, next) => {
  try {
    // Lấy token từ header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy token xác thực'
      });
    }
    
    // Kiểm tra định dạng Bearer token
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token không đúng định dạng'
      });
    }
    
    // Xác minh token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Lưu thông tin người dùng vào request
    req.user = {
      ...decoded,
      id: decoded.user_id || decoded.id // Đảm bảo luôn có id người dùng
    };
    
    next();
  } catch (error) {
    console.error('Lỗi xác thực:', error);
    return res.status(401).json({
      success: false,
      message: 'Token không hợp lệ hoặc đã hết hạn'
    });
  }
};

// Middleware kiểm tra quyền Admin
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Chưa xác thực người dùng'
    });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Không có quyền truy cập'
    });
  }
  
  next();
};

// Middleware kiểm tra là chủ sở hữu hoặc admin
const isOwnerOrAdmin = (req, res, next) => {
  // Middleware này sẽ được sử dụng sau verifyToken
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Chưa xác thực người dùng'
    });
  }
  
  // Kiểm tra id từ params
  const resourceId = parseInt(req.params.id);
  const userId = req.user.id || req.user.user_id;
  
  // Nếu là admin hoặc chủ sở hữu, cho phép truy cập
  if (req.user.role === 'admin' || userId === resourceId) {
    return next();
  }
  
  // Trường hợp kiểm tra chủ sở hữu cho các resources
  // Thực hiện trong controller cụ thể
  
  res.status(403).json({
    success: false,
    message: 'Không có quyền thực hiện hành động này'
  });
};

module.exports = {
  verifyToken,
  isAdmin,
  isOwnerOrAdmin
}; 