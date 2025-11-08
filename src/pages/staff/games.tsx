import { useEffect, useState, useMemo } from 'react'
import { ApiService } from '../../services/api'
import '../../Homepage.css'

interface Game {
  id: number
  name: string
  description: string
  genre: string
  releaseDate: string
  developer: string
  imageUrl?: string
  createdAt?: string
}

function StaffGamesPage() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    genre: '',
    releaseDate: '',
    developer: '',
    imageUrl: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const gamesData = await ApiService.getAllGames()
      setGames(gamesData.map((g: Record<string, unknown>) => g as unknown as Game))
    } catch (err) {
      setError('Không thể tải dữ liệu')
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddGame = async () => {
    try {
      await ApiService.createGame(formData)
      alert('Đã thêm game thành công!')
      setIsAddModalOpen(false)
      resetForm()
      loadData()
    } catch (err) {
      console.error('Error adding game:', err)
      alert('Có lỗi khi thêm game')
    }
  }

  const handleEditGame = async () => {
    if (!selectedGame) return
    try {
      await ApiService.updateGame(selectedGame.id, formData)
      alert('Đã cập nhật game thành công!')
      setIsEditModalOpen(false)
      setSelectedGame(null)
      resetForm()
      loadData()
    } catch (err) {
      console.error('Error updating game:', err)
      alert('Có lỗi khi cập nhật game')
    }
  }

  const handleDeleteGame = async () => {
    if (!selectedGame) return
    try {
      await ApiService.deleteGame(selectedGame.id)
      alert('Đã xóa game thành công!')
      setIsDeleteModalOpen(false)
      setSelectedGame(null)
      loadData()
    } catch (err) {
      console.error('Error deleting game:', err)
      alert('Có lỗi khi xóa game')
    }
  }

  const resetForm = () => {
    setFormData({ name: '', description: '', genre: '', releaseDate: '', developer: '', imageUrl: '' })
  }

  const openEditModal = (game: Game) => {
    setSelectedGame(game)
    setFormData({
      name: game.name,
      description: game.description,
      genre: game.genre,
      releaseDate: game.releaseDate,
      developer: game.developer,
      imageUrl: game.imageUrl || ''
    })
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (game: Game) => {
    setSelectedGame(game)
    setIsDeleteModalOpen(true)
  }

  const filteredGames = useMemo(() => {
    if (!games.length) return []
    return games.filter(game => {
      if (debouncedSearchTerm.trim()) {
        const lowerSearch = debouncedSearchTerm.toLowerCase()
        return game.name.toLowerCase().includes(lowerSearch) ||
               game.genre.toLowerCase().includes(lowerSearch) ||
               game.developer.toLowerCase().includes(lowerSearch)
      }
      return true
    })
  }, [games, debouncedSearchTerm])

  if (loading) {
    return (
      <div className="page bg-grid bg-radial">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-white text-lg">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page bg-grid bg-radial">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <p className="text-red-300 mb-6 text-xl">{error}</p>
            <button onClick={loadData} className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl">
              Thử lại
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page bg-grid bg-radial p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Quản lý game
            </span>
          </h1>
          <p className="text-gray-300 text-lg">Thêm, sửa, xóa game trong hệ thống</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all shadow-lg hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm mb-2">Tổng game</p>
                <p className="text-3xl font-bold text-white">{games.length}</p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-2xl shadow-lg">
                🎮
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all shadow-lg hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm mb-2">Đang hiển thị</p>
                <p className="text-3xl font-bold text-blue-400">{filteredGames.length}</p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-2xl shadow-lg">
                👁️
              </div>
            </div>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="mb-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Tìm kiếm game theo tên, thể loại, nhà phát triển..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Thêm game
              </button>
              <button
                onClick={loadData}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Làm mới
              </button>
            </div>
          </div>
        </div>

        {/* Games Table */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Hình ảnh</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Tên game</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Thể loại</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Nhà phát triển</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Ngày phát hành</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredGames.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-gray-400">
                        <svg className="mx-auto h-16 w-16 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-lg font-medium">Không tìm thấy game nào</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredGames.map((game) => (
                    <tr key={game.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-white font-semibold">#{game.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={(game as unknown as { imageUrl?: string }).imageUrl || 'https://via.placeholder.com/100x100?text=No+Image'}
                          alt={game.name}
                          className="w-16 h-16 object-cover rounded-lg border border-white/10"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100x100?text=No+Image'
                          }}
                        />
                      </td>
                      <td className="px-6 py-4 text-sm text-white font-medium">{game.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{game.genre}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{game.developer}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{game.releaseDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(game)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all text-sm font-medium shadow-md"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => openDeleteModal(game)}
                            className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg hover:from-red-600 hover:to-rose-600 transition-all text-sm font-medium shadow-md"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
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
              <h2 style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Thêm game mới</h2>
              <button onClick={() => { setIsAddModalOpen(false); resetForm() }} style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '4px'
              }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Tên game *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: '#374151',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px'
                }} required />
              </div>
              <div>
                <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Mô tả *</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: '#374151',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  minHeight: '80px'
                }} rows={3} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Thể loại *</label>
                  <input type="text" value={formData.genre} onChange={(e) => setFormData({ ...formData, genre: e.target.value })} placeholder="VD: Action, RPG" style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#374151',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px'
                  }} required />
                </div>
                <div>
                  <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Nhà phát triển *</label>
                  <input type="text" value={formData.developer} onChange={(e) => setFormData({ ...formData, developer: e.target.value })} style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#374151',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px'
                  }} required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Ngày phát hành *</label>
                  <input type="date" value={formData.releaseDate} onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })} style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#374151',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px'
                  }} required />
                </div>
                <div>
                  <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Hình ảnh (URL)</label>
                  <input type="text" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} placeholder="https://..." style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#374151',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px'
                  }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button onClick={() => { setIsAddModalOpen(false); resetForm() }} style={{
                  padding: '10px 24px',
                  backgroundColor: '#374151',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4b5563'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#374151'}>Hủy</button>
                <button onClick={handleAddGame} style={{
                  padding: '10px 24px',
                  backgroundColor: '#10b981',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}>Thêm game</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedGame && (
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
              <h2 style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Sửa game #{selectedGame.id}</h2>
              <button onClick={() => { setIsEditModalOpen(false); setSelectedGame(null); resetForm() }} style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '4px'
              }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Tên game *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: '#374151',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px'
                }} required />
              </div>
              <div>
                <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Mô tả *</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: '#374151',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  minHeight: '80px'
                }} rows={3} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Thể loại *</label>
                  <input type="text" value={formData.genre} onChange={(e) => setFormData({ ...formData, genre: e.target.value })} style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#374151',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px'
                  }} required />
                </div>
                <div>
                  <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Nhà phát triển *</label>
                  <input type="text" value={formData.developer} onChange={(e) => setFormData({ ...formData, developer: e.target.value })} style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#374151',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px'
                  }} required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Ngày phát hành *</label>
                  <input type="date" value={formData.releaseDate} onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })} style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#374151',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px'
                  }} required />
                </div>
                <div>
                  <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Hình ảnh (URL)</label>
                  <input type="text" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#374151',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px'
                  }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button onClick={() => { setIsEditModalOpen(false); setSelectedGame(null); resetForm() }} style={{
                  padding: '10px 24px',
                  backgroundColor: '#374151',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4b5563'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#374151'}>Hủy</button>
                <button onClick={handleEditGame} style={{
                  padding: '10px 24px',
                  backgroundColor: '#3b82f6',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}>Cập nhật</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && selectedGame && (
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
            maxWidth: '400px',
            width: '100%',
            padding: '24px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '24px'
            }}>
              <h2 style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Xác nhận xóa</h2>
              <button onClick={() => { setIsDeleteModalOpen(false); setSelectedGame(null) }} style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '4px'
              }}>×</button>
            </div>
            <p style={{ color: 'white', marginBottom: '24px', fontSize: '14px' }}>
              Bạn có chắc chắn muốn xóa game <strong style={{ fontWeight: '600' }}>{selectedGame.name}</strong> không?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => { setIsDeleteModalOpen(false); setSelectedGame(null) }} style={{
                padding: '10px 24px',
                backgroundColor: '#374151',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4b5563'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#374151'}>Hủy</button>
              <button onClick={handleDeleteGame} style={{
                padding: '10px 24px',
                backgroundColor: '#ef4444',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}>Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StaffGamesPage

