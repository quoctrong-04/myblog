const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) {
        return res.status(401).json({ message: "Access Denied, No token provided" });
    }

    // Loại bỏ "Bearer " trước khi giải mã token
    const tokenWithoutBearer = token.replace("Bearer ", "");

    try {
        const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET); // Đảm bảo bạn có 'JWT_SECRET' trong biến môi trường
        req.user = decoded; // Lưu thông tin người dùng vào `req.user`

        // Kiểm tra quyền của người dùng
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Forbidden: Admin access required" });
        }

        next(); // Cho phép truy cập vào route nếu người dùng có quyền admin
    } catch (error) {
        res.status(400).json({ message: "Invalid Token" });
    }
};

module.exports = verifyToken;
