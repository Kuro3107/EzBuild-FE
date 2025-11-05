import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ApiService } from '../../services/api'

function PaymentPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [payment, setPayment] = useState<{
    id: string | number;
    order: { id: number };
    amount: number;
    method: string;
    status: string;
    transactionId?: string | null;
    paidAt?: string | null;
    isMock?: boolean;
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  const orderId = searchParams.get('orderId')
  const amount = searchParams.get('amount')
  const depositAmount = 50000
  const orderTotal = parseFloat(amount || '0')

  useEffect(() => {
    console.log('=== PAYMENT PAGE useEffect ===')
    console.log('orderId:', orderId)
    console.log('amount:', amount)
    
    if (!orderId) {
      alert('Thiếu thông tin đơn hàng')
      navigate('/checkout')
      return
    }
    
    // Kiểm tra xem đã có payment cho order này chưa
    const existingPayment = localStorage.getItem(`payment_${orderId}`)
    if (existingPayment) {
      console.log('Using existing payment:', existingPayment)
      setPayment(JSON.parse(existingPayment))
      setIsLoading(false)
      return
    }

    // Kiểm tra nếu đang có tiến trình tạo payment khác
    const paymentCreatingKey = `payment_creating_${orderId}`
    if (sessionStorage.getItem(paymentCreatingKey)) {
      console.log('Payment is being created, please wait...')
      setIsLoading(false)
      return
    }

    // Đánh dấu đang tạo payment
    sessionStorage.setItem(paymentCreatingKey, 'true')

    let isMounted = true // Flag để tránh race condition
    
    const initializePayment = async () => {
      console.log('Creating new payment for orderId:', orderId)

      try {
        setIsLoading(true)
        
        // Tạo payment qua API - CHỈ 1 LẦN DUY NHẤT
        const newPayment = await ApiService.createPayment({
          orderId: parseInt(orderId),
          amount: depositAmount,
          method: 'QR_CODE',
          status: 'PENDING'
        })

        if (isMounted) {
          setPayment(newPayment as typeof payment)
          // Lưu payment vào localStorage để tránh tạo duplicate
          localStorage.setItem(`payment_${orderId}`, JSON.stringify(newPayment))
          console.log('✅ Payment created via API:', newPayment)
        }
      } catch (apiError) {
        console.log('❌ API payment failed:', apiError)
        
        // Không tạo mock payment, báo lỗi
        if (isMounted) {
          alert('Không thể tạo payment. Vui lòng thử lại sau.')
          navigate('/checkout')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
          // Xóa flag sau khi hoàn thành
          sessionStorage.removeItem(paymentCreatingKey)
        }
      }
    }

    initializePayment()
    
    // Cleanup function
    return () => {
      isMounted = false
    }
  }, [orderId, amount, navigate])

  const handlePaymentSuccess = async () => {
    console.log('=== HANDLE PAYMENT SUCCESS ===')
    console.log('Payment from state:', payment)
    
    // Lấy payment từ localStorage nếu state null
    let currentPayment = payment
    if (!currentPayment && orderId) {
      const storedPayment = localStorage.getItem(`payment_${orderId}`)
      if (storedPayment) {
        currentPayment = JSON.parse(storedPayment)
        console.log('Getting payment from localStorage:', currentPayment)
      }
    }
    
    // Nếu không có payment, sẽ cố gắng fetch từ BE theo orderId

    try {
      setIsProcessing(true)
      
      // B1: lấy paymentId từ state/localStorage nếu có
      let paymentIdNumber: number = NaN
      if (currentPayment && 'id' in (currentPayment as object)) {
        const rawId = (currentPayment as { id: string | number }).id
        paymentIdNumber = Number(rawId)
      }

      // B2: nếu vẫn không có, gọi BE lấy danh sách payment và tìm theo orderId (kèm retry)
      const tryResolvePaymentFromAPI = async (): Promise<number | null> => {
        if (!orderId) return null
        const oid = Number(orderId)
        const allPayments = await ApiService.getAllPayments()
        console.log('🔍 Payments fetched:', Array.isArray(allPayments) ? allPayments.length : 0)
        // 1) Ưu tiên match theo orderId
        let matched = (allPayments || []).find((p: Record<string, unknown>) => {
          const byFlatField = Number((p as { orderId?: number | string })?.orderId) === oid
          const byNestedOrder = Number((p as { order?: { id?: number | string } })?.order?.id) === oid
          return byFlatField || byNestedOrder
        })
        // 2) Nếu chưa thấy, thử theo amount=deposit và status=PENDING, chọn id lớn nhất (mới nhất)
        if (!matched) {
          const candidates = (allPayments || []).filter((p: Record<string, unknown>) => {
            const amount = Number((p as { amount?: number | string })?.amount)
            const status = String((p as { status?: string })?.status || '')
            return amount === depositAmount && status.toUpperCase() === 'PENDING'
          }) as Array<Record<string, unknown>>
          if (candidates.length > 0) {
            matched = candidates.sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
              const bid = Number((b as { id?: number | string }).id)
              const aid = Number((a as { id?: number | string }).id)
              return bid - aid
            })[0]
          }
        }
        if (!matched) return null
        type MatchedPayment = {
          id: string | number
          orderId?: number | string
          order?: { id?: number | string }
          amount?: number
          method?: string
          status?: string
          transactionId?: string | null
          paidAt?: string | null
        }
        const m = matched as MatchedPayment
        const resolvedId = Number(m.id)
        if (Number.isFinite(resolvedId)) {
          const normalized = {
            id: m.id,
            order: m.order || { id: m.orderId },
            amount: Number(m.amount ?? depositAmount),
            method: (m.method as string) || 'QR_CODE',
            status: (m.status as string) || 'PENDING',
            transactionId: m.transactionId ?? null,
            paidAt: m.paidAt ?? null,
            isMock: false
          }
          localStorage.setItem(`payment_${orderId}`, JSON.stringify(normalized))
          setPayment(normalized as unknown as typeof payment)
          return resolvedId
        }
        return null
      }

      if (!Number.isFinite(paymentIdNumber) && orderId) {
        try {
          console.log('🔄 Fetching payments from API to resolve missing payment...')
          let resolved = await tryResolvePaymentFromAPI()
          // Nếu chưa có, retry vài lần (đợi quá trình tạo payment hoàn tất và được BE trả về khi GET)
          let attempts = 0
          while (!resolved && attempts < 4) {
            attempts += 1
            await new Promise((r) => setTimeout(r, 700))
            resolved = await tryResolvePaymentFromAPI()
          }
          if (resolved) {
            paymentIdNumber = resolved
          }
        } catch (fetchErr) {
          console.error('❌ Failed to fetch payments for fallback:', fetchErr)
        }
      }
      
      if (Number.isFinite(paymentIdNumber)) {
        console.log('✅ Updating payment status only...', { paymentId: paymentIdNumber })
        await ApiService.updatePayment(paymentIdNumber, { status: 'PAID' })
        navigate('/')
      } else {
        console.error('❌ No valid payment id to update', { currentPayment })
        alert('Không tìm thấy payment để cập nhật. Vui lòng thử lại.')
      }
      
    } catch (error) {
      console.error('❌ Error updating payment:', error)
      alert('Có lỗi khi cập nhật thanh toán: ' + (error as Error).message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancel = async () => {
    if (window.confirm('Bạn có chắc chắn muốn hủy thanh toán?')) {
      try {
        setIsProcessing(true)
        
        if (payment?.isMock) {
          // Xử lý mock payment - xóa khỏi localStorage
          console.log('Deleting mock payment...')
          
          // Lưu payment info vào localStorage với status "Cancelled"
          const paymentHistory = JSON.parse(localStorage.getItem('paymentHistory') || '[]')
          paymentHistory.push({
            ...payment,
            status: 'Cancelled',
            cancelledAt: new Date().toISOString()
          })
          localStorage.setItem('paymentHistory', JSON.stringify(paymentHistory))
          
          alert('Đã hủy thanh toán.')
          // Xóa payment khỏi localStorage sau khi hủy
          localStorage.removeItem(`payment_${orderId}`)
          localStorage.removeItem(`global_payment_creating_${orderId}`)
          navigate('/checkout')
        } else if (payment?.id && !Number.isNaN(Number(payment.id))) {
          // Xử lý API payment - xóa payment nếu có id hợp lệ
          await ApiService.deletePayment(Number(payment.id))
          alert('Đã hủy thanh toán.')
          localStorage.removeItem(`payment_${orderId}`)
          localStorage.removeItem(`global_payment_creating_${orderId}`)
          navigate('/checkout')
        } else {
          // Không có payment id -> chỉ dọn local và điều hướng
          alert('Đã hủy thanh toán.')
          localStorage.removeItem(`payment_${orderId}`)
          localStorage.removeItem(`global_payment_creating_${orderId}`)
          navigate('/checkout')
        }
      } catch (error) {
        console.error('Error cancelling payment:', error)
        alert('Có lỗi khi hủy thanh toán, vui lòng thử lại')
      } finally {
        setIsProcessing(false)
      }
    }
  }

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        color: 'white',
        fontSize: '18px'
      }}>
        Đang tạo payment...
      </div>
    )
  }

  return (
    <div style={{ 
      padding: '24px',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{
          background: 'rgba(31, 41, 55, 0.9)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: '32px',
          color: 'white',
          textAlign: 'center'
        }}>
          <h1 style={{ 
            margin: '0 0 8px 0', 
            fontSize: '28px',
            fontWeight: 'bold'
          }}>
            Thanh Toán
          </h1>
          <p style={{ 
            color: 'rgba(255,255,255,0.7)', 
            margin: '0 0 32px 0',
            fontSize: '16px'
          }}>
            Quét mã QR để thanh toán
          </p>

          {/* Thông tin đơn hàng */}
          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '32px'
          }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#60a5fa' }}>Thông tin đơn hàng</h3>
            <p style={{ margin: '4px 0', fontSize: '14px' }}>
              <strong>Mã đơn hàng:</strong> #{orderId}
            </p>
            <p style={{ margin: '4px 0', fontSize: '14px' }}>
              <strong>Tổng giá trị đơn hàng:</strong> {orderTotal.toLocaleString('vi-VN')} VND
            </p>
            <p style={{ margin: '4px 0', fontSize: '14px' }}>
              <strong>Số tiền cọc:</strong> {depositAmount.toLocaleString('vi-VN')} VND
            </p>
            <p style={{ margin: '4px 0', fontSize: '14px' }}>
              <strong>Trạng thái:</strong> 
              <span style={{ 
                color: payment?.status === 'PAID' ? '#22c55e' : '#fbbf24',
                fontWeight: 'bold',
                padding: '2px 8px',
                borderRadius: '4px',
                background: payment?.status === 'PAID' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                marginLeft: '8px'
              }}>
                {payment?.status === 'PAID' ? '✅ Đã cọc 50.000đ' : '⏳ Chờ thanh toán'}
              </span>
            </p>
            {payment?.status === 'PAID' ? (
              <div style={{
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '8px',
                padding: '12px',
                marginTop: '8px'
              }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#22c55e', fontWeight: 'bold' }}>
                  🎉 Thanh toán thành công!
                </p>
                <p style={{ margin: '0', fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>
                  Đơn hàng đã được chuyển sang trạng thái "Đã cọc". Staff sẽ xác nhận và chuẩn bị hàng.
                </p>
                {payment.transactionId && (
                  <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: 'rgba(255,255,255,0.6)' }}>
                    Mã giao dịch: {payment.transactionId}
                  </p>
                )}
              </div>
            ) : (
              <p style={{ margin: '4px 0', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                Sau khi thanh toán 50.000đ, đơn hàng sẽ chuyển sang trạng thái "Đã cọc"
              </p>
            )}
          </div>

          {/* Ảnh QR Code */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '32px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <img 
              src="https://i.postimg.cc/xTrRthMd/e9c8aeab-d3bf-40a0-8f21-bd5f07f07dcf.jpg"
              alt="QR Code thanh toán"
              style={{
                maxWidth: '100%',
                maxHeight: '300px',
                borderRadius: '8px'
              }}
            />
          </div>

          {/* Hướng dẫn */}
          <div style={{
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '32px'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#22c55e' }}>Hướng dẫn thanh toán</h4>
            <ol style={{ 
              textAlign: 'left', 
              margin: '8px 0 0 0', 
              paddingLeft: '20px',
              fontSize: '14px',
              lineHeight: '1.6'
            }}>
              <li>Mở ứng dụng ngân hàng trên điện thoại</li>
              <li>Quét mã QR ở trên</li>
              <li>Kiểm tra thông tin và xác nhận thanh toán</li>
              <li>Nhấn nút "Đã thanh toán" bên dưới</li>
            </ol>
          </div>

          {/* Nút hành động */}
          <div style={{ 
            display: 'flex', 
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            {payment?.status !== 'PAID' && (
              <button
                onClick={handlePaymentSuccess}
                disabled={isProcessing}
                style={{
                  background: '#22c55e',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '16px 32px',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  minWidth: '160px',
                  opacity: isProcessing ? 0.7 : 1,
                  transition: 'all 0.2s ease'
                }}
              >
                {isProcessing ? 'Đang xử lý...' : 'Đã thanh toán'}
              </button>
            )}

            {payment?.status !== 'PAID' && (
              <button
                onClick={handleCancel}
                disabled={isProcessing}
                style={{
                  background: 'transparent',
                  border: '2px solid #ef4444',
                  borderRadius: '12px',
                  padding: '16px 32px',
                  color: '#ef4444',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  minWidth: '160px',
                  opacity: isProcessing ? 0.7 : 1,
                  transition: 'all 0.2s ease'
                }}
              >
                {isProcessing ? 'Đang xử lý...' : 'Hủy'}
              </button>
            )}

                        {payment?.status === 'PAID' && (
              <button
                onClick={() => navigate('/')}
                style={{
                  background: '#10b981',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '16px 32px',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  cursor: 'pointer',
                  minWidth: '160px',
                  transition: 'all 0.2s ease'
                }}
              >
                Về trang chủ
              </button>
            )}
          </div>

          {/* Lưu ý */}
          <div style={{
            marginTop: '24px',
            padding: '12px',
            background: 'rgba(251, 191, 36, 0.1)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            borderRadius: '8px',
            fontSize: '12px',
            color: 'rgba(255,255,255,0.8)'
          }}>
            <strong>Lưu ý:</strong> Vui lòng chỉ nhấn "Đã thanh toán" sau khi đã hoàn tất thanh toán thành công.
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentPage
