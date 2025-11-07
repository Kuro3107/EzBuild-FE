import { useEffect, useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ApiService } from '../../services/api'

function CheckoutPage() {
  const navigate = useNavigate()
  const [cartBuild, setCartBuild] = useState<{ components?: Array<{ name?: string; model?: string; priceValue?: number }> } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const depositAmount = 50000

  useEffect(() => {
    try {
      const raw = localStorage.getItem('ezbuild-checkout')
      if (raw) {
        const parsed = JSON.parse(raw)
        setCartBuild(parsed)
      } else {
        setCartBuild(null)
      }
    } catch {
      setCartBuild(null)
    }
    
    // Xóa các flag checkout cũ khi vào trang (để tránh bị chặn)
    const user = ApiService.getCurrentUser()
    if (user) {
      const userId = Number(user?.id || user?.userId || 0)
      if (userId > 0) {
        const checkoutCreatingKey = `checkout_creating_${userId}`
        const existingFlag = sessionStorage.getItem(checkoutCreatingKey)
        if (existingFlag) {
          console.log('Xóa flag checkout cũ:', checkoutCreatingKey)
          sessionStorage.removeItem(checkoutCreatingKey)
        }
      }
    }
  }, [])

  const totalPrice = useMemo(() => {
    if (!cartBuild || !Array.isArray(cartBuild.components)) return 0
    return cartBuild.components.reduce((sum: number, c: { priceValue?: number }) => sum + (c?.priceValue || 0), 0)
  }, [cartBuild])

  async function handlePlaceOrder() {
    console.log('=== BUTTON CLICKED ===')
    console.log('cartBuild:', cartBuild)
    console.log('isSubmitting:', isSubmitting)
    
    if (!cartBuild) {
      console.log('No cartBuild, returning early')
      alert('Chưa có cấu hình để thanh toán. Vui lòng quay lại PC Builder.')
      return
    }
    
    setIsSubmitting(true)
    console.log('Starting checkout process...')
    try {
      // 1) Lấy user hiện tại
      const user = ApiService.getCurrentUser()
      if (!user) {
        alert('Vui lòng đăng nhập trước khi thanh toán')
        navigate('/login', { state: { from: '/checkout' } } as unknown as { state: { from: string } })
        setIsSubmitting(false)
        return
      }

      console.log('=== CHECKOUT DEBUG ===')
      console.log('User object:', user)
      console.log('User ID:', user?.id || user?.userId)
      console.log('Total price:', totalPrice)

      // Kiểm tra user ID có hợp lệ không
      const userId = Number(user?.id || user?.userId || 0)
      if (!userId || userId === 0) {
        alert('Không thể xác định thông tin người dùng. Vui lòng đăng nhập lại.')
        navigate('/login')
        setIsSubmitting(false)
        return
      }

      // Kiểm tra nếu đang có tiến trình checkout khác
      const checkoutCreatingKey = `checkout_creating_${userId}`
      const existingFlag = sessionStorage.getItem(checkoutCreatingKey)
      if (existingFlag) {
        // Kiểm tra thời gian - nếu flag cũ hơn 30 giây thì xóa và cho phép tiếp tục
        try {
          const flagTime = parseInt(existingFlag)
          if (!isNaN(flagTime)) {
            const now = Date.now()
            const elapsed = now - flagTime
            if (elapsed > 30000) { // 30 giây
              console.log('Flag cũ hơn 30 giây, xóa và tiếp tục')
              sessionStorage.removeItem(checkoutCreatingKey)
            } else {
              console.log('Checkout is being processed, please wait...')
              setIsSubmitting(false)
              return
            }
          } else {
            // Flag không phải timestamp, xóa và tiếp tục
            console.log('Flag không hợp lệ, xóa và tiếp tục')
            sessionStorage.removeItem(checkoutCreatingKey)
          }
        } catch {
          // Lỗi khi parse, xóa và tiếp tục
          console.log('Lỗi khi kiểm tra flag, xóa và tiếp tục')
          sessionStorage.removeItem(checkoutCreatingKey)
        }
      }

      // Đánh dấu đang tạo order với timestamp
      sessionStorage.setItem(checkoutCreatingKey, String(Date.now()))
      console.log('Đã set flag checkout:', checkoutCreatingKey)

      // 2) Lấy buildId từ build có sẵn của user
      let buildId: number | undefined
      try {
        const userBuilds = await ApiService.getBuildsByUser(userId)
        console.log('User builds:', userBuilds)
        
        if (userBuilds && userBuilds.length > 0) {
          // Lấy build mới nhất (có thể là build vừa được tạo từ PC Builder)
          const latestBuild = userBuilds[userBuilds.length - 1]
          buildId = Number(latestBuild.id)
          console.log('Using latest build ID:', buildId)
        } else {
          console.log('No builds found for user, creating order without buildId')
        }
      } catch (buildError) {
        console.error('Error fetching user builds:', buildError)
        console.log('Continuing without buildId')
      }

      // 3) Tạo order trạng thái PENDING để chờ thanh toán
      const order = await ApiService.createOrder({
        userId: userId,
        buildId: buildId, // Truyền buildId từ build có sẵn
        totalPrice: totalPrice,
        status: 'PENDING',
        paymentMethod: 'QR_CODE',
        phone: (user?.phone as string) || '',
        address: 'Chưa có địa chỉ' // Short address để test
      })

      console.log('Order created:', order)

      const orderId = Number(order?.id)
      if (!Number.isFinite(orderId) || orderId <= 0) {
        throw new Error('Không nhận được mã đơn hàng hợp lệ')
      }

      // 4) Tạo payment cho đơn hàng với trạng thái PENDING
      const payment = await ApiService.createPayment({
        orderId: orderId,
        amount: depositAmount,
        method: 'QR_CODE',
        status: 'PENDING'
      })

      console.log('Payment created:', payment)

      const paymentId = Number((payment as { id?: number | string; paymentId?: number | string }).id ?? (payment as { paymentId?: number | string }).paymentId ?? 0)
      
      // Kiểm tra paymentId có hợp lệ không
      if (!Number.isFinite(paymentId) || paymentId <= 0) {
        throw new Error('Không nhận được mã thanh toán hợp lệ')
      }

      // Lấy paymentUrl từ response của createPayment (backend đã trả về sẵn)
      let qrString: string | undefined
      let qrPayload: unknown = undefined
      
      // Kiểm tra paymentUrl trong response
      const paymentUrl = (payment as { paymentUrl?: string }).paymentUrl
      if (paymentUrl && typeof paymentUrl === 'string' && paymentUrl.trim()) {
        qrString = paymentUrl.trim()
        qrPayload = payment
        console.log('QR URL từ payment response:', qrString)
      } else {
        // Fallback: Nếu không có paymentUrl, thử gọi API getPaymentQr
        try {
          const qrResponse = await ApiService.getPaymentQr(paymentId)
          qrString = qrResponse.qrString
          qrPayload = qrResponse.payload
          console.log('QR data từ API:', qrResponse)
        } catch (qrError) {
          console.error('Không thể lấy QR cho payment:', qrError)
          // Vẫn tiếp tục navigate dù không có QR
        }
      }

      // Xóa flag sau khi tạo thành công
      sessionStorage.removeItem(checkoutCreatingKey)

      // 5) Chuẩn bị query để có thể reload trang payment trực tiếp
      const params = new URLSearchParams()
      if (Number.isFinite(orderId) && orderId > 0) params.set('orderId', String(orderId))
      params.set('amount', String(totalPrice))
      if (Number.isFinite(paymentId) && paymentId > 0) params.set('paymentId', String(paymentId))
      params.set('deposit', String(depositAmount))

      console.log('Navigating to payment page with:', {
        orderId,
        paymentId,
        qrString: qrString ? 'Có QR' : 'Không có QR'
      })

      // 6) Điều hướng tới trang payment cùng state để hiển thị QR ngay lập tức
      navigate(`/payment?${params.toString()}`, {
        state: {
          orderId,
          orderTotal: totalPrice,
          depositAmount,
          paymentId,
          payment,
          qrString,
          qrPayload
        }
      })
      
      // 7) Xóa checkout data sau khi tạo order thành công
      localStorage.removeItem('ezbuild-checkout')
    } catch (e) {
      console.error(e)
      // Xóa flag khi có lỗi
      const user = ApiService.getCurrentUser()
      if (user) {
        const userId = Number(user?.id || user?.userId || 0)
        sessionStorage.removeItem(`checkout_creating_${userId}`)
      }
      alert('Có lỗi khi thanh toán, vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ color: 'white', margin: 0 }}>Thanh Toán</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)' }}>Xem lại cấu hình và hoàn tất thanh toán</p>

        {!cartBuild && (
          <div style={{
            background: 'rgba(31, 41, 55, 0.6)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '16px',
            color: 'white'
          }}>
            Chưa có cấu hình để thanh toán. <Link to="/pcbuilder" style={{ color: '#60a5fa' }}>Quay lại PC Builder</Link>
          </div>
        )}

        {cartBuild && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px' }}>
            <div style={{
              background: 'rgba(31, 41, 55, 0.6)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '16px',
              color: 'white'
            }}>
              <h3 style={{ marginTop: 0 }}>Cấu hình của bạn</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {cartBuild.components?.map((c: { name?: string; model?: string; priceValue?: number }, idx: number) => (
                  <div key={idx} style={{
                    display: 'flex', justifyContent: 'space-between',
                    borderBottom: '1px dashed rgba(255,255,255,0.15)', paddingBottom: '8px'
                  }}>
                    <span>{c?.name || c?.model || 'Linh kiện'}</span>
                    <span style={{ color: '#60a5fa' }}>{(c?.priceValue || 0).toLocaleString('vi-VN')} VND</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              background: 'rgba(31, 41, 55, 0.6)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '16px',
              color: 'white',
              height: 'fit-content'
            }}>
              <h3 style={{ marginTop: 0 }}>Tóm tắt</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span>Tạm tính</span>
                <span style={{ color: '#60a5fa' }}>{totalPrice.toLocaleString('vi-VN')} VND</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span>Đặt cọc</span>
                <span style={{ color: '#34d399', fontWeight: 700 }}>50.000 VND</span>
              </div>
              <div style={{
                background: 'rgba(34,197,94,0.1)',
                border: '1px solid rgba(34,197,94,0.3)',
                borderRadius: '8px',
                padding: '8px',
                marginBottom: '12px',
                fontSize: '12px',
                color: 'rgba(255,255,255,0.8)'
              }}>
                Bạn chỉ cần thanh toán trước 50.000đ để xác nhận đơn. Số còn lại sẽ được thanh toán sau khi cửa hàng xác nhận.
              </div>
              <button
                disabled={isSubmitting}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('Button clicked, calling handlePlaceOrder')
                  handlePlaceOrder().catch(err => {
                    console.error('Error in handlePlaceOrder:', err)
                    setIsSubmitting(false)
                  })
                }}
                style={{
                  width: '100%', background: '#1e3a8a', border: 'none',
                  borderRadius: '8px', padding: '12px', color: 'white', fontWeight: 600,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.6 : 1
                }}
              >
                {isSubmitting ? 'Đang xử lý...' : 'Đặt cọc 50.000đ'}
              </button>
              <button
                onClick={() => navigate('/pcbuilder')}
                style={{
                  width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px', padding: '12px', color: 'white', fontWeight: 600,
                  marginTop: '8px', cursor: 'pointer'
                }}
              >
                Quay lại tùy chỉnh
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CheckoutPage


