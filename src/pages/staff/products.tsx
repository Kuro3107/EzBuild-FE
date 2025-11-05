import { useEffect, useState, useMemo } from 'react'
import { ApiService } from '../../services/api'
import '../../Homepage.css'

interface Product {
  id: number
  name: string
  brand: string
  model: string
  specs: string
  category_id: number
  imageUrl1: string
  imageUrl2?: string
  imageUrl3?: string
  imageUrl4?: string
  createdAt?: string
  category?: { id: number; name: string }
}

interface Category {
  id: number
  name: string
}

function StaffProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [filterCategory, setFilterCategory] = useState<number>(0) // 0 = all
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    specs: '',
    category_id: 0,
    imageUrl1: '',
    imageUrl2: '',
    imageUrl3: '',
    imageUrl4: ''
  })

  // Load tất cả products một lần - giống như trang builder
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Load categories và products cùng lúc
        // Fetch trực tiếp như builder để có category được populate
        const categoriesData = await ApiService.getCategories()
        
        // Fetch trực tiếp như builder - có thể API trả về category khi fetch trực tiếp
        const response = await fetch(`${import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8080'}/api/product`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const productsData = await response.json()
        
        setCategories(categoriesData as unknown as Category[])
        
        console.log('📦 Loaded products:', productsData.length)
        
        // Normalize products - đơn giản, lấy category_id nếu có
        const normalizedProducts: Product[] = productsData.map((item: Record<string, unknown>) => {
          // Lấy category_id từ category.id hoặc category_id trực tiếp
          const categoryId = (item.category as { id?: number })?.id 
            ?? (item.category_id as number)
            ?? (item.categoryId as number)
            ?? 0
          
          // Tạo product object
          const product: Product = {
            id: Number(item.id) || 0,
            name: String(item.name || ''),
            brand: String(item.brand || ''),
            model: String(item.model || ''),
            specs: String(item.specs || ''),
            category_id: Number(categoryId) || 0,
            imageUrl1: String(item.imageUrl1 || item.image_url1 || ''),
            imageUrl2: item.imageUrl2 || item.image_url2 ? String(item.imageUrl2 || item.image_url2) : undefined,
            imageUrl3: item.imageUrl3 || item.image_url3 ? String(item.imageUrl3 || item.image_url3) : undefined,
            imageUrl4: item.imageUrl4 || item.image_url4 ? String(item.imageUrl4 || item.image_url4) : undefined,
            createdAt: item.createdAt ? String(item.createdAt) : undefined,
            category: item.category && typeof item.category === 'object' && 'id' in item.category && 'name' in item.category
              ? { id: Number((item.category as { id?: unknown }).id) || 0, name: String((item.category as { name?: unknown }).name) || '' }
              : undefined
          }
          
          return product
        })
        
        console.log('✅ Normalized products:', normalizedProducts.length)
        
        setProducts(normalizedProducts)
      } catch (err) {
        setError('Không thể tải dữ liệu')
        console.error('Error loading data:', err)
      } finally {
        setLoading(false)
      }
    }
    
    loadAllData()
  }, [])

  // Debounce search term để tối ưu performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [searchTerm])

  const loadData = async () => {
    // Reload tất cả data - giống như khi component mount
    // Sử dụng cùng logic với loadAllData
    try {
      setLoading(true)
      setError(null)
      
      const categoriesData = await ApiService.getCategories()
      
      // Fetch trực tiếp như builder
      const response = await fetch(`${import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8080'}/api/product`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const productsData = await response.json()
      
      setCategories(categoriesData as unknown as Category[])
      
      // Normalize products - đơn giản
      const normalizedProducts: Product[] = productsData.map((item: Record<string, unknown>) => {
        const categoryId = (item.category as { id?: number })?.id 
          ?? (item.category_id as number)
          ?? (item.categoryId as number)
          ?? 0
        
        const product: Product = {
          id: Number(item.id) || 0,
          name: String(item.name || ''),
          brand: String(item.brand || ''),
          model: String(item.model || ''),
          specs: String(item.specs || ''),
          category_id: Number(categoryId) || 0,
          imageUrl1: String(item.imageUrl1 || item.image_url1 || ''),
          imageUrl2: item.imageUrl2 || item.image_url2 ? String(item.imageUrl2 || item.image_url2) : undefined,
          imageUrl3: item.imageUrl3 || item.image_url3 ? String(item.imageUrl3 || item.image_url3) : undefined,
          imageUrl4: item.imageUrl4 || item.image_url4 ? String(item.imageUrl4 || item.image_url4) : undefined,
          createdAt: item.createdAt ? String(item.createdAt) : undefined,
          category: item.category && typeof item.category === 'object' && 'id' in item.category && 'name' in item.category
            ? { id: Number((item.category as { id?: unknown }).id) || 0, name: String((item.category as { name?: unknown }).name) || '' }
            : undefined
        }
        
        return product
      })
      
      setProducts(normalizedProducts)
    } catch (err) {
      setError('Không thể tải dữ liệu')
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = async () => {
    try {
      const payload = {
        name: formData.name,
        brand: formData.brand,
        model: formData.model,
        specs: formData.specs,
        category_id: Number(formData.category_id) || 0,
        imageUrl1: formData.imageUrl1,
        imageUrl2: formData.imageUrl2,
        imageUrl3: formData.imageUrl3,
        imageUrl4: formData.imageUrl4
      }
      await ApiService.createProduct(payload)
      alert('Đã thêm sản phẩm thành công!')
      setIsAddModalOpen(false)
      resetForm()
      loadData()
    } catch (err) {
      console.error('Error adding product:', err)
      alert('Có lỗi khi thêm sản phẩm')
    }
  }

  const handleEditProduct = async () => {
    if (!selectedProduct) return
    
    try {
      const payload = {
        name: formData.name,
        brand: formData.brand,
        model: formData.model,
        specs: formData.specs,
        category_id: Number(formData.category_id) || 0,
        imageUrl1: formData.imageUrl1,
        imageUrl2: formData.imageUrl2,
        imageUrl3: formData.imageUrl3,
        imageUrl4: formData.imageUrl4
      }
      await ApiService.updateProduct(selectedProduct.id, payload)
      alert('Đã cập nhật sản phẩm thành công!')
      setIsEditModalOpen(false)
      setSelectedProduct(null)
      resetForm()
      loadData()
    } catch (err) {
      console.error('Error updating product:', err)
      alert('Có lỗi khi cập nhật sản phẩm')
    }
  }

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return
    
    try {
      await ApiService.deleteProduct(selectedProduct.id)
      alert('Đã xóa sản phẩm thành công!')
      setIsDeleteModalOpen(false)
      setSelectedProduct(null)
      loadData()
    } catch (err) {
      console.error('Error deleting product:', err)
      alert('Có lỗi khi xóa sản phẩm')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      model: '',
      specs: '',
      category_id: 0,
      imageUrl1: '',
      imageUrl2: '',
      imageUrl3: '',
      imageUrl4: ''
    })
  }

  const openEditModal = (product: Product) => {
    setSelectedProduct(product)
    // category_id đã được normalize khi load, nên dùng trực tiếp
    const resolvedCategoryId = product.category_id || 0
    setFormData({
      name: product.name,
      brand: product.brand,
      model: product.model,
      specs: product.specs,
      category_id: resolvedCategoryId,
      imageUrl1: product.imageUrl1,
      imageUrl2: product.imageUrl2 || '',
      imageUrl3: product.imageUrl3 || '',
      imageUrl4: product.imageUrl4 || ''
    })
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product)
    setIsDeleteModalOpen(true)
  }

  // Filter products - giống như trang builder: filter ở frontend theo category và search
  const filteredProducts = useMemo(() => {
    if (!products.length) {
      return []
    }

    let filtered = products

    // Filter theo category
    if (filterCategory !== 0) {
      filtered = filtered.filter(p => p.category_id === filterCategory)
    }

    // Filter theo search term
    if (debouncedSearchTerm.trim()) {
      const query = debouncedSearchTerm.trim().toLowerCase()
      filtered = filtered.filter(p => 
        String(p.name || '').toLowerCase().includes(query) ||
        String(p.brand || '').toLowerCase().includes(query) ||
        String(p.model || '').toLowerCase().includes(query)
      )
    }

    return filtered
  }, [products, filterCategory, debouncedSearchTerm])

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId)
    return category?.name || 'Unknown'
  }

  if (loading) {
    return (
      <div className="page bg-grid bg-radial">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page bg-grid bg-radial">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={loadData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page bg-grid bg-radial">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý sản phẩm</h1>
        <p className="text-gray-600">Thêm, sửa, xóa sản phẩm trong hệ thống</p>
      </div>

      {/* Stats */}
      <div className="mb-4 flex gap-4">
        <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600">Tổng sản phẩm</div>
          <div className="text-2xl font-bold text-gray-900">{products.length}</div>
        </div>
        <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600">Đang hiển thị</div>
          <div className="text-2xl font-bold text-blue-600">{filteredProducts.length}</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
          >
            <option value={0}>Tất cả danh mục</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-2 bg-green-100 text-green-700 font-medium rounded-lg hover:bg-green-200 transition-colors flex items-center gap-2 shadow-md border border-green-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Thêm sản phẩm</span>
          </button>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-100 text-blue-700 font-medium rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2 shadow-md border border-blue-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-black/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hình ảnh
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên sản phẩm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thương hiệu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Danh mục
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-lg font-medium">Không tìm thấy sản phẩm nào</p>
                      <p className="text-sm mt-2">
                        {searchTerm || filterCategory !== 0 
                          ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm' 
                          : 'Chưa có sản phẩm nào trong hệ thống'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{product.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={product.imageUrl1}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100x100?text=No+Image'
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-gray-500">{product.model}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.brand}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getCategoryName(product.category_id || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-medium border border-blue-300"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => openDeleteModal(product)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium border border-red-300"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>


      {/* Add Product Modal */}
      {isAddModalOpen && (
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
          zIndex: 10000,
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
              <h2 style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Thêm sản phẩm mới</h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false)
                  resetForm()
                }}
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
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Tên sản phẩm *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#374151',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                  required
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Thương hiệu *</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: '#374151',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '14px'
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Model *</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: '#374151',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '14px'
                    }}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Danh mục *</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#374151',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                  required
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id} style={{ backgroundColor: '#374151' }}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Thông số kỹ thuật *</label>
                <textarea
                  value={formData.specs}
                  onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#374151',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    minHeight: '80px'
                  }}
                  rows={3}
                  required
                />
              </div>
              
              <div>
                <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Hình ảnh 1 (URL) *</label>
                <input
                  type="text"
                  value={formData.imageUrl1}
                  onChange={(e) => setFormData({ ...formData, imageUrl1: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#374151',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                  placeholder="https://..."
                  required
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Hình ảnh 2 (URL)</label>
                  <input
                    type="text"
                    value={formData.imageUrl2}
                    onChange={(e) => setFormData({ ...formData, imageUrl2: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: '#374151',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '14px'
                    }}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Hình ảnh 3 (URL)</label>
                  <input
                    type="text"
                    value={formData.imageUrl3}
                    onChange={(e) => setFormData({ ...formData, imageUrl3: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: '#374151',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '14px'
                    }}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Hình ảnh 4 (URL)</label>
                  <input
                    type="text"
                    value={formData.imageUrl4}
                    onChange={(e) => setFormData({ ...formData, imageUrl4: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: '#374151',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '14px'
                    }}
                    placeholder="https://..."
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button
                  onClick={() => {
                    setIsAddModalOpen(false)
                    resetForm()
                  }}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#374151',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#374151'}
                >
                  Hủy
                </button>
                <button
                  onClick={handleAddProduct}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#10b981',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                >
                  Thêm sản phẩm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditModalOpen && selectedProduct && (
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
          zIndex: 10000,
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
              <h2 style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Sửa sản phẩm #{selectedProduct.id}</h2>
              <button
                onClick={() => {
                  setIsEditModalOpen(false)
                  setSelectedProduct(null)
                  resetForm()
                }}
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
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Tên sản phẩm *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#374151',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                  required
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Thương hiệu *</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: '#374151',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '14px'
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Model *</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: '#374151',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '14px'
                    }}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Danh mục *</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#374151',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                  required
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id} style={{ backgroundColor: '#374151' }}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Thông số kỹ thuật *</label>
                <textarea
                  value={formData.specs}
                  onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#374151',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    minHeight: '80px'
                  }}
                  rows={3}
                  required
                />
              </div>
              
              <div>
                <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Hình ảnh 1 (URL) *</label>
                <input
                  type="text"
                  value={formData.imageUrl1}
                  onChange={(e) => setFormData({ ...formData, imageUrl1: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#374151',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                  placeholder="https://..."
                  required
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Hình ảnh 2 (URL)</label>
                  <input
                    type="text"
                    value={formData.imageUrl2}
                    onChange={(e) => setFormData({ ...formData, imageUrl2: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: '#374151',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '14px'
                    }}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Hình ảnh 3 (URL)</label>
                  <input
                    type="text"
                    value={formData.imageUrl3}
                    onChange={(e) => setFormData({ ...formData, imageUrl3: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: '#374151',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '14px'
                    }}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Hình ảnh 4 (URL)</label>
                  <input
                    type="text"
                    value={formData.imageUrl4}
                    onChange={(e) => setFormData({ ...formData, imageUrl4: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: '#374151',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '14px'
                    }}
                    placeholder="https://..."
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false)
                    setSelectedProduct(null)
                    resetForm()
                  }}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#374151',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#374151'}
                >
                  Hủy
                </button>
                <button
                  onClick={handleEditProduct}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#3b82f6',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                >
                  Cập nhật
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedProduct && (
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
          zIndex: 10000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#1f2937',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            maxWidth: '400px',
            width: '100%',
            padding: '24px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '24px'
            }}>
              <h2 style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Xác nhận xóa</h2>
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setSelectedProduct(null)
                }}
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
            
            <p style={{ color: 'white', marginBottom: '24px', fontSize: '14px' }}>
              Bạn có chắc chắn muốn xóa sản phẩm <strong style={{ fontWeight: '600' }}>{selectedProduct.name}</strong> không?
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setSelectedProduct(null)
                }}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#374151',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#374151'}
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteProduct}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#ef4444',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StaffProductsPage

