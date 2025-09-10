import './Homepage.css'
import { useEffect, useRef, useState } from 'react'

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
            <a className="nav-item" href="#">3D Builder</a>
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
            <a className="nav-item" href="#">Sales</a>
            <a className="nav-item" href="#">Compare</a>
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
            className="fixed left-64 top-24 z-50 w-[760px] rounded-xl border border-black bg-white/95 backdrop-blur shadow-2xl p-4"
          >
            <div className="grid grid-cols-3 gap-3">
              {[
                'Case',
                'CPU',
                'Motherboard',
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
                <button
                  key={label}
                  className="text-left rounded-lg border border-black bg-white hover:bg-black/5 px-3 py-2 text-sm text-white"
                  onClick={() => setIsProductsOpen(false)}
                >
                  {label}
                </button>
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


