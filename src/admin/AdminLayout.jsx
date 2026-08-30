import React, { useState, useEffect, useRef } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Car,
  ShoppingCart,
  FileText,
  Users,
  Building2,
  ShieldCheck,
  Image as ImageIcon,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bell,
  ShieldAlert,
  Search,
  Store,
  Truck,
} from "lucide-react";
import "./AdminLayout.css";

export const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem("autolider_admin_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return localStorage.getItem("autolider_admin_token")
      ? {
          name: "Администратор Autolider",
          role: "Главный Администратор",
          roleKey: "admin",
        }
      : null;
  });

  // Badges: compare live counts with last-seen counts
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [newRequestsCount, setNewRequestsCount] = useState(0);
  const pollRef = useRef(null);

  const fetchCounts = async () => {
    try {
      const [ordersRes, requestsRes] = await Promise.all([
        fetch("/api/orders/count"),
        fetch("/api/vin-requests/count"),
      ]);
      if (ordersRes.ok) {
        const { count } = await ordersRes.json();
        const seen = Number(
          localStorage.getItem("autolider_orders_seen_count") || 0,
        );
        setNewOrdersCount(Math.max(0, count - seen));
      }
      if (requestsRes.ok) {
        const { count } = await requestsRes.json();
        const seen = Number(
          localStorage.getItem("autolider_requests_seen_count") || 0,
        );
        setNewRequestsCount(Math.max(0, count - seen));
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchCounts();
    pollRef.current = setInterval(fetchCounts, 30000);
    return () => clearInterval(pollRef.current);
  }, []);

  React.useEffect(() => {
    const token = localStorage.getItem("autolider_admin_token");
    if (!token) {
      navigate("/admin/login", { replace: true });
    } else {
      const saved = localStorage.getItem("autolider_admin_user");
      if (saved) {
        try {
          const u = JSON.parse(saved);
          setAdminUser(u);

          // Security Guard: Prevent suppliers from accessing admin-only pages
          if (u?.roleKey === "seller") {
            const allowedSellerPaths = [
              "/admin",
              "/admin/products",
              "/admin/orders",
            ];
            if (!allowedSellerPaths.includes(location.pathname)) {
              navigate("/admin", { replace: true });
            }
          }
        } catch (e) {}
      }
    }
  }, [navigate, location.pathname]);

  // Mark as seen when visiting orders or requests pages
  useEffect(() => {
    if (location.pathname === "/admin/orders") {
      fetch("/api/orders/count")
        .then((r) => r.json())
        .then(({ count }) => {
          localStorage.setItem("autolider_orders_seen_count", String(count));
          setNewOrdersCount(0);
        })
        .catch(() => {});
    }
    if (location.pathname === "/admin/requests") {
      fetch("/api/vin-requests/count")
        .then((r) => r.json())
        .then(({ count }) => {
          localStorage.setItem("autolider_requests_seen_count", String(count));
          setNewRequestsCount(0);
        })
        .catch(() => {});
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("autolider_admin_token");
    localStorage.removeItem("autolider_admin_user");
    navigate("/admin/login");
  };

  const allNavItems = [
    // ---- ADMIN & MANAGER ----
    {
      title: "Дашборд",
      path: "/admin",
      icon: LayoutDashboard,
      exact: true,
      roles: ["admin", "manager"],
    },
    {
      title: "Товары",
      path: "/admin/products",
      icon: Package,
      roles: ["admin", "manager"],
    },
    {
      title: "Категории",
      path: "/admin/categories",
      icon: FolderTree,
      roles: ["admin", "manager"],
    },
    {
      title: "Марки и модели",
      path: "/admin/brands",
      icon: Car,
      roles: ["admin", "manager"],
    },
    {
      title: "Заказы",
      path: "/admin/orders",
      icon: ShoppingCart,
      badge: newOrdersCount > 0 ? String(newOrdersCount) : null,
      roles: ["admin", "manager"],
    },
    {
      title: "Заявки (VIN)",
      path: "/admin/requests",
      icon: FileText,
      badge: newRequestsCount > 0 ? String(newRequestsCount) : null,
      roles: ["admin", "manager"],
    },
    {
      title: "Покупатели",
      path: "/admin/customers",
      icon: Users,
      roles: ["admin", "manager"],
    },
    {
      title: "Баннеры",
      path: "/admin/banners",
      icon: ImageIcon,
      roles: ["admin", "manager"],
    },
    // ---- ADMIN ONLY ----
    {
      title: "Поставщики",
      path: "/admin/sellers",
      icon: Truck,
      roles: ["admin"],
    },
    {
      title: "Магазины",
      path: "/admin/stores",
      icon: Store,
      roles: ["admin"],
    },
    {
      title: "Сотрудники и Доступ",
      path: "/admin/roles",
      icon: Users,
      roles: ["admin"],
    },
    {
      title: "Настройки",
      path: "/admin/settings",
      icon: Settings,
      roles: ["admin"],
    },
    // ---- SELLER ONLY ----
    {
      title: "Мой кабинет",
      path: "/admin",
      icon: LayoutDashboard,
      exact: true,
      roles: ["seller"],
    },
    {
      title: "Мои товары",
      path: "/admin/products",
      icon: Package,
      roles: ["seller"],
    },
    {
      title: "Мои заказы",
      path: "/admin/orders",
      icon: ShoppingCart,
      roles: ["seller"],
    },
  ];

  const currentRole = adminUser?.roleKey || "admin";
  const navItems = allNavItems.filter((item) =>
    item.roles.includes(currentRole),
  );

  if (!localStorage.getItem("autolider_admin_token")) {
    return null;
  }

  return (
    <div className="admin-app-wrapper">
      {/* Header Navbar */}
      <header className="admin-top-header">
        <div className="admin-header-left">
          <button
            className="admin-mobile-toggle"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            aria-label="Toggle Admin Menu"
          >
            {isMobileSidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div className="admin-brand-box" onClick={() => navigate("/admin")}>
            <img
              src="/assets/img/logo.svg"
              alt="AUTOLIDER"
              className="admin-brand-logo-img"
            />
          </div>
        </div>

        <div className="admin-header-right">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-admin-storefront"
          >
            <ExternalLink size={15} />
            <span>В магазин</span>
          </a>

          <div className="admin-user-profile">
            <div className="admin-user-meta">
              <span className="admin-username">
                {adminUser?.name || "Сотрудник"}
              </span>
              <span className="admin-role">
                {adminUser?.role || "Администратор"}
              </span>
            </div>
          </div>

          <button
            className="btn-admin-logout"
            onClick={handleLogout}
            title="Выйти из админки"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Admin Layout Grid */}
      <div className="admin-layout-body">
        {/* Mobile Backdrop */}
        {isMobileSidebarOpen && (
          <div
            className="admin-sidebar-backdrop"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Left Sidebar Navigation */}
        <aside className={`admin-sidebar ${isMobileSidebarOpen ? "open" : ""}`}>
          <nav className="admin-nav-menu">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) =>
                    `admin-nav-link ${isActive ? "active" : ""}`
                  }
                  onClick={() => setIsMobileSidebarOpen(false)}
                >
                  <div className="admin-nav-link-left">
                    <Icon size={19} className="admin-nav-icon" />
                    <span>{item.title}</span>
                  </div>
                  {item.badge ? (
                    <span className="admin-badge-red">{item.badge}</span>
                  ) : (
                    <ChevronRight size={14} className="admin-nav-arrow" />
                  )}
                </NavLink>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="admin-main-stage">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
