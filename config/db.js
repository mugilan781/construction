const mysql = require('mysql2');
require('dotenv').config();

const dbConfig = process.env.DATABASE_URL ? process.env.DATABASE_URL : {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

const promisePool = pool.promise();

promisePool.getConnection()
  .then((connection) => {
    console.log('MySQL connected successfully.');
    connection.release();
  })
  .catch((err) => {
    console.error('Error connecting to MySQL:', err.message);
  });

module.exports = promisePool;
