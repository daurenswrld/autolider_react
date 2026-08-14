import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, QrCode, Building, Receipt, ShieldCheck, CheckCircle2, ChevronRight, FileText, Lock, RefreshCw, ArrowRight } from 'lucide-react';
import './PaymentPage.css';

export const PaymentPage = () => {
  const paymentMethods = [
    {
      icon: QrCode,
      badge: 'Самый популярный',
      title: 'Kaspi QR / Kaspi Red / Kaspi Рассрочка',
      desc: 'Быстрая оплата сканированием QR через приложение Kaspi.kz. Доступна рассрочка 0-0-12 и беспроцентный кредит.',
      tags: ['Kaspi.kz', 'Kaspi Red 0%', 'Рассрочка 0-0-12']
    },
    {
      icon: CreditCard,
      badge: 'Онлайн 24/7',
      title: 'Банковские карты (Visa, MasterCard, Halyk, Jusan)',
      desc: 'Мгновенная безналичная оплата картами любого банка Казахстана через шифрованный протокол 3D-Secure / PCI DSS.',
      tags: ['Visa', 'MasterCard', 'Apple Pay', 'Google Pay']
    },
    {
      icon: Building,
      badge: 'Для ТОО и ИП',
      title: 'Безналичный расчет с НДС / ЭСФ',
      desc: 'Выставление электронного счета на оплату для юридических лиц ТОО и ИП. Предоставление ЭСФ через ИС ЭСФ и накладных З-2.',
      tags: ['Счет на оплату', 'ЭСФ', 'Накладные З-2', 'НДС 12%']
    },
    {
      icon: Receipt,
      badge: 'При получении',
      title: 'Оплата при получении (Наложенный платеж)',
      desc: 'Оплата наличными или картой курьеру либо в пункте выдачи с обязательной выдачей фискального чека ККМ.',
      tags: ['Фискальный чек', 'Наличные', 'POS-терминал']
    }
  ];

  const rkLegalGuarantees = [
    {
      title: 'Возврат средств в течение 14 дней',
      desc: 'Согласно ст. 30 Закона РК «О защите прав потребителей», вы имеете право вернуть или обменять деталь надлежащего качества в течение 14 календарных дней.'
    },
    {
      title: 'Электронные счета-фактуры (ИС ЭСФ РК)',
      desc: 'Для бухгалтерской отчетности юрлиц в Казахстане документы выставляются через государственную систему ИС ЭСФ в строгом соответствии с Приказом Минфина РК № 562.'
    },
    {
      title: '100% Защита транзакций и фискальный чек',
      desc: 'Каждый платеж фиксируется ККМ с выдачей чека Налогового комитета РК. Все данные защищены 256-битным SSL-шифрованием.'
    }
  ];

  return (
    <div className="payment-page">
      {/* Hero Section */}
      <section className="payment-hero-section">
        <div className="payment-hero-overlay" />
        <div className="payment-container">
          <nav className="payment-breadcrumbs">
            <Link to="/">Главная</Link>
            <ChevronRight size={14} className="breadcrumb-separator" />
            <span className="current">Оплата</span>
          </nav>

          <h1 className="payment-hero-title">
            Способы оплаты и <span className="highlight-red">гарантии</span>
          </h1>
          <p className="payment-hero-subtitle">
            Удобные и безопасные варианты расчетов для физлиц, ТОО и ИП по стандартам и законам РК
          </p>
        </div>
      </section>

      {/* Payment Methods Grid */}
      <section className="payment-methods-section">
        <div className="payment-container">
          <div className="section-header-left">
            <div className="section-label">СПОСОБЫ РАСЧЕТА</div>
            <h2 className="section-title-dark">Выберите удобный способ оплаты</h2>
          </div>

          <div className="payment-grid">
            {paymentMethods.map((pm, idx) => {
              const IconComp = pm.icon;
              return (
                <div key={idx} className="pay-card">
                  <div className="pay-card-top">
                    <div className="pay-icon-box">
                      <IconComp size={26} />
                    </div>
                    <span className="pay-badge">{pm.badge}</span>
                  </div>
                  <h3 className="pay-title">{pm.title}</h3>
                  <p className="pay-desc">{pm.desc}</p>
                  <div className="pay-tags">
                    {pm.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="pay-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* RK Regulations Section */}
      <section className="payment-rk-section">
        <div className="payment-container">
          <div className="rk-pay-card">
            <div className="rk-pay-header">
              <ShieldCheck size={30} className="rk-pay-icon" />
              <div>
                <h2 className="rk-pay-title">Законодательные гарантии РК и безопасность</h2>
                <p className="rk-pay-sub">Полное соответствие законодательству и налоговому кодексу Республики Казахстан</p>
              </div>
            </div>

            <div className="rk-pay-grid">
              {rkLegalGuarantees.map((g, idx) => (
                <div key={idx} className="rk-pay-item">
                  <CheckCircle2 size={20} className="pay-check-icon" />
                  <div>
                    <h4 className="g-title">{g.title}</h4>
                    <p className="g-desc">{g.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Refund Process Steps */}
      <section className="refund-section">
        <div className="payment-container">
          <div className="section-header-left">
            <div className="section-label">ПОРЯДОК ВОЗВРАТА</div>
            <h2 className="section-title-dark">Как вернуть или обменять деталь?</h2>
          </div>

          <div className="refund-steps-grid">
            <div className="step-card">
              <div className="step-num">01</div>
              <h4 className="step-title">Заявка на возврат</h4>
              <p className="step-desc">Подайте заявку в личном кабинете или по телефону +7 (747) 420-58-98 в течение 14 дней.</p>
            </div>
            <div className="step-card">
              <div className="step-num">02</div>
              <h4 className="step-title">Передача детали</h4>
              <p className="step-desc">Принесите запчасть в любой из 30+ филиалов или отправьте курьером/ТК.</p>
            </div>
            <div className="step-card">
              <div className="step-num">03</div>
              <h4 className="step-title">Мгновенный возврат денег</h4>
              <p className="step-desc">Деньги возвращаются на вашу карту или Kaspi account за 1-3 рабочих дня.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="payment-cta-section">
        <div className="payment-container">
          <div className="payment-cta-banner">
            <div>
              <h3 className="cta-banner-title">Нужен счет на оплату для ТОО / ИП?</h3>
              <p className="cta-banner-sub">Отправьте реквизиты, и мы выставим счет с НДС за 5 минут</p>
            </div>
            <Link to="/contacts" className="btn-cta-payment">
              ПОЛУЧИТЬ СЧЕТ <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
