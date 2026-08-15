import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FolderTree, X, Save, CheckCircle2 } from 'lucide-react';
import './AdminCategories.css';

export const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    status: 'enabled'
  });

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      if (res.ok) setCategories(await res.json());
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', slug: '', status: 'enabled' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingId(cat.id);
    setFormData({
      name: cat.name || '',
      slug: cat.slug || '',
      status: cat.status || 'enabled'
    });
    setIsModalOpen(true);
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Удалить категорию "${name}"?`)) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert('Укажите название');

    const slug = formData.slug.trim() || formData.name.toLowerCase().replace(/\s+/g, '-');
    const payload = { ...formData, slug };

    try {
      if (editingId) {
        const res = await fetch(`/api/categories/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const updated = await res.json();
          setCategories((prev) => prev.map((c) => (c.id === editingId ? updated : c)));
        }
      } else {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const created = await res.json();
          setCategories((prev) => [...prev, created]);
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving category:', err);
    }
  };

  return (
    <div className="admin-categories-view">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Категории товаров (OpenCart Categories)</h1>
          <p className="admin-page-subtitle">Дерево категорий и структуры каталога автозапчастей</p>
        </div>

        <button className="btn-admin-primary" onClick={handleOpenAddModal}>
          <Plus size={16} />
          <span>Добавить категорию</span>
        </button>
      </div>

      <div className="admin-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Название категории</th>
                <th>ЧПУ / Slug</th>
                <th>Кол-во товаров</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td>
                    <div className="category-title-row">
                      <FolderTree size={18} className="cat-icon" />
                      <span className="font-bold">{cat.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="font-mono text-sub">{cat.slug}</span>
                  </td>
                  <td>
                    <span className="count-badge">{cat.count || 0} товаров</span>
                  </td>
                  <td>
                    <span className="status-badge delivered">
                      <CheckCircle2 size={13} /> Включен
                    </span>
                  </td>
                  <td>
                    <div className="table-actions-row">
                      <button
                        className="btn-table-action edit"
                        onClick={() => handleOpenEditModal(cat)}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        className="btn-table-action delete"
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="modal-title">
                {editingId ? 'Редактировать категорию' : 'Добавить категорию'}
              </h3>
              <button className="btn-modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="admin-modal-form">
              <div className="form-group">
                <label>Название категории *</label>
                <input
                  type="text"
                  required
                  placeholder="Например: Тормозная система"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>ЧПУ / Slug (необязательно)</label>
                <input
                  type="text"
                  placeholder="brakes"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
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
                  <span>Сохранить</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
