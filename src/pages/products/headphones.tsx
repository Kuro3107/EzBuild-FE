import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import '../../Homepage.css'

interface HeadphonesItem {
  id: number
  name: string
  brand: string
  price: number
  image: string
  specs: {
    driverSize: string
    impedance: string
    frequencyResponse: string
    sensitivity: string
    type: string
    connectivity: string
    battery: string
    weight: string
    cable: string
    warranty: string
    wireless: boolean
    noiseCancellation: boolean
    gaming: boolean
    microphone: boolean
  }
  features: string[]
  rating: number
  reviews: number
  inStock: boolean
}

function HeadphonesPage() {
  const [selectedHeadphones, setSelectedHeadphones] = useState<HeadphonesItem | null>(null)
  const [priceRange, setPriceRange] = useState<[number, number]>([50, 500])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDriverSizes, setSelectedDriverSizes] = useState<string[]>([])
  const [selectedImpedances, setSelectedImpedances] = useState<string[]>([])
  const [selectedFrequencyResponses, setSelectedFrequencyResponses] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedConnectivities, setSelectedConnectivities] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedWireless, setSelectedWireless] = useState<boolean | null>(null)
  const [selectedNoiseCancellation, setSelectedNoiseCancellation] = useState<boolean | null>(null)
  const [selectedGaming, setSelectedGaming] = useState<boolean | null>(null)
  const [selectedMicrophone, setSelectedMicrophone] = useState<boolean | null>(null)
  
  // Popup states
  const [showDriverSizePopup, setShowDriverSizePopup] = useState(false)
  const [showImpedancePopup, setShowImpedancePopup] = useState(false)
  const [showFrequencyResponsePopup, setShowFrequencyResponsePopup] = useState(false)
  const [showTypePopup, setShowTypePopup] = useState(false)
  const [showConnectivityPopup, setShowConnectivityPopup] = useState(false)
  const [showBrandPopup, setShowBrandPopup] = useState(false)
  
  // Search terms for popups
  const [driverSizeSearch, setDriverSizeSearch] = useState('')
  const [impedanceSearch, setImpedanceSearch] = useState('')
  const [frequencyResponseSearch, setFrequencyResponseSearch] = useState('')
  const [typeSearch, setTypeSearch] = useState('')
  const [connectivitySearch, setConnectivitySearch] = useState('')
  const [brandSearch, setBrandSearch] = useState('')

  const allHeadphones = [
    {
      id: 1,
      name: 'Sony WH-1000XM5 Wireless Noise Canceling',
      brand: 'Sony',
      price: 399.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        driverSize: '30mm',
        impedance: '48 Ohms',
        frequencyResponse: '4Hz - 40kHz',
        sensitivity: '105 dB/mW',
        type: 'Over-ear',
        connectivity: 'Wireless',
        battery: '30 hours',
        weight: '250g',
        cable: 'USB-C',
        warranty: '1 Year',
        wireless: true,
        noiseCancellation: true,
        gaming: false,
        microphone: true
      },
      features: ['Noise Canceling', 'Wireless', '30-hour Battery', 'Quick Charge', 'Sony Headphones Connect'],
      rating: 4.8,
      reviews: 342,
      inStock: true
    },
    {
      id: 2,
      name: 'Bose QuietComfort 45',
      brand: 'Bose',
      price: 329.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        driverSize: '40mm',
        impedance: '32 Ohms',
        frequencyResponse: '20Hz - 20kHz',
        sensitivity: '100 dB/mW',
        type: 'Over-ear',
        connectivity: 'Wireless',
        battery: '24 hours',
        weight: '240g',
        cable: 'USB-C',
        warranty: '1 Year',
        wireless: true,
        noiseCancellation: true,
        gaming: false,
        microphone: true
      },
      features: ['Noise Canceling', 'Wireless', '24-hour Battery', 'Comfortable', 'Bose Music App'],
      rating: 4.7,
      reviews: 289,
      inStock: true
    },
    {
      id: 3,
      name: 'Sennheiser HD 660S',
      brand: 'Sennheiser',
      price: 499.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        driverSize: '38mm',
        impedance: '150 Ohms',
        frequencyResponse: '10Hz - 41kHz',
        sensitivity: '104 dB/V',
        type: 'Over-ear',
        connectivity: 'Wired',
        battery: 'N/A',
        weight: '260g',
        cable: '3m Cable',
        warranty: '2 Years',
        wireless: false,
        noiseCancellation: false,
        gaming: false,
        microphone: false
      },
      features: ['Open-back', 'High-end Audio', 'Comfortable', 'Professional', 'Reference Quality'],
      rating: 4.9,
      reviews: 156,
      inStock: true
    },
    {
      id: 4,
      name: 'SteelSeries Arctis 7P+',
      brand: 'SteelSeries',
      price: 199.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        driverSize: '40mm',
        impedance: '32 Ohms',
        frequencyResponse: '20Hz - 20kHz',
        sensitivity: '98 dB/mW',
        type: 'Over-ear',
        connectivity: 'Wireless',
        battery: '30 hours',
        weight: '320g',
        cable: 'USB-C',
        warranty: '1 Year',
        wireless: true,
        noiseCancellation: false,
        gaming: true,
        microphone: true
      },
      features: ['Gaming', 'Wireless', '30-hour Battery', 'Retractable Mic', 'SteelSeries Engine'],
      rating: 4.6,
      reviews: 203,
      inStock: false
    },
    {
      id: 5,
      name: 'Audio-Technica ATH-M50x',
      brand: 'Audio-Technica',
      price: 149.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        driverSize: '45mm',
        impedance: '38 Ohms',
        frequencyResponse: '15Hz - 28kHz',
        sensitivity: '99 dB/mW',
        type: 'Over-ear',
        connectivity: 'Wired',
        battery: 'N/A',
        weight: '285g',
        cable: '3 Cables Included',
        warranty: '2 Years',
        wireless: false,
        noiseCancellation: false,
        gaming: false,
        microphone: false
      },
      features: ['Studio Monitor', 'Professional', 'Comfortable', 'Detachable Cable', 'Reference Quality'],
      rating: 4.8,
      reviews: 178,
      inStock: true
    },
    {
      id: 6,
      name: 'HyperX Cloud Alpha S',
      brand: 'HyperX',
      price: 99.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        driverSize: '50mm',
        impedance: '65 Ohms',
        frequencyResponse: '13Hz - 27kHz',
        sensitivity: '98 dB/mW',
        type: 'Over-ear',
        connectivity: 'Wired',
        battery: 'N/A',
        weight: '320g',
        cable: '2m Cable',
        warranty: '2 Years',
        wireless: false,
        noiseCancellation: false,
        gaming: true,
        microphone: true
      },
      features: ['Gaming', '7.1 Surround Sound', 'Detachable Mic', 'Comfortable', 'Dual Chamber Drivers'],
      rating: 4.5,
      reviews: 145,
      inStock: true
    }
  ]

  // Filter logic
  const filteredHeadphones = allHeadphones.filter((headphonesItem) => {
    // Price filter
    if (headphonesItem.price < priceRange[0] || headphonesItem.price > priceRange[1]) {
      return false
    }

    // Search filter
    if (searchTerm && !headphonesItem.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !headphonesItem.brand.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    // Driver size filter
    if (selectedDriverSizes.length > 0 && !selectedDriverSizes.includes(headphonesItem.specs.driverSize)) {
      return false
    }

    // Impedance filter
    if (selectedImpedances.length > 0 && !selectedImpedances.includes(headphonesItem.specs.impedance)) {
      return false
    }

    // Frequency response filter
    if (selectedFrequencyResponses.length > 0 && !selectedFrequencyResponses.includes(headphonesItem.specs.frequencyResponse)) {
      return false
    }

    // Type filter
    if (selectedTypes.length > 0 && !selectedTypes.includes(headphonesItem.specs.type)) {
      return false
    }

    // Connectivity filter
    if (selectedConnectivities.length > 0 && !selectedConnectivities.includes(headphonesItem.specs.connectivity)) {
      return false
    }

    // Brand filter
    if (selectedBrands.length > 0 && !selectedBrands.includes(headphonesItem.brand)) {
      return false
    }

    // Wireless filter
    if (selectedWireless !== null && headphonesItem.specs.wireless !== selectedWireless) {
      return false
    }

    // Noise cancellation filter
    if (selectedNoiseCancellation !== null && headphonesItem.specs.noiseCancellation !== selectedNoiseCancellation) {
      return false
    }

    // Gaming filter
    if (selectedGaming !== null && headphonesItem.specs.gaming !== selectedGaming) {
      return false
    }

    // Microphone filter
    if (selectedMicrophone !== null && headphonesItem.specs.microphone !== selectedMicrophone) {
      return false
    }

    return true
  })

  const handleDriverSizeChange = (driverSize: string) => {
    setSelectedDriverSizes(prev => 
      prev.includes(driverSize) 
        ? prev.filter(d => d !== driverSize)
        : [...prev, driverSize]
    )
  }

  const handleImpedanceChange = (impedance: string) => {
    setSelectedImpedances(prev => 
      prev.includes(impedance) 
        ? prev.filter(i => i !== impedance)
        : [...prev, impedance]
    )
  }

  const handleFrequencyResponseChange = (frequencyResponse: string) => {
    setSelectedFrequencyResponses(prev => 
      prev.includes(frequencyResponse) 
        ? prev.filter(f => f !== frequencyResponse)
        : [...prev, frequencyResponse]
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

  const handleWirelessChange = (value: boolean) => {
    setSelectedWireless(prev => prev === value ? null : value)
  }

  const handleNoiseCancellationChange = (value: boolean) => {
    setSelectedNoiseCancellation(prev => prev === value ? null : value)
  }

  const handleGamingChange = (value: boolean) => {
    setSelectedGaming(prev => prev === value ? null : value)
  }

  const handleMicrophoneChange = (value: boolean) => {
    setSelectedMicrophone(prev => prev === value ? null : value)
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
              <span className="font-medium text-black">Headphones</span>
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
                  <h3 className="text-base font-semibold mb-3">Driver Size</h3>
                  <div className="space-y-2 text-sm">
                    {['30mm','38mm','40mm','45mm','50mm'].map((driverSize) => (
                      <label key={driverSize} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedDriverSizes.includes(driverSize)}
                          onChange={() => handleDriverSizeChange(driverSize)}
                          className="rounded" 
                        />
                        <span>{driverSize}</span>
                      </label>
                    ))}
                    <button onClick={() => setShowDriverSizePopup(true)} className="text-blue-600 text-xs">Show More</button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Impedance</h3>
                  <div className="space-y-2 text-sm">
                    {['32 Ohms','38 Ohms','48 Ohms','65 Ohms','150 Ohms'].map((impedance) => (
                      <label key={impedance} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedImpedances.includes(impedance)}
                          onChange={() => handleImpedanceChange(impedance)}
                          className="rounded" 
                        />
                        <span>{impedance}</span>
                      </label>
                    ))}
                    <button onClick={() => setShowImpedancePopup(true)} className="text-blue-600 text-xs">Show More</button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Frequency Response</h3>
                  <div className="space-y-2 text-sm">
                    {['4Hz - 40kHz','10Hz - 41kHz','13Hz - 27kHz','15Hz - 28kHz','20Hz - 20kHz'].map((frequencyResponse) => (
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
                  <h3 className="text-base font-semibold mb-3">Type</h3>
                  <div className="space-y-2 text-sm">
                    {['Over-ear','On-ear','In-ear'].map((type) => (
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
                    {['Wired','Wireless'].map((connectivity) => (
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
                    {['Sony','Bose','Sennheiser','SteelSeries','Audio-Technica','HyperX'].map((brand) => (
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
                  <h3 className="text-base font-semibold mb-3">Noise Cancellation</h3>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={selectedNoiseCancellation === true}
                        onChange={() => handleNoiseCancellationChange(true)}
                        className="rounded" 
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={selectedNoiseCancellation === false}
                        onChange={() => handleNoiseCancellationChange(false)}
                        className="rounded" 
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Gaming</h3>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={selectedGaming === true}
                        onChange={() => handleGamingChange(true)}
                        className="rounded" 
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={selectedGaming === false}
                        onChange={() => handleGamingChange(false)}
                        className="rounded" 
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Microphone</h3>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={selectedMicrophone === true}
                        onChange={() => handleMicrophoneChange(true)}
                        className="rounded" 
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={selectedMicrophone === false}
                        onChange={() => handleMicrophoneChange(false)}
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
                {filteredHeadphones.map((headphonesItem) => (
                  <div key={headphonesItem.id} className="rounded-lg border border-black/10 bg-white hover:bg-black/5 transition cursor-pointer" onClick={() => setSelectedHeadphones(headphonesItem)}>
                    <div className="p-4">
                      <img src={headphonesItem.image} alt={headphonesItem.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                      <div className="text-sm font-medium mb-2 line-clamp-2">{headphonesItem.name}</div>
                      <div className="text-lg font-bold mb-3">${headphonesItem.price}</div>
                      <div className="space-y-1 text-xs text-black/60 mb-4">
                        <div className="flex justify-between"><span>Driver:</span><span className="text-black">{headphonesItem.specs.driverSize}</span></div>
                        <div className="flex justify-between"><span>Impedance:</span><span className="text-black">{headphonesItem.specs.impedance}</span></div>
                        <div className="flex justify-between"><span>Type:</span><span className="text-black">{headphonesItem.specs.type}</span></div>
                        <div className="flex justify-between"><span>Connectivity:</span><span className="text-black">{headphonesItem.specs.connectivity}</span></div>
                        <div className="flex justify-between"><span>Battery:</span><span className="text-black">{headphonesItem.specs.battery}</span></div>
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
      {selectedHeadphones && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{selectedHeadphones.name}</h2>
                  <p className="text-lg text-gray-600">{selectedHeadphones.brand}</p>
                </div>
                <button
                  onClick={() => setSelectedHeadphones(null)}
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
                    src={selectedHeadphones.image}
                    alt={selectedHeadphones.name}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                </div>
                
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-4">${selectedHeadphones.price}</div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Specifications</h3>
                    <div className="space-y-2">
                      {Object.entries(selectedHeadphones.specs).map(([key, value]) => (
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
                      {selectedHeadphones.features.map((feature, index) => (
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
                        selectedHeadphones.inStock 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={!selectedHeadphones.inStock}
                    >
                      {selectedHeadphones.inStock ? 'Add to Build' : 'Out of Stock'}
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
        isOpen={showDriverSizePopup}
        onClose={() => setShowDriverSizePopup(false)}
        title="Driver Size"
        searchTerm={driverSizeSearch}
        onSearchChange={setDriverSizeSearch}
        options={['20mm','25mm','30mm','32mm','35mm','38mm','40mm','42mm','45mm','50mm','53mm','57mm']}
        selectedItems={selectedDriverSizes}
        onItemChange={handleDriverSizeChange}
      />

      <FilterPopup
        isOpen={showImpedancePopup}
        onClose={() => setShowImpedancePopup(false)}
        title="Impedance"
        searchTerm={impedanceSearch}
        onSearchChange={setImpedanceSearch}
        options={['16 Ohms','24 Ohms','32 Ohms','38 Ohms','48 Ohms','50 Ohms','65 Ohms','80 Ohms','100 Ohms','150 Ohms','250 Ohms','300 Ohms','600 Ohms']}
        selectedItems={selectedImpedances}
        onItemChange={handleImpedanceChange}
      />

      <FilterPopup
        isOpen={showFrequencyResponsePopup}
        onClose={() => setShowFrequencyResponsePopup(false)}
        title="Frequency Response"
        searchTerm={frequencyResponseSearch}
        onSearchChange={setFrequencyResponseSearch}
        options={['4Hz - 40kHz','5Hz - 35kHz','8Hz - 25kHz','10Hz - 41kHz','12Hz - 22kHz','13Hz - 27kHz','15Hz - 28kHz','16Hz - 24kHz','20Hz - 20kHz','20Hz - 25kHz','20Hz - 30kHz','20Hz - 40kHz']}
        selectedItems={selectedFrequencyResponses}
        onItemChange={handleFrequencyResponseChange}
      />

      <FilterPopup
        isOpen={showTypePopup}
        onClose={() => setShowTypePopup(false)}
        title="Type"
        searchTerm={typeSearch}
        onSearchChange={setTypeSearch}
        options={['Over-ear','On-ear','In-ear','Earbuds','True Wireless','Open-back','Closed-back','Semi-open','Bone Conduction']}
        selectedItems={selectedTypes}
        onItemChange={handleTypeChange}
      />

      <FilterPopup
        isOpen={showConnectivityPopup}
        onClose={() => setShowConnectivityPopup(false)}
        title="Connectivity"
        searchTerm={connectivitySearch}
        onSearchChange={setConnectivitySearch}
        options={['Wired','Wireless','Bluetooth','USB-C','3.5mm','6.35mm','XLR','USB-A','2.4GHz','RF','NFC']}
        selectedItems={selectedConnectivities}
        onItemChange={handleConnectivityChange}
      />

      <FilterPopup
        isOpen={showBrandPopup}
        onClose={() => setShowBrandPopup(false)}
        title="Brand"
        searchTerm={brandSearch}
        onSearchChange={setBrandSearch}
        options={['Sony','Bose','Sennheiser','SteelSeries','Audio-Technica','HyperX','Beyerdynamic','AKG','Shure','Focal','Audeze','Hifiman','Grado','Philips','JBL','Skullcandy','Beats','Apple','Samsung','Jabra']}
        selectedItems={selectedBrands}
        onItemChange={handleBrandChange}
      />
    </div>
  )
}

export default HeadphonesPage
