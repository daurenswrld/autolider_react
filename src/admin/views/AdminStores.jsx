import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  MapPin,
  Search,
  Phone,
  Clock,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

const CITIES = [
  "Астана",
  "Алматы",
  "Шымкент",
  "Қарағанды",
  "Атырау",
  "Актобе",
  "Павлодар",
  "Семей",
  "Өскемен",
  "Тараз",
  "Петропавл",
  "Орал",
  "Қостанай",
  "Қызылорда",
  "Атырау",
  "Ақтау",
  "Темиртау",
  "Түркістан",
  "Көкшетау",
  "Талдықорған",
  "Екібастұз",
  "Риддер",
  "Жезқазған",
  "Балқаш",
  "Рудный",
];

export const AdminStores = () => {
  const { showToast } = useApp();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const toast = (msg, type) => {
    if (showToast) showToast(msg, type);
  };

  const emptyForm = {
    city: "Астана",
    name: "",
    address: "",
    phone: "",
    workingHours: "Пн-Вс 09:00 - 20:00",
    status: "active",
  };
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stores");
      if (res.ok) setStores(await res.json());
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };
  const openEdit = (s) => {
    setEditingId(s.id);
    setForm({
      city: s.city,
      name: s.name,
      address: s.address || "",
      phone: s.phone || "",
      workingHours: s.workingHours || "",
      status: s.status,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.address.trim()) {
      toast("Укажите адрес магазина", "error");
      return;
    }
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/stores/${editingId}` : "/api/stores";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast(editingId ? "Магазин обновлён" : "Магазин добавлен");
      setIsModalOpen(false);
      load();
    } else toast("Ошибка сохранения", "error");
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Удалить магазин "${name}"?`)) return;
    const res = await fetch(`/api/stores/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast("Магазин удалён");
      load();
    }
  };

  const filtered = stores.filter(
    (s) =>
      !search ||
      s.city?.toLowerCase().includes(search.toLowerCase()) ||
      s.address?.toLowerCase().includes(search.toLowerCase()),
  );

  // Group by city
  const cities = [...new Set(filtered.map((s) => s.city))].filter(Boolean);

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Магазины и пункты выдачи</h1>
          <p className="admin-page-subtitle">
            Управление точками продаж по городам
          </p>
        </div>
        <button className="btn-admin-primary" onClick={openAdd}>
          <Plus size={16} />
          <span>Добавить магазин</span>
        </button>
      </div>

      {/* City quick filter pills */}
      <div className="admin-filter-card" style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <button
          className={`btn-admin-secondary ${!search ? "active" : ""}`}
          onClick={() => setSearch("")}
          style={{
            background: !search ? "#ea2427" : "#fff",
            color: !search ? "#fff" : "#475569",
            borderColor: !search ? "#ea2427" : "#e2e8f0",
            fontWeight: 600,
            fontSize: 13,
            padding: "8px 16px",
            borderRadius: 8
          }}
        >
          Все города ({stores.length})
        </button>
        {["Астана", "Алматы", "Шымкент", "Караганда"].map((cityName) => {
          const count = stores.filter((s) => s.city === cityName).length;
          const isActive = search.toLowerCase() === cityName.toLowerCase();
          return (
            <button
              key={cityName}
              onClick={() => setSearch(isActive ? "" : cityName)}
              style={{
                background: isActive ? "#ea2427" : "#f8fafc",
                color: isActive ? "#fff" : "#475569",
                border: "1px solid",
                borderColor: isActive ? "#ea2427" : "#e2e8f0",
                fontWeight: 600,
                fontSize: 13,
                padding: "8px 14px",
                borderRadius: 8,
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {cityName} ({count})
            </button>
          );
        })}

        <div className="search-input-box" style={{ marginLeft: "auto", minWidth: 260 }}>
          <Search size={18} />
          <input
            placeholder="Поиск по адресу или названию..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div
          className="admin-card"
          style={{ padding: "60px 20px", textAlign: "center", color: "#64748b" }}
        >
          <div className="loading-spinner-box" style={{ marginBottom: 12 }}>
            <MapPin size={32} className="animate-bounce" style={{ color: "#ea2427" }} />
          </div>
          <p style={{ margin: 0, fontWeight: 600 }}>Загрузка списка точек продаж...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="admin-card"
          style={{
            padding: "64px 24px",
            textAlign: "center",
            background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
            border: "1px dashed #cbd5e1",
            borderRadius: 16,
            marginTop: 12
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "rgba(234, 36, 39, 0.08)",
              color: "#ea2427",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
              boxShadow: "0 0 20px rgba(234, 36, 39, 0.15)"
            }}
          >
            <MapPin size={36} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 8px 0" }}>
            Магазины не найдены
          </h3>
          <p style={{ fontSize: 14, color: "#64748b", maxWidth: 440, margin: "0 auto 24px auto", lineHeight: 1.5 }}>
            {search
              ? `По вашему запросу "${search}" филиалы не найдены. Попробуйте сбросить фильтры.`
              : "В системе еще нет зарегистрированных филиалов и пунктов выдачи AutoLider. Добавьте первый магазин!"}
          </p>
          <button
            className="btn-admin-primary"
            onClick={openAdd}
            style={{ padding: "12px 24px", fontSize: 14, margin: "0 auto" }}
          >
            <Plus size={18} />
            <span>Добавить магазин</span>
          </button>
        </div>
      ) : (
        cities.map((city) => (
          <div key={city} className="admin-card" style={{ marginBottom: 20, border: "1px solid #e2e8f0", borderRadius: 14 }}>
            <div className="admin-card-header" style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
              <h3
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#0f172a"
                }}
              >
                <div style={{ background: "rgba(234, 36, 39, 0.1)", padding: 6, borderRadius: 8, display: "flex" }}>
                  <MapPin size={18} color="#ea2427" />
                </div>
                {city}
                <span
                  style={{
                    background: "#f1f5f9",
                    color: "#475569",
                    borderRadius: 20,
                    padding: "4px 12px",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {filtered.filter((s) => s.city === city).length} точек
                </span>
              </h3>
            </div>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Адрес филиала</th>
                    <th>Название точки</th>
                    <th>Телефон</th>
                    <th>Режим работы</th>
                    <th>Статус</th>
                    <th style={{ textAlign: "right" }}>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered
                    .filter((s) => s.city === city)
                    .map((s) => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 600, color: "#0f172a" }}>{s.address}</td>
                        <td style={{ color: "#64748b", fontSize: 13 }}>
                          {s.name || "Филиал AutoLider"}
                        </td>
                        <td style={{ fontSize: 13, color: "#334155" }}>
                          {s.phone ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                              <Phone size={13} color="#64748b" /> {s.phone}
                            </span>
                          ) : "—"}
                        </td>
                        <td style={{ fontSize: 13, color: "#334155" }}>
                          {s.workingHours ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                              <Clock size={13} color="#64748b" /> {s.workingHours}
                            </span>
                          ) : "—"}
                        </td>
                        <td>
                          <span
                            className={`status-pill-badge ${s.status === "active" ? "active" : "disabled"}`}
                          >
                            <span className="status-dot" />
                            {s.status === "active" ? "Открыт" : "Закрыт"}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div className="table-actions-cell">
                            <button
                              className="btn-action-icon edit"
                              onClick={() => openEdit(s)}
                              title="Редактировать"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              className="btn-action-icon delete"
                              onClick={() => handleDelete(s.id, s.address)}
                              title="Удалить"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}

      {isModalOpen && (
        <div
          className="admin-modal-overlay"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="admin-modal-box"
            style={{ maxWidth: 480 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h3 className="modal-title">
                {editingId ? "Редактировать магазин" : "Новый магазин"}
              </h3>
              <button
                className="btn-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form className="admin-modal-form" onSubmit={handleSave}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                }}
              >
                <div className="form-group">
                  <label>Город *</label>
                  <select
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  >
                    {CITIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Статус</label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                  >
                    <option value="active">Открыт</option>
                    <option value="disabled">Закрыт</option>
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label>Адрес *</label>
                  <input
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                    placeholder="ул. Кунаева, 12"
                    required
                  />
                </div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label>Название (необязательно)</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="AutoLider — ТЦ Mega"
                  />
                </div>
                <div className="form-group">
                  <label>Телефон</label>
                  <input
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    placeholder="+7 (717) 200-00-01"
                  />
                </div>
                <div className="form-group">
                  <label>Часы работы</label>
                  <input
                    value={form.workingHours}
                    onChange={(e) =>
                      setForm({ ...form, workingHours: e.target.value })
                    }
                    placeholder="Пн-Вс 09:00 - 20:00"
                  />
                </div>
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
                  <Save size={15} />
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
