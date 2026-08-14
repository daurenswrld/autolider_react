import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, User, ShoppingCart, Heart, X, Menu } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import './Navbar.css';

export const Navbar = ({ onOpenSearch }) => {
  const location = useLocation();
  const { cartCount, userRole, wishlist = [] } = useApp();
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { title: 'Каталог', path: '/catalog' },
    { title: 'О компании', path: '/about' },
    { title: 'Доставка', path: '/delivery' },
    { title: 'Оплата', path: '/payment' },
    { title: 'Контакты', path: '/contacts' },
  ];

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
                className={`navbar-link ${location.pathname === link.path ? 'active' : ''}`}
              >
                {link.title}
              </Link>
              {index < navLinks.length - 1 && (
                <span className="navbar-divider">|</span>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* Right: Actions (Search, Favorites, Profile with red indicator, Cart) */}
        <div className="navbar-actions">
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
            to="/auth"
            className="navbar-action-btn"
            title="Войти / Профиль"
          >
            <div className="icon-wrapper">
              <User className="navbar-icon" size={22} strokeWidth={1.6} />
              <span className="profile-notification-dot" />
            </div>
            <span className="navbar-action-label">Профиль</span>
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
                    location.pathname === link.path ? 'active' : ''
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.title}
                </Link>
              ))}
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
              placeholder="Поиск по артикулу, VIN-коду или наименованию запчасти..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <button
              className="search-close-btn"
              onClick={() => setIsSearchActive(false)}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
