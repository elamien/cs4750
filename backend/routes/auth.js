import express from 'express';
import { pool } from '../config/database.js';
import { Filter } from 'bad-words';

const router = express.Router();
const filter = new Filter();

// Test endpoint to debug the role query
router.get('/test-roles/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        
        const [roleRows] = await pool.execute(`
            SELECT r.role_name, ur.role_context_type, ur.role_context_id
            FROM user_roles ur 
            JOIN roles r ON ur.role_id = r.role_id 
            WHERE ur.user_id = ?
            ORDER BY r.role_name
        `, [userId]);
        
        res.json({ success: true, roles: roleRows });
    } catch (error) {
        console.error('Test roles error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        
        // Find user by email
        const [users] = await pool.execute(`
            SELECT u.user_id, u.first_name, u.last_name, u.email, u.password
            FROM user u 
            WHERE u.email = ?
        `, [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        const user = users[0];
        
        // For demo purposes, we're using plain text passwords (test123)
        // In production, you'd use bcrypt.compare(password, user.password)
        if (password !== user.password) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        // Get user roles separately
        const [roleRows] = await pool.execute(`
            SELECT r.role_name, ur.role_context_type, ur.role_context_id
            FROM user_roles ur 
            JOIN roles r ON ur.role_id = r.role_id 
            WHERE ur.user_id = ?
            ORDER BY r.role_name
        `, [user.user_id]);
        
        // Create user session (simplified - in production use proper session management)
        const userSession = {
            userId: user.user_id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            roles: roleRows.map(row => ({
                role_name: row.role_name,
                context_type: row.role_context_type || 'general',
                context_id: row.role_context_id || null
            }))
        };
        
        res.json({
            message: 'Login successful',
            user: userSession
        });
        
    } catch (error) {
        console.error('Login error:', error);
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// Logout endpoint
router.post('/logout', (req, res) => {
    // In a real app, you'd destroy the session here
    res.json({ message: 'Logout successful' });
});

// Registration endpoint
router.post('/register', async (req, res) => {
    try {
        let { firstName, lastName, email, password, isWXTJExecutive, wxtjAccessKey } = req.body;
        
        // Clean profanity from user-provided fields
        firstName = filter.clean(firstName || '');
        lastName = filter.clean(lastName || '');
        
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        // WXTJ Executive validation
        let targetRole = 'General User';
        
        if (isWXTJExecutive) {
            // Get the current WXTJ access key from database
            const [keyResult] = await pool.execute(
                'SELECT setting_value FROM app_settings WHERE setting_name = ?',
                ['wxtj_access_key']
            );
            
            if (keyResult.length === 0) {
                return res.status(500).json({ message: 'WXTJ access key not configured' });
            }
            
            const validAccessKey = keyResult[0].setting_value;
            
            if (!wxtjAccessKey || wxtjAccessKey !== validAccessKey) {
                return res.status(400).json({ message: 'Invalid WXTJ access key' });
            }
            targetRole = 'WXTJ Executive';
        }
        
        // Check if user already exists
        const [existingUsers] = await pool.execute(
            'SELECT user_id FROM user WHERE email = ?', 
            [email]
        );
        
        if (existingUsers.length > 0) {
            return res.status(409).json({ message: 'User with this email already exists' });
        }
        
        // Create new user
        const [userResult] = await pool.execute(`
            INSERT INTO user (first_name, last_name, email, password) 
            VALUES (?, ?, ?, ?)
        `, [firstName, lastName, email, password]);
        
        const userId = userResult.insertId;
        
        // Assign role based on registration type
        const [roleResult] = await pool.execute(
            'SELECT role_id FROM roles WHERE role_name = ?', 
            [targetRole]
        );
        
        if (roleResult.length === 0) {
            return res.status(500).json({ message: 'Target role not found' });
        }
        
        const roleId = roleResult[0].role_id;
        
        // Create user role assignment
        const [userRoleResult] = await pool.execute(`
            INSERT INTO user_roles (user_id, role_id) 
            VALUES (?, ?)
        `, [userId, roleId]);
        
        // Create role-specific record
        if (targetRole === 'General User') {
            await pool.execute(`
                INSERT INTO general_user (user_role_id, looking_for_a_band, has_created_band, has_pending_band_request) 
                VALUES (?, 0, 0, 0)
            `, [userRoleResult.insertId]);
        } else if (targetRole === 'WXTJ Executive') {
            await pool.execute(`
                INSERT INTO wxtj_exec (user_role_id, exec_title) 
                VALUES (?, ?)
            `, [userRoleResult.insertId, 'Executive']);
        }
        
        // Return user session data
        const userSession = {
            userId: userId,
            firstName: firstName,
            lastName: lastName,
            email: email,
            roles: [{
                role_name: targetRole,
                context_type: 'general',
                context_id: null
            }]
        };
        
        res.status(201).json({
            message: 'Registration successful',
            user: userSession
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'User with this email already exists' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get current user endpoint (for maintaining session)
router.get('/me', (req, res) => {
    // This would check session/token in a real app
    // For now, just return null (not authenticated)
    res.json({ user: null });
});

export default router; 