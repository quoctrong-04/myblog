const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// Load môi trường
dotenv.config();
const PORT = process.env.PORT || 3003;
const isDev = process.env.NODE_ENV === 'development';

// Khởi tạo app
const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

// Cấu hình thư mục tĩnh
app.use(express.static(path.join(__dirname, 'public')));

// Debug route để liệt kê các tệp trong uploads
app.get('/api/debug/uploads', (req, res) => {
  const uploadsDir = path.join(__dirname, 'public/uploads');
  
  try {
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      res.json({
        success: true,
        files: files,
        path: uploadsDir
      });
    } else {
      res.json({
        success: false,
        message: 'Thư mục uploads không tồn tại',
        path: uploadsDir
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đọc thư mục uploads',
      error: error.message
    });
  }
});

// Hàm helper để load routes
const loadRoute = (routePath, mountPath) => {
  try {
    const router = require(`./src/routes/${routePath}`);
    app.use(mountPath, router);
    console.log(`✅ Route loaded: ${mountPath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error loading ${routePath}:`, error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    return false;
  }
};

// Load tất cả routes
loadRoute('authRoute.js', '/api/auth');  // Route auth
loadRoute('userRoute.js', '/api/users'); // Route users
loadRoute('postRoute.js', '/api/posts'); // Route posts
loadRoute('commentRoute.js', '/api/comments'); // Route comments
loadRoute('likeRoute.js', '/api/likes'); // Route likes

// Route mặc định cho API
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to MyBlog API',
    version: '1.0.0'
  });
});

// Xử lý route không tìm thấy
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint không tồn tại'
  });
});

// Xử lý lỗi toàn cục
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Lỗi server: ' + (err.message || 'Không xác định')
  });
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy trên port ${PORT}`);
  console.log(`🌐 Môi trường: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
