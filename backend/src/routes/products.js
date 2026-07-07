const express = require('express');
const pool = require('../db/pool');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Получить все продукты (с флагом избранного для пользователя)
router.get('/', auth, async (req, res) => {
  try {
    const products = await pool.query(
      `SELECT p.*, IF(f.id IS NOT NULL, TRUE, FALSE) as is_favorite
       FROM products p
       LEFT JOIN favorite_products f ON f.product_id = p.id AND f.user_id = ?
       ORDER BY p.is_default DESC, p.name`,
      [req.userId]
    );
    res.json(products.map(p => ({
      id: String(p.id),
      name: p.name,
      caloriesPer100: p.calories_per_100,
      proteinsPer100: p.proteins_per_100,
      fatsPer100: p.fats_per_100,
      carbsPer100: p.carbs_per_100,
      packageGrams: p.package_grams,
      barcode: p.barcode,
      isDefault: !!p.is_default,
      isFavorite: !!p.is_favorite,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Поиск продуктов
router.get('/search', auth, async (req, res) => {
  try {
    const q = req.query.q || '';
    const products = await pool.query(
      `SELECT p.*, IF(f.id IS NOT NULL, TRUE, FALSE) as is_favorite
       FROM products p
       LEFT JOIN favorite_products f ON f.product_id = p.id AND f.user_id = ?
       WHERE p.name LIKE ? OR p.barcode = ?
       ORDER BY p.is_default DESC, p.name LIMIT 50`,
      [req.userId, `%${q}%`, q]
    );
    res.json(products.map(p => ({
      id: String(p.id),
      name: p.name,
      caloriesPer100: p.calories_per_100,
      proteinsPer100: p.proteins_per_100,
      fatsPer100: p.fats_per_100,
      carbsPer100: p.carbs_per_100,
      packageGrams: p.package_grams,
      barcode: p.barcode,
      isDefault: !!p.is_default,
      isFavorite: !!p.is_favorite,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Поиск по штрихкоду
router.get('/barcode/:code', auth, async (req, res) => {
  try {
    const products = await pool.query(
      `SELECT p.*, IF(f.id IS NOT NULL, TRUE, FALSE) as is_favorite
       FROM products p
       LEFT JOIN favorite_products f ON f.product_id = p.id AND f.user_id = ?
       WHERE p.barcode = ?`,
      [req.userId, req.params.code]
    );
    if (products.length === 0) return res.json(null);
    const p = products[0];
    res.json({
      id: String(p.id), name: p.name, caloriesPer100: p.calories_per_100,
      proteinsPer100: p.proteins_per_100, fatsPer100: p.fats_per_100,
      carbsPer100: p.carbs_per_100, packageGrams: p.package_grams,
      barcode: p.barcode, isDefault: !!p.is_default, isFavorite: !!p.is_favorite,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Добавить продукт (пользовательский)
router.post('/', auth, async (req, res) => {
  try {
    const { name, caloriesPer100, proteinsPer100, fatsPer100, carbsPer100, packageGrams, barcode } = req.body;
    const result = await pool.query(
      `INSERT INTO products (name, calories_per_100, proteins_per_100, fats_per_100, carbs_per_100, package_grams, barcode, is_default, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, FALSE, ?)`,
      [name, caloriesPer100, proteinsPer100 || 0, fatsPer100 || 0, carbsPer100 || 0, packageGrams || null, barcode || null, req.userId]
    );
    res.status(201).json({
      id: String(result.insertId), name, caloriesPer100, proteinsPer100: proteinsPer100 || 0,
      fatsPer100: fatsPer100 || 0, carbsPer100: carbsPer100 || 0, packageGrams: packageGrams || null,
      barcode: barcode || null, isDefault: false, isFavorite: false,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удалить продукт (только свой)
router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = ? AND created_by = ? AND is_default = FALSE', [req.params.id, req.userId]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Переключить избранное
router.post('/:id/favorite', auth, async (req, res) => {
  try {
    const existing = await pool.query(
      'SELECT id FROM favorite_products WHERE user_id = ? AND product_id = ?',
      [req.userId, req.params.id]
    );
    if (existing.length > 0) {
      await pool.query('DELETE FROM favorite_products WHERE user_id = ? AND product_id = ?', [req.userId, req.params.id]);
      res.json({ favorite: false });
    } else {
      await pool.query('INSERT INTO favorite_products (user_id, product_id) VALUES (?, ?)', [req.userId, req.params.id]);
      res.json({ favorite: true });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
