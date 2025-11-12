import React, { useEffect, useMemo, useState } from 'react'
import BuildRollerCard from '../components/BuildRollerCard'

type BuildSummary = {
  id: number
  name: string
  totalPrice: number | null
  userId?: number | null
}

const apiBase = (import.meta as any)?.env?.VITE_API_BASE_URL || 'https://exe201-ezbuildvn-be.onrender.com'

function sampleThree(total: number): [number, number, number] {
  if (total <= 3) return [0, 1 % total, 2 % total]
  const set = new Set<number>()
  while (set.size < 3) {
    set.add(Math.floor(Math.random() * total))
  }
  const arr = Array.from(set.values()) as number[]
  return [arr[0], arr[1], arr[2]]
}

const BuildPresetsPage: React.FC = () => {
  const [builds, setBuilds] = useState<BuildSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [indexes, setIndexes] = useState<[number, number, number]>([0, 1, 2])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${apiBase}/api/build?userId=2`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (!cancelled) {
          setBuilds(data || [])
          setIndexes(sampleThree((data || []).length || 1))
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Load builds failed')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const handleRoll = (slot: number) => {
    if (!builds.length) return
    const used = new Set<number>(indexes)
    let next = Math.floor(Math.random() * builds.length)
    let safeGuard = 0
    while (used.has(next) && safeGuard < 50) {
      next = Math.floor(Math.random() * builds.length)
      safeGuard++
    }
    const newIdx: [number, number, number] = [...indexes] as any
    newIdx[slot] = next
    setIndexes(newIdx)
  }

  const view = useMemo(() => {
    if (loading) return <div className="text-white opacity-80">Đang tải build...</div>
    if (error) return <div className="text-red-400">Lỗi: {error}</div>
    if (!builds.length) return <div className="text-white opacity-80">Không có build nào.</div>
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BuildRollerCard allBuilds={builds} currentIndex={indexes[0]} onRoll={() => handleRoll(0)} />
        <BuildRollerCard allBuilds={builds} currentIndex={indexes[1]} onRoll={() => handleRoll(1)} />
        <BuildRollerCard allBuilds={builds} currentIndex={indexes[2]} onRoll={() => handleRoll(2)} />
      </div>
    )
  }, [builds, indexes, loading, error])

  return (
    <div className="min-h-screen bg-[#0f0b1e]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Chọn một Build</h1>
          <p className="text-sm text-[#c9c3e6] mt-1">
            Hiển thị 3 build ngẫu nhiên của user 2. Nhấn nút Roll trên từng thẻ để đổi sang build khác.
          </p>
        </div>
        {view}
      </div>
    </div>
  )
}

export default BuildPresetsPage



