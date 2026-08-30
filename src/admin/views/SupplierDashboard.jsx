import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, ShoppingCart, AlertTriangle,
  Plus, RefreshCw, DollarSign, Tag, Clock, Truck, CheckCircle2, XCircle, Copy
} from 'lucide-react';
import './SupplierDashboard.css';

export const SupplierDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sellerInfo, setSellerInfo] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('autolider_admin_user');
    if (saved) {
      try { setSellerInfo(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const fetchStats = async () => {
    if (!sellerInfo?.sellerId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/sellers/${sellerInfo.sellerId}/stats`);
      if (res.ok) setStats(await res.json());
    } catch (err) {
      console.error('Failed to load seller stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sellerInfo?.sellerId) fetchStats();
    else setLoading(false);
  }, [sellerInfo]);

  const formatPrice = (v) => new Intl.NumberFormat('ru-RU').format(v || 0) + ' ₸';

  const getStatusBadge = (status) => {
    const map = {
      delivered: { icon: <CheckCircle2 size={12} />, label: 'Доставлен', cls: 'delivered' },
      shipping:  { icon: <Truck size={12} />, label: 'В пути', cls: 'shipping' },
      processing:{ icon: <Clock size={12} />, label: 'В обработке', cls: 'processing' },
      paid:      { icon: <CheckCircle2 size={12} />, label: 'Оплачен', cls: 'delivered' },
      canceled:  { icon: <XCircle size={12} />, label: 'Отменён', cls: 'canceled' },
    };
    const s = map[status] || { icon: <Clock size={12} />, label: status, cls: 'pending' };
    return <span className={`sup-status-badge ${s.cls}`}>{s.icon}{s.label}</span>;
  };

  return (
    <div className="supplier-dashboard">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Мой кабинет поставщика</h1>
          <p className="admin-page-subtitle">
            {sellerInfo?.name} · Код: <strong>{sellerInfo?.sellerCode || '—'}</strong>
          </p>
        </div>
        <div className="admin-header-actions">
          <button className="btn-admin-secondary" onClick={fetchStats}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            <span>Обновить</span>
          </button>
          <button className="btn-admin-primary" onClick={() => navigate('/admin/products')}>
            <Plus size={16} />
            <span>Добавить товар</span>
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="sup-stats-grid">
        <div className="sup-stat-card sup-card-sales">
          <div className="sup-stat-top">
            <span className="sup-stat-label">МОИ ПРОДАЖИ</span>
            <div className="sup-stat-icon sales"><DollarSign size={20} /></div>
          </div>
          <div className="sup-stat-value">{formatPrice(stats?.totalSales)}</div>
          <div className="sup-stat-footer">{stats?.totalOrders || 0} заказов всего</div>
        </div>

        <div className="sup-stat-card sup-card-products">
          <div className="sup-stat-top">
            <span className="sup-stat-label">МОИ ТОВАРЫ</span>
            <div className="sup-stat-icon products"><Package size={20} /></div>
          </div>
          <div className="sup-stat-value">{stats?.totalProducts || 0}</div>
          <div className="sup-stat-footer">{stats?.activeProducts || 0} активных</div>
        </div>

        <div className="sup-stat-card sup-card-orders">
          <div className="sup-stat-top">
            <span className="sup-stat-label">ЗАКАЗЫ</span>
            <div className="sup-stat-icon orders"><ShoppingCart size={20} /></div>
          </div>
          <div className="sup-stat-value">{stats?.totalOrders || 0}</div>
          <div className="sup-stat-footer">По моим товарам</div>
        </div>

        <div className="sup-stat-card sup-card-alert">
          <div className="sup-stat-top">
            <span className="sup-stat-label">НУЖНО ВНИМАНИЕ</span>
            <div className="sup-stat-icon alert"><AlertTriangle size={20} /></div>
          </div>
          <div className="sup-stat-value">{(stats?.outOfStockProducts || 0) + (stats?.lowStockProducts || 0)}</div>
          <div className="sup-stat-footer">
            {stats?.outOfStockProducts || 0} нет · {stats?.lowStockProducts || 0} мало
          </div>
        </div>
      </div>

      {/* Unique code banner */}
      <div className="sup-code-banner">
        <div className="sup-code-banner-left">
          <div className="sup-code-icon">
            <Tag size={20} />
          </div>
          <div>
            <div className="sup-code-label">Уникальный код поставщика</div>
            <div className="sup-code-hint">Назначается системой для точной идентификации ваших поставок и взаиморасчётов</div>
          </div>
        </div>
        <div className="sup-code-badge-wrap">
          <span className="sup-code-badge">{sellerInfo?.sellerCode || 'SUP-????'}</span>
          <button
            type="button"
            className="sup-code-copy-btn"
            onClick={() => {
              if (sellerInfo?.sellerCode) {
                navigator.clipboard?.writeText(sellerInfo.sellerCode);
                alert(`Код ${sellerInfo.sellerCode} скопирован в буфер обмена`);
              }
            }}
            title="Скопировать код"
          >
            <Copy size={15} />
            <span>Скопировать</span>
          </button>
        </div>
      </div>

      {/* Quick actions */}
      <div className="sup-quick-grid">
        <div className="admin-card sup-quick-card">
          <h3 className="sup-section-title">Быстрые действия</h3>
          <div className="quick-actions-list">
            <button className="quick-btn" onClick={() => navigate('/admin/products')}>
              <Package size={18} /><span>Мои товары</span>
            </button>
            <button className="quick-btn" onClick={() => navigate('/admin/orders')}>
              <ShoppingCart size={18} /><span>Заказы по моим товарам</span>
            </button>
          </div>
        </div>

        <div className="admin-card">
          <h3 className="sup-section-title">Последние заказы</h3>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
              <RefreshCw size={20} className="spin" />
            </div>
          ) : !stats?.recentOrders?.length ? (
            <div className="sup-empty">Заказов по вашим товарам пока нет</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>№</th><th>Дата</th><th>Сумма</th><th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="font-bold">#{o.id}</td>
                    <td className="text-sub">{o.date}</td>
                    <td className="font-bold text-price">{formatPrice(o.totalPrice)}</td>
                    <td>{getStatusBadge(o.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
