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
        if (selectedGenre !== 'all') {
          const genresOfGame = (game.genre || '').split(',').map(g => g.trim().toLowerCase())
          if (!genresOfGame.includes(selectedGenre.toLowerCase())) return false
        }
        if (selectedDeveloper !== 'all') {
          if ((game.developer || '').toLowerCase() !== selectedDeveloper.toLowerCase()) return false
        }
        if (!keyword) return true
        return (
          game.name.toLowerCase().includes(keyword) ||
          game.description.toLowerCase().includes(keyword) ||
          (game.genre || '').toLowerCase().includes(keyword) ||
          (game.developer || '').toLowerCase().includes(keyword)
        )
      })
      .sort((a, b) => {
        const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0
        const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0
        return dateB - dateA
      })
  }, [games, selectedGenre, selectedDeveloper, debouncedSearch])

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
            </div>
          </div>
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
                className="self-start md:self-auto px-4 py-2 border border-white/20 text-white/70 rounded-lg hover:bg-white/10 transition-colors text-xs"
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
                  <div className="px-6 pb-6">
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
    </div>
  )
}

export default GamesPage

