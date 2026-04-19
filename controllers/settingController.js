const pool = require('../config/db');

// Get all settings
exports.getSettings = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT setting_key, setting_value FROM settings');
        
        // Convert to key-value object
        const settingsObj = {};
        rows.forEach(row => {
            settingsObj[row.setting_key] = row.setting_value;
        });

        res.json({ success: true, data: settingsObj });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error retrieving settings' });
    }
};

// Bulk update settings
exports.bulkUpdateSettings = async (req, res) => {
    const payload = req.body; // Expects an object like { company_phone: '123', years_experience: '5' }

    if (!payload || typeof payload !== 'object') {
        return res.status(400).json({ success: false, message: 'Invalid payload' });
    }

    try {
        const keys = Object.keys(payload);
        for (const key of keys) {
            const value = payload[key];
            await pool.query(
                'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
                [key, value, value]
            );
        }
        res.json({ success: true, message: 'Settings updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error updating settings' });
    }
};
