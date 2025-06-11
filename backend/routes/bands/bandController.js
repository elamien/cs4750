import express from 'express';
import { pool } from '../../config/database.js';
import { Filter } from 'bad-words';

const router = express.Router();
const filter = new Filter();

// GET /api/bands - Fetch all bands with member counts for join view (with optional search)
router.get('/', async (req, res, next) => {
  const { search, userId } = req.query;

  try {
    let query;
    let params = [];

    if (userId) {
      // Query with favorite status check for authenticated user
      query = `
        SELECT
          b.band_id AS id,
          b.name,
          b.genre,
          b.description,
          NULL AS location,
          COUNT(bm.user_role_id) AS memberCount,
          CONCAT(leader.first_name, ' ', leader.last_name) AS bandLeaderName,
          CASE WHEN ufb.user_id IS NOT NULL THEN 1 ELSE 0 END AS isFavorite
        FROM band b
        LEFT JOIN band_member bm ON b.band_id = bm.band_id
        LEFT JOIN band_leader bl ON b.band_id = bl.band_id
        LEFT JOIN user_roles ur ON bl.user_role_id = ur.user_role_id
        LEFT JOIN user leader ON ur.user_id = leader.user_id
        LEFT JOIN user_favorites_bands ufb ON b.band_id = ufb.band_id AND ufb.user_id = ?
      `;
      params.push(userId);
    } else {
      // Query without favorite status for anonymous users
      query = `
        SELECT
          b.band_id AS id,
          b.name,
          b.genre,
          b.description,
          NULL AS location,
          COUNT(bm.user_role_id) AS memberCount,
          CONCAT(leader.first_name, ' ', leader.last_name) AS bandLeaderName,
          0 AS isFavorite
        FROM band b
        LEFT JOIN band_member bm ON b.band_id = bm.band_id
        LEFT JOIN band_leader bl ON b.band_id = bl.band_id
        LEFT JOIN user_roles ur ON bl.user_role_id = ur.user_role_id
        LEFT JOIN user leader ON ur.user_id = leader.user_id
      `;
    }

    if (search) {
      query += ` WHERE b.name LIKE ?`;
      params.push(`%${search}%`);
    }

    query += `
      GROUP BY b.band_id, b.name, b.genre, b.description, leader.first_name, leader.last_name${userId ? ', ufb.user_id' : ''}
      ORDER BY b.name;
    `;

    const [rows] = await pool.query(query, params);

    const bands = rows.map(band => ({
      ...band,
      id: String(band.id),
      memberCount: parseInt(band.memberCount) || 0,
      bandLeaderName: band.bandLeaderName,
      needs: [], // TODO: Could add a band_looking_for table if needed
      isFavorite: Boolean(band.isFavorite)
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
  let { name, genre, description } = req.body;

  // Clean profanity from inputs
  name = filter.clean(name || '');
  description = filter.clean(description || '');

  if (!name) {
    return res.status(400).json({ message: 'Band name is required.' });
  }

  if (description && description.length > 255) {
    return res.status(400).json({ message: 'Description must be 255 characters or less.' });
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
      `SELECT band_id AS id, name, genre, description FROM band WHERE band_id = ?`,
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
  let { name, genre, description, location, creatorUserId } = req.body;

  if (!name || !genre || !creatorUserId) {
    return res.status(400).json({ message: 'Band name, genre, and creator user ID are required.' });
  }

  // Clean profanity from inputs
  name = filter.clean(name || '');
  description = filter.clean(description || '');

  if (description && description.length > 255) {
    return res.status(400).json({ message: 'Description must be 255 characters or less.' });
  }

  const connection = await pool.getConnection();
  try {
    // Start transaction for data consistency
    await connection.query('START TRANSACTION');

    try {
      // Insert new band
      const [bandResult] = await connection.query(
        `INSERT INTO band (name, genre, description) VALUES (?, ?, ?)`,
        [name, genre || null, description || null]
      );

      const bandId = bandResult.insertId;

      // ADDITIVE ROLE SYSTEM: Create a new Band Leader role instance for this specific band
      const [roleResult] = await connection.query(
        'INSERT INTO user_roles (user_id, role_id, role_context_type, role_context_id) VALUES (?, 1, ?, ?)',
        [creatorUserId, 'band', bandId]
      );
      const bandLeaderRoleId = roleResult.insertId;

      // Add to band_leader table
      await connection.query(
        'INSERT INTO band_leader (user_role_id, band_id) VALUES (?, ?)',
        [bandLeaderRoleId, bandId]
      );

      // Get updated user info to return (with all roles)
      const [userInfo] = await connection.query(
        `SELECT u.user_id AS userId, u.first_name AS firstName, u.last_name AS lastName,
                u.email, u.instrument, u.genre, u.bio,
                GROUP_CONCAT(r.role_name ORDER BY r.role_name) AS roles
         FROM user u
         JOIN user_roles ur ON u.user_id = ur.user_id
         JOIN roles r ON ur.role_id = r.role_id
         WHERE u.user_id = ?
         GROUP BY u.user_id`,
        [creatorUserId]
      );

      await connection.query('COMMIT');

      const createdBand = {
        id: String(bandId),
        name,
        genre: genre || null,
        description: description || null,
        location: null
      };

      res.status(201).json({
        band: createdBand,
        updatedUser: userInfo[0] || null
      });
    } catch (error) {
      await connection.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Failed to create band:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error SQL:', error.sql);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'Duplicate entry error',
        error: error.message,
        sql: error.sql,
        code: error.code
      });
    }
    res.status(500).json({ message: 'Failed to create band', error: error.message, code: error.code });
  } finally {
    connection.release();
  }
});

export default router;
