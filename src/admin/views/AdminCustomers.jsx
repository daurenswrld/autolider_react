import React, { useState, useEffect } from 'react';
import { Users, Award, Edit2, X, Save } from 'lucide-react';
import './AdminCustomers.css';

export const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCust, setSelectedCust] = useState(null);
  const [bonusInput, setBonusInput] = useState('');

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
        setCustomers((prev) => prev.map((c) => (c.id === selectedCust.id ? updated : c)));
        setSelectedCust(null);
      }
    } catch (err) {
      console.error('Failed to update bonus balance:', err);
    }
  };

  const formatPrice = (val) => {
    return new Intl.NumberFormat('ru-RU').format(val || 0) + ' ₸';
  };

  return (
    <div className="admin-customers-view">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Покупатели и Лояльность (OpenCart Customers)</h1>
          <p className="admin-page-subtitle">База зарегистрированных клиентов и начисление бонусов Autolider</p>
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
              {customers.map((c) => (
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
                    <button
                      className="btn-table-action edit"
                      onClick={() => handleOpenBonusModal(c)}
                      title="Начислить/Изменить бонусы"
                    >
                      <Edit2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
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
