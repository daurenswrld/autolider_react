import React, { useState, useEffect } from 'react';
import { FileText, Search, RefreshCw, CheckCircle2, Clock, XCircle, Trash2, Phone, Copy, Check, MessageSquare, AlertCircle, Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import './AdminRequests.css';

export const AdminRequests = () => {
  const { showToast } = useApp();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [copiedVin, setCopiedVin] = useState(null);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteText, setNoteText] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/vin-requests');
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      } else {
        if (showToast) showToast('Ошибка при загрузке заявок', 'error');
      }
    } catch (err) {
      console.error('Fetch VIN requests error:', err);
      if (showToast) showToast('Ошибка сети при загрузке заявок', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/vin-requests/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
        if (showToast) showToast(`Статус заявки обновлен на "${updated.statusText}"`, 'success');
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      if (showToast) showToast('Не удалось обновить статус', 'error');
    }
  };

  const handleSaveNote = async (id) => {
    try {
      const res = await fetch(`/api/vin-requests/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: noteText })
      });
      if (res.ok) {
        const updated = await res.json();
        setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
        setEditingNoteId(null);
        setNoteText('');
        if (showToast) showToast('Заметка сохранена', 'success');
      }
    } catch (err) {
      console.error('Failed to save note:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Вы действительно хотите удалить эту заявку?')) return;
    try {
      const res = await fetch(`/api/vin-requests/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r.id !== id));
        if (showToast) showToast('Заявка успешно удалена', 'success');
      }
    } catch (err) {
      console.error('Delete VIN request error:', err);
      if (showToast) showToast('Ошибка при удалении заявки', 'error');
    }
  };

  const handleCopyVin = (vin) => {
    navigator.clipboard.writeText(vin);
    setCopiedVin(vin);
    if (showToast) showToast(`VIN ${vin} скопирован в буфер обмена`, 'success', 2000);
    setTimeout(() => setCopiedVin(null), 2000);
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      (req.vin || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.phone || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && req.status === statusFilter;
  });

  const countPending = requests.filter((r) => r.status === 'pending').length;
  const countProcessing = requests.filter((r) => r.status === 'processing').length;
  const countCompleted = requests.filter((r) => r.status === 'completed').length;
  const countCanceled = requests.filter((r) => r.status === 'canceled').length;

  const getStatusBadge = (status, text) => {
    switch (status) {
      case 'completed':
        return <span className="vin-status-badge completed"><CheckCircle2 size={13} /> {text || 'Выполнена'}</span>;
      case 'processing':
        return <span className="vin-status-badge processing"><Clock size={13} /> {text || 'В обработке'}</span>;
      case 'canceled':
        return <span className="vin-status-badge canceled"><XCircle size={13} /> {text || 'Отклонена'}</span>;
      default:
        return <span className="vin-status-badge pending"><AlertCircle size={13} /> {text || 'Новая'}</span>;
    }
  };

  return (
    <div className="admin-requests-view">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Заявки на подбор по VIN</h1>
          <p className="admin-page-subtitle">Централизованный список обращений клиентов для поиска деталей по VIN-коду</p>
        </div>
        <button className="btn-refresh" onClick={fetchRequests} title="Обновить список">
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          <span>Обновить</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="requests-metrics-grid">
        <div className="metric-card total">
          <div className="metric-icon-box"><FileText size={20} /></div>
          <div>
            <div className="metric-val">{requests.length}</div>
            <div className="metric-label">Всего заявок</div>
          </div>
        </div>
        <div className="metric-card pending">
          <div className="metric-icon-box"><AlertCircle size={20} /></div>
          <div>
            <div className="metric-val">{countPending}</div>
            <div className="metric-label">Новые (требуют ответа)</div>
          </div>
        </div>
        <div className="metric-card processing">
          <div className="metric-icon-box"><Clock size={20} /></div>
          <div>
            <div className="metric-val">{countProcessing}</div>
            <div className="metric-label">В обработке</div>
          </div>
        </div>
        <div className="metric-card completed">
          <div className="metric-icon-box"><CheckCircle2 size={20} /></div>
          <div>
            <div className="metric-val">{countCompleted}</div>
            <div className="metric-label">Выполненные</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-card toolbar-card">
        <div className="toolbar-flex">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Поиск по VIN, имени или телефону..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-select-wrapper">
            <Filter size={16} className="filter-icon" />
            <select
              className="filter-dropdown"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Все заявки ({requests.length})</option>
              <option value="pending">Новые ({countPending})</option>
              <option value="processing">В обработке ({countProcessing})</option>
              <option value="completed">Выполненные ({countCompleted})</option>
              <option value="canceled">Отклоненные ({countCanceled})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table Container */}
      <div className="admin-card table-card">
        {loading ? (
          <div className="empty-state"><p>Загрузка заявок...</p></div>
        ) : filteredRequests.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} color="#cbd5e1" />
            <h3>Заявки не найдены</h3>
            <p>Новые заявки от клиентов появятся здесь автоматически после отправки с сайта.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Дата и время</th>
                  <th>VIN-код автомобиля</th>
                  <th>Клиент</th>
                  <th>Контакты</th>
                  <th>Статус</th>
                  <th>Заметка менеджера</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => {
                  const cleanPhone = (req.phone || '').replace(/\D/g, '');
                  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone.startsWith('7') || cleanPhone.startsWith('8') ? '7' + cleanPhone.slice(1) : cleanPhone}` : '#';

                  return (
                    <tr key={req.id} className={req.status === 'pending' ? 'row-pending' : ''}>
                      <td className="date-cell">
                        <span className="date-text">{req.date}</span>
                      </td>
                      <td>
                        <div className="vin-badge-box">
                          <span className="vin-code">{req.vin}</span>
                          <button
                            className="btn-copy-vin"
                            onClick={() => handleCopyVin(req.vin)}
                            title="Скопировать VIN"
                          >
                            {copiedVin === req.vin ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </td>
                      <td>
                        <div className="customer-info">
                          <span className="customer-name">{req.name}</span>
                          {req.email && <span className="customer-email">{req.email}</span>}
                        </div>
                      </td>
                      <td>
                        <div className="phone-actions-cell">
                          <span className="phone-text">{req.phone}</span>
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-wa"
                            title="Написать в WhatsApp"
                          >
                            <Phone size={13} />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      </td>
                      <td>
                        <select
                          className={`status-select ${req.status}`}
                          value={req.status}
                          onChange={(e) => handleStatusChange(req.id, e.target.value)}
                        >
                          <option value="pending">Новая</option>
                          <option value="processing">В обработке</option>
                          <option value="completed">Выполнена</option>
                          <option value="canceled">Отклонена</option>
                        </select>
                      </td>
                      <td>
                        {editingNoteId === req.id ? (
                          <div className="note-edit-box">
                            <input
                              type="text"
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              placeholder="Добавить заметку..."
                              className="note-input"
                              autoFocus
                            />
                            <button
                              className="btn-save-note"
                              onClick={() => handleSaveNote(req.id)}
                            >
                              ОК
                            </button>
                          </div>
                        ) : (
                          <div
                            className="note-view-box"
                            onClick={() => {
                              setEditingNoteId(req.id);
                              setNoteText(req.note || '');
                            }}
                            title="Кликните для редактирования"
                          >
                            <MessageSquare size={13} color="#94a3b8" />
                            <span>{req.note || 'Нажмите, чтобы добавить заметку...'}</span>
                          </div>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn-delete-req"
                          onClick={() => handleDelete(req.id)}
                          title="Удалить заявку"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
