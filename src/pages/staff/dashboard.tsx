import { useEffect, useMemo, useState } from 'react'
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

  // Compute chart data with stable hook order (declare before any conditional returns)
  const revenuePoints = useMemo(() => {
    const map = new Map<string, number>()
    paymentsForChart
      .filter(p => (p as Record<string, unknown>)['status'] === 'PAID')
      .forEach(p => {
        const rec = p as Record<string, unknown>
        const d = (rec['paidAt'] as string) || (rec['updatedAt'] as string) || (rec['createdAt'] as string)
        const key = d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : '??'
        const amtRaw = rec['amount'] as number | string | undefined
        map.set(key, (map.get(key) || 0) + (amtRaw !== undefined ? Number(amtRaw) : 0))
      })
    const arr = Array.from(map.entries()).map(([k, v]) => ({ x: k, y: v }))
    arr.sort((a, b) => {
      const [da, ma] = a.x.split('/').map(Number)
      const [db, mb] = b.x.split('/').map(Number)
      return ma === mb ? da - db : ma - mb
    })
    return arr
  }, [paymentsForChart])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load orders và payments
      const [ordersData, paymentsData] = await Promise.all([
        ApiService.getOrders(),
        ApiService.getAllPayments()
      ])
      
      const orders = ordersData as Array<Record<string, unknown>>
      const payments = paymentsData as Array<Record<string, unknown>>
      
      // Calculate stats
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
          .filter(p => p.status === 'PAID')
          .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
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
  }

  if (loading) {
    return (
      <div className="page bg-grid bg-radial">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page bg-grid bg-radial">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={loadDashboardData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page bg-grid bg-radial">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Tổng quan hoạt động hệ thống</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Orders Stats */}
        <div className="bg-white rounded-lg border border-black/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <Link 
              to="/staff/orders" 
              className="text-blue-600 text-sm font-medium hover:underline"
            >
              Xem chi tiết →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-black/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đơn chờ xử lý</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-black/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đơn đã cọc</p>
              <p className="text-2xl font-bold text-blue-600">{stats.depositedOrders}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-black/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đơn đang giao</p>
              <p className="text-2xl font-bold text-purple-600">{stats.shippingOrders}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-black/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng thanh toán</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPayments}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <Link 
              to="/staff/payments" 
              className="text-green-600 text-sm font-medium hover:underline"
            >
              Xem chi tiết →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-black/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Chờ thanh toán</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingPayments}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-black/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đã cọc 25%</p>
              <p className="text-2xl font-bold text-blue-600">{stats.paid25PercentPayments}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-black/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đã thanh toán</p>
              <p className="text-2xl font-bold text-green-600">{stats.paidPayments}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-black/10 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Đơn hàng theo trạng thái</h3>
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
        <div className="bg-white rounded-lg border border-black/10 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Doanh thu (ngày gần đây)</h3>
          <LineChart points={revenuePoints} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link 
          to="/staff/orders"
          className="bg-white rounded-lg border border-black/10 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Quản lý đơn hàng</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">Xử lý đơn hàng, cập nhật trạng thái</p>
          <div className="text-blue-600 text-sm font-medium">Xem chi tiết →</div>
        </Link>

        <Link 
          to="/staff/payments"
          className="bg-white rounded-lg border border-black/10 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Quản lý thanh toán</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">Xử lý giao dịch, xác nhận thanh toán</p>
          <div className="text-green-600 text-sm font-medium">Xem chi tiết →</div>
        </Link>

        <Link 
          to="/staff/customers"
          className="bg-white rounded-lg border border-black/10 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Hỗ trợ khách hàng</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">Xử lý khiếu nại, hỗ trợ khách hàng</p>
          <div className="text-purple-600 text-sm font-medium">Xem chi tiết →</div>
        </Link>
      </div>
    </div>
  )
}

// Reuse lightweight charts
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
            <text x={i * barWidth + (barWidth * 0.45)} y={58.5} fontSize="3" textAnchor="middle" fill="#6b7280">
              {labels[i]}
            </text>
          </g>
        )
      })}
      <line x1="0" y1="55" x2="100" y2="55" stroke="#e5e7eb" strokeWidth="0.5" />
    </svg>
  )
}

function LineChart({ points, color = '#10b981' }: { points: Array<{ x: string; y: number }>; color?: string }) {
  const maxY = Math.max(1, ...points.map(p => p.y))
  const stepX = 100 / Math.max(1, points.length - 1)
  return (
    <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="w-full h-40">
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={points.map((p, i) => `${i * stepX},${55 - (p.y / maxY) * 48}`).join(' ')} />
      {points.map((p, i) => (
        <circle key={i} cx={i * stepX} cy={55 - (p.y / maxY) * 48} r={1.2} fill={color} />
      ))}
      <line x1="0" y1="55" x2="100" y2="55" stroke="#e5e7eb" strokeWidth="0.5" />
    </svg>
  )
}

export default StaffDashboardPage
