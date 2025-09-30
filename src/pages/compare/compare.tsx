import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import '../../Homepage.css'
import './index.css'

interface ProductRow {
  label: string
  value: string
}

const MOCK_PRODUCTS = [
  { id: 'ryzen-5-5600', name: 'AMD Ryzen 5 5600', type: 'CPU', brand: 'AMD', cores: 6, threads: 12, baseClock: '3.5 GHz' },
  { id: 'i5-12400f', name: 'Intel Core i5-12400F', type: 'CPU', brand: 'Intel', cores: 6, threads: 12, baseClock: '2.5 GHz' },
  { id: 'rtx-4060', name: 'NVIDIA GeForce RTX 4060', type: 'GPU', brand: 'NVIDIA', vram: '8 GB', length: '244 mm' },
]

function ComparePage() {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return MOCK_PRODUCTS
    return MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q))
  }, [query])

  const selected = useMemo(() => filtered.find(p => p.id === selectedId) || filtered[0] || null, [filtered, selectedId])

  const rows: ProductRow[] = useMemo(() => {
    if (!selected) return []
    const entries = Object.entries(selected)
      .filter(([key]) => key !== 'id')
      .map(([key, value]) => ({ label: key, value: String(value) }))
    return entries
  }, [selected])

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

          <div className="mt-8 px-2 text-xs text-white/50">
            <div className="flex gap-3">
              <a href="#">Contact</a>
              <a href="#">FAQ</a>
            </div>
          </div>
        </aside>

        <main className="main">
          <section className="hero">
            <h1 className="hero-title">Compare</h1>
            <p className="hero-subtitle">Search a product to see its details. Read-only.</p>
            <div className="hero-actions">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search product..."
                className="compare-search"
              />
            </div>
          </section>

          <div className="section-title">Results</div>
          <div className="compare-grid">
            <div>
              <div className="compare-list">
                {filtered.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedId(p.id)}
                    className={selected?.id === p.id ? 'is-active' : ''}
                  >
                    {p.name}
                  </button>
                ))}
                {filtered.length === 0 && (
                  <div className="px-3 py-2 text-sm text-black/60">No results</div>
                )}
              </div>
            </div>

            <div>
              <div className="compare-table">
                <table>
                  <thead>
                    <tr>
                      <th className="compare-field">Field</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.label}>
                        <td className="capitalize">{r.label}</td>
                        <td>{r.value}</td>
                      </tr>
                    ))}
                    {!selected && (
                      <tr>
                        <td className="px-3 py-6 text-black/60" colSpan={2}>Select a product to view details</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>

        {isProductsOpen && (
          <div
            ref={popoverRef}
            className="fixed left-64 top-24 z-50 w-[900px] rounded-xl border border-black bg-white/95 backdrop-blur shadow-2xl p-4"
          >
            <div className="flex gap-6">
              <div className="flex-1">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    'Case', 'CPU', 'Mainboard', 'GPU', 'RAM', 'Storage', 'Power Supply', 'CPU Cooler', 'Case Fan', 'Monitor', 'Mouse', 'Keyboard',
                  ].map((label) => (
                    <Link
                      key={label}
                      to={`/products/${label.toLowerCase().replace(' ', label === 'Power Supply' ? 'psu' : label === 'CPU Cooler' ? 'cpu-cooler' : '')}`.replace('/products/psu', '/products/psu').replace('/products/case fan', '/products/case-fan').replace('/products/power supply', '/products/psu')}
                      className="text-left rounded-lg border border-black bg-white hover:bg-black/5 px-3 py-2 text-sm text-black transition-colors block"
                      onClick={() => setIsProductsOpen(false)}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="w-48">
                <div className="grid grid-cols-1 gap-3">
                  {['Headphones', 'Webcam', 'Microphone', 'Speakers'].map((label) => (
                    <Link
                      key={label}
                      to={`/products/${label.toLowerCase()}`}
                      className="text-left rounded-lg border border-black bg-white hover:bg-black/5 px-3 py-2 text-sm text-black transition-colors block"
                      onClick={() => setIsProductsOpen(false)}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-3 text-xs text-black/60">Other Products: OS, Sound Card, Network, VR, Capture...</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ComparePage
