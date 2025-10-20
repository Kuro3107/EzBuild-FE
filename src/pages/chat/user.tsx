import { useEffect, useRef, useState } from 'react'
import { chatService } from '../../services/chat'
import type { ChatMessage } from '../../services/chat'
import { ApiService } from '../../services/api'

function UserChatPage() {
  const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8080'
  const currentUser = ApiService.getCurrentUser() as Record<string, unknown>
  const userId = Number(currentUser?.id || currentUser?.userId || 0)
  const [staffId] = useState<number>(0) // optional: nếu chưa có staff cụ thể
  const [conversationId] = useState<number>(userId || 0) // đơn giản: dùng userId làm conversationId
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // load history (an toàn với lỗi 500/không phải array)
    const url = `${apiBase.replace(/^:\/\//, 'http://').replace(/^(?!https?:)/, 'http://')}/api/chat/history/${conversationId}`
    fetch(url)
      .then(async (r) => {
        if (!r.ok) return [] as ChatMessage[]
        try { return (await r.json()) as unknown } catch { return [] as ChatMessage[] }
      })
      .then((data: unknown) => {
        setMessages(Array.isArray(data) ? (data as ChatMessage[]) : [])
      })
      .catch(() => setMessages([]))
  }, [apiBase, conversationId])

  useEffect(() => {
    chatService.connect(apiBase, conversationId, (msg) => {
      setMessages(prev => [...prev, msg])
    })
    return () => chatService.disconnect()
  }, [apiBase, conversationId])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages])

  const send = () => {
    if (!input.trim()) return
    chatService.send(conversationId, {
      senderId: userId,
      receiverId: staffId,
      content: input.trim(),
      senderRole: 'USER',
    })
    setInput('')
  }

  return (
    <div className="page bg-grid-dark">
      <div className="layout">
        <main className="main" style={{ maxWidth: '960px', margin: '0 auto' }}>
          <h1 className="text-2xl font-bold mb-4">Chat với Staff</h1>
          <div ref={listRef} className="bg-white/10 border border-white/20 rounded-lg p-4 h-[60vh] overflow-y-auto">
            {(Array.isArray(messages) ? messages : []).map((m, i) => (
              <div key={i} className={`mb-2 flex ${m.senderRole === 'USER' ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-3 py-2 rounded-lg text-sm ${m.senderRole === 'USER' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'}`}>
                  {m.content}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' ? send() : undefined} className="flex-1 px-3 py-2 rounded border border-white/20 bg-white/80 text-gray-900" placeholder="Nhập tin nhắn..." />
            <button onClick={send} className="px-4 py-2 rounded bg-blue-600 text-white">Gửi</button>
          </div>
        </main>
      </div>
    </div>
  )
}

export default UserChatPage


