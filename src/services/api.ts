const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8080'

export interface LoginRequest {
  identifier: string // email or username
  password: string
}

export interface RegisterRequest {
  fullname: string
  email: string
  password: string
  phone: string
  dob: string
  address: string
}

export interface AuthResponse {
  message?: string
  token?: string
  accessToken?: string
  access_token?: string
  user?: Record<string, unknown>
  data?: {
    token?: string
    accessToken?: string
    access_token?: string
    user?: Record<string, unknown>
  }
}

export interface ApiError {
  message: string
  status?: number
}

export class ApiService {
  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorData = {}
      try {
        errorData = await response.json()
      } catch (parseError) {
        console.error('Error parsing response JSON:', parseError)
      }
      
      console.log('=== API ERROR DEBUG ===')
      console.log('Status:', response.status)
      console.log('Status Text:', response.statusText)
      console.log('Error Data:', errorData)
      
      const error: ApiError = {
        message: (errorData as any)?.message || (errorData as any)?.error || `HTTP ${response.status}: ${response.statusText}`,
        status: response.status
      }
      throw error
    }
    return response.json()
  }

  private static extractTokenFromResponse(data: AuthResponse): { token: string; user?: Record<string, unknown> } {
    // Thử các cách khác nhau để lấy token
    let token = data.token || data.accessToken || data.access_token || 
                data.data?.token || data.data?.accessToken || data.data?.access_token
    
    // Nếu không có token từ backend, tạo token tạm thời
    if (!token) {
      token = this.generateTemporaryToken(data)
    }

    const user = data.user || data.data?.user
    return { token, user }
  }

  private static generateTemporaryToken(data: AuthResponse): string {
    // Tạo token tạm thời dựa trên user info hoặc thông tin có sẵn
    const user = data.user || data.data?.user
    
    // Nếu có user info, sử dụng thông tin đó
    if (user && typeof user === 'object') {
      const tokenData = {
        userId: user.id || Date.now(),
        fullname: user.fullname || 'unknown_user',
        email: user.email || 'unknown@example.com',
        role: user.role || 'User',
        timestamp: Date.now(),
        type: 'temporary',
        source: 'login_response'
      }
      
      return this.encodeToken(tokenData)
    }
    
    // Nếu không có user info (trường hợp register), tạo token với thông tin tối thiểu
    const tokenData = {
      userId: Date.now(),
      fullname: 'new_user',
      email: 'unknown@example.com',
      role: 'User',
      timestamp: Date.now(),
      type: 'temporary',
      source: 'fallback'
    }

    return this.encodeToken(tokenData)
  }

  private static encodeToken(tokenData: Record<string, unknown>): string {
    try {
      // Sử dụng encodeURIComponent để xử lý Unicode characters
      const jsonString = JSON.stringify(tokenData)
      return btoa(encodeURIComponent(jsonString))
    } catch (error) {
      console.error('Error encoding token:', error)
      // Fallback: tạo token đơn giản
      return btoa(JSON.stringify({
        userId: tokenData.userId || Date.now(),
        timestamp: Date.now(),
        type: 'temporary',
        error: 'encoding_failed'
      }))
    }
  }

  static decodeToken(token: string): Record<string, unknown> | null {
    try {
      const decoded = atob(token)
      const jsonString = decodeURIComponent(decoded)
      return JSON.parse(jsonString)
    } catch (error) {
      console.error('Error decoding token:', error)
      return null
    }
  }


  static async login(credentials: LoginRequest): Promise<{ token: string; user?: Record<string, unknown> }> {
    console.log('=== API LOGIN DEBUG ===')
    console.log('API URL:', `${API_BASE_URL}/api/user/login`)
    console.log('Login credentials:', credentials)
    
    // Kiểm tra xem identifier có phải email, phone hay username không
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.identifier)
    const isPhone = /^(\+84|84|0)[1-9][0-9]{8,9}$/.test(credentials.identifier.replace(/\s/g, ''))
    const isUsername = !isEmail && !isPhone && /^[a-zA-Z][a-zA-Z0-9_]{2,}$/.test(credentials.identifier)
    
    console.log('Is email format:', isEmail)
    console.log('Is phone format:', isPhone)
    console.log('Is username format:', isUsername)
    
    // Backend hỗ trợ email, phone và username
    if (!isEmail && !isPhone && !isUsername) {
      throw new Error('Vui lòng nhập email, số điện thoại hoặc username hợp lệ')
    }
    
    const response = await fetch(`${API_BASE_URL}/api/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))

    const data = await this.handleResponse<AuthResponse>(response)
    console.log('Response data:', data)
    
    return this.extractTokenFromResponse(data)
  }

  static async register(userData: RegisterRequest): Promise<{ token: string; user?: Record<string, unknown> }> {
    const response = await fetch(`${API_BASE_URL}/api/user/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    const data = await this.handleResponse<AuthResponse>(response)
    return this.extractTokenFromResponse(data)
  }

  static async getUserProfile(userId: string): Promise<Record<string, unknown>> {
    const token = localStorage.getItem('authToken')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/api/user/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    return this.handleResponse<Record<string, unknown>>(response)
  }

  static async updateUserProfile(userId: string, userData: Record<string, unknown>): Promise<Record<string, unknown>> {
    const token = localStorage.getItem('authToken')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/api/user/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    return this.handleResponse<Record<string, unknown>>(response)
  }

  static async deleteUser(userId: string): Promise<void> {
    const token = localStorage.getItem('authToken')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/api/user/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData?.message || 'Có lỗi xảy ra khi xóa tài khoản')
    }
  }

  static async getHomeData(): Promise<Record<string, unknown>> {
    const token = localStorage.getItem('authToken')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/api/user/home`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    return this.handleResponse<Record<string, unknown>>(response)
  }

  // Product APIs
  static async getCPUs(): Promise<Record<string, unknown>[]> {
    try {
      // Thử nhiều cách để lấy tất cả 28 CPU
      let allProducts: Record<string, unknown>[] = []
      
      // Thử 1: API bình thường
      try {
        const response = await fetch(`${API_BASE_URL}/api/product`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
        if (response.ok) {
          allProducts = await this.handleResponse<Record<string, unknown>[]>(response)
          console.log('API bình thường:', allProducts.length, 'products')
        }
      } catch (err) {
        console.log('API bình thường lỗi:', err)
      }
      
      // Thử 2: API với limit cao
      const limitParams = ['limit=1000', 'limit=9999', 'size=1000', 'size=9999']
      for (const param of limitParams) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/product?${param}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          })
          if (response.ok) {
            const products = await this.handleResponse<Record<string, unknown>[]>(response)
            if (products.length > allProducts.length) {
              allProducts = products
              console.log(`API với ${param}:`, allProducts.length, 'products')
            }
          }
        } catch (err) {
          console.log(`API với ${param} lỗi:`, err)
        }
      }
      
      // Thử 3: API với page=all hoặc page=0
      const pageParams = ['page=all', 'page=0', 'page=1&size=1000', 'offset=0&limit=1000']
      for (const param of pageParams) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/product?${param}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          })
          if (response.ok) {
            const products = await this.handleResponse<Record<string, unknown>[]>(response)
            if (products.length > allProducts.length) {
              allProducts = products
              console.log(`API với ${param}:`, allProducts.length, 'products')
            }
          }
        } catch (err) {
          console.log(`API với ${param} lỗi:`, err)
        }
      }

      console.log('=== KẾT QUẢ CUỐI CÙNG ===')
      console.log('Tổng số products từ API:', allProducts.length)
      
      // Filter chỉ lấy CPU (category_id = 1)
      const cpus = allProducts.filter(product => {
        const categoryId = product.category_id || (product.category as { id?: number })?.id
        const isCPU = categoryId === 1
        console.log(`Product: ${product.name}, category_id: ${product.category_id}, category.id: ${(product.category as { id?: number })?.id}, isCPU: ${isCPU}`)
        return isCPU
      })
      
      console.log(`Tìm thấy ${cpus.length} CPU (category_id=1)`)
      console.log('Danh sách CPU:', cpus.map(cpu => `${cpu.name} (ID: ${cpu.id})`))
      
      if (cpus.length < 28) {
        console.warn(`⚠️ Chỉ tìm thấy ${cpus.length}/28 CPU. Backend có thể có pagination!`)
      } else {
        console.log(`✅ Đã lấy đủ ${cpus.length} CPU từ database!`)
      }
      
      return cpus
    } catch (error) {
      console.error('Error fetching products from backend:', error)
      throw error
    }
  }


  // Function để lấy tất cả categories
  static async getCategories(): Promise<Record<string, unknown>[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/category`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await this.handleResponse<Record<string, unknown>[]>(response)
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw error
    }
  }

  // Function riêng để lấy CPU (category_id = 1)
  static async getCPUsOnly(): Promise<Record<string, unknown>[]> {
    try {
      console.log('Fetching CPUs with category_id = 1...')
      
      // Lấy tất cả products
      const response = await fetch(`${API_BASE_URL}/api/product`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const allProducts = await this.handleResponse<Record<string, unknown>[]>(response)
      console.log(`Total products from API: ${allProducts.length}`)
      
      // Filter CHỈ lấy CPU (category_id = 1)
      const cpus = allProducts.filter(product => {
        const categoryId = product.category_id || (product.category as { id?: number })?.id
        const isCPU = categoryId === 1
        if (isCPU) {
          console.log(`Found CPU: ${product.name} (category_id: ${categoryId})`)
        }
        return isCPU
      })
      
      console.log(`Found ${cpus.length} CPUs with category_id = 1`)
      return cpus
    } catch (error) {
      console.error('Error fetching CPUs only:', error)
      throw error
    }
  }

  static async getProductsByCategory(categoryId: number): Promise<Record<string, unknown>[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/product`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const allProducts = await this.handleResponse<Record<string, unknown>[]>(response)
      
      // Filter theo category_id (hỗ trợ nhiều dạng trường như CPU page)
      const products = allProducts.filter((product: Record<string, unknown>) => {
        const rawId = (product as Record<string, unknown>).category_id
          ?? (product as Record<string, unknown>).categoryId
          ?? ((product.category as { id?: number })?.id)
        const normalized = typeof rawId === 'string' ? parseInt(rawId, 10) : Number(rawId)
        return normalized === categoryId
      })
      
      console.log(`Tìm thấy ${products.length} products với category_id=${categoryId}`)
      return products
    } catch (error) {
      console.error('Error fetching products by category:', error)
      throw error
    }
  }

  static async getProductById(id: number): Promise<Record<string, unknown>> {
    const response = await fetch(`${API_BASE_URL}/api/product/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return this.handleResponse<Record<string, unknown>>(response)
  }

  static async createProduct(product: Record<string, unknown>): Promise<Record<string, unknown>> {
    const response = await fetch(`${API_BASE_URL}/api/product`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    })

    return this.handleResponse<Record<string, unknown>>(response)
  }

  static async updateProduct(id: number, product: Record<string, unknown>): Promise<Record<string, unknown>> {
    const response = await fetch(`${API_BASE_URL}/api/product/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    })

    return this.handleResponse<Record<string, unknown>>(response)
  }

  static async deleteProduct(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/product/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData?.message || 'Có lỗi xảy ra khi xóa sản phẩm')
    }
  }

  // Utility functions để làm việc với token

  static isTokenValid(token: string): boolean {
    try {
      const decoded = this.decodeToken(token)
      if (!decoded) return false

      // Kiểm tra timestamp (token hết hạn sau 24h)
      const tokenTime = decoded.timestamp as number
      const currentTime = Date.now()
      const maxAge = 24 * 60 * 60 * 1000 // 24 hours

      return (currentTime - tokenTime) < maxAge
    } catch (error) {
      console.error('Error validating token:', error)
      return false
    }
  }

  static getCurrentUser(): Record<string, unknown> | null {
    const token = localStorage.getItem('authToken')
    if (!token) return null

    // Kiểm tra token có hợp lệ không
    if (!this.isTokenValid(token)) {
      // Token không hợp lệ, xóa khỏi localStorage
      localStorage.removeItem('authToken')
      localStorage.removeItem('authUser')
      return null
    }

    const decoded = this.decodeToken(token)
    return decoded || null
  }

  static getUserRole(): string | null {
    const user = this.getCurrentUser()
    return user?.role as string || null
  }

  static isAdmin(): boolean {
    return this.getUserRole() === 'Admin'
  }

  static isStaff(): boolean {
    const role = this.getUserRole()
    return role === 'Staff'  // Chỉ Staff, không bao gồm Admin
  }

  static isUser(): boolean {
    const role = this.getUserRole()
    return role === 'Customer' || role === 'User'
  }

  static hasRole(requiredRole: string): boolean {
    const userRole = this.getUserRole()
    
    // Kiểm tra role cụ thể - Admin KHÔNG có quyền vào Staff
    switch (requiredRole) {
      case 'Admin':
        return userRole === 'Admin'
      case 'Staff':
        return userRole === 'Staff'  // Chỉ Staff, Admin không được vào
      case 'User':
      case 'Customer':
        return userRole === 'Customer' || userRole === 'User'
      default:
        return false
    }
  }

  // Function để clear tất cả dữ liệu authentication
  static clearAuthData(): void {
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    console.log('Đã xóa tất cả dữ liệu authentication')
  }

  // Function để kiểm tra và clear dữ liệu cũ
  static checkAndClearOldData(): void {
    const token = localStorage.getItem('authToken')
    if (token && !this.isTokenValid(token)) {
      console.log('Phát hiện token cũ hoặc không hợp lệ, đang xóa...')
      this.clearAuthData()
    }
  }
}

export default ApiService
