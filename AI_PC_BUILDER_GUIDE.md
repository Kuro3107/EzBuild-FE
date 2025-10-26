# 🤖 AI PC Builder Assistant - Hướng Dẫn Sử Dụng

## 📋 Tổng Quan

AI Assistant của EzBuild là một chatbot chuyên về **PC Builder và linh kiện máy tính**, được tích hợp với **Google Gemini AI** để cung cấp tư vấn chuyên nghiệp và chính xác.

## ✨ Tính Năng Chính

### 1. **Tư Vấn Linh Kiện PC**

- ✅ CPU (Intel, AMD): Core i3/i5/i7/i9, Ryzen 3/5/7/9
- ✅ GPU (NVIDIA, AMD): RTX series, GTX series, RX series
- ✅ RAM: DDR4, DDR5, speeds, capacities
- ✅ Mainboard: Chipset, socket, form factor
- ✅ Storage: SSD SATA, NVMe, HDD
- ✅ PSU: Wattage, efficiency ratings
- ✅ Case: Form factors, airflow
- ✅ Cooling: Air coolers, AIO, custom loops

### 2. **Tư Vấn Build PC**

- 🎮 Gaming PC (entry, mid-range, high-end, enthusiast)
- 💻 Workstation (video editing, 3D rendering, CAD)
- 🎨 Content Creation (streaming, video editing, graphics design)
- 📊 Office/Productivity (light usage, multi-tasking)
- 💰 Budget builds và value picks

### 3. **So Sánh & Compatibility**

- So sánh hiệu năng giữa các linh kiện
- Kiểm tra tương thích (CPU-socket, RAM-speed, PSU-wattage)
- Bottleneck analysis
- Price-to-performance ratios

### 4. **Giải Thích Thông Số Kỹ Thuật**

- Clock speed, cores, threads, TDP, VRAM
- Tên mã (codename), architecture
- Overclocking capabilities

## 🚀 Cài Đặt

### Bước 1: Lấy Google Gemini API Key

1. Truy cập: https://aistudio.google.com/app/apikey
2. Đăng nhập bằng tài khoản Google
3. Click **"Create API Key"**
4. Copy API key (có dạng: `AIzaSy...`)

### Bước 2: Tạo File `.env`

Tạo file `.env` trong thư mục gốc của project:

```env
VITE_GOOGLE_API_KEY=your_actual_api_key_here
```

**Lưu ý:** Thay `your_actual_api_key_here` bằng API key thực tế của bạn.

### Bước 3: Restart Dev Server

```bash
# Dừng server hiện tại (Ctrl+C)
# Khởi động lại
npm run dev
```

## 💬 Cách Sử Dụng

### 1. **Mở Chat Bubble**

- Click vào **chat bubble** ở góc phải màn hình
- Icon màu tím có dấu chấm xanh (online indicator)

### 2. **Chat với AI**

- Nhập câu hỏi vào ô input
- Press **Enter** hoặc click nút gửi
- AI sẽ trả lời trong giây lát

### 3. **Ví Dụ Câu Hỏi**

#### ✅ **Câu hỏi về Linh Kiện:**

```
- CPU nào mạnh nhất hiện tại?
- So sánh RTX 4090 vs RTX 4080
- RAM DDR5 có cần thiết không?
- PSU 750W đủ cho RTX 4070 không?
```

#### ✅ **Câu hỏi Build PC:**

```
- Tư vấn build PC gaming 20 triệu
- PC nào tốt cho video editing?
- Build PC văn phòng tầm 10 triệu
- PC streaming 1440p giá bao nhiêu?
```

#### ✅ **Câu hỏi Compatibility:**

```
- CPU Intel có dùng mainboard AMD được không?
- RAM DDR5 có tương thích mainboard DDR4?
- PSU nào đủ cho RTX 3090?
- Case này có đủ chỗ cho GPU 3.5 slot không?
```

#### ✅ **Câu hỏi Kỹ Thuật:**

```
- Clock speed là gì?
- Cores và threads khác nhau thế nào?
- TDP 95W có cao không?
- Overclock CPU có làm hỏng không?
```

## 🔧 Troubleshooting

### ❌ **AI không trả lời / trả lời mặc định**

**Nguyên nhân:** API key chưa được cấu hình hoặc không hợp lệ.

**Giải pháp:**

1. Kiểm tra file `.env` có tồn tại và có API key đúng không
2. Đảm bảo API key không có dấu ngoặc kép thừa
3. Restart dev server sau khi sửa `.env`
4. Kiểm tra Console trong Developer Tools (F12) để xem lỗi chi tiết

### ❌ **Lỗi "Rate limit exceeded"**

**Nguyên nhân:** Vượt quá giới hạn API của Google.

**Giải pháp:**

- Chờ một chút và thử lại
- Kiểm tra quota trong Google Cloud Console
- Nâng cấp gói API nếu cần

### ❌ **AI trả lời về chủ đề khác ngoài PC**

**Giải pháp:**

- AI được thiết kế chuyên về PC. Nếu câu hỏi không liên quan đến PC, AI sẽ nhắc nhở một cách lịch sự.
- Hãy đặt câu hỏi cụ thể về linh kiện PC, build PC, hoặc so sánh.

## 🎯 Best Practices

### ✅ **Đặt câu hỏi hiệu quả:**

- Câu hỏi cụ thể, có context (budget, use case, etc.)
- Ví dụ: "Tư vấn build PC gaming 20 triệu" thay vì "PC nào tốt?"

### ✅ **Sử dụng từ khóa:**

- CPU, GPU, RAM, Mainboard, Storage, PSU, Case, Cooling
- Intel, AMD, NVIDIA, Ryzen, Core i, RTX, GTX
- Gaming, Workstation, Content Creation, Office

### ✅ **Kiểm tra Console:**

- Mở Developer Tools (F12) → Console tab
- Xem debug logs để hiểu AI đang xử lý như thế nào

## 📊 System Architecture

```
┌─────────────────────────────────────────┐
│         User Interface (UI)             │
│  ┌──────────────────────────────────┐   │
│  │      AIChatBubble Component      │   │
│  │  - Bubble UI                     │   │
│  │  - Chat Window                   │   │
│  │  - Message List                  │   │
│  └──────────────┬───────────────────┘   │
└────────────────┼──────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│      Service Layer (Business Logic)     │
│  ┌──────────────────────────────────┐   │
│  │     geminiService.ts             │   │
│  │  - sendMessage()                 │   │
│  │  - PC keyword detection          │   │
│  │  - Offline fallback              │   │
│  └──────────────┬───────────────────┘   │
└────────────────┼──────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│      AI Integration Layer               │
│  ┌──────────────────────────────────┐   │
│  │     Google Gemini AI             │   │
│  │  - gemini-pro model              │   │
│  │  - Chat history management       │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## 🔐 Security

- ✅ API key được lưu trong `.env` và không commit lên Git
- ✅ `.env` file đã được thêm vào `.gitignore`
- ✅ Không hardcode API key trong code
- ✅ Fallback offline khi API key không hợp lệ

## 📈 Roadmap

### ✅ **Hoàn thành:**

- [x] Tích hợp Google Gemini AI
- [x] UI Chat Bubble
- [x] PC keyword detection
- [x] Offline fallback
- [x] Error handling
- [x] Chat history management

### 🔜 **Trong tương lai:**

- [ ] Lưu chat history vào database
- [ ] Support multi-language
- [ ] File upload (images for PC specs)
- [ ] Rich message (cards, buttons)
- [ ] Analytics & insights
- [ ] Voice input/output

## 📝 License

MIT License - EzBuild Project

## 🤝 Support

Nếu gặp vấn đề, vui lòng tạo issue trên GitHub hoặc liên hệ dev team.

---

**Happy Building! 🚀**
