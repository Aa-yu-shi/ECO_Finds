const { pool } = require('../config/db');

// Create user
const createUser = async (username, email, hashedPassword) => {
    const [result] = await pool.execute(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, hashedPassword]
    );
    return result;
};

// Get user by email
const getUserByEmail = async (email) => {
    const [users] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
    );
    return users[0] || null;
};

// Get user by ID
const getUserById = async (id) => {
    const [users] = await pool.execute(
        'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
        [id]
    );
    return users[0] || null;
};

// Get user by username
const getUserByUsername = async (username) => {
    const [users] = await pool.execute(
        'SELECT * FROM users WHERE username = ?',
        [username]
    );
    return users[0] || null;
};

// Update user profile
const updateUser = async (id, updateData) => {
    const fields = [];
    const values = [];
    
    Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
            fields.push(`${key} = ?`);
            values.push(updateData[key]);
        }
    });
    
    if (fields.length === 0) {
        throw new Error('No fields to update');
    }
    
    values.push(id);
    
    const [result] = await pool.execute(
        `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
        values
    );
    
    return result;
};

// Delete user
const deleteUser = async (id) => {
    const [result] = await pool.execute(
        'DELETE FROM users WHERE id = ?',
        [id]
    );
    return result;
};

module.exports = {
    createUser,
    getUserByEmail,
    getUserById,
    getUserByUsername,
    updateUser,
    deleteUser
};
