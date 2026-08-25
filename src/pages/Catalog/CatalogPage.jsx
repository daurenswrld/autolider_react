import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate, useParams } from "react-router-dom";
import {
  ChevronRight,
  ArrowLeft,
  Heart,
  Plus,
  Minus,
  Check,
  ShoppingCart,
  Car,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { slugify, getUniqueModelSlug } from "../../utils/slugify";
import "./CatalogPage.css";

export const CatalogPage = () => {
  const { products = [], categories: apiCategories = [], toggleWishlist, isInWishlist, addToCart, currentUser, user } = useApp();
  const [searchParams] = useSearchParams();
  const { brandParam, modelParam, categoryParam } = useParams();
  const navigate = useNavigate();

  const [apiBrands, setApiBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Cart & Favorites state
  const [cartQuantities, setCartQuantities] = useState({});
  const [favorites, setFavorites] = useState({});
  const [addedItems, setAddedItems] = useState({});

  useEffect(() => {
    fetch("/api/brands")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setApiBrands(data);
        }
      })
      .catch((err) => console.error("Failed to load brands in catalog:", err));
  }, []);

  const fallbackBrands = [
    {
      name: "HAVAL",
      logoUrl: "",
      heroUrl: "",
      models: [
        { id: "f7", name: "Haval F7", photoUrl: "" },
        { id: "jolion", name: "Haval Jolion", photoUrl: "" },
      ],
    },
    {
      name: "TOYOTA",
      logoUrl: "",
      heroUrl: "",
      models: [
        { id: "camry", name: "Toyota Camry", photoUrl: "" },
        { id: "rav4", name: "Toyota RAV4", photoUrl: "" },
      ],
    },
    {
      name: "BMW",
      logoUrl: "",
      heroUrl: "",
      models: [
        { id: "m5", name: "BMW M5", photoUrl: "" },
        { id: "x5", name: "BMW X5", photoUrl: "" },
      ],
    },
  ];

  const brandsList = apiBrands.length > 0 ? apiBrands : fallbackBrands;
  const currentBrandObj =
    brandsList.find((b) => b.name === selectedBrand) || brandsList[0];
  const currentModels = currentBrandObj ? currentBrandObj.models || [] : [];

  // Default Categories (Stage 2 Fallback)
  const defaultCategories = [
    { id: "tires", name: "Шины и диски", img: "/assets/img/test_accessosry.png" },
    { id: "oils", name: "Масла и автохимия", img: "/assets/img/test_accessosry.png" },
    { id: "brakes", name: "Тормозная система", img: "/assets/img/test_accessosry.png" },
    { id: "batteries", name: "Аккумуляторы", img: "/assets/img/test_accessosry.png" },
    { id: "filters", name: "Фильтры", img: "/assets/img/test_accessosry.png" },
    { id: "ignition", name: "Зажигание и электрика", img: "/assets/img/test_accessosry.png" },
    { id: "suspension", name: "Подвеска и рулевое", img: "/assets/img/test_accessosry.png" },
  ];

  const rawCategories = apiCategories && apiCategories.length > 0 ? apiCategories : defaultCategories;
  const categoriesList = rawCategories.filter((cat) => cat.status !== "disabled");

  // Sync state from URL parameters
  useEffect(() => {
    const activeBrandStr = brandParam || searchParams.get("brand");
    const activeModelStr = modelParam || searchParams.get("model");
    const activeCatStr = categoryParam || searchParams.get("category");

    // 1. Sync Brand
    let currentB = null;
    if (activeBrandStr) {
      const foundB = brandsList.find(
        (b) =>
          b.slug === activeBrandStr ||
          slugify(b.name) === activeBrandStr.toLowerCase() ||
          b.name.toLowerCase() === activeBrandStr.toLowerCase()
      );
      if (foundB) currentB = foundB.name;
      else currentB = activeBrandStr;
    }
    setSelectedBrand(currentB);

    // 2. Sync Model
    if (activeModelStr && activeModelStr !== "all") {
      const bObj = brandsList.find((b) => b.name === currentB) || brandsList[0];
      const models = bObj ? bObj.models || [] : [];
      const foundM = models.find(
        (m, idx) => {
          const uSlug = getUniqueModelSlug(m, idx, models);
          return (
            uSlug === activeModelStr.toLowerCase() ||
            m.slug === activeModelStr ||
            m.name.toLowerCase() === activeModelStr.toLowerCase()
          );
        }
      );
      if (foundM) {
        setSelectedModel(foundM.name);
      } else {
        setSelectedModel(activeModelStr.replace(/-/g, " "));
      }
    } else {
      setSelectedModel(null);
    }

    // 3. Sync Category
    if (activeCatStr) {
      const foundC = rawCategories.find(
        (c) =>
          c.slug === activeCatStr ||
          c.id === activeCatStr ||
          slugify(c.name) === activeCatStr.toLowerCase() ||
          c.name.toLowerCase() === activeCatStr.toLowerCase()
      );
      if (foundC) {
        setSelectedCategory(foundC.name);
      } else {
        setSelectedCategory(activeCatStr.replace(/-/g, " "));
      }
    } else {
      setSelectedCategory(null);
    }
  }, [brandParam, modelParam, categoryParam, searchParams, apiBrands, rawCategories]);

  // Products List (Stage 3)
  const productsList = products;

  const formatItemCount = (count) => {
    const lastTwo = count % 100;
    const lastOne = count % 10;
    if (lastTwo >= 11 && lastTwo <= 19) return `${count} товаров`;
    if (lastOne === 1) return `${count} товар`;
    if (lastOne >= 2 && lastOne <= 4) return `${count} товара`;
    return `${count} товаров`;
  };

  const getProductCountForCategory = (cat) => {
    if (!cat) return 0;
    return productsList.filter((p) => {
      if (p.status === "disabled") return false;

      const matchesBrand =
        !selectedBrand ||
        !p.carMake ||
        p.carMake === "Универсальный" ||
        p.isUniversal ||
        (Array.isArray(p.carMakes) &&
          (p.carMakes.length === 0 ||
            p.carMakes.some((m) =>
              m.toLowerCase().includes(selectedBrand.toLowerCase())
            ))) ||
        p.carMake.toLowerCase().includes(selectedBrand.toLowerCase());

      const matchesModel =
        !selectedModel ||
        !p.carModel ||
        p.carModel === "Все модели" ||
        p.isUniversal ||
        (Array.isArray(p.carModels) &&
          (p.carModels.length === 0 ||
            p.carModels.some((m) =>
              m.toLowerCase().includes(selectedModel.toLowerCase())
            ))) ||
        p.carModel.toLowerCase().includes(selectedModel.toLowerCase());

      const matchesCat =
        p.categoryId === cat.id ||
        p.categoryName === cat.name ||
        p.categoryId === cat.slug ||
        p.categoryName === cat.slug ||
        (cat.name && p.categoryName && p.categoryName.toLowerCase() === cat.name.toLowerCase()) ||
        (cat.id && p.categoryId && String(p.categoryId).toLowerCase() === String(cat.id).toLowerCase());

      return matchesBrand && matchesModel && matchesCat;
    }).length;
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBrandSelect = (brandName) => {
    setSelectedBrand(brandName);
    setSelectedModel(null);
    setSelectedCategory(null);
    scrollToTop();
    const bSlug = slugify(brandName);
    navigate(`/catalog/${bSlug}`);
  };

  const handleModelSelect = (modelObj, modelIdx) => {
    setSelectedModel(modelObj.name);
    setSelectedCategory(null);
    scrollToTop();
    const bSlug = slugify(selectedBrand);
    const mSlug = getUniqueModelSlug(modelObj, modelIdx, currentModels);
    navigate(`/catalog/${bSlug}/${mSlug}`);
  };

  const handleCategorySelect = (catObj) => {
    setSelectedCategory(catObj.name);
    scrollToTop();
    const bSlug = slugify(selectedBrand);
    let mSlug = "all";
    if (selectedModel) {
      const selectedModelIdx = currentModels.findIndex((m) => m.name === selectedModel);
      const selectedModelObj = currentModels[selectedModelIdx];
      if (selectedModelObj) {
        mSlug = getUniqueModelSlug(selectedModelObj, selectedModelIdx, currentModels);
      } else {
        mSlug = slugify(selectedModel);
      }
    }
    const cSlug = catObj.slug || slugify(catObj.name);
    navigate(`/catalog/${bSlug}/${mSlug}/${cSlug}`);
  };

  const handleBackToModels = () => {
    setSelectedModel(null);
    setSelectedCategory(null);
    scrollToTop();
    const bSlug = slugify(selectedBrand);
    navigate(`/catalog/${bSlug}`);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    scrollToTop();
    const bSlug = slugify(selectedBrand);
    const mSlug = slugify(selectedModel || "all");
    navigate(`/catalog/${bSlug}/${mSlug}`);
  };

  const toggleFavorite = (productId) => {
    setFavorites((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
    if (toggleWishlist) {
      toggleWishlist(productId);
    }
  };

  const handleAddToCart = (productId) => {
    const activeUser = currentUser || user;
    if (!activeUser) {
      navigate('/auth');
      return;
    }
    const prod = productsList.find((p) => p.id === productId) || products.find((p) => p.id === productId);
    if (prod && addToCart) {
      const added = addToCart(prod, cartQuantities[productId] || 1);
      if (added) {
        setAddedItems((prev) => ({ ...prev, [productId]: true }));
        setTimeout(() => {
          setAddedItems((prev) => ({ ...prev, [productId]: false }));
        }, 2000);
      }
    }
  };

  const handleQuantityChange = (productId, delta) => {
    setCartQuantities((prev) => {
      const current = prev[productId] || 12;
      const updated = Math.max(1, current + delta);
      return { ...prev, [productId]: updated };
    });
  };

  return (
    <div className="catalog-page">
      <div className="catalog-bg-clouds" />
      <div className="catalog-container">
        {!selectedBrand ? (
          /* STAGE 0: All Brands Overview (No Sidebar) */
          <div className="catalog-all-brands-view">
            <div className="catalog-brands-header">
              <h1 className="catalog-title-main">Выберите марку автомобиля</h1>
              <p className="catalog-subtitle-main">
                Выберите производителя для перехода к списку доступных моделей и автозапчастей
              </p>
            </div>

            <div className="all-brands-grid">
              {[...brandsList].reverse().map((b) => {
                const modelCount = b.models ? b.models.length : 0;
                return (
                  <div
                    key={b.name}
                    className="brand-selection-card"
                    onClick={() => handleBrandSelect(b.name)}
                  >
                    <div className="brand-card-logo-box">
                      {b.logoUrl ? (
                        <img src={b.logoUrl} alt={b.name} className="brand-card-logo-img" />
                      ) : (
                        <Car size={36} color="#64748b" />
                      )}
                    </div>
                    <div className="brand-card-info">
                      <span className="brand-card-title">{b.name}</span>
                      <span className="brand-card-count">
                        {modelCount > 0 ? `${modelCount} моделей` : 'Каталог запчастей'}
                      </span>
                    </div>
                    <ChevronRight size={18} className="brand-card-arrow" />
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* STAGE 1 / 2 / 3: Layout with Left Sidebar */
          <div className="catalog-layout">
            {/* Left Sidebar: Brands List */}
            <aside className="catalog-sidebar">
              <ul className="sidebar-brands-list">
                {brandsList.map((b) => (
                  <li
                    key={b.name}
                    className={`sidebar-brand-item ${selectedBrand === b.name ? "active" : ""}`}
                    onClick={() => handleBrandSelect(b.name)}
                  >
                    {b.logoUrl ? (
                      <img
                        src={b.logoUrl}
                        alt={b.name}
                        className="sidebar-brand-logo-img"
                      />
                    ) : null}
                    <span>{b.name}</span>
                  </li>
                ))}
              </ul>
            </aside>

          {/* Main Content View */}
          <main className="catalog-main-content">
            {/* STAGE 1: Models Selection */}
            {!selectedModel && !selectedCategory && (
              <div className="stage-models">
                <div className="catalog-brand-banner">
                  {currentBrandObj?.logoUrl && (
                    <img
                      src={currentBrandObj.logoUrl}
                      alt={selectedBrand}
                      className="catalog-brand-banner-logo"
                    />
                  )}
                  <div>
                    <h1 className="catalog-title">{selectedBrand}</h1>
                  </div>
                </div>

                {currentModels.length === 0 ? (
                  <div className="empty-models-placeholder">
                    <div className="empty-models-icon-wrapper">
                      <Car size={44} strokeWidth={1.5} color="#94a3b8" />
                    </div>
                    <h3 className="empty-models-title">
                      Список моделей обновляется
                    </h3>
                    <p className="empty-models-desc">
                      Для марки <strong>{selectedBrand}</strong> список
                      модификаций временно на пополнении. Вы можете оставить
                      заявку на подбор запчасти по VIN-коду или связаться с
                      нашим специалистом.
                    </p>
                  </div>
                ) : (
                  <div className="models-grid">
                    {currentModels.map((m, idx) => (
                      <div
                        key={m.id || idx}
                        className="model-card"
                        onClick={() => handleModelSelect(m, idx)}
                      >
                        <div className="model-img-placeholder">
                          {m.photoUrl || currentBrandObj?.heroUrl ? (
                            <img
                              src={m.photoUrl || currentBrandObj.heroUrl}
                              alt={m.name}
                              className="model-card-photo"
                            />
                          ) : (
                            <svg
                              width="48"
                              height="48"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#bcbcc5"
                              strokeWidth="1.5"
                            >
                              <rect
                                x="3"
                                y="3"
                                width="18"
                                height="18"
                                rx="2"
                                ry="2"
                              ></rect>
                              <circle cx="8.5" cy="8.5" r="1.5"></circle>
                              <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                          )}
                        </div>
                        <div className="model-card-text">
                          <span className="model-name">{m.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STAGE 2: Category Selection */}
            {selectedModel && !selectedCategory && (
              <div className="stage-categories">
                <div className="catalog-header-back">
                  <button className="btn-back" onClick={handleBackToModels}>
                    <ArrowLeft size={22} />
                    <span>{selectedBrand}</span>
                  </button>
                </div>

                <div className="categories-grid">
                  {categoriesList.map((cat) => {
                    const imgSrc = cat.img || cat.photoUrl;
                    const count = getProductCountForCategory(cat);
                    return (
                      <div
                        key={cat.id}
                        className="category-card"
                        onClick={() => handleCategorySelect(cat)}
                      >
                        <div className="category-img-placeholder">
                          {imgSrc ? (
                            <img
                              src={imgSrc}
                              alt={cat.name}
                              className="category-card-img"
                            />
                          ) : (
                            <svg
                              width="48"
                              height="48"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#bcbcc5"
                              strokeWidth="1.5"
                            >
                              <rect
                                x="3"
                                y="3"
                                width="18"
                                height="18"
                                rx="2"
                                ry="2"
                              ></rect>
                              <circle cx="8.5" cy="8.5" r="1.5"></circle>
                              <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                          )}
                        </div>
                        <div className="category-text-block" style={{ textAlign: "center", marginTop: "6px" }}>
                          <span className="category-name" style={{ display: "block", fontWeight: 700 }}>{cat.name}</span>
                          <span className="category-count" style={{ fontSize: "12px", color: "#64748b" }}>
                            {formatItemCount(count)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STAGE 3: Products Grid */}
            {selectedModel && selectedCategory && (
              <div className="stage-products">
                <div className="catalog-header-back">
                  <button className="btn-back" onClick={handleBackToCategories}>
                    <ArrowLeft size={22} />
                    <span>{selectedCategory}</span>
                  </button>
                </div>

                <div className="products-grid">
                  {(() => {
                    const filtered = productsList.filter((p) => {
                      if (p.status === "disabled") return false;

                      const matchesBrand =
                        !p.carMake ||
                        p.carMake === "Универсальный" ||
                        p.isUniversal ||
                        (Array.isArray(p.carMakes) &&
                          (p.carMakes.length === 0 ||
                            p.carMakes.some((m) =>
                              m.toLowerCase().includes(selectedBrand.toLowerCase())
                            ))) ||
                        p.carMake.toLowerCase().includes(selectedBrand.toLowerCase());

                      const matchesModel =
                        !selectedModel ||
                        !p.carModel ||
                        p.carModel === "Все модели" ||
                        p.isUniversal ||
                        (Array.isArray(p.carModels) &&
                          (p.carModels.length === 0 ||
                            p.carModels.some((m) =>
                              m.toLowerCase().includes(selectedModel.toLowerCase())
                            ))) ||
                        p.carModel.toLowerCase().includes(selectedModel.toLowerCase());

                      const selectedCatObj = categoriesList.find(
                        (c) =>
                          c.name === selectedCategory ||
                          c.id === selectedCategory ||
                          c.slug === selectedCategory ||
                          (c.name && slugify(c.name) === slugify(selectedCategory))
                      );

                      const matchesCat =
                        !selectedCategory ||
                        p.categoryId === selectedCategory ||
                        p.categoryName === selectedCategory ||
                        p.slug === selectedCategory ||
                        (selectedCatObj &&
                          (p.categoryId === selectedCatObj.id ||
                            p.categoryName === selectedCatObj.name ||
                            p.categoryId === selectedCatObj.slug));

                      return matchesBrand && matchesModel && matchesCat;
                    });

                    if (filtered.length === 0) {
                      return (
                        <div
                          className="no-products-msg"
                          style={{
                            gridColumn: "1 / -1",
                            textAlign: "center",
                            padding: "40px 20px",
                            color: "#64748b",
                          }}
                        >
                          <h3>Товары не найдены</h3>
                          <p>
                            Для выбранной категории и модели товаров пока нет в наличии
                          </p>
                        </div>
                      );
                    }

                    return filtered.map((p) => {
                      const qty = cartQuantities[p.id] || 1;
                      const isFav = isInWishlist
                        ? isInWishlist(p.id)
                        : favorites[p.id] || false;
                      const isAdded = addedItems[p.id] || false;
                      const imgSrc = p.image || p.photoUrl || p.img || "/assets/img/test_accessosry.png";
                      const displayPrice = typeof p.price === "number" ? `${new Intl.NumberFormat("ru-RU").format(p.price)} ₸` : p.price;
                      const displayOldPrice = p.oldPrice && p.oldPrice > 0 ? (typeof p.oldPrice === "number" ? `${new Intl.NumberFormat("ru-RU").format(p.oldPrice)} ₸` : p.oldPrice) : null;

                      return (
                        <div key={p.id} className="product-card">
                          {/* Top Badges & Favorite */}
                          <div className="product-card-header">
                            <div className="badges-group">
                              {p.badgeHit && (
                                <span className="badge-hit">ХИТ</span>
                              )}
                              {p.discountPercent ? (
                                <span className="badge-discount">
                                  -{p.discountPercent}%
                                </span>
                              ) : p.discount ? (
                                <span className="badge-discount">
                                  {p.discount}
                                </span>
                              ) : null}
                            </div>
                            <button
                              className={`btn-fav ${isFav ? "active" : ""}`}
                              onClick={() => toggleFavorite(p.id)}
                              aria-label="В избранное"
                              title={
                                isFav ? "В избранном" : "Добавить в избранное"
                              }
                            >
                              <Heart
                                size={18}
                                fill={isFav ? "#e63125" : "none"}
                                stroke={isFav ? "#e63125" : "#888894"}
                              />
                            </button>
                          </div>

                          {/* Product Image */}
                          <Link
                            to={`/product/${p.id}`}
                            className="product-img-box"
                          >
                            <img
                              src={imgSrc}
                              alt={p.title}
                              className="product-img"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "/assets/img/test_accessosry.png";
                              }}
                            />
                          </Link>

                          {/* Info & Price */}
                          <div className="product-info-box">
                            <h3 className="product-title" title={p.title}>
                              <Link
                                to={`/product/${p.id}`}
                                style={{
                                  textDecoration: "none",
                                  color: "inherit",
                                }}
                              >
                                {p.title}
                              </Link>
                            </h3>
                            <p className="product-subtitle">{p.subtitle || p.brand || p.sku}</p>

                            <div className="product-price-row">
                              <div className="price-wrapper">
                                <span className="price-main">{displayPrice}</span>
                                {displayOldPrice && (
                                  <span className="price-old">{displayOldPrice}</span>
                                )}
                              </div>
                            </div>

                            {/* Action Controls */}
                            <div className="product-actions-row">
                              <button
                                className={`btn-add-cart ${isAdded ? "added" : ""}`}
                                onClick={() => handleAddToCart(p.id)}
                              >
                                {isAdded ? (
                                  <>
                                    <Check size={16} />
                                    <span>В корзине</span>
                                  </>
                                ) : (
                                  <>
                                    <ShoppingCart size={16} />
                                    <span>В корзину</span>
                                  </>
                                )}
                              </button>

                              <div className="quantity-counter">
                                <button
                                  className="qty-btn"
                                  onClick={() => handleQuantityChange(p.id, -1)}
                                  title="Уменьшить"
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="qty-val">{qty}</span>
                                <button
                                  className="qty-btn"
                                  onClick={() => handleQuantityChange(p.id, 1)}
                                  title="Увеличить"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </main>
        </div>
        )}
      </div>
    </div>
  );
};
