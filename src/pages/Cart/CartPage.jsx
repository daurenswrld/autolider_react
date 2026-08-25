import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Trash2,
  Truck,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { updateSEO } from "../../utils/seo";
import "./CartPage.css";

const getDeliveryDates = () => {
  const MONTHS = [
    "янв",
    "фев",
    "мар",
    "апр",
    "мая",
    "июн",
    "июл",
    "авг",
    "сен",
    "окт",
    "ноя",
    "дек",
  ];
  const d1 = new Date();
  d1.setDate(d1.getDate() + 3);
  const d2 = new Date();
  d2.setDate(d2.getDate() + 5);
  const m1 = MONTHS[d1.getMonth()];
  const m2 = MONTHS[d2.getMonth()];
  if (m1 === m2) return `${d1.getDate()}–${d2.getDate()} ${m1}`;
  return `${d1.getDate()} ${m1} – ${d2.getDate()} ${m2}`;
};

export const CartPage = () => {
  React.useEffect(() => {
    updateSEO({
      title: "Корзина покупок — AUTOLIDER",
      description: "Оформление заказа автозапчастей в интернет-магазине AUTOLIDER.",
    });
  }, []);

  const navigate = useNavigate();
  const {
    cart,
    cartCount,
    cartTotal,
    updateCartQty,
    removeFromCart,
    clearCart,
    showToast,
    currentUser,
  } = useApp();

  // State to track expanded description per item ID
  const [expandedItems, setExpandedItems] = useState({});
  const [useBonuses, setUseBonuses] = useState(true);

  // Selected items state — init with all product IDs
  const [selectedIds, setSelectedIds] = useState(
    () => new Set((cart || []).map(({ product }) => product.id)),
  );

  // Keep selectedIds in sync when cart changes (new item added)
  React.useEffect(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      (cart || []).forEach(({ product }) => {
        if (!next.has(product.id)) next.add(product.id);
      });
      // Remove IDs no longer in cart
      const cartIds = new Set((cart || []).map(({ product }) => product.id));
      next.forEach((id) => {
        if (!cartIds.has(id)) next.delete(id);
      });
      return next;
    });
  }, [cart]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const allSelected = (cart || []).every(({ product }) =>
    selectedIds.has(product.id),
  );
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set((cart || []).map(({ product }) => product.id)));
    }
  };

  const toggleExpand = (id) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isEmpty = !cart || cart.length === 0;

  // Calculate numbers ONLY from selected items
  const selectedCart = (cart || []).filter(({ product }) =>
    selectedIds.has(product.id),
  );
  const itemCount = selectedCart.reduce((sum, { qty }) => sum + (qty || 1), 0);
  const rawSubtotal = selectedCart.reduce(
    (sum, { product, qty }) => sum + (product.price || 0) * (qty || 1),
    0,
  );
  const discountAmount =
    rawSubtotal > 50000 ? Math.round(rawSubtotal * 0.03) : 0;
  const bonusEarned = useBonuses ? 0 : Math.round(rawSubtotal * 0.05);
  const userBonusBalance = currentUser?.bonusBalance || 0;
  const maxBonusSpend = Math.min(
    userBonusBalance,
    Math.round(rawSubtotal * 0.2),
  );
  const bonusSpent = useBonuses && rawSubtotal > 0 ? maxBonusSpend : 0;
  const finalTotal = Math.max(0, rawSubtotal - discountAmount - bonusSpent);

  return (
    <section className="cart-page-section">
      <div className="cart-bg-clouds" />

      <div className="cart-container">
        {isEmpty ? (
          /* Empty Cart State */
          <div className="empty-cart-card">
            <div className="empty-cart-icon-box">
              <ImageIcon size={44} strokeWidth={1.5} />
            </div>

            <h1 className="empty-cart-title">Корзина пока пустая</h1>
            <p className="empty-cart-subtitle">
              Добавляйте товары в избранном,{"\n"}что бы не потерять их и купить
              позже
            </p>

            <Link to="/catalog" className="btn-to-shop">
              <span>К покупкам</span>
              <ShoppingCart size={18} />
            </Link>
          </div>
        ) : (
          /* Filled Cart Layout matching exact design mockup */
          <div className="cart-layout-grid">
            {/* Product Cards Stack (Left Column) */}
            <div className="cart-products-list">
              {/* Select all row */}
              <div className="cart-select-all-row">
                <label className="cart-select-all-label">
                  <input
                    type="checkbox"
                    className="cart-checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                  />
                  <span>Выбрать все ({(cart || []).length})</span>
                </label>
                {selectedIds.size > 0 &&
                  selectedIds.size < (cart || []).length && (
                    <span className="cart-selected-count">
                      Выбрано: {selectedIds.size}
                    </span>
                  )}
              </div>

              {cart.map(({ product, qty }) => {
                const isExpanded = !!expandedItems[product.id];
                return (
                  <div className="cart-item-card" key={product.id}>
                    {/* Red Checkbox */}
                    <input
                      type="checkbox"
                      className="cart-checkbox"
                      checked={selectedIds.has(product.id)}
                      onChange={() => toggleSelect(product.id)}
                    />

                    {/* Image / Image Placeholder */}
                    <Link
                      to={`/product/${product.id}`}
                      className="cart-item-image-box"
                    >
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.title}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <ImageIcon size={44} strokeWidth={1.5} />
                      )}
                    </Link>

                    {/* Body */}
                    <div className="cart-item-body">
                      {/* Header Title + Trash Icon */}
                      <div className="cart-item-header">
                        <h3 className="cart-item-title">
                          <Link
                            to={`/product/${product.id}`}
                            style={{ textDecoration: "none", color: "inherit" }}
                          >
                            {product.title}
                          </Link>
                        </h3>
                        <button
                          className="cart-item-remove-btn"
                          onClick={() => removeFromCart(product.id)}
                          title="Удалить из корзины"
                          type="button"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>

                      {/* Expandable Description */}
                      {product.description && product.description.trim() && (
                        <div className="cart-item-desc-wrapper">
                          <button
                            className="cart-item-desc-toggle"
                            onClick={() => toggleExpand(product.id)}
                            type="button"
                          >
                            <span>Описание</span>
                            {isExpanded ? (
                              <ChevronUp size={16} color="#666" />
                            ) : (
                              <ChevronDown size={16} color="#666" />
                            )}
                          </button>
                          {isExpanded && (
                            <p className="cart-item-desc-text">
                              {product.description}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Delivery Info */}
                      <div className="cart-item-delivery">
                        <Truck size={15} />
                        <span>
                          Доставка:{" "}
                          <span className="delivery-dates">
                            {getDeliveryDates()}
                          </span>
                        </span>
                      </div>

                      {/* Bottom Row Controls */}
                      <div className="cart-item-bottom">
                        <span className="cart-item-price-unit">
                          {product.price.toLocaleString("ru-RU")} ₸/шт
                        </span>

                        <div className="cart-qty-picker">
                          <button
                            className="qty-btn-sm"
                            onClick={() => updateCartQty(product.id, qty - 1)}
                            type="button"
                          >
                            -
                          </button>
                          <span className="qty-number">{qty}</span>
                          <button
                            className="qty-btn-sm"
                            onClick={() => updateCartQty(product.id, qty + 1)}
                            type="button"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary Card ("Итого") (Right Column) */}
            <div className="cart-summary-card">
              <h2 className="summary-card-title">Итого</h2>

              <div className="summary-rows-group">
                <div className="summary-item-row">
                  <span>{itemCount} товаров</span>
                  <span className="val">
                    {rawSubtotal.toLocaleString("ru-RU")} ₸
                  </span>
                </div>

                {bonusEarned > 0 && (
                  <div className="summary-item-row">
                    <span>Бонус за заказ</span>
                    <span className="val-green">
                      +{bonusEarned.toLocaleString("ru-RU")} ₸
                    </span>
                  </div>
                )}

                {bonusSpent > 0 && (
                  <div className="summary-item-row">
                    <span>Оплата бонусами</span>
                    <span className="val">
                      -{bonusSpent.toLocaleString("ru-RU")}B
                    </span>
                  </div>
                )}
              </div>

              <div className="summary-divider" />

              <div className="summary-subtotal-row">
                <span>Сумма товаров</span>
                <span className="val-bold">
                  {finalTotal.toLocaleString("ru-RU")} ₸
                </span>
              </div>

              <div className="summary-subtotal-row">
                <span>Доставка бесплатно</span>
                <span>Бесплатно</span>
              </div>

              {/* Bonus Switch Toggle */}
              <div className="bonus-use-row">
                <div className="bonus-use-left">
                  <div className="bonus-coin-icon">B</div>
                  <div className="bonus-use-info">
                    <span className="bonus-use-title">Потратить бонусы</span>
                    <span className="bonus-use-amount">
                      {userBonusBalance > 0
                        ? `${maxBonusSpend.toLocaleString("ru-RU")} ₸`
                        : "Нет бонусов"}
                    </span>
                  </div>
                </div>

                <label className="switch-toggle">
                  <input
                    type="checkbox"
                    checked={useBonuses}
                    onChange={(e) => setUseBonuses(e.target.checked)}
                  />
                  <span className="switch-slider" />
                </label>
              </div>

              <button
                className="btn-summary-checkout"
                onClick={() => navigate("/checkout")}
                type="button"
              >
                Оформить заказ
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
