const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { categories: seedCategories, products: seedProducts, seedOrders, seedBanners } = require('./seedData');
const { slugify } = require('../utils/slug');

// Fallback JSON persistent path
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const FALLBACK_DB_FILE = path.join(DATA_DIR, 'db.json');

let pool = null;
let isPostgresConnected = false;
let fallbackMemoryStore = {
  categories: [],
  products: [],
  orders: [],
  banners: []
};

// Helper to save fallback JSON
function saveFallback() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(FALLBACK_DB_FILE, JSON.stringify(fallbackMemoryStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save fallback data:', err);
  }
}

// Helper to load fallback JSON
function loadFallback() {
  try {
    if (fs.existsSync(FALLBACK_DB_FILE)) {
      const data = fs.readFileSync(FALLBACK_DB_FILE, 'utf-8');
      fallbackMemoryStore = JSON.parse(data);
      if (!fallbackMemoryStore.banners || fallbackMemoryStore.banners.length === 0) {
        fallbackMemoryStore.banners = seedBanners;
        saveFallback();
      }
    } else {
      fallbackMemoryStore = {
        categories: seedCategories,
        products: seedProducts,
        orders: seedOrders,
        banners: seedBanners
      };
      saveFallback();
    }
  } catch (err) {
    fallbackMemoryStore = {
      categories: seedCategories,
      products: seedProducts,
      orders: seedOrders,
      banners: seedBanners
    };
  }
}

async function initDatabase() {
  const connectionString = process.env.DATABASE_URL || 
    `postgresql://${process.env.PG_USER || 'postgres'}:${process.env.PG_PASSWORD || 'postgres'}@${process.env.PG_HOST || 'localhost'}:${process.env.PG_PORT || 5432}/${process.env.PG_DATABASE || 'pc_store'}`;

  pool = new Pool({
    connectionString,
    connectionTimeoutMillis: 3000
  });

  try {
    const client = await pool.connect();
    console.log('✅ [PostgreSQL] Connected successfully to PostgreSQL database!');
    isPostgresConnected = true;

    // Run schema
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await client.query(schemaSql);
    console.log('✅ [PostgreSQL] Schema applied successfully.');

    // Check if products exist, otherwise seed
    const res = await client.query('SELECT COUNT(*) FROM products');
    if (parseInt(res.rows[0].count, 10) === 0) {
      console.log('🌱 [PostgreSQL] Seeding initial PC components...');
      
      // Seed categories
      for (const cat of seedCategories) {
        await client.query(
          `INSERT INTO categories (id, name, icon, description, display_order)
           VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING`,
          [cat.id, cat.name, cat.icon, cat.description, cat.display_order]
        );
      }

      // Seed products
      for (const prod of seedProducts) {
        await client.query(
          `INSERT INTO products (id, category_id, name, brand, price, original_price, image_url, stock, warranty, specs, featured)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT (id) DO NOTHING`,
          [
            prod.id,
            prod.category_id,
            prod.name,
            prod.brand,
            prod.price,
            prod.original_price,
            prod.image_url,
            prod.stock,
            prod.warranty,
            JSON.stringify(prod.specs),
            prod.featured
          ]
        );
      }

      // Seed initial sample order
      for (const order of seedOrders) {
        await client.query(
          `INSERT INTO orders (id, customer_name, customer_phone, customer_address, note, payment_method, total_amount, status, is_pc_build, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (id) DO NOTHING`,
          [
            order.id,
            order.customer_name,
            order.customer_phone,
            order.customer_address,
            order.note,
            order.payment_method,
            order.total_amount,
            order.status,
            order.is_pc_build,
            order.created_at
          ]
        );

        for (const item of order.items) {
          await client.query(
            `INSERT INTO order_items (order_id, product_id, product_name, product_image, category_id, quantity, unit_price, subtotal)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              order.id,
              item.product_id,
              item.product_name,
              item.product_image,
              item.category_id,
              item.quantity,
              item.unit_price,
              item.subtotal
            ]
          );
        }
      }
      console.log('✅ [PostgreSQL] Initial data seeded successfully.');
    }

    // Seed banners if not present
    try {
      const bRes = await client.query('SELECT COUNT(*) FROM banners');
      if (parseInt(bRes.rows[0].count, 10) === 0) {
        console.log('🌱 [PostgreSQL] Seeding initial promotional banners...');
        for (const b of seedBanners) {
          await client.query(
            `INSERT INTO banners (id, title, subtitle, badge_text, image_url, link_url, cta_text, bg_gradient, display_order, active)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (id) DO NOTHING`,
            [b.id, b.title, b.subtitle, b.badge_text, b.image_url, b.link_url, b.cta_text, b.bg_gradient, b.display_order, b.active]
          );
        }
        console.log('✅ [PostgreSQL] Banners seeded successfully.');
      }
    } catch (bErr) {
      console.warn('⚠️ [PostgreSQL] Banner check/seed notice:', bErr.message);
    }

    client.release();
  } catch (err) {
    console.warn(`⚠️ [PostgreSQL] Could not connect to PostgreSQL (${err.message}).`);
    console.warn('💡 [Fallback Mode] Switching to persistent local storage so the store works right now.');
    console.warn('👉 To connect to PostgreSQL later, start your PostgreSQL service and configure .env DATABASE_URL.');
    isPostgresConnected = false;
    loadFallback();
  }
}

// ----------------------------------------------------
// DATABASE ACCESS METHODS (PostgreSQL with Fallback)
// ----------------------------------------------------

async function getCategories() {
  if (isPostgresConnected) {
    const { rows } = await pool.query('SELECT * FROM categories ORDER BY display_order ASC');
    return rows;
  }
  return [...fallbackMemoryStore.categories].sort((a, b) => a.display_order - b.display_order);
}

async function getProducts({ categoryId, brand, search, sort } = {}) {
  if (isPostgresConnected) {
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (categoryId && categoryId !== 'all') {
      params.push(categoryId);
      query += ` AND category_id = $${params.length}`;
    }

    if (brand && brand !== 'all') {
      params.push(brand);
      query += ` AND brand = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (name ILIKE $${params.length} OR brand ILIKE $${params.length})`;
    }

    if (sort === 'price-asc') {
      query += ' ORDER BY price ASC';
    } else if (sort === 'price-desc') {
      query += ' ORDER BY price DESC';
    } else if (sort === 'featured') {
      query += ' ORDER BY featured DESC, price DESC';
    } else {
      query += ' ORDER BY created_at DESC';
    }

    const { rows } = await pool.query(query, params);
    return rows.map(r => ({
      ...r,
      price: Number(r.price),
      original_price: r.original_price ? Number(r.original_price) : null,
      specs: typeof r.specs === 'string' ? JSON.parse(r.specs) : r.specs
    }));
  }

  // Fallback mode
  let items = [...fallbackMemoryStore.products];
  if (categoryId && categoryId !== 'all') {
    items = items.filter(p => p.category_id === categoryId);
  }
  if (brand && brand !== 'all') {
    items = items.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
  }
  if (search) {
    const s = search.toLowerCase();
    items = items.filter(p => p.name.toLowerCase().includes(s) || p.brand.toLowerCase().includes(s));
  }
  if (sort === 'price-asc') {
    items.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc') {
    items.sort((a, b) => b.price - a.price);
  } else if (sort === 'featured') {
    items.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }
  return items;
}

async function getProductById(id) {
  if (isPostgresConnected) {
    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      ...r,
      price: Number(r.price),
      original_price: r.original_price ? Number(r.original_price) : null,
      specs: typeof r.specs === 'string' ? JSON.parse(r.specs) : r.specs
    };
  }
  return fallbackMemoryStore.products.find(p => p.id === id) || null;
}

async function getProductBySlug(slug) {
  if (!slug) return null;
  const decoded = decodeURIComponent(String(slug)).trim().toLowerCase();
  const products = await getProducts({});
  return products.find((p) => slugify(p.name) === decoded || String(p.id).toLowerCase() === decoded) || null;
}

async function createOrder(orderData) {
  const { customer_name, customer_phone, customer_address, note, payment_method, total_amount, items, is_pc_build } = orderData;
  const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const requestedQuantities = new Map();
  for (const item of items) {
    const requested = requestedQuantities.get(item.product_id) || { quantity: 0, product_name: item.product_name };
    requested.quantity += item.quantity;
    requestedQuantities.set(item.product_id, requested);
  }
  const sortedQuantities = [...requestedQuantities.entries()].sort(([a], [b]) => a.localeCompare(b));

  if (isPostgresConnected) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const [productId, requested] of sortedQuantities) {
        const { rows } = await client.query(
          `UPDATE products
           SET stock = COALESCE(stock, 0) - $1
           WHERE id = $2 AND COALESCE(stock, 0) >= $1
           RETURNING id`,
          [requested.quantity, productId]
        );
        if (rows.length === 0) {
          const error = new Error(`Mặt hàng "${requested.product_name}" không còn đủ tồn kho.`);
          error.statusCode = 409;
          throw error;
        }
      }

      const orderInsert = await client.query(
        `INSERT INTO orders (id, customer_name, customer_phone, customer_address, note, payment_method, total_amount, status, is_pc_build)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [orderId, customer_name, customer_phone, customer_address, note || '', payment_method || 'cod', total_amount, 'pending', !!is_pc_build]
      );

      for (const item of items) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, product_name, product_image, category_id, quantity, unit_price, subtotal)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            orderId,
            item.product_id,
            item.product_name,
            item.product_image || '',
            item.category_id || '',
            item.quantity,
            item.unit_price,
            item.quantity * item.unit_price
          ]
        );
      }
      await client.query('COMMIT');
      return { ...orderInsert.rows[0], items };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // Fallback mode
  for (const [productId, requested] of sortedQuantities) {
    const product = fallbackMemoryStore.products.find(p => p.id === productId);
    if (!product || Number(product.stock) < requested.quantity) {
      const error = new Error(`Mặt hàng "${requested.product_name || productId}" không còn đủ tồn kho.`);
      error.statusCode = 409;
      throw error;
    }
  }

  for (const [productId, requested] of sortedQuantities) {
    const product = fallbackMemoryStore.products.find(p => p.id === productId);
    product.stock = Number(product.stock) - requested.quantity;
  }

  const newOrder = {
    id: orderId,
    customer_name,
    customer_phone,
    customer_address,
    note: note || '',
    payment_method: payment_method || 'cod',
    total_amount: Number(total_amount),
    status: 'pending',
    is_pc_build: !!is_pc_build,
    created_at: new Date().toISOString(),
    items: items.map(item => ({
      product_id: item.product_id,
      product_name: item.product_name,
      product_image: item.product_image || '',
      category_id: item.category_id || '',
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
      subtotal: Number(item.quantity) * Number(item.unit_price)
    }))
  };

  fallbackMemoryStore.orders.unshift(newOrder);
  saveFallback();
  return newOrder;
}

async function getOrdersByPhone(phone) {
  const cleanPhone = phone.trim().replace(/\s+/g, '');

  if (isPostgresConnected) {
    const { rows: orders } = await pool.query(
      `SELECT * FROM orders WHERE REPLACE(customer_phone, ' ', '') = $1 ORDER BY created_at DESC`,
      [cleanPhone]
    );

    const fullOrders = [];
    for (const order of orders) {
      const { rows: items } = await pool.query(
        `SELECT * FROM order_items WHERE order_id = $1`,
        [order.id]
      );
      fullOrders.push({
        ...order,
        total_amount: Number(order.total_amount),
        items: items.map(it => ({
          ...it,
          unit_price: Number(it.unit_price),
          subtotal: Number(it.subtotal)
        }))
      });
    }
    return fullOrders;
  }

  // Fallback mode
  return fallbackMemoryStore.orders.filter(
    o => o.customer_phone.replace(/\s+/g, '') === cleanPhone
  );
}

async function createProduct(data) {
  const id = data.id && data.id.trim() ? data.id.trim() : `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const category_id = data.category_id || 'cpu';
  const name = data.name;
  const brand = data.brand || 'Khác';
  const price = Number(data.price) || 0;
  const original_price = data.original_price ? Number(data.original_price) : null;
  const image_url = data.image_url || 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&auto=format&fit=crop&q=80';
  const stock = data.stock !== undefined ? Number(data.stock) : 50;
  const warranty = data.warranty || '36 tháng';
  const specs = data.specs || {};
  const featured = !!data.featured;

  if (isPostgresConnected) {
    const query = `
      INSERT INTO products (id, category_id, name, brand, price, original_price, image_url, stock, warranty, specs, featured)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    const { rows } = await pool.query(query, [
      id, category_id, name, brand, price, original_price, image_url, stock, warranty, JSON.stringify(specs), featured
    ]);
    const r = rows[0];
    return {
      ...r,
      price: Number(r.price),
      original_price: r.original_price ? Number(r.original_price) : null,
      specs: typeof r.specs === 'string' ? JSON.parse(r.specs) : r.specs
    };
  }

  const newProd = { id, category_id, name, brand, price, original_price, image_url, stock, warranty, specs, featured };
  fallbackMemoryStore.products.unshift(newProd);
  saveFallback();
  return newProd;
}

async function updateProduct(id, data) {
  if (isPostgresConnected) {
    const existing = await getProductById(id);
    if (!existing) return null;

    const category_id = data.category_id !== undefined ? data.category_id : existing.category_id;
    const name = data.name !== undefined ? data.name : existing.name;
    const brand = data.brand !== undefined ? data.brand : existing.brand;
    const price = data.price !== undefined ? Number(data.price) : existing.price;
    const original_price = data.original_price !== undefined ? (data.original_price ? Number(data.original_price) : null) : existing.original_price;
    const image_url = data.image_url !== undefined ? data.image_url : existing.image_url;
    const stock = data.stock !== undefined ? Number(data.stock) : existing.stock;
    const warranty = data.warranty !== undefined ? data.warranty : existing.warranty;
    const specs = data.specs !== undefined ? data.specs : existing.specs;
    const featured = data.featured !== undefined ? !!data.featured : existing.featured;

    const query = `
      UPDATE products
      SET category_id = $1, name = $2, brand = $3, price = $4, original_price = $5, image_url = $6, stock = $7, warranty = $8, specs = $9, featured = $10
      WHERE id = $11
      RETURNING *
    `;
    const { rows } = await pool.query(query, [
      category_id, name, brand, price, original_price, image_url, stock, warranty, JSON.stringify(specs), featured, id
    ]);
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      ...r,
      price: Number(r.price),
      original_price: r.original_price ? Number(r.original_price) : null,
      specs: typeof r.specs === 'string' ? JSON.parse(r.specs) : r.specs
    };
  }

  const idx = fallbackMemoryStore.products.findIndex(p => p.id === id);
  if (idx === -1) return null;
  fallbackMemoryStore.products[idx] = {
    ...fallbackMemoryStore.products[idx],
    ...data,
    price: data.price !== undefined ? Number(data.price) : fallbackMemoryStore.products[idx].price,
    stock: data.stock !== undefined ? Number(data.stock) : fallbackMemoryStore.products[idx].stock
  };
  saveFallback();
  return fallbackMemoryStore.products[idx];
}

async function deleteProduct(id) {
  if (isPostgresConnected) {
    const { rows } = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    return rows.length > 0;
  }

  const idx = fallbackMemoryStore.products.findIndex(p => p.id === id);
  if (idx === -1) return false;
  fallbackMemoryStore.products.splice(idx, 1);
  saveFallback();
  return true;
}

async function getAllOrders({ status, search } = {}) {
  if (isPostgresConnected) {
    let query = 'SELECT * FROM orders WHERE 1=1';
    const params = [];

    if (status && status !== 'all') {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      query += ` AND (id ILIKE $${params.length} OR customer_name ILIKE $${params.length} OR customer_phone ILIKE $${params.length})`;
    }

    query += ' ORDER BY created_at DESC';

    const { rows: orders } = await pool.query(query, params);

    const fullOrders = [];
    for (const order of orders) {
      const { rows: items } = await pool.query(
        `SELECT * FROM order_items WHERE order_id = $1`,
        [order.id]
      );
      fullOrders.push({
        ...order,
        total_amount: Number(order.total_amount),
        items: items.map(it => ({
          ...it,
          unit_price: Number(it.unit_price),
          subtotal: Number(it.subtotal)
        }))
      });
    }
    return fullOrders;
  }

  let res = [...fallbackMemoryStore.orders];
  if (status && status !== 'all') {
    res = res.filter(o => o.status === status);
  }
  if (search && search.trim()) {
    const s = search.trim().toLowerCase();
    res = res.filter(o =>
      o.id.toLowerCase().includes(s) ||
      o.customer_name.toLowerCase().includes(s) ||
      o.customer_phone.includes(s)
    );
  }
  return res;
}

async function updateOrderStatus(orderId, status) {
  const validStatuses = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    throw new Error('Trạng thái đơn hàng không hợp lệ.');
  }

  if (isPostgresConnected) {
    const { rows } = await pool.query(
      `UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [status, orderId]
    );
    if (rows.length === 0) return null;
    return rows[0];
  }

  const order = fallbackMemoryStore.orders.find(o => o.id === orderId);
  if (!order) return null;
  order.status = status;
  order.updated_at = new Date().toISOString();
  saveFallback();
  return order;
}

async function deleteOrder(orderId) {
  if (isPostgresConnected) {
    const { rows } = await pool.query('DELETE FROM orders WHERE id = $1 RETURNING *', [orderId]);
    return rows.length > 0;
  }

  const idx = fallbackMemoryStore.orders.findIndex(o => o.id === orderId);
  if (idx === -1) return false;
  fallbackMemoryStore.orders.splice(idx, 1);
  saveFallback();
  return true;
}

async function getAdminStats() {
  if (isPostgresConnected) {
    const totalProdRes = await pool.query('SELECT COUNT(*) as count, COALESCE(SUM(stock), 0) as total_stock FROM products');
    const ordersRes = await pool.query(`
      SELECT
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_count,
        COUNT(CASE WHEN status = 'shipping' THEN 1 END) as shipping_count,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_count,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_count
      FROM orders
    `);

    const p = totalProdRes.rows[0];
    const o = ordersRes.rows[0];

    return {
      total_products: parseInt(p.count, 10),
      total_stock: parseInt(p.total_stock, 10),
      total_orders: parseInt(o.total_orders, 10),
      total_revenue: Number(o.total_revenue),
      pending_orders: parseInt(o.pending_count, 10),
      confirmed_orders: parseInt(o.confirmed_count, 10),
      shipping_orders: parseInt(o.shipping_count, 10),
      delivered_orders: parseInt(o.delivered_count, 10),
      cancelled_orders: parseInt(o.cancelled_count, 10)
    };
  }

  const total_products = fallbackMemoryStore.products.length;
  const total_stock = fallbackMemoryStore.products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const total_orders = fallbackMemoryStore.orders.length;
  const total_revenue = fallbackMemoryStore.orders
    .filter(o => o.status !== 'cancelled')
    .reduce((acc, o) => acc + (o.total_amount || 0), 0);
  const pending_orders = fallbackMemoryStore.orders.filter(o => o.status === 'pending').length;
  const confirmed_orders = fallbackMemoryStore.orders.filter(o => o.status === 'confirmed').length;
  const shipping_orders = fallbackMemoryStore.orders.filter(o => o.status === 'shipping').length;
  const delivered_orders = fallbackMemoryStore.orders.filter(o => o.status === 'delivered').length;
  const cancelled_orders = fallbackMemoryStore.orders.filter(o => o.status === 'cancelled').length;

  return {
    total_products,
    total_stock,
    total_orders,
    total_revenue,
    pending_orders,
    confirmed_orders,
    shipping_orders,
    delivered_orders,
    cancelled_orders
  };
}

// ----------------------------------------------------
// BANNER MANAGEMENT METHODS (PostgreSQL with Fallback)
// ----------------------------------------------------

async function getBanners(onlyActive = true) {
  if (isPostgresConnected) {
    const query = onlyActive
      ? 'SELECT * FROM banners WHERE active = true ORDER BY display_order ASC, created_at DESC'
      : 'SELECT * FROM banners ORDER BY display_order ASC, created_at DESC';
    const { rows } = await pool.query(query);
    return rows;
  }

  let list = fallbackMemoryStore.banners || [];
  if (onlyActive) {
    list = list.filter(b => b.active);
  }
  return [...list].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
}

async function getBannerById(id) {
  if (isPostgresConnected) {
    const { rows } = await pool.query('SELECT * FROM banners WHERE id = $1', [id]);
    return rows[0] || null;
  }
  const list = fallbackMemoryStore.banners || [];
  return list.find(b => b.id === id) || null;
}

async function createBanner(data) {
  const id = data.id && data.id.trim() ? data.id.trim() : `banner-${Date.now()}`;
  const title = data.title || 'Khuyến mãi đặc biệt';
  const subtitle = data.subtitle || '';
  const badge_text = data.badge_text || 'HOT DEAL';
  const image_url = data.image_url || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1200&auto=format&fit=crop&q=80';
  const link_url = data.link_url || '#builder';
  const cta_text = data.cta_text || 'Khám Phá Ngay';
  const bg_gradient = data.bg_gradient || 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)';
  const display_order = Number(data.display_order) || 0;
  const active = data.active !== undefined ? !!data.active : true;

  if (isPostgresConnected) {
    const query = `
      INSERT INTO banners (id, title, subtitle, badge_text, image_url, link_url, cta_text, bg_gradient, display_order, active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const { rows } = await pool.query(query, [id, title, subtitle, badge_text, image_url, link_url, cta_text, bg_gradient, display_order, active]);
    return rows[0];
  }

  const newBanner = { id, title, subtitle, badge_text, image_url, link_url, cta_text, bg_gradient, display_order, active, created_at: new Date().toISOString() };
  if (!fallbackMemoryStore.banners) fallbackMemoryStore.banners = [];
  fallbackMemoryStore.banners.push(newBanner);
  saveFallback();
  return newBanner;
}

async function updateBanner(id, data) {
  if (isPostgresConnected) {
    const existing = await getBannerById(id);
    if (!existing) return null;

    const title = data.title !== undefined ? data.title : existing.title;
    const subtitle = data.subtitle !== undefined ? data.subtitle : existing.subtitle;
    const badge_text = data.badge_text !== undefined ? data.badge_text : existing.badge_text;
    const image_url = data.image_url !== undefined ? data.image_url : existing.image_url;
    const link_url = data.link_url !== undefined ? data.link_url : existing.link_url;
    const cta_text = data.cta_text !== undefined ? data.cta_text : existing.cta_text;
    const bg_gradient = data.bg_gradient !== undefined ? data.bg_gradient : existing.bg_gradient;
    const display_order = data.display_order !== undefined ? Number(data.display_order) : existing.display_order;
    const active = data.active !== undefined ? !!data.active : existing.active;

    const query = `
      UPDATE banners
      SET title = $1, subtitle = $2, badge_text = $3, image_url = $4, link_url = $5, cta_text = $6, bg_gradient = $7, display_order = $8, active = $9
      WHERE id = $10
      RETURNING *
    `;
    const { rows } = await pool.query(query, [title, subtitle, badge_text, image_url, link_url, cta_text, bg_gradient, display_order, active, id]);
    return rows[0] || null;
  }

  if (!fallbackMemoryStore.banners) fallbackMemoryStore.banners = [];
  const idx = fallbackMemoryStore.banners.findIndex(b => b.id === id);
  if (idx === -1) return null;

  fallbackMemoryStore.banners[idx] = {
    ...fallbackMemoryStore.banners[idx],
    ...data,
    display_order: data.display_order !== undefined ? Number(data.display_order) : fallbackMemoryStore.banners[idx].display_order,
    active: data.active !== undefined ? !!data.active : fallbackMemoryStore.banners[idx].active
  };
  saveFallback();
  return fallbackMemoryStore.banners[idx];
}

async function deleteBanner(id) {
  if (isPostgresConnected) {
    const { rows } = await pool.query('DELETE FROM banners WHERE id = $1 RETURNING *', [id]);
    return rows.length > 0;
  }

  if (!fallbackMemoryStore.banners) return false;
  const idx = fallbackMemoryStore.banners.findIndex(b => b.id === id);
  if (idx === -1) return false;
  fallbackMemoryStore.banners.splice(idx, 1);
  saveFallback();
  return true;
}

async function toggleBannerActive(id) {
  const banner = await getBannerById(id);
  if (!banner) return null;
  return updateBanner(id, { active: !banner.active });
}

function getDatabaseStatus() {
  return {
    type: isPostgresConnected ? 'PostgreSQL' : 'Persistent Storage (PostgreSQL Fallback)',
    connected: true,
    isPostgres: isPostgresConnected
  };
}

module.exports = {
  initDatabase,
  getCategories,
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  createOrder,
  getAllOrders,
  getOrdersByPhone,
  updateOrderStatus,
  deleteOrder,
  getAdminStats,
  getDatabaseStatus,
  getBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerActive
};
