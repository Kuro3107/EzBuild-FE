import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import '../../Homepage.css'

interface WebcamItem {
  id: number
  name: string
  brand: string
  price: number
  image: string
  specs: {
    resolution: string
    frameRate: string
    fieldOfView: string
    autofocus: string
    connectivity: string
    microphone: string
    lowLight: string
    streaming: string
    privacy: string
    warranty: string
    usb: boolean
    wireless: boolean
    hdr: boolean
    nightVision: boolean
  }
  features: string[]
  rating: number
  reviews: number
  inStock: boolean
}

function WebcamPage() {
  const [selectedWebcam, setSelectedWebcam] = useState<WebcamItem | null>(null)
  const [priceRange, setPriceRange] = useState<[number, number]>([30, 300])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedResolutions, setSelectedResolutions] = useState<string[]>([])
  const [selectedFrameRates, setSelectedFrameRates] = useState<string[]>([])
  const [selectedFieldOfViews, setSelectedFieldOfViews] = useState<string[]>([])
  const [selectedAutofocus, setSelectedAutofocus] = useState<string[]>([])
  const [selectedConnectivities, setSelectedConnectivities] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedStreaming, setSelectedStreaming] = useState<boolean | null>(null)
  const [selectedUSB, setSelectedUSB] = useState<boolean | null>(null)
  const [selectedWireless, setSelectedWireless] = useState<boolean | null>(null)
  const [selectedHDR, setSelectedHDR] = useState<boolean | null>(null)
  const [selectedNightVision, setSelectedNightVision] = useState<boolean | null>(null)
  
  // Popup states
  const [showResolutionPopup, setShowResolutionPopup] = useState(false)
  const [showFrameRatePopup, setShowFrameRatePopup] = useState(false)
  const [showFieldOfViewPopup, setShowFieldOfViewPopup] = useState(false)
  const [showAutofocusPopup, setShowAutofocusPopup] = useState(false)
  const [showConnectivityPopup, setShowConnectivityPopup] = useState(false)
  const [showBrandPopup, setShowBrandPopup] = useState(false)
  
  // Search terms for popups
  const [resolutionSearch, setResolutionSearch] = useState('')
  const [frameRateSearch, setFrameRateSearch] = useState('')
  const [fieldOfViewSearch, setFieldOfViewSearch] = useState('')
  const [autofocusSearch, setAutofocusSearch] = useState('')
  const [connectivitySearch, setConnectivitySearch] = useState('')
  const [brandSearch, setBrandSearch] = useState('')

  const allWebcams = [
    {
      id: 1,
      name: 'Logitech C920 HD Pro Webcam',
      brand: 'Logitech',
      price: 79.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        resolution: '1080p',
        frameRate: '30fps',
        fieldOfView: '78°',
        autofocus: 'Auto',
        connectivity: 'USB 2.0',
        microphone: 'Stereo',
        lowLight: 'Yes',
        streaming: 'Yes',
        privacy: 'Privacy Shutter',
        warranty: '2 Years',
        usb: true,
        wireless: false,
        hdr: false,
        nightVision: false
      },
      features: ['1080p HD', 'Stereo Audio', 'Auto Light Correction', 'Privacy Shutter', 'Universal Clip'],
      rating: 4.6,
      reviews: 2847,
      inStock: true
    },
    {
      id: 2,
      name: 'Razer Kiyo Pro Streaming Webcam',
      brand: 'Razer',
      price: 199.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        resolution: '1080p',
        frameRate: '60fps',
        fieldOfView: '103°',
        autofocus: 'Auto',
        connectivity: 'USB 3.0',
        microphone: 'None',
        lowLight: 'Yes',
        streaming: 'Yes',
        privacy: 'None',
        warranty: '2 Years',
        usb: true,
        wireless: false,
        hdr: true,
        nightVision: false
      },
      features: ['1080p 60fps', 'HDR', 'Adaptive Light Sensor', 'Razer Synapse', 'Streaming Optimized'],
      rating: 4.4,
      reviews: 892,
      inStock: true
    },
    {
      id: 3,
      name: 'Elgato FaceCam 1080p60',
      brand: 'Elgato',
      price: 199.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        resolution: '1080p',
        frameRate: '60fps',
        fieldOfView: '82°',
        autofocus: 'Manual',
        connectivity: 'USB 3.0',
        microphone: 'None',
        lowLight: 'Yes',
        streaming: 'Yes',
        privacy: 'None',
        warranty: '2 Years',
        usb: true,
        wireless: false,
        hdr: false,
        nightVision: false
      },
      features: ['1080p 60fps', 'Manual Focus', 'Elgato Camera Hub', 'Streaming Focused', 'Professional Quality'],
      rating: 4.7,
      reviews: 456,
      inStock: false
    },
    {
      id: 4,
      name: 'Microsoft LifeCam Studio',
      brand: 'Microsoft',
      price: 99.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        resolution: '1080p',
        frameRate: '30fps',
        fieldOfView: '75°',
        autofocus: 'Auto',
        connectivity: 'USB 2.0',
        microphone: 'High-Quality',
        lowLight: 'Yes',
        streaming: 'Yes',
        privacy: 'None',
        warranty: '1 Year',
        usb: true,
        wireless: false,
        hdr: false,
        nightVision: false
      },
      features: ['1080p HD', 'High-Quality Mic', 'Auto Focus', 'TrueColor Technology', 'Universal Compatibility'],
      rating: 4.3,
      reviews: 1234,
      inStock: true
    },
    {
      id: 5,
      name: 'Corsair Elgato FaceCam Pro',
      brand: 'Corsair',
      price: 299.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        resolution: '4K',
        frameRate: '60fps',
        fieldOfView: '90°',
        autofocus: 'Auto',
        connectivity: 'USB 3.0',
        microphone: 'None',
        lowLight: 'Yes',
        streaming: 'Yes',
        privacy: 'None',
        warranty: '2 Years',
        usb: true,
        wireless: false,
        hdr: true,
        nightVision: false
      },
      features: ['4K 60fps', 'HDR', 'Auto Focus', 'Elgato Camera Hub', 'Professional Streaming'],
      rating: 4.8,
      reviews: 234,
      inStock: true
    },
    {
      id: 6,
      name: 'Creative Live! Cam Sync 1080p',
      brand: 'Creative',
      price: 49.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        resolution: '1080p',
        frameRate: '30fps',
        fieldOfView: '72°',
        autofocus: 'Fixed',
        connectivity: 'USB 2.0',
        microphone: 'Built-in',
        lowLight: 'No',
        streaming: 'Yes',
        privacy: 'None',
        warranty: '1 Year',
        usb: true,
        wireless: false,
        hdr: false,
        nightVision: false
      },
      features: ['1080p HD', 'Built-in Mic', 'Plug & Play', 'Universal Clip', 'Budget Friendly'],
      rating: 4.1,
      reviews: 567,
      inStock: true
    }
  ]

  // Filter logic
  const filteredWebcams = allWebcams.filter((webcamItem) => {
    // Price filter
    if (webcamItem.price < priceRange[0] || webcamItem.price > priceRange[1]) {
      return false
    }

    // Search filter
    if (searchTerm && !webcamItem.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !webcamItem.brand.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    // Resolution filter
    if (selectedResolutions.length > 0 && !selectedResolutions.includes(webcamItem.specs.resolution)) {
      return false
    }

    // Frame rate filter
    if (selectedFrameRates.length > 0 && !selectedFrameRates.includes(webcamItem.specs.frameRate)) {
      return false
    }

    // Field of view filter
    if (selectedFieldOfViews.length > 0 && !selectedFieldOfViews.includes(webcamItem.specs.fieldOfView)) {
      return false
    }

    // Autofocus filter
    if (selectedAutofocus.length > 0 && !selectedAutofocus.includes(webcamItem.specs.autofocus)) {
      return false
    }

    // Connectivity filter
    if (selectedConnectivities.length > 0 && !selectedConnectivities.includes(webcamItem.specs.connectivity)) {
      return false
    }

    // Brand filter
    if (selectedBrands.length > 0 && !selectedBrands.includes(webcamItem.brand)) {
      return false
    }

    // Streaming filter
    if (selectedStreaming !== null && (webcamItem.specs.streaming === 'Yes') !== selectedStreaming) {
      return false
    }

    // USB filter
    if (selectedUSB !== null && webcamItem.specs.usb !== selectedUSB) {
      return false
    }

    // Wireless filter
    if (selectedWireless !== null && webcamItem.specs.wireless !== selectedWireless) {
      return false
    }

    // HDR filter
    if (selectedHDR !== null && webcamItem.specs.hdr !== selectedHDR) {
      return false
    }

    // Night vision filter
    if (selectedNightVision !== null && webcamItem.specs.nightVision !== selectedNightVision) {
      return false
    }

    return true
  })

  const handleResolutionChange = (resolution: string) => {
    setSelectedResolutions(prev => 
      prev.includes(resolution) 
        ? prev.filter(r => r !== resolution)
        : [...prev, resolution]
    )
  }

  const handleFrameRateChange = (frameRate: string) => {
    setSelectedFrameRates(prev => 
      prev.includes(frameRate) 
        ? prev.filter(f => f !== frameRate)
        : [...prev, frameRate]
    )
  }

  const handleFieldOfViewChange = (fieldOfView: string) => {
    setSelectedFieldOfViews(prev => 
      prev.includes(fieldOfView) 
        ? prev.filter(f => f !== fieldOfView)
        : [...prev, fieldOfView]
    )
  }

  const handleAutofocusChange = (autofocus: string) => {
    setSelectedAutofocus(prev => 
      prev.includes(autofocus) 
        ? prev.filter(a => a !== autofocus)
        : [...prev, autofocus]
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

  const handleUSBChange = (value: boolean) => {
    setSelectedUSB(prev => prev === value ? null : value)
  }

  const handleWirelessChange = (value: boolean) => {
    setSelectedWireless(prev => prev === value ? null : value)
  }

  const handleHDRChange = (value: boolean) => {
    setSelectedHDR(prev => prev === value ? null : value)
  }

  const handleNightVisionChange = (value: boolean) => {
    setSelectedNightVision(prev => prev === value ? null : value)
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
              <span className="font-medium text-black">Webcam</span>
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
                      <span>$300</span>
                    </div>
                    <input 
                      type="range" 
                      min="30" 
                      max="300" 
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full" 
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Resolution</h3>
                  <div className="space-y-2 text-sm">
                    {['720p','1080p','4K'].map((resolution) => (
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
                  <h3 className="text-base font-semibold mb-3">Frame Rate</h3>
                  <div className="space-y-2 text-sm">
                    {['24fps','30fps','60fps'].map((frameRate) => (
                      <label key={frameRate} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedFrameRates.includes(frameRate)}
                          onChange={() => handleFrameRateChange(frameRate)}
                          className="rounded" 
                        />
                        <span>{frameRate}</span>
                      </label>
                    ))}
                    <button onClick={() => setShowFrameRatePopup(true)} className="text-blue-600 text-xs">Show More</button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Field of View</h3>
                  <div className="space-y-2 text-sm">
                    {['65°','72°','75°','78°','82°','90°','103°'].map((fieldOfView) => (
                      <label key={fieldOfView} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedFieldOfViews.includes(fieldOfView)}
                          onChange={() => handleFieldOfViewChange(fieldOfView)}
                          className="rounded" 
                        />
                        <span>{fieldOfView}</span>
                      </label>
                    ))}
                    <button onClick={() => setShowFieldOfViewPopup(true)} className="text-blue-600 text-xs">Show More</button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Autofocus</h3>
                  <div className="space-y-2 text-sm">
                    {['Auto','Manual','Fixed'].map((autofocus) => (
                      <label key={autofocus} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedAutofocus.includes(autofocus)}
                          onChange={() => handleAutofocusChange(autofocus)}
                          className="rounded" 
                        />
                        <span>{autofocus}</span>
                      </label>
                    ))}
                    <button onClick={() => setShowAutofocusPopup(true)} className="text-blue-600 text-xs">Show More</button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Connectivity</h3>
                  <div className="space-y-2 text-sm">
                    {['USB 2.0','USB 3.0','Wireless'].map((connectivity) => (
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
                    {['Logitech','Razer','Elgato','Microsoft','Corsair','Creative'].map((brand) => (
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
                  <h3 className="text-base font-semibold mb-3">Night Vision</h3>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={selectedNightVision === true}
                        onChange={() => handleNightVisionChange(true)}
                        className="rounded" 
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={selectedNightVision === false}
                        onChange={() => handleNightVisionChange(false)}
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
                {filteredWebcams.map((webcamItem) => (
                  <div key={webcamItem.id} className="rounded-lg border border-black/10 bg-white hover:bg-black/5 transition cursor-pointer" onClick={() => setSelectedWebcam(webcamItem)}>
                    <div className="p-4">
                      <img src={webcamItem.image} alt={webcamItem.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                      <div className="text-sm font-medium mb-2 line-clamp-2">{webcamItem.name}</div>
                      <div className="text-lg font-bold mb-3">${webcamItem.price}</div>
                      <div className="space-y-1 text-xs text-black/60 mb-4">
                        <div className="flex justify-between"><span>Resolution:</span><span className="text-black">{webcamItem.specs.resolution}</span></div>
                        <div className="flex justify-between"><span>Frame Rate:</span><span className="text-black">{webcamItem.specs.frameRate}</span></div>
                        <div className="flex justify-between"><span>Field of View:</span><span className="text-black">{webcamItem.specs.fieldOfView}</span></div>
                        <div className="flex justify-between"><span>Autofocus:</span><span className="text-black">{webcamItem.specs.autofocus}</span></div>
                        <div className="flex justify-between"><span>Connectivity:</span><span className="text-black">{webcamItem.specs.connectivity}</span></div>
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
      {selectedWebcam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{selectedWebcam.name}</h2>
                  <p className="text-lg text-gray-600">{selectedWebcam.brand}</p>
                </div>
                <button
                  onClick={() => setSelectedWebcam(null)}
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
                    src={selectedWebcam.image}
                    alt={selectedWebcam.name}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                </div>
                
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-4">${selectedWebcam.price}</div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Specifications</h3>
                    <div className="space-y-2">
                      {Object.entries(selectedWebcam.specs).map(([key, value]) => (
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
                      {selectedWebcam.features.map((feature, index) => (
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
                        selectedWebcam.inStock 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={!selectedWebcam.inStock}
                    >
                      {selectedWebcam.inStock ? 'Add to Build' : 'Out of Stock'}
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
        isOpen={showResolutionPopup}
        onClose={() => setShowResolutionPopup(false)}
        title="Resolution"
        searchTerm={resolutionSearch}
        onSearchChange={setResolutionSearch}
        options={['480p','720p','1080p','1440p','4K','8K']}
        selectedItems={selectedResolutions}
        onItemChange={handleResolutionChange}
      />

      <FilterPopup
        isOpen={showFrameRatePopup}
        onClose={() => setShowFrameRatePopup(false)}
        title="Frame Rate"
        searchTerm={frameRateSearch}
        onSearchChange={setFrameRateSearch}
        options={['15fps','24fps','25fps','30fps','50fps','60fps','120fps','240fps']}
        selectedItems={selectedFrameRates}
        onItemChange={handleFrameRateChange}
      />

      <FilterPopup
        isOpen={showFieldOfViewPopup}
        onClose={() => setShowFieldOfViewPopup(false)}
        title="Field of View"
        searchTerm={fieldOfViewSearch}
        onSearchChange={setFieldOfViewSearch}
        options={['60°','65°','70°','72°','75°','78°','80°','82°','85°','90°','95°','100°','103°','110°','120°']}
        selectedItems={selectedFieldOfViews}
        onItemChange={handleFieldOfViewChange}
      />

      <FilterPopup
        isOpen={showAutofocusPopup}
        onClose={() => setShowAutofocusPopup(false)}
        title="Autofocus"
        searchTerm={autofocusSearch}
        onSearchChange={setAutofocusSearch}
        options={['Auto','Manual','Fixed','Hybrid','Continuous','Touch to Focus']}
        selectedItems={selectedAutofocus}
        onItemChange={handleAutofocusChange}
      />

      <FilterPopup
        isOpen={showConnectivityPopup}
        onClose={() => setShowConnectivityPopup(false)}
        title="Connectivity"
        searchTerm={connectivitySearch}
        onSearchChange={setConnectivitySearch}
        options={['USB 2.0','USB 3.0','USB-C','Wireless','Bluetooth','WiFi','Ethernet','HDMI','Thunderbolt']}
        selectedItems={selectedConnectivities}
        onItemChange={handleConnectivityChange}
      />

      <FilterPopup
        isOpen={showBrandPopup}
        onClose={() => setShowBrandPopup(false)}
        title="Brand"
        searchTerm={brandSearch}
        onSearchChange={setBrandSearch}
        options={['Logitech','Razer','Elgato','Microsoft','Corsair','Creative','AverMedia','Blue Yeti','OBSBOT','Insta360','DJI','Canon','Sony','Panasonic','Nikon']}
        selectedItems={selectedBrands}
        onItemChange={handleBrandChange}
      />
    </div>
  )
}

export default WebcamPage
