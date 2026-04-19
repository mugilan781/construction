const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { protect } = require('../middleware/auth');

// Public route to get settings (used by frontend)
router.get('/', settingController.getSettings);

// Protected routes
router.post('/bulk', protect, settingController.bulkUpdateSettings);

module.exports = router;
