import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import '../../Homepage.css'

interface SpeakersItem {
  id: number
  name: string
  brand: string
  price: number
  image: string
  specs: {
    powerOutput: string
    frequencyResponse: string
    connectivity: string
    type: string
    impedance: string
    sensitivity: string
    drivers: string
    warranty: string
    wireless: boolean
    bluetooth: boolean
    usb: boolean
    aux: boolean
    gaming: boolean
    rgb: boolean
  }
  features: string[]
  rating: number
  reviews: number
  inStock: boolean
}

function SpeakersPage() {
  const [selectedSpeakers, setSelectedSpeakers] = useState<SpeakersItem | null>(null)
  const [priceRange, setPriceRange] = useState<[number, number]>([50, 500])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPowerOutputs, setSelectedPowerOutputs] = useState<string[]>([])
  const [selectedFrequencyResponses, setSelectedFrequencyResponses] = useState<string[]>([])
  const [selectedConnectivities, setSelectedConnectivities] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedWireless, setSelectedWireless] = useState<boolean | null>(null)
  const [selectedBluetooth, setSelectedBluetooth] = useState<boolean | null>(null)
  const [selectedUSB, setSelectedUSB] = useState<boolean | null>(null)
  const [selectedAux, setSelectedAux] = useState<boolean | null>(null)
  const [selectedGaming, setSelectedGaming] = useState<boolean | null>(null)
  const [selectedRGB, setSelectedRGB] = useState<boolean | null>(null)
  
  // Popup states
  const [showPowerOutputPopup, setShowPowerOutputPopup] = useState(false)
  const [showFrequencyResponsePopup, setShowFrequencyResponsePopup] = useState(false)
  const [showConnectivityPopup, setShowConnectivityPopup] = useState(false)
  const [showTypePopup, setShowTypePopup] = useState(false)
  const [showBrandPopup, setShowBrandPopup] = useState(false)
  
  // Search terms for popups
  const [powerOutputSearch, setPowerOutputSearch] = useState('')
  const [frequencyResponseSearch, setFrequencyResponseSearch] = useState('')
  const [connectivitySearch, setConnectivitySearch] = useState('')
  const [typeSearch, setTypeSearch] = useState('')
  const [brandSearch, setBrandSearch] = useState('')

  const allSpeakers = [
    {
      id: 1,
      name: 'Logitech Z623 2.1 Speaker System',
      brand: 'Logitech',
      price: 99.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        powerOutput: '200W',
        frequencyResponse: '35Hz - 20kHz',
        connectivity: '3.5mm, RCA',
        type: '2.1',
        impedance: '8 Ohms',
        sensitivity: '85 dB',
        drivers: '2.1',
        warranty: '2 Years',
        wireless: false,
        bluetooth: false,
        usb: false,
        aux: true,
        gaming: true,
        rgb: false
      },
      features: ['THX Certified', '200W RMS', 'Subwoofer', 'Multiple Inputs', 'Gaming Optimized'],
      rating: 4.5,
      reviews: 8934,
      inStock: true
    },
    {
      id: 2,
      name: 'Creative Pebble V3 USB-C Desktop Speakers',
      brand: 'Creative',
      price: 39.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        powerOutput: '8W',
        frequencyResponse: '100Hz - 17kHz',
        connectivity: 'USB-C, 3.5mm',
        type: '2.0',
        impedance: '4 Ohms',
        sensitivity: '80 dB',
        drivers: '2.0',
        warranty: '1 Year',
        wireless: false,
        bluetooth: false,
        usb: true,
        aux: true,
        gaming: false,
        rgb: false
      },
      features: ['USB-C Powered', 'Compact Design', 'Clear Audio', 'Plug & Play', 'Modern Look'],
      rating: 4.3,
      reviews: 5678,
      inStock: true
    },
    {
      id: 3,
      name: 'Razer Nommo Pro 2.1 Gaming Speakers',
      brand: 'Razer',
      price: 499.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        powerOutput: '150W',
        frequencyResponse: '20Hz - 20kHz',
        connectivity: 'USB, 3.5mm, Optical',
        type: '2.1',
        impedance: '8 Ohms',
        sensitivity: '90 dB',
        drivers: '2.1',
        warranty: '2 Years',
        wireless: false,
        bluetooth: false,
        usb: true,
        aux: true,
        gaming: true,
        rgb: true
      },
      features: ['THX Certified', 'RGB Lighting', 'Dolby Digital', 'Gaming Optimized', 'Premium Build'],
      rating: 4.7,
      reviews: 1234,
      inStock: false
    },
    {
      id: 4,
      name: 'Audioengine A2+ Wireless Speakers',
      brand: 'Audioengine',
      price: 269.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        powerOutput: '60W',
        frequencyResponse: '65Hz - 22kHz',
        connectivity: 'Bluetooth, USB, 3.5mm',
        type: '2.0',
        impedance: '4 Ohms',
        sensitivity: '88 dB',
        drivers: '2.0',
        warranty: '3 Years',
        wireless: true,
        bluetooth: true,
        usb: true,
        aux: true,
        gaming: false,
        rgb: false
      },
      features: ['Wireless', 'Premium Audio', 'Multiple Inputs', 'Compact', 'Professional Quality'],
      rating: 4.8,
      reviews: 2341,
      inStock: true
    },
    {
      id: 5,
      name: 'Bose Companion 2 Series III',
      brand: 'Bose',
      price: 99.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        powerOutput: 'N/A',
        frequencyResponse: '50Hz - 20kHz',
        connectivity: '3.5mm',
        type: '2.0',
        impedance: '8 Ohms',
        sensitivity: '85 dB',
        drivers: '2.0',
        warranty: '1 Year',
        wireless: false,
        bluetooth: false,
        usb: false,
        aux: true,
        gaming: false,
        rgb: false
      },
      features: ['Bose Quality', 'TrueSpace Technology', 'Compact', 'Clear Sound', 'Reliable'],
      rating: 4.4,
      reviews: 4567,
      inStock: true
    },
    {
      id: 6,
      name: 'Edifier R1280T Powered Bookshelf Speakers',
      brand: 'Edifier',
      price: 99.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        powerOutput: '42W',
        frequencyResponse: '75Hz - 18kHz',
        connectivity: 'RCA, 3.5mm',
        type: '2.0',
        impedance: '6 Ohms',
        sensitivity: '85 dB',
        drivers: '2.0',
        warranty: '2 Years',
        wireless: false,
        bluetooth: false,
        usb: false,
        aux: true,
        gaming: false,
        rgb: false
      },
      features: ['Wooden Enclosure', 'Remote Control', 'Multiple Inputs', 'Classic Design', 'Great Value'],
      rating: 4.6,
      reviews: 3456,
      inStock: true
    }
  ]

  // Filter logic
  const filteredSpeakers = allSpeakers.filter((speakersItem) => {
    // Price filter
    if (speakersItem.price < priceRange[0] || speakersItem.price > priceRange[1]) {
      return false
    }

    // Search filter
    if (searchTerm && !speakersItem.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !speakersItem.brand.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    // Power output filter
    if (selectedPowerOutputs.length > 0 && !selectedPowerOutputs.includes(speakersItem.specs.powerOutput)) {
      return false
    }

    // Frequency response filter
    if (selectedFrequencyResponses.length > 0 && !selectedFrequencyResponses.includes(speakersItem.specs.frequencyResponse)) {
      return false
    }

    // Connectivity filter
    if (selectedConnectivities.length > 0 && !selectedConnectivities.includes(speakersItem.specs.connectivity)) {
      return false
    }

    // Type filter
    if (selectedTypes.length > 0 && !selectedTypes.includes(speakersItem.specs.type)) {
      return false
    }

    // Brand filter
    if (selectedBrands.length > 0 && !selectedBrands.includes(speakersItem.brand)) {
      return false
    }

    // Wireless filter
    if (selectedWireless !== null && speakersItem.specs.wireless !== selectedWireless) {
      return false
    }

    // Bluetooth filter
    if (selectedBluetooth !== null && speakersItem.specs.bluetooth !== selectedBluetooth) {
      return false
    }

    // USB filter
    if (selectedUSB !== null && speakersItem.specs.usb !== selectedUSB) {
      return false
    }

    // Aux filter
    if (selectedAux !== null && speakersItem.specs.aux !== selectedAux) {
      return false
    }

    // Gaming filter
    if (selectedGaming !== null && speakersItem.specs.gaming !== selectedGaming) {
      return false
    }

    // RGB filter
    if (selectedRGB !== null && speakersItem.specs.rgb !== selectedRGB) {
      return false
    }

    return true
  })

  const handlePowerOutputChange = (powerOutput: string) => {
    setSelectedPowerOutputs(prev => 
      prev.includes(powerOutput) 
        ? prev.filter(p => p !== powerOutput)
        : [...prev, powerOutput]
    )
  }

  const handleFrequencyResponseChange = (frequencyResponse: string) => {
    setSelectedFrequencyResponses(prev => 
      prev.includes(frequencyResponse) 
        ? prev.filter(f => f !== frequencyResponse)
        : [...prev, frequencyResponse]
    )
  }

  const handleConnectivityChange = (connectivity: string) => {
    setSelectedConnectivities(prev => 
      prev.includes(connectivity) 
        ? prev.filter(c => c !== connectivity)
        : [...prev, connectivity]
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

  const handleWirelessChange = (value: boolean) => {
    setSelectedWireless(prev => prev === value ? null : value)
  }

  const handleBluetoothChange = (value: boolean) => {
    setSelectedBluetooth(prev => prev === value ? null : value)
  }

  const handleUSBChange = (value: boolean) => {
    setSelectedUSB(prev => prev === value ? null : value)
  }

  const handleAuxChange = (value: boolean) => {
    setSelectedAux(prev => prev === value ? null : value)
  }

  const handleGamingChange = (value: boolean) => {
    setSelectedGaming(prev => prev === value ? null : value)
  }

  const handleRGBChange = (value: boolean) => {
    setSelectedRGB(prev => prev === value ? null : value)
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
              <span className="font-medium text-black">Speakers</span>
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
                  <h3 className="text-base font-semibold mb-3">Power Output</h3>
                  <div className="space-y-2 text-sm">
                    {['8W','42W','60W','150W','200W'].map((powerOutput) => (
                      <label key={powerOutput} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedPowerOutputs.includes(powerOutput)}
                          onChange={() => handlePowerOutputChange(powerOutput)}
                          className="rounded" 
                        />
                        <span>{powerOutput}</span>
                      </label>
                    ))}
                    <button onClick={() => setShowPowerOutputPopup(true)} className="text-blue-600 text-xs">Show More</button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Frequency Response</h3>
                  <div className="space-y-2 text-sm">
                    {['35Hz - 20kHz','50Hz - 20kHz','65Hz - 22kHz','75Hz - 18kHz','100Hz - 17kHz'].map((frequencyResponse) => (
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
                  <h3 className="text-base font-semibold mb-3">Connectivity</h3>
                  <div className="space-y-2 text-sm">
                    {['3.5mm','USB','Bluetooth','RCA','Optical'].map((connectivity) => (
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
                  <h3 className="text-base font-semibold mb-3">Type</h3>
                  <div className="space-y-2 text-sm">
                    {['2.0','2.1','5.1','7.1'].map((type) => (
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
                    {['Logitech','Creative','Razer','Audioengine','Bose','Edifier'].map((brand) => (
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
                  <h3 className="text-base font-semibold mb-3">Bluetooth</h3>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={selectedBluetooth === true}
                        onChange={() => handleBluetoothChange(true)}
                        className="rounded" 
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={selectedBluetooth === false}
                        onChange={() => handleBluetoothChange(false)}
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
                  <h3 className="text-base font-semibold mb-3">Aux</h3>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={selectedAux === true}
                        onChange={() => handleAuxChange(true)}
                        className="rounded" 
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={selectedAux === false}
                        onChange={() => handleAuxChange(false)}
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
              </div>
            </div>

            {/* Grid */}
            <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredSpeakers.map((speakersItem) => (
                  <div key={speakersItem.id} className="rounded-lg border border-black/10 bg-white hover:bg-black/5 transition cursor-pointer" onClick={() => setSelectedSpeakers(speakersItem)}>
                    <div className="p-4">
                      <img src={speakersItem.image} alt={speakersItem.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                      <div className="text-sm font-medium mb-2 line-clamp-2">{speakersItem.name}</div>
                      <div className="text-lg font-bold mb-3">${speakersItem.price}</div>
                      <div className="space-y-1 text-xs text-black/60 mb-4">
                        <div className="flex justify-between"><span>Power Output:</span><span className="text-black">{speakersItem.specs.powerOutput}</span></div>
                        <div className="flex justify-between"><span>Type:</span><span className="text-black">{speakersItem.specs.type}</span></div>
                        <div className="flex justify-between"><span>Connectivity:</span><span className="text-black">{speakersItem.specs.connectivity}</span></div>
                        <div className="flex justify-between"><span>Frequency:</span><span className="text-black">{speakersItem.specs.frequencyResponse}</span></div>
                        <div className="flex justify-between"><span>Impedance:</span><span className="text-black">{speakersItem.specs.impedance}</span></div>
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
      {selectedSpeakers && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{selectedSpeakers.name}</h2>
                  <p className="text-lg text-gray-600">{selectedSpeakers.brand}</p>
                </div>
                <button
                  onClick={() => setSelectedSpeakers(null)}
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
                    src={selectedSpeakers.image}
                    alt={selectedSpeakers.name}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                </div>
                
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-4">${selectedSpeakers.price}</div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Specifications</h3>
                    <div className="space-y-2">
                      {Object.entries(selectedSpeakers.specs).map(([key, value]) => (
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
                      {selectedSpeakers.features.map((feature, index) => (
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
                        selectedSpeakers.inStock 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={!selectedSpeakers.inStock}
                    >
                      {selectedSpeakers.inStock ? 'Add to Build' : 'Out of Stock'}
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
        isOpen={showPowerOutputPopup}
        onClose={() => setShowPowerOutputPopup(false)}
        title="Power Output"
        searchTerm={powerOutputSearch}
        onSearchChange={setPowerOutputSearch}
        options={['5W','8W','10W','15W','20W','25W','30W','40W','42W','50W','60W','80W','100W','120W','150W','180W','200W','250W','300W']}
        selectedItems={selectedPowerOutputs}
        onItemChange={handlePowerOutputChange}
      />

      <FilterPopup
        isOpen={showFrequencyResponsePopup}
        onClose={() => setShowFrequencyResponsePopup(false)}
        title="Frequency Response"
        searchTerm={frequencyResponseSearch}
        onSearchChange={setFrequencyResponseSearch}
        options={['20Hz - 20kHz','35Hz - 20kHz','40Hz - 20kHz','50Hz - 20kHz','60Hz - 20kHz','65Hz - 22kHz','70Hz - 20kHz','75Hz - 18kHz','80Hz - 20kHz','100Hz - 17kHz','120Hz - 20kHz']}
        selectedItems={selectedFrequencyResponses}
        onItemChange={handleFrequencyResponseChange}
      />

      <FilterPopup
        isOpen={showConnectivityPopup}
        onClose={() => setShowConnectivityPopup(false)}
        title="Connectivity"
        searchTerm={connectivitySearch}
        onSearchChange={setConnectivitySearch}
        options={['3.5mm','USB','USB-C','Bluetooth','RCA','Optical','HDMI','WiFi','Ethernet','XLR','MIDI','Coaxial']}
        selectedItems={selectedConnectivities}
        onItemChange={handleConnectivityChange}
      />

      <FilterPopup
        isOpen={showTypePopup}
        onClose={() => setShowTypePopup(false)}
        title="Type"
        searchTerm={typeSearch}
        onSearchChange={setTypeSearch}
        options={['2.0','2.1','3.0','3.1','4.0','4.1','5.0','5.1','6.1','7.0','7.1','Soundbar','Bookshelf','Floor Standing','Desktop','Portable']}
        selectedItems={selectedTypes}
        onItemChange={handleTypeChange}
      />

      <FilterPopup
        isOpen={showBrandPopup}
        onClose={() => setShowBrandPopup(false)}
        title="Brand"
        searchTerm={brandSearch}
        onSearchChange={setBrandSearch}
        options={['Logitech','Creative','Razer','Audioengine','Bose','Edifier','Klipsch','JBL','Sony','Yamaha','Pioneer','Polk','KEF','Bowers & Wilkins','Harman Kardon','Mackie','Presonus']}
        selectedItems={selectedBrands}
        onItemChange={handleBrandChange}
      />
    </div>
  )
}

export default SpeakersPage
