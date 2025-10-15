import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ApiService } from '../../services/api'
import ChatBubble from '../../components/ChatBubble'

function StaffPage() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<Record<string, unknown> | null>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Lấy thông tin user hiện tại
  useEffect(() => {
    const user = ApiService.getCurrentUser()
    if (user) {
      setCurrentUser(user)
    }
  }, [])

  // Xử lý click outside cho user menu
  useEffect(() => {
    if (!isUserMenuOpen) return

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(target)
      ) {
        setIsUserMenuOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsUserMenuOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isUserMenuOpen])

  const handleLogout = () => {
    const confirmLogout = window.confirm('Bạn có chắc chắn muốn đăng xuất?')
    if (confirmLogout) {
      ApiService.clearAuthData()
      setCurrentUser(null)
      setIsUserMenuOpen(false)
      window.location.href = '/login'
      alert('Đăng xuất thành công!')
    }
  }

  // Menu items cho Staff Panel (giống EzBuild dashboard)
  const staffMenuItems = [
    { key: 'dashboard', label: 'Staff Dashboard', link: '/staff' },
    { key: 'customers', label: 'Customer Management', link: '/staff/customers' },
    { key: 'orders', label: 'Order Management', link: '/staff/orders' },
    { key: 'products', label: 'Product Management', link: '/staff/products' },
    { key: 'inventory', label: 'Inventory', link: '/staff/inventory' },
    { key: 'reports', label: 'Reports', link: '/staff/reports' },
    { key: 'support', label: 'Customer Support', link: '/staff/support' },
    { key: 'settings', label: 'Staff Settings', link: '/staff/settings' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e3a8a 0%, #000000 100%)', color: 'white' }}>
      {currentUser ? (
        <header style={{ position: 'fixed', top: 0, right: 0, zIndex: 1000, background: 'transparent', padding: '8px 16px', border: 'none', width: 'auto' }}>
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-3 bg-white/95 backdrop-blur-sm border border-black/10 rounded-2xl px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center !text-white text-sm font-semibold shadow-md">
                {(currentUser.email as string || 'S').charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium !text-white max-w-32 truncate hidden sm:block">
                {currentUser.fullname as string || (currentUser.email as string) || 'Staff'}
              </span>
              <svg className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isUserMenuOpen && (
              <div ref={userMenuRef} className="absolute top-full right-0 mt-3 w-72 bg-gray-900 rounded-2xl shadow-2xl py-4 z-50 border border-gray-700">
                <div className="px-6 py-4 border-b border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center !text-white text-lg font-bold shadow-lg">
                      {(currentUser.email as string || 'S').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold !text-white text-base truncate">{currentUser.fullname as string || (currentUser.email as string) || 'Staff'}</div>
                      <div className="text-sm !text-gray-300 truncate">{(currentUser.email as string) || 'staff@example.com'}</div>
                      <div className="text-xs text-gray-500">
                        {ApiService.getUserRole() || 'Staff'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="py-2">
                  <Link 
                    to="/staff/profile"
                    className="w-full px-6 py-3 text-left text-blue-400 hover:bg-gray-800 transition-colors text-sm flex items-center gap-4 group"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-medium">Staff Profile</span>
                  </Link>
                  <button className="w-full px-6 py-3 text-left text-gray-400 hover:bg-gray-800 transition-colors text-sm flex items-center gap-4 group">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="font-medium">Favorites</span>
                  </button>
                  <hr className="my-2 border-gray-700" />
                  <button 
                    onClick={handleLogout}
                    className="w-full px-6 py-3 text-left text-red-400 hover:bg-gray-800 transition-colors text-sm flex items-center gap-4 group"
                  >
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="font-medium">Log out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>
      ) : (
        <header style={{ position: 'fixed', top: 0, right: 0, zIndex: 1000, background: 'transparent', padding: '8px 16px', border: 'none', width: 'auto' }}>
          <Link to="/login" className="flex items-center gap-2 bg-white/95 backdrop-blur-sm border border-black/10 rounded-2xl px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-200">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
            <span className="text-sm font-medium text-gray-800">Sign In</span>
          </Link>
        </header>
      )}

      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <aside style={{ width: '256px', background: '#000000', borderRight: '1px solid #333333', position: 'fixed', height: '100vh', left: 0, top: 0, zIndex: 100, display: window.innerWidth >= 768 ? 'block' : 'none' }}>
          <Link to="/" style={{ padding: '16px', borderBottom: '1px solid #333333', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#16a34a' }} />
            <span style={{ fontWeight: '600', fontSize: '16px', color: 'white' }}>Staff Panel</span>
          </Link>
          <nav style={{ height: 'calc(100% - 80px)', paddingTop: '8px', background: '#000000', overflowY: 'auto' }}>
            <div style={{ padding: '0 16px' }}>
              {staffMenuItems.map((item) => (
                <div key={item.key}>
                  {item.link ? (
                    <Link to={item.link} style={{ display: 'block', padding: '12px 16px', color: 'white', textDecoration: 'none', borderRadius: '6px', marginBottom: '4px', transition: 'background-color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#16a34a')} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}>
                      {item.label}
                    </Link>
                  ) : (
                    <div style={{ padding: '12px 16px', color: 'white', cursor: 'pointer', borderRadius: '6px', marginBottom: '4px', transition: 'background-color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#16a34a')} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}>
                      {item.label}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </nav>
          <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px', fontSize: '12px', color: '#8c8c8c' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <a href="#" style={{ color: '#16a34a' }}>Contact</a>
              <a href="#" style={{ color: '#16a34a' }}>FAQ</a>
            </div>
          </div>
        </aside>

        <main style={{ marginLeft: window.innerWidth >= 768 ? '256px' : '0', background: 'linear-gradient(135deg, #1e3a8a 0%, #000000 100%)', flex: 1, minHeight: '100vh', overflowX: 'hidden', width: '100%' }}>
          <div style={{ padding: '32px' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>Staff Dashboard</h1>
              <p style={{ color: '#94a3b8' }}>Quản lý hệ thống từ góc độ nhân viên</p>
            </div>

            {/* Dashboard Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg style={{ width: '24px', height: '24px', color: '#60a5fa' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white' }}>Dashboard</h3>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>Tổng quan hoạt động và thống kê</p>
                <Link to="/staff/dashboard" style={{ color: '#60a5fa', fontSize: '14px', fontWeight: '500', textDecoration: 'none' }}>
                  Xem chi tiết →
                </Link>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(34, 197, 94, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg style={{ width: '24px', height: '24px', color: '#4ade80' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white' }}>Order Management</h3>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>Xử lý đơn hàng, giao dịch và vận chuyển</p>
                <Link to="/staff/orders" style={{ color: '#4ade80', fontSize: '14px', fontWeight: '500', textDecoration: 'none' }}>
                  Xem chi tiết →
                </Link>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(168, 85, 247, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg style={{ width: '24px', height: '24px', color: '#a78bfa' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white' }}>Customer Support</h3>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>Hỗ trợ khách hàng, xử lý khiếu nại</p>
                <Link to="/staff/customers" style={{ color: '#a78bfa', fontSize: '14px', fontWeight: '500', textDecoration: 'none' }}>
                  Xem chi tiết →
                </Link>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(249, 115, 22, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg style={{ width: '24px', height: '24px', color: '#fb923c' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white' }}>Inventory Management</h3>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>Quản lý kho hàng, nhập xuất tồn kho</p>
                <Link to="/staff/inventory" style={{ color: '#fb923c', fontSize: '14px', fontWeight: '500', textDecoration: 'none' }}>
                  Xem chi tiết →
                </Link>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg style={{ width: '24px', height: '24px', color: '#818cf8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white' }}>Product Management</h3>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>Quản lý sản phẩm, giá cả, mô tả</p>
                <Link to="/staff/products" style={{ color: '#818cf8', fontSize: '14px', fontWeight: '500', textDecoration: 'none' }}>
                  Xem chi tiết →
                </Link>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(239, 68, 68, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg style={{ width: '24px', height: '24px', color: '#f87171' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white' }}>Reports & Analytics</h3>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>Báo cáo chi tiết, phân tích dữ liệu</p>
                <Link to="/staff/reports" style={{ color: '#f87171', fontSize: '14px', fontWeight: '500', textDecoration: 'none' }}>
                  Xem chi tiết →
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Chat Bubble - Fixed ở góc phải dưới */}
      <ChatBubble />
    </div>
  )
}

export default StaffPage