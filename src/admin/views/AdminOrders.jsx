import React, { useState, useEffect } from 'react';
import { ShoppingCart, Eye, CheckCircle2, Clock, Truck, XCircle, X } from 'lucide-react';
import './AdminOrders.css';

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) setOrders(await res.json());
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

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
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

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
    <div className="admin-orders-view">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Заказы клиентов (OpenCart Orders)</h1>
          <p className="admin-page-subtitle">Обработка поступающих заказов, смена статусов и отслеживание</p>
        </div>
      </div>

      <div className="admin-card">
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
                <th>Статус OpenCart</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
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
                      <option value="shipping">В пути</option>
                      <option value="delivered">Доставлен</option>
                      <option value="canceled">Отменен</option>
                    </select>
                  </td>
                  <td>
                    <button
                      className="btn-table-action"
                      onClick={() => setSelectedOrder(o)}
                      title="Детали заказа"
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

      {/* Order Details Modal */}
      {selectedOrder && (
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
                  <span className="meta-card-value">{selectedOrder.customerName}</span>
                  <span className="meta-card-sub">{selectedOrder.customerPhone}</span>
                </div>

                <div className="meta-card">
                  <span className="meta-card-label">АДРЕС ДОСТАВКИ</span>
                  <span className="meta-card-value">{selectedOrder.address}</span>
                </div>

                <div className="meta-card">
                  <span className="meta-card-label">ОПЛАТА И СУММА</span>
                  <span className="meta-card-value text-price">{formatPrice(selectedOrder.totalPrice)}</span>
                  <span className="meta-card-sub">{selectedOrder.paymentMethod}</span>
                </div>
              </div>

              <div className="order-items-table-box">
                <h4 className="sub-title">Содержимое заказа</h4>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Товар</th>
                      <th>Цена</th>
                      <th>Кол-во</th>
                      <th>Итого</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="font-medium">{item.title}</td>
                        <td>{formatPrice(item.price)}</td>
                        <td>{item.quantity} шт</td>
                        <td className="font-bold">{formatPrice(item.price * item.quantity)}</td>
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
      )}
    </div>
  );
};
