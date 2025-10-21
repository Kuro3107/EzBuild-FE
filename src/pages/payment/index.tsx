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

  useEffect(() => {
    console.log('=== PAYMENT PAGE useEffect ===')
    console.log('orderId:', orderId)
    console.log('amount:', amount)
    
    // Kiểm tra sessionStorage để tránh duplicate payment
    const paymentKey = `payment_creating_${orderId}`
    if (sessionStorage.getItem(paymentKey)) {
      console.log('Payment creation already in progress, skipping...')
      setIsLoading(false)
      return
    }
    
    // Kiểm tra thêm với localStorage để tránh duplicate
    const globalPaymentKey = `global_payment_creating_${orderId}`
    if (localStorage.getItem(globalPaymentKey)) {
      console.log('Global payment creation already in progress, skipping...')
      setIsLoading(false)
      return
    }

    let isMounted = true // Flag để tránh race condition
    
    const initializePayment = async () => {
      if (!orderId || !amount) {
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

      // Đánh dấu đã bắt đầu tạo payment
      sessionStorage.setItem(paymentKey, 'true')
      localStorage.setItem(globalPaymentKey, 'true')
      console.log('Creating new payment for orderId:', orderId)

      try {
        setIsLoading(true)
        
        // Tạo payment qua API
        try {
          const newPayment = await ApiService.createPayment({
            orderId: parseInt(orderId),
            amount: parseFloat(amount),
            method: 'QR_CODE',
            status: 'PENDING'
          })

          if (isMounted) {
            setPayment(newPayment as typeof payment)
            // Lưu payment vào localStorage để tránh tạo duplicate
            localStorage.setItem(`payment_${orderId}`, JSON.stringify(newPayment))
            console.log('Payment created via API:', newPayment)
          }
        } catch (apiError) {
          console.log('API payment failed, creating mock payment:', apiError)
          
          // Fallback: tạo payment record tạm thời
          const mockPayment = {
            id: `mock_${Date.now()}`,
            order: { id: parseInt(orderId) },
            amount: parseFloat(amount),
            method: 'QR_CODE',
            status: 'PENDING',
            transactionId: null,
            paidAt: null,
            isMock: true
          }
          
          if (isMounted) {
            setPayment(mockPayment)
            // Lưu payment vào localStorage để tránh tạo duplicate
            localStorage.setItem(`payment_${orderId}`, JSON.stringify(mockPayment))
            console.log('Mock payment created:', mockPayment)
          }
        }
      } catch (error) {
        console.error('Error creating payment:', error)
        if (isMounted) {
          // Xóa flag khi có lỗi để cho phép thử lại
          sessionStorage.removeItem(paymentKey)
          localStorage.removeItem(globalPaymentKey)
          alert('Có lỗi khi tạo payment, vui lòng thử lại')
          navigate('/checkout')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    initializePayment()
    
    // Cleanup function
    return () => {
      isMounted = false
      // Xóa sessionStorage flag khi component unmount
      sessionStorage.removeItem(paymentKey)
      // Không xóa localStorage flag ở đây để tránh duplicate khi navigate
    }
  }, [orderId, amount])

  const handlePaymentSuccess = async () => {
    if (!payment) return

    try {
      setIsProcessing(true)
      
      if (payment?.isMock) {
        // Xử lý mock payment - cập nhật status thành "Waiting accept"
        console.log('Processing mock payment...')
        
        // Lưu payment info vào localStorage với status "Waiting accept"
        const paymentHistory = JSON.parse(localStorage.getItem('paymentHistory') || '[]')
        paymentHistory.push({
          ...payment,
          status: 'Waiting accept',
          transactionId: `TXN_${Date.now()}`,
          paidAt: new Date().toISOString()
        })
        localStorage.setItem('paymentHistory', JSON.stringify(paymentHistory))
        
        alert('Thanh toán thành công! Đang chờ xác nhận.')
        // Xóa payment khỏi localStorage sau khi thanh toán thành công
        localStorage.removeItem(`payment_${orderId}`)
        localStorage.removeItem(`global_payment_creating_${orderId}`)
        navigate('/')
        } else {
          // Xử lý API payment - cập nhật status thành "Waiting accept"
          await ApiService.updatePayment(Number(payment.id), {
            status: 'Waiting accept',
            transactionId: `TXN_${Date.now()}`,
            paidAt: new Date().toISOString()
          })

          alert('Thanh toán thành công! Đang chờ xác nhận.')
          // Xóa payment khỏi localStorage sau khi thanh toán thành công
          localStorage.removeItem(`payment_${orderId}`)
          localStorage.removeItem(`global_payment_creating_${orderId}`)
          navigate('/')
        }
    } catch (error) {
      console.error('Error updating payment:', error)
      alert('Có lỗi khi cập nhật thanh toán, vui lòng thử lại')
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
        } else {
          // Xử lý API payment - xóa payment
          await ApiService.deletePayment(Number(payment?.id))
          
          alert('Đã hủy thanh toán.')
          // Xóa payment khỏi localStorage sau khi hủy
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
              <strong>Số tiền:</strong> {parseFloat(amount || '0').toLocaleString('vi-VN')} VND
            </p>
            <p style={{ margin: '4px 0', fontSize: '14px' }}>
              <strong>Trạng thái:</strong> <span style={{ color: '#fbbf24' }}>Chờ thanh toán</span>
            </p>
            <p style={{ margin: '4px 0', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
              Sau khi thanh toán, đơn hàng sẽ chuyển sang trạng thái "Chờ xác nhận"
            </p>
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
