const express = require('express');
const pool = require('../db/pool');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Получить записи за дату
router.get('/', auth, async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const [rows] = await pool.query(
      `SELECT * FROM food_entries WHERE user_id = ? AND date = ? ORDER BY FIELD(meal_type,'Завтрак','Обед','Ужин','Перекус'), created_at`,
      [req.userId, date]
    );
    res.json(rows.map(e => ({
      id: String(e.id),
      mealType: e.meal_type,
      name: e.name,
      calories: e.calories,
      proteins: e.proteins,
      fats: e.fats,
      carbs: e.carbs,
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
    const [result] = await pool.query(
      `INSERT INTO food_entries (user_id, date, meal_type, name, calories, proteins, fats, carbs, grams, product_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.userId, date || new Date().toISOString().slice(0, 10), mealType, name,
       calories, proteins || 0, fats || 0, carbs || 0, grams || null, productId || null]
    );
    res.status(201).json({
      id: String(result.insertId), mealType, name, calories,
      proteins: proteins || 0, fats: fats || 0, carbs: carbs || 0, grams: grams || null,
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

module.exports = router;
