import express from 'express';
import { pool } from '../../config/database.js';

const router = express.Router();

// GET /api/bands/:id/events - Get band's events with availability
router.get('/:id/events', async (req, res, next) => {
  const { id: bandId } = req.params;
  const { userId } = req.query; // Get userId from query params for availability

  try {
    // Get events where this band has accepted invitations (status = 'approved')
    const query = `
      SELECT
        e.event_id AS id,
        e.event_title AS eventTitle,
        e.datetime,
        e.location,
        e.description,
        e.genre,
        e.time_slot AS timeSlot,
        er.time_responded AS acceptedAt,
        u.first_name AS creatorFirstName,
        u.last_name AS creatorLastName,
        (
          SELECT r.role_name
          FROM user_roles ur
          JOIN roles r ON ur.role_id = r.role_id
          WHERE ur.user_id = u.user_id
          ORDER BY
            CASE r.role_name
              WHEN 'WXTJ Executive' THEN 1
              WHEN 'Band Leader' THEN 2
              WHEN 'Band Member' THEN 3
              WHEN 'General User' THEN 4
              ELSE 5
            END
          LIMIT 1
        ) AS creatorRole,
        CASE
          WHEN bmea.is_available IS NOT NULL THEN bmea.is_available
          ELSE NULL
        END AS myAvailability
      FROM event e
      JOIN event_request er ON e.event_id = er.event_id
      JOIN user u ON e.user_id = u.user_id
      LEFT JOIN band_member_event_availability bmea ON e.event_id = bmea.event_id
        AND bmea.band_id = ? AND bmea.user_id = ?
      WHERE er.band_id = ? AND er.status = 'approved'
      ORDER BY e.datetime ASC
    `;

    const [rows] = await pool.query(query, [bandId, userId || null, bandId]);

    const events = rows.map(row => ({
      ...row,
      id: String(row.id),
      datetime: row.datetime ? new Date(row.datetime).toISOString() : null,
      acceptedAt: row.acceptedAt ? new Date(row.acceptedAt).toISOString() : null,
      myAvailability: row.myAvailability,
      creatorName: `${row.creatorFirstName} ${row.creatorLastName}`,
      creatorRole: row.creatorRole
    }));

    res.json(events);
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

// GET /api/bands/:bandId/event-invitations - Get event invitations for a band
router.get('/:bandId/event-invitations', async (req, res, next) => {
  const { bandId } = req.params;

  try {
    const query = `
      SELECT
        er.event_request_id AS id,
        er.event_id AS eventId,
        er.band_id AS bandId,
        er.status,
        er.message,
        er.time_created AS timeCreated,
        er.time_responded AS timeResponded,
        e.event_title AS eventTitle,
        e.datetime AS eventDateTime,
        e.location AS eventLocation,
        e.genre AS eventGenre,
        e.description AS eventDescription,
        CONCAT(u.first_name, ' ', u.last_name) AS organizerName
      FROM event_request er
      JOIN event e ON er.event_id = e.event_id
      JOIN user u ON e.user_id = u.user_id
      WHERE er.band_id = ?
      ORDER BY er.time_created DESC
    `;

    const [rows] = await pool.query(query, [bandId]);

    const invitations = rows.map(row => ({
      ...row,
      id: String(row.id),
      eventId: String(row.eventId),
      bandId: String(row.bandId),
      eventDateTime: row.eventDateTime ? new Date(row.eventDateTime).toISOString() : null,
      timeCreated: row.timeCreated ? new Date(row.timeCreated).toISOString() : null,
      timeResponded: row.timeResponded ? new Date(row.timeResponded).toISOString() : null
    }));

    res.json(invitations);
  } catch (error) {
    console.error('Failed to fetch event invitations:', error);
    next(error);
  }
});

// POST /api/bands/:bandId/event-invitations/:invitationId/accept - Accept an event invitation
router.post('/:bandId/event-invitations/:invitationId/accept', async (req, res, next) => {
  const { bandId, invitationId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required.' });
  }

  try {
    // Start transaction for data consistency
    await pool.query('START TRANSACTION');

    try {
      // 1. Verify the invitation exists and is pending
      const [invitationRows] = await pool.query(
        'SELECT er.*, e.event_title FROM event_request er JOIN event e ON er.event_id = e.event_id WHERE er.event_request_id = ? AND er.band_id = ? AND er.status = "pending"',
        [invitationId, bandId]
      );

      if (invitationRows.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({ message: 'Invitation not found or already responded to.' });
      }

      const invitation = invitationRows[0];

      // 2. Verify user is a band leader for this band
      const [leaderCheck] = await pool.query(
        `SELECT bl.user_role_id FROM band_leader bl
         JOIN user_roles ur ON bl.user_role_id = ur.user_role_id
         WHERE bl.band_id = ? AND ur.user_id = ?`,
        [bandId, userId]
      );

      if (leaderCheck.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(403).json({ message: 'Only band leaders can accept invitations.' });
      }

      // 3. Update the invitation status
      await pool.query(
        'UPDATE event_request SET status = "approved", responded_by_user_id = ?, time_responded = NOW() WHERE event_request_id = ?',
        [userId, invitationId]
      );

      // 4. Assign band to the event (single band per event in new system)
      await pool.query(
        'UPDATE event SET assigned_band_id = ?, status = "filled" WHERE event_id = ?',
        [bandId, invitation.event_id]
      );

      await pool.query('COMMIT');

      res.json({
        message: 'Event invitation accepted successfully',
        eventTitle: invitation.event_title
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Failed to accept invitation:', error);
    next(error);
  }
});

// POST /api/bands/:bandId/event-invitations/:invitationId/decline - Decline an event invitation
router.post('/:bandId/event-invitations/:invitationId/decline', async (req, res, next) => {
  const { bandId, invitationId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required.' });
  }

  try {
    // 1. Verify the invitation exists and is pending
    const [invitationRows] = await pool.query(
      'SELECT er.*, e.event_title FROM event_request er JOIN event e ON er.event_id = e.event_id WHERE er.event_request_id = ? AND er.band_id = ? AND er.status = "pending"',
      [invitationId, bandId]
    );

    if (invitationRows.length === 0) {
      return res.status(404).json({ message: 'Invitation not found or already responded to.' });
    }

    const invitation = invitationRows[0];

    // 2. Verify user is a band leader for this band
    const [leaderCheck] = await pool.query(
      `SELECT bl.user_role_id FROM band_leader bl
       JOIN user_roles ur ON bl.user_role_id = ur.user_role_id
       WHERE bl.band_id = ? AND ur.user_id = ?`,
      [bandId, userId]
    );

    if (leaderCheck.length === 0) {
      return res.status(403).json({ message: 'Only band leaders can decline invitations.' });
    }

    // 3. Update the invitation status
    await pool.query(
      'UPDATE event_request SET status = "rejected", responded_by_user_id = ?, time_responded = NOW() WHERE event_request_id = ?',
      [userId, invitationId]
    );

    // 4. Remove band from event if they were previously assigned
    await pool.query(
      'UPDATE event SET assigned_band_id = NULL, status = "open" WHERE event_id = ? AND assigned_band_id = ?',
      [invitation.event_id, bandId]
    );

    res.json({
      message: 'Event invitation declined',
      eventTitle: invitation.event_title
    });
  } catch (error) {
    console.error('Failed to decline invitation:', error);
    next(error);
  }
});

export default router;
