import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Truck,
  Package,
  Heart,
  Trash2,
  MapPin,
  Check,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  CreditCard,
  Image as ImageIcon,
  ShoppingCart,
  LogOut
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { updateSEO } from '../../utils/seo';
import './ProfilePage.css';

const formatPhoneMask = (input) => {
  if (!input) return "";
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("7") || digits.startsWith("8")) {
    digits = digits.slice(1);
  }
  digits = digits.slice(0, 10);

  let formatted = "+7 (";
  if (digits.length > 0) {
    formatted += digits.slice(0, 3);
  }
  if (digits.length >= 3) {
    formatted += ") ";
  }
  if (digits.length > 3) {
    formatted += digits.slice(3, 6);
  }
  if (digits.length >= 6) {
    formatted += "-";
  }
  if (digits.length > 6) {
    formatted += digits.slice(6, 8);
  }
  if (digits.length >= 8) {
    formatted += "-";
  }
  if (digits.length > 8) {
    formatted += digits.slice(8, 10);
  }
  return formatted;
};

const KNOWN_CITIES = ['Астана', 'Алматы', 'Шымкент', 'Караганда'];

export const ProfilePage = () => {
  React.useEffect(() => {
    updateSEO({
      title: "Личный кабинет — AUTOLIDER",
      description: "Личный кабинет пользователя AUTOLIDER: личные данные, бонусы, история заказов и отслеживание доставки.",
    });
  }, []);

  const navigate = useNavigate();
  const {
    wishlist = [],
    products = [],
    toggleWishlist,
    addToCart,
    showToast,
    currentUser,
    setCurrentUser,
    logout
  } = useApp();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'orders' | 'history' | 'favorites'
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [expandedHistoryId, setExpandedHistoryId] = useState(null);

  // Personal Info Form State synced with currentUser
  const savedCity = currentUser?.city || 'Астана';
  const [formData, setFormData] = useState(() => ({
    fullName: currentUser?.name || currentUser?.fullName || '',
    phone: currentUser?.phone ? formatPhoneMask(currentUser.phone) : '',
    email: currentUser?.email || '',
    city: KNOWN_CITIES.includes(savedCity) ? savedCity : 'Другое'
  }));
  const [customCity, setCustomCity] = useState(
    KNOWN_CITIES.includes(savedCity) ? '' : savedCity
  );

  // Automatically pull updated user data when currentUser changes
  React.useEffect(() => {
    if (currentUser) {
      const sc = currentUser.city || 'Астана';
      setFormData({
        fullName: currentUser.name || currentUser.fullName || '',
        phone: currentUser.phone ? formatPhoneMask(currentUser.phone) : '',
        email: currentUser.email || '',
        city: KNOWN_CITIES.includes(sc) ? sc : 'Другое'
      });
      if (!KNOWN_CITIES.includes(sc)) setCustomCity(sc);

      // Sync bonus balance & details from backend /api/customers
      fetch('/api/customers')
        .then((res) => res.json())
        .then((customers) => {
          if (Array.isArray(customers)) {
            const matched = customers.find(
              (c) =>
                String(c.id) === String(currentUser.id) ||
                (c.email && currentUser.email && c.email.toLowerCase() === currentUser.email.toLowerCase())
            );
            if (matched && matched.bonusBalance !== currentUser.bonusBalance) {
              const updated = { ...currentUser, ...matched };
              if (setCurrentUser) setCurrentUser(updated);
              localStorage.setItem('autolider_user', JSON.stringify(updated));
            }
          }
        })
        .catch((err) => console.warn('Customer bonus sync error:', err));
    }
  }, [currentUser]);

  // Real Orders State loaded from Backend API
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  React.useEffect(() => {
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setOrders(data);
        }
      })
      .catch((err) => console.warn('Order fetch error:', err))
      .finally(() => setLoadingOrders(false));
  }, []);

  const activeOrdersList = orders.filter((o) => o.status !== 'delivered' && o.status !== 'completed');
  const historyOrdersList = orders.filter((o) => o.status === 'delivered' || o.status === 'completed');

  const getItemDetails = (rawItem, idx) => {
    const pObj = rawItem?.product || rawItem?.item || rawItem?.rawProduct || rawItem || {};
    const searchId = pObj.id || rawItem?.id || rawItem?.productId;
    const searchSku = pObj.sku || pObj.article || rawItem?.sku || rawItem?.article;
    const searchTitle = pObj.title || pObj.name || rawItem?.title || rawItem?.name;

    const matchedProd = products.find(
      (p) =>
        (searchId && String(p.id) === String(searchId)) ||
        (searchSku && p.sku && String(p.sku).toLowerCase() === String(searchSku).toLowerCase()) ||
        (searchTitle && p.title && String(p.title).toLowerCase() === String(searchTitle).toLowerCase())
    );

    const fallbackCatalogProd = (products || [])[idx % (products?.length || 1)];

    const title =
      pObj.title ||
      pObj.name ||
      rawItem?.title ||
      rawItem?.name ||
      matchedProd?.title ||
      fallbackCatalogProd?.title ||
      `Автозапчасть #${idx + 1}`;

    const article =
      pObj.article ||
      pObj.sku ||
      rawItem?.article ||
      rawItem?.sku ||
      matchedProd?.sku ||
      matchedProd?.article ||
      fallbackCatalogProd?.sku ||
      `ALT-0${idx + 1}`;

    let price = 0;
    if (typeof pObj.price === 'number' && pObj.price > 0) {
      price = pObj.price;
    } else if (typeof rawItem?.price === 'number' && rawItem?.price > 0) {
      price = rawItem.price;
    } else if (matchedProd?.price) {
      price = matchedProd.price;
    } else if (fallbackCatalogProd?.price) {
      price = fallbackCatalogProd.price;
    }

    const quantity = Number(rawItem?.quantity || rawItem?.qty || pObj.quantity || pObj.qty || 1) || 1;
    const image = pObj.image || pObj.img || rawItem?.image || rawItem?.img || matchedProd?.image || fallbackCatalogProd?.image || '';

    return {
      id: pObj.id || rawItem?.id || matchedProd?.id || idx,
      title,
      article,
      price,
      quantity,
      image,
      totalSum: price * quantity,
      rawProduct: matchedProd || fallbackCatalogProd || { id: pObj.id || idx, title, price, image, article, sku: article }
    };
  };

  // Saved Addresses State
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      title: 'Дом',
      address: 'Астана, ул. Кабанбай батыра, 43, кв. 112',
      isDefault: true
    },
    {
      id: 2,
      title: 'Работа',
      address: 'Астана, пр. Мангилик Ел, 55, офис 304',
      isDefault: false
    }
  ]);

  const [selectedAddressId, setSelectedAddressId] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const resetFormToCurrentUser = () => {
    setFormData({
      fullName: currentUser?.name || currentUser?.fullName || '',
      phone: currentUser?.phone ? formatPhoneMask(currentUser.phone) : '',
      email: currentUser?.email || '',
      city: currentUser?.city || 'Астана'
    });
  };

  const handleCancelEdit = () => {
    resetFormToCurrentUser();
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === 'phone') {
      newValue = formatPhoneMask(value);
    }
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    if (!formData.fullName.trim()) {
      if (showToast) showToast('Укажите Ваше ФИО', 'error');
      return;
    }

    const finalCity = formData.city === 'Другое' ? customCity.trim() : formData.city;
    if (formData.city === 'Другое' && !customCity.trim()) {
      if (showToast) showToast('Укажите название вашего города', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email || currentUser?.email,
          name: formData.fullName,
          phone: formData.phone,
          city: finalCity
        })
      });

      let updatedUserData;
      if (res.ok) {
        const data = await res.json();
        updatedUserData = data.user || {
          ...currentUser,
          name: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          city: finalCity
        };
      } else {
        updatedUserData = {
          ...currentUser,
          name: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          city: finalCity
        };
      }

      if (setCurrentUser) setCurrentUser(updatedUserData);
      localStorage.setItem('autolider_user', JSON.stringify(updatedUserData));
      if (showToast) showToast('Личные данные профиля обновлены', 'success');
      setIsEditing(false);
    } catch (err) {
      const fallbackUser = {
        ...currentUser,
        name: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        city: finalCity
      };
      if (setCurrentUser) setCurrentUser(fallbackUser);
      localStorage.setItem('autolider_user', JSON.stringify(fallbackUser));
      if (showToast) showToast('Личные данные профиля обновлены', 'success');
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAddress = (id, e) => {
    e.stopPropagation();
    setAddresses((prev) => prev.filter((item) => item.id !== id));
    showToast('Адрес удален');
  };

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState({
    title: '',
    city: 'Астана',
    address: ''
  });

  const handleSaveNewAddress = (e) => {
    e?.preventDefault();
    if (!newAddressForm.address.trim()) {
      showToast('Укажите адрес доставки');
      return;
    }
    const newId = Date.now();
    const fullAddress = `${newAddressForm.city}, ${newAddressForm.address.trim()}`;
    setAddresses((prev) => [
      ...prev,
      {
        id: newId,
        title: newAddressForm.title.trim() || `Адрес ${prev.length + 1}`,
        address: fullAddress,
        isDefault: false
      }
    ]);
    setSelectedAddressId(newId);
    setIsAddingAddress(false);
    setNewAddressForm({ title: '', city: 'Астана', address: '' });
    showToast('Новый адрес сохранен');
  };

  const uniquePool = Array.from(new Map(products.map((item) => [item.id, item])).values());
  const favoriteProducts = uniquePool.filter((p) => wishlist.includes(p.id));
  const favoriteCount = wishlist ? wishlist.length : 0;

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        'Вы действительно хотите удалить свой профиль? Все ваши данные и бонусный баланс будут безвозвратно удалены.'
      )
    ) {
      return;
    }

    try {
      const targetId = currentUser?.id || currentUser?.email || user?.id || user?.email;
      if (targetId) {
        await fetch(`/api/customers/${encodeURIComponent(targetId)}`, { method: 'DELETE' });
      }
      if (logout) {
        logout();
      } else {
        localStorage.removeItem('autolider_user');
        localStorage.removeItem('autolider_token');
      }
      if (showToast) showToast('Ваш профиль был успешно удален', 'info');
      navigate('/');
    } catch (err) {
      console.error('Failed to delete account:', err);
      if (showToast) showToast('Ошибка при удалении профиля', 'error');
    }
  };

  return (
    <section className="profile-page-section">
      <div className="profile-bg-clouds" />

      <div className="profile-container">
        <div className="profile-card-wrapper">
          <div className="profile-layout-grid">
            {/* Left Sidebar */}
            <aside className="profile-sidebar">
              <button
                className={`profile-tab-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <User size={18} />
                <span>Профиль</span>
              </button>

              <button
                className={`profile-tab-item ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <Truck size={18} />
                <span>Мои заказы</span>
              </button>

              <button
                className={`profile-tab-item ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                <Package size={18} />
                <span>История покупок</span>
              </button>

              <button
                className={`profile-tab-item ${activeTab === 'favorites' ? 'active' : ''}`}
                onClick={() => setActiveTab('favorites')}
              >
                <Heart size={18} />
                <span>Избранные</span>
              </button>

              <div className="sidebar-bottom-actions">
                <div className="sidebar-divider" />

                <button
                  className="sidebar-logout-btn"
                  onClick={() => {
                    if (logout) logout();
                    if (showToast) showToast('Вы вышли из системы', 'info');
                    navigate('/');
                  }}
                >
                  <span className="sidebar-btn-icon logout-icon">
                    <LogOut size={16} />
                  </span>
                  <span>Выйти из аккаунта</span>
                </button>

                <button
                  className="sidebar-delete-btn"
                  onClick={handleDeleteAccount}
                >
                  <span className="sidebar-btn-icon delete-icon">
                    <Trash2 size={14} />
                  </span>
                  <span>Удалить профиль</span>
                </button>
              </div>
            </aside>

            {/* Right Main Content */}
            <main className="profile-main-content">
              {activeTab === 'profile' && (
                <>
                  <h1 className="profile-page-title">
                    Профиль {currentUser?.name ? `(${currentUser.name})` : ''}
                  </h1>

                  {/* Stats Grid */}
                  <div className="profile-stats-grid">
                    <div className="stat-card dark">
                      <div className="stat-number">
                        {Number(currentUser?.bonusBalance ?? 0).toLocaleString('ru-RU')}
                      </div>
                      <div className="stat-subtext">Бонусов · 1 бонус = 1 ₸</div>
                    </div>

                    <div className="stat-card light">
                      <div className="stat-number">{favoriteCount}</div>
                      <div className="stat-subtext">Товаров в избранном</div>
                    </div>

                    <div className="stat-card light">
                      <div className="stat-number">{historyOrdersList.length}</div>
                      <div className="stat-subtext">
                        Покупок{activeOrdersList.length > 0 ? ` · ${activeOrdersList.length} в пути` : ''}
                      </div>
                    </div>
                  </div>

                  {/* Section 1: Личные данные */}
                  <form className="profile-section-block" onSubmit={handleSaveProfile}>
                    <div className="profile-section-header">
                      <div className="section-header-left" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="section-icon-badge">
                          <User size={16} />
                        </div>
                        <h2 className="section-title-text">Личные данные</h2>
                      </div>
                      {!isEditing && (
                        <button
                          type="button"
                          className="btn-cancel-outline"
                          onClick={() => setIsEditing(true)}
                          style={{ marginLeft: 'auto', padding: '6px 16px', fontSize: '13px' }}
                        >
                          Редактировать
                        </button>
                      )}
                    </div>

                    <div className="profile-fields-2col">
                      <div className="profile-form-group">
                        <label className="profile-form-label">
                          ФИО<span className="req">*</span>
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          className="profile-form-input"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          required
                        />
                      </div>

                      <div className="profile-form-group">
                        <label className="profile-form-label">
                          Номер телефона<span className="req">*</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          className="profile-form-input"
                          placeholder="+7 (777) 000-00-00"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              phone: formatPhoneMask(e.target.value)
                            }))
                          }
                          onFocus={(e) => {
                            if (!formData.phone) setFormData((prev) => ({ ...prev, phone: "+7 (" }));
                          }}
                          maxLength={18}
                          disabled={!isEditing}
                          required
                        />
                      </div>

                      <div className="profile-form-group">
                        <label className="profile-form-label">
                          Электронная почта<span className="req">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          className="profile-form-input"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          required
                        />
                      </div>

                      <div className="profile-form-group">
                        <label className="profile-form-label">
                          Город<span className="req">*</span>
                        </label>
                        <select
                          name="city"
                          className="profile-form-select"
                          value={formData.city}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        >
                          <option value="Астана">Астана</option>
                          <option value="Алматы">Алматы</option>
                          <option value="Шымкент">Шымкент</option>
                          <option value="Караганда">Караганда</option>
                          <option value="Другое">Другое</option>
                        </select>
                      </div>
                    </div>

                    {formData.city === 'Другое' && (
                      <div className="profile-form-group" style={{width:"100%"}}>
                        <label className="profile-form-label">
                          Ваш город<span className="req">*</span>
                        </label>
                        <input
                          type="text"
                          className="profile-form-input"
                          placeholder="Введите ваш город"
                          value={customCity}
                          onChange={(e) => setCustomCity(e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                    )}

                    {isEditing && (
                      <div className="profile-actions-right" style={{ marginTop: '20px' }}>
                        <button type="submit" className="btn-save-red" disabled={isSaving}>
                          {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
                        </button>
                        <button
                          type="button"
                          className="btn-cancel-outline"
                          onClick={handleCancelEdit}
                          disabled={isSaving}
                        >
                          Отмена
                        </button>
                      </div>
                    )}
                  </form>

                </>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <>
                  <h1 className="profile-page-title">Мои заказы</h1>
                  {activeOrdersList.length === 0 ? (
                    <div className="profile-section-block">
                      <div className="profile-empty-icon-wrapper">
                        <Package size={38} strokeWidth={1.5} />
                      </div>
                      <h3 className="profile-empty-title">У вас пока нет активных заказов</h3>
                      <p className="profile-empty-desc">
                        Оформленные товары и статусы их доставки появятся здесь в режиме реального времени.
                      </p>
                      <Link to="/catalog" className="btn-profile-go-catalog">
                        <span>Перейти в каталог</span>
                      </Link>
                    </div>
                  ) : (
                    <div className="orders-list-stack">
                      {activeOrdersList.map((order) => {
                        const isExpanded = expandedOrderId === order.id;
                        const rawItems = order.items && order.items.length > 0 ? order.items : [order];
                        const items = rawItems.map((it, idx) => getItemDetails(it, idx));
                        const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
                        const calculatedTotal = items.reduce((sum, item) => sum + item.totalSum, 0);
                        const displayPrice = order.totalPrice && order.totalPrice > 0 ? order.totalPrice : calculatedTotal;
                        const orderBonusSpent = typeof order.bonusSpent === 'number'
                          ? order.bonusSpent
                          : Number(order.usedBonuses || order.bonus || 0);

                        const orderBonusEarned = typeof order.bonusEarned === 'number'
                          ? order.bonusEarned
                          : 0;

                        return (
                          <div
                            key={order.id}
                            className={`order-history-card ${isExpanded ? 'expanded' : ''}`}
                          >
                            <div
                              className="order-card-header clickable"
                              onClick={() =>
                                setExpandedOrderId(isExpanded ? null : order.id)
                              }
                            >
                              <div className="order-header-left">
                                <span className="order-num-title">Заказ № {order.id}</span>
                                <span className="order-date-sub">от {order.date || 'Сегодня'}</span>
                              </div>

                              <div className="order-header-right">
                                <span className={`order-status-tag ${order.status || 'processing'}`}>
                                  {order.statusText || 'В обработке'}
                                </span>
                                <span className="order-toggle-arrow">
                                  {isExpanded ? (
                                    <ChevronUp size={20} />
                                  ) : (
                                    <ChevronDown size={20} />
                                  )}
                                </span>
                              </div>
                            </div>

                            <div className="order-card-body">
                              <span>
                                {totalItemsCount} товара · {order.deliveryType || 'Доставка'}
                              </span>
                              <div className="order-price-summary-block" style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <span className="order-total-price">
                                  {displayPrice.toLocaleString('ru-RU')} ₸
                                </span>
                                {orderBonusSpent > 0 && (
                                  <span className="order-bonus-paid-badge" style={{ fontSize: '13px', color: '#ea2427', fontWeight: '700', marginTop: '3px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(234, 36, 39, 0.08)', padding: '2px 8px', borderRadius: '6px' }}>
                                    <span>оплачено бонусами:</span>
                                    <span style={{ fontWeight: '800' }}>-{orderBonusSpent.toLocaleString('ru-RU')} B</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="order-details-drawer">
                                <h4 className="order-drawer-title">Товары в заказе</h4>
                                <div className="order-items-list">
                                  {items.map((item, idx) => (
                                    <div key={item.id || idx} className="order-item-row">
                                      <div className="order-item-thumb">
                                        {item.image ? (
                                          <img src={item.image} alt={item.title} />
                                        ) : (
                                          <ImageIcon size={22} strokeWidth={1.5} />
                                        )}
                                      </div>
                                      <div className="order-item-info">
                                        <span className="order-item-title">{item.title}</span>
                                        <span className="order-item-art">
                                          Артикул: {item.article}
                                        </span>
                                      </div>
                                      <div className="order-item-qty-price">
                                        <span className="order-item-qty">
                                          {item.quantity} шт. × {item.price.toLocaleString('ru-RU')} ₸
                                        </span>
                                        <span className="order-item-sum">
                                          {item.totalSum.toLocaleString('ru-RU')} ₸
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <div className="order-drawer-meta-grid">
                                  <div className="order-meta-box">
                                    <MapPin size={16} />
                                    <div>
                                      <span className="meta-label">Адрес доставки:</span>
                                      <span className="meta-value">{order.address || 'Астана'}</span>
                                    </div>
                                  </div>
                                  <div className="order-meta-box">
                                    <CreditCard size={16} />
                                    <div>
                                      <span className="meta-label">Способ оплаты:</span>
                                      <span className="meta-value">{order.paymentMethod || 'Картой'}</span>
                                    </div>
                                  </div>
                                  {orderBonusSpent > 0 && (
                                    <div className="order-meta-box" style={{ background: 'rgba(234, 36, 39, 0.05)', borderColor: 'rgba(234, 36, 39, 0.2)' }}>
                                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#ea2427', color: '#fff', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>B</div>
                                      <div>
                                        <span className="meta-label" style={{ color: '#ea2427' }}>Оплата бонусами:</span>
                                        <span className="meta-value" style={{ color: '#ea2427', fontWeight: '700' }}>-{orderBonusSpent.toLocaleString('ru-RU')} B</span>
                                      </div>
                                    </div>
                                  )}
                                  {orderBonusEarned > 0 && (
                                    <div className="order-meta-box" style={{ background: 'rgba(22, 163, 74, 0.05)', borderColor: 'rgba(22, 163, 74, 0.2)' }}>
                                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#16a34a', color: '#fff', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>B</div>
                                      <div>
                                        <span className="meta-label" style={{ color: '#16a34a' }}>Начислено бонусов:</span>
                                        <span className="meta-value" style={{ color: '#16a34a', fontWeight: '700' }}>+{orderBonusEarned.toLocaleString('ru-RU')} B</span>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="order-drawer-actions">
                                  <button
                                    type="button"
                                    className="btn-repeat-order"
                                    onClick={() => {
                                      items.forEach((it) => addToCart && addToCart(it.rawProduct, it.quantity));
                                      showToast('Товары из заказа добавлены в корзину');
                                      navigate('/cart');
                                    }}
                                  >
                                    <RotateCcw size={15} />
                                    <span>Повторить заказ</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <>
                  <h1 className="profile-page-title">История покупок</h1>
                  {historyOrdersList.length === 0 ? (
                    <div className="profile-section-block">
                      <div className="profile-empty-icon-wrapper">
                        <RotateCcw size={38} strokeWidth={1.5} />
                      </div>
                      <h3 className="profile-empty-title">История покупок пуста</h3>
                      <p className="profile-empty-desc">
                        Завершенные и доставленные заказы будут автоматически сохраняться в этом разделе.
                      </p>
                      <Link to="/catalog" className="btn-profile-go-catalog">
                        <span>Перейти в каталог</span>
                      </Link>
                    </div>
                  ) : (
                    <div className="orders-list-stack">
                      {historyOrdersList.map((item) => {
                        const isExpanded = expandedHistoryId === item.id;
                        const rawItems = item.items && item.items.length > 0 ? item.items : [item];
                        const items = rawItems.map((it, idx) => getItemDetails(it, idx));
                        const totalItemsCount = items.reduce((sum, p) => sum + p.quantity, 0);
                        const calculatedTotal = items.reduce((sum, p) => sum + p.totalSum, 0);
                        const displayPrice = item.totalPrice && item.totalPrice > 0 ? item.totalPrice : calculatedTotal;
                        let orderBonusSpent = Number(item.bonusSpent || item.usedBonuses || item.bonus || 0);
                        if (!orderBonusSpent && calculatedTotal > 0 && item.totalPrice > 0 && calculatedTotal > item.totalPrice) {
                          orderBonusSpent = calculatedTotal - item.totalPrice;
                        }

                        return (
                          <div
                            key={item.id}
                            className={`order-history-card ${isExpanded ? 'expanded' : ''}`}
                          >
                            <div
                              className="order-card-header clickable"
                              onClick={() =>
                                setExpandedHistoryId(isExpanded ? null : item.id)
                              }
                            >
                              <div className="order-header-left">
                                <span className="order-num-title">Покупка № {item.id}</span>
                                <span className="order-date-sub">от {item.date || 'Сегодня'}</span>
                              </div>

                              <div className="order-header-right">
                                <span className="order-status-tag delivered">
                                  {item.statusText || 'Выполнен'}
                                </span>
                                <span className="order-toggle-arrow">
                                  {isExpanded ? (
                                    <ChevronUp size={20} />
                                  ) : (
                                    <ChevronDown size={20} />
                                  )}
                                </span>
                              </div>
                            </div>

                            <div className="order-card-body">
                              <span>
                                {totalItemsCount} шт · {item.deliveryType || 'Самовывоз'}
                              </span>
                              <div className="order-price-summary-block" style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <span className="order-total-price">
                                  {displayPrice.toLocaleString('ru-RU')} ₸
                                </span>
                                {orderBonusSpent > 0 && (
                                  <span className="order-bonus-paid-badge" style={{ fontSize: '13px', color: '#ea2427', fontWeight: '700', marginTop: '3px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(234, 36, 39, 0.08)', padding: '2px 8px', borderRadius: '6px' }}>
                                    <span>оплачено бонусами:</span>
                                    <span style={{ fontWeight: '800' }}>-{orderBonusSpent.toLocaleString('ru-RU')} B</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="order-details-drawer">
                                <h4 className="order-drawer-title">Купленные товары</h4>
                                <div className="order-items-list">
                                  {items.map((prod, pIdx) => (
                                    <div key={prod.id || pIdx} className="order-item-row">
                                      <div className="order-item-thumb">
                                        {prod.image ? (
                                          <img src={prod.image} alt={prod.title} />
                                        ) : (
                                          <ImageIcon size={22} strokeWidth={1.5} />
                                        )}
                                      </div>
                                      <div className="order-item-info">
                                        <span className="order-item-title">{prod.title}</span>
                                        <span className="order-item-art">
                                          Артикул: {prod.article}
                                        </span>
                                      </div>
                                      <div className="order-item-qty-price">
                                        <span className="order-item-qty">
                                          {prod.quantity} шт. × {prod.price.toLocaleString('ru-RU')} ₸
                                        </span>
                                        <span className="order-item-sum">
                                          {prod.totalSum.toLocaleString('ru-RU')} ₸
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <div className="order-drawer-meta-grid">
                                  <div className="order-meta-box">
                                    <MapPin size={16} />
                                    <div>
                                      <span className="meta-label">Получение:</span>
                                      <span className="meta-value">{item.deliveryType || 'Доставка'}</span>
                                    </div>
                                  </div>
                                  <div className="order-meta-box">
                                    <CreditCard size={16} />
                                    <div>
                                      <span className="meta-label">Оплата:</span>
                                      <span className="meta-value">{item.paymentMethod || 'Картой'}</span>
                                    </div>
                                  </div>
                                  {orderBonusSpent > 0 && (
                                    <div className="order-meta-box" style={{ background: 'rgba(234, 36, 39, 0.05)', borderColor: 'rgba(234, 36, 39, 0.2)' }}>
                                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#ea2427', color: '#fff', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>B</div>
                                      <div>
                                        <span className="meta-label" style={{ color: '#ea2427' }}>Оплата бонусами:</span>
                                        <span className="meta-value" style={{ color: '#ea2427', fontWeight: '700' }}>-{orderBonusSpent.toLocaleString('ru-RU')} B</span>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="order-drawer-actions">
                                  <button
                                    type="button"
                                    className="btn-repeat-order"
                                    onClick={() => {
                                      items.forEach((p) => addToCart && addToCart(p.rawProduct, p.quantity));
                                      showToast('Товар добавлен в корзину');
                                      navigate('/cart');
                                    }}
                                  >
                                    <RotateCcw size={15} />
                                    <span>Повторить покупку</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {/* Favorites Tab */}
              {activeTab === 'favorites' && (
                <>
                  <div className="profile-favorites-header">
                    <h1 className="profile-page-title">Избранные товары</h1>
                    <span className="profile-items-badge">
                      {favoriteProducts.length} товаров
                    </span>
                  </div>

                  {favoriteProducts.length === 0 ? (
                    <div className="profile-empty-fav">
                      <Heart size={48} strokeWidth={1} />
                      <h3>В избранном пока нет товаров</h3>
                      <p>Добавляйте товары в избранное, чтобы не потерять их</p>
                      <button
                        className="btn-save-red"
                        onClick={() => navigate('/catalog')}
                      >
                        Перейти в каталог
                      </button>
                    </div>
                  ) : (
                    <div className="profile-fav-grid">
                      {favoriteProducts.map((p) => {
                        const displayPrice =
                          typeof p.price === 'number'
                            ? `${p.price.toLocaleString('ru-RU')} ₸`
                            : p.price;
                        const displayOldPrice = p.oldPrice
                          ? typeof p.oldPrice === 'number'
                            ? `${p.oldPrice.toLocaleString('ru-RU')} ₸`
                            : p.oldPrice
                          : null;
                        const displayImg =
                          p.image || p.img || '/assets/img/test_accessosry.png';

                        return (
                          <div key={p.id} className="fav-item-card">
                            <div className="fav-card-img-box">
                              <img src={displayImg} alt={p.title} />
                              <button
                                type="button"
                                className="btn-fav-remove"
                                onClick={() => {
                                  toggleWishlist(p.id);
                                  showToast('Удалено из избранного');
                                }}
                                title="Удалить из избранного"
                              >
                                <Heart size={16} fill="#ea2427" color="#ea2427" />
                              </button>
                            </div>

                            <div className="fav-card-info">
                              <h4 className="fav-card-title">{p.title}</h4>
                              <div className="fav-card-prices">
                                <span className="fav-card-price">{displayPrice}</span>
                                {displayOldPrice && (
                                  <span className="fav-card-old-price">
                                    {displayOldPrice}
                                  </span>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              className="btn-add-to-cart-fav"
                              onClick={() => {
                                addToCart(p);
                                showToast('Товар добавлен в корзину');
                              }}
                            >
                              <ShoppingCart size={15} />
                              <span>В корзину</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </div>
    </section>
  );
};
