import { useEffect, useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ApiService } from '../../services/api'

function CheckoutPage() {
  const navigate = useNavigate()
  const [cartBuild, setCartBuild] = useState<any | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
  }, [])

  const totalPrice = useMemo(() => {
    if (!cartBuild || !Array.isArray(cartBuild.components)) return 0
    return cartBuild.components.reduce((sum: number, c: any) => sum + (c?.priceValue || 0), 0)
  }, [cartBuild])

  async function handlePlaceOrder() {
    if (!cartBuild) return
    setIsSubmitting(true)
    try {
      // 1) Lấy user hiện tại
      const user = ApiService.getCurrentUser()
      if (!user) {
        alert('Vui lòng đăng nhập trước khi thanh toán')
        navigate('/login', { state: { from: '/checkout' } } as unknown as { state: { from: string } })
        return
      }

      // 2) Tạo order trạng thái PAID theo yêu cầu, KHÔNG tạo build tạm
      await ApiService.createOrder({
        userId: String(user?.id || user?.userId || ''),
        totalPrice: totalPrice,
        status: 'PAID',
        paymentMethod: 'DUMMY',
        phone: (user?.phone as string) || ''
      })

      alert('Thanh toán thành công! Đơn hàng đã được tạo.')
      localStorage.removeItem('ezbuild-checkout')
      navigate('/customer')
    } catch (e) {
      console.error(e)
      alert('Có lỗi khi đặt hàng, vui lòng thử lại.')
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
                {cartBuild.components?.map((c: any, idx: number) => (
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
              <button
                disabled={isSubmitting}
                onClick={handlePlaceOrder}
                style={{
                  width: '100%', background: '#1e3a8a', border: 'none',
                  borderRadius: '8px', padding: '12px', color: 'white', fontWeight: 600,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng'}
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


