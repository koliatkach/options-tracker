// Точка входу — ініціалізація і координація модулів
(function () {
    let positions = [];
    let autoRefreshTimer = null;

    // Встановлюємо сьогоднішню дату за замовчуванням
    document.getElementById('inp-date').valueAsDate = new Date();

    // Ініціалізація модалів
    Modals.init(async (data) => {
        try {
            await API.closePosition(data.id, {
                qty: data.qty,
                price: data.price,
                date: data.date,
                notes: data.notes
            });
            Modals.closeClose();
            await loadAndRender();
        } catch (e) {
            alert(e.message);
        }
    });

    // Ініціалізація рендеру
    Render.init(
        (position) => Modals.openClose(position, null),
        (position) => Modals.openDetail(position),
        async (id) => {
            if (!confirm('Видалити позицію?')) return;
            try {
                await API.deletePosition(id);
                await loadAndRender();
            } catch (e) {
                alert(e.message);
            }
        }
    );

    // Фільтр
    document.getElementById('filter-status').addEventListener('change', () => {
        renderWithFilter();
    });

    // Кнопка додавання
    document.getElementById('btn-add').addEventListener('click', async () => {
        const date = document.getElementById('inp-date').value;
        const ticker = document.getElementById('inp-ticker').value.trim().toUpperCase();
        const entry = parseFloat(document.getElementById('inp-entry').value);
        const qty = parseFloat(document.getElementById('inp-qty').value);
        const reason = document.getElementById('inp-reason').value.trim();

        if (!date || !ticker || isNaN(entry) || isNaN(qty) || qty === 0) {
            alert('Заповни всі поля (кількість ≠ 0)');
            return;
        }

        try {
            await API.createPosition({ date, ticker, entry, qty, reason });
            await loadAndRender();

            // Очистка форми
            document.getElementById('inp-ticker').value = '';
            document.getElementById('inp-entry').value = '';
            document.getElementById('inp-qty').value = '';
            document.getElementById('inp-reason').value = '';
        } catch (e) {
            alert(e.message);
        }
    });

    // Завантаження і рендер
    async function loadAndRender() {
        try {
            positions = await API.getPositions();
            renderWithFilter();
            Stats.update(positions);
        } catch (e) {
            console.error(e);
        }
    }

    function renderWithFilter() {
        const filter = document.getElementById('filter-status').value;
        Render.positions(positions, filter);
    }

    // Автооновлення кожні 5 секунд
    function startAutoRefresh() {
        if (autoRefreshTimer) clearInterval(autoRefreshTimer);
        autoRefreshTimer = setInterval(loadAndRender, 5000);
    }

    // Старт
    loadAndRender();
    startAutoRefresh();
})();
