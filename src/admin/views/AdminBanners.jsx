import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  X,
  Save,
  Edit2,
  Eye,
  EyeOff,
  UploadCloud,
  ExternalLink,
  CheckCircle2,
  Layers,
  Filter,
  Loader2,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import "./AdminBanners.css";

export const AdminBanners = () => {
  const { showToast } = useApp();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    btnText: "Подробнее",
    btnLink: "/catalog",
    image: "/assets/img/hero_bg.webp",
    status: "active",
  });

  const loadBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/banners?all=true");
      if (res.ok) setBanners(await res.json());
    } catch (err) {
      console.error("Failed to load banners:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingBanner(null);
    setFormData({
      title: "",
      subtitle: "",
      btnText: "Подробнее",
      btnLink: "/catalog",
      image: "/assets/img/hero_bg.webp",
      status: "active",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      btnText: banner.btnText || "Подробнее",
      btnLink: banner.btnLink || "/catalog",
      image: banner.image || "/assets/img/hero_bg.webp",
      status: banner.status || "active",
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const body = new FormData();
    body.append("image", file);
    body.append("type", "banner");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setFormData((prev) => ({ ...prev, image: data.url }));
        if (showToast) showToast("Изображение успешно загружено");
      } else {
        if (showToast)
          showToast(data.message || "Ошибка загрузки файла", "error");
      }
    } catch (err) {
      console.error("Upload error:", err);
      if (showToast) showToast("Ошибка соединения с сервером", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleToggleStatus = async (banner) => {
    const newStatus = banner.status === "disabled" ? "active" : "disabled";
    try {
      const res = await fetch(`/api/banners/${banner.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setBanners((prev) =>
          prev.map((b) => (b.id === banner.id ? updated : b)),
        );
        if (showToast) {
          showToast(
            newStatus === "disabled"
              ? `Баннер "${banner.title}" отключен`
              : `Баннер "${banner.title}" включен`,
          );
        }
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!window.confirm("Вы действительно хотите удалить этот баннер?")) return;
    try {
      const res = await fetch(`/api/banners/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBanners((prev) => prev.filter((b) => b.id !== id));
        if (showToast) showToast("Баннер успешно удален");
      }
    } catch (err) {
      console.error("Failed to delete banner:", err);
    }
  };

  const handleSaveBanner = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      const url = editingBanner
        ? `/api/banners/${editingBanner.id}`
        : "/api/banners";
      const method = editingBanner ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const saved = await res.json();
        if (editingBanner) {
          setBanners((prev) =>
            prev.map((b) => (b.id === editingBanner.id ? saved : b)),
          );
          if (showToast) showToast("Баннер обновлен");
        } else {
          setBanners((prev) => [saved, ...prev]);
          if (showToast) showToast("Новый баннер сохранен");
        }
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error("Failed to save banner:", err);
      if (showToast) showToast("Ошибка сохранения баннера", "error");
    }
  };

  const filteredBanners = banners.filter((b) => {
    if (statusFilter === "active") return b.status !== "disabled";
    if (statusFilter === "disabled") return b.status === "disabled";
    return true;
  });

  return (
    <div className="admin-banners-view">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Баннеры и Промо-акции</h1>
          <p className="admin-page-subtitle">
            Управление рекламными баннерами на главной странице
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Filter
              size={15}
              style={{
                position: "absolute",
                left: "12px",
                pointerEvents: "none",
                color: "#64748b",
                zIndex: 1,
              }}
            />
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
              <option value="all">Все баннеры ({banners.length})</option>
              <option value="active">Активные</option>
              <option value="disabled">Отключенные</option>
            </select>
          </div>

          <button className="btn-admin-primary" onClick={handleOpenCreateModal}>
            <Plus size={16} />
            <span>Добавить баннер</span>
          </button>
        </div>
      </div>

      {filteredBanners.length === 0 ? (
        <div className="admin-empty-state-card">
          <div className="empty-state-icon">
            <Layers size={44} />
          </div>
          <h3 className="empty-state-title">Баннеры не найдены</h3>
          <p className="empty-state-subtitle">
            {statusFilter === "all"
              ? "В вашей системе пока нет созданных баннеров. Добавьте первый промо-баннер для главной страницы."
              : "В выбранной категории баннеры отсутствуют."}
          </p>
          <button
            className="btn-admin-primary"
            onClick={handleOpenCreateModal}
            style={{ marginTop: "8px" }}
          >
            <Plus size={16} />
            <span>Добавить баннер</span>
          </button>
        </div>
      ) : (
        <div className="banners-grid">
          {filteredBanners.map((b) => (
            <div
              key={b.id}
              className={`ad-banner-card ${b.status === "disabled" ? "is-disabled" : ""}`}
            >
              <div className="ad-banner-img-box">
                <img src={b.image} alt={b.title} />
                <div className="ad-banner-status-badge-wrap">
                  {b.status === "disabled" ? (
                    <span className="ad-banner-status-badge disabled">
                      <EyeOff size={11} /> Отключен
                    </span>
                  ) : (
                    <span className="ad-banner-status-badge active">
                      <CheckCircle2 size={11} /> Активен
                    </span>
                  )}
                </div>
              </div>

              <div className="ad-banner-info">
                <h3 className="ad-banner-title">{b.title}</h3>
                <p className="ad-banner-sub">{b.subtitle || "Без описания"}</p>

                <div className="ad-banner-btn-preview">
                  <span className="btn-preview-tag">
                    <ExternalLink size={12} />
                    {b.btnText || "Подробнее"}
                  </span>
                  <span
                    className="btn-link-url"
                    title={b.btnLink || "/catalog"}
                  >
                    {b.btnLink || "/catalog"}
                  </span>
                </div>
              </div>

              <div className="ad-banner-actions">
                <button
                  className={`btn-action-toggle ${b.status === "disabled" ? "enable" : "disable"}`}
                  onClick={() => handleToggleStatus(b)}
                  title={
                    b.status === "disabled"
                      ? "Включить баннер"
                      : "Отключить баннер"
                  }
                >
                  {b.status === "disabled" ? (
                    <>
                      <Eye size={14} /> <span>Включить</span>
                    </>
                  ) : (
                    <>
                      <EyeOff size={14} /> <span>Отключить</span>
                    </>
                  )}
                </button>

                <button
                  className="btn-action-edit"
                  onClick={() => handleOpenEditModal(b)}
                  title="Редактировать баннер"
                >
                  <Edit2 size={14} /> <span>Изменить</span>
                </button>

                <button
                  className="btn-action-delete"
                  onClick={() => handleDeleteBanner(b.id)}
                  title="Удалить баннер"
                >
                  <Trash2 size={14} /> <span>Удалить</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div
          className="admin-modal-overlay"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="admin-modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "580px" }}
          >
            <div className="admin-modal-header">
              <h3 className="modal-title">
                {editingBanner
                  ? "Редактирование баннера"
                  : "Добавить новый баннер"}
              </h3>
              <button
                className="btn-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="admin-modal-form">
              <div className="form-group">
                <label>Заголовок баннера *</label>
                <input
                  type="text"
                  required
                  placeholder="Например: Скидка 15% на оригинальные масла Motul"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Текст / Описание баннера</label>
                <input
                  type="text"
                  placeholder="Например: Бесплатная доставка по Астане от 50 000 ₸"
                  value={formData.subtitle}
                  onChange={(e) =>
                    setFormData({ ...formData, subtitle: e.target.value })
                  }
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "14px",
                }}
              >
                <div className="form-group">
                  <label>Текст кнопки</label>
                  <input
                    type="text"
                    placeholder="Подробнее / Перейти"
                    value={formData.btnText}
                    onChange={(e) =>
                      setFormData({ ...formData, btnText: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Ссылка кнопки (URL)</label>
                  <input
                    type="text"
                    placeholder="/catalog или https://..."
                    value={formData.btnLink}
                    onChange={(e) =>
                      setFormData({ ...formData, btnLink: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Фотография баннера *</label>
                <div className="image-upload-wrapper">
                  <div className="image-preview-area">
                    {formData.image ? (
                      <img
                        src={formData.image}
                        alt="Превью баннера"
                        className="upload-preview-img"
                      />
                    ) : (
                      <div className="no-image-placeholder">
                        <ImageIcon size={32} />
                        <span>Выберите или загрузите фото</span>
                      </div>
                    )}
                  </div>

                  <div className="upload-controls">
                    <label
                      className="btn-file-upload"
                      style={{ display: "flex" }}
                    >
                      {uploading ? (
                        <Loader2 size={16} className="spin" />
                      ) : (
                        <UploadCloud size={16} />
                      )}
                      <span>
                        {uploading ? "Загрузка..." : "Загрузить файл"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        style={{ display: "none" }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Статус баннера</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  style={{
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    background: "#f8fafc",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  <option value="active">
                    Активен (Отображается на сайте)
                  </option>
                  <option value="disabled">Отключен (Скрыт с сайта)</option>
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
                <button type="submit" className="btn-admin-primary">
                  <Save size={16} />
                  <span>Сохранить баннер</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
