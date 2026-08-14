import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Heart, Plus, Minus, Check, ShoppingCart } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CATALOG_PRODUCTS_MOCK } from '../../data/mockData';
import './CatalogPage.css';

export const CatalogPage = () => {
  const { toggleWishlist, isInWishlist } = useApp();
  // State 1: Active Brand (Default: HAVAL)
  const [selectedBrand, setSelectedBrand] = useState('HAVAL');
  // State 2: Active Model (null = Stage 1: select model)
  const [selectedModel, setSelectedModel] = useState(null);
  // State 3: Active Category (null = Stage 2: select category)
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Cart & Favorites state
  const [cartQuantities, setCartQuantities] = useState({});
  const [favorites, setFavorites] = useState({});
  const [addedItems, setAddedItems] = useState({});

  const brands = [
    'HAVAL', 'CHERY', 'JAC', 'CHANGAN', 'BYD', 'LI', 'JAECOO',
    'TANK', 'EXEED', 'MERCEDES', 'TOYOTA', 'BMW', 'HYUNDAI',
    'KIA', 'LEXUS', 'MITSUBISHI'
  ];

  // Mock Models for brands
  const modelsData = {
    HAVAL: [
      { id: 'f7', name: 'Haval F7', img: '/assets/img/hero-img.webp' },
      { id: 'jolion', name: 'Haval Jolion', img: '/assets/img/hero-img.webp' },
      { id: 'dargo', name: 'Haval Dargo', img: '/assets/img/hero-img.webp' },
      { id: 'h9', name: 'Haval H9', img: '/assets/img/hero-img.webp' },
      { id: 'h6', name: 'Haval H6', img: '/assets/img/hero-img.webp' },
      { id: 'm6', name: 'Haval M6', img: '/assets/img/hero-img.webp' },
      { id: 'f7x', name: 'Haval F7x', img: '/assets/img/hero-img.webp' },
      { id: 'h2', name: 'Haval H2', img: '/assets/img/hero-img.webp' },
      { id: 'h8', name: 'Haval H8', img: '/assets/img/hero-img.webp' },
      { id: 'h5', name: 'Haval H5', img: '/assets/img/hero-img.webp' },
      { id: 'chitu', name: 'Haval Chitu', img: '/assets/img/hero-img.webp' },
      { id: 'shenshou', name: 'Haval Shenshou', img: '/assets/img/hero-img.webp' },
    ],
    CHERY: [
      { id: 't7p', name: 'Chery Tiggo 7 Pro', img: '/assets/img/hero-img.webp' },
      { id: 't8p', name: 'Chery Tiggo 8 Pro', img: '/assets/img/hero-img.webp' },
      { id: 't4p', name: 'Chery Tiggo 4 Pro', img: '/assets/img/hero-img.webp' },
      { id: 'arrizo', name: 'Chery Arrizo 8', img: '/assets/img/hero-img.webp' },
    ],
    TOYOTA: [
      { id: 'camry', name: 'Toyota Camry', img: '/assets/img/hero-img.webp' },
      { id: 'rav4', name: 'Toyota RAV4', img: '/assets/img/hero-img.webp' },
      { id: 'lc300', name: 'Toyota Land Cruiser 300', img: '/assets/img/hero-img.webp' },
    ]
  };

  // Mock Categories (Stage 2)
  const categoriesList = [
    { id: 'to', name: 'Детали для ТО', img: '/assets/img/test_accessosry.png' },
    { id: 'engine', name: 'Двигатель', img: '/assets/img/test_accessosry.png' },
    { id: 'fuel', name: 'Топливная система', img: '/assets/img/test_accessosry.png' },
    { id: 'exhaust', name: 'Выхлопная система', img: '/assets/img/test_accessosry.png' },
    { id: 'trans', name: 'Трансмиссия', img: '/assets/img/test_accessosry.png' },
    { id: 'cooling', name: 'Система охлаждения', img: '/assets/img/test_accessosry.png' },
    { id: 'chassis', name: 'Ходовая часть', img: '/assets/img/test_accessosry.png' },
    { id: 'steering', name: 'Рулевое управление', img: '/assets/img/test_accessosry.png' },
    { id: 'brakes', name: 'Тормозная система', img: '/assets/img/test_accessosry.png' },
    { id: 'electrics', name: 'Электрика', img: '/assets/img/test_accessosry.png' },
    { id: 'body', name: 'Кузов', img: '/assets/img/test_accessosry.png' },
    { id: 'wheels', name: 'Диски', img: '/assets/img/test_accessosry.png' }
  ];

  // Mock Products List (Stage 3)
  const productsList = CATALOG_PRODUCTS_MOCK;

  // Current active models
  const currentModels = modelsData[selectedBrand] || modelsData.HAVAL;

  const handleBrandSelect = (brand) => {
    setSelectedBrand(brand);
    setSelectedModel(null);
    setSelectedCategory(null);
  };

  const handleModelSelect = (modelObj) => {
    setSelectedModel(modelObj.name);
    setSelectedCategory(null);
  };

  const handleCategorySelect = (catObj) => {
    setSelectedCategory(catObj.name);
  };

  const handleBackToModels = () => {
    setSelectedModel(null);
    setSelectedCategory(null);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
  };

  const toggleFavorite = (productId) => {
    setFavorites((prev) => ({
      ...prev,
      [productId]: !prev[productId]
    }));
    if (toggleWishlist) {
      toggleWishlist(productId);
    }
  };

  const handleAddToCart = (productId) => {
    setAddedItems((prev) => ({ ...prev, [productId]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [productId]: false }));
    }, 2000);
  };

  const handleQuantityChange = (productId, delta) => {
    setCartQuantities((prev) => {
      const current = prev[productId] || 12;
      const updated = Math.max(1, current + delta);
      return { ...prev, [productId]: updated };
    });
  };

  return (
    <div className="catalog-page">
      <div className="catalog-bg-clouds" />
      <div className="catalog-container">
        <div className="catalog-layout">
        {/* Left Sidebar: Brands List */}
        <aside className="catalog-sidebar">
          <ul className="sidebar-brands-list">
            {brands.map((b) => (
              <li
                key={b}
                className={`sidebar-brand-item ${selectedBrand === b ? 'active' : ''}`}
                onClick={() => handleBrandSelect(b)}
              >
                {b}
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content View */}
        <main className="catalog-main-content">
          {/* STAGE 1: Models Selection */}
          {!selectedModel && !selectedCategory && (
            <div className="stage-models">
              <h1 className="catalog-title">{selectedBrand}</h1>
              <div className="models-grid">
                {currentModels.map((m) => (
                  <div
                    key={m.id}
                    className="model-card"
                    onClick={() => handleModelSelect(m)}
                  >
                    <div className="model-img-placeholder">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#bcbcc5" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                    </div>
                    <span className="model-name">{m.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STAGE 2: Category Selection */}
          {selectedModel && !selectedCategory && (
            <div className="stage-categories">
              <div className="catalog-header-back">
                <button className="btn-back" onClick={handleBackToModels}>
                  <ArrowLeft size={22} />
                  <span>{selectedBrand}</span>
                </button>
              </div>

              <div className="categories-grid">
                {categoriesList.map((cat) => (
                  <div
                    key={cat.id}
                    className="category-card"
                    onClick={() => handleCategorySelect(cat)}
                  >
                    <div className="category-img-placeholder">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#bcbcc5" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                    </div>
                    <span className="category-name">{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STAGE 3: Products Grid */}
          {selectedModel && selectedCategory && (
            <div className="stage-products">
              <div className="catalog-header-back">
                <button className="btn-back" onClick={handleBackToCategories}>
                  <ArrowLeft size={22} />
                  <span>{selectedCategory}</span>
                </button>
              </div>

              <div className="products-grid">
                {productsList.map((p) => {
                  const qty = cartQuantities[p.id] || 12;
                  const isFav = isInWishlist ? isInWishlist(p.id) : (favorites[p.id] || false);
                  const isAdded = addedItems[p.id] || false;

                  return (
                    <div key={p.id} className="product-card">
                      {/* Top Badges & Favorite */}
                      <div className="product-card-header">
                        <div className="badges-group">
                          {p.badgeHit && <span className="badge-hit">ХИТ</span>}
                          {p.discount && <span className="badge-discount">{p.discount}</span>}
                        </div>
                        <button
                          className={`btn-fav ${isFav ? 'active' : ''}`}
                          onClick={() => toggleFavorite(p.id)}
                          aria-label="В избранное"
                          title={isFav ? "В избранном" : "Добавить в избранное"}
                        >
                          <Heart size={18} fill={isFav ? '#e63125' : 'none'} stroke={isFav ? '#e63125' : '#888894'} />
                        </button>
                      </div>

                      {/* Product Image */}
                      <div className="product-img-box">
                        <img
                          src={p.img}
                          alt={p.title}
                          className="product-img"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/assets/img/test_accessosry.png";
                          }}
                        />
                      </div>

                      {/* Info & Price */}
                      <div className="product-info-box">
                        <h3 className="product-title" title={p.title}>{p.title}</h3>
                        <p className="product-subtitle">{p.subtitle}</p>

                        <div className="product-price-row">
                          <div className="price-wrapper">
                            <span className="price-main">{p.price}</span>
                            <span className="price-old">{p.oldPrice}</span>
                          </div>
                        </div>

                        {/* Action Controls */}
                        <div className="product-actions-row">
                          <button
                            className={`btn-add-cart ${isAdded ? 'added' : ''}`}
                            onClick={() => handleAddToCart(p.id)}
                          >
                            {isAdded ? (
                              <>
                                <Check size={16} />
                                <span>В корзине</span>
                              </>
                            ) : (
                              <>
                                <ShoppingCart size={16} />
                                <span>В корзину</span>
                              </>
                            )}
                          </button>

                          <div className="quantity-counter">
                            <button
                              className="qty-btn"
                              onClick={() => handleQuantityChange(p.id, -1)}
                              title="Уменьшить"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="qty-val">{qty}</span>
                            <button
                              className="qty-btn"
                              onClick={() => handleQuantityChange(p.id, 1)}
                              title="Увеличить"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  </div>
);
};
