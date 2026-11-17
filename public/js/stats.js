// Підрахунок і відображення статистики
const Stats = {
    calcPnL(position) {
        return position.closes.reduce((sum, c) => {
            return sum + (c.price - position.entry) * c.qty;
        }, 0);
    },

    update(positions) {
        const totalPositions = positions.length;
        const totalOpenQty = positions.reduce((sum, p) => sum + p.openQty, 0);
        const totalPnL = positions.reduce((sum, p) => sum + this.calcPnL(p), 0);

        document.getElementById('stat-total').textContent = totalPositions;
        document.getElementById('stat-open').textContent =
            totalOpenQty.toFixed(4).replace(/\.?0+$/, '');

        const pnlEl = document.getElementById('stat-pnl');
        pnlEl.textContent = `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toFixed(2)}`;
        pnlEl.className = 'value ' + (totalPnL >= 0 ? 'green' : 'red');
    }
};
