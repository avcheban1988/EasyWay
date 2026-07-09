const pool = require('./pool');

async function check() {
  // 1) Проверим recipe_ingredients — какие product_id существуют
  const ingredients = await pool.query(`
    SELECT ri.recipe_id, ri.product_id, p.name as prod_name, ri.grams
    FROM recipe_ingredients ri
    LEFT JOIN products p ON p.id = ri.product_id
    ORDER BY ri.recipe_id
  `);
  console.log('=== recipe_ingredients ===');
  for (const r of ingredients) {
    const status = r.prod_name ? 'OK' : '🟥 MISSING';
    console.log(`  recipe_id=${r.recipe_id} product_id=${r.product_id} product="${r.prod_name || 'MISSING'}" grams=${r.grams} ${status}`);
  }

  // 2) Проверим, какие продукты есть для расчёта
  const missing = ingredients.filter(r => !r.prod_name);
  if (missing.length > 0) {
    console.log(`\n🟥 Найдено ${missing.length} отсутствующих продуктов в recipe_ingredients`);
  } else {
    console.log('\n✅ Все продукты в рецептах существуют');
  }

  // 3) Проверим сами рецепты и их макросы на бэке
  const recipes = await pool.query(`
    SELECT r.id, r.name, r.category,
      ri.product_id, p.name as prod_name, p.calories_per_100, p.proteins_per_100, p.fats_per_100, p.carbs_per_100, ri.grams
    FROM recipes r
    JOIN recipe_ingredients ri ON ri.recipe_id = r.id
    JOIN products p ON p.id = ri.product_id
    ORDER BY r.id
  `);

  const recipeMap = {};
  for (const row of recipes) {
    if (!recipeMap[row.id]) {
      recipeMap[row.id] = { id: row.id, name: row.name, category: row.category, calories: 0, proteins: 0, fats: 0, carbs: 0 };
    }
    const mult = row.grams / 100;
    recipeMap[row.id].calories += row.calories_per_100 * mult;
    recipeMap[row.id].proteins += row.proteins_per_100 * mult;
    recipeMap[row.id].fats += row.fats_per_100 * mult;
    recipeMap[row.id].carbs += row.carbs_per_100 * mult;
  }

  console.log('\n=== Расчёт макросов рецептов ===');
  for (const [id, rec] of Object.entries(recipeMap)) {
    console.log(`${rec.name}: ${Math.round(rec.calories)} ккал, Б${Math.round(rec.proteins)}/Ж${Math.round(rec.fats)}/У${Math.round(rec.carbs)}`);
  }

  process.exit(0);
}

check().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
