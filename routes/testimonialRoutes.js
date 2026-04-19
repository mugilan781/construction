const express = require('express');
const router = express.Router();

const {
    createTestimonial,
    getTestimonials,
    getTestimonialById,
    updateTestimonial,
    deleteTestimonial
} = require('../controllers/testimonialController');

const { protect } = require('../middleware/auth');

// ADMIN
router.post('/', protect, createTestimonial);
router.put('/:id', protect, updateTestimonial);
router.delete('/:id', protect, deleteTestimonial);

// PUBLIC
router.get('/', getTestimonials);
router.get('/:id', getTestimonialById);

module.exports = router;