const db = require('../utils/connectDB');

class Post {
  static async getAll() {
    try {
      const [rows] = await db.execute(`
        SELECT p.*, u.username, u.avatar, u.full_name 
        FROM posts p 
        JOIN users u ON p.user_id = u.user_id 
        ORDER BY p.created_at DESC
      `);
      return rows;
    } catch (error) {
      console.error('Lỗi lấy danh sách bài viết:', error.message);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const [rows] = await db.execute(`
        SELECT p.*, u.username, u.avatar, u.full_name 
        FROM posts p 
        JOIN users u ON p.user_id = u.user_id 
        WHERE p.post_id = ?
      `, [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return rows[0];
    } catch (error) {
      console.error(`Lỗi lấy bài viết ID ${id}:`, error.message);
      throw error;
    }
  }

  static async create(postData) {
    try {
      // Đảm bảo các trường bắt buộc
      if (!postData.title || !postData.content || !postData.user_id) {
        throw new Error('Thiếu thông tin bắt buộc: title, content hoặc user_id');
      }
      
      // Xử lý các trường không bắt buộc
      const image = postData.image || null;
      
      const [result] = await db.execute(`
        INSERT INTO posts (title, content, user_id, image) 
        VALUES (?, ?, ?, ?)
      `, [postData.title, postData.content, postData.user_id, image]);
      
      return {
        post_id: result.insertId,
        ...postData,
        created_at: new Date()
      };
    } catch (error) {
      console.error('Lỗi tạo bài viết mới:', error.message);
      throw error;
    }
  }

  static async update(id, postData) {
    try {
      // Đảm bảo id hợp lệ
      if (!id) {
        throw new Error('ID bài viết không hợp lệ');
      }
      
      // Lấy bài viết hiện có để kiểm tra
      const post = await this.getById(id);
      if (!post) {
        throw new Error('Không tìm thấy bài viết');
      }
      
      // Tạo danh sách các trường cần cập nhật
      const updateFields = [];
      const values = [];
      
      if (postData.title !== undefined) {
        updateFields.push('title = ?');
        values.push(postData.title);
      }
      
      if (postData.content !== undefined) {
        updateFields.push('content = ?');
        values.push(postData.content);
      }
      
      if (postData.image !== undefined) {
        updateFields.push('image = ?');
        values.push(postData.image);
      }
      
      // Nếu không có gì để cập nhật
      if (updateFields.length === 0) {
        return post;
      }
      
      // Thêm ID vào values cho điều kiện WHERE
      values.push(id);
      
      const [result] = await db.execute(`
        UPDATE posts 
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE post_id = ?
      `, values);
      
      // Kiểm tra nếu có hàng nào bị ảnh hưởng
      if (result.affectedRows === 0) {
        throw new Error('Cập nhật bài viết thất bại');
      }
      
      // Lấy lại bài viết đã cập nhật
      return await this.getById(id);
    } catch (error) {
      console.error(`Lỗi cập nhật bài viết ID ${id}:`, error.message);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.execute('DELETE FROM posts WHERE post_id = ?', [id]);
      
      // Kiểm tra nếu có hàng nào bị ảnh hưởng
      if (result.affectedRows === 0) {
        throw new Error('Không tìm thấy bài viết để xóa');
      }
      
      return { success: true, message: 'Xóa bài viết thành công' };
    } catch (error) {
      console.error(`Lỗi xóa bài viết ID ${id}:`, error.message);
      throw error;
    }
  }

  static async incrementViewCount(id) {
    try {
      const [result] = await db.execute(`
        UPDATE posts SET view_count = view_count + 1 
        WHERE post_id = ?
      `, [id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Lỗi tăng lượt xem bài viết ID ${id}:`, error.message);
      throw error;
    }
  }

  static async incrementLikeCount(id) {
    try {
      const [result] = await db.execute(`
        UPDATE posts SET like_count = like_count + 1 
        WHERE post_id = ?
      `, [id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Lỗi tăng lượt thích bài viết ID ${id}:`, error.message);
      throw error;
    }
  }

  static async decrementLikeCount(id) {
    try {
      const [result] = await db.execute(`
        UPDATE posts SET like_count = GREATEST(like_count - 1, 0) 
        WHERE post_id = ?
      `, [id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Lỗi giảm lượt thích bài viết ID ${id}:`, error.message);
      throw error;
    }
  }

  static async getPopularPosts(limit = 5) {
    try {
      const [rows] = await db.execute(`
        SELECT p.*, u.username, u.avatar, u.full_name 
        FROM posts p 
        JOIN users u ON p.user_id = u.user_id 
        ORDER BY p.view_count DESC, p.like_count DESC 
        LIMIT ?
      `, [limit]);
      
      return rows;
    } catch (error) {
      console.error(`Lỗi lấy bài viết phổ biến:`, error.message);
      throw error;
    }
  }

  static async incrementCommentCount(id) {
    try {
      // Kiểm tra cột comment_count có tồn tại không
      try {
        const [rows] = await db.execute(`
          SELECT comment_count FROM posts WHERE post_id = ? LIMIT 1
        `, [id]);
        
        // Nếu gọi được, cột tồn tại, tăng giá trị lên
        const [result] = await db.execute(`
          UPDATE posts SET comment_count = comment_count + 1 
          WHERE post_id = ?
        `, [id]);
        
        return result.affectedRows > 0;
      } catch (columnError) {
        // Nếu có lỗi về cột không tồn tại, thêm cột
        if (columnError.message.includes('Unknown column')) {
          console.log('Thêm cột comment_count vào bảng posts...');
          await db.execute(`
            ALTER TABLE posts ADD COLUMN comment_count INT DEFAULT 0
          `);
          
          // Sau khi thêm cột, thực hiện update
          const [result] = await db.execute(`
            UPDATE posts SET comment_count = 1 
            WHERE post_id = ?
          `, [id]);
          
          return result.affectedRows > 0;
        } else {
          throw columnError;
        }
      }
    } catch (error) {
      console.error(`Lỗi tăng số lượng bình luận bài viết ID ${id}:`, error.message);
      throw error;
    }
  }
}

module.exports = Post;
