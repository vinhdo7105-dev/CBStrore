const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const fs = require('fs');
const { Pool } = require('pg');
const { categories, products, seedOrders } = require('./seedData');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.PG_USER || 'postgres'}:${process.env.PG_PASSWORD || '123456'}@${process.env.PG_HOST || 'localhost'}:${process.env.PG_PORT || 5432}/${process.env.PG_DATABASE || 'pc_store'}`
});

async function runSeed() {
  const client = await pool.connect();
  try {
    console.log('🔄 Đang áp dụng schema.sql vào database PostgreSQL pc_store...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await client.query(schemaSql);

    console.log('🌱 Đang đồng bộ categories vào PostgreSQL...');
    for (const cat of categories) {
      await client.query(
        `INSERT INTO categories (id, name, icon, description, display_order)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           icon = EXCLUDED.icon,
           description = EXCLUDED.description,
           display_order = EXCLUDED.display_order`,
        [cat.id, cat.name, cat.icon, cat.description, cat.display_order]
      );
    }

    console.log('🌱 Đang đồng bộ 48 linh kiện sản phẩm vào PostgreSQL...');
    for (const prod of products) {
      await client.query(
        `INSERT INTO products (id, category_id, name, brand, price, original_price, image_url, stock, warranty, specs, featured)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO UPDATE SET
           category_id = EXCLUDED.category_id,
           name = EXCLUDED.name,
           brand = EXCLUDED.brand,
           price = EXCLUDED.price,
           original_price = EXCLUDED.original_price,
           image_url = EXCLUDED.image_url,
           stock = EXCLUDED.stock,
           warranty = EXCLUDED.warranty,
           specs = EXCLUDED.specs,
           featured = EXCLUDED.featured`,
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

    console.log('✅ Hoàn tất đồng bộ dữ liệu vào PostgreSQL!');
  } catch (err) {
    console.error('❌ Lỗi khi seed database:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

runSeed();
