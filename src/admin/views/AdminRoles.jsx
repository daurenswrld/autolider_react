import React, { useState, useEffect } from "react";
import {
  Plus,
  Users,
  ShieldCheck,
  UserCheck,
  XCircle,
  CheckCircle2,
  Edit2,
  Trash2,
  X,
  Save,
  Lock,
  User,
  Mail,
  Phone,
  Key,
  Eye,
  EyeOff,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import "./AdminRoles.css";

export const AdminRoles = () => {
  const { showToast } = useApp();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    role: "manager",
    email: "",
    phone: "",
    status: "active",
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin-users");
      if (res.ok) setUsers(await res.json());
    } catch (err) {
      console.error("Failed to load admin users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      username: "",
      password: "",
      role: "manager",
      email: "",
      phone: "",
      status: "active",
    });
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || "",
      username: user.username || "",
      password: user.password || "",
      role: user.role || "manager",
      email: user.email || "",
      phone: user.phone || "",
      status: user.status || "active",
    });
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === "disabled" ? "active" : "disabled";
    try {
      const res = await fetch(`/api/admin-users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
        if (showToast) {
          showToast(
            newStatus === "disabled"
              ? `Аккаунт ${user.username} заблокирован`
              : `Аккаунт ${user.username} активирован`,
          );
        }
      }
    } catch (err) {
      console.error("Failed to toggle user status:", err);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Удалить данный аккаунт сотрудника?")) return;
    try {
      const res = await fetch(`/api/admin-users/${id}`, { method: "DELETE" });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        if (showToast) showToast("Аккаунт сотрудника удален");
      }
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.name.trim()) {
      if (showToast) showToast("Заполните имя и логин сотрудника", "error");
      return;
    }

    try {
      const url = editingUser
        ? `/api/admin-users/${editingUser.id}`
        : "/api/admin-users";
      const method = editingUser ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const saved = await res.json();
        if (editingUser) {
          setUsers((prev) =>
            prev.map((u) => (u.id === editingUser.id ? saved : u)),
          );
          if (showToast) showToast("Данные сотрудника обновлены");
        } else {
          setUsers((prev) => [saved, ...prev]);
          if (showToast) showToast("Создан новый аккаунт сотрудника");
        }
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error("Failed to save user:", err);
      if (showToast) showToast("Ошибка сохранения аккаунта", "error");
    }
  };

  return (
    <div className="admin-roles-view">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Сотрудники и Доступ</h1>
          <p className="admin-page-subtitle">
            Управление аккаунтами сотрудников для входа в панель управления и
            уровнями доступа
          </p>
        </div>

        <button className="btn-admin-primary" onClick={handleOpenCreateModal}>
          <Plus size={16} />
          <span>Добавить сотрудника</span>
        </button>
      </div>

      {/* Predefined Roles Cards Section */}

      {/* Staff Accounts List Table Section */}
      <div className="admin-card staff-accounts-section">
        <div className="staff-section-header">
          <div>
            <h3 className="staff-section-title">Аккаунты для входа в панель</h3>
            <p className="staff-section-sub">
              Все зарегистрированные логины сотрудников ({users.length})
            </p>
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Сотрудник / ФИО</th>
                <th>Логин</th>
                <th>Роль доступа</th>
                <th>Контакты</th>
                <th>Статус</th>
                <th style={{ textAlign: "right" }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className={u.status === "disabled" ? "disabled-row" : ""}
                >
                  <td>
                    <div className="user-name-cell">
                      <div className={`user-avatar-circle ${u.role}`}>
                        {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div className="user-info-text">
                        <span className="user-fullname">{u.name}</span>
                        <span className="user-created-date">
                          Создан: {u.createdAt || "—"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="user-username-badge">@{u.username}</span>
                  </td>
                  <td>
                    {u.role === "admin" ? (
                      <span className="role-pill-badge admin">
                        <ShieldCheck size={13} /> Администратор
                      </span>
                    ) : (
                      <span className="role-pill-badge manager">
                        <UserCheck size={13} /> Менеджер
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="user-contacts-box">
                      {u.email && <span>{u.email}</span>}
                      {u.phone && <span>{u.phone}</span>}
                      {!u.email && !u.phone && (
                        <span className="text-sub">—</span>
                      )}
                    </div>
                  </td>
                  <td>
                    {u.status === "disabled" ? (
                      <span className="status-badge disabled">
                        <XCircle size={12} /> Заблокирован
                      </span>
                    ) : (
                      <span className="status-badge active">
                        <CheckCircle2 size={12} /> Активен
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div className="table-actions-btns">
                      <button
                        className={`btn-action-status ${u.status === "disabled" ? "enable" : "disable"}`}
                        onClick={() => handleToggleStatus(u)}
                        title={
                          u.status === "disabled"
                            ? "Разблокировать"
                            : "Заблокировать"
                        }
                      >
                        {u.status === "disabled" ? (
                          <CheckCircle2 size={14} />
                        ) : (
                          <XCircle size={14} />
                        )}
                      </button>

                      <button
                        className="btn-action-edit"
                        onClick={() => handleOpenEditModal(u)}
                        title="Редактировать сотрудника"
                      >
                        <Edit2 size={14} />
                      </button>

                      <button
                        className="btn-action-delete"
                        onClick={() => handleDeleteUser(u.id)}
                        title="Удалить аккаунт"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form for Create / Edit Staff Member */}
      {isModalOpen && (
        <div
          className="admin-modal-overlay"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="admin-modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "540px" }}
          >
            <div className="admin-modal-header">
              <h3 className="modal-title">
                {editingUser
                  ? "Редактирование сотрудника"
                  : "Добавить нового сотрудника"}
              </h3>
              <button
                className="btn-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="admin-modal-form">
              <div className="form-group">
                <label>ФИО / Имя сотрудника *</label>
                <div className="input-icon-wrap">
                  <User size={16} className="input-icon" />
                  <input
                    type="text"
                    required
                    placeholder="Например: Иван Иванов"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "14px",
                }}
              >
                <div className="form-group">
                  <label>Логин для входа *</label>
                  <div className="input-icon-wrap">
                    <Key size={16} className="input-icon" />
                    <input
                      type="text"
                      required
                      placeholder="manager_ivan"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Пароль *</label>
                  <div className="input-icon-wrap">
                    <Lock size={16} className="input-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Пароль"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                    />
                    <button
                      type="button"
                      className="btn-toggle-pw"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Назначаемая роль доступа *</label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="role-select-input"
                >
                  <option value="admin">
                    Администратор (Полный доступ к панели)
                  </option>
                  <option value="manager">
                    Менеджер (Рабочий доступ: заказы, товары, клиенты)
                  </option>
                </select>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "14px",
                }}
              >
                <div className="form-group">
                  <label>Email</label>
                  <div className="input-icon-wrap">
                    <Mail size={16} className="input-icon" />
                    <input
                      type="email"
                      placeholder="ivan@autolider.kz"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Телефон</label>
                  <div className="input-icon-wrap">
                    <Phone size={16} className="input-icon" />
                    <input
                      type="text"
                      placeholder="+7 (777) 000-00-00"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Статус аккаунта</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="role-select-input"
                >
                  <option value="active">Активен (Доступ разрешен)</option>
                  <option value="disabled">Заблокирован (Вход запрещен)</option>
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
                  <span>Сохранить аккаунт</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
