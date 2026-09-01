import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  Save,
  Package,
  FileSpreadsheet,
  Download,
  Upload,
  Image as ImageIcon,
  Tag,
  Truck,
  Star,
  ThumbsUp,
  Sliders,
  Car,
  Store,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { uploadImageFile } from "../../services/api";
import { slugify } from "../../utils/slugify";
import "./AdminProducts.css";

export const DEFAULT_PRESET_SPECS = [
  { key: "Производитель", value: "" },
  { key: "Страна производства", value: "" },
  { key: "Вязкость / Класс", value: "" },
  { key: "Объем / Размер", value: "" },
];

export const normalizeSpecs = (specsInput) => {
  if (!specsInput) return [];
  let raw = specsInput;

  for (let i = 0; i < 5; i++) {
    if (typeof raw === "string" && raw.trim()) {
      try {
        raw = JSON.parse(raw);
      } catch (err) {
        break;
      }
    } else {
      break;
    }
  }

  if (!raw) return [];

  const result = [];
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (!item) continue;
      if (typeof item === "string") {
        try {
          const parsedItem = JSON.parse(item);
          if (parsedItem && typeof parsedItem === "object") {
            const k = String(parsedItem.key || parsedItem.title || parsedItem.name || "").trim();
            const v = String(parsedItem.value || parsedItem.val || parsedItem.valName || "").trim();
            if (k || v) result.push({ key: k, value: v });
          }
        } catch (e) {}
      } else if (typeof item === "object") {
        if ("key" in item || "title" in item || "name" in item || "value" in item || "val" in item) {
          const k = String(item.key || item.title || item.name || "").trim();
          const v = String(item.value || item.val || item.valName || "").trim();
          if (k || v) result.push({ key: k, value: v });
        } else {
          for (const [k, v] of Object.entries(item)) {
            if (k && v !== undefined && v !== null) {
              result.push({ key: String(k).trim(), value: String(v).trim() });
            }
          }
        }
      }
    }
  } else if (typeof raw === "object") {
    for (const [k, v] of Object.entries(raw)) {
      if (k && v !== undefined && v !== null) {
        result.push({ key: String(k).trim(), value: String(v).trim() });
      }
    }
  }
  return result.filter((item) => item.key !== "" || item.value !== "");
};

export const AdminProducts = () => {
  const { showToast, refreshProducts, refreshCategories } = useApp();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Detect seller role
  const sellerInfo = (() => {
    try { return JSON.parse(localStorage.getItem('autolider_admin_user')); } catch { return null; }
  })();
  const isSeller = sellerInfo?.roleKey === 'seller';
  const sellerId = sellerInfo?.sellerId || null;

  // Filters State
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeModalTab, setActiveModalTab] = useState("general"); // 'general' | 'media' | 'compatibility' | 'specs'

  const [uploading, setUploading] = useState(false);
  const [coverSizeKb, setCoverSizeKb] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    sku: "",
    brand: "",
    price: "",
    oldPrice: "",
    stockQty: "",
    categoryId: "oils",
    categoryName: "",
    status: "enabled",
    image: "",
    images: [],
    isUniversal: false,
    carMakes: [],
    carModels: [],
    description: "",
    specs: [],
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const productsUrl = isSeller && sellerId
        ? `/api/products?all=true&seller_id=${sellerId}`
        : '/api/products?all=true';
      const [resProd, resCat, resBrands, resSellers] = await Promise.all([
        fetch(productsUrl),
        fetch("/api/categories?all=true"),
        fetch("/api/brands?all=true"),
        fetch("/api/sellers"),
      ]);
      if (resProd.ok) setProducts(await resProd.json());
      if (resCat.ok) setCategories(await resCat.json());
      if (resBrands.ok) setBrands(await resBrands.json());
      if (resSellers.ok) setSellers(await resSellers.json());
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getSellerStoreName = (product) => {
    if (product.sellerName) return product.sellerName;
    if (product.seller_id) {
      const found = sellers.find((s) => String(s.id) === String(product.seller_id));
      if (found) return found.name;
    }
    if (isSeller && sellerInfo?.name) return sellerInfo.name;
    return "Главный магазин AutoLider";
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !search.trim() ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));

    const matchesCat = !selectedCat || p.categoryId === selectedCat;
    const matchesStatus = !selectedStatus || p.status === selectedStatus;

    return matchesSearch && matchesCat && matchesStatus;
  });

  const handleOpenAddModal = () => {
    setEditingId(null);
    setActiveModalTab("general");
    setCoverSizeKb("");
    setFormData({
      title: "",
      sku: `SKU${Math.floor(1000 + Math.random() * 9000)}`,
      brand: "",
      price: "",
      oldPrice: "",
      stockQty: "",
      categoryId: categories[0]?.id || "wheels",
      categoryName: categories[0]?.name || "Диски",
      status: "enabled",
      image: "",
      images: [],
      isUniversal: false,
      carMakes: [],
      carModels: [],
      description: "",
      specs: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = async (product) => {
    setEditingId(product.id);
    setActiveModalTab("general");
    setCoverSizeKb("");

    let liveProduct = { ...product };
    try {
      const res = await fetch(`/api/products/${product.id}`);
      if (res.ok) {
        const fetched = await res.json();
        liveProduct = { ...product, ...fetched };
      }
    } catch (err) {
      console.warn("Could not fetch live product data:", err);
    }

    // Determine isUniversal value reliably
    const isUniversalVal = !!(
      liveProduct.isUniversal ||
      liveProduct.carMake === "Универсальный" ||
      (typeof liveProduct.carMake === "string" &&
        liveProduct.carMake.toLowerCase().includes("универсал"))
    );

    // Parse specs array dynamically
    let parsedSpecs = normalizeSpecs(liveProduct.specs);

    if (parsedSpecs.length === 0 && product.specs) {
      parsedSpecs = normalizeSpecs(product.specs);
    }

    if (parsedSpecs.length === 0) {
      // Legacy specs fallback
      if (liveProduct.type) parsedSpecs.push({ key: "Тип", value: liveProduct.type });
      if (liveProduct.material)
        parsedSpecs.push({ key: "Материал", value: liveProduct.material });
      if (liveProduct.pcd)
        parsedSpecs.push({ key: "PCD (Разболтовка)", value: liveProduct.pcd });
      if (liveProduct.et)
        parsedSpecs.push({ key: "Вылет (ET)", value: liveProduct.et });
      if (liveProduct.co) parsedSpecs.push({ key: "ЦО", value: liveProduct.co });
      if (liveProduct.color)
        parsedSpecs.push({ key: "Цвет", value: liveProduct.color });
      if (liveProduct.season)
        parsedSpecs.push({ key: "Сезон", value: liveProduct.season });
    }

    // Keep empty array if product has no specs yet

    let carMakesArr = [];
    if (Array.isArray(liveProduct.carMakes) && liveProduct.carMakes.length > 0) {
      carMakesArr = liveProduct.carMakes;
    } else if (typeof liveProduct.carMake === "string" && liveProduct.carMake.trim()) {
      carMakesArr = liveProduct.carMake
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== "Универсальный");
    }

    let carModelsArr = [];
    if (Array.isArray(liveProduct.carModels) && liveProduct.carModels.length > 0) {
      carModelsArr = liveProduct.carModels;
    } else if (
      typeof liveProduct.carModel === "string" &&
      liveProduct.carModel.trim()
    ) {
      carModelsArr = liveProduct.carModel
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== "Все модели");
    }

    setFormData({
      title: liveProduct.title || "",
      sku: liveProduct.sku || "",
      brand: liveProduct.brand || "",
      price: liveProduct.price || "",
      oldPrice: liveProduct.oldPrice || "",
      stockQty: liveProduct.stockQty !== undefined ? liveProduct.stockQty : "",
      categoryId: liveProduct.categoryId || categories[0]?.id || "oils",
      categoryName: liveProduct.categoryName || "",
      status: liveProduct.status || "enabled",

      image: liveProduct.image || liveProduct.photoUrl || "",
      images: Array.isArray(liveProduct.images) ? liveProduct.images : [],

      isUniversal: isUniversalVal,
      carMakes: carMakesArr,
      carModels: carModelsArr,

      description: liveProduct.description || "",
      specs: parsedSpecs,
    });
    setIsModalOpen(true);
  };

  const handleAddSpecRow = () => {
    setFormData((prev) => ({
      ...prev,
      specs: [...(prev.specs || []), { key: "", value: "" }],
    }));
  };

  const handleAddPresetSpec = (presetKey) => {
    setFormData((prev) => {
      const current = prev.specs || [];
      const exists = current.some(
        (s) => (s.key || "").toLowerCase() === presetKey.toLowerCase()
      );
      if (exists) return prev;
      return {
        ...prev,
        specs: [...current, { key: presetKey, value: "" }],
      };
    });
  };

  const handleUpdateSpecRow = (index, field, val) => {
    setFormData((prev) => {
      const updated = [...(prev.specs || [])];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, specs: updated };
    });
  };

  const handleRemoveSpecRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      specs: (prev.specs || []).filter((_, i) => i !== index),
    }));
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const data = await uploadImageFile(file, "product");
      setFormData((prev) => ({ ...prev, image: data.url }));
      setCoverSizeKb(data.sizeKb);
      showToast(`Заглавное фото загружено (${data.sizeKb})`);
    } catch (err) {
      showToast(err.message || "Ошибка загрузки фото", "error");
    } finally {
      setUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const newUrls = [];
      for (const file of files) {
        const data = await uploadImageFile(file, "product");
        newUrls.push(data.url);
      }
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...newUrls],
      }));
      showToast(`Загружено доп. фото: ${newUrls.length} шт.`);
    } catch (err) {
      showToast("Ошибка при загрузке дополнительных фото", "error");
    } finally {
      setUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleDeleteProduct = async (id, title) => {
    if (!window.confirm(`Вы уверены, что хотите удалить товар "${title}"?`))
      return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => String(p.id) !== String(id)));
        if (refreshProducts) refreshProducts();
        if (refreshCategories) refreshCategories();
        showToast(`Товар "${title}" удален`);
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.message || "Ошибка при удалении товара", "error");
      }
    } catch (err) {
      console.error("Failed to delete product:", err);
      showToast("Ошибка соединения с сервером", "error");
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast("Укажите название товара", "error");
      setActiveModalTab("general");
      return;
    }

    if (!formData.image || !formData.image.trim()) {
      showToast("Загрузите заглавное фото товара", "error");
      setActiveModalTab("media");
      return;
    }

    if (
      !formData.isUniversal &&
      (!formData.carMakes || formData.carMakes.length === 0)
    ) {
      showToast(
        "Укажите совместимость авто (выберите марки или отметьте 'Универсальный товар')",
        "error",
      );
      setActiveModalTab("compatibility");
      return;
    }

    const matchedCat = categories.find((c) => c.id === formData.categoryId);
    const cleanSpecs = (formData.specs || [])
      .map((s) => ({
        key: String(s.key || s.title || "").trim(),
        value: String(s.value || s.val || "").trim(),
      }))
      .filter((s) => s.key !== "" || s.value !== "");

    const payload = {
      ...formData,
      slug: slugify(formData.title),
      categoryName: matchedCat ? matchedCat.name : formData.categoryName,
      price: Number(formData.price) || 0,
      oldPrice: Number(formData.oldPrice) || 0,
      stockQty: Number(formData.stockQty) || 0,
      inStock: Number(formData.stockQty) > 0,
      isUniversal: !!formData.isUniversal,
      carMakes: formData.isUniversal ? [] : formData.carMakes || [],
      carModels: formData.isUniversal ? [] : formData.carModels || [],
      carMake: formData.isUniversal
        ? "Универсальный"
        : formData.carMakes && formData.carMakes.length > 0
          ? formData.carMakes.join(", ")
          : "",
      carModel: formData.isUniversal
        ? "Все модели"
        : formData.carModels && formData.carModels.length > 0
          ? formData.carModels.join(", ")
          : "",
      specs: cleanSpecs,
      // Auto-assign seller_id when saving as supplier
      ...(isSeller && sellerId ? { seller_id: sellerId } : {}),
    };

    try {
      if (editingId) {
        // Update product
        const res = await fetch(`/api/products/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const updated = await res.json();
          setProducts((prev) =>
            prev.map((p) => (p.id === editingId ? updated : p)),
          );
          showToast(`Товар "${updated.title}" обновлен!`);
        }
      } else {
        // Create new product
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const created = await res.json();
          setProducts((prev) => [created, ...prev]);
          showToast(`Товар "${created.title}" успешно создан!`);
        }
      }
      if (refreshProducts) refreshProducts();
      if (refreshCategories) refreshCategories();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving product:", err);
      showToast("Ошибка при сохранении товара", "error");
    }
  };

  const formatPrice = (val) => {
    return new Intl.NumberFormat("ru-RU").format(val || 0) + " ₸";
  };

  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [excelSuccessMsg, setExcelSuccessMsg] = useState("");

  const handleExportExcel = () => {
    try {
      const itemsToExport = filteredProducts.length > 0 ? filteredProducts : products;
      const exportData = itemsToExport.map((p) => ({
        "Артикул (SKU)": p.sku || "",
        "Наименование товара": p.title || "",
        "Бренд": p.brand || "",
        "Категория": p.categoryName || "",
        "Цена (₸)": p.price || 0,
        "Старая цена (₸)": p.oldPrice || 0,
        "Остаток на складе (шт)": p.stockQty || 0,
        "Марка авто": p.carMake || "",
        "Модель авто": p.carModel || "",
        "Поставщик / Магазин": getSellerStoreName(p),
        "Статус": p.status === "enabled" ? "Включен" : "Отключен",
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Товары Autolider");
      const filename = isSeller && sellerInfo?.name
        ? `autolider_${sellerInfo.name.toLowerCase().replace(/\s+/g, '_')}_catalog_${new Date().toISOString().slice(0, 10)}.xlsx`
        : `autolider_catalog_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(workbook, filename);
    } catch (err) {
      console.error("Excel Export Error:", err);
      alert("Ошибка при генерации Excel файла");
    }
  };

  const handleExcelFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawJson = XLSX.utils.sheet_to_json(ws);

        if (!rawJson || rawJson.length === 0) {
          alert("Выбранный файл Excel не содержит данных");
          return;
        }

        const res = await fetch("/api/products/import-excel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: rawJson }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setExcelSuccessMsg(data.message);
          loadData();
        } else {
          alert(data.message || "Ошибка импорта Excel");
        }
      } catch (err) {
        console.error("Excel Import Error:", err);
        alert("Ошибка чтения файла Excel");
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="admin-products-view">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Каталог товаров</h1>
          <p className="admin-page-subtitle">
            Управление товарами, фото, характеристиками, ценами и остатками
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            className="btn-admin-secondary"
            onClick={() => setIsExcelModalOpen(true)}
          >
            <Upload size={16} />
            <span>Импорт Excel</span>
          </button>
          <button className="btn-admin-secondary" onClick={handleExportExcel}>
            <Download size={16} />
            <span>Экспорт Excel</span>
          </button>
          <button className="btn-admin-primary" onClick={handleOpenAddModal}>
            <Plus size={16} />
            <span>Добавить товар</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="admin-filter-card">
        <div className="search-input-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Поиск товара по названию или артикулу..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-selects-row">
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
          >
            <option value="">Все категории</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">Все статусы</option>
            <option value="enabled">Включен</option>
            <option value="disabled">Отключен</option>
          </select>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="admin-card table-card-container">
        <div className="table-responsive">
          <table className="admin-products-table">
            <thead>
              <tr>
                <th style={{ width: "32%" }}>Товар</th>
                <th>Магазин / Поставщик</th>
                <th>Категория</th>
                <th>Цена</th>
                <th>Остаток</th>
                <th>Статус</th>
                <th style={{ textAlign: "right" }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="product-table-row">
                    <td>
                      <div className="product-cell-main">
                        <div className="product-compact-thumb">
                          <img
                            src={p.image || p.photoUrl || '/uploads/no-photo.png'}
                            alt={p.title}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/uploads/no-photo.png';
                            }}
                          />
                        </div>
                        <div className="product-info-meta">
                          <a
                            href={`/product/${p.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="product-title-text"
                            title={p.title}
                          >
                            {p.title}
                          </a>
                          <div className="product-sub-tags">
                            {p.sku && !p.sku.toLowerCase().includes('test') && (
                              <span className="product-sku-tag">
                                {p.sku}
                              </span>
                            )}
                            {p.brand && !p.brand.toLowerCase().includes('autolider test') && (
                              <span className="product-brand-tag">
                                {p.brand}
                              </span>
                            )}
                            {p.carMake && !p.carMake.toLowerCase().includes('autolider test') && (
                              <span className="product-carmake-tag">
                                {p.carMake}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="seller-store-pill">
                        <Store size={13} style={{ marginRight: 5, color: '#ea2427' }} />
                        {getSellerStoreName(p)}
                      </span>
                    </td>
                    <td>
                      <span className="cat-pill-badge">
                        {p.categoryName || "Запчасти"}
                      </span>
                    </td>
                    <td>
                      <div className="price-cell-box">
                        <span className="current-price-val">
                          {formatPrice(p.price)}
                        </span>
                        {p.oldPrice > 0 && (
                          <span className="old-price-val">
                            {formatPrice(p.oldPrice)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`stock-pill-badge ${
                          p.stockQty > 0 ? "in-stock" : "out-of-stock"
                        }`}
                      >
                        <span className="stock-dot" />
                        {p.stockQty > 0 ? `${p.stockQty} шт` : "Нет"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-pill-badge ${
                          p.status === "enabled" ? "active" : "disabled"
                        }`}
                      >
                        <span className="status-dot" />
                        {p.status === "enabled" ? "Включен" : "Скрыт"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="table-actions-cell">
                        <button
                          type="button"
                          className="btn-action-icon edit"
                          onClick={() => handleOpenEditModal(p)}
                          title="Редактировать товар"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          className="btn-action-icon delete"
                          onClick={() => handleDeleteProduct(p.id, p.title)}
                          title="Удалить товар"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    style={{ textAlign: "center", padding: "40px" }}
                  >
                    <div className="empty-table-state">
                      <Package size={36} />
                      <p>Товары не найдены</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Add / Edit Product */}
      {isModalOpen && (
        <div
          className="admin-modal-overlay"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="admin-modal-box product-edit-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div className="modal-header-titles">
                <h3 className="modal-title">
                  {editingId
                    ? `Редактирование: ${formData.title || "Товар"}`
                    : "Добавление нового товара"}
                </h3>
                <span className="modal-subtitle">
                  Заполните фото, описание, характеристики и привязку к маркам
                  авто
                </span>
              </div>
              <button
                className="btn-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Tabs Navigation */}
            <div className="product-modal-tabs">
              <button
                type="button"
                className={`product-tab-btn ${
                  activeModalTab === "general" ? "active" : ""
                }`}
                onClick={() => setActiveModalTab("general")}
              >
                <Package size={16} />
                <span>1. Основное</span>
              </button>
              <button
                type="button"
                className={`product-tab-btn ${
                  activeModalTab === "media" ? "active" : ""
                }`}
                onClick={() => setActiveModalTab("media")}
              >
                <ImageIcon size={16} />
                <span>2. Фотографии *</span>
              </button>
              <button
                type="button"
                className={`product-tab-btn ${
                  activeModalTab === "compatibility" ? "active" : ""
                }`}
                onClick={() => setActiveModalTab("compatibility")}
              >
                <Car size={16} />
                <span>3. Совместимость авто *</span>
              </button>
              <button
                type="button"
                className={`product-tab-btn ${
                  activeModalTab === "specs" ? "active" : ""
                }`}
                onClick={() => setActiveModalTab("specs")}
              >
                <Sliders size={16} />
                <span>4. Характеристики</span>
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="admin-modal-form">
              {/* TAB 1: GENERAL & DESCRIPTION */}
              {activeModalTab === "general" && (
                <div className="form-grid-layout">
                  <div className="form-group full-width">
                    <label>Название товара *</label>
                    <input
                      type="text"
                      required
                      placeholder="например: Диск Trebl X40030_P или Масло Motul 5W30"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, title: e.target.value }))
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Артикул / SKU *</label>
                    <input
                      type="text"
                      required
                      placeholder="например: SKU030"
                      value={formData.sku}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, sku: e.target.value }))
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Бренд / Производитель</label>
                    <input
                      type="text"
                      placeholder="например: Trebl, Michelin, Motul..."
                      value={formData.brand}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, brand: e.target.value }))
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Категория товара</label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, categoryId: e.target.value }))
                      }
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Статус товара</label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, status: e.target.value }))
                      }
                    >
                      <option value="enabled">Включен (Виден на сайте)</option>
                      <option value="disabled">Отключен (Скрыт)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Цена продажи (₸) *</label>
                    <input
                      type="number"
                      min="0"
                      required
                      placeholder="например: 72000"
                      value={formData.price}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || Number(val) >= 0) {
                          setFormData((prev) => ({ ...prev, price: val }));
                        }
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label>Старая цена (₸)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="например: 85000"
                      value={formData.oldPrice}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || Number(val) >= 0) {
                          setFormData((prev) => ({ ...prev, oldPrice: val }));
                        }
                      }}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Количество на складе (шт)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="например: 10"
                      value={formData.stockQty}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || Number(val) >= 0) {
                          setFormData((prev) => ({ ...prev, stockQty: val }));
                        }
                      }}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Описание товара</label>
                    <textarea
                      rows="4"
                      placeholder="Введите подробное описание товара..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: MEDIA */}
              {activeModalTab === "media" && (
                <div className="form-sections-stack">
                  {/* Main Cover Photo */}
                  <div className="media-section-card">
                    <h4>Заглавная фотография товара (Главное фото)</h4>
                    <div className="upload-picker-row">
                      <label className="btn-upload-file">
                        <ImageIcon size={16} />
                        <span>
                          {uploading
                            ? "Загрузка..."
                            : "Загрузить заглавное фото с ПК"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploading}
                          onChange={handleCoverUpload}
                        />
                      </label>
                    </div>

                    {formData.image && (
                      <div
                        className="img-preview-box hero"
                        style={{ marginTop: "12px" }}
                      >
                        <img src={formData.image} alt="Cover Preview" />
                        <div>
                          <span>Заглавное фото загружено</span>
                          {coverSizeKb && (
                            <div className="webp-compressed-badge">
                              ✓ Загружено ({coverSizeKb})
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Gallery Photos */}
                  <div className="media-section-card">
                    <h4>Дополнительные фотографии товара (Галерея)</h4>
                    <div className="upload-picker-row">
                      <label className="btn-upload-file">
                        <ImageIcon size={16} />
                        <span>
                          {uploading
                            ? "Загрузка..."
                            : "Загрузить доп. фото с ПК (мультивыбор)"}
                        </span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          disabled={uploading}
                          onChange={handleGalleryUpload}
                        />
                      </label>
                    </div>

                    {/* Gallery Thumbs Grid */}
                    {formData.images && formData.images.length > 0 ? (
                      <div className="gallery-thumbs-grid">
                        {formData.images.map((imgUrl, idx) => (
                          <div key={idx} className="gallery-thumb-card">
                            <img src={imgUrl} alt={`Gallery ${idx + 1}`} />
                            <button
                              type="button"
                              className="remove-thumb-btn"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  images: prev.images.filter(
                                    (_, i) => i !== idx,
                                  ),
                                }))
                              }
                              title="Удалить фото"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-gallery-hint">
                        Дополнительные фото пока не загружены.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: CAR COMPATIBILITY */}
              {activeModalTab === "compatibility" && (
                <div className="compatibility-section">
                  <div className="universal-toggle-row">
                    <label className="checkbox-label font-bold">
                      <input
                        type="checkbox"
                        checked={formData.isUniversal}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            isUniversal: e.target.checked,
                          }))
                        }
                      />
                      <span>
                        Универсальный товар (подходит абсолютно для всех марок и
                        моделей)
                      </span>
                    </label>
                  </div>

                  {!formData.isUniversal && (
                    <div className="makes-models-picker">
                      <div className="picker-block">
                        <h4>1. Выберите марки автомобилей:</h4>
                        <div className="chips-grid">
                          {brands.map((b) => {
                            const isSelected = (
                              formData.carMakes || []
                            ).includes(b.name);
                            return (
                              <button
                                key={b.id || b.name}
                                type="button"
                                className={`brand-chip-item ${
                                  isSelected ? "active" : ""
                                }`}
                                onClick={() => {
                                  setFormData((prev) => {
                                    const current = prev.carMakes || [];
                                    const updated = isSelected
                                      ? current.filter((m) => m !== b.name)
                                      : [...current, b.name];
                                    return { ...prev, carMakes: updated };
                                  });
                                }}
                              >
                                {b.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div
                        className="picker-block"
                        style={{ marginTop: "20px" }}
                      >
                        <h4>2. Выберите модели автомобилей:</h4>
                        {formData.carMakes && formData.carMakes.length > 0 ? (
                          <div className="chips-grid">
                            {brands
                              .filter((b) => formData.carMakes.includes(b.name))
                              .flatMap((b) =>
                                (b.models || []).map((m) => ({
                                  ...m,
                                  brandName: b.name,
                                })),
                              )
                              .map((m) => {
                                const isSelected = (
                                  formData.carModels || []
                                ).includes(m.name);
                                return (
                                  <button
                                    key={m.id || m.name}
                                    type="button"
                                    className={`model-chip-item ${
                                      isSelected ? "active" : ""
                                    }`}
                                    onClick={() => {
                                      setFormData((prev) => {
                                        const current = prev.carModels || [];
                                        const updated = isSelected
                                          ? current.filter(
                                              (mod) => mod !== m.name,
                                            )
                                          : [...current, m.name];
                                        return { ...prev, carModels: updated };
                                      });
                                    }}
                                  >
                                    <span>
                                      {m.brandName} {m.name}
                                    </span>
                                  </button>
                                );
                              })}
                          </div>
                        ) : (
                          <p className="no-gallery-hint">
                            Сначала выберите хотя бы одну марку авто выше.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: DYNAMIC SPECS */}
              {activeModalTab === "specs" && (
                <div className="dynamic-specs-section">
                  <div className="specs-section-header">
                    <h4>Характеристики товара</h4>
                    <p className="specs-sub">
                      Укажите произвольные характеристики товара (например:
                      Производитель, Объем, Вязкость, Материал)
                    </p>
                  </div>

                  <div className="specs-rows-stack">
                    {(formData.specs || []).map((spec, index) => (
                      <div key={index} className="spec-row-item-edit">
                        <div className="spec-col-key">
                          <input
                            type="text"
                            placeholder="Название характеристики"
                            value={spec.key || ""}
                            onChange={(e) =>
                              handleUpdateSpecRow(index, "key", e.target.value)
                            }
                          />
                        </div>
                        <div className="spec-col-val">
                          <input
                            type="text"
                            placeholder="Значение"
                            value={spec.value || ""}
                            onChange={(e) =>
                              handleUpdateSpecRow(index, "value", e.target.value)
                            }
                          />
                        </div>
                        <button
                          type="button"
                          className="btn-remove-spec-row"
                          onClick={() => handleRemoveSpecRow(index)}
                          title="Удалить характеристику"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="btn-admin-secondary btn-add-spec-row"
                    onClick={handleAddSpecRow}
                  >
                    <Plus size={16} />
                    <span>Добавить характеристику</span>
                  </button>
                </div>
              )}

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="btn-admin-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="btn-admin-primary"
                  disabled={uploading}
                >
                  <Save size={16} />
                  <span>
                    {editingId ? "Сохранить изменения" : "Создать товар"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Excel Import Modal */}
      {isExcelModalOpen && (
        <div
          className="admin-modal-overlay"
          onClick={() => setIsExcelModalOpen(false)}
        >
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="modal-title">Импорт файлов XLS/XLSX/CSV</h3>
              <button
                className="btn-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-form">
              <div className="excel-drop-zone">
                <FileSpreadsheet size={48} className="excel-icon" />
                <h4 className="drop-title">
                  Выберите или перетащите файл Excel (.xlsx, .csv)
                </h4>
                <p className="drop-sub">
                  Система автоматически сопоставит <b>Артикул (SKU)</b> и
                  обновит цены и остатки на складах.
                </p>

                <label className="btn-admin-primary btn-upload-excel">
                  <Upload size={16} />
                  <span>Загрузить прайс-лист Excel</span>
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    style={{ display: "none" }}
                    onChange={handleExcelFileUpload}
                  />
                </label>
              </div>

              {excelSuccessMsg && (
                <div className="settings-alert-success">
                  <CheckCircle2 size={18} />
                  <span>{excelSuccessMsg}</span>
                </div>
              )}

              <div className="excel-format-hints">
                <h5>Формат колонок в Excel файле:</h5>
                <ul>
                  <li>
                    <code>Артикул</code> (или <code>SKU</code>) — ключ для
                    поиска товара
                  </li>
                  <li>
                    <code>Цена</code> (или <code>Price</code>) — новая цена
                    товара в ₸
                  </li>
                  <li>
                    <code>Остаток</code> (или <code>Stock</code>) — количество
                    на складе
                  </li>
                  <li>
                    <code>Наименование</code> (или <code>Title</code>) —
                    название автозапчасти
                  </li>
                </ul>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="btn-admin-secondary"
                  onClick={() => setIsExcelModalOpen(false)}
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
