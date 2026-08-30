import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, User, ShoppingCart, Heart, X, Menu, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CityStorePicker, CityStorePickerTrigger, useCityStore } from '../CityStorePicker/CityStorePicker';
import './Navbar.css';

export const Navbar = ({ onOpenSearch }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount, userRole, wishlist = [], currentUser, products = [] } = useApp();
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isStorePickerOpen, setIsStorePickerOpen] = useState(false);
  const { selectedStore, saveStore } = useCityStore();

  const filteredProducts = searchQuery.trim()
    ? products.filter((p) => {
        if (p.status === 'disabled') return false;
        const q = searchQuery.toLowerCase().trim();
        const title = (p.title || '').toLowerCase();
        const sku = (p.sku || '').toLowerCase();
        const brand = (p.brand || '').toLowerCase();
        const carMake = (p.carMake || '').toLowerCase();
        const carModel = (p.carModel || '').toLowerCase();
        const categoryName = (p.categoryName || '').toLowerCase();

        return (
          title.includes(q) ||
          sku.includes(q) ||
          brand.includes(q) ||
          carMake.includes(q) ||
          carModel.includes(q) ||
          categoryName.includes(q)
        );
      })
    : [];

  const navLinks = [
    { title: 'Каталог', path: '/catalog' },
    { title: 'О компании', path: '/about' },
    { title: 'Доставка', path: '/delivery' },
    { title: 'Оплата', path: '/payment' },
    { title: 'Контакты', path: '/contacts' },
  ];

  const isLinkActive = (linkPath) => {
    if (linkPath === '/') {
      return location.pathname === '/';
    }
    return location.pathname === linkPath || location.pathname.startsWith(`${linkPath}/`);
  };

  return (
    <header className="autolider-navbar">
      <div className="navbar-container">
        {/* Left: Logo */}
        <Link to="/" className="navbar-logo-link">
          <img
            src="/assets/img/logo.png"
            alt="AUTOLIDER TRADE"
            className="navbar-logo"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/assets/img/logo.svg';
            }}
          />
        </Link>

        {/* Center: Navigation Links with Vertical Dividers */}
        <nav className="navbar-nav">
          {navLinks.map((link, index) => (
            <React.Fragment key={link.path}>
              <Link
                to={link.path}
                className={`navbar-link ${isLinkActive(link.path) ? 'active' : ''}`}
              >
                {link.title}
              </Link>
              {index < navLinks.length - 1 && (
                <span className="navbar-divider">|</span>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="navbar-actions">
          {/* City/Store Picker */}
          <CityStorePickerTrigger
            selectedStore={selectedStore}
            onClick={() => setIsStorePickerOpen(true)}
          />

          {/* Search Toggle */}
          <button
            className="navbar-action-btn"
            onClick={() => setIsSearchActive(!isSearchActive)}
            title="Поиск запчастей"
            type="button"
          >
            <Search className="navbar-icon" size={22} strokeWidth={1.6} />
            <span className="navbar-action-label">Поиск</span>
          </button>

          {/* Favorites Button */}
          <Link to="/favorites" className="navbar-action-btn" title="Избранное">
            <div className="icon-wrapper">
              <Heart className="navbar-icon" size={22} strokeWidth={1.6} />
              {wishlist.length > 0 && (
                <span className="cart-badge-count">{wishlist.length}</span>
              )}
            </div>
            <span className="navbar-action-label">Избранное</span>
          </Link>

          {/* Profile / Auth Button */}
          <Link
            to={currentUser ? "/profile" : "/auth"}
            className="navbar-action-btn"
            title={currentUser ? `Профиль (${currentUser.name})` : "Войти / Регистрация"}
          >
            <div className="icon-wrapper">
              <User className="navbar-icon" size={22} strokeWidth={1.6} />
              {currentUser && <span className="profile-notification-dot" />}
            </div>
            <span className="navbar-action-label">
              {currentUser ? currentUser.name.split(' ')[0] : 'Войти'}
            </span>
          </Link>

          {/* Cart Button */}
          <Link to="/cart" className="navbar-action-btn" title="Корзина">
            <div className="icon-wrapper">
              <ShoppingCart className="navbar-icon" size={22} strokeWidth={1.6} />
              {cartCount > 0 && (
                <span className="cart-badge-count">{cartCount}</span>
              )}
            </div>
            <span className="navbar-action-label">Корзина</span>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="mobile-menu-toggle-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Открыть меню"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Sliding Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <div
            className="mobile-drawer-backdrop"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="mobile-drawer-content">
            <div className="mobile-drawer-header">
              <span className="mobile-drawer-title">Навигация</span>
              <button
                type="button"
                className="mobile-drawer-close"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <nav className="mobile-drawer-nav">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`mobile-drawer-link ${
                    isLinkActive(link.path) ? 'active' : ''
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.title}
                </Link>
              ))}
              <button
                type="button"
                className="mobile-drawer-store-btn"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsStorePickerOpen(true);
                }}
              >
                <MapPin size={16} color="#ea2427" />
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', minWidth: 0 }}>
                  <span style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Магазин / Город</span>
                  <span style={{ fontSize: 13, color: '#ffffff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedStore ? `${selectedStore.city} — ${selectedStore.address}` : 'Выберите магазин'}
                  </span>
                </div>
              </button>
              <Link
                to="/profile"
                className="mobile-drawer-link profile-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User size={18} />
                <span>Личный кабинет</span>
              </Link>
            </nav>
          </div>
        </div>
      )}

      {/* Expandable Quick Search Bar overlay */}
      {isSearchActive && (
        <div className="navbar-search-bar">
          <div className="search-bar-inner">
            <Search size={18} className="search-input-icon" />
            <input
              type="text"
              placeholder="Поиск по артикулу, VIN-коду, марке или наименованию запчасти..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-input-btn"
                onClick={() => setSearchQuery('')}
                title="Очистить"
              >
                <X size={14} />
              </button>
            )}
            <button
              className="search-close-btn"
              onClick={() => setIsSearchActive(false)}
              title="Закрыть поиск"
            >
              <X size={18} />
            </button>
          </div>

          {/* Live Search Suggestions Dropdown */}
          {searchQuery.trim().length > 0 && (
            <div className="live-search-dropdown">
              {filteredProducts.length > 0 ? (
                <>
                  <div className="search-results-header">
                    <span>Найдено товаров: <b>{filteredProducts.length}</b></span>
                  </div>
                  <div className="search-results-list">
                    {filteredProducts.map((item) => (
                      <div
                        key={item.id}
                        className="search-result-item"
                        onClick={() => {
                          navigate(`/product/${item.id}`);
                          setIsSearchActive(false);
                          setSearchQuery('');
                        }}
                      >
                        <img
                          src={item.image || item.photoUrl || '/assets/img/test_accessosry.png'}
                          alt={item.title}
                          className="search-result-thumb"
                        />
                        <div className="search-result-info">
                          <div className="search-result-title">{item.title}</div>
                          <div className="search-result-meta">
                            <span className="search-meta-badge sku">{item.sku || 'SKU'}</span>
                            <span className="search-meta-badge category">{item.categoryName || 'Автозапчасти'}</span>
                            {item.brand && <span className="search-meta-badge brand">{item.brand}</span>}
                          </div>
                        </div>
                        <div className="search-result-price">
                          {typeof item.price === 'number' ? `${new Intl.NumberFormat('ru-RU').format(item.price)} ₸` : item.price}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="search-no-results">
                  По запросу «<b>{searchQuery}</b>» ничего не найдено
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* City Store Picker Modal */}
      {isStorePickerOpen && (
        <CityStorePicker
          selectedStore={selectedStore}
          onSelect={saveStore}
          onClose={() => setIsStorePickerOpen(false)}
        />
      )}
    </header>
  );
};
