import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import '../../Homepage.css'
import { ApiService } from '../../services/api'

interface MonitorItem {
  id: number
  name: string
  brand: string
  price: number
  image: string
  specs: {
    size: string
    resolution: string
    refreshRate: string
    panelType: string
    responseTime: string
    brightness: string
    contrast: string
    colorGamut: string
    connectivity: string
    aspectRatio: string
    curvature: string
    warranty: string
    hdr: boolean
    gsync: boolean
    freesync: boolean
  }
  features: string[]
  rating: number
  reviews: number
  inStock: boolean
}

function MonitorPage() {
  const [selectedMonitor, setSelectedMonitor] = useState<MonitorItem | null>(null)
  const [priceRange, setPriceRange] = useState<[number, number]>([100, 2000])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedResolutions, setSelectedResolutions] = useState<string[]>([])
  const [selectedRefreshRates, setSelectedRefreshRates] = useState<string[]>([])
  const [selectedPanelTypes, setSelectedPanelTypes] = useState<string[]>([])
  const [selectedResponseTimes, setSelectedResponseTimes] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedConnectivities, setSelectedConnectivities] = useState<string[]>([])
  const [selectedHDR, setSelectedHDR] = useState<boolean | null>(null)
  const [selectedGSync, setSelectedGSync] = useState<boolean | null>(null)
  const [selectedFreeSync, setSelectedFreeSync] = useState<boolean | null>(null)
  
  // Popup states
  const [showSizePopup, setShowSizePopup] = useState(false)
  const [showResolutionPopup, setShowResolutionPopup] = useState(false)
  const [showRefreshRatePopup, setShowRefreshRatePopup] = useState(false)
  const [showPanelTypePopup, setShowPanelTypePopup] = useState(false)
  const [showResponseTimePopup, setShowResponseTimePopup] = useState(false)
  const [showBrandPopup, setShowBrandPopup] = useState(false)
  const [showConnectivityPopup, setShowConnectivityPopup] = useState(false)
  
  // Search terms for popups
  const [sizeSearch, setSizeSearch] = useState('')
  const [resolutionSearch, setResolutionSearch] = useState('')
  const [refreshRateSearch, setRefreshRateSearch] = useState('')
  const [panelTypeSearch, setPanelTypeSearch] = useState('')
  const [responseTimeSearch, setResponseTimeSearch] = useState('')
  const [brandSearch, setBrandSearch] = useState('')
  const [connectivitySearch, setConnectivitySearch] = useState('')
  // API states
  const [monitors, setMonitors] = useState<MonitorItem[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch Monitors from API (category_id = 9)
  useEffect(() => {
    const fetchMonitors = async () => {
      setLoading(true)
      try {
        const products = await ApiService.getProductsByCategory(9)

        interface MonitorApiProduct {
          id?: number
          name?: string
          brand?: string
          specs?: string
          image_url1?: string
          productPrices?: Array<{ price: number }>
        }

        const formatted: MonitorItem[] = (products as MonitorApiProduct[]).map((item) => {
          const specsString = String(item.specs || '')
          const sizeMatch = specsString.match(/(\d{2}(?:\.\d)?)\s*"/i)
          const resMatch = specsString.match(/(\d{3,4})\s*x\s*(\d{3,4})/i)
          const rrMatch = specsString.match(/(\d{2,3})\s*Hz/i)
          const panelMatch = specsString.match(/(IPS|VA|TN|OLED|Mini LED|Nano IPS|Fast IPS)/i)
          const rtMatch = specsString.match(/(\d+(?:\.\d)?)\s*ms/i)

          const prices = item.productPrices || []
          const minPrice = prices.length ? Math.min(...prices.map(p => p.price)) : 0

          return {
            id: Number(item.id) || 0,
            name: String(item.name) || 'Unknown Monitor',
            brand: String(item.brand) || 'Unknown',
            price: minPrice,
            image: String(item.image_url1 || 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop'),
            specs: {
              size: sizeMatch ? `${sizeMatch[1]}"` : '27"',
              resolution: resMatch ? `${resMatch[1]} x ${resMatch[2]}` : '1920 x 1080',
              refreshRate: rrMatch ? `${rrMatch[1]}Hz` : '60Hz',
              panelType: panelMatch ? panelMatch[1] : 'IPS',
              responseTime: rtMatch ? `${rtMatch[1]}ms` : '5ms',
              brightness: 'Unknown',
              contrast: 'Unknown',
              colorGamut: 'Unknown',
              connectivity: 'Unknown',
              aspectRatio: '16:9',
              curvature: 'Flat',
              warranty: 'Unknown',
              hdr: true,
              gsync: true,
              freesync: true
            },
            features: ['Unknown'],
            rating: 4.0,
            reviews: 0,
            inStock: true
          }
        })

        setMonitors(formatted)
      } catch (err) {
        console.error('Error fetching Monitors:', err)
        setMonitors([])
      } finally {
        setLoading(false)
      }
    }

    fetchMonitors()
  }, [])

  const allMonitors = monitors

  // Filter logic
  const filteredMonitors = allMonitors.filter((monitorItem) => {
    // Price filter - chỉ lọc nếu có giá > 0
    if (monitorItem.price > 0 && (monitorItem.price < priceRange[0] || monitorItem.price > priceRange[1])) {
      return false
    }

    // Search filter
    if (searchTerm && !monitorItem.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !monitorItem.brand.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    // Size filter
    if (selectedSizes.length > 0 && !selectedSizes.includes(monitorItem.specs.size)) {
      return false
    }

    // Resolution filter
    if (selectedResolutions.length > 0 && !selectedResolutions.includes(monitorItem.specs.resolution)) {
      return false
    }

    // Refresh rate filter
    if (selectedRefreshRates.length > 0 && !selectedRefreshRates.includes(monitorItem.specs.refreshRate)) {
      return false
    }

    // Panel type filter
    if (selectedPanelTypes.length > 0 && !selectedPanelTypes.includes(monitorItem.specs.panelType)) {
      return false
    }

    // Response time filter
    if (selectedResponseTimes.length > 0 && !selectedResponseTimes.includes(monitorItem.specs.responseTime)) {
      return false
    }

    // Brand filter
    if (selectedBrands.length > 0 && !selectedBrands.includes(monitorItem.brand)) {
      return false
    }

    // Connectivity filter
    if (selectedConnectivities.length > 0 && !selectedConnectivities.some(conn => monitorItem.specs.connectivity.includes(conn))) {
      return false
    }

    // HDR filter
    if (selectedHDR !== null && monitorItem.specs.hdr !== selectedHDR) {
      return false
    }

    // G-Sync filter
    if (selectedGSync !== null && monitorItem.specs.gsync !== selectedGSync) {
      return false
    }

    // FreeSync filter
    if (selectedFreeSync !== null && monitorItem.specs.freesync !== selectedFreeSync) {
      return false
    }

    return true
  })

  const handleSizeChange = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size)
        : [...prev, size]
    )
  }

  const handleResolutionChange = (resolution: string) => {
    setSelectedResolutions(prev => 
      prev.includes(resolution) 
        ? prev.filter(r => r !== resolution)
        : [...prev, resolution]
    )
  }

  const handleRefreshRateChange = (refreshRate: string) => {
    setSelectedRefreshRates(prev => 
      prev.includes(refreshRate) 
        ? prev.filter(r => r !== refreshRate)
        : [...prev, refreshRate]
    )
  }

  const handlePanelTypeChange = (panelType: string) => {
    setSelectedPanelTypes(prev => 
      prev.includes(panelType) 
        ? prev.filter(p => p !== panelType)
        : [...prev, panelType]
    )
  }

  const handleResponseTimeChange = (responseTime: string) => {
    setSelectedResponseTimes(prev => 
      prev.includes(responseTime) 
        ? prev.filter(r => r !== responseTime)
        : [...prev, responseTime]
    )
  }

  const handleBrandChange = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    )
  }

  const handleConnectivityChange = (connectivity: string) => {
    setSelectedConnectivities(prev => 
      prev.includes(connectivity) 
        ? prev.filter(c => c !== connectivity)
        : [...prev, connectivity]
    )
  }

  const handleHDRChange = (value: boolean) => {
    setSelectedHDR(prev => prev === value ? null : value)
  }

  const handleGSyncChange = (value: boolean) => {
    setSelectedGSync(prev => prev === value ? null : value)
  }

  const handleFreeSyncChange = (value: boolean) => {
    setSelectedFreeSync(prev => prev === value ? null : value)
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
              <span className="font-medium text-black">Monitor</span>
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
                      <span>$100</span>
                      <span>$2000</span>
                    </div>
                    <input 
                      type="range" 
                      min="100" 
                      max="2000" 
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full" 
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Size</h3>
                  <div className="space-y-2 text-sm">
                    {['24"','27"','32"'].map((size) => (
                      <label key={size} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedSizes.includes(size)}
                          onChange={() => handleSizeChange(size)}
                          className="rounded" 
                        />
                        <span>{size}</span>
                      </label>
                    ))}
                    <button onClick={() => setShowSizePopup(true)} className="text-blue-600 text-xs">Show More</button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Resolution</h3>
                  <div className="space-y-2 text-sm">
                    {['1920 x 1080','2560 x 1440','3840 x 2160'].map((resolution) => (
                      <label key={resolution} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedResolutions.includes(resolution)}
                          onChange={() => handleResolutionChange(resolution)}
                          className="rounded" 
                        />
                        <span>{resolution}</span>
                      </label>
                    ))}
                    <button onClick={() => setShowResolutionPopup(true)} className="text-blue-600 text-xs">Show More</button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Refresh Rate</h3>
                  <div className="space-y-2 text-sm">
                    {['60Hz','144Hz','165Hz','240Hz'].map((refreshRate) => (
                      <label key={refreshRate} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedRefreshRates.includes(refreshRate)}
                          onChange={() => handleRefreshRateChange(refreshRate)}
                          className="rounded" 
                        />
                        <span>{refreshRate}</span>
                      </label>
                    ))}
                    <button onClick={() => setShowRefreshRatePopup(true)} className="text-blue-600 text-xs">Show More</button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Panel Type</h3>
                  <div className="space-y-2 text-sm">
                    {['IPS','VA','TN','Nano IPS'].map((panelType) => (
                      <label key={panelType} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedPanelTypes.includes(panelType)}
                          onChange={() => handlePanelTypeChange(panelType)}
                          className="rounded" 
                        />
                        <span>{panelType}</span>
                      </label>
                    ))}
                    <button onClick={() => setShowPanelTypePopup(true)} className="text-blue-600 text-xs">Show More</button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Response Time</h3>
                  <div className="space-y-2 text-sm">
                    {['1ms','4ms','5ms'].map((responseTime) => (
                      <label key={responseTime} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedResponseTimes.includes(responseTime)}
                          onChange={() => handleResponseTimeChange(responseTime)}
                          className="rounded" 
                        />
                        <span>{responseTime}</span>
                      </label>
                    ))}
                    <button onClick={() => setShowResponseTimePopup(true)} className="text-blue-600 text-xs">Show More</button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Brand</h3>
                  <div className="space-y-2 text-sm">
                    {['ASUS','LG','Samsung','Dell','MSI','AOC'].map((brand) => (
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
                  <h3 className="text-base font-semibold mb-3">Connectivity</h3>
                  <div className="space-y-2 text-sm">
                    {['DisplayPort','HDMI','USB-C','USB 3.0'].map((connectivity) => (
                      <label key={connectivity} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedConnectivities.includes(connectivity)}
                          onChange={() => handleConnectivityChange(connectivity)}
                          className="rounded" 
                        />
                        <span>{connectivity}</span>
                      </label>
                    ))}
                    <button onClick={() => setShowConnectivityPopup(true)} className="text-blue-600 text-xs">Show More</button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">HDR</h3>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={selectedHDR === true}
                        onChange={() => handleHDRChange(true)}
                        className="rounded" 
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={selectedHDR === false}
                        onChange={() => handleHDRChange(false)}
                        className="rounded" 
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">G-Sync</h3>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={selectedGSync === true}
                        onChange={() => handleGSyncChange(true)}
                        className="rounded" 
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={selectedGSync === false}
                        onChange={() => handleGSyncChange(false)}
                        className="rounded" 
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">FreeSync</h3>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={selectedFreeSync === true}
                        onChange={() => handleFreeSyncChange(true)}
                        className="rounded" 
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={selectedFreeSync === false}
                        onChange={() => handleFreeSyncChange(false)}
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
                  <div className="text-lg text-gray-600">Đang tải dữ liệu Monitor...</div>
                </div>
              )}

              {filteredMonitors.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-lg text-gray-600 mb-4">
                    {monitors.length === 0 ? 'Không có Monitor nào trong database' : 'Không tìm thấy Monitor nào phù hợp'}
                  </div>
                  <div className="text-sm text-gray-500 mb-4">
                    {monitors.length === 0 ? 'Vui lòng thêm Monitor vào database' : 'Thử điều chỉnh bộ lọc hoặc tìm kiếm khác'}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {filteredMonitors.map((monitorItem) => (
                    <div key={monitorItem.id} className="rounded-lg border border-black/10 bg-white hover:bg-black/5 transition cursor-pointer" onClick={() => setSelectedMonitor(monitorItem)}>
                      <div className="p-4">
                        <img src={monitorItem.image} alt={monitorItem.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                        <div className="text-sm font-medium mb-2 line-clamp-2">{monitorItem.name}</div>
                        <div className="text-lg font-bold mb-3">
                          {monitorItem.price > 0 ? `${monitorItem.price.toLocaleString('vi-VN')} VND` : 'Liên hệ'}
                        </div>
                        <div className="space-y-1 text-xs text-black/60 mb-4">
                          <div className="flex justify-between"><span>Size:</span><span className="text-black">{monitorItem.specs.size}</span></div>
                          <div className="flex justify-between"><span>Resolution:</span><span className="text-black">{monitorItem.specs.resolution}</span></div>
                          <div className="flex justify-between"><span>Refresh Rate:</span><span className="text-black">{monitorItem.specs.refreshRate}</span></div>
                          <div className="flex justify-between"><span>Panel Type:</span><span className="text-black">{monitorItem.specs.panelType}</span></div>
                          <div className="flex justify-between"><span>Response Time:</span><span className="text-black">{monitorItem.specs.responseTime}</span></div>
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
      {selectedMonitor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{selectedMonitor.name}</h2>
                  <p className="text-lg text-gray-600">{selectedMonitor.brand}</p>
                </div>
                <button
                  onClick={() => setSelectedMonitor(null)}
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
                    src={selectedMonitor.image}
                    alt={selectedMonitor.name}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                </div>
                
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-4">${selectedMonitor.price}</div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Specifications</h3>
                    <div className="space-y-2">
                      {Object.entries(selectedMonitor.specs).map(([key, value]) => (
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
                      {selectedMonitor.features.map((feature, index) => (
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
                        selectedMonitor.inStock 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={!selectedMonitor.inStock}
                    >
                      {selectedMonitor.inStock ? 'Add to Build' : 'Out of Stock'}
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
        isOpen={showSizePopup}
        onClose={() => setShowSizePopup(false)}
        title="Size"
        searchTerm={sizeSearch}
        onSearchChange={setSizeSearch}
        options={['21.5"','22"','23"','23.8"','24"','25"','27"','28"','30"','32"','34"','38"','43"','49"']}
        selectedItems={selectedSizes}
        onItemChange={handleSizeChange}
      />

      <FilterPopup
        isOpen={showResolutionPopup}
        onClose={() => setShowResolutionPopup(false)}
        title="Resolution"
        searchTerm={resolutionSearch}
        onSearchChange={setResolutionSearch}
        options={['1366 x 768','1920 x 1080','1920 x 1200','2560 x 1440','3440 x 1440','3840 x 2160','5120 x 1440','7680 x 4320']}
        selectedItems={selectedResolutions}
        onItemChange={handleResolutionChange}
      />

      <FilterPopup
        isOpen={showRefreshRatePopup}
        onClose={() => setShowRefreshRatePopup(false)}
        title="Refresh Rate"
        searchTerm={refreshRateSearch}
        onSearchChange={setRefreshRateSearch}
        options={['60Hz','75Hz','120Hz','144Hz','165Hz','180Hz','200Hz','240Hz','280Hz','300Hz','360Hz']}
        selectedItems={selectedRefreshRates}
        onItemChange={handleRefreshRateChange}
      />

      <FilterPopup
        isOpen={showPanelTypePopup}
        onClose={() => setShowPanelTypePopup(false)}
        title="Panel Type"
        searchTerm={panelTypeSearch}
        onSearchChange={setPanelTypeSearch}
        options={['IPS','VA','TN','OLED','Nano IPS','Fast IPS','Super Fast IPS','Quantum Dot','Mini LED']}
        selectedItems={selectedPanelTypes}
        onItemChange={handlePanelTypeChange}
      />

      <FilterPopup
        isOpen={showResponseTimePopup}
        onClose={() => setShowResponseTimePopup(false)}
        title="Response Time"
        searchTerm={responseTimeSearch}
        onSearchChange={setResponseTimeSearch}
        options={['0.5ms','1ms','2ms','3ms','4ms','5ms','6ms','8ms','10ms','12ms','14ms','16ms']}
        selectedItems={selectedResponseTimes}
        onItemChange={handleResponseTimeChange}
      />

      <FilterPopup
        isOpen={showBrandPopup}
        onClose={() => setShowBrandPopup(false)}
        title="Brand"
        searchTerm={brandSearch}
        onSearchChange={setBrandSearch}
        options={['ASUS','LG','Samsung','Dell','MSI','AOC','BenQ','ViewSonic','HP','Lenovo','Acer','Gigabyte','Philips','Sony','Alienware']}
        selectedItems={selectedBrands}
        onItemChange={handleBrandChange}
      />

      <FilterPopup
        isOpen={showConnectivityPopup}
        onClose={() => setShowConnectivityPopup(false)}
        title="Connectivity"
        searchTerm={connectivitySearch}
        onSearchChange={setConnectivitySearch}
        options={['DisplayPort','DisplayPort 1.2','DisplayPort 1.4','HDMI','HDMI 2.0','HDMI 2.1','USB-C','USB 3.0','USB 3.1','Thunderbolt 3','Thunderbolt 4','VGA','DVI']}
        selectedItems={selectedConnectivities}
        onItemChange={handleConnectivityChange}
      />
    </div>
  )
}

export default MonitorPage
