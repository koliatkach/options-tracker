const express = require('express');
const router = express.Router();
const {
    getPositions,
    createPosition,
    closePosition,
    deletePosition
} = require('../controllers/positionsController');

router.get('/', getPositions);
router.post('/', createPosition);
router.post('/:id/close', closePosition);
router.delete('/:id', deletePosition);

module.exports = router;
