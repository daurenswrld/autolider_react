import React from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Truck,
  Users,
  MapPin,
  Award,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Building2,
  Globe,
} from "lucide-react";
import "./AboutPage.css";

export const AboutPage = () => {
  const stats = [
    { value: "2022", label: "Год основания в Астане", icon: Building2 },
    { value: "30-40+", label: "Китайских поставщиков", icon: Globe },
    { value: "30-40+", label: "Филиалов по Казахстану", icon: MapPin },
    { value: "10 000+", label: "Довольных клиентов", icon: Users },
  ];

  const coreValues = [
    {
      icon: ShieldCheck,
      title: "Надежность и качество",
      description:
        "Строгий контроль каждой поставляемой детали и полная гарантия на все категории товаров.",
    },
    {
      icon: Truck,
      title: "Быстрая доставка",
      description:
        "Прямая логистика из Китая за 7–10 дней и доставка в любую точку Казахстана через филиальную сеть.",
    },
    {
      icon: Globe,
      title: "Прямые поставки",
      description:
        "Работаем без посредников напрямую с лучшими заводами-изготовителями автозапчастей.",
    },
    {
      icon: Award,
      title: "Доступные цены",
      description:
        "За счет прямого импорта мы предлагаем цены ниже среднерыночных на 15-25%.",
    },
  ];

  const brandLogos = [
    { name: "HAVAL", logo: "/assets/img/haval.png" },
    { name: "CHERY", logo: "/assets/img/chery.png" },
    { name: "JAC", logo: "/assets/img/jac.png" },
    { name: "CHANGAN", logo: "/assets/img/changan.png" },
    { name: "BYD", logo: "/assets/img/byd.png" },
    { name: "MERCEDES", logo: "/assets/img/mercedes.png" },
  ];

  return (
    <div className="about-page">
      {/* Hero Header Section */}
      <section className="about-hero-section">
        <div className="about-hero-overlay" />
        <div className="about-container">
          {/* Breadcrumbs */}
          <nav className="about-breadcrumbs">
            <Link to="/">Главная</Link>
            <ChevronRight size={14} className="breadcrumb-separator" />
            <span className="current">О компании</span>
          </nav>

          <h1 className="about-hero-title">
            История <span className="highlight-red">AUTOlider</span>
          </h1>

          <p className="about-hero-lead">
            Надежный поставщик оригинальных запчастей и высококачественных
            комплектующих для легковых и коммерческих автомобилей по всему
            Казахстану.
          </p>
        </div>
      </section>

      {/* Metrics Bar */}
      <section className="about-stats-section">
        <div className="about-container">
          <div className="stats-grid">
            {stats.map((stat, idx) => {
              const IconComp = stat.icon;
              return (
                <div key={idx} className="stat-card">
                  <div className="stat-icon-wrapper">
                    <IconComp size={24} />
                  </div>
                  <div className="stat-value-group">
                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-label">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Story Content Section */}
      <section className="about-story-section">
        <div className="about-container">
          <div className="story-grid">
            {/* Left Narrative Column */}
            <div className="story-content-col">
              <div className="section-label">О КОМПАНИИ</div>
              <h2 className="story-heading">
                Развиваем автомобильную инфраструктуру Казахстана с 2022 года
              </h2>

              <div className="story-paragraph-wrapper">
                <p className="story-paragraph">
                  <strong>AUTOlider</strong> – интернет-магазин автозапчастей,
                  который был основан в 2022 году в столице Казахстана, Астане.
                  За короткий срок нам удалось зарекомендовать себя как
                  надежного поставщика автозапчастей для легковых и коммерческих
                  автомобилей.
                </p>

                <div className="story-quote-card">
                  <div className="quote-accent-bar" />
                  <p className="quote-text">
                    «Наша главная цель – предоставить клиентам самый широкий
                    ассортимент качественных деталей по доступным честным ценам
                    и с гарантированно быстрой доставкой в любой город.»
                  </p>
                </div>

                <p className="story-paragraph">
                  С момента открытия мы активно развивались, постоянно расширяя
                  номенклатуру запчастей и совершенствуя наш сервис. Благодаря
                  прямой интеграции и сотрудничеству с более чем{" "}
                  <strong>30-40 проверенными китайскими поставщиками</strong>, а
                  также разветвленной сети из{" "}
                  <strong>30-40 филиалов по всему Казахстану</strong>, мы
                  обеспечиваем оперативное выполнение заказов в любом уголке
                  страны.
                </p>

                <p className="story-paragraph">
                  За два года успешной работы мы обслужили{" "}
                  <strong>тысячи довольных клиентов</strong> и продолжаем
                  ежедневную работу над улучшением сервиса, чтобы каждый
                  автолюбитель и владелец бизнеса мог получить необходимые
                  автозапчасти с минимальными затратами времени и средств.
                </p>
              </div>

              {/* Highlights checkmarks */}
              <div className="story-checks-grid">
                <div className="check-item">
                  <CheckCircle2 size={18} className="check-icon" />
                  <span>Прямой импорт без посредников</span>
                </div>
                <div className="check-item">
                  <CheckCircle2 size={18} className="check-icon" />
                  <span>30-40 филиалов по всему Казахстану</span>
                </div>
                <div className="check-item">
                  <CheckCircle2 size={18} className="check-icon" />
                  <span>Подбор по VIN за 5 минут</span>
                </div>
                <div className="check-item">
                  <CheckCircle2 size={18} className="check-icon" />
                  <span>Гарантия на каждую деталь</span>
                </div>
              </div>
            </div>

            {/* Right Visual Image Card */}
            <div className="story-visual-col">
              <div className="story-image-card">
                <img
                  src="/assets/img/hero_img.webp"
                  alt="AUTOlider автозапчасти"
                  className="story-main-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/assets/img/hero-img.webp";
                  }}
                />
                <div className="image-card-overlay">
                  <div className="experience-badge">
                    <span className="exp-years">30+</span>
                    <span className="exp-text">
                      Китайских заводов-партнеров
                    </span>
                  </div>
                </div>
              </div>

              {/* Direct Service Info Banner */}
              <div className="story-info-banner">
                <Building2 size={32} className="info-banner-icon" />
                <div>
                  <div className="info-banner-title">
                    Центральный офис в Астане
                  </div>
                  <div className="info-banner-sub">
                    ул. Автозаводская 12, Бизнес-Центр Autolider
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="about-values-section">
        <div className="about-container">
          <div className="section-header-center">
            <div className="section-label">ПОЧЕМУ ВЫБИРАЮТ НАС</div>
            <h2 className="section-title-dark">
              Наши ключевые <span className="highlight-red">преимущества</span>
            </h2>
            <p className="section-desc">
              Мы строим прозрачный и понятный сервис автозапчастей нового
              поколения
            </p>
          </div>

          <div className="values-grid">
            {coreValues.map((val, idx) => {
              const IconComponent = val.icon;
              return (
                <div key={idx} className="value-card">
                  <div className="value-icon-box">
                    <IconComponent size={28} />
                  </div>
                  <h3 className="value-title">{val.title}</h3>
                  <p className="value-desc">{val.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Brand Partners Showcase */}
      <section className="about-brands-section">
        <div className="about-container">
          <div className="section-header-center">
            <div className="section-label">ПОСТАВКИ И ПАРТНЕРЫ</div>
            <h2 className="section-title-dark">
              Работаем с ключевыми автобрендами
            </h2>
          </div>

          <div className="brands-showcase-grid">
            {brandLogos.map((b, idx) => (
              <div key={idx} className="brand-logo-card">
                <img src={b.logo} alt={b.name} className="brand-img" />
                <span className="brand-name">{b.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="about-cta-section">
        <div className="about-container">
          <div className="cta-banner-card">
            <div className="cta-content">
              <h2 className="cta-title">
                Нужна помощь в подборе автозапчастей?
              </h2>
              <p className="cta-subtitle">
                Наши специалисты проконсультируют вас и помогут подобрать любые
                нужные детали за 5 минут.
              </p>
            </div>
            <div className="cta-actions">
              <Link to="/catalog" className="btn-cta-red">
                ПЕРЕЙТИ В КАТАЛОГ <ArrowRight size={18} />
              </Link>
              <a href="tel:+77775554554" className="btn-cta-outline">
                СВЯЗАТЬСЯ С НАМИ
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
