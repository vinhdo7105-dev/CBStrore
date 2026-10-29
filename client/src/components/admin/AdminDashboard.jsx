import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  RefreshCw,
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  Printer,
  ChevronRight,
  Database,
  ExternalLink,
  Cpu,
  Layers,
  Server,
  MonitorPlay,
  HardDrive,
  Zap,
  Box,
  Fan,
  Laptop,
  Image as ImageIcon,
  Sparkles,
  LogOut
} from 'lucide-react';
import {
  fetchAdminStats,
  fetchAllOrders,
  fetchProducts,
  fetchCategories,
  updateOrderStatus,
  deleteOrder,
  createProduct,
  updateProduct,
  deleteProduct,
  formatVND,
  fetchAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerActive
} from '../../services/api';
import { useCart } from '../../context/CartContext';
import ProductFormModal from './ProductFormModal';
import OrderDetailModal from './OrderDetailModal';
import InvoicePrintModal from './InvoicePrintModal';
import BannerFormModal from './BannerFormModal';


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

const ORDER_STATUS_LABELS = {
  pending: { label: 'Chờ xác nhận', color: '#d97706', bg: '#fef3c7', border: '#fde68a' },
  confirmed: { label: 'Đã xác nhận', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  shipping: { label: 'Đang vận chuyển', color: '#9333ea', bg: '#faf5ff', border: '#e9d5ff' },
  delivered: { label: 'Giao thành công', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  cancelled: { label: 'Đã hủy', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' }
};

export default function AdminDashboard({ onBackToStore }) {
  const { showToast } = useCart();

  // Navigation tab: 'overview' | 'products' | 'orders'
  const [currentTab, setCurrentTab] = useState('overview');

  // Stats
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Products State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [prodSearch, setProdSearch] = useState('');
  const [prodCategoryFilter, setProdCategoryFilter] = useState('all');
  const [prodBrandFilter, setProdBrandFilter] = useState('all');
  const [prodStockFilter, setProdStockFilter] = useState('all');

  // Orders State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Modals
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [printingOrder, setPrintingOrder] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  // Banners State
  const [banners, setBanners] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(false);
  const [bannerSearch, setBannerSearch] = useState('');
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [bannerToDelete, setBannerToDelete] = useState(null);

  // Load all initial data
  const loadData = async () => {
    setLoadingStats(true);
    setLoadingProducts(true);
    setLoadingOrders(true);
    setLoadingBanners(true);

    try {
      const [statsData, prodsData, catsData, ordersData, bannersData] = await Promise.all([
        fetchAdminStats().catch(() => null),
        fetchProducts(),
        fetchCategories(),
        fetchAllOrders(),
        fetchAllBanners().catch(() => [])
      ]);

      if (statsData) setStats(statsData);
      setProducts(prodsData);
      setCategories(catsData);
      setOrders(ordersData);
      setBanners(bannersData || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      showToast('Lỗi khi tải dữ liệu trang quản trị', 'error');
    } finally {
      setLoadingStats(false);
      setLoadingProducts(false);
      setLoadingOrders(false);
      setLoadingBanners(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ----------------------------------------
  // PRODUCT MANAGEMENT HANDLERS
  // ----------------------------------------
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (payload, id) => {
    try {
      if (id) {
        const updated = await updateProduct(id, payload);
        setProducts(prev => prev.map(p => p.id === id ? updated : p));
        showToast(`Đã cập nhật sản phẩm "${updated.name}"`);
      } else {
        const created = await createProduct(payload);
        setProducts(prev => [created, ...prev]);
        showToast(`Đã thêm mặt hàng mới "${created.name}"`);
      }
      // Refresh stats
      fetchAdminStats().then(s => setStats(s)).catch(() => {});
    } catch (err) {
      showToast(err.message || 'Lỗi khi lưu sản phẩm', 'error');
      throw err;
    }
  };

  const handleConfirmDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete.id);
      setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
      showToast(`Đã xóa mặt hàng "${productToDelete.name}"`);
      setProductToDelete(null);
      fetchAdminStats().then(s => setStats(s)).catch(() => {});
    } catch (err) {
      showToast(err.message || 'Lỗi khi xóa sản phẩm', 'error');
    }
  };

  // Toggle featured state quickly
  const handleToggleFeatured = async (prod) => {
    try {
      const updated = await updateProduct(prod.id, { featured: !prod.featured });
      setProducts(prev => prev.map(p => p.id === prod.id ? updated : p));
      showToast(updated.featured ? 'Đã ghim nổi bật sản phẩm' : 'Đã bỏ ghim nổi bật');
    } catch (err) {
      showToast('Lỗi khi đổi trạng thái nổi bật', 'error');
    }
  };

  // ----------------------------------------
  // ORDER MANAGEMENT HANDLERS
  // ----------------------------------------
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const updated = await updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: updated.status } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: updated.status }));
      }
      showToast(`Đã chuyển đơn #${orderId} sang "${ORDER_STATUS_LABELS[newStatus]?.label || newStatus}"`);
      fetchAdminStats().then(s => setStats(s)).catch(() => {});
    } catch (err) {
      showToast(err.message || 'Lỗi cập nhật trạng thái đơn', 'error');
      throw err;
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      await deleteOrder(orderId);
      setOrders(prev => prev.filter(o => o.id !== orderId));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(null);
      }
      showToast(`Đã xóa đơn hàng #${orderId}`);
      fetchAdminStats().then(s => setStats(s)).catch(() => {});
    } catch (err) {
      showToast(err.message || 'Lỗi khi xóa đơn hàng', 'error');
      throw err;
    }
  };

  // ----------------------------------------
  // BANNER MANAGEMENT HANDLERS
  // ----------------------------------------
  const handleOpenAddBanner = () => {
    setEditingBanner(null);
    setBannerModalOpen(true);
  };

  const handleOpenEditBanner = (b) => {
    setEditingBanner(b);
    setBannerModalOpen(true);
  };

  const handleSaveBanner = async (payload, id) => {
    try {
      if (id) {
        const updated = await updateBanner(id, payload);
        setBanners(prev => prev.map(b => b.id === id ? updated : b));
        showToast(`Đã cập nhật banner "${updated.title}"`);
      } else {
        const created = await createBanner(payload);
        setBanners(prev => [created, ...prev]);
        showToast(`Đã tạo banner quảng bá mới "${created.title}"`);
      }
    } catch (err) {
      showToast(err.message || 'Lỗi khi lưu banner', 'error');
      throw err;
    }
  };

  const handleToggleBanner = async (b) => {
    try {
      const updated = await toggleBannerActive(b.id);
      setBanners(prev => prev.map(item => item.id === b.id ? updated : item));
      showToast(updated.active ? 'Đã kích hoạt hiển thị banner trên trang chủ' : 'Đã ẩn banner khỏi trang chủ');
    } catch (err) {
      showToast('Lỗi khi đổi trạng thái banner', 'error');
    }
  };

  const handleConfirmDeleteBanner = async () => {
    if (!bannerToDelete) return;
    try {
      await deleteBanner(bannerToDelete.id);
      setBanners(prev => prev.filter(b => b.id !== bannerToDelete.id));
      showToast(`Đã xóa banner "${bannerToDelete.title}"`);
      setBannerToDelete(null);
    } catch (err) {
      showToast(err.message || 'Lỗi khi xóa banner', 'error');
    }
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem('hacom_admin_auth');
    } catch (e) {}
    onBackToStore();
  };

  // ----------------------------------------
  // FILTERING LOGIC
  // ----------------------------------------
  const filteredProducts = products.filter(p => {
    if (prodCategoryFilter !== 'all' && p.category_id !== prodCategoryFilter) return false;
    if (prodBrandFilter !== 'all' && p.brand?.toLowerCase() !== prodBrandFilter.toLowerCase()) return false;
    if (prodStockFilter === 'in_stock' && (p.stock || 0) <= 5) return false;
    if (prodStockFilter === 'low_stock' && ((p.stock || 0) > 5 || (p.stock || 0) <= 0)) return false;
    if (prodStockFilter === 'out_of_stock' && (p.stock || 0) > 0) return false;
    if (prodSearch.trim()) {
      const s = prodSearch.toLowerCase().trim();
      const matchName = p.name?.toLowerCase().includes(s);
      const matchId = p.id?.toLowerCase().includes(s);
      const matchBrand = p.brand?.toLowerCase().includes(s);
      if (!matchName && !matchId && !matchBrand) return false;
    }
    return true;
  });

  const filteredOrders = orders.filter(o => {
    if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) return false;
    if (orderSearch.trim()) {
      const s = orderSearch.toLowerCase().trim();
      const matchId = o.id?.toLowerCase().includes(s);
      const matchName = o.customer_name?.toLowerCase().includes(s);
      const matchPhone = o.customer_phone?.includes(s);
      if (!matchId && !matchName && !matchPhone) return false;
    }
    return true;
  });

  const uniqueBrands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="admin-portal-wrapper">
      {/* 1. ADMIN HEADER BAR */}
      <header className="admin-header">
        <div className="container admin-header-container">
          <div className="admin-brand-area">
            <div className="logo-wordmark">
              <span className="logo-ha">CBStore</span>
            </div>
            <div className="admin-portal-badge">
              <Database size={13} />
              <span>HỆ THỐNG QUẢN TRỊ ADMIN</span>
            </div>
          </div>

          <div className="admin-header-actions">
            <button
              className="admin-action-btn"
              onClick={loadData}
              title="Tải lại toàn bộ dữ liệu"
            >
              <RefreshCw size={14} className={loadingStats ? 'spin' : ''} />
              <span>Làm mới</span>
            </button>

            <button
              className="admin-action-btn"
              onClick={handleLogout}
              title="Đăng xuất khỏi phiên quản trị"
              style={{ color: '#dc2626', borderColor: '#fca5a5', background: '#fef2f2' }}
            >
              <LogOut size={14} />
              <span>Đăng xuất</span>
            </button>

            <button
              className="admin-action-btn admin-return-btn"
              onClick={onBackToStore}
              title="Quay lại cửa hàng bán lẻ"
            >
              <ArrowLeft size={14} />
              <span>Về Trang Mua Sắm</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. SUB-NAVIGATION TABS */}
      <div className="admin-subnav">
        <div className="container admin-subnav-container">
          <div className="admin-tabs-list">
            <button
              className={`admin-tab-btn ${currentTab === 'overview' ? 'active' : ''}`}
              onClick={() => setCurrentTab('overview')}
            >
              <LayoutDashboard size={17} />
              <span>Tổng Quan & KPIs</span>
            </button>

            <button
              className={`admin-tab-btn ${currentTab === 'products' ? 'active' : ''}`}
              onClick={() => setCurrentTab('products')}
            >
              <Package size={17} />
              <span>Quản Lý Mặt Hàng</span>
              <span className="admin-tab-counter">{products.length}</span>
            </button>

            <button
              className={`admin-tab-btn ${currentTab === 'orders' ? 'active' : ''}`}
              onClick={() => setCurrentTab('orders')}
            >
              <ShoppingBag size={17} />
              <span>Quản Lý Đơn Hàng</span>
              <span className="admin-tab-counter" style={{ background: stats?.pending_orders > 0 ? '#ef4444' : '#e2e8f0', color: stats?.pending_orders > 0 ? '#fff' : '#1e293b' }}>
                {orders.length}
              </span>
            </button>

            <button
              className={`admin-tab-btn ${currentTab === 'banners' ? 'active' : ''}`}
              onClick={() => setCurrentTab('banners')}
            >
              <ImageIcon size={17} />
              <span>Quản Lý Banner</span>
              <span className="admin-tab-counter">{banners.length}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT CONTAINER */}
      <main className="container admin-main-content">
        {/* ========================================================
            TAB 1: TỔNG QUAN (OVERVIEW & KPIS)
            ======================================================== */}
        {currentTab === 'overview' && (
          <div className="admin-overview-view">
            {/* KPI Cards Grid */}
            <div className="admin-kpi-grid">
              <div className="kpi-card revenue-card">
                <div className="kpi-icon-wrap" style={{ background: '#fef2f2', color: '#d70018' }}>
                  <TrendingUp size={24} />
                </div>
                <div className="kpi-info">
                  <div className="kpi-label">Tổng Doanh Thu Đơn Hàng</div>
                  <div className="kpi-value" style={{ color: '#d70018' }}>
                    {formatVND(stats?.total_revenue || 0)}
                  </div>
                  <div className="kpi-subtext">Doanh số từ các đơn không bị hủy</div>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon-wrap" style={{ background: '#eff6ff', color: '#2563eb' }}>
                  <ShoppingBag size={24} />
                </div>
                <div className="kpi-info">
                  <div className="kpi-label">Tổng Số Đơn Hàng</div>
                  <div className="kpi-value">{stats?.total_orders || orders.length}</div>
                  <div className="kpi-subtext">
                    <strong>{stats?.pending_orders || 0}</strong> đơn chờ xác nhận
                  </div>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon-wrap" style={{ background: '#fef3c7', color: '#d97706' }}>
                  <Clock size={24} />
                </div>
                <div className="kpi-info">
                  <div className="kpi-label">Đơn Chờ Xử Lý</div>
                  <div className="kpi-value" style={{ color: '#d97706' }}>
                    {stats?.pending_orders || orders.filter(o => o.status === 'pending').length}
                  </div>
                  <div className="kpi-subtext">Cần xác nhận và xuất kho sớm</div>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon-wrap" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                  <Package size={24} />
                </div>
                <div className="kpi-info">
                  <div className="kpi-label">Mặt Hàng & Tồn Kho</div>
                  <div className="kpi-value">{products.length} SP</div>
                  <div className="kpi-subtext">
                    Tổng tồn: <strong>{products.reduce((sum, p) => sum + (p.stock || 0), 0)}</strong> linh kiện
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Status Bar */}
            <div className="admin-card" style={{ marginTop: '24px' }}>
              <div className="admin-card-header">
                <h3 className="admin-card-title">Phân Bổ Trạng Thái Đơn Hàng</h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Tổng: <strong>{orders.length}</strong> đơn
                </span>
              </div>
              <div className="admin-card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                  {Object.entries(ORDER_STATUS_LABELS).map(([key, item]) => {
                    const count = orders.filter(o => o.status === key).length;
                    const pct = orders.length > 0 ? Math.round((count / orders.length) * 100) : 0;
                    return (
                      <div
                        key={key}
                        onClick={() => {
                          setOrderStatusFilter(key);
                          setCurrentTab('orders');
                        }}
                        style={{
                          background: item.bg,
                          border: `1px solid ${item.border}`,
                          padding: '14px 16px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'transform 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: item.color }}>{item.label}</span>
                          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: item.color }}>{count}</span>
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                          Chiếm {pct}% tổng đơn
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Two Column Layout: Recent Pending Orders & Low Stock Alert */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', marginTop: '24px' }}>
              {/* Left: Pending / Recent Orders */}
              <div className="admin-card">
                <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={18} color="#d97706" />
                    <span>Đơn Hàng Cần Duyệt Gấp</span>
                  </h3>
                  <button
                    onClick={() => {
                      setOrderStatusFilter('pending');
                      setCurrentTab('orders');
                    }}
                    style={{ fontSize: '0.8rem', color: 'var(--accent-red)', fontWeight: 600 }}
                  >
                    Xem tất cả ➔
                  </button>
                </div>
                <div className="admin-card-body" style={{ padding: 0 }}>
                  {orders.filter(o => o.status === 'pending').length === 0 ? (
                    <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <CheckCircle2 size={32} color="#16a34a" style={{ margin: '0 auto 8px' }} />
                      <div>Tuyệt vời! Không có đơn hàng nào đang chờ xác nhận.</div>
                    </div>
                  ) : (
                    <div className="admin-mini-order-list">
                      {orders
                        .filter(o => o.status === 'pending')
                        .slice(0, 5)
                        .map(order => (
                          <div key={order.id} className="admin-mini-order-row">
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <strong style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>{order.id}</strong>
                                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{formatDate(order.created_at)}</span>
                              </div>
                              <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                {order.customer_name} • <strong>{order.customer_phone}</strong>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: 700, color: 'var(--accent-red)', fontSize: '0.92rem' }}>
                                {formatVND(order.total_amount)}
                              </div>
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', marginTop: '4px' }}>
                                <button
                                  className="admin-mini-btn"
                                  onClick={() => handleStatusChange(order.id, 'confirmed')}
                                  style={{ background: '#eff6ff', color: '#2563eb' }}
                                >
                                  Duyệt Ngay
                                </button>
                                <button
                                  className="admin-mini-btn"
                                  onClick={() => setSelectedOrder(order)}
                                >
                                  Xem
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Low Stock Alert */}
              <div className="admin-card">
                <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={18} color="#dc2626" />
                    <span>Cảnh Báo Hàng Sắp Hết (≤ 5)</span>
                  </h3>
                  <button
                    onClick={() => {
                      setProdStockFilter('low_stock');
                      setCurrentTab('products');
                    }}
                    style={{ fontSize: '0.8rem', color: 'var(--accent-red)', fontWeight: 600 }}
                  >
                    Xem kho ➔
                  </button>
                </div>
                <div className="admin-card-body" style={{ padding: 0 }}>
                  {products.filter(p => (p.stock || 0) <= 5).length === 0 ? (
                    <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <CheckCircle2 size={32} color="#16a34a" style={{ margin: '0 auto 8px' }} />
                      <div>Tất cả mặt hàng đều còn dồi dào trong kho!</div>
                    </div>
                  ) : (
                    <div className="admin-mini-order-list">
                      {products
                        .filter(p => (p.stock || 0) <= 5)
                        .slice(0, 5)
                        .map(prod => (
                          <div key={prod.id} className="admin-mini-order-row">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <img
                                src={prod.image_url}
                                alt={prod.name}
                                style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '4px' }}
                              />
                              <div>
                                <div style={{ fontSize: '0.84rem', fontWeight: 600, maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {prod.name}
                                </div>
                                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                  Mã: {prod.id}
                                </div>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                background: prod.stock === 0 ? '#fee2e2' : '#fef3c7',
                                color: prod.stock === 0 ? '#b91c1c' : '#b45309'
                              }}>
                                Còn {prod.stock || 0} SP
                              </span>
                              <div style={{ marginTop: '4px' }}>
                                <button
                                  className="admin-mini-btn"
                                  onClick={() => handleOpenEditProduct(prod)}
                                >
                                  Nhập thêm
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: QUẢN LÝ MẶT HÀNG / LINH KIỆN
            ======================================================== */}
        {currentTab === 'products' && (
          <div className="admin-products-view">
            {/* Action Bar */}
            <div className="admin-toolbar">
              <div className="admin-toolbar-left">
                {/* Search */}
                <div className="admin-search-wrapper">
                  <Search size={16} className="admin-search-icon" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên sản phẩm, mã SKU, hãng..."
                    value={prodSearch}
                    onChange={(e) => setProdSearch(e.target.value)}
                    className="admin-search-input"
                  />
                  {prodSearch && (
                    <button
                      onClick={() => setProdSearch('')}
                      style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <select
                  value={prodCategoryFilter}
                  onChange={(e) => setProdCategoryFilter(e.target.value)}
                  className="admin-filter-select"
                >
                  <option value="all">Tất cả danh mục ({products.length})</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({products.filter(p => p.category_id === c.id).length})
                    </option>
                  ))}
                </select>

                {/* Brand Filter */}
                <select
                  value={prodBrandFilter}
                  onChange={(e) => setProdBrandFilter(e.target.value)}
                  className="admin-filter-select"
                >
                  <option value="all">Tất cả thương hiệu</option>
                  {uniqueBrands.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>

                {/* Stock Filter */}
                <select
                  value={prodStockFilter}
                  onChange={(e) => setProdStockFilter(e.target.value)}
                  className="admin-filter-select"
                >
                  <option value="all">Tất cả trạng thái kho</option>
                  <option value="in_stock">Còn nhiều hàng (&gt; 5)</option>
                  <option value="low_stock">Sắp hết hàng (≤ 5)</option>
                  <option value="out_of_stock">Hết hàng (0)</option>
                </select>
              </div>

              <div className="admin-toolbar-right">
                <button
                  className="primary-btn"
                  onClick={handleOpenAddProduct}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 18px',
                    fontWeight: 700,
                    fontSize: '0.9rem'
                  }}
                >
                  <Plus size={18} strokeWidth={2.5} />
                  <span>Thêm Mặt Hàng Mới</span>
                </button>
              </div>
            </div>

            {/* Sub-status bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              <div>
                Đang hiển thị <strong>{filteredProducts.length}</strong> / {products.length} mặt hàng
              </div>
              {(prodSearch || prodCategoryFilter !== 'all' || prodBrandFilter !== 'all' || prodStockFilter !== 'all') && (
                <button
                  onClick={() => {
                    setProdSearch('');
                    setProdCategoryFilter('all');
                    setProdBrandFilter('all');
                    setProdStockFilter('all');
                  }}
                  style={{ color: 'var(--accent-red)', fontWeight: 600, textDecoration: 'underline' }}
                >
                  Xóa toàn bộ bộ lọc
                </button>
              )}
            </div>

            {/* Products Table */}
            <div className="admin-table-container admin-products-table-container">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th style={{ width: '64px', textAlign: 'center' }}>Ảnh</th>
                    <th>Tên Sản Phẩm / Linh Kiện</th>
                    <th style={{ width: '130px' }}>Danh Mục</th>
                    <th style={{ width: '100px' }}>Hãng SX</th>
                    <th style={{ width: '130px', textAlign: 'right' }}>Giá Bán</th>
                    <th style={{ width: '110px', textAlign: 'center' }}>Tồn Kho</th>
                    <th style={{ width: '80px', textAlign: 'center' }}>Nổi Bật</th>
                    <th style={{ width: '110px', textAlign: 'center' }}>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingProducts ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        Đang tải danh sách mặt hàng...
                      </td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
                        <Package size={36} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                        <div style={{ fontWeight: 600 }}>Không tìm thấy mặt hàng nào phù hợp bộ lọc</div>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((prod) => {
                      const IconComp = CATEGORY_ICONS[prod.category_id] || Package;
                      const isLowStock = (prod.stock || 0) <= 5 && (prod.stock || 0) > 0;
                      const isOutOfStock = (prod.stock || 0) === 0;

                      return (
                        <tr key={prod.id}>
                          {/* Image */}
                          <td style={{ textAlign: 'center' }}>
                            <img
                              src={prod.image_url || 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=100'}
                              alt={prod.name}
                              className="admin-product-thumb"
                            />
                          </td>

                          {/* Product Info */}
                          <td>
                            <div className="admin-product-name" title={prod.name}>
                              {prod.name}
                            </div>
                            <div className="admin-product-meta">
                              <span>Mã SKU: <strong>{prod.id}</strong></span>
                              <span>•</span>
                              <span>BH: {prod.warranty || '36 tháng'}</span>
                            </div>
                          </td>

                          {/* Category */}
                          <td>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                              <IconComp size={13} color="var(--accent-navy)" />
                              <span>{categories.find(c => c.id === prod.category_id)?.name || prod.category_id}</span>
                            </div>
                          </td>

                          {/* Brand */}
                          <td>
                            <span style={{ fontWeight: 600, fontSize: '0.86rem' }}>{prod.brand || '-'}</span>
                          </td>

                          {/* Price */}
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 800, color: 'var(--accent-red)', fontSize: '0.92rem' }}>
                              {formatVND(prod.price)}
                            </div>
                            {prod.original_price && prod.original_price > prod.price && (
                              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                                {formatVND(prod.original_price)}
                              </div>
                            )}
                          </td>

                          {/* Stock */}
                          <td style={{ textAlign: 'center' }}>
                            <span className={`stock-badge ${isOutOfStock ? 'out' : isLowStock ? 'low' : 'ok'}`}>
                              {isOutOfStock ? 'Hết hàng' : `${prod.stock || 0} chiếc`}
                            </span>
                          </td>

                          {/* Featured toggle */}
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleToggleFeatured(prod)}
                              style={{
                                fontSize: '1.1rem',
                                cursor: 'pointer',
                                filter: prod.featured ? 'none' : 'grayscale(1)',
                                opacity: prod.featured ? 1 : 0.35,
                                transform: 'scale(1.1)'
                              }}
                              title={prod.featured ? 'Đang nổi bật (Click để tắt)' : 'Chưa nổi bật (Click để bật)'}
                            >
                              ⭐
                            </button>
                          </td>

                          {/* Actions */}
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                              <button
                                className="admin-action-icon-btn edit"
                                onClick={() => handleOpenEditProduct(prod)}
                                title="Chỉnh sửa thông tin"
                              >
                                <Edit size={15} />
                              </button>
                              <button
                                className="admin-action-icon-btn delete"
                                onClick={() => setProductToDelete(prod)}
                                title="Xóa mặt hàng này"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: QUẢN LÝ ĐƠN HÀNG (ORDER MANAGEMENT)
            ======================================================== */}
        {currentTab === 'orders' && (
          <div className="admin-orders-view">
            {/* Toolbar */}
            <div className="admin-toolbar">
              <div className="admin-toolbar-left">
                {/* Search */}
                <div className="admin-search-wrapper">
                  <Search size={16} className="admin-search-icon" />
                  <input
                    type="text"
                    placeholder="Tìm theo mã đơn (ORD-...), tên người nhận, SĐT..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="admin-search-input"
                  />
                  {orderSearch && (
                    <button
                      onClick={() => setOrderSearch('')}
                      style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Status Filter Buttons */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button
                    className={`order-filter-pill ${orderStatusFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setOrderStatusFilter('all')}
                  >
                    Tất cả ({orders.length})
                  </button>
                  {Object.entries(ORDER_STATUS_LABELS).map(([k, item]) => {
                    const cnt = orders.filter(o => o.status === k).length;
                    return (
                      <button
                        key={k}
                        className={`order-filter-pill ${orderStatusFilter === k ? 'active' : ''}`}
                        onClick={() => setOrderStatusFilter(k)}
                        style={{
                          borderColor: orderStatusFilter === k ? item.color : 'transparent',
                          color: orderStatusFilter === k ? item.color : 'inherit',
                          background: orderStatusFilter === k ? item.bg : '#ffffff'
                        }}
                      >
                        <span>{item.label}</span>
                        <span style={{
                          background: orderStatusFilter === k ? item.color : '#e2e8f0',
                          color: orderStatusFilter === k ? '#fff' : '#475569',
                          padding: '1px 6px',
                          borderRadius: '10px',
                          fontSize: '0.72rem',
                          marginLeft: '4px'
                        }}>
                          {cnt}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sub-status bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              <div>
                Đang hiển thị <strong>{filteredOrders.length}</strong> / {orders.length} đơn hàng
              </div>
              {(orderSearch || orderStatusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setOrderSearch('');
                    setOrderStatusFilter('all');
                  }}
                  style={{ color: 'var(--accent-red)', fontWeight: 600, textDecoration: 'underline' }}
                >
                  Xóa bộ lọc đơn hàng
                </button>
              )}
            </div>

            {/* Orders Table */}
            <div className="admin-table-container">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th style={{ width: '130px' }}>Mã Đơn Hàng</th>
                    <th style={{ width: '140px' }}>Ngày Đặt</th>
                    <th>Khách Hàng & Liên Hệ</th>
                    <th style={{ width: '90px', textAlign: 'center' }}>Loại Đơn</th>
                    <th style={{ width: '130px', textAlign: 'right' }}>Tổng Tiền</th>
                    <th style={{ width: '150px', textAlign: 'center' }}>Trạng Thái</th>
                    <th style={{ width: '110px', textAlign: 'center' }}>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingOrders ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        Đang tải danh sách đơn hàng...
                      </td>
                    </tr>
                  ) : filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
                        <ShoppingBag size={36} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                        <div style={{ fontWeight: 600 }}>Không tìm thấy đơn hàng nào phù hợp bộ lọc</div>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const st = ORDER_STATUS_LABELS[order.status] || ORDER_STATUS_LABELS.pending;
                      const itemCount = order.items ? order.items.reduce((s, it) => s + (it.quantity || 1), 0) : 0;

                      return (
                        <tr key={order.id}>
                          {/* Order ID */}
                          <td>
                            <strong style={{ color: 'var(--accent-red)', fontSize: '0.88rem' }}>{order.id}</strong>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                              {order.payment_method === 'vietqr' ? '💳 VietQR' : '💵 COD'}
                            </div>
                          </td>

                          {/* Created at */}
                          <td>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                              {formatDate(order.created_at)}
                            </div>
                          </td>

                          {/* Customer */}
                          <td>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.88rem' }}>
                              {order.customer_name}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--accent-navy)', fontWeight: 600 }}>
                              📞 {order.customer_phone}
                            </div>
                            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              📍 {order.customer_address}
                            </div>
                          </td>

                          {/* Order Type */}
                          <td style={{ textAlign: 'center' }}>
                            {order.is_pc_build ? (
                              <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>
                                ⚡ Build PC
                              </span>
                            ) : (
                              <span style={{ background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>
                                📦 {itemCount} SP lẻ
                              </span>
                            )}
                          </td>

                          {/* Total amount */}
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 800, color: 'var(--accent-red)', fontSize: '0.94rem' }}>
                              {formatVND(order.total_amount)}
                            </div>
                          </td>

                          {/* Status changer select */}
                          <td style={{ textAlign: 'center' }}>
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              style={{
                                padding: '4px 8px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                borderRadius: '4px',
                                border: `1px solid ${st.border}`,
                                background: st.bg,
                                color: st.color,
                                cursor: 'pointer'
                              }}
                            >
                              <option value="pending">Chờ xác nhận</option>
                              <option value="confirmed">Đã xác nhận</option>
                              <option value="shipping">Đang vận chuyển</option>
                              <option value="delivered">Giao thành công</option>
                              <option value="cancelled">Đã hủy đơn</option>
                            </select>
                          </td>

                          {/* Actions */}
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                              <button
                                className="admin-action-icon-btn view"
                                onClick={() => setSelectedOrder(order)}
                                title="Xem chi tiết đơn hàng"
                              >
                                <Eye size={15} />
                              </button>
                              <button
                                className="admin-action-icon-btn print"
                                onClick={() => setPrintingOrder(order)}
                                title="In phiếu xuất kho / hóa đơn"
                              >
                                <Printer size={15} />
                              </button>
                              <button
                                className="admin-action-icon-btn delete"
                                onClick={() => {
                                  if (window.confirm(`Xác nhận xóa đơn hàng #${order.id}?`)) {
                                    handleDeleteOrder(order.id);
                                  }
                                }}
                                title="Xóa đơn hàng"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: QUẢN LÝ BANNER QUẢNG BÁ (BANNER MANAGEMENT)
            ======================================================== */}
        {currentTab === 'banners' && (
          <div className="admin-banners-view">
            {/* Toolbar */}
            <div className="admin-toolbar">
              <div className="admin-toolbar-left">
                <div className="admin-search-wrapper">
                  <Search size={16} className="admin-search-icon" />
                  <input
                    type="text"
                    placeholder="Tìm banner theo tiêu đề, nhãn..."
                    value={bannerSearch}
                    onChange={(e) => setBannerSearch(e.target.value)}
                    className="admin-search-input"
                  />
                  {bannerSearch && (
                    <button
                      onClick={() => setBannerSearch('')}
                      style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              <div className="admin-toolbar-right">
                <button
                  className="primary-btn"
                  onClick={handleOpenAddBanner}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 18px',
                    fontWeight: 700,
                    fontSize: '0.9rem'
                  }}
                >
                  <Plus size={18} strokeWidth={2.5} />
                  <span>Thêm Banner Mới</span>
                </button>
              </div>
            </div>

            {/* Sub-status bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              <div>
                Đang có <strong>{banners.filter(b => b.active).length}</strong> banner đang chạy chuyển đổi trên trang chủ / Tổng số {banners.length} banner
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                💡 Banner sẽ tự động chuyển qua chuyển lại mỗi 4.5 giây trên đầu trang chủ
              </div>
            </div>

            {/* Banners Table */}
            <div className="admin-table-container">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th style={{ width: '100px', textAlign: 'center' }}>Xem Trước</th>
                    <th>Tiêu Đề & Nội Dung Khuyến Mãi</th>
                    <th style={{ width: '130px', textAlign: 'center' }}>Nhãn (Badge)</th>
                    <th style={{ width: '130px', textAlign: 'center' }}>Đích Đến</th>
                    <th style={{ width: '80px', textAlign: 'center' }}>Thứ Tự</th>
                    <th style={{ width: '110px', textAlign: 'center' }}>Trạng Thái</th>
                    <th style={{ width: '110px', textAlign: 'center' }}>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingBanners ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        Đang tải danh sách banner...
                      </td>
                    </tr>
                  ) : banners.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
                        <ImageIcon size={36} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                        <div style={{ fontWeight: 600 }}>Chưa có banner quảng bá nào</div>
                        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Bấm "+ Thêm Banner Mới" để tạo banner chạy trên trang chủ
                        </p>
                      </td>
                    </tr>
                  ) : (
                    banners
                      .filter(b => !bannerSearch || b.title?.toLowerCase().includes(bannerSearch.toLowerCase()) || b.badge_text?.toLowerCase().includes(bannerSearch.toLowerCase()))
                      .map((b) => (
                        <tr key={b.id}>
                          {/* Preview thumbnail */}
                          <td style={{ textAlign: 'center' }}>
                            <div style={{
                              width: '90px',
                              height: '46px',
                              borderRadius: '4px',
                              background: b.bg_gradient || '#1e1b4b',
                              overflow: 'hidden',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'relative',
                              border: '1px solid var(--border-subtle)'
                            }}>
                              <img
                                src={b.image_url}
                                alt={b.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </div>
                          </td>

                          {/* Title & Subtitle */}
                          <td>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                              {b.title}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px', maxWidth: '360px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {b.subtitle || 'Không có mô tả phụ'}
                            </div>
                          </td>

                          {/* Badge text */}
                          <td style={{ textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-block',
                              background: '#fee2e2',
                              color: '#d70018',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.74rem',
                              fontWeight: 700
                            }}>
                              {b.badge_text || '-'}
                            </span>
                          </td>

                          {/* Link destination */}
                          <td style={{ textAlign: 'center' }}>
                            <span style={{
                              background: '#f1f5f9',
                              color: '#334155',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.76rem',
                              fontWeight: 600
                            }}>
                              {b.link_url === '#builder' ? '⚡ PC Builder' : b.link_url === '#products' ? '📦 Danh Mục SP' : b.link_url === '#lookup' ? '🔍 Tra Cứu Đơn' : b.link_url}
                            </span>
                          </td>

                          {/* Display order */}
                          <td style={{ textAlign: 'center', fontWeight: 700 }}>
                            #{b.display_order || 0}
                          </td>

                          {/* Active Toggle Switch */}
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleToggleBanner(b)}
                              style={{
                                padding: '4px 10px',
                                borderRadius: '20px',
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                border: 'none',
                                cursor: 'pointer',
                                background: b.active ? '#dcfce7' : '#f1f5f9',
                                color: b.active ? '#15803d' : '#64748b',
                                transition: 'all 0.15s ease'
                              }}
                              title={b.active ? 'Đang hiển thị (Click để ẩn)' : 'Đã ẩn (Click để hiện)'}
                            >
                              {b.active ? '● Đang hiện' : '○ Đã ẩn'}
                            </button>
                          </td>

                          {/* Actions */}
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                              <button
                                className="admin-action-icon-btn edit"
                                onClick={() => handleOpenEditBanner(b)}
                                title="Chỉnh sửa banner"
                              >
                                <Edit size={15} />
                              </button>
                              <button
                                className="admin-action-icon-btn delete"
                                onClick={() => setBannerToDelete(b)}
                                title="Xóa banner"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================
          MODALS
          ======================================================== */}
      {/* 1. Product Form Modal (Add / Edit) */}
      {productModalOpen && (
        <ProductFormModal
          product={editingProduct}
          categories={categories}
          onSave={handleSaveProduct}
          onClose={() => {
            setProductModalOpen(false);
            setEditingProduct(null);
          }}
        />
      )}

      {/* 2. Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
          onDeleteOrder={handleDeleteOrder}
          onOpenPrint={(ord) => {
            setSelectedOrder(null);
            setPrintingOrder(ord);
          }}
        />
      )}

      {/* 3. Invoice Print Modal */}
      {printingOrder && (
        <InvoicePrintModal
          order={printingOrder}
          onClose={() => setPrintingOrder(null)}
        />
      )}

      {/* 4. Banner Form Modal (Add / Edit) */}
      {bannerModalOpen && (
        <BannerFormModal
          banner={editingBanner}
          onSave={handleSaveBanner}
          onClose={() => {
            setBannerModalOpen(false);
            setEditingBanner(null);
          }}
        />
      )}

      {/* 5. Confirm Delete Product Dialog */}
      {productToDelete && (
        <div className="modal-backdrop" onClick={() => setProductToDelete(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b91c1c' }}>
                <Trash2 size={20} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Xác Nhận Xóa Mặt Hàng?</h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
              Bạn có chắc chắn muốn xóa mặt hàng <strong>"{productToDelete.name}"</strong> (Mã: {productToDelete.id}) khỏi cơ sở dữ liệu kho? Thao tác này không thể hoàn tác.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn-outline"
                onClick={() => setProductToDelete(null)}
                style={{ padding: '8px 16px', fontSize: '0.88rem' }}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteProduct}
                style={{
                  background: '#dc2626',
                  color: '#ffffff',
                  padding: '8px 20px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.88rem'
                }}
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Confirm Delete Banner Dialog */}
      {bannerToDelete && (
        <div className="modal-backdrop" onClick={() => setBannerToDelete(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b91c1c' }}>
                <Trash2 size={20} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Xác Nhận Xóa Banner?</h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
              Bạn có chắc chắn muốn xóa banner <strong>"{bannerToDelete.title}"</strong>? Banner này sẽ không còn hiển thị trên trang chủ nữa.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn-outline"
                onClick={() => setBannerToDelete(null)}
                style={{ padding: '8px 16px', fontSize: '0.88rem' }}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteBanner}
                style={{
                  background: '#dc2626',
                  color: '#ffffff',
                  padding: '8px 20px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.88rem'
                }}
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
