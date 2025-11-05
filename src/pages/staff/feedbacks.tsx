import { useEffect, useState } from 'react'
import { ApiService } from '../../services/api'
import '../../Homepage.css'

interface OrderFeedback {
  id: number
  orderId: number
  rating: number
  comment: string
  createdAt: string
  user?: { id: number; email: string; fullname: string }
}

interface ServiceFeedback {
  id: number
  serviceId: number
  rating: number
  comment: string
  createdAt: string
  user?: { id: number; email: string; fullname: string }
}

function StaffFeedbacksPage() {
  const [orderFeedbacks, setOrderFeedbacks] = useState<OrderFeedback[]>([])
  const [serviceFeedbacks, setServiceFeedbacks] = useState<ServiceFeedback[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'orders' | 'services'>('orders')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState<{ id: number; type: 'order' | 'service'; name: string } | null>(null)
  const [editingFeedback, setEditingFeedback] = useState<OrderFeedback | ServiceFeedback | null>(null)
  const [formData, setFormData] = useState({
    orderId: 0,
    serviceId: 0,
    rating: 5,
    comment: '',
    createdAt: new Date().toISOString().split('T')[0] // Format: YYYY-MM-DD
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [orderData, serviceData] = await Promise.all([
        ApiService.getAllOrderFeedbacks(),
        ApiService.getAllServiceFeedbacks()
      ])
      
      // Normalize order feedbacks - lấy comment và createdAt từ nhiều nguồn
      const normalizedOrderFeedbacks: OrderFeedback[] = orderData.map((f: Record<string, unknown>) => {
        const comment = (f.comment as string) 
          ?? (f.comment_text as string)
          ?? (f.commentText as string)
          ?? ''
        
        const createdAt = (f.createdAt as string)
          ?? (f.created_at as string)
          ?? (f.createdAtDate as string)
          ?? new Date().toISOString()
        
        return {
          id: Number(f.id) || 0,
          orderId: Number(f.orderId ?? f.order_id ?? f.orderIdNumber) || 0,
          rating: Number(f.rating) || 0,
          comment: String(comment),
          createdAt: String(createdAt),
          user: f.user && typeof f.user === 'object' ? {
            id: Number((f.user as { id?: unknown }).id) || 0,
            email: String((f.user as { email?: unknown }).email || ''),
            fullname: String((f.user as { fullname?: unknown }).fullname || '')
          } : undefined
        } as OrderFeedback
      })
      
      // Normalize service feedbacks - lấy comment và createdAt từ nhiều nguồn
      const normalizedServiceFeedbacks: ServiceFeedback[] = serviceData.map((f: Record<string, unknown>) => {
        const comment = (f.comment as string) 
          ?? (f.comment_text as string)
          ?? (f.commentText as string)
          ?? ''
        
        const createdAt = (f.createdAt as string)
          ?? (f.created_at as string)
          ?? (f.createdAtDate as string)
          ?? new Date().toISOString()
        
        return {
          id: Number(f.id) || 0,
          serviceId: Number(f.serviceId ?? f.service_id ?? f.serviceIdNumber) || 0,
          rating: Number(f.rating) || 0,
          comment: String(comment),
          createdAt: String(createdAt),
          user: f.user && typeof f.user === 'object' ? {
            id: Number((f.user as { id?: unknown }).id) || 0,
            email: String((f.user as { email?: unknown }).email || ''),
            fullname: String((f.user as { fullname?: unknown }).fullname || '')
          } : undefined
        } as ServiceFeedback
      })
      
      setOrderFeedbacks(normalizedOrderFeedbacks)
      setServiceFeedbacks(normalizedServiceFeedbacks)
    } catch (err) {
      setError('Không thể tải dữ liệu')
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteOrderFeedback = (id: number) => {
    setSelectedFeedback({ id, type: 'order', name: `Order Feedback #${id}` })
    setIsDeleteModalOpen(true)
  }

  const handleDeleteServiceFeedback = (id: number) => {
    setSelectedFeedback({ id, type: 'service', name: `Service Feedback #${id}` })
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedFeedback) return
    try {
      if (selectedFeedback.type === 'order') {
        await ApiService.deleteOrderFeedback(selectedFeedback.id)
      } else {
        await ApiService.deleteServiceFeedback(selectedFeedback.id)
      }
      alert('Đã xóa feedback thành công!')
      setIsDeleteModalOpen(false)
      setSelectedFeedback(null)
      loadData()
    } catch (err) {
      console.error('Error deleting feedback:', err)
      alert('Có lỗi khi xóa feedback')
    }
  }

  const handleAddFeedback = async () => {
    try {
      if (activeTab === 'orders') {
        await ApiService.createOrderFeedback({
          orderId: formData.orderId,
          rating: formData.rating,
          comment: formData.comment,
          createdAt: formData.createdAt ? new Date(formData.createdAt).toISOString() : undefined
        })
      } else {
        await ApiService.createServiceFeedback({
          serviceId: formData.serviceId,
          rating: formData.rating,
          comment: formData.comment,
          createdAt: formData.createdAt ? new Date(formData.createdAt).toISOString() : undefined
        })
      }
      alert('Đã thêm feedback thành công!')
      setIsAddModalOpen(false)
      resetForm()
      loadData()
    } catch (err) {
      console.error('Error adding feedback:', err)
      alert('Có lỗi khi thêm feedback')
    }
  }

  const handleEditFeedback = async () => {
    if (!editingFeedback) return
    
    try {
      if (activeTab === 'orders') {
        await ApiService.updateOrderFeedback(editingFeedback.id, {
          orderId: formData.orderId,
          rating: formData.rating,
          comment: formData.comment,
          createdAt: formData.createdAt ? new Date(formData.createdAt).toISOString() : undefined
        })
      } else {
        await ApiService.updateServiceFeedback(editingFeedback.id, {
          serviceId: formData.serviceId,
          rating: formData.rating,
          comment: formData.comment,
          createdAt: formData.createdAt ? new Date(formData.createdAt).toISOString() : undefined
        })
      }
      alert('Đã cập nhật feedback thành công!')
      setIsEditModalOpen(false)
      setEditingFeedback(null)
      resetForm()
      loadData()
    } catch (err) {
      console.error('Error updating feedback:', err)
      alert('Có lỗi khi cập nhật feedback')
    }
  }

  const resetForm = () => {
    setFormData({
      orderId: 0,
      serviceId: 0,
      rating: 5,
      comment: '',
      createdAt: new Date().toISOString().split('T')[0]
    })
  }

  const openAddModal = () => {
    resetForm()
    setIsAddModalOpen(true)
  }

  const openEditModal = (feedback: OrderFeedback | ServiceFeedback) => {
    setEditingFeedback(feedback)
    
    // Format createdAt để hiển thị trong date input (YYYY-MM-DD)
    let createdAtDate = ''
    if (feedback.createdAt) {
      try {
        const date = new Date(feedback.createdAt)
        if (!isNaN(date.getTime())) {
          createdAtDate = date.toISOString().split('T')[0]
        }
      } catch (e) {
        createdAtDate = new Date().toISOString().split('T')[0]
      }
    } else {
      createdAtDate = new Date().toISOString().split('T')[0]
    }
    
    if (activeTab === 'orders') {
      const orderFeedback = feedback as OrderFeedback
      setFormData({
        orderId: orderFeedback.orderId,
        serviceId: 0,
        rating: orderFeedback.rating,
        comment: orderFeedback.comment || '',
        createdAt: createdAtDate
      })
    } else {
      const serviceFeedback = feedback as ServiceFeedback
      setFormData({
        orderId: 0,
        serviceId: serviceFeedback.serviceId,
        rating: serviceFeedback.rating,
        comment: serviceFeedback.comment || '',
        createdAt: createdAtDate
      })
    }
    setIsEditModalOpen(true)
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600'
    if (rating >= 3) return 'text-yellow-600'
    return 'text-red-600'
  }

  const renderStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating)
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
            <button onClick={loadData} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
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
        <h1 className="text-3xl font-bold text-black mb-2">Quản lý feedback</h1>
        <p className="text-black">Xem và quản lý phản hồi từ khách hàng</p>
      </div>

      <div className="mb-4 flex gap-4">
        <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-black">Order Feedbacks</div>
          <div className="text-2xl font-bold text-black">{orderFeedbacks.length}</div>
        </div>
        <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-black">Service Feedbacks</div>
          <div className="text-2xl font-bold text-blue-600">{serviceFeedbacks.length}</div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'orders'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-black border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Order Feedbacks ({orderFeedbacks.length})
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'services'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-black border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Service Feedbacks ({serviceFeedbacks.length})
          </button>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-100 text-blue-700 font-medium rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2 border border-blue-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 border border-gray-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Thêm mới</span>
          </button>
        </div>
      </div>

      {/* Order Feedbacks Tab */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-lg border border-black/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Khách hàng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Đánh giá</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Bình luận</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Ngày</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Hành động</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orderFeedbacks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-black">
                      Chưa có feedback nào cho orders
                    </td>
                  </tr>
                ) : (
                  orderFeedbacks.map((feedback) => (
                    <tr key={feedback.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">#{feedback.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">Order #{feedback.orderId}</td>
                      <td className="px-6 py-4 text-sm text-black">
                        {feedback.user?.fullname || 'N/A'}
                        <div className="text-black text-xs">{feedback.user?.email || ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-lg font-semibold ${getRatingColor(feedback.rating)}`}>
                          {renderStars(feedback.rating)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-black max-w-md">{feedback.comment || '(Không có bình luận)'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {feedback.createdAt ? (() => {
                          try {
                            const date = new Date(feedback.createdAt)
                            return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('vi-VN')
                          } catch {
                            return 'Invalid Date'
                          }
                        })() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(feedback)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-medium border border-blue-300"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteOrderFeedback(feedback.id)}
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
      )}

      {/* Service Feedbacks Tab */}
      {activeTab === 'services' && (
        <div className="bg-white rounded-lg border border-black/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Service ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Khách hàng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Đánh giá</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Bình luận</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Ngày</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Hành động</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {serviceFeedbacks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-black">
                      Chưa có feedback nào cho services
                    </td>
                  </tr>
                ) : (
                  serviceFeedbacks.map((feedback) => (
                    <tr key={feedback.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">#{feedback.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">Service #{feedback.serviceId}</td>
                      <td className="px-6 py-4 text-sm text-black">
                        {feedback.user?.fullname || 'N/A'}
                        <div className="text-black text-xs">{feedback.user?.email || ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-lg font-semibold ${getRatingColor(feedback.rating)}`}>
                          {renderStars(feedback.rating)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-black max-w-md">{feedback.comment || '(Không có bình luận)'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {feedback.createdAt ? (() => {
                          try {
                            const date = new Date(feedback.createdAt)
                            return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('vi-VN')
                          } catch {
                            return 'Invalid Date'
                          }
                        })() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(feedback)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-medium border border-blue-300"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteServiceFeedback(feedback.id)}
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
      )}

      {/* Add/Edit Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
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
            maxWidth: '500px',
            width: '100%',
            padding: '24px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '24px'
            }}>
              <h2 style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                {isEditModalOpen ? 'Sửa feedback' : 'Thêm feedback mới'}
              </h2>
              <button onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); setEditingFeedback(null); resetForm() }} style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '4px'
              }}>×</button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: 'white', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                {activeTab === 'orders' ? 'Order ID' : 'Service ID'} *
              </label>
              <input
                type="number"
                value={activeTab === 'orders' ? formData.orderId : formData.serviceId}
                onChange={(e) => setFormData({
                  ...formData,
                  [activeTab === 'orders' ? 'orderId' : 'serviceId']: Number(e.target.value) || 0
                })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: '#374151',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px'
                }}
                placeholder={`Nhập ${activeTab === 'orders' ? 'Order' : 'Service'} ID`}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: 'white', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Đánh giá (1-5 sao) *
              </label>
              <select
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: '#374151',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px'
                }}
              >
                <option value={1}>1 sao ⭐</option>
                <option value={2}>2 sao ⭐⭐</option>
                <option value={3}>3 sao ⭐⭐⭐</option>
                <option value={4}>4 sao ⭐⭐⭐⭐</option>
                <option value={5}>5 sao ⭐⭐⭐⭐⭐</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: 'white', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Ngày tạo *
              </label>
              <input
                type="date"
                value={formData.createdAt}
                onChange={(e) => setFormData({ ...formData, createdAt: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: '#374151',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: 'white', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Bình luận *
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                rows={4}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: '#374151',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
                placeholder="Nhập bình luận..."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); setEditingFeedback(null); resetForm() }} style={{
                padding: '10px 24px',
                backgroundColor: '#374151',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4b5563'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#374151'}>Hủy</button>
              <button onClick={isEditModalOpen ? handleEditFeedback : handleAddFeedback} style={{
                padding: '10px 24px',
                backgroundColor: '#10b981',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}>
                {isEditModalOpen ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedFeedback && (
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
              <button onClick={() => { setIsDeleteModalOpen(false); setSelectedFeedback(null) }} style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '4px'
              }}>×</button>
            </div>
            <p style={{ color: 'white', marginBottom: '24px', fontSize: '14px' }}>
              Bạn có chắc chắn muốn xóa feedback <strong style={{ fontWeight: '600' }}>{selectedFeedback.name}</strong> không?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => { setIsDeleteModalOpen(false); setSelectedFeedback(null) }} style={{
                padding: '10px 24px',
                backgroundColor: '#374151',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4b5563'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#374151'}>Hủy</button>
              <button onClick={confirmDelete} style={{
                padding: '10px 24px',
                backgroundColor: '#ef4444',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}>Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StaffFeedbacksPage

