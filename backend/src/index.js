const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Загружаем .env.production на сервере или .env локально
const envPath = fs.existsSync(path.resolve(__dirname, '../.env.production'))
  ? path.resolve(__dirname, '../.env.production')
  : path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const foodRoutes = require('./routes/food');
const recipeRoutes = require('./routes/recipes');
const weightRoutes = require('./routes/weight');
const waterRoutes = require('./routes/water');
const visionRoutes = require('./routes/vision');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/weight', weightRoutes);
app.use('/api/water', waterRoutes);
app.use('/api/vision', visionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 EasyWay API запущен на http://localhost:${PORT}`);
  console.log(`📋 Эндпоинты:`);
  console.log(`   POST   /api/auth/register`);
  console.log(`   POST   /api/auth/login`);
  console.log(`   GET    /api/auth/profile`);
  console.log(`   PUT    /api/auth/profile`);
  console.log(`   GET    /api/products`);
  console.log(`   GET    /api/products/search?q=`);
  console.log(`   GET    /api/products/barcode/:code`);
  console.log(`   POST   /api/products`);
  console.log(`   DELETE /api/products/:id`);
  console.log(`   POST   /api/products/:id/favorite`);
  console.log(`   GET    /api/food?date=YYYY-MM-DD`);
  console.log(`   POST   /api/food`);
  console.log(`   DELETE /api/food/:id`);
  console.log(`   GET    /api/recipes`);
  console.log(`   POST   /api/recipes`);
  console.log(`   DELETE /api/recipes/:id`);
  console.log(`   GET    /api/weight`);
  console.log(`   POST   /api/weight`);
  console.log(`   GET    /api/water`);
  console.log(`   POST   /api/water`);
  console.log(`   POST   /api/vision/analyze-photo`);
  console.log(`   POST   /api/vision/analyze-text`);
  console.log(`   GET    /api/health`);
});
