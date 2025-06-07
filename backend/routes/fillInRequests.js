import express from 'express';
import { pool } from '../config/database.js';
import { Filter } from 'bad-words';

const router = express.Router();
const filter = new Filter();

// GET /api/fill-in-requests - Fetch all fill-in requests with joined data
router.get('/', async (req, res, next) => {
  try {
    const query = `
      SELECT 
        fir.fill_in_request_id AS id,
        fir.band_id AS bandId,
        b.name AS bandName,
        fir.event_id AS eventId,
        e.event_title AS eventName,
        e.datetime AS eventDate,
        e.location AS eventVenue,
        fir.slot_number AS slotNumber,
        fir.fill_in_description AS fillInDescription,
        fir.fill_in_member_id AS fillInMemberId,
        CONCAT(om.first_name, ' ', om.last_name) AS originalMemberName,
        fir.status,
        fir.accepted_by_user_id AS acceptedByUserId,
        CONCAT(au.first_name, ' ', au.last_name) AS acceptedByUserName,
        fir.time_created AS timeCreated,
        fir.time_responded AS timeResponded
      FROM fill_in_request fir
      JOIN band b ON fir.band_id = b.band_id
      JOIN event e ON fir.event_id = e.event_id
      JOIN user om ON fir.fill_in_member_id = om.user_id
      LEFT JOIN user au ON fir.accepted_by_user_id = au.user_id
      ORDER BY fir.time_created DESC;
    `;
    const [rows] = await pool.query(query);
    
    // Format dates to ISO strings if they aren't already
    const formattedRows = rows.map(row => ({
      ...row,
      eventDate: row.eventDate ? new Date(row.eventDate).toISOString() : null,
      timeCreated: row.timeCreated ? new Date(row.timeCreated).toISOString() : null,
      timeResponded: row.timeResponded ? new Date(row.timeResponded).toISOString() : null,
      // Convert INT ids from DB to string for frontend consistency
      id: String(row.id),
      bandId: String(row.bandId),
      eventId: String(row.eventId),
      fillInMemberId: String(row.fillInMemberId),
      acceptedByUserId: row.acceptedByUserId ? String(row.acceptedByUserId) : null
    }));
    
    res.json(formattedRows);
  } catch (error) {
    console.error('Failed to fetch fill-in requests:', error);
    next(error);
  }
});

// POST /api/fill-in-requests/:id/accept - Accept a fill-in request
router.post('/:id/accept', async (req, res, next) => {
  const { id: fillInRequestId } = req.params;
  const { userId: acceptedByUserId } = req.body;

  if (!acceptedByUserId) {
    return res.status(400).json({ message: 'User ID is required to accept a request.' });
  }

  try {
    // First, check if the request is still pending and exists
    const [requestRows] = await pool.query('SELECT * FROM fill_in_request WHERE fill_in_request_id = ? AND status = \'pending\'', [fillInRequestId]);
    if (requestRows.length === 0) {
      return res.status(404).json({ message: 'Fill-in request not found or already handled.' });
    }

    const originalRequest = requestRows[0];
    // Check if the user accepting is the original member who posted it
    if (String(originalRequest.fill_in_member_id) === String(acceptedByUserId)) {
      return res.status(400).json({ message: 'You cannot accept your own fill-in request.' });
    }

    const currentTime = new Date();
    const query = `
      UPDATE fill_in_request 
      SET status = 'accepted', accepted_by_user_id = ?, time_responded = ?
      WHERE fill_in_request_id = ?;
    `;
    const [result] = await pool.query(query, [acceptedByUserId, currentTime, fillInRequestId]);

    if (result.affectedRows > 0) {
      // Fetch the updated request details to return
      const [updatedRows] = await pool.query(`
        SELECT 
          fir.fill_in_request_id AS id,
          fir.band_id AS bandId,
          b.name AS bandName,
          fir.event_id AS eventId,
          e.event_title AS eventName,
          e.datetime AS eventDate,
          e.location AS eventVenue,
          fir.slot_number AS slotNumber,
          fir.fill_in_description AS fillInDescription,
          fir.fill_in_member_id AS fillInMemberId,
          CONCAT(om.first_name, ' ', om.last_name) AS originalMemberName,
          fir.status,
          fir.accepted_by_user_id AS acceptedByUserId,
          CONCAT(au.first_name, ' ', au.last_name) AS acceptedByUserName,
          fir.time_created AS timeCreated,
          fir.time_responded AS timeResponded
        FROM fill_in_request fir
        JOIN band b ON fir.band_id = b.band_id
        JOIN event e ON fir.event_id = e.event_id
        JOIN user om ON fir.fill_in_member_id = om.user_id
        LEFT JOIN user au ON fir.accepted_by_user_id = au.user_id
        WHERE fir.fill_in_request_id = ?;
      `, [fillInRequestId]);
      
      if (updatedRows.length > 0) {
        const updatedRequest = {
            ...updatedRows[0],
            eventDate: updatedRows[0].eventDate ? new Date(updatedRows[0].eventDate).toISOString() : null,
            timeCreated: updatedRows[0].timeCreated ? new Date(updatedRows[0].timeCreated).toISOString() : null,
            timeResponded: updatedRows[0].timeResponded ? new Date(updatedRows[0].timeResponded).toISOString() : null,
            id: String(updatedRows[0].id),
            bandId: String(updatedRows[0].bandId),
            eventId: String(updatedRows[0].eventId),
            fillInMemberId: String(updatedRows[0].fillInMemberId),
            acceptedByUserId: updatedRows[0].acceptedByUserId ? String(updatedRows[0].acceptedByUserId) : null
        };
        res.json({ message: 'Fill-in request accepted successfully.', request: updatedRequest });
      } else {
        res.status(404).json({ message: 'Failed to retrieve updated request details.'});
      }
    } else {
      res.status(404).json({ message: 'Fill-in request not found or status unchanged.' });
    }
  } catch (error) {
    console.error('Failed to accept fill-in request:', error);
    next(error);
  }
});

// POST /api/fill-in-requests - Create a new fill-in request
router.post('/', async (req, res, next) => {
  let { bandId, eventId, slotNumber, fillInDescription, fillInMemberId } = req.body;

  // Clean profanity from inputs
  fillInDescription = filter.clean(fillInDescription || '');

  if (!bandId || !eventId || !slotNumber || !fillInDescription) {
    return res.status(400).json({ 
      message: 'Band ID, event ID, slot number, and description are required.' 
    });
  }

  // Validate slot number
  if (![1, 2, 3, 4].includes(parseInt(slotNumber))) {
    return res.status(400).json({ 
      message: 'Slot number must be 1, 2, 3, or 4.' 
    });
  }

  try {
    // Check if the event and band exist
    const [eventCheck] = await pool.query('SELECT * FROM event WHERE event_id = ?', [eventId]);
    const [bandCheck] = await pool.query('SELECT * FROM band WHERE band_id = ?', [bandId]);
    const [memberCheck] = await pool.query('SELECT * FROM user WHERE user_id = ?', [fillInMemberId]);

    if (eventCheck.length === 0) {
      return res.status(404).json({ message: 'Event not found.' });
    }
    if (bandCheck.length === 0) {
      return res.status(404).json({ message: 'Band not found.' });
    }
    if (memberCheck.length === 0) {
      return res.status(404).json({ message: 'Member not found.' });
    }

    // Insert the new fill-in request
    const query = `
      INSERT INTO fill_in_request 
      (band_id, event_id, slot_number, fill_in_member_id, fill_in_description, status, time_created) 
      VALUES (?, ?, ?, ?, ?, 'pending', NOW())
    `;
    
    const [result] = await pool.query(query, [
      bandId, 
      eventId, 
      slotNumber, 
      fillInMemberId, 
      fillInDescription
    ]);

    if (result.affectedRows > 0) {
      // Return the created request details
      const [newRequest] = await pool.query(`
        SELECT 
          fir.fill_in_request_id AS id,
          fir.band_id AS bandId,
          b.name AS bandName,
          fir.event_id AS eventId,
          e.event_title AS eventName,
          e.datetime AS eventDate,
          e.location AS eventVenue,
          fir.slot_number AS slotNumber,
          fir.fill_in_description AS fillInDescription,
          fir.fill_in_member_id AS fillInMemberId,
          CONCAT(om.first_name, ' ', om.last_name) AS originalMemberName,
          fir.status,
          fir.time_created AS timeCreated
        FROM fill_in_request fir
        JOIN band b ON fir.band_id = b.band_id
        JOIN event e ON fir.event_id = e.event_id
        JOIN user om ON fir.fill_in_member_id = om.user_id
        WHERE fir.fill_in_request_id = ?;
      `, [result.insertId]);
      
      if (newRequest.length > 0) {
        const createdRequest = {
          ...newRequest[0],
          eventDate: newRequest[0].eventDate ? new Date(newRequest[0].eventDate).toISOString() : null,
          timeCreated: newRequest[0].timeCreated ? new Date(newRequest[0].timeCreated).toISOString() : null,
          id: String(newRequest[0].id),
          bandId: String(newRequest[0].bandId),
          eventId: String(newRequest[0].eventId),
          fillInMemberId: String(newRequest[0].fillInMemberId),
          slotNumber: Number(newRequest[0].slotNumber)
        };
        
        res.status(201).json({ 
          message: 'Fill-in request created successfully.', 
          request: createdRequest 
        });
      } else {
        res.status(500).json({ message: 'Failed to retrieve created request details.' });
      }
    } else {
      res.status(500).json({ message: 'Failed to create fill-in request.' });
    }
  } catch (error) {
    console.error('Failed to create fill-in request:', error);
    next(error);
  }
});

export default router; 