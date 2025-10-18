import { useEffect, useMemo, useState } from 'react'
import { ApiService } from '../../services/api'
import { Link } from 'react-router-dom'

interface BuildItemDTO {
  id?: number
  // New flat fields from BuildDetailResponse
  product_price_id?: number
  product_name?: string
  product_id?: number
  supplier_id?: number
  supplier_name?: string
  price?: number
  // Legacy nested shape (fallback)
  productPrice?: {
    id?: number
    price?: number
    supplier?: { name?: string }
    product?: { name?: string }
  }
  quantity?: number
}

interface BuildDTO {
  id?: number
  name?: string
  totalPrice?: number
  total_price?: number
  createdAt?: string
  created_at?: string
  user?: { id?: number }
  items?: BuildItemDTO[]
}

function CustomerBuildsPage() {
  const currentUser = ApiService.getCurrentUser()
  const [builds, setBuilds] = useState<BuildDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        if (!currentUser?.id && !currentUser?.userId) {
          setError('Bạn cần đăng nhập để xem Build đã lưu')
          setIsLoading(false)
          return
        }
        const uid = String(currentUser.id || currentUser.userId)
        const data = await ApiService.getBuildsByUser(uid)
        // Fetch detail for each build to include items (in parallel)
        const withItems = await Promise.all(
          (data as unknown as BuildDTO[]).map(async (b) => {
            try {
              const detail = await fetch(`${import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8080'}/api/build/${b.id}`).then(r => r.json())
              return { ...b, items: detail.items } as BuildDTO
            } catch {
              return b
            }
          })
        )
        setBuilds(withItems)
      } catch {
        setError('Không thể tải danh sách build')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [currentUser?.id, currentUser?.userId])

  const totalBuilds = useMemo(() => builds.length, [builds])

  return (
    <div key="builds-page" className="page bg-grid-dark">
      <div className="layout">
        <aside className="sidebar builds-sidebar">
          <div className="px-6 py-8 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold">
                {(currentUser?.fullname as string || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-white text-lg">Builds</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">{totalBuilds} saved</div>
              </div>
            </div>
          </div>
          <nav className="flex-1 py-6">
            <div className="px-6 mb-4">
              <Link className="nav-item" to="/profile">Profile</Link>
              <Link className="nav-item-active" to="/builds">My Builds</Link>
              <Link className="nav-item" to="/pcbuilder">PC Builder</Link>
            </div>
          </nav>
        </aside>
        <main className="main">
          <div className="w-full px-6 md:px-8 lg:px-10 pt-2">
            {/* Banner / Header */}
            <div className="relative overflow-hidden rounded-2xl mb-8 border border-white/10 bg-white/5">
              <div className="relative px-6 py-6 flex items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">Build đã lưu</h1>
                  <p className="text-white/70">Xem lại các cấu hình bạn đã lưu để mua sau</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 text-sm text-white/90">{totalBuilds} build</div>
                  <Link to="/pcbuilder" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm">Tạo build mới</Link>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-2xl p-6 border border-white/10 bg-white/5 animate-pulse h-48" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center text-red-400">{error}</div>
            ) : builds.length === 0 ? (
              <div className="text-center text-gray-300">
                Chưa có build nào. <Link className="text-blue-400" to="/pcbuilder">Tạo build</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {builds.map((b) => (
                  <div
                    key={b.id}
                    className="relative rounded-2xl p-6 border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-200 hover:bg-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-black/40"
                  >
                    {/* Price badge */}
                    <div className="absolute -top-3 -right-3">
                      <div className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-lg">
                        {(() => { const anyB = b as unknown as Record<string, unknown>; const v = (typeof b.totalPrice === 'number' ? b.totalPrice : Number(anyB.total_price || 0)); return v.toLocaleString('vi-VN') })()} VND
                      </div>
                    </div>

                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-white font-semibold text-lg">{b.name || `Build #${b.id}`}</div>
                        <div className="text-gray-400 text-xs mt-1">{(() => { const anyB = b as unknown as Record<string, unknown>; const d = b.createdAt || (anyB.created_at as string | undefined); return d ? new Date(d).toLocaleString('vi-VN') : '-' })()}</div>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="mt-4 text-gray-300 text-sm divide-y divide-white/10">
                      {(b.items || []).slice(0, 4).map((it, idx) => {
                        const name = it.product_name || it.productPrice?.product?.name || `Item ${idx + 1}`
                        const price = Number(it.price ?? it.productPrice?.price ?? 0)
                        return (
                          <div key={idx} className="flex items-center justify-between py-1.5">
                            <span className="truncate pr-2">{name}</span>
                            <span className="text-white/60 whitespace-nowrap">{price > 0 ? `${price.toLocaleString('vi-VN')} VND` : ''} ×{it.quantity || 1}</span>
                          </div>
                        )
                      })}
                      {(b.items || []).length > 4 && (
                        <div className="text-gray-400 pt-1">+ {(b.items || []).length - 4} linh kiện khác</div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-5 flex gap-3">
                      <button
                        onClick={() => {
                          const mapped = (b.items || []).map((it) => {
                            const anyIt = it as unknown as Record<string, unknown>
                            const nestedProduct = (it.productPrice?.product as unknown as Record<string, unknown>) || {}
                            return {
                              category_id: (anyIt.category_id as number | undefined) || (nestedProduct.category as Record<string, unknown> | undefined)?.id as number | undefined,
                              product_id: anyIt.product_id as number | undefined,
                              productPriceId: it.product_price_id || it.productPrice?.id,
                              price: typeof anyIt.price === 'number' ? anyIt.price as number : (it.productPrice?.price || 0),
                              quantity: it.quantity || 1,
                              productName: it.product_name || (nestedProduct.name as string | undefined)
                            }
                          })
                          localStorage.setItem('ezbuild-selected-build', JSON.stringify({ id: b.id, name: b.name, items: mapped }))
                          window.location.href = '/pcbuilder'
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                        style={{ color: '#fff' }}
                      >
                        Xem
                      </button>
                      <button className="px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 text-sm" style={{ color: '#fff' }}>Chia sẻ</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default CustomerBuildsPage


