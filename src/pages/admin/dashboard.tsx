import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiService } from '../../services/api'
import '../../Homepage.css'

interface AdminDashboardStats {
  totalUsers: number
  totalStaff: number
  totalOrders: number
  totalProducts: number
  totalRevenue: number
  recentActivity: Array<Record<string, unknown>>
}

type PaymentLike = {
  status?: string
  amount?: number | string
  paidAt?: string
  updatedAt?: string
  createdAt?: string
}

// Lightweight SVG bar chart (no deps)
function BarChart({ labels, values, color = '#3b82f6' }: { labels: string[]; values: number[]; color?: string }) {
  const max = Math.max(1, ...values)
  const barWidth = 100 / Math.max(1, values.length)
  return (
    <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="w-full h-40">
      {values.map((v, i) => {
        const h = (v / max) * 48
        return (
          <g key={i}>
            <rect x={i * barWidth + 4 * 0.01} y={55 - h} width={barWidth * 0.9} height={h} fill={color} rx={1.5} />
            {/* Số lượng trên mỗi cột */}
            <text
              x={i * barWidth + barWidth * 0.45}
              y={Math.max(6, 55 - h - 2)}
              fontSize="3"
              textAnchor="middle"
              fill="#111827"
            >
              {v}
            </text>
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

// (Đã chuyển sang dùng BarChart cho doanh thu theo tháng)

function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats>({
    totalUsers: 0,
    totalStaff: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const [ordersDataForChart, setOrdersDataForChart] = useState<Array<Record<string, unknown>>>([])
  const [paymentsDataForChart, setPaymentsDataForChart] = useState<Array<Record<string, unknown>>>([])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load data từ nhiều nguồn
      const [usersData, staffData, ordersData, productsData, paymentsData] = await Promise.all([
        ApiService.getAllUsers().catch(() => []),
        ApiService.getAllStaff().catch(() => []),
        ApiService.getOrders().catch(() => []),
        ApiService.getAllProducts().catch(() => []),
        ApiService.getAllPayments().catch(() => [])
      ])
      
      const users = usersData as Array<Record<string, unknown>>
      const staff = staffData as Array<Record<string, unknown>>
      const orders = ordersData as Array<Record<string, unknown>>
      const products = productsData as Array<Record<string, unknown>>
      const payments = paymentsData as Array<Record<string, unknown>>
      
      // Calculate stats
      const totalRevenue = payments
        .filter(p => (p as PaymentLike).status === 'PAID')
        .reduce((sum, p) => sum + (Number((p as PaymentLike).amount) || 0), 0)
      
      setStats({
        totalUsers: users.length,
        totalStaff: staff.length,
        totalOrders: orders.length,
        totalProducts: products.length,
        totalRevenue,
        recentActivity: []
      })
      setOrdersDataForChart(orders)
      setPaymentsDataForChart(payments)
    } catch (err) {
      setError('Không thể tải dữ liệu dashboard')
      console.error('Error loading dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Chart datasets
  const orderStatusChart = useMemo(() => {
    const statuses = ['PENDING', 'DEPOSITED', 'SHIPPING', 'PAID', 'DONE', 'CANCEL']
    const counts = statuses.map(s => ordersDataForChart.filter(o => (o as any).status === s).length)
    return { labels: statuses.map(s => s.replace('PENDING', 'PEND').replace('DEPOSITED', 'DEP')), values: counts }
  }, [ordersDataForChart])

  const revenueByMonth = useMemo(() => {
    const map = new Map<string, number>()
    paymentsDataForChart
      .filter(p => (p as PaymentLike).status === 'PAID')
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
  }, [paymentsDataForChart])

  // Dữ liệu cho biểu đồ cột doanh thu theo tháng (Earnings style)
  const revenueBarData = useMemo(() => {
    return {
      labels: revenueByMonth.map(p => p.x),
      values: revenueByMonth.map(p => p.y)
    }
  }, [revenueByMonth])

  // Tổng doanh thu tháng hiện tại và % thay đổi so với tháng trước
  const currentMonthRevenue = revenueByMonth.length > 0 ? revenueByMonth[revenueByMonth.length - 1].y : 0
  const prevMonthRevenue = revenueByMonth.length > 1 ? revenueByMonth[revenueByMonth.length - 2].y : 0
  const revenueChangePercent = prevMonthRevenue > 0 ? ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 : 0

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
      <div className="layout">
        <main className="main">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Tổng quan hệ thống và thống kê toàn diện</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-black/10 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Tổng Users</h3>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              <Link to="/admin/users" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                Xem chi tiết →
              </Link>
            </div>

            <div className="bg-white rounded-lg border border-black/10 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Tổng Staff</h3>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStaff}</p>
              <Link to="/admin/staff" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                Xem chi tiết →
              </Link>
            </div>

            <div className="bg-white rounded-lg border border-black/10 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Tổng Đơn hàng</h3>
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              <p className="text-xs text-gray-500 mt-1">Tất cả đơn hàng</p>
            </div>

            <div className="bg-white rounded-lg border border-black/10 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Tổng Sản phẩm</h3>
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              <p className="text-xs text-gray-500 mt-1">Tất cả sản phẩm</p>
            </div>

            <div className="bg-white rounded-lg border border-black/10 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Doanh thu</h3>
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalRevenue)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Tổng doanh thu</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-black/10 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Đơn hàng theo trạng thái</h3>
              <BarChart labels={orderStatusChart.labels} values={orderStatusChart.values} />
            </div>
            <div className="bg-white rounded-lg border border-black/10 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Doanh thu theo tháng</h3>
              <div className="flex items-end gap-3 mb-3">
                <div className="text-3xl font-bold text-gray-900">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentMonthRevenue)}
                </div>
                <div className={`text-sm font-medium ${revenueChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <span className="inline-flex items-center gap-1">
                    {revenueChangePercent >= 0 ? (
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M3 12l7-7 7 7H3z"/></svg>
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17 8l-7 7-7-7h14z"/></svg>
                    )}
                    {Math.abs(revenueChangePercent).toFixed(1)}%
                  </span>
                </div>
              </div>
              <BarChart labels={revenueBarData.labels} values={revenueBarData.values} color="#3b82f6" />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/admin/users" className="bg-white rounded-lg border border-black/10 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Quản lý Users</h3>
                  <p className="text-sm text-gray-600">Xem và quản lý tất cả người dùng</p>
                </div>
              </div>
            </Link>

            <Link to="/admin/staff" className="bg-white rounded-lg border border-black/10 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Quản lý Staff</h3>
                  <p className="text-sm text-gray-600">Xem và quản lý nhân viên</p>
                </div>
              </div>
            </Link>

            <Link to="/admin/ai" className="bg-white rounded-lg border border-black/10 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Quản lý AI</h3>
                  <p className="text-sm text-gray-600">Cấu hình AI và tự động hóa</p>
                </div>
              </div>
            </Link>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminDashboardPage

