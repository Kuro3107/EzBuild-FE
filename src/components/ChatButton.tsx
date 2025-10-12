import React, { useState } from 'react';
import ChatBot from './ChatBot';

const ChatButton: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      {/* Floating Chat Button with Bubble Design - Below Sign In, Fixed Position */}
      <div 
        className="fixed top-16 right-6 z-50"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '12px 20px',
          width: 'auto'
        }}
      >
        {/* Chat Bubble */}
        <div className="relative mb-3">
          <div 
            className="rounded-2xl shadow-lg p-4 max-w-xs"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <p className="text-gray-800 text-sm font-medium">👋 Cần tư vấn PC?</p>
            <p className="text-gray-600 text-xs mt-1">Hỏi AI Assistant ngay!</p>
          </div>
          {/* Arrow pointing to button */}
          <div 
            className="absolute -bottom-1 right-4 w-3 h-3 transform rotate-45 border-r border-b"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderColor: 'rgba(255, 255, 255, 0.2)'
            }}
          ></div>
        </div>
        
        {/* Chat Button */}
        <button
          onClick={() => setIsChatOpen(true)}
          className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center group relative overflow-hidden"
          title="Chat với AI Assistant"
        >
          {/* Ripple effect */}
          <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
          
          {/* Chat icon */}
          <svg 
            className="w-7 h-7 group-hover:scale-110 transition-transform relative z-10" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
            />
          </svg>
          
          {/* Online indicator */}
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white">
            <div className="w-full h-full bg-green-400 rounded-full animate-ping"></div>
          </div>
        </button>
      </div>

      {/* Chat Bot Component */}
      <ChatBot 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
    </>
  );
};

export default ChatButton;
