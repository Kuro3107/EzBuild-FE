import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ApiService } from '../../services/api'

type PaymentNavState = {
  orderId?: number
  orderTotal?: number
  depositAmount?: number
  paymentId?: number
  payment?: Record<string, unknown>
  qrString?: string
  qrPayload?: unknown
}

const parseNumeric = (value: unknown): number | null => {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return null
    const parsed = Number(trimmed)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

const toUpperStatus = (value: unknown, fallback = 'PENDING'): string => {
  if (typeof value === 'string' && value.trim()) {
    return value.trim().toUpperCase()
  }
  return fallback
}

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: '⏳ Chờ thanh toán',
  PAID: '✅ Đã cọc',
  SUCCESS: '✅ Thanh toán thành công',
  COMPLETED: '✅ Hoàn tất',
  DEPOSITED: '💰 Đã nhận cọc',
  CANCEL: '❌ Đã hủy',
  CANCELLED: '❌ Đã hủy',
  FAILED: '⚠️ Thanh toán thất bại',
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: '⏳ Chờ thanh toán',
  DEPOSITED: '💰 Đã nhận cọc',
  SHIPPING: '🚚 Đang giao',
  PAID: '✅ Đã thanh toán',
  DONE: '🎉 Hoàn tất',
  CANCEL: '❌ Đã hủy',
  CANCELLED: '❌ Đã hủy',
}

const isImageLike = (value: string): boolean => {
  if (!value) return false
  const trimmed = value.trim()
  if (trimmed.startsWith('data:image')) return true
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    const cleaned = trimmed.split('?')[0]
    if (/(\.png|\.jpg|\.jpeg|\.gif|\.svg|\.webp)$/i.test(cleaned)) return true
    return true
  }
  return false
}

const formatCurrency = (value: number): string => {
  if (!Number.isFinite(value)) return '0 VND'
  return `${Math.round(value).toLocaleString('vi-VN')} VND`
}

function PaymentPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const navState = (location.state as PaymentNavState | null) ?? null

  const initialOrderId = parseNumeric(navState?.orderId ?? searchParams.get('orderId'))
  const initialPaymentId = parseNumeric(navState?.paymentId ?? searchParams.get('paymentId'))
  const initialTotal = parseNumeric(navState?.orderTotal ?? searchParams.get('amount') ?? searchParams.get('total')) ?? 0
  const initialDeposit = parseNumeric(navState?.depositAmount ?? searchParams.get('deposit')) ?? 50000

  const [orderId, setOrderId] = useState<number | null>(initialOrderId)
  const [paymentId, setPaymentId] = useState<number | null>(initialPaymentId)
  const [orderTotal, setOrderTotal] = useState<number>(initialTotal)
  const [depositAmount, setDepositAmount] = useState<number>(initialDeposit)
  const [payment, setPayment] = useState<Record<string, unknown> | null>(navState?.payment ?? null)
  const [order, setOrder] = useState<Record<string, unknown> | null>(null)
  const [qrString, setQrString] = useState<string | null>(navState?.qrString ?? null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    let isMounted = true

    const resolvedOrderId = parseNumeric(navState?.orderId ?? searchParams.get('orderId'))
    const resolvedPaymentId = parseNumeric(navState?.paymentId ?? searchParams.get('paymentId'))
    const resolvedTotal = parseNumeric(navState?.orderTotal ?? searchParams.get('amount') ?? searchParams.get('total'))
    const resolvedDeposit = parseNumeric(navState?.depositAmount ?? searchParams.get('deposit'))

    if (isMounted) {
      setOrderId(resolvedOrderId ?? null)
      setPaymentId(resolvedPaymentId ?? null)
      if (resolvedTotal !== null) {
        setOrderTotal(resolvedTotal)
      }
      setDepositAmount(resolvedDeposit ?? 50000)
    }

    if (!resolvedOrderId || !resolvedPaymentId) {
      if (isMounted) {
        setError('Thiếu thông tin thanh toán. Vui lòng quay lại trang Checkout.')
        setIsLoading(false)
      }
      return () => {
        isMounted = false
      }
    }

    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Ưu tiên 1: Sử dụng qrString từ navState nếu có (từ checkout page)
        if (navState?.qrString && typeof navState.qrString === 'string' && navState.qrString.trim()) {
          console.log('Sử dụng QR từ navState:', navState.qrString)
          setQrString(navState.qrString.trim())
          setPayment(navState.payment ?? null)
          // Vẫn fetch order và payment để cập nhật thông tin mới nhất
          const [paymentResponse, orderResponse] = await Promise.all([
            ApiService.getPaymentById(resolvedPaymentId).catch(() => null),
            ApiService.getOrderById(resolvedOrderId).catch(() => null)
          ])
          if (!isMounted) return
          if (paymentResponse) setPayment(paymentResponse)
          setOrder(orderResponse)
          setError(null)
          setIsLoading(false)
          return
        }
        
        // Ưu tiên 2: Fetch payment và kiểm tra paymentUrl trong response
        const paymentResponse = await ApiService.getPaymentById(resolvedPaymentId)
        
        // Kiểm tra paymentUrl trong response
        const paymentUrlFromResponse = (paymentResponse as { paymentUrl?: string }).paymentUrl
        const paymentUrlFromNavState = (navState?.payment as { paymentUrl?: string } | undefined)?.paymentUrl
        
        let qrResponse: { qrString?: string; payload: unknown } | null = null
        
        // Ưu tiên: paymentUrl từ navState > paymentUrl từ response > gọi API
        if (paymentUrlFromNavState && typeof paymentUrlFromNavState === 'string' && paymentUrlFromNavState.trim()) {
          qrResponse = { qrString: paymentUrlFromNavState.trim(), payload: navState?.payment }
          console.log('Sử dụng paymentUrl từ navState:', paymentUrlFromNavState)
        } else if (paymentUrlFromResponse && typeof paymentUrlFromResponse === 'string' && paymentUrlFromResponse.trim()) {
          qrResponse = { qrString: paymentUrlFromResponse.trim(), payload: paymentResponse }
          console.log('Sử dụng paymentUrl từ response:', paymentUrlFromResponse)
        } else {
          // Fallback: Gọi API getPaymentQr nếu không có paymentUrl
          console.log('Không có paymentUrl, gọi API getPaymentQr')
          qrResponse = await ApiService.getPaymentQr(resolvedPaymentId).catch(() => null)
        }
        
        const orderResponse = await ApiService.getOrderById(resolvedOrderId).catch(() => null)

        if (!isMounted) return

        setPayment(paymentResponse)
        const qrCandidate = qrResponse?.qrString ?? navState?.qrString ?? null
        setQrString(qrCandidate ?? null)
        setOrder(orderResponse)
        setError(null)
      } catch (err) {
        if (isMounted) {
          setError((err as Error)?.message || 'Có lỗi xảy ra khi tải thông tin thanh toán')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [navState, searchParams])

  // Polling để tự động check status payment khi đang PENDING
  useEffect(() => {
    if (!paymentId || !orderId) return

    const paymentStatus = toUpperStatus(payment?.status)
    
    // Chỉ polling khi payment status là PENDING
    if (paymentStatus !== 'PENDING') {
      console.log('Payment status không phải PENDING, dừng polling')
      return
    }

    console.log('Bắt đầu polling để check payment status...')
    
    const pollInterval = setInterval(async () => {
      try {
        console.log('Polling: Kiểm tra payment status...')
        const [paymentResponse, orderResponse] = await Promise.all([
          ApiService.getPaymentById(paymentId).catch(() => null),
          ApiService.getOrderById(orderId).catch(() => null)
        ])

        if (paymentResponse) {
          const newStatus = toUpperStatus(paymentResponse.status)
          const oldStatus = toUpperStatus(payment?.status)
          
          console.log('Payment status:', { old: oldStatus, new: newStatus })
          
          // Cập nhật payment và order
          setPayment(paymentResponse)
          if (orderResponse) {
            setOrder(orderResponse)
          }
          
          // Nếu status thay đổi từ PENDING sang status khác, dừng polling và hiển thị thông báo
          if (oldStatus === 'PENDING' && newStatus !== 'PENDING') {
            console.log('Payment status đã thay đổi từ PENDING sang:', newStatus)
            clearInterval(pollInterval)
            
            // Hiển thị popup success nếu thanh toán thành công
            if (newStatus === 'PAID' || newStatus === 'SUCCESS' || newStatus === 'COMPLETED') {
              // Tự động cập nhật order status từ PENDING sang DEPOSITED
              if (orderResponse && orderId) {
                const currentOrderStatus = toUpperStatus(orderResponse.status)
                if (currentOrderStatus === 'PENDING') {
                  try {
                    console.log('Tự động cập nhật order status từ PENDING sang DEPOSITED...')
                    const updatedOrder = await ApiService.updateOrderStatus(orderId, 'DEPOSITED')
                    setOrder(updatedOrder)
                    console.log('Đã cập nhật order status thành công:', updatedOrder)
                  } catch (orderUpdateError) {
                    console.error('Lỗi khi cập nhật order status:', orderUpdateError)
                    // Vẫn tiếp tục hiển thị popup dù có lỗi
                  }
                }
              }
              
              setShowSuccessPopup(true)
              setCountdown(3)
              
              // Đếm ngược và navigate về homepage
              const countdownInterval = setInterval(() => {
                setCountdown((prev) => {
                  if (prev <= 1) {
                    clearInterval(countdownInterval)
                    navigate('/')
                    return 0
                  }
                  return prev - 1
                })
              }, 1000)
            } else if (newStatus.startsWith('CANCEL')) {
              alert('❌ Thanh toán đã bị hủy.')
            } else if (newStatus === 'FAILED') {
              alert('⚠️ Thanh toán thất bại. Vui lòng thử lại.')
            }
          }
        }
      } catch (err) {
        console.error('Lỗi khi polling payment status:', err)
      }
    }, 3000) // Polling mỗi 3 giây

    // Cleanup: Dừng polling khi component unmount hoặc status thay đổi
    return () => {
      console.log('Dừng polling payment status')
      clearInterval(pollInterval)
    }
  }, [paymentId, orderId, payment?.status, navigate])

  // Bỏ hàm handlePaymentSuccess và refreshPaymentDetails vì không cần nữa

  const handleCancel = async () => {
    if (!paymentId) {
      navigate('/checkout')
      return
    }

    if (!window.confirm('Bạn chắc chắn muốn hủy thanh toán này?')) return

    try {
      setIsProcessing(true)
      await ApiService.updatePaymentStatus(paymentId, 'CANCEL')
      alert('Đã hủy thanh toán. Bạn có thể thực hiện lại sau.')
      navigate('/checkout')
    } catch (err) {
      console.error('Error cancelling payment:', err)
      alert('Không thể hủy thanh toán: ' + ((err as Error)?.message || 'Không xác định'))
    } finally {
      setIsProcessing(false)
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
        fontSize: '18px',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'
      }}>
        Đang tải thông tin thanh toán...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '16px',
        height: '100vh',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        color: 'white',
        textAlign: 'center',
        padding: '0 24px'
      }}>
        <div style={{ fontSize: '20px', fontWeight: 600 }}>Không thể tải thông tin thanh toán</div>
        <div style={{ maxWidth: '420px', color: 'rgba(255,255,255,0.75)' }}>{error}</div>
        <button
          onClick={() => navigate('/checkout')}
          style={{
            padding: '12px 24px',
            borderRadius: '12px',
            border: 'none',
            fontWeight: 600,
            background: '#1e40af',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Quay lại Checkout
        </button>
      </div>
    )
  }

  const paymentStatus = toUpperStatus(payment?.status)
  const paymentStatusLabel = PAYMENT_STATUS_LABELS[paymentStatus] ?? paymentStatus
  const orderStatus = toUpperStatus(order?.status)
  const orderStatusLabel = ORDER_STATUS_LABELS[orderStatus] ?? orderStatus
  
  // Ẩn QR code khi đã thanh toán thành công
  const showQRCode = paymentStatus === 'PENDING' && qrString

  return (
    <>
      {/* Success Popup */}
      {showSuccessPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            borderRadius: '24px',
            padding: '48px',
            maxWidth: '480px',
            width: '90%',
            textAlign: 'center',
            color: 'white',
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.3)',
            animation: 'slideIn 0.3s ease-out'
          }}>
            <div style={{
              fontSize: '72px',
              marginBottom: '24px',
              animation: 'bounce 0.6s ease-out'
            }}>
              ✅
            </div>
            <h2 style={{
              margin: '0 0 16px 0',
              fontSize: '28px',
              fontWeight: 700
            }}>
              Thanh toán thành công!
            </h2>
            <p style={{
              margin: '0 0 32px 0',
              fontSize: '16px',
              color: 'rgba(255, 255, 255, 0.9)',
              lineHeight: 1.6
            }}>
              Cảm ơn bạn đã thanh toán. Đơn hàng của bạn đã được xác nhận và sẽ được xử lý trong thời gian sớm nhất.
            </p>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <div style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.8)',
                marginBottom: '8px'
              }}>
                Tự động chuyển về trang chủ sau:
              </div>
              <div style={{
                fontSize: '48px',
                fontWeight: 700,
                color: 'white'
              }}>
                {countdown}
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              style={{
                background: 'white',
                color: '#22c55e',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 32px',
                fontSize: '16px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)'
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
            >
              Về trang chủ ngay
            </button>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    <div style={{
      padding: '24px',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'
    }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <div style={{
          background: 'rgba(15, 23, 42, 0.88)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px',
          padding: '32px',
          color: 'white',
          boxShadow: '0 24px 68px rgba(15,23,42,0.35)'
        }}>
          <h1 style={{
            margin: '0 0 4px 0',
            fontSize: '30px',
            fontWeight: 700,
            letterSpacing: '0.01em'
          }}>
            Thanh toán đặt cọc
          </h1>
          <p style={{
            margin: '0 0 28px 0',
            color: 'rgba(226,232,240,0.75)',
            fontSize: '16px'
          }}>
            Quét mã QR để thanh toán {formatCurrency(depositAmount)} và xác nhận đơn hàng của bạn.
          </p>

          <div style={{
            display: 'grid',
            gap: '16px',
            marginBottom: '28px'
          }}>
            <div style={{
              background: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59,130,246,0.25)',
              borderRadius: '16px',
              padding: '18px'
            }}>
              <h3 style={{
                margin: '0 0 12px 0',
                color: '#60a5fa',
                fontSize: '16px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em'
              }}>
                Thông tin đơn hàng
              </h3>
              <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(226,232,240,0.75)' }}>Mã đơn</span>
                  <span style={{ fontWeight: 600 }}>#{orderId ?? '—'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(226,232,240,0.75)' }}>Tổng giá trị</span>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(orderTotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(226,232,240,0.75)' }}>Tiền cọc</span>
                  <span style={{ fontWeight: 700, color: '#34d399' }}>{formatCurrency(depositAmount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(226,232,240,0.75)' }}>Trạng thái đơn</span>
                  <span style={{ fontWeight: 600 }}>{orderStatusLabel}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'rgba(226,232,240,0.75)' }}>Trạng thái thanh toán</span>
                  <span style={{
                    fontWeight: 700,
                    color: (paymentStatus === 'PAID' || paymentStatus === 'SUCCESS' || paymentStatus === 'COMPLETED') ? '#22c55e' : paymentStatus.startsWith('CANCEL') ? '#f87171' : paymentStatus === 'FAILED' ? '#ef4444' : '#fbbf24'
                  }}>
                    {paymentStatusLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Chỉ hiển thị QR code khi chưa thanh toán */}
            {showQRCode && (
              <div style={{
                background: 'rgba(15,23,42,0.6)',
                border: '1px dashed rgba(148, 163, 184, 0.4)',
                borderRadius: '16px',
                padding: '24px',
                textAlign: 'center'
              }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 700 }}>QR Thanh toán</h3>
                {isImageLike(qrString) ? (
                  <div style={{
                    background: 'white',
                    padding: '18px',
                    borderRadius: '16px',
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
                    <img
                      src={qrString}
                      alt="QR Thanh toán"
                      style={{ maxWidth: '280px', maxHeight: '280px', borderRadius: '8px' }}
                    />
                  </div>
                ) : (
                  <div style={{
                    background: 'rgba(30,64,175,0.2)',
                    borderRadius: '12px',
                    padding: '16px',
                    color: 'rgba(226,232,240,0.9)',
                    wordBreak: 'break-all'
                  }}>
                    {qrString}
                  </div>
                )}
              </div>
            )}
            
            {/* Hiển thị thông báo khi đã thanh toán thành công */}
            {!showQRCode && (paymentStatus === 'SUCCESS' || paymentStatus === 'PAID' || paymentStatus === 'COMPLETED') && (
              <div style={{
                background: 'rgba(34,197,94,0.15)',
                border: '2px solid rgba(34,197,94,0.4)',
                borderRadius: '16px',
                padding: '32px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '64px',
                  marginBottom: '16px'
                }}>
                  ✅
                </div>
                <h3 style={{
                  margin: '0 0 12px 0',
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#22c55e'
                }}>
                  Thanh toán thành công!
                </h3>
                <p style={{
                  margin: 0,
                  color: 'rgba(226,232,240,0.9)',
                  fontSize: '16px'
                }}>
                  Đơn hàng của bạn đã được xác nhận. Vui lòng chờ trong giây lát...
                </p>
              </div>
            )}
          </div>

          <div style={{
            background: 'rgba(34,197,94,0.12)',
            border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: '14px',
            padding: '18px',
            marginBottom: '24px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#34d399', fontSize: '16px', fontWeight: 600 }}>Hướng dẫn</h4>
            <ul style={{
              margin: 0,
              paddingLeft: '18px',
              lineHeight: 1.6,
              color: 'rgba(203,213,225,0.85)',
              fontSize: '14px',
              textAlign: 'left'
            }}>
              <li>Mở ứng dụng ngân hàng và chọn tính năng quét QR.</li>
              <li>Quét mã và kiểm tra kỹ thông tin giao dịch.</li>
              <li>Xác nhận thanh toán số tiền {formatCurrency(depositAmount)}.</li>
              <li>Sau khi thanh toán xong, hệ thống sẽ tự động cập nhật trạng thái.</li>
            </ul>
          </div>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            justifyContent: 'center'
          }}>
            {(paymentStatus !== 'PAID' && paymentStatus !== 'SUCCESS' && paymentStatus !== 'COMPLETED' && !paymentStatus.startsWith('CANCEL')) && (
              <button
                onClick={handleCancel}
                disabled={isProcessing}
                style={{
                  background: 'transparent',
                  border: '2px solid #ef4444',
                  borderRadius: '12px',
                  padding: '14px 28px',
                  color: '#ef4444',
                  fontWeight: 700,
                  fontSize: '16px',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  minWidth: '180px',
                  opacity: isProcessing ? 0.7 : 1,
                  transition: 'all 0.2s ease'
                }}
              >
                {isProcessing ? 'Đang xử lý...' : 'Hủy thanh toán'}
              </button>
            )}

            <button
              onClick={() => navigate('/')}
              style={{
                background: '#1e40af',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 28px',
                color: 'white',
                fontWeight: 700,
                fontSize: '16px',
                cursor: 'pointer',
                minWidth: '180px',
                transition: 'all 0.2s ease'
              }}
            >
              Về trang chủ
            </button>
          </div>

          <div style={{
            marginTop: '22px',
            padding: '12px 16px',
            background: 'rgba(251, 191, 36, 0.12)',
            border: '1px solid rgba(251,191,36,0.3)',
            borderRadius: '12px',
            fontSize: '13px',
            color: 'rgba(241,245,249,0.85)'
          }}>
            <strong>Lưu ý:</strong> Nếu sau 5 phút trạng thái vẫn chưa cập nhật, hãy liên hệ ngay với bộ phận chăm sóc khách hàng để được hỗ trợ.
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default PaymentPage
