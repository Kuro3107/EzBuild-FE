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
    const user = ApiService.getCurrentUser()
    console.log('Current user:', user) // Debug
    
    // Test tạm thời - nếu không có user, tạo user test
    if (!user) {
      const testUser = {
        email: 'info.leminhthuan@gmail.com',
        username: 'leminhthuan',
        id: 'test123'
      }
      setCurrentUser(testUser)
    } else {
      setCurrentUser(user)
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
    localStorage.removeItem('authToken')
    setCurrentUser(null)
    setIsUserMenuOpen(false)
    // Có thể thêm redirect về trang login nếu cần
  }


  return (
    <div className="page bg-grid bg-radial">
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

          {/* User Menu - nằm trong sidebar */}
          {currentUser && (
            <div className="mt-4">
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="w-full px-2 py-2 !bg-white border border-black rounded-lg text-black hover:bg-gray-50 transition-colors text-xs text-left shadow-sm"
                >
                  <span className="break-all font-medium">
                    {currentUser.email as string || 'User'}
                  </span>
                </button>
                
                {isUserMenuOpen && (
                  <div
                    ref={userMenuRef}
                    className="absolute bottom-0 left-full ml-2 w-48 bg-white/95 backdrop-blur-sm rounded-xl border border-black shadow-2xl py-2"
                  >
                    <button className="w-full px-4 py-2 text-left !bg-white text-black hover:bg-black/5 transition-colors text-sm">
                      Profile
                    </button>
                    <button className="w-full px-4 py-2 text-left !bg-white text-black hover:bg-black/5 transition-colors text-sm">
                      Favorites
                    </button>
                    <hr className="my-2 border-black/10" />
                    <button 
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left !bg-white text-black hover:bg-black/5 transition-colors text-sm"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
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


