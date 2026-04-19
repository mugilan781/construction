const Testimonial = require('../models/Testimonial');

// CREATE
const createTestimonial = async (req, res) => {
    try {
        const id = await Testimonial.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Testimonial created',
            testimonialId: id
        });

    } catch (error) {
        res.status(500).json({ success: false });
    }
};

// GET ALL
const getTestimonials = async (req, res) => {
    try {
        const data = await Testimonial.findAll();
        res.json({ success: true, data });
    } catch {
        res.status(500).json({ success: false });
    }
};

// GET ONE
const getTestimonialById = async (req, res) => {
    try {
        const item = await Testimonial.findById(req.params.id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Testimonial not found'
            });
        }

        res.json({ success: true, data: item });

    } catch {
        res.status(500).json({ success: false });
    }
};

// UPDATE
const updateTestimonial = async (req, res) => {
    try {
        const item = await Testimonial.findById(req.params.id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Testimonial not found'
            });
        }

        await Testimonial.update(req.params.id, req.body);

        res.json({
            success: true,
            message: 'Testimonial updated'
        });

    } catch {
        res.status(500).json({ success: false });
    }
};

// DELETE
const deleteTestimonial = async (req, res) => {
    try {
        const item = await Testimonial.findById(req.params.id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Testimonial not found'
            });
        }

        await Testimonial.delete(req.params.id);

        res.json({
            success: true,
            message: 'Testimonial deleted'
        });

    } catch {
        res.status(500).json({ success: false });
    }
};

module.exports = {
    createTestimonial,
    getTestimonials,
    getTestimonialById,
    updateTestimonial,
    deleteTestimonial
};