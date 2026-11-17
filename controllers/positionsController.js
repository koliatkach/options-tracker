const Position = require('../models/Position');

// GET /api/positions
const getPositions = async (req, res, next) => {
    try {
        const positions = await Position.find().sort({ createdAt: -1 });
        res.json(positions);
    } catch (error) {
        next(error);
    }
};

// POST /api/positions
const createPosition = async (req, res, next) => {
    try {
        const { date, ticker, entry, qty, reason, type } = req.body;

        if (!date || !ticker || typeof entry !== 'number' || typeof qty !== 'number' || qty === 0) {
            return res.status(400).json({ error: 'Невірні дані. Перевір дата, тікер, ціну входу, кількість.' });
        }

        if (!type || !['options', 'futures', 'spot'].includes(type)) {
            return res.status(400).json({ error: 'Тип обовʼязковий (options / futures / spot).' });
        }

        const position = await Position.create({
            date,
            ticker,
            type,
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

// POST /api/positions/:id/close
const closePosition = async (req, res, next) => {
    try {
        const position = await Position.findById(req.params.id);

        if (!position) {
            return res.status(404).json({ error: 'Позицію не знайдено' });
        }

        const { qty, price, date, notes, commission } = req.body;

        if (typeof qty !== 'number' || qty === 0 || typeof price !== 'number') {
            return res.status(400).json({ error: 'Невірні дані для закриття' });
        }

        const comm = typeof commission === 'number' && !isNaN(commission) ? commission : 0;

        if (position.openQty > 0) {
            if (qty <= 0 || qty > position.openQty + 1e-9) {
                return res.status(400).json({ error: 'Кількість перевищує відкритий обсяг (long).' });
            }
        } else if (position.openQty < 0) {
            if (qty >= 0 || qty < position.openQty - 1e-9) {
                return res.status(400).json({ error: 'Кількість перевищує відкритий обсяг (short).' });
            }
        } else {
            return res.status(400).json({ error: 'Позиція вже повністю закрита' });
        }

        position.closes.push({
            qty,
            price,
            date: date || null,
            notes: notes || '',
            commission: comm
        });

        position.openQty -= qty;

        await position.save();
        res.json(position);
    } catch (error) {
        next(error);
    }
};

// DELETE /api/positions/:id
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
