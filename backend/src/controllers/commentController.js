const Comment = require('../models/commentModel');

class CommentController {
    // ✅ Lấy tất cả comment của bài viết
    async getComments(req, res) {
        try {
            const { post_id } = req.params;
            const comments = await Comment.getCommentsByPostId(post_id);
            if (comments.length === 0) {
                return res.status(404).json({ message: "No comments found for this post" });
            }
            res.status(200).json(comments);
        } catch (error) {
            console.error("Error in getComments:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    // ✅ Thêm comment
    async addComment(req, res) {
        try {
            const { post_id, user_id, content } = req.body;
            if (!post_id || !user_id || !content) {
                return res.status(400).json({ message: "Post ID, user ID, and content are required." });
            }

            await Comment.createComment(post_id, user_id, content);
            res.status(201).json({ message: "Comment added successfully" });
        } catch (error) {
            console.error("Error in addComment:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    // ✅ Cập nhật comment
    async updateComment(req, res) {
        try {
            const { comment_id } = req.params;
            const { content } = req.body;
            if (!content) {
                return res.status(400).json({ message: "Content is required to update the comment." });
            }

            const updated = await Comment.updateComment(comment_id, content);
            if (updated.affectedRows === 0) {
                return res.status(404).json({ message: "Comment not found" });
            }

            res.status(200).json({ message: "Comment updated successfully" });
        } catch (error) {
            console.error("Error in updateComment:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    // ✅ Xóa comment
    async deleteComment(req, res) {
        try {
            const { comment_id } = req.params;
            console.log(`[Server] Đang xóa comment ID: ${comment_id}`);
            
            // Lấy thông tin comment trước khi xóa để biết post_id
            const result = await Comment.delete(comment_id);

            if (!result) {
                return res.status(404).json({ 
                    success: false, 
                    message: "Comment not found" 
                });
            }

            console.log(`[Server] Xóa comment thành công:`, result);
            
            // Trả về kết quả thành công với thông tin post_id
            res.status(200).json({ 
                success: true, 
                message: "Comment deleted successfully",
                post_id: result.post_id
            });
        } catch (error) {
            console.error("Error in deleteComment:", error);
            res.status(500).json({ 
                success: false, 
                message: "Internal Server Error" 
            });
        }
    }
    
}

module.exports = new CommentController();
