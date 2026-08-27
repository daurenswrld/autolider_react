import React, { useEffect } from "react";
import { FileText, Calendar } from "lucide-react";
import { updateSEO } from "../../utils/seo";
import "../Privacy/PrivacyPage.css";

export const OfferPage = () => {
  useEffect(() => {
    updateSEO({
      title: "Договор оферты — AUTOlider Trade",
      description:
        "Договор оферты на оказание услуг и продажу автозапчастей через интернет-магазин AUTOlider Trade.",
    });
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    { id: "sec-1", title: "1. Общие положения" },
    { id: "sec-2", title: "2. Предмет договора" },
    { id: "sec-3", title: "3. Порядок оформления и выполнения заказа" },
    { id: "sec-4", title: "4. Цена товара и порядок оплаты" },
    { id: "sec-5", title: "5. Доставка и передача товара" },
    { id: "sec-6", title: "6. Возврат и обмен товара" },
    { id: "sec-7", title: "7. Ответственность сторон" },
    { id: "sec-8", title: "8. Заключительные положения" },
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
          <h1 className="privacy-main-title">Договор оферты</h1>

          <p className="privacy-subtitle">
            Договор оферты на оказание услуг интернет-магазина AUTOlider Trade
          </p>

          <div className="privacy-meta-row">
            <div className="privacy-meta-item">
              <Calendar size={15} />
              <span>Действующая редакция</span>
            </div>
            <div className="privacy-meta-item">
              <FileText size={15} />
              <span>Официальный публичный договор</span>
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

          {/* Offer Text Body */}
          <main className="privacy-content-card">
            {/* Section 1 */}
            <article id="sec-1" className="policy-section">
              <h2 className="policy-sec-title">
                <span className="sec-num">1.</span> Общие положения
              </h2>
              <p className="policy-text">
                1.1. Настоящий договор является официальным предложением (офертой)
                интернет-магазина <strong>AUTOlider Trade</strong>, далее именуемого
                «Продавец», и содержит все существенные условия по оказанию услуг и
                продаже автозапчастей через интернет-магазин на сайте{" "}
                <a
                  href="https://autolider.com.kz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#ea2427", textDecoration: "none" }}
                >
                  https://autolider.com.kz/
                </a>
                .
              </p>
              <p className="policy-text">
                1.2. Акцептом настоящей оферты является осуществление Покупателем
                заказа на сайте.
              </p>
            </article>

            {/* Section 2 */}
            <article id="sec-2" className="policy-section">
              <h2 className="policy-sec-title">
                <span className="sec-num">2.</span> Предмет договора
              </h2>
              <p className="policy-text">
                2.1. Продавец обязуется передать в собственность Покупателю
                автозапчасти, а Покупатель обязуется оплатить и принять автозапчасти на
                условиях настоящего договора.
              </p>
              <p className="policy-text">
                2.2. Договор заключается путем акцепта настоящей оферты
                Покупателем.
              </p>
            </article>

            {/* Section 3 */}
            <article id="sec-3" className="policy-section">
              <h2 className="policy-sec-title">
                <span className="sec-num">3.</span> Порядок оформления и выполнения
                заказа
              </h2>
              <p className="policy-text">
                3.1. Покупатель самостоятельно оформляет заказ на сайте, заполняя
                необходимые поля и указывая контактные данные.
              </p>
              <p className="policy-text">
                3.2. После оформления заказа Продавец подтверждает его по
                электронной почте или телефону.
              </p>
            </article>

            {/* Section 4 */}
            <article id="sec-4" className="policy-section">
              <h2 className="policy-sec-title">
                <span className="sec-num">4.</span> Цена товара и порядок оплаты
              </h2>
              <p className="policy-text">
                4.1. Цена на каждую автозапчасть указывается на сайте и может быть
                изменена Продавцом в одностороннем порядке.
              </p>
              <p className="policy-text">
                4.2. Оплата осуществляется через указанные на сайте способы, включая
                онлайн-оплату и банковский перевод.
              </p>
            </article>

            {/* Section 5 */}
            <article id="sec-5" className="policy-section">
              <h2 className="policy-sec-title">
                <span className="sec-num">5.</span> Доставка и передача товара
              </h2>
              <p className="policy-text">
                5.1. Продавец осуществляет доставку автозапчастей по указанному
                Покупателем адресу в срок, указанный на сайте.
              </p>
              <p className="policy-text">
                5.2. Стоимость доставки рассчитывается отдельно и добавляется к общей
                сумме заказа.
              </p>
            </article>

            {/* Section 6 */}
            <article id="sec-6" className="policy-section">
              <h2 className="policy-sec-title">
                <span className="sec-num">6.</span> Возврат и обмен товара
              </h2>
              <p className="policy-text">
                6.1. Покупатель имеет право на возврат или обмен товара в соответствии
                с законодательством Республики Казахстан.
              </p>
              <p className="policy-text">
                6.2. Возврат возможен в течение 14 дней с момента получения товара,
                при условии сохранения его товарного вида.
              </p>
            </article>

            {/* Section 7 */}
            <article id="sec-7" className="policy-section">
              <h2 className="policy-sec-title">
                <span className="sec-num">7.</span> Ответственность сторон
              </h2>
              <p className="policy-text">
                7.1. Продавец не несет ответственности за задержки в доставке,
                вызванные непредвиденными обстоятельствами.
              </p>
              <p className="policy-text">
                7.2. В случае нарушения условий оплаты Покупателем, Продавец имеет
                право отменить заказ.
              </p>
            </article>

            {/* Section 8 */}
            <article id="sec-8" className="policy-section">
              <h2 className="policy-sec-title">
                <span className="sec-num">8.</span> Заключительные положения
              </h2>
              <p className="policy-text">
                8.1. Продавец оставляет за собой право вносить изменения в оферту,
                публикуя актуальную версию на сайте.
              </p>
              <p className="policy-text">
                8.2. Акцепт оферты Покупателем является подтверждением его согласия
                со всеми условиями договора.
              </p>
            </article>
          </main>
        </div>
      </div>
    </section>
  );
};
