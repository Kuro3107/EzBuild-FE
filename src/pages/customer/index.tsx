import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ApiService } from '../../services/api'
import '../../Homepage.css'

/**
 * Interface định nghĩa cấu trúc dữ liệu cho thông tin profile của user
 */
interface UserProfile {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  phone: string
  address: string
  city: string
  country: string
  avatar: string
  bio: string
  joinDate: string
}

/**
 * Component trang Customer Profile
 * Cho phép user xem và chỉnh sửa thông tin cá nhân, upload avatar
 */
function CustomerProfilePage() {
  // Lấy thông tin user hiện tại từ ApiService
  const currentUser = ApiService.getCurrentUser()
  const userRole = ApiService.getUserRole()
  
  // State quản lý trạng thái form và dữ liệu
  const [isEditing, setIsEditing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [profile, setProfile] = useState<UserProfile>({
    id: currentUser?.id || '1',
    email: currentUser?.email || 'info.leminhthuan@gmail.com',
    username: currentUser?.username || 'leminhthuan',
    firstName: 'Lê Minh',
    lastName: 'Thuận',
    phone: '+84 123 456 789',
    address: '123 Đường ABC, Quận 1',
    city: 'TP. Hồ Chí Minh',
    country: 'Việt Nam',
    avatar: '',
    bio: 'Đam mê công nghệ và xây dựng PC. Thích tìm hiểu về phần cứng mới nhất.',
    joinDate: '2024-01-15'
  })

  const [formData, setFormData] = useState(profile)
  const fileInputRef = useRef<HTMLInputElement>(null) // Ref để tham chiếu đến input file ẩn

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
  const handleSave = () => {
    setProfile(formData)
    setIsEditing(false)
    // Ở đây bạn có thể gọi API để lưu thông tin
    console.log('Saving profile:', formData)
    alert('Thông tin đã được cập nhật thành công!')
  }

  /**
   * Xử lý hủy chỉnh sửa
   * Khôi phục dữ liệu gốc và thoát chế độ edit
   */
  const handleCancel = () => {
    setFormData(profile)
    setIsEditing(false)
  }

  /**
   * Xử lý xóa avatar
   * Xóa ảnh avatar khỏi form data
   */
  const handleRemoveAvatar = () => {
    setFormData(prev => ({
      ...prev,
      avatar: ''
    }))
  }

  return (
    <div className="page bg-grid bg-radial">
      <div className="layout">
        {/* Sidebar Navigation */}
        <aside className="sidebar">
          <div className="flex items-center justify-between px-2 mb-6">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-lg bg-blue-600" />
              <span className="font-semibold">EzBuild</span>
            </div>
          </div>

          <div>
            <div className="sidebar-group">Navigation</div>
            <Link className="nav-item" to="/">PC Builder</Link>
            <Link className="nav-item" to="/sales">Sales</Link>
            <Link className="nav-item" to="/compare">Compare</Link>
          </div>

          <div>
            <div className="sidebar-group">Account</div>
            <Link className="nav-item" to="/customer">Profile</Link>
            <a className="nav-item" href="#">Orders</a>
            <a className="nav-item" href="#">Wishlist</a>
            <a className="nav-item" href="#">Settings</a>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main">
          <div className="max-w-4xl mx-auto">
            {/* Page Header với Breadcrumb */}
            <div className="mb-8">
              <div className="flex items-center gap-2 text-sm text-black/70 mb-2">
                <Link to="/" className="hover:text-blue-600">Home</Link>
                <span>/</span>
                <span>Customer Profile</span>
              </div>
              <h1 className="text-3xl font-bold text-black">Customer Profile</h1>
              <p className="text-black/60">Quản lý thông tin cá nhân và tài khoản của bạn</p>
            </div>

            {/* Grid Layout cho Profile Card và Form */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Card - Hiển thị thông tin user và avatar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="text-center">
                    {/* Avatar với nút upload */}
                    <div className="relative inline-block mb-4">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                        {formData.avatar ? (
                          <img 
                            src={formData.avatar} 
                            alt="Avatar" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          (formData.firstName + formData.lastName).charAt(0).toUpperCase()
                        )}
                      </div>
                      {isEditing && (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                        >
                          {isUploading ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          )}
                        </button>
                      )}
                    </div>

                    <h2 className="text-xl font-semibold text-gray-900 mb-1">
                      {formData.firstName} {formData.lastName}
                    </h2>
                    <p className="text-gray-600 text-sm mb-2">@{formData.username}</p>
                    <p className="text-gray-500 text-xs mb-4">
                      Tham gia từ {new Date(formData.joinDate).toLocaleDateString('vi-VN')}
                    </p>

                    {/* Bio */}
                    <div className="text-left">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Giới thiệu</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {formData.bio}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 space-y-2">
                      {!isEditing ? (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="w-full px-4 py-2 bg-blue-100 text-black rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium border border-blue-300"
                        >
                          Chỉnh sửa Profile
                        </button>
                      ) : (
                        <div className="space-y-2">
                          <button
                            onClick={handleSave}
                            className="w-full px-4 py-2 bg-green-100 text-black rounded-lg hover:bg-green-200 transition-colors text-sm font-medium border border-green-300"
                          >
                            Lưu thay đổi
                          </button>
                          <button
                            onClick={handleCancel}
                            className="w-full px-4 py-2 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium border border-gray-300"
                          >
                            Hủy
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Form - Form chỉnh sửa thông tin */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Thông tin cá nhân</h3>
                    {isEditing && formData.avatar && (
                      <button
                        onClick={handleRemoveAvatar}
                        className="text-black hover:text-red-600 text-sm font-medium border border-red-300 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Xóa avatar
                      </button>
                    )}
                  </div>

                  <form className="space-y-6">
                    {/* Thông tin cơ bản - Họ tên, username, email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Họ
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tên
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên đăng nhập
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                      />
                    </div>

                    {/* Thông tin địa chỉ */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Địa chỉ
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Thành phố
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quốc gia
                        </label>
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                        />
                      </div>
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giới thiệu bản thân
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 resize-none"
                        placeholder="Viết một vài dòng về bản thân..."
                      />
                    </div>
                  </form>

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
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default CustomerProfilePage
