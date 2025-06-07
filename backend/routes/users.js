import express from 'express';
import { pool } from '../config/database.js';
import { Filter } from 'bad-words';

const router = express.Router();
const filter = new Filter();

// GET /api/users - Fetch all users (for admin use)
router.get('/', async (req, res, next) => {
  try {
    const query = `
      SELECT 
        u.user_id AS id,
        u.first_name AS firstName,
        u.last_name AS lastName,
        u.bio,
        u.email,
        u.phone_number AS phoneNumber,
        u.genre,
        u.instrument,
        r.role_name AS roleName,
        CASE 
          WHEN r.role_name = 'General User' THEN 
            CASE 
              WHEN g.has_created_band = 1 THEN 'Has Created Band'
              WHEN g.has_pending_band_request = 1 THEN 'Pending Band Request'
              WHEN g.looking_for_a_band = 1 THEN 'Looking for Band'
              ELSE 'General User'
            END
          WHEN r.role_name = 'WXTJ Executive' THEN CONCAT('Executive: ', COALESCE(w.exec_title, 'Executive'))
          WHEN r.role_name IN ('Band Leader', 'Band Member') THEN 
            CONCAT(r.role_name, ' (', COALESCE(b.name, 'Unknown Band'), ')')
          ELSE r.role_name
        END AS roleDetails
      FROM user u
      JOIN user_roles ur ON u.user_id = ur.user_id
      JOIN roles r ON ur.role_id = r.role_id
      LEFT JOIN general_user g ON ur.user_role_id = g.user_role_id
      LEFT JOIN wxtj_exec w ON ur.user_role_id = w.user_role_id
      LEFT JOIN band_leader bl ON ur.user_role_id = bl.user_role_id
      LEFT JOIN band_member bm ON ur.user_role_id = bm.user_role_id
      LEFT JOIN band b ON (bl.band_id = b.band_id OR bm.band_id = b.band_id)
      ORDER BY u.user_id ASC;
    `;
    const [rows] = await pool.query(query);
    
    const users = rows.map(user => ({
      ...user,
      id: String(user.id)
    }));
    
    res.json(users);
  } catch (error) {
    console.error('Failed to fetch all users:', error);
    next(error);
  }
});

// GET /api/users/:id - Fetch a specific user by ID
router.get('/:id', async (req, res, next) => {
  const { id: userId } = req.params;
  
  try {
    const query = `
      SELECT 
        user_id AS id,
        first_name AS firstName,
        last_name AS lastName,
        bio,
        email,
        phone_number AS phoneNumber,
        genre,
        instrument
      FROM user
      WHERE user_id = ?;
    `;
    const [rows] = await pool.query(query, [userId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    const user = {
      ...rows[0],
      id: String(rows[0].id)
    };
    
    res.json(user);
  } catch (error) {
    console.error('Failed to fetch user:', error);
    next(error);
  }
});

// PUT /api/users/:id - Update a specific user by ID
router.put('/:id', async (req, res, next) => {
  const { id: userId } = req.params;
  let { firstName, lastName, email, phoneNumber, bio, instrument, genre } = req.body;
  
  if (!firstName || !lastName || !email) {
    return res.status(400).json({ message: 'First name, last name, and email are required.' });
  }

  // Clean profanity from inputs
  firstName = filter.clean(firstName || '');
  lastName = filter.clean(lastName || '');
  bio = filter.clean(bio || '');
  
  try {
    const query = `
      UPDATE user 
      SET 
        first_name = ?,
        last_name = ?,
        email = ?,
        phone_number = ?,
        bio = ?,
        instrument = ?,
        genre = ?
      WHERE user_id = ?;
    `;
    const [result] = await pool.query(query, [
      firstName, 
      lastName, 
      email, 
      phoneNumber || null, 
      bio || null, 
      instrument || null, 
      genre || null, 
      userId
    ]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    // Return the updated user
    const [updatedRows] = await pool.query(
      `SELECT user_id AS id, first_name AS firstName, last_name AS lastName, bio, email, phone_number AS phoneNumber, genre, instrument FROM user WHERE user_id = ?`,
      [userId]
    );
    
    const updatedUser = {
      ...updatedRows[0],
      id: String(updatedRows[0].id)
    };
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Failed to update user:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email already exists.' });
    }
    next(error);
  }
});

// GET /api/users/:id/favorite-bands - Get user's favorite bands
router.get('/:id/favorite-bands', async (req, res, next) => {
  const { id: userId } = req.params;
  
  try {
    const query = `
      SELECT 
        b.band_id AS id,
        b.name,
        b.genre,
        b.description,
        NULL AS location
      FROM user_favorites_bands ufb
      JOIN band b ON ufb.band_id = b.band_id
      WHERE ufb.user_id = ?
      ORDER BY b.name;
    `;
    const [rows] = await pool.query(query, [userId]);
    
    const bands = rows.map(band => ({
      ...band,
      id: String(band.id)
    }));
    
    res.json(bands);
  } catch (error) {
    console.error('Failed to fetch user favorite bands:', error);
    next(error);
  }
});

// GET /api/users/:id/favorite-events - Get user's favorite events
router.get('/:id/favorite-events', async (req, res, next) => {
  const { id: userId } = req.params;
  
  try {
    const query = `
      SELECT 
        e.event_id AS id,
        e.event_title AS name,
        e.datetime AS date,
        e.description,
        e.location,
        e.genre
      FROM user_favorites_events ufe
      JOIN event e ON ufe.event_id = e.event_id
      WHERE ufe.user_id = ?
      ORDER BY e.datetime DESC;
    `;
    const [rows] = await pool.query(query, [userId]);
    
    const events = rows.map(event => ({
      ...event,
      id: String(event.id),
      date: event.date ? event.date.toISOString().split('T')[0] : null
    }));
    
    res.json(events);
  } catch (error) {
    console.error('Failed to fetch user favorite events:', error);
    next(error);
  }
});

// POST /api/users/:userId/favorite-bands - Toggle band favorite status
router.post('/:userId/favorite-bands', async (req, res, next) => {
  const { userId } = req.params;
  const { bandId, makeFavorite } = req.body;

  if (!bandId || typeof makeFavorite !== 'boolean') {
    return res.status(400).json({ message: 'Band ID and favorite status (true/false) are required.' });
  }

  try {
    if (makeFavorite) {
      const query = 'INSERT IGNORE INTO user_favorites_bands (user_id, band_id) VALUES (?, ?)';
      await pool.query(query, [userId, bandId]);
      res.status(201).json({ message: 'Band added to favorites.' });
    } else {
      const query = 'DELETE FROM user_favorites_bands WHERE user_id = ? AND band_id = ?';
      const [result] = await pool.query(query, [userId, bandId]);
      if (result.affectedRows > 0) {
        res.status(200).json({ message: 'Band removed from favorites.' });
      } else {
        res.status(200).json({ message: 'Band was not in favorites or already removed.' });
      }
    }
  } catch (error) {
    console.error('Failed to update band favorite status:', error);
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(404).json({ message: 'User or Band not found.'});
    }
    next(error);
  }
});

// POST /api/users/:userId/favorite-events - Toggle event favorite status
router.post('/:userId/favorite-events', async (req, res, next) => {
  const { userId } = req.params;
  const { eventId, makeFavorite } = req.body;

  if (!eventId || typeof makeFavorite !== 'boolean') {
    return res.status(400).json({ message: 'Event ID and favorite status (true/false) are required.' });
  }

  try {
    if (makeFavorite) {
      const query = 'INSERT IGNORE INTO user_favorites_events (user_id, event_id) VALUES (?, ?)';
      await pool.query(query, [userId, eventId]);
      res.status(201).json({ message: 'Event added to favorites.' });
    } else {
      const query = 'DELETE FROM user_favorites_events WHERE user_id = ? AND event_id = ?';
      const [result] = await pool.query(query, [userId, eventId]);
      if (result.affectedRows > 0) {
        res.status(200).json({ message: 'Event removed from favorites.' });
      } else {
        res.status(200).json({ message: 'Event was not in favorites or already removed.' });
      }
    }
  } catch (error) {
    console.error('Failed to update event favorite status:', error);
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(404).json({ message: 'User or Event not found.'});
    }
    next(error);
  }
});

// GET /api/users/:id/band-status - Get user's band membership and request status
router.get('/:id/band-status', async (req, res, next) => {
  const { id: userId } = req.params;
  
  try {
    // Check if user is a band member
    const [memberBands] = await pool.query(
      `SELECT b.band_id, b.name as band_name, r.role_name as role 
       FROM band_member bm 
       JOIN user_roles ur ON bm.user_role_id = ur.user_role_id
       JOIN band b ON bm.band_id = b.band_id 
       JOIN roles r ON ur.role_id = r.role_id
       WHERE ur.user_id = ?`,
      [userId]
    );
    
    // Check if user is a band leader
    const [leaderBands] = await pool.query(
      `SELECT b.band_id, b.name as band_name, r.role_name as role 
       FROM band_leader bl 
       JOIN user_roles ur ON bl.user_role_id = ur.user_role_id
       JOIN band b ON bl.band_id = b.band_id 
       JOIN roles r ON ur.role_id = r.role_id
       WHERE ur.user_id = ?`,
      [userId]
    );
    
    // Combine member and leader bands
    const allUserBands = [...memberBands, ...leaderBands];
    
    // Check if user has pending join requests and get details
    let hasPendingRequest = false;
    let pendingRequests = [];
    try {
      const [requestRows] = await pool.query(
        `SELECT 
          mr.membership_request_id as id,
          mr.band_id as bandId,
          mr.message,
          mr.time_created as timeCreated,
          b.name as bandName,
          b.genre as bandGenre
         FROM membership_request mr
         JOIN band b ON mr.band_id = b.band_id
         WHERE mr.user_id = ? AND mr.status = 'pending'`,
        [userId]
      );
      hasPendingRequest = requestRows.length > 0;
      pendingRequests = requestRows.map(req => ({
        id: String(req.id),
        bandId: String(req.bandId),
        bandName: req.bandName,
        bandGenre: req.bandGenre,
        message: req.message,
        timeCreated: req.timeCreated ? new Date(req.timeCreated).toISOString() : null
      }));
    } catch (error) {
      // Table might not exist, ignore error
      console.log('membership_request table error:', error.message);
    }
    
    console.log('Debug - hasPendingRequest:', hasPendingRequest);
    console.log('Debug - pendingRequests:', pendingRequests);
    
    // Check if user created any band (is a leader) - using band_leader table
    const [createdBands] = await pool.query(
      `SELECT COUNT(*) as count FROM band_leader bl 
       JOIN user_roles ur ON bl.user_role_id = ur.user_role_id
       WHERE ur.user_id = ?`,
      [userId]
    );
    
    res.json({
      isMemberOfBand: allUserBands.length > 0,
      hasPendingRequest: hasPendingRequest,
      hasCreatedBand: createdBands[0].count > 0,
      pendingRequests: pendingRequests,
      memberBands: allUserBands.map(band => ({
        id: String(band.band_id),
        name: band.band_name,
        role: band.role
      }))
    });
  } catch (error) {
    console.error('Failed to fetch user band status:', error);
    next(error);
  }
});

// GET /api/users/:id/events - Get events created by a specific user
router.get('/:id/events', async (req, res, next) => {
  const { id: userId } = req.params;
  
  try {
    const query = `
      SELECT 
        e.event_id AS id,
        e.user_id AS userId,
        e.event_title AS eventTitle,
        DATE(e.event_date) AS eventDate,
        e.time_slot AS timeSlot,
        e.datetime,
        e.location,
        e.genre,
        e.status,
        e.description,
        e.assigned_band_id AS assignedBandId,
        b.name AS bandName,
        COUNT(er.event_request_id) AS pendingInvitations
      FROM event e
      LEFT JOIN band b ON e.assigned_band_id = b.band_id
      LEFT JOIN event_request er ON e.event_id = er.event_id AND er.status = 'pending'
      WHERE e.user_id = ?
      GROUP BY e.event_id
      ORDER BY e.event_date DESC, e.time_slot ASC
    `;
    const [rows] = await pool.query(query, [userId]);

    const events = rows.map(event => ({
      id: String(event.id),
      userId: String(event.userId),
      eventTitle: event.eventTitle,
      eventDate: event.eventDate,
      timeSlot: event.timeSlot,
      datetime: event.datetime ? new Date(event.datetime).toISOString() : null,
      location: event.location,
      genre: event.genre,
      status: event.status,
      description: event.description,
      assignedBandId: event.assignedBandId ? String(event.assignedBandId) : null,
      bandName: event.bandName,
      pendingInvitations: parseInt(event.pendingInvitations) || 0
    }));

    res.json(events);
  } catch (error) {
    console.error('Failed to fetch user events:', error);
    next(error);
  }
});

// DELETE /api/users/:id - Delete a user (admin only) - DISABLED FOR SCOPE
/*
// DELETE /api/users/:id - Delete a user (admin only)
router.delete('/:id', async (req, res, next) => {
  const { id: userId } = req.params;
  
  try {
    // Check if user exists first
    const [userCheck] = await pool.query('SELECT user_id FROM user WHERE user_id = ?', [userId]);
    
    if (userCheck.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    // Delete user (CASCADE will handle related records)
    const [result] = await pool.query('DELETE FROM user WHERE user_id = ?', [userId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    res.json({ 
      message: 'User deleted successfully.',
      deletedUserId: userId 
    });
  } catch (error) {
    console.error('Failed to delete user:', error);
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ 
        message: 'Cannot delete user: User has associated records that must be removed first.' 
      });
    }
    next(error);
  }
});
*/

export default router; 