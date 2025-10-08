import { useCallback, useEffect, useMemo, useState } from 'react'
import Joyride, { STATUS, EVENTS } from 'react-joyride'
import type { CallBackProps } from 'react-joyride'
import '../../Homepage.css'
import '../compare/index.css'

interface ApiProduct {
  id?: number
  name?: string
  brand?: string
  model?: string
  specs?: string
  imageUrl1?: string
  imageUrl2?: string
  imageUrl3?: string
  imageUrl4?: string
  imageUrl5?: string
  category?: {
    id?: number
    name?: string
  }
  capacity?: string
  color?: string
  size?: string
  socket?: string
  tdpWatt?: number
  type?: string
  createdAt?: string
  productModels?: unknown[]
  productPrices?: Array<{
    id: number
    supplier: {
      id: number
      name: string
      website: string
    }
    price: number
    supplierLink: string
    updatedAt: string
  }>
}

interface PCComponent {
  id: number
  name: string
  brand: string
  model: string
  specs: string
  image: string
  price: string // Thay đổi từ number sang string để hiển thị min-max range
  category: string
  categoryId: number
  // Additional product info
  capacity?: string
  color?: string
  size?: string
  socket?: string
  tdpWatt?: number
  type?: string
  createdAt?: string
  productPrices?: Array<{
    id: number
    supplier: {
      id: number
      name: string
      website: string
    }
    price: number
    supplierLink: string
    updatedAt: string
  }>
  selectedSupplier?: {
    id: number
    supplier: {
      id: number
      name: string
      website: string
    }
    price: number
    supplierLink: string
    updatedAt: string
  }
}

interface BuildComponent {
  category: string
  categoryId: number
  component: PCComponent | null
}

// Category mapping moved outside component
const categoryMap: { [key: number]: string } = {
  1: 'CPU',
  2: 'GPU',
  3: 'RAM',
  4: 'Mainboard',
  5: 'Storage',
  6: 'PSU',
  7: 'Case',
  8: 'Cooling',
  9: 'Monitor',
  10: 'Keyboard',
  11: 'Mouse',
  12: 'Headset/Speaker'
}

// PC Build categories in order
const buildCategories = [
  { id: 1, name: 'CPU', icon: '🖥️', required: true },
  { id: 4, name: 'Mainboard', icon: '🔧', required: true },
  { id: 3, name: 'RAM', icon: '💾', required: true },
  { id: 2, name: 'GPU', icon: '🎮', required: false },
  { id: 5, name: 'Storage', icon: '💿', required: true },
  { id: 6, name: 'PSU', icon: '⚡', required: true },
  { id: 7, name: 'Case', icon: '📦', required: true },
  { id: 8, name: 'Cooling', icon: '❄️', required: false },
  { id: 9, name: 'Monitor', icon: '🖥️', required: false },
  { id: 10, name: 'Keyboard', icon: '⌨️', required: false },
  { id: 11, name: 'Mouse', icon: '🖱️', required: false },
  { id: 12, name: 'Headset/Speaker', icon: '🎧', required: false }
]

function PCBuilderPage() {
  const [buildComponents, setBuildComponents] = useState<BuildComponent[]>(
    buildCategories.map(cat => ({
      category: cat.name,
      categoryId: cat.id,
      component: null
    }))
  )
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [products, setProducts] = useState<PCComponent[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedComponent, setSelectedComponent] = useState<PCComponent | null>(null)
  const [loadedCategories, setLoadedCategories] = useState<Set<number>>(new Set())
  const [categoryProductCounts, setCategoryProductCounts] = useState<{ [key: number]: number }>({})
  const [productDetails, setProductDetails] = useState<{ [key: number]: PCComponent }>({})
  const [rawApiProducts, setRawApiProducts] = useState<ApiProduct[]>([])
  const [showPCSummary, setShowPCSummary] = useState(false)
  
  // Joyride tour states
  const [runTour, setRunTour] = useState(false)
  const [tourStepIndex, setTourStepIndex] = useState(0)
  const [tourMode, setTourMode] = useState<'guided' | 'interactive'>('guided')
  const [selectedComponentsCount, setSelectedComponentsCount] = useState(0)
  const [tourPaused, setTourPaused] = useState(false)
  const [tourWaitingForCompletion, setTourWaitingForCompletion] = useState(false)
  const [showCompletionPopup, setShowCompletionPopup] = useState(false)

  // Calculate total price (moved up to be used in tour steps)
  const totalPrice = useMemo(() => {
    return buildComponents.reduce((total, buildComp) => {
      if (buildComp.component?.price && 
          buildComp.component.price !== 'Liên hệ' && 
          buildComp.component.price !== 'Đang tải...') {
        // Parse min price từ string (ví dụ: "19.900.000 - 20.990.000 VND" -> 19900000)
        const minPriceMatch = buildComp.component.price.match(/^([\d.,]+)/)
        if (minPriceMatch) {
          const minPrice = parseInt(minPriceMatch[1].replace(/[.,]/g, ''))
          return total + minPrice
        }
      }
      return total
    }, 0)
  }, [buildComponents])

  // Tour steps configuration - Interactive mode
  const interactiveTourSteps = [
    {
      target: '.tour-welcome',
      content: (
        <div>
          <h3 style={{ color: '#3b82f6', marginBottom: '12px' }}>🎉 Chào mừng đến với PC Builder!</h3>
          <p style={{ marginBottom: '8px' }}>Tôi sẽ hướng dẫn bạn xây dựng PC từng bước.</p>
          <p style={{ marginBottom: '8px' }}><strong>Chế độ tương tác:</strong> Bạn có thể chọn linh kiện trong khi tôi hướng dẫn!</p>
          <p style={{ fontSize: '14px', color: '#666' }}>Hãy bắt đầu hành trình xây dựng PC của bạn!</p>
        </div>
      ),
      placement: 'center' as const,
      disableBeacon: true,
    },
    {
      target: '.tour-categories',
      content: (
        <div>
          <h3 style={{ color: '#3b82f6', marginBottom: '12px' }}>🔧 Bước 1: Chọn loại linh kiện</h3>
          <p style={{ marginBottom: '8px' }}>Hãy bắt đầu với <strong>CPU</strong> - linh kiện quan trọng nhất!</p>
          <p style={{ marginBottom: '8px' }}>Click vào "CPU" để xem các sản phẩm có sẵn.</p>
          <div style={{ 
            background: 'rgba(16, 185, 129, 0.1)', 
            padding: '8px', 
            borderRadius: '6px', 
            marginBottom: '8px',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#10b981' }}>
              💡 <strong>Mẹo:</strong> Bạn có thể chọn bất kỳ sản phẩm nào ngay bây giờ!
            </p>
          </div>
        </div>
      ),
      placement: 'top' as const,
      disableOverlayClose: true,
    },
    {
      target: '.tour-products',
      content: (
        <div>
          <h3 style={{ color: '#3b82f6', marginBottom: '12px' }}>📦 Bước 2: Chọn sản phẩm cụ thể</h3>
          <p style={{ marginBottom: '8px' }}>Bây giờ hãy chọn một sản phẩm CPU từ danh sách này!</p>
          <p style={{ marginBottom: '8px' }}>Click vào bất kỳ sản phẩm nào để xem chi tiết và giá.</p>
          <div style={{ 
            background: 'rgba(245, 158, 11, 0.1)', 
            padding: '8px', 
            borderRadius: '6px', 
            marginBottom: '8px',
            border: '1px solid rgba(245, 158, 11, 0.3)'
          }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#f59e0b' }}>
              ⏸️ <strong>Tour sẽ dừng:</strong> Sau bước này, bạn sẽ tự do chọn linh kiện!
            </p>
          </div>
          <p style={{ fontSize: '14px', color: '#666' }}>Hãy chọn CPU đầu tiên của bạn!</p>
        </div>
      ),
      placement: 'top' as const,
      disableOverlayClose: false,
    },
    {
      target: '.tour-build-summary',
      content: (
        <div>
          <h3 style={{ color: '#10b981', marginBottom: '12px' }}>🎉 Chúc mừng! Build đã hoàn thành!</h3>
          <p style={{ marginBottom: '8px' }}>Bạn đã chọn đủ <strong>6/6</strong> linh kiện bắt buộc!</p>
          
          <div style={{ 
            background: 'rgba(16, 185, 129, 0.1)', 
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '12px',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#10b981', fontWeight: '600' }}>
              📊 Tổng giá trị Build: <strong>{totalPrice.toLocaleString('vi-VN')} VND</strong>
            </p>
            <p style={{ margin: 0, fontSize: '13px', color: '#10b981' }}>
              🎯 Build của bạn đã sẵn sàng để sử dụng!
            </p>
          </div>
          
          <p style={{ marginBottom: '8px' }}>Bây giờ bạn có thể:</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '8px', fontSize: '13px' }}>
            <li>Xem thông số PC hoàn chỉnh</li>
            <li>Thêm linh kiện tùy chọn (GPU, Cooling, Monitor...)</li>
            <li>Lưu build để tham khảo sau</li>
          </ul>
          <p style={{ fontSize: '14px', color: '#666' }}>Hãy click nút "Xem thông số PC" để xem chi tiết!</p>
        </div>
      ),
      placement: 'left' as const,
      disableOverlayClose: false,
    }
  ]

  // Tour steps configuration - Build completion
  const buildCompleteTourSteps = useMemo(() => [
    {
      target: '.tour-build-summary',
      content: (
        <div>
          <h3 style={{ color: '#10b981', marginBottom: '12px' }}>🎉 Bước 1: Build của bạn đã hoàn thành!</h3>
          <p style={{ marginBottom: '8px' }}>Tuyệt vời! Bạn đã chọn đủ <strong>6/6</strong> linh kiện bắt buộc.</p>
          
          <div style={{ 
            background: 'rgba(16, 185, 129, 0.1)', 
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '12px',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#10b981', fontWeight: '600' }}>
              💰 Tổng giá trị: <strong>{totalPrice.toLocaleString('vi-VN')} VND</strong>
            </p>
          </div>
          
          <p style={{ marginBottom: '8px' }}>Trong phần "Build của bạn" này, bạn có thể:</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '8px', fontSize: '13px' }}>
            <li>✅ Xem tất cả linh kiện đã chọn</li>
            <li>💰 Theo dõi tổng giá trị build</li>
            <li>🗑️ Xóa linh kiện không phù hợp</li>
            <li>📊 Xem thông số PC hoàn chỉnh</li>
          </ul>
          <p style={{ fontSize: '14px', color: '#666' }}>Hãy xem bước tiếp theo để xem thông số PC!</p>
        </div>
      ),
      placement: 'left' as const,
      disableOverlayClose: false,
    },
    {
      target: '.tour-pc-summary',
      content: (
        <div>
          <h3 style={{ color: '#3b82f6', marginBottom: '12px' }}>📊 Bước 2: Xem thông số PC hoàn chỉnh</h3>
          <p style={{ marginBottom: '8px' }}>Bây giờ hãy click nút <strong>"Xem thông số PC"</strong> ở dưới!</p>
          
          <div style={{ 
            background: 'rgba(59, 130, 246, 0.1)', 
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '12px',
            border: '1px solid rgba(59, 130, 246, 0.3)'
          }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#3b82f6', fontWeight: '600' }}>
              📊 Thông số bạn sẽ thấy:
            </p>
            <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '12px' }}>
              <li>⚡ Tổng công suất tiêu thụ (TDP)</li>
              <li>💾 Tổng dung lượng RAM</li>
              <li>💿 Tổng dung lượng Storage</li>
              <li>🔧 Chi tiết từng linh kiện</li>
            </ul>
          </div>
          
          <p style={{ marginBottom: '8px' }}>Đây là bước cuối cùng để hoàn thành hướng dẫn!</p>
          <p style={{ fontSize: '14px', color: '#666' }}>Sau khi xem xong, bạn sẽ thành thạo PC Builder! 🚀</p>
        </div>
      ),
      placement: 'top' as const,
      disableOverlayClose: false,
    }
  ], [totalPrice])

  // Add a third step for PC Summary button guidance
  const addPCSummaryStep = useCallback(() => {
    if (buildCompleteTourSteps.length < 3) {
      buildCompleteTourSteps.push({
        target: '.tour-pc-summary',
        content: (
          <div>
            <h3 style={{ color: '#f59e0b', marginBottom: '12px' }}>🎯 Bước 3: Hoàn thành hướng dẫn!</h3>
            <p style={{ marginBottom: '8px' }}>Bạn đã hoàn thành tất cả các bước hướng dẫn!</p>
            
            <div style={{ 
              background: 'rgba(245, 158, 11, 0.1)', 
              padding: '12px', 
              borderRadius: '8px', 
              marginBottom: '12px',
              border: '1px solid rgba(245, 158, 11, 0.3)'
            }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#f59e0b', fontWeight: '600' }}>
                🎉 Chúc mừng! Bạn đã thành thạo PC Builder!
              </p>
            </div>
            
            <p style={{ marginBottom: '8px' }}>Bây giờ bạn có thể:</p>
            <ul style={{ paddingLeft: '20px', marginBottom: '8px', fontSize: '13px' }}>
              <li>🔧 Xây dựng PC mới bất cứ lúc nào</li>
              <li>📊 Xem thông số chi tiết của build</li>
              <li>💰 So sánh giá từ các nhà cung cấp</li>
              <li>💾 Lưu build để tham khảo sau</li>
            </ul>
            <p style={{ fontSize: '14px', color: '#666' }}>Hãy khám phá thêm các tính năng khác của PC Builder! 🚀</p>
          </div>
        ),
        placement: 'top' as const,
        disableOverlayClose: false,
      })
    }
  }, [buildCompleteTourSteps])

  // Calculate selected components count
  useEffect(() => {
    const requiredCategories = buildCategories.filter(cat => cat.required)
    const count = requiredCategories.filter(cat => {
      const buildComp = buildComponents.find(bc => bc.categoryId === cat.id)
      return buildComp?.component
    }).length
    
    setSelectedComponentsCount(count)
    
    // Auto-advance tour when build is complete
    if (count === 6 && tourWaitingForCompletion) {
      // Show completion popup first
      setShowCompletionPopup(true)
      
      // Then show step 3 (build summary) after popup
      setTimeout(() => {
        addPCSummaryStep() // Add the third step if needed
        setRunTour(true)
        setTourStepIndex(2) // Go to step 3 (build summary)
        setTourWaitingForCompletion(false)
      }, 3000) // Wait 3 seconds to let user see the completion popup
    }
  }, [buildComponents, runTour, tourMode, tourWaitingForCompletion, addPCSummaryStep])

  // Handle tour callbacks
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type, action } = data
    
    if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)) {
      setRunTour(false)
      setTourStepIndex(0)
      setTourMode('guided')
      setTourPaused(false)
      setTourWaitingForCompletion(false)
    } else if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      const newIndex = data.index + (action === 'prev' ? -1 : 1)
      setTourStepIndex(newIndex)
      
      // Nếu đang ở bước 2 (index 1) và người dùng nhấn Next
      if (newIndex === 2 && action === 'next' && tourMode === 'interactive') {
        // Dừng tour và chờ người dùng hoàn thành build
        setRunTour(false)
        setTourWaitingForCompletion(true)
        setTourPaused(false)
      }
    }
  }

  // Handle product selection during tour
  const handleProductClick = useCallback(async (product: PCComponent) => {
    if (runTour && tourMode === 'interactive') {
      // Pause tour when user clicks on product
      setTourPaused(true)
    }
    
    // Load product details inline to avoid dependency issues
    if (productDetails[product.id]) {
      setSelectedComponent(productDetails[product.id])
    } else {
      try {
        const apiProduct = rawApiProducts.find((item: ApiProduct) => item.id === product.id)
        if (apiProduct) {
          const detailedProduct = formatDetailedProducts([apiProduct], product.categoryId)[0]
          if (detailedProduct) {
            setProductDetails(prev => ({
              ...prev,
              [product.id]: detailedProduct
            }))
            setSelectedComponent(detailedProduct)
          }
        }
      } catch (err) {
        console.error(`Error loading details for product ${product.id}:`, err)
        setSelectedComponent(product)
      }
    }
  }, [runTour, tourMode, productDetails, rawApiProducts])

  // Resume tour when product selection popup is closed
  const handleComponentPopupClose = useCallback(() => {
    setSelectedComponent(null)
    if (runTour && tourMode === 'interactive' && tourPaused) {
      // Resume tour after a short delay
      setTimeout(() => {
        setTourPaused(false)
      }, 500)
    }
  }, [runTour, tourMode, tourPaused])

  // Start interactive tour function
  const startInteractiveTour = () => {
    setTourMode('interactive')
    setRunTour(true)
    setTourStepIndex(0)
  }

  // Get current tour steps based on mode and completion status
  const getCurrentTourSteps = () => {
    if (tourMode === 'interactive') {
      return interactiveTourSteps
    } else if (selectedComponentsCount === 6 && tourMode === 'guided') {
      return buildCompleteTourSteps
    }
    return interactiveTourSteps
  }

  // Helper function to format detailed product info (with prices)
  const formatDetailedProducts = (categoryProducts: ApiProduct[], categoryId: number): PCComponent[] => {
    return (categoryProducts as ApiProduct[]).map((item) => {
              // Lấy giá từ productPrices (tính min-max range)
              const productPrices = item.productPrices as Array<{
                id: number
                supplier: {
                  id: number
                  name: string
                  website: string
                }
                price: number
                supplierLink: string
                updatedAt: string
              }> || []
              
              // Tính min-max price range
              let priceRange = 'Liên hệ'
              if (productPrices.length > 0) {
                const prices = productPrices.map(p => p.price)
                const minPrice = Math.min(...prices)
                const maxPrice = Math.max(...prices)
                
                if (minPrice === maxPrice) {
                  priceRange = `${minPrice.toLocaleString('vi-VN')} VND`
                } else {
                  priceRange = `${minPrice.toLocaleString('vi-VN')} - ${maxPrice.toLocaleString('vi-VN')} VND`
                }
              }

              return {
                id: Number(item.id) || 0,
                name: String(item.name) || 'Unknown Product',
                brand: String(item.brand) || 'Unknown',
                model: String(item.model) || 'Unknown',
                specs: String(item.specs) || 'No specifications available',
        image: String(item.imageUrl1) || 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
                price: priceRange,
                category: categoryMap[categoryId] || 'Unknown',
                categoryId: categoryId,
        // Additional product info
        capacity: item.capacity,
        color: item.color,
        size: item.size,
        socket: item.socket,
        tdpWatt: item.tdpWatt,
        type: item.type,
        createdAt: item.createdAt,
                productPrices: productPrices.map(pp => ({
                  id: pp.id || 0,
                  supplier: {
                    id: pp.supplier?.id || 0,
                    name: pp.supplier?.name || 'Unknown Supplier',
                    website: pp.supplier?.website || ''
                  },
                  price: pp.price || 0,
                  supplierLink: pp.supplierLink || '',
                  updatedAt: pp.updatedAt || ''
                }))
              }
            })
  }

  // Load all products in one API call
  useEffect(() => {
    const loadAllProducts = async () => {
      setLoading(true)
      try {
        console.log('🚀 Loading all products in single API call...')
        
        // Single API call to get all products
        const response = await fetch(`${import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8080'}/api/product`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const allApiProducts = await response.json()
        console.log(`📦 Loaded ${allApiProducts.length} products in 1 API call`)

        // Store raw API data for later use
        setRawApiProducts(allApiProducts)

        // Process and categorize products
        const allProducts: PCComponent[] = []
        const counts: { [key: number]: number } = {}
        
        // Initialize counts for all categories
        Object.keys(categoryMap).forEach(categoryId => {
          counts[Number(categoryId)] = 0
        })

        // Process each product and categorize
        allApiProducts.forEach((item: ApiProduct) => {
          const categoryId = item.category?.id
          if (categoryId && categoryMap[categoryId]) {
            const basicProduct = {
              id: Number(item.id) || 0,
              name: String(item.name) || 'Unknown Product',
              brand: String(item.brand) || 'Unknown',
              model: String(item.model) || 'Unknown',
              specs: String(item.specs) || 'No specifications available',
              image: String(item.imageUrl1) || 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=200&fit=crop',
              price: 'Đang tải...', // Placeholder price
              category: categoryMap[categoryId] || 'Unknown',
              categoryId: categoryId,
              productPrices: [], // Empty initially
              // Additional product info
              capacity: item.capacity,
              color: item.color,
              size: item.size,
              socket: item.socket,
              tdpWatt: item.tdpWatt,
              type: item.type,
              createdAt: item.createdAt
            }
            
            allProducts.push(basicProduct)
            counts[categoryId] = (counts[categoryId] || 0) + 1
          }
        })

        console.log('📊 Product counts by category:', counts)
        
        setProducts(allProducts)
        setCategoryProductCounts(counts)
        setLoadedCategories(new Set(Object.keys(categoryMap).map(Number)))
        
        console.log('✅ Successfully loaded and categorized all products')
      } catch (err) {
        console.error('❌ Error loading products:', err)
        setProducts([])
        setCategoryProductCounts({})
      } finally {
        setLoading(false)
      }
    }

    loadAllProducts()
  }, [])


  // Filter products by selected category and search query
  const filteredProducts = useMemo(() => {
    let filtered = products
    
    if (selectedCategory) {
      filtered = filtered.filter(p => p.categoryId === selectedCategory)
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase()
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.brand.toLowerCase().includes(query) || 
        p.model.toLowerCase().includes(query)
      )
    }
    
    return filtered
  }, [products, selectedCategory, searchQuery])


  // Calculate PC specifications summary
  const pcSpecsSummary = useMemo(() => {
    const specs = {
      totalTDP: 0,
      totalRAM: 0,
      totalStorage: 0,
      components: [] as Array<{
        category: string
        name: string
        specs: string
        tdp?: number
        capacity?: string
        socket?: string
        size?: string
        color?: string
        type?: string
      }>
    }

    buildComponents.forEach(buildComp => {
      if (buildComp.component) {
        const comp = buildComp.component
        const category = buildComp.category
        
        // Add to components list
        specs.components.push({
          category,
          name: comp.name,
          specs: comp.specs,
          tdp: comp.tdpWatt,
          capacity: comp.capacity,
          socket: comp.socket,
          size: comp.size,
          color: comp.color,
          type: comp.type
        })

        // Calculate totals
        if (comp.tdpWatt) {
          specs.totalTDP += comp.tdpWatt
        }
        
        if (comp.capacity && (category.includes('RAM') || category.includes('Storage'))) {
          const capacityMatch = comp.capacity.match(/(\d+)/)
          if (capacityMatch) {
            const capacity = parseInt(capacityMatch[1])
            if (comp.capacity.includes('GB')) {
              specs.totalRAM += capacity
            } else if (comp.capacity.includes('TB')) {
              specs.totalStorage += capacity * 1024 // Convert TB to GB
            } else {
              specs.totalStorage += capacity
            }
          }
        }
      }
    })

    return specs
  }, [buildComponents])

  // Check if build is complete
  const isBuildComplete = useMemo(() => {
    const requiredCategories = buildCategories.filter(cat => cat.required)
    return requiredCategories.every(cat => {
      const buildComp = buildComponents.find(bc => bc.categoryId === cat.id)
      return buildComp?.component
    })
  }, [buildComponents])


  // Handle component removal
  const handleRemoveComponent = (categoryId: number) => {
    setBuildComponents(prev => prev.map(buildComp => 
      buildComp.categoryId === categoryId 
        ? { ...buildComp, component: null }
        : buildComp
    ))
  }

  // Clear search when category changes
  useEffect(() => {
    setSearchQuery('')
  }, [selectedCategory])

  return (
    <div className="page bg-grid bg-radial">
      <div className="layout">
        <main className="main">
          <section className="hero">
            <div className="tour-welcome" style={{ position: 'relative' }}>
              <h1 className="hero-title">PC Builder</h1>
              <p className="hero-subtitle">Chọn từng linh kiện để xây dựng PC hoàn chỉnh của bạn.</p>
              

              {/* Tour Start Buttons */}

              <div className="tour-start-button" style={{ 
                marginTop: (runTour || tourWaitingForCompletion) ? '16px' : '20px',
                display: 'flex',
                justifyContent: 'center',
                gap: '12px'
              }}>
                <button
                  onClick={startInteractiveTour}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)'
                  }}
                >
                  <span>🎯</span>
                  Hướng dẫn tương tác
                </button>
                
                <button
                  onClick={() => setSelectedCategory(1)} // Auto-select CPU
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <span>🖥️</span>
                  Chọn CPU ngay
                </button>
              </div>
            </div>
          </section>

          <div style={{ padding: '24px' }}>
            {/* Category Tabs */}
            <div className="tour-categories" style={{ marginBottom: '24px' }}>
              <h2 style={{ color: 'white', fontSize: '24px', fontWeight: '600', marginBottom: '20px' }}>
                Chọn loại linh kiện
              </h2>
              
              {/* Required Components */}
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ 
                  color: 'white', 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '20px' }}>🔧</span>
                  Linh kiện bắt buộc
                </h3>
                <div className="pc-builder-category-tabs">
                  {buildCategories.filter(cat => cat.required).map((category) => {
                  const buildComp = buildComponents.find(bc => bc.categoryId === category.id)
                    const isSelected = selectedCategory === category.id
                    const hasComponent = !!buildComp?.component
                  
                  return (
                      <button
                      key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`pc-builder-category-card ${isSelected ? 'pc-builder-category-selected' : ''}`}
                      style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '12px 16px',
                          background: isSelected 
                            ? 'rgba(59, 130, 246, 0.2)' 
                            : hasComponent 
                              ? 'rgba(16, 185, 129, 0.2)'
                              : 'rgba(255,255,255,0.05)',
                          border: isSelected 
                            ? '1px solid rgba(59, 130, 246, 0.5)' 
                            : hasComponent
                              ? '1px solid rgba(16, 185, 129, 0.3)'
                              : '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          color: 'white',
                          fontSize: '14px',
                          fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.background = hasComponent 
                              ? 'rgba(16, 185, 129, 0.3)'
                              : 'rgba(255,255,255,0.08)'
                          }
                      }}
                      onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.background = hasComponent 
                              ? 'rgba(16, 185, 129, 0.2)'
                              : 'rgba(255,255,255,0.05)'
                          }
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                          <span style={{ fontSize: '18px' }}>{category.icon}</span>
                          {categoryProductCounts[category.id] && (
                              <span style={{ 
                                fontSize: '10px', 
                              color: '#3b82f6', 
                              fontWeight: '600',
                              background: 'rgba(59, 130, 246, 0.1)',
                              padding: '1px 4px',
                              borderRadius: '3px',
                              minWidth: '16px',
                              textAlign: 'center'
                            }}>
                              {categoryProductCounts[category.id]}
                              </span>
                            )}
                          </div>
                        <span>{category.name}</span>
                        {hasComponent && (
                          <span style={{ 
                            background: '#10b981', 
                            color: 'white', 
                            fontSize: '8px', 
                            padding: '2px 4px', 
                            borderRadius: '3px',
                            fontWeight: '500'
                          }}>
                            ✓
                          </span>
                        )}
                        {loadedCategories.has(category.id) && !hasComponent && (
                          <span style={{ 
                            background: 'rgba(59, 130, 246, 0.3)', 
                            color: 'white', 
                            fontSize: '8px', 
                            padding: '2px 4px', 
                            borderRadius: '3px',
                            fontWeight: '500'
                          }}>
                            📦
                          </span>
                        )}
                      </button>
                    )
                  })}
                        </div>
              </div>

              {/* Optional Components */}
              <div>
                <h3 style={{ 
                  color: 'white', 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '20px' }}>✨</span>
                  Linh kiện tùy chọn
                </h3>
                <div className="pc-builder-category-tabs">
                  {buildCategories.filter(cat => !cat.required).map((category) => {
                    const buildComp = buildComponents.find(bc => bc.categoryId === category.id)
                    const isSelected = selectedCategory === category.id
                    const hasComponent = !!buildComp?.component
                    
                    return (
                          <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`pc-builder-category-card ${isSelected ? 'pc-builder-category-selected' : ''}`}
                            style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '12px 16px',
                          background: isSelected 
                            ? 'rgba(59, 130, 246, 0.2)' 
                            : hasComponent 
                              ? 'rgba(16, 185, 129, 0.2)'
                              : 'rgba(255,255,255,0.05)',
                          border: isSelected 
                            ? '1px solid rgba(59, 130, 246, 0.5)' 
                            : hasComponent
                              ? '1px solid rgba(16, 185, 129, 0.3)'
                              : '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          color: 'white',
                          fontSize: '14px',
                          fontWeight: '500',
                              cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.background = hasComponent 
                              ? 'rgba(16, 185, 129, 0.3)'
                              : 'rgba(255,255,255,0.08)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.background = hasComponent 
                              ? 'rgba(16, 185, 129, 0.2)'
                              : 'rgba(255,255,255,0.05)'
                          }
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                          <span style={{ fontSize: '18px' }}>{category.icon}</span>
                          {categoryProductCounts[category.id] && (
                            <span style={{ 
                              fontSize: '10px', 
                              color: '#3b82f6', 
                              fontWeight: '600',
                              background: 'rgba(59, 130, 246, 0.1)',
                              padding: '1px 4px',
                              borderRadius: '3px',
                              minWidth: '16px',
                              textAlign: 'center'
                            }}>
                              {categoryProductCounts[category.id]}
                            </span>
                        )}
                      </div>
                        <span>{category.name}</span>
                        {hasComponent && (
                          <span style={{ 
                            background: '#10b981', 
                            color: 'white', 
                            fontSize: '8px', 
                            padding: '2px 4px', 
                            borderRadius: '3px',
                            fontWeight: '500'
                          }}>
                            ✓
                          </span>
                        )}
                        {loadedCategories.has(category.id) && !hasComponent && (
                          <span style={{ 
                            background: 'rgba(59, 130, 246, 0.3)', 
                            color: 'white', 
                            fontSize: '8px', 
                            padding: '2px 4px', 
                            borderRadius: '3px',
                            fontWeight: '500'
                          }}>
                            📦
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Search Bar - Only show when category is selected */}
            {selectedCategory && (
              <div className="tour-search" style={{ marginBottom: '24px' }}>
                <input
                  type="text"
                  placeholder={`Tìm kiếm ${buildCategories.find(c => c.id === selectedCategory)?.name.toLowerCase()}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    maxWidth: '500px',
                    padding: '12px 16px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                />
              </div>
            )}

            {/* Main Content Grid */}
            <div className="pc-builder-grid">
              {/* Product Selection Section */}
              <div>
                {selectedCategory ? (
                  <div>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px', 
                      marginBottom: '20px' 
                    }}>
                      <span style={{ fontSize: '24px' }}>
                        {buildCategories.find(c => c.id === selectedCategory)?.icon}
                    </span>
                      <h3 style={{ color: 'white', fontSize: '20px', fontWeight: '600', margin: 0 }}>
                        {buildCategories.find(c => c.id === selectedCategory)?.name}
                      </h3>
                    <button
                      onClick={() => setSelectedCategory(null)}
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                          borderRadius: '6px',
                          padding: '6px 10px',
                        color: 'white',
                        fontSize: '12px',
                          cursor: 'pointer',
                          marginLeft: 'auto'
                      }}
                    >
                        ✕ Đóng
                    </button>
              </div>
                  
                  {loading ? (
                      <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.6)' }}>
                        <div style={{ fontSize: '24px', marginBottom: '12px' }}>⏳</div>
                        <div style={{ fontSize: '16px', marginBottom: '4px' }}>Đang tải sản phẩm...</div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                          {buildCategories.find(c => c.id === selectedCategory)?.name}
                        </div>
                    </div>
                  ) : (
                      <div className="tour-products pc-builder-products-grid">
                      {filteredProducts.map((product) => (
                        <div
                          key={product.id}
                            onClick={() => handleProductClick(product)}
                            className="pc-builder-product-card"
                          style={{
                              padding: '16px',
                              cursor: 'pointer'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <img 
                              src={product.image} 
                              alt={product.name}
                                style={{ 
                                  width: '60px', 
                                  height: '60px', 
                                  objectFit: 'cover', 
                                  borderRadius: '8px' 
                                }}
                            />
                            <div style={{ flex: 1 }}>
                                <h4 style={{ 
                                  color: 'white', 
                                  fontSize: '16px', 
                                  fontWeight: '600', 
                                  margin: '0 0 4px 0',
                                  lineHeight: '1.3'
                                }}>
                                {product.name}
                              </h4>
                                <p style={{ 
                                  color: 'rgba(255,255,255,0.6)', 
                                  fontSize: '13px', 
                                  margin: '0 0 6px 0' 
                                }}>
                                  {product.brand}{product.model && product.model !== 'Unknown' ? ` - ${product.model}` : ''}
                                </p>
                                <p style={{ 
                                  color: product.price === 'Đang tải...' ? 'rgba(255,255,255,0.5)' : '#3b82f6', 
                                  fontSize: '16px', 
                                  fontWeight: '600', 
                                  margin: 0 
                                }}>
                                  {product.price === 'Đang tải...' ? 'Liên hệ' : product.price}
                                </p>
                              </div>
                            </div>
                            <div style={{
                              background: 'rgba(255,255,255,0.05)',
                              borderRadius: '6px',
                              padding: '8px',
                              border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                              {/* Smart product info display */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {/* Category-specific info - moved to top */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                  {/* CPU specific */}
                                  {product.categoryId === 1 && (
                                    <>
                                      {product.socket && (
                                        <span style={{
                                          background: 'rgba(59, 130, 246, 0.2)',
                                          color: '#60a5fa',
                                          fontSize: '10px',
                                          padding: '2px 6px',
                                          borderRadius: '3px',
                                          fontWeight: '500'
                                        }}>
                                          {product.socket}
                                        </span>
                                      )}
                                      {product.tdpWatt && (
                                        <span style={{
                                          background: 'rgba(16, 185, 129, 0.2)',
                                          color: '#10b981',
                                          fontSize: '10px',
                                          padding: '2px 6px',
                                          borderRadius: '3px',
                                          fontWeight: '500'
                                        }}>
                                          {product.tdpWatt}W
                                        </span>
                                      )}
                                    </>
                                  )}
                                  
                                  {/* RAM specific */}
                                  {product.categoryId === 3 && product.capacity && (
                                    <span style={{
                                      background: 'rgba(168, 85, 247, 0.2)',
                                      color: '#a855f7',
                                      fontSize: '10px',
                                      padding: '2px 6px',
                                      borderRadius: '3px',
                                      fontWeight: '500'
                                    }}>
                                      {product.capacity}
                                    </span>
                                  )}
                                  
                                  {/* Storage specific */}
                                  {product.categoryId === 5 && product.capacity && (
                                    <span style={{
                                      background: 'rgba(245, 158, 11, 0.2)',
                                      color: '#f59e0b',
                                      fontSize: '10px',
                                      padding: '2px 6px',
                                      borderRadius: '3px',
                                      fontWeight: '500'
                                    }}>
                                      {product.capacity}
                                    </span>
                                  )}
                                  
                                  {/* Case specific */}
                                  {product.categoryId === 7 && product.size && (
                                    <span style={{
                                      background: 'rgba(239, 68, 68, 0.2)',
                                      color: '#ef4444',
                                      fontSize: '10px',
                                      padding: '2px 6px',
                                      borderRadius: '3px',
                                      fontWeight: '500'
                                    }}>
                                      {product.size}
                                    </span>
                                  )}
                                  
                                  {/* Color info for any product */}
                                  {product.color && (
                                    <span style={{
                                      background: 'rgba(107, 114, 128, 0.2)',
                                      color: '#9ca3af',
                                      fontSize: '10px',
                                      padding: '2px 6px',
                                      borderRadius: '3px',
                                      fontWeight: '500'
                                    }}>
                                      {product.color === 'Black' ? 'Đen' : 
                                       product.color === 'White' ? 'Trắng' :
                                       product.color === 'Red' ? 'Đỏ' :
                                       product.color === 'Blue' ? 'Xanh dương' :
                                       product.color === 'Green' ? 'Xanh lá' :
                                       product.color === 'Silver' ? 'Bạc' :
                                       product.color === 'Gray' ? 'Xám' :
                                       product.color}
                                    </span>
                                  )}
                                </div>
                                
                                {/* Basic specs - moved below */}
                                {product.specs && product.specs !== 'No specifications available' && (
                                  <p style={{ 
                                    color: 'rgba(255,255,255,0.7)', 
                                    fontSize: '12px', 
                                    margin: 0,
                                    lineHeight: '1.4'
                                  }}>
                                    {product.specs}
                                  </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {filteredProducts.length === 0 && (
                          <div style={{ 
                            gridColumn: '1 / -1',
                            textAlign: 'center', 
                            padding: '60px', 
                            color: 'rgba(255,255,255,0.6)' 
                          }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                            <div style={{ fontSize: '18px', marginBottom: '8px' }}>Không tìm thấy sản phẩm nào</div>
                            <div style={{ fontSize: '14px' }}>Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '60px 20px', 
                    color: 'rgba(255,255,255,0.6)' 
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>🖥️</div>
                    <h3 style={{ color: 'white', fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>
                      Chọn loại linh kiện để bắt đầu
                    </h3>
                    <p style={{ fontSize: '14px', lineHeight: '1.5', maxWidth: '400px', margin: '0 auto' }}>
                      Click vào một trong các danh mục ở trên để xem danh sách sản phẩm tương ứng
                    </p>
                </div>
              )}
              </div>

              {/* Build Summary Section */}
              <div>
              <div className="tour-build-summary pc-builder-build-summary" style={{
                position: 'sticky',
                top: '20px'
              }}>
                <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                    Build của bạn
                </h3>
                
                <div style={{ marginBottom: '16px' }}>
                  {buildComponents.map((buildComp) => {
                    if (!buildComp.component) return null
                    const category = buildCategories.find(c => c.id === buildComp.categoryId)
                    return (
                      <div key={buildComp.categoryId} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                          padding: '12px 0',
                        borderBottom: '1px solid rgba(255,255,255,0.1)'
                      }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span style={{ fontSize: '16px' }}>{category?.icon}</span>
                              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: '500' }}>
                                {buildComp.category}
                        </span>
                          </div>
                            <div style={{ color: 'white', fontSize: '13px', fontWeight: '600', marginBottom: '2px' }}>
                              {buildComp.component.name}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
                              {buildComp.component.brand} - {buildComp.component.model}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', marginLeft: '12px' }}>
                            <div style={{ color: '#3b82f6', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                              {buildComp.component.price}
                            </div>
                            <button
                              onClick={() => handleRemoveComponent(buildComp.categoryId)}
                              style={{
                                background: 'rgba(239, 68, 68, 0.2)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                color: '#ef4444',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              Xóa
                            </button>
                        </div>
                      </div>
                    )
                  })}
                    
                    {buildComponents.every(bc => !bc.component) && (
                      <div style={{ 
                        textAlign: 'center', 
                        padding: '30px 20px', 
                        color: 'rgba(255,255,255,0.5)' 
                      }}>
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>📦</div>
                        <div style={{ fontSize: '13px' }}>Chưa có linh kiện nào</div>
                        <div style={{ fontSize: '11px', marginTop: '4px', color: 'rgba(255,255,255,0.4)' }}>
                          Chọn linh kiện từ danh sách bên trái
                        </div>
                      </div>
                    )}
                </div>
                
                  {buildComponents.some(bc => bc.component) && (
                    <>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                        padding: '16px 0',
                  borderTop: '2px solid rgba(255,255,255,0.2)',
                  marginTop: '12px'
                }}>
                  <span style={{ color: 'white', fontSize: '18px', fontWeight: '700' }}>
                    Tổng cộng:
                  </span>
                  <span style={{ color: '#3b82f6', fontSize: '20px', fontWeight: '700' }}>
                    {totalPrice.toLocaleString('vi-VN')} VND
                  </span>
                </div>
                
                {/* PC Summary Button */}
                {isBuildComplete && (
                  <button
                    className="tour-pc-summary"
                    onClick={() => setShowPCSummary(true)}
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      border: 'none',
                      padding: '12px 20px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      marginTop: '16px',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.3)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <span>📊</span>
                    Xem thông số PC
                  </button>
                )}
                
                <button
                  style={{
                    width: '100%',
                    background: '#1e3a8a',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px',
                    color: 'white',
                          fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginTop: '16px',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#3b82f6'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#1e3a8a'
                  }}
                >
                        💾 Lưu Build
                </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Supplier Prices Popup */}
      {selectedComponent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#1f2937',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
            padding: '24px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '24px'
            }}>
              <div>
                <h2 style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                  {selectedComponent.name}
                </h2>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '16px', margin: 0 }}>
                  {selectedComponent.brand}{selectedComponent.model && selectedComponent.model !== 'Unknown' ? ` - ${selectedComponent.model}` : ''}
                </p>
                <p style={{ color: '#60a5fa', fontSize: '20px', fontWeight: 'bold', margin: '8px 0 0 0' }}>
                  {selectedComponent.price}
                </p>
              </div>
              <button
                onClick={handleComponentPopupClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                ×
              </button>
            </div>

            {/* Specifications */}
            <div style={{ marginTop: '24px' }}>
              <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0' }}>
                Thông số kỹ thuật
              </h3>
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                padding: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Category-specific specifications - moved to top */}
                  {selectedComponent.categoryId === 1 && ( // CPU
                    <>
                      {selectedComponent.socket && (
                        <div style={{ 
                          color: 'rgba(255, 255, 255, 0.8)', 
                          fontSize: '14px', 
                          lineHeight: '1.6' 
                        }}>
                          <strong>Socket:</strong> {selectedComponent.socket}
                        </div>
                      )}
                      {selectedComponent.tdpWatt && (
                        <div style={{ 
                          color: 'rgba(255, 255, 255, 0.8)', 
                          fontSize: '14px', 
                          lineHeight: '1.6' 
                        }}>
                          <strong>Công suất tiêu thụ:</strong> {selectedComponent.tdpWatt}W
                        </div>
                      )}
                    </>
                  )}
                  
                  {selectedComponent.categoryId === 3 && selectedComponent.capacity && ( // RAM
                    <div style={{ 
                      color: 'rgba(255, 255, 255, 0.8)', 
                      fontSize: '14px', 
                      lineHeight: '1.6' 
                    }}>
                      <strong>Dung lượng:</strong> {selectedComponent.capacity}
                    </div>
                  )}
                  
                  {selectedComponent.categoryId === 5 && selectedComponent.capacity && ( // Storage
                    <div style={{ 
                      color: 'rgba(255, 255, 255, 0.8)', 
                      fontSize: '14px', 
                      lineHeight: '1.6' 
                    }}>
                      <strong>Dung lượng:</strong> {selectedComponent.capacity}
                    </div>
                  )}
                  
                  {selectedComponent.categoryId === 7 && selectedComponent.size && ( // Case
                    <div style={{ 
                      color: 'rgba(255, 255, 255, 0.8)', 
                      fontSize: '14px', 
                      lineHeight: '1.6' 
                    }}>
                      <strong>Kích thước:</strong> {selectedComponent.size}
                    </div>
                  )}
                  
                  {/* General specifications */}
                  {selectedComponent.color && (
                    <div style={{ 
                      color: 'rgba(255, 255, 255, 0.8)', 
                      fontSize: '14px', 
                      lineHeight: '1.6' 
                    }}>
                      <strong>Màu sắc:</strong> {selectedComponent.color === 'Black' ? 'Đen' : 
                                               selectedComponent.color === 'White' ? 'Trắng' :
                                               selectedComponent.color === 'Red' ? 'Đỏ' :
                                               selectedComponent.color === 'Blue' ? 'Xanh dương' :
                                               selectedComponent.color === 'Green' ? 'Xanh lá' :
                                               selectedComponent.color === 'Silver' ? 'Bạc' :
                                               selectedComponent.color === 'Gray' ? 'Xám' :
                                               selectedComponent.color}
                    </div>
                  )}
                  
                  {selectedComponent.type && (
                    <div style={{ 
                      color: 'rgba(255, 255, 255, 0.8)', 
                      fontSize: '14px', 
                      lineHeight: '1.6' 
                    }}>
                      <strong>Loại:</strong> {selectedComponent.type === 'Gaming' ? 'Gaming' :
                                            selectedComponent.type === 'Office' ? 'Văn phòng' :
                                            selectedComponent.type === 'Professional' ? 'Chuyên nghiệp' :
                                            selectedComponent.type === 'Budget' ? 'Tiết kiệm' :
                                            selectedComponent.type}
                    </div>
                  )}
                  
                  {/* Basic specs - moved below */}
                  {selectedComponent.specs && selectedComponent.specs !== 'No specifications available' && (
                    <div style={{ 
                      color: 'rgba(255, 255, 255, 0.8)', 
                      fontSize: '14px', 
                      lineHeight: '1.6' 
                    }}>
                      <strong>Thông số cơ bản:</strong> {selectedComponent.specs}
                    </div>
                  )}
                  
                  {/* Show message if no specs available */}
                  {!selectedComponent.specs || selectedComponent.specs === 'No specifications available' ? 
                    (!selectedComponent.socket && !selectedComponent.tdpWatt && !selectedComponent.capacity && 
                     !selectedComponent.size && !selectedComponent.color && !selectedComponent.type) && (
                      <div style={{ 
                        color: 'rgba(255, 255, 255, 0.5)', 
                        fontSize: '14px', 
                        fontStyle: 'italic' 
                      }}>
                        Không có thông số kỹ thuật chi tiết
                      </div>
                    ) : null
                  }
                </div>
              </div>
            </div>

            {/* Hiển thị giá từ nhiều suppliers */}
            {selectedComponent.productPrices && selectedComponent.productPrices.length > 0 ? (
              <div>
                <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0' }}>
                  Giá từ các nhà cung cấp
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedComponent.productPrices
                    .sort((a, b) => a.price - b.price)
                    .map((priceInfo, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: 'white', fontWeight: '500', fontSize: '16px' }}>
                            {priceInfo.supplier.name}
                          </div>
                          <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
                            ID: {priceInfo.supplier.id}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                          <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '16px' }}>
                            {priceInfo.price.toLocaleString('vi-VN')} VND
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {priceInfo.supplierLink && (
                              <a 
                                href={priceInfo.supplierLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{
                                  color: '#60a5fa',
                                  fontSize: '14px',
                                  textDecoration: 'none',
                                  padding: '4px 8px',
                                  border: '1px solid #60a5fa',
                                  borderRadius: '4px'
                                }}
                              >
                                Xem shop
                              </a>
                            )}
                            <button
                              onClick={() => {
                                // Lưu component với supplier được chọn
                                const componentWithSupplier = {
                                  ...selectedComponent,
                                  selectedSupplier: priceInfo,
                                  price: `${priceInfo.price.toLocaleString('vi-VN')} VND`
                                }
                                
                                // Cập nhật build components
                                setBuildComponents(prev => prev.map(buildComp => 
                                  buildComp.categoryId === componentWithSupplier.categoryId 
                                    ? { ...buildComp, component: componentWithSupplier }
                                    : buildComp
                                ))
                                
                                // Đóng popup và reset selection
                                handleComponentPopupClose()
                                setSelectedCategory(null)
                                setSearchQuery('')
                              }}
                              style={{
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#059669'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#10b981'
                              }}
                            >
                              Chọn
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.6)' }}>
                <div style={{ marginBottom: '20px' }}>
                  Không có thông tin giá từ nhà cung cấp
                </div>
                <button
                  onClick={() => {
                    // Lưu component không có supplier
                    const componentWithoutSupplier = {
                      ...selectedComponent,
                      price: 'Liên hệ'
                    }
                    
                    // Cập nhật build components
                    setBuildComponents(prev => prev.map(buildComp => 
                      buildComp.categoryId === componentWithoutSupplier.categoryId 
                        ? { ...buildComp, component: componentWithoutSupplier }
                        : buildComp
                    ))
                    
                    // Đóng popup và reset selection
                    handleComponentPopupClose()
                    setSelectedCategory(null)
                    setSearchQuery('')
                  }}
                  style={{
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#059669'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#10b981'
                  }}
                >
                  Chọn sản phẩm này
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ 
              marginTop: '24px', 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'flex-end' 
            }}>
              <button
                onClick={() => setSelectedComponent(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                }}
              >
                Hủy
              </button>
              {selectedComponent.productPrices && selectedComponent.productPrices.length > 0 && (
                <button
                  onClick={() => {
                    // Lưu component với giá min-max (không chọn supplier cụ thể)
                    const componentWithMinMaxPrice = {
                      ...selectedComponent
                    }
                    
                    // Cập nhật build components
                    setBuildComponents(prev => prev.map(buildComp => 
                      buildComp.categoryId === componentWithMinMaxPrice.categoryId 
                        ? { ...buildComp, component: componentWithMinMaxPrice }
                        : buildComp
                    ))
                    
                    // Đóng popup và reset selection
                    handleComponentPopupClose()
                    setSelectedCategory(null)
                    setSearchQuery('')
                  }}
                  style={{
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#2563eb'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#3b82f6'
                  }}
                >
                  Chọn sản phẩm này
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PC Specifications Summary Modal */}
      {showPCSummary && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            position: 'relative'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <div>
                <h2 style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                  📊 Thông số PC của bạn
                </h2>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', margin: 0 }}>
                  Tổng hợp chi tiết tất cả linh kiện đã chọn
                </p>
              </div>
              <button
                onClick={() => setShowPCSummary(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                ×
              </button>
            </div>

            {/* Summary Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '32px'
            }}>
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚡</div>
                <div style={{ color: '#10b981', fontSize: '24px', fontWeight: 'bold' }}>
                  {pcSpecsSummary.totalTDP}W
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
                  Tổng công suất
                </div>
              </div>

              <div style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>💾</div>
                <div style={{ color: '#3b82f6', fontSize: '24px', fontWeight: 'bold' }}>
                  {pcSpecsSummary.totalRAM}GB
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
                  Tổng RAM
                </div>
              </div>

              <div style={{
                background: 'rgba(168, 85, 247, 0.1)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>💿</div>
                <div style={{ color: '#a855f7', fontSize: '24px', fontWeight: 'bold' }}>
                  {pcSpecsSummary.totalStorage}GB
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
                  Tổng lưu trữ
                </div>
              </div>

              <div style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>💰</div>
                <div style={{ color: '#f59e0b', fontSize: '24px', fontWeight: 'bold' }}>
                  {totalPrice.toLocaleString('vi-VN')} VND
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
                  Tổng giá trị
                </div>
              </div>
            </div>

            {/* Component Details */}
            <div>
              <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                Chi tiết linh kiện
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pcSpecsSummary.components.map((comp, index) => (
                  <div key={index} style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '20px'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '12px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '8px'
                        }}>
                          <span style={{ fontSize: '20px' }}>
                            {buildCategories.find(cat => cat.name === comp.category)?.icon}
                          </span>
                          <span style={{ color: 'white', fontSize: '16px', fontWeight: '600' }}>
                            {comp.category}
                          </span>
                        </div>
                        <div style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                          {comp.name}
                        </div>
                        <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px' }}>
                          {comp.specs}
                        </div>
                      </div>
                    </div>

                    {/* Component-specific specs */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {comp.socket && (
                        <span style={{
                          background: 'rgba(59, 130, 246, 0.2)',
                          color: '#60a5fa',
                          fontSize: '12px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontWeight: '500'
                        }}>
                          Socket: {comp.socket}
                        </span>
                      )}
                      {comp.tdp && (
                        <span style={{
                          background: 'rgba(16, 185, 129, 0.2)',
                          color: '#10b981',
                          fontSize: '12px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontWeight: '500'
                        }}>
                          TDP: {comp.tdp}W
                        </span>
                      )}
                      {comp.capacity && (
                        <span style={{
                          background: 'rgba(168, 85, 247, 0.2)',
                          color: '#a855f7',
                          fontSize: '12px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontWeight: '500'
                        }}>
                          Dung lượng: {comp.capacity}
                        </span>
                      )}
                      {comp.size && (
                        <span style={{
                          background: 'rgba(239, 68, 68, 0.2)',
                          color: '#ef4444',
                          fontSize: '12px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontWeight: '500'
                        }}>
                          Kích thước: {comp.size}
                        </span>
                      )}
                      {comp.color && (
                        <span style={{
                          background: 'rgba(107, 114, 128, 0.2)',
                          color: '#9ca3af',
                          fontSize: '12px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontWeight: '500'
                        }}>
                          Màu: {comp.color === 'Black' ? 'Đen' : 
                                comp.color === 'White' ? 'Trắng' :
                                comp.color === 'Red' ? 'Đỏ' :
                                comp.color === 'Blue' ? 'Xanh dương' :
                                comp.color === 'Green' ? 'Xanh lá' :
                                comp.color === 'Silver' ? 'Bạc' :
                                comp.color === 'Gray' ? 'Xám' :
                                comp.color}
                        </span>
                      )}
                      {comp.type && (
                        <span style={{
                          background: 'rgba(245, 158, 11, 0.2)',
                          color: '#f59e0b',
                          fontSize: '12px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontWeight: '500'
                        }}>
                          Loại: {comp.type === 'Gaming' ? 'Gaming' :
                                comp.type === 'Office' ? 'Văn phòng' :
                                comp.type === 'Professional' ? 'Chuyên nghiệp' :
                                comp.type === 'Budget' ? 'Tiết kiệm' :
                                comp.type}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              marginTop: '32px',
              paddingTop: '24px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <button
                onClick={() => setShowPCSummary(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                }}
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  // TODO: Implement save/export functionality
                  alert('Tính năng lưu build sẽ được thêm sau!')
                }}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                💾 Lưu Build
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Build Completion Popup */}
      {showCompletionPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10001,
          padding: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
            borderRadius: '20px',
            padding: '40px',
            maxWidth: '500px',
            width: '100%',
            border: '2px solid rgba(16, 185, 129, 0.3)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
            textAlign: 'center',
            position: 'relative',
            animation: 'slideInScale 0.5s ease-out'
          }}>
            {/* Success Animation */}
            <div style={{
              fontSize: '80px',
              marginBottom: '20px',
              animation: 'bounce 1s ease-in-out'
            }}>
              🎉
            </div>
            
            <h2 style={{
              color: '#10b981',
              fontSize: '28px',
              fontWeight: 'bold',
              margin: '0 0 16px 0'
            }}>
              Build Hoàn Thành!
            </h2>
            
            <p style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: '18px',
              margin: '0 0 24px 0',
              lineHeight: '1.5'
            }}>
              Chúc mừng! Bạn đã chọn đủ <strong style={{ color: '#10b981' }}>6/6</strong> linh kiện bắt buộc.
            </p>
            
            {/* Build Summary */}
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <div style={{
                color: '#10b981',
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '8px'
              }}>
                💰 {totalPrice.toLocaleString('vi-VN')} VND
              </div>
              <div style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: '14px'
              }}>
                Tổng giá trị Build
              </div>
            </div>
            
            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => {
                  setShowCompletionPopup(false)
                  setRunTour(true)
                  setTourStepIndex(2)
                  setTourWaitingForCompletion(false)
                }}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                📋 Tiếp tục hướng dẫn
              </button>
              
              <button
                onClick={() => {
                  setShowCompletionPopup(false)
                  setTourWaitingForCompletion(false)
                  setRunTour(false)
                }}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.8)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'
                }}
              >
                Tự do khám phá
              </button>
            </div>
            
            {/* Auto close countdown */}
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              3
            </div>
          </div>
        </div>
      )}

      {/* Floating Guide Panel */}
      {(runTour || tourWaitingForCompletion) && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          width: '320px',
          background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '16px',
          padding: '20px',
          zIndex: 9999,
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(10px)'
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <span style={{ fontSize: '24px' }}>
              {tourWaitingForCompletion ? '⏳' : '🎯'}
            </span>
            <div>
              <h3 style={{
                color: '#3b82f6',
                fontSize: '16px',
                fontWeight: '600',
                margin: 0
              }}>
                {tourWaitingForCompletion ? 'Đang chờ hoàn thành...' : 'Hướng dẫn tương tác'}
              </h3>
              <p style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: '12px',
                margin: 0
              }}>
                {tourWaitingForCompletion ? 'Chọn đủ 6 linh kiện để tiếp tục' : 'Đang hướng dẫn từng bước'}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <span style={{
                color: '#10b981',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                Tiến độ Build
              </span>
              <span style={{
                color: 'white',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {selectedComponentsCount}/6
              </span>
            </div>
            
            {/* Progress Bar */}
            <div style={{
              width: '100%',
              height: '8px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '4px',
              overflow: 'hidden',
              marginBottom: '12px'
            }}>
              <div style={{
                width: `${(selectedComponentsCount / 6) * 100}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #10b981, #059669)',
                transition: 'width 0.5s ease',
                borderRadius: '4px'
              }} />
            </div>

            {/* Component Status */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px'
            }}>
              {buildCategories.filter(cat => cat.required).map(category => {
                const buildComp = buildComponents.find(bc => bc.categoryId === category.id)
                const hasComponent = !!buildComp?.component
                return (
                  <div key={category.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 8px',
                    background: hasComponent ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)',
                    borderRadius: '6px',
                    border: hasComponent ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <span style={{ fontSize: '14px' }}>{category.icon}</span>
                    <span style={{
                      color: hasComponent ? '#10b981' : 'rgba(255,255,255,0.6)',
                      fontSize: '12px',
                      fontWeight: hasComponent ? '600' : '400'
                    }}>
                      {category.name}
                    </span>
                    {hasComponent && (
                      <span style={{
                        color: '#10b981',
                        fontSize: '10px'
                      }}>✓</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Current Step Info */}
          {runTour && !tourWaitingForCompletion && (
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '12px',
              padding: '12px',
              marginBottom: '16px'
            }}>
              <div style={{
                color: '#3b82f6',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '6px'
              }}>
                Bước hiện tại: {tourStepIndex + 1}/{tourMode === 'guided' ? buildCompleteTourSteps.length : interactiveTourSteps.length}
              </div>
              <div style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: '12px',
                lineHeight: '1.4'
              }}>
                {tourMode === 'interactive' ? (
                  <>
                    {tourStepIndex === 0 && 'Chọn loại linh kiện CPU'}
                    {tourStepIndex === 1 && 'Chọn sản phẩm CPU cụ thể'}
                    {tourStepIndex === 2 && 'Theo dõi Build của bạn'}
                  </>
                ) : (
                  <>
                    {tourStepIndex === 0 && 'Build của bạn đã hoàn thành!'}
                    {tourStepIndex === 1 && 'Xem thông số PC hoàn chỉnh'}
                    {tourStepIndex === 2 && 'Hoàn thành hướng dẫn!'}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {tourWaitingForCompletion ? (
              <>
                <button
                  onClick={() => {
                    setRunTour(true)
                    setTourStepIndex(2)
                    setTourWaitingForCompletion(false)
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    border: 'none',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  📋 Xem hướng dẫn Build
                </button>
                <button
                  onClick={() => {
                    setTourWaitingForCompletion(false)
                    setRunTour(false)
                    setTourMode('guided')
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Tắt hướng dẫn
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setRunTour(false)
                  setTourWaitingForCompletion(false)
                  setTourMode('guided')
                }}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.8)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Tắt hướng dẫn
              </button>
            )}
          </div>
        </div>
      )}

      {/* Joyride Tour Component */}
      <Joyride
        steps={getCurrentTourSteps()}
        run={runTour && !tourPaused && !tourWaitingForCompletion}
        stepIndex={tourStepIndex}
        continuous={true}
        showProgress={true}
        showSkipButton={true}
        callback={handleJoyrideCallback}
        disableOverlayClose={tourMode === 'interactive' && !tourPaused}
        disableScrolling={false}
        scrollOffset={100}
        styles={{
          options: {
            primaryColor: '#3b82f6',
            backgroundColor: '#1f2937',
            textColor: '#ffffff',
            arrowColor: '#1f2937',
            overlayColor: 'rgba(0, 0, 0, 0.8)',
            spotlightShadow: '0 0 15px rgba(59, 130, 246, 0.5)',
            width: 400,
            zIndex: 10000,
          },
          tooltip: {
            borderRadius: 12,
            fontSize: 16,
            padding: 20,
          },
          tooltipContainer: {
            textAlign: 'left',
          },
          tooltipTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: '#3b82f6',
            marginBottom: 12,
          },
          tooltipContent: {
            fontSize: 14,
            lineHeight: 1.6,
            color: '#ffffff',
          },
          tooltipFooter: {
            marginTop: 20,
            paddingTop: 16,
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          },
          buttonNext: {
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            fontSize: 14,
            fontWeight: '600',
            padding: '10px 20px',
            borderRadius: 8,
            border: 'none',
          },
          buttonBack: {
            marginRight: 10,
            color: '#9ca3af',
            fontSize: 14,
          },
          buttonSkip: {
            color: '#9ca3af',
            fontSize: 14,
          },
          buttonClose: {
            display: 'none',
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
          },
          spotlight: {
            borderRadius: 12,
          },
          beacon: {
            accentColor: '#3b82f6',
          },
        }}
        locale={{
          back: 'Quay lại',
          close: 'Đóng',
          last: 'Hoàn thành',
          next: 'Tiếp theo',
          skip: 'Bỏ qua',
        }}
      />
    </div>
  )
}

export default PCBuilderPage
