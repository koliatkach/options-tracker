const Position = require('../models/Position');

// Отримати всі позиції
const getPositions = async (req, res, next) => {
    try {
        const positions = await Position.find().sort({ createdAt: -1 });
        res.json(positions);
    } catch (error) {
        next(error);
    }
};

// Додати нову позицію
const createPosition = async (req, res, next) => {
    try {
        const { date, ticker, entry, qty, reason } = req.body;

        if (!date || !ticker || typeof entry !== 'number' || typeof qty !== 'number' || qty === 0) {
            return res.status(400).json({ error: 'Невірні дані. Перевір всі поля.' });
        }

        const position = await Position.create({
            date,
            ticker,
            entry,
            totalQty: qty,
            openQty: qty,
            reason: reason || '',
            closes: []
        });

        res.status(201).json(position);
    } catch (error) {
        next(error);
    }
};

// Часткове/повне закриття позиції
const closePosition = async (req, res, next) => {
    try {
        const position = await Position.findById(req.params.id);

        if (!position) {
            return res.status(404).json({ error: 'Позицію не знайдено' });
        }

        const { qty, price, date, notes } = req.body;

        if (typeof qty !== 'number' || qty === 0 || typeof price !== 'number') {
            return res.status(400).json({ error: 'Невірні дані для закриття' });
        }

        // Перевірка напрямку (long/short)
        if (position.openQty > 0) {
            if (qty <= 0 || qty > position.openQty + 1e-9) {
                return res.status(400).json({ error: 'Кількість перевищує відкритий обсяг' });
            }
        } else if (position.openQty < 0) {
            if (qty >= 0 || qty < position.openQty - 1e-9) {
                return res.status(400).json({ error: 'Кількість перевищує відкритий обсяг' });
            }
        } else {
            return res.status(400).json({ error: 'Позиція вже повністю закрита' });
        }

        position.closes.push({ qty, price, date: date || null, notes: notes || '' });
        position.openQty -= qty;

        await position.save();
        res.json(position);
    } catch (error) {
        next(error);
    }
};

// Видалити позицію
const deletePosition = async (req, res, next) => {
    try {
        const position = await Position.findByIdAndDelete(req.params.id);

        if (!position) {
            return res.status(404).json({ error: 'Позицію не знайдено' });
        }

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPositions,
    createPosition,
    closePosition,
    deletePosition
};
