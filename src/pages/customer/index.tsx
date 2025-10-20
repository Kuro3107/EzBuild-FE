import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ApiService } from '../../services/api'
import '../../Homepage.css'

/**
 * Interface định nghĩa cấu trúc dữ liệu cho thông tin profile của user
 */
interface UserProfile {
  id: string
  email: string
  username?: string
  fullname: string
  phone: string
  address: string
  dob: string
  role: string
  createdAt: string
  avatar?: string
  bio?: string
}

/**
 * Component trang Customer Profile
 * Cho phép user xem và chỉnh sửa thông tin cá nhân, upload avatar
 */
function CustomerProfilePage() {
  // Lấy thông tin user hiện tại từ ApiService
  const currentUser = ApiService.getCurrentUser()
  const headerName = String(
    (currentUser?.fullname as string | undefined) ||
    (currentUser?.username as string | undefined) ||
    ((currentUser?.email as string | undefined)?.split('@')[0]) ||
    'User'
  )
  const headerRole = String((currentUser?.role as string | undefined) || 'CUSTOMER')
  
  // State quản lý trạng thái form và dữ liệu
  const [isEditing, setIsEditing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    email: '',
    username: '',
    fullname: '',
    phone: '',
    address: '',
    dob: '',
    role: 'Customer',
    createdAt: '',
    avatar: '',
    bio: ''
  })

  const [formData, setFormData] = useState(profile)
  const fileInputRef = useRef<HTMLInputElement>(null) // Ref để tham chiếu đến input file ẩn

  // Fetch user data nhanh: đổ ngay dữ liệu localStorage, sau đó cập nhật từ API /api/user/{id}
  useEffect(() => {
    const controller = new AbortController()
    try {
      if (!currentUser?.id && !currentUser?.userId) {
        setError('Không tìm thấy thông tin user')
        setIsLoading(false)
        return
      }

      // 1) Hydrate tức thì từ token/localStorage (UI hiển thị ngay)
      const fallbackData: UserProfile = {
        id: String(currentUser.id || currentUser.userId || ''),
        email: String(currentUser.email || ''),
        username: String(currentUser.username || ''),
        fullname: String(currentUser.fullname || (currentUser.email ? String(currentUser.email).split('@')[0] : '')),
        phone: String(currentUser.phone || ''),
        address: String(currentUser.address || ''),
        dob: String(currentUser.dob || ''),
        role: String(currentUser.role || 'Customer'),
        createdAt: String(currentUser.createdAt || currentUser.timestamp || ''),
        avatar: '',
        bio: ''
      }
      setProfile(fallbackData)
      setFormData(fallbackData)
      setIsLoading(false)

      // 2) Cập nhật nền từ API /api/user/{id}
      const base = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8080'
      const token = localStorage.getItem('authToken') || ''
      const rawId = String(currentUser.id || currentUser.userId)
      const cleanedId = (rawId.match(/\d+/)?.[0] || rawId).replace(/^0+(?=\d)/, '')
      fetch(`${base}/api/user/${cleanedId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      }).then(async (r) => {
        if (!r.ok) throw new Error(await r.text())
        return r.json()
      }).then((userData) => {
        const transformedData: UserProfile = {
          id: String(userData.id || fallbackData.id),
          email: String(userData.email || fallbackData.email),
          username: String(userData.username || fallbackData.username || ''),
          fullname: String(userData.fullname || fallbackData.fullname),
          phone: String(userData.phone || fallbackData.phone || ''),
          address: String(userData.address || fallbackData.address || ''),
          dob: String(userData.dob || fallbackData.dob || ''),
          role: String(userData.role || fallbackData.role || 'Customer'),
          createdAt: String(userData.createdAt || fallbackData.createdAt || ''),
          avatar: '',
          bio: ''
        }
        setProfile(transformedData)
        setFormData(transformedData)
      }).catch(() => {/* giữ fallback nếu lỗi */})
    } catch {
      // ignore
    }
    return () => controller.abort()
  // Chạy một lần khi mount
  }, [])

  /**
   * Xử lý khi user thay đổi giá trị trong form
   * @param e - Event từ input/textarea
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  /**
   * Xử lý upload avatar
   * Kiểm tra kích thước file, định dạng và tạo preview
   * @param e - Event từ input file
   */
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Kiểm tra kích thước file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File quá lớn. Vui lòng chọn file nhỏ hơn 5MB.')
      return
    }

    // Kiểm tra định dạng file
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh.')
      return
    }

    setIsUploading(true)

    try {
      // Tạo URL preview
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setFormData(prev => ({
          ...prev,
          avatar: result
        }))
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert('Có lỗi xảy ra khi upload ảnh.')
      setIsUploading(false)
    }
  }

  /**
   * Xử lý lưu thông tin profile
   * Cập nhật state profile và thoát chế độ edit
   */
  const handleSave = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Gọi API để update profile
      const updatedData = await ApiService.updateUserProfile(profile.id, formData as unknown as Record<string, unknown>)
      
      // Cập nhật state với dữ liệu mới
      setProfile(formData)
      setIsEditing(false)
      
      console.log('Profile updated successfully:', updatedData)
      alert('Thông tin đã được cập nhật thành công!')
    } catch (error) {
      console.error('Error updating profile:', error)
      setError('Không thể cập nhật thông tin. Vui lòng thử lại.')
      alert('Có lỗi xảy ra khi cập nhật thông tin!')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Xử lý hủy chỉnh sửa
   * Khôi phục dữ liệu gốc và thoát chế độ edit
   */
  const handleCancel = () => {
    setFormData(profile)
    setIsEditing(false)
  }


  // Loading state
  if (isLoading) {
    return (
      <div className="page bg-grid-dark">
        <div className="layout">
          <div className="main">
            <div className="max-w-4xl mx-auto flex items-center justify-center min-h-screen">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-300">Đang tải thông tin profile...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="page bg-grid-dark">
        <div className="layout">
          <div className="main">
            <div className="max-w-4xl mx-auto flex items-center justify-center min-h-screen">
              <div className="text-center">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-white mb-2">Lỗi tải dữ liệu</h2>
                <p className="text-gray-300 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Thử lại
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page bg-grid-dark">
      <div className="layout pt-16 md:pt-20">
        {/* Header thay sidebar */}
        <div className="relative z-0 bg-transparent px-4 md:px-6 pt-4 pb-3 w-full max-w-5xl mx-auto">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-base font-bold">
                {headerName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-white text-base">{headerName}</div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wider">{headerRole}</div>
              </div>
            </div>
            <nav className="flex items-center gap-2 ml-12">
              <Link className="nav-item-active" to="/customer">Profile</Link>
              <Link className="nav-item" to="/builds">My Builds</Link>
              <Link className="nav-item" to="/orders">Orders</Link>
              <Link className="nav-item" to="/pcbuilder">PC Builder</Link>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <main className="main">
          <div className="max-w-5xl mx-auto px-4 md:px-6 mt-2">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
                  <p className="text-gray-400">Manage your personal information and account settings</p>
                </div>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new Event('openSidebar'))}
                  className="inline-flex items-center gap-2 bg-white/90 text-gray-900 px-3 py-2 rounded-lg shadow border border-black/10 hover:bg-white"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  Menu
                </button>
              </div>
            </div>

            {/* Profile Picture Section */}
            <div className="bg-white/10 border border-white/20 rounded-2xl p-8 mb-8 shadow-lg">
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                    {formData.avatar ? (
                      <img 
                        src={formData.avatar} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      formData.fullname.charAt(0).toUpperCase()
                    )}
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="absolute -bottom-1 -right-1 w-10 h-10 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors shadow-lg border-2 border-white"
                    >
                      {isUploading ? (
                        <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Details Section */}
            <div className="bg-white/10 border border-white/20 rounded-2xl p-8 mb-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Contact Details</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-sm"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="fullname"
                    value={formData.fullname.split(' ')[0] || formData.fullname}
                    onChange={(e) => {
                      const lastName = formData.fullname.split(' ').slice(1).join(' ')
                      setFormData(prev => ({
                        ...prev,
                        fullname: `${e.target.value} ${lastName}`.trim()
                      }))
                    }}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 text-gray-900"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.fullname.split(' ').slice(1).join(' ') || ''}
                    onChange={(e) => {
                      const firstName = formData.fullname.split(' ')[0]
                      setFormData(prev => ({
                        ...prev,
                        fullname: `${firstName} ${e.target.value}`.trim()
                      }))
                    }}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 text-gray-900"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="flex">
                    <select 
                      disabled={!isEditing}
                      className="px-3 py-3 border border-gray-300 border-r-0 rounded-l-lg bg-gray-50 text-gray-700 disabled:bg-gray-100"
                    >
                      <option value="+84">🇻🇳 +84</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                    </select>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Enter phone number"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 text-gray-900"
                    />
                  </div>
                </div>

                {/* Timezone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select 
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 text-gray-900"
                  >
                    <option value="GMT+7">Ho Chi Minh City (GMT +7)</option>
                    <option value="GMT+8">Bangkok (GMT +8)</option>
                    <option value="GMT+9">Tokyo (GMT +9)</option>
                  </select>
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={handleCancel}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            {/* Account Overview Section */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Account Overview</h2>
                <button className="px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium">
                  + Add New Email
                </button>
              </div>

              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Password</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Primary</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formData.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ••••••••
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Unverified
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input type="radio" name="primary-email" className="h-4 w-4 text-purple-600" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-gray-400 hover:text-gray-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default CustomerProfilePage
