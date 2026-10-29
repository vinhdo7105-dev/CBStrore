import React from 'react';
import { X, Trash2, ArrowRight, ShoppingCart, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatVND } from '../services/api';

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    totalItems,
    totalPrice,
    setIsCheckoutOpen
  } = useCart();

  if (!isCartOpen) return null;

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="drawer-overlay" onClick={() => setIsCartOpen(false)}>
      <div className="drawer-content" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingCart size={20} color="var(--accent-red)" />
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: 700 }}>
              Giỏ Hàng Của Bạn ({totalItems})
            </h3>
          </div>
          <button className="modal-close-btn" onClick={() => setIsCartOpen(false)} aria-label="Đóng">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="drawer-body">
          {cart.length === 0 ? (
            <div style={{ margin: 'auto', textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--accent-red)' }}>
                <ShoppingCart size={30} />
              </div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--text-main)' }}>Giỏ hàng đang trống</h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
                Khám phá các sản phẩm laptop, máy tính xách tay và linh kiện PC tại CBStore.
              </p>
              <button
                className="secondary-btn"
                style={{ width: 'auto', padding: '10px 24px', margin: '0 auto' }}
                onClick={() => setIsCartOpen(false)}
              >
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cart-item-card">
                <img src={item.image_url} alt={item.name} className="cart-item-thumb" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {item.name}
                    </div>
                    <button
                      className="slot-remove-btn"
                      onClick={() => removeFromCart(item.id)}
                      title="Xóa sản phẩm này"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                    <div style={{ fontWeight: 800, color: 'var(--accent-red)', fontSize: '0.98rem' }}>
                      {formatVND(item.price)}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', borderRadius: '4px', padding: '2px 6px' }}>
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, minWidth: '18px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        title={`Tồn kho: ${item.stock ?? 10}`}
                        aria-label={`Tăng số lượng, tối đa ${item.stock ?? 10}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary */}
        {cart.length > 0 && (
          <div style={{ padding: '20px', background: '#ffffff', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              <span>Tạm tính ({totalItems} món):</span>
              <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{formatVND(totalPrice)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              <span>Phí vận chuyển:</span>
              <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>Miễn phí toàn quốc</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', marginBottom: '18px' }}>
              <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>Tổng thanh toán:</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--accent-red)' }}>
                {formatVND(totalPrice)}
              </span>
            </div>

            <button className="primary-btn" onClick={handleProceedToCheckout}>
              <span>Tiến Hành Đặt Hàng Ngay</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
