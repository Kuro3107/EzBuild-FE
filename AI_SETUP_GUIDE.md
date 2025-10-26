# 🤖 Hướng dẫn cấu hình AI Chat

## 📋 Tổng quan

EzBuild sử dụng Google Gemini AI để cung cấp tư vấn PC Builder thông minh. AI có thể hoạt động ở 2 chế độ:

- **Online Mode**: Sử dụng Gemini AI thực (cần API key)
- **Offline Mode**: Sử dụng database câu trả lời có sẵn (không cần API key)

## 🔑 Cách lấy Google Gemini API Key

### Bước 1: Truy cập Google AI Studio

1. Vào trang: https://aistudio.google.com/app/apikey
2. Đăng nhập bằng tài khoản Google của bạn

### Bước 2: Tạo API Key

1. Click "Create API Key"
2. Chọn project hoặc tạo project mới
3. Copy API key được tạo

### Bước 3: Cấu hình trong project

1. Tạo file `.env` trong thư mục gốc của project
2. Thêm dòng sau vào file `.env`:

```env
VITE_GOOGLE_API_KEY=your_actual_api_key_here
```

**⚠️ Lưu ý quan trọng:**

- Thay `your_actual_api_key_here` bằng API key thực tế của bạn
- Không commit file `.env` vào Git (đã có trong .gitignore)
- Giữ bí mật API key của bạn

## 🚀 Chế độ hoạt động

### Online Mode (Có API Key)

- ✅ Sử dụng Gemini AI thực
- ✅ Trả lời thông minh và chính xác
- ✅ Hỗ trợ context và conversation
- ✅ Cập nhật kiến thức mới nhất

### Offline Mode (Không có API Key)

- ✅ Hoạt động ngay lập tức
- ✅ Database câu trả lời có sẵn
- ✅ Không cần cấu hình
- ⚠️ Câu trả lời cố định, không thông minh

## 🔧 Troubleshooting

### Lỗi thường gặp:

1. **"API key chưa được cấu hình"**

   - Kiểm tra file `.env` có tồn tại không
   - Kiểm tra tên biến `VITE_GOOGLE_API_KEY`
   - Restart dev server sau khi thêm `.env`

2. **"API key không hợp lệ"**

   - Kiểm tra API key có đúng format không
   - Kiểm tra API key có còn hoạt động không
   - Tạo API key mới nếu cần

3. **"Lỗi khi gọi Gemini API"**
   - Kiểm tra kết nối internet
   - Kiểm tra quota API key
   - Hệ thống sẽ tự động chuyển sang offline mode

## 📝 Ví dụ cấu hình

### File `.env` mẫu:

```env
# Google Gemini AI API Key
VITE_GOOGLE_API_KEY=AIzaSyAAR27Ta1GxHWyYfn2m_XXugDQ0evK7aJ0
```

### File `env.example` (template):

```env
# Google Gemini AI API Key
# Lấy từ: https://aistudio.google.com/app/apikey
# Thay thế YOUR_API_KEY_HERE bằng API key thực tế của bạn
VITE_GOOGLE_API_KEY=YOUR_API_KEY_HERE
```

## 🎯 Tính năng AI Chat

AI Assistant có thể tư vấn về:

- 🖥️ **CPU**: Intel Core, AMD Ryzen
- 🎮 **GPU**: NVIDIA RTX, AMD RX
- 💾 **RAM**: DDR4, DDR5, tần số
- 🔌 **Mainboard**: Socket, chipset
- 💿 **Storage**: SSD, HDD
- ⚡ **PSU**: Công suất, hiệu suất
- 🖼️ **Case**: Kích thước, airflow
- 🌡️ **Cooling**: Air cooling, liquid cooling
- 🖥️ **Monitor**: Resolution, refresh rate
- ⌨️ **Peripherals**: Keyboard, mouse, headset

## 🔒 Bảo mật

- API key được lưu trong environment variables
- Không hardcode API key trong source code
- File `.env` không được commit vào Git
- API key chỉ sử dụng cho Gemini AI, không chia sẻ

## 📞 Hỗ trợ

Nếu gặp vấn đề với AI Chat:

1. Kiểm tra console log để xem lỗi
2. Thử tạo API key mới
3. Kiểm tra kết nối internet
4. Liên hệ team phát triển nếu cần hỗ trợ
