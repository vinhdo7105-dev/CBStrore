const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/orders - Đặt hàng mới
router.post('/', async (req, res) => {
  try {
    const { customer_name, customer_phone, customer_address, note, payment_method, items, is_pc_build } = req.body;

    // Validate required fields
    if (!customer_name || !customer_name.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập họ và tên người nhận.' });
    }
    if (!customer_phone || !customer_phone.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập số điện thoại nhận hàng.' });
    }
    // Basic phone number validation (at least 9-11 digits)
    const phoneDigits = customer_phone.replace(/\D/g, '');
    if (phoneDigits.length < 9 || phoneDigits.length > 12) {
      return res.status(400).json({ success: false, message: 'Số điện thoại không hợp lệ (từ 9 - 11 chữ số).' });
    }
    if (!customer_address || !customer_address.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp địa chỉ giao hàng cụ thể.' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Giỏ hàng của bạn đang trống.' });
    }

    const orderItems = items.map(item => ({
      product_id: item?.product_id || item?.id,
      product_name: item?.product_name || item?.name,
      product_image: item?.product_image || item?.image_url || '',
      category_id: item?.category_id || '',
      quantity: Number(item?.quantity ?? 1),
      unit_price: Number(item?.unit_price || item?.price || 0)
    }));
    if (orderItems.some(item => !item.product_id || !Number.isSafeInteger(item.quantity) || item.quantity <= 0)) {
      return res.status(400).json({ success: false, message: 'Thông tin mặt hàng hoặc số lượng đặt mua không hợp lệ.' });
    }

    // Calculate total amount
    const total_amount = orderItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

    const order = await db.createOrder({
      customer_name: customer_name.trim(),
      customer_phone: customer_phone.trim(),
      customer_address: customer_address.trim(),
      note: (note || '').trim(),
      payment_method: payment_method || 'cod',
      total_amount,
      items: orderItems,
      is_pc_build: !!is_pc_build
    });

    res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công! Chúng tôi sẽ sớm liên hệ xác nhận đơn hàng.',
      data: order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : 'Không thể tạo đơn hàng. Vui lòng thử lại sau.'
    });
  }
});

// GET /api/orders/lookup?phone=... - Tra cứu đơn hàng theo số điện thoại
router.get('/lookup', async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone || !phone.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp số điện thoại để tra cứu đơn hàng.'
      });
    }

    const orders = await db.getOrdersByPhone(phone);
    res.json({
      success: true,
      phone: phone.trim(),
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Error looking up orders:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi tra cứu đơn hàng.'
    });
  }
});

// GET /api/orders/stats - Thống kê đơn hàng và doanh thu cho Admin
router.get('/stats', async (req, res) => {
  try {
    const stats = await db.getAdminStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy số liệu thống kê.'
    });
  }
});

// GET /api/orders - Lấy danh sách toàn bộ đơn hàng (Admin)
router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;
    const orders = await db.getAllOrders({ status, search });
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy danh sách đơn hàng.'
    });
  }
});

// PATCH /api/orders/:id/status - Cập nhật trạng thái đơn hàng (Admin)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp trạng thái mới.' });
    }

    const updated = await db.updateOrderStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng cần cập nhật.' });
    }
    res.json({
      success: true,
      message: 'Cập nhật trạng thái đơn hàng thành công!',
      data: updated
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi cập nhật trạng thái đơn hàng.'
    });
  }
});

// DELETE /api/orders/:id - Xóa đơn hàng (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await db.deleteOrder(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng cần xóa.' });
    }
    res.json({
      success: true,
      message: 'Đã xóa đơn hàng thành công!'
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi xóa đơn hàng.'
    });
  }
});

module.exports = router;
