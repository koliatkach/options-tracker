// Рендеринг таблиці позицій
const Render = {
    _onClose: null,
    _onDetail: null,
    _onDelete: null,

    init(onClose, onDetail, onDelete) {
        this._onClose = onClose;
        this._onDetail = onDetail;
        this._onDelete = onDelete;
    },

    positions(positions, filters) {
        const { status, type } = filters;
        const container = document.getElementById('positions-table');

        const filtered = positions.filter(p => {
            if (type && p.type !== type) return false;
            if (status === 'open' && Math.abs(p.openQty) < 1e-9) return false;
            if (status === 'closed' && Math.abs(p.openQty) >= 1e-9) return false;
            return true;
        });

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span>📭</span>
                    Позицій не знайдено для цього типу/фільтра.
                </div>`;
            return;
        }

        const pnlOf = (p) => p.closes.reduce((s, c) => s + (c.price - p.entry) * c.qty, 0);

        const rows = filtered.map(p => {
            const pnl = pnlOf(p);
            const isOpen = Math.abs(p.openQty) >= 1e-9;

            const pnlHtml = p.closes.length
                ? `<span class="${pnl >= 0 ? 'green' : 'red'}">${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}</span>`
                : '—';

            const statusBadge = isOpen
                ? `<span class="badge badge-open">Відкрита (${p.openQty.toFixed(4).replace(/\.?0+$/, '')})</span>`
                : `<span class="badge badge-closed">Закрита</span>`;

            const reason = p.reason
                ? (p.reason.length > 30 ? p.reason.slice(0, 27) + '...' : p.reason)
                : '—';

            return `
                <tr>
                    <td>${p.date}</td>
                    <td><strong>${p.ticker}</strong></td>
                    <td>${p.entry}</td>
                    <td>${p.totalQty}</td>
                    <td>${p.openQty.toFixed(4).replace(/\.?0+$/, '')}</td>
                    <td>${reason}</td>
                    <td>${pnlHtml}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <button class="btn-secondary" data-action="close" data-id="${p._id}" ${!isOpen ? 'disabled' : ''}>
                            Закрити
                        </button>
                    </td>
                    <td>
                        <button class="btn-secondary" data-action="detail" data-id="${p._id}">
                            Деталі
                        </button>
                    </td>
                    <td>
                        <button class="btn-icon" data-action="delete" data-id="${p._id}">🗑</button>
                    </td>
                </tr>
            `;
        }).join('');

        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Дата</th>
                        <th>Тікер</th>
                        <th>Ціна входу</th>
                        <th>Початк. qty</th>
                        <th>Відкритий qty</th>
                        <th>Причина</th>
                        <th>P&L</th>
                        <th>Статус</th>
                        <th>Закрити</th>
                        <th>Деталі</th>
                        <th>🗑</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        `;

        container.querySelectorAll('button[data-action]').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                const id = btn.dataset.id;
                const position = positions.find(p => p._id === id);
                if (!position) return;

                if (action === 'close') this._onClose(position);
                if (action === 'detail') this._onDetail(position);
                if (action === 'delete') this._onDelete(id);
            });
        });
    }
};
