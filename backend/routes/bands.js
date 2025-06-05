import express from 'express';
import { pool } from '../config/database.js';

const router = express.Router();

// GET /api/bands - Fetch all bands with member counts for join view
router.get('/', async (req, res, next) => {
  try {
    const query = `
      SELECT 
        b.band_id AS id,
        b.name,
        b.genre,
        b.description,
        NULL AS location,
        COUNT(bm.user_role_id) AS memberCount
      FROM band b
      LEFT JOIN band_member bm ON b.band_id = bm.band_id
      GROUP BY b.band_id, b.name, b.genre, b.description
      ORDER BY b.name;
    `;
    const [rows] = await pool.query(query);
    
    const bands = rows.map(band => ({
      ...band,
      id: String(band.id),
      memberCount: parseInt(band.memberCount) || 0,
      needs: [], // TODO: Could add a band_looking_for table if needed
      isFavorite: false // Placeholder
    }));
    
    res.json(bands);
  } catch (error) {
    console.error('Failed to fetch bands:', error);
    next(error);
  }
});

// GET /api/bands/:id/details - Get role-based band details (MUST come before /:id)
router.get('/:id/details', async (req, res, next) => {
  const { id: bandId } = req.params;
  const { userId } = req.query;
  
  // Convert userId to number if provided (for database queries)
  const userIdNumber = userId ? parseInt(userId) : null;
  
  try {
    // Get basic band information
    const bandQuery = `
      SELECT 
        band_id AS id,
        name,
        genre,
        description,
        email,
        phone_number AS phoneNumber,
        NULL AS location
      FROM band
      WHERE band_id = ?;
    `;
    const [bandRows] = await pool.query(bandQuery, [bandId]);
    
    if (bandRows.length === 0) {
      return res.status(404).json({ message: 'Band not found.' });
    }
    
    const band = {
      ...bandRows[0],
      id: String(bandRows[0].id),
      isFavorite: false // Will be updated if user is signed in
    };
    
    // Initialize user relationship data
    let userRelationship = {
      isSignedIn: !!userIdNumber,
      userRole: 'anonymous',
      relationshipToBand: 'anonymous',
      canSeeMembers: false,
      canSeeContact: false,
      canSeePerformanceHistory: false,
      canRequestToJoin: false,
      canFavorite: false,
      isOwnBand: false,
      isAdmin: false
    };
    
    let members = [];
    
    // If user is signed in, determine their relationship and permissions
    if (userIdNumber) {
      // Get user's role and band status
      const userRoleQuery = `
        SELECT r.role_name 
        FROM user_roles ur 
        JOIN roles r ON ur.role_id = r.role_id 
        WHERE ur.user_id = ?
      `;
      const [userRoleRows] = await pool.query(userRoleQuery, [userIdNumber]);
      const userRole = userRoleRows.length > 0 ? userRoleRows[0].role_name : 'General User';
      
      // Check if user is in this band
      const userBandQuery = `
        SELECT 'member' as type FROM band_member bm 
        JOIN user_roles ur ON bm.user_role_id = ur.user_role_id 
        WHERE bm.band_id = ? AND ur.user_id = ?
        UNION
        SELECT 'leader' as type FROM band_leader bl 
        JOIN user_roles ur ON bl.user_role_id = ur.user_role_id 
        WHERE bl.band_id = ? AND ur.user_id = ?
      `;
      const [userBandRows] = await pool.query(userBandQuery, [bandId, userIdNumber, bandId, userIdNumber]);
      
      const isInThisBand = userBandRows.length > 0;
      const isBandLeader = userBandRows.some(row => row.type === 'leader');
      
      // Check if user has any band
      const userAnyBandQuery = `
        SELECT COUNT(*) as count FROM (
          SELECT bm.band_id FROM band_member bm 
          JOIN user_roles ur ON bm.user_role_id = ur.user_role_id 
          WHERE ur.user_id = ?
          UNION
          SELECT bl.band_id FROM band_leader bl 
          JOIN user_roles ur ON bl.user_role_id = ur.user_role_id 
          WHERE ur.user_id = ?
        ) as user_bands
      `;
      const [userAnyBandRows] = await pool.query(userAnyBandQuery, [userIdNumber, userIdNumber]);
      const hasAnyBand = userAnyBandRows[0].count > 0;
      
      // Check if band is in user's favorites
      const favoriteQuery = `
        SELECT 1 FROM user_favorites_bands WHERE user_id = ? AND band_id = ?
      `;
      const [favoriteRows] = await pool.query(favoriteQuery, [userIdNumber, bandId]);
      band.isFavorite = favoriteRows.length > 0;
      
      // Determine relationship and permissions
      userRelationship = {
        isSignedIn: true,
        userRole: userRole,
        relationshipToBand: isInThisBand ? 'same_band' : (hasAnyBand ? 'different_band' : 'no_band'),
        canSeeMembers: true, // Any signed-in user can see band members
        canSeeContact: isInThisBand || userRole === 'WXTJ Executive',
        canRequestToJoin: !hasAnyBand && !isInThisBand && userRole !== 'WXTJ Executive',
        canFavorite: userRole !== 'anonymous',
        isOwnBand: isInThisBand,
        isAdmin: userRole === 'WXTJ Executive'
      };
      
      // Fetch members if user can see them
      if (userRelationship.canSeeMembers) {
        const memberQuery = `
          SELECT 
            u.user_id AS id,
            u.first_name AS firstName,
            u.last_name AS lastName,
            u.instrument,
            r.role_name AS role
          FROM band_member bm
          JOIN user_roles ur ON bm.user_role_id = ur.user_role_id
          JOIN user u ON ur.user_id = u.user_id
          JOIN roles r ON ur.role_id = r.role_id
          WHERE bm.band_id = ?
          UNION
          SELECT 
            u.user_id AS id,
            u.first_name AS firstName,
            u.last_name AS lastName,
            u.instrument,
            r.role_name AS role
          FROM band_leader bl
          JOIN user_roles ur ON bl.user_role_id = ur.user_role_id
          JOIN user u ON ur.user_id = u.user_id
          JOIN roles r ON ur.role_id = r.role_id
          WHERE bl.band_id = ?
          ORDER BY CASE WHEN role = 'Band Leader' THEN 1 ELSE 2 END, firstName
        `;
        const [memberRows] = await pool.query(memberQuery, [bandId, bandId]);
        
        members = memberRows.map(member => ({
          ...member,
          id: String(member.id)
        }));
      }
    }
    
    const response = {
      band,
      members,
      userRelationship
    };
    
    res.json(response);
  } catch (error) {
    console.error('Failed to fetch band details:', error);
    next(error);
  }
});

// GET /api/bands/:id - Get specific band details
router.get('/:id', async (req, res, next) => {
  const { id: bandId } = req.params;
  
  try {
    const query = `
      SELECT 
        band_id AS id,
        name,
        genre,
        description,
        NULL AS location
      FROM band
      WHERE band_id = ?;
    `;
    const [rows] = await pool.query(query, [bandId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Band not found.' });
    }
    
    const band = {
      ...rows[0],
      id: String(rows[0].id)
    };
    
    res.json(band);
  } catch (error) {
    console.error('Failed to fetch band:', error);
    next(error);
  }
});

// PUT /api/bands/:id - Update band profile
router.put('/:id', async (req, res, next) => {
  const { id: bandId } = req.params;
  const { name, genre, description, location } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Band name is required.' });
  }
  
  try {
    const query = `
      UPDATE band 
      SET 
        name = ?,
        genre = ?,
        description = ?,
        location = ?
      WHERE band_id = ?;
    `;
    const [result] = await pool.query(query, [
      name, 
      genre || null, 
      description || null,
      location || null,
      bandId
    ]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Band not found.' });
    }
    
    // Return updated band
    const [updatedRows] = await pool.query(
      `SELECT band_id AS id, name, genre, description, location FROM band WHERE band_id = ?`,
      [bandId]
    );
    
    const updatedBand = {
      ...updatedRows[0],
      id: String(updatedRows[0].id)
    };
    
    res.json(updatedBand);
  } catch (error) {
    console.error('Failed to update band:', error);
    next(error);
  }
});

// GET /api/bands/:id/members - Get band members (including leaders)
router.get('/:id/members', async (req, res, next) => {
  const { id: bandId } = req.params;
  
  try {
    // Get band members
    const memberQuery = `
      SELECT 
        u.user_id AS id,
        u.first_name AS firstName,
        u.last_name AS lastName,
        u.instrument,
        r.role_name AS role
      FROM band_member bm
      JOIN user_roles ur ON bm.user_role_id = ur.user_role_id
      JOIN user u ON ur.user_id = u.user_id
      JOIN roles r ON ur.role_id = r.role_id
      WHERE bm.band_id = ?
    `;
    const [memberRows] = await pool.query(memberQuery, [bandId]);
    
    // Get band leaders
    const leaderQuery = `
      SELECT 
        u.user_id AS id,
        u.first_name AS firstName,
        u.last_name AS lastName,
        u.instrument,
        r.role_name AS role
      FROM band_leader bl
      JOIN user_roles ur ON bl.user_role_id = ur.user_role_id
      JOIN user u ON ur.user_id = u.user_id
      JOIN roles r ON ur.role_id = r.role_id
      WHERE bl.band_id = ?
    `;
    const [leaderRows] = await pool.query(leaderQuery, [bandId]);
    
    // Combine and sort (leaders first, then members, then by first name)
    const allMembers = [...memberRows, ...leaderRows];
    allMembers.sort((a, b) => {
      if (a.role === 'Band Leader' && b.role !== 'Band Leader') return -1;
      if (b.role === 'Band Leader' && a.role !== 'Band Leader') return 1;
      return a.firstName.localeCompare(b.firstName);
    });
    
    const members = allMembers.map(member => ({
      ...member,
      id: String(member.id)
    }));
    
    res.json(members);
  } catch (error) {
    console.error('Failed to fetch band members:', error);
    next(error);
  }
});

// POST /api/bands - Create a new band
router.post('/', async (req, res, next) => {
  const { name, genre, description, creatorUserId } = req.body;
  
  if (!name || !creatorUserId) {
    return res.status(400).json({ message: 'Band name and creator user ID are required.' });
  }
  
  try {
    // Insert new band
    const [bandResult] = await pool.query(
      `INSERT INTO band (name, genre, description) VALUES (?, ?, ?)`,
      [name, genre || null, description || null]
    );
    
    const bandId = bandResult.insertId;
    
    // This is complex because we need to work with the role system
    // For now, just return the created band without adding the user as leader
    // This would need to be implemented properly with the role system
    
    const createdBand = {
      id: String(bandId),
      name,
      genre: genre || null,
      description: description || null,
      location: null
    };
    
    res.status(201).json(createdBand);
  } catch (error) {
    console.error('Failed to create band:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Band name already exists.' });
    }
    next(error);
  }
});

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

// GET /api/bands/:id/events - Get band's events with availability 
router.get('/:id/events', async (req, res, next) => {
  const { id: bandId } = req.params;
  
  // TODO: Get userId from authenticated session, NOT from query params!
  // This is a SECURITY VULNERABILITY if userId comes from URL
  const userId = null; // For now, always anonymous until proper auth is implemented
  
  try {
    // This would need a band_event join table which doesn't exist yet
    // For now, return empty array
    res.json([]);
  } catch (error) {
    console.error('Failed to fetch band events:', error);
    next(error);
  }
});

// PUT /api/bands/:bandId/events/:eventId/availability - Set member availability for event
router.put('/:bandId/events/:eventId/availability', async (req, res, next) => {
  const { bandId, eventId } = req.params;
  const { userId, isAvailable } = req.body;
  
  if (!userId || isAvailable === undefined) {
    return res.status(400).json({ message: 'User ID and availability status are required.' });
  }
  
  try {
    // First check if record exists
    const [existing] = await pool.query(
      `SELECT * FROM band_member_event_availability WHERE band_id = ? AND event_id = ? AND user_id = ?`,
      [bandId, eventId, userId]
    );
    
    if (existing.length > 0) {
      // Update existing record
      await pool.query(
        `UPDATE band_member_event_availability SET is_available = ? WHERE band_id = ? AND event_id = ? AND user_id = ?`,
        [isAvailable, bandId, eventId, userId]
      );
    } else {
      // Insert new record
      await pool.query(
        `INSERT INTO band_member_event_availability (band_id, event_id, user_id, is_available) VALUES (?, ?, ?, ?)`,
        [bandId, eventId, userId, isAvailable]
      );
    }
    
    res.json({ message: 'Availability updated successfully' });
  } catch (error) {
    console.error('Failed to update availability:', error);
    next(error);
  }
});

// GET /api/bands/:bandId/events/:eventId/availability/:userId - Get member availability for event
router.get('/:bandId/events/:eventId/availability/:userId', async (req, res, next) => {
  const { bandId, eventId, userId } = req.params;
  
  try {
    const [rows] = await pool.query(
      `SELECT is_available FROM band_member_event_availability WHERE band_id = ? AND event_id = ? AND user_id = ?`,
      [bandId, eventId, userId]
    );
    
    const availability = rows.length > 0 ? rows[0].is_available : null;
    res.json({ isAvailable: availability });
  } catch (error) {
    console.error('Failed to fetch availability:', error);
    next(error);
  }
});

// GET /api/bands/:id/eligible-leaders - Get members eligible to be promoted to leader
router.get('/:id/eligible-leaders', async (req, res, next) => {
  const { id: bandId } = req.params;
  const { currentUserId } = req.query;
  
  if (!currentUserId) {
    return res.status(400).json({ message: 'Current user ID is required.' });
  }
  
  try {
    // Get all band members except the current user
    const memberQuery = `
      SELECT 
        u.user_id AS id,
        u.first_name AS firstName,
        u.last_name AS lastName,
        u.instrument,
        r.role_name AS role
      FROM band_member bm
      JOIN user_roles ur ON bm.user_role_id = ur.user_role_id
      JOIN user u ON ur.user_id = u.user_id
      JOIN roles r ON ur.role_id = r.role_id
      WHERE bm.band_id = ? AND u.user_id != ?
      ORDER BY u.first_name
    `;
    
    const [members] = await pool.query(memberQuery, [bandId, currentUserId]);
    
    const eligibleMembers = members.map(member => ({
      ...member,
      id: String(member.id)
    }));
    
    res.json(eligibleMembers);
  } catch (error) {
    console.error('Failed to fetch eligible leaders:', error);
    next(error);
  }
});

// POST /api/bands/:id/promote-leader - Promote a member to band leader
router.post('/:id/promote-leader', async (req, res, next) => {
  const { id: bandId } = req.params;
  const { currentUserId, newLeaderId } = req.body;
  
  if (!currentUserId || !newLeaderId) {
    return res.status(400).json({ message: 'Current user ID and new leader ID are required.' });
  }
  
  try {
    // Start transaction for data consistency
    await pool.query('START TRANSACTION');
    
    try {
      // 1. Verify current user is a band leader
      const [currentLeaderCheck] = await pool.query(
        `SELECT bl.user_role_id FROM band_leader bl 
         JOIN user_roles ur ON bl.user_role_id = ur.user_role_id 
         WHERE bl.band_id = ? AND ur.user_id = ?`,
        [bandId, currentUserId]
      );
      
      if (currentLeaderCheck.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(403).json({ message: 'Only band leaders can promote new leaders.' });
      }
      
      const currentLeaderUserRoleId = currentLeaderCheck[0].user_role_id;
      
      // 2. Verify new leader is a band member
      const [newLeaderCheck] = await pool.query(
        `SELECT bm.user_role_id FROM band_member bm 
         JOIN user_roles ur ON bm.user_role_id = ur.user_role_id 
         WHERE bm.band_id = ? AND ur.user_id = ?`,
        [bandId, newLeaderId]
      );
      
      if (newLeaderCheck.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({ message: 'New leader must be a current band member.' });
      }
      
      const newLeaderUserRoleId = newLeaderCheck[0].user_role_id;
      
      // 3. Remove new leader from band_member table
      await pool.query(
        'DELETE FROM band_member WHERE user_role_id = ? AND band_id = ?',
        [newLeaderUserRoleId, bandId]
      );
      
      // 4. Update their role to Band Leader (role_id = 1)
      await pool.query(
        'UPDATE user_roles SET role_id = 1 WHERE user_role_id = ?',
        [newLeaderUserRoleId]
      );
      
      // 5. Add them to band_leader table
      await pool.query(
        'INSERT INTO band_leader (user_role_id, band_id) VALUES (?, ?)',
        [newLeaderUserRoleId, bandId]
      );
      
      // 6. Remove current leader from band_leader table
      await pool.query(
        'DELETE FROM band_leader WHERE user_role_id = ? AND band_id = ?',
        [currentLeaderUserRoleId, bandId]
      );
      
      // 7. Demote current leader to Band Member (role_id = 2)
      await pool.query(
        'UPDATE user_roles SET role_id = 2 WHERE user_role_id = ?',
        [currentLeaderUserRoleId]
      );
      
      // 8. Add current leader to band_member table
      await pool.query(
        'INSERT INTO band_member (user_role_id, band_id) VALUES (?, ?)',
        [currentLeaderUserRoleId, bandId]
      );
      
      await pool.query('COMMIT');
      
      res.json({ message: 'Leader promoted successfully' });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Failed to promote leader:', error);
    next(error);
  }
});

// DELETE /api/bands/:id/leave - Leave a band
router.delete('/:id/leave', async (req, res, next) => {
  const { id: bandId } = req.params;
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required.' });
  }
  
  try {
    // Start transaction for data consistency
    await pool.query('START TRANSACTION');
    
    try {
      // 1. Check if user is a band leader
      const [leaderCheck] = await pool.query(
        `SELECT bl.user_role_id FROM band_leader bl 
         JOIN user_roles ur ON bl.user_role_id = ur.user_role_id 
         WHERE bl.band_id = ? AND ur.user_id = ?`,
        [bandId, userId]
      );
      
      const isLeader = leaderCheck.length > 0;
      
      if (isLeader) {
        // 2. Count other band members (excluding this leader)
        const [memberCount] = await pool.query(
          `SELECT COUNT(*) as count FROM band_member bm 
           JOIN user_roles ur ON bm.user_role_id = ur.user_role_id 
           WHERE bm.band_id = ? AND ur.user_id != ?`,
          [bandId, userId]
        );
        
        if (memberCount[0].count > 0) {
          // There are other members - leader must promote someone first
          await pool.query('ROLLBACK');
          return res.status(400).json({ 
            message: 'As the band leader, you must promote another member to leader before leaving the band.',
            requiresLeaderPromotion: true
          });
        }
        
        // 3. Leader leaving and no other members - remove from band_leader table
        const userRoleId = leaderCheck[0].user_role_id;
        await pool.query(
          'DELETE FROM band_leader WHERE user_role_id = ? AND band_id = ?',
          [userRoleId, bandId]
        );
        
        // 4. Update user role back to General User (role_id = 3)
        await pool.query(
          'UPDATE user_roles SET role_id = 3 WHERE user_role_id = ?',
          [userRoleId]
        );
        
        // 5. If this was the last member, optionally delete the band
        // For now, we'll leave the band record but it will have no members
        
      } else {
        // 6. Check if user is a band member
        const [memberCheck] = await pool.query(
          `SELECT bm.user_role_id FROM band_member bm 
           JOIN user_roles ur ON bm.user_role_id = ur.user_role_id 
           WHERE bm.band_id = ? AND ur.user_id = ?`,
          [bandId, userId]
        );
        
        if (memberCheck.length === 0) {
          await pool.query('ROLLBACK');
          return res.status(404).json({ message: 'User is not a member of this band.' });
        }
        
        // 7. Remove from band_member table
        const userRoleId = memberCheck[0].user_role_id;
        await pool.query(
          'DELETE FROM band_member WHERE user_role_id = ? AND band_id = ?',
          [userRoleId, bandId]
        );
        
        // 8. Update user role back to General User (role_id = 3)
        await pool.query(
          'UPDATE user_roles SET role_id = 3 WHERE user_role_id = ?',
          [userRoleId]
        );
      }
      
      await pool.query('COMMIT');
      
      res.json({ message: 'Successfully left the band' });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Failed to leave band:', error);
    next(error);
  }
});

export default router; 