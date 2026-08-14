import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, MapPin, PackageCheck, Clock, ShieldCheck, FileText, ChevronRight, CheckCircle2, ArrowRight } from 'lucide-react';
import './DeliveryPage.css';

export const DeliveryPage = () => {
  const deliveryMethods = [
    {
      icon: Truck,
      badge: 'Экспресс',
      title: 'Курьерская доставка по Астане и Алматы',
      time: 'В день заказа или на 2-й день',
      price: 'Бесплатно от 25 000 ₸',
      desc: 'До двери курьером AutoLider. Возможен осмотр товара до оплаты.'
    },
    {
      icon: MapPin,
      badge: '30+ Сеть РК',
      title: 'Самовывоз из филиалов по Казахстану',
      time: '1–3 дня со склада',
      price: 'Бесплатно',
      desc: 'Заберите заказ в любом из 30+ фирменных пунктов выдачи AutoLider.'
    },
    {
      icon: PackageCheck,
      badge: 'По всей РК',
      title: 'Транспортные компании (CDEK, KazPost, Alem TAT)',
      time: '2–5 рабочих дней',
      price: 'По тарифам ТК',
      desc: 'Быстрая доставка до двери или склада ТК в любой город и поселок РК.'
    },
    {
      icon: Clock,
      badge: 'Прямой импорт',
      title: 'Прямая экспресс-доставка из Китая',
      time: '7–10 дней',
      price: 'Рассчитывается индивидуально',
      desc: 'Прямая поставка с заводов КНР с полной таможенной очисткой ТК ЕАЭС.'
    }
  ];

  const rkRules = [
    {
      title: 'Статья 30 Закона РК «О защите прав потребителей»',
      desc: 'Вы имеете право осмотреть целостность упаковки и совпадение артикула запчасти в присутствии курьера до подписания акта.'
    },
    {
      title: 'Правила электронной торговли Республики Казахстан',
      desc: 'Каждая отправка сопровождается электронным трекинг-кодом и фискальным чеком, подтверждающим факт покупки.'
    },
    {
      title: 'Безопасная упаковка по ГОСТ и стандартам',
      desc: 'Все хрупкие детали (оптика, кузовные элементы, мультимедиа) упаковываются в обрешетку и воздушно-пузырьковую пленку.'
    }
  ];

  return (
    <div className="delivery-page">
      {/* Hero Section */}
      <section className="delivery-hero-section">
        <div className="delivery-hero-overlay" />
        <div className="delivery-container">
          <nav className="delivery-breadcrumbs">
            <Link to="/">Главная</Link>
            <ChevronRight size={14} className="breadcrumb-separator" />
            <span className="current">Доставка</span>
          </nav>

          <h1 className="delivery-hero-title">
            Доставка автозапчастей по <span className="highlight-red">Казахстану</span>
          </h1>
          <p className="delivery-hero-subtitle">
            Оперативная логистика в 30+ городов РК и прямые экспресс-поставки из Китая за 7-10 дней
          </p>
        </div>
      </section>

      {/* Delivery Methods Grid */}
      <section className="delivery-methods-section">
        <div className="delivery-container">
          <div className="section-header-left">
            <div className="section-label">СПОСОБЫ ДОСТАВКИ</div>
            <h2 className="section-title-dark">Удобные варианты получения</h2>
          </div>

          <div className="methods-grid">
            {deliveryMethods.map((m, idx) => {
              const IconComp = m.icon;
              return (
                <div key={idx} className="method-card">
                  <div className="method-top">
                    <div className="method-icon-box">
                      <IconComp size={24} />
                    </div>
                    <span className="method-badge">{m.badge}</span>
                  </div>
                  <h3 className="method-title">{m.title}</h3>
                  <div className="method-meta">
                    <span className="meta-time">⏱ {m.time}</span>
                    <span className="meta-price">₸ {m.price}</span>
                  </div>
                  <p className="method-desc">{m.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Kazakhstan RK Regulations Section */}
      <section className="delivery-rk-section">
        <div className="delivery-container">
          <div className="rk-card">
            <div className="rk-header">
              <ShieldCheck size={28} className="rk-icon" />
              <div>
                <h2 className="rk-title">Гарантии согласно законодательству РК</h2>
                <p className="rk-sub">Доставка осуществляется в полном соответствии с законами Республики Казахстан</p>
              </div>
            </div>

            <div className="rk-grid">
              {rkRules.map((rule, idx) => (
                <div key={idx} className="rk-rule-item">
                  <CheckCircle2 size={20} className="rule-check-icon" />
                  <div>
                    <h4 className="rule-title">{rule.title}</h4>
                    <p className="rule-desc">{rule.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="delivery-cta-section">
        <div className="delivery-container">
          <div className="delivery-cta-banner">
            <div>
              <h3 className="cta-banner-title">Остались вопросы по доставке?</h3>
              <p className="cta-banner-sub">Менеджер рассчитает точные сроки и стоимость доставки до вашего города</p>
            </div>
            <Link to="/contacts" className="btn-cta-delivery">
              СВЯЗАТЬСЯ С МЕНЕДЖЕРОМ <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
