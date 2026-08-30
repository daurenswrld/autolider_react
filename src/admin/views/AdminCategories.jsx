import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  FolderTree,
  X,
  Save,
  CheckCircle2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Pencil,
  Search,
  Filter,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { uploadImageFile } from "../../services/api";
import "./AdminCategories.css";

const slugify = (text) => {
  if (!text) return "";
  const charMap = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "yo",
    ж: "zh",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "kh",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "shch",
    ъ: "",
    ы: "y",
    ь: "",
    э: "e",
    ю: "yu",
    я: "ya",
    ә: "a",
    ғ: "g",
    қ: "q",
    ң: "n",
    ө: "o",
    ұ: "u",
    ү: "u",
    h: "h",
  };
  return text
    .toString()
    .toLowerCase()
    .trim()
    .split("")
    .map((char) => charMap[char] || char)
    .join("")
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

export const AdminCategories = () => {
  const { showToast, products = [], rawCategories = [], refreshCategories } = useApp();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    img: "",
    status: "enabled",
  });

  const [isSlugEditable, setIsSlugEditable] = useState(false);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [imgSizeKb, setImgSizeKb] = useState("");

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories?all=true");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
    if (rawCategories && rawCategories.length > 0) {
      setCategories(rawCategories);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const countEnabled = categories.filter((c) => c.status !== "disabled").length;
  const countDisabled = categories.filter((c) => c.status === "disabled").length;

  const filteredCategories = categories.filter((cat) => {
    const matchesSearch =
      (cat.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cat.slug || "").toLowerCase().includes(searchTerm.toLowerCase());
    const isEnabled = cat.status !== "disabled";

    if (statusFilter === "enabled") return matchesSearch && isEnabled;
    if (statusFilter === "disabled") return matchesSearch && !isEnabled;
    return matchesSearch;
  });

  const handleOpenAddModal = () => {
    setEditingId(null);
    setImgSizeKb("");
    setFormData({ name: "", slug: "", img: "", status: "enabled" });
    setIsSlugEditable(false);
    setIsSlugManuallyEdited(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingId(cat.id);
    setImgSizeKb("");
    setFormData({
      name: cat.name || "",
      slug: cat.slug || slugify(cat.name || ""),
      img: cat.img || cat.photoUrl || "",
      status: cat.status || "enabled",
    });
    setIsSlugEditable(false);
    setIsSlugManuallyEdited(true);
    setIsModalOpen(true);
  };

  const handleNameChange = (e) => {
    const newName = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: newName,
      slug: isSlugManuallyEdited ? prev.slug : slugify(newName),
    }));
  };

  const handleSlugChange = (e) => {
    setIsSlugManuallyEdited(true);
    setFormData((prev) => ({
      ...prev,
      slug: e.target.value,
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const data = await uploadImageFile(file, "category");
      showToast(`Изображение успешно загружено (${data.sizeKb})`);
      setFormData((prev) => ({ ...prev, img: data.url }));
      setImgSizeKb(data.sizeKb);
    } catch (err) {
      console.error("File upload error:", err);
      showToast(err.message || "Ошибка загрузки файла", "error");
    } finally {
      setUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Удалить категорию "${name}"?`)) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        if (refreshCategories) refreshCategories();
        showToast(`Категория "${name}" удалена`);
      }
    } catch (err) {
      console.error("Error deleting category:", err);
    }
  };

  const handleToggleStatus = async (cat) => {
    const newStatus = cat.status === "disabled" ? "enabled" : "disabled";
    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCategories((prev) =>
          prev.map((c) => (c.id === cat.id ? updated : c)),
        );
        if (refreshCategories) refreshCategories();
        showToast(
          newStatus === "disabled"
            ? `Категория "${cat.name}" скрыта`
            : `Категория "${cat.name}" отображается`,
        );
      }
    } catch (err) {
      console.error("Error toggling status:", err);
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!formData.name.trim())
      return showToast("Укажите название категории", "error");

    try {
      if (editingId) {
        const res = await fetch(`/api/categories/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          const updated = await res.json();
          setCategories((prev) =>
            prev.map((c) => (c.id === editingId ? updated : c)),
          );
          if (refreshCategories) refreshCategories();
          showToast(`Категория "${updated.name}" обновлена!`);
        }
      } else {
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          const created = await res.json();
          setCategories((prev) => [...prev, created]);
          if (refreshCategories) refreshCategories();
          showToast(`Новая категория "${created.name}" добавлена!`);
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving category:", err);
      showToast("Ошибка сохранения категории", "error");
    }
  };

  return (
    <div className="admin-categories-view">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Категории товаров</h1>
          <p className="admin-page-subtitle">
            Управление разделами каталога и их отображением
          </p>
        </div>

        <button className="btn-admin-primary" onClick={handleOpenAddModal}>
          <Plus size={16} />
          <span>Добавить категорию</span>
        </button>
      </div>

      {/* Search and Status Filter Bar */}
      <div className="admin-filter-card" style={{ marginBottom: "16px" }}>
        <div className="search-input-box" style={{ maxWidth: "420px" }}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Поиск категории по названию или слагу..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-selects-group">
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
                cursor: "pointer"
              }}
            >
              <option value="all">Все статусы ({categories.length})</option>
              <option value="enabled">Отображаются ({countEnabled})</option>
              <option value="disabled">Скрытые ({countDisabled})</option>
            </select>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Категория</th>
                <th>Кол-во товаров</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                    Категории с выбранным статусом не найдены
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => {
                const isEnabled = cat.status !== "disabled";
                const imgSrc = cat.img || cat.photoUrl;
                const actualCount =
                  products.filter(
                    (p) =>
                      p.status !== "disabled" &&
                      (p.categoryId === cat.id || p.categoryName === cat.name),
                  ).length ||
                  cat.count ||
                  0;

                return (
                  <tr key={cat.id}>
                    <td>
                      <div className="category-title-row">
                        <div className="cat-thumb-box">
                          {imgSrc ? (
                            <img
                              src={imgSrc}
                              alt={cat.name}
                              className="cat-thumb-img"
                            />
                          ) : (
                            <FolderTree size={20} className="cat-icon" />
                          )}
                        </div>
                        <div
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <span className="font-bold">{cat.name}</span>
                          <span
                            style={{
                              fontSize: "12px",
                              color: "#94a3b8",
                              fontWeight: 500,
                            }}
                          >
                            /{cat.slug || slugify(cat.name)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="count-badge">{actualCount} товаров</span>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${isEnabled ? "delivered" : "disabled"}`}
                      >
                        {isEnabled ? (
                          <>
                            <CheckCircle2 size={13} /> Отображается
                          </>
                        ) : (
                          <>
                            <EyeOff size={13} /> Скрыта
                          </>
                        )}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions-row">
                        <button
                          className="btn-table-action toggle-visibility"
                          onClick={() => handleToggleStatus(cat)}
                          title={
                            isEnabled
                              ? "Скрыть категорию"
                              : "Показать категорию"
                          }
                        >
                          {isEnabled ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                        <button
                          className="btn-table-action edit"
                          onClick={() => handleOpenEditModal(cat)}
                          title="Редактировать"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="btn-table-action delete"
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          title="Удалить"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div
          className="admin-modal-overlay"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="modal-title">
                {editingId ? "Редактировать категорию" : "Добавить категорию"}
              </h3>
              <button
                className="btn-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="admin-modal-form">
              <div className="form-group">
                <label>Название категории *</label>
                <input
                  type="text"
                  required
                  placeholder="Например: Тормозная система"
                  value={formData.name}
                  onChange={handleNameChange}
                />
              </div>

              {/* URL Slug Input with Pencil Edit Button */}
              <div className="form-group">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "6px",
                  }}
                >
                  <label style={{ margin: 0 }}>URL Слаг (для ЧПУ ссылки)</label>
                  <button
                    type="button"
                    className="btn-edit-slug"
                    onClick={() => setIsSlugEditable((prev) => !prev)}
                    title={
                      isSlugEditable
                        ? "Заблокировать слаг"
                        : "Редактировать слаг вручную"
                    }
                    style={{
                      background: isSlugEditable ? "#fee2e2" : "#f1f5f9",
                      color: isSlugEditable ? "#dc2626" : "#2563eb",
                      border: isSlugEditable
                        ? "1px solid #fca5a5"
                        : "1px solid #cbd5e1",
                      borderRadius: "6px",
                      padding: "4px 10px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <Pencil size={13} />
                    <span>{isSlugEditable ? "Зафиксировать" : "Изменить"}</span>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="авто-генерация слага"
                  value={formData.slug}
                  onChange={handleSlugChange}
                  readOnly={!isSlugEditable}
                  style={{
                    background: isSlugEditable ? "#ffffff" : "#f8fafc",
                    color: isSlugEditable ? "#0f172a" : "#64748b",
                    borderColor: isSlugEditable ? "#3b82f6" : "#e2e8f0",
                    cursor: isSlugEditable ? "text" : "default",
                  }}
                />
              </div>

              {/* Photo Upload */}
              <div className="form-group">
                <label>Фотография категории (для сетки в каталоге)</label>
                <div className="upload-picker-row">
                  <label className="btn-upload-file">
                    <ImageIcon size={16} />
                    <span>
                      {uploading ? "Загрузка..." : "Загрузить фото с ПК"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploading}
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>

                {formData.img && (
                  <div
                    className="img-preview-box hero"
                    style={{ marginTop: "10px" }}
                  >
                    <img src={formData.img} alt="Preview Category" />
                    <div>
                      <span>Изображение загружено</span>
                      {imgSizeKb && (
                        <div className="webp-compressed-badge">
                          ✓ Загружено ({imgSizeKb})
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Status Switch */}
              <div className="form-group">
                <label>Отображение в каталоге</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  style={{
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                  }}
                >
                  <option value="enabled">Отображать в каталоге</option>
                  <option value="disabled">Скрыть категорию</option>
                </select>
              </div>

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
                  <span>Сохранить</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
