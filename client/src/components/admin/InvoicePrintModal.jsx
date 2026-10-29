import React from 'react';
import { X, Printer, CheckCircle, ShieldCheck } from 'lucide-react';
import { formatVND } from '../../services/api';

export default function InvoicePrintModal({ order, onClose }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

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

  const items = order.items || [];
  const totalAmount = order.total_amount || items.reduce((sum, it) => sum + (it.unit_price * it.quantity), 0);

  return (
    <div className="modal-backdrop print-modal-backdrop" onClick={onClose}>
      <div
        className="modal-container print-modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '840px', background: '#ffffff', padding: '0', overflow: 'hidden' }}
      >
        {/* Top Control Bar (Hidden during print) */}
        <div className="no-print" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 24px',
          background: '#f8fafc',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
            <Printer size={18} color="var(--accent-navy)" />
            <span>Xem trước bản in hóa đơn & phiếu xuất hàng</span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handlePrint}
              className="primary-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 16px',
                fontSize: '0.88rem',
                fontWeight: 700
              }}
            >
              <Printer size={15} />
              <span>In Hóa Đơn</span>
            </button>
            <button
              onClick={onClose}
              className="btn-outline"
              style={{ padding: '6px 14px', fontSize: '0.88rem' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable Sheet */}
        <div className="printable-invoice" style={{ padding: '36px 40px', color: '#111827', background: '#ffffff' }}>
          {/* Company & Document Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #e5e7eb', paddingBottom: '20px', marginBottom: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#d70018', letterSpacing: '-0.5px' }}>CBStore</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#4b5563', lineHeight: 1.5 }}>
                <div><strong>CBStore</strong></div>
                <div>Hệ thống cửa hàng: CBStore</div>
                <div>Hotline CSKH & Kỹ thuật: 1900 8899</div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', textTransform: 'uppercase', marginBottom: '4px' }}>
                PHIẾU XUẤT KHO KIÊM BÁN LẺ
              </h2>
              <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                Mã đơn: <strong style={{ color: '#d70018', fontSize: '0.95rem' }}>{order.id}</strong>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: '2px' }}>
                Ngày lập: {formatDate(order.created_at)}
              </div>
            </div>
          </div>

          {/* Customer & Delivery Information */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '20px',
            background: '#f9fafb',
            padding: '16px 20px',
            borderRadius: '6px',
            border: '1px solid #e5e7eb',
            marginBottom: '24px',
            fontSize: '0.86rem'
          }}>
            <div>
              <div style={{ fontWeight: 700, color: '#374151', textTransform: 'uppercase', fontSize: '0.76rem', marginBottom: '6px', letterSpacing: '0.5px' }}>
                Thông tin người nhận
              </div>
              <div>Họ và tên: <strong style={{ color: '#111827' }}>{order.customer_name}</strong></div>
              <div>Số điện thoại: <strong style={{ color: '#111827' }}>{order.customer_phone}</strong></div>
              <div>Địa chỉ giao: {order.customer_address}</div>
              {order.note && <div style={{ color: '#6b7280', marginTop: '4px' }}>Ghi chú: <em>"{order.note}"</em></div>}
            </div>

            <div>
              <div style={{ fontWeight: 700, color: '#374151', textTransform: 'uppercase', fontSize: '0.76rem', marginBottom: '6px', letterSpacing: '0.5px' }}>
                Chi tiết giao vận
              </div>
              <div>
                Phương thức: <strong>{order.payment_method === 'vietqr' ? 'Chuyển khoản VietQR' : 'COD (Thu tiền tận nơi)'}</strong>
              </div>
              <div>
                Phân loại: <strong>{order.is_pc_build ? 'Bộ máy tính PC đồng bộ' : 'Linh kiện bán lẻ'}</strong>
              </div>
              <div>
                Trạng thái hiện tại:{' '}
                <strong style={{ color: order.status === 'delivered' ? '#16a34a' : order.status === 'cancelled' ? '#dc2626' : '#2563eb' }}>
                  {order.status === 'pending' && 'Chờ xác nhận'}
                  {order.status === 'confirmed' && 'Đã xác nhận'}
                  {order.status === 'shipping' && 'Đang giao hàng'}
                  {order.status === 'delivered' && 'Giao thành công'}
                  {order.status === 'cancelled' && 'Đã hủy'}
                </strong>
              </div>
            </div>
          </div>

          {/* Item Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #d1d5db', textAlign: 'left' }}>
                <th style={{ padding: '8px 10px', width: '38px', textAlign: 'center' }}>STT</th>
                <th style={{ padding: '8px 10px' }}>Tên linh kiện / Sản phẩm</th>
                <th style={{ padding: '8px 10px', width: '70px', textAlign: 'center' }}>Loại</th>
                <th style={{ padding: '8px 10px', width: '50px', textAlign: 'center' }}>SL</th>
                <th style={{ padding: '8px 10px', width: '110px', textAlign: 'right' }}>Đơn giá</th>
                <th style={{ padding: '8px 10px', width: '120px', textAlign: 'right' }}>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '8px 10px', textAlign: 'center', color: '#6b7280' }}>{idx + 1}</td>
                  <td style={{ padding: '8px 10px', fontWeight: 600 }}>{it.product_name}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', textTransform: 'uppercase', fontSize: '0.75rem', color: '#4b5563' }}>
                    {it.category_id || '-'}
                  </td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700 }}>{it.quantity}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right' }}>{formatVND(it.unit_price)}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700 }}>{formatVND(it.subtotal || (it.unit_price * it.quantity))}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary Calculation */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
            <div style={{ width: '300px', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#4b5563' }}>
                <span>Tiền hàng:</span>
                <span>{formatVND(totalAmount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#4b5563' }}>
                <span>Phí vận chuyển:</span>
                <span style={{ color: '#16a34a', fontWeight: 600 }}>Miễn phí</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderTop: '2px solid #111827',
                marginTop: '6px',
                fontSize: '1.05rem',
                fontWeight: 800,
                color: '#d70018'
              }}>
                <span>Tổng cộng:</span>
                <span>{formatVND(totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Signature Areas */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            textAlign: 'center',
            marginTop: '36px',
            paddingTop: '16px',
            fontSize: '0.82rem'
          }}>
            <div>
              <div style={{ fontWeight: 700 }}>Người lập phiếu</div>
              <div style={{ color: '#6b7280', fontSize: '0.75rem', fontStyle: 'italic' }}>(Ký, ghi rõ họ tên)</div>
              <div style={{ height: '60px' }}></div>
              <div>Admin CBStore</div>
            </div>
            <div>
              <div style={{ fontWeight: 700 }}>Nhân viên giao nhận</div>
              <div style={{ color: '#6b7280', fontSize: '0.75rem', fontStyle: 'italic' }}>(Ký, ghi rõ họ tên)</div>
              <div style={{ height: '60px' }}></div>
            </div>
            <div>
              <div style={{ fontWeight: 700 }}>Khách hàng nhận hàng</div>
              <div style={{ color: '#6b7280', fontSize: '0.75rem', fontStyle: 'italic' }}>(Ký, ghi rõ họ tên)</div>
              <div style={{ height: '60px' }}></div>
              <div>{order.customer_name}</div>
            </div>
          </div>

          {/* Footer note */}
          <div style={{
            borderTop: '1px dashed #d1d5db',
            marginTop: '28px',
            paddingTop: '12px',
            textAlign: 'center',
            fontSize: '0.74rem',
            color: '#6b7280'
          }}>
            Cảm ơn quý khách đã tin tưởng và ủng hộ CBStore. Vui lòng giữ lại phiếu để đối chiếu bảo hành khi cần thiết.
          </div>
        </div>
      </div>
    </div>
  );
}
