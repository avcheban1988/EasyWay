const express = require('express');
const pool = require('../db/pool');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Получить записи за дату
router.get('/', auth, async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const rows = await pool.query(
      `SELECT id, user_id, meal_type, name, calories, proteins, fats, carbs, grams, DATE_FORMAT(date, '%Y-%m-%d') as date, created_at
       FROM food_entries WHERE user_id = ? AND date = ?
       ORDER BY FIELD(meal_type,'Завтрак','Обед','Ужин','Перекус'), created_at`,
      [req.userId, date]
    );
    res.json(rows.map(e => ({
      id: String(e.id),
      mealType: e.meal_type,
      name: e.name,
      calories: e.calories,
      proteins: Number(e.proteins),
      fats: Number(e.fats),
      carbs: Number(e.carbs),
      grams: e.grams,
      date: e.date,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Добавить запись
router.post('/', auth, async (req, res) => {
  try {
    const { mealType, name, calories, proteins, fats, carbs, grams, date, productId } = req.body;
    const result = await pool.query(
      `INSERT INTO food_entries (user_id, date, meal_type, name, calories, proteins, fats, carbs, grams, product_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.userId, date || new Date().toISOString().slice(0, 10), mealType, name,
       calories, proteins || 0, fats || 0, carbs || 0, grams || null, productId || null]
    );
    res.status(201).json({
      id: String(result.insertId), mealType, name, calories: Number(calories),
      proteins: Number(proteins) || 0, fats: Number(fats) || 0, carbs: Number(carbs) || 0, grams: grams || null,
      date: date || new Date().toISOString().slice(0, 10),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удалить запись
router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM food_entries WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить записи за диапазон дат (для недельных итогов)
router.get('/range', auth, async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ error: 'Параметры start и end обязательны' });
    }
    const rows = await pool.query(
      `SELECT id, user_id, meal_type, name, calories, proteins, fats, carbs, grams, DATE_FORMAT(date, '%Y-%m-%d') as date, created_at
       FROM food_entries WHERE user_id = ? AND date >= ? AND date <= ?
       ORDER BY date, FIELD(meal_type,'Завтрак','Обед','Ужин','Перекус'), created_at`,
      [req.userId, start, end]
    );
    res.json(rows.map(e => ({
      id: String(e.id),
      mealType: e.meal_type,
      name: e.name,
      calories: e.calories,
      proteins: Number(e.proteins),
      fats: Number(e.fats),
      carbs: Number(e.carbs),
      grams: e.grams,
      date: e.date,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;

// Последние 10 уникальных продуктов пользователя
router.get('/recent-products', auth, async (req, res) => {
  try {
    const rows = await pool.query(
      `SELECT name, grams FROM food_entries
       WHERE user_id = ? AND name IS NOT NULL AND name != ''
       GROUP BY name
       ORDER BY MAX(created_at) DESC
       LIMIT 10`,
      [req.userId]
    );
    res.json(rows.map(r => ({ name: r.name, grams: r.grams || 100 })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});
