import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Image as ImageIcon,
  Check,
  ArrowRight,
  ShoppingBag,
  User,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import "./CheckoutPage.css";

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

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const {
    cart,
    cartCount,
    cartTotal,
    showToast,
    clearCart,
    currentUser,
    setCurrentUser,
  } = useApp();

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedOrderTotal, setSubmittedOrderTotal] = useState(0);
  const [submittedOrderNum, setSubmittedOrderNum] = useState("000001");

  // Form State
  const [deliveryMethod, setDeliveryMethod] = useState("courier");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [useBonuses, setUseBonuses] = useState(true);
  const [saveAddress, setSaveAddress] = useState(false);

  const KNOWN_CITIES = ["Астана", "Алматы", "Шымкент", "Караганда"];
  const userCity = currentUser?.city || "Астана";
  const isKnownCity = KNOWN_CITIES.includes(userCity);
  const [customCity, setCustomCity] = useState(isKnownCity ? "" : userCity);

  const [formData, setFormData] = useState({
    fullName: currentUser?.name || currentUser?.fullName || "",
    phone: currentUser?.phone ? formatPhoneMask(currentUser.phone) : "",
    email: currentUser?.email || "",
    comment: "",
    city: isKnownCity ? userCity : "Другое",
    address: "",
    cardNumber: "",
    cardHolder: "",
    cardExpiry: "",
    cardCvv: "",
  });

  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        fullName:
          prev.fullName || currentUser.name || currentUser.fullName || "",
        phone:
          prev.phone ||
          (currentUser.phone ? formatPhoneMask(currentUser.phone) : ""),
        email: prev.email || currentUser.email || "",
        city:
          prev.city !== "Другое"
            ? KNOWN_CITIES.includes(currentUser.city)
              ? currentUser.city
              : "Другое"
            : prev.city,
      }));
      // sync customCity if user city is non-standard
      if (currentUser.city && !KNOWN_CITIES.includes(currentUser.city)) {
        setCustomCity((prev) => prev || currentUser.city);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (!isSubmitted && (!cart || cart.length === 0)) {
      navigate("/cart", { replace: true });
    }
  }, [cart, isSubmitted, navigate]);

  const formatPhone = (val) => {
    if (!val) return "";
    const digits = val.replace(/\D/g, "");
    let number = digits;
    if (number.startsWith("7") || number.startsWith("8")) {
      number = number.slice(1);
    }
    number = number.slice(0, 10);
    let result = "+7 ";
    if (number.length > 0) result += "(" + number.slice(0, 3);
    if (number.length >= 3) result += ") " + number.slice(3, 6);
    if (number.length >= 6) result += "-" + number.slice(6, 8);
    if (number.length >= 8) result += "-" + number.slice(8, 10);
    return result;
  };

  const formatCardNumber = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  };

  const formatCardExpiry = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    return digits;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === "phone") {
      newValue = formatPhone(value);
    } else if (name === "cardNumber") {
      newValue = formatCardNumber(value);
    } else if (name === "cardExpiry") {
      newValue = formatCardExpiry(value);
    }
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const itemCount = cart.reduce(
    (sum, { qty, quantity }) => sum + (qty || quantity || 1),
    0
  );
  const rawSubtotal = cart.reduce(
    (sum, { product, price, qty, quantity }) =>
      sum + (product?.price || price || 0) * (qty || quantity || 1),
    0
  );
  const discountAmount =
    rawSubtotal > 50000 ? Math.round(rawSubtotal * 0.03) : 0;
  const bonusEarned = useBonuses ? 0 : Math.round(rawSubtotal * 0.05);
  const userBonusBalance = currentUser?.bonusBalance || 0;
  const maxBonusSpend = Math.min(
    userBonusBalance,
    Math.round(rawSubtotal * 0.2)
  );
  const bonusSpent = useBonuses && rawSubtotal > 0 ? maxBonusSpend : 0;
  const finalTotal = Math.max(0, rawSubtotal - discountAmount - bonusSpent);

  const handleOrderSubmit = async (e) => {
    e?.preventDefault();

    const nameToUse = (
      formData.fullName ||
      currentUser?.name ||
      currentUser?.fullName ||
      ""
    ).trim();
    const phoneToUse = (formData.phone || currentUser?.phone || "").trim();
    const finalCity =
      formData.city === "Другое" ? customCity.trim() : formData.city;

    if (!nameToUse) {
      showToast(
        "Пожалуйста, укажите имя и фамилию для получения заказа",
        "error",
      );
      return;
    }
    if (!phoneToUse) {
      showToast("Пожалуйста, укажите ваш контактный номер телефона", "error");
      return;
    }
    if (formData.city === "Другое" && !customCity.trim()) {
      showToast("Пожалуйста, введите название вашего города", "error");
      return;
    }

    const paymentMethodLabel =
      paymentMethod === "card"
        ? "Freedom Pay (Банковская карта)"
        : paymentMethod === "kaspi"
          ? "Kaspi QR"
          : "Наличными / картой при получении";

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: nameToUse,
          customerPhone: phoneToUse,
          customerEmail: formData.email || currentUser?.email || "",
          customerId: currentUser?.id || null,
          address:
            deliveryMethod === "courier"
              ? `${finalCity}, ${formData.address || "Уточнить адрес"}`
              : "Самовывоз из автохаба (Астана)",
          totalPrice: finalTotal,
          paymentMethod: paymentMethodLabel,
          comment: formData.comment || "",
          bonusSpent: bonusSpent,
          bonusEarned: bonusEarned,
          items:
            cart.length > 0
              ? cart.map((cItem) => {
                  const p = cItem.product || cItem;
                  const itemTitle =
                    p.title || p.name || "Автозапчасть Autolider";
                  const itemPrice = Number(p.price) || Number(cItem.price) || 0;
                  const itemQty = Number(cItem.qty || cItem.quantity) || 1;
                  const itemArt =
                    p.sku ||
                    p.article ||
                    cItem.sku ||
                    cItem.article ||
                    "ALT-01";
                  const itemImg = p.image || p.img || cItem.image || "";
                  return {
                    id: p.id || cItem.id,
                    title: itemTitle,
                    price: itemPrice,
                    quantity: itemQty,
                    qty: itemQty,
                    sku: itemArt,
                    article: itemArt,
                    image: itemImg,
                    product: p,
                  };
                })
              : [
                  {
                    title: "Автозапчасти Autolider",
                    price: finalTotal,
                    quantity: 1,
                  },
                ],
        }),
      });

      let createdId = "000001";
      if (res.ok) {
        const data = await res.json();
        if (data && data.id) {
          createdId = data.id;
        }
      }
      setSubmittedOrderNum(createdId);

      if (currentUser) {
        const netBonusChange = (bonusEarned || 0) - (bonusSpent || 0);
        const newBonusBalance = Math.max(
          0,
          (currentUser.bonusBalance || 0) + netBonusChange
        );
        const updatedUser = { ...currentUser, bonusBalance: newBonusBalance };
        if (setCurrentUser) setCurrentUser(updatedUser);
        localStorage.setItem("autolider_user", JSON.stringify(updatedUser));

        if (currentUser.id) {
          fetch(`/api/customers/${currentUser.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bonusBalance: newBonusBalance }),
          }).catch((err) => console.warn("Customer bonus update error:", err));
        }
      }

      setSubmittedOrderTotal(finalTotal);
      setIsSubmitted(true);
      showToast(`Заказ № ${createdId} успешно создан!`);
      clearCart();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Order backend creation notice:", err);
    }
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
                Заказ <span className="success-order-num">№{submittedOrderNum}</span>{" "}
                принят!
              </h1>

              <p className="success-subtitle">
                Спасибо за покупку! Наш менеджер уже обрабатывает ваш заказ и
                свяжется с вами в ближайшее время для уточнения деталей.
              </p>

              <div className="success-info-cards">
                <div className="success-card">
                  <span className="success-card-label">Доставка</span>
                  <span className="success-card-val">
                    {deliveryMethod === "courier"
                      ? "Курьером (Астана)"
                      : "Самовывоз (Автозаводская, 12)"}
                  </span>
                </div>

                <div className="success-card">
                  <span className="success-card-label">Оплата</span>
                  <span className="success-card-val">
                    {paymentMethod === "card"
                      ? "Картой онлайн"
                      : paymentMethod === "kaspi"
                        ? "Kaspi QR"
                        : "При получении"}
                  </span>
                </div>

                <div className="success-card">
                  <span className="success-card-label">Сумма заказа</span>
                  <span className="success-card-val">
                    {(submittedOrderTotal || finalTotal).toLocaleString("ru-RU")} ₸
                  </span>
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
                <span className="checkout-items-count">
                  {itemCount} товаров
                </span>
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
                  : null}
              </div>

              {/* Form & Summary Grid */}
              <div className="checkout-grid">
                {/* Left Column: Form Steps */}
                <form
                  className="checkout-form-column"
                  onSubmit={handleOrderSubmit}
                >
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
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              phone: formatPhoneMask(e.target.value),
                            }))
                          }
                          onFocus={(e) => {
                            if (!formData.phone)
                              setFormData((prev) => ({
                                ...prev,
                                phone: "+7 (",
                              }));
                          }}
                          maxLength={18}
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
                        className={`option-select-card ${deliveryMethod === "courier" ? "selected" : ""}`}
                        onClick={() => setDeliveryMethod("courier")}
                      >
                        <div className="option-card-top">
                          <div className="option-radio-title">
                            <span className="radio-circle-custom" />
                            <span>Доставка курьером</span>
                          </div>
                          <span className="option-card-price">0₸</span>
                        </div>
                        <span className="option-card-subtext">
                          {formData.city}, {getDeliveryDates()}
                        </span>
                      </div>

                      <div
                        className={`option-select-card ${deliveryMethod === "pickup" ? "selected" : ""}`}
                        onClick={() => setDeliveryMethod("pickup")}
                      >
                        <div className="option-card-top">
                          <div className="option-radio-title">
                            <span className="radio-circle-custom" />
                            <span>Самовывоз</span>
                          </div>
                          <span className="option-card-price">Бесплатно</span>
                        </div>
                        <span className="option-card-subtext">
                          Автозаводская, 12 · сегодня с 14:00
                        </span>
                      </div>
                    </div>

                    {/* Address Inputs for Courier */}
                    {deliveryMethod === "courier" && (
                      <>
                        <div className="fields-grid-2col" style={{ marginTop: "16px" }}>
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
                              <option value="Другое">Другое</option>
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
                              placeholder="Улица, дом, квартира"
                              required
                            />
                          </div>
                        </div>

                        {formData.city === "Другое" && (
                          <div className="form-group" style={{ marginTop: "12px" }}>
                            <label className="form-label">
                              Ваш город<span className="req">*</span>
                            </label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="Введите название вашего города"
                              value={customCity}
                              onChange={(e) => setCustomCity(e.target.value)}
                              required
                            />
                          </div>
                        )}
                      </>
                    )}

                    {/* Info Card for Pickup */}
                    {deliveryMethod === "pickup" && (
                      <div
                        className="pickup-info-box"
                        style={{
                          marginTop: "16px",
                          padding: "16px",
                          background: "#f8fafc",
                          borderRadius: "10px",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: "600",
                            color: "#1e293b",
                            display: "block",
                            marginBottom: "4px",
                          }}
                        >
                          Пункт выдачи Autolider:
                        </span>
                        <span
                          style={{
                            color: "#475569",
                            fontSize: "14px",
                            display: "block",
                          }}
                        >
                          г. Астана, ул. Автозаводская, 12 (Автохаб Autolider)
                        </span>
                        <span
                          style={{
                            color: "#64748b",
                            fontSize: "13px",
                            marginTop: "4px",
                            display: "block",
                          }}
                        >
                          Режим работы: ежедневно с 09:00 до 20:00 · Готов к
                          выдаче сегодня с 14:00
                        </span>
                      </div>
                    )}
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
                        className={`option-select-card ${paymentMethod === "card" ? "selected" : ""}`}
                        onClick={() => setPaymentMethod("card")}
                      >
                        <div className="option-radio-title">
                          <span className="radio-circle-custom" />
                          <span>Картой онлайн</span>
                        </div>
                        <span className="option-card-subtext">
                          Visa · Mastercard
                        </span>
                      </div>

                      <div
                        className={`option-select-card ${paymentMethod === "kaspi" ? "selected" : ""}`}
                        onClick={() => setPaymentMethod("kaspi")}
                      >
                        <div className="option-radio-title">
                          <span className="radio-circle-custom" />
                          <span>Kaspi QR</span>
                        </div>
                        <span className="option-card-subtext">
                          Отсканировать QR
                        </span>
                      </div>

                      <div
                        className={`option-select-card ${paymentMethod === "cash" ? "selected" : ""}`}
                        onClick={() => setPaymentMethod("cash")}
                      >
                        <div className="option-radio-title">
                          <span className="radio-circle-custom" />
                          <span>При получении</span>
                        </div>
                        <span className="option-card-subtext">
                          Наличными или картой
                        </span>
                      </div>
                    </div>

                    {/* Card Inputs if 'card' is selected */}
                    {paymentMethod === "card" && (
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
                        <span className="bonus-use-title">
                          Потратить бонусы
                        </span>
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
