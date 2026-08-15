import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon, X, Save } from 'lucide-react';
import './AdminBanners.css';

export const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image: '/assets/img/hero_bg.webp'
  });

  const loadBanners = async () => {
    try {
      const res = await fetch('/api/banners');
      if (res.ok) setBanners(await res.json());
    } catch (err) {
      console.error('Failed to load banners:', err);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleDeleteBanner = async (id) => {
    if (!window.confirm('Удалить баннер?')) return;
    try {
      const res = await fetch(`/api/banners/${id}`, { method: 'DELETE' });
      if (res.ok) setBanners((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error('Failed to delete banner:', err);
    }
  };

  const handleSaveBanner = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const created = await res.json();
        setBanners((prev) => [...prev, created]);
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to save banner:', err);
    }
  };

  return (
    <div className="admin-banners-view">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Баннеры и Акции (OpenCart Marketing)</h1>
          <p className="admin-page-subtitle">Управление слайдером главной страницы Autolider</p>
        </div>

        <button className="btn-admin-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          <span>Добавить баннер</span>
        </button>
      </div>

      <div className="banners-grid">
        {banners.map((b) => (
          <div key={b.id} className="banner-card">
            <div className="banner-img-box">
              <img src={b.image} alt={b.title} />
            </div>
            <div className="banner-card-info">
              <h3 className="banner-title">{b.title}</h3>
              <p className="banner-sub">{b.subtitle}</p>
            </div>
            <div className="banner-card-footer">
              <button className="btn-delete-banner" onClick={() => handleDeleteBanner(b.id)}>
                <Trash2 size={15} /> Удалить
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="modal-title">Добавить новый баннер</h3>
              <button className="btn-modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="admin-modal-form">
              <div className="form-group">
                <label>Заголовок баннера *</label>
                <input
                  type="text"
                  required
                  placeholder="Скидка 15% на масла Motul"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Подзаголовок / Описание</label>
                <input
                  type="text"
                  placeholder="При покупке от 20 000 ₸ — фильтр в подарок"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Ссылка на фоновое изображение</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
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
                  <span>Сохранить баннер</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
