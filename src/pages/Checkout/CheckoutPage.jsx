import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Image as ImageIcon, Check, ArrowRight, ShoppingBag, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import './CheckoutPage.css';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, cartCount, cartTotal, showToast, clearCart } = useApp();

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [orderNum] = useState(() => Math.floor(100000 + Math.random() * 900000));

  // Form State
  const [deliveryMethod, setDeliveryMethod] = useState('courier'); // 'courier' | 'pickup'
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'kaspi' | 'cash'
  const [useBonuses, setUseBonuses] = useState(true);
  const [saveAddress, setSaveAddress] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    comment: '',
    city: 'Астана',
    address: '',
    cardNumber: '',
    cardHolder: '',
    cardExpiry: '',
    cardCvv: ''
  });

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

  const formatCardNumber = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };

  const formatCardExpiry = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    return digits;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === 'phone') {
      newValue = formatPhone(value);
    } else if (name === 'cardNumber') {
      newValue = formatCardNumber(value);
    } else if (name === 'cardExpiry') {
      newValue = formatCardExpiry(value);
    }
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const itemCount = cartCount || 6;
  const rawSubtotal = cartTotal || 1320000;
  const discountAmount = rawSubtotal > 0 ? 5000 : 0;
  const bonusEarned = 3456;
  const bonusSpent = useBonuses ? 5000 : 0;
  const finalTotal = Math.max(0, rawSubtotal - discountAmount - bonusSpent);

  const handleOrderSubmit = async (e) => {
    e?.preventDefault();
    
    const paymentMethodLabel =
      paymentMethod === 'card'
        ? 'Freedom Pay (Банковская карта)'
        : paymentMethod === 'kaspi'
        ? 'Kaspi QR'
        : 'Наличными при получении';

    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.fullName || 'Покупатель Autolider',
          customerPhone: formData.phone || '+7 (777) 000-00-00',
          address: `${formData.city}, ${formData.address || 'Самовывоз'}`,
          totalPrice: finalTotal,
          paymentMethod: paymentMethodLabel,
          items: cart.length > 0 ? cart : [{ title: 'Автозапчасти Autolider', price: finalTotal, quantity: 1 }]
        })
      });
    } catch (err) {
      console.error('Order backend creation notice:', err);
    }

    setIsSubmitted(true);
    showToast(`Заказ № ${orderNum} успешно создан!`);
    clearCart();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const dummyThumbs = [0, 1, 2, 3, 4, 5];

  return (
    <section className="checkout-page-section">
      <div className="checkout-bg-clouds" />

      <div className="checkout-container">
        <div className="checkout-card-wrapper">
          {isSubmitted ? (
            /* Order Success View */
            <div className="order-success-box">
              <div className="success-icon-circle">
                <Check size={36} strokeWidth={2.5} />
              </div>

              <h1 className="success-title">
                Заказ <span className="success-order-num">№{orderNum}</span> принят!
              </h1>

              <p className="success-subtitle">
                Спасибо за покупку! Наш менеджер уже обрабатывает ваш заказ и свяжется с вами в ближайшее время для уточнения деталей.
              </p>

              <div className="success-info-cards">
                <div className="success-card">
                  <span className="success-card-label">Доставка</span>
                  <span className="success-card-val">
                    {deliveryMethod === 'courier' ? 'Курьером (Астана)' : 'Самовывоз (Автозаводская, 12)'}
                  </span>
                </div>

                <div className="success-card">
                  <span className="success-card-label">Оплата</span>
                  <span className="success-card-val">
                    {paymentMethod === 'card' ? 'Картой онлайн' : paymentMethod === 'kaspi' ? 'Kaspi QR' : 'При получении'}
                  </span>
                </div>

                <div className="success-card">
                  <span className="success-card-label">Сумма заказа</span>
                  <span className="success-card-val">{finalTotal.toLocaleString('ru-RU')} ₸</span>
                </div>
              </div>

              <div className="success-actions-row">
                <Link to="/catalog" className="btn-to-catalog-lg">
                  <ShoppingBag size={18} />
                  <span>Продолжить покупки</span>
                </Link>

                <Link to="/profile" className="btn-to-profile-lg">
                  <User size={18} />
                  <span>Личный кабинет</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Main Form View */
            <>
              {/* Header */}
              <div className="checkout-header-row">
                <h1 className="checkout-title">Оформление заказа</h1>
                <span className="checkout-items-count">{itemCount} товаров</span>
              </div>

              {/* Product Previews Row */}
              <div className="checkout-previews-row">
                {cart && cart.length > 0
                  ? cart.map(({ product }) => (
                      <div key={product.id} className="checkout-thumb-box">
                        {product.image ? (
                          <img src={product.image} alt={product.title} />
                        ) : (
                          <ImageIcon size={32} strokeWidth={1.5} />
                        )}
                      </div>
                    ))
                  : dummyThumbs.map((idx) => (
                      <div key={idx} className="checkout-thumb-box">
                        <ImageIcon size={32} strokeWidth={1.5} />
                      </div>
                    ))}
              </div>

        {/* Form & Summary Grid */}
        <div className="checkout-grid">
          {/* Left Column: Form Steps */}
          <form className="checkout-form-column" onSubmit={handleOrderSubmit}>
            {/* Step 1: Получатель */}
            <div className="checkout-step-block">
              <div className="step-title-row">
                <span className="step-num-badge">1</span>
                <h2 className="step-title-text">Получатель</h2>
              </div>

              <div className="fields-grid-2col">
                <div className="form-group">
                  <label className="form-label">
                    ФИО<span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    className="form-input"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Номер телефона<span className="req">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    placeholder="+7 (___) ___-__-__"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Электронная почта<span className="req">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Коментарий к заказу<span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    name="comment"
                    className="form-input"
                    value={formData.comment}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Адрес доставки */}
            <div className="checkout-step-block">
              <div className="step-title-row">
                <span className="step-num-badge">2</span>
                <h2 className="step-title-text">Адрес доставки</h2>
              </div>

              {/* Delivery Option Cards */}
              <div className="options-cards-grid">
                <div
                  className={`option-select-card ${deliveryMethod === 'courier' ? 'selected' : ''}`}
                  onClick={() => setDeliveryMethod('courier')}
                >
                  <div className="option-card-top">
                    <div className="option-radio-title">
                      <span className="radio-circle-custom" />
                      <span>Доставка курьером</span>
                    </div>
                    <span className="option-card-price">0₸</span>
                  </div>
                  <span className="option-card-subtext">Астана, 27- 25 мая</span>
                </div>

                <div
                  className={`option-select-card ${deliveryMethod === 'pickup' ? 'selected' : ''}`}
                  onClick={() => setDeliveryMethod('pickup')}
                >
                  <div className="option-card-top">
                    <div className="option-radio-title">
                      <span className="radio-circle-custom" />
                      <span>Самовывоз</span>
                    </div>
                    <span className="option-card-price">Бесплатно</span>
                  </div>
                  <span className="option-card-subtext">Автозаводская, 12 · сегодня с 14:00</span>
                </div>
              </div>

              {/* Address Inputs */}
              <div className="fields-grid-2col">
                <div className="form-group">
                  <label className="form-label">
                    Город<span className="req">*</span>
                  </label>
                  <select
                    name="city"
                    className="form-select"
                    value={formData.city}
                    onChange={handleInputChange}
                  >
                    <option value="Астана">Астана</option>
                    <option value="Алматы">Алматы</option>
                    <option value="Шымкент">Шымкент</option>
                    <option value="Караганда">Караганда</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Адрес, этаж, кв.<span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    className="form-input"
                    value={formData.address}
                    onChange={handleInputChange}
                    required={deliveryMethod === 'courier'}
                  />
                </div>
              </div>

              <label className="checkbox-save-address">
                <input
                  type="checkbox"
                  checked={saveAddress}
                  onChange={(e) => setSaveAddress(e.target.checked)}
                />
                <span>Сохранить адрес доставки</span>
              </label>
            </div>

            {/* Step 3: Способ оплаты */}
            <div className="checkout-step-block">
              <div className="step-title-row">
                <span className="step-num-badge">3</span>
                <h2 className="step-title-text">Способ оплаты</h2>
              </div>

              {/* Payment Option Cards */}
              <div className="options-cards-grid three-col">
                <div
                  className={`option-select-card ${paymentMethod === 'card' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <div className="option-radio-title">
                    <span className="radio-circle-custom" />
                    <span>Картой онлайн</span>
                  </div>
                  <span className="option-card-subtext">Visa · Mastercard</span>
                </div>

                <div
                  className={`option-select-card ${paymentMethod === 'kaspi' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('kaspi')}
                >
                  <div className="option-radio-title">
                    <span className="radio-circle-custom" />
                    <span>Kaspi QR</span>
                  </div>
                  <span className="option-card-subtext">Отсканировать QR</span>
                </div>

                <div
                  className={`option-select-card ${paymentMethod === 'cash' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('cash')}
                >
                  <div className="option-radio-title">
                    <span className="radio-circle-custom" />
                    <span>При получении</span>
                  </div>
                  <span className="option-card-subtext">Наличными или картой</span>
                </div>
              </div>

              {/* Card Inputs if 'card' is selected */}
              {paymentMethod === 'card' && (
                <div className="fields-grid-2col">
                  <div className="form-group">
                    <label className="form-label">
                      Номер карты<span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      className="form-input"
                      placeholder="0000 0000 0000 0000"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Имя держателя карты<span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      name="cardHolder"
                      className="form-input"
                      placeholder="HOLDER NAME"
                      value={formData.cardHolder}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Срок действия<span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      name="cardExpiry"
                      className="form-input"
                      placeholder="MM/YY"
                      value={formData.cardExpiry}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      CVV<span className="req">*</span>
                    </label>
                    <input
                      type="password"
                      name="cardCvv"
                      className="form-input"
                      maxLength={4}
                      placeholder="•••"
                      value={formData.cardCvv}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              )}
            </div>
          </form>

          {/* Right Column: Summary Block */}
          <div className="checkout-summary-card">
            <h2 className="summary-card-title">Итого</h2>

            <div className="summary-rows-group">
              <div className="summary-item-row">
                <span>{itemCount} товаров</span>
                <span className="val">{rawSubtotal.toLocaleString('ru-RU')} ₸</span>
              </div>

              <div className="summary-item-row">
                <span>Скидка</span>
                <span className="val">-{discountAmount.toLocaleString('ru-RU')} ₸</span>
              </div>

              <div className="summary-item-row">
                <span>Бонус за заказ</span>
                <span className="val-green">+{bonusEarned.toLocaleString('ru-RU')} ₸</span>
              </div>

              <div className="summary-item-row">
                <span>Оплата бонусами</span>
                <span className="val">-{bonusSpent.toLocaleString('ru-RU')}B</span>
              </div>
            </div>

            <div className="summary-divider" />

            <div className="summary-subtotal-row">
              <span>Сумма товаров</span>
              <span className="val-bold">{finalTotal.toLocaleString('ru-RU')} ₸</span>
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
                  <span className="bonus-use-amount">5 000₸</span>
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
              className="btn-summary-checkout btn-primary-red"
              onClick={handleOrderSubmit}
              type="button"
            >
              Оформить заказ
            </button>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  </section>
  );
};
