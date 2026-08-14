import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_GARAGE,
  INITIAL_ORDERS,
  INITIAL_SELLER_SALES
} from '../data/mockData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Products state (can be edited/added by seller)
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('autolider_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  // Cart state
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('autolider_cart');
    return saved ? JSON.parse(saved) : [
      { product: INITIAL_PRODUCTS[0], qty: 1 },
      { product: INITIAL_PRODUCTS[1], qty: 1 }
    ];
  });

  // Wishlist state (Array of product IDs)
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('autolider_wishlist');
    return saved ? JSON.parse(saved) : ['p1', 'p2', 101, 103];
  });

  // User state (Role switcher: 'buyer' | 'seller')
  const [userRole, setUserRole] = useState('buyer'); // default role
  const [user, setUser] = useState({
    name: 'Алексей Смирнов',
    phone: '+7 (777) 456-78-90',
    email: 'alex.smirnov@autolider.kz',
    city: 'Алматы',
    bonusCard: '7789 4512 9012 3456',
    bonusBalance: 4250,
    garage: INITIAL_GARAGE,
    company: {
      name: 'ТОО "Автолидер Директ"',
      bin: '210940019283',
      rating: 4.95,
      salesTotal: 14850000,
      banner: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=1200&auto=format&fit=crop&q=80',
      logo: '/assets/img/logo.svg'
    }
  });

  // Orders and Seller Sales state
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [sellerSales, setSellerSales] = useState(INITIAL_SELLER_SALES);

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

  return (
    <AppContext.Provider
      value={{
        products,
        categories: INITIAL_CATEGORIES,
        cart,
        cartCount,
        cartTotal,
        wishlist,
        userRole,
        user,
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
