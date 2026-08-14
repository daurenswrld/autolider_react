import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Copy,
  Check,
  ChevronRight,
  Building,
  CreditCard,
  Send,
  MessageSquare,
} from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "./ContactsPage.css";

export const ContactsPage = () => {
  const [copiedField, setCopiedField] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    message: "",
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({ name: "", phone: "", message: "" });
    }, 4000);
  };

  const sliderImages = [
    {
      url: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=1200&auto=format&fit=crop&q=80",
      title: "Шоурум и отдел продаж AutoLider в Астане",
      subtitle: "г. Астана, ул. А108, дом 20, офис 144",
    },
    {
      url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&auto=format&fit=crop&q=80",
      title: "Центральный склад автозапчастей",
      subtitle: "Более 10 000 оригинальных наименований в наличии",
    },
    {
      url: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=1200&auto=format&fit=crop&q=80",
      title: "Логистический хаб прямого импорта из Китая",
      subtitle: "Прямые поставки автозапчастей за 7-10 дней",
    },
  ];

  return (
    <div className="contacts-page">
      {/* Hero Header Section */}
      <section className="contacts-hero-section">
        <div className="contacts-hero-overlay" />
        <div className="contacts-container">
          {/* Breadcrumbs */}
          <nav className="contacts-breadcrumbs">
            <Link to="/">Главная</Link>
            <ChevronRight size={14} className="breadcrumb-separator" />
            <span className="current">Контакты</span>
          </nav>

          <h1 className="contacts-hero-title">
            Контакты <span className="highlight-red">AutoLider</span>
          </h1>
          <p className="contacts-hero-subtitle">
            Официальный отдел продаж, контакты филиалов и банковские реквизиты
            компании
          </p>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="contacts-main-section">
        <div className="contacts-container">
          <div className="contacts-grid">
            {/* Left Column: Quick Contact Cards */}
            <div className="contacts-info-column">
              <div className="section-label">СВЯЗАТЬСЯ С НАМИ</div>
              <h2 className="section-heading">Отдел продаж и поддержка</h2>

              <div className="info-cards-list">
                {/* Phone Card 1 */}
                <div className="info-card">
                  <div className="card-icon-box">
                    <Phone size={22} />
                  </div>
                  <div className="card-content">
                    <span className="card-label">Телефон отдела продаж</span>
                    <a href="tel:+77474205898" className="card-value link">
                      +7 (747) 420-58-98
                    </a>
                  </div>
                </div>

                {/* Phone Card 2 */}
                <div className="info-card">
                  <div className="card-icon-box">
                    <Phone size={22} />
                  </div>
                  <div className="card-content">
                    <span className="card-label">Горячая линия / Контакты</span>
                    <a href="tel:+77764379411" className="card-value link">
                      +7 (776) 437-94-11
                    </a>
                  </div>
                </div>

                {/* Email Card */}
                <div className="info-card">
                  <div className="card-icon-box">
                    <Mail size={22} />
                  </div>
                  <div className="card-content">
                    <span className="card-label">Электронная почта</span>
                    <a
                      href="mailto:info@autolider.com.kz"
                      className="card-value link"
                    >
                      info@autolider.com.kz
                    </a>
                  </div>
                </div>

                {/* Address Card */}
                <div className="info-card">
                  <div className="card-icon-box">
                    <MapPin size={22} />
                  </div>
                  <div className="card-content">
                    <span className="card-label">Адрес AutoLider в Астане</span>
                    <span className="card-value">
                      г. Астана (Нур-Султан), улица А108, дом 20, кв/офис 144
                    </span>
                  </div>
                </div>

                {/* Working Hours Card */}
                <div className="info-card">
                  <div className="card-icon-box">
                    <Clock size={22} />
                  </div>
                  <div className="card-content">
                    <span className="card-label">Время работы</span>
                    <span className="card-value">
                      Пн - Сб: 09:00 – 19:00 | Вс: 10:00 – 17:00
                    </span>
                  </div>
                </div>
              </div>

              {/* WhatsApp Quick Connect */}
              <div className="whatsapp-banner">
                <div className="wa-text-group">
                  <MessageSquare size={26} className="wa-icon" />
                  <div>
                    <div className="wa-title">Быстрый ответ в WhatsApp</div>
                    <div className="wa-desc">
                      Консультация и помощь в подборе запчастей
                    </div>
                  </div>
                </div>
                <a
                  href="https://wa.me/77474205898"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-wa"
                >
                  Написать в WhatsApp
                </a>
              </div>
            </div>

            {/* Right Column: Legal Requisites Card */}
            <div className="contacts-requisites-column">
              <div className="section-label">ЮРИДИЧЕСКАЯ ИНФОРМАЦИЯ</div>
              <h2 className="section-heading">Реквизиты ТОО AUTOLIDER TRADE</h2>

              <div className="requisites-card">
                <div className="requisites-header">
                  <Building size={24} className="req-header-icon" />
                  <div>
                    <h3 className="req-company-title">ТОО "AUTOLIDER TRADE"</h3>
                    <span className="req-company-subtitle">
                      Официальный зарегистрированный дистрибьютор
                    </span>
                  </div>
                </div>

                <div className="requisites-list">
                  {/* Item: BIN */}
                  <div className="req-item">
                    <div className="req-text-group">
                      <span className="req-label">БИН / ИИН:</span>
                      <span className="req-value">220940010064</span>
                    </div>
                    <button
                      type="button"
                      className="btn-copy"
                      onClick={() => copyToClipboard("220940010064", "bin")}
                      title="Копировать БИН"
                    >
                      {copiedField === "bin" ? (
                        <Check size={16} className="copied" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>

                  {/* Item: Bank Name */}
                  <div className="req-item">
                    <div className="req-text-group">
                      <span className="req-label">Банк:</span>
                      <span className="req-value">АО "KASPI BANK"</span>
                    </div>
                  </div>

                  {/* Item: BIC */}
                  <div className="req-item">
                    <div className="req-text-group">
                      <span className="req-label">БИК:</span>
                      <span className="req-value">CASPKZKA</span>
                    </div>
                    <button
                      type="button"
                      className="btn-copy"
                      onClick={() => copyToClipboard("CASPKZKA", "bik")}
                      title="Копировать БИК"
                    >
                      {copiedField === "bik" ? (
                        <Check size={16} className="copied" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>

                  {/* Item: IBAN Account */}
                  <div className="req-item">
                    <div className="req-text-group">
                      <span className="req-label">Расчетный счет:</span>
                      <span className="req-value font-mono">
                        KZ12722S000018385006
                      </span>
                    </div>
                    <button
                      type="button"
                      className="btn-copy"
                      onClick={() =>
                        copyToClipboard("KZ12722S000018385006", "iban")
                      }
                      title="Копировать счет"
                    >
                      {copiedField === "iban" ? (
                        <Check size={16} className="copied" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>

                  {/* Item: Legal Address */}
                  <div className="req-item address-item">
                    <div className="req-text-group">
                      <span className="req-label">Юридический адрес:</span>
                      <span className="req-value">
                        НУР-СУЛТАН, УЛИЦА А108, ДОМ 20, КВ/ОФИС 144
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
