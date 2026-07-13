const express = require('express');
const pool = require('../db/pool');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Получить записи воды за сегодня
router.get('/', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const rows = await pool.query(
      `SELECT id, user_id, DATE_FORMAT(date, '%Y-%m-%d') as date, ml FROM water_entries WHERE user_id = ? AND date = ?`,
      [req.userId, today]
    );
    if (rows.length === 0) return res.json({ ml: 0 });
    res.json({ ml: rows[0].ml, id: String(rows[0].id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Добавить/обновить воду
router.post('/', auth, async (req, res) => {
  try {
    const ml = parseInt(req.body.ml) || 0;
    if (ml < 0 || ml > 10000) return res.status(400).json({ error: 'Некорректное количество' });
    const today = new Date().toISOString().slice(0, 10);
    await pool.query(
      `INSERT INTO water_entries (user_id, date, ml) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE ml = VALUES(ml)`,
      [req.userId, today, ml]
    );
    res.json({ ml, date: today });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
