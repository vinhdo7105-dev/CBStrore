import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  ShoppingCart,
  CreditCard,
  Plus,
  Trash2,
  RefreshCw,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Share2
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { fetchProducts, checkCompatibility, formatVND } from '../services/api';

// 15 slots matching Image 1
const BUILDER_SLOTS = [
  { key: 'cpu', num: '1', label: 'Bộ vi xử lý', categoryId: 'cpu' },
  { key: 'mainboard', num: '2', label: 'Bo mạch chủ', categoryId: 'mainboard' },
  { key: 'ram', num: '3', label: 'RAM', categoryId: 'ram' },
  { key: 'hdd', num: '4', label: 'HDD', categoryId: 'hdd' },
  { key: 'ssd', num: '5', label: 'SSD', categoryId: 'ssd' },
  { key: 'vga', num: '6', label: 'VGA', categoryId: 'vga' },
  { key: 'vga_likenew', num: '7', label: 'VGA Like New', categoryId: 'vga_likenew', fallbackCategoryId: 'vga' },
  { key: 'psu', num: '8', label: 'Nguồn', categoryId: 'psu' },
  { key: 'case', num: '9', label: 'Vỏ Case', categoryId: 'case' },
  { key: 'monitor', num: '10', label: 'Màn hình', categoryId: 'monitor' },
  { key: 'combo_gear', num: '11', label: 'Bộ bàn phím, chuột', categoryId: 'combo_gear' },
  { key: 'keyboard', num: '12', label: 'Bàn phím', categoryId: 'keyboard' },
  { key: 'mouse', num: '13', label: 'Chuột', categoryId: 'mouse' },
  { key: 'headset', num: '14', label: 'Tai nghe', categoryId: 'headset' },
  { key: 'speaker', num: '15', label: 'Loa', categoryId: 'speaker' }
];

// Price Ranges matching Image 3 filter sidebar
const PRICE_RANGES = [
  { id: 'all', label: 'Tất cả' },
  { id: 'under-1m', label: 'Dưới 1 triệu', min: 0, max: 1000000 },
  { id: '1m-2m', label: '1 - 2 triệu', min: 1000000, max: 2000000 },
  { id: '2m-3m', label: '2 - 3 triệu', min: 2000000, max: 3000000 },
  { id: '3m-4m', label: '3 - 4 triệu', min: 3000000, max: 4000000 },
  { id: '4m-5m', label: '4 - 5 triệu', min: 4000000, max: 5000000 },
  { id: '5m-6m', label: '5 - 6 triệu', min: 5000000, max: 6000000 },
  { id: '6m-7m', label: '6 - 7 triệu', min: 6000000, max: 7000000 },
  { id: '7m-10m', label: '7 - 10 triệu', min: 7000000, max: 10000000 },
  { id: 'over-10m', label: 'Trên 10 triệu', min: 10000000, max: Infinity }
];

export default function PCBuilder() {
  const { addMultipleToCart, showToast, setIsCartOpen, setIsCheckoutOpen } = useCart();

  // Selected components map
  const [selectedParts, setSelectedParts] = useState({});

  // Active Slot modal state
  const [activeSlot, setActiveSlot] = useState(null);
  const [slotProducts, setSlotProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Modal Filters
  const [modalSearch, setModalSearch] = useState('');
  const [modalSort, setModalSort] = useState('default');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Compatibility state
  const [compatibility, setCompatibility] = useState({
    compatible: true,
    estimatedWattage: 80,
    recommendedWattage: 500,
    warnings: [],
    notes: []
  });

  // Check compatibility when CPU/Mainboard/PSU/VGA/RAM change
  useEffect(() => {
    async function verify() {
      try {
        const res = await checkCompatibility(selectedParts);
        setCompatibility(res);
      } catch (err) {
        console.error('Check compatibility failed:', err);
      }
    }
    verify();
  }, [selectedParts]);

  // Open part picker modal for a slot
  const handleOpenSlot = async (slot) => {
    setActiveSlot(slot);
    setModalSearch('');
    setModalSort('default');
    setSelectedPriceRange('all');
    setSelectedBrand('all');
    setCurrentPage(1);
    setLoadingProducts(true);

    try {
      let prods = await fetchProducts({ categoryId: slot.categoryId });
      if ((!prods || prods.length === 0) && slot.fallbackCategoryId) {
        prods = await fetchProducts({ categoryId: slot.fallbackCategoryId });
      }
      setSlotProducts(prods || []);
    } catch (err) {
      console.error('Error fetching slot products:', err);
      setSlotProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Select a product for the active slot
  const handleSelectProduct = (product) => {
    if (!activeSlot) return;
    setSelectedParts(prev => ({
      ...prev,
      [activeSlot.key]: {
        ...product,
        buildQty: 1
      }
    }));
    setActiveSlot(null);
    showToast(`Đã chọn: ${product.name.slice(0, 35)}...`);
  };

  // Remove component from slot
  const handleRemovePart = (key) => {
    setSelectedParts(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  // Clear all
  const handleClearAll = () => {
    setSelectedParts({});
    showToast('Đã làm mới cấu hình máy');
  };

  // Copy build specs
  const handleCopyBuild = () => {
    const list = Object.entries(selectedParts).map(([key, item]) => {
      const slot = BUILDER_SLOTS.find(s => s.key === key);
      return `• ${slot ? slot.label : key}: ${item.name} (${formatVND(item.price)})`;
    });

    if (list.length === 0) {
      showToast('Cấu hình đang trống', 'error');
      return;
    }

    const total = Object.values(selectedParts).reduce((sum, item) => sum + (item.price || 0), 0);
    const text = `=== CẤU HÌNH MÁY TÍNH CBStore ===\n` +
      list.join('\n') +
      `\n--------------------------------\n` +
      `Tổng tiền thanh toán: ${formatVND(total)}\n` +
      `Hotline tư vấn CBStore: 1900 8899`;

    navigator.clipboard.writeText(text);
    showToast('Đã sao chép cấu hình máy vào bộ nhớ tạm!');
  };

  // Total build calculation
  const totalBuildPrice = useMemo(() => {
    return Object.values(selectedParts).reduce((sum, item) => {
      return sum + (item ? Number(item.price) * (item.buildQty || 1) : 0);
    }, 0);
  }, [selectedParts]);

  const filledCount = Object.keys(selectedParts).length;

  // Add all selected parts to cart
  const handleAddAllToCart = () => {
    const partsArray = Object.values(selectedParts).filter(Boolean);
    if (partsArray.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 linh kiện trước khi thêm vào giỏ', 'error');
      return;
    }
    addMultipleToCart(partsArray);
    setIsCartOpen(true);
  };

  // Direct checkout
  const handleDirectCheckout = () => {
    const partsArray = Object.values(selectedParts).filter(Boolean);
    if (partsArray.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 linh kiện để đặt hàng', 'error');
      return;
    }
    if (addMultipleToCart(partsArray)) {
      setIsCheckoutOpen(true);
    } else {
      setIsCartOpen(true);
    }
  };

  // Extract available brands in modal
  const availableBrands = useMemo(() => {
    const brandsSet = new Set();
    slotProducts.forEach(p => {
      if (p.brand) brandsSet.add(p.brand.toUpperCase());
    });
    return Array.from(brandsSet);
  }, [slotProducts]);

  // Filter & sort products for modal
  const filteredModalProducts = useMemo(() => {
    let result = [...slotProducts];

    // Search filter
    if (modalSearch.trim()) {
      const q = modalSearch.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q))
      );
    }

    // Price range filter
    if (selectedPriceRange !== 'all') {
      const range = PRICE_RANGES.find(r => r.id === selectedPriceRange);
      if (range) {
        result = result.filter(p => p.price >= range.min && p.price < range.max);
      }
    }

    // Brand filter
    if (selectedBrand !== 'all') {
      result = result.filter(p => p.brand && p.brand.toUpperCase() === selectedBrand);
    }

    // Sort
    if (modalSort === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (modalSort === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (modalSort === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [slotProducts, modalSearch, selectedPriceRange, selectedBrand, modalSort]);

  // Paginated modal products
  const totalPages = Math.max(1, Math.ceil(filteredModalProducts.length / ITEMS_PER_PAGE));
  const paginatedModalProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredModalProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredModalProducts, currentPage]);

  return (
    <div className="pc-builder-container">
      {/* Top Header & Actions */}
      <div className="builder-top-actions-bar">
        <div className="builder-title-group">
          <h1 className="builder-main-title">Xây Dựng Cấu Hình Máy Tính</h1>
          <p className="builder-sub-title">
            Tự tay lựa chọn từng linh kiện cấu hình chuẩn theo nhu cầu sử dụng của bạn
          </p>
        </div>

        <div className="builder-quick-tools">
          <button className="tool-btn" onClick={handleClearAll} title="Làm mới toàn bộ danh sách">
            <RotateCcw size={15} />
            <span>Làm mới</span>
          </button>
          <button className="tool-btn" onClick={handleCopyBuild} title="Sao chép danh sách cấu hình">
            <Share2 size={15} />
            <span>Sao chép cấu hình</span>
          </button>
        </div>
      </div>

      {/* Compatibility Banner (if warning exists) */}
      {!compatibility.compatible && compatibility.warnings.length > 0 && (
        <div className="builder-warning-banner">
          <AlertTriangle size={18} />
          <div>
            <strong>Cảnh báo không tương thích:</strong>
            {compatibility.warnings.map((w, idx) => (
              <div key={idx} style={{ fontSize: '0.85rem', marginTop: 2 }}>• {w}</div>
            ))}
          </div>
        </div>
      )}

      {/* 15 SLOTS TABLE (IMAGE 1 LAYOUT - WITHOUT "GIÁ CỰC SỐC") */}
      <div className="builder-table-box">
        {BUILDER_SLOTS.map((slot) => {
          const selectedItem = selectedParts[slot.key];

          return (
            <div key={slot.key} className="builder-table-row">
              {/* Left Column: Number & Slot Name */}
              <div className="slot-col-label">
                <span>{slot.num}. {slot.label}</span>
              </div>

              {/* Right Column: Button or Selected Item */}
              <div className="slot-col-action">
                {!selectedItem ? (
                  /* Red Button: + Chọn [Slot Name] (Without any "Giá cực sốc") */
                  <button
                    className="red-pick-slot-btn"
                    onClick={() => handleOpenSlot(slot)}
                  >
                    <Plus size={16} strokeWidth={2.5} />
                    <span>Chọn {slot.label}</span>
                  </button>
                ) : (
                  /* Selected Item Details View */
                  <div className="slot-selected-item-card">
                    <img
                      src={selectedItem.image_url}
                      alt={selectedItem.name}
                      className="slot-selected-thumb"
                    />

                    <div className="slot-selected-info">
                      <h4 className="slot-selected-title" title={selectedItem.name}>
                        {selectedItem.name}
                      </h4>
                      <div className="slot-selected-meta">
                        <span>Mã SP: <strong>{selectedItem.sku || selectedItem.id}</strong></span>
                        <span className="meta-sep">|</span>
                        <span>Bảo hành: <strong>{selectedItem.warranty || '36 Tháng'}</strong></span>
                      </div>
                      <div className="slot-selected-price">
                        {formatVND(selectedItem.price)}
                      </div>
                    </div>

                    <div className="slot-selected-actions">
                      <button
                        className="slot-action-btn edit"
                        onClick={() => handleOpenSlot(slot)}
                        title="Đổi linh kiện khác"
                      >
                        <RefreshCw size={14} />
                        <span>Đổi</span>
                      </button>
                      <button
                        className="slot-action-btn remove"
                        onClick={() => handleRemovePart(slot.key)}
                        title="Xóa linh kiện này"
                      >
                        <Trash2 size={14} />
                        <span>Xóa</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ORDER SUMMARY CARD AT THE BOTTOM (IMAGE 2 LAYOUT) */}
      <div className="builder-bottom-summary-section">
        <div className="builder-order-summary-card">
          <h3 className="order-summary-heading">Tóm tắt đơn hàng</h3>

          {/* Row 1: Chi phí dự tính */}
          <div className="order-summary-row">
            <span className="summary-field-name">Chi phí dự tính</span>
            <span className="summary-field-val">
              {totalBuildPrice > 0 ? formatVND(totalBuildPrice) : '0'}
            </span>
          </div>

          <div className="order-summary-divider" />

          {/* Row 2: Tổng tiền thanh toán */}
          <div className="order-summary-row bold">
            <span className="summary-total-name">Tổng tiền thanh toán</span>
            <span className="summary-total-val">
              {totalBuildPrice > 0 ? formatVND(totalBuildPrice) : '0'}
            </span>
          </div>

          {/* Buttons: Thêm vào giỏ hàng & Đặt hàng ngay */}
          <div className="order-summary-btn-group">
            <button
              className={`order-summary-btn btn-cart ${filledCount === 0 ? 'disabled' : ''}`}
              onClick={handleAddAllToCart}
              disabled={filledCount === 0}
            >
              <span>Thêm vào giỏ hàng</span>
              <ShoppingCart size={17} />
            </button>

            <button
              className={`order-summary-btn btn-order ${filledCount === 0 ? 'disabled' : ''}`}
              onClick={handleDirectCheckout}
              disabled={filledCount === 0}
            >
              <span>Đặt hàng ngay</span>
              <CreditCard size={17} />
            </button>
          </div>
        </div>
      </div>

      {/* COMPONENT SELECTION MODAL (IMAGE 3 LAYOUT) */}
      {activeSlot && (
        <div className="part-picker-overlay" onClick={() => setActiveSlot(null)}>
          <div className="part-picker-modal" onClick={(e) => e.stopPropagation()}>
            {/* 1. Dark Navy Modal Header */}
            <div className="part-picker-header">
              <h3 className="picker-header-title">Chọn linh kiện</h3>
              <button
                className="picker-close-btn"
                onClick={() => setActiveSlot(null)}
                aria-label="Đóng"
              >
                <X size={20} />
              </button>
            </div>

            {/* 2. Modal Body (2 Columns Layout) */}
            <div className="part-picker-body">
              {/* LEFT COLUMN: FILTER SIDEBAR */}
              <aside className="picker-filter-sidebar">
                <div className="sidebar-title">Lọc sản phẩm theo</div>

                {/* Filter Group: Khoảng giá */}
                <div className="sidebar-filter-group">
                  <div className="filter-group-header">
                    <span>Khoảng giá</span>
                    <ChevronDown size={15} color="#94a3b8" />
                  </div>
                  <div className="filter-options-list">
                    {PRICE_RANGES.map((range) => (
                      <label key={range.id} className="filter-radio-label">
                        <input
                          type="radio"
                          name="price_range"
                          value={range.id}
                          checked={selectedPriceRange === range.id}
                          onChange={() => {
                            setSelectedPriceRange(range.id);
                            setCurrentPage(1);
                          }}
                        />
                        <span>{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Filter Group: Hãng sản xuất */}
                {availableBrands.length > 0 && (
                  <div className="sidebar-filter-group">
                    <div className="filter-group-header">
                      <span>Hãng sản xuất</span>
                      <ChevronDown size={15} color="#94a3b8" />
                    </div>
                    <div className="filter-options-list">
                      <label className="filter-radio-label">
                        <input
                          type="radio"
                          name="brand"
                          value="all"
                          checked={selectedBrand === 'all'}
                          onChange={() => {
                            setSelectedBrand('all');
                            setCurrentPage(1);
                          }}
                        />
                        <span>Tất cả hãng</span>
                      </label>
                      {availableBrands.map((b) => (
                        <label key={b} className="filter-radio-label">
                          <input
                            type="radio"
                            name="brand"
                            value={b}
                            checked={selectedBrand === b}
                            onChange={() => {
                              setSelectedBrand(b);
                              setCurrentPage(1);
                            }}
                          />
                          <span>{b}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </aside>

              {/* RIGHT COLUMN: SEARCH, SORT & PRODUCT ROWS */}
              <section className="picker-product-content">
                {/* Top Search & Sort Controls Bar */}
                <div className="picker-controls-row">
                  <div className="picker-search-input-box">
                    <Search size={16} className="picker-search-icon" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm sản phẩm..."
                      value={modalSearch}
                      onChange={(e) => {
                        setModalSearch(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="picker-search-field"
                    />
                  </div>

                  <div className="picker-sort-box">
                    <span className="picker-sort-label">Sắp xếp:</span>
                    <select
                      className="picker-sort-select"
                      value={modalSort}
                      onChange={(e) => {
                        setModalSort(e.target.value);
                        setCurrentPage(1);
                      }}
                    >
                      <option value="default">Mặc định</option>
                      <option value="price-asc">Giá: Thấp đến Cao</option>
                      <option value="price-desc">Giá: Cao đến Thấp</option>
                      <option value="name-asc">Tên sản phẩm: A - Z</option>
                    </select>
                  </div>
                </div>

                {/* Sub Bar: Found Count & Pagination */}
                <div className="picker-subbar-row">
                  <div className="picker-count-text">
                    Tìm thấy <strong>{filteredModalProducts.length}</strong> sản phẩm
                  </div>

                  {totalPages > 1 && (
                    <div className="picker-pagination">
                      <button
                        className="page-nav-btn"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      >
                        <ChevronLeft size={14} />
                      </button>
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          className={`page-num-btn ${currentPage === i + 1 ? 'active' : ''}`}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        className="page-nav-btn"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Product Rows List (Vertical Items matching Image 3) */}
                <div className="picker-products-list">
                  {loadingProducts ? (
                    <div className="picker-empty-state">
                      Đang tải danh sách linh kiện...
                    </div>
                  ) : paginatedModalProducts.length === 0 ? (
                    <div className="picker-empty-state">
                      Không tìm thấy linh kiện phù hợp với bộ lọc đã chọn.
                    </div>
                  ) : (
                    paginatedModalProducts.map((product) => {
                      const isCurrentlySelected = selectedParts[activeSlot.key]?.id === product.id;
                      const isAvailable = (product.stock ?? 10) > 0;

                      return (
                        <div key={product.id} className="picker-product-row-item">
                          {/* Image in square frame */}
                          <div className="picker-thumb-frame">
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="picker-thumb-img"
                              loading="lazy"
                            />
                          </div>

                          {/* Middle Info */}
                          <div className="picker-middle-info">
                            <h4 className="picker-item-name" title={product.name}>
                              {product.name}
                            </h4>
                            <div className="picker-item-meta">
                              <span>Mã SP: {product.sku || product.id}</span>
                              <span className="meta-sep">|</span>
                              <span>Bảo hành: {product.warranty || '36 Tháng'}</span>
                            </div>
                            <div className="picker-item-price-row">
                              <span className="picker-item-price">
                                {formatVND(product.price)}
                              </span>
                              {isAvailable ? (
                                <span className="picker-stock-avail">Còn hàng</span>
                              ) : (
                                <span className="picker-stock-order">Liên hệ</span>
                              )}
                            </div>
                          </div>

                          {/* Right: + Thêm Button (Navy Button matching Image 3) */}
                          <div className="picker-right-action">
                            <button
                              className={`picker-add-navy-btn ${isCurrentlySelected ? 'selected' : ''}`}
                              onClick={() => handleSelectProduct(product)}
                            >
                              {isCurrentlySelected ? (
                                <>
                                  <Check size={15} strokeWidth={3} />
                                  <span>Đã chọn</span>
                                </>
                              ) : (
                                <>
                                  <Plus size={15} strokeWidth={2.5} />
                                  <span>Thêm</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
