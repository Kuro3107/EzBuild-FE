import { useEffect, useRef, useState } from 'react'
import { chatService } from '../../services/chat'
import type { ChatMessage } from '../../services/chat'
import { ApiService } from '../../services/api'

function StaffChatPage() {
  const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8080'
  const currentUser = ApiService.getCurrentUser() as Record<string, unknown>
  const staffId = Number(currentUser?.id || currentUser?.userId || 0)
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  // simple: chọn conversation bằng cách nhập ID
  const [selectIdInput, setSelectIdInput] = useState('')

  useEffect(() => {
    if (!activeConversationId) return
    fetch(`${apiBase}/api/chat/history/${activeConversationId}`)
      .then(r => r.json())
      .then((data: ChatMessage[]) => setMessages(data || []))
      .catch(() => {})
  }, [apiBase, activeConversationId])

  useEffect(() => {
    if (!activeConversationId) return
    chatService.connect(apiBase, activeConversationId, (msg) => {
      setMessages(prev => [...prev, msg])
    })
    return () => chatService.disconnect()
  }, [apiBase, activeConversationId])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages])

  const send = () => {
    if (!input.trim() || !activeConversationId) return
    chatService.send(activeConversationId, {
      senderId: staffId,
      receiverId: 0,
      content: input.trim(),
      senderRole: 'STAFF',
    })
    setInput('')
  }

  return (
    <div className="page bg-grid-dark">
      <div className="layout">
        <main className="main" style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h1 className="text-2xl font-bold mb-4">Staff Chat</h1>
          <div className="mb-4 flex gap-2 items-center">
            <input value={selectIdInput} onChange={(e) => setSelectIdInput(e.target.value)} placeholder="Nhập Conversation ID (userId)" className="px-3 py-2 rounded border border-white/20 bg-white/80 text-gray-900" />
            <button onClick={() => setActiveConversationId(Number(selectIdInput) || null)} className="px-3 py-2 rounded bg-purple-600 text-white">Mở cuộc chat</button>
          </div>

          {activeConversationId ? (
            <>
              <div className="text-sm text-white/70 mb-2">Đang chat với Conversation #{activeConversationId}</div>
              <div ref={listRef} className="bg-white/10 border border-white/20 rounded-lg p-4 h-[60vh] overflow-y-auto">
                {messages.map((m, i) => (
                  <div key={i} className={`mb-2 flex ${m.senderRole === 'STAFF' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`px-3 py-2 rounded-lg text-sm ${m.senderRole === 'STAFF' ? 'bg-green-600 text-white' : 'bg-gray-700 text-white'}`}>
                      {m.content}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' ? send() : undefined} className="flex-1 px-3 py-2 rounded border border-white/20 bg-white/80 text-gray-900" placeholder="Nhập tin nhắn..." />
                <button onClick={send} className="px-4 py-2 rounded bg-green-600 text-white">Gửi</button>
              </div>
            </>
          ) : (
            <div className="text-white/80">Hãy nhập Conversation ID để bắt đầu</div>
          )}
        </main>
      </div>
    </div>
  )
}

export default StaffChatPage


