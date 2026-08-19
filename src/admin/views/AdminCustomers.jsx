import React, { useState, useEffect, useMemo } from 'react';
import { Users, Award, Edit2, Trash2, X, Save, Search, ArrowUpDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import './AdminCustomers.css';

export const AdminCustomers = () => {
  const { showToast } = useApp();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCust, setSelectedCust] = useState(null);
  const [bonusInput, setBonusInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [spentSort, setSpentSort] = useState('all');

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/customers');
      if (res.ok) setCustomers(await res.json());
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    let result = customers.filter((c) => {
      const q = searchTerm.toLowerCase().trim();
      if (!q) return true;
      const nameMatch = (c.name || '').toLowerCase().includes(q);
      const phoneMatch = (c.phone || '').toLowerCase().includes(q);
      const emailMatch = (c.email || '').toLowerCase().includes(q);
      const cityMatch = (c.city || '').toLowerCase().includes(q);
      return nameMatch || phoneMatch || emailMatch || cityMatch;
    });

    if (spentSort === 'spent-desc') {
      result.sort((a, b) => (Number(b.totalSpent) || 0) - (Number(a.totalSpent) || 0));
    } else if (spentSort === 'spent-asc') {
      result.sort((a, b) => (Number(a.totalSpent) || 0) - (Number(b.totalSpent) || 0));
    } else if (spentSort === 'orders-desc') {
      result.sort((a, b) => (Number(b.totalOrders) || 0) - (Number(a.totalOrders) || 0));
    }

    return result;
  }, [customers, searchTerm, spentSort]);

  const handleOpenBonusModal = (cust) => {
    setSelectedCust(cust);
    setBonusInput(cust.bonusBalance || 0);
  };

  const handleSaveBonus = async (e) => {
    e.preventDefault();
    if (!selectedCust) return;

    try {
      const res = await fetch(`/api/customers/${selectedCust.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bonusBalance: Number(bonusInput) || 0 })
      });
      if (res.ok) {
        const updated = await res.json();
        setCustomers((prev) => prev.map((c) => (String(c.id) === String(selectedCust.id) ? updated : c)));
        if (showToast) showToast(`Бонусный баланс клиента "${selectedCust.name}" обновлен`);
        setSelectedCust(null);
      }
    } catch (err) {
      console.error('Failed to update bonus balance:', err);
      if (showToast) showToast('Ошибка сохранения бонусов', 'error');
    }
  };

  const handleDeleteCustomer = async (cust) => {
    if (!window.confirm(`Вы действительно хотите удалить покупателя "${cust.name}"?`)) return;

    try {
      const targetId = cust.id || cust.email;
      const res = await fetch(`/api/customers/${encodeURIComponent(targetId)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setCustomers((prev) => prev.filter((c) => String(c.id) !== String(cust.id) && c.email !== cust.email));
        if (showToast) showToast(`Покупатель "${cust.name}" удален`);
      } else {
        const errData = await res.json().catch(() => ({}));
        if (showToast) showToast(errData.message || 'Ошибка удаления', 'error');
      }
    } catch (err) {
      console.error('Failed to delete customer:', err);
      if (showToast) showToast('Ошибка соединения с сервером', 'error');
    }
  };

  const formatPrice = (val) => {
    return new Intl.NumberFormat('ru-RU').format(val || 0) + ' ₸';
  };

  return (
    <div className="admin-customers-view">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Покупатели и Лояльность</h1>
          <p className="admin-page-subtitle">База зарегистрированных клиентов и начисление бонусов Autolider</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="admin-card" style={{ marginBottom: "16px", padding: "16px 20px", display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <div className="search-input-box" style={{ flex: "1 1 300px", maxWidth: "440px" }}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Поиск по имени, телефону, Email или городу..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchTerm("")}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center" }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <ArrowUpDown size={15} style={{ position: "absolute", left: "12px", pointerEvents: "none", color: "#64748b", zIndex: 1 }} />
          <select
            value={spentSort}
            onChange={(e) => setSpentSort(e.target.value)}
            style={{
              padding: "9px 14px 9px 34px",
              borderRadius: "10px",
              border: "1px solid #cbd5e1",
              background: "#f8fafc",
              fontSize: "13.5px",
              fontWeight: 600,
              color: "#1e293b",
              outline: "none",
              cursor: "pointer"
            }}
          >
            <option value="all">Сортировка по умолчанию</option>
            <option value="spent-desc">Сумма покупок (сначала наибольшие)</option>
            <option value="spent-asc">Сумма покупок (сначала наименьшие)</option>
            <option value="orders-desc">Количество заказов (по убыванию)</option>
          </select>
        </div>
      </div>

      <div className="admin-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Имя клиента</th>
                <th>Телефон / Email</th>
                <th>Город</th>
                <th>Заказов</th>
                <th>Всего потрачено</th>
                <th>Бонусный баланс</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                    Клиенты не найдены
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <span className="font-bold">{c.name}</span>
                    </td>
                    <td>
                      <div className="customer-contact-col">
                        <span className="font-medium">{c.phone}</span>
                        <span className="text-sub">{c.email}</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-sub">{c.city}</span>
                    </td>
                    <td>
                      <span className="font-bold">{c.totalOrders}</span>
                    </td>
                    <td>
                      <span className="font-bold text-price">{formatPrice(c.totalSpent)}</span>
                    </td>
                    <td>
                      <span className="bonus-badge">
                        <Award size={14} />
                        {formatPrice(c.bonusBalance)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          className="btn-table-action edit"
                          onClick={() => handleOpenBonusModal(c)}
                          title="Начислить/Изменить бонусы"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="btn-table-action delete"
                          onClick={() => handleDeleteCustomer(c)}
                          title="Удалить покупателя"
                          style={{ color: '#dc2626', borderColor: '#fca5a5', background: '#fef2f2' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCust && (
        <div className="admin-modal-overlay" onClick={() => setSelectedCust(null)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="modal-title">Бонусы клиента: {selectedCust.name}</h3>
              <button className="btn-modal-close" onClick={() => setSelectedCust(null)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveBonus} className="admin-modal-form">
              <div className="form-group">
                <label>Бонусный баланс (₸)</label>
                <input
                  type="number"
                  required
                  value={bonusInput}
                  onChange={(e) => setBonusInput(e.target.value)}
                />
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="btn-admin-secondary"
                  onClick={() => setSelectedCust(null)}
                >
                  Отмена
                </button>
                <button type="submit" className="btn-admin-primary">
                  <Save size={16} />
                  <span>Сохранить бонусы</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
