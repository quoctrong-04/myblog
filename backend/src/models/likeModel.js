const pool = require('../utils/connectDB');

// Thêm like vào bài viết
const addLike = async (user_id, post_id) => {
    const query = 'INSERT INTO likes (user_id, post_id, created_at) VALUES (?, ?, ?)';
    const values = [user_id, post_id, new Date()];  // Lưu thời gian hiện tại
    await pool.execute(query, values);
};

// Xóa like khỏi bài viết
const removeLike = async (user_id, post_id) => {
    const query = 'DELETE FROM likes WHERE user_id = ? AND post_id = ?';
    await pool.execute(query, [user_id, post_id]);
};

// Kiểm tra user đã like bài viết chưa
const checkLike = async (user_id, post_id) => {
    const query = 'SELECT * FROM likes WHERE user_id = ? AND post_id = ?';
    const [rows] = await pool.execute(query, [user_id, post_id]);
    return rows;
};

// Lấy tất cả lượt like của một bài viết
const getLikesByPostId = async (post_id) => {
    const query = 'SELECT user_id, created_at FROM likes WHERE post_id = ?';
    const [rows] = await pool.execute(query, [post_id]);
    return rows;
};

module.exports = {
    addLike,
    removeLike,
    checkLike,
    getLikesByPostId
};
