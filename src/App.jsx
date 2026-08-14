import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { Navbar } from "./components/Navbar/Navbar";
import { HeroSection } from "./components/HeroSection/HeroSection";
import { Footer } from "./components/Footer/Footer";
import { Toast } from "./components/Toast/Toast";
import { ScrollToTop } from "./components/ScrollToTop/ScrollToTop";
import { ScrollToTopButton } from "./components/ScrollToTop/ScrollToTopButton";
import { AboutPage } from "./pages/About/AboutPage";
import { ContactsPage } from "./pages/Contacts/ContactsPage";
import { DeliveryPage } from "./pages/Delivery/DeliveryPage";
import { PaymentPage } from "./pages/Payment/PaymentPage";
import { CatalogPage } from "./pages/Catalog/CatalogPage";
import { FavoritesPage } from "./pages/Favorites/FavoritesPage";
import { AuthPage } from "./pages/Auth/AuthPage";
import "./styles/style.scss";

const PlaceholderPage = ({ title }) => (
  <div
    style={{
      padding: "80px 24px",
      textAlign: "center",
      minHeight: "50vh",
      backgroundColor: "#f8f9fa",
    }}
  >
    <h1 style={{ fontSize: "28px", color: "#111", fontWeight: "600" }}>
      {title}
    </h1>
    <p style={{ color: "#666", marginTop: "12px" }}>Раздел в разработке.</p>
  </div>
);

function AppContent() {
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/auth" || location.pathname === "/login";

  return (
    <div
      className="app-layout"
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      {/* Header Navbar (hidden on auth page) */}
      {!isAuthPage && <Navbar />}

      {/* Main View Container */}
      <main className="main-content" style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<HeroSection />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/delivery" element={<DeliveryPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route
            path="/profile"
            element={<PlaceholderPage title="Кабинет покупателя" />}
          />
          <Route
            path="/seller/dashboard"
            element={<PlaceholderPage title="Кабинет продавца" />}
          />
          <Route path="/cart" element={<PlaceholderPage title="Корзина" />} />
          <Route
            path="/privacy"
            element={<PlaceholderPage title="Политика конфиденциальности" />}
          />
        </Routes>
      </main>

      {/* Footer exact to design (hidden on auth page) */}
      {!isAuthPage && <Footer />}

      {/* Toast Notification system */}
      <Toast />

      {/* Floating Scroll To Top Button Widget */}
      {!isAuthPage && <ScrollToTopButton />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <ScrollToTop />
        <AppContent />
      </Router>
    </AppProvider>
  );
}
