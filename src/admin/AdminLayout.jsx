import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Image as ImageIcon,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bell,
  ShieldAlert,
  Search
} from 'lucide-react';
import './AdminLayout.css';

export const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState(() => {
    return localStorage.getItem('autolider_admin_token')
      ? { name: 'Администратор Autolider', role: 'Главный менеджер' }
      : null;
  });

  const handleLogout = () => {
    localStorage.removeItem('autolider_admin_token');
    navigate('/admin/login');
  };

  const navItems = [
    {
      title: 'Дашборд',
      path: '/admin',
      icon: LayoutDashboard,
      exact: true
    },
    {
      title: 'Товары',
      path: '/admin/products',
      icon: Package
    },
    {
      title: 'Категории',
      path: '/admin/categories',
      icon: FolderTree
    },
    {
      title: 'Заказы',
      path: '/admin/orders',
      icon: ShoppingCart,
      badge: 'Новые'
    },
    {
      title: 'Покупатели',
      path: '/admin/customers',
      icon: Users
    },
    {
      title: 'Баннеры',
      path: '/admin/banners',
      icon: ImageIcon
    },
    {
      title: 'Настройки',
      path: '/admin/settings',
      icon: Settings
    }
  ];

  return (
    <div className="admin-app-wrapper">
      {/* OpenCart Inspired Header Navbar */}
      <header className="admin-top-header">
        <div className="admin-header-left">
          <button
            className="admin-mobile-toggle"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            aria-label="Toggle Admin Menu"
          >
            {isMobileSidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div className="admin-brand-box" onClick={() => navigate('/admin')}>
            <div className="admin-logo-badge">OC</div>
            <div className="admin-brand-info">
              <span className="admin-brand-title">Autolider Admin</span>
              <span className="admin-opencart-tag">OpenCart Engine v3.0</span>
            </div>
          </div>
        </div>

        <div className="admin-header-right">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-admin-storefront"
          >
            <ExternalLink size={15} />
            <span>В магазин</span>
          </a>

          <div className="admin-user-profile">
            <div className="admin-avatar-circle">A</div>
            <div className="admin-user-meta">
              <span className="admin-username">Администратор</span>
              <span className="admin-role">Super Admin</span>
            </div>
          </div>

          <button
            className="btn-admin-logout"
            onClick={handleLogout}
            title="Выйти из админки"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Admin Layout Grid */}
      <div className="admin-layout-body">
        {/* Mobile Backdrop */}
        {isMobileSidebarOpen && (
          <div
            className="admin-sidebar-backdrop"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Left OpenCart Sidebar Navigation */}
        <aside className={`admin-sidebar ${isMobileSidebarOpen ? 'open' : ''}`}>
          <div className="admin-sidebar-header">
            <span className="sidebar-section-title">НАВИГАЦИЯ OPENCART</span>
          </div>

          <nav className="admin-nav-menu">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`admin-nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setIsMobileSidebarOpen(false)}
                >
                  <div className="admin-nav-link-left">
                    <Icon size={19} className="admin-nav-icon" />
                    <span>{item.title}</span>
                  </div>
                  {item.badge ? (
                    <span className="admin-badge-red">{item.badge}</span>
                  ) : (
                    <ChevronRight size={14} className="admin-nav-arrow" />
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className="admin-sidebar-footer">
            <div className="admin-system-info">
              <span className="sys-label">Статус сервера:</span>
              <span className="sys-value-online">Node.js Express 🟢</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="admin-main-stage">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
