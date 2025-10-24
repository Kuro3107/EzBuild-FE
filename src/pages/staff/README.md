# Staff Management System - Order & Payment Flow

## Order Status Flow

```
PENDING → DEPOSITED → SHIPPING → PAID → DONE
   ↓         ↓           ↓        ↓
 CANCEL   CANCEL     CANCEL   CANCEL
```

### Chi tiết từng trạng thái:

1. **PENDING** 
   - Trạng thái ban đầu sau khi tạo đơn hàng
   - Hiển thị ở trang quản lý đơn của staff
   - Khách hàng chưa thanh toán

2. **DEPOSITED** 
   - Tự động chuyển khi payment được thanh toán 25%
   - Staff KHÔNG thể chuyển trực tiếp thành DEPOSITED
   - Chỉ thay đổi khi payment status = "PAID 25%"

3. **SHIPPING**
   - Staff chuyển sau khi chuẩn bị hàng xong
   - Có thể chuyển từ DEPOSITED → SHIPPING
   - Staff thực hiện ở trang quản lý order

4. **PAID**
   - Staff chuyển khi thanh toán đầy đủ
   - Có thể chuyển từ SHIPPING → PAID
   - Staff thực hiện ở trang quản lý order

5. **DONE**
   - Khách hàng feedback xong
   - Tự động chuyển sau 3 ngày nhận đơn (nếu được implement)
   - Có thể chuyển từ PAID → DONE

6. **CANCEL**
   - Khách hàng hủy đơn
   - Có thể chuyển từ bất kỳ trạng thái nào

## Payment Status Flow

```
PENDING → PAID 25% → PAID
```

### Chi tiết từng trạng thái:

1. **PENDING**
   - Trạng thái ban đầu sau khi tạo payment
   - Chưa thanh toán

2. **PAID 25%**
   - Staff chuyển khi khách hàng thanh toán cọc 25%
   - Tự động cập nhật order status thành DEPOSITED
   - Staff thực hiện ở trang quản lý payment

3. **PAID**
   - Staff chuyển khi thanh toán đầy đủ
   - Staff thực hiện ở trang quản lý payment

## API Endpoints

### Order Management
- `GET /api/order` - Lấy tất cả orders
- `GET /api/order/{id}` - Lấy order theo ID
- `PUT /api/order/{id}/status` - Cập nhật trạng thái order

### Payment Management
- `GET /api/payment` - Lấy tất cả payments
- `GET /api/payment/{id}` - Lấy payment theo ID
- `PUT /api/payment/{id}` - Cập nhật payment
- `POST /api/payment` - Tạo payment mới

## Staff Pages

1. **Dashboard** (`/staff/dashboard`)
   - Tổng quan thống kê
   - Số liệu orders và payments
   - Doanh thu

2. **Order Management** (`/staff/orders`)
   - Danh sách tất cả orders
   - Filter theo trạng thái
   - Cập nhật trạng thái order
   - Xem chi tiết order

3. **Payment Management** (`/staff/payments`)
   - Danh sách tất cả payments
   - Filter theo trạng thái
   - Cập nhật trạng thái payment
   - Tự động cập nhật order khi payment thay đổi

## Auto-Update Logic

Khi staff cập nhật payment status:
- `PENDING` → `PAID 25%`: Tự động cập nhật order thành `DEPOSITED`
- `PAID 25%` → `PAID`: Không tự động cập nhật order (staff phải làm thủ công)

## Staff Permissions

- Chỉ user có role "Staff" mới có thể truy cập
- Protected routes với `ProtectedRoute` component
- Tất cả API calls đều cần authentication token
