const db = require('../config/db');

class Lead {
  static async create(data) {
    const { name, phone, email, requirement, budget_range, message, source, status } = data;
    const [result] = await db.query(
      `INSERT INTO leads (name, phone, email, requirement, budget_range, message, source, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, phone, email, requirement, budget_range, message, source, status || 'new']
    );
    return result.insertId;
  }

  static async findAll() {
    const [rows] = await db.query('SELECT * FROM leads ORDER BY created_at DESC');
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM leads WHERE id = ?', [id]);
    return rows.length > 0 ? rows[0] : null;
  }
}

module.exports = Lead;
