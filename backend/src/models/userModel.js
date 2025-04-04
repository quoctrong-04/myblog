const bcrypt = require('bcrypt');
const pool = require('../utils/connectDB');

const getAll = async () => {
    const query = 'SELECT * FROM users';
    const [rows] = await pool.execute(query);
    return rows;
};

const checkUserById = async (user_id) => {
    const query = 'SELECT * FROM users WHERE user_id = ?';
    const [rows] = await pool.execute(query, [user_id]);
    return rows;
};

const checkUser = async (username) => {
    const query = 'SELECT * FROM users WHERE username = ?'; 
    const [rows] = await pool.execute(query, [username]);
    console.log("checkUser Result:", rows);  // 🔍 Kiểm tra log
    return rows;
};


const create = async (newUser) => {
    const query = `
        INSERT INTO users (username, password, email, full_name, phone, address, avatar, school_name, faculty, skill, role) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
        newUser.username, newUser.password, newUser.email, newUser.full_name || null, 
        newUser.phone || null, newUser.address || null, newUser.avatar || null, 
        newUser.school_name || null, newUser.faculty || null, newUser.skill || null, newUser.role || "user"
    ];
    const [rows] = await pool.execute(query, values);
    return rows;
};

const deleteUser = async (user_id) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const deletePostsQuery = 'DELETE FROM posts WHERE user_id = ?';
        await connection.execute(deletePostsQuery, [user_id]);

        const deleteUserQuery = 'DELETE FROM users WHERE user_id = ?';
        await connection.execute(deleteUserQuery, [user_id]);

        await connection.commit();
        return { message: 'User and their posts deleted successfully' };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const updateUser = async (user_id, updatedUser) => {
    let query = 'UPDATE users SET ';
    let values = [];

    for (const key in updatedUser) {
        if (updatedUser[key] !== undefined && key !== 'user_id') {
            if (key === 'created_at' || key === 'updated_at') {
                // ✅ Chuyển đổi DateTime về format hợp lệ cho MySQL (YYYY-MM-DD HH:MM:SS)
                const date = new Date(updatedUser[key]);
                updatedUser[key] = date.toISOString().slice(0, 19).replace('T', ' ');
            }
            query += `${key} = ?, `;
            values.push(updatedUser[key]);
        }
    }

    if (values.length === 0) {
        return { message: 'No update fields provided' };
    }

    query = query.slice(0, -2) + ' WHERE user_id = ?';
    values.push(user_id);

    console.log("Executing Query:", query);
    console.log("Query Values:", values);

    const [result] = await pool.execute(query, values);
    return result;
};

const updatePassword = async (user_id, newPassword) => {
    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const query = 'UPDATE users SET password = ? WHERE user_id = ?';
    const [result] = await pool.execute(query, [hashedPassword, user_id]);
    return result;
};

module.exports = {
    getAll,
    checkUserById,
    checkUser,
    create,
    deleteUser,
    updateUser,
    updatePassword
};
