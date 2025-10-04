import { useEffect, useMemo, useState } from 'react'
import '../../Homepage.css'
import '../compare/index.css'
import { ApiService } from '../../services/api'

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

interface PCComponent {
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

interface BuildComponent {
  category: string
  categoryId: number
  component: PCComponent | null
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

// PC Build categories in order
const buildCategories = [
  { id: 1, name: 'CPU', icon: '🖥️', required: true },
  { id: 4, name: 'Mainboard', icon: '🔧', required: true },
  { id: 3, name: 'RAM', icon: '💾', required: true },
  { id: 2, name: 'GPU', icon: '🎮', required: false },
  { id: 5, name: 'Storage', icon: '💿', required: true },
  { id: 6, name: 'PSU', icon: '⚡', required: true },
  { id: 7, name: 'Case', icon: '📦', required: true },
  { id: 8, name: 'Cooling', icon: '❄️', required: false },
  { id: 9, name: 'Monitor', icon: '🖥️', required: false },
  { id: 10, name: 'Keyboard', icon: '⌨️', required: false },
  { id: 11, name: 'Mouse', icon: '🖱️', required: false },
  { id: 12, name: 'Headset/Speaker', icon: '🎧', required: false }
]

function PCBuilderPage() {
  const [buildComponents, setBuildComponents] = useState<BuildComponent[]>(
    buildCategories.map(cat => ({
      category: cat.name,
      categoryId: cat.id,
      component: null
    }))
  )
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [products, setProducts] = useState<PCComponent[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch all products from API
  useEffect(() => {
    const fetchAllProducts = async () => {
      setLoading(true)
      try {
        const allProducts: PCComponent[] = []
        
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

  // Filter products by selected category and search query
  const filteredProducts = useMemo(() => {
    let filtered = products
    
    if (selectedCategory) {
      filtered = filtered.filter(p => p.categoryId === selectedCategory)
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase()
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.brand.toLowerCase().includes(query) || 
        p.model.toLowerCase().includes(query)
      )
    }
    
    return filtered
  }, [products, selectedCategory, searchQuery])

  // Calculate total price
  const totalPrice = useMemo(() => {
    return buildComponents.reduce((total, buildComp) => {
      return total + (buildComp.component?.price || 0)
    }, 0)
  }, [buildComponents])

  // Handle component selection
  const handleSelectComponent = (component: PCComponent) => {
    setBuildComponents(prev => prev.map(buildComp => 
      buildComp.categoryId === component.categoryId 
        ? { ...buildComp, component }
        : buildComp
    ))
  }

  // Handle component removal
  const handleRemoveComponent = (categoryId: number) => {
    setBuildComponents(prev => prev.map(buildComp => 
      buildComp.categoryId === categoryId 
        ? { ...buildComp, component: null }
        : buildComp
    ))
  }

  return (
    <div className="page bg-grid bg-radial">
      <div className="layout">
        <main className="main">
          <section className="hero">
            <h1 className="hero-title">PC Builder</h1>
            <p className="hero-subtitle">Chọn từng linh kiện để xây dựng PC hoàn chỉnh của bạn.</p>
          </section>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px', padding: '24px' }}>
            {/* Build Components Section */}
            <div>
              <h2 style={{ color: 'white', fontSize: '24px', fontWeight: '600', marginBottom: '20px' }}>
                Linh kiện PC
              </h2>
              
              <div style={{ display: 'grid', gap: '16px' }}>
                {buildCategories.map((category) => {
                  const buildComp = buildComponents.find(bc => bc.categoryId === category.id)
                  const component = buildComp?.component
                  
                  return (
                    <div
                      key={category.id}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        padding: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => setSelectedCategory(category.id)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: component ? '12px' : '0' }}>
                        <span style={{ fontSize: '24px' }}>{category.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '600', margin: 0 }}>
                              {category.name}
                            </h3>
                            {category.required && (
                              <span style={{ 
                                background: '#ef4444', 
                                color: 'white', 
                                fontSize: '10px', 
                                padding: '2px 6px', 
                                borderRadius: '4px',
                                fontWeight: '500'
                              }}>
                                BẮT BUỘC
                              </span>
                            )}
                          </div>
                          {!component && (
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', margin: '4px 0 0 0' }}>
                              Click để chọn {category.name.toLowerCase()}
                            </p>
                          )}
                        </div>
                        {component && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveComponent(category.id)
                            }}
                            style={{
                              background: 'rgba(239, 68, 68, 0.2)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              borderRadius: '6px',
                              padding: '6px',
                              color: '#ef4444',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      
                      {component && (
                        <div style={{
                          background: 'rgba(255,255,255,0.05)',
                          borderRadius: '8px',
                          padding: '12px',
                          border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img 
                              src={component.image} 
                              alt={component.name}
                              style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }}
                            />
                            <div style={{ flex: 1 }}>
                              <h4 style={{ color: 'white', fontSize: '14px', fontWeight: '600', margin: '0 0 4px 0' }}>
                                {component.name}
                              </h4>
                              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: '0 0 4px 0' }}>
                                {component.brand} - {component.model}
                              </p>
                              {component.price > 0 && (
                                <p style={{ color: '#3b82f6', fontSize: '14px', fontWeight: '600', margin: 0 }}>
                                  {component.price.toLocaleString('vi-VN')} VND
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Product Selection & Summary Section */}
            <div>
              {/* Search and Category Filter */}
              <div style={{ marginBottom: '24px' }}>
                <input
                  type="text"
                  placeholder="Tìm kiếm linh kiện..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    marginBottom: '12px'
                  }}
                />
                
                {selectedCategory && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
                      Đang chọn: {buildCategories.find(c => c.id === selectedCategory)?.name}
                    </span>
                    <button
                      onClick={() => setSelectedCategory(null)}
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        color: 'white',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Product List */}
              {selectedCategory && (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                    Chọn {buildCategories.find(c => c.id === selectedCategory)?.name}
                  </h3>
                  
                  {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.6)' }}>
                      Đang tải sản phẩm...
                    </div>
                  ) : (
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      {filteredProducts.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => {
                            handleSelectComponent(product)
                            setSelectedCategory(null)
                            setSearchQuery('')
                          }}
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img 
                              src={product.image} 
                              alt={product.name}
                              style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                            />
                            <div style={{ flex: 1 }}>
                              <h4 style={{ color: 'white', fontSize: '14px', fontWeight: '600', margin: '0 0 4px 0' }}>
                                {product.name}
                              </h4>
                              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: '0 0 4px 0' }}>
                                {product.brand} - {product.model}
                              </p>
                              {product.price > 0 && (
                                <p style={{ color: '#3b82f6', fontSize: '14px', fontWeight: '600', margin: 0 }}>
                                  {product.price.toLocaleString('vi-VN')} VND
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {filteredProducts.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.6)' }}>
                          Không tìm thấy sản phẩm nào
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Build Summary */}
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                  Tổng kết Build
                </h3>
                
                <div style={{ marginBottom: '16px' }}>
                  {buildComponents.map((buildComp) => {
                    if (!buildComp.component) return null
                    const category = buildCategories.find(c => c.id === buildComp.categoryId)
                    return (
                      <div key={buildComp.categoryId} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '8px 0',
                        borderBottom: '1px solid rgba(255,255,255,0.1)'
                      }}>
                        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                          {category?.icon} {buildComp.category}
                        </span>
                        <span style={{ color: '#3b82f6', fontSize: '14px', fontWeight: '600' }}>
                          {buildComp.component.price.toLocaleString('vi-VN')} VND
                        </span>
                      </div>
                    )
                  })}
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '12px 0',
                  borderTop: '2px solid rgba(255,255,255,0.2)',
                  marginTop: '12px'
                }}>
                  <span style={{ color: 'white', fontSize: '18px', fontWeight: '700' }}>
                    Tổng cộng:
                  </span>
                  <span style={{ color: '#3b82f6', fontSize: '20px', fontWeight: '700' }}>
                    {totalPrice.toLocaleString('vi-VN')} VND
                  </span>
                </div>
                
                <button
                  style={{
                    width: '100%',
                    background: '#1e3a8a',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginTop: '16px',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#3b82f6'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#1e3a8a'
                  }}
                >
                  Lưu Build
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default PCBuilderPage
