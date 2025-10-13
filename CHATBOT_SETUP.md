# 🤖 Hướng dẫn thiết lập AI Chatbot cho EzBuild

## Tổng quan

EzBuild đã được tích hợp với Google Gemini AI để cung cấp trợ lý AI chuyên về PC Builder và linh kiện máy tính. Chatbot hiển thị dưới dạng **bubble đẹp mắt** trên **trang chủ**.

## 🚀 Tính năng

- **Giao diện bubble**: Chatbot hiển thị với bubble thông báo đẹp mắt
- **Vị trí trang chủ**: Chỉ hiển thị trên homepage, không làm rối trang PC Builder
- **Tư vấn linh kiện PC**: CPU, GPU, RAM, Mainboard, Storage, PSU, Case, Cooling
- **So sánh hiệu năng**: Giữa các linh kiện khác nhau
- **Tư vấn build PC**: Cho gaming, văn phòng, content creation
- **Giải thích thông số**: Các thông số kỹ thuật phức tạp
- **Tư vấn tương thích**: Giữa các linh kiện

## 📋 Cài đặt

### 1. Lấy Google Gemini API Key

1. Truy cập [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Đăng nhập với tài khoản Google
3. Tạo API Key mới
4. Copy API Key

### 2. Cấu hình Environment Variables

1. Tạo file `.env` trong thư mục gốc của dự án
2. Thêm API Key vào file:

```env
VITE_GOOGLE_API_KEY=your_gemini_api_key_here
```

### 3. Chạy ứng dụng

```bash
npm run dev
```

## 🎯 Cách sử dụng

### Mở Chatbot

- **Chỉ hiển thị trên trang chủ**: Chatbot bubble chỉ xuất hiện trên homepage
- **Bubble thông báo**: "👋 Cần tư vấn PC? Hỏi AI Assistant ngay!"
- **Nút chat gradient**: Màu xanh-tím với hiệu ứng hover đẹp mắt
- **Online indicator**: Chấm xanh báo trạng thái online

### Đặt câu hỏi

Một số ví dụ câu hỏi bạn có thể hỏi:

**Tư vấn linh kiện:**

- "CPU nào tốt nhất cho gaming trong tầm giá 10 triệu?"
- "So sánh RTX 4060 và RTX 4070"
- "RAM 16GB hay 32GB cho content creation?"

**Tư vấn build PC:**

- "Tư vấn build PC gaming 25 triệu"
- "Cấu hình PC văn phòng tiết kiệm"
- "Build PC streaming game và edit video"

**Giải thích thông số:**

- "TDP là gì?"
- "PCIe 4.0 khác gì PCIe 3.0?"
- "DDR4 và DDR5 khác nhau như thế nào?"

## 🔧 Cấu trúc Code

### Files đã thêm:

- `src/services/geminiService.ts` - Service tích hợp Gemini AI
- `src/components/ChatBot.tsx` - Component giao diện chat
- `src/components/ChatButton.tsx` - Nút floating để mở chat
- `env.example` - Template cho environment variables

### Tích hợp:

- ChatButton đã được thêm vào `src/pages/pcbuilder/index.tsx`
- Sử dụng React hooks để quản lý state
- Tailwind CSS cho styling phù hợp với theme EzBuild

## 🛠️ Tùy chỉnh

### Thay đổi model AI

Trong `src/services/geminiService.ts`:

```typescript
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash", // Thay đổi model ở đây
});
```

### Tùy chỉnh system prompt

Trong `src/services/geminiService.ts`, tìm `systemPrompt`:

```typescript
const systemPrompt = `Bạn là một trợ lý AI chuyên về PC Builder...`;
```

### Thay đổi giao diện

- Màu sắc: Trong `ChatBot.tsx` và `ChatButton.tsx`
- Kích thước: Thay đổi `w-96 h-[600px]` trong `ChatBot.tsx`
- Vị trí: Thay đổi `bottom-6 right-6` trong `ChatButton.tsx`

## 🚨 Lưu ý bảo mật

- **KHÔNG** commit file `.env` vào Git
- Giữ API Key bí mật
- Sử dụng rate limiting trong production
- Cân nhắc thêm authentication nếu cần

## 🐛 Xử lý lỗi

- **"Không thể kết nối với AI"**: Kiểm tra API Key và kết nối internet
- **"API Key không hợp lệ"**: Tạo lại API Key từ Google AI Studio
- **Chat không hiển thị**: Kiểm tra console log và đảm bảo dependencies đã cài đặt

## 📞 Hỗ trợ

Nếu gặp vấn đề, hãy kiểm tra:

1. API Key có đúng không
2. Dependencies đã cài đặt đầy đủ
3. Environment variables đã được set
4. Console log để xem lỗi chi tiết
