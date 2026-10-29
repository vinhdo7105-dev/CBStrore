import React, { useState } from 'react';
import { X, ShoppingCart, ShieldCheck, CheckCircle2, Truck, RotateCcw } from 'lucide-react';
import { formatVND } from '../services/api';
import { useCart } from '../context/CartContext';

export default function ProductModal({ product, onClose }) {
  const { addToCart, showToast } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const stock = Math.max(0, Number(product.stock ?? 10));
  const selectedQuantity = Math.min(quantity, stock);

  const handleAddToCart = () => {
    if (addToCart(product, selectedQuantity)) onClose();
  };

  const specKeyLabels = {
    socket: 'Chuẩn Socket',
    cores: 'Số nhân / Số luồng',
    baseClock: 'Xung nhịp cơ bản',
    boostClock: 'Xung nhịp tối đa (Boost)',
    cache: 'Bộ nhớ đệm (Cache)',
    tdp: 'Công suất tiêu thụ (TDP)',
    memorySupport: 'Hỗ trợ loại RAM',
    integratedGraphics: 'Đồ họa tích hợp',
    chipset: 'Chipset',
    formFactor: 'Kích thước (Form Factor)',
    ramType: 'Chuẩn RAM hỗ trợ',
    ramSlots: 'Số khe cắm RAM',
    maxRam: 'Dung lượng RAM tối đa',
    m2Slots: 'Khe cắm M.2 NVMe',
    connectivity: 'Kết nối mạng & Wireless',
    capacity: 'Dung lượng',
    bus: 'Tốc độ Bus RAM',
    latency: 'Độ trễ (CAS Latency)',
    voltage: 'Điện áp',
    rgb: 'Đèn LED ARGB',
    profile: 'Cấu hình ép xung',
    gpu: 'Nhân đồ họa (GPU)',
    vram: 'Bộ nhớ VRAM',
    cudaCores: 'Số nhân CUDA/Stream',
    recommendedPsu: 'Nguồn đề xuất tối thiểu',
    length: 'Chiều dài card (VGA Length)',
    ports: 'Cổng xuất hình',
    interface: 'Giao thức kết nối',
    readSpeed: 'Tốc độ đọc tuần tự',
    writeSpeed: 'Tốc độ ghi tuần tự',
    tbw: 'Độ bền ghi (TBW)',
    wattage: 'Công suất thực',
    efficiency: 'Hiệu suất chuẩn 80 Plus',
    modular: 'Kiểu cáp nguồn (Modular)',
    standard: 'Tiêu chuẩn nguồn',
    fanSize: 'Kích thước quạt làm mát',
    dimensions: 'Kích thước tổng thể',
    gpuClearance: 'Hỗ trợ chiều dài VGA',
    cpuCoolerClearance: 'Hỗ trợ chiều cao tản CPU',
    fansIncluded: 'Quạt đi kèm sẵn',
    radiatorSupport: 'Hỗ trợ Rad tản nhiệt',
    glass: 'Chất liệu mặt hông',
    type: 'Kiểu tản nhiệt',
    heatpipes: 'Số ống dẫn nhiệt',
    fans: 'Quạt làm mát',
    tdpRating: 'Công suất tản nhiệt tối đa (TDP)'
  };

  const sku = product.sku || (product.brand ? product.brand.slice(0, 3).toUpperCase() : 'PC') + 
    (product.id ? product.id.replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase() : '101');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="sku-badge">Mã: {sku}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-red)', textTransform: 'uppercase', fontWeight: 700 }}>
                {product.brand}
              </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', marginTop: '6px', color: 'var(--text-main)' }}>{product.name}</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Đóng">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '260px', background: '#ffffff', border: '1px solid var(--border-subtle)', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <img
              src={product.image_url}
              alt={product.name}
              style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-red)' }}>
                {formatVND(product.price)}
              </div>
              {product.original_price && product.original_price > product.price && (
                <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', textDecoration: 'line-through' }}>
                  {formatVND(product.original_price)}
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: stock > 0 ? 'var(--accent-green)' : 'var(--accent-red)', fontSize: '0.88rem', fontWeight: 700 }}>
                <CheckCircle2 size={16} /> {stock > 0 ? `Còn hàng (${stock} sản phẩm)` : 'Hết hàng'}
              </span>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Bảo hành: {product.warranty || '36 tháng'}
              </div>
            </div>
          </div>

          {/* Specs Table */}
          <div style={{ background: '#f8fafc', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '20px', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ fontSize: '0.92rem', marginBottom: '12px', color: 'var(--text-main)', fontWeight: 700 }}>
              Thông Số Kỹ Thuật Chi Tiết
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
              {product.specs && Object.entries(product.specs).map(([key, val]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{specKeyLabels[key] || key}:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)', textAlign: 'right' }}>
                    {typeof val === 'boolean' ? (val ? 'Có' : 'Không') : val}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Highlights */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '24px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
              <Truck size={16} color="var(--accent-red)" />
              <span>Giao hàng toàn quốc</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
              <ShieldCheck size={16} color="var(--accent-green)" />
              <span>Chính hãng 100%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
              <RotateCcw size={16} color="var(--accent-blue)" />
              <span>Đổi mới trong 15 ngày</span>
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', padding: '2px' }}>
              <button
                className="qty-btn"
                onClick={() => setQuantity(Math.max(1, selectedQuantity - 1))}
                disabled={stock === 0}
              >
                -
              </button>
              <span style={{ minWidth: '36px', textAlign: 'center', fontWeight: 700 }}>
                {selectedQuantity}
              </span>
              <button
                className="qty-btn"
                onClick={() => {
                  if (selectedQuantity >= stock) {
                    showToast(`Chỉ còn ${stock} sản phẩm "${product.name}" trong kho.`, 'error');
                    return;
                  }
                  setQuantity(selectedQuantity + 1);
                }}
                disabled={stock === 0}
              >
                +
              </button>
            </div>

            <button className="primary-btn" onClick={handleAddToCart} style={{ flex: 1 }} disabled={stock === 0}>
              <ShoppingCart size={18} />
              <span>{stock > 0 ? `Thêm vào giỏ hàng • ${formatVND(product.price * selectedQuantity)}` : 'Sản phẩm đã hết hàng'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
