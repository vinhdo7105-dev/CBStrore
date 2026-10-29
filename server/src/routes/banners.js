const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/banners - Lấy danh sách banner đang hoạt động cho trang chủ
router.get('/', async (req, res) => {
  try {
    const banners = await db.getBanners(true);
    res.json({ success: true, count: banners.length, data: banners });
  } catch (error) {
    console.error('Error fetching active banners:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy danh sách banner.' });
  }
});

// GET /api/banners/all - Lấy tất cả banner cho trang quản trị Admin
router.get('/all', async (req, res) => {
  try {
    const banners = await db.getBanners(false);
    res.json({ success: true, count: banners.length, data: banners });
  } catch (error) {
    console.error('Error fetching all banners for admin:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy danh sách banner.' });
  }
});

// POST /api/banners - Thêm banner mới (Admin)
router.post('/', async (req, res) => {
  try {
    const { title, image_url } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Tiêu đề banner là bắt buộc.' });
    }
    if (!image_url || !image_url.trim()) {
      return res.status(400).json({ success: false, message: 'Đường dẫn hình ảnh banner là bắt buộc.' });
    }

    const newBanner = await db.createBanner(req.body);
    res.status(201).json({ success: true, message: 'Thêm banner quảng cáo thành công!', data: newBanner });
  } catch (error) {
    console.error('Error creating banner:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi tạo mới banner.' });
  }
});

// PUT /api/banners/:id - Cập nhật thông tin banner (Admin)
router.put('/:id', async (req, res) => {
  try {
    const updated = await db.updateBanner(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy banner cần cập nhật.' });
    }
    res.json({ success: true, message: 'Cập nhật banner thành công!', data: updated });
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi cập nhật banner.' });
  }
});

// PATCH /api/banners/:id/toggle - Bật/Tắt hiển thị banner (Admin)
router.patch('/:id/toggle', async (req, res) => {
  try {
    const updated = await db.toggleBannerActive(req.params.id);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy banner.' });
    }
    res.json({
      success: true,
      message: updated.active ? 'Đã kích hoạt hiển thị banner!' : 'Đã ẩn banner khỏi trang chủ!',
      data: updated
    });
  } catch (error) {
    console.error('Error toggling banner:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi chuyển trạng thái banner.' });
  }
});

// DELETE /api/banners/:id - Xóa banner (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await db.deleteBanner(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy banner cần xóa.' });
    }
    res.json({ success: true, message: 'Đã xóa banner thành công!' });
  } catch (error) {
    console.error('Error deleting banner:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi xóa banner.' });
  }
});

module.exports = router;
