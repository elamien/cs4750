import express from 'express';
import { pool } from '../config/database.js';

const router = express.Router();

// GET /api/events - Fetch all events with new time slot structure
router.get('/', async (req, res, next) => {
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
        u.first_name AS creatorFirstName,
        u.last_name AS creatorLastName,
        r.role_name AS creatorRole
      FROM event e
      JOIN user u ON e.user_id = u.user_id
      JOIN user_roles ur ON u.user_id = ur.user_id
      JOIN roles r ON ur.role_id = r.role_id
      LEFT JOIN band b ON e.assigned_band_id = b.band_id
      ORDER BY e.event_date DESC, e.time_slot ASC;
    `;
    const [rows] = await pool.query(query);

        const eventsWithFavorites = rows.map(event => ({
      id: String(event.id),
      userId: String(event.userId),
      eventTitle: event.eventTitle,
      eventDate: event.eventDate,
      timeSlot: event.timeSlot,
      datetime: event.datetime ? new Date(event.datetime).toISOString() : null,
      location: event.location,
      eventLocation: event.location,
      genre: event.genre,
      status: event.status,
      description: event.description,
      eventDescription: event.description,
      assignedBandId: event.assignedBandId,
      bandName: event.bandName,
      creatorFirstName: event.creatorFirstName,
      creatorLastName: event.creatorLastName,
      creatorRole: event.creatorRole,
      creatorName: `${event.creatorFirstName} ${event.creatorLastName}`,
      isFavorite: false
    }));

    res.json(eventsWithFavorites);
  } catch (error) {
    console.error('Failed to fetch events:', error);
    next(error);
  }
});

// POST /api/events - Create a new event with time slot system
router.post('/', async (req, res, next) => {
  const {
    userId,
    eventTitle,
    eventDate,
    timeSlot,
    location,
    genre,
    description,
    status = 'open'
  } = req.body;

  if (!userId || !eventTitle || !eventDate || !timeSlot) {
    return res.status(400).json({ message: 'User ID, Event Title, Event Date, and Time Slot are required.' });
  }

  if (![1, 2, 3, 4].includes(timeSlot)) {
    return res.status(400).json({ message: 'Time Slot must be 1, 2, 3, or 4.' });
  }

  try {
    // Create datetime for the specific time slot
    const timeSlotMapping = {
      1: '08:00:00',
      2: '09:00:00', 
      3: '10:00:00',
      4: '11:00:00'
    };
    
    const datetime = `${eventDate} ${timeSlotMapping[timeSlot]}`;
    
    const query = `
      INSERT INTO event (user_id, event_title, event_date, time_slot, datetime, location, genre, status, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      userId,
      eventTitle,
      eventDate,
      timeSlot,
      datetime,
      location || null,
      genre || null,
      status,
      description || null
    ];
    
    const [result] = await pool.query(query, params);
    const newEventId = result.insertId;

    // Fetch the newly created event to return it in the response
    const [newEventRows] = await pool.query('SELECT event_id AS id, user_id AS userId, event_title AS eventTitle, event_date AS eventDate, time_slot AS timeSlot, datetime, location, genre, status, description, assigned_band_id AS assignedBandId FROM event WHERE event_id = ?', [newEventId]);
    
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