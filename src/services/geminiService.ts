import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Lấy API key từ environment variables
const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 4096,
  responseMimeType: "text/plain",
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
];

export interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

export interface ChatHistory {
  role: 'model' | 'user';
  parts: Array<{ text: string }>;
}

// Database câu trả lời offline
const offlineResponses = {
  greeting: ['Xin chào! Tôi là AI Assistant của EzBuild. Tôi có thể tư vấn về linh kiện PC.', 'Chào bạn! Bạn cần tư vấn về PC Builder gì?'],
  cpu: ['CPU là bộ xử lý trung tâm. Intel Core i5/i7 hoặc AMD Ryzen 5/7 là lựa chọn tốt cho gaming.', 'CPU quyết định hiệu năng tổng thể. Chọn theo ngân sách và nhu cầu sử dụng.'],
  gpu: ['GPU (Card đồ họa) quan trọng cho gaming. RTX 4060/4070 hoặc RX 7600/7700 XT là lựa chọn tốt.', 'Card đồ họa quyết định FPS trong game. Chọn theo độ phân giải màn hình.'],
  ram: ['RAM 16GB đủ cho gaming, 32GB cho content creation. DDR4 hoặc DDR5 tùy mainboard.', 'Bộ nhớ RAM ảnh hưởng đến multitasking. Tần số cao giúp hiệu năng tốt hơn.'],
  build: ['Build PC gaming cần: CPU tốt + GPU mạnh + RAM đủ + SSD nhanh + PSU ổn định.', 'Cân bằng ngân sách: CPU 30%, GPU 40%, còn lại cho các linh kiện khác.'],
  default: ['Tôi có thể tư vấn về CPU, GPU, RAM, Mainboard, Storage, PSU, Case, Cooling. Bạn muốn biết về linh kiện nào?', 'Hãy hỏi tôi về build PC, so sánh linh kiện, hoặc tư vấn cấu hình nhé!']
};

// Tìm câu trả lời offline
const getOfflineResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('chào') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return offlineResponses.greeting[Math.floor(Math.random() * offlineResponses.greeting.length)];
  }
  
  if (lowerMessage.includes('cpu') || lowerMessage.includes('processor')) {
    return offlineResponses.cpu[Math.floor(Math.random() * offlineResponses.cpu.length)];
  }
  
  if (lowerMessage.includes('gpu') || lowerMessage.includes('vga') || lowerMessage.includes('card')) {
    return offlineResponses.gpu[Math.floor(Math.random() * offlineResponses.gpu.length)];
  }
  
  if (lowerMessage.includes('ram') || lowerMessage.includes('bộ nhớ')) {
    return offlineResponses.ram[Math.floor(Math.random() * offlineResponses.ram.length)];
  }
  
  if (lowerMessage.includes('build') || lowerMessage.includes('cấu hình')) {
    return offlineResponses.build[Math.floor(Math.random() * offlineResponses.build.length)];
  }
  
  return offlineResponses.default[Math.floor(Math.random() * offlineResponses.default.length)];
};

export const sendMessage = async (
  message: string, 
  chatHistory: ChatMessage[] = []
): Promise<string> => {
  // Kiểm tra API key
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.log('API key chưa được cấu hình, sử dụng offline mode');
    // Giả lập delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    return getOfflineResponse(message);
  }

  try {
    // Chuyển đổi chat history sang format của Gemini
    const history: ChatHistory[] = chatHistory.map((item) => ({
      role: item.isBot ? 'model' : 'user',
      parts: [{ text: item.text }]
    }));

    // Thêm context về PC Builder cho Gemini
    const systemPrompt = `Bạn là một trợ lý AI chuyên về PC Builder và linh kiện máy tính. 
    Hãy trả lời các câu hỏi về:
    - Tư vấn linh kiện PC (CPU, GPU, RAM, Mainboard, Storage, PSU, Case, Cooling)
    - So sánh hiệu năng giữa các linh kiện
    - Tư vấn build PC cho các mục đích khác nhau (gaming, văn phòng, content creation)
    - Giải thích thông số kỹ thuật
    - Tư vấn tương thích giữa các linh kiện
    
    Hãy trả lời ngắn gọn, chính xác và hữu ích bằng tiếng Việt.`;

    const chatSession = model.startChat({
      generationConfig,
      safetySettings,
      history: history,
      systemInstruction: systemPrompt,
    });

    const result = await chatSession.sendMessage(message);
    return result.response.text();
  } catch (error) {
    console.error('Lỗi khi gọi Gemini API:', error);
    // Fallback về offline mode
    console.log('Chuyển sang offline mode do lỗi API');
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    return getOfflineResponse(message);
  }
};

export default sendMessage;
