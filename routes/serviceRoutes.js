const express = require('express');
const router = express.Router();
const { createService, getServices, getServiceById, updateService, deleteService } = require('../controllers/serviceController');
const { protect } = require('../middleware/auth');
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validator');

router.post(
  '/',
  protect,
  [
    body('name', 'Service Name is required').notEmpty(),
    body('description', 'Description is required').notEmpty()
  ],
  validateRequest,
  createService
);

router.get('/', getServices);
router.get('/:id', getServiceById);
router.put('/:id', protect, updateService);
router.delete('/:id', protect, deleteService);

module.exports = router;
