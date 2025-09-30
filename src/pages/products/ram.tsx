import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import '../../Homepage.css'
import { ApiService } from '../../services/api'

interface RAMItem {
  id: number
  name: string
  brand: string
  price: number
  image: string
  specs: {
    capacity: string
    speed: string
    type: string
    latency: string
    voltage: string
    modules: string
    rgb: boolean
    heatSpreader: boolean
    ecc: boolean
    registered: boolean
    formFactor: string
  }
  features: string[]
  rating: number
  reviews: number
  inStock: boolean
}

function RAMPage() {
  const [selectedRAM, setSelectedRAM] = useState<RAMItem | null>(null)
  const [priceRange, setPriceRange] = useState<[number, number]>([30, 500])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCapacities, setSelectedCapacities] = useState<string[]>([])
  const [selectedSpeeds, setSelectedSpeeds] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedLatencies, setSelectedLatencies] = useState<string[]>([])
  const [selectedVoltages, setSelectedVoltages] = useState<string[]>([])
  const [selectedModules, setSelectedModules] = useState<string[]>([])
  const [selectedRGB, setSelectedRGB] = useState<boolean | null>(null)
  const [selectedHeatSpreader, setSelectedHeatSpreader] = useState<boolean | null>(null)
  const [selectedECC, setSelectedECC] = useState<boolean | null>(null)
  
  // Popup states
  const [showCapacityPopup, setShowCapacityPopup] = useState(false)
  const [showSpeedPopup, setShowSpeedPopup] = useState(false)
  const [showTypePopup, setShowTypePopup] = useState(false)
  const [showBrandPopup, setShowBrandPopup] = useState(false)
  const [showLatencyPopup, setShowLatencyPopup] = useState(false)
  const [showVoltagePopup, setShowVoltagePopup] = useState(false)
  const [showModulesPopup, setShowModulesPopup] = useState(false)
  
  // Search terms for popups
  const [capacitySearch, setCapacitySearch] = useState('')
  const [speedSearch, setSpeedSearch] = useState('')
  const [typeSearch, setTypeSearch] = useState('')
  const [brandSearch, setBrandSearch] = useState('')
  const [latencySearch, setLatencySearch] = useState('')
  const [voltageSearch, setVoltageSearch] = useState('')
  const [modulesSearch, setModulesSearch] = useState('')
  // API states
  const [rams, setRams] = useState<RAMItem[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch RAMs from API (category_id = 4)
  useEffect(() => {
    const fetchRAMs = async () => {
      setLoading(true)
      try {
        const products = await ApiService.getProductsByCategory(4)

        interface RAMApiProduct {
          id?: number
          name?: string
          brand?: string
          specs?: string
          image_url1?: string
          imageUrl1?: string
          capacity?: number | string
          type?: string
          speed_mhz?: number
          speedMHz?: number
          speed?: number | string
          modules?: string
          rgb?: boolean
          productPrices?: Array<{ price: number }>
        }

        const formatted: RAMItem[] = (products as RAMApiProduct[]).map((item) => {
          const specsString = String(item.specs || '')
          const capacityField = item.capacity
          const speedField = item.speed_mhz ?? item.speedMHz ?? item.speed
          const typeField = item.type
          const modulesField = item.modules
          const latencyMatch = specsString.match(/CL\s*\d+/i)
          const voltageMatch = specsString.match(/(\d+\.\d+)V/i)

          const prices = item.productPrices || []
          const minPrice = prices.length ? Math.min(...prices.map(p => p.price)) : 0

          return {
            id: Number(item.id) || 0,
            name: String(item.name) || 'Unknown RAM',
            brand: String(item.brand) || 'Unknown',
            price: minPrice,
            image: String(item.image_url1 || item.imageUrl1 || 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop'),
            specs: {
              capacity: capacityField ? `${String(capacityField).replace(/\s*GB/i,'')}GB`.toUpperCase() : 'Unknown',
              speed: speedField ? `${String(speedField).replace(/\D/g,'')}MHz` : 'Unknown',
              type: typeField ? String(typeField).toUpperCase() : 'Unknown',
              latency: latencyMatch ? latencyMatch[0].toUpperCase() : 'Unknown',
              voltage: voltageMatch ? `${voltageMatch[1]}V` : 'Unknown',
              modules: modulesField ? String(modulesField).toUpperCase() : 'Unknown',
              rgb: Boolean(item.rgb ?? true),
              heatSpreader: true,
              ecc: false,
              registered: false,
              formFactor: 'DIMM'
            },
            features: ['Unknown'],
            rating: 4.0,
            reviews: 0,
            inStock: true
          }
        })

        setRams(formatted)
      } catch (err) {
        console.error('Error fetching RAMs:', err)
        setRams([])
      } finally {
        setLoading(false)
      }
    }

    fetchRAMs()
  }, [])

  // Dữ liệu từ API
  const allRAMs = rams

  // Filter logic
  const filteredRAMs = allRAMs.filter((ramItem) => {
    // Price filter - chỉ lọc nếu có giá > 0 (giống GPU/Mainboard)
    if (ramItem.price > 0 && (ramItem.price < priceRange[0] || ramItem.price > priceRange[1])) {
      return false
    }

    // Search filter
    if (searchTerm && !ramItem.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !ramItem.brand.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    // Capacity filter
    if (selectedCapacities.length > 0 && !selectedCapacities.includes(ramItem.specs.capacity)) {
      return false
    }

    // Speed filter
    if (selectedSpeeds.length > 0 && !selectedSpeeds.includes(ramItem.specs.speed)) {
      return false
    }

    // Type filter
    if (selectedTypes.length > 0 && !selectedTypes.includes(ramItem.specs.type)) {
      return false
    }

    // Brand filter
    if (selectedBrands.length > 0 && !selectedBrands.includes(ramItem.brand)) {
      return false
    }

    // Latency filter
    if (selectedLatencies.length > 0 && !selectedLatencies.includes(ramItem.specs.latency)) {
      return false
    }

    // Voltage filter
    if (selectedVoltages.length > 0 && !selectedVoltages.includes(ramItem.specs.voltage)) {
      return false
    }

    // Modules filter
    if (selectedModules.length > 0 && !selectedModules.includes(ramItem.specs.modules)) {
      return false
    }

    // RGB filter
    if (selectedRGB !== null && ramItem.specs.rgb !== selectedRGB) {
      return false
    }

    // Heat spreader filter
    if (selectedHeatSpreader !== null && ramItem.specs.heatSpreader !== selectedHeatSpreader) {
      return false
    }

    // ECC filter
    if (selectedECC !== null && ramItem.specs.ecc !== selectedECC) {
      return false
    }

    return true
  })

  const handleCapacityChange = (capacity: string) => {
    setSelectedCapacities(prev => 
      prev.includes(capacity) 
        ? prev.filter(c => c !== capacity)
        : [...prev, capacity]
    )
  }

  const handleSpeedChange = (speed: string) => {
    setSelectedSpeeds(prev => 
      prev.includes(speed) 
        ? prev.filter(s => s !== speed)
        : [...prev, speed]
    )
  }

  const handleTypeChange = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const handleBrandChange = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    )
  }

  const handleLatencyChange = (latency: string) => {
    setSelectedLatencies(prev => 
      prev.includes(latency) 
        ? prev.filter(l => l !== latency)
        : [...prev, latency]
    )
  }

  const handleVoltageChange = (voltage: string) => {
    setSelectedVoltages(prev => 
      prev.includes(voltage) 
        ? prev.filter(v => v !== voltage)
        : [...prev, voltage]
    )
  }

  const handleModulesChange = (modules: string) => {
    setSelectedModules(prev => 
      prev.includes(modules) 
        ? prev.filter(m => m !== modules)
        : [...prev, modules]
    )
  }

  const handleRGBChange = (value: boolean) => {
    setSelectedRGB(prev => prev === value ? null : value)
  }

  const handleHeatSpreaderChange = (value: boolean) => {
    setSelectedHeatSpreader(prev => prev === value ? null : value)
  }

  const handleECCChange = (value: boolean) => {
    setSelectedECC(prev => prev === value ? null : value)
  }

  // Popup component
  const FilterPopup = ({ 
    isOpen, 
    onClose, 
    title, 
    searchTerm, 
    onSearchChange, 
    options, 
    selectedItems, 
    onItemChange 
  }: {
    isOpen: boolean
    onClose: () => void
    title: string
    searchTerm: string
    onSearchChange: (value: string) => void
    options: string[]
    selectedItems: string[]
    onItemChange: (item: string) => void
  }) => {
    if (!isOpen) return null

    const filteredOptions = options.filter(option => 
      option.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div className="p-4 overflow-y-auto max-h-96">
            <div className="space-y-2">
              {filteredOptions.map((option) => (
                <label key={option} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(option)}
                    onChange={() => onItemChange(option)}
                    className="rounded"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page bg-grid bg-radial">
      <div className="layout">
        {/* Sidebar giống HomePage */}
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
            <span className="nav-item">Products</span>
            <a className="nav-item" href="#">Sales</a>
            <a className="nav-item" href="#">Compare</a>
            <a className="nav-item" href="#">PC Part Gallery</a>
          </div>

          <div>
            <div className="sidebar-group">Community</div>
            <a className="nav-item" href="#">Completed Builds</a>
            <a className="nav-item" href="#">Updates</a>
            <a className="nav-item" href="#">Setup Builder</a>
          </div>
        </aside>

        {/* Main */}
        <main className="main">
          {/* Breadcrumb + controls */}
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 text-sm text-black/70">
              <span>Products</span>
              <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
              <span className="font-medium text-black">RAM</span>
            </div>
            <div className="flex items-center gap-3">
              <select className="bg-black/5 hover:bg-black/10 text-black px-3 py-2 rounded-md text-sm">
                <option>Default</option>
              </select>
              <input 
                type="text" 
                placeholder="Search" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-black/5 hover:bg-black/10 text-black px-3 py-2 rounded-md text-sm w-48" 
              />
            </div>
          </div>

          <div className="flex">
            {/* Filters */}
            <div className="w-80 hidden md:block pr-6">
              <div className="rounded-lg border border-black/10 bg-white p-4 space-y-6">
                <div>
                  <h3 className="text-base font-semibold mb-3">Price</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-black/60">
                      <span>$30</span>
                      <span>$500</span>
                    </div>
                    <input 
                      type="range" 
                      min="30" 
                      max="500" 
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full" 
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Capacity</h3>
                  <div className="space-y-2 text-sm">
                    {['16GB','32GB','64GB'].map((capacity) => (
                      <label key={capacity} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedCapacities.includes(capacity)}
                          onChange={() => handleCapacityChange(capacity)}
                          className="rounded" 
                        />
                        <span>{capacity}</span>
                      </label>
                    ))}
                    <button onClick={() => setShowCapacityPopup(true)} className="text-blue-600 text-xs">Show More</button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Speed</h3>
                  <div className="space-y-2 text-sm">
                    {['2400MHz','3200MHz','3600MHz','5600MHz','6000MHz'].map((speed) => (
                      <label key={speed} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedSpeeds.includes(speed)}
                          onChange={() => handleSpeedChange(speed)}
                          className="rounded" 
                        />
                        <span>{speed}</span>
                      </label>
                    ))}
                    <button onClick={() => setShowSpeedPopup(true)} className="text-blue-600 text-xs">Show More</button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Type</h3>
                  <div className="space-y-2 text-sm">
                    {['DDR4','DDR5'].map((type) => (
                      <label key={type} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedTypes.includes(type)}
                          onChange={() => handleTypeChange(type)}
                          className="rounded" 
                        />
                        <span>{type}</span>
                      </label>
                    ))}
                    <button onClick={() => setShowTypePopup(true)} className="text-blue-600 text-xs">Show More</button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Brand</h3>
                  <div className="space-y-2 text-sm">
                    {['Corsair','G.Skill','Kingston','Crucial'].map((brand) => (
                      <label key={brand} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedBrands.includes(brand)}
                          onChange={() => handleBrandChange(brand)}
                          className="rounded" 
                        />
                        <span>{brand}</span>
                      </label>
                    ))}
                    <button onClick={() => setShowBrandPopup(true)} className="text-blue-600 text-xs">Show More</button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Latency</h3>
                  <div className="space-y-2 text-sm">
                    {['CL15','CL16','CL30','CL36'].map((latency) => (
                      <label key={latency} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedLatencies.includes(latency)}
                          onChange={() => handleLatencyChange(latency)}
                          className="rounded" 
                        />
                        <span>{latency}</span>
                      </label>
                    ))}
                    <button onClick={() => setShowLatencyPopup(true)} className="text-blue-600 text-xs">Show More</button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Voltage</h3>
                  <div className="space-y-2 text-sm">
                    {['1.2V','1.25V','1.35V'].map((voltage) => (
                      <label key={voltage} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedVoltages.includes(voltage)}
                          onChange={() => handleVoltageChange(voltage)}
                          className="rounded" 
                        />
                        <span>{voltage}</span>
                      </label>
                    ))}
                    <button onClick={() => setShowVoltagePopup(true)} className="text-blue-600 text-xs">Show More</button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Modules</h3>
                  <div className="space-y-2 text-sm">
                    {['2x8GB','2x16GB','2x32GB'].map((modules) => (
                      <label key={modules} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedModules.includes(modules)}
                          onChange={() => handleModulesChange(modules)}
                          className="rounded" 
                        />
                        <span>{modules}</span>
                      </label>
                    ))}
                    <button onClick={() => setShowModulesPopup(true)} className="text-blue-600 text-xs">Show More</button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">RGB Lighting</h3>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={selectedRGB === true}
                        onChange={() => handleRGBChange(true)}
                        className="rounded" 
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={selectedRGB === false}
                        onChange={() => handleRGBChange(false)}
                        className="rounded" 
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Heat Spreader</h3>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={selectedHeatSpreader === true}
                        onChange={() => handleHeatSpreaderChange(true)}
                        className="rounded" 
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={selectedHeatSpreader === false}
                        onChange={() => handleHeatSpreaderChange(false)}
                        className="rounded" 
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">ECC</h3>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={selectedECC === true}
                        onChange={() => handleECCChange(true)}
                        className="rounded" 
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={selectedECC === false}
                        onChange={() => handleECCChange(false)}
                        className="rounded" 
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid */}
            <div className="flex-1">
              {loading && (
                <div className="flex justify-center items-center py-12">
                  <div className="text-lg text-gray-600">Đang tải dữ liệu RAM...</div>
                </div>
              )}

              {filteredRAMs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-lg text-gray-600 mb-4">
                    {rams.length === 0 ? 'Không có RAM nào trong database' : 'Không tìm thấy RAM nào phù hợp'}
                  </div>
                  <div className="text-sm text-gray-500 mb-4">
                    {rams.length === 0 ? 'Vui lòng thêm RAM vào database' : 'Thử điều chỉnh bộ lọc hoặc tìm kiếm khác'}
                  </div>
                  {rams.length > 0 && (
                    <button 
                      onClick={() => {
                        setSearchTerm('')
                        setSelectedCapacities([])
                        setSelectedSpeeds([])
                        setSelectedTypes([])
                        setSelectedBrands([])
                        setSelectedLatencies([])
                        setSelectedVoltages([])
                        setSelectedModules([])
                        setSelectedRGB(null)
                        setSelectedHeatSpreader(null)
                        setSelectedECC(null)
                        setPriceRange([30, 500])
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Xóa tất cả bộ lọc
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {filteredRAMs.map((ramItem) => (
                    <div key={ramItem.id} className="rounded-lg border border-black/10 bg-white hover:bg-black/5 transition cursor-pointer" onClick={() => setSelectedRAM(ramItem)}>
                      <div className="p-4">
                        <img src={ramItem.image} alt={ramItem.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                        <div className="text-sm font-medium mb-2 line-clamp-2">{ramItem.name}</div>
                        <div className="text-lg font-bold mb-3">
                          {ramItem.price > 0 ? `${ramItem.price.toLocaleString('vi-VN')} VND` : 'Liên hệ'}
                        </div>
                        <div className="space-y-1 text-xs text-black/60 mb-4">
                          <div className="flex justify-between"><span>Capacity:</span><span className="text-black">{ramItem.specs.capacity}</span></div>
                          <div className="flex justify-between"><span>Speed:</span><span className="text-black">{ramItem.specs.speed}</span></div>
                          <div className="flex justify-between"><span>Type:</span><span className="text-black">{ramItem.specs.type}</span></div>
                          <div className="flex justify-between"><span>Latency:</span><span className="text-black">{ramItem.specs.latency}</span></div>
                          <div className="flex justify-between"><span>Modules:</span><span className="text-black">{ramItem.specs.modules}</span></div>
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

      {/* Product Detail Modal */}
      {selectedRAM && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{selectedRAM.name}</h2>
                  <p className="text-lg text-gray-600">{selectedRAM.brand}</p>
                </div>
                <button
                  onClick={() => setSelectedRAM(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <img
                    src={selectedRAM.image}
                    alt={selectedRAM.name}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                </div>
                
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-4">${selectedRAM.price}</div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Specifications</h3>
                    <div className="space-y-2">
                      {Object.entries(selectedRAM.specs).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                          <span className="font-medium">{value.toString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Features</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedRAM.features.map((feature, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <button 
                      className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                        selectedRAM.inStock 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={!selectedRAM.inStock}
                    >
                      {selectedRAM.inStock ? 'Add to Build' : 'Out of Stock'}
                    </button>
                    <button className="flex-1 border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                      Compare
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Popups */}
      <FilterPopup
        isOpen={showCapacityPopup}
        onClose={() => setShowCapacityPopup(false)}
        title="Capacity"
        searchTerm={capacitySearch}
        onSearchChange={setCapacitySearch}
        options={['4GB','8GB','16GB','32GB','64GB','128GB']}
        selectedItems={selectedCapacities}
        onItemChange={handleCapacityChange}
      />

      <FilterPopup
        isOpen={showSpeedPopup}
        onClose={() => setShowSpeedPopup(false)}
        title="Speed"
        searchTerm={speedSearch}
        onSearchChange={setSpeedSearch}
        options={['2133MHz','2400MHz','2666MHz','3000MHz','3200MHz','3600MHz','4000MHz','4800MHz','5200MHz','5600MHz','6000MHz','6400MHz']}
        selectedItems={selectedSpeeds}
        onItemChange={handleSpeedChange}
      />

      <FilterPopup
        isOpen={showTypePopup}
        onClose={() => setShowTypePopup(false)}
        title="Type"
        searchTerm={typeSearch}
        onSearchChange={setTypeSearch}
        options={['DDR3','DDR4','DDR5']}
        selectedItems={selectedTypes}
        onItemChange={handleTypeChange}
      />

      <FilterPopup
        isOpen={showBrandPopup}
        onClose={() => setShowBrandPopup(false)}
        title="Brand"
        searchTerm={brandSearch}
        onSearchChange={setBrandSearch}
        options={['Corsair','G.Skill','Kingston','Crucial','TeamGroup','Patriot','ADATA','HyperX','GeIL','OLOy']}
        selectedItems={selectedBrands}
        onItemChange={handleBrandChange}
      />

      <FilterPopup
        isOpen={showLatencyPopup}
        onClose={() => setShowLatencyPopup(false)}
        title="Latency"
        searchTerm={latencySearch}
        onSearchChange={setLatencySearch}
        options={['CL9','CL10','CL11','CL12','CL13','CL14','CL15','CL16','CL17','CL18','CL19','CL20','CL22','CL24','CL28','CL30','CL32','CL34','CL36','CL38','CL40']}
        selectedItems={selectedLatencies}
        onItemChange={handleLatencyChange}
      />

      <FilterPopup
        isOpen={showVoltagePopup}
        onClose={() => setShowVoltagePopup(false)}
        title="Voltage"
        searchTerm={voltageSearch}
        onSearchChange={setVoltageSearch}
        options={['1.2V','1.25V','1.35V','1.4V','1.5V']}
        selectedItems={selectedVoltages}
        onItemChange={handleVoltageChange}
      />

      <FilterPopup
        isOpen={showModulesPopup}
        onClose={() => setShowModulesPopup(false)}
        title="Modules"
        searchTerm={modulesSearch}
        onSearchChange={setModulesSearch}
        options={['1x4GB','1x8GB','1x16GB','1x32GB','2x4GB','2x8GB','2x16GB','2x32GB','4x4GB','4x8GB','4x16GB','4x32GB']}
        selectedItems={selectedModules}
        onItemChange={handleModulesChange}
      />
    </div>
  )
}

export default RAMPage
