import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, Copy, Truck, Image as ImageIcon, Star, Clock, Tag, ThumbsUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import './ProductDetailsPage.css';

export const ProductDetailsPage = () => {
  const { id } = useParams();
  const { products, addToCart, toggleWishlist, isInWishlist, showToast } = useApp();

  // Find product by URL parameter or default to demo product matching screenshot
  const product = products.find((p) => String(p.id) === String(id)) || {
    id: id || 'demo',
    title: 'Диски Trebl X40030_P 6,5x16 5x139,7 ET40 DIA98,6 silver',
    price: 12000,
    sku: 'SKU030',
    type: 'Диск',
    material: 'Метал',
    diameters: ['13', '14', '15', '16'],
    pcd: '5x114.3',
    et: '45',
    co: '67.1',
    color: 'Черный',
    season: 'Круглогодичный',
    description:
      'Ограниченная серия дисков Trebl X40030_P изготовлена из высокопрочного легкого сплава с усиленным защитным покрытием. Идеально подходит для работы в любых климатических условиях.'
  };

  const [activeTab, setActiveTab] = useState('specs'); // 'specs' | 'desc'
  const [selectedDiameter, setSelectedDiameter] = useState('15');
  const [qty, setQty] = useState(10);
  const [selectedThumb, setSelectedThumb] = useState(0);

  const isFav = isInWishlist(product.id);

  const handleCopySku = () => {
    navigator.clipboard.writeText(product.sku || 'SKU030');
    showToast('Артикул скопирован в буфер обмена!');
  };

  const thumbs = [0, 1, 2, 3, 4];

  return (
    <section className="product-details-page">
      <div className="product-bg-clouds" />

      <div className="product-container">
        <div className="product-card-wrapper">
          <div className="product-grid">
            {/* Left Column: Gallery */}
            <div className="product-gallery">
              <div className="main-image-box">
                <button
                  className="wishlist-icon-btn"
                  onClick={() => toggleWishlist(product.id)}
                  title="Добавить в избранное"
                  type="button"
                >
                  <Heart
                    size={20}
                    fill={isFav ? '#ea2427' : 'none'}
                    color={isFav ? '#ea2427' : '#555565'}
                  />
                </button>
                <ImageIcon size={96} strokeWidth={1} />
              </div>

              {/* Thumbnails Row */}
              <div className="thumbs-row">
                {thumbs.map((idx) => (
                  <div
                    key={idx}
                    className={`thumb-item ${selectedThumb === idx ? 'active' : ''}`}
                    onClick={() => setSelectedThumb(idx)}
                  >
                    <ImageIcon size={28} strokeWidth={1.2} />
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Information */}
            <div className="product-info-col">
              {/* Product Title */}
              <h1 className="product-details-title">{product.title}</h1>

              {/* Badges Bar */}
              <div className="badges-bar">
                <span className="badge-tag red">
                  <Clock size={12} />
                  <span>23:47:23 ДО КОНЦА АКЦИИ</span>
                </span>
                <span className="badge-tag blue">
                  <Truck size={12} />
                  <span>БЫСТРАЯ ДОСТАВКА</span>
                </span>
                <span className="badge-tag discount">
                  <Tag size={12} />
                  <span>СКИДКА -67%</span>
                </span>
                <span className="badge-tag purple">
                  <Star size={12} />
                  <span>ЛУЧШИЙ ВЫБОР</span>
                </span>
                <span className="badge-tag orange">
                  <ThumbsUp size={12} />
                  <span>ХОРОШАЯ ЦЕНА</span>
                </span>
              </div>

              {/* Tabs Header */}
              <div className="tabs-header">
                <button
                  className={`tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
                  onClick={() => setActiveTab('specs')}
                  type="button"
                >
                  Характеристики
                </button>
                <button
                  className={`tab-btn ${activeTab === 'desc' ? 'active' : ''}`}
                  onClick={() => setActiveTab('desc')}
                  type="button"
                >
                  Описание
                </button>
              </div>

              {/* Specs View */}
              {activeTab === 'specs' ? (
                <div className="specs-list-box">
                  <div className="spec-row-item">
                    <span className="spec-key">Артикул</span>
                    <div className="spec-dots-filler" />
                    <span className="spec-val">
                      {product.sku || 'SKU030'}
                      <Copy
                        size={14}
                        className="copy-sku-icon"
                        onClick={handleCopySku}
                        title="Скопировать артикул"
                      />
                    </span>
                  </div>

                  <div className="spec-row-item">
                    <span className="spec-key">Тип</span>
                    <div className="spec-dots-filler" />
                    <span className="spec-val">{product.type || 'Диск'}</span>
                  </div>

                  <div className="spec-row-item">
                    <span className="spec-key">Материал</span>
                    <div className="spec-dots-filler" />
                    <span className="spec-val">{product.material || 'Метал'}</span>
                  </div>

                  <div className="spec-row-item">
                    <span className="spec-key">Диаметр</span>
                    <div className="spec-dots-filler" />
                    <span className="spec-val">13. 14. 15. 16</span>
                  </div>

                  <div className="spec-row-item">
                    <span className="spec-key">PCD</span>
                    <div className="spec-dots-filler" />
                    <span className="spec-val">{product.pcd || '5x114.3'}</span>
                  </div>

                  <div className="spec-row-item">
                    <span className="spec-key">Вылет (ET)</span>
                    <div className="spec-dots-filler" />
                    <span className="spec-val">{product.et || '45'}</span>
                  </div>

                  <div className="spec-row-item">
                    <span className="spec-key">ЦО</span>
                    <div className="spec-dots-filler" />
                    <span className="spec-val">{product.co || '67.1'}</span>
                  </div>

                  <div className="spec-row-item">
                    <span className="spec-key">Цвет</span>
                    <div className="spec-dots-filler" />
                    <span className="spec-val">{product.color || 'Черный'}</span>
                  </div>

                  <div className="spec-row-item">
                    <span className="spec-key">Сезон</span>
                    <div className="spec-dots-filler" />
                    <span className="spec-val">{product.season || 'Круглогодичный'}</span>
                  </div>
                </div>
              ) : (
                /* Description View */
                <div className="description-text-box">
                  <p>{product.description}</p>
                </div>
              )}

              {/* Variant Selector (Диаметр) */}
              <div className="variant-selector-section">
                <span className="variant-label">Диаметр</span>
                <div className="variant-options-row">
                  {['13', '14', '15', '16'].map((d) => (
                    <button
                      key={d}
                      className={`variant-opt-btn ${selectedDiameter === d ? 'active' : ''}`}
                      onClick={() => setSelectedDiameter(d)}
                      type="button"
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions Area */}
              <div className="product-actions-area">
                <span className="product-details-price">
                  {product.price.toLocaleString('ru-RU')} ₸/шт
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
                    Доставка: <span className="dates">25-27 мая</span>
                  </span>
                </div>

                {/* Primary Add to Cart Button */}
                <button
                  className="btn-add-to-cart-lg"
                  onClick={() => addToCart(product, qty)}
                  type="button"
                >
                  В корзину
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
