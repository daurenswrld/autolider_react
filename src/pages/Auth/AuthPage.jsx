import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  ArrowLeft,
  AlertCircle,
  Gift,
  User,
  Phone,
  MapPin,
  Sparkles,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import "./AuthPage.css";

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

export const AuthPage = () => {
  const navigate = useNavigate();
  const { setCurrentUser, showToast, settings } = useApp();

  // Steps: 'email' | 'otp' | 'register'
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // OTP State (4 digits)
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const otpInputsRef = useRef([]);

  // Registration State (If user not in DB)
  const [regData, setRegData] = useState({
    name: "",
    phone: "",
    city: "Астана",
  });
  const [customCity, setCustomCity] = useState("");

  // OTP Timer
  useEffect(() => {
    let interval = null;
    if (step === "otp" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Helper for safe JSON fetching with pure backend communication
  const safeJsonFetch = async (url, options) => {
    const res = await fetch(url, options);
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `Ошибка сервера (${res.status})`);
      }
      return data;
    } else {
      throw new Error("Сервер вернул неверный формат ответа");
    }
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !email.includes("@")) {
      setErrorMsg("Укажите корректный E-mail адрес");
      return;
    }

    setLoading(true);
    try {
      const data = await safeJsonFetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      setStep("otp");
      setTimer(60);
      setCanResend(false);
      if (showToast)
        showToast(data.message || `Код отправлен на ${email}`, "success");

      setTimeout(() => {
        if (otpInputsRef.current[0]) {
          otpInputsRef.current[0].focus();
        }
      }, 100);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // OTP Pin Digit Handling
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    if (value && index < 3 && otpInputsRef.current[index + 1]) {
      otpInputsRef.current[index + 1].focus();
    }

    const filledCode = newDigits.join("");
    if (filledCode.length === 4) {
      verifyOtpCode(filledCode);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1].focus();
    }
  };

  // Step 2: Verify OTP
  const verifyOtpCode = async (codeToVerify) => {
    const fullCode = codeToVerify || otpDigits.join("");
    if (fullCode.length < 4) {
      setErrorMsg("Введите 4-значный код");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    try {
      const data = await safeJsonFetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otpCode: fullCode }),
      });

      if (data.isRegistered && data.user) {
        if (setCurrentUser) setCurrentUser(data.user);
        localStorage.setItem("autolider_user", JSON.stringify(data.user));
        localStorage.setItem("autolider_token", data.token);

        if (showToast)
          showToast(`🎉 С возвращением, ${data.user.name}!`, "success", 3000);
        navigate("/profile");
      } else {
        setStep("register");
        setRegData((prev) => ({ ...prev, email }));
        if (showToast)
          showToast("Почта подтверждена! Заполните данные профиля.", "info");
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendCode = async () => {
    if (!canResend) return;
    setErrorMsg("");
    setLoading(true);
    try {
      const data = await safeJsonFetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setTimer(60);
      setCanResend(false);
      if (showToast) showToast(`Новый код отправлен на ${email}`, "info");
    } catch (err) {
      setErrorMsg("Ошибка отправки кода");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Complete Registration
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regData.name.trim() || !regData.phone.trim()) {
      setErrorMsg("Заполните обязательные поля");
      return;
    }

    const finalCity = regData.city === "Другое" ? customCity.trim() : regData.city;
    if (regData.city === "Другое" && !customCity.trim()) {
      setErrorMsg("Укажите название вашего города");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    try {
      const data = await safeJsonFetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: regData.name,
          phone: regData.phone,
          city: finalCity,
        }),
      });

      if (setCurrentUser) setCurrentUser(data.user);
      localStorage.setItem("autolider_user", JSON.stringify(data.user));
      localStorage.setItem("autolider_token", data.token);

      if (showToast) showToast(`Регистрация прошла успешно!`, "success", 3000);
      navigate("/profile");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__card">
        {step !== "email" && (
          <button
            className="auth-page__back"
            onClick={() => setStep("email")}
            title="Назад"
            type="button"
          >
            <ArrowLeft size={22} />
          </button>
        )}

        <div className="auth-page__logo">
          <Link to="/">
            <img
              src="/assets/img/logo.png"
              alt="AUTOLIDER"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/assets/img/logo.svg";
              }}
            />
          </Link>
        </div>

        {errorMsg && (
          <div className="auth-page-error-box">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Step 1: Enter Email */}
        {step === "email" && (
          <form className="auth-page__form" onSubmit={handleSendOtp}>
            <h1 className="auth-page__title">Войти или зарегистрироваться</h1>
            <p className="auth-page__subtitle">
              Чтобы отслеживать заказы, смотреть персональные скидки и бонусы
            </p>

            <div className="auth-page__input-group">
              <span className="auth-page__label">Эл. почта</span>
              <div className="input-with-icon">
                <input
                  type="email"
                  className="auth-page__input"
                  placeholder="example@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              className={`auth-page__btn ${email.includes("@") ? "ready" : ""} ${loading ? "loading" : ""}`}
              disabled={loading || !email.includes("@")}
            >
              <span>{loading ? "Отправка..." : "Продолжить"}</span>
            </button>
          </form>
        )}

        {/* Step 2: Enter OTP Code */}
        {step === "otp" && (
          <div className="auth-page__form">
            <h1 className="auth-page__title">Подтвердить эл. почту</h1>
            <p className="auth-page__subtitle">
              Мы отправили 4-значный код на <b>{email}</b>
            </p>



            <div className="page-otp-grid">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (otpInputsRef.current[idx] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="page-otp-box"
                />
              ))}
            </div>

            <button
              type="button"
              className="auth-page__btn ready"
              onClick={() => verifyOtpCode()}
              disabled={loading || otpDigits.join("").length < 4}
            >
              <span>{loading ? "Проверка..." : "Подтвердить код"}</span>
            </button>

            <div className="page-resend-row">
              {timer > 0 ? (
                <span>
                  Отправить код повторно через <b>{timer}с</b>
                </span>
              ) : (
                <button
                  type="button"
                  className="link-resend-btn"
                  onClick={handleResendCode}
                >
                  Отправить код повторно
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Registration Form (If user not in DB) */}
        {step === "register" && (
          <form className="auth-page__form" onSubmit={handleRegisterSubmit}>
            <h1 className="auth-page__title">Создание профиля</h1>
            <p className="auth-page__subtitle">
              Укажите ваши данные для завершения регистрации. Вам начислится{" "}
              <b style={{ color: "#16a34a" }}>
                +{(settings?.welcomeBonus || 5000).toLocaleString("ru-RU")} ₸
              </b>{" "}
              приветственных бонусов 🎁
            </p>

            <div className="auth-page__input-group">
              <span className="auth-page__label">Ваше Имя (ФИО)</span>
              <input
                type="text"
                className="auth-page__input"
                placeholder="Иван Иванов"
                value={regData.name}
                onChange={(e) =>
                  setRegData({ ...regData, name: e.target.value })
                }
                required
                autoFocus
              />
            </div>

            <div className="auth-page__input-group">
              <span className="auth-page__label">Номер телефона</span>
              <input
                type="tel"
                className="auth-page__input"
                placeholder="+7 (777) 000-00-00"
                value={regData.phone}
                onChange={(e) =>
                  setRegData({
                    ...regData,
                    phone: formatPhoneMask(e.target.value),
                  })
                }
                onFocus={(e) => {
                  if (!regData.phone) setRegData({ ...regData, phone: "+7 (" });
                }}
                maxLength={18}
                required
              />
            </div>

            <div className="auth-page__input-group">
              <span className="auth-page__label">Город</span>
              <select
                className="auth-page__input"
                value={regData.city}
                onChange={(e) =>
                  setRegData({ ...regData, city: e.target.value })
                }
              >
                <option value="Астана">Астана</option>
                <option value="Алматы">Алматы</option>
                <option value="Шымкент">Шымкент</option>
                <option value="Караганда">Караганда</option>
                <option value="Актобе">Актобе</option>
                <option value="Другое">Другое</option>
              </select>
            </div>

            {regData.city === "Другое" && (
              <div className="auth-page__input-group">
                <span className="auth-page__label">Ваш город</span>
                <input
                  type="text"
                  className="auth-page__input"
                  placeholder="Введите название вашего города"
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            )}

            <button
              type="submit"
              className="auth-page__btn ready"
              disabled={loading || !regData.name.trim()}
            >
              <span>
                {loading ? "Создание аккаунта..." : "Завершить регистрацию"}
              </span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
