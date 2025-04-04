const jwt = require('jsonwebtoken');

// Middleware xác thực JWT token
const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Lấy token từ Bearer Token
        
        if (!token) {
            return res.status(401).json({ message: 'Access Denied, No token provided' });
        }
        
        jwt.verify(token, process.env.JWT_SECRET || 'secret_key', (err, decoded) => {
            if (err) {
                console.error('Token verification failed:', err);
                return res.status(403).json({ message: 'Invalid or expired token' });
            }
            
            console.log('Decoded token:', decoded);
            
            // Đảm bảo có trường id (có thể từ id hoặc user_id)
            if (!decoded.id && decoded.user_id) {
                decoded.id = decoded.user_id;
            } else if (!decoded.id) {
                console.error('Missing id in token payload');
                return res.status(403).json({ message: 'Invalid token format' });
            }
            
            req.user = decoded;
            next();
        });
    } catch (error) {
        console.error('Error in verifyToken middleware:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Middleware kiểm tra quyền admin
const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        console.log('Checking admin role for user:', req.user);
        if (req.user && req.user.role === 'admin') {
            next();
        } else {
            res.status(403).json({ 
                success: false,
                message: 'Access Denied, Admin role required' 
            });
        }
    });
};

// Middleware kiểm tra user hoặc admin
const verifyUserOrAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        const userIdFromParams = parseInt(req.params.id);
        const userIdFromToken = req.user.id || req.user.user_id;
        
        if (req.user && (userIdFromToken === userIdFromParams || req.user.role === 'admin')) {
            next();
        } else {
            res.status(403).json({ 
                success: false,
                message: 'Access Denied, Not authorized' 
            });
        }
    });
};

module.exports = { verifyToken, verifyAdmin, verifyUserOrAdmin }; 