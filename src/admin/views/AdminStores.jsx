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

      <div className="admin-filter-card">
        <div className="search-input-box">
          <Search size={18} />
          <input
            placeholder="Поиск по городу или адресу..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div
          className="admin-card"
          style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}
        >
          Загрузка...
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="admin-card"
          style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}
        >
          <MapPin size={36} style={{ opacity: 0.3, marginBottom: 8 }} />
          <br />
          Магазинов нет
        </div>
      ) : (
        cities.map((city) => (
          <div key={city} className="admin-card" style={{ marginBottom: 16 }}>
            <div className="admin-card-header" style={{ marginBottom: 14 }}>
              <h3
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  margin: 0,
                  fontSize: 15,
                  fontWeight: 700,
                }}
              >
                <MapPin size={16} color="#ea2427" /> {city}
                <span
                  style={{
                    background: "#f1f5f9",
                    color: "#64748b",
                    borderRadius: 20,
                    padding: "2px 10px",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {filtered.filter((s) => s.city === city).length} магазинов
                </span>
              </h3>
            </div>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Адрес</th>
                    <th>Название</th>
                    <th>Телефон</th>
                    <th>Часы работы</th>
                    <th>Статус</th>
                    <th style={{ textAlign: "right" }}>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered
                    .filter((s) => s.city === city)
                    .map((s) => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 600 }}>{s.address}</td>
                        <td style={{ color: "#64748b", fontSize: 13 }}>
                          {s.name}
                        </td>
                        <td style={{ fontSize: 13 }}>{s.phone || "—"}</td>
                        <td style={{ fontSize: 13 }}>
                          {s.workingHours || "—"}
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
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              className="btn-action-icon delete"
                              onClick={() => handleDelete(s.id, s.address)}
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
