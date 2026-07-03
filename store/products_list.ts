// Топ продуктов — временная база для тестирования
// ВАЖНО: ID 1-12 зарезервированы для рецептов, НЕ МЕНЯТЬ!
export const DEFAULT_PRODUCTS = [
  // === Старые продукты (ID сохранены для совместимости с рецептами) ===
  { id: '1', name: 'Йогурт греческий', caloriesPer100: 59, proteinsPer100: 10, fatsPer100: 0.5, carbsPer100: 3.5, packageGrams: 140 },
  { id: '2', name: 'Куриная грудка', caloriesPer100: 165, proteinsPer100: 31, fatsPer100: 3.6, carbsPer100: 0 },
  { id: '3', name: 'Рис белый', caloriesPer100: 130, proteinsPer100: 2.7, fatsPer100: 0.3, carbsPer100: 28 },
  { id: '4', name: 'Авокадо', caloriesPer100: 160, proteinsPer100: 2, fatsPer100: 15, carbsPer100: 9 },
  { id: '5', name: 'Яйцо куриное', caloriesPer100: 155, proteinsPer100: 13, fatsPer100: 11, carbsPer100: 1.1, packageGrams: 60 },
  { id: '6', name: 'Хлеб цельнозерновой', caloriesPer100: 247, proteinsPer100: 13, fatsPer100: 3.4, carbsPer100: 41 },
  { id: '7', name: 'Банан', caloriesPer100: 89, proteinsPer100: 1.1, fatsPer100: 0.3, carbsPer100: 23, packageGrams: 120 },
  { id: '8', name: 'Молоко 3.2%', caloriesPer100: 60, proteinsPer100: 3, fatsPer100: 3.2, carbsPer100: 4.8 },
  { id: '9', name: 'Овсянка (вареная)', caloriesPer100: 68, proteinsPer100: 2.5, fatsPer100: 1.5, carbsPer100: 12 },
  { id: '10', name: 'Лосось слабосоленый', caloriesPer100: 200, proteinsPer100: 22, fatsPer100: 12, carbsPer100: 0 },
  { id: '11', name: 'Творог 5%', caloriesPer100: 145, proteinsPer100: 16, fatsPer100: 5, carbsPer100: 3, packageGrams: 200 },
  { id: '12', name: 'Огурец', caloriesPer100: 15, proteinsPer100: 0.7, fatsPer100: 0.1, carbsPer100: 3.6 },

  // === Молочные продукты ===
  { id: '100', name: 'Молоко 2.5%', caloriesPer100: 54, proteinsPer100: 2.9, fatsPer100: 2.5, carbsPer100: 4.8 },
  { id: '101', name: 'Молоко 1%', caloriesPer100: 42, proteinsPer100: 3, fatsPer100: 1, carbsPer100: 4.8 },
  { id: '102', name: 'Молоко обезжиренное', caloriesPer100: 31, proteinsPer100: 3, fatsPer100: 0.1, carbsPer100: 4.8 },
  { id: '103', name: 'Кефир 3.2%', caloriesPer100: 59, proteinsPer100: 3, fatsPer100: 3.2, carbsPer100: 4 },
  { id: '104', name: 'Кефир 1%', caloriesPer100: 40, proteinsPer100: 3, fatsPer100: 1, carbsPer100: 4 },
  { id: '105', name: 'Йогурт питьевой', caloriesPer100: 75, proteinsPer100: 3, fatsPer100: 2.5, carbsPer100: 10 },
  { id: '106', name: 'Творог 9%', caloriesPer100: 169, proteinsPer100: 16, fatsPer100: 9, carbsPer100: 3 },
  { id: '107', name: 'Творог обезжиренный', caloriesPer100: 90, proteinsPer100: 18, fatsPer100: 0.5, carbsPer100: 3.3, packageGrams: 200 },
  { id: '108', name: 'Сыр твердый', caloriesPer100: 392, proteinsPer100: 35, fatsPer100: 27, carbsPer100: 0 },
  { id: '109', name: 'Сыр Моцарелла', caloriesPer100: 280, proteinsPer100: 22, fatsPer100: 20, carbsPer100: 2 },
  { id: '110', name: 'Сыр плавленый', caloriesPer100: 230, proteinsPer100: 11, fatsPer100: 19, carbsPer100: 3 },
  { id: '111', name: 'Сметана 20%', caloriesPer100: 206, proteinsPer100: 2.5, fatsPer100: 20, carbsPer100: 3.5 },
  { id: '112', name: 'Сметана 10%', caloriesPer100: 118, proteinsPer100: 3, fatsPer100: 10, carbsPer100: 3 },
  { id: '113', name: 'Сливки 33%', caloriesPer100: 330, proteinsPer100: 2, fatsPer100: 33, carbsPer100: 3 },
  { id: '114', name: 'Масло сливочное', caloriesPer100: 717, proteinsPer100: 0.9, fatsPer100: 81, carbsPer100: 0.1 },
  { id: '115', name: 'Масло топленое', caloriesPer100: 900, proteinsPer100: 0, fatsPer100: 99, carbsPer100: 0 },

  // === Мясо и птица ===
  { id: '200', name: 'Куриное бедро', caloriesPer100: 185, proteinsPer100: 20, fatsPer100: 11, carbsPer100: 0 },
  { id: '201', name: 'Куриное крыло', caloriesPer100: 203, proteinsPer100: 18, fatsPer100: 14, carbsPer100: 0 },
  { id: '202', name: 'Куриная голень', caloriesPer100: 172, proteinsPer100: 21, fatsPer100: 10, carbsPer100: 0 },
  { id: '203', name: 'Индейка филе', caloriesPer100: 135, proteinsPer100: 29, fatsPer100: 1.5, carbsPer100: 0 },
  { id: '204', name: 'Говядина вырезка', caloriesPer100: 158, proteinsPer100: 25, fatsPer100: 6, carbsPer100: 0 },
  { id: '205', name: 'Говяжий фарш', caloriesPer100: 230, proteinsPer100: 18, fatsPer100: 17, carbsPer100: 0 },
  { id: '206', name: 'Свинина вырезка', caloriesPer100: 143, proteinsPer100: 21, fatsPer100: 6, carbsPer100: 0 },
  { id: '207', name: 'Свинина шея', caloriesPer100: 267, proteinsPer100: 17, fatsPer100: 22, carbsPer100: 0 },
  { id: '208', name: 'Баранина', caloriesPer100: 209, proteinsPer100: 18, fatsPer100: 15, carbsPer100: 0 },
  { id: '209', name: 'Печень куриная', caloriesPer100: 136, proteinsPer100: 20, fatsPer100: 5, carbsPer100: 1 },
  { id: '210', name: 'Печень говяжья', caloriesPer100: 135, proteinsPer100: 20, fatsPer100: 4, carbsPer100: 4 },

  // === Рыба и морепродукты ===
  { id: '300', name: 'Семга запеченная', caloriesPer100: 180, proteinsPer100: 22, fatsPer100: 10, carbsPer100: 0 },
  { id: '301', name: 'Горбуша', caloriesPer100: 140, proteinsPer100: 22, fatsPer100: 6, carbsPer100: 0 },
  { id: '302', name: 'Тунец консервированный', caloriesPer100: 115, proteinsPer100: 25, fatsPer100: 1, carbsPer100: 0 },
  { id: '303', name: 'Треска', caloriesPer100: 82, proteinsPer100: 18, fatsPer100: 0.7, carbsPer100: 0 },
  { id: '304', name: 'Минтай', caloriesPer100: 72, proteinsPer100: 16, fatsPer100: 0.6, carbsPer100: 0 },
  { id: '305', name: 'Скумбрия', caloriesPer100: 191, proteinsPer100: 19, fatsPer100: 13, carbsPer100: 0 },
  { id: '306', name: 'Креветки', caloriesPer100: 99, proteinsPer100: 21, fatsPer100: 1, carbsPer100: 0 },
  { id: '307', name: 'Кальмары', caloriesPer100: 92, proteinsPer100: 18, fatsPer100: 1.5, carbsPer100: 0 },
  { id: '308', name: 'Икра красная', caloriesPer100: 260, proteinsPer100: 24, fatsPer100: 17, carbsPer100: 3 },

  // === Яйца ===
  { id: '400', name: 'Яйцо перепелиное', caloriesPer100: 168, proteinsPer100: 13, fatsPer100: 13, carbsPer100: 0.5, packageGrams: 10 },

  // === Крупы и макароны ===
  { id: '500', name: 'Рис бурый', caloriesPer100: 111, proteinsPer100: 2.6, fatsPer100: 0.9, carbsPer100: 23 },
  { id: '501', name: 'Гречка', caloriesPer100: 343, proteinsPer100: 13, fatsPer100: 3.4, carbsPer100: 72 },
  { id: '502', name: 'Овсяные хлопья', caloriesPer100: 366, proteinsPer100: 12, fatsPer100: 6, carbsPer100: 66 },
  { id: '503', name: 'Макароны тв. сорта', caloriesPer100: 350, proteinsPer100: 12, fatsPer100: 1.5, carbsPer100: 72 },
  { id: '504', name: 'Макароны яичные', caloriesPer100: 370, proteinsPer100: 14, fatsPer100: 4, carbsPer100: 70 },
  { id: '505', name: 'Киноа', caloriesPer100: 120, proteinsPer100: 4, fatsPer100: 2, carbsPer100: 21 },
  { id: '506', name: 'Кускус', caloriesPer100: 112, proteinsPer100: 3.5, fatsPer100: 0.2, carbsPer100: 22 },
  { id: '507', name: 'Пшено', caloriesPer100: 342, proteinsPer100: 11, fatsPer100: 3, carbsPer100: 70 },
  { id: '508', name: 'Перловка', caloriesPer100: 320, proteinsPer100: 9.5, fatsPer100: 1.5, carbsPer100: 67 },

  // === Хлеб и выпечка ===
  { id: '600', name: 'Хлеб белый пшеничный', caloriesPer100: 265, proteinsPer100: 8, fatsPer100: 3, carbsPer100: 50 },
  { id: '601', name: 'Хлеб ржаной', caloriesPer100: 210, proteinsPer100: 6, fatsPer100: 1, carbsPer100: 42 },
  { id: '602', name: 'Лаваш тонкий', caloriesPer100: 275, proteinsPer100: 9, fatsPer100: 2, carbsPer100: 55 },
  { id: '603', name: 'Батон нарезной', caloriesPer100: 262, proteinsPer100: 7.5, fatsPer100: 3, carbsPer100: 50 },

  // === Овощи и зелень ===
  { id: '700', name: 'Помидор', caloriesPer100: 18, proteinsPer100: 0.9, fatsPer100: 0.2, carbsPer100: 3.9 },
  { id: '701', name: 'Перец болгарский', caloriesPer100: 26, proteinsPer100: 1, fatsPer100: 0.3, carbsPer100: 5 },
  { id: '702', name: 'Капуста белокочанная', caloriesPer100: 25, proteinsPer100: 1.3, fatsPer100: 0.2, carbsPer100: 5.8 },
  { id: '703', name: 'Капуста цветная', caloriesPer100: 25, proteinsPer100: 1.9, fatsPer100: 0.3, carbsPer100: 5 },
  { id: '704', name: 'Брокколи', caloriesPer100: 34, proteinsPer100: 2.8, fatsPer100: 0.4, carbsPer100: 7 },
  { id: '705', name: 'Морковь', caloriesPer100: 41, proteinsPer100: 0.9, fatsPer100: 0.2, carbsPer100: 10 },
  { id: '706', name: 'Лук репчатый', caloriesPer100: 40, proteinsPer100: 1.1, fatsPer100: 0.1, carbsPer100: 9 },
  { id: '707', name: 'Чеснок', caloriesPer100: 149, proteinsPer100: 6.4, fatsPer100: 0.5, carbsPer100: 33 },
  { id: '708', name: 'Картофель', caloriesPer100: 77, proteinsPer100: 2, fatsPer100: 0.1, carbsPer100: 17 },
  { id: '709', name: 'Свекла', caloriesPer100: 43, proteinsPer100: 1.6, fatsPer100: 0.2, carbsPer100: 9.5 },
  { id: '710', name: 'Кабачок', caloriesPer100: 17, proteinsPer100: 1.2, fatsPer100: 0.3, carbsPer100: 3.4 },
  { id: '711', name: 'Баклажан', caloriesPer100: 25, proteinsPer100: 1, fatsPer100: 0.2, carbsPer100: 5.7 },
  { id: '712', name: 'Тыква', caloriesPer100: 26, proteinsPer100: 1, fatsPer100: 0.1, carbsPer100: 6.5 },
  { id: '713', name: 'Зелень (укроп/петрушка)', caloriesPer100: 36, proteinsPer100: 3, fatsPer100: 0.5, carbsPer100: 6 },
  { id: '714', name: 'Салат айсберг', caloriesPer100: 14, proteinsPer100: 1, fatsPer100: 0.2, carbsPer100: 2.5 },
  { id: '715', name: 'Шпинат', caloriesPer100: 23, proteinsPer100: 2.9, fatsPer100: 0.4, carbsPer100: 3.6 },
  { id: '716', name: 'Кукуруза консервированная', caloriesPer100: 90, proteinsPer100: 3, fatsPer100: 1.2, carbsPer100: 17 },
  { id: '717', name: 'Горошек зеленый', caloriesPer100: 80, proteinsPer100: 5, fatsPer100: 0.4, carbsPer100: 13 },

  // === Фрукты и ягоды ===
  { id: '800', name: 'Яблоко', caloriesPer100: 52, proteinsPer100: 0.3, fatsPer100: 0.2, carbsPer100: 14 },
  { id: '801', name: 'Апельсин', caloriesPer100: 43, proteinsPer100: 0.9, fatsPer100: 0.1, carbsPer100: 9 },
  { id: '802', name: 'Груша', caloriesPer100: 57, proteinsPer100: 0.4, fatsPer100: 0.1, carbsPer100: 15 },
  { id: '803', name: 'Виноград', caloriesPer100: 69, proteinsPer100: 0.7, fatsPer100: 0.2, carbsPer100: 18 },
  { id: '804', name: 'Клубника', caloriesPer100: 32, proteinsPer100: 0.7, fatsPer100: 0.3, carbsPer100: 8 },
  { id: '805', name: 'Малина', caloriesPer100: 52, proteinsPer100: 1.2, fatsPer100: 0.7, carbsPer100: 12 },
  { id: '806', name: 'Черника', caloriesPer100: 57, proteinsPer100: 0.7, fatsPer100: 0.3, carbsPer100: 14 },
  { id: '807', name: 'Арбуз', caloriesPer100: 30, proteinsPer100: 0.6, fatsPer100: 0.2, carbsPer100: 8 },
  { id: '808', name: 'Дыня', caloriesPer100: 34, proteinsPer100: 0.8, fatsPer100: 0.2, carbsPer100: 8 },
  { id: '809', name: 'Гранат', caloriesPer100: 83, proteinsPer100: 1.7, fatsPer100: 1.2, carbsPer100: 14 },
  { id: '810', name: 'Киви', caloriesPer100: 61, proteinsPer100: 1.1, fatsPer100: 0.5, carbsPer100: 15 },
  { id: '811', name: 'Ананас', caloriesPer100: 50, proteinsPer100: 0.5, fatsPer100: 0.1, carbsPer100: 13 },

  // === Орехи и семена ===
  { id: '900', name: 'Миндаль', caloriesPer100: 579, proteinsPer100: 21, fatsPer100: 49, carbsPer100: 21 },
  { id: '901', name: 'Грецкий орех', caloriesPer100: 654, proteinsPer100: 15, fatsPer100: 65, carbsPer100: 14 },
  { id: '902', name: 'Фундук', caloriesPer100: 628, proteinsPer100: 15, fatsPer100: 61, carbsPer100: 17 },
  { id: '903', name: 'Арахис', caloriesPer100: 567, proteinsPer100: 26, fatsPer100: 49, carbsPer100: 16 },
  { id: '904', name: 'Семена подсолнечника', caloriesPer100: 584, proteinsPer100: 20, fatsPer100: 51, carbsPer100: 11 },
  { id: '905', name: 'Семена чиа', caloriesPer100: 486, proteinsPer100: 17, fatsPer100: 31, carbsPer100: 42 },
  { id: '906', name: 'Кунжут', caloriesPer100: 573, proteinsPer100: 18, fatsPer100: 49, carbsPer100: 23 },

  // === Масла, соусы, сладости ===
  { id: '1000', name: 'Масло оливковое', caloriesPer100: 884, proteinsPer100: 0, fatsPer100: 100, carbsPer100: 0 },
  { id: '1001', name: 'Масло подсолнечное', caloriesPer100: 884, proteinsPer100: 0, fatsPer100: 100, carbsPer100: 0 },
  { id: '1002', name: 'Мед', caloriesPer100: 329, proteinsPer100: 0.3, fatsPer100: 0, carbsPer100: 81 },
  { id: '1003', name: 'Сахар', caloriesPer100: 399, proteinsPer100: 0, fatsPer100: 0, carbsPer100: 100 },
  { id: '1004', name: 'Шоколад темный 70%', caloriesPer100: 550, proteinsPer100: 7, fatsPer100: 40, carbsPer100: 48 },
  { id: '1005', name: 'Шоколад молочный', caloriesPer100: 535, proteinsPer100: 6, fatsPer100: 30, carbsPer100: 60 },
  { id: '1006', name: 'Печенье овсяное', caloriesPer100: 420, proteinsPer100: 7, fatsPer100: 15, carbsPer100: 68 },
  { id: '1007', name: 'Вафли', caloriesPer100: 520, proteinsPer100: 5, fatsPer100: 28, carbsPer100: 64 },
  { id: '1008', name: 'Мороженое пломбир', caloriesPer100: 227, proteinsPer100: 3.7, fatsPer100: 15, carbsPer100: 19 },
  { id: '1009', name: 'Джем/варенье', caloriesPer100: 250, proteinsPer100: 0.3, fatsPer100: 0, carbsPer100: 63 },
  { id: '1010', name: 'Майонез', caloriesPer100: 680, proteinsPer100: 1, fatsPer100: 72, carbsPer100: 2.5 },
  { id: '1011', name: 'Кетчуп', caloriesPer100: 100, proteinsPer100: 1.2, fatsPer100: 0.3, carbsPer100: 23 },
  { id: '1012', name: 'Горчица', caloriesPer100: 66, proteinsPer100: 5, fatsPer100: 3, carbsPer100: 5 },
  { id: '1013', name: 'Соевый соус', caloriesPer100: 55, proteinsPer100: 5, fatsPer100: 0, carbsPer100: 6 },

  // === Напитки ===
  { id: '1100', name: 'Сок апельсиновый', caloriesPer100: 45, proteinsPer100: 0.7, fatsPer100: 0, carbsPer100: 10 },
  { id: '1101', name: 'Кола', caloriesPer100: 42, proteinsPer100: 0, fatsPer100: 0, carbsPer100: 10.5 },
  { id: '1102', name: 'Пиво светлое', caloriesPer100: 42, proteinsPer100: 0.5, fatsPer100: 0, carbsPer100: 4.5 },
  { id: '1103', name: 'Вино сухое', caloriesPer100: 82, proteinsPer100: 0, fatsPer100: 0, carbsPer100: 2.5 },

  // === Бобовые ===
  { id: '1200', name: 'Фасоль красная', caloriesPer100: 127, proteinsPer100: 9, fatsPer100: 0.5, carbsPer100: 22 },
  { id: '1201', name: 'Нут', caloriesPer100: 139, proteinsPer100: 8, fatsPer100: 2.5, carbsPer100: 22 },
  { id: '1202', name: 'Чечевица', caloriesPer100: 116, proteinsPer100: 9, fatsPer100: 0.4, carbsPer100: 20 },
];
