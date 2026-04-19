const db = require('../config/db');

class Testimonial {
    static async create(data) {
        const { client_name, rating, review, company } = data;

        const [result] = await db.query(
            "INSERT INTO testimonials (client_name, rating, review, company) VALUES (?, ?, ?, ?)",
            [client_name, rating, review, company]
        );

        return result.insertId;
    }

    static async findAll() {
        const [rows] = await db.query(
            "SELECT * FROM testimonials ORDER BY created_at DESC"
        );
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query(
            "SELECT * FROM testimonials WHERE id=?",
            [id]
        );
        return rows[0];
    }

    static async update(id, data) {
        const { client_name, rating, review, company } = data;

        await db.query(
            "UPDATE testimonials SET client_name=?, rating=?, review=?, company=? WHERE id=?",
            [client_name, rating, review, company, id]
        );
    }

    static async delete(id) {
        await db.query("DELETE FROM testimonials WHERE id=?", [id]);
    }
}

module.exports = Testimonial;