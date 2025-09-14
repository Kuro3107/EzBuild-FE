import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import '../../Homepage.css'

interface CaseFanItem {
  id: number
  name: string
  brand: string
  price: number
  image: string
  specs: {
    size: string
    airflow: string
    noiseLevel: string
    rpm: string
    connectionType: string
    bearing: string
    voltage: string
    current: string
    power: string
    warranty: string
    rgb: boolean
    pwm: boolean
  }
  features: string[]
  rating: number
  reviews: number
  inStock: boolean
}

function CaseFanPage() {
  const [selectedCaseFan, setSelectedCaseFan] = useState<CaseFanItem | null>(null)
  const [priceRange, setPriceRange] = useState<[number, number]>([10, 100])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedAirflows, setSelectedAirflows] = useState<string[]>([])
  const [selectedNoiseLevels, setSelectedNoiseLevels] = useState<string[]>([])
  const [selectedRPMs, setSelectedRPMs] = useState<string[]>([])
  const [selectedConnectionTypes, setSelectedConnectionTypes] = useState<string[]>([])
  const [selectedBearings, setSelectedBearings] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedRGB, setSelectedRGB] = useState<boolean | null>(null)
  const [selectedPWM, setSelectedPWM] = useState<boolean | null>(null)
  
  // Popup states
  const [showSizePopup, setShowSizePopup] = useState(false)
  const [showAirflowPopup, setShowAirflowPopup] = useState(false)
  const [showNoiseLevelPopup, setShowNoiseLevelPopup] = useState(false)
  const [showRPMPopup, setShowRPMPopup] = useState(false)
  const [showConnectionTypePopup, setShowConnectionTypePopup] = useState(false)
  const [showBearingPopup, setShowBearingPopup] = useState(false)
  const [showBrandPopup, setShowBrandPopup] = useState(false)
  
  // Search terms for popups
  const [sizeSearch, setSizeSearch] = useState('')
  const [airflowSearch, setAirflowSearch] = useState('')
  const [noiseLevelSearch, setNoiseLevelSearch] = useState('')
  const [rpmSearch, setRpmSearch] = useState('')
  const [connectionTypeSearch, setConnectionTypeSearch] = useState('')
  const [bearingSearch, setBearingSearch] = useState('')
  const [brandSearch, setBrandSearch] = useState('')

  const allCaseFans = [
    {
      id: 1,
      name: 'Noctua NF-A12x25 PWM',
      brand: 'Noctua',
      price: 29.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        size: '120mm',
        airflow: '102.1 m³/h',
        noiseLevel: '22.6 dB(A)',
        rpm: '2000 RPM',
        connectionType: '4-pin PWM',
        bearing: 'SSO2',
        voltage: '12V',
        current: '0.14A',
        power: '1.68W',
        warranty: '6 Years',
        rgb: false,
        pwm: true
      },
      features: ['Premium Quality', 'Low Noise', 'High Performance', 'PWM Control', 'Premium Bearing'],
      rating: 4.8,
      reviews: 342,
      inStock: true
    },
    {
      id: 2,
      name: 'Corsair LL120 RGB 120mm',
      brand: 'Corsair',
      price: 34.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        size: '120mm',
        airflow: '43.25 CFM',
        noiseLevel: '24.8 dB(A)',
        rpm: '1500 RPM',
        connectionType: '4-pin PWM',
        bearing: 'Rifle Bearing',
        voltage: '12V',
        current: '0.3A',
        power: '3.6W',
        warranty: '2 Years',
        rgb: true,
        pwm: true
      },
      features: ['RGB Lighting', 'iCUE Software', 'PWM Control', 'High Performance', '16 LED Zones'],
      rating: 4.6,
      reviews: 289,
      inStock: true
    },
    {
      id: 3,
      name: 'be quiet! Silent Wings 3 140mm',
      brand: 'be quiet!',
      price: 24.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        size: '140mm',
        airflow: '59.5 m³/h',
        noiseLevel: '15.5 dB(A)',
        rpm: '1000 RPM',
        connectionType: '3-pin',
        bearing: 'Fluid Dynamic Bearing',
        voltage: '12V',
        current: '0.08A',
        power: '0.96W',
        warranty: '3 Years',
        rgb: false,
        pwm: false
      },
      features: ['Silent Operation', 'High Performance', 'Premium Build', 'Low Noise', 'Fluid Dynamic Bearing'],
      rating: 4.7,
      reviews: 156,
      inStock: true
    },
    {
      id: 4,
      name: 'Cooler Master MasterFan MF120 Halo',
      brand: 'Cooler Master',
      price: 19.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        size: '120mm',
        airflow: '47.2 CFM',
        noiseLevel: '27 dB(A)',
        rpm: '1800 RPM',
        connectionType: '4-pin PWM',
        bearing: 'Rifle Bearing',
        voltage: '12V',
        current: '0.25A',
        power: '3W',
        warranty: '2 Years',
        rgb: true,
        pwm: true
      },
      features: ['RGB Lighting', 'PWM Control', 'High Performance', 'ARGB Compatible', 'Budget Friendly'],
      rating: 4.4,
      reviews: 203,
      inStock: false
    },
    {
      id: 5,
      name: 'Arctic P12 PWM PST 120mm',
      brand: 'Arctic',
      price: 8.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        size: '120mm',
        airflow: '56.3 m³/h',
        noiseLevel: '22.5 dB(A)',
        rpm: '1800 RPM',
        connectionType: '4-pin PWM',
        bearing: 'Fluid Dynamic Bearing',
        voltage: '12V',
        current: '0.12A',
        power: '1.44W',
        warranty: '6 Years',
        rgb: false,
        pwm: true
      },
      features: ['Budget Friendly', 'High Performance', 'PWM Control', 'PST Technology', 'Fluid Dynamic Bearing'],
      rating: 4.5,
      reviews: 178,
      inStock: true
    },
    {
      id: 6,
      name: 'Lian Li UNI FAN SL120 V2',
      brand: 'Lian Li',
      price: 79.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        size: '120mm',
        airflow: '58.54 CFM',
        noiseLevel: '28.3 dB(A)',
        rpm: '1900 RPM',
        connectionType: '4-pin PWM',
        bearing: 'Fluid Dynamic Bearing',
        voltage: '12V',
        current: '0.18A',
        power: '2.16W',
        warranty: '2 Years',
        rgb: true,
        pwm: true
      },
      features: ['RGB Lighting', 'Daisy Chain', 'PWM Control', 'High Performance', 'L-Connect Software'],
      rating: 4.7,
      reviews: 145,
      inStock: true
    }
  ]

  // Filter logic
  const filteredCaseFans = allCaseFans.filter((fanItem) => {
    // Price filter
    if (fanItem.price < priceRange[0] || fanItem.price > priceRange[1]) {
      return false
    }

    // Search filter
    if (searchTerm && !fanItem.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !fanItem.brand.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    // Size filter
    if (selectedSizes.length > 0 && !selectedSizes.includes(fanItem.specs.size)) {
      return false
    }

    // Airflow filter
    if (selectedAirflows.length > 0 && !selectedAirflows.includes(fanItem.specs.airflow)) {
      return false
    }

    // Noise level filter
    if (selectedNoiseLevels.length > 0 && !selectedNoiseLevels.includes(fanItem.specs.noiseLevel)) {
      return false
    }

    // RPM filter
    if (selectedRPMs.length > 0 && !selectedRPMs.includes(fanItem.specs.rpm)) {
      return false
    }

    // Connection type filter
    if (selectedConnectionTypes.length > 0 && !selectedConnectionTypes.includes(fanItem.specs.connectionType)) {
      return false
    }

    // Bearing filter
    if (selectedBearings.length > 0 && !selectedBearings.includes(fanItem.specs.bearing)) {
      return false
    }

    // Brand filter
    if (selectedBrands.length > 0 && !selectedBrands.includes(fanItem.brand)) {
      return false
    }

    // RGB filter
    if (selectedRGB !== null && fanItem.specs.rgb !== selectedRGB) {
      return false
    }

    // PWM filter
    if (selectedPWM !== null && fanItem.specs.pwm !== selectedPWM) {
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

  const handleAirflowChange = (airflow: string) => {
    setSelectedAirflows(prev => 
      prev.includes(airflow) 
        ? prev.filter(a => a !== airflow)
        : [...prev, airflow]
    )
  }

  const handleNoiseLevelChange = (noiseLevel: string) => {
    setSelectedNoiseLevels(prev => 
      prev.includes(noiseLevel) 
        ? prev.filter(n => n !== noiseLevel)
        : [...prev, noiseLevel]
    )
  }

  const handleRPMChange = (rpm: string) => {
    setSelectedRPMs(prev => 
      prev.includes(rpm) 
        ? prev.filter(r => r !== rpm)
        : [...prev, rpm]
    )
  }

  const handleConnectionTypeChange = (connectionType: string) => {
    setSelectedConnectionTypes(prev => 
      prev.includes(connectionType) 
        ? prev.filter(c => c !== connectionType)
        : [...prev, connectionType]
    )
  }

  const handleBearingChange = (bearing: string) => {
    setSelectedBearings(prev => 
      prev.includes(bearing) 
        ? prev.filter(b => b !== bearing)
        : [...prev, bearing]
    )
  }

  const handleBrandChange = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    )
  }

  const handleRGBChange = (value: boolean) => {
    setSelectedRGB(prev => prev === value ? null : value)
  }

  const handlePWMChange = (value: boolean) => {
    setSelectedPWM(prev => prev === value ? null : value)
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
              <span className="font-medium text-black">Case Fan</span>
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
                      <span>$10</span>
                      <span>$100</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="100" 
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full" 
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Size</h3>
                  <div className="space-y-2 text-sm">
                    {['120mm','140mm'].map((size) => (
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
                  <h3 className="text-base font-semibold mb-3">Airflow</h3>
                  <div className="space-y-2 text-sm">
                    {['43.25 CFM','47.2 CFM','56.3 m³/h','58.54 CFM','59.5 m³/h','102.1 m³/h'].map((airflow) => (
                      <label key={airflow} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedAirflows.includes(airflow)}
                          onChange={() => handleAirflowChange(airflow)}
                          className="rounded" 
                        />
                        <span>{airflow}</span>
                      </label>
                    ))}
                    <button onClick={() => setShowAirflowPopup(true)} className="text-blue-600 text-xs">Show More</button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Noise Level</h3>
                  <div className="space-y-2 text-sm">
                    {['15.5 dB(A)','22.5 dB(A)','22.6 dB(A)','24.8 dB(A)','27 dB(A)','28.3 dB(A)'].map((noiseLevel) => (
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
                  <h3 className="text-base font-semibold mb-3">RPM</h3>
                  <div className="space-y-2 text-sm">
                    {['1000 RPM','1500 RPM','1800 RPM','1900 RPM','2000 RPM'].map((rpm) => (
                      <label key={rpm} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedRPMs.includes(rpm)}
                          onChange={() => handleRPMChange(rpm)}
                          className="rounded" 
                        />
                        <span>{rpm}</span>
                      </label>
                    ))}
                    <button onClick={() => setShowRPMPopup(true)} className="text-blue-600 text-xs">Show More</button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Connection Type</h3>
                  <div className="space-y-2 text-sm">
                    {['3-pin','4-pin PWM'].map((connectionType) => (
                      <label key={connectionType} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedConnectionTypes.includes(connectionType)}
                          onChange={() => handleConnectionTypeChange(connectionType)}
                          className="rounded" 
                        />
                        <span>{connectionType}</span>
                      </label>
                    ))}
                    <button onClick={() => setShowConnectionTypePopup(true)} className="text-blue-600 text-xs">Show More</button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Bearing</h3>
                  <div className="space-y-2 text-sm">
                    {['Fluid Dynamic Bearing','Rifle Bearing','SSO2'].map((bearing) => (
                      <label key={bearing} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedBearings.includes(bearing)}
                          onChange={() => handleBearingChange(bearing)}
                          className="rounded" 
                        />
                        <span>{bearing}</span>
                      </label>
                    ))}
                    <button onClick={() => setShowBearingPopup(true)} className="text-blue-600 text-xs">Show More</button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Brand</h3>
                  <div className="space-y-2 text-sm">
                    {['Noctua','Corsair','be quiet!','Cooler Master','Arctic','Lian Li'].map((brand) => (
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
                  <h3 className="text-base font-semibold mb-3">PWM</h3>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={selectedPWM === true}
                        onChange={() => handlePWMChange(true)}
                        className="rounded" 
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={selectedPWM === false}
                        onChange={() => handlePWMChange(false)}
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
                {filteredCaseFans.map((fanItem) => (
                  <div key={fanItem.id} className="rounded-lg border border-black/10 bg-white hover:bg-black/5 transition cursor-pointer" onClick={() => setSelectedCaseFan(fanItem)}>
                    <div className="p-4">
                      <img src={fanItem.image} alt={fanItem.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                      <div className="text-sm font-medium mb-2 line-clamp-2">{fanItem.name}</div>
                      <div className="text-lg font-bold mb-3">${fanItem.price}</div>
                      <div className="space-y-1 text-xs text-black/60 mb-4">
                        <div className="flex justify-between"><span>Size:</span><span className="text-black">{fanItem.specs.size}</span></div>
                        <div className="flex justify-between"><span>Airflow:</span><span className="text-black">{fanItem.specs.airflow}</span></div>
                        <div className="flex justify-between"><span>Noise Level:</span><span className="text-black">{fanItem.specs.noiseLevel}</span></div>
                        <div className="flex justify-between"><span>RPM:</span><span className="text-black">{fanItem.specs.rpm}</span></div>
                        <div className="flex justify-between"><span>Connection:</span><span className="text-black">{fanItem.specs.connectionType}</span></div>
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
      {selectedCaseFan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{selectedCaseFan.name}</h2>
                  <p className="text-lg text-gray-600">{selectedCaseFan.brand}</p>
                </div>
                <button
                  onClick={() => setSelectedCaseFan(null)}
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
                    src={selectedCaseFan.image}
                    alt={selectedCaseFan.name}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                </div>
                
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-4">${selectedCaseFan.price}</div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Specifications</h3>
                    <div className="space-y-2">
                      {Object.entries(selectedCaseFan.specs).map(([key, value]) => (
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
                      {selectedCaseFan.features.map((feature, index) => (
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
                        selectedCaseFan.inStock 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={!selectedCaseFan.inStock}
                    >
                      {selectedCaseFan.inStock ? 'Add to Build' : 'Out of Stock'}
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
        options={['80mm','92mm','120mm','140mm','200mm','230mm']}
        selectedItems={selectedSizes}
        onItemChange={handleSizeChange}
      />

      <FilterPopup
        isOpen={showAirflowPopup}
        onClose={() => setShowAirflowPopup(false)}
        title="Airflow"
        searchTerm={airflowSearch}
        onSearchChange={setAirflowSearch}
        options={['20 CFM','30 CFM','40 CFM','43.25 CFM','47.2 CFM','50 CFM','56.3 m³/h','58.54 CFM','59.5 m³/h','60 CFM','70 CFM','80 CFM','90 CFM','100 CFM','102.1 m³/h']}
        selectedItems={selectedAirflows}
        onItemChange={handleAirflowChange}
      />

      <FilterPopup
        isOpen={showNoiseLevelPopup}
        onClose={() => setShowNoiseLevelPopup(false)}
        title="Noise Level"
        searchTerm={noiseLevelSearch}
        onSearchChange={setNoiseLevelSearch}
        options={['10 dB(A)','12 dB(A)','15 dB(A)','15.5 dB(A)','18 dB(A)','20 dB(A)','22 dB(A)','22.5 dB(A)','22.6 dB(A)','24 dB(A)','24.8 dB(A)','26 dB(A)','27 dB(A)','28 dB(A)','28.3 dB(A)','30 dB(A)','32 dB(A)','35 dB(A)','38 dB(A)','40 dB(A)']}
        selectedItems={selectedNoiseLevels}
        onItemChange={handleNoiseLevelChange}
      />

      <FilterPopup
        isOpen={showRPMPopup}
        onClose={() => setShowRPMPopup(false)}
        title="RPM"
        searchTerm={rpmSearch}
        onSearchChange={setRpmSearch}
        options={['600 RPM','800 RPM','1000 RPM','1200 RPM','1400 RPM','1500 RPM','1600 RPM','1800 RPM','1900 RPM','2000 RPM','2200 RPM','2400 RPM','2600 RPM','2800 RPM','3000 RPM']}
        selectedItems={selectedRPMs}
        onItemChange={handleRPMChange}
      />

      <FilterPopup
        isOpen={showConnectionTypePopup}
        onClose={() => setShowConnectionTypePopup(false)}
        title="Connection Type"
        searchTerm={connectionTypeSearch}
        onSearchChange={setConnectionTypeSearch}
        options={['3-pin','4-pin PWM','Molex','USB','SATA']}
        selectedItems={selectedConnectionTypes}
        onItemChange={handleConnectionTypeChange}
      />

      <FilterPopup
        isOpen={showBearingPopup}
        onClose={() => setShowBearingPopup(false)}
        title="Bearing"
        searchTerm={bearingSearch}
        onSearchChange={setBearingSearch}
        options={['Sleeve Bearing','Ball Bearing','Fluid Dynamic Bearing','Rifle Bearing','Hydro Dynamic Bearing','SSO','SSO2','Magnetic Levitation']}
        selectedItems={selectedBearings}
        onItemChange={handleBearingChange}
      />

      <FilterPopup
        isOpen={showBrandPopup}
        onClose={() => setShowBrandPopup(false)}
        title="Brand"
        searchTerm={brandSearch}
        onSearchChange={setBrandSearch}
        options={['Noctua','Corsair','be quiet!','Cooler Master','Arctic','Lian Li','Thermaltake','ASUS','MSI','Gigabyte','Deepcool','ID-Cooling','Scythe','Phanteks','Fractal Design']}
        selectedItems={selectedBrands}
        onItemChange={handleBrandChange}
      />
    </div>
  )
}

export default CaseFanPage
