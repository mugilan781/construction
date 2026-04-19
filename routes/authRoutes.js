const express = require('express');
const router = express.Router();
const { login, signup, forgotPassword, resetPassword } = require('../controllers/authController');
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validator');
const { verifyRecaptcha } = require('../middleware/recaptcha');

router.post(
  '/signup',
  [
    body('name', 'Name is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
    body('confirmPassword', 'Confirm password is required').not().isEmpty(),
  ],
  validateRequest,
  verifyRecaptcha,
  signup
);

router.post(
  '/login',
  [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists(),
  ],
  validateRequest,
  login
);

router.post(
  '/forgot-password',
  [
    body('email', 'Please include a valid email').isEmail(),
  ],
  validateRequest,
  forgotPassword
);

router.post(
  '/reset-password',
  [
    body('email', 'Please include a valid email').isEmail(),
    body('otp', 'OTP is required').not().isEmpty(),
    body('newPassword', 'Password must be at least 6 characters').isLength({ min: 6 }),
    body('confirmPassword', 'Confirm password is required').not().isEmpty(),
  ],
  validateRequest,
  resetPassword
);

module.exports = router;
