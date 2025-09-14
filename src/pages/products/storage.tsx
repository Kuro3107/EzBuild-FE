import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import '../../Homepage.css'

interface StorageItem {
  id: number
  name: string
  brand: string
  price: number
  image: string
  specs: {
    capacity: string
    type: string
    interface: string
    readSpeed: string
    writeSpeed: string
    formFactor: string
    nandType: string
    controller: string
    endurance: string
    warranty: string
    encryption: boolean
    rgb: boolean
  }
  features: string[]
  rating: number
  reviews: number
  inStock: boolean
}

function StoragePage() {
  const [selectedStorage, setSelectedStorage] = useState<StorageItem | null>(null)
  const [priceRange, setPriceRange] = useState<[number, number]>([20, 1000])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCapacities, setSelectedCapacities] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedInterfaces, setSelectedInterfaces] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedFormFactors, setSelectedFormFactors] = useState<string[]>([])
  const [selectedNandTypes, setSelectedNandTypes] = useState<string[]>([])
  const [selectedReadSpeeds, setSelectedReadSpeeds] = useState<string[]>([])
  const [selectedWriteSpeeds, setSelectedWriteSpeeds] = useState<string[]>([])
  const [selectedEncryption, setSelectedEncryption] = useState<boolean | null>(null)
  const [selectedRGB, setSelectedRGB] = useState<boolean | null>(null)
  
  // Popup states
  const [showCapacityPopup, setShowCapacityPopup] = useState(false)
  const [showTypePopup, setShowTypePopup] = useState(false)
  const [showInterfacePopup, setShowInterfacePopup] = useState(false)
  const [showBrandPopup, setShowBrandPopup] = useState(false)
  const [showFormFactorPopup, setShowFormFactorPopup] = useState(false)
  const [showNandTypePopup, setShowNandTypePopup] = useState(false)
  const [showReadSpeedPopup, setShowReadSpeedPopup] = useState(false)
  const [showWriteSpeedPopup, setShowWriteSpeedPopup] = useState(false)
  
  // Search terms for popups
  const [capacitySearch, setCapacitySearch] = useState('')
  const [typeSearch, setTypeSearch] = useState('')
  const [interfaceSearch, setInterfaceSearch] = useState('')
  const [brandSearch, setBrandSearch] = useState('')
  const [formFactorSearch, setFormFactorSearch] = useState('')
  const [nandTypeSearch, setNandTypeSearch] = useState('')
  const [readSpeedSearch, setReadSpeedSearch] = useState('')
  const [writeSpeedSearch, setWriteSpeedSearch] = useState('')

  const allStorages = [
    {
      id: 1,
      name: 'Samsung 980 PRO 2TB NVMe SSD',
      brand: 'Samsung',
      price: 199.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        capacity: '2TB',
        type: 'SSD',
        interface: 'PCIe 4.0 x4',
        readSpeed: '7000 MB/s',
        writeSpeed: '5000 MB/s',
        formFactor: 'M.2 2280',
        nandType: '3D V-NAND',
        controller: 'Samsung Elpis',
        endurance: '1200 TBW',
        warranty: '5 Years',
        encryption: true,
        rgb: false
      },
      features: ['PCIe 4.0', 'High Performance', 'Gaming Optimized', 'Heat Spreader', 'Samsung Magician'],
      rating: 4.8,
      reviews: 342,
      inStock: true
    },
    {
      id: 2,
      name: 'WD Black SN850X 1TB NVMe SSD',
      brand: 'WD',
      price: 129.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        capacity: '1TB',
        type: 'SSD',
        interface: 'PCIe 4.0 x4',
        readSpeed: '7300 MB/s',
        writeSpeed: '6300 MB/s',
        formFactor: 'M.2 2280',
        nandType: '3D NAND',
        controller: 'WD Black G2',
        endurance: '600 TBW',
        warranty: '5 Years',
        encryption: true,
        rgb: false
      },
      features: ['PCIe 4.0', 'High Performance', 'Gaming Optimized', 'WD Dashboard', 'Heat Spreader'],
      rating: 4.7,
      reviews: 289,
      inStock: true
    },
    {
      id: 3,
      name: 'Crucial MX4 1TB SATA SSD',
      brand: 'Crucial',
      price: 79.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        capacity: '1TB',
        type: 'SSD',
        interface: 'SATA 6Gb/s',
        readSpeed: '560 MB/s',
        writeSpeed: '510 MB/s',
        formFactor: '2.5"',
        nandType: '3D NAND',
        controller: 'Crucial DM01A',
        endurance: '360 TBW',
        warranty: '5 Years',
        encryption: true,
        rgb: false
      },
      features: ['SATA Interface', 'Reliable', 'Budget Friendly', 'Crucial Storage Executive', 'Compatible'],
      rating: 4.5,
      reviews: 156,
      inStock: true
    },
    {
      id: 4,
      name: 'Seagate BarraCuda 2TB HDD',
      brand: 'Seagate',
      price: 49.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        capacity: '2TB',
        type: 'HDD',
        interface: 'SATA 6Gb/s',
        readSpeed: '210 MB/s',
        writeSpeed: '210 MB/s',
        formFactor: '3.5"',
        nandType: 'N/A',
        controller: 'Seagate',
        endurance: 'N/A',
        warranty: '2 Years',
        encryption: false,
        rgb: false
      },
      features: ['High Capacity', 'Budget Friendly', 'Reliable', 'Compatible', 'Storage'],
      rating: 4.2,
      reviews: 203,
      inStock: false
    },
    {
      id: 5,
      name: 'Corsair MP600 PRO XT 1TB NVMe SSD',
      brand: 'Corsair',
      price: 149.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        capacity: '1TB',
        type: 'SSD',
        interface: 'PCIe 4.0 x4',
        readSpeed: '7100 MB/s',
        writeSpeed: '6800 MB/s',
        formFactor: 'M.2 2280',
        nandType: '3D TLC NAND',
        controller: 'Phison E18',
        endurance: '1800 TBW',
        warranty: '5 Years',
        encryption: true,
        rgb: true
      },
      features: ['PCIe 4.0', 'High Performance', 'RGB Lighting', 'Gaming Optimized', 'Corsair SSD Toolbox'],
      rating: 4.6,
      reviews: 178,
      inStock: true
    },
    {
      id: 6,
      name: 'Kingston NV1 500GB NVMe SSD',
      brand: 'Kingston',
      price: 39.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        capacity: '500GB',
        type: 'SSD',
        interface: 'PCIe 3.0 x4',
        readSpeed: '2100 MB/s',
        writeSpeed: '1700 MB/s',
        formFactor: 'M.2 2280',
        nandType: '3D NAND',
        controller: 'Kingston',
        endurance: '150 TBW',
        warranty: '3 Years',
        encryption: false,
        rgb: false
      },
      features: ['PCIe 3.0', 'Budget Friendly', 'Compact', 'Compatible', 'Kingston SSD Manager'],
      rating: 4.3,
      reviews: 145,
      inStock: true
    }
  ]

  // Filter logic
  const filteredStorages = allStorages.filter((storageItem) => {
    // Price filter
    if (storageItem.price < priceRange[0] || storageItem.price > priceRange[1]) {
      return false
    }

    // Search filter
    if (searchTerm && !storageItem.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !storageItem.brand.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    // Capacity filter
    if (selectedCapacities.length > 0 && !selectedCapacities.includes(storageItem.specs.capacity)) {
      return false
    }

    // Type filter
    if (selectedTypes.length > 0 && !selectedTypes.includes(storageItem.specs.type)) {
      return false
    }

    // Interface filter
    if (selectedInterfaces.length > 0 && !selectedInterfaces.includes(storageItem.specs.interface)) {
      return false
    }

    // Brand filter
    if (selectedBrands.length > 0 && !selectedBrands.includes(storageItem.brand)) {
      return false
    }

    // Form factor filter
    if (selectedFormFactors.length > 0 && !selectedFormFactors.includes(storageItem.specs.formFactor)) {
      return false
    }

    // NAND type filter
    if (selectedNandTypes.length > 0 && !selectedNandTypes.includes(storageItem.specs.nandType)) {
      return false
    }

    // Read speed filter
    if (selectedReadSpeeds.length > 0 && !selectedReadSpeeds.includes(storageItem.specs.readSpeed)) {
      return false
    }

    // Write speed filter
    if (selectedWriteSpeeds.length > 0 && !selectedWriteSpeeds.includes(storageItem.specs.writeSpeed)) {
      return false
    }

    // Encryption filter
    if (selectedEncryption !== null && storageItem.specs.encryption !== selectedEncryption) {
      return false
    }

    // RGB filter
    if (selectedRGB !== null && storageItem.specs.rgb !== selectedRGB) {
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

  const handleTypeChange = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const handleInterfaceChange = (interfaceType: string) => {
    setSelectedInterfaces(prev => 
      prev.includes(interfaceType) 
        ? prev.filter(i => i !== interfaceType)
        : [...prev, interfaceType]
    )
  }

  const handleBrandChange = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    )
  }

  const handleFormFactorChange = (formFactor: string) => {
    setSelectedFormFactors(prev => 
      prev.includes(formFactor) 
        ? prev.filter(f => f !== formFactor)
        : [...prev, formFactor]
    )
  }

  const handleNandTypeChange = (nandType: string) => {
    setSelectedNandTypes(prev => 
      prev.includes(nandType) 
        ? prev.filter(n => n !== nandType)
        : [...prev, nandType]
    )
  }

  const handleReadSpeedChange = (speed: string) => {
    setSelectedReadSpeeds(prev => 
      prev.includes(speed) 
        ? prev.filter(s => s !== speed)
        : [...prev, speed]
    )
  }

  const handleWriteSpeedChange = (speed: string) => {
    setSelectedWriteSpeeds(prev => 
      prev.includes(speed) 
        ? prev.filter(s => s !== speed)
        : [...prev, speed]
    )
  }

  const handleEncryptionChange = (value: boolean) => {
    setSelectedEncryption(prev => prev === value ? null : value)
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
              <span className="font-medium text-black">Storage</span>
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
                      <span>$1000</span>
                    </div>
                    <input 
                      type="range" 
                      min="20" 
                      max="1000" 
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full" 
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Capacity</h3>
                  <div className="space-y-2 text-sm">
                    {['500GB','1TB','2TB'].map((capacity) => (
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
                  <h3 className="text-base font-semibold mb-3">Type</h3>
                  <div className="space-y-2 text-sm">
                    {['SSD','HDD'].map((type) => (
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
                  <h3 className="text-base font-semibold mb-3">Interface</h3>
                  <div className="space-y-2 text-sm">
                    {['SATA 6Gb/s','PCIe 3.0 x4','PCIe 4.0 x4'].map((interfaceType) => (
                      <label key={interfaceType} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedInterfaces.includes(interfaceType)}
                          onChange={() => handleInterfaceChange(interfaceType)}
                          className="rounded" 
                        />
                        <span>{interfaceType}</span>
                      </label>
                    ))}
                    <button onClick={() => setShowInterfacePopup(true)} className="text-blue-600 text-xs">Show More</button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Brand</h3>
                  <div className="space-y-2 text-sm">
                    {['Samsung','WD','Crucial','Seagate','Corsair','Kingston'].map((brand) => (
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
                  <h3 className="text-base font-semibold mb-3">Form Factor</h3>
                  <div className="space-y-2 text-sm">
                    {['2.5"','3.5"','M.2 2280'].map((formFactor) => (
                      <label key={formFactor} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedFormFactors.includes(formFactor)}
                          onChange={() => handleFormFactorChange(formFactor)}
                          className="rounded" 
                        />
                        <span>{formFactor}</span>
                      </label>
                    ))}
                    <button onClick={() => setShowFormFactorPopup(true)} className="text-blue-600 text-xs">Show More</button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">NAND Type</h3>
                  <div className="space-y-2 text-sm">
                    {['3D NAND','3D TLC NAND','3D V-NAND'].map((nandType) => (
                      <label key={nandType} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedNandTypes.includes(nandType)}
                          onChange={() => handleNandTypeChange(nandType)}
                          className="rounded" 
                        />
                        <span>{nandType}</span>
                      </label>
                    ))}
                    <button onClick={() => setShowNandTypePopup(true)} className="text-blue-600 text-xs">Show More</button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Read Speed</h3>
                  <div className="space-y-2 text-sm">
                    {['210 MB/s','560 MB/s','1700 MB/s','2100 MB/s','5000 MB/s','7000 MB/s'].map((speed) => (
                      <label key={speed} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedReadSpeeds.includes(speed)}
                          onChange={() => handleReadSpeedChange(speed)}
                          className="rounded" 
                        />
                        <span>{speed}</span>
                      </label>
                    ))}
                    <button onClick={() => setShowReadSpeedPopup(true)} className="text-blue-600 text-xs">Show More</button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Write Speed</h3>
                  <div className="space-y-2 text-sm">
                    {['210 MB/s','510 MB/s','1700 MB/s','6300 MB/s','6800 MB/s'].map((speed) => (
                      <label key={speed} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedWriteSpeeds.includes(speed)}
                          onChange={() => handleWriteSpeedChange(speed)}
                          className="rounded" 
                        />
                        <span>{speed}</span>
                      </label>
                    ))}
                    <button onClick={() => setShowWriteSpeedPopup(true)} className="text-blue-600 text-xs">Show More</button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3">Encryption</h3>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={selectedEncryption === true}
                        onChange={() => handleEncryptionChange(true)}
                        className="rounded" 
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={selectedEncryption === false}
                        onChange={() => handleEncryptionChange(false)}
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
                {filteredStorages.map((storageItem) => (
                  <div key={storageItem.id} className="rounded-lg border border-black/10 bg-white hover:bg-black/5 transition cursor-pointer" onClick={() => setSelectedStorage(storageItem)}>
                    <div className="p-4">
                      <img src={storageItem.image} alt={storageItem.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                      <div className="text-sm font-medium mb-2 line-clamp-2">{storageItem.name}</div>
                      <div className="text-lg font-bold mb-3">${storageItem.price}</div>
                      <div className="space-y-1 text-xs text-black/60 mb-4">
                        <div className="flex justify-between"><span>Capacity:</span><span className="text-black">{storageItem.specs.capacity}</span></div>
                        <div className="flex justify-between"><span>Type:</span><span className="text-black">{storageItem.specs.type}</span></div>
                        <div className="flex justify-between"><span>Interface:</span><span className="text-black">{storageItem.specs.interface}</span></div>
                        <div className="flex justify-between"><span>Read Speed:</span><span className="text-black">{storageItem.specs.readSpeed}</span></div>
                        <div className="flex justify-between"><span>Write Speed:</span><span className="text-black">{storageItem.specs.writeSpeed}</span></div>
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
      {selectedStorage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{selectedStorage.name}</h2>
                  <p className="text-lg text-gray-600">{selectedStorage.brand}</p>
                </div>
                <button
                  onClick={() => setSelectedStorage(null)}
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
                    src={selectedStorage.image}
                    alt={selectedStorage.name}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                </div>
                
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-4">${selectedStorage.price}</div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Specifications</h3>
                    <div className="space-y-2">
                      {Object.entries(selectedStorage.specs).map(([key, value]) => (
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
                      {selectedStorage.features.map((feature, index) => (
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
                        selectedStorage.inStock 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={!selectedStorage.inStock}
                    >
                      {selectedStorage.inStock ? 'Add to Build' : 'Out of Stock'}
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
        options={['120GB','240GB','250GB','480GB','500GB','960GB','1TB','2TB','4TB','8TB','10TB','12TB','14TB','16TB','18TB','20TB']}
        selectedItems={selectedCapacities}
        onItemChange={handleCapacityChange}
      />

      <FilterPopup
        isOpen={showTypePopup}
        onClose={() => setShowTypePopup(false)}
        title="Type"
        searchTerm={typeSearch}
        onSearchChange={setTypeSearch}
        options={['SSD','HDD','NVMe SSD','SATA SSD','M.2 SSD','External SSD','External HDD']}
        selectedItems={selectedTypes}
        onItemChange={handleTypeChange}
      />

      <FilterPopup
        isOpen={showInterfacePopup}
        onClose={() => setShowInterfacePopup(false)}
        title="Interface"
        searchTerm={interfaceSearch}
        onSearchChange={setInterfaceSearch}
        options={['SATA 3Gb/s','SATA 6Gb/s','PCIe 2.0 x4','PCIe 3.0 x4','PCIe 4.0 x4','PCIe 5.0 x4','USB 3.0','USB 3.1','USB 3.2','USB-C','Thunderbolt 3','Thunderbolt 4']}
        selectedItems={selectedInterfaces}
        onItemChange={handleInterfaceChange}
      />

      <FilterPopup
        isOpen={showBrandPopup}
        onClose={() => setShowBrandPopup(false)}
        title="Brand"
        searchTerm={brandSearch}
        onSearchChange={setBrandSearch}
        options={['Samsung','WD','Crucial','Seagate','Corsair','Kingston','Intel','ADATA','SanDisk','Toshiba','Hitachi','Western Digital']}
        selectedItems={selectedBrands}
        onItemChange={handleBrandChange}
      />

      <FilterPopup
        isOpen={showFormFactorPopup}
        onClose={() => setShowFormFactorPopup(false)}
        title="Form Factor"
        searchTerm={formFactorSearch}
        onSearchChange={setFormFactorSearch}
        options={['2.5"','3.5"','M.2 2242','M.2 2260','M.2 2280','M.2 22110','U.2','mSATA','External']}
        selectedItems={selectedFormFactors}
        onItemChange={handleFormFactorChange}
      />

      <FilterPopup
        isOpen={showNandTypePopup}
        onClose={() => setShowNandTypePopup(false)}
        title="NAND Type"
        searchTerm={nandTypeSearch}
        onSearchChange={setNandTypeSearch}
        options={['SLC','MLC','TLC','QLC','3D NAND','3D TLC NAND','3D QLC NAND','3D V-NAND','BiCS','N/A']}
        selectedItems={selectedNandTypes}
        onItemChange={handleNandTypeChange}
      />

      <FilterPopup
        isOpen={showReadSpeedPopup}
        onClose={() => setShowReadSpeedPopup(false)}
        title="Read Speed"
        searchTerm={readSpeedSearch}
        onSearchChange={setReadSpeedSearch}
        options={['100 MB/s','150 MB/s','200 MB/s','210 MB/s','300 MB/s','400 MB/s','500 MB/s','550 MB/s','560 MB/s','600 MB/s','700 MB/s','800 MB/s','1000 MB/s','1200 MB/s','1500 MB/s','1700 MB/s','2000 MB/s','2100 MB/s','3000 MB/s','3500 MB/s','5000 MB/s','7000 MB/s','7400 MB/s']}
        selectedItems={selectedReadSpeeds}
        onItemChange={handleReadSpeedChange}
      />

      <FilterPopup
        isOpen={showWriteSpeedPopup}
        onClose={() => setShowWriteSpeedPopup(false)}
        title="Write Speed"
        searchTerm={writeSpeedSearch}
        onSearchChange={setWriteSpeedSearch}
        options={['100 MB/s','150 MB/s','200 MB/s','210 MB/s','300 MB/s','400 MB/s','500 MB/s','510 MB/s','550 MB/s','600 MB/s','700 MB/s','800 MB/s','1000 MB/s','1200 MB/s','1500 MB/s','1700 MB/s','2000 MB/s','3000 MB/s','3500 MB/s','5000 MB/s','6300 MB/s','6800 MB/s','7000 MB/s']}
        selectedItems={selectedWriteSpeeds}
        onItemChange={handleWriteSpeedChange}
      />
    </div>
  )
}

export default StoragePage
