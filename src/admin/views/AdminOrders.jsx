import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingCart,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  X,
  RefreshCw,
  Trash2,
  Search,
  Filter,
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import './AdminOrders.css';

const monthNamesRu = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
];

function getOrderMonthKey(dateStr) {
  if (!dateStr) return { key: "unknown", label: "Без даты" };

  const dotMatch = String(dateStr).match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (dotMatch) {
    const monthIdx = parseInt(dotMatch[2], 10) - 1;
    const year = dotMatch[3];
    if (monthIdx >= 0 && monthIdx < 12) {
      return {
        key: `${year}-${String(monthIdx + 1).padStart(2, '0')}`,
        label: `${monthNamesRu[monthIdx]} ${year}`
      };
    }
  }

  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    const year = d.getFullYear();
    const monthIdx = d.getMonth();
    return {
      key: `${year}-${String(monthIdx + 1).padStart(2, '0')}`,
      label: `${monthNamesRu[monthIdx]} ${year}`
    };
  }

  return { key: "unknown", label: "Без даты" };
}

export const AdminOrders = () => {
  const { showToast, products = [] } = useApp();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Detect seller role
  const sellerInfo = (() => {
    try { return JSON.parse(localStorage.getItem('autolider_admin_user')); } catch { return null; }
  })();
  const isSeller = sellerInfo?.roleKey === 'seller';
  const sellerId = sellerInfo?.sellerId || null;

  const getItemDetails = (rawItem, idx, fallbackOrderTotal = 0, totalItems = 1) => {
    const pObj = rawItem?.product || rawItem?.item || rawItem?.rawProduct || rawItem || {};

    let matchedProduct = null;
    const searchId = pObj.id || rawItem?.id || rawItem?.productId;
    if (searchId) {
      matchedProduct = (products || []).find((p) => String(p.id) === String(searchId));
    }
    if (!matchedProduct) {
      const searchSku = pObj.sku || pObj.article || rawItem?.sku || rawItem?.article;
      if (searchSku) {
        matchedProduct = (products || []).find(
          (p) => p.sku && p.sku.toLowerCase() === String(searchSku).toLowerCase()
        );
      }
    }
    if (!matchedProduct) {
      const searchTitle = pObj.title || pObj.name || pObj.productName || rawItem?.title || rawItem?.name;
      if (searchTitle) {
        matchedProduct = (products || []).find(
          (p) => p.title && p.title.toLowerCase() === String(searchTitle).toLowerCase()
        );
      }
    }

    const fallbackCatalogProd = (products || [])[idx % (products?.length || 1)];

    const title =
      pObj.title ||
      pObj.name ||
      pObj.productName ||
      rawItem?.title ||
      rawItem?.name ||
      rawItem?.productName ||
      matchedProduct?.title ||
      fallbackCatalogProd?.title ||
      `Автозапчасть #${idx + 1}`;

    let price =
      Number(pObj.price) > 0
        ? Number(pObj.price)
        : Number(rawItem?.price) > 0
        ? Number(rawItem.price)
        : matchedProduct?.price
        ? Number(matchedProduct.price)
        : 0;

    const quantity = Number(rawItem?.quantity || rawItem?.qty || rawItem?.count || pObj.quantity || pObj.qty || 1) || 1;

    if (price === 0 && fallbackOrderTotal > 0) {
      price = Math.round(fallbackOrderTotal / (totalItems || 1));
    }

    const totalSum = price * quantity;

    const article =
      pObj.article ||
      pObj.sku ||
      rawItem?.article ||
      rawItem?.sku ||
      matchedProduct?.sku ||
      matchedProduct?.article ||
      fallbackCatalogProd?.sku ||
      `ALT-0${idx + 1}`;

    const image =
      pObj.image ||
      rawItem?.image ||
      matchedProduct?.image ||
      matchedProduct?.images?.[0] ||
      fallbackCatalogProd?.image ||
      '';

    return {
      title,
      price,
      quantity,
      totalSum,
      article,
      image,
      matchedProduct
    };
  };

  // Filters & collapse states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [collapsedMonths, setCollapsedMonths] = useState({});

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        let data = await res.json();
        // Filter for seller: only orders containing seller's products
        if (isSeller && sellerId) {
          const sellerProdRes = await fetch(`/api/products?all=true&seller_id=${sellerId}`);
          if (sellerProdRes.ok) {
            const sellerProds = await sellerProdRes.json();
            const productIds = new Set(sellerProds.map((p) => String(p.id)));
            data = data.filter((o) =>
              (o.items || []).some((item) => productIds.has(String(item.id || item.productId)))
            );
          }
        }
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const toggleMonthCollapse = (key) => {
    setCollapsedMonths((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Compute available months
  const availableMonths = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      const { key, label } = getOrderMonthKey(o.date);
      if (key !== 'unknown') {
        map[key] = label;
      }
    });
    return Object.entries(map)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, label]) => ({ key, label }));
  }, [orders]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        String(o.id).toLowerCase().includes(q) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.customerPhone && o.customerPhone.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;

      const { key } = getOrderMonthKey(o.date);
      const matchesMonth = monthFilter === 'all' || key === monthFilter;

      return matchesSearch && matchesStatus && matchesMonth;
    });
  }, [orders, searchTerm, statusFilter, monthFilter]);

  // Group filtered orders by month
  const monthGroups = useMemo(() => {
    const groups = {};
    filteredOrders.forEach((o) => {
      const { key, label } = getOrderMonthKey(o.date);
      if (!groups[key]) {
        groups[key] = {
          key,
          label,
          orders: [],
          totalRevenue: 0,
        };
      }
      groups[key].orders.push(o);
      groups[key].totalRevenue += Number(o.totalPrice) || 0;
    });

    return Object.values(groups).sort((a, b) => b.key.localeCompare(a.key));
  }, [filteredOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(updated);
        }
        if (showToast) showToast('Статус заказа обновлен', 'success');
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(`Вы действительно хотите удалить заказ #${orderId}?`)) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(null);
        }
        if (showToast) showToast(`Заказ #${orderId} удален`, 'success');
      }
    } catch (err) {
      console.error('Failed to delete order:', err);
      if (showToast) showToast('Ошибка при удалении заказа', 'error');
    }
  };

  const formatPrice = (val) => {
    return new Intl.NumberFormat('ru-RU').format(val || 0) + ' ₸';
  };

  return (
    <div className="admin-orders-view">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Заказы клиентов</h1>
          <p className="admin-page-subtitle">Группировка по месяцах, фильтрация и смена статусов</p>
        </div>
        <button
          className="btn-admin-secondary"
          onClick={loadOrders}
          title="Обновить"
        >
          <RefreshCw size={16} className={loading ? "spin" : ""} />
          <span>Обновить</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="admin-card orders-filter-card">
        <div className="search-input-box orders-search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Поиск по № заказа, имени или телефону..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchTerm("")}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center" }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="orders-filter-controls">
          {/* Month Filter */}
          <div className="orders-select-wrapper">
            <Calendar size={15} className="select-inner-icon" />
            <select
              className="orders-filter-select with-icon"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
            >
              <option value="all">Все месяцы ({orders.length})</option>
              {availableMonths.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="orders-select-wrapper">
            <Filter size={15} className="select-inner-icon" />
            <select
              className="orders-filter-select with-icon"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Все статусы</option>
              <option value="processing">В обработке</option>
              <option value="shipping">В пути</option>
              <option value="delivered">Доставлен</option>
              <option value="pending">Ожидает оплаты</option>
              <option value="canceled">Отменен</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="admin-card loading-box">
          <RefreshCw size={24} className="spin" />
          <p style={{ color: "#64748b", marginTop: "12px" }}>Загрузка заказов...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="admin-card orders-empty-state">
          <div className="orders-empty-icon-wrapper">
            <ShoppingCart size={44} strokeWidth={1.5} color="#94a3b8" />
          </div>
          <h3 className="orders-empty-title">Заказов пока нет</h3>
          <p className="orders-empty-desc">
            Здесь будет отображаться список всех поступающих заказов от покупателей.
          </p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="admin-card orders-empty-state">
          <h3 className="orders-empty-title">Заказы не найдены</h3>
          <p className="orders-empty-desc">
            По заданным фильтрам ничего не найдено.
          </p>
          <button
            type="button"
            className="btn-admin-secondary"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setMonthFilter('all');
            }}
            style={{ marginTop: '16px' }}
          >
            Сбросить фильтры
          </button>
        </div>
      ) : (
        /* Grouped by Month Cards */
        monthGroups.map((group) => {
          const isCollapsed = !!collapsedMonths[group.key];
          return (
            <div key={group.key} className="month-group-card">
              <div
                className="month-group-header"
                onClick={() => toggleMonthCollapse(group.key)}
              >
                <div className="month-group-title">
                  <Calendar size={18} color="#ea2427" />
                  <span>{group.label}</span>
                  <span className="month-count-badge">
                    {group.orders.length} заказов
                  </span>
                </div>

                <div className="month-group-stats">
                  <span className="month-total-price">
                    {formatPrice(group.totalRevenue)}
                  </span>
                  <button className="month-toggle-btn" type="button">
                    {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                  </button>
                </div>
              </div>

              {!isCollapsed && (
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>№ Заказа</th>
                        <th>Дата / Время</th>
                        <th>Покупатель</th>
                        <th>Телефон</th>
                        <th>Сумма</th>
                        <th>Оплата</th>
                        <th>Статус заказа</th>
                        <th>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.orders.map((o) => (
                        <tr key={o.id}>
                          <td className="font-bold">#{o.id}</td>
                          <td className="text-sub">{o.date}</td>
                          <td className="font-medium">{o.customerName}</td>
                          <td className="text-sub">{o.customerPhone}</td>
                          <td className="font-bold text-price">{formatPrice(o.totalPrice)}</td>
                          <td className="text-sub">{o.paymentMethod}</td>
                          <td>
                            <select
                              className="status-select-inline"
                              value={o.status}
                              onChange={(e) => handleStatusChange(o.id, e.target.value)}
                            >
                              <option value="pending">Ожидает оплаты</option>
                              <option value="processing">В обработке</option>
                              <option value="paid">Оплачен ✔</option>
                              <option value="shipping">В пути</option>
                              <option value="delivered">Доставлен</option>
                              <option value="canceled">Отменен</option>
                            </select>
                          </td>
                          <td>
                            <div className="order-actions-cell" style={{ display: 'flex', gap: '6px' }}>
                              <button
                                className="btn-table-action"
                                onClick={() => setSelectedOrder(o)}
                                title="Детали заказа"
                              >
                                <Eye size={15} />
                              </button>
                              <button
                                className="btn-table-action btn-delete-action"
                                onClick={() => handleDeleteOrder(o.id)}
                                title="Удалить заказ"
                                style={{ color: '#ef4444' }}
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
              )}
            </div>
          );
        })
      )}

      {/* Order Details Modal */}
      {selectedOrder && (() => {
        const rawItems = selectedOrder.items && selectedOrder.items.length > 0 ? selectedOrder.items : [selectedOrder];
        const parsedItems = rawItems.map((it, idx) => getItemDetails(it, idx, selectedOrder.totalPrice, rawItems.length));
        const itemsTotal = parsedItems.reduce((sum, i) => sum + i.totalSum, 0);
        const displayOrderPrice = selectedOrder.totalPrice && selectedOrder.totalPrice > 0 ? selectedOrder.totalPrice : itemsTotal;
        const orderBonusSpent = typeof selectedOrder.bonusSpent === 'number'
          ? selectedOrder.bonusSpent
          : Number(selectedOrder.usedBonuses || selectedOrder.bonus || 0);

        const orderBonusEarned = typeof selectedOrder.bonusEarned === 'number'
          ? selectedOrder.bonusEarned
          : 0;

        return (
          <div className="admin-modal-overlay" onClick={() => setSelectedOrder(null)}>
            <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h3 className="modal-title">Детали заказа #{selectedOrder.id}</h3>
                <button className="btn-modal-close" onClick={() => setSelectedOrder(null)}>
                  <X size={20} />
                </button>
              </div>

              <div className="admin-modal-form">
                <div className="order-meta-info-grid">
                  <div className="meta-card">
                    <span className="meta-card-label">ПОКУПАТЕЛЬ</span>
                    <span className="meta-card-value">{selectedOrder.customerName || 'Покупатель'}</span>
                    <span className="meta-card-sub">{selectedOrder.customerPhone || 'Не указан'}</span>
                  </div>

                  <div className="meta-card">
                    <span className="meta-card-label">АДРЕС ДОСТАВКИ</span>
                    <span className="meta-card-value">{selectedOrder.address || 'Самовывоз / Уточнить'}</span>
                  </div>

                  <div className="meta-card">
                    <span className="meta-card-label">ОПЛАТА И СУММА</span>
                    <span className="meta-card-value text-price">{formatPrice(displayOrderPrice)}</span>
                    <span className="meta-card-sub">{selectedOrder.paymentMethod || 'Freedom Pay'}</span>
                    {orderBonusSpent > 0 && (
                      <span className="meta-card-sub" style={{ color: '#ea2427', fontWeight: '700', marginTop: '4px', display: 'block' }}>
                        Оплачено бонусами: -{formatPrice(orderBonusSpent)}
                      </span>
                    )}
                    {orderBonusEarned > 0 && (
                      <span className="meta-card-sub" style={{ color: '#16a34a', fontWeight: '700', marginTop: '2px', display: 'block' }}>
                        Начислено бонусов: +{formatPrice(orderBonusEarned)}
                      </span>
                    )}
                  </div>

                  <div className="meta-card">
                    <span className="meta-card-label">КОММЕНТАРИЙ</span>
                    <span className="meta-card-value" style={{ fontSize: '13px', fontWeight: '500', color: selectedOrder.comment ? '#1e293b' : '#94a3b8' }}>
                      {selectedOrder.comment || 'Нет комментария'}
                    </span>
                  </div>
                </div>

                <div className="order-items-table-box">
                  <h4 className="sub-title">Содержимое заказа ({parsedItems.reduce((s, i) => s + i.quantity, 0)} шт)</h4>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Товар</th>
                        <th>Артикул</th>
                        <th>Цена</th>
                        <th>Кол-во</th>
                        <th>Итого</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedItems.map((item, idx) => (
                        <tr key={idx}>
                          <td className="font-medium">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt=""
                                  style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #eee' }}
                                />
                              )}
                              <span>{item.title}</span>
                            </div>
                          </td>
                          <td style={{ color: '#666', fontSize: '13px' }}>{item.article}</td>
                          <td>{formatPrice(item.price)}</td>
                          <td>{item.quantity} шт</td>
                          <td className="font-bold text-price">{formatPrice(item.totalSum)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="admin-modal-footer">
                  <button className="btn-admin-secondary" onClick={() => setSelectedOrder(null)}>
                    Закрыть
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
