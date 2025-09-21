import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../Homepage.css'

interface SalesItem {
  id: number
  title: string
  category: string
  price: number
  originalPrice?: number
  image: string
  specs: {
    brand: string
    model: string
    specifications: string
    retailer: string
    availability: string
    shipping: string
    warranty: string
    condition: string
  }
  features: string[]
  rating: number
  reviews: number
  inStock: boolean
  description: string
  datePosted: string
  dealType: string
}

function SalesPage() {
  const [selectedBuild, setSelectedBuild] = useState<SalesItem | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Popup states
  const [showFilterPopup, setShowFilterPopup] = useState(false)

  // Refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // In a real app, this would fetch new data from API
    // For now, we'll just show the refresh animation
    console.log('Refreshing sales data...')
    
    setIsRefreshing(false)
  }

  const allDeals = [
    {
      id: 1,
      title: 'ONIX LUMI Arc B580 12GB GDDR6 PCI Express 4.0 x8 ATX - White GPU',
      category: 'GPU',
      price: 250.00,
      originalPrice: 350.00,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        brand: 'ONIX',
        model: 'LUMI Arc B580',
        specifications: '12GB GDDR6, PCI Express 4.0 x8, ATX Form Factor',
        retailer: 'Newegg',
        availability: 'In Stock',
        shipping: 'Free Shipping',
        warranty: '3 Years',
        condition: 'New'
      },
      features: ['Ray Tracing', '12GB VRAM', 'PCIe 4.0', 'White Design'],
      rating: 4.2,
      reviews: 89,
      inStock: true,
      description: 'ONIX LUMI Arc B580 GPU với 12GB VRAM, hỗ trợ Ray Tracing và thiết kế màu trắng đẹp mắt.',
      datePosted: '21/9/2025',
      dealType: 'Sale'
    },
    {
      id: 2,
      title: 'MSI SPATIUM M480 PRO NVMe PCIe 4.0 1TB',
      category: 'Storage',
      price: 65.00,
      originalPrice: 89.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        brand: 'MSI',
        model: 'SPATIUM M480 PRO',
        specifications: '1TB NVMe PCIe 4.0, 7000MB/s Read, 6500MB/s Write',
        retailer: 'Amazon',
        availability: 'In Stock',
        shipping: 'Prime Shipping',
        warranty: '5 Years',
        condition: 'New'
      },
      features: ['PCIe 4.0', 'High Speed', '1TB Capacity', '5 Year Warranty'],
      rating: 4.6,
      reviews: 234,
      inStock: true,
      description: 'SSD NVMe PCIe 4.0 tốc độ cao với khả năng đọc 7000MB/s và ghi 6500MB/s.',
      datePosted: '21/9/2025',
      dealType: 'Flash Sale'
    },
    {
      id: 3,
      title: 'NZXT H5 Flow RGB (2024) Tempered Glass ATX Mid-Tower Computer Case - White',
      category: 'Case',
      price: 59.99,
      originalPrice: 119.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        brand: 'NZXT',
        model: 'H5 Flow RGB',
        specifications: 'ATX Mid-Tower, Tempered Glass, RGB Fans, White',
        retailer: 'microcenter.com',
        availability: 'In Stock',
        shipping: 'Store Pickup',
        warranty: '2 Years',
        condition: 'New'
      },
      features: ['RGB Lighting', 'Tempered Glass', 'Good Airflow', 'Cable Management'],
      rating: 4.7,
      reviews: 156,
      inStock: true,
      description: 'Case NZXT H5 Flow RGB với thiết kế đẹp, tản nhiệt tốt và đèn RGB tích hợp.',
      datePosted: '21/9/2025',
      dealType: 'Clearance'
    },
    {
      id: 4,
      title: 'NZXT H7 Flow (2024) Tempered Glass ATX Mid-Tower Computer Case',
      category: 'Case',
      price: 59.99,
      originalPrice: 129.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        brand: 'NZXT',
        model: 'H7 Flow',
        specifications: 'ATX Mid-Tower, Tempered Glass, Mesh Front Panel',
        retailer: 'microcenter.com',
        availability: 'Limited Stock',
        shipping: 'Store Pickup',
        warranty: '2 Years',
        condition: 'New'
      },
      features: ['Mesh Front Panel', 'Tempered Glass', 'Excellent Airflow', 'Spacious Interior'],
      rating: 4.8,
      reviews: 203,
      inStock: true,
      description: 'Case NZXT H7 Flow với thiết kế mesh front panel tối ưu cho tản nhiệt.',
      datePosted: '21/9/2025',
      dealType: 'Clearance'
    },
    {
      id: 5,
      title: 'CORSAIR MP600 PRO XT 2TB Gen4 PCIe x4 NVMe M.2 2GB DRAM SSD WITH HEATSINK - 7100/6800 R/W SPEEDS',
      category: 'Storage',
      price: 100.99,
      originalPrice: 149.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        brand: 'Corsair',
        model: 'MP600 PRO XT',
        specifications: '2TB Gen4 PCIe x4 NVMe M.2, 7100MB/s Read, 6800MB/s Write, Heatsink',
        retailer: 'Newegg',
        availability: 'In Stock',
        shipping: 'Free Shipping',
        warranty: '5 Years',
        condition: 'New'
      },
      features: ['2TB Capacity', 'Gen4 PCIe', 'Built-in Heatsink', 'High Performance'],
      rating: 4.9,
      reviews: 178,
      inStock: true,
      description: 'SSD Corsair MP600 PRO XT 2TB với hiệu năng cao và tản nhiệt tích hợp.',
      datePosted: '21/9/2025',
      dealType: 'Sale'
    },
    {
      id: 6,
      title: 'AMD Ryzen 7 7700X 8-Core 16-Thread Desktop Processor',
      category: 'CPU',
      price: 299.99,
      originalPrice: 399.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        brand: 'AMD',
        model: 'Ryzen 7 7700X',
        specifications: '8-Core 16-Thread, 4.5GHz Base, 5.4GHz Boost, AM5 Socket',
        retailer: 'Amazon',
        availability: 'In Stock',
        shipping: 'Prime Shipping',
        warranty: '3 Years',
        condition: 'New'
      },
      features: ['8-Core 16-Thread', '5.4GHz Boost', 'AM5 Socket', 'Unlocked'],
      rating: 4.7,
      reviews: 312,
      inStock: true,
      description: 'CPU AMD Ryzen 7 7700X với 8 nhân 16 luồng, hiệu năng gaming và productivity cao.',
      datePosted: '20/9/2025',
      dealType: 'Price Drop'
    },
    {
      id: 7,
      title: 'ASUS ROG Strix B650E-F Gaming WiFi Motherboard',
      category: 'Motherboard',
      price: 199.99,
      originalPrice: 249.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        brand: 'ASUS',
        model: 'ROG Strix B650E-F',
        specifications: 'AM5 Socket, DDR5, PCIe 5.0, WiFi 6E, Bluetooth 5.2',
        retailer: 'Newegg',
        availability: 'In Stock',
        shipping: 'Free Shipping',
        warranty: '3 Years',
        condition: 'New'
      },
      features: ['AM5 Socket', 'DDR5 Support', 'PCIe 5.0', 'WiFi 6E'],
      rating: 4.6,
      reviews: 189,
      inStock: true,
      description: 'Motherboard ASUS ROG Strix B650E-F với socket AM5 và hỗ trợ DDR5.',
      datePosted: '20/9/2025',
      dealType: 'Sale'
    },
    {
      id: 8,
      title: 'Corsair Vengeance LPX 32GB (2x16GB) DDR4-3200 Memory Kit',
      category: 'RAM',
      price: 79.99,
      originalPrice: 109.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        brand: 'Corsair',
        model: 'Vengeance LPX',
        specifications: '32GB (2x16GB) DDR4-3200, CL16, Low Profile',
        retailer: 'Newegg',
        availability: 'In Stock',
        shipping: 'Free Shipping',
        warranty: 'Lifetime',
        condition: 'New'
      },
      features: ['32GB Capacity', 'DDR4-3200', 'Low Profile', 'Lifetime Warranty'],
      rating: 4.5,
      reviews: 267,
      inStock: true,
      description: 'RAM Corsair Vengeance LPX 32GB DDR4-3200 với thiết kế low profile và bảo hành trọn đời.',
      datePosted: '19/9/2025',
      dealType: 'Flash Sale'
    },
    {
      id: 9,
      title: 'Noctua NH-D15 Chromax Black CPU Cooler',
      category: 'CPU Cooler',
      price: 99.95,
      originalPrice: 119.95,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        brand: 'Noctua',
        model: 'NH-D15 Chromax Black',
        specifications: 'Dual Tower, 140mm Fans, 6 Heat Pipes, Chromax Black',
        retailer: 'Amazon',
        availability: 'In Stock',
        shipping: 'Prime Shipping',
        warranty: '6 Years',
        condition: 'New'
      },
      features: ['Dual Tower Design', '140mm Fans', '6 Heat Pipes', 'Chromax Black'],
      rating: 4.9,
      reviews: 445,
      inStock: true,
      description: 'CPU Cooler Noctua NH-D15 Chromax Black với thiết kế dual tower và tản nhiệt hiệu quả.',
      datePosted: '19/9/2025',
      dealType: 'Sale'
    },
    {
      id: 10,
      title: 'Corsair RM850x 850W 80+ Gold Fully Modular PSU',
      category: 'Power Supply',
      price: 129.99,
      originalPrice: 159.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        brand: 'Corsair',
        model: 'RM850x',
        specifications: '850W, 80+ Gold, Fully Modular, Zero RPM Mode',
        retailer: 'Best Buy',
        availability: 'In Stock',
        shipping: 'Free Shipping',
        warranty: '10 Years',
        condition: 'New'
      },
      features: ['850W Power', '80+ Gold', 'Fully Modular', 'Zero RPM Mode'],
      rating: 4.8,
      reviews: 234,
      inStock: true,
      description: 'PSU Corsair RM850x 850W với hiệu suất 80+ Gold và thiết kế fully modular.',
      datePosted: '18/9/2025',
      dealType: 'Price Drop'
    },
    {
      id: 11,
      title: 'Corsair LL120 RGB 120mm PWM Fan (3-Pack)',
      category: 'Case Fan',
      price: 89.99,
      originalPrice: 119.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        brand: 'Corsair',
        model: 'LL120 RGB',
        specifications: '120mm PWM, RGB Lighting, 16 LEDs, iCUE Compatible',
        retailer: 'Newegg',
        availability: 'In Stock',
        shipping: 'Free Shipping',
        warranty: '2 Years',
        condition: 'New'
      },
      features: ['120mm PWM', 'RGB Lighting', '16 LEDs', 'iCUE Compatible'],
      rating: 4.4,
      reviews: 178,
      inStock: true,
      description: 'Case Fan Corsair LL120 RGB 3-pack với đèn RGB và tương thích iCUE.',
      datePosted: '18/9/2025',
      dealType: 'Sale'
    },
    {
      id: 12,
      title: 'ASUS TUF Gaming VG27AQ 27" 1440p 165Hz Monitor',
      category: 'Monitor',
      price: 249.99,
      originalPrice: 329.99,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
      specs: {
        brand: 'ASUS',
        model: 'TUF Gaming VG27AQ',
        specifications: '27" 1440p, 165Hz, 1ms, G-Sync Compatible, HDR10',
        retailer: 'Amazon',
        availability: 'In Stock',
        shipping: 'Prime Shipping',
        warranty: '3 Years',
        condition: 'New'
      },
      features: ['27" 1440p', '165Hz', '1ms Response', 'G-Sync Compatible'],
      rating: 4.7,
      reviews: 567,
      inStock: true,
      description: 'Monitor ASUS TUF Gaming VG27AQ 27" với độ phân giải 1440p và tần số quét 165Hz.',
      datePosted: '17/9/2025',
      dealType: 'Clearance'
    }
  ]

  // Filter logic
  const filteredDeals = allDeals.filter((dealItem) => {
    // Category filter
    if (selectedCategories.length > 0 && !selectedCategories.includes(dealItem.category)) {
      return false
    }

    return true
  })

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
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
            <Link className="nav-item" to="/sales">Sales</Link>
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
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-black/70 mb-2">
              <span>Sales</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-black mb-2">Product Sales</h1>
                <p className="text-black/60">Discover the latest deals and sales from r/buildapcsales</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowFilterPopup(true)}
                  className="bg-black/5 hover:bg-black/10 text-black px-4 py-2 rounded-md text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filter
                </button>
                    <button 
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      className={`px-4 py-2 rounded-md text-sm flex items-center gap-2 transition-colors ${
                        isRefreshing 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-black/5 hover:bg-black/10 text-black'
                      }`}
                    >
                      <svg 
                        className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      {isRefreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
              </div>
            </div>
          </div>

          {/* Deals List */}
          <div className="space-y-3">
            {filteredDeals.map((dealItem) => (
              <div key={dealItem.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-blue-50 hover:border-blue-300 transition cursor-pointer shadow-sm" onClick={() => setSelectedBuild(dealItem)}>
                <div className="flex items-center gap-4">
                  {/* Category Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {dealItem.category === 'GPU' ? 'GPU' : 
                         dealItem.category === 'Storage' ? 'SSD' : 
                         dealItem.category === 'Case' ? 'CASE' : 
                         dealItem.category === 'CPU' ? 'CPU' : 
                         dealItem.category === 'RAM' ? 'RAM' : 
                         dealItem.category === 'Motherboard' ? 'MB' :
                         dealItem.category === 'CPU Cooler' ? 'COOL' :
                         dealItem.category === 'Power Supply' ? 'PSU' :
                         dealItem.category === 'Case Fan' ? 'FAN' :
                         dealItem.category === 'Monitor' ? 'MON' :
                         dealItem.category === 'Mouse' ? 'MOU' :
                         dealItem.category === 'Keyboard' ? 'KEY' :
                         dealItem.category === 'Speaker' ? 'SPK' :
                         dealItem.category === 'Headphones' ? 'HP' :
                         dealItem.category === 'Thermal Compound' ? 'TC' :
                         dealItem.category === 'Operating System' ? 'OS' :
                         dealItem.category === 'Sound Card' ? 'SC' :
                         dealItem.category === 'Network Card' ? 'NC' :
                         dealItem.category === 'Microphone' ? 'MIC' :
                         dealItem.category === 'VR Headset' ? 'VR' :
                         dealItem.category === 'Capture Card' ? 'CC' :
                         dealItem.category === 'Webcam' ? 'CAM' :
                         dealItem.category === 'Accessory' ? 'ACC' :
                         dealItem.category === 'Other' ? 'OTH' : 'PC'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Category */}
                  <div className="flex-shrink-0 w-16">
                    <span className="text-gray-600 text-sm font-medium">{dealItem.category}</span>
                  </div>
                  
                  {/* Product Info */}
                  <div className="flex-1">
                    <div className="text-gray-900 text-sm mb-1 font-medium">
                      {dealItem.title} - ${dealItem.price} ({dealItem.specs.retailer})
                    </div>
                    <div className="text-green-600 font-bold text-lg">
                      ${dealItem.price.toFixed(2)}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {dealItem.specs.retailer}
                    </div>
                  </div>
                  
                  {/* Date */}
                  <div className="flex-shrink-0">
                    <span className="text-gray-500 text-sm">{dealItem.datePosted}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Deal Detail Modal */}
      {selectedBuild && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{selectedBuild.title}</h2>
                  <p className="text-lg text-gray-600">{selectedBuild.specs.brand} - {selectedBuild.specs.retailer}</p>
                </div>
                <button
                  onClick={() => setSelectedBuild(null)}
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
                    src={selectedBuild.image}
                    alt={selectedBuild.title}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                </div>
                
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-3xl font-bold text-green-600">${selectedBuild.price}</div>
                    {selectedBuild.originalPrice && (
                      <div className="text-xl text-gray-500 line-through">${selectedBuild.originalPrice}</div>
                    )}
                    <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full font-semibold">
                      {selectedBuild.dealType}
                    </span>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Deal Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium">{selectedBuild.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Brand:</span>
                        <span className="font-medium">{selectedBuild.specs.brand}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Retailer:</span>
                        <span className="font-medium">{selectedBuild.specs.retailer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Condition:</span>
                        <span className="font-medium">{selectedBuild.specs.condition}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Availability:</span>
                        <span className="font-medium">{selectedBuild.specs.availability}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date Posted:</span>
                        <span className="font-medium">{selectedBuild.datePosted}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Specifications</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Model:</span>
                        <span className="font-medium">{selectedBuild.specs.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Specifications:</span>
                        <span className="font-medium">{selectedBuild.specs.specifications}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping:</span>
                        <span className="font-medium">{selectedBuild.specs.shipping}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Warranty:</span>
                        <span className="font-medium">{selectedBuild.specs.warranty}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Features</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedBuild.features.map((feature, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Description</h3>
                    <p className="text-gray-600">{selectedBuild.description}</p>
                  </div>
                  
                  <div className="flex space-x-4">
                    <button 
                      className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                        selectedBuild.inStock 
                          ? 'bg-green-600 text-white hover:bg-green-700' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={!selectedBuild.inStock}
                    >
                      {selectedBuild.inStock ? 'View Deal' : 'Out of Stock'}
                    </button>
                    <button className="flex-1 border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                      Add to Wishlist
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Sales Modal */}
      {showFilterPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Filter Sales</h2>
                <button
                  onClick={() => setShowFilterPopup(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <p className="text-gray-600 mb-6">Select the categories you want to see in your sales feed.</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {['Case', 'CPU', 'Motherboard', 'GPU', 'RAM', 'CPU Cooler', 'Storage', 'Power Supply', 'Case Fan', 'Monitor', 'Mouse', 'Keyboard', 'Speaker', 'Headphones', 'Thermal Compound', 'Operating System', 'Sound Card', 'Network Card', 'Microphone', 'VR Headset', 'Capture Card', 'Webcam', 'Accessory', 'Other'].map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategories.includes(category)
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setSelectedCategories([])}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowFilterPopup(false)}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SalesPage
