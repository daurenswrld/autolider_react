import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search, ShoppingCart, Heart } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CATALOG_PRODUCTS_MOCK } from '../../data/mockData';
import './FavoritesPage.css';

export const FavoritesPage = () => {
  const { wishlist = [], products = [], toggleWishlist, addToCart } = useApp();
  const [vinQuery, setVinQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);

  const categories = [
    'Масла и жидкости',
    'Шины и диски',
    'Автохимия',
    'Аксессуары',
    'Инструменты и техника'
  ];

  const pool = [...products, ...CATALOG_PRODUCTS_MOCK];
  // Remove duplicates by id
  const uniquePool = Array.from(new Map(pool.map(item => [item.id, item])).values());
  const favoriteProducts = uniquePool.filter(p => wishlist.includes(p.id));

  return (
    <div className="favorites-page">
      <div className="favorites-bg-clouds" />
      <div className="favorites-container">
        <div className="favorites-layout">
          {/* Left Sidebar */}
          <aside className="favorites-sidebar">
            <ul className="sidebar-cat-list">
              {categories.map((cat) => (
                <li
                  key={cat}
                  className={`sidebar-cat-item ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  <span>{cat}</span>
                  <ChevronRight size={18} className="cat-arrow" />
                </li>
              ))}
            </ul>
          </aside>

          {/* Main Content Area */}
          <main className="favorites-main-content">
            {/* Header & VIN Search */}
            <div className="favorites-header">
              <h1 className="favorites-title">Избранные товары</h1>
              <div className="vin-search-box">
                <div className="vin-input-wrapper">
                  <Search size={18} className="vin-icon" />
                  <input
                    type="text"
                    placeholder="Поиск по VIN"
                    value={vinQuery}
                    onChange={(e) => setVinQuery(e.target.value)}
                    className="vin-input"
                  />
                </div>
                <button className="btn-vin-search">Найти</button>
              </div>
            </div>

            {/* Empty State View */}
            {favoriteProducts.length === 0 ? (
              <div className="favorites-empty-state">
                <div className="empty-img-wrapper">
                  <svg width="84" height="84" viewBox="0 0 24 24" fill="none" stroke="#d0d4dc" strokeWidth="1.2">
                    <rect x="3" y="3" width="18" height="18" rx="3" ry="3"></rect>
                    <polygon points="12 8 8 13 11 13 10 17 16 11 13 11 14 8"></polygon>
                  </svg>
                </div>
                <h2 className="empty-title">Избранное пока пусто</h2>
                <p className="empty-description">
                  Добавляйте товары в избранном, что бы не потерять их и купить позже
                </p>
                <Link to="/catalog" className="btn-to-catalog">
                  <span>К покупкам</span>
                  <ShoppingCart size={18} />
                </Link>
              </div>
            ) : (
              /* Populated Favorites Grid */
              <div className="favorites-products-grid">
                {favoriteProducts.map((p) => {
                  const displayPrice = typeof p.price === 'number' ? `${p.price.toLocaleString('ru-RU')} ₸` : p.price;
                  const displayOldPrice = p.oldPrice ? (typeof p.oldPrice === 'number' ? `${p.oldPrice.toLocaleString('ru-RU')} ₸` : p.oldPrice) : null;
                  const displayImg = p.image || p.img || '/assets/img/test_accessosry.png';

                  return (
                    <div key={p.id} className="product-card">
                      <div className="product-card-header">
                        <div className="badges-group">
                          <span className="badge-hit">ХИТ</span>
                        </div>
                        <button
                          className="btn-fav active"
                          onClick={() => toggleWishlist(p.id)}
                          title="Удалить из избранного"
                        >
                          <Heart size={18} fill="#e63125" stroke="#e63125" />
                        </button>
                      </div>

                      <Link to={`/product/${p.id}`} className="product-img-box">
                        <img
                          src={displayImg}
                          alt={p.title}
                          className="product-img"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/assets/img/test_accessosry.png";
                          }}
                        />
                      </Link>

                      <div className="product-info-box">
                        <h3 className="product-title" title={p.title}>
                          <Link to={`/product/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            {p.title}
                          </Link>
                        </h3>
                        <p className="product-subtitle">{p.subtitle || p.categoryName || 'Автозапчасти'}</p>

                        <div className="product-price-row">
                          <div className="price-wrapper">
                            <span className="price-main">{displayPrice}</span>
                            {displayOldPrice && <span className="price-old">{displayOldPrice}</span>}
                          </div>
                        </div>

                        <div className="product-actions-row">
                          <button
                            className="btn-add-cart"
                            onClick={() => addToCart && addToCart(p)}
                          >
                            <ShoppingCart size={16} />
                            <span>В корзину</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
