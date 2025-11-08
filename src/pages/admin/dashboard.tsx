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
            <text
              x={i * barWidth + barWidth * 0.45}
              y={Math.max(6, 55 - h - 2)}
              fontSize="3"
              textAnchor="middle"
              fill="#ffffff"
            >
              {v}
            </text>
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
      
      const totalRevenue = payments
        .filter(p => {
          const status = (p as PaymentLike).status
          return status === 'PAID' || status === 'SUCCESS'
        })
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

  const orderStatusChart = useMemo(() => {
    const statuses = ['PENDING', 'DEPOSITED', 'SHIPPING', 'PAID', 'DONE', 'CANCEL']
    const counts = statuses.map(s => ordersDataForChart.filter(o => (o as Record<string, unknown>).status === s).length)
    return { labels: statuses.map(s => s.replace('PENDING', 'PEND').replace('DEPOSITED', 'DEP')), values: counts }
  }, [ordersDataForChart])

  const revenueByMonth = useMemo(() => {
    const map = new Map<string, number>()
    paymentsDataForChart
      .filter(p => {
        const status = (p as PaymentLike).status
        return status === 'PAID' || status === 'SUCCESS'
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
  }, [paymentsDataForChart])

  const revenueBarData = useMemo(() => {
    return {
      labels: revenueByMonth.map(p => p.x),
      values: revenueByMonth.map(p => p.y)
    }
  }, [revenueByMonth])

  const currentMonthRevenue = revenueByMonth.length > 0 ? revenueByMonth[revenueByMonth.length - 1].y : 0
  const prevMonthRevenue = revenueByMonth.length > 1 ? revenueByMonth[revenueByMonth.length - 2].y : 0
  const revenueChangePercent = prevMonthRevenue > 0 ? ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 : 0

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
            <span className="bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
              Admin Dashboard
            </span>
          </h1>
          <p className="text-gray-300 text-lg">Tổng quan hệ thống và thống kê toàn diện</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Tổng Users', value: stats.totalUsers, color: 'from-blue-500 to-cyan-500', icon: '👥', link: '/admin/users' },
            { label: 'Tổng Staff', value: stats.totalStaff, color: 'from-green-500 to-emerald-500', icon: '👔', link: '/admin/staff' },
            { label: 'Tổng Đơn hàng', value: stats.totalOrders, color: 'from-purple-500 to-pink-500', icon: '📦' },
            { label: 'Tổng Sản phẩm', value: stats.totalProducts, color: 'from-amber-500 to-orange-500', icon: '🎮' },
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
                <Link to={stat.link} className="text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors">
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
            <BarChart labels={orderStatusChart.labels} values={orderStatusChart.values} />
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Quản lý Users', desc: 'Xem và quản lý tất cả người dùng', link: '/admin/users', icon: '👥', color: 'from-blue-500 to-cyan-500' },
            { title: 'Quản lý Staff', desc: 'Xem và quản lý nhân viên', link: '/admin/staff', icon: '👔', color: 'from-green-500 to-emerald-500' },
            { title: 'Quản lý AI', desc: 'Cấu hình AI và tự động hóa', link: '/admin/ai', icon: '🤖', color: 'from-purple-500 to-pink-500' },
          ].map((action, idx) => (
            <Link 
              key={idx}
              to={action.link}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all shadow-lg hover:shadow-xl group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition-transform`}>
                  {action.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">{action.title}</h3>
                  <p className="text-sm text-gray-300">{action.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage
