import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import '../../Homepage.css'

interface MicrophoneItem {
  id: number
  name: string
  brand: string
  price: number
  image: string
  specs: {
    polarPattern: string
    frequencyResponse: string
    sensitivity: string
    type: string
    connectivity: string
    impedance: string
    maxSPL: string
    phantomPower: string
    warranty: string
    streaming: boolean
    wireless: boolean
    usb: boolean
    xlr: boolean
  }
  features: string[]
  rating: number
  reviews: number
  inStock: boolean
}

function MicrophonePage() {
  const [selectedMicrophone, setSelectedMicrophone] = useState<MicrophoneItem | null>(null)
  const [priceRange, setPriceRange] = useState<[number, number]>([50, 500])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPolarPatterns, setSelectedPolarPatterns] = useState<string[]>([])
  const [selectedFrequencyResponses, setSelectedFrequencyResponses] = useState<string[]>([])
  const [selectedSensitivities, setSelectedSensitivities] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedConnectivities, setSelectedConnectivities] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedStreaming, setSelectedStreaming] = useState<boolean | null>(null)
  const [selectedWireless, setSelectedWireless] = useState<boolean | null>(null)
  const [selectedUSB, setSelectedUSB] = useState<boolean | null>(null)
  const [selectedXLR, setSelectedXLR] = useState<boolean | null>(null)
  
  // Popup states
  const [showPolarPatternPopup, setShowPolarPatternPopup] = useState(false)
  const [showFrequencyResponsePopup, setShowFrequencyResponsePopup] = useState(false)
  const [showSensitivityPopup, setShowSensitivityPopup] = useState(false)
  const [showTypePopup, setShowTypePopup] = useState(false)
  const [showConnectivityPopup, setShowConnectivityPopup] = useState(false)
  const [showBrandPopup, setShowBrandPopup] = useState(false)
  
  // Search terms for popups
  const [polarPatternSearch, setPolarPatternSearch] = useState('')
  const [frequencyResponseSearch, setFrequencyResponseSearch] = useState('')
  const [sensitivitySearch, setSensitivitySearch] = useState('')
  const [typeSearch, setTypeSearch] = useState('')
  const [connectivitySearch, setConnectivitySearch] = useState('')
  const [brandSearch, setBrandSearch] = useState('')

  const allMicrophones = [
    {
      id: 1,
      name: 'Blue Yeti USB Microphone',
      brand: 'Blue',
      price: 129.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        polarPattern: 'Cardioid',
        frequencyResponse: '20Hz - 20kHz',
        sensitivity: '-36 dB',
        type: 'Condenser',
        connectivity: 'USB',
        impedance: '16 Ohms',
        maxSPL: '120 dB',
        phantomPower: 'No',
        warranty: '2 Years',
        streaming: true,
        wireless: false,
        usb: true,
        xlr: false
      },
      features: ['USB Plug & Play', 'Multiple Polar Patterns', 'Headphone Output', 'Mute Button', 'Gain Control'],
      rating: 4.5,
      reviews: 15432,
      inStock: true
    },
    {
      id: 2,
      name: 'Audio-Technica AT2020USB+',
      brand: 'Audio-Technica',
      price: 149.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        polarPattern: 'Cardioid',
        frequencyResponse: '20Hz - 20kHz',
        sensitivity: '-37 dB',
        type: 'Condenser',
        connectivity: 'USB',
        impedance: '16 Ohms',
        maxSPL: '144 dB',
        phantomPower: 'No',
        warranty: '2 Years',
        streaming: true,
        wireless: false,
        usb: true,
        xlr: false
      },
      features: ['USB Plug & Play', 'Cardioid Pattern', 'Headphone Output', 'Mix Control', 'Professional Quality'],
      rating: 4.7,
      reviews: 8934,
      inStock: true
    },
    {
      id: 3,
      name: 'Shure SM7B Dynamic Microphone',
      brand: 'Shure',
      price: 399.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        polarPattern: 'Cardioid',
        frequencyResponse: '50Hz - 20kHz',
        sensitivity: '-59 dB',
        type: 'Dynamic',
        connectivity: 'XLR',
        impedance: '150 Ohms',
        maxSPL: '180 dB',
        phantomPower: 'No',
        warranty: '2 Years',
        streaming: true,
        wireless: false,
        usb: false,
        xlr: true
      },
      features: ['Professional Dynamic', 'Cardioid Pattern', 'Internal Air Suspension', 'Frequency Response Shaping', 'Broadcast Quality'],
      rating: 4.9,
      reviews: 2341,
      inStock: false
    },
    {
      id: 4,
      name: 'Rode PodMic Dynamic Microphone',
      brand: 'Rode',
      price: 99.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        polarPattern: 'Cardioid',
        frequencyResponse: '20Hz - 20kHz',
        sensitivity: '-57 dB',
        type: 'Dynamic',
        connectivity: 'XLR',
        impedance: '320 Ohms',
        maxSPL: '140 dB',
        phantomPower: 'No',
        warranty: '2 Years',
        streaming: true,
        wireless: false,
        usb: false,
        xlr: true
      },
      features: ['Podcast Optimized', 'Cardioid Pattern', 'Internal Shock Mount', 'Professional Quality', 'Broadcast Ready'],
      rating: 4.6,
      reviews: 5678,
      inStock: true
    },
    {
      id: 5,
      name: 'HyperX QuadCast S USB Microphone',
      brand: 'HyperX',
      price: 159.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        polarPattern: 'Cardioid',
        frequencyResponse: '20Hz - 20kHz',
        sensitivity: '-36 dB',
        type: 'Condenser',
        connectivity: 'USB',
        impedance: '16 Ohms',
        maxSPL: '120 dB',
        phantomPower: 'No',
        warranty: '2 Years',
        streaming: true,
        wireless: false,
        usb: true,
        xlr: false
      },
      features: ['RGB Lighting', 'USB Plug & Play', 'Multiple Polar Patterns', 'Tap-to-Mute', 'Gaming Optimized'],
      rating: 4.4,
      reviews: 3456,
      inStock: true
    },
    {
      id: 6,
      name: 'Sennheiser MKE 600 Shotgun Microphone',
      brand: 'Sennheiser',
      price: 199.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        polarPattern: 'Supercardioid',
        frequencyResponse: '40Hz - 20kHz',
        sensitivity: '-35 dB',
        type: 'Condenser',
        connectivity: 'XLR',
        impedance: '200 Ohms',
        maxSPL: '130 dB',
        phantomPower: 'Yes',
        warranty: '2 Years',
        streaming: false,
        wireless: false,
        usb: false,
        xlr: true
      },
      features: ['Shotgun Pattern', 'Phantom Power', 'Low Self-Noise', 'Video Production', 'Professional Quality'],
      rating: 4.8,
      reviews: 1234,
      inStock: true
    }
  ]

  // Filter logic
  const filteredMicrophones = allMicrophones.filter((microphoneItem) => {
    // Price filter
    if (microphoneItem.price < priceRange[0] || microphoneItem.price > priceRange[1]) {
      return false
    }

    // Search filter
    if (searchTerm && !microphoneItem.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !microphoneItem.brand.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    // Polar pattern filter
    if (selectedPolarPatterns.length > 0 && !selectedPolarPatterns.includes(microphoneItem.specs.polarPattern)) {
      return false
    }

    // Frequency response filter
    if (selectedFrequencyResponses.length > 0 && !selectedFrequencyResponses.includes(microphoneItem.specs.frequencyResponse)) {
      return false
    }

    // Sensitivity filter
    if (selectedSensitivities.length > 0 && !selectedSensitivities.includes(microphoneItem.specs.sensitivity)) {
      return false
    }

    // Type filter
    if (selectedTypes.length > 0 && !selectedTypes.includes(microphoneItem.specs.type)) {
      return false
    }

    // Connectivity filter
    if (selectedConnectivities.length > 0 && !selectedConnectivities.includes(microphoneItem.specs.connectivity)) {
      return false
    }

    // Brand filter
    if (selectedBrands.length > 0 && !selectedBrands.includes(microphoneItem.brand)) {
      return false
    }

    // Streaming filter
    if (selectedStreaming !== null && microphoneItem.specs.streaming !== selectedStreaming) {
      return false
    }

    // Wireless filter
    if (selectedWireless !== null && microphoneItem.specs.wireless !== selectedWireless) {
      return false
    }

    // USB filter
    if (selectedUSB !== null && microphoneItem.specs.usb !== selectedUSB) {
      return false
    }

    // XLR filter
    if (selectedXLR !== null && microphoneItem.specs.xlr !== selectedXLR) {
      return false
    }

    return true
  })

  const handlePolarPatternChange = (polarPattern: string) => {
    setSelectedPolarPatterns(prev => 
      prev.includes(polarPattern) 
        ? prev.filter(p => p !== polarPattern)
        : [...prev, polarPattern]
    )
  }

  const handleFrequencyResponseChange = (frequencyResponse: string) => {
    setSelectedFrequencyResponses(prev => 
      prev.includes(frequencyResponse) 
        ? prev.filter(f => f !== frequencyResponse)
        : [...prev, frequencyResponse]
    )
  }

  const handleSensitivityChange = (sensitivity: string) => {
    setSelectedSensitivities(prev => 
      prev.includes(sensitivity) 
        ? prev.filter(s => s !== sensitivity)
        : [...prev, sensitivity]
    )
  }

  const handleTypeChange = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const handleConnectivityChange = (connectivity: string) => {
    setSelectedConnectivities(prev => 
      prev.includes(connectivity) 
        ? prev.filter(c => c !== connectivity)
        : [...prev, connectivity]
    )
  }

  const handleBrandChange = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    )
  }

  const handleStreamingChange = (value: boolean) => {
    setSelectedStreaming(prev => prev === value ? null : value)
  }

  const handleWirelessChange = (value: boolean) => {
    setSelectedWireless(prev => prev === value ? null : value)
  }

  const handleUSBChange = (value: boolean) => {
    setSelectedUSB(prev => prev === value ? null : value)
  }

  const handleXLRChange = (value: boolean) => {
    setSelectedXLR(prev => prev === value ? null : value)
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
              <span className="font-medium text-black">Microphone</span>
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
                      <span>$50</span>
                      <span>$500</span>
                    </div>
                    <input 
                      type="range" 
                      min="50" 
                      max="500" 
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full" 
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Polar Pattern</h3>
                  <div className="space-y-2 text-sm">
                    {['Cardioid','Supercardioid','Omnidirectional','Bidirectional'].map((polarPattern) => (
                      <label key={polarPattern} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedPolarPatterns.includes(polarPattern)}
                          onChange={() => handlePolarPatternChange(polarPattern)}
                          className="rounded" 
                        />
                        <span>{polarPattern}</span>
                      </label>
                    ))}
                    <button onClick={() => setShowPolarPatternPopup(true)} className="text-blue-600 text-xs">Show More</button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Frequency Response</h3>
                  <div className="space-y-2 text-sm">
                    {['20Hz - 20kHz','40Hz - 20kHz','50Hz - 20kHz'].map((frequencyResponse) => (
                      <label key={frequencyResponse} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedFrequencyResponses.includes(frequencyResponse)}
                          onChange={() => handleFrequencyResponseChange(frequencyResponse)}
                          className="rounded" 
                        />
                        <span>{frequencyResponse}</span>
                      </label>
                    ))}
                    <button onClick={() => setShowFrequencyResponsePopup(true)} className="text-blue-600 text-xs">Show More</button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Sensitivity</h3>
                  <div className="space-y-2 text-sm">
                    {['-35 dB','-36 dB','-37 dB','-57 dB','-59 dB'].map((sensitivity) => (
                      <label key={sensitivity} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedSensitivities.includes(sensitivity)}
                          onChange={() => handleSensitivityChange(sensitivity)}
                          className="rounded" 
                        />
                        <span>{sensitivity}</span>
                      </label>
                    ))}
                    <button onClick={() => setShowSensitivityPopup(true)} className="text-blue-600 text-xs">Show More</button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Type</h3>
                  <div className="space-y-2 text-sm">
                    {['Condenser','Dynamic','Ribbon'].map((type) => (
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
                  <h3 className="text-base font-semibold mb-3">Connectivity</h3>
                  <div className="space-y-2 text-sm">
                    {['USB','XLR','Wireless'].map((connectivity) => (
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
                  <h3 className="text-base font-semibold mb-3">Brand</h3>
                  <div className="space-y-2 text-sm">
                    {['Blue','Audio-Technica','Shure','Rode','HyperX','Sennheiser'].map((brand) => (
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
                  <h3 className="text-base font-semibold mb-3">Streaming</h3>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={selectedStreaming === true}
                        onChange={() => handleStreamingChange(true)}
                        className="rounded" 
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={selectedStreaming === false}
                        onChange={() => handleStreamingChange(false)}
                        className="rounded" 
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Wireless</h3>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={selectedWireless === true}
                        onChange={() => handleWirelessChange(true)}
                        className="rounded" 
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={selectedWireless === false}
                        onChange={() => handleWirelessChange(false)}
                        className="rounded" 
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">USB</h3>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={selectedUSB === true}
                        onChange={() => handleUSBChange(true)}
                        className="rounded" 
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={selectedUSB === false}
                        onChange={() => handleUSBChange(false)}
                        className="rounded" 
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">XLR</h3>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={selectedXLR === true}
                        onChange={() => handleXLRChange(true)}
                        className="rounded" 
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={selectedXLR === false}
                        onChange={() => handleXLRChange(false)}
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
                {filteredMicrophones.map((microphoneItem) => (
                  <div key={microphoneItem.id} className="rounded-lg border border-black/10 bg-white hover:bg-black/5 transition cursor-pointer" onClick={() => setSelectedMicrophone(microphoneItem)}>
                    <div className="p-4">
                      <img src={microphoneItem.image} alt={microphoneItem.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                      <div className="text-sm font-medium mb-2 line-clamp-2">{microphoneItem.name}</div>
                      <div className="text-lg font-bold mb-3">${microphoneItem.price}</div>
                      <div className="space-y-1 text-xs text-black/60 mb-4">
                        <div className="flex justify-between"><span>Polar Pattern:</span><span className="text-black">{microphoneItem.specs.polarPattern}</span></div>
                        <div className="flex justify-between"><span>Type:</span><span className="text-black">{microphoneItem.specs.type}</span></div>
                        <div className="flex justify-between"><span>Connectivity:</span><span className="text-black">{microphoneItem.specs.connectivity}</span></div>
                        <div className="flex justify-between"><span>Sensitivity:</span><span className="text-black">{microphoneItem.specs.sensitivity}</span></div>
                        <div className="flex justify-between"><span>Max SPL:</span><span className="text-black">{microphoneItem.specs.maxSPL}</span></div>
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
      {selectedMicrophone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{selectedMicrophone.name}</h2>
                  <p className="text-lg text-gray-600">{selectedMicrophone.brand}</p>
                </div>
                <button
                  onClick={() => setSelectedMicrophone(null)}
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
                    src={selectedMicrophone.image}
                    alt={selectedMicrophone.name}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                </div>
                
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-4">${selectedMicrophone.price}</div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Specifications</h3>
                    <div className="space-y-2">
                      {Object.entries(selectedMicrophone.specs).map(([key, value]) => (
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
                      {selectedMicrophone.features.map((feature, index) => (
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
                        selectedMicrophone.inStock 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={!selectedMicrophone.inStock}
                    >
                      {selectedMicrophone.inStock ? 'Add to Build' : 'Out of Stock'}
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
        isOpen={showPolarPatternPopup}
        onClose={() => setShowPolarPatternPopup(false)}
        title="Polar Pattern"
        searchTerm={polarPatternSearch}
        onSearchChange={setPolarPatternSearch}
        options={['Cardioid','Supercardioid','Hypercardioid','Omnidirectional','Bidirectional','Figure-8','Shotgun','Lobar']}
        selectedItems={selectedPolarPatterns}
        onItemChange={handlePolarPatternChange}
      />

      <FilterPopup
        isOpen={showFrequencyResponsePopup}
        onClose={() => setShowFrequencyResponsePopup(false)}
        title="Frequency Response"
        searchTerm={frequencyResponseSearch}
        onSearchChange={setFrequencyResponseSearch}
        options={['20Hz - 20kHz','30Hz - 20kHz','40Hz - 20kHz','50Hz - 20kHz','60Hz - 20kHz','80Hz - 15kHz','100Hz - 15kHz']}
        selectedItems={selectedFrequencyResponses}
        onItemChange={handleFrequencyResponseChange}
      />

      <FilterPopup
        isOpen={showSensitivityPopup}
        onClose={() => setShowSensitivityPopup(false)}
        title="Sensitivity"
        searchTerm={sensitivitySearch}
        onSearchChange={setSensitivitySearch}
        options={['-30 dB','-32 dB','-35 dB','-36 dB','-37 dB','-40 dB','-45 dB','-50 dB','-55 dB','-57 dB','-59 dB','-60 dB']}
        selectedItems={selectedSensitivities}
        onItemChange={handleSensitivityChange}
      />

      <FilterPopup
        isOpen={showTypePopup}
        onClose={() => setShowTypePopup(false)}
        title="Type"
        searchTerm={typeSearch}
        onSearchChange={setTypeSearch}
        options={['Condenser','Dynamic','Ribbon','Electret','Carbon','Crystal','Piezoelectric']}
        selectedItems={selectedTypes}
        onItemChange={handleTypeChange}
      />

      <FilterPopup
        isOpen={showConnectivityPopup}
        onClose={() => setShowConnectivityPopup(false)}
        title="Connectivity"
        searchTerm={connectivitySearch}
        onSearchChange={setConnectivitySearch}
        options={['USB','XLR','Wireless','Bluetooth','3.5mm','6.35mm','RCA','MIDI','Ethernet']}
        selectedItems={selectedConnectivities}
        onItemChange={handleConnectivityChange}
      />

      <FilterPopup
        isOpen={showBrandPopup}
        onClose={() => setShowBrandPopup(false)}
        title="Brand"
        searchTerm={brandSearch}
        onSearchChange={setBrandSearch}
        options={['Blue','Audio-Technica','Shure','Rode','HyperX','Sennheiser','AKG','Beyerdynamic','Neumann','Electro-Voice','MXL','Samson','Zoom','Tascam','Focusrite']}
        selectedItems={selectedBrands}
        onItemChange={handleBrandChange}
      />
    </div>
  )
}

export default MicrophonePage
