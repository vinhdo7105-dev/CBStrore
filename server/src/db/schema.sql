-- ===================================================
-- SCHEMA DATABASE FOR MINIMALIST PC COMPONENT STORE
-- PostgreSQL DDL Script
-- ===================================================

-- 1. Bảng danh mục sản phẩm (Categories)
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50) NOT NULL,
  description TEXT,
  display_order INT DEFAULT 0
);

-- 2. Bảng sản phẩm / linh kiện máy tính (Products)
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(80) PRIMARY KEY,
  category_id VARCHAR(50) NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  price NUMERIC(14, 0) NOT NULL,
  original_price NUMERIC(14, 0),
  image_url TEXT NOT NULL,
  stock INT DEFAULT 50,
  warranty VARCHAR(50) DEFAULT '36 tháng',
  specs JSONB DEFAULT '{}'::jsonb,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bảng đơn hàng (Orders)
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(50) PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  customer_address TEXT NOT NULL,
  note TEXT,
  payment_method VARCHAR(50) DEFAULT 'cod',
  total_amount NUMERIC(14, 0) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  is_pc_build BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bảng chi tiết sản phẩm trong đơn hàng (Order Items)
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(50) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id VARCHAR(80),
  product_name VARCHAR(255) NOT NULL,
  product_image TEXT,
  category_id VARCHAR(50),
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(14, 0) NOT NULL,
  subtotal NUMERIC(14, 0) NOT NULL
);

-- Indexes for fast query
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- 5. Bảng quảng bá Banner trang chủ (Banners)
CREATE TABLE IF NOT EXISTS banners (
  id VARCHAR(80) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle TEXT,
  badge_text VARCHAR(100) DEFAULT 'HOT DEAL',
  image_url TEXT NOT NULL,
  link_url VARCHAR(255) DEFAULT '#builder',
  cta_text VARCHAR(100) DEFAULT 'Khám Phá Ngay',
  bg_gradient VARCHAR(150) DEFAULT 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
  display_order INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_banners_order ON banners(display_order ASC);

