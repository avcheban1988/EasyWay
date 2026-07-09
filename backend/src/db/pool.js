const mysql = require('mysql2');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const dotenv = require('dotenv');

const envDev = path.resolve(__dirname, '../../.env');
const envProd = path.resolve(__dirname, '../../.env.production');
const envPath = fs.existsSync(envDev) ? envDev : envProd;
dotenv.config({ path: envPath });

console.log('LOADED .ENV:', envPath);

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectTimeout: 10000,
};

const pool = mysql.createPool(dbConfig);

// Hotfix: patch mysql2's iconv-lite to handle 'undefined' encoding gracefully
try {
  const Iconv = require('mysql2/node_modules/iconv-lite');
  const origGetEncoder = Iconv.getEncoder;
  Iconv.getEncoder = function(encoding, options) {
    if (!encoding || encoding === 'undefined') encoding = 'utf8';
    return origGetEncoder.call(this, encoding, options);
  };
  const origGetDecoder = Iconv.getDecoder;
  Iconv.getDecoder = function(encoding, options) {
    if (!encoding || encoding === 'undefined') encoding = 'utf8';
    return origGetDecoder.call(this, encoding, options);
  };
  console.log('ICONV PATCHED');
} catch (e) {
  console.log('ICONV PATCH FAILED:', e.message);
}

// Promisify for compatibility with existing routes
pool.query = promisify(pool.query);
pool.getConnection = promisify(pool.getConnection);

async function checkConnection() {
  try {
    const connection = await new Promise((resolve, reject) => {
      pool.getConnection((err, conn) => {
        if (err) reject(err);
        else resolve(conn);
      });
    });
    console.log('DB CONNECTED');
    connection.release();
  } catch (error) {
    console.error('DB CONNECT FAILED:', error);
  }
}

function closeConnection() {
  return new Promise((resolve, reject) => {
    pool.end((err) => {
      if (err) reject(err);
      else {
        console.log('DB DISCONNECTED');
        resolve();
      }
    });
  });
}

checkConnection();

module.exports = pool;
