const bcrypt = require('bcryptjs');
const db = require('./config/db');

async function seedAdmin() {
  const email = 'admin@infranest.com';
  const plainPassword = 'password123'; // Temporary password

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length > 0) {
      console.log('Admin user already exists.');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    await db.query(
      "INSERT INTO users (email, password, role) VALUES (?, ?, 'admin')",
      [email, hashedPassword]
    );

    console.log(`Successfully created default admin. Email: ${email}, Password: ${plainPassword}`);
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exit(1);
  }
}

seedAdmin();
