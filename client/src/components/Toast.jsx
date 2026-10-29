import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Toast() {
  const { toasts } = useCart();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast-msg ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}
        >
          {toast.type === 'error' ? (
            <AlertCircle size={18} color="var(--accent-rose)" className="toast-icon" />
          ) : (
            <CheckCircle2 size={18} color="var(--accent-emerald)" className="toast-icon" />
          )}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
