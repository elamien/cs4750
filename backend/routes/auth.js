import express from 'express';
import { pool } from '../config/database.js';

const router = express.Router();

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        
        // Find user by email with role information
        const [users] = await pool.execute(`
            SELECT u.user_id, u.first_name, u.last_name, u.email, u.password, r.role_name
            FROM user u 
            JOIN user_roles ur ON u.user_id = ur.user_id 
            JOIN roles r ON ur.role_id = r.role_id 
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
        
        // Map database role names to frontend role names
        const roleMapping = {
            'Band Leader': 'band_leader',
            'Band Member': 'band_member', 
            'General User': 'general',
            'WXTJ Executive': 'exec'
        };
        
        // Create user session (simplified - in production use proper session management)
        const userSession = {
            userId: user.user_id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            role: roleMapping[user.role_name] || 'general'
        };
        
        res.json({
            message: 'Login successful',
            user: userSession
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Logout endpoint
router.post('/logout', (req, res) => {
    // In a real app, you'd destroy the session here
    res.json({ message: 'Logout successful' });
});

// Get current user endpoint (for maintaining session)
router.get('/me', (req, res) => {
    // This would check session/token in a real app
    // For now, just return null (not authenticated)
    res.json({ user: null });
});

export default router; 