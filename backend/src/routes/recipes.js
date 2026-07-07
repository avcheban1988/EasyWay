const express = require('express');
const pool = require('../db/pool');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Получить все рецепты
router.get('/', optionalAuth, async (req, res) => {
  try {
    const [recipes] = await pool.query(
      `SELECT r.*, u.id as creator_id FROM recipes r
       LEFT JOIN users u ON u.id = r.created_by
       ORDER BY r.is_user_recipe, r.name`
    );
    const result = [];
    for (const r of recipes) {
      const [ingredients] = await pool.query(
        `SELECT ri.*, p.name as product_name FROM recipe_ingredients ri
         JOIN products p ON p.id = ri.product_id WHERE ri.recipe_id = ?`,
        [r.id]
      );
      const [steps] = await pool.query(
        `SELECT description FROM recipe_steps WHERE recipe_id = ? ORDER BY step_number`,
        [r.id]
      );
      // Расчёт макросов
      let totalCalories = 0, totalProteins = 0, totalFats = 0, totalCarbs = 0;
      for (const ing of ingredients) {
        const mult = ing.grams / 100;
        totalCalories += ing.calories_per_100 * mult;
        totalProteins += ing.proteins_per_100 * mult;
        totalFats += ing.fats_per_100 * mult;
        totalCarbs += ing.carbs_per_100 * mult;
      }

      result.push({
        id: String(r.id),
        name: r.name,
        category: r.category,
        isUserRecipe: !!r.is_user_recipe,
        steps: steps.map(s => s.description),
        ingredients: ingredients.map(i => ({
          productId: String(i.product_id),
          productName: i.product_name,
          grams: i.grams,
        })),
        macros: {
          calories: Math.round(totalCalories),
          proteins: Math.round(totalProteins * 10) / 10,
          fats: Math.round(totalFats * 10) / 10,
          carbs: Math.round(totalCarbs * 10) / 10,
        },
        createdBy: r.creator_id ? String(r.creator_id) : null,
      });
    }
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать рецепт
router.post('/', auth, async (req, res) => {
  try {
    const { name, ingredients, steps, category } = req.body;
    const [recipeRes] = await pool.query(
      `INSERT INTO recipes (name, category, is_user_recipe, created_by) VALUES (?, ?, TRUE, ?)`,
      [name, category || null, req.userId]
    );
    const recipeId = recipeRes.insertId;

    for (const ing of ingredients) {
      await pool.query(
        `INSERT INTO recipe_ingredients (recipe_id, product_id, grams) VALUES (?, ?, ?)`,
        [recipeId, ing.productId, ing.grams]
      );
    }
    if (steps) {
      for (let i = 0; i < steps.length; i++) {
        await pool.query(
          `INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES (?, ?, ?)`,
          [recipeId, i + 1, steps[i]]
        );
      }
    }
    res.status(201).json({ id: String(recipeId), name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удалить рецепт
router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM recipes WHERE id = ? AND created_by = ?', [req.params.id, req.userId]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
