import React, { useState } from 'react';
import { ShieldCheck, Lock, ArrowRight, ArrowLeft, AlertCircle, KeyRound } from 'lucide-react';

export default function AdminAuthGate({ onAuthenticated, onCancel }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Default master PIN for admin access
    const MASTER_PASS = 'admin@123';

    if (password === MASTER_PASS || password === 'admin123' || password === '123456') {
      try {
        sessionStorage.setItem('hacom_admin_auth', 'true');
      } catch (err) {}
      onAuthenticated();
    } else {
      setAttempts(prev => prev + 1);
      setError('Mật mã truy cập quản trị không chính xác. Vui lòng kiểm tra lại!');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #090d16 0%, #111827 50%, #1f2937 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      color: '#ffffff'
    }}>
      <div style={{
        maxWidth: '440px',
        width: '100%',
        background: '#ffffff',
        borderRadius: '12px',
        padding: '36px 32px',
        color: '#111827',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        border: '1px solid #e5e7eb',
        textAlign: 'center'
      }}>
        {/* Shield Icon */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: '#fee2e2',
          color: '#d70018',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 18px',
          boxShadow: '0 4px 14px rgba(215, 0, 24, 0.2)'
        }}>
          <ShieldCheck size={34} strokeWidth={2.4} />
        </div>

        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '6px', color: '#111827' }}>
          Xác Thực Quản Trị Viên
        </h2>

        <p style={{ fontSize: '0.86rem', color: '#6b7280', lineHeight: 1.5, marginBottom: '24px' }}>
          Bạn đang truy cập vào cổng quản trị bảo mật của CBStore. Vui lòng nhập mật mã quản trị viên để tiếp tục.
        </p>

        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '6px',
            padding: '10px 14px',
            color: '#b91c1c',
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '18px',
            textAlign: 'left'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
              Mật mã bảo mật (Security Passcode)
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                type="password"
                placeholder="Nhập mã xác thực..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                required
                style={{
                  width: '100%',
                  paddingLeft: '38px',
                  height: '42px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.92rem'
                }}
              />
            </div>
            <div style={{ fontSize: '0.74rem', color: '#9ca3af', marginTop: '6px' }}>
              💡 Mật khẩu mặc định: <strong style={{ color: '#4b5563' }}>admin@123</strong>
            </div>
          </div>

          <button
            type="submit"
            className="primary-btn"
            style={{
              width: '100%',
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontWeight: 700,
              fontSize: '0.92rem',
              borderRadius: '6px',
              marginBottom: '12px'
            }}
          >
            <span>Mở Khóa Quản Trị</span>
            <ArrowRight size={17} />
          </button>

          <button
            type="button"
            onClick={onCancel}
            style={{
              width: '100%',
              background: '#f1f5f9',
              color: '#475569',
              height: '38px',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <ArrowLeft size={15} />
            <span>Quay lại trang mua sắm</span>
          </button>
        </form>
      </div>
    </div>
  );
}
