import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ApiService } from '../../services/api'
import '../../Homepage.css'

interface AIConfig {
  id: string | number
  name: string
  description?: string
  apiKey?: string
  model?: string
  enabled?: boolean
  settings?: string
  createdAt?: string
}

function AdminAIPage() {
  const [configs, setConfigs] = useState<AIConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedConfig, setSelectedConfig] = useState<AIConfig | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    apiKey: '',
    model: '',
    enabled: true,
    settings: '{}'
  })

  useEffect(() => {
    loadData()
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
      const configsData = await ApiService.getAllAIConfigs()
      
      // Kiểm tra nếu có dữ liệu hoặc không có lỗi
      setConfigs(configsData.map(c => c as unknown as AIConfig))
      
      // Chỉ hiển thị warning trong console, không block UI
      if (configsData.length === 0) {
        console.warn('⚠️ Chưa có dữ liệu AI configs. Có thể do backend chưa implement endpoint GET /api/ai-config')
      }
    } catch (err) {
      setError('Không thể tải dữ liệu AI configs. Vui lòng kiểm tra backend API endpoint.')
      console.error('Error loading AI configs:', err)
      setConfigs([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddConfig = async () => {
    try {
      await ApiService.createAIConfig(formData)
      alert('Đã thêm AI config thành công!')
      setIsAddModalOpen(false)
      resetForm()
      loadData()
    } catch (err) {
      console.error('Error adding AI config:', err)
      alert('Có lỗi khi thêm AI config')
    }
  }

  const handleEditConfig = async () => {
    if (!selectedConfig) return
    
    try {
      await ApiService.updateAIConfig(String(selectedConfig.id), formData)
      alert('Đã cập nhật AI config thành công!')
      setIsEditModalOpen(false)
      setSelectedConfig(null)
      resetForm()
      loadData()
    } catch (err) {
      console.error('Error updating AI config:', err)
      alert('Có lỗi khi cập nhật AI config')
    }
  }

  const handleDeleteConfig = async () => {
    if (!selectedConfig) return
    
    try {
      await ApiService.deleteAIConfig(String(selectedConfig.id))
      alert('Đã xóa AI config thành công!')
      setIsDeleteModalOpen(false)
      setSelectedConfig(null)
      loadData()
    } catch (err) {
      console.error('Error deleting AI config:', err)
      alert('Có lỗi khi xóa AI config')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      apiKey: '',
      model: '',
      enabled: true,
      settings: '{}'
    })
  }

  const openEditModal = (config: AIConfig) => {
    setSelectedConfig(config)
    setFormData({
      name: config.name || '',
      description: config.description || '',
      apiKey: config.apiKey || '',
      model: config.model || '',
      enabled: config.enabled !== undefined ? config.enabled : true,
      settings: typeof config.settings === 'string' ? config.settings : JSON.stringify(config.settings || {})
    })
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (config: AIConfig) => {
    setSelectedConfig(config)
    setIsDeleteModalOpen(true)
  }

  const filteredConfigs = useMemo(() => {
    return configs.filter(config => {
      return !debouncedSearchTerm.trim() || 
        config.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        (config.description && config.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ||
        (config.model && config.model.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
    })
  }, [configs, debouncedSearchTerm])

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

  if (error && configs.length === 0) {
    return (
      <div className="page bg-grid bg-radial">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Management</h1>
            <p className="text-gray-600">Quản lý AI, machine learning và tự động hóa hệ thống</p>
          </div>
          <Link to="/admin" className="text-blue-600 hover:underline">← Quay lại Admin</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-4 flex gap-4">
        <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600">Tổng Configs</div>
          <div className="text-2xl font-bold text-gray-900">{configs.length}</div>
        </div>
        <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600">Đang hiển thị</div>
          <div className="text-2xl font-bold text-blue-600">{filteredConfigs.length}</div>
        </div>
        <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600">Đang kích hoạt</div>
          <div className="text-2xl font-bold text-green-600">{configs.filter(c => c.enabled).length}</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Tìm kiếm AI config..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-2 bg-green-100 text-green-700 font-medium rounded-lg hover:bg-green-200 transition-colors flex items-center gap-2 shadow-md border border-green-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Thêm Config</span>
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

      {/* Configs Table */}
      <div className="bg-white rounded-lg border border-black/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredConfigs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <p className="text-lg font-medium mb-2">
                        {configs.length === 0 ? 'Chưa có dữ liệu AI config' : 'Không tìm thấy AI config nào'}
                      </p>
                      {configs.length === 0 && (
                        <p className="text-sm text-orange-600 mt-2">
                          ⚠️ Backend cần implement endpoint: <code className="bg-gray-100 px-2 py-1 rounded">GET /api/ai-config</code>
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredConfigs.map((config) => (
                  <tr key={config.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{config.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{config.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{config.description || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{config.model || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        config.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {config.enabled ? 'Đang kích hoạt' : 'Tắt'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(config)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => openDeleteModal(config)}
                          className="text-red-600 hover:text-red-900"
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

      {/* Add Config Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Thêm AI Config mới</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                  <input
                    type="text"
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="gpt-4, gemini-pro, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Kích hoạt</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Settings (JSON)</label>
                <textarea
                  value={formData.settings}
                  onChange={(e) => setFormData({ ...formData, settings: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  rows={5}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setIsAddModalOpen(false)
                  resetForm()
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleAddConfig}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Thêm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Config Modal */}
      {isEditModalOpen && selectedConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Sửa AI Config</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                  <input
                    type="text"
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Kích hoạt</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Settings (JSON)</label>
                <textarea
                  value={formData.settings}
                  onChange={(e) => setFormData({ ...formData, settings: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  rows={5}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setIsEditModalOpen(false)
                  setSelectedConfig(null)
                  resetForm()
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleEditConfig}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Config Modal */}
      {isDeleteModalOpen && selectedConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-red-600">Xác nhận xóa</h2>
            <p className="mb-4">
              Bạn có chắc chắn muốn xóa AI config <strong>{selectedConfig.name}</strong> không?
            </p>
            <p className="text-sm text-gray-600 mb-6">Hành động này không thể hoàn tác.</p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setSelectedConfig(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteConfig}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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

export default AdminAIPage

