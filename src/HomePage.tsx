import './Homepage.css'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ApiDebugger from './components/ApiDebugger'

function HomePage() {
  const [isProductsOpen, setIsProductsOpen] = useState(false)
  const productsBtnRef = useRef<HTMLAnchorElement | null>(null)
  const popoverRef = useRef<HTMLDivElement | null>(null)

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
            <Link className="nav-item" to="/">3D Builder</Link>
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
            <a className="nav-item" href="#">3D Part Gallery</a>
          </div>

          <div>
            <div className="sidebar-group">Community</div>
            <a className="nav-item" href="#">Completed Builds</a>
            <a className="nav-item" href="#">Updates</a>
            <a className="nav-item" href="#">Setup Builder</a>
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
            <h1 className="hero-title">Interactive PC Building in 3D</h1>
            <p className="hero-subtitle">
              Featuring compatibility, price comparison, <span className="text-blue-600 font-semibold">3D models</span>, and more.
            </p>
            <div className="hero-actions">
              <a href="#" className="btn-secondary">Download Mobile App</a>
              <a href="#" className="btn-primary">Start Building</a>
              <Link to="/login" className="btn-secondary">Log In</Link>
              <Link to="/register" className="btn-primary">Sign Up</Link>
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
            className="fixed left-64 top-24 z-50 w-[900px] rounded-xl border border-black bg-white/95 backdrop-blur shadow-2xl p-4"
          >
            <div className="flex gap-6">
              {/* Main Product Grid - 12 boxes */}
              <div className="flex-1">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    'Case',
                    'CPU',
                    'Mainboard',
                    'GPU',
                    'RAM',
                    'Storage',
                    'Power Supply',
                    'CPU Cooler',
                    'Case Fan',
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
                    ) : label === 'CPU Cooler' ? (
                      <Link
                        key={label}
                        to="/products/cpu-cooler"
                        className="text-left rounded-lg border border-black bg-white hover:bg-black/5 px-3 py-2 text-sm text-black transition-colors block"
                        onClick={() => setIsProductsOpen(false)}
                      >
                        {label}
                      </Link>
                    ) : label === 'Case Fan' ? (
                      <Link
                        key={label}
                        to="/products/case-fan"
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
              </div>

              {/* Additional 4 boxes on the right */}
              <div className="w-48">
                <div className="grid grid-cols-1 gap-3">
                  {[
                    'Headphones',
                    'Webcam',
                    'Microphone',
                    'Speakers',
                  ].map((label) => (
                    label === 'Headphones' ? (
                      <Link
                        key={label}
                        to="/products/headphones"
                        className="text-left rounded-lg border border-black bg-white hover:bg-black/5 px-3 py-2 text-sm text-black transition-colors block"
                        onClick={() => setIsProductsOpen(false)}
                      >
                        {label}
                      </Link>
                    ) : label === 'Webcam' ? (
                      <Link
                        key={label}
                        to="/products/webcam"
                        className="text-left rounded-lg border border-black bg-white hover:bg-black/5 px-3 py-2 text-sm text-black transition-colors block"
                        onClick={() => setIsProductsOpen(false)}
                      >
                        {label}
                      </Link>
                    ) : label === 'Microphone' ? (
                      <Link
                        key={label}
                        to="/products/microphone"
                        className="text-left rounded-lg border border-black bg-white hover:bg-black/5 px-3 py-2 text-sm text-black transition-colors block"
                        onClick={() => setIsProductsOpen(false)}
                      >
                        {label}
                      </Link>
                    ) : label === 'Speakers' ? (
                      <Link
                        key={label}
                        to="/products/speakers"
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
              </div>
            </div>
            <div className="mt-3 text-xs text-black/60">Other Products: OS, Sound Card, Network, VR, Capture...</div>
          </div>
        )}
      </div>
      
      {/* API Debugger - chỉ hiển thị trong development */}
      {import.meta.env.DEV && <ApiDebugger />}
    </div>
  )
}

export default HomePage


