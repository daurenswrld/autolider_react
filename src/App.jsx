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
import { NotFoundPage } from "./pages/NotFound/NotFoundPage";
import { CartPage } from "./pages/Cart/CartPage";
import { ProductDetailsPage } from "./pages/ProductDetails/ProductDetailsPage";
import { CheckoutPage } from "./pages/Checkout/CheckoutPage";
import { ProfilePage } from "./pages/Profile/ProfilePage";
import { PrivacyPage } from "./pages/Privacy/PrivacyPage";
import { AdminLayout } from "./admin/AdminLayout";
import { AdminDashboard } from "./admin/views/AdminDashboard";
import { AdminProducts } from "./admin/views/AdminProducts";
import { AdminCategories } from "./admin/views/AdminCategories";
import { AdminOrders } from "./admin/views/AdminOrders";
import { AdminCustomers } from "./admin/views/AdminCustomers";
import { AdminBanners } from "./admin/views/AdminBanners";
import { AdminSettings } from "./admin/views/AdminSettings";
import { AdminLogin } from "./admin/views/AdminLogin";
import "./styles/style.scss";

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");
  const isAuthPage =
    location.pathname === "/auth" || location.pathname === "/login" || isAdminPage;

  const knownRoutes = [
    '/',
    '/catalog',
    '/favorites',
    '/auth',
    '/login',
    '/about',
    '/delivery',
    '/payment',
    '/contacts',
    '/profile',
    '/cart',
    '/checkout',
    '/privacy',
    '/product'
  ];
  const isNotFoundPage =
    !knownRoutes.includes(location.pathname) &&
    !location.pathname.startsWith('/product/') &&
    !location.pathname.startsWith('/admin');

  const hideAccessoriesPages = ['/profile', '/checkout', '/cart', '/auth', '/login', '/privacy'];
  const shouldHideAccessories = isNotFoundPage || hideAccessoriesPages.includes(location.pathname);

  // If Admin Login Page
  if (location.pathname === "/admin/login") {
    return (
      <>
        <AdminLogin />
        <Toast />
      </>
    );
  }

  // If Admin Dashboard Shell
  if (isAdminPage) {
    return (
      <>
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="banners" element={<AdminBanners />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
        <Toast />
      </>
    );
  }

  return (
    <div
      className="app-layout"
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      {/* Header Navbar (hidden on auth & admin pages) */}
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
          <Route path="/product" element={<ProductDetailsPage />} />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Footer exact to design (hidden on auth page) */}
      {!isAuthPage && <Footer hideAccessories={shouldHideAccessories} />}

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
