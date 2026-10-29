// API service layer communicating with Node.js / PostgreSQL backend

const API_BASE = '/api';

export async function fetchCategories() {
  const res = await fetch(`${API_BASE}/categories`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Lỗi khi tải danh mục');
  return data.data;
}

export async function fetchProducts({ categoryId, brand, search, sort } = {}) {
  const params = new URLSearchParams();
  if (categoryId && categoryId !== 'all') params.append('categoryId', categoryId);
  if (brand && brand !== 'all') params.append('brand', brand);
  if (search) params.append('search', search);
  if (sort) params.append('sort', sort);

  const res = await fetch(`${API_BASE}/products?${params.toString()}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Lỗi khi tải sản phẩm');
  return data.data;
}

export async function fetchProductById(id) {
  const res = await fetch(`${API_BASE}/products/${id}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Lỗi khi tải chi tiết sản phẩm');
  return data.data;
}

export async function fetchProductBySlug(slug) {
  const res = await fetch(`${API_BASE}/products/slug/${encodeURIComponent(slug)}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Lỗi khi tải chi tiết sản phẩm');
  return data.data;
}

export async function submitOrder(orderPayload) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Lỗi khi gửi đơn hàng');
  return data;
}

export async function lookupOrdersByPhone(phone) {
  const res = await fetch(`${API_BASE}/orders/lookup?phone=${encodeURIComponent(phone)}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Lỗi khi tra cứu đơn hàng');
  return data.data;
}

export async function checkCompatibility(parts) {
  const res = await fetch(`${API_BASE}/builder/check-compatibility`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ parts })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Lỗi kiểm tra tính tương thích');
  return data;
}

export async function fetchPresets() {
  const res = await fetch(`${API_BASE}/builder/presets`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Lỗi khi tải cấu hình mẫu');
  return data.data;
}

export function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount || 0);
}

// ----------------------------------------
// ADMIN APIS: PRODUCTS & ORDERS MANAGEMENT
// ----------------------------------------

export async function fetchAdminStats() {
  const res = await fetch(`${API_BASE}/orders/stats`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Lỗi khi tải số liệu thống kê');
  return data.data;
}

export async function fetchAllOrders({ status, search } = {}) {
  const params = new URLSearchParams();
  if (status && status !== 'all') params.append('status', status);
  if (search && search.trim()) params.append('search', search.trim());

  const res = await fetch(`${API_BASE}/orders?${params.toString()}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Lỗi khi tải danh sách đơn hàng');
  return data.data;
}

export async function updateOrderStatus(orderId, status) {
  const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Lỗi khi cập nhật trạng thái đơn hàng');
  return data.data;
}

export async function deleteOrder(orderId) {
  const res = await fetch(`${API_BASE}/orders/${orderId}`, {
    method: 'DELETE'
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Lỗi khi xóa đơn hàng');
  return data;
}

export async function createProduct(productData) {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Lỗi khi tạo mới sản phẩm');
  return data.data;
}

export async function updateProduct(productId, productData) {
  const res = await fetch(`${API_BASE}/products/${productId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Lỗi khi cập nhật sản phẩm');
  return data.data;
}

export async function deleteProduct(productId) {
  const res = await fetch(`${API_BASE}/products/${productId}`, {
    method: 'DELETE'
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Lỗi khi xóa sản phẩm');
  return data;
}

// ----------------------------------------
// BANNER APIS (PROMOTIONAL HOMEPAGE SLIDER)
// ----------------------------------------

export async function fetchActiveBanners() {
  const res = await fetch(`${API_BASE}/banners`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Lỗi khi tải danh sách banner');
  return data.data;
}

export async function fetchAllBanners() {
  const res = await fetch(`${API_BASE}/banners/all`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Lỗi khi tải danh sách banner quản trị');
  return data.data;
}

export async function createBanner(bannerData) {
  const res = await fetch(`${API_BASE}/banners`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bannerData)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Lỗi khi tạo banner mới');
  return data.data;
}

export async function updateBanner(bannerId, bannerData) {
  const res = await fetch(`${API_BASE}/banners/${bannerId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bannerData)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Lỗi khi cập nhật banner');
  return data.data;
}

export async function toggleBannerActive(bannerId) {
  const res = await fetch(`${API_BASE}/banners/${bannerId}/toggle`, {
    method: 'PATCH'
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Lỗi khi đổi trạng thái banner');
  return data.data;
}

export async function deleteBanner(bannerId) {
  const res = await fetch(`${API_BASE}/banners/${bannerId}`, {
    method: 'DELETE'
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Lỗi khi xóa banner');
  return data;
}


