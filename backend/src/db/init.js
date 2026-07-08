const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '../../.env.production');
dotenv.config({ path: envPath });

async function initDatabase() {
  // Сначала создаём БД, если не существует
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 3306,
  });

  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.end();

  // Теперь создаём таблицы
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
  });

  const queries = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(100) DEFAULT '',
      goal ENUM('lose','maintain','gain','manual') DEFAULT NULL,
      gender ENUM('male','female') DEFAULT NULL,
      age INT DEFAULT NULL,
      birth_date DATE DEFAULT NULL,
      height INT DEFAULT NULL,
      weight DECIMAL(5,1) DEFAULT NULL,
      activity_level ENUM('minimal','light','moderate','high','extreme') DEFAULT NULL,
      gym_days_per_week INT DEFAULT NULL,
      is_mass_gain_mode BOOLEAN DEFAULT FALSE,
      manual_proteins DECIMAL(6,1) DEFAULT NULL,
      manual_fats DECIMAL(6,1) DEFAULT NULL,
      manual_carbs DECIMAL(6,1) DEFAULT NULL,
      daily_calories INT DEFAULT NULL,
      daily_proteins DECIMAL(6,1) DEFAULT NULL,
      daily_fats DECIMAL(6,1) DEFAULT NULL,
      daily_carbs DECIMAL(6,1) DEFAULT NULL,
      is_premium BOOLEAN DEFAULT FALSE,
      is_onboarded BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`,

    `CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      calories_per_100 DECIMAL(6,1) NOT NULL,
      proteins_per_100 DECIMAL(6,1) NOT NULL DEFAULT 0,
      fats_per_100 DECIMAL(6,1) NOT NULL DEFAULT 0,
      carbs_per_100 DECIMAL(6,1) NOT NULL DEFAULT 0,
      package_grams INT DEFAULT NULL,
      barcode VARCHAR(50) DEFAULT NULL,
      is_default BOOLEAN DEFAULT TRUE,
      created_by INT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB`,

    `CREATE TABLE IF NOT EXISTS favorite_products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      product_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      UNIQUE KEY unique_fav (user_id, product_id)
    ) ENGINE=InnoDB`,

    `CREATE TABLE IF NOT EXISTS recipes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(50) DEFAULT NULL,
      is_user_recipe BOOLEAN DEFAULT FALSE,
      created_by INT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB`,

    `CREATE TABLE IF NOT EXISTS recipe_steps (
      id INT AUTO_INCREMENT PRIMARY KEY,
      recipe_id INT NOT NULL,
      step_number INT NOT NULL,
      description TEXT NOT NULL,
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
    ) ENGINE=InnoDB`,

    `CREATE TABLE IF NOT EXISTS recipe_ingredients (
      id INT AUTO_INCREMENT PRIMARY KEY,
      recipe_id INT NOT NULL,
      product_id INT NOT NULL,
      grams DECIMAL(7,1) NOT NULL,
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    ) ENGINE=InnoDB`,

    `CREATE TABLE IF NOT EXISTS food_entries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      date DATE NOT NULL,
      meal_type ENUM('Завтрак','Обед','Ужин','Перекус') NOT NULL,
      name VARCHAR(255) NOT NULL,
      calories INT NOT NULL,
      proteins DECIMAL(6,1) NOT NULL DEFAULT 0,
      fats DECIMAL(6,1) NOT NULL DEFAULT 0,
      carbs DECIMAL(6,1) NOT NULL DEFAULT 0,
      grams INT DEFAULT NULL,
      product_id INT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    ) ENGINE=InnoDB`,

    `CREATE TABLE IF NOT EXISTS weight_entries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      date DATE NOT NULL,
      weight DECIMAL(5,1) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY unique_weight_date (user_id, date)
    ) ENGINE=InnoDB`,

    `CREATE TABLE IF NOT EXISTS meal_plans (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      date DATE NOT NULL,
      meal_type ENUM('Завтрак','Обед','Ужин','Перекус') NOT NULL,
      recipe_id INT DEFAULT NULL,
      product_id INT DEFAULT NULL,
      grams INT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE SET NULL,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    ) ENGINE=InnoDB`
  ];

  for (const q of queries) {
    await db.query(q);
  }

  console.log('✅ База данных и таблицы созданы');
  await db.end();
}

initDatabase().catch((err) => {
  console.error('❌ Ошибка инициализации БД:', err);
  process.exit(1);
});
