// Точка входу — ініціалізація і координація модулів
(function () {
    let positions = [];
    let autoRefreshTimer = null;
    let currentType = 'options'; // за замовчуванням вкладка "Опціони"

    // сьогоднішня дата за замовчуванням
    document.getElementById('inp-date').valueAsDate = new Date();
    document.getElementById('modal-exit-date').valueAsDate = new Date();

    // ініціалізація модалів
    Modals.init(async (data) => {
        try {
            await API.closePosition(data.id, {
                qty: data.qty,
                price: data.price,
                date: data.date,
                notes: data.notes,
                commission: data.commission
            });
            Modals.closeClose();
            await loadAndRender();
        } catch (e) {
            alert(e.message);
        }
    });

    // ініціалізація рендеру
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

    // таби типів
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            currentType = type;

            document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            renderWithFilter();
        });
    });

    // фільтр статусу
    document.getElementById('filter-status').addEventListener('change', () => {
        renderWithFilter();
    });

    // кнопка додавання
    document.getElementById('btn-add').addEventListener('click', async () => {
        const date = document.getElementById('inp-date').value;
        const ticker = document.getElementById('inp-ticker').value.trim().toUpperCase();
        const type = document.getElementById('inp-type').value;
        const entry = parseFloat(document.getElementById('inp-entry').value);
        const qty = parseFloat(document.getElementById('inp-qty').value);
        const riskStr = document.getElementById('inp-risk').value;
        const reason = document.getElementById('inp-reason').value.trim();

        if (!date || !ticker || !type || isNaN(entry) || isNaN(qty) || qty === 0) {
            alert('Заповни: дата, тікер, тип, ціну входу, кількість (≠ 0)');
            return;
        }

        try {
            await API.createPosition({ date, ticker, type, entry, qty, reason });
            await loadAndRender();

            document.getElementById('inp-ticker').value = '';
            document.getElementById('inp-type').value = '';
            document.getElementById('inp-entry').value = '';
            document.getElementById('inp-qty').value = '';
            document.getElementById('inp-risk').value = '';
            document.getElementById('inp-reason').value = '';
        } catch (e) {
            alert(e.message);
        }
    });

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
        const status = document.getElementById('filter-status').value;
        Render.positions(positions, { status, type: currentType });
    }

    function startAutoRefresh() {
        if (autoRefreshTimer) clearInterval(autoRefreshTimer);
        autoRefreshTimer = setInterval(loadAndRender, 5000);
    }

    // старт
    loadAndRender();
    startAutoRefresh();
})();
