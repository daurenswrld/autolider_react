import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Products state loaded from localStorage or API
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('autolider_products');
    return saved ? JSON.parse(saved) : [];
  });

  // Categories state loaded from backend API
  const [categories, setCategories] = useState([]);

  // Settings state loaded from backend API
  const [settings, setSettings] = useState({
    storeName: 'Autolider Marketplace',
    phone: '+7 (777) 555-45-54',
    email: 'support@autolider.kz',
    address: 'г. Астана, ул. Автозаводская, 12',
    workingHours: 'Пн-Вс 09:00 - 20:00',
    currency: '₸',
    freeDeliveryMin: 50000,
    deliveryCost: 2500,
    welcomeBonus: 5000
  });

  const refreshSettings = () => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === 'object') setSettings((prev) => ({ ...prev, ...data }));
      })
      .catch((err) => console.warn('Could not fetch settings from server:', err));
  };

  const DEFAULT_CATEGORIES = [
    { id: 'detali-dlya-to', name: 'Детали для ТО', slug: 'detali-dlya-to', status: 'enabled' },
    { id: 'dvigatel', name: 'Двигатель', slug: 'dvigatel', status: 'enabled' },
    { id: 'toplivnaya-sistema', name: 'Топливная система', slug: 'toplivnaya-sistema', status: 'enabled' },
    { id: 'sistema-okhlazhdeniya', name: 'Система охлаждения', slug: 'sistema-okhlazhdeniya', status: 'enabled' },
    { id: 'tormoznaya-sistema', name: 'Тормозная система', slug: 'tormoznaya-sistema', status: 'enabled' },
    { id: 'podveska-i-rulevoe', name: 'Подвеска и рулевое управление', slug: 'podveska-i-rulevoe', status: 'enabled' },
    { id: 'transmissiya', name: 'Трансмиссия', slug: 'transmissiya', status: 'enabled' },
    { id: 'elektrika-i-osveshchenie', name: 'Электрика и освещение', slug: 'elektrika-i-osveshchenie', status: 'enabled' },
    { id: 'kuzovnye-detali', name: 'Кузовные детали', slug: 'kuzovnye-detali', status: 'enabled' }
  ];

  // Refresh functions for synchronization
  const refreshCategories = () => {
    fetch('/api/categories')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('API offline');
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setCategories(data);
        else setCategories(DEFAULT_CATEGORIES);
      })
      .catch((err) => {
        console.warn('Could not fetch categories from server:', err);
        setCategories((prev) => (prev.length > 0 ? prev : DEFAULT_CATEGORIES));
      });
  };

  const refreshProducts = () => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch((err) => console.warn('Could not fetch products from server:', err));
  };

  useEffect(() => {
    refreshCategories();
    refreshProducts();
    refreshSettings();
  }, []);

  // Cart state
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('autolider_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Wishlist state (Array of product IDs)
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('autolider_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  // User state
  const [userRole, setUserRole] = useState('buyer'); // default role
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('autolider_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('autolider_user');
    if (saved) return JSON.parse(saved);
    return null;
  });

  const refreshUserData = () => {
    const saved = localStorage.getItem('autolider_user');
    if (!saved) return;
    try {
      const u = JSON.parse(saved);
      if (u && (u.email || u.id)) {
        fetch('/api/customers')
          .then((res) => res.json())
          .then((customers) => {
            if (Array.isArray(customers)) {
              const matched = customers.find(
                (c) =>
                  String(c.id) === String(u.id) ||
                  (c.email && u.email && c.email.toLowerCase() === u.email.toLowerCase())
              );
              if (matched) {
                const updated = { ...u, ...matched };
                setCurrentUser(updated);
                setUser(updated);
                localStorage.setItem('autolider_user', JSON.stringify(updated));
              } else {
                // Customer profile was deleted from DB
                setCurrentUser(null);
                setUser(null);
                localStorage.removeItem('autolider_user');
                localStorage.removeItem('autolider_token');
              }
            }
          })
          .catch((err) => console.warn('User sync error:', err));
      }
    } catch (e) {}
  };

  useEffect(() => {
    refreshUserData();
  }, []);

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('autolider_user');
    localStorage.removeItem('autolider_token');
    showToast('Вы вышли из системы', 'info');
  };

  // Orders and Seller Sales state
  const [orders, setOrders] = useState([]);
  const [sellerSales, setSellerSales] = useState([]);

  // Toast notifications state
  const [toast, setToast] = useState(null);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('autolider_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('autolider_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('autolider_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const showToast = (message, type = 'success', duration = 2000) => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, duration);
  };

  // Cart actions
  const addToCart = (product, qty = 1) => {
    const activeUser = currentUser || user;
    if (!activeUser) {
      showToast('Авторизуйтесь, чтобы добавить товар в корзину', 'error', 3000);
      return false;
    }
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].qty += qty;
        return updated;
      }
      return [...prev, { product, qty }];
    });
    showToast(`"${product.title.substring(0, 24)}..." добавлен в корзину`, 'success', 2000);
    return true;
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Товар удален из корзины', 'info', 2000);
  };

  const updateCartQty = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, qty: newQty } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // Wishlist actions
  const toggleWishlist = (productId) => {
    setWishlist((prev) => {
      const isFav = prev.includes(productId);
      if (isFav) {
        showToast('Удалено из избранного', 'info', 2000);
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Товар добавлен в избранное', 'heart', 2000);
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId) => wishlist.includes(productId);

  // Role Switcher helper
  const toggleRole = () => {
    const nextRole = userRole === 'buyer' ? 'seller' : 'buyer';
    setUserRole(nextRole);
    showToast(`Переключен кабинет: ${nextRole === 'seller' ? 'Продавец' : 'Покупатель'}`, 'info');
  };

  // Garage actions
  const addGarageVehicle = (vehicle) => {
    setUser((prev) => ({
      ...prev,
      garage: [...prev.garage, { ...vehicle, id: `g_${Date.now()}` }]
    }));
    showToast('Автомобиль успешно добавлен в гараж');
  };

  // Add order flow
  const placeOrder = (orderDetails) => {
    const newOrder = {
      id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toLocaleDateString('ru-RU'),
      status: 'active',
      statusText: 'В обработке',
      totalPrice: orderDetails.totalPrice,
      itemsCount: cartCount,
      deliveryType: orderDetails.deliveryType,
      city: orderDetails.city,
      items: cart.map((c) => ({
        title: c.product.title,
        price: c.product.price,
        qty: c.qty,
        image: c.product.image
      }))
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    showToast(`Заказ ${newOrder.id} успешно оформлен!`);
    return newOrder.id;
  };

  // Product CRUD for Seller
  const addProduct = (newProd) => {
    const created = {
      ...newProd,
      id: Date.now(),
      rating: 5.0,
      reviewsCount: 0,
      inStock: true,
      seller: {
        name: user.company.name,
        rating: user.company.rating,
        salesCount: 1
      }
    };
    setProducts((prev) => [created, ...prev]);
    showToast('Новый товар опубликован на маркетплейсе');
  };

  const updateProduct = (id, updatedFields) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
    );
    showToast('Данные товара обновлены');
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('Товар удален', 'warning');
  };

  const categoriesWithCounts = categories.map((cat) => {
    const count = products.filter(
      (p) => p.status !== 'disabled' && (p.categoryId === cat.id || p.categoryName === cat.name)
    ).length;
    return { ...cat, count };
  });

  return (
    <AppContext.Provider
      value={{
        products,
        categories: categoriesWithCounts,
        rawCategories: categories,
        cart,
        cartCount,
        cartTotal,
        wishlist,
        userRole,
        user: currentUser || user,
        currentUser,
        setCurrentUser,
        logout,
        orders,
        sellerSales,
        toast,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        toggleWishlist,
        isInWishlist,
        toggleRole,
        setUserRole,
        addGarageVehicle,
        placeOrder,
        refreshProducts,
        refreshCategories,
        refreshSettings,
        settings,
        addProduct,
        updateProduct,
        deleteProduct,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
