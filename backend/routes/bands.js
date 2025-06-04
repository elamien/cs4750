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
  const { name, genre, description } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Band name is required.' });
  }
  
  try {
    const query = `
      UPDATE band 
      SET 
        name = ?,
        genre = ?,
        description = ?
      WHERE band_id = ?;
    `;
    const [result] = await pool.query(query, [
      name, 
      genre || null, 
      description || null, 
      bandId
    ]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Band not found.' });
    }
    
    // Return updated band
    const [updatedRows] = await pool.query(
      `SELECT band_id AS id, name, genre, description, NULL AS location FROM band WHERE band_id = ?`,
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

// GET /api/bands/:id/members - Get band members
router.get('/:id/members', async (req, res, next) => {
  const { id: bandId } = req.params;
  
  try {
    const query = `
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
      ORDER BY 
        CASE WHEN r.role_name = 'Band Leader' THEN 1 ELSE 2 END,
        u.first_name;
    `;
    const [rows] = await pool.query(query, [bandId]);
    
    const members = rows.map(member => ({
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
    // For now, just return success without actually creating the request
    // This would need to be implemented with the proper membership_request table
    
    res.status(201).json({ message: 'Join request sent successfully (placeholder implementation)' });
  } catch (error) {
    console.error('Failed to create join request:', error);
    next(error);
  }
});

// GET /api/bands/:id/events - Get band's events with availability (optional userId param)  
router.get('/:id/events', async (req, res, next) => {
  const { id: bandId } = req.params;
  const { userId } = req.query;
  
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

// DELETE /api/bands/:id/leave - Leave a band
router.delete('/:id/leave', async (req, res, next) => {
  const { id: bandId } = req.params;
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required.' });
  }
  
  try {
    // This is complex with the role system - would need proper implementation
    res.json({ message: 'Leave band functionality needs role system implementation' });
  } catch (error) {
    console.error('Failed to leave band:', error);
    next(error);
  }
});

export default router; 