import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search, ShoppingCart, FileText, Phone, Wrench } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Navbar({
  activeTab,
  setActiveTab,
  searchQuery = '',
  setSearchQuery = () => {},
  onToggleCategoryMenu = () => {}
}) {
  const { totalItems, totalPrice, setIsCartOpen } = useCart();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveTab('products');
  };

  return (
    <header className="navbar-wrapper">
      {/* Top utility sub-strip */}
      <div className="top-strip">
        <div className="container top-strip-container">
          <div className="top-strip-left">
            <span>Chào mừng bạn đến với CBStore</span>
          </div>
          <div className="top-strip-right">
            <Link
              to="/builder"
              className={`top-nav-link ${activeTab === 'builder' ? 'active' : ''}`}
            >
              <Wrench size={13} />
              <span>Xây dựng cấu hình PC</span>
            </Link>
            <span className="strip-divider">|</span>
            <Link
              to="/lookup"
              className={`top-nav-link ${activeTab === 'lookup' ? 'active' : ''}`}
            >
              <FileText size={13} />
              <span>Tra cứu đơn hàng</span>
            </Link>
            <span className="strip-divider">|</span>
            <span className="top-hotline">
              <Phone size={13} />
              <span>Hotline: <strong>1900 8899</strong></span>
            </span>
          </div>
        </div>
      </div>

      {/* Main HACOM Navbar Header */}
      <div className="main-navbar">
        <div className="container nav-container">
          {/* 1. Category Menu Button (☰ Danh mục) */}
          <button
            className="category-toggle-btn"
            onClick={onToggleCategoryMenu}
            title="Xem toàn bộ danh mục sản phẩm"
          >
            <Menu size={19} strokeWidth={2.4} />
            <span>Danh mục</span>
          </button>

          {/* 2. CBStore brand logo */}
          <Link to="/" className="hacom-logo-area">
            <div className="logo-wordmark">
              <span className="logo-ha">CBStore</span>
            </div>
          </Link>

          {/* 3. Search Bar: Rounded Pill with embedded red search button */}
          <form className="hacom-search-box" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              className="hacom-search-input"
              placeholder="Nhập tên sản phẩm, từ khóa cần tìm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="hacom-search-btn"
              title="Tìm kiếm"
              aria-label="Tìm kiếm"
            >
              <Search size={18} strokeWidth={2.5} />
            </button>
          </form>

          {/* 4. Cart Button */}
          <div className="hacom-nav-actions">
            <button
              className="hacom-cart-btn"
              onClick={() => setIsCartOpen(true)}
              title="Xem giỏ hàng của bạn"
            >
              <div className="cart-icon-container">
                <ShoppingCart size={22} strokeWidth={2} />
                <span className="hacom-cart-badge">{totalItems}</span>
              </div>
              <span className="cart-label-text">Giỏ hàng</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

