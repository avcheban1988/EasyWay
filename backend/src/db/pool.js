const mysql = require('mysql2');
const path = require('path');
const { promisify } = require('util');
const dotenv = require('dotenv');

// 🔐 Загрузка .env.production
const envPath = path.resolve(__dirname, '../../.env.production');
dotenv.config({ path: envPath });

console.log('📦 ПУТЬ К .ENV.PRODUCTION:', envPath);
console.log('🔌 ПАРАМЕТРЫ БД:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
});

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectTimeout: 10000,
  acquireTimeout: 10000,
};

const pool = mysql.createPool(dbConfig);

// Обёртка для промисов (совместимость с существующими routes)
pool.query = promisify(pool.query);
pool.getConnection = promisify(pool.getConnection);

// 🔍 Проверка подключения к БД
async function checkConnection() {
  try {
    const connection = await new Promise((resolve, reject) => {
      pool.getConnection((err, conn) => {
        if (err) reject(err);
        else resolve(conn);
      });
    });
    console.log('✅ Подключение к базе данных успешно установлено');
    connection.release();
  } catch (error) {
    console.error('❌ Не удалось подключиться к базе данных:', error);
  }
}

// 🔌 Закрытие всех соединений в пуле
function closeConnection() {
  return new Promise((resolve, reject) => {
    pool.end((err) => {
      if (err) {
        console.error('❌ Ошибка при закрытии соединений:', err);
        reject(err);
      } else {
        console.log('🔌 Все соединения с базой данных закрыты');
        resolve();
      }
    });
  });
}

// Авто-проверка при запуске
checkConnection();

module.exports = pool;
