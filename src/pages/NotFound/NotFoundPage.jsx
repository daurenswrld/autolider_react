import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './NotFoundPage.css';

export const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <span className="not-found-code">404</span>
        <h1 className="not-found-title">Страница не найдена</h1>
        <p className="not-found-desc">
          Возможно, вы ошиблись в адресе или страница была перемещена.
        </p>
        <Link to="/" className="btn-not-found">
          <ArrowLeft size={18} />
          <span>Вернуться на главную</span>
        </Link>
      </div>
    </div>
  );
};
