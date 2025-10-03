import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import '../../Homepage.css'
import './index.css'
import { ApiService } from '../../services/api'

interface ProductRow {
  label: string
  value: string
}

interface ApiProduct {
  id?: number
  name?: string
  brand?: string
  model?: string
  specs?: string
  image_url1?: string
  category_id?: number
  productPrices?: Array<{ price: number }>
}

interface CompareProduct {
  id: number
  name: string
  brand: string
  model: string
  specs: string
  image: string
  price: number
  category: string
  categoryId: number
}

// Category mapping moved outside component
const categoryMap: { [key: number]: string } = {
  1: 'CPU',
  2: 'GPU',
  3: 'RAM',
  4: 'Mainboard',
  5: 'Storage',
  6: 'PSU',
  7: 'Case',
  8: 'Cooling',
  9: 'Monitor',
  10: 'Keyboard',
  11: 'Mouse',
  12: 'Headset/Speaker'
}

function ComparePage() {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [products, setProducts] = useState<CompareProduct[]>([])
  const [loading, setLoading] = useState(false)

  const [isProductsOpen, setIsProductsOpen] = useState(false)
  const productsBtnRef = useRef<HTMLAnchorElement | null>(null)
  const popoverRef = useRef<HTMLDivElement | null>(null)

  // Fetch all products from API
  useEffect(() => {
    const fetchAllProducts = async () => {
      setLoading(true)
      try {
        const allProducts: CompareProduct[] = []
        
        // Fetch products from each category
        for (const categoryId of Object.keys(categoryMap).map(Number)) {
          try {
            const categoryProducts = await ApiService.getProductsByCategory(categoryId)
            const formattedProducts = (categoryProducts as ApiProduct[]).map((item) => {
              const productPrices = item.productPrices as Array<{ price: number }>
              const minPrice = Array.isArray(productPrices) && productPrices.length > 0
                ? Math.min(...productPrices.map(p => p.price))
                : 0

              return {
                id: Number(item.id) || 0,
                name: String(item.name) || 'Unknown Product',
                brand: String(item.brand) || 'Unknown',
                model: String(item.model) || 'Unknown',
                specs: String(item.specs) || 'No specifications available',
                image: String(item.image_url1) || 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
                price: minPrice,
                category: categoryMap[categoryId] || 'Unknown',
                categoryId: categoryId
              }
            })
            allProducts.push(...formattedProducts)
          } catch (err) {
            console.error(`Error fetching products for category ${categoryId}:`, err)
          }
        }
        
        setProducts(allProducts)
      } catch (err) {
        console.error('Error fetching products:', err)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchAllProducts()
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return [] // Chỉ hiển thị kết quả khi có search query
    return products.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.brand.toLowerCase().includes(q) || 
      p.model.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    )
  }, [query, products])

  const selected = useMemo(() => filtered.find(p => p.id === selectedId) || filtered[0] || null, [filtered, selectedId])

  const rows: ProductRow[] = useMemo(() => {
    if (!selected) return []
    
    const basicInfo = [
      { label: 'Name', value: selected.name },
      { label: 'Brand', value: selected.brand },
      { label: 'Model', value: selected.model },
      { label: 'Category', value: selected.category },
      { label: 'Price', value: selected.price > 0 ? `${selected.price.toLocaleString('vi-VN')} VND` : 'Liên hệ' }
    ]
    
    // Parse specs if available
    const specsInfo: ProductRow[] = []
    if (selected.specs && selected.specs !== 'No specifications available') {
      const specsLines = selected.specs.split('\n').filter(line => line.trim())
      specsLines.forEach(line => {
        const [key, value] = line.split(':').map(s => s.trim())
        if (key && value) {
          specsInfo.push({ label: key, value })
        }
      })
    }
    
    return [...basicInfo, ...specsInfo]
  }, [selected])

  return (
    <div className="page bg-grid bg-radial">
      <div className="layout">
        <main className="main">
          <section className="hero">
            <h1 className="hero-title">So sánh sản phẩm</h1>
            <p className="hero-subtitle">Tìm kiếm và so sánh thông tin chi tiết các sản phẩm từ database.</p>
            <div className="hero-actions">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="compare-search"
              />
            </div>
          </section>

          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="text-lg text-white/70">Đang tải dữ liệu sản phẩm...</div>
            </div>
          )}
          
          {!loading && (
            <>
              {query.trim() === '' ? (
                <div className="text-center py-16">
                  <div className="mb-6">
                    <svg className="w-16 h-16 mx-auto text-white/40 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Bắt đầu tìm kiếm sản phẩm</h3>
                  <p className="text-white/60 mb-4">Nhập tên sản phẩm, thương hiệu hoặc danh mục để bắt đầu so sánh</p>
                  <div className="text-sm text-white/40">
                    <p>Ví dụ: "Intel Core i5", "NVIDIA RTX", "ASUS", "CPU", "GPU"...</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="section-title">
                    Kết quả tìm kiếm: "{query}" ({filtered.length} sản phẩm)
                  </div>
                  <div className="compare-grid">
                    <div>
                      <div className="compare-list">
                        {filtered.map(p => (
                          <button
                            key={p.id}
                            onClick={() => setSelectedId(p.id)}
                            className={selected?.id === p.id ? 'is-active' : ''}
                          >
                            <div className="text-left">
                              <div className="font-medium">{p.name}</div>
                              <div className="text-xs text-white/60">{p.brand} - {p.category}</div>
                            </div>
                          </button>
                        ))}
                        {filtered.length === 0 && (
                          <div className="px-3 py-8 text-center">
                            <svg className="w-12 h-12 mx-auto text-white/40 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <div className="text-sm text-white/60 mb-2">Không tìm thấy sản phẩm nào phù hợp</div>
                            <div className="text-xs text-white/40">Thử tìm kiếm với từ khóa khác</div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="compare-table">
                        {selected && (
                          <div className="p-4 border-b border-white/20">
                            <div className="flex items-center gap-4">
                              <img 
                                src={selected.image} 
                                alt={selected.name}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                              <div>
                                <h3 className="text-lg font-semibold text-white">{selected.name}</h3>
                                <p className="text-sm text-white/60">{selected.brand} - {selected.category}</p>
                                {selected.price > 0 && (
                                  <p className="text-sm font-medium text-blue-400">{selected.price.toLocaleString('vi-VN')} VND</p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        <table>
                          <thead>
                            <tr>
                              <th className="compare-field">Thông tin</th>
                              <th>Giá trị</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map((r) => (
                              <tr key={r.label}>
                                <td className="capitalize font-medium">{r.label}</td>
                                <td>{r.value}</td>
                              </tr>
                            ))}
                            {!selected && (
                              <tr>
                                <td className="px-3 py-6 text-white/60" colSpan={2}>Chọn sản phẩm để xem chi tiết</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </main>

        {isProductsOpen && (
          <div
            ref={popoverRef}
            className="fixed left-64 top-24 z-50 w-[900px] rounded-xl border border-white/20 bg-gray-900/95 backdrop-blur shadow-2xl p-4"
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
                      className="text-left rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 px-3 py-2 text-sm text-white transition-colors block"
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
                      className="text-left rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 px-3 py-2 text-sm text-white transition-colors block"
                      onClick={() => setIsProductsOpen(false)}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-3 text-xs text-white/60">Other Products: OS, Sound Card, Network, VR, Capture...</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ComparePage
