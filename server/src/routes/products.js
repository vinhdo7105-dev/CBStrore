const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await db.getCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy danh mục sản phẩm.' });
  }
});

// GET products with filtering and sorting
router.get('/products', async (req, res) => {
  try {
    const { categoryId, brand, search, sort } = req.query;
    const products = await db.getProducts({ categoryId, brand, search, sort });
    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy danh sách sản phẩm.' });
  }
});

// GET single product by name slug (must be before /products/:id)
router.get('/products/slug/:slug', async (req, res) => {
  try {
    const product = await db.getProductBySlug(req.params.slug);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm.' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy chi tiết sản phẩm.' });
  }
});

// GET single product by ID
router.get('/products/:id', async (req, res) => {
  try {
    const product = await db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm.' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Error fetching product detail:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy chi tiết sản phẩm.' });
  }
});

// POST /api/products - Thêm sản phẩm mới (Admin)
router.post('/products', async (req, res) => {
  try {
    const { name, category_id, brand, price } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Tên sản phẩm là bắt buộc.' });
    }
    if (!category_id) {
      return res.status(400).json({ success: false, message: 'Danh mục là bắt buộc.' });
    }
    if (price === undefined || isNaN(Number(price))) {
      return res.status(400).json({ success: false, message: 'Đơn giá không hợp lệ.' });
    }

    const newProduct = await db.createProduct(req.body);
    res.status(201).json({ success: true, message: 'Thêm sản phẩm thành công!', data: newProduct });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi thêm sản phẩm mới.' });
  }
});

// PUT /api/products/:id - Cập nhật sản phẩm (Admin)
router.put('/products/:id', async (req, res) => {
  try {
    const updated = await db.updateProduct(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm cần cập nhật.' });
    }
    res.json({ success: true, message: 'Cập nhật sản phẩm thành công!', data: updated });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi cập nhật sản phẩm.' });
  }
});

// DELETE /api/products/:id - Xóa sản phẩm (Admin)
router.delete('/products/:id', async (req, res) => {
  try {
    const deleted = await db.deleteProduct(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm cần xóa.' });
    }
    res.json({ success: true, message: 'Đã xóa sản phẩm thành công!' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi xóa sản phẩm.' });
  }
});

module.exports = router;
