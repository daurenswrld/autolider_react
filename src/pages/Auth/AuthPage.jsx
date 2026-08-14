import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import './AuthPage.css';

export const AuthPage = () => {
  const navigate = useNavigate();
  const { showToast } = useApp();

  const [step, setStep] = useState('email'); // 'email' | 'code'
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const isEmailValid = email.trim().length > 3 && email.includes('@');
  const isCodeValid = code.trim().length >= 4;

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!isEmailValid) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('code');
      if (showToast) {
        showToast(`Код подтверждения отправлен на ${email}`, 'info', 2500);
      }
    }, 700);
  };

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    if (!isCodeValid) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (showToast) {
        showToast('Успешная авторизация! Добро пожаловать.', 'success', 2000);
      }
      navigate('/profile');
    }, 800);
  };

  return (
    <div className="auth-page">
      <div className="auth-page__card">
        {step === 'code' && (
          <button
            className="auth-page__back"
            onClick={() => setStep('email')}
            title="Назад к вводу почты"
            type="button"
          >
            <ArrowLeft size={22} />
          </button>
        )}

        <div className="auth-page__logo">
          <Link to="/">
            <img src="/assets/img/logo.png" alt="AUTOLIDER" onError={(e) => { e.target.onerror = null; e.target.src = '/assets/img/logo.svg'; }} />
          </Link>
        </div>

        {/* Step 1: Email */}
        <div className={`auth-page__step ${step === 'email' ? 'active' : ''}`}>
          <h1 className="auth-page__title">
            Войти<br />или зарегистрироваться
          </h1>
          <p className="auth-page__subtitle">
            Чтобы смотреть актуальные цены, отслеживать заказы, пользоваться бонусами и скидками
          </p>

          <form className="auth-page__form" onSubmit={handleEmailSubmit}>
            <div className="auth-page__input-group">
              <span className="auth-page__label">Эл. почта</span>
              <input
                type="email"
                className="auth-page__input"
                placeholder="example@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </div>
            <button
              type="submit"
              className={`auth-page__btn ${isEmailValid ? 'ready' : ''} ${loading ? 'loading' : ''}`}
              disabled={!isEmailValid || loading}
            >
              <span>Продолжить</span>
            </button>
          </form>
        </div>

        {/* Step 2: Verification Code */}
        <div className={`auth-page__step ${step === 'code' ? 'active' : ''}`}>
          <h1 className="auth-page__title">Подтвердить эл. почту</h1>
          <p className="auth-page__subtitle">
            Отправили письмо с кодом на почту{' '}
            <span style={{ color: '#1A1A1A', fontWeight: 600 }}>{email}</span>
          </p>

          <form className="auth-page__form" onSubmit={handleCodeSubmit}>
            <div className="auth-page__input-group">
              <span className="auth-page__label">Код из письма</span>
              <input
                type="text"
                className="auth-page__input auth-page__input--code"
                placeholder="••••••"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoFocus
              />
            </div>
            <button
              type="submit"
              className={`auth-page__btn ${isCodeValid ? 'ready' : ''} ${loading ? 'loading' : ''}`}
              disabled={!isCodeValid || loading}
            >
              <span>Подтвердить</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
