import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../../Homepage.css'
import { ApiService } from '../../services/api'
import PriceRangeSlider from '../../components/PriceRangeSlider'

interface CPUItem {
  id: number
  name: string
  brand: string
  price: number
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
}

function CPUPage() {
  const [selectedCPU, setSelectedCPU] = useState<CPUItem | null>(null)
  const [priceRange, setPriceRange] = useState<[number, number]>([50, 2000])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSocketTypes, setSelectedSocketTypes] = useState<string[]>([])
  const [selectedCores, setSelectedCores] = useState<string[]>([])
  const [selectedBaseClocks, setSelectedBaseClocks] = useState<string[]>([])
  const [selectedBoostClocks, setSelectedBoostClocks] = useState<string[]>([])
  const [selectedTDPs, setSelectedTDPs] = useState<string[]>([])
  const [selectedIntegratedGraphics, setSelectedIntegratedGraphics] = useState<boolean | null>(null)
  const [selectedManufacturers, setSelectedManufacturers] = useState<string[]>([])
  const [selectedLithography, setSelectedLithography] = useState<string[]>([])
  const [selectedMemoryTypes, setSelectedMemoryTypes] = useState<string[]>([])
  
  // API states
  const [cpus, setCpus] = useState<CPUItem[]>([])
  const [loading, setLoading] = useState(false)
  
  // Popup states
  const [showSocketTypePopup, setShowSocketTypePopup] = useState(false)
  const [showCoresPopup, setShowCoresPopup] = useState(false)
  const [showBaseClockPopup, setShowBaseClockPopup] = useState(false)
  const [showBoostClockPopup, setShowBoostClockPopup] = useState(false)
  const [showTDPPopup, setShowTDPPopup] = useState(false)
  const [showManufacturerPopup, setShowManufacturerPopup] = useState(false)
  const [showLithographyPopup, setShowLithographyPopup] = useState(false)
  const [showMemoryTypePopup, setShowMemoryTypePopup] = useState(false)
  
  // Search terms for popups
  const [socketTypeSearch, setSocketTypeSearch] = useState('')
  const [coresSearch, setCoresSearch] = useState('')
  const [baseClockSearch, setBaseClockSearch] = useState('')
  const [boostClockSearch, setBoostClockSearch] = useState('')
  const [tdpSearch, setTdpSearch] = useState('')
  const [manufacturerSearch, setManufacturerSearch] = useState('')
  const [lithographySearch, setLithographySearch] = useState('')
  const [memoryTypeSearch, setMemoryTypeSearch] = useState('')

  // Fetch CPUs from API
  useEffect(() => {
    fetchCPUs()
  }, [])

  const fetchCPUs = async () => {
    setLoading(true)
    try {
      const cpuData = await ApiService.getCPUsOnly()
      
      if (cpuData.length === 0) {
        setCpus([])
        return
      }
      
      // Convert API data to CPUItem format
      const formattedCPUs: CPUItem[] = cpuData.map((item: Record<string, unknown>) => {
        
        // Parse specs string (e.g., "4.3 GHz 16-Core")
        const specsString = String(item.specs || '')
        const baseClockMatch = specsString.match(/(\d+\.?\d*)\s*GHz/)
        const coresMatch = specsString.match(/(\d+)-Core/)
        const baseClock = baseClockMatch ? `${baseClockMatch[1]} GHz` : 'Unknown'
        const cores = coresMatch ? parseInt(coresMatch[1]) : 0
        const threads = cores * 2 // AMD thường có 2 threads per core
        
        // Lấy giá từ productPrices (lấy giá thấp nhất)
        const productPrices = item.productPrices as Array<{price: number}> || []
        const minPrice = productPrices.length > 0 
          ? Math.min(...productPrices.map(p => p.price)) 
          : 0
        
        return {
          id: Number(item.id) || 0,
          name: String(item.name) || 'Unknown CPU',
          brand: String(item.brand) || 'Unknown',
          price: minPrice,
          image: String(item.image_url1 || item.imageUrl1 || 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop'),
          specs: {
            socketType: String(item.socket) || 'Unknown',
            cores: cores,
            threads: threads,
            baseClock: baseClock,
            boostClock: 'Unknown',
            tdp: `${Number(item.tdp_watt || item.tdpWatt) || 0}W`,
            integratedGraphics: true,
            cache: 'Unknown',
            lithography: 'Unknown',
            memoryType: 'Unknown',
            maxMemory: 'Unknown'
          },
          features: ['Unknown'],
          rating: 4.0,
          reviews: 0,
          inStock: true
        }
      })
      
      setCpus(formattedCPUs)
    } catch (err) {
      console.error('Error fetching CPUs:', err)
      setCpus([]) // Sử dụng fallback data
    } finally {
      setLoading(false)
    }
  }

  // Chỉ sử dụng dữ liệu từ API
  const allCPUs = cpus

  // Filter logic
  const filteredCPUs = allCPUs.filter((cpuItem) => {
    // Price filter - chỉ filter nếu có giá > 0
    if (cpuItem.price > 0 && (cpuItem.price < priceRange[0] || cpuItem.price > priceRange[1])) {
      return false
    }

    // Search filter
    if (searchTerm && !cpuItem.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !cpuItem.brand.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    // Socket type filter
    if (selectedSocketTypes.length > 0 && !selectedSocketTypes.includes(cpuItem.specs.socketType)) {
      return false
    }

    // Cores filter
    if (selectedCores.length > 0 && !selectedCores.includes(cpuItem.specs.cores.toString())) {
      return false
    }

    // Base clock filter
    if (selectedBaseClocks.length > 0 && !selectedBaseClocks.includes(cpuItem.specs.baseClock)) {
      return false
    }

    // Boost clock filter
    if (selectedBoostClocks.length > 0 && !selectedBoostClocks.includes(cpuItem.specs.boostClock)) {
      return false
    }

    // TDP filter
    if (selectedTDPs.length > 0 && !selectedTDPs.includes(cpuItem.specs.tdp)) {
      return false
    }

    // Integrated graphics filter
    if (selectedIntegratedGraphics !== null && cpuItem.specs.integratedGraphics !== selectedIntegratedGraphics) {
      return false
    }

    // Manufacturer filter
    if (selectedManufacturers.length > 0 && !selectedManufacturers.includes(cpuItem.brand)) {
      return false
    }

    // Lithography filter
    if (selectedLithography.length > 0 && !selectedLithography.includes(cpuItem.specs.lithography)) {
      return false
    }

    // Memory type filter
    if (selectedMemoryTypes.length > 0 && !selectedMemoryTypes.includes(cpuItem.specs.memoryType)) {
      return false
    }

    return true
  })

  const handleSocketTypeChange = (socketType: string) => {
    setSelectedSocketTypes(prev => 
      prev.includes(socketType) 
        ? prev.filter(s => s !== socketType)
        : [...prev, socketType]
    )
  }

  const handleCoresChange = (cores: string) => {
    setSelectedCores(prev => 
      prev.includes(cores) 
        ? prev.filter(c => c !== cores)
        : [...prev, cores]
    )
  }

  const handleBaseClockChange = (clock: string) => {
    setSelectedBaseClocks(prev => 
      prev.includes(clock) 
        ? prev.filter(c => c !== clock)
        : [...prev, clock]
    )
  }

  const handleBoostClockChange = (clock: string) => {
    setSelectedBoostClocks(prev => 
      prev.includes(clock) 
        ? prev.filter(c => c !== clock)
        : [...prev, clock]
    )
  }

  const handleTDPChange = (tdp: string) => {
    setSelectedTDPs(prev => 
      prev.includes(tdp) 
        ? prev.filter(t => t !== tdp)
        : [...prev, tdp]
    )
  }

  const handleIntegratedGraphicsChange = (value: boolean) => {
    setSelectedIntegratedGraphics(prev => prev === value ? null : value)
  }

  const handleManufacturerChange = (manufacturer: string) => {
    setSelectedManufacturers(prev => 
      prev.includes(manufacturer) 
        ? prev.filter(m => m !== manufacturer)
        : [...prev, manufacturer]
    )
  }

  const handleLithographyChange = (lithography: string) => {
    setSelectedLithography(prev => 
      prev.includes(lithography) 
        ? prev.filter(l => l !== lithography)
        : [...prev, lithography]
    )
  }

  const handleMemoryTypeChange = (memoryType: string) => {
    setSelectedMemoryTypes(prev => 
      prev.includes(memoryType) 
        ? prev.filter(m => m !== memoryType)
        : [...prev, memoryType]
    )
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
            <Link className="nav-item" to="/sales">Sales</Link>
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
              <span className="font-medium text-black">CPU</span>
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
                  <h3 className="text-base font-semibold mb-3">Price Range</h3>
                  <PriceRangeSlider
                    value={priceRange}
                    onChange={setPriceRange}
                    min={50}
                    max={2000}
                    step={10}
                    currency="$"
                  />
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Socket Type</h3>
                  <div className="space-y-2 text-sm">
                    {['LGA 1700','AM5','LGA 1200','AM4'].map((socket) => (
                      <label key={socket} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedSocketTypes.includes(socket)}
                          onChange={() => handleSocketTypeChange(socket)}
                          className="rounded" 
                        />
                        <span>{socket}</span>
                      </label>
                    ))}
                    <button onClick={() => setShowSocketTypePopup(true)} className="text-blue-600 text-xs">Show More</button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Number of Cores</h3>
                  <div className="space-y-2 text-sm">
                    {['6','8','14','16','24'].map((cores) => (
                      <label key={cores} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedCores.includes(cores)}
                          onChange={() => handleCoresChange(cores)}
                          className="rounded" 
                        />
                        <span>{cores}</span>
                      </label>
                    ))}
                    <button onClick={() => setShowCoresPopup(true)} className="text-blue-600 text-xs">Show More</button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Base Clock</h3>
                  <div className="space-y-2 text-sm">
                    {['3.0 GHz','3.4 GHz','3.5 GHz','4.5 GHz','4.7 GHz'].map((clock) => (
                      <label key={clock} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedBaseClocks.includes(clock)}
                          onChange={() => handleBaseClockChange(clock)}
                          className="rounded" 
                        />
                        <span>{clock}</span>
                      </label>
                    ))}
                    <button onClick={() => setShowBaseClockPopup(true)} className="text-blue-600 text-xs">Show More</button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Boost Clock</h3>
                  <div className="space-y-2 text-sm">
                    {['5.1 GHz','5.3 GHz','5.4 GHz','5.7 GHz','5.8 GHz'].map((clock) => (
                      <label key={clock} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedBoostClocks.includes(clock)}
                          onChange={() => handleBoostClockChange(clock)}
                          className="rounded" 
                        />
                        <span>{clock}</span>
                      </label>
                    ))}
                    <button onClick={() => setShowBoostClockPopup(true)} className="text-blue-600 text-xs">Show More</button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">TDP</h3>
                  <div className="space-y-2 text-sm">
                    {['105W','125W','170W'].map((tdp) => (
                      <label key={tdp} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedTDPs.includes(tdp)}
                          onChange={() => handleTDPChange(tdp)}
                          className="rounded" 
                        />
                        <span>{tdp}</span>
                      </label>
                    ))}
                    <button onClick={() => setShowTDPPopup(true)} className="text-blue-600 text-xs">Show More</button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Integrated Graphics</h3>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={selectedIntegratedGraphics === true}
                        onChange={() => handleIntegratedGraphicsChange(true)}
                        className="rounded" 
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={selectedIntegratedGraphics === false}
                        onChange={() => handleIntegratedGraphicsChange(false)}
                        className="rounded" 
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Manufacturer</h3>
                  <div className="space-y-2 text-sm">
                    {['Intel','AMD'].map((manufacturer) => (
                      <label key={manufacturer} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedManufacturers.includes(manufacturer)}
                          onChange={() => handleManufacturerChange(manufacturer)}
                          className="rounded" 
                        />
                        <span>{manufacturer}</span>
                      </label>
                    ))}
                    <button onClick={() => setShowManufacturerPopup(true)} className="text-blue-600 text-xs">Show More</button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Lithography</h3>
                  <div className="space-y-2 text-sm">
                    {['5nm','10nm'].map((lithography) => (
                      <label key={lithography} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedLithography.includes(lithography)}
                          onChange={() => handleLithographyChange(lithography)}
                          className="rounded" 
                        />
                        <span>{lithography}</span>
                      </label>
                    ))}
                    <button onClick={() => setShowLithographyPopup(true)} className="text-blue-600 text-xs">Show More</button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Memory Type</h3>
                  <div className="space-y-2 text-sm">
                    {['DDR4-3200, DDR5-5600','DDR5-5200'].map((memoryType) => (
                      <label key={memoryType} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedMemoryTypes.includes(memoryType)}
                          onChange={() => handleMemoryTypeChange(memoryType)}
                          className="rounded" 
                        />
                        <span>{memoryType}</span>
                      </label>
                    ))}
                    <button onClick={() => setShowMemoryTypePopup(true)} className="text-blue-600 text-xs">Show More</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid */}
            <div className="flex-1">
              {loading && (
                <div className="flex justify-center items-center py-12">
                  <div className="text-lg text-gray-600">Đang tải dữ liệu CPU...</div>
                </div>
              )}
              
              
              {filteredCPUs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-lg text-gray-600 mb-4">
                    {cpus.length === 0 ? 'Không có CPU nào trong database' : 'Không tìm thấy CPU nào phù hợp'}
                  </div>
                  <div className="text-sm text-gray-500 mb-4">
                    {cpus.length === 0 ? 'Vui lòng thêm CPU vào database' : 'Thử điều chỉnh bộ lọc hoặc tìm kiếm khác'}
                  </div>
                  {cpus.length > 0 && (
                    <button 
                      onClick={() => {
                        setSearchTerm('')
                        setSelectedSocketTypes([])
                        setSelectedCores([])
                        setSelectedBaseClocks([])
                        setSelectedBoostClocks([])
                        setSelectedTDPs([])
                        setSelectedIntegratedGraphics(null)
                        setSelectedManufacturers([])
                        setSelectedLithography([])
                        setSelectedMemoryTypes([])
                        setPriceRange([50, 2000])
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Xóa tất cả bộ lọc
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {filteredCPUs.map((cpuItem) => (
                  <div key={cpuItem.id} className="rounded-lg border border-black/10 bg-white hover:bg-black/5 transition cursor-pointer" onClick={() => setSelectedCPU(cpuItem)}>
                    <div className="p-4">
                      <img src={cpuItem.image} alt={cpuItem.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                      <div className="text-sm font-medium mb-2 line-clamp-2">{cpuItem.name}</div>
                      <div className="text-lg font-bold mb-3">
                        {cpuItem.price > 0 ? `${cpuItem.price.toLocaleString('vi-VN')} VND` : 'Liên hệ'}
                      </div>
                      <div className="space-y-1 text-xs text-black/60 mb-4">
                        <div className="flex justify-between"><span>Socket:</span><span className="text-black">{cpuItem.specs.socketType}</span></div>
                        <div className="flex justify-between"><span>Cores:</span><span className="text-black">{cpuItem.specs.cores}</span></div>
                        <div className="flex justify-between"><span>Base Clock:</span><span className="text-black">{cpuItem.specs.baseClock}</span></div>
                        <div className="flex justify-between"><span>Boost Clock:</span><span className="text-black">{cpuItem.specs.boostClock}</span></div>
                        <div className="flex justify-between"><span>TDP:</span><span className="text-black">{cpuItem.specs.tdp}</span></div>
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
      {selectedCPU && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{selectedCPU.name}</h2>
                  <p className="text-lg text-gray-600">{selectedCPU.brand}</p>
                </div>
                <button
                  onClick={() => setSelectedCPU(null)}
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
                    src={selectedCPU.image}
                    alt={selectedCPU.name}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                </div>
                
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-4">
                    {selectedCPU.price > 0 ? `${selectedCPU.price.toLocaleString('vi-VN')} VND` : 'Liên hệ'}
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Specifications</h3>
                    <div className="space-y-2">
                      {Object.entries(selectedCPU.specs).map(([key, value]) => (
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
                      {selectedCPU.features.map((feature, index) => (
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
                        selectedCPU.inStock 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={!selectedCPU.inStock}
                    >
                      {selectedCPU.inStock ? 'Add to Build' : 'Out of Stock'}
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
        isOpen={showSocketTypePopup}
        onClose={() => setShowSocketTypePopup(false)}
        title="Socket Type"
        searchTerm={socketTypeSearch}
        onSearchChange={setSocketTypeSearch}
        options={['LGA 1700','AM5','LGA 1200','AM4','LGA 1151','TR4','sTRX4','sWRX8']}
        selectedItems={selectedSocketTypes}
        onItemChange={handleSocketTypeChange}
      />

      <FilterPopup
        isOpen={showCoresPopup}
        onClose={() => setShowCoresPopup(false)}
        title="Number of Cores"
        searchTerm={coresSearch}
        onSearchChange={setCoresSearch}
        options={['2','4','6','8','10','12','14','16','18','20','24','32','64']}
        selectedItems={selectedCores}
        onItemChange={handleCoresChange}
      />

      <FilterPopup
        isOpen={showBaseClockPopup}
        onClose={() => setShowBaseClockPopup(false)}
        title="Base Clock"
        searchTerm={baseClockSearch}
        onSearchChange={setBaseClockSearch}
        options={['1.8 GHz','2.0 GHz','2.4 GHz','2.6 GHz','2.8 GHz','3.0 GHz','3.2 GHz','3.4 GHz','3.5 GHz','3.6 GHz','3.8 GHz','4.0 GHz','4.2 GHz','4.4 GHz','4.5 GHz','4.6 GHz','4.7 GHz','4.8 GHz']}
        selectedItems={selectedBaseClocks}
        onItemChange={handleBaseClockChange}
      />

      <FilterPopup
        isOpen={showBoostClockPopup}
        onClose={() => setShowBoostClockPopup(false)}
        title="Boost Clock"
        searchTerm={boostClockSearch}
        onSearchChange={setBoostClockSearch}
        options={['3.0 GHz','3.2 GHz','3.4 GHz','3.6 GHz','3.8 GHz','4.0 GHz','4.2 GHz','4.4 GHz','4.6 GHz','4.8 GHz','5.0 GHz','5.1 GHz','5.2 GHz','5.3 GHz','5.4 GHz','5.5 GHz','5.6 GHz','5.7 GHz','5.8 GHz']}
        selectedItems={selectedBoostClocks}
        onItemChange={handleBoostClockChange}
      />

      <FilterPopup
        isOpen={showTDPPopup}
        onClose={() => setShowTDPPopup(false)}
        title="TDP"
        searchTerm={tdpSearch}
        onSearchChange={setTdpSearch}
        options={['35W','45W','65W','95W','105W','125W','150W','170W','180W','200W','225W','250W','280W']}
        selectedItems={selectedTDPs}
        onItemChange={handleTDPChange}
      />

      <FilterPopup
        isOpen={showManufacturerPopup}
        onClose={() => setShowManufacturerPopup(false)}
        title="Manufacturer"
        searchTerm={manufacturerSearch}
        onSearchChange={setManufacturerSearch}
        options={['Intel','AMD']}
        selectedItems={selectedManufacturers}
        onItemChange={handleManufacturerChange}
      />

      <FilterPopup
        isOpen={showLithographyPopup}
        onClose={() => setShowLithographyPopup(false)}
        title="Lithography"
        searchTerm={lithographySearch}
        onSearchChange={setLithographySearch}
        options={['3nm','5nm','7nm','10nm','12nm','14nm','16nm','22nm','32nm']}
        selectedItems={selectedLithography}
        onItemChange={handleLithographyChange}
      />

      <FilterPopup
        isOpen={showMemoryTypePopup}
        onClose={() => setShowMemoryTypePopup(false)}
        title="Memory Type"
        searchTerm={memoryTypeSearch}
        onSearchChange={setMemoryTypeSearch}
        options={['DDR4-2133','DDR4-2400','DDR4-2666','DDR4-2933','DDR4-3200','DDR5-4800','DDR5-5200','DDR5-5600','DDR5-6000','DDR5-6400']}
        selectedItems={selectedMemoryTypes}
        onItemChange={handleMemoryTypeChange}
      />
    </div>
  )
}

export default CPUPage
