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

  // Lấy userId từ nhiều nguồn để đảm bảo lấy được
  const getUserNumericId = (): number => {
    if (!currentUser) {
      console.warn('No current user found')
      return 0
    }
    
    // Thử nhiều cách để lấy userId từ currentUser
    let userId = 0
    
    // Ưu tiên 1: id (number)
    if (currentUser.id) {
      userId = Number(currentUser.id)
      if (userId > 0) {
        console.log('Got userId from currentUser.id:', userId)
        return userId
      }
    }
    
    // Ưu tiên 2: userId (number)
    if (currentUser.userId) {
      userId = Number(currentUser.userId)
      if (userId > 0) {
        console.log('Got userId from currentUser.userId:', userId)
        return userId
      }
    }
    
    // Ưu tiên 3: user_id (snake_case)
    if (currentUser.user_id) {
      userId = Number(currentUser.user_id)
      if (userId > 0) {
        console.log('Got userId from currentUser.user_id:', userId)
        return userId
      }
    }
    
    // Ưu tiên 4: id (string)
    if (typeof currentUser.id === 'string') {
      userId = Number(currentUser.id)
      if (userId > 0) {
        console.log('Got userId from currentUser.id (string):', userId)
        return userId
      }
    }
    
    // Ưu tiên 5: userId (string)
    if (typeof currentUser.userId === 'string') {
      userId = Number(currentUser.userId)
      if (userId > 0) {
        console.log('Got userId from currentUser.userId (string):', userId)
        return userId
      }
    }
    
    // Thử lấy từ token nếu có
    try {
      const token = localStorage.getItem('authToken')
      if (token) {
        const decoded = ApiService.decodeToken(token)
        if (decoded) {
          const tokenUserId = Number(decoded.id || decoded.userId || decoded.sub || 0)
          if (tokenUserId > 0) {
            console.log('Got userId from token:', tokenUserId)
            return tokenUserId
          }
        }
      }
    } catch (err) {
      console.error('Error getting userId from token:', err)
    }
    
    console.warn('Could not extract userId from currentUser:', currentUser)
    return 0
  }
  
  const userNumericId = getUserNumericId()

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
          (f.comments as string) ??  // Database dùng 'comments' (số nhiều)
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
        const normalizeDate = (order: OrderDTO) => {
          const raw = order.createdAt || order.created_at
          const time = raw ? new Date(raw).getTime() : 0
          if (!Number.isNaN(time) && time > 0) return time
          return typeof order.id === 'number' ? order.id : Number(order.id || 0)
        }
        const sortedOrders = [...(data as unknown as OrderDTO[])].sort((a, b) => normalizeDate(b) - normalizeDate(a))
        setOrders(sortedOrders)
        setSelected(sortedOrders[0] || null)
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
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-gray-300">Đang tải đơn hàng...</p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
                <div className="text-red-400 text-lg font-semibold mb-2">⚠️ Lỗi</div>
                <p className="text-red-300">{error}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: list */}
                <div className="space-y-4">
                  <div className="mb-4">
                    <h2 className="text-xl font-bold text-white mb-1">Danh sách đơn hàng</h2>
                    <p className="text-sm text-gray-400">{orders.length} đơn hàng</p>
                  </div>
                  {orders.length === 0 ? (
                    <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8 text-center">
                      <div className="text-6xl mb-4">📦</div>
                      <p className="text-gray-400 text-lg font-medium">Chưa có đơn hàng nào</p>
                      <p className="text-gray-500 text-sm mt-2">Đơn hàng của bạn sẽ hiển thị ở đây</p>
                    </div>
                  ) : (
                    orders.map((o) => {
                      const isActive = selected?.id === o.id
                      const created = o.createdAt || o.created_at
                      const total = typeof o.totalPrice === 'number' ? o.totalPrice : Number(o.total_price || 0)
                      const getStatusConfig = (status: string) => {
                        switch (status) {
                          case 'PENDING': return { icon: '⏳', text: 'Chờ thanh toán', gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30', textColor: 'text-amber-300' }
                          case 'DEPOSITED': return { icon: '💰', text: 'Đã cọc', gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30', textColor: 'text-blue-300' }
                          case 'SHIPPING': return { icon: '🚚', text: 'Đang giao', gradient: 'from-purple-500 to-pink-500', bg: 'bg-purple-500/10', border: 'border-purple-500/30', textColor: 'text-purple-300' }
                          case 'PAID': return { icon: '✅', text: 'Đã thanh toán', gradient: 'from-green-500 to-emerald-500', bg: 'bg-green-500/10', border: 'border-green-500/30', textColor: 'text-green-300' }
                          case 'DONE': return { icon: '🎉', text: 'Hoàn thành', gradient: 'from-emerald-600 to-teal-600', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', textColor: 'text-emerald-300' }
                          case 'CANCEL': return { icon: '❌', text: 'Đã hủy', gradient: 'from-red-500 to-rose-500', bg: 'bg-red-500/10', border: 'border-red-500/30', textColor: 'text-red-300' }
                          default: return { icon: '📦', text: status, gradient: 'from-gray-500 to-gray-600', bg: 'bg-gray-500/10', border: 'border-gray-500/30', textColor: 'text-gray-300' }
                        }
                      }
                      const statusConfig = getStatusConfig(o.status || '')
                      return (
                        <button
                          key={o.id}
                          onClick={() => setSelected(o)}
                          className={`w-full text-left rounded-2xl border backdrop-blur-lg transition-all duration-300 ${
                            isActive 
                              ? `border-blue-500/50 bg-gradient-to-br from-blue-500/20 to-cyan-500/10 shadow-lg shadow-blue-500/20 scale-[1.02]` 
                              : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30 hover:shadow-lg'
                          } p-5 group`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${statusConfig.gradient} flex items-center justify-center text-xl shadow-lg`}>
                                {statusConfig.icon}
                              </div>
                              <div>
                                <div className="text-white font-bold text-lg group-hover:text-blue-300 transition-colors">Order #{o.id}</div>
                                <div className="text-xs text-gray-400 mt-0.5">
                                  {created ? new Date(created as string).toLocaleDateString('vi-VN', { 
                                    day: '2-digit', 
                                    month: '2-digit', 
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  }) : '-'}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-blue-400 font-bold text-lg">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${statusConfig.bg} ${statusConfig.border} border ${statusConfig.textColor} shadow-sm`}>
                              <span>{statusConfig.icon}</span>
                              {statusConfig.text}
                            </span>
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>

                {/* Right: detail */}
                <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-lg p-6 lg:sticky lg:top-6 lg:h-fit shadow-xl">
                  {!selected ? (
                    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                      <div className="text-6xl mb-4 opacity-50">📋</div>
                      <p className="text-gray-400 text-lg font-medium mb-2">Chọn một đơn hàng</p>
                      <p className="text-gray-500 text-sm">Nhấp vào đơn hàng bên trái để xem chi tiết</p>
                    </div>
                  ) : (
                    <div className="space-y-5 text-white">
                      {/* Header */}
                      <div className="pb-4 border-b border-white/10">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            Order #{selected.id}
                          </h3>
                          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r ${
                            selected.status === 'PENDING' ? 'from-amber-500 to-orange-500' :
                            selected.status === 'DEPOSITED' ? 'from-blue-500 to-cyan-500' :
                            selected.status === 'SHIPPING' ? 'from-purple-500 to-pink-500' :
                            selected.status === 'PAID' ? 'from-green-500 to-emerald-500' :
                            selected.status === 'DONE' ? 'from-emerald-600 to-teal-600' :
                            selected.status === 'CANCEL' ? 'from-red-500 to-rose-500' :
                            'from-gray-500 to-gray-600'
                          } text-white shadow-lg`}>
                            <span>{
                              selected.status === 'PENDING' ? '⏳' :
                              selected.status === 'DEPOSITED' ? '💰' :
                              selected.status === 'SHIPPING' ? '🚚' :
                              selected.status === 'PAID' ? '✅' :
                              selected.status === 'DONE' ? '🎉' :
                              selected.status === 'CANCEL' ? '❌' : '📦'
                            }</span>
                            {selected.status === 'PENDING' ? 'Chờ thanh toán' :
                             selected.status === 'DEPOSITED' ? 'Đã cọc' :
                             selected.status === 'SHIPPING' ? 'Đang giao' :
                             selected.status === 'PAID' ? 'Đã thanh toán' :
                             selected.status === 'DONE' ? 'Hoàn thành' :
                             selected.status === 'CANCEL' ? 'Đã hủy' :
                             selected.status}
                          </span>
                        </div>
                      </div>

                      {/* Order Info Cards */}
                      <div className="grid grid-cols-1 gap-4">
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                              <span className="text-xl">💰</span>
                            </div>
                            <div className="flex-1">
                              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Tổng tiền</label>
                              <p className="text-blue-400 font-bold text-xl">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                                  typeof selected.totalPrice === 'number' ? selected.totalPrice : Number(selected.total_price || 0)
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                              <span className="text-xl">💳</span>
                            </div>
                            <div className="flex-1">
                              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Phương thức thanh toán</label>
                              <p className="text-white font-medium">{selected.paymentMethod || selected.payment_method || '-'}</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                              <span className="text-xl">📞</span>
                            </div>
                            <div className="flex-1">
                              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Số điện thoại</label>
                              <p className="text-white font-medium">{String(selected.phone || '-')}</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                              <span className="text-xl">📍</span>
                            </div>
                            <div className="flex-1">
                              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Địa chỉ</label>
                              <p className="text-white font-medium">{selected.address || '-'}</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                              <span className="text-xl">🕐</span>
                            </div>
                            <div className="flex-1">
                              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Thời gian đặt hàng</label>
                              <p className="text-white font-medium">
                                {(selected.createdAt || selected.created_at) 
                                  ? new Date((selected.createdAt || selected.created_at) as string).toLocaleString('vi-VN', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })
                                  : '-'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Status Notifications */}
                      {selected.status === 'PENDING' && (
                        <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 rounded-xl p-5 backdrop-blur-sm">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
                              💳
                            </div>
                            <div className="flex-1">
                              <h4 className="text-amber-300 font-bold text-lg mb-2">Cần thanh toán cọc 25%</h4>
                              <p className="text-amber-200/90 text-sm mb-4 leading-relaxed">
                                Để đơn hàng được xử lý, vui lòng thanh toán cọc 25% trước. Sau khi thanh toán, đơn hàng sẽ được xác nhận và bắt đầu chuẩn bị.
                              </p>
                              <Link 
                                to={`/payment?orderId=${selected.id}&amount=${(typeof selected.totalPrice === 'number' ? selected.totalPrice : Number(selected.total_price || 0))}`}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-sm font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl"
                              >
                                <span>💳</span>
                                Thanh toán ngay
                              </Link>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {selected.status === 'DEPOSITED' && (
                        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/30 rounded-xl p-5 backdrop-blur-sm">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
                              ✅
                            </div>
                            <div className="flex-1">
                              <h4 className="text-blue-300 font-bold text-lg mb-2">Đã thanh toán cọc 25%</h4>
                              <p className="text-blue-200/90 text-sm leading-relaxed">
                                Đơn hàng đã được xác nhận. Nhân viên đang chuẩn bị hàng cho bạn. Bạn sẽ nhận được thông báo khi đơn hàng được giao.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {selected.status === 'SHIPPING' && (
                        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-purple-500/30 rounded-xl p-5 backdrop-blur-sm">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl shadow-lg flex-shrink-0 animate-pulse">
                              🚚
                            </div>
                            <div className="flex-1">
                              <h4 className="text-purple-300 font-bold text-lg mb-2">Đang giao hàng</h4>
                              <p className="text-purple-200/90 text-sm leading-relaxed">
                                Đơn hàng đang được vận chuyển đến bạn. Vui lòng chuẩn bị sẵn số tiền còn lại để thanh toán khi nhận hàng.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {selected.status === 'PAID' && (
                        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/30 rounded-xl p-5 backdrop-blur-sm">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
                              ✅
                            </div>
                            <div className="flex-1">
                              <h4 className="text-green-300 font-bold text-lg mb-2">Đã thanh toán đầy đủ</h4>
                              <p className="text-green-200/90 text-sm leading-relaxed">
                                Đơn hàng đã được thanh toán hoàn toàn. Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của EzBuild!
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {selected.status === 'DONE' && (
                        <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 rounded-xl p-5 backdrop-blur-sm">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
                              🎉
                            </div>
                            <div className="flex-1">
                              <h4 className="text-emerald-300 font-bold text-lg mb-2">Hoàn thành</h4>
                              <p className="text-emerald-200/90 text-sm leading-relaxed">
                                Đơn hàng đã hoàn tất. Chúc bạn có trải nghiệm tuyệt vời với sản phẩm từ EzBuild!
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Feedback Section - Inline Form */}
                      {(selected.status === 'PAID' || selected.status === 'DONE') && (
                        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-5 space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-white font-bold text-lg mb-1">Đánh giá đơn hàng</h4>
                              <p className="text-gray-400 text-sm">
                                Chia sẻ trải nghiệm của bạn để EzBuild phục vụ tốt hơn
                              </p>
                            </div>
                            {!isFeedbackModalOpen && (
                              <button
                                onClick={() => {
                                  setFeedbackEditingId(feedbackForSelected?.id ?? null)
                                  setFeedbackRating(feedbackForSelected?.rating ?? 5)
                                  setFeedbackComment(feedbackForSelected?.comment ?? '')
                                  setIsFeedbackModalOpen(true)
                                }}
                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg text-sm font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                              >
                                <span>{feedbackForSelected ? '✏️' : '⭐'}</span>
                                {feedbackForSelected ? 'Cập nhật' : 'Đánh giá'}
                              </button>
                            )}
                          </div>

                          {/* Inline Feedback Form */}
                          {isFeedbackModalOpen ? (
                            <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-5 animate-in fade-in slide-in-from-top-2">
                              <div className="flex items-center justify-between">
                                <h5 className="text-white font-semibold text-base">
                                  {feedbackEditingId ? 'Cập nhật đánh giá' : 'Viết đánh giá mới'}
                                </h5>
                                <button
                                  onClick={() => {
                                    setIsFeedbackModalOpen(false)
                                    setFeedbackEditingId(null)
                                    setFeedbackComment('')
                                    setFeedbackRating(5)
                                  }}
                                  className="text-gray-400 hover:text-white text-xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all"
                                >
                                  ×
                                </button>
                              </div>

                              <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
                                  Đánh giá tổng thể
                                </label>
                                <div className="flex items-center justify-center gap-3">
                                  {[1, 2, 3, 4, 5].map((value) => (
                                    <button
                                      key={value}
                                      onClick={() => setFeedbackRating(value)}
                                      className="focus:outline-none transition-all duration-200 hover:scale-110"
                                      style={{ transform: value === feedbackRating ? 'scale(1.2)' : 'scale(1)' }}
                                    >
                                      <svg
                                        className="w-10 h-10"
                                        viewBox="0 0 24 24"
                                        fill={value <= feedbackRating ? '#facc15' : 'none'}
                                        stroke="#facc15"
                                        strokeWidth={value <= feedbackRating ? 0 : 1.5}
                                      >
                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z" />
                                      </svg>
                                    </button>
                                  ))}
                                </div>
                                <p className="text-center text-sm text-gray-400 mt-3">
                                  {feedbackRating === 5 && '⭐ Tuyệt vời!'}
                                  {feedbackRating === 4 && '👍 Tốt'}
                                  {feedbackRating === 3 && '😐 Bình thường'}
                                  {feedbackRating === 2 && '😕 Không hài lòng'}
                                  {feedbackRating === 1 && '😞 Rất không hài lòng'}
                                </p>
                              </div>

                              <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
                                  Nhận xét của bạn
                                </label>
                                <textarea
                                  value={feedbackComment}
                                  onChange={(e) => setFeedbackComment(e.target.value)}
                                  placeholder="Hãy chia sẻ trải nghiệm về giao hàng, chất lượng sản phẩm, thái độ nhân viên, hoặc bất kỳ điều gì bạn muốn EzBuild biết..."
                                  rows={4}
                                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                  {feedbackComment.length} ký tự
                                </p>
                              </div>

                              <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
                                <button
                                  onClick={() => {
                                    setIsFeedbackModalOpen(false)
                                    setFeedbackEditingId(null)
                                    setFeedbackComment('')
                                    setFeedbackRating(5)
                                  }}
                                  className="px-5 py-2.5 border border-white/20 text-sm text-gray-300 rounded-lg hover:bg-white/10 transition-all font-medium"
                                >
                                  Hủy
                                </button>
                                <button
                                  onClick={async () => {
                                    if (!selected?.id) {
                                      alert('Vui lòng chọn đơn hàng để đánh giá')
                                      return
                                    }
                                    
                                    // Lấy orderId và userId đảm bảo đúng
                                    const orderId = Number(selected.id)
                                    const userId = getUserNumericId()
                                    
                                    console.log('=== SUBMITTING FEEDBACK ===')
                                    console.log('Selected order:', selected)
                                    console.log('Order ID:', orderId)
                                    console.log('User ID:', userId)
                                    console.log('Rating:', feedbackRating)
                                    console.log('Comment:', feedbackComment)
                                    
                                    if (!orderId || orderId === 0) {
                                      alert('Không tìm thấy ID đơn hàng. Vui lòng thử lại.')
                                      return
                                    }
                                    
                                    if (!userId || userId === 0) {
                                      alert('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.')
                                      return
                                    }
                                    
                                    try {
                                      setIsSubmittingFeedback(true)
                                      if (feedbackEditingId) {
                                        await ApiService.updateOrderFeedback(feedbackEditingId, {
                                          orderId,
                                          userId,
                                          rating: feedbackRating,
                                          comment: feedbackComment
                                        })
                                      } else {
                                        await ApiService.createOrderFeedback({
                                          orderId,
                                          userId,
                                          rating: feedbackRating,
                                          comment: feedbackComment,
                                        })
                                      }
                                      await loadFeedbacks(userId)
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
                                  className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg text-sm font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                                  disabled={isSubmittingFeedback}
                                >
                                  {isSubmittingFeedback ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                      Đang gửi...
                                    </>
                                  ) : (
                                    <>
                                      <span>{feedbackEditingId ? '✏️' : '⭐'}</span>
                                      {feedbackEditingId ? 'Cập nhật đánh giá' : 'Gửi phản hồi'}
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          ) : feedbackForSelected ? (
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                  {renderRatingStars(feedbackForSelected.rating)}
                                </div>
                                <span className="text-sm text-gray-400 font-medium">
                                  {feedbackForSelected.rating}/5 sao
                                </span>
                                <span className="text-xs text-gray-500">
                                  • {new Date(feedbackForSelected.createdAt).toLocaleDateString('vi-VN')}
                                </span>
                              </div>
                              <p className="text-gray-200 leading-relaxed">{feedbackForSelected.comment || 'Không có nhận xét.'}</p>
                            </div>
                          ) : (
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                              <p className="text-gray-400 text-sm">
                                Chưa có đánh giá. Hãy chia sẻ trải nghiệm của bạn nhé! ⭐
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Quick Links */}
                      <div className="pt-2 border-t border-white/10">
                        <Link 
                          to="/builds" 
                          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors"
                        >
                          <span>🔗</span>
                          Xem Build đã lưu
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

    </div>
  )
}

export default CustomerOrdersPage


