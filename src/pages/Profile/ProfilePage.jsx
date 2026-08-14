import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ShoppingCart
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CATALOG_PRODUCTS_MOCK } from '../../data/mockData';
import './ProfilePage.css';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { wishlist = [], products = [], toggleWishlist, addToCart, showToast } = useApp();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'orders' | 'history' | 'favorites'
  const [expandedOrderId, setExpandedOrderId] = useState('582914'); // Default first expanded
  const [expandedHistoryId, setExpandedHistoryId] = useState('HIS-101');

  const mockPurchaseHistory = [
    {
      id: 'HIS-101',
      date: '10 марта 2026',
      status: 'delivered',
      statusText: 'Выполнен',
      deliveryType: 'Самовывоз (Автозаводская, 12)',
      paymentMethod: 'Картой онлайн',
      totalPrice: 192000,
      items: [
        {
          id: 201,
          title: 'Шина Michelin Pilot Sport 5 (225/45 R17)',
          article: 'MICH-8842',
          price: 48000,
          quantity: 4,
          image: null
        }
      ]
    },
    {
      id: 'HIS-98',
      date: '18 февраля 2026',
      status: 'delivered',
      statusText: 'Выполнен',
      deliveryType: 'Доставка курьером (Астана)',
      paymentMethod: 'Kaspi QR',
      totalPrice: 85000,
      items: [
        {
          id: 202,
          title: 'Аккумулятор VARTA Blue Dynamic 60Ah',
          article: 'VARTA-BD60',
          price: 42500,
          quantity: 2,
          image: null
        }
      ]
    }
  ];

  const mockOrders = [
    {
      id: '582914',
      date: '14 мая 2026',
      status: 'shipping',
      statusText: 'В пути',
      deliveryType: 'Доставка курьером (Астана)',
      address: 'Астана, ул. Кабанбай батыра, 43, кв. 112',
      paymentMethod: 'Картой онлайн',
      totalPrice: 144000,
      items: [
        {
          id: 101,
          title: 'Шина Michelin Pilot Sport 5 (225/45 R17)',
          article: 'MICH-8842',
          price: 72000,
          quantity: 2,
          image: null
        }
      ]
    },
    {
      id: '491028',
      date: '28 апреля 2026',
      status: 'delivered',
      statusText: 'Доставлен',
      deliveryType: 'Самовывоз (Автозаводская, 12)',
      address: 'г. Астана, ул. Автозаводская, 12',
      paymentMethod: 'Kaspi QR',
      totalPrice: 320000,
      items: [
        {
          id: 102,
          title: 'Моторное масло Motul 8100 X-cess 5W-40 (5L)',
          article: 'MOTUL-5W40-5L',
          price: 35000,
          quantity: 4,
          image: null
        },
        {
          id: 103,
          title: 'Комплект тормозных колодок Brembo Front',
          article: 'BRM-P85020',
          price: 45000,
          quantity: 4,
          image: null
        }
      ]
    }
  ];

  // Personal Info Form State
  const [formData, setFormData] = useState({
    fullName: 'Андрей Тишков',
    phone: '+7 (705) 234-23-45',
    email: 'info@gmail.com',
    city: 'Астана'
  });

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

  // Phone Mask
  const formatPhone = (val) => {
    if (!val) return '';
    const digits = val.replace(/\D/g, '');
    let number = digits;
    if (number.startsWith('7') || number.startsWith('8')) {
      number = number.slice(1);
    }
    number = number.slice(0, 10);
    let result = '+7 ';
    if (number.length > 0) result += '(' + number.slice(0, 3);
    if (number.length >= 3) result += ') ' + number.slice(3, 6);
    if (number.length >= 6) result += '-' + number.slice(6, 8);
    if (number.length >= 8) result += '-' + number.slice(8, 10);
    return result;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === 'phone') {
      newValue = formatPhone(value);
    }
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSaveProfile = (e) => {
    e?.preventDefault();
    showToast('Личные данные успешно обновлены');
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

  const pool = [...products, ...CATALOG_PRODUCTS_MOCK];
  const uniquePool = Array.from(new Map(pool.map((item) => [item.id, item])).values());
  let favoriteProducts = uniquePool.filter((p) => wishlist.includes(p.id));

  // Fallback demo favorites if wishlist array is empty
  if (favoriteProducts.length === 0) {
    favoriteProducts = CATALOG_PRODUCTS_MOCK.slice(0, 4);
  }

  const favoriteCount = wishlist && wishlist.length > 0 ? wishlist.length : favoriteProducts.length;

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
            </aside>

            {/* Right Main Content */}
            <main className="profile-main-content">
              {activeTab === 'profile' && (
                <>
                  <h1 className="profile-page-title">Профиль</h1>

                  {/* Stats Grid */}
                  <div className="profile-stats-grid">
                    <div className="stat-card dark">
                      <div className="stat-number">12 479</div>
                      <div className="stat-subtext">Бонусов · 1 бонус = 1 ₸</div>
                    </div>

                    <div className="stat-card light">
                      <div className="stat-number">{favoriteCount}</div>
                      <div className="stat-subtext">Товаров в избранном</div>
                    </div>

                    <div className="stat-card light">
                      <div className="stat-number">34</div>
                      <div className="stat-subtext">Покупок · 2 в пути</div>
                    </div>
                  </div>

                  {/* Section 1: Личные данные */}
                  <form className="profile-section-block" onSubmit={handleSaveProfile}>
                    <div className="profile-section-header">
                      <div className="section-icon-badge">
                        <User size={16} />
                      </div>
                      <h2 className="section-title-text">Личные данные</h2>
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
                          value={formData.phone}
                          onChange={handleInputChange}
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
                        >
                          <option value="Астана">Астана</option>
                          <option value="Алматы">Алматы</option>
                          <option value="Шымкент">Шымкент</option>
                          <option value="Караганда">Караганда</option>
                        </select>
                      </div>
                    </div>

                    <div className="profile-actions-right">
                      <button type="submit" className="btn-save-red">
                        Сохранить изменения
                      </button>
                      <button
                        type="button"
                        className="btn-cancel-outline"
                        onClick={() =>
                          setFormData({
                            fullName: 'Андрей Тишков',
                            phone: '+7 (705) 234-23-45',
                            email: 'info@gmail.com',
                            city: 'Астана'
                          })
                        }
                      >
                        Отмена
                      </button>
                    </div>
                  </form>

                  {/* Section 2: Адрес доставки */}
                  <div className="profile-section-block">
                    <div className="profile-section-header">
                      <div className="section-icon-badge">
                        <MapPin size={16} />
                      </div>
                      <h2 className="section-title-text">Адрес доставки</h2>
                    </div>

                    <div className="addresses-cards-grid">
                      {addresses.map((item) => (
                        <div
                          key={item.id}
                          className={`address-card-item ${selectedAddressId === item.id ? 'selected' : ''}`}
                          onClick={() => setSelectedAddressId(item.id)}
                        >
                          <div className="address-card-top">
                            <div className="address-card-title-row">
                              <span className="address-radio-circle" />
                              <span>{item.title}</span>
                            </div>
                            <button
                              type="button"
                              className="btn-delete-address"
                              onClick={(e) => handleDeleteAddress(item.id, e)}
                              title="Удалить адрес"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <span className="address-text-sub">{item.address}</span>
                        </div>
                      ))}
                    </div>

                    {isAddingAddress ? (
                      <form className="add-address-form-box" onSubmit={handleSaveNewAddress}>
                        <h3 className="add-address-title">Новый адрес доставки</h3>
                        
                        <div className="profile-fields-2col">
                          <div className="profile-form-group">
                            <label className="profile-form-label">
                              Название адреса<span className="req">*</span>
                            </label>
                            <input
                              type="text"
                              className="profile-form-input"
                              placeholder="Дом, Работа, Дача..."
                              value={newAddressForm.title}
                              onChange={(e) =>
                                setNewAddressForm((prev) => ({ ...prev, title: e.target.value }))
                              }
                              required
                            />
                          </div>

                          <div className="profile-form-group">
                            <label className="profile-form-label">
                              Город<span className="req">*</span>
                            </label>
                            <select
                              className="profile-form-select"
                              value={newAddressForm.city}
                              onChange={(e) =>
                                setNewAddressForm((prev) => ({ ...prev, city: e.target.value }))
                              }
                            >
                              <option value="Астана">Астана</option>
                              <option value="Алматы">Алматы</option>
                              <option value="Шымкент">Шымкент</option>
                              <option value="Караганда">Караганда</option>
                            </select>
                          </div>
                        </div>

                        <div className="profile-form-group">
                          <label className="profile-form-label">
                            Адрес, этаж, кв.<span className="req">*</span>
                          </label>
                          <input
                            type="text"
                            className="profile-form-input"
                            placeholder="Улица, дом, квартира"
                            value={newAddressForm.address}
                            onChange={(e) =>
                              setNewAddressForm((prev) => ({ ...prev, address: e.target.value }))
                            }
                            required
                          />
                        </div>

                        <div className="profile-actions-right">
                          <button type="submit" className="btn-save-red">
                            Сохранить адрес
                          </button>
                          <button
                            type="button"
                            className="btn-cancel-outline"
                            onClick={() => setIsAddingAddress(false)}
                          >
                            Отмена
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="profile-actions-right">
                        <button
                          type="button"
                          className="btn-save-red"
                          onClick={() => setIsAddingAddress(true)}
                        >
                          Добавить адрес
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <>
                  <h1 className="profile-page-title">Мои заказы</h1>
                  <div className="orders-list-stack">
                    {mockOrders.map((order) => {
                      const isExpanded = expandedOrderId === order.id;
                      const totalItemsCount = order.items.reduce(
                        (sum, item) => sum + item.quantity,
                        0
                      );

                      return (
                        <div
                          key={order.id}
                          className={`order-history-card ${isExpanded ? 'expanded' : ''}`}
                        >
                          {/* Header row (Clickable) */}
                          <div
                            className="order-card-header clickable"
                            onClick={() =>
                              setExpandedOrderId(isExpanded ? null : order.id)
                            }
                          >
                            <div className="order-header-left">
                              <span className="order-num-title">Заказ № {order.id}</span>
                              <span className="order-date-sub">от {order.date}</span>
                            </div>

                            <div className="order-header-right">
                              <span className={`order-status-tag ${order.status}`}>
                                {order.statusText}
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

                          {/* Summary row */}
                          <div className="order-card-body">
                            <span>
                              {totalItemsCount} товара · {order.deliveryType}
                            </span>
                            <span className="order-total-price">
                              {order.totalPrice.toLocaleString('ru-RU')} ₸
                            </span>
                          </div>

                          {/* Expanded Details Drawer */}
                          {isExpanded && (
                            <div className="order-details-drawer">
                              <h4 className="order-drawer-title">Товары в заказе</h4>
                              <div className="order-items-list">
                                {order.items.map((item) => (
                                  <div key={item.id} className="order-item-row">
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
                                        {(item.quantity * item.price).toLocaleString('ru-RU')} ₸
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
                                    <span className="meta-value">{order.address}</span>
                                  </div>
                                </div>
                                <div className="order-meta-box">
                                  <CreditCard size={16} />
                                  <div>
                                    <span className="meta-label">Способ оплаты:</span>
                                    <span className="meta-value">{order.paymentMethod}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="order-drawer-actions">
                                <button
                                  type="button"
                                  className="btn-repeat-order"
                                  onClick={() => {
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
                </>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <>
                  <h1 className="profile-page-title">История покупок</h1>
                  <div className="orders-list-stack">
                    {mockPurchaseHistory.map((item) => {
                      const isExpanded = expandedHistoryId === item.id;
                      const totalItemsCount = item.items.reduce(
                        (sum, p) => sum + p.quantity,
                        0
                      );

                      return (
                        <div
                          key={item.id}
                          className={`order-history-card ${isExpanded ? 'expanded' : ''}`}
                        >
                          {/* Header row (Clickable) */}
                          <div
                            className="order-card-header clickable"
                            onClick={() =>
                              setExpandedHistoryId(isExpanded ? null : item.id)
                            }
                          >
                            <div className="order-header-left">
                              <span className="order-num-title">Покупка № {item.id}</span>
                              <span className="order-date-sub">от {item.date}</span>
                            </div>

                            <div className="order-header-right">
                              <span className="order-status-tag delivered">
                                {item.statusText}
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

                          {/* Summary row */}
                          <div className="order-card-body">
                            <span>
                              {totalItemsCount} шт · {item.deliveryType}
                            </span>
                            <span className="order-total-price">
                              {item.totalPrice.toLocaleString('ru-RU')} ₸
                            </span>
                          </div>

                          {/* Expanded Details Drawer */}
                          {isExpanded && (
                            <div className="order-details-drawer">
                              <h4 className="order-drawer-title">Купленные товары</h4>
                              <div className="order-items-list">
                                {item.items.map((prod) => (
                                  <div key={prod.id} className="order-item-row">
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
                                        {(prod.quantity * prod.price).toLocaleString('ru-RU')} ₸
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
                                    <span className="meta-value">{item.deliveryType}</span>
                                  </div>
                                </div>
                                <div className="order-meta-box">
                                  <CreditCard size={16} />
                                  <div>
                                    <span className="meta-label">Оплата:</span>
                                    <span className="meta-value">{item.paymentMethod}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="order-drawer-actions">
                                <button
                                  type="button"
                                  className="btn-repeat-order"
                                  onClick={() => {
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
