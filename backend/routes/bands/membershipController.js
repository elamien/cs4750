import express from 'express';
import { pool } from '../../config/database.js';

const router = express.Router();

// POST /api/bands/:id/join-requests - Request to join a band
router.post('/:id/join-requests', async (req, res, next) => {
  const { id: bandId } = req.params;
  const { userId, message } = req.body;
  
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required.' });
  }
  
  try {
    // Check if band exists
    const [bandCheck] = await pool.query('SELECT * FROM band WHERE band_id = ?', [bandId]);
    if (bandCheck.length === 0) {
      return res.status(404).json({ message: 'Band not found.' });
    }
    
    // Check if user already has a pending request for this band
    const [existingRequest] = await pool.query(
      'SELECT * FROM membership_request WHERE user_id = ? AND band_id = ? AND status = "pending"',
      [userId, bandId]
    );
    if (existingRequest.length > 0) {
      return res.status(409).json({ message: 'You already have a pending request for this band.' });
    }
    
    // Create the membership request
    const [result] = await pool.query(
      'INSERT INTO membership_request (user_id, band_id, message) VALUES (?, ?, ?)',
      [userId, bandId, message || null]
    );
    
    res.status(201).json({ 
      message: 'Join request sent successfully',
      requestId: result.insertId 
    });
  } catch (error) {
    console.error('Failed to create join request:', error);
    next(error);
  }
});

// GET /api/bands/:id/membership-requests - Get pending membership requests for a band
router.get('/:id/membership-requests', async (req, res, next) => {
  const { id: bandId } = req.params;
  
  try {
    const query = `
      SELECT 
        mr.membership_request_id AS id,
        mr.user_id AS userId,
        mr.status,
        mr.message,
        mr.time_created AS timeCreated,
        mr.time_responded AS timeResponded,
        mr.responded_by_user_id AS respondedByUserId,
        u.first_name AS firstName,
        u.last_name AS lastName,
        u.email,
        u.instrument,
        u.genre,
        u.bio
      FROM membership_request mr
      JOIN user u ON mr.user_id = u.user_id
      WHERE mr.band_id = ?
      ORDER BY mr.time_created DESC
    `;
    
    const [rows] = await pool.query(query, [bandId]);
    
    const requests = rows.map(request => ({
      ...request,
      id: String(request.id),
      userId: String(request.userId),
      respondedByUserId: request.respondedByUserId ? String(request.respondedByUserId) : null,
      timeCreated: request.timeCreated ? new Date(request.timeCreated).toISOString() : null,
      timeResponded: request.timeResponded ? new Date(request.timeResponded).toISOString() : null
    }));
    
    res.json(requests);
  } catch (error) {
    console.error('Failed to fetch membership requests:', error);
    next(error);
  }
});

// POST /api/bands/:bandId/membership-requests/:requestId/approve - Approve a membership request
router.post('/:bandId/membership-requests/:requestId/approve', async (req, res, next) => {
  const { bandId, requestId } = req.params;
  const { userId: approvingUserId } = req.body;
  
  if (!approvingUserId) {
    return res.status(400).json({ message: 'Approving user ID is required.' });
  }
  
  try {
    // Check if request exists and is pending
    const [requestCheck] = await pool.query(
      'SELECT * FROM membership_request WHERE membership_request_id = ? AND band_id = ? AND status = "pending"',
      [requestId, bandId]
    );
    
    if (requestCheck.length === 0) {
      return res.status(404).json({ message: 'Membership request not found or already processed.' });
    }
    
    const request = requestCheck[0];
    
    // Start transaction to ensure data consistency
    await pool.query('START TRANSACTION');
    
    try {
      // Update request status
      await pool.query(
        'UPDATE membership_request SET status = "approved", responded_by_user_id = ?, time_responded = NOW() WHERE membership_request_id = ?',
        [approvingUserId, requestId]
      );
      
      // Add user to band_member table via user_roles
      // First check if user has a role
      const [userRoleCheck] = await pool.query(
        'SELECT user_role_id FROM user_roles WHERE user_id = ?',
        [request.user_id]
      );
      
      let userRoleId;
      if (userRoleCheck.length > 0) {
        userRoleId = userRoleCheck[0].user_role_id;
        
        // Update their role to Band Member (role_id = 2)
        await pool.query(
          'UPDATE user_roles SET role_id = 2 WHERE user_role_id = ?',
          [userRoleId]
        );
      } else {
        // Create new user_role entry for Band Member
        const [roleResult] = await pool.query(
          'INSERT INTO user_roles (user_id, role_id) VALUES (?, 2)',
          [request.user_id]
        );
        userRoleId = roleResult.insertId;
      }
      
      // Add to band_member table
      await pool.query(
        'INSERT INTO band_member (user_role_id, band_id) VALUES (?, ?)',
        [userRoleId, bandId]
      );
      
      await pool.query('COMMIT');
      
      res.json({ message: 'Membership request approved successfully' });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Failed to approve membership request:', error);
    next(error);
  }
});

// POST /api/bands/:bandId/membership-requests/:requestId/reject - Reject a membership request
router.post('/:bandId/membership-requests/:requestId/reject', async (req, res, next) => {
  const { bandId, requestId } = req.params;
  const { userId: rejectingUserId } = req.body;
  
  if (!rejectingUserId) {
    return res.status(400).json({ message: 'Rejecting user ID is required.' });
  }
  
  try {
    // Check if request exists and is pending
    const [requestCheck] = await pool.query(
      'SELECT * FROM membership_request WHERE membership_request_id = ? AND band_id = ? AND status = "pending"',
      [requestId, bandId]
    );
    
    if (requestCheck.length === 0) {
      return res.status(404).json({ message: 'Membership request not found or already processed.' });
    }
    
    // Update request status
    await pool.query(
      'UPDATE membership_request SET status = "rejected", responded_by_user_id = ?, time_responded = NOW() WHERE membership_request_id = ?',
      [rejectingUserId, requestId]
    );
    
    res.json({ message: 'Membership request rejected successfully' });
  } catch (error) {
    console.error('Failed to reject membership request:', error);
    next(error);
  }
});

export default router; 