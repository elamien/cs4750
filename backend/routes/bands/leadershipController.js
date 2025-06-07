import express from 'express';
import { pool } from '../../config/database.js';

const router = express.Router();

// GET /api/bands/:id/eligible-leaders - Get members eligible to be promoted to leader
router.get('/:id/eligible-leaders', async (req, res, next) => {
  const { id: bandId } = req.params;
  const { currentUserId } = req.query;
  
  if (!currentUserId) {
    return res.status(400).json({ message: 'Current user ID is required.' });
  }
  
  try {
    // Get all band members except the current user
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
      WHERE bm.band_id = ? AND u.user_id != ?
      ORDER BY u.first_name
    `;
    
    const [members] = await pool.query(memberQuery, [bandId, currentUserId]);
    
    const eligibleMembers = members.map(member => ({
      ...member,
      id: String(member.id)
    }));
    
    res.json(eligibleMembers);
  } catch (error) {
    console.error('Failed to fetch eligible leaders:', error);
    next(error);
  }
});

// POST /api/bands/:id/promote-leader - Promote a member to band leader
router.post('/:id/promote-leader', async (req, res, next) => {
  const { id: bandId } = req.params;
  const { currentUserId, newLeaderId } = req.body;
  
  if (!currentUserId || !newLeaderId) {
    return res.status(400).json({ message: 'Current user ID and new leader ID are required.' });
  }
  
  try {
    // Start transaction for data consistency
    await pool.query('START TRANSACTION');
    
    try {
      // 1. Verify current user is a band leader
      const [currentLeaderCheck] = await pool.query(
        `SELECT bl.user_role_id FROM band_leader bl 
         JOIN user_roles ur ON bl.user_role_id = ur.user_role_id 
         WHERE bl.band_id = ? AND ur.user_id = ?`,
        [bandId, currentUserId]
      );
      
      if (currentLeaderCheck.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(403).json({ message: 'Only band leaders can promote new leaders.' });
      }
      
      const currentLeaderUserRoleId = currentLeaderCheck[0].user_role_id;
      
      // 2. Verify new leader is a band member
      const [newLeaderCheck] = await pool.query(
        `SELECT bm.user_role_id FROM band_member bm 
         JOIN user_roles ur ON bm.user_role_id = ur.user_role_id 
         WHERE bm.band_id = ? AND ur.user_id = ?`,
        [bandId, newLeaderId]
      );
      
      if (newLeaderCheck.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({ message: 'New leader must be a current band member.' });
      }
      
      const newLeaderUserRoleId = newLeaderCheck[0].user_role_id;
      
      // 3. Remove new leader from band_member table
      await pool.query(
        'DELETE FROM band_member WHERE user_role_id = ? AND band_id = ?',
        [newLeaderUserRoleId, bandId]
      );
      
      // 4. Update their role to Band Leader (role_id = 1)
      await pool.query(
        'UPDATE user_roles SET role_id = 1 WHERE user_role_id = ?',
        [newLeaderUserRoleId]
      );
      
      // 5. Add them to band_leader table
      await pool.query(
        'INSERT INTO band_leader (user_role_id, band_id) VALUES (?, ?)',
        [newLeaderUserRoleId, bandId]
      );
      
      // 6. Remove current leader from band_leader table
      await pool.query(
        'DELETE FROM band_leader WHERE user_role_id = ? AND band_id = ?',
        [currentLeaderUserRoleId, bandId]
      );
      
      // 7. Demote current leader to Band Member (role_id = 2)
      await pool.query(
        'UPDATE user_roles SET role_id = 2 WHERE user_role_id = ?',
        [currentLeaderUserRoleId]
      );
      
      // 8. Add current leader to band_member table
      await pool.query(
        'INSERT INTO band_member (user_role_id, band_id) VALUES (?, ?)',
        [currentLeaderUserRoleId, bandId]
      );
      
      await pool.query('COMMIT');
      
      // Get updated user data for both users to return to frontend
      const [promotedUserData] = await pool.query(
        `SELECT u.user_id, u.first_name, u.last_name, u.email, r.role_name
         FROM user u 
         JOIN user_roles ur ON u.user_id = ur.user_id 
         JOIN roles r ON ur.role_id = r.role_id 
         WHERE u.user_id = ?`,
        [newLeaderId]
      );
      
      const [demotedUserData] = await pool.query(
        `SELECT u.user_id, u.first_name, u.last_name, u.email, r.role_name
         FROM user u 
         JOIN user_roles ur ON u.user_id = ur.user_id 
         JOIN roles r ON ur.role_id = r.role_id 
         WHERE u.user_id = ?`,
        [currentUserId]
      );
      
      // Map database role names to frontend role names
      const roleMapping = {
        'Band Leader': 'band_leader',
        'Band Member': 'band_member', 
        'General User': 'general',
        'WXTJ Executive': 'exec'
      };
      
      res.json({ 
        message: 'Leader promoted successfully',
        updatedUsers: {
          promoted: promotedUserData.length > 0 ? {
            userId: promotedUserData[0].user_id,
            firstName: promotedUserData[0].first_name,
            lastName: promotedUserData[0].last_name,
            email: promotedUserData[0].email,
            role: roleMapping[promotedUserData[0].role_name] || 'general'
          } : null,
          demoted: demotedUserData.length > 0 ? {
            userId: demotedUserData[0].user_id,
            firstName: demotedUserData[0].first_name,
            lastName: demotedUserData[0].last_name,
            email: demotedUserData[0].email,
            role: roleMapping[demotedUserData[0].role_name] || 'general'
          } : null
        }
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Failed to promote leader:', error);
    next(error);
  }
});

// POST /api/bands/:bandId/members/:memberId/remove - Remove a band member
router.post('/:bandId/members/:memberId/remove', async (req, res, next) => {
  const { bandId, memberId } = req.params;
  const { currentUserId } = req.body;
  
  if (!currentUserId) {
    return res.status(400).json({ message: 'Current user ID is required.' });
  }
  
  try {
    // Start transaction for data consistency
    await pool.query('START TRANSACTION');
    
    try {
      // 1. Verify current user is a band leader for this band
      const [leaderCheck] = await pool.query(
        `SELECT bl.user_role_id FROM band_leader bl 
         JOIN user_roles ur ON bl.user_role_id = ur.user_role_id 
         WHERE bl.band_id = ? AND ur.user_id = ?`,
        [bandId, currentUserId]
      );
      
      if (leaderCheck.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(403).json({ message: 'Only band leaders can remove members.' });
      }
      
      // 2. Verify target user is a band member (not leader) 
      const [memberCheck] = await pool.query(
        `SELECT bm.user_role_id FROM band_member bm 
         JOIN user_roles ur ON bm.user_role_id = ur.user_role_id 
         WHERE bm.band_id = ? AND ur.user_id = ?`,
        [bandId, memberId]
      );
      
      if (memberCheck.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({ message: 'User is not a member of this band or is a band leader.' });
      }
      
      // 3. Prevent leader from removing themselves (they should use leave band instead)
      if (currentUserId === memberId) {
        await pool.query('ROLLBACK');
        return res.status(400).json({ message: 'Band leaders cannot remove themselves. Use leave band instead.' });
      }
      
      const memberUserRoleId = memberCheck[0].user_role_id;
      
      // 4. Remove member from band_member table
      await pool.query(
        'DELETE FROM band_member WHERE user_role_id = ? AND band_id = ?',
        [memberUserRoleId, bandId]
      );
      
      // 5. Update user role back to General User (role_id = 3)
      await pool.query(
        'UPDATE user_roles SET role_id = 3 WHERE user_role_id = ?',
        [memberUserRoleId]
      );
      
      await pool.query('COMMIT');
      
      // Get member details for response
      const [memberData] = await pool.query(
        `SELECT u.user_id, u.first_name, u.last_name, u.email, r.role_name
         FROM user u 
         JOIN user_roles ur ON u.user_id = ur.user_id 
         JOIN roles r ON ur.role_id = r.role_id 
         WHERE u.user_id = ?`,
        [memberId]
      );
      
      res.json({ 
        message: 'Member removed successfully',
        removedMember: memberData.length > 0 ? {
          userId: memberData[0].user_id,
          firstName: memberData[0].first_name,
          lastName: memberData[0].last_name,
          email: memberData[0].email,
          role: 'general' // They're now a general user
        } : null
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Failed to remove member:', error);
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
    // Start transaction for data consistency
    await pool.query('START TRANSACTION');
    
    try {
      // 1. Check if user is a band leader
      const [leaderCheck] = await pool.query(
        `SELECT bl.user_role_id FROM band_leader bl 
         JOIN user_roles ur ON bl.user_role_id = ur.user_role_id 
         WHERE bl.band_id = ? AND ur.user_id = ?`,
        [bandId, userId]
      );
      
      const isLeader = leaderCheck.length > 0;
      
      if (isLeader) {
        // 2. Count other band members (excluding this leader)
        const [memberCount] = await pool.query(
          `SELECT COUNT(*) as count FROM band_member bm 
           JOIN user_roles ur ON bm.user_role_id = ur.user_role_id 
           WHERE bm.band_id = ? AND ur.user_id != ?`,
          [bandId, userId]
        );
        
        if (memberCount[0].count > 0) {
          // There are other members - leader must promote someone first
          await pool.query('ROLLBACK');
          return res.status(400).json({ 
            message: 'As the band leader, you must promote another member to leader before leaving the band.',
            requiresLeaderPromotion: true
          });
        }
        
        // 3. Leader leaving and no other members - remove from band_leader table
        const userRoleId = leaderCheck[0].user_role_id;
        await pool.query(
          'DELETE FROM band_leader WHERE user_role_id = ? AND band_id = ?',
          [userRoleId, bandId]
        );
        
        // 4. Update user role back to General User (role_id = 3)
        await pool.query(
          'UPDATE user_roles SET role_id = 3 WHERE user_role_id = ?',
          [userRoleId]
        );
        
        // 5. Delete the band since it has no members left
        await pool.query(
          'DELETE FROM band WHERE band_id = ?',
          [bandId]
        );
        
      } else {
        // 6. Check if user is a band member
        const [memberCheck] = await pool.query(
          `SELECT bm.user_role_id FROM band_member bm 
           JOIN user_roles ur ON bm.user_role_id = ur.user_role_id 
           WHERE bm.band_id = ? AND ur.user_id = ?`,
          [bandId, userId]
        );
        
        if (memberCheck.length === 0) {
          await pool.query('ROLLBACK');
          return res.status(404).json({ message: 'User is not a member of this band.' });
        }
        
        // 7. Remove from band_member table
        const userRoleId = memberCheck[0].user_role_id;
        await pool.query(
          'DELETE FROM band_member WHERE user_role_id = ? AND band_id = ?',
          [userRoleId, bandId]
        );
        
        // 8. Update user role back to General User (role_id = 3)
        await pool.query(
          'UPDATE user_roles SET role_id = 3 WHERE user_role_id = ?',
          [userRoleId]
        );
      }
      
      await pool.query('COMMIT');
      
      // Get updated user data to return to frontend
      const [updatedUserData] = await pool.query(
        `SELECT u.user_id, u.first_name, u.last_name, u.email, r.role_name
         FROM user u 
         JOIN user_roles ur ON u.user_id = ur.user_id 
         JOIN roles r ON ur.role_id = r.role_id 
         WHERE u.user_id = ?`,
        [userId]
      );
      
      // Map database role names to frontend role names
      const roleMapping = {
        'Band Leader': 'band_leader',
        'Band Member': 'band_member', 
        'General User': 'general',
        'WXTJ Executive': 'exec'
      };
      
      res.json({ 
        message: 'Successfully left the band',
        updatedUser: updatedUserData.length > 0 ? {
          userId: updatedUserData[0].user_id,
          firstName: updatedUserData[0].first_name,
          lastName: updatedUserData[0].last_name,
          email: updatedUserData[0].email,
          role: roleMapping[updatedUserData[0].role_name] || 'general'
        } : null
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Failed to leave band:', error);
    next(error);
  }
});

export default router; 