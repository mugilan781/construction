const db = require('../config/db');

class Service {
  static async create(data) {
    const { name, description, process, benefits } = data;
    const [result] = await db.query(
      `INSERT INTO services (name, description, process, benefits) VALUES (?, ?, ?, ?)`,
      [name, description, process, benefits]
    );
    return result.insertId;
  }

  static async findAll() {
    const [rows] = await db.query('SELECT * FROM services ORDER BY created_at DESC');
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM services WHERE id = ?', [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  static async update(id, data) {
    const { name, description, process, benefits } = data;
    await db.query(
      `UPDATE services SET name=?, description=?, process=?, benefits=? WHERE id=?`,
      [name, description, process, benefits, id]
    );
  }

  static async delete(id) {
    await db.query('DELETE FROM services WHERE id = ?', [id]);
  }
}

module.exports = Service;
