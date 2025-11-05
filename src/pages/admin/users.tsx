import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ApiService } from '../../services/api'
import '../../Homepage.css'

interface User {
  id: string | number
  email: string
  fullname?: string
  username?: string
  phone?: string
  role?: string
  dob?: string
  address?: string
  createdAt?: string
}

function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    fullname: '',
    username: '',
    phone: '',
    password: '',
    role: 'Customer',
    dob: '',
    address: ''
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
      const usersData = await ApiService.getAllUsers()
      
      // Normalize users data - đảm bảo tất cả fields đều có giá trị đúng
      const normalizedUsers: User[] = usersData.map((u: Record<string, unknown>) => {
        const user: User = {
          id: u.id ? String(u.id) : String(u.userId || u.user_id || ''),
          email: String(u.email || ''),
          fullname: u.fullname ? String(u.fullname) : (u.full_name ? String(u.full_name) : undefined),
          username: u.username ? String(u.username) : (u.user_name ? String(u.user_name) : undefined),
          phone: u.phone ? String(u.phone) : (u.phoneNumber || u.phone_number ? String(u.phoneNumber || u.phone_number) : undefined),
          role: u.role ? String(u.role) : 'Customer',
          dob: u.dob ? String(u.dob) : (u.dateOfBirth || u.date_of_birth ? String(u.dateOfBirth || u.date_of_birth) : undefined),
          address: u.address ? String(u.address) : undefined,
          createdAt: u.createdAt ? String(u.createdAt) : (u.created_at ? String(u.created_at) : undefined)
        }
        
        return user
      })
      setUsers(normalizedUsers)
      
      // Chỉ hiển thị warning trong console, không block UI
      if (usersData.length === 0) {
        console.warn('⚠️ Chưa có dữ liệu users. Có thể do backend chưa implement endpoint GET /api/user/all hoặc GET /api/user')
      }
    } catch (err) {
      setError('Không thể tải dữ liệu users. Vui lòng kiểm tra backend API endpoint.')
      console.error('Error loading users:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async () => {
    try {
      await ApiService.createUser(formData)
      alert('Đã thêm user thành công!')
      setIsAddModalOpen(false)
      resetForm()
      loadData()
    } catch (err) {
      console.error('Error adding user:', err)
      alert('Có lỗi khi thêm user')
    }
  }

  const handleEditUser = async () => {
    if (!selectedUser) return
    
    try {
      const updateData: Record<string, unknown> = { ...formData }
      // Không gửi password nếu để trống
      if (!updateData.password) {
        delete updateData.password
      }
      
      await ApiService.updateUser(String(selectedUser.id), updateData)
      alert('Đã cập nhật user thành công!')
      setIsEditModalOpen(false)
      setSelectedUser(null)
      resetForm()
      loadData()
    } catch (err) {
      console.error('Error updating user:', err)
      alert('Có lỗi khi cập nhật user')
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return
    
    try {
      await ApiService.deleteUser(String(selectedUser.id))
      alert('Đã xóa user thành công!')
      setIsDeleteModalOpen(false)
      setSelectedUser(null)
      loadData()
    } catch (err) {
      console.error('Error deleting user:', err)
      alert('Có lỗi khi xóa user')
    }
  }

  const resetForm = () => {
    setFormData({
      email: '',
      fullname: '',
      username: '',
      phone: '',
      password: '',
      role: 'Customer',
      dob: '',
      address: ''
    })
  }

  const openEditModal = (user: User) => {
    setSelectedUser(user)
    
    // Đảm bảo lấy đúng data từ user được chọn, không phải admin
    const formDataToSet = {
      email: String(user.email || ''),
      fullname: String(user.fullname || ''),
      username: String(user.username || ''),
      phone: String(user.phone || ''),
      password: '', // Luôn để trống password khi edit
      role: String(user.role || 'User'),
      dob: user.dob ? String(user.dob) : '',
      address: String(user.address || '')
    }
    
    setFormData(formDataToSet)
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (user: User) => {
    setSelectedUser(user)
    setIsDeleteModalOpen(true)
  }

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = !debouncedSearchTerm.trim() || 
        user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        (user.fullname && user.fullname.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ||
        (user.username && user.username.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
      
      const matchesRole = filterRole === 'all' || user.role === filterRole
      
      return matchesSearch && matchesRole
    })
  }, [users, debouncedSearchTerm, filterRole])

  if (loading) {
    return (
      <div className="page bg-grid bg-radial">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page bg-grid bg-radial">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={loadData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page bg-grid bg-radial">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
            <p className="text-gray-600">Quản lý người dùng, phân quyền và kiểm soát truy cập</p>
          </div>
          <Link to="/admin" className="text-blue-600 hover:underline">← Quay lại Admin</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-4 flex gap-4">
        <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600">Tổng Users</div>
          <div className="text-2xl font-bold text-gray-900">{users.length}</div>
        </div>
        <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600">Đang hiển thị</div>
          <div className="text-2xl font-bold text-blue-600">{filteredUsers.length}</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Tìm kiếm user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
          >
            <option value="all">Tất cả roles</option>
            <option value="Customer">Customer</option>
            <option value="Staff">Staff</option>
            <option value="Admin">Admin</option>
          </select>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-2 bg-green-100 text-green-700 font-medium rounded-lg hover:bg-green-200 transition-colors flex items-center gap-2 shadow-md border border-green-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Thêm User</span>
          </button>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-100 text-blue-700 font-medium rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2 shadow-md border border-blue-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-black/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ tên</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số điện thoại</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                      <p className="text-lg font-medium mb-2">
                        {users.length === 0 ? 'Chưa có dữ liệu users' : 'Không tìm thấy user nào'}
                      </p>
                      {users.length === 0 && (
                        <p className="text-sm text-orange-600 mt-2">
                          ⚠️ Backend cần implement endpoint để lấy tất cả users (có thể dùng <code className="bg-gray-100 px-2 py-1 rounded">GET /api/user/all</code> hoặc tương tự). Users sẽ được lọc theo role: Customer, Staff, Admin.
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{user.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.fullname || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.username || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'Admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'Staff' ? 'bg-green-100 text-green-800' :
                        user.role === 'Customer' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role || 'Customer'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.phone || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => openDeleteModal(user)}
                          className="text-red-600 hover:text-red-900"
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

      {/* Add User Modal */}
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
              <h2 style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Thêm User mới</h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false)
                  resetForm()
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
              <div>
                <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#374151',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                  required
                />
              </div>
              
              <div>
                <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#374151',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Họ tên</label>
                <input
                  type="text"
                  value={formData.fullname}
                  onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#374151',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#374151',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Số điện thoại</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: '#374151',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: '#374151',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '14px'
                    }}
                  >
                    <option value="Customer" style={{ backgroundColor: '#374151' }}>Customer</option>
                    <option value="Staff" style={{ backgroundColor: '#374151' }}>Staff</option>
                    <option value="Admin" style={{ backgroundColor: '#374151' }}>Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Ngày sinh</label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#374151',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Địa chỉ</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#374151',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    minHeight: '80px'
                  }}
                  rows={3}
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => {
                  setIsAddModalOpen(false)
                  resetForm()
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
                Hủy
              </button>
              <button
                onClick={handleAddUser}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#10b981',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
              >
                Thêm User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (
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
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Sửa User</h2>
              <button
                onClick={() => {
                  setIsEditModalOpen(false)
                  setSelectedUser(null)
                  resetForm()
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                  required
                  style={{ color: '#000000' }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-1">Password (để trống nếu không đổi)</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                  style={{ color: '#000000' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">Họ tên</label>
                <input
                  type="text"
                  value={formData.fullname}
                  onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                  style={{ color: '#000000' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                  style={{ color: '#000000' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                    style={{ color: '#000000' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                    style={{ color: '#000000' }}
                  >
                    <option value="Customer" style={{ color: '#000000', backgroundColor: '#ffffff' }}>Customer</option>
                    <option value="Staff" style={{ color: '#000000', backgroundColor: '#ffffff' }}>Staff</option>
                    <option value="Admin" style={{ color: '#000000', backgroundColor: '#ffffff' }}>Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">Ngày sinh</label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                  style={{ color: '#000000' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">Địa chỉ</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                  rows={3}
                  style={{ color: '#000000' }}
                />
              </div>
            </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setIsEditModalOpen(false)
                  setSelectedUser(null)
                  resetForm()
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleEditUser}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {isDeleteModalOpen && selectedUser && (
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
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 style={{ color: '#dc2626', fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Xác nhận xóa</h2>
              <p style={{ color: '#000000', marginBottom: '16px', fontSize: '14px' }}>
                Bạn có chắc chắn muốn xóa user <strong style={{ color: '#000000', fontWeight: '600' }}>{selectedUser.email}</strong> không?
              </p>
              <p style={{ color: '#000000', fontSize: '12px', marginBottom: '24px' }}>Hành động này không thể hoàn tác.</p>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setSelectedUser(null)
                }}
                style={{
                  padding: '8px 24px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteUser}
                style={{
                  padding: '8px 24px',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  borderRadius: '8px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  border: 'none',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
              >
                Xóa User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsersPage

