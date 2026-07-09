const PROD = {
  'Молоко 3.2%': 1, 'Йогурт греческий': 5, 'Творог 5%': 6,
  'Сыр твердый': 8, 'Сыр Моцарелла': 9, 'Масло сливочное': 11,
  'Куриная грудка': 12, 'Говядина отварная': 123,
  'Гречка вареная': 112, 'Макароны вареные': 113, 'Рис вареный': 111,
  'Овсянка на молоке': 121, 'Хлеб цельнозерновой': 30,
  'Яйцо куриное': 24, 'Яйцо вареное': 119, 'Яйцо жареное (глазунья)': 120,
  'Огурец': 33, 'Помидор': 34, 'Перец болгарский': 35,
  'Капуста белокочанная': 36, 'Брокколи': 37, 'Морковь': 38,
  'Лук репчатый': 39, 'Картофель': 40, 'Авокадо': 41,
  'Яблоко': 42, 'Банан': 43, 'Виноград': 46, 'Грецкий орех': 49,
  'Масло оливковое': 51, 'Мед': 53, 'Треска': 22, 'Горбуша': 20,
  'Тунец консервированный': 21, 'Куриная грудка запеченная': 116,
};

const newRecipes = [
  {name:'Гречка с говядиной',category:'lunch',ingredients:[{id:PROD['Говядина отварная'],grams:120},{id:PROD['Гречка вареная'],grams:150},{id:PROD['Морковь'],grams:30}],steps:['Отварить гречку','Нарезать отварную говядину','Натереть морковь, смешать всё']},
  {name:'Суп куриный с лапшой',category:'lunch',ingredients:[{id:PROD['Куриная грудка'],grams:100},{id:PROD['Макароны вареные'],grams:80},{id:PROD['Морковь'],grams:40},{id:PROD['Лук репчатый'],grams:30},{id:PROD['Картофель'],grams:80}],steps:['Отварить куриную грудку','Добавить нарезанный картофель и морковь','Добавить макароны, варить до готовности']},
  {name:'Салат с тунцом',category:'lunch',ingredients:[{id:PROD['Тунец консервированный'],grams:100},{id:PROD['Огурец'],grams:80},{id:PROD['Помидор'],grams:80},{id:PROD['Перец болгарский'],grams:50},{id:PROD['Яйцо вареное'],grams:60}],steps:['Нарезать огурец, помидор, перец','Добавить тунец','Нарезать яйцо, смешать всё']},
  {name:'Рыба с овощами',category:'dinner',ingredients:[{id:PROD['Треска'],grams:150},{id:PROD['Брокколи'],grams:100},{id:PROD['Морковь'],grams:50}],steps:['Запечь треску в духовке 20 мин','Отварить брокколи и морковь','Подавать рыбу с овощами']},
  {name:'Омлет с овощами',category:'dinner',ingredients:[{id:PROD['Яйцо куриное'],grams:120},{id:PROD['Молоко 3.2%'],grams:50},{id:PROD['Помидор'],grams:60},{id:PROD['Перец болгарский'],grams:40}],steps:['Взбить яйца с молоком','Нарезать помидор и перец','Обжарить овощи, залить яичной смесью','Готовить под крышкой 5 мин']},
  {name:'Куриная грудка с овощами',category:'dinner',ingredients:[{id:PROD['Куриная грудка запеченная'],grams:150},{id:PROD['Огурец'],grams:80},{id:PROD['Помидор'],grams:80},{id:PROD['Капуста белокочанная'],grams:50}],steps:['Запечь куриную грудку','Нарезать овощи','Подавать грудку со свежими овощами']},
  {name:'Куриная грудка с яйцом',category:'high_protein',ingredients:[{id:PROD['Куриная грудка'],grams:180},{id:PROD['Яйцо жареное (глазунья)'],grams:60}],steps:['Обжарить куриную грудку','Приготовить яичницу','Подавать вместе']},
  {name:'Творог с орехами',category:'high_protein',ingredients:[{id:PROD['Творог 5%'],grams:200},{id:PROD['Грецкий орех'],grams:20},{id:PROD['Мед'],grams:15}],steps:['Смешать творог с орехами','Полить мёдом']},
  {name:'Рыбные котлеты',category:'high_protein',ingredients:[{id:PROD['Горбуша'],grams:150},{id:PROD['Яйцо куриное'],grams:30},{id:PROD['Лук репчатый'],grams:30}],steps:['Измельчить рыбу в фарш','Добавить яйцо и лук','Сформировать котлеты','Обжарить до готовности']},
  {name:'Рис с бананом',category:'high_carb',ingredients:[{id:PROD['Рис вареный'],grams:200},{id:PROD['Банан'],grams:120},{id:PROD['Мед'],grams:20}],steps:['Сварить рис','Нарезать банан','Смешать с мёдом']},
  {name:'Макароны с сыром',category:'high_carb',ingredients:[{id:PROD['Макароны вареные'],grams:200},{id:PROD['Сыр твердый'],grams:30},{id:PROD['Масло сливочное'],grams:10}],steps:['Отварить макароны','Натереть сыр','Смешать горячие макароны с маслом и сыром']},
  {name:'Овсянка с яблоком и мёдом',category:'high_carb',ingredients:[{id:PROD['Овсянка на молоке'],grams:200},{id:PROD['Яблоко'],grams:100},{id:PROD['Мед'],grams:15}],steps:['Сварить овсянку на молоке','Нарезать яблоко','Добавить мёд, перемешать']},
  {name:'Сырная тарелка',category:'high_fat',ingredients:[{id:PROD['Сыр твердый'],grams:50},{id:PROD['Сыр Моцарелла'],grams:50},{id:PROD['Грецкий орех'],grams:30},{id:PROD['Виноград'],grams:50}],steps:['Нарезать сыры кубиками','Добавить орехи и виноград','Подавать как закуску']},
  {name:'Яйца с авокадо',category:'high_fat',ingredients:[{id:PROD['Яйцо жареное (глазунья)'],grams:120},{id:PROD['Авокадо'],grams:100},{id:PROD['Хлеб цельнозерновой'],grams:40}],steps:['Поджарить яйца','Размять авокадо','Подрумянить хлеб, выложить авокадо и яйца']},
  {name:'Салат греческий',category:'high_fat',ingredients:[{id:PROD['Сыр Моцарелла'],grams:80},{id:PROD['Помидор'],grams:100},{id:PROD['Огурец'],grams:80},{id:PROD['Перец болгарский'],grams:50},{id:PROD['Масло оливковое'],grams:15}],steps:['Нарезать помидор, огурец, перец','Добавить сыр кубиками','Заправить оливковым маслом']},
];

const mysql = require('mysql2');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const conn = mysql.createConnection({
  host: process.env.DB_HOST, user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
});
const { promisify } = require('util');
const q = promisify(conn.query).bind(conn);

async function main() {
  await q("SET NAMES utf8mb4");

  for (const r of newRecipes) {
    const ex = await q("SELECT id FROM recipes WHERE name = ?", [r.name]);
    if (ex.length > 0) { console.log('EXISTS: ' + r.name); continue; }

    const rr = await q("INSERT INTO recipes (name, category, is_user_recipe) VALUES (?, ?, FALSE)", [r.name, r.category]);
    const rid = rr.insertId;

    for (const ing of r.ingredients)
      await q("INSERT INTO recipe_ingredients (recipe_id, product_id, grams) VALUES (?, ?, ?)", [rid, ing.id, ing.grams]);
    for (let i = 0; i < r.steps.length; i++)
      await q("INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES (?, ?, ?)", [rid, i + 1, r.steps[i]]);

    console.log('ADDED: ' + r.name + ' (' + r.category + ')');
  }

  const rows = await q("SELECT category, COUNT(*) as cnt FROM recipes WHERE is_user_recipe = FALSE GROUP BY category");
  console.log('\n=== Categories ===');
  rows.forEach((row) => console.log('  ' + row.category + ': ' + row.cnt));

  conn.end();
}

main().catch((e) => { console.error(e); conn.end(); process.exit(1); });
