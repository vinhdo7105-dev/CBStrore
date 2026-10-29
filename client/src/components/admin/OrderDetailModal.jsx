import React, { useState } from 'react';
import {
  X,
  Phone,
  MapPin,
  Clock,
  Printer,
  Trash2,
  CheckCircle,
  Truck,
  Package,
  XCircle,
  AlertCircle,
  CreditCard,
  User
} from 'lucide-react';
import { formatVND } from '../../services/api';

const STATUS_CONFIG = {
  pending: {
    label: 'Chờ xác nhận',
    color: '#d97706',
    bg: '#fef3c7',
    border: '#fde68a',
    icon: Clock
  },
  confirmed: {
    label: 'Đã xác nhận',
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
    icon: CheckCircle
  },
  shipping: {
    label: 'Đang vận chuyển',
    color: '#9333ea',
    bg: '#faf5ff',
    border: '#e9d5ff',
    icon: Truck
  },
  delivered: {
    label: 'Giao thành công',
    color: '#16a34a',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    icon: CheckCircle
  },
  cancelled: {
    label: 'Đã hủy đơn',
    color: '#dc2626',
    bg: '#fef2f2',
    border: '#fecaca',
    icon: XCircle
  }
};

export default function OrderDetailModal({
  order,
  onClose,
  onStatusChange,
  onDeleteOrder,
  onOpenPrint
}) {
  if (!order) return null;

  const [currentStatus, setCurrentStatus] = useState(order.status || 'pending');
  const [updating, setUpdating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleUpdateStatus = async (newStatus) => {
    if (newStatus === currentStatus) return;
    try {
      setUpdating(true);
      await onStatusChange(order.id, newStatus);
      setCurrentStatus(newStatus);
    } catch (err) {
      alert(err.message || 'Lỗi khi cập nhật trạng thái đơn');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      await onDeleteOrder(order.id);
      onClose();
    } catch (err) {
      alert(err.message || 'Lỗi khi xóa đơn hàng');
    }
  };

  const statusInfo = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.pending;
  const StatusIcon = statusInfo.icon;
  const items = order.items || [];
  const totalAmount = order.total_amount || items.reduce((sum, it) => sum + (it.unit_price * it.quantity), 0);

  const formatDate = (isoString) => {
    if (!isoString) return 'Vừa xong';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-container admin-order-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '820px', maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Chi Tiết Đơn Hàng: <span style={{ color: 'var(--accent-red)' }}>{order.id}</span>
                </h3>
                {order.is_pc_build && (
                  <span style={{
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 700
                  }}>
                    Bộ PC Đồng Bộ
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Thời gian đặt: {formatDate(order.created_at)}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => onOpenPrint(order)}
              className="btn-outline"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                fontSize: '0.82rem',
                fontWeight: 600
              }}
              title="In hóa đơn"
            >
              <Printer size={15} />
              <span>In Hóa Đơn</span>
            </button>
            <button className="modal-close-btn" onClick={onClose} title="Đóng">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Status Controller Bar */}
        <div style={{
          background: '#f8fafc',
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Trạng thái:</span>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '6px',
              background: statusInfo.bg,
              color: statusInfo.color,
              border: `1px solid ${statusInfo.border}`,
              fontSize: '0.85rem',
              fontWeight: 700
            }}>
              <StatusIcon size={14} />
              <span>{statusInfo.label}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Chuyển trạng thái:</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Object.entries(STATUS_CONFIG).map(([stKey, stVal]) => (
                <button
                  key={stKey}
                  type="button"
                  disabled={updating || currentStatus === stKey}
                  onClick={() => handleUpdateStatus(stKey)}
                  style={{
                    padding: '4px 9px',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    borderRadius: '4px',
                    border: '1px solid',
                    borderColor: currentStatus === stKey ? stVal.color : 'var(--border-subtle)',
                    background: currentStatus === stKey ? stVal.color : '#ffffff',
                    color: currentStatus === stKey ? '#ffffff' : 'var(--text-secondary)',
                    opacity: currentStatus === stKey ? 1 : 0.85,
                    cursor: currentStatus === stKey ? 'default' : 'pointer'
                  }}
                >
                  {stVal.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          {/* Customer & Delivery Card */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '20px',
            background: '#ffffff',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            marginBottom: '20px'
          }}>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Thông tin người nhận
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <User size={15} color="var(--accent-red)" />
                <strong style={{ fontSize: '0.98rem' }}>{order.customer_name}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '0.9rem' }}>
                <Phone size={15} color="var(--accent-navy)" />
                <span>Số điện thoại: <strong>{order.customer_phone}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                <MapPin size={15} color="#ea580c" style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>Địa chỉ: {order.customer_address}</span>
              </div>
              {order.note && (
                <div style={{ marginTop: '10px', fontSize: '0.82rem', padding: '6px 10px', background: '#fef3c7', borderRadius: '4px', color: '#92400e' }}>
                  <strong>Ghi chú:</strong> {order.note}
                </div>
              )}
            </div>

            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Phương thức & Thanh toán
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '0.9rem' }}>
                <CreditCard size={15} color="var(--accent-navy)" />
                <span>Hình thức: <strong>{order.payment_method === 'vietqr' ? 'Chuyển khoản VietQR' : 'COD (Thu tiền tận nơi)'}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '0.9rem' }}>
                <Package size={15} color="#16a34a" />
                <span>Loại đơn: <strong>{order.is_pc_build ? 'Cấu hình trọn bộ' : 'Linh kiện thông thường'}</strong></span>
              </div>
              <div style={{ marginTop: '12px', padding: '10px 14px', background: '#f8fafc', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Tổng giá trị thanh toán:</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-red)', marginTop: '2px' }}>
                  {formatVND(totalAmount)}
                </div>
              </div>
            </div>
          </div>

          {/* Items List */}
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Package size={16} />
            <span>Danh sách sản phẩm ({items.length} mặt hàng)</span>
          </h4>

          <div style={{
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            marginBottom: '20px'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  <th style={{ padding: '10px 14px', width: '56px' }}>Ảnh</th>
                  <th style={{ padding: '10px 14px' }}>Tên sản phẩm / Linh kiện</th>
                  <th style={{ padding: '10px 14px', width: '90px', textAlign: 'center' }}>Danh mục</th>
                  <th style={{ padding: '10px 14px', width: '60px', textAlign: 'center' }}>SL</th>
                  <th style={{ padding: '10px 14px', width: '110px', textAlign: 'right' }}>Đơn giá</th>
                  <th style={{ padding: '10px 14px', width: '120px', textAlign: 'right' }}>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '10px 14px' }}>
                      <img
                        src={it.product_image || 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=100'}
                        alt={it.product_name}
                        style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px', background: '#f8fafc' }}
                      />
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.88rem' }}>{it.product_name}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Mã: {it.product_id}</div>
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', background: '#f1f5f9', padding: '2px 6px', borderRadius: '3px', fontWeight: 600 }}>
                        {it.category_id || '-'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700 }}>
                      {it.quantity}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--text-secondary)' }}>
                      {formatVND(it.unit_price)}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: 'var(--accent-red)' }}>
                      {formatVND(it.subtotal || (it.unit_price * it.quantity))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Delete Order Action Area */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)'
          }}>
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#dc2626',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  padding: '6px 12px',
                  borderRadius: '4px',
                  background: '#fef2f2'
                }}
              >
                <Trash2 size={15} />
                <span>Xóa đơn hàng này</span>
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.84rem', color: '#dc2626', fontWeight: 600 }}>Xác nhận xóa vĩnh viễn?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  style={{
                    background: '#dc2626',
                    color: '#fff',
                    padding: '4px 12px',
                    fontSize: '0.8rem',
                    borderRadius: '4px',
                    fontWeight: 700
                  }}
                >
                  Xóa Ngay
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  style={{
                    background: '#f1f5f9',
                    color: '#475569',
                    padding: '4px 10px',
                    fontSize: '0.8rem',
                    borderRadius: '4px'
                  }}
                >
                  Hủy
                </button>
              </div>
            )}

            <button
              type="button"
              className="primary-btn"
              onClick={onClose}
              style={{ padding: '8px 24px', fontSize: '0.9rem' }}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
