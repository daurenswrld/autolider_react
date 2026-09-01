import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { slugify } from "../../utils/slugify";
import { useApp } from "../../context/AppContext";
import "./HeroSection.css";

export const HeroSection = () => {
  const { showToast, currentUser, user } = useApp();
  const activeUser = currentUser || user;

  const [vinQuery, setVinQuery] = useState("");
  const [vinPhone, setVinPhone] = useState("");
  const [vinError, setVinError] = useState("");
  const [vinLoading, setVinLoading] = useState(false);
  const [showVinModal, setShowVinModal] = useState(false);

  const formatPhoneMask = (input) => {
    if (!input) return "";
    let digits = input.replace(/\D/g, "");
    if (digits.startsWith("7") || digits.startsWith("8")) {
      digits = digits.slice(1);
    }
    digits = digits.slice(0, 10);

    let formatted = "+7 (";
    if (digits.length > 0) {
      formatted += digits.slice(0, 3);
    }
    if (digits.length >= 3) {
      formatted += ") ";
    }
    if (digits.length > 3) {
      formatted += digits.slice(3, 6);
    }
    if (digits.length >= 6) {
      formatted += "-";
    }
    if (digits.length > 6) {
      formatted += digits.slice(6, 8);
    }
    if (digits.length >= 8) {
      formatted += "-";
    }
    if (digits.length > 8) {
      formatted += digits.slice(8, 10);
    }
    return formatted;
  };

  const handleVinSubmit = async (e) => {
    e?.preventDefault();
    setVinError("");

    const cleanVin = vinQuery.trim();
    const cleanPhone = vinPhone.trim();

    if (!cleanVin) {
      setVinError("Пожалуйста, введите VIN-код вашего автомобиля");
      if (showToast) showToast("Укажите VIN-код автомобиля", "error");
      return;
    }

    if (cleanVin.length < 5) {
      setVinError("VIN-код должен содержать минимум 5 символов");
      if (showToast) showToast("VIN-код слишком короткий", "error");
      return;
    }

    if (!cleanPhone || cleanPhone.length < 18) {
      setVinError(
        "Пожалуйста, введите полный номер телефона: +7 (XXX) XXX-XX-XX",
      );
      if (showToast) showToast("Укажите верный номер телефона", "error");
      return;
    }

    setVinLoading(true);
    try {
      const res = await fetch("/api/vin-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vin: cleanVin,
          phone: cleanPhone,
          name: activeUser?.name || "Заявка по VIN",
          email: activeUser?.email || "",
        }),
      });

      if (res.ok) {
        if (showToast) {
          showToast(
            `Заявка по VIN ${cleanVin.toUpperCase()} принята! Наш специалист свяжется с вами.`,
            "success",
            4000,
          );
        }
        setVinQuery("");
        setVinPhone("");
        setShowVinModal(false);
      } else {
        const data = await res.json().catch(() => ({}));
        setVinError(data.message || "Ошибка отправки заявки");
      }
    } catch (err) {
      console.error("VIN submit error:", err);
      setVinError("Ошибка сети. Попробуйте еще раз.");
    } finally {
      setVinLoading(false);
    }
  };

  const adSlides = [
    {
      title: (
        <>
          Запчасти для <br /> китайских авто
        </>
      ),
      subtitle: "Доставка 7 - 10 дней",
      btnText: "НАЙТИ ЗАПЧАСТЬ",
      image: "/assets/img/hero-img.png",
    },
    {
      title: (
        <>
          Оригинальные <br /> аксессуары
        </>
      ),
      subtitle: "В наличии и под заказ",
      btnText: "СМОТРЕТЬ КАТАЛОГ",
      image: "/assets/img/hero-img.png",
    },
  ];

  const [dbBrands, setDbBrands] = useState([]);
  const [dbBanners, setDbBanners] = useState([]);

  React.useEffect(() => {
    fetch("/api/brands")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setDbBrands(data);
        }
      })
      .catch((err) =>
        console.error("Error fetching brands in HeroSection:", err),
      );

    fetch("/api/banners")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setDbBanners(data);
        }
      })
      .catch((err) =>
        console.error("Error fetching banners in HeroSection:", err),
      );
  }, []);

  const activeSlides =
    dbBanners.length > 0
      ? dbBanners.map((b) => ({
          title: b.title,
          subtitle: b.subtitle,
          btnText: (b.btnText || "ПОДРОБНЕЕ").toUpperCase(),
          btnLink: b.btnLink || "/catalog",
          image: b.image || "/assets/img/hero-img.png",
        }))
      : adSlides;

  // Left sidebar brands from DB
  const sidebarBrands = dbBrands.slice(0, 5).map((b) => ({
    name: b.name,
    logo: b.logoUrl || "/uploads/no-photo.png",
    slug: b.slug,
  }));

  // Hero strip brand logos
  const heroStripBrands = dbBrands.slice(0, 5).map((b) => ({
    name: b.name,
    logo: b.logoUrl || "/uploads/no-photo.png",
  }));

  // Main catalog brands grid matching reference design
  const catalogBrands = dbBrands.map((b) => ({
    name: b.name,
    logo: b.logoUrl || "/uploads/no-photo.png",
    slug: b.slug,
  }));

  // 4 Info Benefits items
  const benefits = [
    {
      icon: "/assets/img/info-1.png",
      title: "Доставка",
      subtitle: "По всему Казахстану",
    },
    {
      icon: "/assets/img/info-2.png",
      title: "Прямые поставки",
      subtitle: "Из Китая",
    },
    {
      icon: "/assets/img/info-3.png",
      title: "Цены ниже",
      subtitle: "Рынка",
    },
    {
      icon: "/assets/img/info-4.png",
      title: "Подбор по VIN",
      subtitle: "За 5 минут",
    },
  ];

  return (
    <section className="autolider-hero-section">
      {/* Background blurred clouds layer */}
      <div className="hero-bg-clouds" />

      <div className="hero-container">
        {/* Left Sidebar */}
        <aside className="hero-sidebar">
          {/* Top Sidebar Box: Brands List */}
          <div className="sidebar-brands-card">
            <ul className="sidebar-brands-list">
              {sidebarBrands.map((brand, idx) => (
                <li key={idx}>
                  <Link
                    to={`/catalog/${brand.slug || slugify(brand.name)}`}
                    className="sidebar-brand-item"
                  >
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="sidebar-brand-logo"
                    />
                    <span>{brand.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom Sidebar Box: QR Code Card */}
          <div className="sidebar-qr-card">
            <div className="qr-code-wrapper">
              <img
                src="/assets/img/hero-qr.png"
                alt="QR Code"
                className="qr-code-img"
              />
            </div>
            <div className="qr-divider" />
            <a
              href="https://wa.me/77775554554"
              target="_blank"
              rel="noopener noreferrer"
              className="qr-contact-btn"
            >
              Связаться с нами
            </a>
          </div>
        </aside>

        {/* Right Main Content Area */}
        <div className="hero-main-content">
          {/* Top Banner Content */}
          <div className="hero-banner-content">
            <div className="banner-text-content">
              {/* Vector SVG Title from design */}
              <div className="hero-title-wrapper">
                <svg
                  width="371"
                  height="74"
                  viewBox="0 0 371 74"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="hero-title-svg"
                >
                  <path
                    d="M371 65.3196V68.992H350.605V42.6543H370.623V46.3267H355.295V53.82H368.571V57.2699H355.295V65.3196H371Z"
                    fill="#E7241F"
                  />
                  <path
                    d="M343.897 42.6543V68.992H339.165V57.3812H324.172V68.992H319.482V42.6543H324.172V53.6716H339.165V42.6543H343.897Z"
                    fill="#E7241F"
                  />
                  <path
                    d="M314.643 65.3196V68.992H294.248V42.6543H314.266V46.3267H298.939V53.82H312.214V57.2699H298.939V65.3196H314.643Z"
                    fill="#E7241F"
                  />
                  <path
                    d="M285.324 73.9999V68.992H263.002V42.6543H267.693V65.3196H280.969V42.6543H285.701V65.3196H289.47V73.9999H285.324Z"
                    fill="#E7241F"
                  />
                  <path
                    d="M220.801 68.9922V42.6544H225.491V63.1311L241.363 42.6544H245.761V68.9922H241.07V48.8494L225.366 68.9922H220.801ZM233.281 40.8739C231.773 40.8739 230.475 40.6637 229.386 40.2433C228.297 39.7981 227.474 39.2046 226.915 38.4627C226.357 37.696 226.078 36.8552 226.078 35.9402H229.47C229.47 36.6079 229.749 37.2138 230.307 37.7579C230.894 38.3019 231.885 38.574 233.281 38.574C234.649 38.574 235.626 38.3267 236.212 37.8321C236.799 37.3374 237.092 36.7068 237.092 35.9402H240.484C240.484 36.8552 240.205 37.696 239.646 38.4627C239.088 39.2046 238.264 39.7981 237.176 40.2433C236.115 40.6637 234.816 40.8739 233.281 40.8739Z"
                    fill="#E7241F"
                  />
                  <path
                    d="M201.455 69.1774C199.305 69.1774 197.365 68.8065 195.634 68.0646C193.903 67.3227 192.409 66.3211 191.152 65.0598C189.896 63.7739 188.919 62.3395 188.221 60.7568C187.551 59.1493 187.216 57.5047 187.216 55.8231C187.216 54.0672 187.579 52.3979 188.305 50.8152C189.031 49.2077 190.036 47.7858 191.32 46.5492C192.604 45.288 194.112 44.2988 195.843 43.5816C197.602 42.8397 199.5 42.4688 201.538 42.4688C203.66 42.4688 205.587 42.8521 207.318 43.6187C209.077 44.3853 210.57 45.4117 211.799 46.6976C213.055 47.9836 214.018 49.4179 214.689 51.0007C215.387 52.5834 215.736 54.2033 215.736 55.8602C215.736 57.616 215.373 59.2977 214.647 60.9052C213.949 62.4879 212.958 63.9099 211.673 65.1711C210.389 66.4076 208.867 67.3845 207.108 68.1017C205.377 68.8188 203.493 69.1774 201.455 69.1774ZM191.99 55.8231C191.99 57.0596 192.213 58.259 192.66 59.4213C193.107 60.5837 193.735 61.6223 194.545 62.5373C195.382 63.4276 196.387 64.1325 197.56 64.6518C198.733 65.1711 200.045 65.4308 201.497 65.4308C203.004 65.4308 204.344 65.1588 205.517 64.6147C206.69 64.0706 207.667 63.3411 208.449 62.4261C209.258 61.4863 209.872 60.4476 210.291 59.3101C210.71 58.1477 210.919 56.9854 210.919 55.8231C210.919 54.5866 210.696 53.3995 210.249 52.2619C209.831 51.0996 209.202 50.0733 208.365 49.183C207.527 48.268 206.522 47.5508 205.349 47.0315C204.205 46.5121 202.92 46.2525 201.497 46.2525C199.989 46.2525 198.649 46.5245 197.476 47.0686C196.304 47.6126 195.312 48.3422 194.503 49.2572C193.693 50.1722 193.065 51.1985 192.618 52.3361C192.199 53.4737 191.99 54.636 191.99 55.8231Z"
                    fill="#E7241F"
                  />
                  <path
                    d="M162.845 68.992V42.6543H167.536V53.6716H171.012L180.351 42.6543H185.711L174.781 55.4151L186.507 68.992H180.769L171.012 57.4925H167.536V68.992H162.845Z"
                    fill="#E7241F"
                  />
                  <path
                    d="M147.183 69.2889C144.921 69.2889 142.869 68.8685 141.027 68.0277C139.212 67.1869 137.788 66.0245 136.755 64.5407L140.356 62.5747C141.027 63.5886 141.934 64.38 143.079 64.9488C144.251 65.4928 145.591 65.7649 147.099 65.7649C148.998 65.7649 150.449 65.3692 151.454 64.5778C152.487 63.7864 153.004 62.7354 153.004 61.4247C153.004 60.5839 152.795 59.842 152.376 59.199C151.957 58.5313 151.329 58.0243 150.491 57.6781C149.654 57.3071 148.635 57.1216 147.434 57.1216H144.126V53.8943H147.434C148.411 53.8943 149.235 53.7336 149.905 53.4121C150.603 53.0659 151.133 52.6084 151.496 52.0396C151.859 51.446 152.041 50.7783 152.041 50.0364C152.041 49.2698 151.831 48.6021 151.413 48.0333C151.022 47.4397 150.449 46.9822 149.696 46.6607C148.942 46.3145 148.02 46.1414 146.932 46.1414C145.424 46.1414 144.126 46.4134 143.037 46.9575C141.976 47.5016 141.138 48.2435 140.524 49.1832L137.09 47.0688C138.123 45.6344 139.449 44.4968 141.068 43.656C142.716 42.8152 144.74 42.3948 147.141 42.3948C149.067 42.3948 150.729 42.6792 152.125 43.248C153.548 43.792 154.651 44.5958 155.433 45.6592C156.215 46.6978 156.606 47.9591 156.606 49.4429C156.606 50.6794 156.257 51.8417 155.559 52.9299C154.889 53.9933 153.842 54.797 152.418 55.3411C154.121 55.7615 155.433 56.5528 156.354 57.7152C157.304 58.8775 157.778 60.2377 157.778 61.7957C157.778 63.3784 157.318 64.7386 156.396 65.8762C155.475 66.989 154.218 67.8422 152.627 68.4357C151.064 69.0045 149.249 69.2889 147.183 69.2889Z"
                    fill="#E7241F"
                  />
                  <path
                    d="M106.492 68.992V42.6543H111.183V63.1309L127.055 42.6543H131.452V68.992H126.762V48.8492L111.057 68.992H106.492Z"
                    fill="#E7241F"
                  />
                  <path
                    d="M99.5752 42.6543V68.992H94.8429V57.3812H79.8501V68.992H75.1597V42.6543H79.8501V53.6716H94.8429V42.6543H99.5752Z"
                    fill="#E7241F"
                  />
                  <path
                    d="M45.6759 69.1774C43.5261 69.1774 41.5857 68.8065 39.8547 68.0646C38.1237 67.3227 36.63 66.3211 35.3737 65.0598C34.1173 63.7739 33.1401 62.3395 32.4421 60.7568C31.772 59.1493 31.437 57.5047 31.437 55.8231C31.437 54.0672 31.8 52.3979 32.5259 50.8152C33.2518 49.2077 34.2569 47.7858 35.5412 46.5492C36.8255 45.288 38.3331 44.2988 40.0641 43.5816C41.823 42.8397 43.7216 42.4688 45.7597 42.4688C47.8816 42.4688 49.808 42.8521 51.539 43.6187C53.2979 44.3853 54.7916 45.4117 56.0201 46.6976C57.2764 47.9836 58.2397 49.4179 58.9097 51.0007C59.6077 52.5834 59.9567 54.2033 59.9567 55.8602C59.9567 57.616 59.5937 59.2977 58.8678 60.9052C58.1699 62.4879 57.1787 63.9099 55.8944 65.1711C54.6101 66.4076 53.0885 67.3845 51.3296 68.1017C49.5986 68.8188 47.714 69.1774 45.6759 69.1774ZM36.2112 55.8231C36.2112 57.0596 36.4346 58.259 36.8813 59.4213C37.328 60.5837 37.9562 61.6223 38.7659 62.5373C39.6034 63.4276 40.6085 64.1325 41.7812 64.6518C42.9538 65.1711 44.266 65.4308 45.7178 65.4308C47.2254 65.4308 48.5656 65.1588 49.7382 64.6147C50.9108 64.0706 51.888 63.3411 52.6697 62.4261C53.4794 61.4863 54.0936 60.4476 54.5124 59.3101C54.9312 58.1477 55.1406 56.9854 55.1406 55.8231C55.1406 54.5866 54.9172 53.3995 54.4705 52.2619C54.0517 51.0996 53.4236 50.0733 52.586 49.183C51.7484 48.268 50.7433 47.5508 49.5707 47.0315C48.426 46.5121 47.1417 46.2525 45.7178 46.2525C44.2101 46.2525 42.87 46.5245 41.6974 47.0686C40.5248 47.6126 39.5336 48.3422 38.724 49.2572C37.9143 50.1722 37.2861 51.1985 36.8394 52.3361C36.4206 53.4737 36.2112 54.636 36.2112 55.8231Z"
                    fill="#262626"
                  />
                  <path
                    d="M3.09912 68.992V42.6543H26.5933V68.992H21.861V46.3267H7.78958V68.992H3.09912Z"
                    fill="#262626"
                  />
                  <path
                    d="M307.585 26.5975V0.259766H312.276V20.7364L328.148 0.259766H332.545V26.5975H327.855V6.45469L312.15 26.5975H307.585Z"
                    fill="#262626"
                  />
                  <path
                    d="M303.389 3.93221H293.505V26.5975H288.773V3.93221H278.848V0.259766H303.389V3.93221Z"
                    fill="#262626"
                  />
                  <path
                    d="M251.057 13.2431C251.057 11.6356 251.378 10.0653 252.02 8.53198C252.662 6.97398 253.597 5.56435 254.826 4.30311C256.082 3.01713 257.604 2.00319 259.391 1.26129C261.177 0.494648 263.202 0.111328 265.463 0.111328C268.143 0.111328 270.461 0.655395 272.415 1.74353C274.369 2.80693 275.821 4.17946 276.77 5.86111L273.085 8.04974C272.527 6.98634 271.815 6.14551 270.949 5.52726C270.112 4.909 269.19 4.47622 268.185 4.22892C267.208 3.98161 266.245 3.85796 265.296 3.85796C263.732 3.85796 262.364 4.14236 261.191 4.71116C260.019 5.25522 259.028 5.98477 258.218 6.89979C257.436 7.8148 256.836 8.84111 256.417 9.9787C256.026 11.1163 255.831 12.2539 255.831 13.3915C255.831 14.6527 256.068 15.8769 256.543 17.0639C257.017 18.2262 257.674 19.2649 258.511 20.1799C259.377 21.0702 260.396 21.775 261.568 22.2944C262.741 22.8137 264.025 23.0734 265.421 23.0734C266.37 23.0734 267.362 22.925 268.395 22.6282C269.428 22.3315 270.377 21.874 271.242 21.2557C272.136 20.6127 272.834 19.7719 273.336 18.7332L277.231 20.6993C276.617 22.01 275.654 23.1228 274.341 24.0379C273.057 24.9529 271.605 25.6453 269.986 26.1152C268.395 26.5851 266.817 26.82 265.254 26.82C263.16 26.82 261.247 26.4367 259.516 25.67C257.785 24.8787 256.292 23.84 255.035 22.554C253.779 21.2433 252.802 19.7842 252.104 18.1768C251.406 16.5446 251.057 14.9 251.057 13.2431Z"
                    fill="#262626"
                  />
                  <path
                    d="M234.411 0.259766H238.851L250.409 26.5975H245.468L242.327 19.4381H230.852L227.753 26.5975H222.769L234.411 0.259766ZM241.405 16.3592L236.631 4.8225L231.689 16.3592H241.405Z"
                    fill="#262626"
                  />
                  <path
                    d="M214.555 26.5975V15.9511C214.137 16.0995 213.592 16.285 212.922 16.5075C212.252 16.7054 211.456 16.8785 210.535 17.0269C209.641 17.1753 208.608 17.2495 207.436 17.2495C204.058 17.2495 201.545 16.5817 199.898 15.2463C198.25 13.9109 197.427 11.7841 197.427 8.86589V0.259766H201.992V8.42075C201.992 10.1519 202.48 11.4255 203.457 12.2416C204.435 13.0577 206.082 13.4657 208.399 13.4657C209.488 13.4657 210.591 13.3544 211.708 13.1319C212.852 12.9093 213.801 12.6249 214.555 12.2787V0.259766H219.162V26.5975H214.555Z"
                    fill="#262626"
                  />
                  <path
                    d="M167.917 26.5975V0.259766H191.411V26.5975H186.678V3.93221H172.607V26.5975H167.917Z"
                    fill="#262626"
                  />
                  <path
                    d="M148.2 0.259766H152.639L164.197 26.5975H159.256L156.115 19.4381H144.64L141.541 26.5975H136.557L148.2 0.259766ZM155.193 16.3592L150.419 4.8225L145.477 16.3592H155.193Z"
                    fill="#262626"
                  />
                  <path
                    d="M124.648 26.8942C122.387 26.8942 120.335 26.4737 118.492 25.6329C116.677 24.7921 115.253 23.6298 114.22 22.1459L117.822 20.1799C118.492 21.1938 119.399 21.9852 120.544 22.554C121.717 23.0981 123.057 23.3701 124.564 23.3701C126.463 23.3701 127.915 22.9744 128.92 22.183C129.953 21.3917 130.469 20.3406 130.469 19.0299C130.469 18.1891 130.26 17.4472 129.841 16.8042C129.422 16.1365 128.794 15.6295 127.957 15.2833C127.119 14.9123 126.1 14.7269 124.899 14.7269H121.591V11.4996H124.899C125.877 11.4996 126.7 11.3388 127.37 11.0173C128.068 10.6711 128.599 10.2136 128.962 9.6448C129.325 9.05127 129.506 8.38356 129.506 7.64165C129.506 6.87501 129.297 6.20729 128.878 5.6385C128.487 5.04497 127.915 4.58746 127.161 4.26597C126.407 3.91974 125.486 3.74663 124.397 3.74663C122.889 3.74663 121.591 4.01866 120.502 4.56273C119.441 5.1068 118.604 5.8487 117.989 6.78845L114.555 4.67402C115.588 3.23966 116.914 2.10207 118.534 1.26124C120.181 0.420414 122.205 0 124.606 0C126.533 0 128.194 0.284398 129.59 0.853194C131.014 1.39726 132.117 2.20099 132.898 3.26439C133.68 4.30306 134.071 5.56431 134.071 7.04812C134.071 8.28463 133.722 9.44696 133.024 10.5351C132.354 11.5985 131.307 12.4022 129.883 12.9463C131.586 13.3667 132.898 14.1581 133.82 15.3204C134.769 16.4827 135.244 17.8429 135.244 19.4009C135.244 20.9836 134.783 22.3438 133.862 23.4814C132.94 24.5942 131.684 25.4474 130.092 26.041C128.529 26.6098 126.714 26.8942 124.648 26.8942Z"
                    fill="#262626"
                  />
                  <path
                    d="M96.6749 26.7829C94.5251 26.7829 92.5847 26.4119 90.8537 25.67C89.1227 24.9281 87.629 23.9265 86.3727 22.6653C85.1163 21.3793 84.1391 19.945 83.4411 18.3622C82.7711 16.7548 82.436 15.1102 82.436 13.4286C82.436 11.6727 82.799 10.0034 83.5249 8.42068C84.2508 6.81321 85.2559 5.39122 86.5402 4.15471C87.8245 2.89347 89.3321 1.90426 91.0631 1.18708C92.8221 0.445172 94.7206 0.0742188 96.7587 0.0742188C98.8806 0.0742188 100.807 0.457538 102.538 1.22418C104.297 1.99081 105.791 3.01712 107.019 4.30309C108.275 5.58907 109.239 7.02342 109.909 8.60616C110.607 10.1889 110.956 11.8087 110.956 13.4657C110.956 15.2215 110.593 16.9032 109.867 18.5106C109.169 20.0934 108.178 21.5153 106.893 22.7766C105.609 24.0131 104.088 24.99 102.329 25.7071C100.598 26.4243 98.7131 26.7829 96.6749 26.7829ZM87.2103 13.4286C87.2103 14.6651 87.4336 15.8645 87.8803 17.0268C88.327 18.1891 88.9552 19.2278 89.7649 20.1428C90.6025 21.0331 91.6076 21.7379 92.7802 22.2573C93.9528 22.7766 95.265 23.0363 96.7168 23.0363C98.2245 23.0363 99.5646 22.7642 100.737 22.2202C101.91 21.6761 102.887 20.9466 103.669 20.0315C104.478 19.0918 105.093 18.0531 105.511 16.9155C105.93 15.7532 106.14 14.5909 106.14 13.4286C106.14 12.192 105.916 11.005 105.47 9.8674C105.051 8.70508 104.423 7.67877 103.585 6.78848C102.747 5.87346 101.742 5.15629 100.57 4.63695C99.425 4.11762 98.1407 3.85795 96.7168 3.85795C95.2092 3.85795 93.869 4.12998 92.6964 4.67405C91.5238 5.21811 90.5327 5.94766 89.723 6.86268C88.9133 7.77769 88.2852 8.804 87.8384 9.94159C87.4197 11.0792 87.2103 12.2415 87.2103 13.4286Z"
                    fill="#262626"
                  />
                  <path
                    d="M81.1515 3.93221H71.2681V26.5975H66.5357V3.93221H56.6104V0.259766H81.1515V3.93221Z"
                    fill="#262626"
                  />
                  <path
                    d="M54.6859 19.809C54.6859 21.2187 54.2671 22.4304 53.4296 23.4444C52.6199 24.4583 51.5171 25.2373 50.1211 25.7814C48.7251 26.3255 47.1896 26.5975 45.5144 26.5975H31.3174V0.259766H46.6451C48.0411 0.259766 49.2417 0.593625 50.2467 1.26134C51.2798 1.90433 52.0615 2.74516 52.592 3.78383C53.1504 4.79777 53.4296 5.86117 53.4296 6.97403C53.4296 8.26 53.0527 9.47179 52.2988 10.6094C51.5729 11.7222 50.5259 12.5507 49.1579 13.0948C50.861 13.5399 52.2011 14.356 53.1783 15.5431C54.1834 16.7054 54.6859 18.1274 54.6859 19.809ZM49.8698 19.03C49.8698 18.2881 49.6884 17.6204 49.3254 17.0269C48.9904 16.4086 48.5157 15.914 47.9015 15.5431C47.3152 15.1474 46.6172 14.9495 45.8076 14.9495H36.0078V22.9992H45.5144C46.352 22.9992 47.0919 22.8261 47.734 22.4799C48.4041 22.1089 48.9206 21.6267 49.2835 21.0332C49.6744 20.4149 49.8698 19.7472 49.8698 19.03ZM36.0078 3.85802V11.611H44.6349C45.4167 11.611 46.1147 11.4502 46.7289 11.1287C47.3431 10.7825 47.8317 10.325 48.1947 9.75618C48.5576 9.16266 48.7391 8.49494 48.7391 7.75303C48.7391 6.98639 48.5716 6.31868 48.2366 5.74988C47.9015 5.15636 47.4408 4.69885 46.8545 4.37735C46.2962 4.03113 45.64 3.85802 44.8862 3.85802H36.0078Z"
                    fill="#262626"
                  />
                  <path
                    d="M11.6424 0.259766H16.0816L27.6402 26.5975H22.6985L19.5576 19.4381H8.08267L4.98362 26.5975H0L11.6424 0.259766ZM18.6362 16.3592L13.862 4.8225L8.92026 16.3592H18.6362Z"
                    fill="#262626"
                  />
                </svg>
              </div>
              <p className="hero-subtitle">В наличии и под заказ из Китая</p>

              {/* Divider line above logos strip */}
              <div className="hero-strip-divider">
                <svg
                  width="476"
                  height="4"
                  viewBox="0 0 476 4"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M0 2L238 0L476 2L238 4L0 2Z" fill="#CFC9D3" />
                </svg>
              </div>

              {/* Chinese Brands Logos Strip */}
              <div className="hero-brands-strip">
                {heroStripBrands.map((brand, i) => (
                  <img
                    key={i}
                    src={brand.logo}
                    alt={brand.name}
                    className="strip-brand-img"
                  />
                ))}
              </div>

              {/* Buttons Row */}
              <div className="hero-buttons-row">
                <Link to="/catalog" className="btn-primary-red">
                  НАЙТИ ЗАПЧАСТИ
                </Link>
                <button
                  type="button"
                  className="btn-secondary-white"
                  onClick={() => setShowVinModal(true)}
                >
                  ПОДБОР ПО VIN
                </button>
              </div>
            </div>

            {/* Right SUV Car Image */}
            <div className="banner-car-wrapper">
              <img
                src="/assets/img/hero-img.png"
                alt="Autolider SUV Car"
                className="banner-car-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/assets/img/hero-img.png";
                }}
              />
            </div>
          </div>

          {/* Middle Catalog Section */}
          <div className="hero-catalog-section">
            <h2 className="catalog-section-title">Каталог</h2>

            <div className="catalog-brands-grid">
              {[...catalogBrands].reverse().map((b, idx) => (
                <Link
                  key={idx}
                  to={`/catalog/${b.slug || slugify(b.name)}`}
                  className="brand-grid-card"
                >
                  <img src={b.logo} alt={b.name} className="brand-logo-img" />
                  <span className="brand-name-label">{b.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Bottom 4 Benefits Bar */}
          <div className="hero-benefits-bar">
            {benefits.map((item, idx) => (
              <div key={idx} className="benefit-item">
                <img
                  src={item.icon}
                  alt={item.title}
                  className="benefit-icon-img"
                />
                <div className="benefit-text-group">
                  <div className="benefit-title">{item.title}</div>
                  <div className="benefit-subtitle">{item.subtitle}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Frame 111: White Background Section starting from About Company & Accessories */}
      <section className="autolider-white-section">
        <div className="home-sections-container">
          {/* Top Row: About Company + AD Banner */}
          <div className="about-ad-grid">
            {/* About Card */}
            <div className="about-company-card">
              <h2 className="section-title-about">О компании</h2>
              <p className="about-text">
                AUTOLIDER — интернет-магазин автозапчастей из Китая. Основан в
                2022 году в Астане. Мы сотрудничаем с 30+ поставщиками в Китае и
                развиваем сеть из 30+ филиалов по Казахстану.
              </p>
              <p className="about-text">
                Наша цель — качественные автозапчасти по доступным ценам и
                быстрая доставка.
              </p>
              <Link to="/about" className="btn-about-red">
                ПОДРОБНЕЕ О КОМПАНИИ
              </Link>
            </div>

            {/* AD Banner Card with Official Swiper.js Slider */}
            <div className="ad-banner-card">
              <Swiper
                modules={[Autoplay, Pagination, EffectFade]}
                effect="fade"
                fadeEffect={{ crossFade: true }}
                loop={true}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                pagination={{ clickable: true }}
                className="ad-swiper"
              >
                {activeSlides.map((slide, idx) => (
                  <SwiperSlide key={idx}>
                    <div className="ad-slide-inner">
                      <div className="ad-content">
                        <h3 className="ad-title">{slide.title}</h3>
                        <p className="ad-subtitle">{slide.subtitle}</p>
                        <Link
                          to={slide.btnLink || "/catalog"}
                          className="btn-ad-red"
                        >
                          {slide.btnText}
                        </Link>
                      </div>
                      <img
                        src={slide.image}
                        alt="Автозапчасти"
                        className="ad-car-image"
                        draggable="false"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/assets/img/hero-img.png";
                        }}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      </section>

      {/* VIN Request Modal */}
      {showVinModal && (
        <div
          className="vin-modal-overlay"
          onClick={() => setShowVinModal(false)}
        >
          <div
            className="vin-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Подбор запчастей по VIN-коду</h3>
            <p style={{ marginBottom: "16px" }}>
              Введите VIN-код автомобиля и телефон для связи с менеджером
            </p>

            {vinError && (
              <div
                style={{
                  color: "#dc2626",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  marginBottom: "14px",
                  fontWeight: "600",
                }}
              >
                {vinError}
              </div>
            )}

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    fontWeight: "600",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  VIN-код автомобиля<span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Например: LHG39182390192831"
                  value={vinQuery}
                  onChange={(e) => {
                    setVinQuery(e.target.value);
                    if (vinError) setVinError("");
                  }}
                  className="vin-input"
                  style={{ marginBottom: 0 }}
                  autoFocus
                />
              </div>

              <div>
                <label
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    fontWeight: "600",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Номер телефона для связи
                  <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  type="tel"
                  placeholder="+7 (777) 000-00-00"
                  value={vinPhone}
                  onFocus={() => {
                    if (!vinPhone) setVinPhone("+7 (");
                  }}
                  onChange={(e) => {
                    setVinPhone(formatPhoneMask(e.target.value));
                    if (vinError) setVinError("");
                  }}
                  className="vin-input"
                  style={{ marginBottom: 0 }}
                />
              </div>
            </div>

            <div className="vin-modal-actions">
              <button
                type="button"
                className="btn-primary-red"
                onClick={handleVinSubmit}
                disabled={vinLoading}
              >
                {vinLoading ? "Отправка..." : "Отправить заявку"}
              </button>
              <button
                type="button"
                className="btn-secondary-white"
                onClick={() => {
                  setShowVinModal(false);
                  setVinError("");
                }}
                disabled={vinLoading}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
