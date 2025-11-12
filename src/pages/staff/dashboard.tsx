import { useEffect, useMemo, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ApiService } from '../../services/api'
import '../../Homepage.css'

interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  depositedOrders: number
  shippingOrders: number
  paidOrders: number
  doneOrders: number
  cancelOrders: number
  totalPayments: number
  pendingPayments: number
  paid25PercentPayments: number
  paidPayments: number
  totalRevenue: number
}

function StaffDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    depositedOrders: 0,
    shippingOrders: 0,
    paidOrders: 0,
    doneOrders: 0,
    cancelOrders: 0,
    totalPayments: 0,
    pendingPayments: 0,
    paid25PercentPayments: 0,
    paidPayments: 0,
    totalRevenue: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ordersForChart, setOrdersForChart] = useState<Array<Record<string, unknown>>>([])
  const [paymentsForChart, setPaymentsForChart] = useState<Array<Record<string, unknown>>>([])

  type PaymentLike = {
    status?: string
    amount?: number | string
    paidAt?: string
    updatedAt?: string
    createdAt?: string
  }

  const revenueByMonth = useMemo(() => {
    const map = new Map<string, number>()
    paymentsForChart
      .filter(p => {
        const status = (p as PaymentLike).status
        return status === 'SUCCESS' || status === 'PAID'
      })
      .forEach(p => {
        const pay = p as PaymentLike
        const d = pay.paidAt || pay.updatedAt || pay.createdAt
        const key = d ? new Date(d).toLocaleDateString('vi-VN', { month: '2-digit', year: '2-digit' }) : '??'
        map.set(key, (map.get(key) || 0) + (Number(pay.amount) || 0))
      })
    const entries = Array.from(map.entries()).sort((a, b) => {
      const [ma, ya] = a[0].split('/').map(Number)
      const [mb, yb] = b[0].split('/').map(Number)
      return ya === yb ? ma - mb : ya - yb
    })
    return entries.map(([k, v]) => ({ x: k, y: v }))
  }, [paymentsForChart])

  const revenueBarData = useMemo(() => {
    return {
      labels: revenueByMonth.map(p => p.x),
      values: revenueByMonth.map(p => p.y)
    }
  }, [revenueByMonth])

  const currentMonthRevenue = revenueByMonth.length > 0 ? revenueByMonth[revenueByMonth.length - 1].y : 0
  const prevMonthRevenue = revenueByMonth.length > 1 ? revenueByMonth[revenueByMonth.length - 2].y : 0
  const revenueChangePercent = prevMonthRevenue > 0 ? ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 : 0

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [ordersData, paymentsData] = await Promise.all([
        ApiService.getOrders(),
        ApiService.getAllPayments()
      ])
      
      const orders = ordersData as Array<Record<string, unknown>>
      const payments = paymentsData as Array<Record<string, unknown>>
      
      const newStats: DashboardStats = {
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'PENDING').length,
        depositedOrders: orders.filter(o => o.status === 'DEPOSITED').length,
        shippingOrders: orders.filter(o => o.status === 'SHIPPING').length,
        paidOrders: orders.filter(o => o.status === 'PAID').length,
        doneOrders: orders.filter(o => o.status === 'DONE').length,
        cancelOrders: orders.filter(o => o.status === 'CANCEL').length,
        totalPayments: payments.length,
        pendingPayments: payments.filter(p => p.status === 'PENDING').length,
        paid25PercentPayments: payments.filter(p => p.status === 'PAID 25%').length,
        paidPayments: payments.filter(p => p.status === 'PAID').length,
        totalRevenue: payments
          .filter(p => {
            const status = (p as PaymentLike).status
            return status === 'SUCCESS' || status === 'PAID'
          })
          .reduce((sum, p) => sum + (Number((p as PaymentLike).amount) || 0), 0)
      }
      
      setStats(newStats)
      setOrdersForChart(orders)
      setPaymentsForChart(payments)
    } catch (err) {
      setError('Không thể tải dữ liệu dashboard')
      console.error('Error loading dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

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
              onClick={loadDashboardData}
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
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Bảng điều khiển
            </span>
          </h1>
          <p className="text-gray-300 text-lg">Tổng quan hoạt động hệ thống</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Tổng đơn hàng', value: stats.totalOrders, color: 'from-blue-500 to-cyan-500', icon: '📦', link: '/staff/orders' },
            { label: 'Chờ xử lý', value: stats.pendingOrders, color: 'from-amber-500 to-orange-500', icon: '⏳' },
            { label: 'Đã cọc', value: stats.depositedOrders, color: 'from-blue-500 to-indigo-500', icon: '💰' },
            { label: 'Đang giao', value: stats.shippingOrders, color: 'from-purple-500 to-pink-500', icon: '🚚' },
            { label: 'Doanh thu', value: stats.totalRevenue, color: 'from-red-500 to-rose-500', icon: '💰', isCurrency: true },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all shadow-lg hover:shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <p className="text-gray-300 text-sm mb-2">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">
                    {stat.isCurrency 
                      ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', notation: 'compact' }).format(stat.value as number)
                      : stat.value
                    }
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-xl shadow-lg`}>
                  {stat.icon}
                </div>
              </div>
              {stat.link && (
                <Link 
                  to={stat.link}
                  className="text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors"
                >
                  Xem chi tiết →
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Payment Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Tổng thanh toán', value: stats.totalPayments, color: 'from-green-500 to-emerald-500', icon: '💳', link: '/staff/payments' },
            { label: 'Chờ thanh toán', value: stats.pendingPayments, color: 'from-amber-500 to-orange-500', icon: '⏳' },
            { label: 'Đã cọc 25%', value: stats.paid25PercentPayments, color: 'from-blue-500 to-cyan-500', icon: '💰' },
            { label: 'Đã thanh toán', value: stats.paidPayments, color: 'from-green-500 to-emerald-500', icon: '✅' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all shadow-lg hover:shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-300 text-sm mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-2xl shadow-lg`}>
                  {stat.icon}
                </div>
              </div>
              {stat.link && (
                <Link 
                  to={stat.link}
                  className="text-green-400 text-sm font-medium hover:text-green-300 transition-colors"
                >
                  Xem chi tiết →
                </Link>
              )}
            </div>
          ))}
        </div>


        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
            <h3 className="font-semibold text-white mb-4 text-lg">Đơn hàng theo trạng thái</h3>
            <BarChart
              labels={['PEND', 'DEP', 'SHIP', 'PAID', 'DONE', 'CANC']}
              values={[
                ordersForChart.filter(o => (o as Record<string, unknown>)['status'] === 'PENDING').length,
                ordersForChart.filter(o => (o as Record<string, unknown>)['status'] === 'DEPOSITED').length,
                ordersForChart.filter(o => (o as Record<string, unknown>)['status'] === 'SHIPPING').length,
                ordersForChart.filter(o => (o as Record<string, unknown>)['status'] === 'PAID').length,
                ordersForChart.filter(o => (o as Record<string, unknown>)['status'] === 'DONE').length,
                ordersForChart.filter(o => (o as Record<string, unknown>)['status'] === 'CANCEL').length,
              ]}
            />
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
            <h3 className="font-semibold text-white mb-4 text-lg">Doanh thu theo tháng</h3>
            <div className="flex items-end gap-3 mb-4">
              <div className="text-3xl font-bold text-white">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', notation: 'compact' }).format(currentMonthRevenue)}
              </div>
              <div className={`text-sm font-medium ${revenueChangePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                <span className="inline-flex items-center gap-1">
                  {revenueChangePercent >= 0 ? '↑' : '↓'}
                  {Math.abs(revenueChangePercent).toFixed(1)}%
                </span>
              </div>
            </div>
            <BarChart labels={revenueBarData.labels} values={revenueBarData.values} color="#3b82f6" />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link 
            to="/staff/orders"
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all shadow-lg hover:shadow-xl group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition-transform">
                📦
              </div>
              <h3 className="text-lg font-semibold text-white">Quản lý đơn hàng</h3>
            </div>
            <p className="text-gray-300 text-sm mb-4">Xử lý đơn hàng, cập nhật trạng thái</p>
            <div className="text-blue-400 text-sm font-medium group-hover:text-blue-300 transition-colors">Xem chi tiết →</div>
          </Link>

          <Link 
            to="/staff/payments"
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all shadow-lg hover:shadow-xl group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition-transform">
                💳
              </div>
              <h3 className="text-lg font-semibold text-white">Quản lý thanh toán</h3>
            </div>
            <p className="text-gray-300 text-sm mb-4">Xử lý giao dịch, xác nhận thanh toán</p>
            <div className="text-green-400 text-sm font-medium group-hover:text-green-300 transition-colors">Xem chi tiết →</div>
          </Link>

          <Link 
            to="/staff/products"
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all shadow-lg hover:shadow-xl group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition-transform">
                🎮
              </div>
              <h3 className="text-lg font-semibold text-white">Quản lý sản phẩm</h3>
            </div>
            <p className="text-gray-300 text-sm mb-4">Thêm, sửa, xóa sản phẩm</p>
            <div className="text-purple-400 text-sm font-medium group-hover:text-purple-300 transition-colors">Xem chi tiết →</div>
          </Link>
        </div>
      </div>
    </div>
  )
}

function BarChart({ labels, values, color = '#6366f1' }: { labels: string[]; values: number[]; color?: string }) {
  const max = Math.max(1, ...values)
  const barWidth = 100 / Math.max(1, values.length)
  return (
    <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="w-full h-40">
      {values.map((v, i) => {
        const h = (v / max) * 48
        return (
          <g key={i}>
            <rect x={i * barWidth + 4 * 0.01} y={55 - h} width={barWidth * 0.9} height={h} fill={color} rx={1.5} />
            <text x={i * barWidth + (barWidth * 0.45)} y={58.5} fontSize="3" textAnchor="middle" fill="#9ca3af">
              {labels[i]}
            </text>
          </g>
        )
      })}
      <line x1="0" y1="55" x2="100" y2="55" stroke="#374151" strokeWidth="0.5" />
    </svg>
  )
}


export default StaffDashboardPage
