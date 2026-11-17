const mongoose = require('mongoose');

const CloseSchema = new mongoose.Schema({
    qty: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    date: {
        type: String,
        default: null
    },
    notes: {
        type: String,
        default: ''
    },
    commission: {
        type: Number,
        default: 0
    }
});

const PositionSchema = new mongoose.Schema({
    date: {
        type: String,
        required: true
    },
    ticker: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['options', 'futures', 'spot'],
        required: true
    },
    entry: {
        type: Number,
        required: true
    },
    totalQty: {
        type: Number,
        required: true
    },
    openQty: {
        type: Number,
        required: true
    },
    riskPercent: {              // ← НОВЕ ПОЛЕ
        type: Number,
        default: null           // збережемо як число (наприклад 1 = 1%)
    },
    reason: {
        type: String,
        default: ''
    },
    closes: [CloseSchema]
}, {
    timestamps: true
});

module.exports = mongoose.model('Position', PositionSchema);
