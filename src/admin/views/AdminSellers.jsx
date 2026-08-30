import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, User, Search, Eye, EyeOff, Copy } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import './AdminSellers.css';

const KZ_CITIES = [
  'Астана', 'Алматы', 'Шымкент', 'Караганда', 'Атырау', 'Актобе', 'Павлодар',
  'Семей', 'Усть-Каменогорск', 'Тараз', 'Петропавловск', 'Уральск', 'Костанай',
  'Кызылорда', 'Актау', 'Темиртау', 'Туркестан', 'Кокшетау', 'Талдыкорган',
  'Экибастуз', 'Риддер', 'Жезказган', 'Балхаш', 'Рудный'
];

function formatPhoneKZ(input) {
  if (!input) return '';
  const digits = input.replace(/\D/g, '');
  let num = digits;
  if (num.startsWith('7') || num.startsWith('8')) {
    num = num.substring(1);
  }
  num = num.substring(0, 10);
  if (num.length === 0) return '+7 (';
  let formatted = '+7 (';
  formatted += num.substring(0, 3);
  if (num.length > 3) {
    formatted += ') ' + num.substring(3, 6);
  }
  if (num.length > 6) {
    formatted += '-' + num.substring(6, 8);
  }
  if (num.length > 8) {
    formatted += '-' + num.substring(8, 10);
  }
  return formatted;
}

export const AdminSellers = () => {
  const { showToast } = useApp();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const toast = (msg, type) => { if (showToast) showToast(msg, type); };

  const emptyForm = {
    name: '', username: '', password: '',
    email: '', phone: '', city: 'Астана',
    status: 'active'
  };
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sellers');
      if (res.ok) setSellers(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setShowPass(false); setIsModalOpen(true); };
  const openEdit = (s) => {
    setEditingId(s.id);
    setForm({ name: s.name, username: s.username || '', password: s.password || '',
               email: s.email || '', phone: s.phone || '', city: s.city || 'Астана',
               status: s.status });
    setShowPass(false);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast('Укажите название / имя поставщика', 'error'); return; }
    if (!form.username.trim()) { toast('Укажите логин поставщика', 'error'); return; }
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/sellers/${editingId}` : '/api/sellers';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) {
      toast(editingId ? 'Поставщик обновлён' : 'Поставщик создан', 'success');
      setIsModalOpen(false);
      load();
    } else toast('Ошибка сохранения', 'error');
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Удалить поставщика "${name}"?`)) return;
    const res = await fetch(`/api/sellers/${id}`, { method: 'DELETE' });
    if (res.ok) { toast('Поставщик удалён'); load(); }
  };

  const copyCode = (code) => {
    navigator.clipboard?.writeText(code);
    toast(`Код ${code} скопирован`);
  };

  const filtered = sellers.filter((s) =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.code?.includes(search) || (s.username || '').includes(search)
  );

  return (
    <div className="admin-sellers-view">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Поставщики</h1>
          <p className="admin-page-subtitle">Управление аккаунтами поставщиков и их доступом</p>
        </div>
        <button className="btn-admin-primary" onClick={openAdd}><Plus size={16} /><span>Добавить поставщика</span></button>
      </div>

      <div className="admin-filter-card">
        <div className="search-input-box">
          <Search size={18} />
          <input placeholder="Поиск по имени, логину или коду..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="admin-card table-card-container">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Поставщик</th><th>Код SUP</th><th>Логин</th>
                <th>Город</th><th>Статус</th><th style={{ textAlign: 'right' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Загрузка...</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="sellers-empty-state">
                      <div className="sellers-empty-icon"><User size={32} /></div>
                      <div className="sellers-empty-title">Поставщиков нет</div>
                      <div className="sellers-empty-hint">Нажмите «Добавить поставщика» чтобы добавить первого</div>
                    </div>
                  </td>
                </tr>
              ) : filtered.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{s.email || '—'} · {s.phone || '—'}</div>
                  </td>
                  <td>
                    <div className="seller-code-pill" onClick={() => copyCode(s.code)} title="Нажмите чтобы скопировать">
                      {s.code} <Copy size={11} />
                    </div>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{s.username || '—'}</td>
                  <td style={{ fontSize: 13, color: '#64748b' }}>{s.city || '—'}</td>
                  <td>
                    <span className={`status-pill-badge ${s.status === 'active' ? 'active' : 'disabled'}`}>
                      <span className="status-dot" />
                      {s.status === 'active' ? 'Активен' : 'Заблокирован'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="table-actions-cell">
                      <button className="btn-action-icon edit" onClick={() => openEdit(s)} title="Редактировать"><Edit2 size={15} /></button>
                      <button className="btn-action-icon delete" onClick={() => handleDelete(s.id, s.name)} title="Удалить"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-box" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="modal-title">{editingId ? 'Редактировать поставщика' : 'Новый поставщик'}</h3>
              <button className="btn-modal-close" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form className="admin-modal-form" onSubmit={handleSave}>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Название / Имя *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ООО Автодеталь" required />
                </div>
                <div className="form-group">
                  <label>Город</label>
                  <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}>
                    {KZ_CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Логин (username) *</label>
                  <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="supplier_name" required />
                </div>
                <div className="form-group">
                  <label>Пароль *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="supplier123"
                      style={{ paddingRight: 36 }}
                      required
                    />
                    <button type="button" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }} onClick={() => setShowPass(!showPass)}>
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="supplier@email.kz" />
                </div>
                <div className="form-group">
                  <label>Телефон</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: formatPhoneKZ(e.target.value) })}
                    placeholder="+7 (777) 000-00-00"
                  />
                </div>
              </div>
              <div className="form-group" style={{ marginTop: 14 }}>
                <label>Статус</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="active">Активен</option>
                  <option value="disabled">Заблокирован</option>
                </select>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="btn-admin-secondary" onClick={() => setIsModalOpen(false)}>Отмена</button>
                <button type="submit" className="btn-admin-primary"><Save size={15} /><span>Сохранить</span></button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
