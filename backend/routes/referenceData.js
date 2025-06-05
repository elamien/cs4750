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

// GET /api/reference/instruments - Fetch common instrument options
router.get('/instruments', async (req, res) => {
    try {
        // For instruments, we can either:
        // 1. Query existing data to get unique instrument values
        // 2. Return a predefined list
        // Let's get unique instruments from existing user data
        const [rows] = await pool.query(`
            SELECT DISTINCT instrument 
            FROM user 
            WHERE instrument IS NOT NULL 
            AND instrument != ''
            ORDER BY instrument
        `);

        const instruments = rows.map(row => ({
            name: row.instrument,
            value: row.instrument
        }));

        // Add some common instruments if not present
        const commonInstruments = [
            'Guitar', 'Bass', 'Drums', 'Vocals', 'Piano', 'Keyboard', 
            'Violin', 'Saxophone', 'Trumpet', 'Flute', 'Clarinet'
        ];

        const existingValues = new Set(instruments.map(i => i.value));
        commonInstruments.forEach(instrument => {
            if (!existingValues.has(instrument)) {
                instruments.push({ name: instrument, value: instrument });
            }
        });

        // Sort alphabetically
        instruments.sort((a, b) => a.name.localeCompare(b.name));

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