import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, Heart } from 'lucide-react';
import './Toast.css';

export const Toast = () => {
  const { toast } = useApp();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="toast-icon success" size={20} />,
    warning: <AlertCircle className="toast-icon warning" size={20} />,
    info: <Info className="toast-icon info" size={20} />,
    heart: <Heart className="toast-icon heart" size={20} fill="#e63125" stroke="#e63125" />
  };

  return (
    <div className={`toast-container ${toast.type || 'success'}`}>
      <div className="toast-content">
        {icons[toast.type] || icons.success}
        <span className="toast-message">{toast.message}</span>
      </div>
    </div>
  );
};
