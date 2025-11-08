import { useEffect, useState } from 'react'
import { ApiService } from '../../services/api'
import '../../Homepage.css'

interface Order {
  id: number
  status: string
  totalPrice: number
  total_price?: number
  paymentMethod: string
  payment_method?: string
  address: string
  phone: string | number
  createdAt: string
  created_at?: string
  build?: { id: number; name: string }
  user?: { id: number; email: string; fullname: string }
}

interface Payment {
  id: number
  orderId: number
  amount: number
  method: string
  status: string
  createdAt: string
  paidAt?: string
}

function StaffOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('ALL')

  useEffect(() => {
    loadData(true)
    
    const pollInterval = setInterval(() => {
      loadData(false)
    }, 5000)
    
    return () => {
      clearInterval(pollInterval)
    }
  }, [])

  const loadData = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true)
      }
      setError(null)
      
      const [ordersData, paymentsData] = await Promise.all([
        ApiService.getOrders(),
        ApiService.getAllPayments()
      ])
      
      const orders = ordersData as unknown as Order[]
      const payments = paymentsData as unknown as Payment[]
      
      const ordersToUpdate: Array<{ orderId: number; newStatus: string }> = []
      
      for (const order of orders) {
        if (order.status === 'PENDING') {
          const orderPayments = payments.filter(p => p.orderId === order.id)
          
          const hasSuccessPayment = orderPayments.some(p => {
            const paymentStatus = (p.status || '').toUpperCase()
            return paymentStatus === 'SUCCESS' || paymentStatus === 'PAID' || paymentStatus === 'COMPLETED'
          })
          
          if (hasSuccessPayment) {
            ordersToUpdate.push({ orderId: order.id, newStatus: 'DEPOSITED' })
          }
        }
      }
      
      if (ordersToUpdate.length > 0) {
        console.log(`Tự động cập nhật ${ordersToUpdate.length} order từ PENDING sang DEPOSITED...`)
        
        for (const { orderId, newStatus } of ordersToUpdate) {
          try {
            await ApiService.updateOrderStatus(orderId, newStatus)
            console.log(`Đã cập nhật order ${orderId} thành ${newStatus}`)
          } catch (updateError) {
            console.error(`Lỗi khi cập nhật order ${orderId}:`, updateError)
          }
        }
        
        const [updatedOrdersData] = await Promise.all([
          ApiService.getOrders()
        ])
        
        setOrders(updatedOrdersData as unknown as Order[])
        setPayments(payments)
      } else {
        setOrders(orders)
        setPayments(payments)
      }
    } catch (err) {
      setError('Không thể tải dữ liệu')
      console.error('Error loading data:', err)
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await ApiService.updateOrderStatus(orderId, newStatus)
      
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus, updatedAt: new Date().toISOString() } : order
      ))
      
      alert(`Đã cập nhật trạng thái đơn hàng thành: ${newStatus}`)
    } catch (err) {
      console.error('Error updating order status:', err)
      alert('Có lỗi khi cập nhật trạng thái đơn hàng')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
      case 'DEPOSITED': return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
      case 'SHIPPING': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
      case 'PAID': return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
      case 'DONE': return 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
      case 'CANCEL': return 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return '⏳'
      case 'DEPOSITED': return '💰'
      case 'SHIPPING': return '🚚'
      case 'PAID': return '✅'
      case 'DONE': return '🎉'
      case 'CANCEL': return '❌'
      default: return '📦'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'PAID': return 'bg-green-100 text-green-800 border-green-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const filteredOrders = orders.filter(order => 
    filterStatus === 'ALL' || order.status === filterStatus
  )

  const getOrderPayments = (orderId: number) => {
    return payments.filter(payment => payment.orderId === orderId)
  }

  const statusCounts = {
    ALL: orders.length,
    PENDING: orders.filter(o => o.status === 'PENDING').length,
    DEPOSITED: orders.filter(o => o.status === 'DEPOSITED').length,
    SHIPPING: orders.filter(o => o.status === 'SHIPPING').length,
    PAID: orders.filter(o => o.status === 'PAID').length,
    DONE: orders.filter(o => o.status === 'DONE').length,
    CANCEL: orders.filter(o => o.status === 'CANCEL').length,
  }

  if (loading) {
    return (
      <div className="page bg-grid bg-radial">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-white text-lg">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page bg-grid bg-radial">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <p className="text-red-300 mb-6 text-xl">{error}</p>
            <button 
              onClick={() => loadData(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page bg-grid bg-radial p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Quản lý đơn hàng
                </span>
              </h1>
              <p className="text-gray-300 text-lg">Theo dõi và xử lý tất cả đơn hàng trong hệ thống</p>
            </div>
            <button
              onClick={() => loadData(true)}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Làm mới
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Tổng đơn hàng', value: statusCounts.ALL, color: 'from-blue-500 to-cyan-500', icon: '📦' },
            { label: 'Chờ xử lý', value: statusCounts.PENDING, color: 'from-amber-500 to-orange-500', icon: '⏳' },
            { label: 'Đã cọc', value: statusCounts.DEPOSITED, color: 'from-blue-500 to-indigo-500', icon: '💰' },
            { label: 'Đang giao', value: statusCounts.SHIPPING, color: 'from-purple-500 to-pink-500', icon: '🚚' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all shadow-lg hover:shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-2xl shadow-lg`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Buttons */}
        <div className="mb-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
            <div className="flex flex-wrap gap-3">
              {['ALL', 'PENDING', 'DEPOSITED', 'SHIPPING', 'PAID', 'DONE', 'CANCEL'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    filterStatus === status
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg scale-105'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {status === 'ALL' ? 'Tất cả' : status} ({statusCounts[status as keyof typeof statusCounts]})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Tổng tiền
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-400">
                        <svg className="mx-auto h-16 w-16 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-lg font-medium">Không có đơn hàng nào</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-white font-semibold">#{order.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-white font-medium">{order.user?.fullname || 'N/A'}</div>
                          <div className="text-gray-400 text-sm">{order.user?.email || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-white font-semibold">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                          }).format(order.totalPrice || order.total_price || 0)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${getStatusColor(order.status)} shadow-lg`}>
                          <span>{getStatusIcon(order.status)}</span>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300 text-sm">
                        {new Date(order.createdAt || order.created_at || '').toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all text-sm font-medium shadow-md"
                          >
                            Chi tiết
                          </button>
                          {order.status === 'PENDING' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'DEPOSITED')}
                              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all text-sm font-medium shadow-md"
                            >
                              Đã cọc
                            </button>
                          )}
                          {order.status === 'DEPOSITED' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'SHIPPING')}
                              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all text-sm font-medium shadow-md"
                            >
                              Giao hàng
                            </button>
                          )}
                          {order.status === 'SHIPPING' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'PAID')}
                              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all text-sm font-medium shadow-md"
                            >
                              Hoàn thành
                            </button>
                          )}
                          {order.status === 'PAID' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'DONE')}
                              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all text-sm font-medium shadow-md"
                            >
                              Hoàn tất
                            </button>
                          )}
                          {order.status !== 'DONE' && order.status !== 'CANCEL' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'CANCEL')}
                              className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg hover:from-red-600 hover:to-rose-600 transition-all text-sm font-medium shadow-md"
                            >
                              Hủy
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Chi tiết đơn hàng #{selectedOrder.id}
                  </span>
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-white text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <label className="block text-sm font-semibold text-gray-400 mb-2">Khách hàng</label>
                    <p className="text-white font-medium">{selectedOrder.user?.fullname || 'N/A'}</p>
                    <p className="text-gray-400 text-sm">{selectedOrder.user?.email || 'N/A'}</p>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <label className="block text-sm font-semibold text-gray-400 mb-2">Tổng tiền</label>
                    <p className="text-white font-semibold text-lg">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(selectedOrder.totalPrice || selectedOrder.total_price || 0)}
                    </p>
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Địa chỉ</label>
                  <p className="text-white">{selectedOrder.address}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <label className="block text-sm font-semibold text-gray-400 mb-2">Số điện thoại</label>
                    <p className="text-white">{selectedOrder.phone}</p>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <label className="block text-sm font-semibold text-gray-400 mb-2">Phương thức thanh toán</label>
                    <p className="text-white">{selectedOrder.paymentMethod || selectedOrder.payment_method}</p>
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Trạng thái</label>
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${getStatusColor(selectedOrder.status)} shadow-lg`}>
                    <span>{getStatusIcon(selectedOrder.status)}</span>
                    {selectedOrder.status}
                  </span>
                </div>
                
                {getOrderPayments(selectedOrder.id).length > 0 && (
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <label className="block text-sm font-semibold text-gray-400 mb-3">Thanh toán</label>
                    <div className="space-y-2">
                      {getOrderPayments(selectedOrder.id).map(payment => (
                        <div key={payment.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-white font-medium">Payment #{payment.id}</span>
                              <span className={`ml-3 inline-flex px-2 py-1 text-xs font-semibold rounded-lg border ${getPaymentStatusColor(payment.status)}`}>
                                {payment.status}
                              </span>
                            </div>
                            <div className="text-white font-semibold">
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                              }).format(payment.amount)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StaffOrdersPage
