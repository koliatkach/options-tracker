// Всі запити до бекенду
const API = {
    async getPositions() {
        const res = await fetch('/api/positions');
        if (!res.ok) throw new Error('Помилка завантаження позицій');
        return res.json();
    },

    async createPosition(data) {
        const res = await fetch('/api/positions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'Помилка створення позиції');
        }
        return res.json();
    },

    async closePosition(id, data) {
        const res = await fetch(`/api/positions/${id}/close`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'Помилка закриття позиції');
        }
        return res.json();
    },

    async deletePosition(id) {
        const res = await fetch(`/api/positions/${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'Помилка видалення позиції');
        }
        return res.json();
    }
};
