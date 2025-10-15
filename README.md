# EzBuild - PC Builder với AI Assistant

Ứng dụng web PC Builder được xây dựng với React, TypeScript, Vite và tích hợp AI Assistant sử dụng Google Gemini API.

## Tính năng chính

- 🖥️ **PC Builder**: Tư vấn và build cấu hình PC phù hợp
- 🤖 **AI Assistant**: Chatbox AI sử dụng Google Gemini để tư vấn linh kiện PC
- 👥 **Quản lý người dùng**: Hệ thống đăng nhập, phân quyền (Customer/Staff/Admin)
- 🛒 **Quản lý sản phẩm**: Danh mục linh kiện PC đầy đủ
- 📊 **So sánh sản phẩm**: Tính năng so sánh linh kiện
- 💬 **Chat AI**: Tư vấn real-time với AI Assistant

## Công nghệ sử dụng

- **Frontend**: React 19, TypeScript, Vite
- **UI Framework**: Tailwind CSS, Ant Design
- **AI Service**: Google Gemini API
- **State Management**: React Hooks
- **Routing**: React Router DOM

## Cài đặt và chạy ứng dụng

### 1. Clone repository
```bash
git clone <repository-url>
cd EzBuild-FE
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Cấu hình Gemini AI API
- Tạo file `.env` từ `.env.example`
- Lấy API key từ [Google AI Studio](https://aistudio.google.com/app/apikey)
- Cập nhật `VITE_GOOGLE_API_KEY` trong file `.env`

### 4. Chạy ứng dụng
```bash
npm run dev
```

## Sử dụng AI Chatbox

### Tính năng AI Assistant
- **Vị trí**: Chat bubble ở góc phải màn hình
- **Chức năng**: Tư vấn về linh kiện PC, build cấu hình, so sánh sản phẩm
- **Hoạt động**: 
  - Online: Sử dụng Gemini API khi có API key
  - Offline: Sử dụng câu trả lời mẫu khi không có API key

### Các chủ đề AI có thể tư vấn
- CPU (Intel, AMD)
- GPU (NVIDIA, AMD)
- RAM (DDR4, DDR5)
- Mainboard
- Storage (SSD, HDD)
- PSU (Power Supply)
- Case, Cooling
- Build PC cho gaming, văn phòng, content creation

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
