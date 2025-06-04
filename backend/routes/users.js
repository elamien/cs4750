import express from 'express';
import { pool } from '../config/database.js';

const router = express.Router();

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
  const { firstName, lastName, email, phoneNumber, bio, instrument, genre } = req.body;
  
  if (!firstName || !lastName || !email) {
    return res.status(400).json({ message: 'First name, last name, and email are required.' });
  }
  
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
    // Check if user is in any band (need to fix this query for role-based system)
    const [memberBands] = await pool.query(
      `SELECT b.band_id, b.name as band_name, r.role_name as role 
       FROM band_member bm 
       JOIN user_roles ur ON bm.user_role_id = ur.user_role_id
       JOIN band b ON bm.band_id = b.band_id 
       JOIN roles r ON ur.role_id = r.role_id
       WHERE ur.user_id = ?`,
      [userId]
    );
    
    // Check if user has pending join requests (this table might not exist yet)
    let hasPendingRequest = false;
    try {
      const [pendingRequests] = await pool.query(
        `SELECT COUNT(*) as count FROM membership_request 
         WHERE user_id = ? AND status = 'pending'`,
        [userId]
      );
      hasPendingRequest = pendingRequests[0].count > 0;
    } catch (error) {
      // Table might not exist, ignore error
      console.log('membership_request table not found, assuming no pending requests');
    }
    
    // Check if user created any band (is a leader)
    const [createdBands] = await pool.query(
      `SELECT COUNT(*) as count FROM band_member bm 
       JOIN user_roles ur ON bm.user_role_id = ur.user_role_id
       JOIN roles r ON ur.role_id = r.role_id
       WHERE ur.user_id = ? AND r.role_name = 'Band Leader'`,
      [userId]
    );
    
    res.json({
      isMemberOfBand: memberBands.length > 0,
      hasPendingRequest: hasPendingRequest,
      hasCreatedBand: createdBands[0].count > 0,
      memberBands: memberBands.map(band => ({
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

export default router; 