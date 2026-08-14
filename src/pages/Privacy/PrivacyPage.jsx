import React from "react";
import {
  ShieldCheck,
  Calendar,
  Lock,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import "./PrivacyPage.css";

export const PrivacyPage = () => {
  const sections = [
    { id: "sec-1", title: "1. Общие положения" },
    { id: "sec-2", title: "2. Категории собираемых данных" },
    { id: "sec-3", title: "3. Цели обработки персональных данных" },
    { id: "sec-4", title: "4. Передача данных третьим лицам" },
    { id: "sec-5", title: "5. Защита и хранение персональных данных" },
    { id: "sec-6", title: "6. Права пользователей (Закон РК № 94-V)" },
    { id: "sec-7", title: "7. Использование файлов Cookie" },
    { id: "sec-8", title: "8. Контакты и обратная связь" },
  ];

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="privacy-page-section">
      <div className="privacy-container">
        {/* Header Hero Card */}
        <div className="privacy-header-card">
          <h1 className="privacy-main-title">Политика конфиденциальности</h1>

          <p className="privacy-subtitle">
            Настоящая Политика конфиденциальности определяет порядок сбора,
            обработки, хранения и защиты персональной информации пользователей
            маркетплейса Autolider в соответствии с Законом Республики Казахстан
            от 21 мая 2013 года № 94-V «О персональных данных и их защите».
          </p>

          <div className="privacy-meta-row">
            <div className="privacy-meta-item">
              <Calendar size={15} />
              <span>Обновлено: 14 августа 2026 г.</span>
            </div>
            <div className="privacy-meta-item">
              <Lock size={15} />
              <span>Шифрование данных по стандарту SSL (TLS 1.3)</span>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="privacy-layout-grid">
          {/* Quick Table of Contents */}
          <aside className="privacy-toc-box">
            <h4 className="toc-title">Содержание документа</h4>
            <ul className="toc-list">
              {sections.map((sec) => (
                <li key={sec.id}>
                  <a
                    href={`#${sec.id}`}
                    className="toc-link"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(sec.id);
                    }}
                  >
                    {sec.title}
                  </a>
                </li>
              ))}
            </ul>
          </aside>

          {/* Policy Text Body */}
          <main className="privacy-content-card">
            {/* Section 1 */}
            <article id="sec-1" className="policy-section">
              <h2 className="policy-sec-title">
                <span className="sec-num">1.</span> Общие положения
              </h2>
              <p className="policy-text">
                1.1. Настоящая Политика конфиденциальности (далее — «Политика»)
                действует в отношении всей информации, которую интернет-магазин{" "}
                <strong>Autolider</strong> (далее — «Оператор»), расположенный
                на доменном имени <strong>autolider.com.kz</strong>, может
                получить о Пользователе во время использования сайта, программ и
                продуктов.
              </p>
              <p className="policy-text">
                1.2. Использование сервисов сайта означает безоговорочное
                согласие Пользователя с настоящей Политикой и указанными в ней
                условиями обработки его персональной информации. В случае
                несогласия с этими условиями Пользователь должен воздержаться от
                использования сервисов.
              </p>
            </article>

            {/* Section 2 */}
            <article id="sec-2" className="policy-section">
              <h2 className="policy-sec-title">
                <span className="sec-num">2.</span> Категории собираемых данных
              </h2>
              <p className="policy-text">
                Для оформления заказов, оказания услуг и повышения качества
                обслуживания Оператор собирает следующие персональные данные:
              </p>
              <ul className="policy-ul">
                <li>Фамилия, имя, отчество Пользователя;</li>
                <li>Контактный номер телефона (с подтверждением по SMS);</li>
                <li>Адрес электронной почты (E-mail);</li>
                <li>Адрес доставки товаров (город, улица, дом, квартира);</li>
                <li>
                  Марка, модель, год выпуска и VIN-код транспортного средства
                  (при поиске автозапчастей);
                </li>
                <li>История заказов, транзакций и бонусного баланса.</li>
              </ul>
            </article>

            {/* Section 3 */}
            <article id="sec-3" className="policy-section">
              <h2 className="policy-sec-title">
                <span className="sec-num">3.</span> Цели обработки персональных
                данных
              </h2>
              <p className="policy-text">
                Персональные данные Пользователя Оператор может использовать в
                следующих целях:
              </p>
              <ul className="policy-ul">
                <li>
                  Идентификация Пользователя, зарегистрированного на сайте, для
                  оформления заказа и заключения договора купли-продажи;
                </li>
                <li>
                  Организация доставки курьерскими службами или в пункты
                  самовывоза;
                </li>
                <li>
                  Начисление и списание бонусов в программе лояльности
                  Autolider;
                </li>
                <li>
                  Предоставление Пользователю эффективной клиентской и
                  технической поддержки;
                </li>
                <li>
                  Уведомление Пользователя о статусе заказа, акциях и
                  специальных предложениях (с согласия Пользователя).
                </li>
              </ul>
              <div className="policy-callout-box">
                Мы никогда не продаем и не передаем ваши личные данные
                маркетинговым агентствам для спам-рассылок.
              </div>
            </article>

            {/* Section 4 */}
            <article id="sec-4" className="policy-section">
              <h2 className="policy-sec-title">
                <span className="sec-num">4.</span> Передача данных третьим
                лицам
              </h2>
              <p className="policy-text">
                4.1. Оператор вправе передать персональную информацию
                Пользователя третьим лицам только в следующих случаях:
              </p>
              <ul className="policy-ul">
                <li>
                  Курьерским и транспортным компаниям (например, СДЭК, Kazpost)
                  исключительно для целей доставки заказа;
                </li>
                <li>
                  Платежным организациям (Kaspi Pay, Halyk Bank) для безопасного
                  проведения эквайринга и транзакций;
                </li>
                <li>
                  По уполномоченному запросу государственных органов Республики
                  Казахстан в порядке, установленном законодательством РК.
                </li>
              </ul>
            </article>

            {/* Section 5 */}
            <article id="sec-5" className="policy-section">
              <h2 className="policy-sec-title">
                <span className="sec-num">5.</span> Защита и хранение
                персональных данных
              </h2>
              <p className="policy-text">
                5.1. Оператор принимает необходимые организационные и
                технические меры для защиты персональной информации Пользователя
                от неправомерного или случайного доступа, уничтожения,
                изменения, блокирования, копирования, распространения.
              </p>
              <p className="policy-text">
                5.2. Все веб-соединения и передача данных защищены надежным
                SSL-шифрованием TLS 1.3. Сервера хранения баз данных расположены
                в защищенных дата-центрах на территории Республики Казахстан.
              </p>
            </article>

            {/* Section 6 */}
            <article id="sec-6" className="policy-section">
              <h2 className="policy-sec-title">
                <span className="sec-num">6.</span> Права пользователей (Закон
                РК № 94-V)
              </h2>
              <p className="policy-text">
                В соответствии с Законом РК «О персональных данных и их защите»,
                Пользователь имеет право:
              </p>
              <ul className="policy-ul">
                <li>
                  Запрашивать подтверждение факта обработки его персональных
                  данных;
                </li>
                <li>
                  Требовать уточнения, блокирования или уничтожения своих
                  персональных данных;
                </li>
                <li>
                  Отозвать согласие на обработку персональных данных, направив
                  официальный запрос Оператору.
                </li>
              </ul>
            </article>

            {/* Section 7 */}
            <article id="sec-7" className="policy-section">
              <h2 className="policy-sec-title">
                <span className="sec-num">7.</span> Использование файлов Cookie
              </h2>
              <p className="policy-text">
                Сайт использует файлы Cookie для сохранения сессии авторизации,
                содержимого корзины и языковых настроек. Пользователь может
                отключить сохранение Cookie в настройках своего браузера, однако
                это может ограничить доступ к некоторым функциям сайта.
              </p>
            </article>

            {/* Section 8 */}
            <article id="sec-8" className="policy-section">
              <h2 className="policy-sec-title">
                <span className="sec-num">8.</span> Контакты и обратная связь
              </h2>
              <p className="policy-text">
                По любым вопросам, касающимся обработки и защиты персональных
                данных, вы можете обратиться в службу безопасности данных
                Autolider:
              </p>

              <div className="privacy-contact-card">
                <h3 className="contact-card-title">
                  Служба защиты информации Autolider
                </h3>
                <div className="contact-info-grid">
                  <div className="contact-item-box">
                    <Mail size={18} />
                    <span>privacy@autolider.kz</span>
                  </div>
                  <div className="contact-item-box">
                    <Phone size={18} />
                    <span>+7 (777) 555-45-54</span>
                  </div>
                  <div className="contact-item-box">
                    <MapPin size={18} />
                    <span>г. Астана, ул. Автозаводская, 12</span>
                  </div>
                </div>
              </div>
            </article>
          </main>
        </div>
      </div>
    </section>
  );
};
