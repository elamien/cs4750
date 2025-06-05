import express from 'express';
import { pool } from '../config/database.js';

const router = express.Router();

// GET /api/reference/genres - Fetch all available genre options from database schema
router.get('/genres', async (req, res) => {
    try {
        // Query to get ENUM values from the user table's genre column
        const [rows] = await pool.query(`
            SELECT COLUMN_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'user' 
            AND COLUMN_NAME = 'genre'
        `);

        if (!rows || rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Genre column not found' 
            });
        }

        // Extract ENUM values from the COLUMN_TYPE string
        // COLUMN_TYPE looks like: "enum('Classic rock','Country','Pop',...)"
        const columnType = rows[0].COLUMN_TYPE;
        const enumMatch = columnType.match(/enum\((.*)\)/);
        
        if (!enumMatch) {
            return res.status(500).json({ 
                success: false, 
                message: 'Could not parse genre options' 
            });
        }

        // Parse the enum values - remove quotes and split by comma
        const enumValues = enumMatch[1]
            .split(',')
            .map(value => value.trim().replace(/'/g, ''));

        // Format for frontend dropdown components
        const genres = enumValues.map(value => ({
            name: value,
            value: value
        }));

        res.json({
            success: true,
            data: genres
        });

    } catch (error) {
        console.error('Failed to fetch genres:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch genre options' 
        });
    }
});

// GET /api/reference/instruments - Fetch instrument options from reference table
router.get('/instruments', async (req, res) => {
    try {
        // Query the reference_instruments table for all active instruments
        const [rows] = await pool.query(`
            SELECT name, value 
            FROM reference_instruments 
            WHERE is_active = TRUE 
            ORDER BY name
        `);

        const instruments = rows.map(row => ({
            name: row.name,
            value: row.value
        }));

        res.json({
            success: true,
            data: instruments
        });

    } catch (error) {
        console.error('Failed to fetch instruments:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch instrument options' 
        });
    }
});

export default router; 