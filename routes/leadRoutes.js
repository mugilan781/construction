const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validator');
const { protect } = require('../middleware/auth');
const { verifyRecaptcha } = require('../middleware/recaptcha');

const { createLead, getLeads, updateLeadStatus, deleteLead } = require('../controllers/leadController');

// POST → Save lead (Public — with validation + reCAPTCHA)
router.post(
  '/',
  [
    body('name', 'Name is required').notEmpty().isLength({ max: 100 }),
    body('email', 'Please include a valid email').isEmail(),
    body('phone').optional().isLength({ max: 20 }),
    body('message').optional().isLength({ max: 2000 }),
    body('requirement').optional().isLength({ max: 200 }),
    body('budget_range').optional().isLength({ max: 100 }),
    body('source').optional().isIn(['contact', 'quote', 'website']),
  ],
  validateRequest,
  verifyRecaptcha,
  createLead
);

// GET → List all leads (Admin Only)
router.get('/', protect, getLeads);

// PUT → Update status (Admin Only)
router.put('/:id/status', protect, updateLeadStatus);

// DELETE → Remove lead (Admin Only)
router.delete('/:id', protect, deleteLead);

module.exports = router;