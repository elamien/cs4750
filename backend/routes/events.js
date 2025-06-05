import express from 'express';
import { pool } from '../config/database.js';

const router = express.Router();

// GET /api/events - Fetch all events
router.get('/', async (req, res, next) => {
  try {
    const query = `
      SELECT 
        e.event_id AS id,
        e.user_id AS userId,
        e.event_title AS eventTitle,
        e.datetime,
        e.location,
        e.genre,
        e.status,
        e.description,
        e.slot_one AS slotOne,
        e.slot_two AS slotTwo,
        e.slot_three AS slotThree,
        e.slot_four AS slotFour,
        u.first_name AS creatorFirstName,
        u.last_name AS creatorLastName,
        r.role_name AS creatorRole
      FROM event e
      JOIN user u ON e.user_id = u.user_id
      JOIN user_roles ur ON u.user_id = ur.user_id
      JOIN roles r ON ur.role_id = r.role_id
      ORDER BY e.datetime DESC;
    `;
    const [rows] = await pool.query(query);

    const eventsWithFavorites = rows.map(event => ({
      ...event,
      id: String(event.id),
      userId: String(event.userId),
      datetime: event.datetime ? new Date(event.datetime).toISOString() : null,
      creatorName: `${event.creatorFirstName} ${event.creatorLastName}`,
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
    // Convert ISO datetime to MySQL format (YYYY-MM-DD HH:MM:SS)
    const mysqlDatetime = new Date(datetime).toISOString().slice(0, 19).replace('T', ' ');
    
    const query = `
      INSERT INTO event (user_id, event_title, datetime, location, genre, status, description, slot_one, slot_two, slot_three, slot_four)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      userId,
      eventTitle,
      mysqlDatetime,
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

// NOTE: Bands can no longer apply to events. Event organizers invite bands instead.
// The event_request table is now used for invitations FROM event organizers TO bands.

export default router; 