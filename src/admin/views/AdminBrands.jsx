import React, { useState, useEffect } from "react";
import {
  Car,
  Plus,
  Trash2,
  Edit3,
  Search,
  Image as ImageIcon,
  ChevronRight,
  X,
  RefreshCw,
  Globe,
  Layers,
  Eye,
  EyeOff,
  CheckCircle2,
  Filter,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { uploadImageFile } from "../../services/api";
import "./AdminBrands.css";

export const AdminBrands = () => {
  const { showToast } = useApp();

  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal states
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

  const [brandForm, setBrandForm] = useState({
    name: "",
    logoUrl: "",
    status: "enabled",
  });

  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [activeBrandForModel, setActiveBrandForModel] = useState(null);
  const [editingModel, setEditingModel] = useState(null);

  const [modelForm, setModelForm] = useState({
    name: "",
    photoUrl: "",
    status: "enabled",
  });

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/brands?all=true");
      if (res.ok) {
        const data = await res.json();
        setBrands(data);
      }
    } catch (err) {
      console.error("Failed to fetch brands:", err);
      showToast("Ошибка загрузки марок авто", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const [uploadingType, setUploadingType] = useState(null);
  const [logoSizeKb, setLogoSizeKb] = useState("");
  const [modelSizeKb, setModelSizeKb] = useState("");

  // Handle direct file upload & WebP compression via API Service
  const handleFileUpload = async (e, type, onSuccess) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingType(type);

    try {
      const data = await uploadImageFile(file, type);
      showToast(`Изображение успешно загружено (${data.sizeKb})`);
      onSuccess(data.url, data.sizeKb);
    } catch (err) {
      console.error("File upload error:", err);
      showToast(err.message || "Ошибка загрузки файла на сервер", "error");
    } finally {
      setUploadingType(null);
      if (e.target) e.target.value = "";
    }
  };

  // Open brand modal
  const handleOpenBrandModal = (brand = null) => {
    setLogoSizeKb("");
    if (brand) {
      setEditingBrand(brand);
      setBrandForm({
        name: brand.name,
        logoUrl: brand.logoUrl || "",
        status: brand.status || "enabled",
      });
    } else {
      setEditingBrand(null);
      setBrandForm({
        name: "",
        logoUrl: "",
        status: "enabled",
      });
    }
    setIsBrandModalOpen(true);
  };

  // Submit Brand
  const handleSaveBrand = async (e) => {
    e.preventDefault();
    if (!brandForm.name.trim()) {
      showToast("Укажите название марки авто", "error");
      return;
    }

    try {
      const url = editingBrand
        ? `/api/brands/${editingBrand.id}`
        : "/api/brands";
      const method = editingBrand ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brandForm),
      });

      if (res.ok) {
        showToast(
          editingBrand
            ? "Марка авто обновлена!"
            : "Новая марка авто успешно добавлена!",
        );
        setIsBrandModalOpen(false);
        fetchBrands();
      } else {
        const errData = await res.json();
        showToast(errData.message || "Ошибка сохранения", "error");
      }
    } catch (err) {
      console.error("Failed to save brand:", err);
      showToast("Ошибка обращения к серверу", "error");
    }
  };

  // Delete Brand
  const handleDeleteBrand = async (brandId, brandName) => {
    if (
      !window.confirm(`Удалить марку "${brandName}" и все привязанные модели?`)
    )
      return;

    try {
      const res = await fetch(`/api/brands/${brandId}`, { method: "DELETE" });
      if (res.ok) {
        showToast(`Марка "${brandName}" удалена!`);
        fetchBrands();
      }
    } catch (err) {
      console.error("Failed to delete brand:", err);
    }
  };

  // Open Model modal
  const handleOpenModelModal = (brand, model = null) => {
    setActiveBrandForModel(brand);
    setEditingModel(model);
    setModelSizeKb("");
    if (model) {
      setModelForm({
        name: model.name,
        photoUrl: model.photoUrl || "",
        status: model.status || "enabled",
      });
    } else {
      setModelForm({
        name: "",
        photoUrl: brand.heroUrl || "",
        status: "enabled",
      });
    }
    setIsModelModalOpen(true);
  };

  // Submit Model
  const handleSaveModel = async (e) => {
    e.preventDefault();
    if (!modelForm.name.trim()) {
      showToast("Укажите название модели", "error");
      return;
    }

    try {
      const url = editingModel
        ? `/api/brands/${activeBrandForModel.id}/models/${editingModel.id}`
        : `/api/brands/${activeBrandForModel.id}/models`;
      const method = editingModel ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(modelForm),
      });

      if (res.ok) {
        showToast(
          editingModel
            ? `Модель "${modelForm.name}" обновлена!`
            : `Модель "${modelForm.name}" привязана к ${activeBrandForModel.name}!`,
        );
        setIsModelModalOpen(false);
        fetchBrands();
      } else {
        showToast("Ошибка сохранения модели", "error");
      }
    } catch (err) {
      console.error("Failed to save model:", err);
    }
  };

  // Delete Model
  const handleDeleteModel = async (brandId, modelId, modelName) => {
    if (!window.confirm(`Удалить модель "${modelName}"?`)) return;

    try {
      const res = await fetch(`/api/brands/${brandId}/models/${modelId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast(`Модель "${modelName}" удалена`);
        fetchBrands();
      }
    } catch (err) {
      console.error("Failed to delete model:", err);
    }
  };

  const countEnabled = brands.filter((b) => b.status !== "disabled").length;
  const countDisabled = brands.filter((b) => b.status === "disabled").length;

  const filteredBrands = brands.filter((brand) => {
    const matchesSearch = brand.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const isEnabled = brand.status !== "disabled";

    if (statusFilter === "enabled") return matchesSearch && isEnabled;
    if (statusFilter === "disabled") return matchesSearch && !isEnabled;
    return matchesSearch;
  });

  return (
    <div className="admin-view-container">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Марки и Модели автомобилей</h1>
          <p className="admin-page-subtitle">
            Управление логотипами марок, обложками и привязанными моделями
            автомобилей
          </p>
        </div>
        <div className="admin-header-actions">
          <button
            className="btn-admin-secondary"
            onClick={fetchBrands}
            title="Обновить"
          >
            <RefreshCw size={16} className={loading ? "spin" : ""} />
            <span>Обновить</span>
          </button>
          <button
            className="btn-admin-primary"
            onClick={() => handleOpenBrandModal()}
          >
            <Plus size={16} />
            <span>Загрузить марку авто</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        className="admin-card brands-filter-card"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div
          className="search-input-box"
          style={{ flex: "1 1 300px", maxWidth: "420px" }}
        >
          <Search size={18} />
          <input
            type="text"
            placeholder="Поиск по названию марки..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchTerm("")}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center" }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <Filter size={15} style={{ position: "absolute", left: "12px", pointerEvents: "none", color: "#64748b", zIndex: 1 }} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "9px 14px 9px 34px",
              borderRadius: "10px",
              border: "1px solid #cbd5e1",
              background: "#f8fafc",
              fontSize: "13.5px",
              fontWeight: 600,
              color: "#1e293b",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="all">Все марки ({brands.length})</option>
            <option value="enabled">Отображаются ({countEnabled})</option>
            <option value="disabled">Скрытые ({countDisabled})</option>
          </select>
        </div>
      </div>

      {/* Brands Cards Grid */}
      {loading ? (
        <div className="admin-card loading-box">
          <RefreshCw size={24} className="spin" />
          <span>Загрузка марок и моделей...</span>
        </div>
      ) : filteredBrands.length === 0 ? (
        <div className="admin-card empty-brands-box">
          <Car size={48} />
          <h3>Марки авто не найдены</h3>
          <p>Добавьте первую марку авто с логотипом и фоновым изображением</p>
          <button
            className="btn-admin-primary"
            onClick={() => handleOpenBrandModal()}
          >
            <Plus size={16} />
            <span>Загрузить марку авто</span>
          </button>
        </div>
      ) : (
        <div className="brands-grid">
          {filteredBrands.map((brand) => (
            <div key={brand.id} className="brand-card admin-card">
              {/* Brand Cover Photo */}
              <div
                className="brand-hero-cover"
                style={{
                  backgroundImage: `url(${brand.heroUrl || "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80"})`,
                }}
              >
                <div className="brand-hero-overlay" />

                {/* Brand Logo Badge */}
                <div className="brand-logo-badge">
                  {brand.logoUrl ? (
                    <img src={brand.logoUrl} alt={brand.name} />
                  ) : (
                    <Car size={24} />
                  )}
                </div>

                <div className="brand-actions-btns">
                  <button
                    className="brand-action-btn edit"
                    onClick={() => handleOpenBrandModal(brand)}
                    title="Редактировать марку"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    className="brand-action-btn delete"
                    onClick={() => handleDeleteBrand(brand.id, brand.name)}
                    title="Удалить марку"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Brand Info */}
              <div className="brand-card-content">
                <div className="brand-title-row">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <h3 className="brand-name">{brand.name}</h3>
                    {brand.status === "disabled" && (
                      <EyeOff
                        size={18}
                        color="#ef4444"
                        title="Марка авто отключена (скрыта на сайте)"
                        style={{ flexShrink: 0 }}
                      />
                    )}
                  </div>
                  <span className="models-count-badge">
                    <Layers size={13} /> {(brand.models || []).length} моделей
                  </span>
                </div>

                {/* Models List */}
                <div className="brand-models-section">
                  <div className="models-header-row">
                    <span>Загруженные модели ({brand.name})</span>
                    <button
                      className="add-model-mini-btn"
                      onClick={() => handleOpenModelModal(brand)}
                    >
                      <Plus size={13} />
                      <span>Модель</span>
                    </button>
                  </div>

                  {(brand.models || []).length === 0 ? (
                    <div className="no-models-text">
                      Модели еще не добавлены. Нажмите "+ Модель" выше.
                    </div>
                  ) : (
                    <div className="models-chips-list">
                      {brand.models.map((model) => {
                        const isModelDisabled = model.status === "disabled";
                        return (
                          <div
                            key={model.id}
                            className={`model-chip ${isModelDisabled ? "disabled" : ""}`}
                            style={
                              isModelDisabled
                                ? { opacity: 0.65, borderStyle: "dashed" }
                                : {}
                            }
                          >
                            {model.photoUrl && (
                              <img
                                src={model.photoUrl}
                                alt={model.name}
                                className="model-chip-img"
                              />
                            )}
                            <div className="model-chip-info">
                              <span
                                className="model-name"
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                {model.name}
                                {isModelDisabled && (
                                  <EyeOff
                                    size={11}
                                    color="#ef4444"
                                    title="Модель отключена"
                                  />
                                )}
                              </span>
                            </div>
                            <button
                              className="edit-model-btn"
                              onClick={() => handleOpenModelModal(brand, model)}
                              title="Редактировать модель"
                            >
                              <Edit3 size={12} />
                            </button>
                            <button
                              className="remove-model-btn"
                              onClick={() =>
                                handleDeleteModel(
                                  brand.id,
                                  model.id,
                                  model.name,
                                )
                              }
                              title="Удалить модель"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: ADD/EDIT CAR BRAND */}
      {isBrandModalOpen && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-box">
            <div className="admin-modal-header">
              <h3>
                {editingBrand
                  ? "Редактирование марки авто"
                  : "Добавление марки автомобиля"}
              </h3>
              <button onClick={() => setIsBrandModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveBrand} className="admin-form">
              <div className="form-group">
                <label>
                  Название марки авто (например: BMW, Toyota, Haval) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Введите название марки..."
                  value={brandForm.name}
                  onChange={(e) =>
                    setBrandForm({ ...brandForm, name: e.target.value })
                  }
                />
              </div>

              {/* Status Switch for Brand */}
              <div className="form-group">
                <label>Статус марки авто</label>
                <select
                  value={brandForm.status || "enabled"}
                  onChange={(e) =>
                    setBrandForm({ ...brandForm, status: e.target.value })
                  }
                  style={{
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  <option value="enabled">
                    Активна (отображается на сайте)
                  </option>
                  <option value="disabled">
                    Отключена (скрыта из каталога)
                  </option>
                </select>
              </div>

              {/* Logo Upload */}
              <div className="form-group">
                <label>Логотип марки автомобиля *</label>
                <div className="upload-picker-row">
                  <label className="btn-upload-file">
                    <ImageIcon size={16} />
                    <span>
                      {uploadingType === "logo"
                        ? "Загрузка..."
                        : "Загрузить логотип с ПК"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingType === "logo"}
                      onChange={(e) =>
                        handleFileUpload(e, "logo", (url, size) => {
                          setBrandForm((prev) => ({ ...prev, logoUrl: url }));
                          setLogoSizeKb(size);
                        })
                      }
                    />
                  </label>
                </div>
                {brandForm.logoUrl && (
                  <div className="img-preview-box logo">
                    <img src={brandForm.logoUrl} alt="Preview Logo" />
                    <div>
                      <span>Логотип загружен</span>
                      {logoSizeKb && (
                        <div className="webp-compressed-badge">
                          ✓ Загружено ({logoSizeKb})
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="btn-admin-cancel"
                  onClick={() => setIsBrandModalOpen(false)}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="btn-admin-primary"
                  disabled={!!uploadingType}
                >
                  {editingBrand ? "Сохранить изменения" : "Сохранить марку"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD/EDIT MODEL */}
      {isModelModalOpen && activeBrandForModel && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-box">
            <div className="admin-modal-header">
              <h3>
                {editingModel
                  ? `Редактирование модели "${editingModel.name}"`
                  : `Добавление модели для марки ${activeBrandForModel.name}`}
              </h3>
              <button onClick={() => setIsModelModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveModel} className="admin-form">
              <div className="form-group">
                <label>Название модели (например: Camry XV70, X5 G05) *</label>
                <input
                  type="text"
                  required
                  placeholder="Введите название модели..."
                  value={modelForm.name}
                  onChange={(e) =>
                    setModelForm({ ...modelForm, name: e.target.value })
                  }
                />
              </div>

              {/* Status Switch for Model */}
              <div className="form-group">
                <label>Статус модели</label>
                <select
                  value={modelForm.status || "enabled"}
                  onChange={(e) =>
                    setModelForm({ ...modelForm, status: e.target.value })
                  }
                  style={{
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  <option value="enabled">
                    Активна (отображается на сайте)
                  </option>
                  <option value="disabled">
                    Отключена (скрыта из каталога)
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label>Фото модели автомобиля *</label>
                <div className="upload-picker-row">
                  <label className="btn-upload-file">
                    <ImageIcon size={16} />
                    <span>
                      {uploadingType === "model"
                        ? "Загрузка..."
                        : "Загрузить фото авто с ПК"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingType === "model"}
                      onChange={(e) =>
                        handleFileUpload(e, "model", (url, size) => {
                          setModelForm((prev) => ({ ...prev, photoUrl: url }));
                          setModelSizeKb(size);
                        })
                      }
                    />
                  </label>
                </div>
                {modelForm.photoUrl && (
                  <div className="img-preview-box hero">
                    <img src={modelForm.photoUrl} alt="Preview Model" />
                    <div>
                      <span>Фото модели загружено</span>
                      {modelSizeKb && (
                        <div className="webp-compressed-badge">
                          ✓ Загружено ({modelSizeKb})
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="btn-admin-cancel"
                  onClick={() => setIsModelModalOpen(false)}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="btn-admin-primary"
                  disabled={!!uploadingType}
                >
                  {editingModel
                    ? "Сохранить изменения"
                    : `Привязать модель к ${activeBrandForModel.name}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
