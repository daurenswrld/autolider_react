import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  XCircle,
} from "lucide-react";
import "./AdminDashboard.css";

const DynamicSalesChart = ({ loading, data = [], formatPrice }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (loading) {
    return (
      <div
        style={{
          height: "220px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#94a3b8",
          gap: "8px",
        }}
      >
        <RefreshCw size={20} className="spin" />
        <span>Загрузка данных...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div
        style={{
          height: "220px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#94a3b8",
        }}
      >
        Нет данных за этот период
      </div>
    );
  }

  const width = 600;
  const height = 240;
  const paddingTop = 40;
  const paddingBottom = 40;
  const paddingLeft = 65;
  const paddingRight = 35;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxSalesValue = Math.max(...data.map((d) => d.sales || 0), 50000);

  const points = data.map((item, idx) => {
    const x = paddingLeft + (idx / Math.max(data.length - 1, 1)) * chartWidth;
    const yRatio = (item.sales || 0) / maxSalesValue;
    const y = height - paddingBottom - yRatio * chartHeight;
    return { x, y, ...item };
  });

  const createSmoothPath = (pts) => {
    if (pts.length === 0) return "";
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i];
      const next = pts[i + 1];
      const cp1x = curr.x + (next.x - curr.x) / 2;
      const cp1y = curr.y;
      const cp2x = curr.x + (next.x - curr.x) / 2;
      const cp2y = next.y;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }
    return path;
  };

  const linePath = createSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

  const gridTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div style={{ position: "relative", width: "100%", padding: "10px 0" }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e63125" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#e63125" stopOpacity="0.0" />
          </linearGradient>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow
              dx="0"
              dy="4"
              stdDeviation="4"
              floodColor="#e63125"
              floodOpacity="0.2"
            />
          </filter>
        </defs>

        {/* Gridlines and Y Labels */}
        {gridTicks.map((ratio, idx) => {
          const y = height - paddingBottom - ratio * chartHeight;
          const val = Math.round(ratio * maxSalesValue);
          return (
            <g key={idx}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="#f1f5f9"
                strokeDasharray={ratio === 0 ? undefined : "4 4"}
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 10}
                y={y + 4}
                textAnchor="end"
                fill="#94a3b8"
                fontSize="11"
                fontWeight="500"
              >
                {ratio === 0 ? "0 ₸" : `${Math.round(val / 1000)}k ₸`}
              </text>
            </g>
          );
        })}

        {/* Area Fill */}
        <path d={areaPath} fill="url(#chartGradient)" />

        {/* Smooth Curved Line */}
        <path
          d={linePath}
          fill="none"
          stroke="#e63125"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#shadow)"
        />

        {/* Points & X Axis Labels */}
        {points.map((pt, idx) => {
          const isHovered = hoveredIdx === idx;
          return (
            <g key={idx}>
              <text
                x={pt.x}
                y={height - 12}
                textAnchor="middle"
                fill={isHovered ? "#e63125" : "#64748b"}
                fontSize="12"
                fontWeight={isHovered ? "700" : "500"}
              >
                {pt.label || pt.month}
              </text>

              {isHovered && (
                <line
                  x1={pt.x}
                  y1={paddingTop}
                  x2={pt.x}
                  y2={height - paddingBottom}
                  stroke="#e63125"
                  strokeOpacity="0.3"
                  strokeDasharray="3 3"
                />
              )}

              <circle
                cx={pt.x}
                cy={pt.y}
                r={isHovered ? 7 : 4}
                fill={isHovered ? "#e63125" : "#ffffff"}
                stroke="#e63125"
                strokeWidth={isHovered ? 3 : 2}
                style={{ transition: "all 0.2s ease", cursor: "pointer" }}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            </g>
          );
        })}
      </svg>

      {/* Hover Tooltip */}
      {hoveredIdx !== null && points[hoveredIdx] && (
        <div
          style={{
            position: "absolute",
            top: `${(points[hoveredIdx].y / height) * 100}%`,
            left: `${(points[hoveredIdx].x / width) * 100}%`,
            transform: "translate(-50%, -130%)",
            background: "#0f172a",
            color: "#ffffff",
            padding: "6px 12px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: "600",
            boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            zIndex: 10,
          }}
        >
          <div
            style={{ color: "#94a3b8", fontSize: "10px", marginBottom: "2px" }}
          >
            {points[hoveredIdx].label || points[hoveredIdx].month}
          </div>
          <div>{formatPrice(points[hoveredIdx].sales)}</div>
        </div>
      )}
    </div>
  );
};

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatPrice = (val) => {
    return new Intl.NumberFormat("ru-RU").format(val || 0) + " ₸";
  };

  const currentChartData = stats?.monthlyChart || [];
  const maxSales = Math.max(...currentChartData.map((d) => d.sales || 0), 1000);

  const getStatusBadge = (status, text) => {
    switch (status) {
      case "delivered":
        return (
          <span className="status-badge delivered">
            <CheckCircle2 size={13} /> {text || "Доставлен"}
          </span>
        );
      case "shipping":
        return (
          <span className="status-badge shipping">
            <Truck size={13} /> {text || "В пути"}
          </span>
        );
      case "processing":
        return (
          <span className="status-badge processing">
            <Clock size={13} /> {text || "В обработке"}
          </span>
        );
      case "canceled":
        return (
          <span className="status-badge canceled">
            <XCircle size={13} /> {text || "Отменен"}
          </span>
        );
      default:
        return (
          <span className="status-badge pending">
            <Clock size={13} /> {text || "Ожидает"}
          </span>
        );
    }
  };

  return (
    <div className="admin-dashboard-view">
      {/* Page Title & Controls */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Панель управления</h1>
          <p className="admin-page-subtitle">
            Обзор продаж, заказов и показателей маркетплейса Autolider
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            className="btn-admin-secondary"
            onClick={fetchStats}
            title="Обновить"
          >
            <RefreshCw size={16} className={loading ? "spin" : ""} />
            <span>Обновить</span>
          </button>
          <button
            className="btn-admin-primary"
            onClick={() => navigate("/admin/products")}
          >
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
          <div className="stat-value">
            {formatPrice(stats?.totalSales || 0)}
          </div>
          <div className="stat-footer positive">
            <TrendingUp size={14} />
            <span>
              {stats?.salesGrowthPercent !== undefined
                ? `${stats.salesGrowthPercent >= 0 ? "+" : ""}${stats.salesGrowthPercent}% динамика`
                : "+0.0% динамика"}
            </span>
          </div>
        </div>

        <div className="admin-stat-card card-orders">
          <div className="stat-card-top">
            <span className="stat-label">ВСЕГО ЗАКАЗОВ</span>
            <div className="stat-icon-box orders">
              <ShoppingCart size={20} />
            </div>
          </div>
          <div className="stat-value">{stats?.totalOrders || 0}</div>
          <div className="stat-footer positive">
            <ArrowUpRight size={14} />
            <span>+{stats?.todayOrdersCount || 0} новых сегодня</span>
          </div>
        </div>

        <div className="admin-stat-card card-customers">
          <div className="stat-card-top">
            <span className="stat-label">ПОКУПАТЕЛИ</span>
            <div className="stat-icon-box customers">
              <Users size={20} />
            </div>
          </div>
          <div className="stat-value">{stats?.totalCustomers || 0}</div>
          <div className="stat-footer neutral">
            <span>Зарегистрировано</span>
          </div>
        </div>

        <div className="admin-stat-card card-products">
          <div className="stat-card-top">
            <span className="stat-label">ТОВАРОВ В КАТАЛОГЕ</span>
            <div className="stat-icon-box products">
              <Package size={20} />
            </div>
          </div>
          <div className="stat-value">{stats?.totalProducts || 0}</div>
          <div className="stat-footer positive">
            <span>
              {stats?.activeProducts !== undefined
                ? stats.activeProducts
                : stats?.totalProducts || 0}{" "}
              позиций активно
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Chart & Recent Orders Grid */}
      <div className="dashboard-content-grid">
        {/* Sales Visual Chart Box */}
        <div className="admin-card chart-box">
          <div className="admin-card-header">
            <h3 className="card-title">
              Динамика продаж за последние 5 месяцев
            </h3>
            <span className="card-badge-tag">Выручка (₸)</span>
          </div>

          <DynamicSalesChart
            loading={loading}
            data={currentChartData}
            formatPrice={formatPrice}
          />
        </div>

        {/* Quick Actions & System Info */}
        <div className="admin-card quick-actions-box">
          <div className="admin-card-header">
            <h3 className="card-title">Быстрое управление</h3>
          </div>

          <div className="quick-actions-list">
            <button
              className="quick-btn"
              onClick={() => navigate("/admin/products")}
            >
              <Package size={18} />
              <span>Управление каталогом товаров</span>
            </button>
            <button
              className="quick-btn"
              onClick={() => navigate("/admin/orders")}
            >
              <ShoppingCart size={18} />
              <span>Просмотр поступивших заказов</span>
            </button>
            <button
              className="quick-btn"
              onClick={() => navigate("/admin/customers")}
            >
              <Users size={18} />
              <span>Управление клиентами и бонусами</span>
            </button>
            <button
              className="quick-btn"
              onClick={() => navigate("/admin/settings")}
            >
              <RefreshCw size={18} />
              <span>Изменить настройки и контакты</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Orders Data Table */}
      <div className="admin-card recent-orders-card">
        <div className="admin-card-header">
          <h3 className="card-title">Последние заказы</h3>
          <button
            className="btn-link-more"
            onClick={() => navigate("/admin/orders")}
          >
            Все заказы &rarr;
          </button>
        </div>

        <div className="table-responsive">
          {!stats?.recentOrders || stats.recentOrders.length === 0 ? (
            <div
              style={{ padding: "30px", textAlign: "center", color: "#888" }}
            >
              Заказов пока нет
            </div>
          ) : (
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
                {stats.recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-bold">#{order.id}</td>
                    <td className="text-sub">{order.date}</td>
                    <td className="font-medium">{order.customerName}</td>
                    <td className="font-bold text-price">
                      {formatPrice(order.totalPrice)}
                    </td>
                    <td className="text-sub">{order.paymentMethod}</td>
                    <td>{getStatusBadge(order.status, order.statusText)}</td>
                    <td>
                      <button
                        className="btn-table-action"
                        onClick={() => navigate("/admin/orders")}
                        title="Просмотреть заказ"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
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
