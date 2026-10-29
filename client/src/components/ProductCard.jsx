import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Check, Phone, Gift, ShieldCheck, Sparkles } from 'lucide-react';
import { formatVND } from '../services/api';
import { useCart } from '../context/CartContext';
import { productPath } from '../utils/slug';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  // Generate clean SKU like LTAC1016 / INTEL1460
  const sku = product.sku || (product.brand ? product.brand.slice(0, 3).toUpperCase() : 'PC') + 
    (product.id ? product.id.replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase() : '101');

  // Calculate savings percentage
  const hasDiscount = product.original_price && product.original_price > product.price;
  const savingsPercent = hasDiscount 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const isAvailable = (product.stock ?? 10) > 0;

  return (
    <Link to={productPath(product)} className="product-card">
      {/* Product Image */}
      <div className="product-img-box">
        <img
          src={product.image_url}
          alt={product.name}
          className="product-img"
          loading="lazy"
        />
        {savingsPercent > 0 && (
          <span className="card-top-discount-badge">-{savingsPercent}%</span>
        )}
      </div>

      {/* Rating Stars & SKU Code */}
      <div className="rating-sku-row">
        <div className="stars-list" title="5 sao đánh giá">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={11} fill="#fbbf24" stroke="#fbbf24" />
          ))}
        </div>
        <span className="sku-badge">Mã: {sku}</span>
      </div>

      {/* Product Title */}
      <h3 className="product-title" title={product.name}>
        {product.name}
      </h3>

      {/* Price Section */}
      <div className="card-price-box">
        {hasDiscount ? (
          <div className="price-strike-row">
            <span className="price-original">{formatVND(product.original_price)}</span>
            <span className="discount-tag">(Tiết kiệm {savingsPercent}%)</span>
          </div>
        ) : (
          <div className="price-strike-row" style={{ visibility: 'hidden' }}>
            <span>-</span>
          </div>
        )}
        <div className="price-main">
          {formatVND(product.price)}
        </div>
      </div>

      {/* Stock Status & Red Circle Cart Button */}
      <div className="stock-cart-row">
        {isAvailable ? (
          <span className="stock-status-green">
            <Check size={14} strokeWidth={2.5} />
            <span>Sẵn hàng</span>
          </span>
        ) : (
          <span className="stock-status-blue">
            <Phone size={13} strokeWidth={2} />
            <span>Đặt hàng</span>
          </span>
        )}

        <button
          className="quick-cart-btn"
          onClick={handleQuickAdd}
          title="Thêm vào giỏ hàng"
          aria-label="Thêm vào giỏ hàng"
        >
          <ShoppingCart size={16} strokeWidth={2.2} />
        </button>
      </div>

      {/* Promotion / Gifts Mini Badges (HACOM Signature) */}
      <div className="card-gifts-row">
        <div className="gift-mini-icon" title="Bảo hành chính hãng">
          <ShieldCheck size={13} />
        </div>
        <div className="gift-mini-icon" title="Quà tặng khuyến mãi">
          <Gift size={13} />
        </div>
        <div className="gift-mini-icon" title="Miễn phí giao hàng">
          <Sparkles size={13} />
        </div>
      </div>
    </Link>
  );
}
