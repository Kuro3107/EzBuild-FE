import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import '../../Homepage.css'
import { ApiService } from '../../services/api'

interface ProductItem {
  id: number
  name: string
  brand: string
  price: string
  image: string
  specs: Record<string, string | number | boolean>
  features: string[]
  rating: number
  reviews: number
  inStock: boolean
  category: string
  categoryId: number
  productPrices?: Array<{
    id: number
    supplier: {
      id: number
      name: string
      website: string
    }
    price: number
    supplierLink: string
    updatedAt: string
  }>
}

// Mapping các category ID với tên và icon
const CATEGORY_INFO: Record<number, { name: string; icon: string; route: string }> = {
  1: { name: 'CPU', icon: '🖥️', route: '/products/cpu' },
  2: { name: 'GPU', icon: '🎮', route: '/products/gpu' },
  3: { name: 'RAM', icon: '💾', route: '/products/ram' },
  4: { name: 'Mainboard', icon: '🔌', route: '/products/mainboard' },
  5: { name: 'Storage', icon: '💿', route: '/products/storage' },
  6: { name: 'PSU', icon: '⚡', route: '/products/psu' },
  7: { name: 'Case', icon: '📦', route: '/products/case' },
  8: { name: 'Cooling', icon: '❄️', route: '/products/cooling' },
  9: { name: 'Monitor', icon: '🖥️', route: '/products/monitor' },
  10: { name: 'Keyboard', icon: '⌨️', route: '/products/keyboard' },
  11: { name: 'Mouse', icon: '🖱️', route: '/products/mouse' },
  12: { name: 'Headset & Speaker', icon: '🎧', route: '/products/headset-speaker' }
}

function ProductDetailPage() {
  const { id } = useParams<{ category: string; id: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<ProductItem | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProductDetail = useCallback(async (productId: number) => {
    setLoading(true)
    try {
      // Lấy tất cả products từ API
      const allProducts = await ApiService.getAllProducts() // Sử dụng method chung để lấy tất cả products
      
      if (allProducts.length === 0) {
        setProduct(null)
        return
      }
      
      // Tìm product theo ID
      const foundProduct = allProducts.find((item: Record<string, unknown>) => Number(item.id) === productId)
      
      if (!foundProduct) {
        setProduct(null)
        return
      }
      
      // Lấy thông tin category
      const categoryId = Number(foundProduct.category_id) || Number((foundProduct.category as { id?: number })?.id) || 1
      const categoryInfo = CATEGORY_INFO[categoryId] || { name: 'Unknown', icon: '📦', route: '/products' }
      
      // Xử lý productPrices
      const productPrices = foundProduct.productPrices as Array<{
        id: number
        supplier: {
          id: number
          name: string
          website: string
        }
        price: number
        supplierLink: string
        updatedAt: string
      }> || []
      
      // Tính min-max price range
      let priceRange = 'Liên hệ'
      if (productPrices.length > 0) {
        const prices = productPrices.map(p => p.price)
        const minPrice = Math.min(...prices)
        const maxPrice = Math.max(...prices)
        
        if (minPrice === maxPrice) {
          priceRange = `${minPrice.toLocaleString('vi-VN')} VND`
        } else {
          priceRange = `${minPrice.toLocaleString('vi-VN')} - ${maxPrice.toLocaleString('vi-VN')} VND`
        }
      }
      
      // Xử lý specs dựa trên loại sản phẩm
      const specs = parseSpecsByCategory(foundProduct, categoryId)
      
      const formattedProduct: ProductItem = {
        id: Number(foundProduct.id) || 0,
        name: String(foundProduct.name) || 'Unknown Product',
        brand: String(foundProduct.brand) || 'Unknown',
        price: priceRange,
        image: String(foundProduct.image_url1 || foundProduct.imageUrl1 || 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop'),
        specs: specs,
        features: ['Unknown'],
        rating: 4.0,
        reviews: 0,
        inStock: true,
        category: categoryInfo.name,
        categoryId: categoryId,
        productPrices: productPrices.map(pp => ({
          id: pp.id || 0,
          supplier: {
            id: pp.supplier?.id || 0,
            name: pp.supplier?.name || 'Unknown Supplier',
            website: pp.supplier?.website || ''
          },
          price: pp.price || 0,
          supplierLink: pp.supplierLink || '',
          updatedAt: pp.updatedAt || ''
        }))
      }
      
      setProduct(formattedProduct)
    } catch (err) {
      console.error('Error fetching product detail:', err)
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (id) {
      fetchProductDetail(parseInt(id))
    }
  }, [id, fetchProductDetail])

  // Hàm parse specs dựa trên category
  const parseSpecsByCategory = (product: Record<string, unknown>, categoryId: number): Record<string, string | number | boolean> => {
    const specsString = String(product.specs || '')
    
    switch (categoryId) {
      case 1: { // CPU
        const baseClockMatch = specsString.match(/(\d+\.?\d*)\s*GHz/)
        const coresMatch = specsString.match(/(\d+)-Core/)
        const baseClock = baseClockMatch ? `${baseClockMatch[1]} GHz` : 'Unknown'
        const cores = coresMatch ? parseInt(coresMatch[1]) : 0
        const threads = cores * 2
        
        return {
          socketType: String(product.socket) || 'Unknown',
          cores: cores,
          threads: threads,
          baseClock: baseClock,
          boostClock: 'Unknown',
          tdp: `${Number(product.tdp_watt || product.tdpWatt) || 0}W`,
          integratedGraphics: true,
          cache: 'Unknown',
          lithography: 'Unknown',
          memoryType: 'Unknown',
          maxMemory: 'Unknown'
        }
      }
      
      case 2: { // GPU
        return {
          chipset: String(product.chipset) || 'Unknown',
          memory: String(product.memory) || 'Unknown',
          memoryType: String(product.memoryType) || 'Unknown',
          baseClock: String(product.baseClock) || 'Unknown',
          boostClock: String(product.boostClock) || 'Unknown',
          tdp: `${Number(product.tdp_watt || product.tdpWatt) || 0}W`,
          interface: String(product.interface) || 'Unknown',
          outputs: String(product.outputs) || 'Unknown'
        }
      }
      
      case 3: { // RAM
        return {
          capacity: String(product.capacity) || 'Unknown',
          type: String(product.type) || 'Unknown',
          speed: String(product.speed) || 'Unknown',
          latency: String(product.latency) || 'Unknown',
          voltage: String(product.voltage) || 'Unknown',
          formFactor: String(product.formFactor) || 'Unknown'
        }
      }
      
      case 4: { // Mainboard
        return {
          socket: String(product.socket) || 'Unknown',
          chipset: String(product.chipset) || 'Unknown',
          formFactor: String(product.formFactor) || 'Unknown',
          memorySlots: String(product.memorySlots) || 'Unknown',
          maxMemory: String(product.maxMemory) || 'Unknown',
          expansionSlots: String(product.expansionSlots) || 'Unknown',
          storage: String(product.storage) || 'Unknown',
          networking: String(product.networking) || 'Unknown'
        }
      }
      
      case 5: { // Storage
        return {
          capacity: String(product.capacity) || 'Unknown',
          type: String(product.type) || 'Unknown',
          interface: String(product.interface) || 'Unknown',
          readSpeed: String(product.readSpeed) || 'Unknown',
          writeSpeed: String(product.writeSpeed) || 'Unknown',
          formFactor: String(product.formFactor) || 'Unknown',
          endurance: String(product.endurance) || 'Unknown'
        }
      }
      
      case 6: { // PSU
        return {
          wattage: String(product.wattage) || 'Unknown',
          efficiency: String(product.efficiency) || 'Unknown',
          modular: String(product.modular) || 'Unknown',
          formFactor: String(product.formFactor) || 'Unknown',
          connectors: String(product.connectors) || 'Unknown',
          fan: String(product.fan) || 'Unknown'
        }
      }
      
      case 7: { // Case
        return {
          formFactor: String(product.formFactor) || 'Unknown',
          dimensions: String(product.dimensions) || 'Unknown',
          material: String(product.material) || 'Unknown',
          color: String(product.color) || 'Unknown',
          fans: String(product.fans) || 'Unknown',
          driveBays: String(product.driveBays) || 'Unknown',
          expansionSlots: String(product.expansionSlots) || 'Unknown'
        }
      }
      
      case 8: { // Cooling
        return {
          type: String(product.type) || 'Unknown',
          socket: String(product.socket) || 'Unknown',
          fanSize: String(product.fanSize) || 'Unknown',
          noiseLevel: String(product.noiseLevel) || 'Unknown',
          tdp: String(product.tdp) || 'Unknown',
          height: String(product.height) || 'Unknown',
          material: String(product.material) || 'Unknown'
        }
      }
      
      case 9: { // Monitor
        return {
          size: String(product.size) || 'Unknown',
          resolution: String(product.resolution) || 'Unknown',
          refreshRate: String(product.refreshRate) || 'Unknown',
          panelType: String(product.panelType) || 'Unknown',
          responseTime: String(product.responseTime) || 'Unknown',
          brightness: String(product.brightness) || 'Unknown',
          connectivity: String(product.connectivity) || 'Unknown'
        }
      }
      
      case 10: { // Keyboard
        return {
          type: String(product.type) || 'Unknown',
          switch: String(product.switch) || 'Unknown',
          layout: String(product.layout) || 'Unknown',
          connectivity: String(product.connectivity) || 'Unknown',
          backlight: String(product.backlight) || 'Unknown',
          material: String(product.material) || 'Unknown',
          dimensions: String(product.dimensions) || 'Unknown'
        }
      }
      
      case 11: { // Mouse
        return {
          type: String(product.type) || 'Unknown',
          sensor: String(product.sensor) || 'Unknown',
          dpi: String(product.dpi) || 'Unknown',
          connectivity: String(product.connectivity) || 'Unknown',
          buttons: String(product.buttons) || 'Unknown',
          weight: String(product.weight) || 'Unknown',
          dimensions: String(product.dimensions) || 'Unknown'
        }
      }
      
      case 12: { // Headset & Speaker
        return {
          type: String(product.type) || 'Unknown',
          connectivity: String(product.connectivity) || 'Unknown',
          frequency: String(product.frequency) || 'Unknown',
          impedance: String(product.impedance) || 'Unknown',
          microphone: String(product.microphone) || 'Unknown',
          weight: String(product.weight) || 'Unknown',
          color: String(product.color) || 'Unknown'
        }
      }
      
      default: {
        return {
          specs: specsString || 'Unknown'
        }
      }
    }
  }

  if (loading) {
    return (
      <div className="page bg-grid bg-radial">
        <div className="layout">
          <main className="main">
            <div className="flex justify-center items-center py-12">
              <div className="text-lg text-white/70">Đang tải thông tin sản phẩm...</div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="page bg-grid bg-radial">
        <div className="layout">
          <main className="main">
            <div className="text-center py-12">
              <div className="text-lg text-white/70 mb-4">Không tìm thấy sản phẩm</div>
              <button 
                onClick={() => navigate('/products')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                ← Quay lại danh sách sản phẩm
              </button>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const categoryInfo = CATEGORY_INFO[product.categoryId] || { name: 'Unknown', icon: '📦', route: '/products' }

  return (
    <div className="page bg-grid bg-radial">
      <div className="layout">
        <main className="main">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-sm">
            <span 
              onClick={() => navigate('/products')}
              className="text-white/70 hover:text-white cursor-pointer transition-colors duration-200"
            >
              📦 Products
            </span>
            <svg className="w-3 h-3 text-white/60" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
            </svg>
            <span 
              onClick={() => navigate(categoryInfo.route)}
              className="text-white/70 hover:text-white cursor-pointer transition-colors duration-200"
            >
              {categoryInfo.icon} {categoryInfo.name}
            </span>
            <svg className="w-3 h-3 text-white/60" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
            </svg>
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 font-medium rounded-md border border-blue-400/30">
              {product.name}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Hình ảnh bên trái */}
            <div className="space-y-4">
              <div className="aspect-square rounded-lg overflow-hidden bg-white/10 border border-white/20">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Thông tin cơ bản */}
              <div className="rounded-lg border border-white/20 bg-white/10 p-6">
                <h1 className="text-2xl font-bold text-white mb-2">{product.name}</h1>
                <p className="text-lg text-white/70 mb-4">{product.brand}</p>
                
                <div className="space-y-2 text-sm">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-white/70 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                      <span className="text-white">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Thông tin giá bên phải */}
            <div className="space-y-6">
              {/* Giá tổng quan */}
              <div className="rounded-lg border border-white/20 bg-white/10 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Giá sản phẩm</h2>
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {product.price}
                </div>
                <p className="text-sm text-white/60">
                  Giá từ {product.productPrices?.length || 0} nhà cung cấp
                </p>
              </div>

              {/* Danh sách giá từ các supplier */}
              {product.productPrices && product.productPrices.length > 0 && (
                <div className="rounded-lg border border-white/20 bg-white/10 p-6">
                  <h3 className="text-lg font-semibold mb-4 text-white">Giá từ các nhà cung cấp</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {product.productPrices
                      .sort((a, b) => a.price - b.price)
                      .map((priceInfo, index) => (
                        <div key={index} className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                          <div className="flex-1">
                            <div className="text-white font-medium">
                              {priceInfo.supplier.name}
                            </div>
                            <div className="text-white/60 text-sm">
                              ID: {priceInfo.supplier.id}
                            </div>
                            <div className="text-white/50 text-xs">
                              Cập nhật: {new Date(priceInfo.updatedAt).toLocaleDateString('vi-VN')}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-green-400 font-bold text-lg">
                              {priceInfo.price.toLocaleString('vi-VN')} VND
                            </div>
                            {priceInfo.supplierLink && (
                              <a 
                                href={priceInfo.supplierLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-block mt-2 px-4 py-2 text-cyan-400 text-sm font-medium rounded-lg border border-cyan-400 bg-transparent hover:bg-cyan-400 hover:text-white transition-all duration-200"
                              >
                                Xem tại shop
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Nút hành động */}
              <div className="space-y-3">
                <button 
                  className={`w-full px-6 py-4 rounded-lg font-bold text-lg transition-all duration-200 shadow-lg ${
                    product.inStock 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-xl transform hover:-translate-y-0.5' 
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                  disabled={!product.inStock}
                >
                  {product.inStock ? '🛒 Add to Build' : '❌ Out of Stock'}
                </button>
                <button className="w-full border-2 border-orange-400 text-orange-400 bg-orange-400/10 px-6 py-4 rounded-lg font-bold text-lg hover:bg-orange-400 hover:text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  ⚖️ So sánh sản phẩm
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default ProductDetailPage
