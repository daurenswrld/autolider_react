import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Filter,
  CheckCircle2,
  XCircle,
  X,
  Save,
  Package,
  Image as ImageIcon
} from 'lucide-react';
import './AdminProducts.css';

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    sku: '',
    brand: 'Autolider',
    price: '',
    oldPrice: '',
    stockQty: '10',
    categoryId: 'oils',
    categoryName: 'Масла и автохимия',
    status: 'enabled',
    description: '',
    image: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [resProd, resCat] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories')
      ]);
      if (resProd.ok) setProducts(await resProd.json());
      if (resCat.ok) setCategories(await resCat.json());
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !search.trim() ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));

    const matchesCat = !selectedCat || p.categoryId === selectedCat;
    const matchesStatus = !selectedStatus || p.status === selectedStatus;

    return matchesSearch && matchesCat && matchesStatus;
  });

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      sku: `ART-${Math.floor(1000 + Math.random() * 9000)}`,
      brand: 'Autolider',
      price: '',
      oldPrice: '',
      stockQty: '10',
      categoryId: categories[0]?.id || 'oils',
      categoryName: categories[0]?.name || 'Масла и автохимия',
      status: 'enabled',
      description: '',
      image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingId(product.id);
    setFormData({
      title: product.title || '',
      sku: product.sku || '',
      brand: product.brand || 'Autolider',
      price: product.price || '',
      oldPrice: product.oldPrice || '',
      stockQty: product.stockQty || 0,
      categoryId: product.categoryId || 'oils',
      categoryName: product.categoryName || 'Автозапчасти',
      status: product.status || 'enabled',
      description: product.description || '',
      image: product.image || ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (id, title) => {
    if (!window.confirm(`Вы уверены, что хотите удалить товар "${title}"?`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Укажите название товара');
      return;
    }

    const matchedCat = categories.find((c) => c.id === formData.categoryId);
    const payload = {
      ...formData,
      categoryName: matchedCat ? matchedCat.name : formData.categoryName,
      price: Number(formData.price) || 0,
      oldPrice: Number(formData.oldPrice) || 0,
      stockQty: Number(formData.stockQty) || 0,
      inStock: Number(formData.stockQty) > 0
    };

    try {
      if (editingId) {
        // Update product
        const res = await fetch(`/api/products/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const updated = await res.json();
          setProducts((prev) => prev.map((p) => (p.id === editingId ? updated : p)));
        }
      } else {
        // Create new product
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const created = await res.json();
          setProducts((prev) => [created, ...prev]);
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving product:', err);
    }
  };

  const formatPrice = (val) => {
    return new Intl.NumberFormat('ru-RU').format(val || 0) + ' ₸';
  };

  return (
    <div className="admin-products-view">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Каталог товаров (OpenCart Catalog)</h1>
          <p className="admin-page-subtitle">Управление списком автозапчастей, ценами и остатками на складах</p>
        </div>

        <button className="btn-admin-primary" onClick={handleOpenAddModal}>
          <Plus size={16} />
          <span>Добавить товар</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="admin-filter-card">
        <div className="search-input-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Поиск по названию или артикулу (SKU)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-selects-group">
          <select value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)}>
            <option value="">Все категории</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
            <option value="">Все статусы</option>
            <option value="enabled">Включен</option>
            <option value="disabled">Отключен</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="admin-card products-table-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Фото</th>
                <th>Наименование / Артикул</th>
                <th>Бренд</th>
                <th>Категория</th>
                <th>Цена</th>
                <th>Остаток</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-table-cell">
                    Товары не найдены
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="table-img-thumb">
                        {p.image ? (
                          <img src={p.image} alt={p.title} />
                        ) : (
                          <ImageIcon size={20} className="text-sub" />
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="table-title-column">
                        <span className="font-bold product-name">{p.title}</span>
                        <span className="text-sub font-mono">Арт: {p.sku || 'N/A'}</span>
                      </div>
                    </td>
                    <td>
                      <span className="brand-badge">{p.brand || 'Autolider'}</span>
                    </td>
                    <td>
                      <span className="text-sub">{p.categoryName || p.categoryId}</span>
                    </td>
                    <td>
                      <div className="price-column">
                        <span className="font-bold text-price">{formatPrice(p.price)}</span>
                        {p.oldPrice > 0 && (
                          <span className="old-price-sub">{formatPrice(p.oldPrice)}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`stock-count ${p.stockQty > 5 ? 'good' : 'low'}`}>
                        {p.stockQty} шт
                      </span>
                    </td>
                    <td>
                      {p.status === 'enabled' ? (
                        <span className="status-badge delivered">
                          <CheckCircle2 size={13} /> Включен
                        </span>
                      ) : (
                        <span className="status-badge canceled">
                          <XCircle size={13} /> Отключен
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="table-actions-row">
                        <button
                          className="btn-table-action edit"
                          onClick={() => handleOpenEditModal(p)}
                          title="Редактировать товар"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="btn-table-action delete"
                          onClick={() => handleDeleteProduct(p.id, p.title)}
                          title="Удалить товар"
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

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="modal-title">
                {editingId ? 'Редактирование товара OpenCart' : 'Добавление товара в каталог'}
              </h3>
              <button className="btn-modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="admin-modal-form">
              <div className="form-grid-2col">
                <div className="form-group full-width">
                  <label>Наименование товара *</label>
                  <input
                    type="text"
                    required
                    placeholder="Например: Шина Michelin Pilot Sport 5 (225/45 R17)"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Артикул / SKU *</label>
                  <input
                    type="text"
                    required
                    placeholder="MICH-8842"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Бренд / Производитель</label>
                  <input
                    type="text"
                    placeholder="Michelin, Motul, Brembo..."
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Категория OpenCart</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Статус товара</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="enabled">Включен (Виден на сайте)</option>
                    <option value="disabled">Отключен (Скрыт)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Цена продажи (₸) *</label>
                  <input
                    type="number"
                    required
                    placeholder="72000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Старая цена (₸)</label>
                  <input
                    type="number"
                    placeholder="85000"
                    value={formData.oldPrice}
                    onChange={(e) => setFormData({ ...formData, oldPrice: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Количество на складе (шт)</label>
                  <input
                    type="number"
                    required
                    value={formData.stockQty}
                    onChange={(e) => setFormData({ ...formData, stockQty: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Ссылка на фото (URL)</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Описание товара</label>
                  <textarea
                    rows="3"
                    placeholder="Подробное описание характеристик и применения..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
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
                  <span>{editingId ? 'Сохранить изменения' : 'Создать товар'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
