import React, { useState, useEffect } from 'react';
import { Building2, Plus, MapPin, Phone, PackageCheck, Save, X } from 'lucide-react';
import './AdminWarehouses.css';

export const AdminWarehouses = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    city: 'Астана',
    address: '',
    phone: '+7 (777) 555-45-54'
  });

  const loadWarehouses = async () => {
    try {
      const res = await fetch('/api/warehouses');
      if (res.ok) setWarehouses(await res.json());
    } catch (err) {
      console.error('Failed to load warehouses:', err);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  const handleSaveWarehouse = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      const res = await fetch('/api/warehouses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const created = await res.json();
        setWarehouses((prev) => [...prev, created]);
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to save warehouse:', err);
    }
  };

  return (
    <div className="admin-warehouses-view">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Склады и Магазины (Масштабирование БД 2.6.1)</h1>
          <p className="admin-page-subtitle">Управление логистическими центрами и автоскладами по Казахстану</p>
        </div>

        <button className="btn-admin-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          <span>Добавить склад</span>
        </button>
      </div>

      <div className="warehouses-grid">
        {warehouses.map((wh) => (
          <div key={wh.id} className={`warehouse-card ${wh.isMain ? 'main-wh' : ''}`}>
            <div className="wh-header">
              <div className="wh-icon-box">
                <Building2 size={22} />
              </div>
              <div className="wh-title-box">
                <h3 className="wh-title">{wh.name}</h3>
                {wh.isMain && <span className="wh-badge-main">Главный склад</span>}
              </div>
            </div>

            <div className="wh-details-list">
              <div className="wh-detail-item">
                <MapPin size={16} className="text-sub" />
                <span>{wh.city}, {wh.address}</span>
              </div>
              <div className="wh-detail-item">
                <Phone size={16} className="text-sub" />
                <span>{wh.phone}</span>
              </div>
              <div className="wh-detail-item">
                <PackageCheck size={16} className="text-sub" />
                <span>Остаток автозапчастей: <b>{wh.stockCount || 0} шт</b></span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="modal-title">Добавить новый автосклад</h3>
              <button className="btn-modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveWarehouse} className="admin-modal-form">
              <div className="form-group">
                <label>Название склада / филиала *</label>
                <input
                  type="text"
                  required
                  placeholder="Склад №3 Шымкент"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Город *</label>
                <input
                  type="text"
                  required
                  placeholder="Астана, Алматы, Шымкент, Караганда..."
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Адрес</label>
                <input
                  type="text"
                  placeholder="ул. Автозаводская, 12"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Телефон склада</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                  <span>Сохранить склад</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
