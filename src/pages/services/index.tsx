import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiService } from '../../services/api'
import '../../Homepage.css'

type ServiceCategory = 'onsite' | 'consulting' | 'prebuilt' | 'custom'

interface Service {
  id: number
  name: string
  description: string
  basePrice: number
  unit: string
  category: ServiceCategory
}

const deriveCategory = (name: string, description: string): ServiceCategory => {
  const text = `${name} ${description}`.toLowerCase()
  if (text.includes('tư vấn') || text.includes('consult')) return 'consulting'
  if (text.includes('lắp sẵn') || text.includes('ship') || text.includes('prebuilt')) return 'prebuilt'
  if (text.includes('lắp') || text.includes('vệ sinh') || text.includes('tại nhà') || text.includes('install')) return 'onsite'
  return 'custom'
}

const normalizeService = (raw: Record<string, unknown>): Service => {
  const id = Number(raw.id) || 0
  const name = String(raw.name ?? `Dịch vụ #${id}`)
  const description = String(raw.description ?? 'Đang cập nhật mô tả.')
  const basePrice = Number(raw.base_price ?? raw.basePrice ?? raw.price ?? 0)
  const unit = String(raw.unit ?? raw.unit_name ?? raw.unitName ?? 'lần')
  const category = deriveCategory(name, description)
  return { id, name, description, basePrice, unit, category }
}

const fallbackServices: Service[] = [
  normalizeService({
    id: -1,
    name: 'Vệ sinh & bảo trì PC',
    description: 'Kiểm tra, vệ sinh bụi, tra keo tản nhiệt và cân chỉnh dây cho hệ thống hoạt động mát mẻ.',
    base_price: 200000,
    unit: '1 máy'
  }),
  normalizeService({
    id: -2,
    name: 'Tư vấn cấu hình 1-1',
    description: 'Chuyên gia EzBuild giúp bạn chọn linh kiện phù hợp với nhu cầu chơi game và ngân sách.',
    base_price: 0,
    unit: '30 phút'
  }),
  normalizeService({
    id: -3,
    name: 'Lắp ráp & giao tận nơi',
    description: 'Đội ngũ EzBuild lắp ráp, test stress và giao hàng tận nhà. Bao gồm cài đặt driver & phần mềm cơ bản.',
    base_price: 299000,
    unit: '1 bộ'
  })
]

function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<ServiceCategory | 'all'>('all')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await ApiService.getAllServices()
        const normalized = (data as Record<string, unknown>[]).map(normalizeService)
        setServices(normalized.length > 0 ? normalized : fallbackServices)
      } catch (err) {
        console.error('Failed to load services:', err)
        setServices(fallbackServices)
        setError('Không thể tải danh sách dịch vụ, hiển thị gói mặc định.')
      } finally {
        setLoading(false)
      }
    }
    fetchServices()
  }, [])

  const serviceTypes = useMemo(() => {
    const set = new Set<ServiceCategory>()
    services.forEach(service => set.add(service.category))
    return Array.from(set)
  }, [services])

  const filteredServices = useMemo(() => {
    if (selectedType === 'all') return services
    return services.filter(service => service.category === selectedType)
  }, [services, selectedType])

  return (
    <div className="page bg-grid bg-radial p-6">
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="space-y-5 text-center">
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1 text-xs uppercase tracking-[0.3em] text-blue-200">
            🛠️ Dịch vụ EzBuild
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white">Chọn dịch vụ đồng hành cùng bạn</h1>
          <p className="text-gray-300 max-w-3xl mx-auto">
            EzBuild cung cấp trọn bộ dịch vụ từ tư vấn, vệ sinh, lắp đặt tại nhà cho tới giao hàng tận nơi. Chọn dịch vụ phù hợp để trải nghiệm build PC trọn vẹn.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-4 py-2 rounded-full border ${selectedType === 'all' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white/10 border-white/20 text-gray-200'}`}
            >
              Tất cả
            </button>
            {serviceTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-full border capitalize ${
                  selectedType === type ? 'bg-blue-500 text-white border-blue-500' : 'bg-white/10 border-white/20 text-gray-200'
                }`}
              >
                {type === 'onsite'
                  ? 'Lắp tại nhà'
                  : type === 'consulting'
                  ? 'Tư vấn'
                  : type === 'prebuilt'
                  ? 'Lắp sẵn & ship'
                  : 'Khác'}
              </button>
            ))}
          </div>
          {error && <p className="text-sm text-red-300">{error}</p>}
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
              <p className="text-white text-lg">Đang tải dịch vụ...</p>
            </div>
          </div>
        ) : (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredServices.map(service => (
              <article
                key={`${service.category}-${service.id}`}
                className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-lg p-6 shadow-xl hover:shadow-2xl transition-all"
              >
                <div className="flex flex-col gap-4 h-full">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold text-white">{service.name}</h2>
                      <p className="text-sm text-blue-200 uppercase tracking-[0.3em]">
                        {service.category === 'onsite'
                          ? 'On-site service'
                          : service.category === 'consulting'
                          ? 'Consulting'
                          : service.category === 'prebuilt'
                          ? 'Prebuilt & delivery'
                          : 'Custom service'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-emerald-400">
                        {service.basePrice > 0 ? `${service.basePrice.toLocaleString('vi-VN')} đ` : 'Miễn phí'}
                      </div>
                      <div className="text-xs text-gray-300">Đơn vị: {service.unit || '1 lần'}</div>
                    </div>
                  </div>
                  <p className="text-gray-200 leading-relaxed flex-1">{service.description}</p>
                  <div className="pt-2 flex flex-wrap gap-3">
                    <button
                      onClick={() => navigate('/checkout')}
                      className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all text-sm font-semibold shadow-lg"
                    >
                      Chọn dịch vụ
                    </button>
                    <button
                      onClick={() => navigate('/chat')}
                      className={`px-5 py-2 border rounded-xl text-sm transition-all ${
                        service.category === 'consulting'
                          ? 'border-white/40 text-white hover:bg-white/10'
                          : 'border-white/20 text-white/80 hover:bg-white/10'
                      }`}
                    >
                      {service.category === 'consulting' ? 'Trò chuyện với nhân viên' : 'Tư vấn thêm'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}

        <section className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-4 text-gray-200">
          <h2 className="text-2xl font-semibold text-white">Quy trình triển khai dịch vụ</h2>
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            {[
              { step: '1', title: 'Đăng ký dịch vụ', desc: 'Chọn gói dịch vụ hoặc liên hệ nhân viên để được tư vấn chi tiết.' },
              { step: '2', title: 'Xác nhận & lịch hẹn', desc: 'EzBuild liên hệ xác nhận thông tin và sắp xếp thời gian phù hợp.' },
              { step: '3', title: 'Triển khai', desc: 'Kỹ thuật viên hoặc chuyên gia EzBuild tiến hành theo gói dịch vụ bạn chọn.' },
              { step: '4', title: 'Bàn giao & chăm sóc', desc: 'Kiểm tra lần cuối, bàn giao và hỗ trợ bảo hành, bảo trì dài hạn.' }
            ].map(item => (
              <div key={item.step} className="bg-white/5 rounded-xl border border-white/10 p-4 shadow-lg">
                <div className="text-blue-300 text-sm uppercase tracking-[0.3em]">Bước {item.step}</div>
                <div className="text-lg font-semibold text-white mt-1 mb-2">{item.title}</div>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default ServicesPage

