const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const positionsRouter = require('./routes/positions');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Підключення до БД
connectDB();

// Мідлвари
app.use(cors());
app.use(express.json());

// Статичні файли (фронтенд)
app.use(express.static(path.join(__dirname, 'public')));

// API маршрути
app.use('/api/positions', positionsRouter);

// Якщо маршрут не знайдено — повертаємо index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Обробка помилок (завжди останній мідлвар)
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
