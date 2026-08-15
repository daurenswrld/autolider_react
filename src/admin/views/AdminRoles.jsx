import React, { useState, useEffect } from 'react';
import { ShieldAlert, Plus, Users, Key, Save, X, CheckCircle2 } from 'lucide-react';
import './AdminRoles.css';

export const AdminRoles = () => {
  const [roles, setRoles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    description: ''
  });

  const loadRoles = async () => {
    try {
      const res = await fetch('/api/roles');
      if (res.ok) setRoles(await res.json());
    } catch (err) {
      console.error('Failed to load roles:', err);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const handleSaveRole = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const created = await res.json();
        setRoles((prev) => [...prev, created]);
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to save role:', err);
    }
  };

  return (
    <div className="admin-roles-view">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Права доступа и Роли (2.5.3 & 2.6.2)</h1>
          <p className="admin-page-subtitle">Настройка уровней доступа сотрудников и таблицы ролей OpenCart</p>
        </div>

        <button className="btn-admin-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          <span>Создать роль</span>
        </button>
      </div>

      <div className="roles-grid">
        {roles.map((r) => (
          <div key={r.id} className="role-card">
            <div className="role-header">
              <div className="role-icon-box">
                <Key size={20} />
              </div>
              <div className="role-title-box">
                <h3 className="role-title">{r.title}</h3>
                <span className="role-code-tag font-mono">{r.code}</span>
              </div>
            </div>

            <p className="role-desc">{r.description}</p>

            <div className="role-footer">
              <div className="users-count">
                <Users size={15} />
                <span>Пользователей: <b>{r.usersCount || 1}</b></span>
              </div>
              <span className="status-badge delivered">
                <CheckCircle2 size={13} /> Активна
              </span>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="modal-title">Создание новой роли доступа</h3>
              <button className="btn-modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="admin-modal-form">
              <div className="form-group">
                <label>Название роли *</label>
                <input
                  type="text"
                  required
                  placeholder="Например: Оператор склада"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Системный код (латиницей)</label>
                <input
                  type="text"
                  placeholder="warehouse_operator"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Описание обязанностей и прав</label>
                <textarea
                  rows="3"
                  placeholder="Доступ только к разделу Заказов и Описанию остатков..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="btn-admin-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Отмена
                </button>
                <button type="submit" className="btn-admin-primary">
                  <Save size={16} />
                  <span>Сохранить роль</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
