// Логіка модальних вікон
const Modals = {
    _closingId: null,
    _onCloseConfirm: null,

    // Модал закриття позиції
    openClose(position, onConfirm) {
        this._closingId = position._id;
        this._onCloseConfirm = onConfirm;

        document.getElementById('modal-pos-info').textContent =
            `Тікер: ${position.ticker} | Вхід: ${position.entry} | Відкрите qty: ${position.openQty}`;

        document.getElementById('modal-close-qty').value = position.openQty;
        document.getElementById('modal-exit-price').value = '';
        document.getElementById('modal-exit-notes').value = '';
        document.getElementById('modal-exit-date').valueAsDate = new Date();

        document.getElementById('close-modal').classList.add('active');
    },

    closeClose() {
        this._closingId = null;
        this._onCloseConfirm = null;
        document.getElementById('close-modal').classList.remove('active');
    },

    getCloseData() {
        return {
            id: this._closingId,
            qty: parseFloat(document.getElementById('modal-close-qty').value),
            price: parseFloat(document.getElementById('modal-exit-price').value),
            date: document.getElementById('modal-exit-date').value,
            notes: document.getElementById('modal-exit-notes').value.trim()
        };
    },

    // Модал деталей
    openDetail(position) {
        const closesInfo = position.closes.map(c =>
            `${c.date || ''} • qty: ${c.qty} @ ${c.price}${c.notes ? ' — ' + c.notes : ''}`
        ).join('\n');

        const text =
            `Дата входу: ${position.date}\n` +
            `Тікер: ${position.ticker}\n` +
            `Ціна входу: ${position.entry}\n` +
            `Кількість: ${position.totalQty}\n` +
            (position.reason ? `Причина: ${position.reason}\n` : '') +
            '\n' +
            (position.closes.length ? 'Виходи:\n' + closesInfo : 'Виходів ще немає');

        document.getElementById('detail-title').textContent = `${position.ticker} — деталі`;
        document.getElementById('detail-body').textContent = text;
        document.getElementById('detail-modal').classList.add('active');
    },

    closeDetail() {
        document.getElementById('detail-modal').classList.remove('active');
    },

    // Ініціалізація подій
    init(onCloseConfirm) {
        document.getElementById('btn-cancel-close').addEventListener('click', () => this.closeClose());
        document.getElementById('btn-close-detail').addEventListener('click', () => this.closeDetail());

        document.getElementById('btn-confirm-close').addEventListener('click', async () => {
            const data = this.getCloseData();

            if (isNaN(data.qty) || data.qty === 0) {
                alert('Вкажи кількість (≠ 0)');
                return;
            }
            if (isNaN(data.price)) {
                alert('Вкажи ціну виходу');
                return;
            }

            await onCloseConfirm(data);
        });
    }
};
