import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ApiService } from '../../services/api'
import '../../Homepage.css'

interface RequirementDetail {
  summary: string
  cpu?: string
  gpu?: string
  ramGB?: number
  storageGB?: number
}

interface Game {
  id: number
  name: string
  description: string
  genre: string
  developer: string
  releaseDate?: string
  minimumSpec?: string
  recommendedSpec?: string
  minimumDetail?: RequirementDetail
  recommendedDetail?: RequirementDetail
}

interface BuildSpecs {
  cpu?: string
  gpu?: string
  ramGB?: number
  storageGB?: number
}

interface RawGameRequirement {
  id?: number
  gameId?: number
  game_id?: number
  requirementType?: string
  requirement_type?: string
  type?: string
  level?: string
  minimumRequirement?: string
  recommendedRequirement?: string
  os?: string
  cpu?: string
  processor?: string
  gpu?: string
  graphics?: string
  ram?: string
  memory?: string
  ram_gb?: number
  ramGb?: number
  storage?: string
  disk?: string
  storage_gb?: number
  storageGb?: number
  notes?: string
  description?: string
}

const FALLBACK_GAMES: Game[] = [
  {
    id: -1,
    name: 'Valorant',
    description: 'Tựa game FPS 5v5 yêu cầu cấu hình trung bình, phù hợp cho các bộ PC phổ thông.',
    genre: 'FPS, Competitive',
    developer: 'Riot Games',
    releaseDate: '2020-06-02',
    minimumSpec: 'OS: Windows 7 64-bit • CPU: Intel i3-4150 • RAM: 4GB • GPU: GTX 730',
    recommendedSpec: 'OS: Windows 10 64-bit • CPU: Intel i5-9400F • RAM: 8GB • GPU: GTX 1060',
    minimumDetail: {
      summary: 'OS: Windows 7 64-bit • CPU: Intel i3-4150 • RAM: 4GB • GPU: GTX 730',
      cpu: 'Intel i3-4150',
      gpu: 'GTX 730',
      ramGB: 4
    },
    recommendedDetail: {
      summary: 'OS: Windows 10 64-bit • CPU: Intel i5-9400F • RAM: 8GB • GPU: GTX 1060',
      cpu: 'Intel i5-9400F',
      gpu: 'GTX 1060',
      ramGB: 8
    }
  },
  {
    id: -2,
    name: 'Cyberpunk 2077',
    description: 'Thế giới mở rộng lớn yêu cầu cấu hình cao, phù hợp cho những build PC hiệu năng mạnh.',
    genre: 'RPG, Open World',
    developer: 'CD Projekt RED',
    releaseDate: '2020-12-10',
    minimumSpec: 'OS: Windows 10 64-bit • CPU: Intel i5-3570K • RAM: 8GB • GPU: GTX 780 • Storage: 70GB SSD',
    recommendedSpec: 'OS: Windows 10 64-bit • CPU: Intel i7-4790 • RAM: 12GB • GPU: GTX 1060 • Storage: 70GB SSD',
    minimumDetail: {
      summary: 'OS: Windows 10 64-bit • CPU: Intel i5-3570K • RAM: 8GB • GPU: GTX 780 • Storage: 70GB SSD',
      cpu: 'Intel i5-3570K',
      gpu: 'GTX 780',
      ramGB: 8,
      storageGB: 70
    },
    recommendedDetail: {
      summary: 'OS: Windows 10 64-bit • CPU: Intel i7-4790 • RAM: 12GB • GPU: GTX 1060 • Storage: 70GB SSD',
      cpu: 'Intel i7-4790',
      gpu: 'GTX 1060',
      ramGB: 12,
      storageGB: 70
    }
  },
  {
    id: -3,
    name: 'League of Legends',
    description: 'Game MOBA nhẹ nhàng phù hợp với hầu hết cấu hình PC văn phòng.',
    genre: 'MOBA, Competitive',
    developer: 'Riot Games',
    releaseDate: '2009-10-27',
    minimumSpec: 'OS: Windows 7 • CPU: Intel Core i3 • RAM: 4GB • GPU: Intel HD 4000',
    recommendedSpec: 'OS: Windows 10 • CPU: Intel Core i5 • RAM: 8GB • GPU: GTX 560',
    minimumDetail: {
      summary: 'OS: Windows 7 • CPU: Intel Core i3 • RAM: 4GB • GPU: Intel HD 4000',
      cpu: 'Intel Core i3',
      gpu: 'Intel HD 4000',
      ramGB: 4
    },
    recommendedDetail: {
      summary: 'OS: Windows 10 • CPU: Intel Core i5 • RAM: 8GB • GPU: GTX 560',
      cpu: 'Intel Core i5',
      gpu: 'GTX 560',
      ramGB: 8
    }
  }
]

const normalizeGame = (raw: Record<string, unknown>): Game => {
  const id = Number(raw.id) || 0
  const name = String(raw.name ?? raw.title ?? `Game #${id}`)
  const description = String(raw.description ?? raw.summary ?? 'Đang cập nhật mô tả.')
  const genre = String(raw.genre ?? raw.genres ?? '')
  const developer = String(raw.developer ?? raw.studio ?? 'Đang cập nhật')
  const releaseDate = String(raw.releaseDate ?? raw.release_date ?? raw.publishedAt ?? '') || undefined
  return { id, name, description, genre, developer, releaseDate }
}

const parseGBValue = (value?: string | number): number | undefined => {
  if (typeof value === 'number') return value
  if (!value) return undefined
  const match = String(value).match(/(\d+(?:\.\d+)?)\s*(tb|gb)/i)
  if (!match) return undefined
  let gb = parseFloat(match[1])
  if (match[2].toLowerCase() === 'tb') {
    gb *= 1024
  }
  return gb
}

const normalizeRequirement = (raw: RawGameRequirement) => {
  const gameId = Number(
    raw.gameId ??
      raw.game_id ??
      (typeof raw === 'object' && 'game' in raw && raw.game ? ((raw as unknown as { game?: { id?: unknown } }).game?.id as number) : undefined)
  )
  const typeRaw = String(
    raw.requirementType ??
      raw.requirement_type ??
      raw.type ??
      raw.level ??
      ''
  ).toLowerCase()
  const cpu = raw.cpu ?? raw.processor
  const gpu = raw.gpu ?? raw.graphics
  const ram = raw.ram ?? raw.memory
  const storage = raw.storage ?? raw.disk
  const os = raw.os
  const notes = raw.notes ?? raw.description ?? raw.minimumRequirement ?? raw.recommendedRequirement

  const parts: string[] = []
  if (os) parts.push(`OS: ${os}`)
  if (cpu) parts.push(`CPU: ${cpu}`)
  if (gpu) parts.push(`GPU: ${gpu}`)
  const ramSummary =
    ram ??
    (typeof raw.ram_gb === 'number' ? `${raw.ram_gb}GB` : undefined) ??
    (typeof raw.ramGb === 'number' ? `${raw.ramGb}GB` : undefined)
  if (ramSummary) parts.push(`RAM: ${ramSummary}`)
  const storageSummary =
    storage ??
    (typeof raw.storage_gb === 'number' ? `${raw.storage_gb}GB` : undefined) ??
    (typeof raw.storageGb === 'number' ? `${raw.storageGb}GB` : undefined)
  if (storageSummary) parts.push(`Storage: ${storageSummary}`)
  if (notes && parts.length === 0) parts.push(notes)
  const summary = parts.join(' • ') || notes || 'Đang cập nhật'

  const isRecommended = typeRaw.includes('recommend')
  const isMinimum = typeRaw.includes('minimum') || typeRaw.includes('min')

  return {
    gameId,
    type: isRecommended ? 'recommended' : isMinimum ? 'minimum' : 'other',
    detail: {
      summary,
      cpu: cpu ? String(cpu) : undefined,
      gpu: gpu ? String(gpu) : undefined,
      ramGB:
        typeof raw.ram_gb === 'number'
          ? raw.ram_gb
          : typeof raw.ramGb === 'number'
          ? raw.ramGb
          : parseGBValue(ramSummary),
      storageGB:
        typeof raw.storage_gb === 'number'
          ? raw.storage_gb
          : typeof raw.storageGb === 'number'
          ? raw.storageGb
          : parseGBValue(storageSummary)
    } as RequirementDetail
  }
}

// Hàm load requirements cho một game cụ thể
const loadGameRequirements = async (gameId: number): Promise<{ minimum?: RequirementDetail; recommended?: RequirementDetail }> => {
  try {
    console.log(`Loading requirements for game_id=${gameId}...`)
    const requirementData = await ApiService.getGameRequirementsByGameId(gameId)
    console.log(`Received requirementData:`, requirementData)
    console.log(`Type of requirementData:`, typeof requirementData)
    console.log(`Is array?`, Array.isArray(requirementData))
    
    // Kiểm tra và convert sang array
    let requirementsArray: RawGameRequirement[] = []
    if (Array.isArray(requirementData)) {
      requirementsArray = requirementData as RawGameRequirement[]
    } else if (requirementData && typeof requirementData === 'object') {
      // Nếu là object, thử convert sang array
      requirementsArray = [requirementData as RawGameRequirement]
    } else {
      console.warn(`requirementData is not an array or object, got:`, requirementData)
      requirementsArray = []
    }
    
    console.log(`Normalizing ${requirementsArray.length} requirements...`)
    const normalizedRequirements = requirementsArray.map(normalizeRequirement)
    console.log(`Normalized requirements:`, normalizedRequirements)
    
    const result: { minimum?: RequirementDetail; recommended?: RequirementDetail } = {}
    normalizedRequirements.forEach((req) => {
      if (req.type === 'recommended') {
        result.recommended = req.detail
      } else if (req.type === 'minimum') {
        result.minimum = req.detail
      } else if (!result.minimum) {
        result.minimum = req.detail
      } else if (!result.recommended) {
        result.recommended = req.detail
      }
    })
    
    console.log(`Final result:`, result)
    return result
  } catch (err) {
    console.error('Error loading game requirements:', err)
    return {}
  }
}

const loadPersistedBuildSpecs = (): { specs: BuildSpecs; name?: string } | null => {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('ezbuild-canirunit')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && parsed.buildSpecs) {
      return {
        specs: parsed.buildSpecs as BuildSpecs,
        name: parsed.buildName as string | undefined
      }
    }
  } catch {
    return null
  }
  return null
}

const persistBuildSpecs = (data: { specs: BuildSpecs; name?: string } | null) => {
  if (typeof window === 'undefined') return
  try {
    if (!data) {
      localStorage.removeItem('ezbuild-canirunit')
    } else {
      localStorage.setItem('ezbuild-canirunit', JSON.stringify({ buildSpecs: data.specs, buildName: data.name }))
    }
  } catch {
    // ignore storage errors
  }
}

const formatGBValue = (value?: number): string => {
  if (!value || value <= 0) return 'Chưa xác định'
  if (value >= 1024) {
    const tb = value / 1024
    return `${Number.isInteger(tb) ? tb.toFixed(0) : tb.toFixed(1)} TB`
  }
  return `${Number.isInteger(value) ? value : value.toFixed(1)} GB`
}

const compareBuildWithRequirement = (build?: BuildSpecs, requirement?: RequirementDetail) => {
  if (!build || !requirement) return null
  return {
    requirement,
    ramOk: requirement.ramGB !== undefined ? (build.ramGB ?? 0) >= requirement.ramGB : undefined,
    storageOk: requirement.storageGB !== undefined ? (build.storageGB ?? 0) >= requirement.storageGB : undefined
  }
}

function GamesPage() {
  const location = useLocation()
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenre, setSelectedGenre] = useState<string>('all')
  const [selectedDeveloper, setSelectedDeveloper] = useState<string>('all')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const navigate = useNavigate()
  const locationState = location.state as { buildSpecs?: BuildSpecs; buildName?: string } | null
  const [activeBuild, setActiveBuild] = useState<{ specs: BuildSpecs; name?: string } | null>(() => {
    if (locationState?.buildSpecs) {
      return { specs: locationState.buildSpecs, name: locationState.buildName }
    }
    return loadPersistedBuildSpecs()
  })
  
  // State cho chọn cấu hình
  const [selectedSpecs, setSelectedSpecs] = useState<BuildSpecs>({
    cpu: '',
    gpu: '',
    ramGB: undefined,
    storageGB: undefined
  })
  const [showSpecSelector, setShowSpecSelector] = useState(false)
  const [showMinSpecModal, setShowMinSpecModal] = useState(false)
  const [selectedGameForSpec, setSelectedGameForSpec] = useState<Game | null>(null)
  const [gameRequirements, setGameRequirements] = useState<{ minimum?: RequirementDetail; recommended?: RequirementDetail } | null>(null)
  const [loadingRequirements, setLoadingRequirements] = useState(false)
  const [showCompareModal, setShowCompareModal] = useState(false)
  const [gameToCompare, setGameToCompare] = useState<Game | null>(null)
  
  // State cho danh sách CPU, GPU, RAM, Storage
  const [cpus, setCpus] = useState<Array<{ id: number; name: string }>>([])
  const [gpus, setGpus] = useState<Array<{ id: number; name: string }>>([])
  const [loadingSpecs, setLoadingSpecs] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim().toLowerCase()), 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    if (locationState?.buildSpecs) {
      const payload = { specs: locationState.buildSpecs, name: locationState.buildName }
      setActiveBuild(payload)
      persistBuildSpecs(payload)
      navigate(location.pathname, { replace: true, state: {} })
    } else if (!activeBuild) {
      const persisted = loadPersistedBuildSpecs()
      if (persisted) {
        setActiveBuild(persisted)
      }
    }
  }, [locationState, activeBuild, navigate, location.pathname])

  const activeBuildSpecs = activeBuild?.specs
  const activeBuildName = activeBuild?.name ?? 'Build của bạn'

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true)
        setError(null)

        const [gameData, requirementData] = await Promise.all([
          ApiService.getAllGames(),
          ApiService.getAllGameRequirements().catch(() => [])
        ])

        const normalizedGames = (gameData as Record<string, unknown>[] | undefined)?.map(normalizeGame) ?? []
        const normalizedRequirements = (requirementData as RawGameRequirement[] | undefined)?.map(normalizeRequirement) ?? []

        const requirementMap = new Map<number, { minimum?: RequirementDetail; recommended?: RequirementDetail }>()
        normalizedRequirements.forEach((req) => {
          if (!req.gameId) return
          const current = requirementMap.get(req.gameId) ?? {}
          if (req.type === 'recommended') {
            current.recommended = req.detail
          } else if (req.type === 'minimum') {
            current.minimum = req.detail
          } else if (!current.minimum) {
            current.minimum = req.detail
          } else if (!current.recommended) {
            current.recommended = req.detail
          }
          requirementMap.set(req.gameId, current)
        })

        const mergedGames = normalizedGames.length > 0 ? normalizedGames : FALLBACK_GAMES
        const gamesWithSpec = mergedGames.map((game) => {
          const spec = requirementMap.get(game.id)
          return {
            ...game,
            minimumSpec: spec?.minimum?.summary ?? game.minimumSpec,
            recommendedSpec: spec?.recommended?.summary ?? game.recommendedSpec,
            minimumDetail: spec?.minimum ?? game.minimumDetail,
            recommendedDetail: spec?.recommended ?? game.recommendedDetail
          }
        })

        setGames(gamesWithSpec)
      } catch (err) {
        console.error('Failed to load games:', err)
        setGames(FALLBACK_GAMES)
        setError('Không thể tải danh sách game từ server, hiển thị dữ liệu tham khảo.')
      } finally {
        setLoading(false)
      }
    }

    fetchGames()
  }, [])
  
  // Load CPU và GPU khi mở spec selector
  useEffect(() => {
    if (showSpecSelector && (cpus.length === 0 || gpus.length === 0)) {
      const loadSpecs = async () => {
        setLoadingSpecs(true)
        try {
          const [cpuData, gpuData] = await Promise.all([
            ApiService.getCPUs().catch(() => []),
            ApiService.getProductsByCategory(2).catch(() => []) // GPU category_id = 2
          ])
          
          setCpus((cpuData as Array<Record<string, unknown>>).map(cpu => ({
            id: Number(cpu.id) || 0,
            name: String(cpu.name || '')
          })))
          
          setGpus((gpuData as Array<Record<string, unknown>>).map(gpu => ({
            id: Number(gpu.id) || 0,
            name: String(gpu.name || '')
          })))
        } catch (err) {
          console.error('Error loading specs:', err)
        } finally {
          setLoadingSpecs(false)
        }
      }
      loadSpecs()
    }
  }, [showSpecSelector, cpus.length, gpus.length])
  
  // Hàm kiểm tra game có thể chạy được với specs đã chọn
  const canRunGame = (game: Game, specs: BuildSpecs): boolean => {
    if (!game.minimumDetail) return true // Nếu không có requirement thì cho phép
    
    const req = game.minimumDetail
    
    // Kiểm tra RAM
    if (req.ramGB !== undefined && specs.ramGB !== undefined) {
      if (specs.ramGB < req.ramGB) return false
    }
    
    // Kiểm tra Storage
    if (req.storageGB !== undefined && specs.storageGB !== undefined) {
      if (specs.storageGB < req.storageGB) return false
    }
    
    // CPU và GPU chỉ kiểm tra nếu có giá trị (không so sánh string vì phức tạp)
    // Có thể cải thiện sau bằng cách parse model number
    
    return true
  }
  
  // Kiểm tra xem có specs nào được chọn không
  const hasSelectedSpecs = selectedSpecs.cpu || selectedSpecs.gpu || selectedSpecs.ramGB || selectedSpecs.storageGB

  const genres = useMemo(() => {
    const set = new Set<string>()
    games.forEach(game => {
      if (game.genre) {
        game.genre.split(',').forEach(g => {
          const trimmed = g.trim()
          if (trimmed) set.add(trimmed)
        })
      }
    })
    return Array.from(set).sort()
  }, [games])

  const developers = useMemo(() => {
    const set = new Set<string>()
    games.forEach(game => {
      if (game.developer) {
        const trimmed = game.developer.trim()
        if (trimmed) set.add(trimmed)
      }
    })
    return Array.from(set).sort()
  }, [games])

  const filteredGames = useMemo(() => {
    const keyword = debouncedSearch
    return games
      .filter(game => {
        // Filter theo genre
        if (selectedGenre !== 'all') {
          const genresOfGame = (game.genre || '').split(',').map(g => g.trim().toLowerCase())
          if (!genresOfGame.includes(selectedGenre.toLowerCase())) return false
        }
        
        // Filter theo developer
        if (selectedDeveloper !== 'all') {
          if ((game.developer || '').toLowerCase() !== selectedDeveloper.toLowerCase()) return false
        }
        
        // Filter theo search keyword
        if (keyword) {
          const matchesKeyword = (
            game.name.toLowerCase().includes(keyword) ||
            game.description.toLowerCase().includes(keyword) ||
            (game.genre || '').toLowerCase().includes(keyword) ||
            (game.developer || '').toLowerCase().includes(keyword)
          )
          if (!matchesKeyword) return false
        }
        
        // Filter theo specs đã chọn (chỉ hiển thị game có thể chạy được)
        if (hasSelectedSpecs) {
          return canRunGame(game, selectedSpecs)
        }
        
        return true
      })
      .sort((a, b) => {
        const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0
        const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0
        return dateB - dateA
      })
  }, [games, selectedGenre, selectedDeveloper, debouncedSearch, selectedSpecs, hasSelectedSpecs])

  if (loading) {
    return (
      <div className="page bg-grid bg-radial">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
            <p className="text-white text-lg">Đang tải danh sách game...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page bg-grid bg-radial p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="text-center space-y-4">
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1 text-xs uppercase tracking-[0.3em] text-blue-200">
            🎮 Games compatibility
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            Chọn game bạn yêu thích
          </h1>
          <p className="text-gray-300 max-w-3xl mx-auto">
            Khám phá các tựa game phổ biến và kiểm tra cấu hình đề xuất để chắc chắn rằng chiếc PC bạn build tại EzBuild có thể chiến mượt mà.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <input
              type="text"
              placeholder="Tìm game theo tên, thể loại, nhà phát triển..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-80 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex flex-wrap gap-3 justify-center">
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all" className="text-black">Tất cả thể loại</option>
                {genres.map((genre) => (
                  <option key={genre} value={genre} className="text-black">
                    {genre}
                  </option>
                ))}
              </select>
              <select
                value={selectedDeveloper}
                onChange={(e) => setSelectedDeveloper(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all" className="text-black">Tất cả nhà phát triển</option>
                {developers.map((developer) => (
                  <option key={developer} value={developer} className="text-black">
                    {developer}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowSpecSelector(true)}
                className={`px-4 py-3 rounded-xl text-white font-medium transition-all shadow-lg ${
                  hasSelectedSpecs
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 border border-blue-400/30'
                }`}
              >
                {hasSelectedSpecs ? '✓ Đã chọn cấu hình' : 'Chọn cấu hình'}
              </button>
            </div>
          </div>
          {hasSelectedSpecs && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-300">
              <span>Đang lọc: </span>
              {selectedSpecs.cpu && <span className="bg-white/10 px-2 py-1 rounded">CPU: {selectedSpecs.cpu}</span>}
              {selectedSpecs.gpu && <span className="bg-white/10 px-2 py-1 rounded">GPU: {selectedSpecs.gpu}</span>}
              {selectedSpecs.ramGB && <span className="bg-white/10 px-2 py-1 rounded">RAM: {selectedSpecs.ramGB}GB</span>}
              {selectedSpecs.storageGB && <span className="bg-white/10 px-2 py-1 rounded">Storage: {selectedSpecs.storageGB}GB</span>}
              <button
                onClick={() => {
                  setSelectedSpecs({ cpu: '', gpu: '', ramGB: undefined, storageGB: undefined })
                }}
                className="px-3 py-1 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-lg transition-all text-sm font-medium shadow-md"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
          {error && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 text-sm text-red-200 rounded-xl">
              <span>⚠️</span> {error}
            </div>
          )}
        </header>

        {activeBuildSpecs && (
          <section className="bg-white/10 border border-white/10 rounded-2xl p-6 text-gray-200 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">So sánh với: {activeBuildName}</h2>
                <p className="text-xs text-gray-400 uppercase tracking-[0.2em]">
                  Thông số được ước lượng từ build đã lưu của bạn
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveBuild(null)
                  persistBuildSpecs(null)
                }}
                className="self-start md:self-auto px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-lg transition-all shadow-md text-xs font-medium"
              >
                Xóa build khỏi so sánh
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                <div className="text-xs text-gray-400 uppercase tracking-[0.2em]">CPU / GPU</div>
                <p><span className="text-gray-400">CPU:</span> <span className="text-white">{activeBuildSpecs?.cpu ?? 'Chưa xác định'}</span></p>
                <p><span className="text-gray-400">GPU:</span> <span className="text-white">{activeBuildSpecs?.gpu ?? 'Chưa xác định'}</span></p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                <div className="text-xs text-gray-400 uppercase tracking-[0.2em]">Dung lượng</div>
                <p><span className="text-gray-400">RAM:</span> <span className="text-white">{formatGBValue(activeBuildSpecs?.ramGB)}</span></p>
                <p><span className="text-gray-400">Storage:</span> <span className="text-white">{formatGBValue(activeBuildSpecs?.storageGB)}</span></p>
              </div>
            </div>
          </section>
        )}

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredGames.length === 0 ? (
            <div className="col-span-full bg-white/5 border border-white/10 rounded-2xl p-10 text-center text-gray-300">
              Không tìm thấy game phù hợp. Hãy thử bộ lọc khác nhé!
            </div>
          ) : (
            filteredGames.map((game) => {
              const release = game.releaseDate ? new Date(game.releaseDate).toLocaleDateString('vi-VN') : 'Không rõ'
              const minComparison = activeBuildSpecs ? compareBuildWithRequirement(activeBuildSpecs, game.minimumDetail) : null
              return (
                <article
                  key={game.id}
                  className="relative flex flex-col bg-white/10 border border-white/10 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex-1 p-6 flex flex-col gap-4">
                    <div className="space-y-2">
                      <h2 className="text-white text-2xl font-semibold">{game.name}</h2>
                      <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-blue-200">
                        {(game.genre || '').split(',').map((genre) => {
                          const trimmed = genre.trim()
                          return trimmed ? (
                            <span key={trimmed} className="bg-white/10 border border-white/10 rounded-full px-3 py-1">
                              {trimmed}
                            </span>
                          ) : null
                        })}
                      </div>
                      <p className="text-gray-300 text-sm line-clamp-3">{game.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm text-gray-300">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-[0.2em] mb-1">Phát triển</p>
                        <p className="font-medium text-white">{game.developer || 'Đang cập nhật'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-[0.2em] mb-1">Phát hành</p>
                        <p className="font-medium text-white">{release}</p>
                      </div>
                    </div>
                    {(game.minimumSpec || game.recommendedSpec) && (
                      <div className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-2 text-sm">
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Yêu cầu hệ thống</p>
                        {game.minimumSpec && (
                          <p className="text-gray-300">
                            <span className="font-semibold text-white">Tối thiểu: </span>
                            {game.minimumSpec}
                          </p>
                        )}
                        {game.recommendedSpec && (
                          <p className="text-gray-300">
                            <span className="font-semibold text-white">Khuyến nghị: </span>
                            {game.recommendedSpec}
                          </p>
                        )}
                      </div>
                    )}
                    {minComparison && (
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3 text-sm">
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                          So với build của bạn (yêu cầu tối thiểu)
                        </p>
                        <div className="space-y-2 text-gray-200">
                          <div className={`flex items-center justify-between ${minComparison.ramOk === false ? 'text-red-300' : minComparison.ramOk ? 'text-emerald-300' : 'text-gray-300'}`}>
                            <span>RAM</span>
                            <span>
                              {formatGBValue(activeBuildSpecs?.ramGB)} / {formatGBValue(minComparison.requirement.ramGB)}
                            </span>
                          </div>
                          <div className={`flex items-center justify-between ${minComparison.storageOk === false ? 'text-red-300' : minComparison.storageOk ? 'text-emerald-300' : 'text-gray-300'}`}>
                            <span>Storage</span>
                            <span>
                              {formatGBValue(activeBuildSpecs?.storageGB)} / {formatGBValue(minComparison.requirement.storageGB)}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400 space-y-1">
                          <div>
                            CPU của bạn: <span className="text-white">{activeBuildSpecs?.cpu ?? 'Chưa xác định'}</span>
                          </div>
                          {minComparison.requirement.cpu && (
                            <div>
                              CPU yêu cầu: <span className="text-white">{minComparison.requirement.cpu}</span>
                            </div>
                          )}
                          <div>
                            GPU của bạn: <span className="text-white">{activeBuildSpecs?.gpu ?? 'Chưa xác định'}</span>
                          </div>
                          {minComparison.requirement.gpu && (
                            <div>
                              GPU yêu cầu: <span className="text-white">{minComparison.requirement.gpu}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="px-6 pb-6 space-y-3">
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          setSelectedGameForSpec(game)
                          setShowMinSpecModal(true)
                          setLoadingRequirements(true)
                          setGameRequirements(null)
                          
                          // Load requirements cho game này
                          const requirements = await loadGameRequirements(game.id)
                          setGameRequirements(requirements)
                          setLoadingRequirements(false)
                        }}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all text-sm font-medium shadow-md"
                      >
                        📋 Cấu hình tối thiểu
                      </button>
                      {hasSelectedSpecs && (
                        <button
                          onClick={() => {
                            setGameToCompare(game)
                            setShowCompareModal(true)
                          }}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all text-sm font-medium"
                        >
                          ⚖️ So sánh
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => navigate('/pcbuilder', { state: { highlightGame: game.name } })}
                      className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-2xl flex items-center justify-center gap-2 text-sm font-semibold"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 6a6 6 0 014.5 0m-4.5 12a6 6 0 014.5 0m-10.5-6h12" />
                      </svg>
                      Gợi ý cấu hình cho {game.name}
                    </button>
                  </div>
                </article>
              )
            })
          )}
        </section>

        <section className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-gray-200 space-y-4">
          <h2 className="text-2xl font-semibold text-white">Bạn cần hỗ trợ chọn cấu hình?</h2>
          <p>
            Đội ngũ EzBuild luôn sẵn sàng tư vấn chi tiết để đảm bảo chiếc PC của bạn chiến mượt mọi tựa game yêu thích.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/pcbuilder')}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl"
            >
              Tự build ngay
            </button>
            <button
              onClick={() => navigate('/chat')}
              className="px-6 py-3 border border-white/40 text-white rounded-xl hover:bg-white/10 transition-all"
            >
              Trò chuyện với chuyên gia
            </button>
          </div>
        </section>
      </div>
      
      {/* Modal chọn cấu hình */}
      {showSpecSelector && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-white/20 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Chọn cấu hình PC của bạn</h2>
              <button
                onClick={() => setShowSpecSelector(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">CPU</label>
                {loadingSpecs ? (
                  <div className="text-gray-400">Đang tải...</div>
                ) : (
                  <select
                    value={selectedSpecs.cpu}
                    onChange={(e) => setSelectedSpecs({ ...selectedSpecs, cpu: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white"
                  >
                    <option value="" className="text-black">Chọn CPU</option>
                    {cpus.map((cpu) => (
                      <option key={cpu.id} value={cpu.name} className="text-black">
                        {cpu.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">GPU</label>
                {loadingSpecs ? (
                  <div className="text-gray-400">Đang tải...</div>
                ) : (
                  <select
                    value={selectedSpecs.gpu}
                    onChange={(e) => setSelectedSpecs({ ...selectedSpecs, gpu: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white"
                  >
                    <option value="" className="text-black">Chọn GPU</option>
                    {gpus.map((gpu) => (
                      <option key={gpu.id} value={gpu.name} className="text-black">
                        {gpu.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">RAM (GB)</label>
                <input
                  type="number"
                  min="1"
                  value={selectedSpecs.ramGB || ''}
                  onChange={(e) => setSelectedSpecs({ ...selectedSpecs, ramGB: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white"
                  placeholder="Nhập dung lượng RAM (GB)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Storage (GB)</label>
                <input
                  type="number"
                  min="1"
                  value={selectedSpecs.storageGB || ''}
                  onChange={(e) => setSelectedSpecs({ ...selectedSpecs, storageGB: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white"
                  placeholder="Nhập dung lượng Storage (GB)"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setSelectedSpecs({ cpu: '', gpu: '', ramGB: undefined, storageGB: undefined })
                  setShowSpecSelector(false)
                }}
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all"
              >
                Xóa tất cả
              </button>
              <button
                onClick={() => setShowSpecSelector(false)}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal hiển thị cấu hình tối thiểu */}
      {showMinSpecModal && selectedGameForSpec && (
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
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
            padding: '24px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '24px'
            }}>
              <h2 style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                Cấu hình tối thiểu - {selectedGameForSpec.name}
              </h2>
              <button
                onClick={() => {
                  setShowMinSpecModal(false)
                  setSelectedGameForSpec(null)
                  setGameRequirements(null)
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {loadingRequirements ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                  <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>Đang tải thông tin cấu hình...</p>
                </div>
              ) : (gameRequirements?.minimum || selectedGameForSpec.minimumDetail) ? (
                <>
                  <div style={{
                    backgroundColor: '#374151',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '20px'
                  }}>
                    <h3 style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Yêu cầu tối thiểu</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {(gameRequirements?.minimum?.cpu || selectedGameForSpec.minimumDetail?.cpu) && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          backgroundColor: '#4b5563',
                          padding: '12px',
                          borderRadius: '6px'
                        }}>
                          <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', fontWeight: '500', width: '80px', flexShrink: 0 }}>CPU:</span>
                          <span style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>{(gameRequirements?.minimum?.cpu || selectedGameForSpec.minimumDetail?.cpu)}</span>
                        </div>
                      )}
                      {(gameRequirements?.minimum?.gpu || selectedGameForSpec.minimumDetail?.gpu) && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          backgroundColor: '#4b5563',
                          padding: '12px',
                          borderRadius: '6px'
                        }}>
                          <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', fontWeight: '500', width: '80px', flexShrink: 0 }}>GPU:</span>
                          <span style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>{(gameRequirements?.minimum?.gpu || selectedGameForSpec.minimumDetail?.gpu)}</span>
                        </div>
                      )}
                      {(gameRequirements?.minimum?.ramGB || selectedGameForSpec.minimumDetail?.ramGB) && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          backgroundColor: '#4b5563',
                          padding: '12px',
                          borderRadius: '6px'
                        }}>
                          <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', fontWeight: '500', width: '80px', flexShrink: 0 }}>RAM:</span>
                          <span style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>{formatGBValue(gameRequirements?.minimum?.ramGB || selectedGameForSpec.minimumDetail?.ramGB)}</span>
                        </div>
                      )}
                      {(gameRequirements?.minimum?.storageGB || selectedGameForSpec.minimumDetail?.storageGB) && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          backgroundColor: '#4b5563',
                          padding: '12px',
                          borderRadius: '6px'
                        }}>
                          <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', fontWeight: '500', width: '80px', flexShrink: 0 }}>Storage:</span>
                          <span style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>{formatGBValue(gameRequirements?.minimum?.storageGB || selectedGameForSpec.minimumDetail?.storageGB)}</span>
                        </div>
                      )}
                    </div>
                    {(selectedGameForSpec.minimumSpec || gameRequirements?.minimum?.summary) && (
                      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px', fontWeight: '500', marginBottom: '8px' }}>Chi tiết đầy đủ:</p>
                        <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '13px', lineHeight: '1.6' }}>{selectedGameForSpec.minimumSpec || gameRequirements?.minimum?.summary}</p>
                      </div>
                    )}
                  </div>
                  
                  {(gameRequirements?.recommended || selectedGameForSpec.recommendedDetail) && (
                    <div style={{
                      backgroundColor: '#374151',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      padding: '20px'
                    }}>
                      <h3 style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Cấu hình khuyến nghị</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {(gameRequirements?.recommended?.cpu || selectedGameForSpec.recommendedDetail?.cpu) && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px',
                            backgroundColor: '#4b5563',
                            padding: '12px',
                            borderRadius: '6px'
                          }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', fontWeight: '500', width: '80px', flexShrink: 0 }}>CPU:</span>
                            <span style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>{(gameRequirements?.recommended?.cpu || selectedGameForSpec.recommendedDetail?.cpu)}</span>
                          </div>
                        )}
                        {(gameRequirements?.recommended?.gpu || selectedGameForSpec.recommendedDetail?.gpu) && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px',
                            backgroundColor: '#4b5563',
                            padding: '12px',
                            borderRadius: '6px'
                          }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', fontWeight: '500', width: '80px', flexShrink: 0 }}>GPU:</span>
                            <span style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>{(gameRequirements?.recommended?.gpu || selectedGameForSpec.recommendedDetail?.gpu)}</span>
                          </div>
                        )}
                        {(gameRequirements?.recommended?.ramGB || selectedGameForSpec.recommendedDetail?.ramGB) && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px',
                            backgroundColor: '#4b5563',
                            padding: '12px',
                            borderRadius: '6px'
                          }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', fontWeight: '500', width: '80px', flexShrink: 0 }}>RAM:</span>
                            <span style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>{formatGBValue(gameRequirements?.recommended?.ramGB || selectedGameForSpec.recommendedDetail?.ramGB)}</span>
                          </div>
                        )}
                        {(gameRequirements?.recommended?.storageGB || selectedGameForSpec.recommendedDetail?.storageGB) && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px',
                            backgroundColor: '#4b5563',
                            padding: '12px',
                            borderRadius: '6px'
                          }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', fontWeight: '500', width: '80px', flexShrink: 0 }}>Storage:</span>
                            <span style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>{formatGBValue(gameRequirements?.recommended?.storageGB || selectedGameForSpec.recommendedDetail?.storageGB)}</span>
                          </div>
                        )}
                      </div>
                      {(selectedGameForSpec.recommendedSpec || gameRequirements?.recommended?.summary) && (
                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px', fontWeight: '500', marginBottom: '8px' }}>Chi tiết đầy đủ:</p>
                          <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '13px', lineHeight: '1.6' }}>{selectedGameForSpec.recommendedSpec || gameRequirements?.recommended?.summary}</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '32px 0',
                  backgroundColor: '#374151',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '16px' }}>Chưa có thông tin cấu hình cho game này</p>
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                onClick={() => {
                  setShowMinSpecModal(false)
                  setSelectedGameForSpec(null)
                  setGameRequirements(null)
                }}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#374151',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#374151'}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal so sánh cấu hình */}
      {showCompareModal && gameToCompare && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border-2 border-gray-600 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">So sánh cấu hình - {gameToCompare.name}</h2>
              <button
                onClick={() => {
                  setShowCompareModal(false)
                  setGameToCompare(null)
                }}
                className="text-gray-300 hover:text-white text-3xl font-bold leading-none"
              >
                ×
              </button>
            </div>
            
            {gameToCompare.minimumDetail ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700 border-2 border-gray-500 rounded-xl p-5">
                    <h3 className="text-xl font-bold text-white mb-4">Cấu hình của bạn</h3>
                    <div className="space-y-3 text-base">
                      <div className="flex items-start gap-3 bg-gray-600/50 p-3 rounded-lg">
                        <span className="text-gray-300 font-medium w-24 flex-shrink-0">CPU:</span>
                        <span className="text-white font-semibold">{selectedSpecs.cpu || 'Chưa chọn'}</span>
                      </div>
                      <div className="flex items-start gap-3 bg-gray-600/50 p-3 rounded-lg">
                        <span className="text-gray-300 font-medium w-24 flex-shrink-0">GPU:</span>
                        <span className="text-white font-semibold">{selectedSpecs.gpu || 'Chưa chọn'}</span>
                      </div>
                      <div className="flex items-start gap-3 bg-gray-600/50 p-3 rounded-lg">
                        <span className="text-gray-300 font-medium w-24 flex-shrink-0">RAM:</span>
                        <span className="text-white font-semibold">{formatGBValue(selectedSpecs.ramGB)}</span>
                      </div>
                      <div className="flex items-start gap-3 bg-gray-600/50 p-3 rounded-lg">
                        <span className="text-gray-300 font-medium w-24 flex-shrink-0">Storage:</span>
                        <span className="text-white font-semibold">{formatGBValue(selectedSpecs.storageGB)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-700 border-2 border-gray-500 rounded-xl p-5">
                    <h3 className="text-xl font-bold text-white mb-4">Yêu cầu tối thiểu</h3>
                    <div className="space-y-3 text-base">
                      <div className="flex items-start gap-3 bg-gray-600/50 p-3 rounded-lg">
                        <span className="text-gray-300 font-medium w-24 flex-shrink-0">CPU:</span>
                        <span className="text-white font-semibold">{gameToCompare.minimumDetail.cpu || 'Chưa xác định'}</span>
                      </div>
                      <div className="flex items-start gap-3 bg-gray-600/50 p-3 rounded-lg">
                        <span className="text-gray-300 font-medium w-24 flex-shrink-0">GPU:</span>
                        <span className="text-white font-semibold">{gameToCompare.minimumDetail.gpu || 'Chưa xác định'}</span>
                      </div>
                      <div className="flex items-start gap-3 bg-gray-600/50 p-3 rounded-lg">
                        <span className="text-gray-300 font-medium w-24 flex-shrink-0">RAM:</span>
                        <span className={`font-semibold ${selectedSpecs.ramGB && gameToCompare.minimumDetail.ramGB && selectedSpecs.ramGB >= gameToCompare.minimumDetail.ramGB ? 'text-green-400' : selectedSpecs.ramGB && gameToCompare.minimumDetail.ramGB ? 'text-red-400' : 'text-white'}`}>
                          {formatGBValue(gameToCompare.minimumDetail.ramGB)}
                        </span>
                      </div>
                      <div className="flex items-start gap-3 bg-gray-600/50 p-3 rounded-lg">
                        <span className="text-gray-300 font-medium w-24 flex-shrink-0">Storage:</span>
                        <span className={`font-semibold ${selectedSpecs.storageGB && gameToCompare.minimumDetail.storageGB && selectedSpecs.storageGB >= gameToCompare.minimumDetail.storageGB ? 'text-green-400' : selectedSpecs.storageGB && gameToCompare.minimumDetail.storageGB ? 'text-red-400' : 'text-white'}`}>
                          {formatGBValue(gameToCompare.minimumDetail.storageGB)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-700 border-2 border-gray-500 rounded-xl p-5">
                  <h3 className="text-xl font-bold text-white mb-4">Kết quả so sánh</h3>
                  <div className="space-y-3 text-base">
                    {selectedSpecs.ramGB && gameToCompare.minimumDetail.ramGB && (
                      <div className={`flex items-center justify-between p-4 rounded-lg font-semibold ${selectedSpecs.ramGB >= gameToCompare.minimumDetail.ramGB ? 'bg-green-500/30 text-green-200 border-2 border-green-500/50' : 'bg-red-500/30 text-red-200 border-2 border-red-500/50'}`}>
                        <span>RAM:</span>
                        <span className="text-lg">
                          {selectedSpecs.ramGB >= gameToCompare.minimumDetail.ramGB ? '✓ Đạt yêu cầu' : '✗ Không đạt yêu cầu'}
                        </span>
                      </div>
                    )}
                    {selectedSpecs.storageGB && gameToCompare.minimumDetail.storageGB && (
                      <div className={`flex items-center justify-between p-4 rounded-lg font-semibold ${selectedSpecs.storageGB >= gameToCompare.minimumDetail.storageGB ? 'bg-green-500/30 text-green-200 border-2 border-green-500/50' : 'bg-red-500/30 text-red-200 border-2 border-red-500/50'}`}>
                        <span>Storage:</span>
                        <span className="text-lg">
                          {selectedSpecs.storageGB >= gameToCompare.minimumDetail.storageGB ? '✓ Đạt yêu cầu' : '✗ Không đạt yêu cầu'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-300 text-center py-8 bg-gray-700/50 rounded-xl">
                <p className="text-lg">Chưa có thông tin cấu hình để so sánh</p>
              </div>
            )}
            
            <button
              onClick={() => {
                setShowCompareModal(false)
                setGameToCompare(null)
              }}
              className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default GamesPage

