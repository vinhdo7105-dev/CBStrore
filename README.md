# ⚡ CBStore - Website Bán Linh Kiện & Build Máy Tính

Hệ thống website thương mại điện tử chuyên biệt cho **Linh kiện máy tính & Xây dựng cấu hình PC** với phong cách thiết kế tối giản, hiện đại, mượt mà (Minimalist Obsidian Dark), xây dựng trên nền tảng **React.js + Node.js (Express) + PostgreSQL**.

---

## 🌟 Các Chức Năng Chính Hoàn Thành Theo Yêu Cầu

### 1. 🖥️ Xem Sản Phẩm & Thông Số Kỹ Thuật (Catalog & Specs)
- Danh mục linh kiện đầy đủ: **CPU, Mainboard, RAM, VGA, SSD, Nguồn (PSU), Vỏ Case, Tản Nhiệt**.
- Lọc theo danh mục, lọc theo hãng sản xuất (Intel, AMD, ASUS, MSI, GIGABYTE, Corsair, Samsung,...).
- Tìm kiếm tức thì theo tên linh kiện, sắp xếp theo giá và độ nổi bật.
- Bảng thông số kỹ thuật chi tiết: Chuẩn Socket, Xung nhịp, Số nhân luồng, TDP, VRAM, Bus RAM, Chiều dài VGA, v.v.

### 2. 🛒 Giỏ Hàng Thông Minh (Cart Drawer)
- Thêm nhanh từ danh sách sản phẩm hoặc thêm trọn bộ từ bộ cấu hình PC.
- Tự động lưu trữ và đồng bộ hóa qua LocalStorage.
- Điều chỉnh số lượng (+ / -), xóa sản phẩm, tính toán tạm tính và miễn phí vận chuyển.

### 3. ⚡ Xây Dựng Cấu Hình Máy Tính (PC Builder & Compatibility)
- Bộ chọn 8 linh kiện tiêu chuẩn của 1 bộ máy tính hoàn chỉnh:
  1. CPU (Bộ vi xử lý)
  2. Bo mạch chủ (Mainboard)
  3. RAM (Bộ nhớ trong)
  4. Card màn hình (VGA)
  5. Ổ cứng SSD
  6. Nguồn máy tính (PSU)
  7. Vỏ Case
  8. Tản nhiệt CPU
- **Thuật toán kiểm tra tính tương thích theo thời gian thực:**
  - Kiểm tra tương thích Socket giữa CPU và Mainboard (LGA1700 vs AM5).
  - Kiểm tra chuẩn RAM (DDR5 vs DDR4).
  - Ước tính tổng công suất tiêu thụ (TDP) và khuyến nghị nguồn PSU an toàn.
- **Cấu hình mẫu tối ưu sẵn (Presets):** Click 1 phát nạp ngay cấu hình Gaming 2K, Streamer/Đồ họa 3D, hoặc Game Quốc Dân tiết kiệm.
- Nút **"Thêm Cả Bộ Vào Giỏ Hàng"** & **"Sao chép / In cấu hình"**.

### 4. 📦 Đặt Hàng Nhanh & Tinh Gọn (Checkout)
- Đúng theo yêu cầu của bạn: Người mua **chỉ cần điền Họ tên, Số điện thoại và Địa chỉ nhận hàng** (không cần đăng ký tài khoản rườm rà).
- Tùy chọn phương thức thanh toán: COD (Thanh toán khi nhận hàng) hoặc Chuyển khoản VietQR.
- Hiệu ứng chúc mừng (Confetti) và cấp mã đơn hàng duy nhất.

### 5. 🔍 Tra Cứu Đơn Hàng Qua Số Điện Thoại (Order Tracking)
- Khách hàng chỉ cần nhập **Số điện thoại** đã đặt hàng để xem lại toàn bộ lịch sử mua sắm.
- Hiển thị chi tiết từng đơn hàng:
  - Mã đơn hàng & Ngày giờ đặt
  - Trạng thái đơn hàng (Chờ xác nhận ➜ Đã xác nhận ➜ Đang vận chuyển ➜ Đã giao)
  - Thông tin người nhận và địa chỉ giao hàng
  - Danh sách từng linh kiện trong đơn (hình ảnh, số lượng, đơn giá, thành tiền)
  - Tổng số tiền thanh toán

### 6. 🛡️ Trang Quản Trị Hệ Thống Admin (Bảo Mật Đường Dẫn Phức Tạp)
- **Bảo mật truy cập tuyệt đối:**
  - **Ẩn hoàn toàn khỏi giao diện người dùng:** Không hiển thị bất kỳ nút hoặc đường dẫn Admin nào trên Navbar của khách hàng.
  - **Đường dẫn bí mật phức tạp:** Chỉ truy cập được qua URL riêng: **`http://localhost:3000/admin-portal-secure-x98k2`**.
  - **Cổng xác thực bảo mật (Passcode Gate):** Yêu cầu nhập mã PIN bảo mật quản trị viên (mặc định: `admin@123`) để mở khóa phiên làm việc.
  - **Đăng xuất bảo mật:** Nút "Đăng xuất" xóa phiên lưu trữ và đưa về trang chủ.
- **Tổng quan & Báo cáo KPIs (Dashboard):**
  - Thống kê thời gian thực: Tổng doanh thu, Tổng số đơn hàng, Đơn chờ xử lý (Pending), Hàng tồn kho.
  - Biểu đồ phân bổ trạng thái đơn hàng và cảnh báo hàng sắp hết (≤ 5 SP).
- **Quản lý Mặt Hàng / Linh Kiện (Products Management):**
  - Bảng danh mục sản phẩm chi tiết với ảnh xem trước, mã SKU, thương hiệu, giá bán, tồn kho, ghim nổi bật.
  - Bộ lọc nâng cao: Tìm kiếm tên/SKU/hãng, lọc 9 danh mục linh kiện, thương hiệu, trạng thái kho.
  - Thêm, sửa, xóa mặt hàng, gợi ý cấu hình thông số kỹ thuật (Specs) mẫu theo từng danh mục.
- **Quản lý Đơn Hàng (Orders Management):**
  - Bảng danh sách đơn hàng (Đơn mua lẻ / Build PC trọn bộ).
  - Tìm kiếm theo Mã đơn, Họ tên, Số điện thoại.
  - Lọc theo 5 trạng thái đơn hàng (Chờ xác nhận, Đã xác nhận, Đang giao, Hoàn thành, Đã hủy).
  - Đổi trạng thái trực tiếp, xem chi tiết từng linh kiện, in hóa đơn / phiếu xuất kho khổ A4 chuẩn.
- **Quản lý Banner Quảng Bá Trang Chủ (Banners Management):**
  - Quản lý danh sách banner chạy trên slider trang chủ.
  - Thêm mới, chỉnh sửa tiêu đề, nội dung khuyến mãi, nhãn badge, link điều hướng, màu gradient và thứ tự hiển thị.
  - Bật/tắt hiển thị (Toggle Active) tức thì với 1 cú click.

### 7. 🎨 Banner Quảng Bá Trang Chủ Chuyển Động (Home Banner Carousel)
- Slider tự động chuyển qua chuyển lại mỗi 4.5 giây với hiệu ứng mượt mà.
- Tự động tạm dừng khi rê chuột (pause on hover).
- Nút mũi tên chuyển tiếp (Prev / Next) và thanh chấm chỉ số (Dots bar) tương tác trực tiếp.
- Tích hợp 2 banner phụ cố định bên phải (Build PC theo yêu cầu & Tra cứu đơn hàng nhanh).

---

## 🛠️ Cấu Trúc Dự Án

```
5/
├── client/                     # Frontend React.js (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx     # Trang quản trị chính (KPI, Sản phẩm, Đơn hàng, Banner)
│   │   │   │   ├── AdminAuthGate.jsx      # Cổng xác thực mật mã bảo vệ trang Admin
│   │   │   │   ├── ProductFormModal.jsx   # Modal Thêm & Chỉnh sửa mặt hàng
│   │   │   │   ├── OrderDetailModal.jsx   # Modal Xem chi tiết & Duyệt đơn hàng
│   │   │   │   ├── InvoicePrintModal.jsx  # Modal Xem trước & In hóa đơn bán lẻ
│   │   │   │   └── BannerFormModal.jsx    # Modal Thêm & Sửa banner quảng bá
│   │   │   ├── BannerCarousel.jsx         # Slider banner chuyển qua chuyển lại trang chủ
│   │   │   ├── Navbar.jsx                 # Thanh điều hướng cửa hàng
│   │   │   ├── ProductCard.jsx            # Thẻ linh kiện máy tính
│   │   │   ├── ProductModal.jsx           # Chi tiết thông số kỹ thuật
│   │   │   ├── CartDrawer.jsx             # Giỏ hàng trượt
│   │   │   ├── CheckoutModal.jsx          # Form đặt hàng chỉ cần SĐT & Địa chỉ
│   │   │   ├── PCBuilder.jsx              # Bộ lắp ráp máy tính & kiểm tra tương thích
│   │   │   ├── OrderLookup.jsx            # Tra cứu đơn hàng theo SĐT
│   │   │   └── Toast.jsx                  # Thông báo tương tác
│   │   ├── context/
│   │   │   └── CartContext.jsx            # Quản lý trạng thái giỏ hàng
│   │   ├── services/
│   │   │   └── api.js                     # Giao tiếp API Backend (kèm Admin CRUD & Banner APIs)
│   │   ├── index.css                      # Hệ thống CSS Vanilla + Banner + Admin styles
│   │   ├── App.jsx                        # Layout, điều hướng Storefront & Secret Admin Route
│   │   └── main.jsx
│   ├── vite.config.js                     # Cấu hình proxy /api -> backend:5000
│   └── package.json
│
├── server/                     # Backend Node.js (Express + PostgreSQL)
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.sql         # Bảng categories, products, orders, order_items, banners
│   │   │   ├── seedData.js        # Dữ liệu mẫu phong phú
│   │   │   └── index.js           # Kết nối PostgreSQL & Fallback an toàn
│   │   ├── routes/
│   │   │   ├── products.js        # API sản phẩm
│   │   │   ├── orders.js          # API đơn hàng
│   │   │   ├── builder.js         # API kiểm tra tương thích PC & presets
│   │   │   └── banners.js         # API banner quảng bá (Lấy danh sách, thêm, sửa, xóa, toggle)
│   │   └── index.js               # Entrypoint Express server (Port 5000)


│   └── package.json
│
├── server/                     # Backend Node.js (Express + PostgreSQL)
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.sql         # Kịch bản DDL tạo bảng PostgreSQL
│   │   │   ├── seedData.js        # Dữ liệu mẫu linh kiện phong phú
│   │   │   └── index.js           # Kết nối PostgreSQL & Fallback an toàn
│   │   ├── routes/
│   │   │   ├── products.js        # API lấy sản phẩm, lọc theo danh mục
│   │   │   ├── orders.js          # API đặt hàng & tra cứu theo SĐT
│   │   │   └── builder.js         # API kiểm tra tương thích PC & presets
│   │   └── index.js               # Entrypoint Express server (Port 5000)
│   ├── .env.example               # Mẫu cấu hình cổng và PostgreSQL
│   └── package.json
│
├── docker-compose.yml          # Chạy PostgreSQL nhanh với 1 lệnh docker
├── start-all.js                # Khởi động cùng lúc cả Frontend & Backend
└── README.md
```

---

## 🚀 Hướng Dẫn Chạy Website

### 1. Khởi động nhanh (Khuyên dùng)
Tại thư mục gốc dự án:
```powershell
node start-all.js
```
Hoặc:
```powershell
npm start
```
- **Giao diện Client (React):** `http://localhost:3000`
- **Máy chủ Backend (Node.js API):** `http://localhost:5000`

---

### 2. Cấu Hình Cơ Sở Dữ Liệu PostgreSQL

Hệ thống được thiết kế **100% chuẩn PostgreSQL** với file kịch bản SQL tại `server/src/db/schema.sql`.

#### Cách A: Chạy PostgreSQL tự động qua Docker (1 lệnh)
Nếu bạn có cài Docker trên máy:
```powershell
docker compose up -d
```

#### Cách B: Dùng PostgreSQL có sẵn trên máy
Chỉnh sửa file `server/.env` với thông tin kết nối của bạn:
```env
DATABASE_URL=postgresql://postgres:mat_khau_cua_ban@localhost:5432/pc_store
```
*Lưu ý: Nếu máy tính chưa kịp bật PostgreSQL, hệ thống đã tích hợp sẵn cơ chế **Auto-Fallback Store** lưu trữ bền vững tại `server/data/db.json` với dữ liệu đầy đủ để trang web **chạy ngay 100% không bao giờ gặp lỗi gián đoạn**.*

---

## 🧪 Tài Khoản & Dữ Liệu Mẫu Thử Nghiệm

- **Số điện thoại mẫu có sẵn đơn hàng để tra cứu ngay:** `0912345678`
- **Thử đặt hàng mới:** Điền số điện thoại của bạn, sau đó vào tab **Tra cứu đơn hàng** nhập lại số điện thoại đó để xem ngay tiến trình đơn hàng vừa tạo!
#   C B - S t r o r e  
 