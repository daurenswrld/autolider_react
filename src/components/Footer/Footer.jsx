import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import './Footer.css';

export const Footer = () => {
  return (
    <footer className="autolider-footer">
      <div className="footer-container">
        {/* Main 4 Columns Section */}
        <div className="footer-top-grid">
          {/* Column 1: Contacts */}
          <div className="footer-col">
            <h4 className="footer-col-title">Контакты</h4>
            <ul className="footer-contacts-list">
              <li>
                <Phone className="contact-icon" size={18} strokeWidth={1.8} />
                <a href="tel:+77775554554" className="contact-link">
                  +7 (777) 555 4554
                </a>
              </li>
              <li>
                <Mail className="contact-icon" size={18} strokeWidth={1.8} />
                <a href="mailto:autolider@info.com" className="contact-link">
                  autolider@info.com
                </a>
              </li>
              <li>
                <MapPin className="contact-icon" size={18} strokeWidth={1.8} />
                <span className="contact-text">
                  г.Астана, Ул Автозаводская, 12
                </span>
              </li>
            </ul>
          </div>

          {/* Column 2: Navigation Menu */}
          <div className="footer-col">
            <h4 className="footer-col-title">Меню</h4>
            <ul className="footer-links-list">
              <li>
                <Link to="/catalog">Каталог</Link>
              </li>
              <li>
                <Link to="/about">О Компании</Link>
              </li>
              <li>
                <Link to="/delivery">Доставка</Link>
              </li>
              <li>
                <Link to="/payment">Оплата</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Social Networks */}
          <div className="footer-col">
            <h4 className="footer-col-title">Социальные Сети</h4>
            <ul className="footer-links-list">
              <li>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                  Linkedin
                </a>
              </li>
              <li>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                  Twitter
                </a>
              </li>
              <li>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                  Facebook
                </a>
              </li>
              <li>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Brand Circular Logo */}
          <div className="footer-col footer-logo-col">
            <img
              src="/assets/img/logo.png"
              alt="AUTOLIDER TRADE"
              className="footer-logo"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/assets/img/logo.svg';
              }}
            />
          </div>
        </div>

        {/* Divider Line */}
        <div className="footer-divider" />

        {/* Bottom Bar: Privacy Policy, Offer & Copyright */}
        <div className="footer-bottom-bar">
          <div className="footer-bottom-links">
            <Link to="/privacy" className="privacy-link">
              Политика конфиденциальности
            </Link>
            <Link to="/offer" className="privacy-link">
              Договор оферты
            </Link>
          </div>
          <span className="copyright-text">
            © 2026 AUTOLIDER Trade
          </span>
        </div>
      </div>
    </footer>
  );
};
