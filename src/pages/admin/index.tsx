import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ApiService } from '../../services/api'

function AdminPage() {
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

  // Menu items cho Admin Panel (giống EzBuild dashboard)
  const adminMenuItems = [
    { key: 'dashboard', label: 'Admin Dashboard', link: '/admin' },
    { key: 'users', label: 'User Management', link: '/admin/users' },
    { key: 'staff', label: 'Staff Management', link: '/admin/staff' },
    { key: 'products', label: 'Product Management', link: '/admin/products' },
    { key: 'orders', label: 'Order Management', link: '/admin/orders' },
    { key: 'analytics', label: 'Analytics', link: '/admin/analytics' },
    { key: 'settings', label: 'System Settings', link: '/admin/settings' },
    { key: 'ai', label: 'AI Management', link: '/admin/ai' },
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
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center !text-white text-sm font-semibold shadow-md">
                {(currentUser.email as string || 'A').charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium !text-white max-w-32 truncate hidden sm:block">
                {currentUser.fullname as string || (currentUser.email as string) || 'Admin'}
              </span>
              <svg className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isUserMenuOpen && (
              <div ref={userMenuRef} className="absolute top-full right-0 mt-3 w-72 bg-gray-900 rounded-2xl shadow-2xl py-4 z-50 border border-gray-700">
                <div className="px-6 py-4 border-b border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center !text-white text-lg font-bold shadow-lg">
                      {(currentUser.email as string || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold !text-white text-base truncate">{currentUser.fullname as string || (currentUser.email as string) || 'Admin'}</div>
                      <div className="text-sm !text-gray-300 truncate">{(currentUser.email as string) || 'admin@example.com'}</div>
                      <div className="text-xs text-gray-500">
                        {ApiService.getUserRole() || 'Admin'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="py-2">
                  <Link 
                    to="/admin/profile"
                    className="w-full px-6 py-3 text-left text-blue-400 hover:bg-gray-800 transition-colors text-sm flex items-center gap-4 group"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-medium">Admin Profile</span>
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
            <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#dc2626' }} />
            <span style={{ fontWeight: '600', fontSize: '16px', color: 'white' }}>Admin Panel</span>
          </Link>
          <nav style={{ height: 'calc(100% - 80px)', paddingTop: '8px', background: '#000000', overflowY: 'auto' }}>
            <div style={{ padding: '0 16px' }}>
              {adminMenuItems.map((item) => (
                <div key={item.key}>
                  {item.link ? (
                    <Link to={item.link} style={{ display: 'block', padding: '12px 16px', color: 'white', textDecoration: 'none', borderRadius: '6px', marginBottom: '4px', transition: 'background-color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}>
                      {item.label}
                    </Link>
                  ) : (
                    <div style={{ padding: '12px 16px', color: 'white', cursor: 'pointer', borderRadius: '6px', marginBottom: '4px', transition: 'background-color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}>
                      {item.label}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </nav>
          <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px', fontSize: '12px', color: '#8c8c8c' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <a href="#" style={{ color: '#dc2626' }}>Contact</a>
              <a href="#" style={{ color: '#dc2626' }}>FAQ</a>
            </div>
          </div>
        </aside>

        <main style={{ marginLeft: window.innerWidth >= 768 ? '256px' : '0', background: 'linear-gradient(135deg, #1e3a8a 0%, #000000 100%)', flex: 1, minHeight: '100vh', overflowX: 'hidden', width: '100%' }}>
          <div style={{ padding: '32px' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>Admin Dashboard</h1>
              <p style={{ color: '#94a3b8' }}>Quản lý toàn bộ hệ thống và người dùng</p>
            </div>

            {/* Dashboard Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(239, 68, 68, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg style={{ width: '24px', height: '24px', color: '#f87171' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white' }}>Admin Dashboard</h3>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>Tổng quan hệ thống và thống kê</p>
                <Link to="/admin/dashboard" style={{ color: '#f87171', fontSize: '14px', fontWeight: '500', textDecoration: 'none' }}>
                  Xem chi tiết →
                </Link>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg style={{ width: '24px', height: '24px', color: '#60a5fa' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white' }}>User Management</h3>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>Quản lý người dùng, phân quyền</p>
                <Link to="/admin/users" style={{ color: '#60a5fa', fontSize: '14px', fontWeight: '500', textDecoration: 'none' }}>
                  Xem chi tiết →
                </Link>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(34, 197, 94, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg style={{ width: '24px', height: '24px', color: '#4ade80' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white' }}>Staff Management</h3>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>Quản lý nhân viên, phân công công việc</p>
                <Link to="/admin/staff" style={{ color: '#4ade80', fontSize: '14px', fontWeight: '500', textDecoration: 'none' }}>
                  Xem chi tiết →
                </Link>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(168, 85, 247, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg style={{ width: '24px', height: '24px', color: '#a78bfa' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white' }}>AI Management</h3>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>Quản lý AI, chatbot, tự động hóa</p>
                <Link to="/admin/ai" style={{ color: '#a78bfa', fontSize: '14px', fontWeight: '500', textDecoration: 'none' }}>
                  Xem chi tiết →
                </Link>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(249, 115, 22, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg style={{ width: '24px', height: '24px', color: '#fb923c' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white' }}>Analytics</h3>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>Phân tích dữ liệu, báo cáo tổng hợp</p>
                <Link to="/admin/analytics" style={{ color: '#fb923c', fontSize: '14px', fontWeight: '500', textDecoration: 'none' }}>
                  Xem chi tiết →
                </Link>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg style={{ width: '24px', height: '24px', color: '#818cf8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white' }}>System Settings</h3>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>Cài đặt hệ thống, cấu hình</p>
                <Link to="/admin/settings" style={{ color: '#818cf8', fontSize: '14px', fontWeight: '500', textDecoration: 'none' }}>
                  Xem chi tiết →
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminPage