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
      console.log('=== NORMALIZING ORDER FEEDBACKS ===')
      console.log('Raw order data:', orderData)
      console.log('Raw order data (JSON):', JSON.stringify(orderData, null, 2))
      
      // Kiểm tra xem có field nào khác không
      if (orderData.length > 0) {
        const firstFeedback = orderData[0] as Record<string, unknown>
        console.log('=== CHECKING ALL POSSIBLE FIELDS ===')
        console.log('All fields in first feedback:', Object.keys(firstFeedback))
        for (const key of Object.keys(firstFeedback)) {
          console.log(`  ${key}:`, firstFeedback[key], `(type: ${typeof firstFeedback[key]})`)
        }
      }
      
      // Thử enrich data bằng cách gọi API từng feedback nếu thiếu thông tin
      // Vì backend có thể không trả về order_id và user_id trong list endpoint
      const enrichedOrderData = await Promise.all(
        orderData.map(async (f: Record<string, unknown>) => {
          // Kiểm tra xem đã có order_id và user_id chưa - ưu tiên kiểm tra trực tiếp trước
          // Không phụ thuộc vào order/user object vì chúng có thể là null
          const hasOrderId = 
            (f.order_id !== null && f.order_id !== undefined && f.order_id !== 0 && f.order_id !== '0' && String(f.order_id).trim() !== '') ||
            (f.orderId !== null && f.orderId !== undefined && f.orderId !== 0 && f.orderId !== '0' && String(f.orderId).trim() !== '') ||
            (f.order && f.order !== null && typeof f.order === 'object' && (f.order as Record<string, unknown>).id !== null && (f.order as Record<string, unknown>).id !== undefined && (f.order as Record<string, unknown>).id !== 0)
          
          const hasUserId = 
            (f.user_id !== null && f.user_id !== undefined && f.user_id !== 0 && f.user_id !== '0' && String(f.user_id).trim() !== '') ||
            (f.userId !== null && f.userId !== undefined && f.userId !== 0 && f.userId !== '0' && String(f.userId).trim() !== '') ||
            (f.user && f.user !== null && typeof f.user === 'object' && (f.user as Record<string, unknown>).id !== null && (f.user as Record<string, unknown>).id !== undefined && (f.user as Record<string, unknown>).id !== 0) ||
            (f.order && f.order !== null && typeof f.order === 'object' && 
             (f.order as Record<string, unknown>).user !== null && 
             typeof (f.order as Record<string, unknown>).user === 'object' &&
             ((f.order as Record<string, unknown>).user as Record<string, unknown>).id !== null &&
             ((f.order as Record<string, unknown>).user as Record<string, unknown>).id !== undefined &&
             ((f.order as Record<string, unknown>).user as Record<string, unknown>).id !== 0)
          
          if (hasOrderId && hasUserId) {
            console.log(`✓ Feedback #${f.id} already has orderId and userId`)
            console.log(`  order_id:`, f.order_id, `orderId:`, f.orderId)
            console.log(`  user_id:`, f.user_id, `userId:`, f.userId)
            return f
          }
          
          // Nếu thiếu, thử gọi API để lấy feedback chi tiết
          // API chi tiết có thể trả về đầy đủ thông tin hơn
          try {
            const feedbackId = Number(f.id)
            if (feedbackId > 0) {
              console.log(`⚠️ Missing orderId or userId for feedback #${feedbackId}, fetching details...`)
              console.log(`  Current feedback data:`, f)
              console.log(`  Current keys:`, Object.keys(f))
              console.log(`  Has order_id?`, f.order_id, `Has orderId?`, f.orderId)
              console.log(`  Has user_id?`, f.user_id, `Has userId?`, f.userId)
              
              const detailed = await ApiService.getOrderFeedbackById(feedbackId)
              console.log(`✓ Got detailed feedback #${feedbackId}:`, detailed)
              console.log(`  Detailed keys:`, Object.keys(detailed))
              console.log(`  Detailed order_id:`, detailed.order_id)
              console.log(`  Detailed user_id:`, detailed.user_id)
              console.log(`  Detailed order:`, detailed.order)
              console.log(`  Detailed user:`, detailed.user)
              
              // Kiểm tra tất cả các keys có thể chứa order_id và user_id
              Object.keys(detailed).forEach(key => {
                const value = detailed[key]
                if (typeof value === 'number' && value > 0) {
                  console.log(`  Key "${key}" has numeric value:`, value)
                }
                // Kiểm tra cả string có thể convert sang number
                if (typeof value === 'string' && !isNaN(Number(value)) && Number(value) > 0) {
                  console.log(`  Key "${key}" has string numeric value:`, value)
                }
                if (key.toLowerCase().includes('order') || key.toLowerCase().includes('user')) {
                  console.log(`  Key "${key}" (order/user related):`, value)
                }
              })
              
              // Merge thông tin, ưu tiên detailed response nhưng giữ lại dữ liệu ban đầu nếu detailed không có
              const merged = { ...f, ...detailed }
              // Nếu detailed có order_id/user_id nhưng merged không có, thêm vào
              if (detailed.order_id && !merged.order_id) {
                merged.order_id = detailed.order_id
              }
              if (detailed.user_id && !merged.user_id) {
                merged.user_id = detailed.user_id
              }
              if (detailed.orderId && !merged.orderId) {
                merged.orderId = detailed.orderId
              }
              if (detailed.userId && !merged.userId) {
                merged.userId = detailed.userId
              }
              
              console.log(`  Merged keys:`, Object.keys(merged))
              console.log(`  Merged order_id:`, merged.order_id, `orderId:`, merged.orderId)
              console.log(`  Merged user_id:`, merged.user_id, `userId:`, merged.userId)
              return merged
            }
          } catch (err) {
            console.error(`❌ Error fetching detailed feedback #${f.id}:`, err)
            console.error(`  Error details:`, JSON.stringify(err, null, 2))
            // Vẫn trả về f ban đầu nếu có lỗi
          }
          
          return f
        })
      )
      
      const normalizedOrderFeedbacks: OrderFeedback[] = enrichedOrderData.map((f: Record<string, unknown>, index: number) => {
        console.log(`\n--- Processing Feedback #${index + 1} ---`)
        console.log('Raw feedback object:', f)
        console.log('All keys in feedback:', Object.keys(f))
        
        // Log tất cả các keys và values để debug
        Object.keys(f).forEach(key => {
          console.log(`  ${key}:`, f[key], `(type: ${typeof f[key]})`)
        })
        
        const toPositiveNumber = (value: unknown): number | null => {
          if (value === null || value === undefined) return null
          const num = Number(value)
          if (Number.isNaN(num)) return null
          return num > 0 ? num : null
        }
        const toStringSafe = (value: unknown): string => {
          if (value === null || value === undefined) return ''
          return String(value)
        }
        
        // Database dùng 'comments' (số nhiều) - ưu tiên lấy từ đây
        const comment = (f.comments as string) 
          ?? (f.comment as string)
          ?? (f.comment_text as string)
          ?? (f.commentText as string)
          ?? ''
        
        const createdAt = (f.createdAt as string)
          ?? (f.created_at as string)
          ?? (f.createdAtDate as string)
          ?? new Date().toISOString()
        
        // Ưu tiên sử dụng giá trị sẵn có trước khi fallback
        const initialOrderId =
          toPositiveNumber((f as { order_id?: unknown }).order_id) ??
          toPositiveNumber((f as { orderId?: unknown }).orderId) ??
          (toPositiveNumber(((f as { order?: { id?: unknown } }).order)?.id))
        
        let orderId = initialOrderId ?? 0
        
        // Hàm helper để extract number từ nhiều format
        // Theo Swagger, backend trả về order.id (nested object)
        const extractOrderId = (obj: Record<string, unknown>): number => {
          // ƯU TIÊN 1: Kiểm tra nested order.id (theo Swagger response structure)
          if (obj.order && typeof obj.order === 'object' && obj.order !== null) {
            const order = obj.order as Record<string, unknown>
            if (order.id !== null && order.id !== undefined && order.id !== 0 && order.id !== '0' && order.id !== '') {
              const num = Number(order.id)
              if (!isNaN(num) && num > 0) {
                console.log(`✓ Found orderId from order.id: ${num}`)
                return num
              }
            }
          }
          
          // ƯU TIÊN 2: Kiểm tra order_id trực tiếp (snake_case từ database)
          if (obj.order_id !== null && obj.order_id !== undefined && obj.order_id !== 0 && obj.order_id !== '0' && obj.order_id !== '') {
            const num = Number(obj.order_id)
            if (!isNaN(num) && num > 0) {
              console.log(`✓ Found orderId from order_id: ${num}`)
              return num
            }
          }
          
          // ƯU TIÊN 3: Kiểm tra orderId (camelCase)
          if (obj.orderId !== null && obj.orderId !== undefined && obj.orderId !== 0 && obj.orderId !== '0' && obj.orderId !== '') {
            const num = Number(obj.orderId)
            if (!isNaN(num) && num > 0) {
              console.log(`✓ Found orderId from orderId: ${num}`)
              return num
            }
          }
          
          // FALLBACK: Kiểm tra nested order object với các keys khác
          if (obj.order && typeof obj.order === 'object' && obj.order !== null) {
            const order = obj.order as Record<string, unknown>
            for (const key of ['orderId', 'order_id', 'ID']) {
              if (key in order) {
                const value = order[key]
                if (value !== null && value !== undefined && value !== 0 && value !== '0' && value !== '') {
                  const num = Number(value)
                  if (!isNaN(num) && num > 0) {
                    console.log(`✓ Found orderId from order.${key}: ${num}`)
                    return num
                  }
                }
              }
            }
          }
          
          console.log(`✗ Could not find orderId in object`)
          return 0
        }
        
        if (!orderId || orderId <= 0) {
          orderId = extractOrderId(f)
        } else {
          console.log(`✓ Using pre-existing orderId: ${orderId}`)
        }
        
        let userEmail = ''
        let userFullname = ''
        
        const nestedOrderUser = ((f as { order?: { user?: Record<string, unknown> } }).order?.user ?? null) as Record<string, unknown> | null
        const nestedUser = ((f as { user?: Record<string, unknown> }).user ?? null) as Record<string, unknown> | null
        
        const nestedOrderUserId = nestedOrderUser ? toPositiveNumber(nestedOrderUser['id']) : null
        const nestedUserId = nestedUser ? toPositiveNumber(nestedUser['id']) : null
        
        const initialUserId =
          nestedOrderUserId ??
          nestedUserId ??
          toPositiveNumber((f as { user_id?: unknown }).user_id) ??
          toPositiveNumber((f as { userId?: unknown }).userId)
        
        // Lấy user_id từ TẤT CẢ các nguồn có thể - ưu tiên nested object theo Swagger
        let userId = initialUserId ?? 0
        if (nestedOrderUserId && nestedOrderUser) {
          userEmail = toStringSafe(nestedOrderUser['email'] ?? nestedOrderUser['emailAddress'])
          userFullname = toStringSafe(nestedOrderUser['fullname'] ?? nestedOrderUser['fullName'] ?? nestedOrderUser['name'])
        } else if (nestedUserId && nestedUser) {
          userEmail = toStringSafe(nestedUser['email'] ?? nestedUser['emailAddress'])
          userFullname = toStringSafe(nestedUser['fullname'] ?? nestedUser['fullName'] ?? nestedUser['name'])
        }
        
        // Theo Swagger, backend trả về order.user.id (nested trong order object)
        const extractUserId = (obj: Record<string, unknown>): number => {
          // ƯU TIÊN 1: Kiểm tra order.user.id (theo Swagger response structure)
          if (obj.order && typeof obj.order === 'object' && obj.order !== null) {
            const order = obj.order as Record<string, unknown>
            if (order.user && typeof order.user === 'object' && order.user !== null) {
              const user = order.user as Record<string, unknown>
              if (user.id !== null && user.id !== undefined && user.id !== 0 && user.id !== '0' && user.id !== '') {
                const num = Number(user.id)
                if (!isNaN(num) && num > 0) {
                  console.log(`✓ Found userId from order.user.id: ${num}`)
                  // Lấy thêm email và fullname từ order.user
                  userEmail = toStringSafe((user as Record<string, unknown>)['email'] ?? (user as Record<string, unknown>)['emailAddress'])
                  userFullname = toStringSafe((user as Record<string, unknown>)['fullname'] ?? (user as Record<string, unknown>)['fullName'] ?? (user as Record<string, unknown>)['name'])
                  return num
                }
              }
            }
          }
          
          // ƯU TIÊN 2: Kiểm tra user.id trực tiếp (nested user object ở top level)
          if (obj.user && typeof obj.user === 'object' && obj.user !== null) {
            const user = obj.user as Record<string, unknown>
            if (user.id !== null && user.id !== undefined && user.id !== 0 && user.id !== '0' && user.id !== '') {
              const num = Number(user.id)
              if (!isNaN(num) && num > 0) {
                console.log(`✓ Found userId from user.id: ${num}`)
                // Lấy thêm email và fullname
                userEmail = toStringSafe((user as Record<string, unknown>)['email'] ?? (user as Record<string, unknown>)['emailAddress'])
                userFullname = toStringSafe((user as Record<string, unknown>)['fullname'] ?? (user as Record<string, unknown>)['fullName'] ?? (user as Record<string, unknown>)['name'])
                return num
              }
            }
          }
          
          // ƯU TIÊN 3: Kiểm tra user_id trực tiếp (snake_case từ database)
          if (obj.user_id !== null && obj.user_id !== undefined && obj.user_id !== 0 && obj.user_id !== '0' && obj.user_id !== '') {
            const num = Number(obj.user_id)
            if (!isNaN(num) && num > 0) {
              console.log(`✓ Found userId from user_id: ${num}`)
              return num
            }
          }
          
          // ƯU TIÊN 4: Kiểm tra userId (camelCase)
          if (obj.userId !== null && obj.userId !== undefined && obj.userId !== 0 && obj.userId !== '0' && obj.userId !== '') {
            const num = Number(obj.userId)
            if (!isNaN(num) && num > 0) {
              console.log(`✓ Found userId from userId: ${num}`)
              return num
            }
          }
          
          // FALLBACK: Kiểm tra nested user object với các keys khác
          if (obj.user && typeof obj.user === 'object' && obj.user !== null) {
            const user = obj.user as Record<string, unknown>
            for (const key of ['userId', 'user_id', 'ID']) {
              if (key in user) {
                const value = user[key]
                if (value !== null && value !== undefined && value !== 0 && value !== '0' && value !== '') {
                  const num = Number(value)
                  if (!isNaN(num) && num > 0) {
                    console.log(`✓ Found userId from user.${key}: ${num}`)
                    // Lấy thêm email và fullname nếu có
                    userEmail = String(user.email || user.emailAddress || '')
                    userFullname = String(user.fullname || user.fullName || user.name || '')
                    return num
                  }
                }
              }
            }
          }
          
          console.log(`✗ Could not find userId in object`)
          return 0
        }
        
        if (!userId || userId <= 0) {
          userId = extractUserId(f)
        } else {
          console.log(`✓ Using pre-existing userId: ${userId}`)
        }
        
        // Nếu vẫn không tìm thấy, thử gọi API để lấy feedback chi tiết
        if ((orderId === 0 || userId === 0) && f.id) {
          console.log(`⚠️ Missing orderId or userId, trying to fetch detailed feedback #${f.id}...`)
          // Không await ở đây vì sẽ làm chậm, chỉ log để debug
        }
        
        const normalized = {
          id: Number(f.id) || 0,
          orderId: orderId,
          rating: Number(f.rating) || 0,
          comment: String(comment),
          createdAt: String(createdAt),
          user: userId > 0 ? {
            id: userId,
            email: userEmail,
            fullname: userFullname
          } : undefined
        } as OrderFeedback
        
        console.log(`→ Final normalized: orderId=${normalized.orderId}, userId=${userId}`)
        
        return normalized
      })
      
      // Normalize service feedbacks - lấy comment và createdAt từ nhiều nguồn
      console.log('=== NORMALIZING SERVICE FEEDBACKS ===')
      console.log('Raw service data:', serviceData)
      
      const normalizedServiceFeedbacks: ServiceFeedback[] = serviceData.map((f: Record<string, unknown>) => {
        // Database dùng 'comments' (số nhiều) - ưu tiên lấy từ đây
        const comment = (f.comments as string) 
          ?? (f.comment as string)
          ?? (f.comment_text as string)
          ?? (f.commentText as string)
          ?? ''
        
        const createdAt = (f.createdAt as string)
          ?? (f.created_at as string)
          ?? (f.createdAtDate as string)
          ?? new Date().toISOString()
        
        // Lấy service_id từ nhiều nguồn - ưu tiên snake_case từ database
        let serviceId = 0
        
        // Ưu tiên 1: service_id (snake_case) - trực tiếp từ database
        if (f.service_id !== null && f.service_id !== undefined) {
          serviceId = Number(f.service_id)
        }
        // Ưu tiên 2: serviceId (camelCase)
        else if (f.serviceId !== null && f.serviceId !== undefined) {
          serviceId = Number(f.serviceId)
        }
        // Ưu tiên 3: service object với id bên trong
        else if (f.service && typeof f.service === 'object') {
          const serviceObj = f.service as { id?: unknown }
          if (serviceObj.id !== null && serviceObj.id !== undefined) {
            serviceId = Number(serviceObj.id)
          }
        }
        
        // Lấy user_id từ nhiều nguồn
        let userId = 0
        let userEmail = ''
        let userFullname = ''
        
        // Ưu tiên 1: user_id (snake_case) - trực tiếp từ database
        if (f.user_id !== null && f.user_id !== undefined) {
          userId = Number(f.user_id)
        }
        // Ưu tiên 2: userId (camelCase)
        else if (f.userId !== null && f.userId !== undefined) {
          userId = Number(f.userId)
        }
        // Ưu tiên 3: user object với id bên trong
        if (f.user && typeof f.user === 'object') {
          const userObj = f.user as { id?: unknown; email?: unknown; fullname?: unknown }
          if (userObj.id !== null && userObj.id !== undefined) {
            userId = Number(userObj.id)
          }
          userEmail = String(userObj.email || '')
          userFullname = String(userObj.fullname || '')
        }
        
        const normalized = {
          id: Number(f.id) || 0,
          serviceId: serviceId,
          rating: Number(f.rating) || 0,
          comment: String(comment),
          createdAt: String(createdAt),
          user: userId > 0 ? {
            id: userId,
            email: userEmail,
            fullname: userFullname
          } : undefined
        } as ServiceFeedback
        
        console.log(`Service Feedback #${normalized.id}: serviceId=${normalized.serviceId}, userId=${userId}, comment="${normalized.comment.substring(0, 20)}..."`)
        
        return normalized
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
      } catch {
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
    if (rating >= 4) return 'text-green-400'
    if (rating >= 3) return 'text-yellow-400'
    return 'text-red-400'
  }

  const renderStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating)
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
            <button onClick={loadData} className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl">
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
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Quản lý feedback
            </span>
          </h1>
          <p className="text-gray-300 text-lg">Xem và quản lý phản hồi từ khách hàng</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all shadow-lg hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm mb-2">Order Feedbacks</p>
                <p className="text-3xl font-bold text-white">{orderFeedbacks.length}</p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-2xl shadow-lg">
                📦
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all shadow-lg hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm mb-2">Service Feedbacks</p>
                <p className="text-3xl font-bold text-blue-400">{serviceFeedbacks.length}</p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-2xl shadow-lg">
                🛠️
              </div>
            </div>
          </div>
        </div>

        {/* Tabs and Actions */}
        <div className="mb-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'orders'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                    : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
                }`}
              >
                Order Feedbacks ({orderFeedbacks.length})
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'services'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                    : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
                }`}
              >
                Service Feedbacks ({serviceFeedbacks.length})
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
              <button
                onClick={openAddModal}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Thêm mới
              </button>
            </div>
          </div>
        </div>

        {/* Order Feedbacks Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Khách hàng</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Đánh giá</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Bình luận</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Ngày</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {orderFeedbacks.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                        Chưa có feedback nào cho orders
                      </td>
                    </tr>
                  ) : (
                    orderFeedbacks.map((feedback) => (
                      <tr key={feedback.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">#{feedback.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">Order #{feedback.orderId}</td>
                        <td className="px-6 py-4 text-sm text-white">
                          {feedback.user?.fullname || 'N/A'}
                          <div className="text-gray-300 text-xs">{feedback.user?.email || ''}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-lg font-semibold ${getRatingColor(feedback.rating).replace('text-', 'text-').replace('-600', '-400')}`}>
                            {renderStars(feedback.rating)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300 max-w-md">{feedback.comment || '(Không có bình luận)'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {feedback.createdAt ? (() => {
                            try {
                              const date = new Date(feedback.createdAt)
                              return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('vi-VN')
                            } catch {
                              return 'Invalid Date'
                            }
                          })() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditModal(feedback)}
                              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all text-sm font-medium shadow-md"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDeleteOrderFeedback(feedback.id)}
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
        )}

        {/* Service Feedbacks Tab */}
        {activeTab === 'services' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Service ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Khách hàng</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Đánh giá</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Bình luận</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Ngày</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {serviceFeedbacks.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                        Chưa có feedback nào cho services
                      </td>
                    </tr>
                  ) : (
                    serviceFeedbacks.map((feedback) => (
                      <tr key={feedback.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">#{feedback.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">Service #{feedback.serviceId}</td>
                        <td className="px-6 py-4 text-sm text-white">
                          {feedback.user?.fullname || 'N/A'}
                          <div className="text-gray-300 text-xs">{feedback.user?.email || ''}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-lg font-semibold ${getRatingColor(feedback.rating).replace('text-', 'text-').replace('-600', '-400')}`}>
                            {renderStars(feedback.rating)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300 max-w-md">{feedback.comment || '(Không có bình luận)'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {feedback.createdAt ? (() => {
                            try {
                              const date = new Date(feedback.createdAt)
                              return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('vi-VN')
                            } catch {
                              return 'Invalid Date'
                            }
                          })() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditModal(feedback)}
                              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all text-sm font-medium shadow-md"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDeleteServiceFeedback(feedback.id)}
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
        )}
      </div>

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

