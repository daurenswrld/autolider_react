import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Wrench,
  Clock,
  ArrowLeft,
  CheckCircle2,
  HardHat,
} from "lucide-react";
import "./AdminWarehouses.css";

export const AdminWarehouses = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-warehouses-view">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Склады и Магазины</h1>
          <p className="admin-page-subtitle">
            Управление логистическими центрами и автоскладами по Казахстану
          </p>
        </div>
      </div>

      <div className="admin-dev-placeholder-card">
        <div className="dev-placeholder-icon-wrap">
          <Wrench size={40} className="dev-icon-wrench" />
        </div>

        <div className="dev-status-pill">
          <span>Раздел в разработке</span>
        </div>

        <h2 className="dev-placeholder-title">
          Раздел «Склады и Магазины» в разработке <br /> и требует уточнении
        </h2>

        <button
          className="btn-admin-primary"
          onClick={() => navigate("/admin")}
          style={{ marginTop: "16px" }}
        >
          <ArrowLeft size={16} />
          <span>Вернуться на Главный Дашборд</span>
        </button>
      </div>
    </div>
  );
};
