import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2 } from 'lucide-react';
import './AdminSettings.css';

export const AdminSettings = () => {
  const [settings, setSettings] = useState({
    storeName: 'Autolider Marketplace',
    phone: '+7 (777) 555-45-54',
    email: 'support@autolider.kz',
    address: 'г. Астана, ул. Автозаводская, 12',
    workingHours: 'Пн-Вс 09:00 - 20:00',
    currency: '₸',
    freeDeliveryMin: 50000,
    deliveryCost: 2500
  });

  const [saved, setSaved] = useState(false);

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) setSettings(await res.json());
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  return (
    <div className="admin-settings-view">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Настройки магазина</h1>
          <p className="admin-page-subtitle">Общие параметры маркетплейса, контакты и стоимости доставки</p>
        </div>
      </div>

      {saved && (
        <div className="settings-alert-success">
          <CheckCircle2 size={18} />
          <span>Настройки магазина успешно сохранены на сервере!</span>
        </div>
      )}

      <div className="admin-card settings-card">
        <form onSubmit={handleSaveSettings} className="admin-modal-form">
          <div className="form-grid-2col">
            <div className="form-group">
              <label>Название магазина</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Контактный телефон</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Email поддержки</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Время работы склада/магазина</label>
              <input
                type="text"
                value={settings.workingHours}
                onChange={(e) => setSettings({ ...settings, workingHours: e.target.value })}
              />
            </div>

            <div className="form-group full-width">
              <label>Адрес центрального склада</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Порог бесплатной доставки (₸)</label>
              <input
                type="number"
                value={settings.freeDeliveryMin}
                onChange={(e) => setSettings({ ...settings, freeDeliveryMin: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label>Базовая стоимость курьера (₸)</label>
              <input
                type="number"
                value={settings.deliveryCost}
                onChange={(e) => setSettings({ ...settings, deliveryCost: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="admin-modal-footer">
            <button type="submit" className="btn-admin-primary">
              <Save size={16} />
              <span>Сохранить настройки</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
