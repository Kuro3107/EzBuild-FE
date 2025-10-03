import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiService } from '../../services/api'
import '../../Homepage.css'

interface CoolingItem {
  id: number
  name: string
  brand: string
  price: number
  image: string
  specs: {
    type: string
    socket: string
    fanSize: string
    fanCount: string
    noiseLevel: string
    tdp: string
    height: string
    weight: string
    material: string
    warranty: string
    rgb: boolean
    liquidCooling: boolean
  }
  features: string[]
  rating: number
  reviews: number
  inStock: boolean
}

function CoolingPage() {
  const [priceRange, setPriceRange] = useState<[number, number]>([20, 300])
  const [searchTerm, setSearchTerm] = useState('')
  const [coolers, setCoolers] = useState<CoolingItem[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch Cooling (category_id = 8) – giống pattern trang RAM
  useEffect(() => {
    const fetchCoolers = async () => {
      setLoading(true)
      try {
        const products = await ApiService.getProductsByCategory(8)

        interface CoolingApiProduct {
          id?: number
          name?: string
          brand?: string
          specs?: string
          image_url1?: string
          imageUrl1?: string
          type?: string
          socket?: string
          fan_size?: string | number
          fanSize?: string | number
          fan_count?: string | number
          fanCount?: string | number
          noise_level?: string
          tdp_watt?: number | string
          tdpWatt?: number | string
          height?: string | number
          weight?: string | number
          material?: string
          warranty?: string | number
          rgb?: boolean
          liquid_cooling?: boolean
          liquidCooling?: boolean
          productPrices?: Array<{ price: number }>
        }

        const formatted: CoolingItem[] = (products as CoolingApiProduct[]).map((item) => {
          const specsString = String(item.specs || '')

          const typeField = item.type || (specsString.match(/(AIR|LIQUID)/i)?.[0] ?? '')
          const socketField = item.socket || (specsString.match(/(AM\d+|AM\d+\+|LGA\d+)/i)?.[0] ?? '')
          const fanSizeField = item.fan_size ?? item.fanSize ?? (specsString.match(/(120|140|92)mm/i)?.[0] ?? '')
          const fanCountField = item.fan_count ?? item.fanCount ?? (specsString.match(/(\d+)\s*fans?/i)?.[1] ?? '')
          const noiseField = item.noise_level || (specsString.match(/(\d+\.?\d*)\s*dB(A)?/i)?.[0] ?? '')
          const tdpField = item.tdp_watt ?? item.tdpWatt ?? (specsString.match(/(\d+)\s*W/i)?.[1] ?? '')
          const heightField = item.height || (specsString.match(/(\d+\.?\d*)\s*mm\s*height/i)?.[1] ?? '')
          const weightField = item.weight || (specsString.match(/(\d+\.?\d*)\s*g/i)?.[1] ?? '')
          const materialField = item.material || (specsString.match(/(ALUMINUM|COPPER|NICKEL)/i)?.[0] ?? '')
          const warrantyField = item.warranty || (specsString.match(/(\d+)\s*year/i)?.[1] ?? '')

          const prices = item.productPrices || []
          const minPrice = prices.length ? Math.min(...prices.map(p => p.price)) : 0

          return {
            id: Number(item.id) || 0,
            name: String(item.name) || 'Unknown Cooling',
            brand: String(item.brand) || 'Unknown',
            price: minPrice,
            image: String(item.image_url1 || item.imageUrl1 || 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop'),
            specs: {
              type: typeField ? String(typeField).toUpperCase() : 'Unknown',
              socket: socketField ? String(socketField).toUpperCase() : 'Unknown',
              fanSize: fanSizeField ? `${String(fanSizeField).toUpperCase()}` : 'Unknown',
              fanCount: fanCountField ? String(fanCountField) : 'Unknown',
              noiseLevel: noiseField ? String(noiseField).toUpperCase() : 'Unknown',
              tdp: tdpField ? `${String(tdpField)}W` : 'Unknown',
              height: heightField ? `${String(heightField)}mm` : 'Unknown',
              weight: weightField ? `${String(weightField)}g` : 'Unknown',
              material: materialField ? String(materialField).toUpperCase() : 'Unknown',
              warranty: warrantyField ? `${String(warrantyField)} Years` : 'Unknown',
              rgb: Boolean(item.rgb ?? true),
              liquidCooling: Boolean(item.liquid_cooling ?? item.liquidCooling ?? false),
            },
            features: ['Unknown'],
            rating: 4.0,
            reviews: 0,
            inStock: true
          }
        })

        setCoolers(formatted)
      } catch (err) {
        console.error('Error fetching Cooling:', err)
        setCoolers([])
      } finally {
        setLoading(false)
      }
    }

    fetchCoolers()
  }, [])

  // Dữ liệu từ API
  const allCoolers = coolers

  // Filter giống RAM: chỉ áp dụng price khi price > 0, và search theo name/brand
  const filteredCoolers = allCoolers.filter((coolerItem) => {
    if (coolerItem.price > 0 && (coolerItem.price < priceRange[0] || coolerItem.price > priceRange[1])) {
      return false
    }
    if (searchTerm && !coolerItem.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !coolerItem.brand.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    return true
  })

  return (
    <div className="page bg-grid bg-radial">
      <div className="layout">

        <main className="main">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 text-sm text-white/70">
              <span>Products</span>
              <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
              <span className="font-medium text-white">Cooling</span>
            </div>
            <div className="flex items-center gap-3">
              <select className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-md text-sm border border-white/20"><option>Default</option></select>
              <input type="text" placeholder="Search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-md text-sm w-48 border border-white/20 placeholder-white/60" />
            </div>
          </div>

          <div className="flex">
            <div className="w-80 hidden md:block pr-6">
              <div className="rounded-lg border border-white/20 bg-white/10 p-4 space-y-6">
                <div>
                  <h3 className="text-base font-semibold mb-3 text-white">Price</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-white/60">
                      <span>$20</span>
                      <span>$300</span>
                    </div>
                    <input 
                      type="range" 
                      min="20" 
                      max="300" 
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1" style={{ maxWidth: '100%', overflow: 'hidden' }}>
              {loading && (
                <div className="flex justify-center items-center py-12">
                  <div className="text-lg text-white/70">Đang tải dữ liệu Cooling...</div>
                </div>
              )}

              {filteredCoolers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-lg text-white/70 mb-4">
                    {coolers.length === 0 ? 'Không có Cooling nào trong database' : 'Không tìm thấy Cooling nào phù hợp'}
                  </div>
                  <div className="text-sm text-white/50 mb-4">
                    {coolers.length === 0 ? 'Vui lòng thêm Cooling vào database' : 'Thử điều chỉnh bộ lọc hoặc tìm kiếm khác'}
                  </div>
                </div>
              ) : (
                <div className="product-grid">
                  {filteredCoolers.map((coolerItem) => (
                    <div key={coolerItem.id} className="rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 transition">
                      <div className="p-4">
                        <img src={coolerItem.image} alt={coolerItem.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                        <div className="text-sm font-medium mb-2 line-clamp-2 text-white">{coolerItem.name}</div>
                        <div className="text-lg font-bold mb-3 text-white">
                          {coolerItem.price > 0 ? `${coolerItem.price.toLocaleString('vi-VN')} VND` : 'Liên hệ'}
                        </div>
                        <div className="space-y-1 text-xs text-white/60 mb-4">
                          <div className="flex justify-between"><span>Type:</span><span className="text-white">{coolerItem.specs.type}</span></div>
                          <div className="flex justify-between"><span>Socket:</span><span className="text-white">{coolerItem.specs.socket}</span></div>
                          <div className="flex justify-between"><span>Fan Size:</span><span className="text-white">{coolerItem.specs.fanSize}</span></div>
                          <div className="flex justify-between"><span>Fan Count:</span><span className="text-white">{coolerItem.specs.fanCount}</span></div>
                          <div className="flex justify-between"><span>TDP:</span><span className="text-white">{coolerItem.specs.tdp}</span></div>
                        </div>
                        <button className="w-full btn-primary">+ Add to build</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default CoolingPage


