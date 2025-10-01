import './Homepage.css'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiService } from './services/api'

function HomePage() {
  const [isProductsOpen, setIsProductsOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<Record<string, unknown> | null>(null)
  const productsBtnRef = useRef<HTMLAnchorElement | null>(null)
  const popoverRef = useRef<HTMLDivElement | null>(null)
  const userMenuRef = useRef<HTMLDivElement | null>(null)

  // Kiểm tra trạng thái đăng nhập khi component mount
  useEffect(() => {
    // Kiểm tra và xóa dữ liệu cũ trước
    ApiService.checkAndClearOldData()
    
    const user = ApiService.getCurrentUser()
    console.log('Current user:', user) // Debug
    
    // Chỉ set user nếu thực sự có user đăng nhập
    if (user) {
      setCurrentUser(user)
    } else {
      setCurrentUser(null)
    }
  }, [])

  useEffect(() => {
    if (!isProductsOpen) return

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        productsBtnRef.current &&
        !productsBtnRef.current.contains(target)
      ) {
        setIsProductsOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsProductsOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isProductsOpen])

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

  // Xử lý logout
  const handleLogout = () => {
    ApiService.clearAuthData()
    setCurrentUser(null)
    setIsUserMenuOpen(false)
    // Có thể thêm redirect về trang login nếu cần
  }


  return (
    <div className="page bg-grid bg-radial">
      {/* Header với avatar user */}
      {currentUser && (
        <header className="fixed top-0 right-0 z-50 p-2 md:p-4">
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 md:gap-3 bg-white/95 backdrop-blur-sm border border-black/20 rounded-full px-2 md:px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs md:text-sm font-semibold">
                {(currentUser.email as string || 'U').charAt(0).toUpperCase()}
              </div>
              <span className="text-xs md:text-sm font-medium text-gray-800 max-w-20 md:max-w-32 truncate hidden sm:block">
                {currentUser.email as string || 'User'}
              </span>
              <svg 
                className={`w-3 h-3 md:w-4 md:h-4 text-gray-600 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isUserMenuOpen && (
              <div
                ref={userMenuRef}
                className="absolute top-full right-0 mt-2 w-48 md:w-56 bg-white/95 backdrop-blur-sm rounded-xl border border-black/20 shadow-2xl py-2 z-50"
              >
                <div className="px-4 py-3 border-b border-gray-200">
                  <div>
                    <div className="font-medium text-gray-900 text-sm">
                      {currentUser.email as string || 'User'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {ApiService.getUserRole() || ''}
                    </div>
                  </div>
                </div>
                <Link 
                  to="/customer"
                  className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors text-sm flex items-center gap-3"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </Link>
                <button className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors text-sm flex items-center gap-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Favorites
                </button>
                <hr className="my-2 border-gray-200" />
                <button 
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors text-sm flex items-center gap-3"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Log out
                </button>
              </div>
            )}
          </div>
        </header>
      )}

      <div className="layout">
        <aside className="sidebar">
          <div className="flex items-center justify-between px-2 mb-6">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-lg bg-blue-600" />
              <span className="font-semibold">EzBuild</span>
            </div>
          </div>

          <div>
            <div className="sidebar-group">Apps</div>
            <Link className="nav-item" to="/">PC Builder</Link>
            <a
              className="nav-item cursor-pointer"
              href="#"
              ref={productsBtnRef}
              onClick={(e) => {
                e.preventDefault()
                setIsProductsOpen((v) => !v)
              }}
            >
              Products
            </a>
            <Link className="nav-item" to="/sales">Sales</Link>
            <Link className="nav-item" to="/compare">Compare</Link>
            <a className="nav-item" href="#">PC Part Gallery</a>
          </div>

          <div>
            <div className="sidebar-group">Community</div>
            <a className="nav-item" href="#">Completed Builds</a>
            <a className="nav-item" href="#">Updates</a>
            <a className="nav-item" href="#">Setup Builder</a>
          </div>

          <div>
            <div className="sidebar-group">Management</div>
            {ApiService.isStaff() && !ApiService.isAdmin() && (
              <Link className="nav-item" to="/staff">Staff Panel</Link>
            )}
            {ApiService.isAdmin() && (
              <Link className="nav-item" to="/admin">Admin Panel</Link>
            )}
          </div>

          <div className="mt-8 px-2 text-xs text-white/50">
            <div className="flex gap-3">
              <a href="#">Contact</a>
              <a href="#">FAQ</a>
            </div>
          </div>
        </aside>

        <main className="main">
          <section className="hero">
            <h1 className="hero-title">Interactive PC Building</h1>
            <p className="hero-subtitle">
              Featuring compatibility, price comparison, <span className="text-blue-600 font-semibold">models</span>, and more.
            </p>
            <div className="hero-actions">
              <a href="#" className="btn-secondary">Download Mobile App</a>
              <a href="#" className="btn-primary">Start Building</a>
              {!currentUser && (
                <>
                  <Link to="/login" className="btn-secondary">Log In</Link>
                  <Link to="/register" className="btn-primary">Sign Up</Link>
                </>
              )}
            </div>

          </section>

          <div className="section-title">Quick Start</div>
          <div className="card-grid">
            {[
              { title: 'All-AMD Red Build' },
              { title: 'Baller White 4K RGB' },
              { title: 'Modern 1440p Gaming' },
            ].map((item) => (
              <article key={item.title} className="qs-card">
                <div className="qs-media" />
                <div className="qs-body">
                  <div className="qs-title">{item.title}</div>
                  <div className="qs-cta">Open</div>
                </div>
              </article>
            ))}
          </div>
        </main>

        {isProductsOpen && (
          <div
            ref={popoverRef}
            className="fixed left-64 top-24 z-50 w-[600px] rounded-xl border border-black bg-white/95 backdrop-blur shadow-2xl p-4"
          >
            <div className="grid grid-cols-3 gap-3">
              {[
                'Case',
                'CPU',
                'Mainboard',
                'GPU',
                'RAM',
                'Storage',
                'Power Supply',
                'Cooling',
                'Headset/Speaker',
                'Monitor',
                'Mouse',
                'Keyboard',
              ].map((label) => (
                label === 'Case' ? (
                  <Link
                    key={label}
                    to="/products/case"
                    className="text-left rounded-lg border border-black bg-white hover:bg-black/5 px-3 py-2 text-sm text-black transition-colors block"
                    onClick={() => setIsProductsOpen(false)}
                  >
                    {label}
                  </Link>
                ) : label === 'CPU' ? (
                  <Link
                    key={label}
                    to="/products/cpu"
                    className="text-left rounded-lg border border-black bg-white hover:bg-black/5 px-3 py-2 text-sm text-black transition-colors block"
                    onClick={() => setIsProductsOpen(false)}
                  >
                    {label}
                  </Link>
                ) : label === 'Mainboard' ? (
                  <Link
                    key={label}
                    to="/products/mainboard"
                    className="text-left rounded-lg border border-black bg-white hover:bg-black/5 px-3 py-2 text-sm text-black transition-colors block"
                    onClick={() => setIsProductsOpen(false)}
                  >
                    {label}
                  </Link>
                ) : label === 'GPU' ? (
                  <Link
                    key={label}
                    to="/products/gpu"
                    className="text-left rounded-lg border border-black bg-white hover:bg-black/5 px-3 py-2 text-sm text-black transition-colors block"
                    onClick={() => setIsProductsOpen(false)}
                  >
                    {label}
                  </Link>
                ) : label === 'RAM' ? (
                  <Link
                    key={label}
                    to="/products/ram"
                    className="text-left rounded-lg border border-black bg-white hover:bg-black/5 px-3 py-2 text-sm text-black transition-colors block"
                    onClick={() => setIsProductsOpen(false)}
                  >
                    {label}
                  </Link>
                ) : label === 'Storage' ? (
                  <Link
                    key={label}
                    to="/products/storage"
                    className="text-left rounded-lg border border-black bg-white hover:bg-black/5 px-3 py-2 text-sm text-black transition-colors block"
                    onClick={() => setIsProductsOpen(false)}
                  >
                    {label}
                  </Link>
                ) : label === 'Power Supply' ? (
                  <Link
                    key={label}
                    to="/products/psu"
                    className="text-left rounded-lg border border-black bg-white hover:bg-black/5 px-3 py-2 text-sm text-black transition-colors block"
                    onClick={() => setIsProductsOpen(false)}
                  >
                    {label}
                  </Link>
                ) : label === 'Cooling' ? (
                  <Link
                    key={label}
                    to="/products/cooling"
                    className="text-left rounded-lg border border-black bg-white hover:bg-black/5 px-3 py-2 text-sm text-black transition-colors block"
                    onClick={() => setIsProductsOpen(false)}
                  >
                    {label}
                  </Link>
                ) : label === 'Headset/Speaker' ? (
                  <Link
                    key={label}
                    to="/products/headset-speaker"
                    className="text-left rounded-lg border border-black bg-white hover:bg-black/5 px-3 py-2 text-sm text-black transition-colors block"
                    onClick={() => setIsProductsOpen(false)}
                  >
                    {label}
                  </Link>
                ) : label === 'Monitor' ? (
                  <Link
                    key={label}
                    to="/products/monitor"
                    className="text-left rounded-lg border border-black bg-white hover:bg-black/5 px-3 py-2 text-sm text-black transition-colors block"
                    onClick={() => setIsProductsOpen(false)}
                  >
                    {label}
                  </Link>
                ) : label === 'Mouse' ? (
                  <Link
                    key={label}
                    to="/products/mouse"
                    className="text-left rounded-lg border border-black bg-white hover:bg-black/5 px-3 py-2 text-sm text-black transition-colors block"
                    onClick={() => setIsProductsOpen(false)}
                  >
                    {label}
                  </Link>
                ) : label === 'Keyboard' ? (
                  <Link
                    key={label}
                    to="/products/keyboard"
                    className="text-left rounded-lg border border-black bg-white hover:bg-black/5 px-3 py-2 text-sm text-black transition-colors block"
                    onClick={() => setIsProductsOpen(false)}
                  >
                    {label}
                  </Link>
                ) : (
                  <button
                    key={label}
                    className="text-left rounded-lg border border-black bg-white hover:bg-black/5 px-3 py-2 text-sm text-black transition-colors block"
                    onClick={() => setIsProductsOpen(false)}
                  >
                    {label}
                  </button>
                )
              ))}
            </div>
            <div className="mt-3 text-xs text-black/60">Other Products: OS, Sound Card, Network, VR, Capture...</div>
          </div>
        )}
      </div>
      
    </div>
  )
}

export default HomePage


