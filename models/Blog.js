const db = require('../config/db');

class Blog {
    static async create(data) {
        let { title, content, author, date } = data;
        
        if (!date) {
            date = new Date().toISOString().split('T')[0];
        }

        const [result] = await db.query(
            "INSERT INTO blogs (title, content, author, date) VALUES (?, ?, ?, ?)",
            [title, content, author, date]
        );

        return result.insertId;
    }

    static async findAll() {
        const [rows] = await db.query(
            "SELECT * FROM blogs ORDER BY created_at DESC"
        );
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query(
            "SELECT * FROM blogs WHERE id=?",
            [id]
        );
        return rows[0];
    }

    static async update(id, data) {
        let { title, content, author, date } = data;
        
        if (!date) {
            date = new Date().toISOString().split('T')[0];
        }

        await db.query(
            "UPDATE blogs SET title=?, content=?, author=?, date=? WHERE id=?",
            [title, content, author, date, id]
        );
    }

    static async delete(id) {
        await db.query("DELETE FROM blogs WHERE id=?", [id]);
    }
}

module.exports = Blog;