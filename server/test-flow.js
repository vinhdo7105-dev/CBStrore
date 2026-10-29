const http = require('http');

async function test() {
  const payload = JSON.stringify({
    customer_name: 'Trần Minh Đức',
    customer_phone: '0987654321',
    customer_address: '45 Lê Lợi, Phường Bến Nghé, Quận 1, TP Hồ Chí Minh',
    note: 'Giao trong giờ hành chính',
    payment_method: 'cod',
    items: [
      {
        product_id: 'cpu-intel-i5-14600k',
        product_name: 'Intel Core i5-14600K',
        unit_price: 8190000,
        quantity: 1
      },
      {
        product_id: 'vga-asus-tuf-rtx-4070-ti-super',
        product_name: 'ASUS TUF Gaming GeForce RTX 4070 Ti SUPER 16GB',
        unit_price: 24990000,
        quantity: 1
      }
    ],
    is_pc_build: true
  });

  console.log('1. Đang gửi yêu cầu đặt hàng (POST /api/orders)...');
  
  const postReq = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/orders',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  }, (res) => {
    let raw = '';
    res.on('data', chunk => raw += chunk);
    res.on('end', () => {
      const data = JSON.parse(raw);
      console.log('✅ Đặt hàng thành công! Mã đơn hàng:', data.data.id);
      console.log('   Khách hàng:', data.data.customer_name);
      console.log('   Tổng tiền:', data.data.total_amount, 'VND');

      console.log('\n2. Đang kiểm tra tra cứu đơn hàng theo SĐT (GET /api/orders/lookup?phone=0987654321)...');
      http.get('http://localhost:5000/api/orders/lookup?phone=0987654321', (res2) => {
        let raw2 = '';
        res2.on('data', chunk => raw2 += chunk);
        res2.on('end', () => {
          const lookupData = JSON.parse(raw2);
          console.log(`✅ Tìm thấy ${lookupData.count} đơn hàng khớp với số điện thoại 0987654321!`);
          console.log('   Chi tiết đơn đầu tiên:', {
            id: lookupData.data[0].id,
            ten_khach: lookupData.data[0].customer_name,
            so_dien_thoai: lookupData.data[0].customer_phone,
            dia_chi: lookupData.data[0].customer_address,
            tong_tien: lookupData.data[0].total_amount,
            so_san_pham: lookupData.data[0].items.length
          });
          console.log('\n🎉 TẤT CẢ CÁC CHỨC NĂNG ĐẶT HÀNG & TRA CỨU HOẠT ĐỘNG HOÀN HẢO!');
        });
      });
    });
  });

  postReq.write(payload);
  postReq.end();
}

test();
