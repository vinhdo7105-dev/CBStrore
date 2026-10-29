import React, { useState, useEffect } from 'react';
import { X, Image, Save, AlertCircle, Palette } from 'lucide-react';

const GRADIENT_PRESETS = [
  { label: 'Tím Đậm (Gaming Dark)', val: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)' },
  { label: 'Đen Xám (Obsidian)', val: 'linear-gradient(135deg, #09090b 0%, #18181b 50%, #27272a 100%)' },
  { label: 'Đỏ Đô (CBStore Red)', val: 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 50%, #991b1b 100%)' },
  { label: 'Xanh Lá (Emerald Tech)', val: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #047857 100%)' },
  { label: 'Xanh Dương (Cyber Blue)', val: 'linear-gradient(135deg, #082f49 0%, #0369a1 50%, #0284c7 100%)' }
];

export default function BannerFormModal({ banner, onSave, onClose }) {
  const isEditing = !!banner;

  const [formData, setFormData] = useState({
    id: '',
    title: '',
    subtitle: '',
    badge_text: '⚡ SIÊU KHUYẾN MÃI',
    image_url: '',
    link_url: '#builder',
    cta_text: 'Khám Phá Ngay',
    bg_gradient: GRADIENT_PRESETS[0].val,
    display_order: 1,
    active: true
  });

  const [imageError, setImageError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (banner) {
      setFormData({
        id: banner.id || '',
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        badge_text: banner.badge_text || 'HOT DEAL',
        image_url: banner.image_url || '',
        link_url: banner.link_url || '#builder',
        cta_text: banner.cta_text || 'Khám Phá Ngay',
        bg_gradient: banner.bg_gradient || GRADIENT_PRESETS[0].val,
        display_order: banner.display_order !== undefined ? banner.display_order : 1,
        active: banner.active !== undefined ? !!banner.active : true
      });
    } else {
      setFormData(prev => ({
        ...prev,
        id: `banner-${Date.now().toString().slice(-6)}`,
        image_url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1200&auto=format&fit=crop&q=80'
      }));
    }
  }, [banner]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.title.trim()) {
      setErrorMsg('Vui lòng nhập tiêu đề banner.');
      return;
    }
    if (!formData.image_url.trim()) {
      setErrorMsg('Vui lòng nhập đường dẫn hình ảnh banner.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        display_order: Number(formData.display_order) || 0
      };
      await onSave(payload, isEditing ? banner.id : null);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi khi lưu banner quảng cáo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div
        className="modal-container admin-product-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '780px', maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {isEditing ? '✏️ Chỉnh Sửa Banner Quảng Bá' : '➕ Tạo Mới Banner Trang Chủ'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Banner sẽ tự động chuyển qua chuyển lại trên trang chủ để thu hút khách hàng
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Đóng">
            <X size={20} />
          </button>
        </div>

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
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Banner Preview Widget */}
            <div>
              <label className="admin-label">Xem trước Banner thời gian thực</label>
              <div
                style={{
                  height: '140px',
                  borderRadius: '8px',
                  background: formData.bg_gradient,
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '20px 24px',
                  color: '#ffffff',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
                }}
              >
                {formData.image_url && !imageError && (
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    onError={() => setImageError(true)}
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      width: '45%',
                      height: '100%',
                      objectFit: 'cover',
                      opacity: 0.45,
                      mixBlendMode: 'screen'
                    }}
                  />
                )}
                <div style={{ position: 'relative', zIndex: 2, maxWidth: '65%' }}>
                  <span style={{
                    display: 'inline-block',
                    background: '#d70018',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    marginBottom: '6px'
                  }}>
                    {formData.badge_text || 'KHUYẾN MÃI'}
                  </span>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, textTransform: 'uppercase', lineHeight: 1.2 }}>
                    {formData.title || 'Tiêu Đề Banner Quảng Bá'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#e2e8f0', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {formData.subtitle || 'Mô tả chi tiết chương trình khuyến mãi'}
                  </div>
                </div>
              </div>
            </div>

            {/* Title & Subtitle */}
            <div>
              <label className="admin-label">
                Tiêu đề Banner <span style={{ color: 'var(--accent-red)' }}>*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="VD: ĐẠI TIỆC BUILD PC GAMING 2026 - GIẢM ĐẾN 3 TRIỆU"
                required
                style={{ width: '100%', fontWeight: 700 }}
              />
            </div>

            <div>
              <label className="admin-label">Nội dung phụ / Mô tả khuyến mãi</label>
              <textarea
                name="subtitle"
                value={formData.subtitle}
                onChange={handleChange}
                placeholder="VD: Tặng ngay Tản nhiệt nước AIO 360mm + Chuột Gaming RGB khi build trọn bộ PC tại CBStore"
                rows={2}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>

            {/* Row: Badge, CTA text, Link */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label className="admin-label">Nhãn nổi bật (Badge)</label>
                <input
                  type="text"
                  name="badge_text"
                  value={formData.badge_text}
                  onChange={handleChange}
                  placeholder="VD: ⚡ SIÊU KHUYẾN MÃI"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label className="admin-label">Nút kêu gọi (CTA text)</label>
                <input
                  type="text"
                  name="cta_text"
                  value={formData.cta_text}
                  onChange={handleChange}
                  placeholder="VD: Build Cấu Hình Ngay"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label className="admin-label">Liên kết khi click</label>
                <input
                  type="text"
                  name="link_url"
                  value={formData.link_url}
                  onChange={handleChange}
                  placeholder="VD: #products, /laptop hoặc https://example.com"
                  style={{ width: '100%' }}
                />
                <small style={{ display: 'block', marginTop: '5px', color: 'var(--text-muted)' }}>
                  Nhập tab nội bộ (#builder, #products, #lookup), đường dẫn trong cửa hàng (/duong-dan), hoặc URL bắt đầu bằng https://.
                </small>
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="admin-label">
                Đường dẫn hình ảnh (URL) <span style={{ color: 'var(--accent-red)' }}>*</span>
              </label>
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={(e) => {
                  handleChange(e);
                  setImageError(false);
                }}
                placeholder="https://images.unsplash.com/..."
                required
                style={{ width: '100%', fontSize: '0.84rem' }}
              />
            </div>

            {/* Background Gradient Presets */}
            <div>
              <label className="admin-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Palette size={14} />
                <span>Màu nền Gradient chủ đạo</span>
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                {GRADIENT_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, bg_gradient: p.val }))}
                    style={{
                      background: p.val,
                      color: '#ffffff',
                      border: formData.bg_gradient === p.val ? '2px solid #ffffff' : '1px solid rgba(0,0,0,0.2)',
                      outline: formData.bg_gradient === p.val ? '2px solid var(--accent-red)' : 'none',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <input
                type="text"
                name="bg_gradient"
                value={formData.bg_gradient}
                onChange={handleChange}
                style={{ width: '100%', fontSize: '0.8rem', color: 'var(--text-muted)' }}
              />
            </div>

            {/* Order & Active Toggle */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'center' }}>
              <div>
                <label className="admin-label">Thứ tự hiển thị (1 = Đầu tiên)</label>
                <input
                  type="number"
                  name="display_order"
                  value={formData.display_order}
                  onChange={handleChange}
                  min="0"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', marginTop: '22px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleChange}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span>✅ Kích hoạt hiển thị trên trang chủ</span>
                </label>
              </div>
            </div>
          </div>

          {/* Footer buttons */}
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
              <span>{submitting ? 'Đang lưu...' : (isEditing ? 'Lưu Thay Đổi' : 'Tạo Banner')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
