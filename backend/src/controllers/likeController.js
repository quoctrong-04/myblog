const Like = require('../models/likeModel');

class LikeController {
    // ✅ Thêm like
    async addLike(req, res) {
        try {
            const { post_id, user_id } = req.body;
            if (!post_id || !user_id) {
                return res.status(400).json({ message: "Post ID and user ID are required." });
            }

            // Kiểm tra nếu user đã thích bài viết
            const existingLike = await Like.checkLike(user_id, post_id);
            if (existingLike.length > 0) {
                return res.status(400).json({ message: "You have already liked this post." });
            }

            // Thêm like vào bài viết
            await Like.addLike(user_id, post_id);
            res.status(201).json({ message: "Like added successfully" });
        } catch (error) {
            console.error("Error in addLike:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    // ✅ Xóa like
    async removeLike(req, res) {
        try {
            const { post_id, user_id } = req.body;
            if (!post_id || !user_id) {
                return res.status(400).json({ message: "Post ID and user ID are required." });
            }

            // Xóa like khỏi bài viết
            await Like.removeLike(user_id, post_id);
            res.status(200).json({ message: "Like removed successfully" });
        } catch (error) {
            console.error("Error in removeLike:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    // ✅ Lấy tất cả likes của bài viết
    async getLikes(req, res) {
        try {
            const { post_id } = req.params;
            const likes = await Like.getLikesByPostId(post_id);
            if (likes.length === 0) {
                return res.status(404).json({ message: "No likes found for this post" });
            }
            res.status(200).json(likes);
        } catch (error) {
            console.error("Error in getLikes:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
}

module.exports = new LikeController();
