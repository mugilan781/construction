const db = require('../config/db');

// CREATE LEAD (already exists)
const createLead = async (req, res) => {
    try {
        const { name, phone, email, requirement, budget_range, message, source } = req.body;
        const status = 'new'; // Ensure new leads explicitly get status = 'new'

        await db.query(
            `INSERT INTO leads (name, phone, email, requirement, budget_range, message, source, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, phone, email, requirement, budget_range, message, source, status]
        );

        res.status(201).json({
            success: true,
            message: "Lead created successfully"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


// ADD THIS NEW FUNCTION
const getLeads = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM leads ORDER BY created_at DESC");

        res.json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const updateLeadStatus = async (req, res) => {
    try {
        const id = req.params.id;
        let { status } = req.body;
        
        if (status) {
            status = status.toLowerCase();
        }

        if (!['new', 'contacted', 'closed'].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status value" });
        }

        await db.query("UPDATE leads SET status = ? WHERE id = ?", [status, id]);

        res.json({
            success: true,
            message: "Status updated successfully",
            status: status
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const deleteLead = async (req, res) => {
    try {
        const id = req.params.id;
        await db.query("DELETE FROM leads WHERE id = ?", [id]);
        res.json({ success: true, message: "Lead deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    createLead,
    getLeads,
    updateLeadStatus,
    deleteLead
};