import { Link } from 'react-router-dom'
import { ApiService } from '../services/api'
import '../Homepage.css'

function AccessDeniedPage() {
  const currentUser = ApiService.getCurrentUser()
  const userRole = ApiService.getUserRole()

  return (
    <div className="page bg-grid bg-radial">
      <div className="layout">
        <aside className="sidebar">
          <div className="flex items-center justify-between px-2 mb-6">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-lg bg-red-600" />
              <span className="font-semibold">EzBuild</span>
            </div>
          </div>

          <div>
            <div className="sidebar-group">Navigation</div>
            <Link className="nav-item" to="/">Back to Home</Link>
            {ApiService.isStaff() && !ApiService.isAdmin() && (
              <Link className="nav-item" to="/staff">Staff Panel</Link>
            )}
            {ApiService.isAdmin() && (
              <Link className="nav-item" to="/admin">Admin Panel</Link>
            )}
          </div>
        </aside>

        <main className="main">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="mb-8">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Access Denied</h1>
              <p className="text-xl text-gray-600 mb-6">
                Bạn không có quyền truy cập trang này
              </p>
            </div>

            <div className="bg-white rounded-lg border border-red-200 p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin tài khoản</h3>
              <div className="space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{String(currentUser?.email || 'N/A')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Role:</span>
                  <span className={`font-medium px-2 py-1 rounded text-sm ${
                    userRole === 'Admin' ? 'bg-red-100 text-red-800' :
                    userRole === 'Staff' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {userRole || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <p className="text-gray-600">
                {userRole === 'Admin' ? 'Bạn có quyền truy cập tất cả các trang.' :
                 userRole === 'Staff' ? 'Bạn có thể truy cập Staff Panel.' :
                 'Bạn chỉ có quyền truy cập trang chủ và sản phẩm.'}
              </p>
              
              <div className="flex gap-4 justify-center">
                <Link 
                  to="/" 
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Về trang chủ
                </Link>
                {userRole === 'Admin' && (
                  <Link 
                    to="/admin" 
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Admin Panel
                  </Link>
                )}
                {userRole === 'Staff' && (
                  <Link 
                    to="/staff" 
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Staff Panel
                  </Link>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AccessDeniedPage
