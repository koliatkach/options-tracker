// Підрахунок і відображення статистики
const Stats = {
    calcPnL(position) {
        return position.closes.reduce((sum, c) => {
            const comm = typeof c.commission === 'number' ? c.commission : 0;
            return sum + ((c.price - position.entry) * c.qty - comm);
        }, 0);
    },

    update(positions) {
        const totalPositions = positions.length;

        // Кількість відкритих угод (позицій з ненульовим openQty)
        const openTradesCount = positions.filter(
            p => Math.abs(p.openQty) >= 1e-9
        ).length;

        const totalPnL = positions.reduce((sum, p) => sum + this.calcPnL(p), 0);

        document.getElementById('stat-total').textContent = totalPositions;
        document.getElementById('stat-open').textContent = openTradesCount;

        const pnlEl = document.getElementById('stat-pnl');
        pnlEl.textContent = `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toFixed(2)}`;
        pnlEl.className = 'value ' + (totalPnL >= 0 ? 'green' : 'red');
    }
};
