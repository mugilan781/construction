const express = require('express');
const router = express.Router();

const {
    createBlog,
    getBlogs,
    getBlogById,
    updateBlog,
    deleteBlog
} = require('../controllers/blogController');

const { protect } = require('../middleware/auth');

// ADMIN
router.post('/', protect, createBlog);
router.put('/:id', protect, updateBlog);
router.delete('/:id', protect, deleteBlog);

// PUBLIC
router.get('/', getBlogs);
router.get('/:id', getBlogById);

module.exports = router;