import React, { useEffect, useMemo, useState } from 'react'

type BuildSummary = {
  id: number
  name: string
  totalPrice: number | null
}

type BuildDetailItem = {
  id: number
  quantity: number
  product_price_id?: number
  product_id?: number
  product_name?: string
  category_id?: number
  category_name?: string
  price?: number
  // Legacy format (nếu API trả về)
  productPrice?: {
    id: number
    price: number
    product?: {
      id: number
      name: string
      category?: { id: number; name: string }
      brand?: string
      model?: string | null
    }
  }
}

type BuildDetail = {
  id: number
  name: string
  totalPrice?: number | null
  total_price?: number | null
  items: BuildDetailItem[]
}

type Props = {
  allBuilds: BuildSummary[]
  currentIndex: number
  onRoll?: (currentIndex: number) => void
  onApply?: (detail: BuildDetail) => void
  disableApply?: boolean
  onCheck?: (detail: BuildDetail) => void
  disableCheck?: boolean
  checking?: boolean
}

const apiBase = (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'https://exe201-ezbuildvn-be.onrender.com'

export const BuildRollerCard: React.FC<Props> = ({ allBuilds, currentIndex, onRoll, onApply, disableApply, onCheck, disableCheck, checking }) => {
  const build = allBuilds[currentIndex]
  const [detail, setDetail] = useState<BuildDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function loadDetail() {
      if (!build) return
      setReady(false)
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${apiBase}/api/build/${build.id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data: BuildDetail = await res.json()
        if (!cancelled) setDetail(data)
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Load build failed')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadDetail()
    return () => {
      cancelled = true
    }
  }, [build])

  const itemsView = useMemo(() => {
    if (!detail?.items) return null
    const items = detail.items.slice(0, 8)
    return (
      <ul
        className="text-sm"
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}
      >
        {items.map((it) => {
          // Hỗ trợ cả 2 format: mới (flat) và cũ (nested)
          let categoryLabel = 'Linh kiện'
          let productName = ''
          let price = 0

          if (it.productPrice?.product) {
            const p = it.productPrice.product
            categoryLabel = p?.category?.name || categoryLabel
            productName = p?.name || productName
            price = it.productPrice.price ?? 0
          } else {
            categoryLabel = it.category_name || categoryLabel
            productName = it.product_name || productName
            price = Number(it.price) || 0
          }

          const displayName = productName || `Item #${it.product_price_id || it.id}`

          const priceLabel = price > 0 ? `${price.toLocaleString('vi-VN')}₫` : 'Liên hệ'

          return (
            <li
              key={it.id}
              style={{
                padding: '6px 0',
                fontSize: '13px',
                color: 'white',
                borderBottom: '1px solid rgba(148, 163, 184, 0.1)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'center' }}>
                <span>
                  <span style={{ color: '#93c5fd', fontWeight: 600 }}>{categoryLabel}:</span>{' '}
                  <span>{displayName}</span>
                </span>
                <span style={{ color: '#FDE68A', fontWeight: 600 }}>{priceLabel}</span>
              </div>
            </li>
          )
        })}
      </ul>
    )
  }, [detail])

  useEffect(() => {
    if (!loading && detail?.items?.length) {
      const timer = setTimeout(() => setReady(true), 50)
      return () => clearTimeout(timer)
    }
    setReady(false)
    return () => {}
  }, [loading, detail])

  const canApply = !!onApply && !!detail && !loading && !disableApply
  const canCheck = !!onCheck && !!detail && !loading && !disableCheck

  return (
    <>
      <style>{`
        @keyframes buildFadeIn {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
      <div
      className="text-white flex flex-col"
      style={{
        borderRadius: '18px',
        border: '1px solid rgba(191, 219, 254, 0.45)',
        padding: '18px',
        background: 'linear-gradient(150deg, rgba(96, 165, 250, 0.25), rgba(30, 58, 138, 0.82))',
        boxShadow: '0 24px 48px rgba(30, 64, 175, 0.35)',
        backdropFilter: 'blur(16px)',
        minHeight: '100%',
        borderImage: 'linear-gradient(130deg, rgba(148, 197, 255, 0.6), rgba(147, 197, 253, 0.15)) 1',
        animation: ready ? 'buildFadeIn 0.45s ease-out both' : 'none',
        opacity: ready ? 1 : 0,
        transform: ready ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.96)',
        transition: 'opacity 0.2s ease, transform 0.3s ease'
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-lg font-semibold leading-snug">{build?.name || 'Build'}</h3>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {onCheck && (
            <button
              onClick={() => detail && onCheck(detail)}
              disabled={!canCheck}
              style={{
                fontSize: '13px',
                padding: '6px 14px',
                borderRadius: '999px',
                border: '1px solid rgba(59,130,246,0.6)',
                color: '#BFDBFE',
                backgroundColor: 'rgba(37, 99, 235, 0.15)',
                cursor: canCheck ? 'pointer' : 'not-allowed',
                opacity: canCheck ? 1 : 0.4,
                transition: 'all .2s ease'
              }}
            >
              {checking ? 'Đang kiểm tra...' : 'Check thông số'}
            </button>
          )}

          {onApply && (
            <button
              onClick={() => detail && onApply(detail)}
              disabled={!canApply}
              style={{
                fontSize: '13px',
                padding: '6px 14px',
                borderRadius: '999px',
                border: '1px solid rgba(20,184,166,0.6)',
                color: '#5EEAD4',
                backgroundColor: 'rgba(15,118,110,0.12)',
                cursor: canApply ? 'pointer' : 'not-allowed',
                opacity: canApply ? 1 : 0.4,
                transition: 'all .2s ease'
              }}
            >
              Áp dụng
            </button>
          )}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          background: 'rgba(15, 23, 42, 0.45)',
          borderRadius: '14px',
          padding: '14px',
          border: '1px solid rgba(148, 197, 253, 0.25)'
        }}
      >
        {loading && <div className="opacity-80">Đang tải chi tiết...</div>}
        {error && <div className="text-red-400">Lỗi: {error}</div>}
        {!loading && !error && itemsView}
      </div>

      <div
        style={{
          marginTop: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 14px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(147, 197, 253, 0.12), rgba(45, 212, 191, 0.18))',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          fontSize: '13px'
        }}
      >
        <span style={{ fontWeight: 500, opacity: 0.85 }}>Tổng giá build</span>
        <span style={{ fontWeight: 700, fontSize: '15px' }}>
          {(detail?.total_price ?? detail?.totalPrice ?? build?.totalPrice ?? 0).toLocaleString('vi-VN')}₫
        </span>
      </div>

      <div className="mt-4 flex justify-center">
        {onRoll && (
          <button
            onClick={() => onRoll(currentIndex)}
            title="Đổi build khác"
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '999px',
              border: '1px solid rgba(147, 197, 253, 0.7)',
              background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.35), rgba(129, 140, 248, 0.4))',
              color: '#F8FAFC',
              fontWeight: 700,
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 12px 32px rgba(96, 165, 250, 0.45)',
              transition: 'all .2s ease'
            }}
          >
            Đổi
          </button>
        )}
      </div>
    </div>
    </>
  )
}

export default BuildRollerCard


