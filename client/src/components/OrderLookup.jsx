import React, { useState, useEffect } from 'react';
import { Search, Package, Calendar, MapPin, Phone, User, CheckCircle2, Clock, Truck, Check, QrCode, ChevronDown, ChevronUp } from 'lucide-react';
import { lookupOrdersByPhone, formatVND } from '../services/api';
import VietQRCard from './VietQRCard';

export default function OrderLookup({ initialPhone = '' }) {
  const [phone, setPhone] = useState(initialPhone);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [expandedQrMap, setExpandedQrMap] = useState({});

  const toggleQr = (orderId) => {
    setExpandedQrMap(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  useEffect(() => {
    if (initialPhone) {
      setPhone(initialPhone);
      handleSearch(initialPhone);
    }
  }, [initialPhone]);

  const handleSearch = async (phoneToQuery) => {
    const queryPhone = (phoneToQuery || phone).trim();
    if (!queryPhone) {
      setError('Vui lòng nhập số điện thoại đã dùng để đặt hàng.');
      return;
    }

    setError('');
    setLoading(true);
    setSearched(true);

    try {
      const data = await lookupOrdersByPhone(queryPhone);
      setOrders(data);
    } catch (err) {
      setError(err.message || 'Không thể tra cứu đơn hàng lúc này.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'shipping':
        return (
          <span className="order-status-badge status-shipping">
            <Truck size={14} /> Đang Vận Chuyển
          </span>
        );
      case 'delivered':
        return (
          <span className="order-status-badge status-delivered">
            <CheckCircle2 size={14} /> Giao Thành Công
          </span>
        );
      case 'confirmed':
        return (
          <span className="order-status-badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <Check size={14} /> Đã Xác Nhận
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="order-status-badge status-pending">
            <Clock size={14} /> Chờ Xác Nhận
          </span>
        );
    }
  };

  return (
    <div className="lookup-section">
      <div className="lookup-card">
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: '#fff1f2', color: 'var(--accent-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Search size={22} />
          </div>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '6px', color: 'var(--text-main)' }}>Tra Cứu Lịch Sử Đơn Hàng</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Nhập số điện thoại của bạn để xem lại toàn bộ các đơn hàng đã đặt mua tại CBStore.
          </p>
        </div>

        {/* Search input form */}
        <form
          className="lookup-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
        >
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="tel"
              placeholder="Nhập số điện thoại người nhận (Ví dụ: 0912345678)..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ width: '100%', height: '48px', fontSize: '1rem', paddingLeft: '16px' }}
            />
          </div>
          <button
            type="submit"
            className="primary-btn"
            style={{ width: 'auto', padding: '0 24px', height: '48px' }}
            disabled={loading}
          >
            <Search size={18} />
            <span>{loading ? 'Đang tra cứu...' : 'Tìm Đơn Hàng'}</span>
          </button>
        </form>

        {/* Quick test suggestion */}
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '-18px', marginBottom: '28px' }}>
          Thử số điện thoại mẫu: {' '}
          <button
            type="button"
            onClick={() => {
              setPhone('0912345678');
              handleSearch('0912345678');
            }}
            style={{ color: 'var(--accent-red)', textDecoration: 'underline', fontWeight: 600 }}
          >
            0912345678
          </button>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: 'var(--radius-md)', color: 'var(--accent-rose)', fontSize: '0.88rem', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {/* Results List */}
        {searched && (
          <div>
            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                <Package size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '1.05rem', marginBottom: '6px' }}>Không tìm thấy đơn hàng nào</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  Không có đơn hàng nào khớp với số điện thoại <strong>{phone}</strong>. Vui lòng kiểm tra lại số điện thoại đã đặt.
                </p>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  Tìm thấy <strong>{orders.length}</strong> đơn hàng cho số điện thoại <strong>{phone}</strong>:
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {orders.map((order) => (
                    <div key={order.id} className="order-result-card">
                      {/* Order top bar */}
                      <div className="order-header-row">
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Mã đơn:</span>
                            <span style={{ fontWeight: 800, color: 'var(--accent-red)', fontSize: '1.05rem' }}>
                              {order.id}
                            </span>
                            {order.is_pc_build && (
                              <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(215, 0, 24, 0.1)', color: 'var(--accent-red)', border: '1px solid rgba(215, 0, 24, 0.2)', fontWeight: 600 }}>
                                Cấu hình máy bộ PC
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            <Calendar size={13} />
                            <span>{new Date(order.created_at).toLocaleString('vi-VN')}</span>
                          </div>
                        </div>

                        <div>
                          {getStatusBadge(order.status)}
                        </div>
                      </div>

                      {/* Recipient Details */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', fontSize: '0.85rem', background: '#f8fafc', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '18px', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                          <User size={15} color="var(--accent-navy)" />
                          <span>Người nhận: <strong>{order.customer_name}</strong></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                          <Phone size={15} color="var(--accent-navy)" />
                          <span>SĐT: <strong>{order.customer_phone}</strong></span>
                        </div>
                        <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-secondary)' }}>
                          <MapPin size={15} color="var(--accent-navy)" style={{ marginTop: '3px', flexShrink: 0 }} />
                          <span>Địa chỉ: <strong>{order.customer_address}</strong></span>
                        </div>
                        {order.note && (
                          <div style={{ gridColumn: '1 / -1', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            Ghi chú: "{order.note}"
                          </div>
                        )}
                      </div>

                      {/* Purchased Items List */}
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>
                          Danh sách linh kiện đã mua:
                        </div>
                        <div className="order-items-list">
                          {order.items && order.items.map((item, idx) => (
                            <div key={idx} className="order-item-row">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                                {item.product_image ? (
                                  <img src={item.product_image} alt={item.product_name} className="order-item-thumbnail" />
                                ) : (
                                  <div className="order-item-thumbnail" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Package size={18} color="var(--text-muted)" />
                                  </div>
                                )}
                                <div style={{ minWidth: 0 }}>
                                  <div style={{ fontWeight: 600, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {item.product_name}
                                  </div>
                                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                    Số lượng: <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{item.quantity}</span> x {formatVND(item.unit_price)}
                                  </div>
                                </div>
                              </div>

                              <div className="mono-text" style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem', flexShrink: 0 }}>
                                {formatVND(item.subtotal || item.quantity * item.unit_price)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Footer & Total */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            Hình thức: <strong>{order.payment_method === 'cod' ? 'Thanh toán COD' : 'Chuyển khoản VietQR'}</strong>
                          </span>
                          {order.payment_method === 'banking' && (
                            <button
                              type="button"
                              onClick={() => toggleQr(order.id)}
                              className="outline-btn"
                              style={{ padding: '4px 10px', fontSize: '0.78rem', gap: '6px', height: '30px', borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }}
                            >
                              <QrCode size={13} />
                              <span>{expandedQrMap[order.id] ? 'Ẩn mã VietQR' : 'Xem mã VietQR'}</span>
                              {expandedQrMap[order.id] ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                            </button>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                          <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Tổng đơn hàng:</span>
                          <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--accent-red)' }}>
                            {formatVND(order.total_amount)}
                          </span>
                        </div>
                      </div>

                      {/* Expandable VietQR Card */}
                      {order.payment_method === 'banking' && expandedQrMap[order.id] && (
                        <div style={{ marginTop: '16px' }}>
                          <VietQRCard
                            amount={order.total_amount}
                            orderId={order.id}
                            title={`Mã VietQR Cho Đơn Hàng #${order.id}`}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
