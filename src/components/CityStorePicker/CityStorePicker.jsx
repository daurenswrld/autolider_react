import React, { useState, useEffect } from 'react';
import { MapPin, ChevronDown, X, Check, Clock, Phone, Search } from 'lucide-react';
import './CityStorePicker.css';

const STORAGE_KEY = 'autolider_selected_store';

export function useCityStore() {
  const [selectedStore, setSelectedStore] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return null; }
  });

  const saveStore = (store) => {
    setSelectedStore(store);
    if (store) localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    else localStorage.removeItem(STORAGE_KEY);
  };

  return { selectedStore, saveStore };
}

export const CityStorePickerTrigger = ({ selectedStore, onClick }) => (
  <button className="city-picker-trigger" onClick={onClick} id="city-store-picker-btn">
    <MapPin size={14} className="city-pin-icon" />
    <span className="city-trigger-text">
      {selectedStore ? selectedStore.address : 'Выберите магазин'}
    </span>
    <ChevronDown size={13} className="city-chevron" />
  </button>
);

export const CityStorePicker = ({ onClose, selectedStore, onSelect }) => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCity, setActiveCity] = useState(selectedStore?.city || null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    fetch('/api/stores')
      .then((r) => r.ok ? r.json() : [])
      .then((data) => {
        const active = data.filter((s) => s.status !== 'disabled');
        setStores(active);
        if (!activeCity && active.length) setActiveCity(active[0].city);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const cities = [...new Set(stores.map((s) => s.city))].filter(Boolean);

  const filtered = stores.filter((s) => {
    const matchCity = !activeCity || s.city === activeCity;
    const matchSearch = !search || s.address.toLowerCase().includes(search.toLowerCase());
    return matchCity && matchSearch;
  });

  const handleSelect = (store) => {
    onSelect(store);
    onClose();
  };

  return (
    <div className="city-picker-overlay" onClick={onClose}>
      <div className="city-picker-modal" onClick={(e) => e.stopPropagation()}>
        <div className="city-picker-mobile-handle" />
        {/* Header */}
        <div className="city-picker-header">
          <div className="city-picker-header-left">
            <div className="city-picker-icon-wrap">
              <MapPin size={18} color="#ea2427" />
            </div>
            <div>
              <h3 className="city-picker-title">Выберите магазин</h3>
              <p className="city-picker-subtitle">Товары и цены зависят от выбранной точки</p>
            </div>
          </div>
          <button className="city-picker-close" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Search */}
        <div className="city-picker-search">
          <Search size={16} />
          <input
            placeholder="Поиск по адресу..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        {/* City tabs */}
        {!search && (
          <div className="city-tabs">
            <button
              className={`city-tab ${!activeCity ? 'active' : ''}`}
              onClick={() => setActiveCity(null)}
            >
              Все города
            </button>
            {cities.map((city) => (
              <button
                key={city}
                className={`city-tab ${activeCity === city ? 'active' : ''}`}
                onClick={() => setActiveCity(city)}
              >
                {city}
                <span className="city-tab-count">
                  {stores.filter((s) => s.city === city).length}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Store list */}
        <div className="city-store-list">
          {loading ? (
            <div className="city-picker-loading">Загрузка магазинов...</div>
          ) : filtered.length === 0 ? (
            <div className="city-picker-empty">Магазины не найдены</div>
          ) : filtered.map((store) => {
            const isSelected = selectedStore?.id === store.id;
            return (
              <button
                key={store.id}
                className={`city-store-item ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelect(store)}
              >
                <div className="city-store-body">
                  <div className="city-store-city-badge">{store.city}</div>
                  <div className="city-store-address">{store.address}</div>
                  {store.name && store.name !== store.address && (
                    <div className="city-store-name">{store.name}</div>
                  )}
                  <div className="city-store-meta">
                    {store.phone && <span><Phone size={11} />{store.phone}</span>}
                    {store.workingHours && <span><Clock size={11} />{store.workingHours}</span>}
                  </div>
                </div>
                <div className={`city-store-check ${isSelected ? 'visible' : ''}`}>
                  {isSelected ? <Check size={16} /> : null}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        {selectedStore && (
          <div className="city-picker-footer">
            <div className="city-current-store">
              <Check size={14} color="#16a34a" />
              <span>Выбрано: <strong>{selectedStore.city} — {selectedStore.address}</strong></span>
            </div>
            <button
              className="city-clear-btn"
              onClick={() => { onSelect(null); onClose(); }}
            >
              Сбросить
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
