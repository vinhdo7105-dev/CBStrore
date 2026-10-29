import React, { useState } from 'react';
import { X, CheckCircle, Truck, CreditCard, ShieldCheck, ArrowRight, Copy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { submitOrder, formatVND } from '../services/api';
import VietQRCard from './VietQRCard';

export default function CheckoutModal({ onOrderSuccess }) {
  const { cart, totalPrice, isCheckoutOpen, setIsCheckoutOpen, clearCart, showToast } = useCart();

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_address: '',
    note: '',
    payment_method: 'cod'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderComplete, setOrderComplete] = useState(null);

  if (!isCheckoutOpen) return null;

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.customer_name.trim()) {
      setError('Vui lòng nhập họ và tên của bạn.');
      return;
    }
    if (!formData.customer_phone.trim()) {
      setError('Vui lòng nhập số điện thoại để nhận hàng.');
      return;
    }
    const cleanPhone = formData.customer_phone.replace(/\D/g, '');
    if (cleanPhone.length < 9 || cleanPhone.length > 12) {
      setError('Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại 10 chữ số.');
      return;
    }
    if (!formData.customer_address.trim()) {
      setError('Vui lòng nhập đầy đủ địa chỉ giao nhận hàng.');
      return;
    }

    try {
      setLoading(true);
      const res = await submitOrder({
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_address: formData.customer_address,
        note: formData.note,
        payment_method: formData.payment_method,
        items: cart
      });

      // Trigger Confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      setOrderComplete(res.data);
      clearCart();
      showToast('Đặt hàng thành công! Đơn hàng đang được xử lý.');
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tạo đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setOrderComplete(null);
  };

  const handleCopyOrderId = () => {
    if (orderComplete?.id) {
      navigator.clipboard.writeText(orderComplete.id);
      showToast('Đã sao chép mã đơn hàng vào bộ nhớ tạm');
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" style={{ maxWidth: (formData.payment_method === 'banking' || orderComplete?.payment_method === 'banking') ? '660px' : '560px' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h3 style={{ fontSize: '1.2rem' }}>
            {orderComplete ? 'Đặt Hàng Thành Công' : 'Xác Nhận & Đặt Hàng Nhanh'}
          </h3>
          <button className="modal-close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {orderComplete ? (
            /* SUCCESS VIEW */
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(22, 163, 74, 0.12)',
                color: 'var(--accent-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <CheckCircle size={38} />
              </div>

              <h2 style={{ fontSize: '1.35rem', marginBottom: '8px', color: 'var(--text-main)' }}>
                Cảm ơn bạn, {orderComplete.customer_name}!
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '24px' }}>
                Đơn hàng của bạn đã được ghi nhận thành công tại CBStore. Chúng tôi sẽ liên hệ để xác nhận trước khi giao hàng.
              </p>

              <div style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '20px', textAlign: 'left', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Mã đơn hàng:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 800, color: 'var(--accent-red)' }}>
                      {orderComplete.id}
                    </span>
                    <button onClick={handleCopyOrderId} style={{ color: 'var(--text-secondary)' }} title="Sao chép">
                      <Copy size={16} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Số điện thoại:</span>
                  <span style={{ fontWeight: 600 }}>{orderComplete.customer_phone}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Địa chỉ giao hàng:</span>
                  <span style={{ fontWeight: 600, textAlign: 'right', maxWidth: '280px' }}>{orderComplete.customer_address}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Phương thức:</span>
                  <span style={{ fontWeight: 600 }}>
                    {orderComplete.payment_method === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản ngân hàng'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', fontSize: '1rem' }}>
                  <span style={{ fontWeight: 700 }}>Tổng thanh toán:</span>
                  <span style={{ fontWeight: 900, color: 'var(--accent-red)', fontSize: '1.25rem' }}>
                    {formatVND(orderComplete.total_amount)}
                  </span>
                </div>
              </div>

              {orderComplete.payment_method === 'banking' && (
                <div style={{ marginBottom: '24px' }}>
                  <VietQRCard
                    amount={orderComplete.total_amount}
                    orderId={orderComplete.id}
                    title="Mã VietQR Thanh Toán Cho Đơn Hàng Của Bạn"
                  />
                </div>
              )}

              <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', padding: '14px', marginBottom: '24px', fontSize: '0.85rem', color: 'var(--accent-red)' }}>
                💡 <strong>Mẹo:</strong> Bạn có thể theo dõi tiến độ đơn hàng bất kỳ lúc nào bằng cách vào mục <strong>Tra cứu đơn hàng</strong> và nhập số điện thoại <strong>{orderComplete.customer_phone}</strong>.
              </div>

              <button
                className="primary-btn"
                onClick={() => {
                  handleClose();
                  if (onOrderSuccess) onOrderSuccess(orderComplete.customer_phone);
                }}
              >
                <span>Xem Ngay Tiến Độ Đơn Hàng</span>
                <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            /* CHECKOUT FORM */
            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{ padding: '12px', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: 'var(--radius-md)', color: 'var(--accent-rose)', fontSize: '0.88rem', marginBottom: '18px' }}>
                  {error}
                </div>
              )}

              {/* Minimalist customer info fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    Họ và Tên người nhận *
                  </label>
                  <input
                    type="text"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleChange}
                    placeholder="Ví dụ: Nguyễn Văn An"
                    required
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    Số điện thoại nhận hàng *
                  </label>
                  <input
                    type="tel"
                    name="customer_phone"
                    value={formData.customer_phone}
                    onChange={handleChange}
                    placeholder="Ví dụ: 0912345678 (Dùng để nhận hàng & tra cứu lại đơn)"
                    required
                    style={{ width: '100%' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    * Nhập chính xác số điện thoại để tra cứu lại lịch sử đơn hàng sau này.
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    Địa chỉ giao nhận hàng *
                  </label>
                  <textarea
                    rows={2}
                    name="customer_address"
                    value={formData.customer_address}
                    onChange={handleChange}
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                    required
                    style={{ width: '100%', resize: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    Ghi chú giao hàng (Không bắt buộc)
                  </label>
                  <input
                    type="text"
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    placeholder="Ví dụ: Giao vào giờ hành chính, gọi trước khi đến..."
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '10px', color: 'var(--text-secondary)' }}>
                  Phương thức thanh toán
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: formData.payment_method === 'cod' ? '#fff5f5' : '#ffffff',
                      border: `1px solid ${formData.payment_method === 'cod' ? 'var(--accent-red)' : 'var(--border-subtle)'}`,
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="cod"
                      checked={formData.payment_method === 'cod'}
                      onChange={handleChange}
                      style={{ accentColor: 'var(--accent-red)' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Thanh toán COD</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Trả tiền khi nhận hàng</div>
                    </div>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: formData.payment_method === 'banking' ? '#fff5f5' : '#ffffff',
                      border: `1px solid ${formData.payment_method === 'banking' ? 'var(--accent-red)' : 'var(--border-subtle)'}`,
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="banking"
                      checked={formData.payment_method === 'banking'}
                      onChange={handleChange}
                      style={{ accentColor: 'var(--accent-red)' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Chuyển khoản VietQR</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quét mã QR tiện lợi</div>
                    </div>
                  </label>
                </div>
              </div>

              {formData.payment_method === 'banking' && (
                <div style={{ marginBottom: '24px' }}>
                  <VietQRCard
                    amount={totalPrice}
                    title="Mã VietQR Thanh Toán Cho Đơn Hàng"
                  />
                </div>
              )}

              {/* Order total recap */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Số lượng sản phẩm:</span>
                  <span style={{ fontWeight: 600 }}>{cart.length} món</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Phí vận chuyển:</span>
                  <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>0 ₫ (Miễn phí)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Tổng thanh toán:</span>
                  <span style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--accent-red)' }}>
                    {formatVND(totalPrice)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="primary-btn"
                disabled={loading}
                style={{ opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Đang Xử Lý Đơn Hàng...' : `Hoàn Tất Đặt Hàng (${formatVND(totalPrice)})`}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
