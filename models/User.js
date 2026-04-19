const db = require('../config/db');

class User {
  static async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows.length > 0 ? rows[0] : null;
  }

  static async create(userData) {
    const { name, email, password, role } = userData;
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, role || 'user']
    );
    return result.insertId;
  }

  static async updateOTP(email, otp, expiry) {
    await db.query(
      'UPDATE users SET reset_otp = ?, reset_otp_expiry = ? WHERE email = ?',
      [otp, expiry, email]
    );
  }

  static async verifyOTP(email, otp) {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ? AND reset_otp = ? AND reset_otp_expiry > NOW()',
      [email, otp]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  static async updatePassword(email, hashedPassword) {
    await db.query(
      'UPDATE users SET password = ?, reset_otp = NULL, reset_otp_expiry = NULL WHERE email = ?',
      [hashedPassword, email]
    );
  }
}

module.exports = User;
