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
  const [filterCategory, setFilterCategory] = useState<number>(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

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

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const categoriesData = await ApiService.getCategories()
        
        const response = await fetch(`${import.meta.env?.VITE_API_BASE_URL || 'https://exe201-ezbuildvn-be.onrender.com'}/api/product`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const productsData = await response.json()
        
        setCategories(categoriesData as unknown as Category[])
        
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
    
    loadAllData()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [searchTerm])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const categoriesData = await ApiService.getCategories()
      
      const response = await fetch(`${import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8080'}/api/product`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const productsData = await response.json()
      
      setCategories(categoriesData as unknown as Category[])
      
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

  const filteredProducts = useMemo(() => {
    if (!products.length) {
      return []
    }

    let filtered = products

    if (filterCategory !== 0) {
      filtered = filtered.filter(p => p.category_id === filterCategory)
    }

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
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-white text-lg">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page bg-grid bg-radial">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <p className="text-red-300 mb-6 text-xl">{error}</p>
            <button 
              onClick={loadData}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page bg-grid bg-radial p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Quản lý sản phẩm
                </span>
              </h1>
              <p className="text-gray-300 text-lg">Thêm, sửa, xóa sản phẩm trong hệ thống</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Thêm sản phẩm
              </button>
              <button
                onClick={loadData}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Làm mới
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all shadow-lg hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm mb-2">Tổng sản phẩm</p>
                <p className="text-3xl font-bold text-white">{products.length}</p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl shadow-lg">
                📦
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all shadow-lg hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm mb-2">Đang hiển thị</p>
                <p className="text-3xl font-bold text-blue-400">{filteredProducts.length}</p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-2xl shadow-lg">
                👁️
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm theo tên, thương hiệu, model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(Number(e.target.value))}
                className="px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value={0} className="bg-gray-800">Tất cả danh mục</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id} className="bg-gray-800">
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Hình ảnh
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Tên sản phẩm
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Thương hiệu
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Danh mục
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-400">
                        <svg className="mx-auto h-16 w-16 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <tr key={product.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-white font-semibold">#{product.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={product.imageUrl1}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg border border-white/10"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100x100?text=No+Image'
                          }}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white font-medium">{product.name}</div>
                        <div className="text-gray-400 text-sm">{product.model}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">
                        {product.brand}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 bg-white/5 rounded-lg text-white text-sm border border-white/10">
                          {getCategoryName(product.category_id || 0)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(product)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all text-sm font-medium shadow-md"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => openDeleteModal(product)}
                            className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg hover:from-red-600 hover:to-rose-600 transition-all text-sm font-medium shadow-md"
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
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Thêm sản phẩm mới</h2>
                <button
                  onClick={() => {
                    setIsAddModalOpen(false)
                    resetForm()
                  }}
                  className="text-gray-400 hover:text-white text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Tên sản phẩm *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Thương hiệu *</label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Model *</label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Danh mục *</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value={0} className="bg-gray-800">Chọn danh mục</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id} className="bg-gray-800">
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Thông số kỹ thuật *</label>
                  <textarea
                    value={formData.specs}
                    onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={3}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Hình ảnh 1 (URL) *</label>
                  <input
                    type="text"
                    value={formData.imageUrl1}
                    onChange={(e) => setFormData({ ...formData, imageUrl1: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://..."
                    required
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Hình ảnh 2 (URL)</label>
                    <input
                      type="text"
                      value={formData.imageUrl2}
                      onChange={(e) => setFormData({ ...formData, imageUrl2: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Hình ảnh 3 (URL)</label>
                    <input
                      type="text"
                      value={formData.imageUrl3}
                      onChange={(e) => setFormData({ ...formData, imageUrl3: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Hình ảnh 4 (URL)</label>
                    <input
                      type="text"
                      value={formData.imageUrl4}
                      onChange={(e) => setFormData({ ...formData, imageUrl4: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="https://..."
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => {
                      setIsAddModalOpen(false)
                      resetForm()
                    }}
                    className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleAddProduct}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all font-medium shadow-lg"
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
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Sửa sản phẩm #{selectedProduct.id}</h2>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false)
                    setSelectedProduct(null)
                    resetForm()
                  }}
                  className="text-gray-400 hover:text-white text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Tên sản phẩm *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Thương hiệu *</label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Model *</label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Danh mục *</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id} className="bg-gray-800">
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Thông số kỹ thuật *</label>
                  <textarea
                    value={formData.specs}
                    onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={3}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Hình ảnh 1 (URL) *</label>
                  <input
                    type="text"
                    value={formData.imageUrl1}
                    onChange={(e) => setFormData({ ...formData, imageUrl1: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://..."
                    required
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Hình ảnh 2 (URL)</label>
                    <input
                      type="text"
                      value={formData.imageUrl2}
                      onChange={(e) => setFormData({ ...formData, imageUrl2: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Hình ảnh 3 (URL)</label>
                    <input
                      type="text"
                      value={formData.imageUrl3}
                      onChange={(e) => setFormData({ ...formData, imageUrl3: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Hình ảnh 4 (URL)</label>
                    <input
                      type="text"
                      value={formData.imageUrl4}
                      onChange={(e) => setFormData({ ...formData, imageUrl4: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="https://..."
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => {
                      setIsEditModalOpen(false)
                      setSelectedProduct(null)
                      resetForm()
                    }}
                    className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleEditProduct}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all font-medium shadow-lg"
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
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-md w-full border border-white/20 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Xác nhận xóa</h2>
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false)
                    setSelectedProduct(null)
                  }}
                  className="text-gray-400 hover:text-white text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all"
                >
                  ×
                </button>
              </div>
              
              <p className="text-white mb-6">
                Bạn có chắc chắn muốn xóa sản phẩm <strong className="font-semibold">{selectedProduct.name}</strong> không?
              </p>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false)
                    setSelectedProduct(null)
                  }}
                  className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all font-medium"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDeleteProduct}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl hover:from-red-600 hover:to-rose-600 transition-all font-medium shadow-lg"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StaffProductsPage
