const express = require('express');
const router = express.Router();
const { createProject, getProjects, getProjectById, updateProject, deleteProject } = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validator');

const uploadFields = [
  { name: 'image_url', maxCount: 1 },
  { name: 'before_image', maxCount: 1 },
  { name: 'after_image', maxCount: 1 },
  { name: 'gallery', maxCount: 10 },
  { name: 'site_image_1', maxCount: 1 },
  { name: 'site_image_2', maxCount: 1 },
  { name: 'site_image_3', maxCount: 1 },
  { name: 'site_image_4', maxCount: 1 }
];

// Create a project (Admin Only)
router.post(
  '/',
  protect,
  upload.fields(uploadFields),
  [
    body('title', 'Title is required').notEmpty(),
    body('description', 'Description is required').notEmpty(),
    body('category', 'Category is required').notEmpty()
  ],
  validateRequest,
  createProject
);

// Get all projects (Public)
router.get('/', getProjects);

// Get single project (Public)
router.get('/:id', getProjectById);

// Update a project (Admin Only)
router.put('/:id', protect, upload.fields(uploadFields), updateProject);

// Delete a project (Admin Only)
router.delete('/:id', protect, deleteProject);

module.exports = router;
