import { useEffect, useState } from 'react'
import { ApiService } from '../../services/api'
import '../../Homepage.css'

interface Payment {
  id: number
  orderId: number
  amount: number
  method: string
  status: string
  createdAt: string
  paidAt?: string
  transactionId?: string
}

interface Order {
  id: number
  status: string
  totalPrice: number
  user?: { id: number; email: string; fullname: string }
}

function StaffPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [paymentsData, ordersData] = await Promise.all([
        ApiService.getAllPayments(),
        ApiService.getOrders()
      ])
      
      setPayments(paymentsData as unknown as Payment[])
      setOrders(ordersData as unknown as Order[])
    } catch (err) {
      setError('Không thể tải dữ liệu')
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
      case 'PAID': return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return '⏳'
      case 'PAID': return '✅'
      default: return '💰'
    }
  }

  const getOrderInfo = (orderId: number) => {
    return orders.find(order => order.id === orderId)
  }

  const filteredPayments = payments.filter(payment => {
    const matchesStatus = filterStatus === 'ALL' || payment.status === filterStatus
    const matchesSearch = searchTerm === '' || 
      payment.id.toString().includes(searchTerm) ||
      payment.orderId.toString().includes(searchTerm) ||
      payment.transactionId?.includes(searchTerm) ||
      getOrderInfo(payment.orderId)?.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getOrderInfo(payment.orderId)?.user?.fullname?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesStatus && matchesSearch
  })

  const statusCounts = {
    ALL: payments.length,
    PENDING: payments.filter(p => p.status === 'PENDING').length,
    PAID: payments.filter(p => p.status === 'PAID').length,
  }

  const totalRevenue = payments
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

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
              onClick={loadData}
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
                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  Quản lý thanh toán
                </span>
              </h1>
              <p className="text-gray-300 text-lg">Theo dõi các giao dịch thanh toán trong hệ thống</p>
            </div>
            <button
              onClick={loadData}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all shadow-lg hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm mb-2">Tổng thanh toán</p>
                <p className="text-3xl font-bold text-white">{statusCounts.ALL}</p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-2xl shadow-lg">
                💳
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all shadow-lg hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm mb-2">Chờ thanh toán</p>
                <p className="text-3xl font-bold text-amber-400">{statusCounts.PENDING}</p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-2xl shadow-lg">
                ⏳
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all shadow-lg hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm mb-2">Tổng doanh thu</p>
                <p className="text-2xl font-bold text-green-400">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                    notation: 'compact'
                  }).format(totalRevenue)}
                </p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-2xl shadow-lg">
                💰
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
            <input
              type="text"
              placeholder="Tìm kiếm theo ID, email, tên khách hàng, transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
            <div className="flex flex-wrap gap-3">
              {['ALL', 'PENDING', 'PAID'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    filterStatus === status
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg scale-105'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {status === 'ALL' ? 'Tất cả' : status} ({statusCounts[status as keyof typeof statusCounts]})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Đơn hàng
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Số tiền
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Phương thức
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
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="text-gray-400">
                        <svg className="mx-auto h-16 w-16 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        <p className="text-lg font-medium">Không tìm thấy thanh toán nào</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => {
                    const orderInfo = getOrderInfo(payment.orderId)
                    return (
                      <tr key={payment.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-white font-semibold">#{payment.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-white font-medium">Order #{payment.orderId}</div>
                            <div className="text-gray-400 text-sm">
                              {orderInfo ? `Status: ${orderInfo.status}` : 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-white font-medium">{orderInfo?.user?.fullname || 'N/A'}</div>
                            <div className="text-gray-400 text-sm">{orderInfo?.user?.email || 'N/A'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-white font-semibold">
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND'
                            }).format(payment.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-300">{payment.method}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${getStatusColor(payment.status)} shadow-lg`}>
                            <span>{getStatusIcon(payment.status)}</span>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300 text-sm">
                          {new Date(payment.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedPayment(payment)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all text-sm font-medium shadow-md"
                          >
                            Chi tiết
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Detail Modal */}
        {selectedPayment && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    Chi tiết thanh toán #{selectedPayment.id}
                  </span>
                </h3>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="text-gray-400 hover:text-white text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <label className="block text-sm font-semibold text-gray-400 mb-2">Đơn hàng</label>
                    <p className="text-white font-medium text-lg">Order #{selectedPayment.orderId}</p>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <label className="block text-sm font-semibold text-gray-400 mb-2">Số tiền</label>
                    <p className="text-white font-semibold text-lg">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(selectedPayment.amount)}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <label className="block text-sm font-semibold text-gray-400 mb-2">Phương thức</label>
                    <p className="text-white">{selectedPayment.method}</p>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <label className="block text-sm font-semibold text-gray-400 mb-2">Trạng thái</label>
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${getStatusColor(selectedPayment.status)} shadow-lg`}>
                      <span>{getStatusIcon(selectedPayment.status)}</span>
                      {selectedPayment.status}
                    </span>
                  </div>
                </div>
                
                {selectedPayment.transactionId && (
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <label className="block text-sm font-semibold text-gray-400 mb-2">Transaction ID</label>
                    <p className="text-white font-mono">{selectedPayment.transactionId}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <label className="block text-sm font-semibold text-gray-400 mb-2">Ngày tạo</label>
                    <p className="text-white">
                      {new Date(selectedPayment.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  
                  {selectedPayment.paidAt && (
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <label className="block text-sm font-semibold text-gray-400 mb-2">Ngày thanh toán</label>
                      <p className="text-white">
                        {new Date(selectedPayment.paidAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <div className="text-sm text-blue-300">
                    <p className="font-semibold mb-2">ℹ️ Lưu ý:</p>
                    <p>Thanh toán được cập nhật tự động khi khách hàng xác nhận thanh toán.</p>
                    <p>Staff chỉ có thể xem thông tin thanh toán, không thể chỉnh sửa trạng thái.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StaffPaymentsPage
