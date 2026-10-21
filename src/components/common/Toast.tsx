import React from 'react';
import { useApp } from '../../context/AppContext';

export const Toast: React.FC = () => {
  const { toast, hideToast } = useApp();

  if (!toast) return null;

  const bgStyles = {
    success: 'bg-primary text-on-primary border-primary-container',
    warning: 'bg-secondary-container text-on-secondary-container border-secondary',
    error: 'bg-error text-on-error border-error-container',
    info: 'bg-tertiary text-on-tertiary border-tertiary-container',
  }[toast.type];

  const iconName = {
    success: 'check_circle',
    warning: 'warning',
    error: 'error',
    info: 'info',
  }[toast.type];

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce shadow-xl">
      <div className={`flex items-center gap-3 px-4 py-3 rounded border text-sm font-medium shadow-md ${bgStyles}`}>
        <span className="material-symbols-outlined text-[20px]">{iconName}</span>
        <span>{toast.message}</span>
        <button
          onClick={hideToast}
          className="ml-2 hover:opacity-75 transition-opacity"
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>
    </div>
  );
};
