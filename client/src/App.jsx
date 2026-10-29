import React, { useState, useEffect } from 'react';
import { BrowserRouter, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Cpu,
  Layers,
  Server,
  MonitorPlay,
  HardDrive,
  Zap,
  Box,
  Fan,
  Laptop,
  ArrowRight,
  X,
  ChevronRight
} from 'lucide-react';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import PCBuilder from './components/PCBuilder';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminAuthGate from './components/admin/AdminAuthGate';
import BannerCarousel from './components/BannerCarousel';
import OrderLookup from './components/OrderLookup';
import Toast from './components/Toast';
import { CartProvider } from './context/CartContext';
import { fetchCategories, fetchProducts, fetchProductBySlug } from './services/api';
import { categoryPath, productSlug } from './utils/slug';

// Đường dẫn bảo mật phức tạp riêng cho quản trị viên (Admin)
const ADMIN_SECRET_PATH = '/admin-portal-secure-x98k2';
const ADMIN_SECRET_HASH = '#/admin-portal-secure-x98k2';
const RESERVED_PATHS = new Set(['builder', 'lookup', 'admin-portal-secure-x98k2']);

function getPathSlug(pathname) {
  return (pathname || '/').split('/').filter(Boolean)[0] || '';
}

const CATEGORY_ICONS = {
  cpu: Cpu,
  mainboard: Layers,
  ram: Server,
  vga: MonitorPlay,
  ssd: HardDrive,
  psu: Zap,
  case: Box,
  cooling: Fan,
  laptop: Laptop
};

// Pills list exactly from the HACOM screenshot
const HACOM_FEATURED_TAGS = [
  { id: 'apple', label: 'APPLE', brand: 'Apple' },
  { id: 'dell', label: 'DELL', brand: 'Dell' },
  { id: 'asus', label: 'ASUS', brand: 'ASUS' },
  { id: 'acer', label: 'ACER', brand: 'Acer' },
  { id: 'msi', label: 'MSI', brand: 'MSI' },
  { id: 'lenovo', label: 'LENOVO', brand: 'Lenovo' },
  { id: 'gaming', label: 'LAPTOP GAMING, ĐỒ HỌA', keyword: 'Gaming' },
  { id: 'intel', label: 'INTEL', brand: 'Intel' },
  { id: 'amd', label: 'AMD', brand: 'AMD' },
  { id: 'gigabyte', label: 'GIGABYTE', brand: 'GIGABYTE' },
  { id: 'corsair', label: 'CORSAIR', brand: 'Corsair' },
  { id: 'kingston', label: 'KINGSTON', brand: 'Kingston' }
];

function MainApp() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathSlug = getPathSlug(location.pathname);
  const isAdminRoute = location.pathname === ADMIN_SECRET_PATH;
  const isBuilder = pathSlug === 'builder';
  const isLookup = pathSlug === 'lookup';
  const activeTab = isBuilder ? 'builder' : isLookup ? 'lookup' : 'products';

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('featured');
  const [activeTag, setActiveTag] = useState('');

  // UI States
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState(null);
  const [lookupPhonePreFill, setLookupPhonePreFill] = useState('');

  const [isAdminUnlocked, setIsAdminUnlocked] = useState(() => {
    try {
      return sessionStorage.getItem('hacom_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  const goTab = (tab) => {
    if (tab === 'builder') navigate('/builder');
    else if (tab === 'lookup') navigate('/lookup');
    else navigate('/');
  };

  // Keep old hash admin URL working
  useEffect(() => {
    if (location.hash === ADMIN_SECRET_HASH) {
      navigate(ADMIN_SECRET_PATH, { replace: true });
    }
  }, [location.hash, navigate]);

  // Fetch categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await fetchCategories();
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    loadCategories();
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const prods = await fetchProducts({
          categoryId: selectedCategory,
          brand: selectedBrand,
          search: searchQuery,
          sort: sortOption
        });
        setProducts(prods);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      loadProducts();
    }, 150);

    return () => clearTimeout(timer);
  }, [selectedCategory, selectedBrand, searchQuery, sortOption]);

  // Sync URL -> category / product page
  useEffect(() => {
    if (isAdminRoute || isBuilder || isLookup) {
      setModalProduct(null);
      return;
    }

    if (!pathSlug) {
      setSelectedCategory('all');
      setModalProduct(null);
      return;
    }

    const isKnownCategory =
      Boolean(CATEGORY_ICONS[pathSlug]) || categories.some((c) => c.id === pathSlug);
    if (isKnownCategory) {
      setSelectedCategory(pathSlug);
      setModalProduct(null);
      return;
    }

    if (RESERVED_PATHS.has(pathSlug)) return;
    if (categories.length === 0) return;

    const localMatch = products.find(
      (p) => productSlug(p) === pathSlug || String(p.id) === pathSlug
    );
    if (localMatch) {
      setModalProduct(localMatch);
      if (localMatch.category_id) setSelectedCategory(localMatch.category_id);
      return;
    }

    let cancelled = false;
    async function loadProductFromUrl() {
      try {
        const product = await fetchProductBySlug(pathSlug);
        if (cancelled) return;
        if (product) {
          setModalProduct(product);
          if (product.category_id) setSelectedCategory(product.category_id);
        } else {
          setModalProduct(null);
        }
      } catch {
        if (!cancelled) setModalProduct(null);
      }
    }
    loadProductFromUrl();
    return () => {
      cancelled = true;
    };
  }, [pathSlug, categories, products, isAdminRoute, isBuilder, isLookup]);

  const handleOrderSuccess = (phone) => {
    setLookupPhonePreFill(phone);
    navigate('/lookup');
  };

  const handleTagClick = (tag) => {
    if (activeTag === tag.id) {
      // Toggle off
      setActiveTag('');
      setSelectedBrand('all');
      setSearchQuery('');
    } else {
      setActiveTag(tag.id);
      if (tag.brand) {
        setSelectedBrand(tag.brand);
        setSearchQuery('');
      } else if (tag.keyword) {
        setSearchQuery(tag.keyword);
        setSelectedBrand('all');
      }
    }
  };

  const handleViewAll = () => {
    setActiveTag('');
    setSelectedBrand('all');
    setSearchQuery('');
    setSortOption('featured');
    navigate('/');
  };

  const closeProductModal = () => {
    const categoryId = modalProduct?.category_id || selectedCategory;
    navigate(categoryPath(categoryId));
  };

  // Compute display title for section
  const getSectionTitle = () => {
    if (selectedCategory !== 'all') {
      const found = categories.find(c => c.id === selectedCategory);
      if (found) return found.name.toUpperCase();
    }
    if (selectedBrand !== 'all') {
      return `SẢN PHẨM ${selectedBrand.toUpperCase()}`;
    }
    return 'LAPTOP, MÁY TÍNH XÁCH TAY & LINH KIỆN PC';
  };

  // Secret Admin Portal Gate
  if (isAdminRoute) {
    if (!isAdminUnlocked) {
      return (
        <AdminAuthGate
          onAuthenticated={() => setIsAdminUnlocked(true)}
          onCancel={() => {
            navigate('/');
          }}
        />
      );
    }

    return (
      <div className="app-layout">
        <AdminDashboard
          onBackToStore={() => {
            navigate('/');
          }}
        />
        <Toast />
      </div>
    );
  }

  return (
    <div className="app-layout">
      {/* 1. HACOM Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={goTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onToggleCategoryMenu={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
      />

      <main className="container">
        {/* Category Menu Dropdown (when toggled from ☰ Danh mục button) */}
        {isCategoryMenuOpen && (
          <div className="category-dropdown-panel">
            <Link
              to="/"
              className={`cat-menu-item ${selectedCategory === 'all' && !modalProduct ? 'active' : ''}`}
              onClick={() => setIsCategoryMenuOpen(false)}
            >
              <Cpu size={16} />
              <span>Tất cả danh mục</span>
            </Link>
            {categories.map((cat) => {
              const IconComp = CATEGORY_ICONS[cat.id] || Cpu;
              return (
                <Link
                  key={cat.id}
                  to={categoryPath(cat.id)}
                  className={`cat-menu-item ${selectedCategory === cat.id && !modalProduct ? 'active' : ''}`}
                  onClick={() => setIsCategoryMenuOpen(false)}
                >
                  <IconComp size={16} />
                  <span>{cat.name}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* TAB 1: PRODUCTS CATALOG VIEW (EXACT HACOM LAYOUT) */}
        {activeTab === 'products' && (
          <div>
            {/* Promotional Banner Carousel (Tự động chuyển qua chuyển lại) */}
            <BannerCarousel onNavigateTab={goTab} />

            {/* Section Header Row (Matching Screenshot) */}
            <div className="section-header-row">
              <h1 className="section-title-large">
                {getSectionTitle()}
              </h1>

              {/* Brand Filter Pills + "Xem tất cả ➔" Red Button */}
              <div className="section-pills-bar">
                {HACOM_FEATURED_TAGS.map((tag) => (
                  <button
                    key={tag.id}
                    className={`brand-pill-btn ${activeTag === tag.id ? 'active' : ''}`}
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag.label}
                  </button>
                ))}

                <button
                  className="view-all-red-btn"
                  onClick={handleViewAll}
                  title="Xem tất cả sản phẩm"
                >
                  <span>Xem tất cả</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Sub Filter / Sort Bar */}
            <div className="sub-filter-bar">
              <div className="sub-filter-left">
                <span>Hiển thị <strong>{products.length}</strong> sản phẩm</span>
                {selectedCategory !== 'all' && (
                  <span style={{ background: '#fee2e2', color: '#d70018', padding: '2px 8px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 600 }}>
                    Danh mục: {categories.find(c => c.id === selectedCategory)?.name || selectedCategory}
                  </span>
                )}
                {selectedBrand !== 'all' && (
                  <span style={{ background: '#fee2e2', color: '#d70018', padding: '2px 8px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 600 }}>
                    Thương hiệu: {selectedBrand}
                  </span>
                )}
                {(selectedCategory !== 'all' || selectedBrand !== 'all' || searchQuery) && (
                  <button
                    onClick={handleViewAll}
                    style={{ color: '#d70018', fontSize: '0.8rem', textDecoration: 'underline', fontWeight: 600, marginLeft: 6 }}
                  >
                    Xóa bộ lọc
                  </button>
                )}
              </div>

              <div className="sub-filter-right">
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Sắp xếp theo:</span>
                <select
                  className="sub-sort-select"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="featured">Nổi bật nhất</option>
                  <option value="price-asc">Giá: Thấp đến Cao</option>
                  <option value="price-desc">Giá: Cao đến Thấp</option>
                </select>
              </div>
            </div>

            {/* Products Grid: 6 columns as in screenshot */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                Đang cập nhật danh sách sản phẩm CBStore...
              </div>
            ) : products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', margin: '20px 0' }}>
                <Cpu size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Không tìm thấy sản phẩm phù hợp</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
                  Thử đổi từ khóa tìm kiếm hoặc lọc lại theo thương hiệu khác.
                </p>
                <button className="primary-btn" onClick={handleViewAll}>
                  Xem tất cả sản phẩm
                </button>
              </div>
            ) : (
              <div className="products-grid-6col">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PC BUILDER VIEW */}
        {activeTab === 'builder' && <PCBuilder />}

        {/* TAB 3: ORDER LOOKUP VIEW */}
        {activeTab === 'lookup' && (
          <OrderLookup initialPhone={lookupPhonePreFill} />
        )}
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="logo-wordmark" style={{ marginBottom: 12 }}>
                <span className="logo-ha">CBStore</span>
              </div>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', maxWidth: '380px', lineHeight: 1.6 }}>
                Hệ thống chuỗi showroom bán lẻ máy tính, linh kiện PC Gaming, Laptop, Workstation hàng đầu Việt Nam. Cam kết 100% hàng chính hãng, giá cạnh tranh nhất.
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '16px', color: 'var(--text-main)', fontWeight: 700 }}>
                Chính Sách & Hỗ Trợ
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <li>✓ Chính sách bảo hành đổi mới 15 ngày</li>
                <li>✓ Giao hàng miễn phí toàn quốc</li>
                <li>✓ Hỗ trợ trả góp 0% lãi suất</li>
                <li>✓ Tư vấn & lắp ráp PC miễn phí theo yêu cầu</li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '16px', color: 'var(--text-main)', fontWeight: 700 }}>
                Thông Tin Liên Hệ
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <div>Hotline: <strong style={{ color: 'var(--accent-red)', fontSize: '0.95rem' }}>1900 8899</strong> (8:00 - 24:00)</div>
                <div>Email: cskh@cbstore.vn</div>
                <div>Hệ thống Showroom: Hà Nội - TP. Hồ Chí Minh - Đà Nẵng</div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} CBStore. Bản quyền thuộc về CBStore.
          </div>
        </div>
      </footer>

      {/* Modals & Overlays */}
      {modalProduct && (
        <ProductModal
          product={modalProduct}
          onClose={closeProductModal}
        />
      )}

      <CartDrawer />

      <CheckoutModal onOrderSuccess={handleOrderSuccess} />

      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </BrowserRouter>
  );
}
