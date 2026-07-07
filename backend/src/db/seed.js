const pool = require('./pool');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('🌱 Наполняем базу начальными данными...');

  // === Создаём тестового пользователя (премиум) ===
  const hash = await bcrypt.hash('test123', 10);
  const [userResult] = await pool.query(
    `INSERT IGNORE INTO users (email, password_hash, name, is_premium, is_onboarded)
     VALUES (?, ?, ?, TRUE, TRUE)`,
    ['test@easyway.app', hash, 'Тестовый']
  );
  const userId = userResult.insertId || 1;
  console.log('👤 Тестовый пользователь: test@easyway.app / test123');

  // === Продукты ===
  const products = [
    // Молочные
    ['Молоко 3.2%', 60, 3, 3.2, 4.8, null, null],
    ['Молоко 2.5%', 54, 2.9, 2.5, 4.8, null, null],
    ['Молоко 1%', 42, 3, 1, 4.8, null, null],
    ['Кефир 3.2%', 59, 3, 3.2, 4, null, null],
    ['Йогурт греческий', 59, 10, 0.5, 3.5, 140, null],
    ['Творог 5%', 145, 16, 5, 3, 200, null],
    ['Творог обезжиренный', 90, 18, 0.5, 3.3, 200, null],
    ['Сыр твердый', 392, 35, 27, 0, null, null],
    ['Сыр Моцарелла', 280, 22, 20, 2, null, null],
    ['Сметана 20%', 206, 2.5, 20, 3.5, null, null],
    ['Масло сливочное', 717, 0.9, 81, 0.1, null, null],
    // Мясо
    ['Куриная грудка', 165, 31, 3.6, 0, null, null],
    ['Куриное бедро', 185, 20, 11, 0, null, null],
    ['Индейка филе', 135, 29, 1.5, 0, null, null],
    ['Говядина вырезка', 158, 25, 6, 0, null, null],
    ['Говяжий фарш', 230, 18, 17, 0, null, null],
    ['Свинина вырезка', 143, 21, 6, 0, null, null],
    ['Печень куриная', 136, 20, 5, 1, null, null],
    // Рыба
    ['Лосось слабосоленый', 200, 22, 12, 0, null, null],
    ['Горбуша', 140, 22, 6, 0, null, null],
    ['Тунец консервированный', 115, 25, 1, 0, null, null],
    ['Треска', 82, 18, 0.7, 0, null, null],
    ['Креветки', 99, 21, 1, 0, null, null],
    // Яйца
    ['Яйцо куриное', 155, 13, 11, 1.1, 60, null],
    // Крупы
    ['Рис белый', 130, 2.7, 0.3, 28, null, null],
    ['Гречка', 343, 13, 3.4, 72, null, null],
    ['Овсянка (вареная)', 68, 2.5, 1.5, 12, null, null],
    ['Макароны тв. сорта', 350, 12, 1.5, 72, null, null],
    ['Киноа', 120, 4, 2, 21, null, null],
    // Хлеб
    ['Хлеб цельнозерновой', 247, 13, 3.4, 41, null, null],
    ['Хлеб белый', 265, 8, 3, 50, null, null],
    ['Лаваш тонкий', 275, 9, 2, 55, null, null],
    // Овощи
    ['Огурец', 15, 0.7, 0.1, 3.6, null, null],
    ['Помидор', 18, 0.9, 0.2, 3.9, null, null],
    ['Перец болгарский', 26, 1, 0.3, 5, null, null],
    ['Капуста белокочанная', 25, 1.3, 0.2, 5.8, null, null],
    ['Брокколи', 34, 2.8, 0.4, 7, null, null],
    ['Морковь', 41, 0.9, 0.2, 10, null, null],
    ['Лук репчатый', 40, 1.1, 0.1, 9, null, null],
    ['Картофель', 77, 2, 0.1, 17, null, null],
    ['Авокадо', 160, 2, 15, 9, null, null],
    // Фрукты
    ['Яблоко', 52, 0.3, 0.2, 14, null, null],
    ['Банан', 89, 1.1, 0.3, 23, 120, null],
    ['Апельсин', 43, 0.9, 0.1, 9, null, null],
    ['Клубника', 32, 0.7, 0.3, 8, null, null],
    ['Виноград', 69, 0.7, 0.2, 18, null, null],
    ['Арбуз', 30, 0.6, 0.2, 8, null, null],
    // Орехи
    ['Миндаль', 579, 21, 49, 21, null, null],
    ['Грецкий орех', 654, 15, 65, 14, null, null],
    ['Арахис', 567, 26, 49, 16, null, null],
    // Масла и соусы
    ['Масло оливковое', 884, 0, 100, 0, null, null],
    ['Масло подсолнечное', 884, 0, 100, 0, null, null],
    ['Мед', 329, 0.3, 0, 81, null, null],
    ['Шоколад темный 70%', 550, 7, 40, 48, null, null],
    ['Майонез', 680, 1, 72, 2.5, null, null],
    // Готовые/варёные продукты
    ['Рис вареный', 116, 2.4, 0.3, 25, null, null],
    ['Гречка вареная', 110, 4.2, 1.1, 23, null, null],
    ['Макароны вареные', 140, 5, 0.8, 29, null, null],
    ['Картофель вареный', 77, 2, 0.1, 17, null, null],
    ['Картофель запеченный', 93, 2.5, 0.1, 21, null, null],
    ['Куриная грудка запеченная', 165, 31, 3.6, 0, null, null],
    ['Куриная грудка вареная', 155, 29, 3.2, 0, null, null],
    ['Куриное филе жареное', 197, 30, 7, 0, null, null],
    ['Яйцо вареное', 155, 13, 11, 1.1, null, null],
    ['Яйцо жареное (глазунья)', 196, 14, 15, 1, null, null],
    ['Овсянка на молоке', 102, 4, 3.5, 14, null, null],
    ['Овсянка на воде', 71, 2.5, 1.5, 12, null, null],
    ['Говядина отварная', 175, 25, 8, 0, null, null],
    ['Свинина отварная', 155, 21, 7, 0, null, null],
    ['Индейка запеченная', 135, 29, 1.5, 0, null, null],
    // Сыры и творожные продукты
    ['Сырок творожный', 280, 12, 20, 18, null, null],
    ['Сыр адыгейский', 264, 20, 20, 1, null, null],
    ['Сыр копченый', 300, 25, 22, 0, null, null],
    ['Творожная масса', 280, 12, 13, 28, null, null],
    // Полуфабрикаты
    ['Пельмени', 240, 12, 10, 28, null, null],
    ['Вареники с творогом', 190, 8, 4, 33, null, null],
    ['Котлета куриная', 140, 18, 7, 4, null, null],
    ['Котлета говяжья', 205, 18, 14, 5, null, null],
    ['Сосиски', 260, 12, 23, 2, null, null],
    // Колбасы
    ['Колбаса вареная', 250, 12, 22, 1, null, null],
    ['Колбаса копченая', 400, 15, 37, 1, null, null],
    ['Ветчина', 150, 18, 8, 1, null, null],
    // Консервы
    ['Фасоль консервированная', 90, 6, 0.5, 16, null, null],
    ['Кукуруза консервированная', 90, 3, 1.2, 17, null, null],
    ['Горошек консервированный', 80, 5, 0.4, 13, null, null],
    // Напитки
    ['Кофе черный', 2, 0.2, 0, 0, null, null],
    ['Чай зеленый', 1, 0, 0, 0, null, null],
    ['Компот', 60, 0.2, 0, 15, null, null],
    ['Квас', 27, 0.2, 0, 5, null, null],
  ];

  for (const p of products) {
    await pool.query(
      `INSERT IGNORE INTO products (name, calories_per_100, proteins_per_100, fats_per_100, carbs_per_100, package_grams, is_default)
       VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
      p
    );
  }
  console.log(`📦 Добавлено продуктов: ${products.length}`);

  // === Рецепты ===
  const recipes = [
    { name: 'Овсяноблин', category: 'breakfast', ingredients: [{ name: 'Яйцо куриное', grams: 60 }, { name: 'Овсянка (вареная)', grams: 30 }], steps: ['Смешать яйцо с овсянкой', 'Обжарить на сковороде 2 мин с каждой стороны'] },
    { name: 'Курица с рисом', category: 'lunch', ingredients: [{ name: 'Куриная грудка', grams: 150 }, { name: 'Рис белый', grams: 100 }, { name: 'Огурец', grams: 50 }], steps: ['Отварить рис', 'Обжарить куриную грудку', 'Нарезать огурец, смешать'] },
    { name: 'Смузи банановый', category: 'breakfast', ingredients: [{ name: 'Банан', grams: 120 }, { name: 'Молоко 3.2%', grams: 200 }], steps: ['Смешать все в блендере до однородности'] },
    { name: 'Творожная запеканка', category: 'breakfast', ingredients: [{ name: 'Творог 5%', grams: 200 }, { name: 'Яйцо куриное', grams: 60 }], steps: ['Смешать творог с яйцом', 'Выпекать 25 мин при 180°C'] },
    { name: 'Авокадо-тост', category: 'high_fat', ingredients: [{ name: 'Хлеб цельнозерновой', grams: 50 }, { name: 'Авокадо', grams: 100 }], steps: ['Поджарить хлеб', 'Размять авокадо, намазать на тост'] },
  ];

  for (const r of recipes) {
    const [existing] = await pool.query(`SELECT id FROM recipes WHERE name = ?`, [r.name]);
    if (existing.length > 0) continue;

    const [recipeRes] = await pool.query(
      `INSERT INTO recipes (name, category, is_user_recipe) VALUES (?, ?, FALSE)`,
      [r.name, r.category]
    );
    const recipeId = recipeRes.insertId;

    for (let i = 0; i < r.ingredients.length; i++) {
      const ing = r.ingredients[i];
      const [prod] = await pool.query(`SELECT id FROM products WHERE name = ?`, [ing.name]);
      if (prod.length > 0) {
        await pool.query(
          `INSERT INTO recipe_ingredients (recipe_id, product_id, grams) VALUES (?, ?, ?)`,
          [recipeId, prod[0].id, ing.grams]
        );
      }
    }

    for (let i = 0; i < r.steps.length; i++) {
      await pool.query(
        `INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES (?, ?, ?)`,
        [recipeId, i + 1, r.steps[i]]
      );
    }
  }

  console.log('🍳 Добавлены базовые рецепты');
  console.log('✅ Сид завершён!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Ошибка сида:', err);
  process.exit(1);
});
