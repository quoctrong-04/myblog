const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../utils/connectDB');

class UserController {
    constructor() {
        // Dữ liệu mẫu nếu database không kết nối được
        this.demoUsers = [
            {
                user_id: 1,
                username: 'admin',
                password: '$2a$10$NVGj7F0L9ZPpNX0JpX9Tae2ZSUt8C.F/WBnUn/94J6SLMJGi6YEJy', // admin123
                email: 'admin@example.com',
                full_name: 'Admin User',
                phone: '0123456789',
                address: 'Ha Noi, Viet Nam',
                avatar: 'https://i.pravatar.cc/100?u=1',
                school_name: 'Hanoi University',
                faculty: 'Information Technology',
                skill: 'Programming, Management',
                role: 'admin',
                created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            },
            {
                user_id: 2,
                username: 'user1',
                password: '$2a$10$NVGj7F0L9ZPpNX0JpX9Tae2ZSUt8C.F/WBnUn/94J6SLMJGi6YEJy', // admin123
                email: 'user1@example.com',
                full_name: 'Regular User',
                phone: '0987654321',
                address: 'Ho Chi Minh City, Viet Nam',
                avatar: 'https://i.pravatar.cc/100?u=2',
                school_name: 'HCMC University',
                faculty: 'Computer Science',
                skill: 'Web Development, UI/UX Design',
                role: 'user',
                created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
            },
            {
                user_id: 3,
                username: 'editor',
                password: '$2a$10$NVGj7F0L9ZPpNX0JpX9Tae2ZSUt8C.F/WBnUn/94J6SLMJGi6YEJy', // admin123
                email: 'editor@example.com',
                full_name: 'Editor User',
                phone: '0909090909',
                address: 'Da Nang, Viet Nam',
                avatar: 'https://i.pravatar.cc/100?u=3',
                school_name: 'Da Nang University',
                faculty: 'Software Engineering',
                skill: 'Content Editing, Technical Writing',
                role: 'user',
                created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
            }
        ];
    }

    // Đăng ký người dùng mới
    async register(req, res) {
        // Cho phép truy cập từ tất cả các domain
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        try {
            const { username, password, email, full_name } = req.body;

            // Kiểm tra các trường bắt buộc
            if (!username || !password || !email) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu thông tin bắt buộc: username, password, email'
                });
            }

            // Kiểm tra username đã tồn tại chưa
            try {
                // Kiểm tra kết nối database
                if (!db || !db.execute) {
                    console.error('Kết nối database không khả dụng, đang sử dụng chế độ giả lập');
                    
                    // Kiểm tra trong dữ liệu mẫu
                    if (this && this.demoUsers && this.demoUsers.some(user => user.username === username)) {
                        return res.status(400).json({
                            success: false,
                            message: 'Tên đăng nhập đã tồn tại'
                        });
                    }
                    
                    // Tiếp tục với mode giả lập
                    throw new Error('Database không khả dụng');
                }
                
                const [existingUsers] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
                if (existingUsers.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Tên đăng nhập đã tồn tại'
                    });
                }
            } catch (dbError) {
                console.error('Lỗi kiểm tra người dùng:', dbError.message);
                // Kiểm tra trong dữ liệu mẫu
                if (this && this.demoUsers && this.demoUsers.some(user => user.username === username)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Tên đăng nhập đã tồn tại'
                    });
                }
            }

            // Kiểm tra email đã tồn tại chưa
            try {
                const [existingEmails] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
                if (existingEmails.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Email đã tồn tại'
                    });
                }
            } catch (dbError) {
                console.error('Lỗi kiểm tra email:', dbError.message);
                // Kiểm tra trong dữ liệu mẫu
                if (this.demoUsers.some(user => user.email === email)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Email đã tồn tại'
                    });
                }
            }

            // Mã hóa mật khẩu
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Tạo người dùng mới
            try {
                const [result] = await db.execute(
                    'INSERT INTO users (username, password, email, full_name, role) VALUES (?, ?, ?, ?, ?)',
                    [username, hashedPassword, email, full_name || username, 'user']
                );

                // Thay vì trả về token, chỉ trả về thông báo thành công và user info
                return res.status(201).json({
                    success: true,
                    message: 'Đăng ký thành công',
                    user: {
                        id: result.insertId,
                        username,
                        email,
                        full_name: full_name || username,
                        role: 'user'
                    }
                });
            } catch (dbError) {
                console.error('Lỗi đăng ký người dùng:', dbError.message);
                // Giả lập đăng ký thành công khi database lỗi
                const demoUserId = this.demoUsers ? this.demoUsers.length + 1 : Math.floor(1000 + Math.random() * 9000);
                
                // Tạo một bản ghi mẫu mới nếu demoUsers có thể sử dụng
                if (this.demoUsers) {
                    this.demoUsers.push({
                        user_id: demoUserId,
                        username,
                        password: hashedPassword,
                        email,
                        full_name: full_name || username,
                        role: 'user',
                        created_at: new Date()
                    });
                }
                
                // Chỉ trả về thông tin người dùng, không có token
                return res.status(201).json({
                    success: true,
                    message: 'Đăng ký thành công (Demo Mode)',
                    user: {
                        id: demoUserId,
                        username,
                        email,
                        full_name: full_name || username,
                        role: 'user'
                    }
                });
            }
        } catch (error) {
            console.error('Lỗi trong quá trình đăng ký:', error.message);
            
            // Kiểm tra trước khi sử dụng this.demoUsers
            if (!this || !this.demoUsers) {
                console.error('Lỗi: this.demoUsers không được khởi tạo');
                return res.status(500).json({
                    success: false,
                    message: 'Lỗi server khi đăng ký'
                });
            }
            
            return res.status(500).json({
                success: false,
                message: 'Lỗi server khi đăng ký'
            });
        }
    }

    // Đăng nhập
    async login(req, res) {
        // Cho phép truy cập từ tất cả các domain
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        try {
            const { username, password } = req.body;

            // Kiểm tra các trường bắt buộc
            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu thông tin đăng nhập: username, password'
                });
            }

            let user = null;

            // Tìm user trong database
            try {
                const [users] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
                if (users.length > 0) {
                    user = users[0];
                }
            } catch (dbError) {
                console.error('Lỗi truy vấn người dùng:', dbError.message);
                // Tìm trong dữ liệu mẫu
                user = this.demoUsers.find(u => u.username === username);
                console.log('Sử dụng dữ liệu mẫu do lỗi database');
            }

            // Nếu không tìm thấy user
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Tên đăng nhập hoặc mật khẩu không chính xác'
                });
            }

            // So sánh mật khẩu
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Tên đăng nhập hoặc mật khẩu không chính xác'
                });
            }

            // Tạo token
            const accessToken = jwt.sign(
                { id: user.user_id, username: user.username, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRATION || '1h' }
            );

            // Trả về thông tin người dùng và token
            return res.status(200).json({
                success: true,
                message: 'Đăng nhập thành công',
                user: {
                    id: user.user_id,
                    username: user.username,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role,
                    avatar: user.avatar || null
                },
                accessToken
            });
        } catch (error) {
            console.error('Lỗi trong quá trình đăng nhập:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server khi đăng nhập'
            });
        }
    }

    // Lấy thông tin người dùng hiện tại
    async getCurrentUser(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Không có thông tin xác thực'
                });
            }

            const userId = req.user.id || req.user.user_id;
            let user = null;

            // Lấy thông tin user từ database
            try {
                const [users] = await db.execute('SELECT * FROM users WHERE user_id = ?', [userId]);
                if (users.length > 0) {
                    user = users[0];
                }
            } catch (dbError) {
                console.error('Lỗi truy vấn người dùng:', dbError.message);
                // Tìm trong dữ liệu mẫu
                user = this.demoUsers.find(u => u.user_id === userId);
                console.log('Sử dụng dữ liệu mẫu do lỗi database');
            }

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy người dùng'
                });
            }

            // Trả về thông tin người dùng (không bao gồm mật khẩu)
            const { password, ...userInfo } = user;
            return res.json({
                success: true,
                user: userInfo
            });
        } catch (error) {
            console.error('Lỗi lấy thông tin người dùng hiện tại:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy thông tin người dùng'
            });
        }
    }

    // Cập nhật thông tin người dùng
    async updateUser(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Không có thông tin xác thực'
                });
            }

            const userId = req.user.id || req.user.user_id;
            const { full_name, email, phone, address, avatar, school_name, faculty, skill } = req.body;

            // Kiểm tra email đã tồn tại chưa (nếu thay đổi)
            if (email) {
                try {
                    const [existingEmails] = await db.execute(
                        'SELECT * FROM users WHERE email = ? AND user_id != ?', 
                        [email, userId]
                    );
                    if (existingEmails.length > 0) {
                        return res.status(400).json({
                            success: false,
                            message: 'Email đã tồn tại'
                        });
                    }
                } catch (dbError) {
                    console.error('Lỗi kiểm tra email:', dbError.message);
                }
            }

            // Cập nhật thông tin
            const updateFields = [];
            const values = [];

            if (full_name) { updateFields.push('full_name = ?'); values.push(full_name); }
            if (email) { updateFields.push('email = ?'); values.push(email); }
            if (phone !== undefined) { updateFields.push('phone = ?'); values.push(phone); }
            if (address !== undefined) { updateFields.push('address = ?'); values.push(address); }
            if (avatar !== undefined) { updateFields.push('avatar = ?'); values.push(avatar); }
            if (school_name !== undefined) { updateFields.push('school_name = ?'); values.push(school_name); }
            if (faculty !== undefined) { updateFields.push('faculty = ?'); values.push(faculty); }
            if (skill !== undefined) { updateFields.push('skill = ?'); values.push(skill); }

            // Nếu không có trường nào cần cập nhật
            if (updateFields.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Không có thông tin nào được cập nhật'
                });
            }

            // Thêm ID vào cuối values
            values.push(userId);

            try {
                await db.execute(`
                    UPDATE users 
                    SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
                    WHERE user_id = ?
                `, values);

                // Lấy thông tin user đã cập nhật
                const [updatedUsers] = await db.execute('SELECT * FROM users WHERE user_id = ?', [userId]);
                
                if (updatedUsers.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Không tìm thấy người dùng sau khi cập nhật'
                    });
                }

                const { password, ...userInfo } = updatedUsers[0];
                return res.json({
                    success: true,
                    message: 'Cập nhật thông tin thành công',
                    user: userInfo
                });
            } catch (dbError) {
                console.error('Lỗi cập nhật người dùng:', dbError.message);
                return res.status(500).json({
                    success: false,
                    message: 'Lỗi server khi cập nhật thông tin người dùng'
                });
            }
        } catch (error) {
            console.error('Lỗi trong quá trình cập nhật thông tin:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server khi cập nhật thông tin người dùng'
            });
        }
    }

    // Đổi mật khẩu
    async changePassword(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Không có thông tin xác thực'
                });
            }

            const userId = req.user.id || req.user.user_id;
            // Hỗ trợ cả camelCase và snake_case để tương thích với cả hai phía
            const currentPassword = req.body.currentPassword || req.body.current_password;
            const newPassword = req.body.newPassword || req.body.new_password;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu thông tin: mật khẩu hiện tại và mật khẩu mới'
                });
            }

            // Lấy thông tin user
            let user = null;
            try {
                const [users] = await db.execute('SELECT * FROM users WHERE user_id = ?', [userId]);
                if (users.length > 0) {
                    user = users[0];
                }
            } catch (dbError) {
                console.error('Lỗi truy vấn người dùng:', dbError.message);
                // Tìm trong dữ liệu mẫu
                user = this.demoUsers.find(u => u.user_id === userId);
                console.log('Sử dụng dữ liệu mẫu do lỗi database');
            }

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy người dùng'
                });
            }

            // Kiểm tra mật khẩu hiện tại
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    message: 'Mật khẩu hiện tại không chính xác'
                });
            }

            // Mã hóa mật khẩu mới
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            // Cập nhật mật khẩu
            try {
                await db.execute('UPDATE users SET password = ? WHERE user_id = ?', [hashedPassword, userId]);
                return res.json({
                    success: true,
                    message: 'Đổi mật khẩu thành công'
                });
            } catch (dbError) {
                console.error('Lỗi cập nhật mật khẩu:', dbError.message);
                return res.status(500).json({
                    success: false,
                    message: 'Lỗi server khi đổi mật khẩu'
                });
            }
        } catch (error) {
            console.error('Lỗi trong quá trình đổi mật khẩu:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server khi đổi mật khẩu'
            });
        }
    }

    // Lấy danh sách người dùng (admin only)
    async getAllUsers(req, res) {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Không có quyền truy cập'
                });
            }

            try {
                const [users] = await db.execute('SELECT * FROM users');
                
                // Loại bỏ mật khẩu trước khi trả về
                const safeUsers = users.map(user => {
                    const { password, ...safeUser } = user;
                    return safeUser;
                });
                
                return res.json({
                    success: true,
                    users: safeUsers
                });
            } catch (dbError) {
                console.error('Lỗi lấy danh sách người dùng:', dbError.message);
                
                // Sử dụng dữ liệu mẫu trong trường hợp lỗi
                const safeUsers = this.demoUsers.map(user => {
                    const { password, ...safeUser } = user;
                    return safeUser;
                });
                
                return res.json({
                    success: true,
                    users: safeUsers,
                    note: 'Dữ liệu mẫu do lỗi kết nối database'
                });
            }
        } catch (error) {
            console.error('Lỗi lấy danh sách người dùng:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy danh sách người dùng'
            });
        }
    }

    // Làm mới token
    async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;
            
            if (!refreshToken) {
                return res.status(400).json({
                    success: false,
                    message: 'Refresh token không được cung cấp'
                });
            }
            
            try {
                // Xác minh refresh token
                const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
                
                // Lấy thông tin người dùng
                let user = null;
                try {
                    const [users] = await db.execute('SELECT * FROM users WHERE user_id = ?', [decoded.id]);
                    if (users.length > 0) {
                        user = users[0];
                    }
                } catch (dbError) {
                    console.error('Lỗi truy vấn người dùng:', dbError.message);
                    // Tìm trong dữ liệu mẫu
                    user = this.demoUsers.find(u => u.user_id === decoded.id);
                    console.log('Sử dụng dữ liệu mẫu do lỗi database');
                }
                
                if (!user) {
                    return res.status(404).json({
                        success: false,
                        message: 'Không tìm thấy người dùng'
                    });
                }
                
                // Tạo access token mới
                const accessToken = jwt.sign(
                    { id: user.user_id, username: user.username, role: user.role },
                    process.env.JWT_SECRET,
                    { expiresIn: process.env.JWT_EXPIRATION || '1h' }
                );
                
                return res.json({
                    success: true,
                    accessToken
                });
            } catch (error) {
                console.error('Lỗi xác minh refresh token:', error.message);
                return res.status(401).json({
                    success: false,
                    message: 'Refresh token không hợp lệ hoặc đã hết hạn'
                });
            }
        } catch (error) {
            console.error('Lỗi làm mới token:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server khi làm mới token'
            });
        }
    }

    // Thêm phương thức checkUserById
    async checkUserById(req, res) {
        try {
            const userId = req.params.user_id || req.params.id;
            
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu ID người dùng'
                });
            }

            // Tìm người dùng trong database
            try {
                const [users] = await db.execute('SELECT * FROM users WHERE user_id = ?', [userId]);
                if (users.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Không tìm thấy người dùng'
                    });
                }
                
                // Loại bỏ mật khẩu trước khi trả về
                const { password, ...userInfo } = users[0];
                return res.json({
                    success: true,
                    user: userInfo
                });
            } catch (dbError) {
                console.error('Lỗi truy vấn người dùng:', dbError.message);
                
                // Tìm trong dữ liệu mẫu
                const demoUser = this.demoUsers.find(u => u.user_id == userId);
                if (!demoUser) {
                    return res.status(404).json({
                        success: false,
                        message: 'Không tìm thấy người dùng'
                    });
                }
                
                // Loại bỏ mật khẩu trước khi trả về
                const { password, ...userInfo } = demoUser;
                return res.json({
                    success: true,
                    user: userInfo,
                    note: 'Dữ liệu mẫu do lỗi kết nối database'
                });
            }
        } catch (error) {
            console.error('Lỗi kiểm tra người dùng theo ID:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server khi kiểm tra người dùng'
            });
        }
    }

    // Thêm phương thức resetPassword
    async resetPassword(req, res) {
        try {
            const userId = req.params.user_id || req.params.id;
            const { newPassword } = req.body;
            
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu ID người dùng'
                });
            }
            
            if (!newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Mật khẩu mới không được trống'
                });
            }
            
            // Kiểm tra người dùng tồn tại
            try {
                const [users] = await db.execute('SELECT * FROM users WHERE user_id = ?', [userId]);
                if (users.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Không tìm thấy người dùng'
                    });
                }
                
                // Mã hóa mật khẩu mới
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(newPassword, salt);
                
                // Cập nhật mật khẩu
                await db.execute('UPDATE users SET password = ? WHERE user_id = ?', [hashedPassword, userId]);
                
                return res.json({
                    success: true,
                    message: 'Đặt lại mật khẩu thành công'
                });
            } catch (dbError) {
                console.error('Lỗi cập nhật mật khẩu:', dbError.message);
                return res.status(500).json({
                    success: false,
                    message: 'Lỗi server khi đặt lại mật khẩu'
                });
            }
        } catch (error) {
            console.error('Lỗi đặt lại mật khẩu:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server khi đặt lại mật khẩu'
            });
        }
    }

    // Thêm phương thức deleteUser
    async deleteUser(req, res) {
        try {
            const userId = req.params.user_id || req.params.id;
            
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu ID người dùng'
                });
            }
            
            // Kiểm tra người dùng tồn tại
            try {
                const [users] = await db.execute('SELECT * FROM users WHERE user_id = ?', [userId]);
                if (users.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Không tìm thấy người dùng'
                    });
                }
                
                // Xóa người dùng
                await db.execute('DELETE FROM users WHERE user_id = ?', [userId]);
                
                return res.json({
                    success: true,
                    message: 'Xóa người dùng thành công'
                });
            } catch (dbError) {
                console.error('Lỗi xóa người dùng:', dbError.message);
                return res.status(500).json({
                    success: false,
                    message: 'Lỗi server khi xóa người dùng'
                });
            }
        } catch (error) {
            console.error('Lỗi xóa người dùng:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server khi xóa người dùng'
            });
        }
    }

    // Lấy thông tin profile người dùng đang đăng nhập
    async getUserProfile(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Không có thông tin xác thực'
                });
            }

            const userId = req.user.id || req.user.user_id;
            
            // Lấy thông tin user từ database
            try {
                const [users] = await db.execute('SELECT * FROM users WHERE user_id = ?', [userId]);
                
                if (users.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Không tìm thấy thông tin người dùng'
                    });
                }
                
                // Loại bỏ mật khẩu trước khi trả về
                const { password, ...userInfo } = users[0];
                
                return res.json({
                    success: true,
                    user: userInfo
                });
            } catch (dbError) {
                console.error('Lỗi truy vấn thông tin người dùng:', dbError.message);
                
                // Tìm trong dữ liệu mẫu nếu không kết nối được database
                const demoUser = this.demoUsers.find(user => user.user_id === userId);
                
                if (!demoUser) {
                    return res.status(404).json({
                        success: false,
                        message: 'Không tìm thấy thông tin người dùng'
                    });
                }
                
                // Loại bỏ mật khẩu
                const { password, ...userInfo } = demoUser;
                
                return res.json({
                    success: true,
                    user: userInfo,
                    note: 'Dữ liệu mẫu do lỗi kết nối database'
                });
            }
        } catch (error) {
            console.error('Lỗi lấy thông tin profile:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy thông tin người dùng'
            });
        }
    }
}

module.exports = new UserController();
