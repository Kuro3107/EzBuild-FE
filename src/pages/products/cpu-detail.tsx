import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import '../../Homepage.css'
import { ApiService } from '../../services/api'

interface CPUItem {
  id: number
  name: string
  brand: string
  price: string
  image: string
  specs: {
    socketType: string
    cores: number
    threads: number
    baseClock: string
    boostClock: string
    tdp: string
    integratedGraphics: boolean
    cache: string
    lithography: string
    memoryType: string
    maxMemory: string
  }
  features: string[]
  rating: number
  reviews: number
  inStock: boolean
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

function CPUDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [cpu, setCpu] = useState<CPUItem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchCPUDetail(parseInt(id))
    }
  }, [id])

  const fetchCPUDetail = async (cpuId: number) => {
    setLoading(true)
    try {
      const cpuData = await ApiService.getCPUsOnly()
      
      if (cpuData.length === 0) {
        setCpu(null)
        return
      }
      
      // Tìm CPU theo ID
      const foundCPU = cpuData.find((item: Record<string, unknown>) => Number(item.id) === cpuId)
      
      if (!foundCPU) {
        setCpu(null)
        return
      }
      
      // Convert API data to CPUItem format
      const specsString = String(foundCPU.specs || '')
      const baseClockMatch = specsString.match(/(\d+\.?\d*)\s*GHz/)
      const coresMatch = specsString.match(/(\d+)-Core/)
      const baseClock = baseClockMatch ? `${baseClockMatch[1]} GHz` : 'Unknown'
      const cores = coresMatch ? parseInt(coresMatch[1]) : 0
      const threads = cores * 2
      
      const productPrices = foundCPU.productPrices as Array<{
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
      
      const formattedCPU: CPUItem = {
        id: Number(foundCPU.id) || 0,
        name: String(foundCPU.name) || 'Unknown CPU',
        brand: String(foundCPU.brand) || 'Unknown',
        price: priceRange,
        image: String(foundCPU.image_url1 || foundCPU.imageUrl1 || 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop'),
        specs: {
          socketType: String(foundCPU.socket) || 'Unknown',
          cores: cores,
          threads: threads,
          baseClock: baseClock,
          boostClock: 'Unknown',
          tdp: `${Number(foundCPU.tdp_watt || foundCPU.tdpWatt) || 0}W`,
          integratedGraphics: true,
          cache: 'Unknown',
          lithography: 'Unknown',
          memoryType: 'Unknown',
          maxMemory: 'Unknown'
        },
        features: ['Unknown'],
        rating: 4.0,
        reviews: 0,
        inStock: true,
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
      
      setCpu(formattedCPU)
    } catch (err) {
      console.error('Error fetching CPU detail:', err)
      setCpu(null)
    } finally {
      setLoading(false)
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

  if (!cpu) {
    return (
      <div className="page bg-grid bg-radial">
        <div className="layout">
          <main className="main">
            <div className="text-center py-12">
              <div className="text-lg text-white/70 mb-4">Không tìm thấy sản phẩm</div>
              <button 
                onClick={() => navigate('/products/cpu')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                ← Quay lại danh sách CPU
              </button>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="page bg-grid bg-radial">
      <div className="layout">
        <main className="main">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-sm">
            <span 
              onClick={() => navigate('/products/cpu')}
              className="text-white/70 hover:text-white cursor-pointer transition-colors duration-200"
            >
              📦 Products
            </span>
            <svg className="w-3 h-3 text-white/60" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
            </svg>
            <span 
              onClick={() => navigate('/products/cpu')}
              className="text-white/70 hover:text-white cursor-pointer transition-colors duration-200"
            >
              🖥️ CPU
            </span>
            <svg className="w-3 h-3 text-white/60" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
            </svg>
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 font-medium rounded-md border border-blue-400/30">
              {cpu.name}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Hình ảnh bên trái */}
            <div className="space-y-4">
              <div className="aspect-square rounded-lg overflow-hidden bg-white/10 border border-white/20">
                <img
                  src={cpu.image}
                  alt={cpu.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Thông tin cơ bản */}
              <div className="rounded-lg border border-white/20 bg-white/10 p-6">
                <h1 className="text-2xl font-bold text-white mb-2">{cpu.name}</h1>
                <p className="text-lg text-white/70 mb-4">{cpu.brand}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/70">Socket:</span>
                    <span className="text-white">{cpu.specs.socketType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Cores:</span>
                    <span className="text-white">{cpu.specs.cores}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Threads:</span>
                    <span className="text-white">{cpu.specs.threads}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Base Clock:</span>
                    <span className="text-white">{cpu.specs.baseClock}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">TDP:</span>
                    <span className="text-white">{cpu.specs.tdp}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Thông tin giá bên phải */}
            <div className="space-y-6">
              {/* Giá tổng quan */}
              <div className="rounded-lg border border-white/20 bg-white/10 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Giá sản phẩm</h2>
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {cpu.price}
                </div>
                <p className="text-sm text-white/60">
                  Giá từ {cpu.productPrices?.length || 0} nhà cung cấp
                </p>
              </div>

              {/* Danh sách giá từ các supplier */}
              {cpu.productPrices && cpu.productPrices.length > 0 && (
                <div className="rounded-lg border border-white/20 bg-white/10 p-6">
                  <h3 className="text-lg font-semibold mb-4 text-white">Giá từ các nhà cung cấp</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {cpu.productPrices
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
                    cpu.inStock 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-xl transform hover:-translate-y-0.5' 
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                  disabled={!cpu.inStock}
                >
                  {cpu.inStock ? '🛒 Add to Build' : '❌ Out of Stock'}
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

export default CPUDetailPage
