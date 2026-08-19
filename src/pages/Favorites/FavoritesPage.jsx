import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Search, ShoppingCart, Heart, X } from "lucide-react";
import { useApp } from "../../context/AppContext";
import "./FavoritesPage.css";

export const FavoritesPage = () => {
  const { wishlist = [], products = [], toggleWishlist, addToCart } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);

  // Build the full favorites pool
  const uniquePool = useMemo(
    () => Array.from(new Map(products.map((item) => [item.id, item])).values()),
    [products],
  );
  const favoriteProducts = useMemo(
    () => uniquePool.filter((p) => wishlist.includes(p.id)),
    [uniquePool, wishlist],
  );

  // Derive unique categories from actual favorites
  const categories = useMemo(() => {
    const cats = new Set();
    favoriteProducts.forEach((p) => {
      const cat = p.categoryName || p.category || p.subtitle;
      if (cat) cats.add(cat);
    });
    return Array.from(cats);
  }, [favoriteProducts]);

  // Apply search + category filters
  const filteredProducts = useMemo(() => {
    let result = favoriteProducts;

    if (activeCategory) {
      result = result.filter((p) => {
        const cat = p.categoryName || p.category || p.subtitle;
        return cat === activeCategory;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (p) =>
          (p.title || "").toLowerCase().includes(q) ||
          (p.sku || "").toLowerCase().includes(q) ||
          (p.categoryName || "").toLowerCase().includes(q) ||
          (p.subtitle || "").toLowerCase().includes(q),
      );
    }

    return result;
  }, [favoriteProducts, activeCategory, searchQuery]);

  const handleCategoryClick = (cat) => {
    setActiveCategory((prev) => (prev === cat ? null : cat));
  };

  return (
    <div className="favorites-page">
      <div className="favorites-bg-clouds" />
      <div className="favorites-container">
        <div className="favorites-layout">
          {/* Left Sidebar */}
          <aside className="favorites-sidebar">
            <p className="sidebar-cat-title">Категории</p>
            <ul className="sidebar-cat-list">
              {categories.length === 0 ? (
                <li className="sidebar-cat-empty">Нет категорий</li>
              ) : (
                categories.map((cat) => (
                  <li
                    key={cat}
                    className={`sidebar-cat-item ${activeCategory === cat ? "active" : ""}`}
                    onClick={() => handleCategoryClick(cat)}
                  >
                    <span>{cat}</span>
                    <ChevronRight size={18} className="cat-arrow" />
                  </li>
                ))
              )}
            </ul>
          </aside>

          {/* Main Content Area */}
          <main className="favorites-main-content">
            {/* Header & Search */}
            <div className="favorites-header">
              <h1 className="favorites-title">
                Избранные товары
                {favoriteProducts.length > 0 && (
                  <span className="favorites-count-badge">
                    {favoriteProducts.length}
                  </span>
                )}
              </h1>
              <div className="vin-search-box">
                <div className="vin-input-wrapper">
                  <Search size={18} className="vin-icon" />
                  <input
                    type="text"
                    placeholder="Поиск по названию, артикулу..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="vin-input bg-transparent"
                    style={{ background: "transparent" }}
                  />
                  {searchQuery && (
                    <button
                      className="vin-clear-btn"
                      onClick={() => setSearchQuery("")}
                      type="button"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Active filters bar */}
            {(activeCategory || searchQuery) && (
              <div className="favorites-active-filters">
                {activeCategory && (
                  <span className="active-filter-tag">
                    {activeCategory}
                    <button
                      onClick={() => setActiveCategory(null)}
                      type="button"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="active-filter-tag">
                    «{searchQuery}»
                    <button onClick={() => setSearchQuery("")} type="button">
                      <X size={12} />
                    </button>
                  </span>
                )}
                <button
                  className="clear-all-filters"
                  onClick={() => {
                    setActiveCategory(null);
                    setSearchQuery("");
                  }}
                  type="button"
                >
                  Сбросить всё
                </button>
              </div>
            )}

            {/* Empty State — no favorites at all */}
            {favoriteProducts.length === 0 ? (
              <div className="favorites-empty-state">
                <div className="empty-img-wrapper">
                  <Heart size={64} strokeWidth={1} color="#d0d4dc" />
                </div>
                <h2 className="empty-title">Избранное пока пусто</h2>
                <p className="empty-description">
                  Добавляйте товары в избранное, чтобы не потерять их и купить
                  позже
                </p>
                <Link to="/catalog" className="btn-to-catalog">
                  <span>К покупкам</span>
                  <ShoppingCart size={18} />
                </Link>
              </div>
            ) : filteredProducts.length === 0 ? (
              /* No results after filtering */
              <div className="favorites-empty-state">
                <div className="empty-img-wrapper">
                  <Search size={64} strokeWidth={1} color="#d0d4dc" />
                </div>
                <h2 className="empty-title">Ничего не найдено</h2>
                <p className="empty-description">
                  Попробуйте изменить запрос или сбросить фильтры
                </p>
                <button
                  className="btn-to-catalog"
                  onClick={() => {
                    setActiveCategory(null);
                    setSearchQuery("");
                  }}
                  type="button"
                >
                  <span>Сбросить фильтры</span>
                  <X size={18} />
                </button>
              </div>
            ) : (
              /* Populated Favorites Grid */
              <div className="favorites-products-grid">
                {filteredProducts.map((p) => {
                  const displayPrice =
                    typeof p.price === "number"
                      ? `${p.price.toLocaleString("ru-RU")} ₸`
                      : p.price;
                  const displayOldPrice = p.oldPrice
                    ? typeof p.oldPrice === "number"
                      ? `${p.oldPrice.toLocaleString("ru-RU")} ₸`
                      : p.oldPrice
                    : null;
                  const displayImg =
                    p.image || p.img || "/assets/img/test_accessosry.png";

                  return (
                    <div key={p.id} className="product-card">
                      <div className="product-card-header">
                        <div className="badges-group">
                          {p.badgeFastDelivery && (
                            <span className="badge-hit">БЫСТРО</span>
                          )}
                          {p.discountPercent && (
                            <span className="badge-hit">
                              -{p.discountPercent}%
                            </span>
                          )}
                        </div>
                        <button
                          className="btn-fav active"
                          onClick={() => toggleWishlist(p.id)}
                          title="Удалить из избранного"
                        >
                          <Heart size={18} fill="#e63125" stroke="#e63125" />
                        </button>
                      </div>

                      <Link to={`/product/${p.id}`} className="product-img-box">
                        <img
                          src={displayImg}
                          alt={p.title}
                          className="product-img"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/assets/img/test_accessosry.png";
                          }}
                        />
                      </Link>

                      <div className="product-info-box">
                        <h3 className="product-title" title={p.title}>
                          <Link
                            to={`/product/${p.id}`}
                            style={{ textDecoration: "none", color: "inherit" }}
                          >
                            {p.title}
                          </Link>
                        </h3>
                        <p className="product-subtitle">
                          {p.subtitle || p.categoryName || "Автозапчасти"}
                        </p>

                        <div className="product-price-row">
                          <div className="price-wrapper">
                            <span className="price-main">{displayPrice}</span>
                            {displayOldPrice && (
                              <span className="price-old">
                                {displayOldPrice}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="product-actions-row">
                          <button
                            className="btn-add-cart"
                            onClick={() => addToCart && addToCart(p)}
                          >
                            <ShoppingCart size={16} />
                            <span>В корзину</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
