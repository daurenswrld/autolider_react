import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Heart,
  Copy,
  Truck,
  Image as ImageIcon,
  Star,
  Clock,
  Tag,
  ThumbsUp,
  Zap,
  X,
  ZoomIn,
} from "lucide-react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import { useApp } from "../../context/AppContext";
import { updateSEO } from "../../utils/seo";
import "./ProductDetailsPage.css";

const getDeliveryDates = () => {
  const MONTHS = ['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'];
  const d1 = new Date(); d1.setDate(d1.getDate() + 3);
  const d2 = new Date(); d2.setDate(d2.getDate() + 5);
  const m1 = MONTHS[d1.getMonth()]; const m2 = MONTHS[d2.getMonth()];
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
  if (digits.length >= 6) {
    formatted += digits.slice(3, 6) + "-";
  } else if (digits.length > 3) {
    formatted += digits.slice(3);
  }
  if (digits.length >= 8) {
    formatted += digits.slice(6, 8);
  } else if (digits.length > 6) {
    formatted += digits.slice(6);
  }
  if (digits.length >= 8) {
    formatted += "-";
  }
  if (digits.length > 8) {
    formatted += digits.slice(8, 10);
  }
  return formatted;
};

const normalizeSpecs = (specsInput) => {
  if (!specsInput) return [];
  let raw = specsInput;

  for (let i = 0; i < 5; i++) {
    if (typeof raw === "string" && raw.trim()) {
      try {
        raw = JSON.parse(raw);
      } catch (err) {
        break;
      }
    } else {
      break;
    }
  }

  if (!raw) return [];

  const result = [];
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (!item) continue;
      if (typeof item === "string") {
        try {
          const parsedItem = JSON.parse(item);
          if (parsedItem && typeof parsedItem === "object") {
            const k = String(
              parsedItem.key || parsedItem.title || parsedItem.name || "",
            ).trim();
            const v = String(
              parsedItem.value || parsedItem.val || parsedItem.valName || "",
            ).trim();
            if (k || v) result.push({ key: k, value: v });
          }
        } catch (e) {}
      } else if (typeof item === "object") {
        if (
          "key" in item ||
          "title" in item ||
          "name" in item ||
          "value" in item ||
          "val" in item
        ) {
          const k = String(item.key || item.title || item.name || "").trim();
          const v = String(item.value || item.val || item.valName || "").trim();
          if (k || v) result.push({ key: k, value: v });
        } else {
          for (const [k, v] of Object.entries(item)) {
            if (k && v !== undefined && v !== null) {
              result.push({ key: String(k).trim(), value: String(v).trim() });
            }
          }
        }
      }
    }
  } else if (typeof raw === "object") {
    for (const [k, v] of Object.entries(raw)) {
      if (k && v !== undefined && v !== null) {
        result.push({ key: String(k).trim(), value: String(v).trim() });
      }
    }
  }
  return result.filter((item) => item.key !== "" || item.value !== "");
};

export const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    products,
    addToCart,
    toggleWishlist,
    isInWishlist,
    showToast,
    currentUser,
    user,
  } = useApp();

  const [isOneClickOpen, setIsOneClickOpen] = useState(false);
  const [oneClickName, setOneClickName] = useState(
    currentUser?.name || currentUser?.fullName || "",
  );
  const [oneClickPhone, setOneClickPhone] = useState(
    currentUser?.phone ? formatPhoneMask(currentUser.phone) : "",
  );

  useEffect(() => {
    if (currentUser) {
      setOneClickName(
        (prev) => prev || currentUser.name || currentUser.fullName || "",
      );
      setOneClickPhone(
        (prev) =>
          prev || (currentUser.phone ? formatPhoneMask(currentUser.phone) : ""),
      );
    }
  }, [currentUser]);

  const handleOneClickSubmit = async (e) => {
    e.preventDefault();

    const nameToUse =
      (
        oneClickName ||
        currentUser?.name ||
        currentUser?.fullName ||
        ""
      ).trim() || "Быстрый заказ";
    const phoneToUse = (oneClickPhone || currentUser?.phone || "").trim();

    if (!phoneToUse) {
      showToast("Укажите ваш телефон для обратной связи", "error");
      return;
    }

    try {
      const res = await fetch("/api/orders/one-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: nameToUse,
          customerPhone: phoneToUse,
          customerEmail: currentUser?.email || "",
          customerId: currentUser?.id || null,
          productTitle: product ? product.title : "Автозапчасть",
          price: product ? product.price : 0,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Спасибо! Ваш заказ принят в 1 клик.");
        setIsOneClickOpen(false);
      }
    } catch (err) {
      console.error("Failed to submit 1-click order:", err);
      showToast("Заказ принят! Менеджер свяжется с вами.");
      setIsOneClickOpen(false);
    }
  };

  const [product, setProduct] = useState(() => {
    return products.find((p) => String(p.id) === String(id)) || null;
  });

  useEffect(() => {
    const matched = products.find((p) => String(p.id) === String(id));
    if (matched) setProduct(matched);

    if (id) {
      fetch(`/api/products/${id}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.id) {
            setProduct(data);
          }
        })
        .catch((err) => console.error("Failed fetching live product:", err));
    }
  }, [id, products]);

  useEffect(() => {
    if (product && product.title) {
      const title = `${product.title} — Купить за ${product.price?.toLocaleString("ru-RU")} ₸ | Autolider`;
      const description = `Купить ${product.title} по цене ${product.price?.toLocaleString("ru-RU")} ₸ в маркетплейсе Autolider. Артикул: ${product.sku || 'Н/Д'}. Быстрая доставка по Казахстану.`;
      updateSEO({ title, description });
    }
  }, [product]);

  const [activeTab, setActiveTab] = useState("specs"); // 'specs' | 'desc'
  const [selectedDiameter, setSelectedDiameter] = useState("15");
  const [qty, setQty] = useState(1);
  const [selectedThumb, setSelectedThumb] = useState(0);
  const [isOpenLightbox, setIsOpenLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!product) {
    return (
      <div
        className="product-details-container"
        style={{ padding: "60px 20px", textAlign: "center" }}
      >
        <h2 style={{ color: "black" }}>Товар не найден</h2>
        <p>Запрошенный товар отсутствует или был удален.</p>
      </div>
    );
  }

  const isFav = isInWishlist ? isInWishlist(product.id) : false;

  const handleCopySku = () => {
    navigator.clipboard.writeText(product.sku || "SKU030");
    showToast("Артикул скопирован в буфер обмена!");
  };

  const gallery = [
    product.image || product.photoUrl,
    ...(product.images || []),
  ].filter(Boolean);
  const thumbs = gallery.length > 0 ? gallery : [];

  const currentMainImg =
    gallery[selectedThumb] || gallery[0] || product.image || product.photoUrl;

  const isInStock = product.inStock !== false && product.stockQty !== 0 && (product.stockQty > 0 || product.stockQty === undefined || product.stockQty === null || product.inStock === true);

  const calculatedDiscount =
    product.discountPercent ||
    (product.oldPrice && product.price && product.oldPrice > product.price
      ? Math.round((1 - product.price / product.oldPrice) * 100)
      : null);

  const rawDiameters = product.diameters;
  const diametersList = Array.isArray(rawDiameters)
    ? rawDiameters
    : typeof rawDiameters === "string" && rawDiameters.trim()
      ? rawDiameters.split(",").map((s) => s.trim())
      : [];

  return (
    <section className="product-details-page">
      <div className="product-bg-clouds" />

      <div className="product-container">
        <div className="product-card-wrapper">
          <div className="product-grid">
            {/* Left Column: Gallery */}
            <div className="product-gallery">
              <div
                className="main-image-box"
                onClick={() => {
                  if (currentMainImg) {
                    setLightboxIndex(selectedThumb);
                    setIsOpenLightbox(true);
                  }
                }}
                style={{
                  cursor: currentMainImg ? "zoom-in" : "default",
                  position: "relative",
                }}
                title="Нажмите для увеличения фото"
              >
                <button
                  className="wishlist-icon-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(product.id);
                  }}
                  title="Добавить в избранное"
                  type="button"
                >
                  <Heart
                    size={20}
                    fill={isFav ? "#ea2427" : "none"}
                    color={isFav ? "#ea2427" : "#555565"}
                  />
                </button>

                {currentMainImg && (
                  <div
                    className="zoom-hint-badge"
                    style={{
                      position: "absolute",
                      bottom: "12px",
                      right: "12px",
                      background: "rgba(15, 23, 42, 0.75)",
                      backdropFilter: "blur(4px)",
                      color: "#fff",
                      padding: "6px 12px",
                      borderRadius: "20px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "12px",
                      fontWeight: 600,
                      pointerEvents: "none",
                      zIndex: 2,
                    }}
                  >
                    <ZoomIn size={14} />
                    <span>Увеличить</span>
                  </div>
                )}

                {currentMainImg ? (
                  <img
                    src={currentMainImg}
                    alt={product.title}
                    className="product-main-img"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <ImageIcon size={96} strokeWidth={1} />
                )}
              </div>

              {/* Thumbnails Row */}
              {thumbs.length > 1 && (
                <div className="thumbs-row">
                  {thumbs.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className={`thumb-item ${selectedThumb === idx ? "active" : ""}`}
                      onClick={() => setSelectedThumb(idx)}
                    >
                      <img
                        src={imgUrl}
                        alt={`Thumbnail ${idx + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Information */}
            <div className="product-info-col">
              {/* Product Title */}
              <h1 className="product-details-title">{product.title}</h1>

              {/* Badges Bar */}
              <div className="badges-bar">
                {product.promoTimer && product.promoTimer.trim() !== "" && (
                  <span className="badge-tag red">
                    <Clock size={12} />
                    <span>{product.promoTimer}</span>
                  </span>
                )}
                {product.badgeFastDelivery === true && (
                  <span className="badge-tag blue">
                    <Truck size={12} />
                    <span>БЫСТРАЯ ДОСТАВКА</span>
                  </span>
                )}
                {calculatedDiscount && (
                  <span className="badge-tag discount">
                    <Tag size={12} />
                    <span>СКИДКА -{calculatedDiscount}%</span>
                  </span>
                )}
                {product.badgeBestChoice === true && (
                  <span className="badge-tag purple">
                    <Star size={12} />
                    <span>ЛУЧШИЙ ВЫБОР</span>
                  </span>
                )}
                {product.badgeGoodPrice === true && (
                  <span className="badge-tag orange">
                    <ThumbsUp size={12} />
                    <span>ХОРОШАЯ ЦЕНА</span>
                  </span>
                )}
              </div>

              {/* Tabs Header */}
              <div className="tabs-header">
                <button
                  className={`tab-btn ${activeTab === "specs" ? "active" : ""}`}
                  onClick={() => setActiveTab("specs")}
                  type="button"
                >
                  Характеристики
                </button>
                {product.description && product.description.trim() !== "" && (
                  <button
                    className={`tab-btn ${activeTab === "desc" ? "active" : ""}`}
                    onClick={() => setActiveTab("desc")}
                    type="button"
                  >
                    Описание
                  </button>
                )}
              </div>

              {/* Specs View */}
              {activeTab === "specs" ? (
                <div className="specs-list-box">
                  {product.sku && (
                    <div className="spec-row-item">
                      <span className="spec-key">Артикул</span>
                      <div className="spec-dots-filler" />
                      <span className="spec-val">
                        {product.sku}
                        <Copy
                          size={14}
                          className="copy-sku-icon"
                          onClick={handleCopySku}
                          title="Скопировать артикул"
                        />
                      </span>
                    </div>
                  )}

                  {(() => {
                    const specsList = normalizeSpecs(
                      product ? product.specs : null,
                    );

                    if (specsList.length > 0) {
                      return specsList.map((s, idx) => (
                        <div key={idx} className="spec-row-item">
                          <span className="spec-key">{s.key}</span>
                          <div className="spec-dots-filler" />
                          <span className="spec-val">{s.value}</span>
                        </div>
                      ));
                    }

                    return (
                      <>
                        {product.type && (
                          <div className="spec-row-item">
                            <span className="spec-key">Тип</span>
                            <div className="spec-dots-filler" />
                            <span className="spec-val">{product.type}</span>
                          </div>
                        )}

                        {product.material && (
                          <div className="spec-row-item">
                            <span className="spec-key">Материал</span>
                            <div className="spec-dots-filler" />
                            <span className="spec-val">{product.material}</span>
                          </div>
                        )}

                        {diametersList.length > 0 && (
                          <div className="spec-row-item">
                            <span className="spec-key">Диаметр</span>
                            <div className="spec-dots-filler" />
                            <span className="spec-val">
                              {diametersList.join(". ")}
                            </span>
                          </div>
                        )}

                        {product.pcd && (
                          <div className="spec-row-item">
                            <span className="spec-key">PCD</span>
                            <div className="spec-dots-filler" />
                            <span className="spec-val">{product.pcd}</span>
                          </div>
                        )}

                        {product.et && (
                          <div className="spec-row-item">
                            <span className="spec-key">Вылет (ET)</span>
                            <div className="spec-dots-filler" />
                            <span className="spec-val">{product.et}</span>
                          </div>
                        )}

                        {product.co && (
                          <div className="spec-row-item">
                            <span className="spec-key">ЦО</span>
                            <div className="spec-dots-filler" />
                            <span className="spec-val">{product.co}</span>
                          </div>
                        )}

                        {product.color && (
                          <div className="spec-row-item">
                            <span className="spec-key">Цвет</span>
                            <div className="spec-dots-filler" />
                            <span className="spec-val">{product.color}</span>
                          </div>
                        )}

                        {product.season && (
                          <div className="spec-row-item">
                            <span className="spec-key">Сезон</span>
                            <div className="spec-dots-filler" />
                            <span className="spec-val">{product.season}</span>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              ) : (
                /* Description View */
                <div className="description-text-box">
                  <p>{product.description}</p>
                </div>
              )}

              {/* Variant Selector (Диаметр) */}
              {diametersList.length > 0 && (
                <div className="variant-selector-section">
                  <span className="variant-label">Диаметр</span>
                  <div className="variant-options-row">
                    {diametersList.map((d) => (
                      <button
                        key={d}
                        className={`variant-opt-btn ${selectedDiameter === d ? "active" : ""}`}
                        onClick={() => setSelectedDiameter(d)}
                        type="button"
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions Area */}
              <div className="product-actions-area">
                <span className="product-details-price">
                  {product.price.toLocaleString("ru-RU")} ₸/шт
                </span>

                {/* Black Square Quantity Picker */}
                <div className="black-qty-picker">
                  <button
                    className="qty-square-black-btn"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    type="button"
                  >
                    -
                  </button>
                  <span className="black-qty-val">{qty}</span>
                  <button
                    className="qty-square-black-btn"
                    onClick={() => setQty((q) => q + 1)}
                    type="button"
                  >
                    +
                  </button>
                </div>

                {/* Delivery Label */}
                <div className="product-delivery-text">
                  <Truck size={15} />
                  <span>
                    Доставка: <span className="dates">{getDeliveryDates()}</span>
                  </span>
                </div>

                {/* Primary Add to Cart Button & 1-Click Order (2.3.4 ТЗ) */}
                <div
                  className="product-buy-buttons-group"
                  style={{
                    display: "flex",
                    gap: "12px",
                    width: "100%",
                    marginTop: "12px",
                  }}
                >
                  <button
                    className="btn-add-to-cart-lg"
                    style={{ flex: 1 }}
                    onClick={() => {
                      const activeUser = currentUser || user;
                      if (!activeUser) {
                        navigate("/auth");
                        return;
                      }
                      addToCart(product, qty);
                    }}
                    type="button"
                  >
                    В корзину
                  </button>

                  <button
                    className="btn-buy-one-click"
                    style={{
                      flex: 1,
                      background: "#10b981",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "12px",
                      fontWeight: 800,
                      fontSize: "15px",
                      cursor: "pointer",
                      padding: "14px 20px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                    onClick={() => setIsOneClickOpen(true)}
                    type="button"
                  >
                    <Zap size={18} />
                    <span>Купить в 1 клик</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick 1-Click Order Modal (2.3.4 ТЗ) */}
      {isOneClickOpen && (
        <div
          className="admin-modal-overlay"
          onClick={() => setIsOneClickOpen(false)}
        >
          <div
            className="admin-modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "440px" }}
          >
            <div className="admin-modal-header">
              <h3 className="modal-title">Быстрый заказ в 1 клик (2.3.4)</h3>
              <button
                className="btn-modal-close"
                onClick={() => setIsOneClickOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleOneClickSubmit} className="admin-modal-form">
              <p className="text-sub" style={{ fontSize: "14px", margin: 0 }}>
                Товар: <b>{product.title}</b> (
                {product.price?.toLocaleString("ru-RU")} ₸)
              </p>

              <div className="form-group">
                <label>Ваше Имя *</label>
                <input
                  type="text"
                  required
                  placeholder="Даурен"
                  value={oneClickName}
                  onChange={(e) => setOneClickName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Ваш Номер телефона *</label>
                <input
                  type="tel"
                  required
                  placeholder="+7 (705) 000-00-00"
                  value={oneClickPhone}
                  onChange={(e) =>
                    setOneClickPhone(formatPhoneMask(e.target.value))
                  }
                  onFocus={(e) => {
                    if (!oneClickPhone) setOneClickPhone("+7 (");
                  }}
                  maxLength={18}
                />
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="btn-admin-secondary"
                  onClick={() => setIsOneClickOpen(false)}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="btn-admin-primary"
                  style={{ background: "#10b981" }}
                >
                  <span>Оформить в 1 клик</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Lightbox Modal with Zoom Plugin */}
      {isOpenLightbox && (
        <Lightbox
          open={isOpenLightbox}
          close={() => setIsOpenLightbox(false)}
          index={lightboxIndex}
          slides={gallery.map((src) => ({ src }))}
          plugins={[Zoom]}
          zoom={{
            maxZoomPixelRatio: 4,
            zoomInMultiplier: 2,
            doubleTapDelay: 300,
            doubleClickDelay: 300,
          }}
        />
      )}
    </section>
  );
};
