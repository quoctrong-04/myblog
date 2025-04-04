const mysql = require('mysql2/promise');
require('dotenv').config();

// Tạo pool connection để sử dụng
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Kiểm tra kết nối
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Kết nối CSDL thành công!');
    connection.release();
    return true;
  } catch (error) {
    console.error('Lỗi kết nối CSDL:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('Không thể kết nối đến MySQL, hãy đảm bảo XAMPP đang chạy!');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Sai tên người dùng hoặc mật khẩu MySQL, hãy kiểm tra lại file .env');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('Cơ sở dữ liệu không tồn tại, hãy tạo cơ sở dữ liệu trong phpMyAdmin');
    }
    return false;
  }
}

// Thực hiện kết nối khi khởi động ứng dụng
testConnection();

module.exports = pool;
