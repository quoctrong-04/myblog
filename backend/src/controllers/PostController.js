const Post = require('../models/postModel');
const Comment = require('../models/commentModel');
const Like = require('../models/likeModel');
const fs = require('fs');
const path = require('path');



// Hàm lưu ảnh từ dữ liệu base64
const saveBase64Image = (base64Data, filename) => {
  try {
    // Tạo thư mục uploads nếu chưa tồn tại
    const uploadsDir = path.join(__dirname, '../../public/uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Xóa tiền tố data:image/xyz;base64, để lấy dữ liệu thuần
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error('Dữ liệu ảnh không hợp lệ');
    }

    // Lấy định dạng file và dữ liệu base64
    const imageType = matches[1];
    const imageData = matches[2];
    
    // Tạo tên file duy nhất với đúng định dạng
    const fileExt = imageType.split('/')[1];
    const uniqueFilename = `${filename}-${Date.now()}.${fileExt}`;
    const filePath = path.join(uploadsDir, uniqueFilename);
    
    // Lưu file
    fs.writeFileSync(filePath, imageData, 'base64');
    
    // Trả về đường dẫn tương đối để lưu vào database
    return `/uploads/${uniqueFilename}`;
  } catch (error) {
    console.error('Error saving image:', error);
    throw error;
  }
};

class PostController {
  constructor() {
    // Mẫu dữ liệu nếu không kết nối được database
    this.samplePosts = [
      {
        post_id: 1,
        title: 'Bài viết đầu tiên',
        content: 'Nội dung bài viết đầu tiên',
        user_id: 1,
        image: 'https://via.placeholder.com/300',
        view_count: 150,
        like_count: 45,
        comment_count: 15,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        username: 'admin',
        avatar: 'https://i.pravatar.cc/100?u=1',
        full_name: 'Admin User'
      },
      {
        post_id: 2,
        title: 'Bài viết thứ hai',
        content: 'Nội dung bài viết thứ hai',
        user_id: 2,
        image: 'https://via.placeholder.com/300',
        view_count: 120,
        like_count: 30,
        comment_count: 10,
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        username: 'user1',
        avatar: 'https://i.pravatar.cc/100?u=2',
        full_name: 'Regular User'
      },
      {
        post_id: 3,
        title: 'Bài viết thứ ba',
        content: 'Nội dung bài viết thứ ba',
        user_id: 3,
        image: 'https://via.placeholder.com/300',
        view_count: 200,
        like_count: 60,
        comment_count: 20,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        username: 'editor',
        avatar: 'https://i.pravatar.cc/100?u=3',
        full_name: 'Editor User'
      },
      {
        post_id: 4,
        title: 'Bài viết thứ tư',
        content: 'Nội dung bài viết thứ tư',
        user_id: 1,
        image: 'https://via.placeholder.com/300',
        view_count: 180,
        like_count: 50,
        comment_count: 18,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        username: 'admin',
        avatar: 'https://i.pravatar.cc/100?u=1',
        full_name: 'Admin User'
      },
      {
        post_id: 5,
        title: 'Bài viết thứ năm',
        content: 'Nội dung bài viết thứ năm',
        user_id: 2,
        image: 'https://via.placeholder.com/300',
        view_count: 160,
        like_count: 40,
        comment_count: 16,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        username: 'user1',
        avatar: 'https://i.pravatar.cc/100?u=2',
        full_name: 'Regular User'
      }
    ];
    
    this.sampleComments = [
      {
        comment_id: 1,
        post_id: 1,
        user_id: 2,
        content: 'Bình luận đầu tiên của bài viết 1',
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        username: 'user1',
        avatar: 'https://i.pravatar.cc/100?u=2',
        full_name: 'Regular User'
      },
      {
        comment_id: 2,
        post_id: 1,
        user_id: 3,
        content: 'Bình luận thứ hai của bài viết 1',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        username: 'editor',
        avatar: 'https://i.pravatar.cc/100?u=3',
        full_name: 'Editor User'
      }
    ];
  }

  // Lấy tất cả bài viết cho trang admin
  async getAllPosts(req, res) {
    try {
      const posts = await Post.getAll();
      return res.json({ 
        success: true, 
        posts: posts || [] 
      });
    } catch (error) {
      console.error('Error getting posts:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Lỗi server khi lấy danh sách bài viết' 
      });
    }
  }

  // Tạo bài viết mới
  async createPost(req, res) {
    try {
      const postData = req.body;
      const user_id = req.user ? (req.user.id || req.user.user_id) : null;
      
      if (!postData.title || !postData.content) {
        return res.status(400).json({ 
          success: false,
          message: 'Tiêu đề và nội dung bài viết không được để trống' 
        });
      }
      
      if (!user_id) {
        return res.status(401).json({
          success: false,
          message: 'Bạn cần đăng nhập để tạo bài viết'
        });
      }
      
      // Xử lý ảnh nếu có
      let imagePath = null;
      if (postData.imageData) {
        try {
          // Tạo filename từ tiêu đề bài viết (đã được làm sạch)
          const sanitizedTitle = postData.title
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .substring(0, 50);
          
          imagePath = saveBase64Image(postData.imageData, sanitizedTitle);
        } catch (imageError) {
          console.error('Error processing image:', imageError);
          // Tiếp tục tạo bài viết mà không có ảnh
        }
      }

      const newPost = {
        title: postData.title,
        content: postData.content,
        user_id,
        image: imagePath, // Đường dẫn đến ảnh đã lưu
        created_at: new Date(),
        updated_at: new Date()
      };
      
      const result = await Post.create(newPost);
      
      if (!result) {
        return res.status(500).json({
          success: false,
          message: 'Không thể tạo bài viết'
        });
      }

      res.status(201).json({ 
        success: true,
        message: 'Tạo bài viết thành công',
        post: {
          ...newPost,
          post_id: result.post_id,
          view_count: 0,
          like_count: 0,
          comment_count: 0
        }
      });
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ 
        success: false,
        message: 'Lỗi server khi tạo bài viết'
      });
    }
  }

  // Cập nhật bài viết
  async updatePost(req, res) {
    try {
      const { id } = req.params;
      const { title, content, image, imageData } = req.body;
      const userId = req.user ? (req.user.id || req.user.user_id) : null;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Bạn cần đăng nhập để cập nhật bài viết'
        });
      }

      const post = await Post.getById(id);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy bài viết'
        });
      }

      if (post.user_id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền cập nhật bài viết này'
        });
      }
      
      // Xử lý ảnh mới nếu có
      let imagePath = post.image;
      if (imageData) {
        try {
          // Tạo filename từ tiêu đề bài viết (đã được làm sạch)
          const sanitizedTitle = (title || post.title)
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .substring(0, 50);
          
          imagePath = saveBase64Image(imageData, sanitizedTitle);
          console.log('New image path:', imagePath);
        } catch (imageError) {
          console.error('Error processing image during update:', imageError);
          // Tiếp tục cập nhật mà không thay đổi ảnh
        }
      }

      const updateData = {
        title: title || post.title,
        content: content || post.content,
        image: imagePath, // Sử dụng ảnh mới nếu có, hoặc giữ ảnh cũ
        updated_at: new Date()
      };

      console.log('Updating post with data:', {
        ...updateData,
        imageProvided: !!imageData
      });

      const updatedPost = await Post.update(id, updateData);
      
      res.json({
        success: true,
        message: 'Cập nhật bài viết thành công',
        post: updatedPost
      });
    } catch (error) {
      console.error('Error updating post:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi cập nhật bài viết'
      });
    }
  }

  // Xóa bài viết
  async deletePost(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user ? (req.user.id || req.user.user_id) : null;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Bạn cần đăng nhập để xóa bài viết'
        });
      }

      const post = await Post.getById(id);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy bài viết'
        });
      }

      if (post.user_id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền xóa bài viết này'
        });
      }

      await Post.delete(id);
      
      res.json({
        success: true,
        message: 'Xóa bài viết thành công'
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi xóa bài viết'
      });
    }
  }

  // Lấy chi tiết bài viết
  async getPostById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user ? (req.user.id || req.user.user_id) : null;

      const post = await Post.getById(id);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy bài viết'
        });
      }

      let liked_by_user = false;
      if (userId) {
        const likes = await Like.checkLike(userId, id);
        liked_by_user = likes.length > 0;
      }

      res.json({
        success: true,
        post: {
          ...post,
          liked_by_user
        }
      });
    } catch (error) {
      console.error('Error getting post details:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy chi tiết bài viết'
      });
    }
  }

  // Lấy thống kê cho dashboard
  async getDashboardStats(req, res) {
    try {
      const totalPosts = await Post.count();
      const totalComments = await Comment.count();
      const totalLikes = await Like.count();
      const totalViews = await Post.getTotalViews();

      res.json({
        success: true,
        stats: {
          totalPosts,
          totalComments,
          totalLikes,
          totalViews
        }
      });
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy thống kê'
      });
    }
  }

  // Get popular posts - bài viết có lượt xem cao nhất
  async getPopularPosts(req, res) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 5;
      
      const posts = await Post.getPopularPosts(limit);
      
      res.json({
        success: true,
        posts: posts || []
      });
    } catch (error) {
      console.error('Error getting popular posts:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy bài viết phổ biến'
      });
    }
  }

  // Get recent posts - bài viết mới nhất
  async getRecentPosts(req, res) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 5;
      
      console.log(`Đang lấy ${limit} bài viết mới nhất...`);
      let recentPosts;
      
      try {
        recentPosts = await Post.getRecentPosts(limit);
        console.log(`Lấy thành công ${recentPosts.length} bài viết mới nhất`);
      } catch (dbError) {
        console.error('Lỗi truy vấn database:', dbError);
        // Sử dụng dữ liệu mẫu nếu database không khả dụng
        recentPosts = [...this.samplePosts]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, limit);
        console.log('Sử dụng dữ liệu mẫu cho bài viết mới nhất');
      }
      
      res.json({
        success: true,
        data: recentPosts
      });
    } catch (error) {
      console.error('Error getting recent posts:', error);
      res.status(500).json({ 
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get most commented posts - bài viết có nhiều comment nhất
  async getMostCommentedPosts(req, res) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 5;
      
      console.log(`Đang lấy ${limit} bài viết có nhiều comment nhất...`);
      let commentedPosts;
      
      try {
        commentedPosts = await Post.getMostCommentedPosts(limit);
        console.log(`Lấy thành công ${commentedPosts.length} bài viết có nhiều comment nhất`);
      } catch (dbError) {
        console.error('Lỗi truy vấn database:', dbError);
        // Sử dụng dữ liệu mẫu nếu database không khả dụng
        commentedPosts = [...this.samplePosts]
          .sort((a, b) => b.comment_count - a.comment_count)
          .slice(0, limit);
        console.log('Sử dụng dữ liệu mẫu cho bài viết có nhiều comment nhất');
      }
      
      res.json({
        success: true,
        data: commentedPosts
      });
    } catch (error) {
      console.error('Error getting most commented posts:', error);
      res.status(500).json({ 
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get most liked posts - bài viết có nhiều lượt thích nhất
  async getMostLikedPosts(req, res) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 5;
      
      console.log(`Đang lấy ${limit} bài viết có nhiều lượt thích nhất...`);
      let likedPosts;
      
      try {
        likedPosts = await Post.getMostLikedPosts(limit);
        console.log(`Lấy thành công ${likedPosts.length} bài viết có nhiều lượt thích nhất`);
      } catch (dbError) {
        console.error('Lỗi truy vấn database:', dbError);
        // Sử dụng dữ liệu mẫu nếu database không khả dụng
        likedPosts = [...this.samplePosts]
          .sort((a, b) => b.like_count - a.like_count)
          .slice(0, limit);
        console.log('Sử dụng dữ liệu mẫu cho bài viết có nhiều lượt thích nhất');
      }
      
      res.json({
        success: true,
        data: likedPosts
      });
    } catch (error) {
      console.error('Error getting most liked posts:', error);
      res.status(500).json({ 
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // ✅ Toggle like bài viết (thích/bỏ thích)
  async toggleLike(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user ? (req.user.id || req.user.user_id) : null;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Bạn cần đăng nhập để thích/bỏ thích bài viết'
        });
      }
      
      const post = await Post.getById(id);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy bài viết'
        });
      }
      
      const likes = await Like.checkLike(userId, id);
      const hasLiked = likes.length > 0;
      
      if (hasLiked) {
        await Like.removeLike(userId, id);
        await Post.decrementLikeCount(id);
        
        res.json({
          success: true,
          message: 'Đã bỏ thích bài viết',
          liked: false
        });
      } else {
        await Like.addLike(userId, id);
        await Post.incrementLikeCount(id);
        
        res.json({
          success: true,
          message: 'Đã thích bài viết',
          liked: true
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi thích/bỏ thích bài viết'
      });
    }
  }

  // Lấy comments của bài viết
  async getPostComments(req, res) {
    try {
      const { id } = req.params;
      
      const post = await Post.getById(id);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy bài viết'
        });
      }
      
      const comments = await Comment.getCommentsByPostId(id);
      
      return res.json({
        success: true,
        comments: comments || []
      });
    } catch (error) {
      console.error('Error getting post comments:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy bình luận'
      });
    }
  }

  // Thêm bình luận vào bài viết
  async addComment(req, res) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const userId = req.user ? (req.user.id || req.user.user_id) : null;
      
      if (!content) {
        return res.status(400).json({
          success: false,
          message: 'Nội dung bình luận không được để trống'
        });
      }
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Bạn cần đăng nhập để bình luận'
        });
      }
      
      const post = await Post.getById(id);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy bài viết'
        });
      }
      
      const commentData = {
        post_id: id,
        user_id: userId,
        content
      };
      
      const comment = await Comment.create(commentData);
      
      res.status(201).json({
        success: true,
        message: 'Thêm bình luận thành công',
        comment
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi thêm bình luận'
      });
    }
  }

  // Xóa comment
  async deleteComment(req, res) {
    try {
      const { comment_id } = req.params;
      const userId = req.user ? (req.user.id || req.user.user_id) : null;
      
      console.log(`[Server] Đang xóa comment ID: ${comment_id} bởi user ID: ${userId}`);
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Bạn cần đăng nhập để xóa bình luận'
        });
      }
      
      // Lấy thông tin comment trước khi xóa
      try {
        // Phương thức delete trả về thông tin về comment đã xóa
        const result = await Comment.delete(comment_id);
        
        console.log(`[Server] Kết quả xóa comment:`, result);
        
        res.status(200).json({
          success: true,
          message: 'Xóa bình luận thành công',
          post_id: result.post_id
        });
      } catch (error) {
        console.error(`[Server] Lỗi khi xóa comment:`, error);
        
        // Kiểm tra lỗi không tìm thấy comment
        if (error.message && error.message.includes('Không tìm thấy bình luận')) {
          return res.status(404).json({
            success: false,
            message: 'Không tìm thấy bình luận để xóa'
          });
        }
        
        throw error;
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi xóa bình luận'
      });
    }
  }
}

// Export một instance của PostController
const postController = new PostController();
module.exports = postController;
