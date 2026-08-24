import React from "react";
import { Link } from "react-router-dom";
import { slugify } from "../../utils/slugify";
import "./PopularAccessories.css";

export const PopularAccessories = () => {
  const accessories = [
    { id: 1, title: "Защита картера", price: "От 12 000₸" },
    { id: 2, title: "Багажник и Боксы", price: "От 12 000₸" },
    { id: 3, title: "Мультимедиа", price: "От 12 000₸" },
    { id: 4, title: "Диски и шины", price: "От 12 000₸" },
    { id: 5, title: "Коврики и салон", price: "От 12 000₸" },
    { id: 6, title: "Видеорегистраторы", price: "От 12 000₸" },
    { id: 7, title: "Кузовная элементы", price: "От 12 000₸" },
    { id: 8, title: "Другое", price: "Более 10 000 деталей" },
  ];

  return (
    <section className="popular-accessories-section">
      <div className="popular-accessories-container">
        <div className="section-header">
          <h2 className="section-title">
            Популярные <span className="highlight-red">аксессуары</span> для
            авто
          </h2>
          <p className="section-subtitle">Для всех марок и моделей</p>
        </div>

        <div className="accessories-grid">
          {accessories.map((item) => (
            <Link
              key={item.id}
              to={`/catalog/all/all/${slugify(item.title)}`}
              className="accessory-card"
            >
              <div className="accessory-image-wrapper">
                <img
                  src="/assets/img/test_accessosry.png"
                  alt={item.title}
                  className="accessory-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/assets/img/hero-img.png";
                  }}
                />
              </div>
              <div className="accessory-info">
                <div className="accessory-title-row">
                  <span className="accessory-title">{item.title}</span>
                  <svg
                    className="arrow-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
                {item.id === 8 ? (
                  <span className="accessory-price">
                    Более 10 000 <span className="price-red">деталей</span>
                  </span>
                ) : (
                  <span className="accessory-price">{item.price}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
