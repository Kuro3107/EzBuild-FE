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

function CustomerOrdersPage() {
  const currentUser = ApiService.getCurrentUser()
  const [orders, setOrders] = useState<OrderDTO[]>([])
  const [selected, setSelected] = useState<OrderDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      } catch {
        setError('Không thể tải danh sách đơn hàng')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [currentUser?.id, currentUser?.userId])

  const totalOrders = useMemo(() => orders.length, [orders])

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
                        <div className="text-xs mt-1"><span className="px-2 py-0.5 rounded bg-white/10">{o.status}</span></div>
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
                      <div className="text-gray-300">Trạng thái: <span className="text-white font-semibold">{selected.status}</span></div>
                      <div className="text-gray-300">Tổng tiền: <span className="text-blue-400 font-bold">{(typeof selected.totalPrice === 'number' ? selected.totalPrice : Number((selected as any).total_price || 0)).toLocaleString('vi-VN')} VND</span></div>
                      <div className="text-gray-300">Phương thức thanh toán: <span className="text-white">{selected.paymentMethod || (selected as any).payment_method || '-'}</span></div>
                      <div className="text-gray-300">SĐT: <span className="text-white">{String(selected.phone || '')}</span></div>
                      <div className="text-gray-300">Địa chỉ: <span className="text-white">{selected.address || '-'}</span></div>
                      <div className="text-gray-300">Thời gian: <span className="text-white">{(selected.createdAt || (selected as any).created_at) ? new Date((selected.createdAt || (selected as any).created_at) as string).toLocaleString() : '-'}</span></div>
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
    </div>
  )
}

export default CustomerOrdersPage


