const Blog = require('../models/Blog');

// CREATE
const createBlog = async (req, res) => {
    try {
        const id = await Blog.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Blog created',
            blogId: id
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
};

// GET ALL
const getBlogs = async (req, res) => {
    try {
        const blogs = await Blog.findAll();
        res.json({ success: true, data: blogs });
    } catch (error) {
        res.status(500).json({ success: false });
    }
};

// GET ONE
const getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        res.json({ success: true, data: blog });

    } catch (error) {
        res.status(500).json({ success: false });
    }
};

// UPDATE
const updateBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        await Blog.update(req.params.id, req.body);

        res.json({
            success: true,
            message: 'Blog updated'
        });

    } catch (error) {
        res.status(500).json({ success: false });
    }
};

// DELETE
const deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        await Blog.delete(req.params.id);

        res.json({
            success: true,
            message: 'Blog deleted'
        });

    } catch (error) {
        res.status(500).json({ success: false });
    }
};

module.exports = {
    createBlog,
    getBlogs,
    getBlogById,
    updateBlog,
    deleteBlog
};