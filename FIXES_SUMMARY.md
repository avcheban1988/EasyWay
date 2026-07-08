# Инструкция по завершению исправлений

## 1. Установка недостающих зависимостей

```bash
cd /home/aleks/Документы/webDev/Счетчик\ Ккалорий/EasyWay/MyNewApp
npm install react-native-svg-transformer --save-dev
```

## 2. Инициализация бэкенда

```bash
cd backend
npm install
```

Создайте файл `.env` в папке backend:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=easyway_calories
DB_PORT=3306
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
PORT=3001
```

Инициализируйте БД:
```bash
node src/db/init.js
node src/db/seed.js
```

Запустите бэкенд:
```bash
npm start
```

## 3. Запуск фронтенда

```bash
cd ../
npm start
```

## 4. Что было исправлено

### Фронтенд
- ✅ Дата рождения вместо возраста в anthropometry.tsx
- ✅ PREMIUM статус в профиле
- ✅ Кнопка редактирования в избранном
- ✅ Улучшено логирование saveProfile и API

### Бэкенд
- ✅ Поддержка birth_date в БД и API
- ✅ Автоматическое вычисление возраста из даты
- ✅ Обновлены endpoints GET/PUT /profile

### Конфиг
- ✅ metro.config.js для поддержки SVG
- ✅ Клавиатура настроена в anthropometry.tsx (keyboardDismissMode="interactive")

## 5. Тестирование

### Проверка saveProfile
1. Авторизуйтесь (test@easyway.app / test123)
2. Перейдите в профиль и обновите данные
3. Проверьте консоль - должны быть логи [API] и [saveProfile]

### Проверка даты рождения
1. Пройдите онбординг
2. На экране anthro pometry выберите дату рождения
3. Возраст должен вычисляться автоматически

### Проверка PREMIUM
1. Пользователь test@easyway.app имеет is_premium: true
2. В профиле должна быть желтая звездочка "PREMIUM"

## 6. Возможные проблемы

### Ошибка "Cannot find module 'react-native-svg-transformer'"
Убедитесь, что выполнили `npm install react-native-svg-transformer --save-dev`

### Ошибка подключения к БД
Проверьте:
- MySQL запущен
- Правильные учетные данные в .env
- База easyway_calories существует

### Ошибка авторизации при saveProfile
Логируйте в консоль:
- `api.getToken()` - должен вернуть не-null значение
- Проверьте headers в сетевых запросах
