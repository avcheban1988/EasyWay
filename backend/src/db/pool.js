const mysql = require('mysql');
const { promisify } = require('util');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  charset: 'utf8',
  connectionLimit: 10,
});

// Обёртка для промисов
pool.query = promisify(pool.query);
pool.getConnection = promisify(pool.getConnection);

module.exports = pool;
