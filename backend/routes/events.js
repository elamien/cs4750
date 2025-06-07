import express from 'express';
import { pool } from '../config/database.js';
import { Filter } from 'bad-words';

const router = express.Router();
const filter = new Filter();

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
  let { userId, eventTitle, eventDate, timeSlot, location, genre, description, isOpenCall } = req.body;

  // Clean profanity from inputs
  eventTitle = filter.clean(eventTitle || '');
  location = filter.clean(location || '');
  description = filter.clean(description || '');

  // Validation
  if (!userId || !eventTitle || !eventDate || !timeSlot) {
    return res.status(400).json({ 
      message: 'User ID, event title, date, and time slot are required.' 
    });
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
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'This time slot is already taken for the selected date. Please choose a different slot.' });
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ message: 'Invalid User ID for event creation.' });
    }
    next(error);
  }
});

// GET /api/events/available-slots/:date - Check available slots for a specific date
router.get('/available-slots/:date', async (req, res, next) => {
  const { date } = req.params;
  
  try {
    // Get occupied slots for the given date
    const query = `
      SELECT time_slot 
      FROM event 
      WHERE event_date = ?
      ORDER BY time_slot
    `;
    const [rows] = await pool.query(query, [date]);
    
    const occupiedSlots = rows.map(row => row.time_slot);
    const allSlots = [1, 2, 3, 4];
    const availableSlots = allSlots.filter(slot => !occupiedSlots.includes(slot));
    
    // Slot information
    const slotInfo = {
      1: { label: 'Slot 1 (8:00 AM - 9:00 AM)', time: '8:00 AM' },
      2: { label: 'Slot 2 (9:00 AM - 10:00 AM)', time: '9:00 AM' },
      3: { label: 'Slot 3 (10:00 AM - 11:00 AM)', time: '10:00 AM' },
      4: { label: 'Slot 4 (11:00 AM - 12:00 PM)', time: '11:00 AM' }
    };
    
    const availableSlotsWithInfo = availableSlots.map(slot => ({
      value: slot,
      label: slotInfo[slot].label,
      time: slotInfo[slot].time
    }));
    
    res.json({
      date,
      availableSlots: availableSlotsWithInfo,
      occupiedSlots,
      totalAvailable: availableSlots.length
    });
    
  } catch (error) {
    console.error('Failed to fetch available slots:', error);
    next(error);
  }
});

// GET /api/events/available-dates - Get dates that have at least one available slot
router.get('/available-dates', async (req, res, next) => {
  try {
    // Get dates from today onwards that have less than 4 events
    const query = `
      SELECT 
        DATE(CURDATE() + INTERVAL n.num DAY) as check_date,
        COUNT(e.event_id) as occupied_slots
      FROM (
        SELECT 0 as num UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 
        UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9
        UNION SELECT 10 UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14
        UNION SELECT 15 UNION SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19
        UNION SELECT 20 UNION SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24
        UNION SELECT 25 UNION SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29
        UNION SELECT 30 UNION SELECT 31 UNION SELECT 32 UNION SELECT 33 UNION SELECT 34
        UNION SELECT 35 UNION SELECT 36 UNION SELECT 37 UNION SELECT 38 UNION SELECT 39
        UNION SELECT 40 UNION SELECT 41 UNION SELECT 42 UNION SELECT 43 UNION SELECT 44
        UNION SELECT 45 UNION SELECT 46 UNION SELECT 47 UNION SELECT 48 UNION SELECT 49
        UNION SELECT 50 UNION SELECT 51 UNION SELECT 52 UNION SELECT 53 UNION SELECT 54
        UNION SELECT 55 UNION SELECT 56 UNION SELECT 57 UNION SELECT 58 UNION SELECT 59
      ) n
      LEFT JOIN event e ON DATE(CURDATE() + INTERVAL n.num DAY) = e.event_date
      GROUP BY check_date
      HAVING occupied_slots < 4
      ORDER BY check_date
    `;
    
    const [rows] = await pool.query(query);
    
    const availableDates = rows.map(row => ({
      date: row.check_date,
      occupiedSlots: row.occupied_slots,
      availableSlots: 4 - row.occupied_slots
    }));
    
    res.json(availableDates);
    
  } catch (error) {
    console.error('Failed to fetch available dates:', error);
    next(error);
  }
});

// NOTE: Bands can no longer apply to events. Event organizers invite bands instead.
// The event_request table is now used for invitations FROM event organizers TO bands.

// PUT /api/events/:id - Update an event (only by creator)
router.put('/:id', async (req, res, next) => {
  const { id: eventId } = req.params;
  let { userId, eventTitle, eventDate, timeSlot, location, genre, description, isOpenCall } = req.body;

  // Clean profanity from inputs
  eventTitle = filter.clean(eventTitle || '');
  location = filter.clean(location || '');
  description = filter.clean(description || '');

  if (!userId || !eventTitle || !eventDate || !timeSlot) {
    return res.status(400).json({ 
      message: 'User ID, event title, date, and time slot are required.' 
    });
  }

  if (![1, 2, 3, 4].includes(timeSlot)) {
    return res.status(400).json({ message: 'Time Slot must be 1, 2, 3, or 4.' });
  }

  try {
    // First check if the event exists and user is the creator
    const [eventCheck] = await pool.query(
      'SELECT user_id, event_date, time_slot FROM event WHERE event_id = ?',
      [eventId]
    );

    if (eventCheck.length === 0) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (eventCheck[0].user_id !== parseInt(userId)) {
      return res.status(403).json({ message: 'You can only edit your own events.' });
    }

    // Check if the new date/time slot combination is available (if changed)
    const currentEvent = eventCheck[0];
    const isChangingDateTime = 
      currentEvent.event_date !== eventDate || 
      currentEvent.time_slot !== timeSlot;

    if (isChangingDateTime) {
      const [conflictCheck] = await pool.query(
        'SELECT event_id FROM event WHERE event_date = ? AND time_slot = ? AND event_id != ?',
        [eventDate, timeSlot, eventId]
      );

      if (conflictCheck.length > 0) {
        return res.status(409).json({ 
          message: 'This time slot is already taken for the selected date. Please choose a different slot.' 
        });
      }
    }

    // Create datetime for the specific time slot
    const timeSlotMapping = {
      1: '08:00:00',
      2: '09:00:00', 
      3: '10:00:00',
      4: '11:00:00'
    };
    
    const datetime = `${eventDate} ${timeSlotMapping[timeSlot]}`;

    // Update the event
    const query = `
      UPDATE event 
      SET event_title = ?, event_date = ?, time_slot = ?, datetime = ?, 
          location = ?, genre = ?, description = ?
      WHERE event_id = ?
    `;
    
    await pool.query(query, [
      eventTitle,
      eventDate, 
      timeSlot,
      datetime,
      location || null,
      genre || null,
      description || null,
      eventId
    ]);

    // Return the updated event
    const [updatedEvent] = await pool.query(
      `SELECT event_id AS id, user_id AS userId, event_title AS eventTitle, 
       event_date AS eventDate, time_slot AS timeSlot, datetime, location, 
       genre, status, description, assigned_band_id AS assignedBandId 
       FROM event WHERE event_id = ?`,
      [eventId]
    );

    const event = {
      ...updatedEvent[0],
      id: String(updatedEvent[0].id),
      userId: String(updatedEvent[0].userId),
      datetime: updatedEvent[0].datetime ? new Date(updatedEvent[0].datetime).toISOString() : null
    };

    res.json(event);
  } catch (error) {
    console.error('Failed to update event:', error);
    next(error);
  }
});

// DELETE /api/events/:id - Delete an event (only by creator)
router.delete('/:id', async (req, res, next) => {
  const { id: eventId } = req.params;
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required.' });
  }

  try {
    // Check if the event exists and user is the creator
    const [eventCheck] = await pool.query(
      'SELECT user_id, event_title FROM event WHERE event_id = ?',
      [eventId]
    );

    if (eventCheck.length === 0) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (eventCheck[0].user_id !== parseInt(userId)) {
      return res.status(403).json({ message: 'You can only delete your own events.' });
    }

    // Delete the event (CASCADE will handle related records)
    await pool.query('DELETE FROM event WHERE event_id = ?', [eventId]);

    res.json({ 
      message: 'Event deleted successfully.',
      deletedEventId: eventId,
      eventTitle: eventCheck[0].event_title
    });
  } catch (error) {
    console.error('Failed to delete event:', error);
    next(error);
  }
});

// GET /api/events/:id/available-bands - Get available bands for an event
router.get('/:id/available-bands', async (req, res, next) => {
  const { id: eventId } = req.params;
  
  try {
    // First verify the event exists
    const [eventCheck] = await pool.query(
      'SELECT event_date, time_slot FROM event WHERE event_id = ?',
      [eventId]
    );

    if (eventCheck.length === 0) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const { event_date, time_slot } = eventCheck[0];

    // Get all bands that are NOT already assigned to an event on the same date/time
    const query = `
      SELECT 
        b.band_id AS id,
        b.name,
        b.genre,
        b.description,
        b.total_events_played,
        COUNT(bm.user_role_id) + COUNT(bl.user_role_id) AS memberCount
      FROM band b
      LEFT JOIN band_member bm ON b.band_id = bm.band_id
      LEFT JOIN band_leader bl ON b.band_id = bl.band_id
      WHERE b.band_id NOT IN (
        SELECT DISTINCT assigned_band_id 
        FROM event 
        WHERE event_date = ? AND assigned_band_id IS NOT NULL
      )
      AND b.band_id NOT IN (
        SELECT DISTINCT er.band_id
        FROM event_request er
        JOIN event e ON er.event_id = e.event_id
        WHERE e.event_date = ? AND er.status = 'pending'
      )
      GROUP BY b.band_id, b.name, b.genre, b.description, b.total_events_played
      ORDER BY b.name ASC
    `;

    const [rows] = await pool.query(query, [event_date, event_date]);
    
    const availableBands = rows.map(band => ({
      ...band,
      id: String(band.id),
      memberCount: parseInt(band.memberCount) || 0
    }));

    res.json(availableBands);
  } catch (error) {
    console.error('Failed to fetch available bands:', error);
    next(error);
  }
});

// POST /api/events/:id/invite-band - Invite a band to play at an event
router.post('/:id/invite-band', async (req, res, next) => {
  const { id: eventId } = req.params;
  const { userId, bandId, message } = req.body;

  if (!userId || !bandId) {
    return res.status(400).json({ message: 'User ID and Band ID are required.' });
  }

  try {
    // Verify the event exists and user is the creator
    const [eventCheck] = await pool.query(
      'SELECT user_id, event_title, status FROM event WHERE event_id = ?',
      [eventId]
    );

    if (eventCheck.length === 0) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (eventCheck[0].user_id !== parseInt(userId)) {
      return res.status(403).json({ message: 'You can only invite bands to your own events.' });
    }

    if (eventCheck[0].status === 'filled') {
      return res.status(400).json({ message: 'This event already has a band assigned.' });
    }

    // Verify the band exists
    const [bandCheck] = await pool.query(
      'SELECT name FROM band WHERE band_id = ?',
      [bandId]
    );

    if (bandCheck.length === 0) {
      return res.status(404).json({ message: 'Band not found.' });
    }

    // Check if there's already a pending invitation for this band/event
    const [existingInvitation] = await pool.query(
      'SELECT status FROM event_request WHERE event_id = ? AND band_id = ?',
      [eventId, bandId]
    );

    if (existingInvitation.length > 0) {
      const status = existingInvitation[0].status;
      if (status === 'pending') {
        return res.status(409).json({ message: 'An invitation to this band is already pending.' });
      } else if (status === 'approved') {
        return res.status(409).json({ message: 'This band has already accepted an invitation to this event.' });
      }
      // If previously rejected, we can send a new invitation
    }

    // Create the invitation
    const inviteQuery = `
      INSERT INTO event_request (event_id, band_id, status, message, time_created)
      VALUES (?, ?, 'pending', ?, NOW())
    `;
    
    await pool.query(inviteQuery, [eventId, bandId, message || null]);

    res.status(201).json({ 
      message: `Invitation sent to ${bandCheck[0].name}`,
      eventTitle: eventCheck[0].event_title,
      bandName: bandCheck[0].name
    });
  } catch (error) {
    console.error('Failed to invite band:', error);
    next(error);
  }
});

export default router; 