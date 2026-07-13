const express = require('express');
const pool = require('../db/pool');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Получить записи веса
router.get('/', auth, async (req, res) => {
  try {
    const rows = await pool.query(
      `SELECT id, user_id, DATE_FORMAT(date, '%Y-%m-%d') as date, weight FROM weight_entries WHERE user_id = ? ORDER BY date DESC`,
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
    const w = parseFloat(req.body.weight);
    if (isNaN(w) || w < 20 || w > 500) {
      return res.status(400).json({ error: 'Некорректный вес' });
    }
    const d = req.body.date || new Date().toISOString().slice(0, 10);
    const weightVal = Math.round(w * 10) / 10;
    // Удаляем старую запись за эту дату и вставляем новую
    await pool.query('DELETE FROM weight_entries WHERE user_id = ? AND date = ?', [req.userId, d]);
    const result = await pool.query(
      `INSERT INTO weight_entries (user_id, date, weight) VALUES (?, ?, ?)`,
      [req.userId, d, weightVal]
    );
    res.status(201).json({ id: String(result.insertId), date: d, weight: weightVal });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
