import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiService } from '../../services/api'

interface OrderDTO {
  id?: number
  status?: string
  totalPrice?: number
  total_price?: number
  paymentMethod?: string
  payment_method?: string
  address?: string
  phone?: string | number
  createdAt?: string
  created_at?: string
  build?: { id?: number, name?: string }
  user?: { id?: number }
}

interface OrderFeedbackEntry {
  id: number
  orderId: number
  rating: number
  comment: string
  createdAt: string
  userId?: number
}

function CustomerOrdersPage() {
  const currentUser = ApiService.getCurrentUser()
  const [orders, setOrders] = useState<OrderDTO[]>([])
  const [selected, setSelected] = useState<OrderDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orderFeedbacks, setOrderFeedbacks] = useState<OrderFeedbackEntry[]>([])
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)
  const [feedbackRating, setFeedbackRating] = useState(5)
  const [feedbackComment, setFeedbackComment] = useState('')
  const [feedbackEditingId, setFeedbackEditingId] = useState<number | null>(null)
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)

  const userNumericId = Number(currentUser?.id || currentUser?.userId || 0)

  const renderRatingStars = (value: number) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill={star <= value ? '#facc15' : 'none'}
          stroke="#facc15"
          strokeWidth={1.5}
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </div>
  )

  const loadFeedbacks = async (uid: number) => {
    try {
      const data = await ApiService.getAllOrderFeedbacks()
      const normalized: OrderFeedbackEntry[] = (data as Record<string, unknown>[]).map((f) => {
        const comment =
          (f.comment as string) ??
          (f.comment_text as string) ??
          (f.commentText as string) ??
          ''
        const createdAt =
          (f.createdAt as string) ??
          (f.created_at as string) ??
          new Date().toISOString()
        const orderId =
          Number(
            f.orderId ??
            f.order_id ??
            (typeof f.order === 'object' && f.order ? (f.order as { id?: unknown }).id : undefined)
          ) || 0
        const userId =
          Number(
            (typeof f.user === 'object' && f.user ? (f.user as { id?: unknown }).id : undefined) ??
            f.userId ??
            f.user_id
          ) || undefined
        return {
          id: Number(f.id) || 0,
          orderId,
          rating: Number(f.rating) || 0,
          comment: String(comment),
          createdAt: String(createdAt),
          userId
        }
      })
      const filtered = uid > 0 ? normalized.filter((f) => f.userId === uid || !f.userId) : normalized
      setOrderFeedbacks(filtered)
    } catch (err) {
      console.error('Không thể tải feedback:', err)
    }
  }

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        setError(null)
        if (!currentUser?.id && !currentUser?.userId) {
          setError('Bạn cần đăng nhập để xem đơn hàng')
          setLoading(false)
          return
        }
        const uid = String(currentUser.id || currentUser.userId)
        const data = await ApiService.getOrdersByUser(uid)
        setOrders(data as unknown as OrderDTO[])
        setSelected((data as unknown as OrderDTO[])[0] || null)
        if (userNumericId > 0) {
          await loadFeedbacks(userNumericId)
        }
      } catch {
        setError('Không thể tải danh sách đơn hàng')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [currentUser?.id, currentUser?.userId, userNumericId])

  const totalOrders = useMemo(() => orders.length, [orders])
  const feedbackForSelected = useMemo(() => {
    if (!selected) return undefined
    return orderFeedbacks.find((feedback) => feedback.orderId === selected.id)
  }, [selected, orderFeedbacks])

  return (
    <div className="page bg-grid-dark">
      <div className="layout">
        <aside className="sidebar profile-sidebar">
          <div className="px-6 py-8 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold">
                {(currentUser?.fullname as string || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-white text-lg">Orders</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">{totalOrders} orders</div>
              </div>
            </div>
          </div>
          <nav className="flex-1 py-6">
            <div className="px-6 mb-4">
              <Link className="nav-item" to="/profile">Profile</Link>
              <Link className="nav-item" to="/builds">My Builds</Link>
              <Link className="nav-item-active" to="/orders">Orders</Link>
              <Link className="nav-item" to="/pcbuilder">PC Builder</Link>
            </div>
          </nav>
        </aside>

        <main className="main">
          <div className="w-full px-6 md:px-8 lg:px-10 pt-2">

            {/* Layout: left list, right detail */}
            {loading ? (
              <div className="text-gray-300">Đang tải...</div>
            ) : error ? (
              <div className="text-red-400">{error}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: list */}
                <div className="space-y-3">
                  {orders.map((o) => {
                    const isActive = selected?.id === o.id
                    const created = o.createdAt || (o as any).created_at
                    const total = typeof o.totalPrice === 'number' ? o.totalPrice : Number((o as any).total_price || 0)
                    return (
                      <button
                        key={o.id}
                        onClick={() => setSelected(o)}
                        className={`w-full text-left rounded-xl border ${isActive ? 'border-blue-500 bg-white/10' : 'border-white/20 bg-white/5'} px-4 py-3 hover:bg-white/10 transition`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-white font-semibold">Order #{o.id}</div>
                          <div className="text-blue-400 font-bold">{total.toLocaleString('vi-VN')} VND</div>
                        </div>
                        <div className="text-xs text-gray-400">{created ? new Date(created as string).toLocaleString() : '-'}</div>
                        <div className="text-xs mt-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            o.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-300' :
                            o.status === 'DEPOSITED' ? 'bg-blue-500/20 text-blue-300' :
                            o.status === 'SHIPPING' ? 'bg-purple-500/20 text-purple-300' :
                            o.status === 'PAID' ? 'bg-green-500/20 text-green-300' :
                            o.status === 'DONE' ? 'bg-emerald-500/20 text-emerald-300' :
                            o.status === 'CANCEL' ? 'bg-red-500/20 text-red-300' :
                            'bg-white/10 text-white'
                          }`}>
                            {o.status === 'PENDING' ? '⏳ Chờ thanh toán' :
                             o.status === 'DEPOSITED' ? '💰 Đã cọc' :
                             o.status === 'SHIPPING' ? '🚚 Đang giao' :
                             o.status === 'PAID' ? '✅ Đã thanh toán' :
                             o.status === 'DONE' ? '🎉 Hoàn thành' :
                             o.status === 'CANCEL' ? '❌ Đã hủy' :
                             o.status}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                  {orders.length === 0 && (
                    <div className="text-gray-400">Chưa có đơn hàng nào.</div>
                  )}
                </div>

                {/* Right: detail */}
                <div className="rounded-2xl border border-white/20 bg-white/5 p-6">
                  {!selected ? (
                    <div className="text-gray-400">Chọn một đơn hàng để xem chi tiết</div>
                  ) : (
                    <div className="space-y-3 text-white">
                      <div className="text-xl font-bold">Order #{selected.id}</div>
                      <div className="text-gray-300">Trạng thái: 
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                          selected.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-300' :
                          selected.status === 'DEPOSITED' ? 'bg-blue-500/20 text-blue-300' :
                          selected.status === 'SHIPPING' ? 'bg-purple-500/20 text-purple-300' :
                          selected.status === 'PAID' ? 'bg-green-500/20 text-green-300' :
                          selected.status === 'DONE' ? 'bg-emerald-500/20 text-emerald-300' :
                          selected.status === 'CANCEL' ? 'bg-red-500/20 text-red-300' :
                          'bg-white/10 text-white'
                        }`}>
                          {selected.status === 'PENDING' ? '⏳ Chờ thanh toán' :
                           selected.status === 'DEPOSITED' ? '💰 Đã cọc' :
                           selected.status === 'SHIPPING' ? '🚚 Đang giao' :
                           selected.status === 'PAID' ? '✅ Đã thanh toán' :
                           selected.status === 'DONE' ? '🎉 Hoàn thành' :
                           selected.status === 'CANCEL' ? '❌ Đã hủy' :
                           selected.status}
                        </span>
                      </div>
                      <div className="text-gray-300">Tổng tiền: <span className="text-blue-400 font-bold">{(typeof selected.totalPrice === 'number' ? selected.totalPrice : Number((selected as any).total_price || 0)).toLocaleString('vi-VN')} VND</span></div>
                      <div className="text-gray-300">Phương thức thanh toán: <span className="text-white">{selected.paymentMethod || (selected as any).payment_method || '-'}</span></div>
                      <div className="text-gray-300">SĐT: <span className="text-white">{String(selected.phone || '')}</span></div>
                      <div className="text-gray-300">Địa chỉ: <span className="text-white">{selected.address || '-'}</span></div>
                      <div className="text-gray-300">Thời gian: <span className="text-white">{(selected.createdAt || (selected as any).created_at) ? new Date((selected.createdAt || (selected as any).created_at) as string).toLocaleString() : '-'}</span></div>
                      
                      {/* Thông tin thanh toán */}
                      {selected.status === 'PENDING' && (
                        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                          <div className="text-yellow-300 text-sm font-medium mb-2">💳 Cần thanh toán cọc 25%</div>
                          <div className="text-yellow-200 text-xs">
                            Để đơn hàng được xử lý, vui lòng thanh toán cọc 25% trước.
                          </div>
                          <Link 
                            to={`/payment?orderId=${selected.id}&amount=${(typeof selected.totalPrice === 'number' ? selected.totalPrice : Number((selected as any).total_price || 0))}`}
                            className="inline-block mt-2 px-3 py-1 bg-yellow-500 text-black text-xs font-medium rounded hover:bg-yellow-400 transition-colors"
                          >
                            Thanh toán ngay
                          </Link>
                        </div>
                      )}
                      
                      {selected.status === 'DEPOSITED' && (
                        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <div className="text-blue-300 text-sm font-medium mb-2">✅ Đã thanh toán cọc 25%</div>
                          <div className="text-blue-200 text-xs">
                            Đơn hàng đã được xác nhận. Staff đang chuẩn bị hàng.
                          </div>
                        </div>
                      )}
                      
                      {selected.status === 'SHIPPING' && (
                        <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                          <div className="text-purple-300 text-sm font-medium mb-2">🚚 Đang giao hàng</div>
                          <div className="text-purple-200 text-xs">
                            Đơn hàng đang được vận chuyển đến bạn.
                          </div>
                        </div>
                      )}
                      
                      {selected.status === 'PAID' && (
                        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                          <div className="text-green-300 text-sm font-medium mb-2">✅ Đã thanh toán đầy đủ</div>
                          <div className="text-green-200 text-xs">
                            Đơn hàng đã được thanh toán hoàn toàn.
                          </div>
                        </div>
                      )}

                      {(selected.status === 'PAID' || selected.status === 'DONE') && (
                        <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-200 font-semibold">Phản hồi của bạn</p>
                              <p className="text-xs text-gray-400">
                                Chia sẻ trải nghiệm sau khi đã thanh toán đầy đủ để EzBuild phục vụ tốt hơn.
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                setFeedbackEditingId(feedbackForSelected?.id ?? null)
                                setFeedbackRating(feedbackForSelected?.rating ?? 5)
                                setFeedbackComment(feedbackForSelected?.comment ?? '')
                                setIsFeedbackModalOpen(true)
                              }}
                              className="px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg text-xs font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg"
                            >
                              {feedbackForSelected ? 'Cập nhật đánh giá' : 'Đánh giá đơn hàng'}
                            </button>
                          </div>
                          {feedbackForSelected ? (
                            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-gray-200 space-y-2">
                              <div className="flex items-center gap-2">
                                {renderRatingStars(feedbackForSelected.rating)}
                                <span className="text-xs text-gray-400">
                                  Đánh giá: {feedbackForSelected.rating}/5
                                </span>
                              </div>
                              <p className="text-gray-200">{feedbackForSelected.comment || 'Không có nhận xét.'}</p>
                              <p className="text-xs text-gray-500">
                                Gửi ngày {new Date(feedbackForSelected.createdAt).toLocaleString('vi-VN')}
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-300">
                              Chưa có phản hồi cho đơn hàng này. Hãy cho EzBuild biết trải nghiệm của bạn nhé!
                            </p>
                          )}
                        </div>
                      )}
                      
                      <div className="pt-2">
                        <Link className="text-blue-400 underline" to="/builds">Xem Build đã lưu</Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {isFeedbackModalOpen && selected && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20000,
            padding: '20px'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '520px',
              backgroundColor: '#111827',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 20px 60px rgba(15,23,42,0.35)',
              padding: '24px'
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white">Phản hồi về Order #{selected.id}</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Đánh giá của bạn giúp EzBuild cải thiện dịch vụ tốt hơn.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsFeedbackModalOpen(false)
                  setFeedbackEditingId(null)
                  setFeedbackComment('')
                  setFeedbackRating(5)
                }}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-200 mb-2">Đánh giá tổng thể</p>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      onClick={() => setFeedbackRating(value)}
                      className="focus:outline-none transition-transform"
                      style={{ transform: value === feedbackRating ? 'scale(1.1)' : 'scale(1)' }}
                    >
                      <svg
                        className="w-8 h-8"
                        viewBox="0 0 24 24"
                        fill={value <= feedbackRating ? '#facc15' : 'none'}
                        stroke="#facc15"
                        strokeWidth={1.5}
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-200 mb-2">Nhận xét của bạn</p>
                <textarea
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Hãy chia sẻ trải nghiệm giao hàng, chất lượng sản phẩm, thái độ nhân viên..."
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsFeedbackModalOpen(false)
                  setFeedbackEditingId(null)
                  setFeedbackComment('')
                  setFeedbackRating(5)
                }}
                className="px-4 py-2 border border-white/20 text-sm text-gray-300 rounded-lg hover:bg-white/10 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={async () => {
                  if (!selected?.id) return
                  try {
                    setIsSubmittingFeedback(true)
                    if (feedbackEditingId) {
                      await ApiService.updateOrderFeedback(feedbackEditingId, {
                        rating: feedbackRating,
                        comment: feedbackComment
                      })
                    } else {
                      await ApiService.createOrderFeedback({
                        orderId: Number(selected.id),
                        rating: feedbackRating,
                        comment: feedbackComment,
                        userId: userNumericId || undefined
                      })
                    }
                    await loadFeedbacks(userNumericId)
                    setIsFeedbackModalOpen(false)
                    setFeedbackEditingId(null)
                    setFeedbackComment('')
                    setFeedbackRating(5)
                    alert('Cảm ơn bạn đã gửi phản hồi!')
                  } catch (err) {
                    console.error('Feedback error:', err)
                    alert('Không thể gửi feedback. Vui lòng thử lại sau.')
                  } finally {
                    setIsSubmittingFeedback(false)
                  }
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg text-sm font-semibold hover:from-blue-600 hover:to-cyan-600 transition-colors shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isSubmittingFeedback}
              >
                {isSubmittingFeedback ? 'Đang gửi...' : feedbackEditingId ? 'Cập nhật' : 'Gửi phản hồi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerOrdersPage


