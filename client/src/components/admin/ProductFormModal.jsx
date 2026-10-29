import React, { useState, useEffect } from 'react';
import { X, Image, Save, AlertCircle, Sparkles } from 'lucide-react';
import { formatVND } from '../../services/api';

const DEFAULT_CATEGORIES = [
  { id: 'cpu', name: 'CPU - Bộ vi xử lý' },
  { id: 'mainboard', name: 'Mainboard - Bo mạch chủ' },
  { id: 'ram', name: 'RAM - Bộ nhớ trong' },
  { id: 'vga', name: 'VGA - Card màn hình' },
  { id: 'ssd', name: 'SSD - Ổ cứng thể rắn' },
  { id: 'psu', name: 'PSU - Nguồn máy tính' },
  { id: 'case', name: 'Case - Vỏ máy tính' },
  { id: 'cooling', name: 'Tản nhiệt CPU / AIO' },
  { id: 'laptop', name: 'Laptop & Máy tính xách tay' }
];

const COMMON_BRANDS = [
  'Intel', 'AMD', 'ASUS', 'MSI', 'GIGABYTE', 'Corsair', 'Kingston', 'Samsung',
  'Lian Li', 'NZXT', 'Thermalright', 'DeepCool', 'Seasonic', 'Apple', 'Dell', 'Acer', 'Lenovo'
];

export default function ProductFormModal({ product, categories = [], onSave, onClose }) {
  const isEditing = !!product;

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    category_id: 'cpu',
    brand: 'Intel',
    price: '',
    original_price: '',
    stock: 25,
    warranty: '36 tháng',
    image_url: '',
    featured: false,
    specs: {}
  });

  const [specKey, setSpecKey] = useState('');
  const [specVal, setSpecVal] = useState('');
  const [imageError, setImageError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        id: product.id || '',
        name: product.name || '',
        category_id: product.category_id || 'cpu',
        brand: product.brand || 'Intel',
        price: product.price || '',
        original_price: product.original_price || '',
        stock: product.stock !== undefined ? product.stock : 25,
        warranty: product.warranty || '36 tháng',
        image_url: product.image_url || '',
        featured: !!product.featured,
        specs: product.specs && typeof product.specs === 'object' ? { ...product.specs } : {}
      });
    } else {
      // Default sample image and SKU
      setFormData(prev => ({
        ...prev,
        id: `prod-${Date.now().toString().slice(-6)}`,
        image_url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&auto=format&fit=crop&q=80'
      }));
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddSpec = () => {
    if (!specKey.trim() || !specVal.trim()) return;
    setFormData(prev => ({
      ...prev,
      specs: {
        ...prev.specs,
        [specKey.trim()]: specVal.trim()
      }
    }));
    setSpecKey('');
    setSpecVal('');
  };

  const handleRemoveSpec = (keyToRemove) => {
    setFormData(prev => {
      const nextSpecs = { ...prev.specs };
      delete nextSpecs[keyToRemove];
      return { ...prev, specs: nextSpecs };
    });
  };

  const handleApplyPresetSpecs = (category) => {
    let presets = {};
    if (category === 'cpu') {
      presets = { socket: 'LGA1700', cores: '8 Cores / 16 Threads', baseClock: '3.4 GHz', boostClock: '5.4 GHz', tdp: '125W' };
    } else if (category === 'mainboard') {
      presets = { socket: 'LGA1700', chipset: 'Z790', formFactor: 'ATX', ramStandard: 'DDR5', maxRam: '192GB' };
    } else if (category === 'ram') {
      presets = { capacity: '32GB (2x16GB)', type: 'DDR5', speed: '6000 MHz', latency: 'CL30', rgb: 'Có' };
    } else if (category === 'vga') {
      presets = { vram: '16GB GDDR6X', bus: '256-bit', powerRec: '750W', length: '304 mm' };
    } else if (category === 'ssd') {
      presets = { capacity: '1TB', interface: 'PCIe Gen4 x4 NVMe', readSpeed: '7450 MB/s', writeSpeed: '6900 MB/s' };
    } else if (category === 'psu') {
      presets = { wattage: '850W', efficiency: '80 Plus Gold', modular: 'Full Modular' };
    } else if (category === 'case') {
      presets = { type: 'Mid Tower', mbSupport: 'ATX / Micro-ATX', fanIncluded: '3 Fan ARGB' };
    } else if (category === 'cooling') {
      presets = { type: 'Tản nhiệt nước AIO 360mm', socketSupport: 'LGA1700 / AM5', tdpSupport: '300W' };
    } else if (category === 'laptop') {
      presets = { cpu: 'Core i7-14700HX', ram: '16GB DDR5', ssd: '1TB NVMe', vga: 'RTX 4060 8GB', display: '16.0 inch 2.5K 165Hz' };
    }

    setFormData(prev => ({
      ...prev,
      specs: { ...prev.specs, ...presets }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim()) {
      setErrorMsg('Vui lòng nhập tên sản phẩm.');
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      setErrorMsg('Vui lòng nhập giá bán hợp lệ (> 0 VND).');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        price: Number(formData.price),
        original_price: formData.original_price ? Number(formData.original_price) : null,
        stock: Number(formData.stock) || 0
      };
      await onSave(payload, isEditing ? product.id : null);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi khi lưu thông tin sản phẩm.');
    } finally {
      setSubmitting(false);
    }
  };

  const availableCategories = categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  return (
    <div className="modal-backdrop">
      <div
        className="modal-container admin-product-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '820px', maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {isEditing ? '✏️ Chỉnh Sửa Mặt Hàng' : '➕ Thêm Mặt Hàng Mới Vào Kho'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {isEditing ? `Đang chỉnh sửa mã SKU: ${product.id}` : 'Điền đầy đủ thông tin để hiển thị mặt hàng lên cửa hàng CBStore'}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Đóng">
            <X size={20} />
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div style={{
            margin: '16px 24px 0',
            padding: '10px 14px',
            background: '#fee2e2',
            border: '1px solid #f87171',
            borderRadius: '6px',
            color: '#b91c1c',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.88rem'
          }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="admin-form-body" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
            {/* Left Column: Product Information */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="admin-label">
                  Tên mặt hàng / linh kiện <span style={{ color: 'var(--accent-red)' }}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="VD: CPU Intel Core i7-14700K (Up to 5.6GHz, 20 Nhân 28 Luồng)"
                  required
                  style={{ width: '100%', fontWeight: 600 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="admin-label">Mã SKU / ID sản phẩm</label>
                  <input
                    type="text"
                    name="id"
                    value={formData.id}
                    onChange={handleChange}
                    placeholder="VD: cpu-intel-14700k"
                    disabled={isEditing}
                    style={{ width: '100%', background: isEditing ? '#f1f5f9' : '#fff' }}
                  />
                </div>
                <div>
                  <label className="admin-label">Danh mục linh kiện</label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    style={{ width: '100%' }}
                  >
                    {availableCategories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="admin-label">Thương hiệu / Hãng SX</label>
                  <input
                    type="text"
                    list="brand-suggestions"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="VD: Intel, ASUS, MSI..."
                    style={{ width: '100%' }}
                  />
                  <datalist id="brand-suggestions">
                    {COMMON_BRANDS.map(b => (
                      <option key={b} value={b} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="admin-label">Thời hạn bảo hành</label>
                  <input
                    type="text"
                    name="warranty"
                    value={formData.warranty}
                    onChange={handleChange}
                    placeholder="VD: 36 tháng"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="admin-label">
                    Giá bán thực tế (VND) <span style={{ color: 'var(--accent-red)' }}>*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="VD: 10990000"
                    required
                    style={{ width: '100%', fontWeight: 700, color: 'var(--accent-red)' }}
                  />
                  {formData.price > 0 && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--accent-red)', marginTop: '2px', display: 'block' }}>
                      = {formatVND(formData.price)}
                    </span>
                  )}
                </div>
                <div>
                  <label className="admin-label">Giá niêm yết cũ (nếu có)</label>
                  <input
                    type="number"
                    name="original_price"
                    value={formData.original_price}
                    onChange={handleChange}
                    placeholder="VD: 11990000"
                    style={{ width: '100%' }}
                  />
                  {formData.original_price > 0 && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textDecoration: 'line-through', marginTop: '2px', display: 'block' }}>
                      = {formatVND(formData.original_price)}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="admin-label">Số lượng tồn kho (Chiếc)</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    min="0"
                    placeholder="VD: 25"
                    style={{ width: '100%' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '22px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleChange}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span>⭐ Sản phẩm nổi bật (Featured)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Image Preview & Specs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="admin-label">Đường dẫn hình ảnh (URL)</label>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={(e) => {
                    handleChange(e);
                    setImageError(false);
                  }}
                  placeholder="https://..."
                  style={{ width: '100%', fontSize: '0.82rem' }}
                />
              </div>

              {/* Image Preview Box */}
              <div style={{
                height: '160px',
                border: '1px dashed var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f8fafc',
                overflow: 'hidden',
                position: 'relative'
              }}>
                {formData.image_url && !imageError ? (
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    onError={() => setImageError(true)}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    <Image size={32} style={{ margin: '0 auto 6px', opacity: 0.5 }} />
                    <div>{imageError ? 'Không tải được ảnh từ URL' : 'Chưa có ảnh xem trước'}</div>
                  </div>
                )}
              </div>

              {/* Specs Manager */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="admin-label" style={{ margin: 0 }}>Thông số kỹ thuật (Specs)</label>
                  <button
                    type="button"
                    onClick={() => handleApplyPresetSpecs(formData.category_id)}
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--accent-navy)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontWeight: 600,
                      background: '#eff6ff',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}
                    title="Điền nhanh các trường mẫu theo danh mục"
                  >
                    <Sparkles size={12} />
                    <span>Gợi ý mẫu</span>
                  </button>
                </div>

                {/* Existing specs pills */}
                <div style={{
                  maxHeight: '140px',
                  overflowY: 'auto',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px',
                  background: '#ffffff',
                  marginBottom: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  {Object.keys(formData.specs).length === 0 ? (
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>
                      Chưa có thông số kỹ thuật nào
                    </span>
                  ) : (
                    Object.entries(formData.specs).map(([k, v]) => (
                      <div
                        key={k}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: '#f1f5f9',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.78rem'
                        }}
                      >
                        <div>
                          <strong style={{ color: 'var(--text-main)' }}>{k}:</strong>{' '}
                          <span style={{ color: 'var(--text-secondary)' }}>{String(v)}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSpec(k)}
                          style={{ color: '#ef4444', fontWeight: 700, padding: '0 4px', fontSize: '0.9rem' }}
                          title="Xóa thông số này"
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Add new spec row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '6px' }}>
                  <input
                    type="text"
                    placeholder="Tên (VD: socket)"
                    value={specKey}
                    onChange={(e) => setSpecKey(e.target.value)}
                    style={{ fontSize: '0.78rem', padding: '6px 8px' }}
                  />
                  <input
                    type="text"
                    placeholder="Giá trị (VD: LGA1700)"
                    value={specVal}
                    onChange={(e) => setSpecVal(e.target.value)}
                    style={{ fontSize: '0.78rem', padding: '6px 8px' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddSpec}
                    style={{
                      background: 'var(--text-main)',
                      color: '#fff',
                      fontSize: '0.78rem',
                      padding: '0 10px',
                      borderRadius: '4px',
                      fontWeight: 600
                    }}
                  >
                    + Thêm
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div style={{
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px'
          }}>
            <button
              type="button"
              className="btn-outline"
              onClick={onClose}
              disabled={submitting}
              style={{ padding: '8px 18px', fontSize: '0.9rem' }}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="primary-btn"
              disabled={submitting}
              style={{
                padding: '8px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.92rem',
                fontWeight: 700
              }}
            >
              <Save size={16} />
              <span>{submitting ? 'Đang lưu...' : (isEditing ? 'Lưu Thay Đổi' : 'Tạo Sản Phẩm')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
