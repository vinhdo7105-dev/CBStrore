import React, { useState } from 'react';
import { Copy, Check, QrCode, ExternalLink, ShieldCheck, Download } from 'lucide-react';
import { formatVND } from '../services/api';

export default function VietQRCard({ amount = 0, orderId = null, title = 'Mã QR Thanh Toán Tự Động (VietQR)' }) {
  const [copiedKey, setCopiedKey] = useState(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const bankName = 'MB Bank (Quân Đội)';
  const bankCode = 'MB';
  const accountNumber = '000000';
  const accountHolder = 'PC for 4';
  const transferContent = 'thanh toan qr';

  // Construct VietQR standard dynamic image URL
  const qrUrl = `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.png?amount=${Math.round(amount || 0)}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(accountHolder)}`;

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  return (
    <div className="vietqr-container">
      <div className="vietqr-header">
        <div className="vietqr-title-box">
          <QrCode size={20} className="vietqr-icon" />
          <h4 className="vietqr-title">{title}</h4>
        </div>
        <span className="vietqr-badge">Miễn phí 24/7</span>
      </div>

      <div className="vietqr-body">
        {/* Left Column: QR Code Display */}
        <div className="vietqr-qr-column">
          <div className="vietqr-image-wrapper">
            {!imgLoaded && !imgError && (
              <div className="vietqr-loading-placeholder">
                <div className="vietqr-spinner"></div>
                <span>Đang tạo mã VietQR...</span>
              </div>
            )}

            {imgError ? (
              <div className="vietqr-fallback">
                <QrCode size={64} color="var(--accent-red)" />
                <p>Không thể tải ảnh QR, vui lòng chuyển khoản theo thông tin bên cạnh</p>
              </div>
            ) : (
              <img
                src={qrUrl}
                alt={`VietQR ${bankCode} ${accountNumber} ${accountHolder}`}
                className="vietqr-image"
                style={{ display: imgLoaded ? 'block' : 'none' }}
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
              />
            )}
          </div>

          <p className="vietqr-scan-guide">
            Mở App ngân hàng quét mã để tự động điền STK, tên, số tiền và nội dung.
          </p>
        </div>

        {/* Right Column: Copyable Banking Information */}
        <div className="vietqr-info-column">
          <div className="vietqr-info-group">
            <span className="vietqr-label">Ngân hàng thụ hưởng:</span>
            <div className="vietqr-value-row">
              <span className="vietqr-value bold">{bankName}</span>
            </div>
          </div>

          <div className="vietqr-info-group highlight-box">
            <span className="vietqr-label">Số tài khoản (STK):</span>
            <div className="vietqr-value-row">
              <span className="vietqr-value mono bold stk-val">{accountNumber}</span>
              <button
                type="button"
                className={`copy-btn ${copiedKey === 'stk' ? 'copied' : ''}`}
                onClick={() => handleCopy(accountNumber, 'stk')}
                title="Sao chép số tài khoản"
              >
                {copiedKey === 'stk' ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedKey === 'stk' ? 'Đã chép' : 'Sao chép'}</span>
              </button>
            </div>
          </div>

          <div className="vietqr-info-group">
            <span className="vietqr-label">Tên chủ tài khoản:</span>
            <div className="vietqr-value-row">
              <span className="vietqr-value bold text-uppercase">{accountHolder}</span>
              <button
                type="button"
                className={`copy-btn ${copiedKey === 'name' ? 'copied' : ''}`}
                onClick={() => handleCopy(accountHolder, 'name')}
                title="Sao chép tên chủ tài khoản"
              >
                {copiedKey === 'name' ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedKey === 'name' ? 'Đã chép' : 'Sao chép'}</span>
              </button>
            </div>
          </div>

          <div className="vietqr-info-group highlight-box">
            <span className="vietqr-label">Số tiền cần thanh toán:</span>
            <div className="vietqr-value-row">
              <span className="vietqr-value mono bold amount-val">{formatVND(amount)}</span>
              <button
                type="button"
                className={`copy-btn ${copiedKey === 'amount' ? 'copied' : ''}`}
                onClick={() => handleCopy(String(Math.round(amount || 0)), 'amount')}
                title="Sao chép số tiền"
              >
                {copiedKey === 'amount' ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedKey === 'amount' ? 'Đã chép' : 'Sao chép'}</span>
              </button>
            </div>
          </div>

          <div className="vietqr-info-group highlight-box memo-box">
            <span className="vietqr-label">Nội dung / Chú thích chuyển khoản:</span>
            <div className="vietqr-value-row">
              <span className="vietqr-value mono bold memo-val">{transferContent}</span>
              <button
                type="button"
                className={`copy-btn ${copiedKey === 'memo' ? 'copied' : ''}`}
                onClick={() => handleCopy(transferContent, 'memo')}
                title="Sao chép nội dung chuyển khoản"
              >
                {copiedKey === 'memo' ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedKey === 'memo' ? 'Đã chép' : 'Sao chép'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="vietqr-footer-note">
        <ShieldCheck size={16} className="vietqr-shield-icon" />
        <span>Giao dịch bảo mật qua hệ thống chuyển khoản liên ngân hàng <strong>Napas 247</strong> & <strong>VietQR</strong>.</span>
      </div>
    </div>
  );
}
