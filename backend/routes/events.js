import express from 'express';
import { pool } from '../config/database.js';

const router = express.Router();

// GET /api/events - Fetch all events
router.get('/', async (req, res, next) => {
  try {
    const query = `
      SELECT 
        event_id AS id,
        user_id AS userId,
        event_title AS eventTitle,
        datetime,
        location,
        genre,
        status,
        description,
        slot_one AS slotOne,
        slot_two AS slotTwo,
        slot_three AS slotThree,
        slot_four AS slotFour
      FROM event
      ORDER BY datetime DESC;
    `;
    const [rows] = await pool.query(query);

    const eventsWithFavorites = rows.map(event => ({
      ...event,
      id: String(event.id),
      userId: String(event.userId),
      datetime: event.datetime ? new Date(event.datetime).toISOString() : null,
      isFavorite: false // Placeholder
    }));

    res.json(eventsWithFavorites);
  } catch (error) {
    console.error('Failed to fetch events:', error);
    next(error);
  }
});

// POST /api/events - Create a new event
router.post('/', async (req, res, next) => {
  const {
    userId,
    eventTitle,
    datetime,
    location,
    genre,
    description,
    status = 'open',
    slotOne, slotTwo, slotThree, slotFour
  } = req.body;

  if (!userId || !eventTitle || !datetime) {
    return res.status(400).json({ message: 'User ID, Event Title, and Datetime are required.' });
  }

  try {
    const query = `
      INSERT INTO event (user_id, event_title, datetime, location, genre, status, description, slot_one, slot_two, slot_three, slot_four)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      userId,
      eventTitle,
      datetime,
      location || null,
      genre || null,
      status,
      description || null,
      slotOne || null,
      slotTwo || null,
      slotThree || null,
      slotFour || null
    ];
    
    const [result] = await pool.query(query, params);
    const newEventId = result.insertId;

    // Fetch the newly created event to return it in the response
    const [newEventRows] = await pool.query('SELECT event_id AS id, user_id AS userId, event_title AS eventTitle, datetime, location, genre, status, description, slot_one AS slotOne, slot_two AS slotTwo, slot_three AS slotThree, slot_four AS slotFour FROM event WHERE event_id = ?', [newEventId]);
    
    if (newEventRows.length > 0) {
        const newEvent = {
            ...newEventRows[0],
            id: String(newEventRows[0].id),
            userId: String(newEventRows[0].userId),
            datetime: newEventRows[0].datetime ? new Date(newEventRows[0].datetime).toISOString() : null
        };
      res.status(201).json(newEvent);
    } else {
      res.status(500).json({ message: 'Failed to retrieve created event, but insert may have succeeded.' });
    }

  } catch (error) {
    console.error('Failed to create event:', error);
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ message: 'Invalid User ID for event creation.' });
    }
    next(error);
  }
});

// POST /api/events/requests - Submit request for band to play at an event
router.post('/requests', async (req, res, next) => {
  const { bandId, eventId, message, requestingUserId } = req.body;

  if (!bandId || !eventId || !requestingUserId) {
    return res.status(400).json({ message: 'Band ID, Event ID, and Requesting User ID are required.' });
  }

  try {
    // Check if the event is still 'open' or accepting requests
    const [eventRows] = await pool.query('SELECT status FROM event WHERE event_id = ?', [eventId]);
    if (eventRows.length === 0 || eventRows[0].status !== 'open') {
        return res.status(400).json({ message: 'Event not found or no longer accepting requests.' });
    }

    // Check if this band has already requested to play this event
    const [existingRequests] = await pool.query(
      'SELECT event_request_id FROM event_request WHERE band_id = ? AND event_id = ? AND status = \'pending\'',
      [bandId, eventId]
    );
    if (existingRequests.length > 0) {
        return res.status(409).json({ message: 'Your band has already sent a pending request for this event.'});
    }

    const query = `
      INSERT INTO event_request (band_id, event_id, message)
      VALUES (?, ?, ?)
    `;

    const [result] = await pool.query(query, [bandId, eventId, message || null]);

    res.status(201).json({ 
        message: 'Event request submitted successfully.', 
        eventRequestId: result.insertId 
    });
  } catch (error) {
    console.error('Failed to submit event request:', error);
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(404).json({ message: 'Band, Event, or Requesting User not found.'});
    }
    next(error);
  }
});

export default router; 