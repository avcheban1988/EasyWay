const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Вспомогательная функция для вычисления возраста из даты рождения
function calculateAge(birthDate) {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// Регистрация
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' });
    }
    const existing = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing[0].length > 0) {
      return res.status(409).json({ error: 'Пользователь с таким email уже существует' });
    }
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
      [email, hash, name || '']
    );
    const token = jwt.sign({ userId: result.insertId, email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.status(201).json({ token, user: { id: result.insertId, email, name: name || '', is_premium: false } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Вход
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, is_premium: !!user.is_premium } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Вход/регистрация по номеру телефона
router.post('/phone', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Номер телефона обязателен' });
    }
    
    // Используем номер телефона как email (уникальный идентификатор)
    const email = `phone_${phone.replace(/\D/g, '')}@easyway.app`;
    
    // Проверяем, есть ли уже пользователь
    const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existing.length > 0) {
      // Уже есть — логинимся
      const user = existing[0];
      const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
      return res.json({ token, user: { id: user.id, email: user.email, name: user.name, is_premium: !!user.is_premium } });
    }
    
    // Нет — создаём нового пользователя
    const hash = await bcrypt.hash(phone, 10);
    const [result] = await pool.query(
      'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
      [email, hash, '']
    );
    const token = jwt.sign({ userId: result.insertId, email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.status(201).json({ token, user: { id: result.insertId, email, name: '', is_premium: false } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить профиль
router.get('/profile', auth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.userId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Пользователь не найден' });
    const u = rows[0];
    const age = calculateAge(u.birth_date) || u.age;
    res.json({
      id: u.id,
      email: u.email,
      name: u.name,
      goal: u.goal,
      gender: u.gender,
      age,
      birth_date: u.birth_date,
      height: u.height,
      weight: u.weight,
      activity_level: u.activity_level,
      gym_days_per_week: u.gym_days_per_week,
      is_mass_gain_mode: !!u.is_mass_gain_mode,
      manual_proteins: u.manual_proteins,
      manual_fats: u.manual_fats,
      manual_carbs: u.manual_carbs,
      daily_calories: u.daily_calories,
      daily_proteins: u.daily_proteins,
      daily_fats: u.daily_fats,
      daily_carbs: u.daily_carbs,
      is_premium: !!u.is_premium,
      is_onboarded: !!u.is_onboarded,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить профиль
router.put('/profile', auth, async (req, res) => {
  try {
    const allowed = ['name', 'goal', 'gender', 'age', 'birth_date', 'height', 'weight', 'activity_level',
      'gym_days_per_week', 'is_mass_gain_mode', 'manual_proteins', 'manual_fats', 'manual_carbs',
      'daily_calories', 'daily_proteins', 'daily_fats', 'daily_carbs', 'is_onboarded'];
    const updates = [];
    const values = [];
    
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates.push(`${key} = ?`);
        values.push(req.body[key]);
      }
    }
    
    if (updates.length === 0) return res.status(400).json({ error: 'Нет данных для обновления' });
    
    values.push(req.userId);
    await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
    
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.userId]);
    const u = rows[0];
    const age = calculateAge(u.birth_date) || u.age;
    
    res.json({
      id: u.id,
      email: u.email,
      name: u.name,
      goal: u.goal,
      gender: u.gender,
      age,
      birth_date: u.birth_date,
      height: u.height,
      weight: u.weight,
      activity_level: u.activity_level,
      gym_days_per_week: u.gym_days_per_week,
      is_mass_gain_mode: !!u.is_mass_gain_mode,
      manual_proteins: u.manual_proteins,
      manual_fats: u.manual_fats,
      manual_carbs: u.manual_carbs,
      daily_calories: u.daily_calories,
      daily_proteins: u.daily_proteins,
      daily_fats: u.daily_fats,
      daily_carbs: u.daily_carbs,
      is_premium: !!u.is_premium,
      is_onboarded: !!u.is_onboarded,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
