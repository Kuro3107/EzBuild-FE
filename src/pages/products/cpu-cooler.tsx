import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import '../../Homepage.css'

interface CPUCoolerItem {
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

function CPUCoolerPage() {
  const [selectedCPUCooler, setSelectedCPUCooler] = useState<CPUCoolerItem | null>(null)
  const [priceRange, setPriceRange] = useState<[number, number]>([20, 300])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedSockets, setSelectedSockets] = useState<string[]>([])
  const [selectedFanSizes, setSelectedFanSizes] = useState<string[]>([])
  const [selectedFanCounts, setSelectedFanCounts] = useState<string[]>([])
  const [selectedNoiseLevels, setSelectedNoiseLevels] = useState<string[]>([])
  const [selectedTDPs, setSelectedTDPs] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([])
  const [selectedRGB, setSelectedRGB] = useState<boolean | null>(null)
  const [selectedLiquidCooling, setSelectedLiquidCooling] = useState<boolean | null>(null)
  
  // Popup states
  const [showTypePopup, setShowTypePopup] = useState(false)
  const [showSocketPopup, setShowSocketPopup] = useState(false)
  const [showFanSizePopup, setShowFanSizePopup] = useState(false)
  const [showFanCountPopup, setShowFanCountPopup] = useState(false)
  const [showNoiseLevelPopup, setShowNoiseLevelPopup] = useState(false)
  const [showTDPPopup, setShowTDPPopup] = useState(false)
  const [showBrandPopup, setShowBrandPopup] = useState(false)
  const [showMaterialPopup, setShowMaterialPopup] = useState(false)
  
  // Search terms for popups
  const [typeSearch, setTypeSearch] = useState('')
  const [socketSearch, setSocketSearch] = useState('')
  const [fanSizeSearch, setFanSizeSearch] = useState('')
  const [fanCountSearch, setFanCountSearch] = useState('')
  const [noiseLevelSearch, setNoiseLevelSearch] = useState('')
  const [tdpSearch, setTdpSearch] = useState('')
  const [brandSearch, setBrandSearch] = useState('')
  const [materialSearch, setMaterialSearch] = useState('')

  const allCPUCoolers = [
    {
      id: 1,
      name: 'Noctua NH-D15 Chromax Black',
      brand: 'Noctua',
      price: 99.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        type: 'Air Cooler',
        socket: 'LGA1700, AM4, AM5',
        fanSize: '140mm',
        fanCount: '2',
        noiseLevel: '24.6 dB(A)',
        tdp: '220W',
        height: '165mm',
        weight: '1.32kg',
        material: 'Aluminum + Copper',
        warranty: '6 Years',
        rgb: false,
        liquidCooling: false
      },
      features: ['Dual Tower', 'Premium Fans', 'Low Noise', 'High Performance', 'Chromax Black'],
      rating: 4.8,
      reviews: 342,
      inStock: true
    },
    {
      id: 2,
      name: 'Corsair iCUE H150i ELITE CAPELLIX',
      brand: 'Corsair',
      price: 199.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        type: 'Liquid Cooler',
        socket: 'LGA1700, AM4, AM5',
        fanSize: '120mm',
        fanCount: '3',
        noiseLevel: '37.7 dB(A)',
        tdp: '300W',
        height: '27mm',
        weight: '1.2kg',
        material: 'Aluminum + Copper',
        warranty: '5 Years',
        rgb: true,
        liquidCooling: true
      },
      features: ['AIO Liquid Cooling', 'RGB Lighting', 'iCUE Software', 'High Performance', '360mm Radiator'],
      rating: 4.7,
      reviews: 289,
      inStock: true
    },
    {
      id: 3,
      name: 'Cooler Master Hyper 212 EVO V2',
      brand: 'Cooler Master',
      price: 39.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        type: 'Air Cooler',
        socket: 'LGA1700, AM4, AM5',
        fanSize: '120mm',
        fanCount: '1',
        noiseLevel: '26 dB(A)',
        tdp: '150W',
        height: '158mm',
        weight: '0.6kg',
        material: 'Aluminum + Copper',
        warranty: '2 Years',
        rgb: false,
        liquidCooling: false
      },
      features: ['Budget Friendly', 'Reliable', 'Easy Installation', 'Compatible', 'Compact'],
      rating: 4.4,
      reviews: 156,
      inStock: true
    },
    {
      id: 4,
      name: 'NZXT Kraken X73 RGB',
      brand: 'NZXT',
      price: 179.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        type: 'Liquid Cooler',
        socket: 'LGA1700, AM4, AM5',
        fanSize: '120mm',
        fanCount: '3',
        noiseLevel: '36 dB(A)',
        tdp: '280W',
        height: '26mm',
        weight: '1.1kg',
        material: 'Aluminum + Copper',
        warranty: '6 Years',
        rgb: true,
        liquidCooling: true
      },
      features: ['AIO Liquid Cooling', 'RGB Lighting', 'CAM Software', 'High Performance', '360mm Radiator'],
      rating: 4.6,
      reviews: 203,
      inStock: false
    },
    {
      id: 5,
      name: 'be quiet! Dark Rock Pro 4',
      brand: 'be quiet!',
      price: 89.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        type: 'Air Cooler',
        socket: 'LGA1700, AM4, AM5',
        fanSize: '135mm',
        fanCount: '2',
        noiseLevel: '24.3 dB(A)',
        tdp: '250W',
        height: '162.8mm',
        weight: '1.1kg',
        material: 'Aluminum + Copper',
        warranty: '3 Years',
        rgb: false,
        liquidCooling: false
      },
      features: ['Silent Operation', 'High Performance', 'Premium Build', 'Low Noise', 'Dual Tower'],
      rating: 4.7,
      reviews: 178,
      inStock: true
    },
    {
      id: 6,
      name: 'Arctic Liquid Freezer II 280',
      brand: 'Arctic',
      price: 109.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        type: 'Liquid Cooler',
        socket: 'LGA1700, AM4, AM5',
        fanSize: '140mm',
        fanCount: '2',
        noiseLevel: '22.5 dB(A)',
        tdp: '300W',
        height: '38mm',
        weight: '1.3kg',
        material: 'Aluminum + Copper',
        warranty: '6 Years',
        rgb: false,
        liquidCooling: true
      },
      features: ['AIO Liquid Cooling', 'Silent Operation', 'High Performance', '280mm Radiator', 'PWM Fans'],
      rating: 4.8,
      reviews: 145,
      inStock: true
    }
  ]

  // Filter logic
  const filteredCPUCoolers = allCPUCoolers.filter((coolerItem) => {
    // Price filter
    if (coolerItem.price < priceRange[0] || coolerItem.price > priceRange[1]) {
      return false
    }

    // Search filter
    if (searchTerm && !coolerItem.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !coolerItem.brand.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    // Type filter
    if (selectedTypes.length > 0 && !selectedTypes.includes(coolerItem.specs.type)) {
      return false
    }

    // Socket filter
    if (selectedSockets.length > 0 && !selectedSockets.some(socket => coolerItem.specs.socket.includes(socket))) {
      return false
    }

    // Fan size filter
    if (selectedFanSizes.length > 0 && !selectedFanSizes.includes(coolerItem.specs.fanSize)) {
      return false
    }

    // Fan count filter
    if (selectedFanCounts.length > 0 && !selectedFanCounts.includes(coolerItem.specs.fanCount)) {
      return false
    }

    // Noise level filter
    if (selectedNoiseLevels.length > 0 && !selectedNoiseLevels.includes(coolerItem.specs.noiseLevel)) {
      return false
    }

    // TDP filter
    if (selectedTDPs.length > 0 && !selectedTDPs.includes(coolerItem.specs.tdp)) {
      return false
    }

    // Brand filter
    if (selectedBrands.length > 0 && !selectedBrands.includes(coolerItem.brand)) {
      return false
    }

    // Material filter
    if (selectedMaterials.length > 0 && !selectedMaterials.includes(coolerItem.specs.material)) {
      return false
    }

    // RGB filter
    if (selectedRGB !== null && coolerItem.specs.rgb !== selectedRGB) {
      return false
    }

    // Liquid cooling filter
    if (selectedLiquidCooling !== null && coolerItem.specs.liquidCooling !== selectedLiquidCooling) {
      return false
    }

    return true
  })

  const handleTypeChange = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const handleSocketChange = (socket: string) => {
    setSelectedSockets(prev => 
      prev.includes(socket) 
        ? prev.filter(s => s !== socket)
        : [...prev, socket]
    )
  }

  const handleFanSizeChange = (fanSize: string) => {
    setSelectedFanSizes(prev => 
      prev.includes(fanSize) 
        ? prev.filter(f => f !== fanSize)
        : [...prev, fanSize]
    )
  }

  const handleFanCountChange = (fanCount: string) => {
    setSelectedFanCounts(prev => 
      prev.includes(fanCount) 
        ? prev.filter(f => f !== fanCount)
        : [...prev, fanCount]
    )
  }

  const handleNoiseLevelChange = (noiseLevel: string) => {
    setSelectedNoiseLevels(prev => 
      prev.includes(noiseLevel) 
        ? prev.filter(n => n !== noiseLevel)
        : [...prev, noiseLevel]
    )
  }

  const handleTDPChange = (tdp: string) => {
    setSelectedTDPs(prev => 
      prev.includes(tdp) 
        ? prev.filter(t => t !== tdp)
        : [...prev, tdp]
    )
  }

  const handleBrandChange = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    )
  }

  const handleMaterialChange = (material: string) => {
    setSelectedMaterials(prev => 
      prev.includes(material) 
        ? prev.filter(m => m !== material)
        : [...prev, material]
    )
  }

  const handleRGBChange = (value: boolean) => {
    setSelectedRGB(prev => prev === value ? null : value)
  }

  const handleLiquidCoolingChange = (value: boolean) => {
    setSelectedLiquidCooling(prev => prev === value ? null : value)
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
            <Link className="nav-item" to="/">3D Builder</Link>
            <span className="nav-item">Products</span>
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
        </aside>

        {/* Main */}
        <main className="main">
          {/* Breadcrumb + controls */}
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 text-sm text-black/70">
              <span>Products</span>
              <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
              <span className="font-medium text-black">CPU Cooler</span>
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

                <div>
                  <h3 className="text-base font-semibold mb-3">Type</h3>
                  <div className="space-y-2 text-sm">
                    {['Air Cooler','Liquid Cooler'].map((type) => (
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
                  <h3 className="text-base font-semibold mb-3">Socket</h3>
                  <div className="space-y-2 text-sm">
                    {['LGA1700','AM4','AM5'].map((socket) => (
                      <label key={socket} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedSockets.includes(socket)}
                          onChange={() => handleSocketChange(socket)}
                          className="rounded" 
                        />
                        <span>{socket}</span>
                      </label>
                    ))}
                    <button onClick={() => setShowSocketPopup(true)} className="text-blue-600 text-xs">Show More</button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Fan Size</h3>
                  <div className="space-y-2 text-sm">
                    {['120mm','135mm','140mm'].map((fanSize) => (
                      <label key={fanSize} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedFanSizes.includes(fanSize)}
                          onChange={() => handleFanSizeChange(fanSize)}
                          className="rounded" 
                        />
                        <span>{fanSize}</span>
                      </label>
                    ))}
                    <button onClick={() => setShowFanSizePopup(true)} className="text-blue-600 text-xs">Show More</button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Fan Count</h3>
                  <div className="space-y-2 text-sm">
                    {['1','2','3'].map((fanCount) => (
                      <label key={fanCount} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedFanCounts.includes(fanCount)}
                          onChange={() => handleFanCountChange(fanCount)}
                          className="rounded" 
                        />
                        <span>{fanCount}</span>
                      </label>
                    ))}
                    <button onClick={() => setShowFanCountPopup(true)} className="text-blue-600 text-xs">Show More</button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Noise Level</h3>
                  <div className="space-y-2 text-sm">
                    {['22.5 dB(A)','24.3 dB(A)','24.6 dB(A)','26 dB(A)','36 dB(A)','37.7 dB(A)'].map((noiseLevel) => (
                      <label key={noiseLevel} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedNoiseLevels.includes(noiseLevel)}
                          onChange={() => handleNoiseLevelChange(noiseLevel)}
                          className="rounded" 
                        />
                        <span>{noiseLevel}</span>
                      </label>
                    ))}
                    <button onClick={() => setShowNoiseLevelPopup(true)} className="text-blue-600 text-xs">Show More</button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">TDP</h3>
                  <div className="space-y-2 text-sm">
                    {['150W','220W','250W','280W','300W'].map((tdp) => (
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
                  <h3 className="text-base font-semibold mb-3">Brand</h3>
                  <div className="space-y-2 text-sm">
                    {['Noctua','Corsair','Cooler Master','NZXT','be quiet!','Arctic'].map((brand) => (
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
                  <h3 className="text-base font-semibold mb-3">Material</h3>
                  <div className="space-y-2 text-sm">
                    {['Aluminum + Copper'].map((material) => (
                      <label key={material} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedMaterials.includes(material)}
                          onChange={() => handleMaterialChange(material)}
                          className="rounded" 
                        />
                        <span>{material}</span>
                      </label>
                    ))}
                    <button onClick={() => setShowMaterialPopup(true)} className="text-blue-600 text-xs">Show More</button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">RGB</h3>
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
                  <h3 className="text-base font-semibold mb-3">Liquid Cooling</h3>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={selectedLiquidCooling === true}
                        onChange={() => handleLiquidCoolingChange(true)}
                        className="rounded" 
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={selectedLiquidCooling === false}
                        onChange={() => handleLiquidCoolingChange(false)}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredCPUCoolers.map((coolerItem) => (
                  <div key={coolerItem.id} className="rounded-lg border border-black/10 bg-white hover:bg-black/5 transition cursor-pointer" onClick={() => setSelectedCPUCooler(coolerItem)}>
                    <div className="p-4">
                      <img src={coolerItem.image} alt={coolerItem.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                      <div className="text-sm font-medium mb-2 line-clamp-2">{coolerItem.name}</div>
                      <div className="text-lg font-bold mb-3">${coolerItem.price}</div>
                      <div className="space-y-1 text-xs text-black/60 mb-4">
                        <div className="flex justify-between"><span>Type:</span><span className="text-black">{coolerItem.specs.type}</span></div>
                        <div className="flex justify-between"><span>Socket:</span><span className="text-black">{coolerItem.specs.socket}</span></div>
                        <div className="flex justify-between"><span>Fan Size:</span><span className="text-black">{coolerItem.specs.fanSize}</span></div>
                        <div className="flex justify-between"><span>Fan Count:</span><span className="text-black">{coolerItem.specs.fanCount}</span></div>
                        <div className="flex justify-between"><span>TDP:</span><span className="text-black">{coolerItem.specs.tdp}</span></div>
                      </div>
                      <button className="w-full btn-primary">+ Add to build</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Product Detail Modal */}
      {selectedCPUCooler && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{selectedCPUCooler.name}</h2>
                  <p className="text-lg text-gray-600">{selectedCPUCooler.brand}</p>
                </div>
                <button
                  onClick={() => setSelectedCPUCooler(null)}
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
                    src={selectedCPUCooler.image}
                    alt={selectedCPUCooler.name}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                </div>
                
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-4">${selectedCPUCooler.price}</div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Specifications</h3>
                    <div className="space-y-2">
                      {Object.entries(selectedCPUCooler.specs).map(([key, value]) => (
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
                      {selectedCPUCooler.features.map((feature, index) => (
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
                        selectedCPUCooler.inStock 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={!selectedCPUCooler.inStock}
                    >
                      {selectedCPUCooler.inStock ? 'Add to Build' : 'Out of Stock'}
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
        isOpen={showTypePopup}
        onClose={() => setShowTypePopup(false)}
        title="Type"
        searchTerm={typeSearch}
        onSearchChange={setTypeSearch}
        options={['Air Cooler','Liquid Cooler','AIO Cooler','Custom Loop','Passive Cooler']}
        selectedItems={selectedTypes}
        onItemChange={handleTypeChange}
      />

      <FilterPopup
        isOpen={showSocketPopup}
        onClose={() => setShowSocketPopup(false)}
        title="Socket"
        searchTerm={socketSearch}
        onSearchChange={setSocketSearch}
        options={['LGA1700','LGA1200','LGA1151','AM4','AM5','TR4','sTRX4','sWRX8']}
        selectedItems={selectedSockets}
        onItemChange={handleSocketChange}
      />

      <FilterPopup
        isOpen={showFanSizePopup}
        onClose={() => setShowFanSizePopup(false)}
        title="Fan Size"
        searchTerm={fanSizeSearch}
        onSearchChange={setFanSizeSearch}
        options={['80mm','92mm','120mm','135mm','140mm','200mm']}
        selectedItems={selectedFanSizes}
        onItemChange={handleFanSizeChange}
      />

      <FilterPopup
        isOpen={showFanCountPopup}
        onClose={() => setShowFanCountPopup(false)}
        title="Fan Count"
        searchTerm={fanCountSearch}
        onSearchChange={setFanCountSearch}
        options={['1','2','3','4','5','6']}
        selectedItems={selectedFanCounts}
        onItemChange={handleFanCountChange}
      />

      <FilterPopup
        isOpen={showNoiseLevelPopup}
        onClose={() => setShowNoiseLevelPopup(false)}
        title="Noise Level"
        searchTerm={noiseLevelSearch}
        onSearchChange={setNoiseLevelSearch}
        options={['15 dB(A)','18 dB(A)','20 dB(A)','22 dB(A)','24 dB(A)','26 dB(A)','28 dB(A)','30 dB(A)','32 dB(A)','35 dB(A)','38 dB(A)','40 dB(A)']}
        selectedItems={selectedNoiseLevels}
        onItemChange={handleNoiseLevelChange}
      />

      <FilterPopup
        isOpen={showTDPPopup}
        onClose={() => setShowTDPPopup(false)}
        title="TDP"
        searchTerm={tdpSearch}
        onSearchChange={setTdpSearch}
        options={['65W','95W','125W','150W','180W','200W','220W','250W','280W','300W','350W','400W','500W']}
        selectedItems={selectedTDPs}
        onItemChange={handleTDPChange}
      />

      <FilterPopup
        isOpen={showBrandPopup}
        onClose={() => setShowBrandPopup(false)}
        title="Brand"
        searchTerm={brandSearch}
        onSearchChange={setBrandSearch}
        options={['Noctua','Corsair','Cooler Master','NZXT','be quiet!','Arctic','Thermaltake','ASUS','MSI','Gigabyte','Deepcool','ID-Cooling','Scythe','Phanteks']}
        selectedItems={selectedBrands}
        onItemChange={handleBrandChange}
      />

      <FilterPopup
        isOpen={showMaterialPopup}
        onClose={() => setShowMaterialPopup(false)}
        title="Material"
        searchTerm={materialSearch}
        onSearchChange={setMaterialSearch}
        options={['Aluminum','Copper','Aluminum + Copper','Nickel Plated Copper','Ceramic','Plastic']}
        selectedItems={selectedMaterials}
        onItemChange={handleMaterialChange}
      />
    </div>
  )
}

export default CPUCoolerPage
