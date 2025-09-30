import { Link, useNavigate } from 'react-router-dom'
import '../../Homepage.css'

function StaffPage() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    navigate('/login')
  }

  return (
    <div className="page bg-grid bg-radial">
      <div className="layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="flex items-center justify-between px-2 mb-6">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-lg bg-green-600" />
              <span className="font-semibold">Staff Panel</span>
            </div>
          </div>

          <div>
            <div className="sidebar-group">Staff Management</div>
            <Link className="nav-item" to="/staff/dashboard">Dashboard</Link>
            <Link className="nav-item" to="/staff/orders">Orders</Link>
            <Link className="nav-item" to="/staff/customers">Customers</Link>
            <Link className="nav-item" to="/staff/inventory">Inventory</Link>
            <Link className="nav-item" to="/staff/reports">Reports</Link>
          </div>

          <div>
            <div className="sidebar-group">Navigation</div>
            <Link className="nav-item" to="/">Back to Home</Link>
            <Link className="nav-item" to="/products">Products</Link>
          </div>

          <div className="mt-8">
            <button 
              onClick={handleLogout}
              className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Staff Dashboard</h1>
            <p className="text-gray-600">Quản lý hệ thống từ góc độ nhân viên</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border border-black/10 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold">Dashboard</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">Tổng quan hoạt động hệ thống</p>
              <Link to="/staff/dashboard" className="text-blue-600 text-sm font-medium hover:underline">
                Xem chi tiết →
              </Link>
            </div>

            <div className="bg-white rounded-lg border border-black/10 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold">Orders</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">Quản lý đơn hàng và giao dịch</p>
              <Link to="/staff/orders" className="text-blue-600 text-sm font-medium hover:underline">
                Xem chi tiết →
              </Link>
            </div>

            <div className="bg-white rounded-lg border border-black/10 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold">Customers</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">Quản lý thông tin khách hàng</p>
              <Link to="/staff/customers" className="text-blue-600 text-sm font-medium hover:underline">
                Xem chi tiết →
              </Link>
            </div>

            <div className="bg-white rounded-lg border border-black/10 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold">Inventory</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">Quản lý kho hàng và sản phẩm</p>
              <Link to="/staff/inventory" className="text-blue-600 text-sm font-medium hover:underline">
                Xem chi tiết →
              </Link>
            </div>

            <div className="bg-white rounded-lg border border-black/10 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold">Reports</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">Báo cáo và thống kê</p>
              <Link to="/staff/reports" className="text-blue-600 text-sm font-medium hover:underline">
                Xem chi tiết →
              </Link>
            </div>

            <div className="bg-white rounded-lg border border-black/10 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold">Settings</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">Cài đặt hệ thống</p>
              <button className="text-blue-600 text-sm font-medium hover:underline">
                Xem chi tiết →
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default StaffPage
