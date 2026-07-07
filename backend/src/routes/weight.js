const express = require('express');
const pool = require('../db/pool');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Получить записи веса
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM weight_entries WHERE user_id = ? ORDER BY date DESC`,
      [req.userId]
    );
    res.json(rows.map(w => ({ id: String(w.id), date: w.date, weight: w.weight })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Добавить или обновить запись веса
router.post('/', auth, async (req, res) => {
  try {
    const { weight, date } = req.body;
    const d = date || new Date().toISOString().slice(0, 10);
    // UPSERT: если есть запись за эту дату — обновляем
    await pool.query(
      `INSERT INTO weight_entries (user_id, date, weight) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE weight = VALUES(weight)`,
      [req.userId, d, weight]
    );
    const [rows] = await pool.query(
      `SELECT * FROM weight_entries WHERE user_id = ? AND date = ?`,
      [req.userId, d]
    );
    res.json({ id: String(rows[0].id), date: d, weight });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
