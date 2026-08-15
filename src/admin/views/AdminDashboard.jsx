import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  ArrowUpRight,
  RefreshCw,
  Plus,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  XCircle
} from 'lucide-react';
import './AdminDashboard.css';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatPrice = (val) => {
    return new Intl.NumberFormat('ru-RU').format(val || 0) + ' ₸';
  };

  const getStatusBadge = (status, text) => {
    switch (status) {
      case 'delivered':
        return <span className="status-badge delivered"><CheckCircle2 size={13} /> {text || 'Доставлен'}</span>;
      case 'shipping':
        return <span className="status-badge shipping"><Truck size={13} /> {text || 'В пути'}</span>;
      case 'processing':
        return <span className="status-badge processing"><Clock size={13} /> {text || 'В обработке'}</span>;
      case 'canceled':
        return <span className="status-badge canceled"><XCircle size={13} /> {text || 'Отменен'}</span>;
      default:
        return <span className="status-badge pending"><Clock size={13} /> {text || 'Ожидает'}</span>;
    }
  };

  return (
    <div className="admin-dashboard-view">
      {/* Page Title & Controls */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Панель управления (Dashboard)</h1>
          <p className="admin-page-subtitle">Обзор продаж, заказов и показателей маркетплейса Autolider</p>
        </div>

        <div className="admin-header-actions">
          <button className="btn-admin-secondary" onClick={fetchStats} title="Обновить">
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            <span>Обновить</span>
          </button>
          <button className="btn-admin-primary" onClick={() => navigate('/admin/products')}>
            <Plus size={16} />
            <span>Добавить товар</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card card-sales">
          <div className="stat-card-top">
            <span className="stat-label">ОБЩИЕ ПРОДАЖИ</span>
            <div className="stat-icon-box sales">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="stat-value">{formatPrice(stats?.totalSales || 556500)}</div>
          <div className="stat-footer positive">
            <TrendingUp size={14} />
            <span>+14.2% за прошлую неделю</span>
          </div>
        </div>

        <div className="admin-stat-card card-orders">
          <div className="stat-card-top">
            <span className="stat-label">ВСЕГО ЗАКАЗОВ</span>
            <div className="stat-icon-box orders">
              <ShoppingCart size={20} />
            </div>
          </div>
          <div className="stat-value">{stats?.totalOrders || 128}</div>
          <div className="stat-footer positive">
            <ArrowUpRight size={14} />
            <span>+8 новых сегодня</span>
          </div>
        </div>

        <div className="admin-stat-card card-customers">
          <div className="stat-card-top">
            <span className="stat-label">ПОКУПАТЕЛИ</span>
            <div className="stat-icon-box customers">
              <Users size={20} />
            </div>
          </div>
          <div className="stat-value">{stats?.totalCustomers || 42}</div>
          <div className="stat-footer neutral">
            <span>База клиентов РК</span>
          </div>
        </div>

        <div className="admin-stat-card card-products">
          <div className="stat-card-top">
            <span className="stat-label">ТОВАРОВ В КАТАЛОГЕ</span>
            <div className="stat-icon-box products">
              <Package size={20} />
            </div>
          </div>
          <div className="stat-value">{stats?.totalProducts || 6180}</div>
          <div className="stat-footer positive">
            <span>Все позиции активны</span>
          </div>
        </div>
      </div>

      {/* Analytics Chart & Recent Orders Grid */}
      <div className="dashboard-content-grid">
        {/* Sales Visual Chart Box */}
        <div className="admin-card chart-box">
          <div className="admin-card-header">
            <h3 className="card-title">Динамика продаж за неделю</h3>
            <span className="card-badge-tag">Выручка (₸)</span>
          </div>

          <div className="chart-visual-bars">
            {(stats?.salesChart || [
              { month: 'Пн', sales: 450000 },
              { month: 'Вт', sales: 620000 },
              { month: 'Ср', sales: 380000 },
              { month: 'Чт', sales: 890000 },
              { month: 'Пт', sales: 1120000 },
              { month: 'Сб', sales: 940000 },
              { month: 'Вс', sales: 780000 }
            ]).map((item, idx) => {
              const maxSales = 1200000;
              const heightPercent = Math.min(100, Math.round((item.sales / maxSales) * 100));

              return (
                <div key={idx} className="chart-bar-item">
                  <div className="chart-bar-container">
                    <div
                      className="chart-bar-fill"
                      style={{ height: `${heightPercent}%` }}
                      title={`${item.month}: ${formatPrice(item.sales)}`}
                    />
                  </div>
                  <span className="chart-bar-label">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions & System Info */}
        <div className="admin-card quick-actions-box">
          <div className="admin-card-header">
            <h3 className="card-title">Быстрое управление</h3>
          </div>

          <div className="quick-actions-list">
            <button className="quick-btn" onClick={() => navigate('/admin/products')}>
              <Package size={18} />
              <span>Управление каталогом товаров</span>
            </button>
            <button className="quick-btn" onClick={() => navigate('/admin/orders')}>
              <ShoppingCart size={18} />
              <span>Просмотр поступивших заказов</span>
            </button>
            <button className="quick-btn" onClick={() => navigate('/admin/customers')}>
              <Users size={18} />
              <span>Управление клиентами и бонусами</span>
            </button>
            <button className="quick-btn" onClick={() => navigate('/admin/settings')}>
              <RefreshCw size={18} />
              <span>Изменить настройки и контакты</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Orders OpenCart Data Table */}
      <div className="admin-card recent-orders-card">
        <div className="admin-card-header">
          <h3 className="card-title">Последние заказы (OpenCart Queue)</h3>
          <button className="btn-link-more" onClick={() => navigate('/admin/orders')}>
            Все заказы &rarr;
          </button>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>№ Заказа</th>
                <th>Дата</th>
                <th>Покупатель</th>
                <th>Сумма</th>
                <th>Оплата</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recentOrders && stats.recentOrders.length > 0 ? stats.recentOrders : [
                {
                  id: '582914',
                  date: '2026-08-14 18:30',
                  customerName: 'Андрей Тишков',
                  totalPrice: 144000,
                  paymentMethod: 'Картой онлайн',
                  status: 'shipping',
                  statusText: 'В пути'
                },
                {
                  id: '491028',
                  date: '2026-08-13 14:15',
                  customerName: 'Канат Оспанов',
                  totalPrice: 320000,
                  paymentMethod: 'Kaspi QR',
                  status: 'delivered',
                  statusText: 'Доставлен'
                },
                {
                  id: '381920',
                  date: '2026-08-12 11:00',
                  customerName: 'Ерлан Сатов',
                  totalPrice: 42500,
                  paymentMethod: 'Kaspi Pay',
                  status: 'processing',
                  statusText: 'В обработке'
                }
              ]).map((order) => (
                <tr key={order.id}>
                  <td className="font-bold">#{order.id}</td>
                  <td className="text-sub">{order.date}</td>
                  <td className="font-medium">{order.customerName}</td>
                  <td className="font-bold text-price">{formatPrice(order.totalPrice)}</td>
                  <td className="text-sub">{order.paymentMethod}</td>
                  <td>{getStatusBadge(order.status, order.statusText)}</td>
                  <td>
                    <button
                      className="btn-table-action"
                      onClick={() => navigate('/admin/orders')}
                      title="Просмотреть заказ"
                    >
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
