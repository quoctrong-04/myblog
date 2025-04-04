const db = require('../utils/connectDB');

class Comment {
  static async getCommentsByPostId(postId) {
    try {
      const [rows] = await db.execute(`
        SELECT c.*, u.username, u.avatar, u.full_name
        FROM comments c
        JOIN users u ON c.user_id = u.user_id
        WHERE c.post_id = ?
        ORDER BY c.created_at DESC
      `, [postId]);
      return rows;
    } catch (error) {
      console.error(`Lỗi lấy bình luận của bài viết ID ${postId}:`, error.message);
      throw error;
    }
  }

  static async create(commentData) {
    try {
      // Đảm bảo các trường bắt buộc
      if (!commentData.post_id || !commentData.user_id || !commentData.content) {
        throw new Error('Thiếu thông tin bắt buộc: post_id, user_id hoặc content');
      }
      
      const [result] = await db.execute(`
        INSERT INTO comments (post_id, user_id, content)
        VALUES (?, ?, ?)
      `, [commentData.post_id, commentData.user_id, commentData.content]);
      
      return {
        comment_id: result.insertId,
        ...commentData,
        created_at: new Date()
      };
    } catch (error) {
      console.error('Lỗi tạo bình luận mới:', error.message);
      throw error;
    }
  }

  static async update(id, commentData) {
    try {
      // Cập nhật nội dung bình luận
      if (!commentData.content) {
        throw new Error('Nội dung bình luận không được trống');
      }
      
      const [result] = await db.execute(`
        UPDATE comments
        SET content = ?, updated_at = CURRENT_TIMESTAMP
        WHERE comment_id = ?
      `, [commentData.content, id]);
      
      // Kiểm tra nếu có hàng nào bị ảnh hưởng
      if (result.affectedRows === 0) {
        throw new Error('Không tìm thấy bình luận để cập nhật');
      }
      
      // Lấy bình luận đã cập nhật
      const [rows] = await db.execute(`
        SELECT c.*, u.username, u.avatar, u.full_name
        FROM comments c
        JOIN users u ON c.user_id = u.user_id
        WHERE c.comment_id = ?
      `, [id]);
      
      return rows[0];
    } catch (error) {
      console.error(`Lỗi cập nhật bình luận ID ${id}:`, error.message);
      throw error;
    }
  }

  static async delete(id) {
    try {
      // Lấy thông tin bình luận trước khi xóa để biết post_id
      const [commentInfo] = await db.execute(`
        SELECT post_id FROM comments WHERE comment_id = ?
      `, [id]);
      
      if (commentInfo.length === 0) {
        throw new Error('Không tìm thấy bình luận để xóa');
      }
      
      const postId = commentInfo[0].post_id;
      
      // Xóa bình luận
      const [result] = await db.execute(`
        DELETE FROM comments WHERE comment_id = ?
      `, [id]);
      
      if (result.affectedRows === 0) {
        throw new Error('Xóa bình luận thất bại');
      }
      
      return { 
        success: true, 
        message: 'Xóa bình luận thành công',
        post_id: postId
      };
    } catch (error) {
      console.error(`Lỗi xóa bình luận ID ${id}:`, error.message);
      throw error;
    }
  }
}

module.exports = Comment;
    