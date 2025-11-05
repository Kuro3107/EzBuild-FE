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
        message: (errorData as Record<string, unknown>)?.message as string || (errorData as Record<string, unknown>)?.error as string || `HTTP ${response.status}: ${response.statusText}`,
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
      // Kiểm tra nếu là JWT token (có 3 phần được phân tách bởi dấu chấm)
      if (token.includes('.') && token.split('.').length === 3) {
        console.log('Detected JWT token format')
        // JWT token: header.payload.signature
        const parts = token.split('.')
        const payload = parts[1]
        
        // Decode base64url (JWT sử dụng base64url, không phải base64 thông thường)
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
        const padded = base64 + '='.repeat((4 - base64.length % 4) % 4)
        const decoded = atob(padded)
        
        console.log('JWT payload decoded:', decoded)
        return JSON.parse(decoded)
      } else {
        // Token tự tạo (base64 encoded JSON)
        console.log('Detected custom token format')
        const decoded = atob(token)
        const jsonString = decodeURIComponent(decoded)
        return JSON.parse(jsonString)
      }
    } catch (error) {
      console.error('Error decoding token:', error)
      console.error('Token that failed to decode:', token)
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

  static async sendOTP(email: string): Promise<{ message: string }> {
    console.log('=== SEND OTP DEBUG ===')
    console.log('API URL:', `${API_BASE_URL}/api/auth/forgot-password`)
    console.log('Email:', email)
    
    const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `email=${encodeURIComponent(email)}`,
    })

    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))

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
        message: (errorData as Record<string, unknown>)?.message as string || (errorData as Record<string, unknown>)?.error as string || `HTTP ${response.status}: ${response.statusText}`,
        status: response.status
      }
      throw error
    }

    // Backend trả về text thay vì JSON
    const responseText = await response.text()
    console.log('Response text:', responseText)
    
    return { message: responseText }
  }

  static async validateOTP(email: string, otp: string): Promise<{ message: string }> {
    console.log('=== VALIDATE OTP DEBUG ===')
    console.log('API URL:', `${API_BASE_URL}/api/auth/validate-otp`)
    console.log('Email:', email)
    console.log('OTP:', otp)
    
    const response = await fetch(`${API_BASE_URL}/api/auth/validate-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`,
    })

    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))

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
        message: (errorData as Record<string, unknown>)?.message as string || (errorData as Record<string, unknown>)?.error as string || `HTTP ${response.status}: ${response.statusText}`,
        status: response.status
      }
      throw error
    }

    // Backend trả về text thay vì JSON
    const responseText = await response.text()
    console.log('Response text:', responseText)
    
    return { message: responseText }
  }

  static async resetPassword(email: string, otp: string, newPassword: string): Promise<{ message: string }> {
    console.log('=== RESET PASSWORD DEBUG ===')
    console.log('API URL:', `${API_BASE_URL}/api/auth/reset-password`)
    console.log('Email:', email)
    console.log('OTP:', otp)
    
    const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}&newPassword=${encodeURIComponent(newPassword)}`,
    })

    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))

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
        message: (errorData as Record<string, unknown>)?.message as string || (errorData as Record<string, unknown>)?.error as string || `HTTP ${response.status}: ${response.statusText}`,
        status: response.status
      }
      throw error
    }

    // Backend trả về text thay vì JSON
    const responseText = await response.text()
    console.log('Response text:', responseText)
    
    return { message: responseText }
  }

  static async getUserProfile(userId: string): Promise<Record<string, unknown>> {
    const token = localStorage.getItem('authToken')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const cleanedId = (String(userId).match(/\d+/)?.[0] || String(userId)).replace(/^0+(?=\d)/, '')
    const response = await fetch(`${API_BASE_URL}/api/user/${cleanedId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    return this.handleResponse<Record<string, unknown>>(response)
  }

  // Method để lấy thông tin user hiện tại từ backend
  static async getCurrentUserProfile(): Promise<Record<string, unknown> | null> {
    const token = localStorage.getItem('authToken')
    if (!token) {
      return null
    }

    try {
      // Thử gọi API /api/user/home để lấy thông tin user
      const response = await fetch(`${API_BASE_URL}/api/user/home`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const responseText = await response.text()
        console.log('Raw response from /api/user/home:', responseText)
        
        // Backend trả về string "Xin chào email", cần extract email
        const emailMatch = responseText.match(/Xin chào (.+)/)
        if (emailMatch) {
          const email = emailMatch[1]
          console.log('Extracted email from response:', email)
          
          // Tạo user object với thông tin cơ bản
          const userData = {
            email: email,
            fullname: email.split('@')[0], // Lấy phần trước @ làm tên
            username: email.split('@')[0],
            role: 'User', // Default role, sẽ được cập nhật từ database
            userId: email,
            phone: '',
            dob: '',
            address: ''
          }
          
          console.log('Created user data:', userData)
          return userData
        }
        
        return null
      } else {
        console.log('Failed to get user profile from API:', response.status)
        return null
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }

  // Method để lấy thông tin user đầy đủ từ database (cần backend endpoint mới)
  static async getUserByEmail(email: string): Promise<Record<string, unknown> | null> {
    const token = localStorage.getItem('authToken')
    if (!token) {
      console.log('No auth token found for getUserByEmail')
      return null
    }

    const url = `${API_BASE_URL}/api/user/by-email/${encodeURIComponent(email)}`
    console.log('Calling getUserByEmail API:', url)
    console.log('Using token:', token.substring(0, 20) + '...')

    try {
      // Gọi API để lấy thông tin user đầy đủ từ database
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      console.log('getUserByEmail response status:', response.status)
      console.log('getUserByEmail response headers:', Object.fromEntries(response.headers.entries()))

      if (response.ok) {
        const userData = await response.json()
        console.log('Full user data from database:', userData)
        return userData
      } else {
        const errorText = await response.text()
        console.log('Failed to get user by email from API:', response.status, errorText)
        return null
      }
    } catch (error) {
      console.error('Error fetching user by email:', error)
      return null
    }
  }

  // Method để thử lấy thông tin user từ nhiều endpoint khác nhau
  static async tryGetUserInfo(email: string): Promise<Record<string, unknown> | null> {
    const token = localStorage.getItem('authToken')
    if (!token) {
      return null
    }

    // Thử các endpoint khác nhau
    const endpoints = [
      `/api/user/by-email/${encodeURIComponent(email)}`,
      `/api/user/profile`,
      `/api/user/me`,
      `/api/user/current`
    ]

    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`)
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const userData = await response.json()
          console.log(`Success with endpoint ${endpoint}:`, userData)
          return userData
        } else {
          console.log(`Endpoint ${endpoint} failed with status:`, response.status)
        }
      } catch (error) {
        console.log(`Endpoint ${endpoint} error:`, error)
      }
    }

    console.log('All endpoints failed, returning null')
    return null
  }

  // Method để lấy user info từ database bằng cách gọi login API với email
  static async getUserInfoByEmail(email: string): Promise<Record<string, unknown> | null> {
    try {
      console.log('Trying to get user info by calling login API with email...')
      
      // Gọi login API với email (không cần password cho OAuth user)
      const response = await fetch(`${API_BASE_URL}/api/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: email,
          password: 'oauth_user' // Dummy password, backend cần xử lý OAuth user
        })
      })

      if (response.ok) {
        const loginData = await response.json()
        console.log('Login API response for OAuth user:', loginData)
        
        if (loginData.user) {
          return loginData.user
        }
      } else {
        console.log('Login API failed for OAuth user:', response.status)
      }
    } catch (error) {
      console.error('Error calling login API for OAuth user:', error)
    }
    
    return null
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
  static async getAllProducts(): Promise<Record<string, unknown>[]> {
    try {
      // Thử nhiều cách để lấy tất cả products
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
      
      return allProducts
    } catch (error) {
      console.error('Error fetching products from backend:', error)
      throw error
    }
  }

  // Method để lấy tất cả CPU (tương thích ngược)
  static async getCPUs(): Promise<Record<string, unknown>[]> {
    try {
      const allProducts = await this.getAllProducts()
      
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
      console.error('Error fetching CPUs from backend:', error)
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

  // Function tạo mock data cho giá CPU dựa trên database
  // Đã xóa createMockPricesForCPU - KHÔNG dùng mock data

  // Function riêng để lấy CPU (category_id = 1) với giá từ suppliers
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
      
      // API /api/product ĐÃ trả về productPrices sẵn rồi - không cần fetch riêng!
      const cpusWithPrices = cpus.map((cpu) => {
        // Lấy productPrices từ CPU object (đã có sẵn từ API)
        const productPrices = cpu.productPrices as Array<Record<string, unknown>> || []
        
        console.log(`CPU ${cpu.name} (id: ${cpu.id}) - has ${productPrices.length} prices from API`)
        
        if (productPrices.length > 0) {
          console.log(`✅ Found ${productPrices.length} real prices for CPU ${cpu.name}`)
          console.log('Sample prices:', productPrices.slice(0, 2))
          return {
            ...cpu,
            productPrices: productPrices
          }
        } else {
          // KHÔNG dùng mock data - chỉ hiển thị CPU không có giá
          console.log(`❌ No prices found for CPU ${cpu.name} - will show "Liên hệ"`)
          return {
            ...cpu,
            productPrices: [] // Mảng rỗng thay vì mock data
          }
        }
      })
      
      return cpusWithPrices
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
      
      // Debug: Log sample product để xem cấu trúc dữ liệu
      if (allProducts.length > 0) {
        console.log(`🔍 Filtering ${allProducts.length} products for category_id=${categoryId}`)
        console.log('🔍 Sample product before filter:', allProducts[0])
        const sampleProduct = allProducts[0] as Record<string, unknown>
        console.log('🔍 Sample product.category_id:', sampleProduct.category_id)
        console.log('🔍 Sample product.categoryId:', sampleProduct.categoryId)
        console.log('🔍 Sample product.category:', sampleProduct.category)
        if (sampleProduct.category && typeof sampleProduct.category === 'object') {
          console.log('🔍 Sample product.category.id:', (sampleProduct.category as { id?: number })?.id)
        }
      }
      
      // Filter theo category_id (hỗ trợ nhiều dạng trường như CPU page)
      const products = allProducts.filter((product: Record<string, unknown>) => {
        const rawId = (product as Record<string, unknown>).category_id
          ?? (product as Record<string, unknown>).categoryId
          ?? ((product.category as { id?: number })?.id)
        const normalized = typeof rawId === 'string' ? parseInt(rawId, 10) : Number(rawId)
        return normalized === categoryId
      })
      
      console.log(`✅ Tìm thấy ${products.length} products với category_id=${categoryId}`)
      if (products.length === 0 && allProducts.length > 0) {
        console.log('⚠️ Không tìm thấy products. Sample product:', allProducts[0])
        const sampleProduct = allProducts[0] as Record<string, unknown>
        const sampleRawId = sampleProduct.category_id 
          ?? sampleProduct.categoryId 
          ?? ((sampleProduct.category as { id?: number })?.id)
        console.log('⚠️ Sample product raw category_id:', sampleRawId)
        const sampleNormalized = typeof sampleRawId === 'string' ? parseInt(sampleRawId, 10) : Number(sampleRawId)
        console.log('⚠️ Sample product normalized category_id:', sampleNormalized)
        console.log('⚠️ Looking for category_id:', categoryId)
      }
      return products
    } catch (error) {
      console.error('Error fetching products by category:', error)
      throw error
    }
  }

  static async getProductById(id: number): Promise<Record<string, unknown>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/product/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await this.handleResponse<Record<string, unknown>>(response)
    } catch (error) {
      console.error('Error fetching product by ID:', error)
      throw error
    }
  }

  static async createProduct(product: Record<string, unknown>): Promise<Record<string, unknown>> {
    // Backend expects JSON body mapped to Product with category object
    const catId = Number(product['category_id'] ?? product['categoryId'] ?? (product['category'] as any)?.id ?? 0)
    const payload: Record<string, unknown> = {
      name: product['name'],
      brand: product['brand'],
      model: product['model'],
      specs: product['specs'],
      ...(Number.isFinite(catId) && catId > 0 ? { category: { id: catId } } : {}),
      imageUrl1: product['imageUrl1'],
      imageUrl2: product['imageUrl2'],
      imageUrl3: product['imageUrl3'],
      imageUrl4: product['imageUrl4']
    }

    const response = await fetch(`${API_BASE_URL}/api/product`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    return this.handleResponse<Record<string, unknown>>(response)
  }

  static async updateProduct(id: number, product: Record<string, unknown>): Promise<Record<string, unknown>> {
    // Try JSON first
    try {
      const response = await fetch(`${API_BASE_URL}/api/product/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(product),
      })

      if (response.ok) {
        return this.handleResponse<Record<string, unknown>>(response)
      } else {
        const text = await response.text().catch(() => '')
        console.warn('[updateProduct] JSON simple failed:', response.status, text)
      }
    } catch (e) {
      console.warn('[updateProduct] JSON simple error:', e)
    }

    // Try JSON with category object
    try {
      const catId = Number(product['category_id'] ?? product['categoryId'] ?? (product['category'] as any)?.id ?? 0)
      const jsonWithCategory = {
        id,
        ...product,
        ...(Number.isFinite(catId) && catId > 0 ? { category: { id: catId } } : {}),
      }
      const response = await fetch(`${API_BASE_URL}/api/product/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(jsonWithCategory),
      })

      if (response.ok) {
        return this.handleResponse<Record<string, unknown>>(response)
      } else {
        const text = await response.text().catch(() => '')
        console.warn('[updateProduct] JSON with category failed:', response.status, text)
      }
    } catch (e) {
      console.warn('[updateProduct] JSON with category error:', e)
    }

    // Try MINIMAL JSON (whitelisted fields only) to avoid UnrecognizedPropertyException
    try {
      const catId = Number(product['category_id'] ?? product['categoryId'] ?? (product['category'] as any)?.id ?? 0)
      const minimalPayload: Record<string, unknown> = {
        id,
        name: product['name'],
        brand: product['brand'],
        model: product['model'],
        specs: product['specs'],
        ...(Number.isFinite(catId) && catId > 0 ? { category: { id: catId } } : {}),
        imageUrl1: product['imageUrl1'],
        imageUrl2: product['imageUrl2'],
        imageUrl3: product['imageUrl3'],
        imageUrl4: product['imageUrl4']
      }
      const response = await fetch(`${API_BASE_URL}/api/product/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(minimalPayload),
      })

      if (response.ok) {
        console.log('[updateProduct] succeeded with minimal JSON payload')
        return this.handleResponse<Record<string, unknown>>(response)
      } else {
        const text = await response.text().catch(() => '')
        console.warn('[updateProduct] minimal JSON failed:', response.status, text)
      }
    } catch (e) {
      console.warn('[updateProduct] minimal JSON error:', e)
    }

    // Fallback: x-www-form-urlencoded
    const params = new URLSearchParams()
    const safeGet = (key: string) => {
      const v = product[key]
      return v === null || v === undefined ? '' : String(v)
    }
    params.set('name', safeGet('name'))
    params.set('brand', safeGet('brand'))
    params.set('model', safeGet('model'))
    params.set('specs', safeGet('specs'))
    const catId = Number(product['category_id'] ?? product['categoryId'] ?? (product['category'] as any)?.id ?? 0)
    if (Number.isFinite(catId) && catId > 0) {
      params.set('category_id', String(catId))
      params.set('categoryId', String(catId))
      params.set('category.id', String(catId))
    }
    params.set('imageUrl1', safeGet('imageUrl1'))
    params.set('imageUrl2', safeGet('imageUrl2'))
    params.set('imageUrl3', safeGet('imageUrl3'))
    params.set('imageUrl4', safeGet('imageUrl4'))

    const fallbackResp = await fetch(`${API_BASE_URL}/api/product/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: (() => {
        // include id in body for controllers expecting full entity
        params.set('id', String(id))
        return params.toString()
      })(),
    })

    if (fallbackResp.ok) {
      return this.handleResponse<Record<string, unknown>>(fallbackResp)
    } else {
      const text = await fallbackResp.text().catch(() => '')
      console.error('[updateProduct] Form fallback failed:', fallbackResp.status, text)
      throw new Error(text || `HTTP ${fallbackResp.status}`)
    }
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

      // Kiểm tra nếu là JWT token từ backend (có exp field)
      if (decoded.exp) {
        const currentTime = Math.floor(Date.now() / 1000) // JWT exp là seconds
        const tokenExp = decoded.exp as number
        console.log('JWT token validation:', { currentTime, tokenExp, isValid: currentTime < tokenExp })
        return currentTime < tokenExp
      }

      // Kiểm tra timestamp cho token tự tạo (token hết hạn sau 24h)
      if (decoded.timestamp) {
        const tokenTime = decoded.timestamp as number
        const currentTime = Date.now()
        const maxAge = 24 * 60 * 60 * 1000 // 24 hours
        console.log('Custom token validation:', { currentTime, tokenTime, isValid: (currentTime - tokenTime) < maxAge })
        return (currentTime - tokenTime) < maxAge
      }

      // Nếu không có exp hoặc timestamp, coi như hợp lệ (để tương thích)
      console.log('Token without exp/timestamp, assuming valid')
      return true
    } catch (error) {
      console.error('Error validating token:', error)
      return false
    }
  }

  static getCurrentUser(): Record<string, unknown> | null {
    const token = localStorage.getItem('authToken')
    if (!token) {
      console.log('No auth token found in getCurrentUser')
      return null
    }

    console.log('=== GET CURRENT USER DEBUG ===')
    console.log('Token exists:', !!token)
    console.log('Token valid:', this.isTokenValid(token))

    // Kiểm tra token có hợp lệ không
    if (!this.isTokenValid(token)) {
      console.log('Token is invalid, clearing auth data')
      // Token không hợp lệ, xóa khỏi localStorage
      localStorage.removeItem('authToken')
      localStorage.removeItem('authUser')
      return null
    }

    // Ưu tiên lấy user info từ localStorage (thông tin đầy đủ từ API)
    const authUser = localStorage.getItem('authUser')
    if (authUser) {
      try {
        const user = JSON.parse(authUser)
        console.log('Using user info from localStorage:', user)
        return user
      } catch (error) {
        console.error('Error parsing authUser from localStorage:', error)
      }
    }

    // Fallback: lấy từ token
    const decoded = this.decodeToken(token)
    if (!decoded) {
      console.log('Failed to decode token')
      return null
    }

    console.log('Decoded token:', decoded)

    // Xử lý JWT token từ backend Spring Boot
    if (decoded.sub || decoded.userId || decoded.username) {
      // JWT token từ backend chỉ có sub (email), cần tạo user info cơ bản
      const email = decoded.sub || decoded.email
      const userInfo = {
        userId: decoded.sub || decoded.userId || decoded.id,
        username: decoded.username || decoded.sub,
        email: email, // Backend dùng sub = email
        fullname: decoded.fullname || decoded.name || (email && typeof email === 'string' ? email.split('@')[0] : 'Google User'),
        role: decoded.role || (Array.isArray(decoded.authorities) ? decoded.authorities[0] : undefined) || 'User',
        phone: decoded.phone || '',
        dob: decoded.dob || '',
        address: decoded.address || '',
        createdAt: decoded.createdAt || decoded.iat,
        // Giữ nguyên các field khác từ JWT
        ...decoded
      }
      console.log('Extracted user info from JWT:', userInfo)
      return userInfo
    }

    // Token tự tạo (đã có đầy đủ thông tin)
    console.log('Using custom token user info:', decoded)
    return decoded
  }

  static getUserRole(): string | null {
    // Ưu tiên lấy role từ localStorage (thông tin đầy đủ từ API)
    const authUser = localStorage.getItem('authUser')
    if (authUser) {
      try {
        const user = JSON.parse(authUser)
        const role = user.role
        console.log('User role from localStorage:', role)
        return role || null
      } catch (error) {
        console.error('Error parsing authUser from localStorage:', error)
      }
    }
    
    // Fallback: lấy từ token
    const user = this.getCurrentUser()
    const role = user?.role as string || null
    console.log('User role from token (fallback):', role)
    return role
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

  // Sales APIs
  static async getSales(): Promise<Record<string, unknown>[]> {
    try {
      console.log('Fetching sales data from API...')
      
      const response = await fetch(`${API_BASE_URL}/api/sales`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const salesData = await this.handleResponse<Record<string, unknown>[]>(response)
      console.log(`Found ${salesData.length} sales items from API`)
      
      return salesData
    } catch (error) {
      console.error('Error fetching sales data:', error)
      throw error
    }
  }

  static async getSalesByCategory(category: string): Promise<Record<string, unknown>[]> {
    try {
      console.log(`Fetching sales data for category: ${category}`)
      
      const response = await fetch(`${API_BASE_URL}/api/sales/category/${encodeURIComponent(category)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const salesData = await this.handleResponse<Record<string, unknown>[]>(response)
      console.log(`Found ${salesData.length} sales items for category ${category}`)
      
      return salesData
    } catch (error) {
      console.error(`Error fetching sales data for category ${category}:`, error)
      throw error
    }
  }

  static async refreshSales(): Promise<Record<string, unknown>[]> {
    try {
      console.log('Refreshing sales data...')
      
      const response = await fetch(`${API_BASE_URL}/api/sales/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const salesData = await this.handleResponse<Record<string, unknown>[]>(response)
      console.log(`Refreshed ${salesData.length} sales items`)
      
      return salesData
    } catch (error) {
      console.error('Error refreshing sales data:', error)
      throw error
    }
  }

  // Builds APIs
  static async createBuild(params: { userId: number | string; name: string; totalPrice: number; createdAt?: string; items?: Array<{ productPriceId: number; quantity?: number }> }): Promise<Record<string, unknown>> {
    const token = localStorage.getItem('authToken')
    // Preferred payload per Swagger DTO
    const payload: Record<string, unknown> = {
      userId: typeof params.userId === 'string' ? parseInt(params.userId, 10) : params.userId,
      name: params.name,
      totalPrice: params.totalPrice,
      ...(params.items && params.items.length > 0 ? {
        items: params.items.map((it) => ({
          productPriceId: it.productPriceId,
          quantity: it.quantity ?? 1
        }))
      } : {})
    }

    // Try single-POST per Swagger
    try {
      const response = await fetch(`${API_BASE_URL}/api/build`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      })
      if (!response.ok) throw await response.json().catch(async () => ({ message: await response.text().catch(() => 'Unknown error'), status: response.status }))
      return await response.json()
    } catch (err) {
      const anyErr = err as { message?: unknown; status?: unknown }
      const message = (anyErr?.message || '').toString()
      const status = Number(anyErr?.status || 0)
      const unsupported = message.includes('Content-Type') || status === 415 || message.toLowerCase().includes('not supported')

      // Fallback: create build first, then create items one by one (works with current backend)
      const fallbackResponse = await fetch(`${API_BASE_URL}/api/build`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          user: { id: typeof params.userId === 'string' ? parseInt(params.userId, 10) : params.userId },
          name: params.name,
          totalPrice: params.totalPrice
        })
      })

      if (!fallbackResponse.ok) {
        // If fallback also fails, propagate error
        const text = await fallbackResponse.text().catch(() => '')
        throw { message: text || message || 'Create build failed', status: fallbackResponse.status }
      }

      const build = await fallbackResponse.json()
      const buildId = Number(build?.id)
      if (unsupported && params.items && params.items.length > 0 && Number.isFinite(buildId)) {
        for (const it of params.items) {
          await this.createBuildItem({ buildId, productPriceId: it.productPriceId, quantity: it.quantity ?? 1 })
        }
      }

      return build
    }
  }

  static async createBuildItem(params: { buildId: number; productPriceId: number; quantity?: number }): Promise<Record<string, unknown>> {
    const token = localStorage.getItem('authToken')
    const payload = {
      build: { id: params.buildId },
      productPrice: { id: params.productPriceId },
      quantity: params.quantity ?? 1
    }

    const response = await fetch(`${API_BASE_URL}/api/build-item`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    })

    return this.handleResponse<Record<string, unknown>>(response)
  }

  static async getBuilds(): Promise<Array<Record<string, unknown>>> {
    const token = localStorage.getItem('authToken')
    const response = await fetch(`${API_BASE_URL}/api/build`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    })
    return this.handleResponse<Array<Record<string, unknown>>>(response)
  }

  static async getBuildsByUser(userId: number | string): Promise<Array<Record<string, unknown>>> {
    const all = await this.getBuilds()
    const uid = typeof userId === 'string' ? parseInt(userId, 10) : userId
    return all.filter((b) => {
      const u = (b as Record<string, unknown>).user as Record<string, unknown> | undefined
      const idVal = (u?.id as number) ?? (b as Record<string, unknown>).user_id as number | undefined
      return Number(idVal) === Number(uid)
    })
  }

  static async deleteBuild(id: number): Promise<void> {
    const token = localStorage.getItem('authToken')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/api/build/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData?.message || 'Có lỗi xảy ra khi xóa build')
    }
  }

  // Orders APIs
  static async createOrder(params: { userId: number | string; buildId?: number; totalPrice: number; address?: string; paymentMethod?: string; status?: string; phone?: string }): Promise<Record<string, unknown>> {
    const token = localStorage.getItem('authToken')
    const payload: Record<string, unknown> = {
      userId: typeof params.userId === 'string' ? parseInt(params.userId, 10) : params.userId,
      ...(typeof params.buildId === 'number' ? { buildId: params.buildId } : {}),
      totalPrice: params.totalPrice,
      address: params.address || '',
      paymentMethod: params.paymentMethod || 'COD',
      status: params.status || 'PAID',
      ...(params.phone ? { phone: params.phone } : {})
    }

    console.log('=== CREATE ORDER DEBUG ===')
    console.log('Payload:', JSON.stringify(payload, null, 2))
    console.log('Token exists:', !!token)

    const response = await fetch(`${API_BASE_URL}/api/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    })

    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))

    return this.handleResponse<Record<string, unknown>>(response)
  }

  static async getOrders(): Promise<Array<Record<string, unknown>>> {
    const token = localStorage.getItem('authToken')
    const response = await fetch(`${API_BASE_URL}/api/order`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    })
    return this.handleResponse<Array<Record<string, unknown>>>(response)
  }

  static async getOrdersByUser(userId: number | string): Promise<Array<Record<string, unknown>>> {
    const token = localStorage.getItem('authToken')
    const uidNum = typeof userId === 'string' ? parseInt((userId as string).replace(/[^0-9]/g, ''), 10) : userId
    const uid = Number.isFinite(uidNum as number) ? uidNum : userId
    const base = `${API_BASE_URL}/api/order`

    // Try direct endpoint patterns first
    const endpoints = [
      `${base}/user/${uid}`,
      `${base}?userId=${encodeURIComponent(String(uid))}`
    ]

    for (const url of endpoints) {
      try {
        const resp = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        })
        if (resp.ok) {
          const data = await this.handleResponse<Array<Record<string, unknown>>>(resp)
          return data
        }
      } catch {
        // try next
      }
    }

    // Fallback: fetch all and filter client-side
    const all = await this.getOrders()
    return all.filter((o) => {
      const u = (o as Record<string, unknown>).user as Record<string, unknown> | undefined
      const idVal = (u?.id as number) ?? (o as Record<string, unknown>).user_id as number | undefined
      return Number(idVal) === Number(uid)
    })
  }

  // Function để clear tất cả dữ liệu authentication
  static clearAuthData(): void {
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    console.log('Đã xóa tất cả dữ liệu authentication')
  }

  // Function để kiểm tra và clear dữ liệu cũ
  static checkAndClearOldData(): void {
    console.log('=== CHECK AND CLEAR OLD DATA ===')
    const token = localStorage.getItem('authToken')
    console.log('Token exists:', !!token)
    
    if (token) {
      const isValid = this.isTokenValid(token)
      console.log('Token is valid:', isValid)
      
      if (!isValid) {
        console.log('Phát hiện token cũ hoặc không hợp lệ, đang xóa...')
        this.clearAuthData()
      } else {
        console.log('Token is valid, keeping auth data')
      }
    } else {
      console.log('No token found')
    }
  }

  // Payment APIs
  static async createPayment(payment: { orderId: number; amount: number; method: string; status?: string }): Promise<Record<string, unknown>> {
    const token = localStorage.getItem('authToken')
    
    console.log('=== CREATING PAYMENT ===')
    console.log('Payment data:', payment)
    console.log('API URL:', `${API_BASE_URL}/api/payment`)
    
    // Format payload theo PaymentCreateRequest DTO
    const payload = {
      orderId: payment.orderId,  // ← Chỉ cần orderId, không cần object
      amount: payment.amount,
      method: payment.method,
      status: payment.status || 'PENDING'
    }

    console.log('Payload:', payload)

    // Thử JSON với Content-Type đơn giản
    console.log('Trying JSON with simple Content-Type...')
    
    const response = await fetch(`${API_BASE_URL}/api/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    })

    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.log('Error response:', errorText)
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    return await this.handleResponse<Record<string, unknown>>(response)
  }

  static async getPaymentById(id: number): Promise<Record<string, unknown>> {
    const token = localStorage.getItem('authToken')
    const response = await fetch(`${API_BASE_URL}/api/payment/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    })

    return this.handleResponse<Record<string, unknown>>(response)
  }

  static async updatePayment(id: number, payment: { status?: string; transactionId?: string; paidAt?: string }): Promise<Record<string, unknown>> {
    const token = localStorage.getItem('authToken')
    
    console.log('=== UPDATING PAYMENT ===')
    console.log('Payment ID:', id)
    console.log('Update data:', payment)
    
    const response = await fetch(`${API_BASE_URL}/api/payment/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payment)
    })

    console.log('Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log('Error response:', errorText)
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    return await this.handleResponse<Record<string, unknown>>(response)
  }

  static async getAllPayments(): Promise<Array<Record<string, unknown>>> {
    const token = localStorage.getItem('authToken')
    const response = await fetch(`${API_BASE_URL}/api/payment`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    })

    return this.handleResponse<Array<Record<string, unknown>>>(response)
  }

  static async deletePayment(id: number): Promise<void> {
    const token = localStorage.getItem('authToken')
    const response = await fetch(`${API_BASE_URL}/api/payment/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData?.message || 'Có lỗi xảy ra khi xóa payment')
    }
  }

  // Order Management APIs for Staff
  static async updateOrderStatus(orderId: number, status: string): Promise<Record<string, unknown>> {
    const token = localStorage.getItem('authToken')
    
    console.log('=== UPDATING ORDER STATUS ===')
    console.log('Order ID:', orderId)
    console.log('New Status:', status)
    
    try {
      // Sử dụng PATCH để cập nhật order status
      const response = await fetch(`${API_BASE_URL}/api/order/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status })
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.log('Error response:', errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      return await this.handleResponse<Record<string, unknown>>(response)
    } catch (error) {
      console.log('API update failed:', error)
      throw error
    }
  }

  static async getOrderById(orderId: number): Promise<Record<string, unknown>> {
    const token = localStorage.getItem('authToken')
    const response = await fetch(`${API_BASE_URL}/api/order/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    })

    return this.handleResponse<Record<string, unknown>>(response)
  }

  // Auto-update order status when payment is updated
  static async updatePaymentAndOrderStatus(paymentId: number, paymentStatus: string): Promise<{ payment: Record<string, unknown>; order?: Record<string, unknown> }> {
    try {
      // Update payment status
      const updatedPayment = await this.updatePayment(paymentId, { 
        status: paymentStatus,
        paidAt: paymentStatus !== 'PENDING' ? new Date().toISOString() : undefined
      })

      let updatedOrder: Record<string, unknown> | undefined = undefined

      // If payment is PAID, auto-update order to DEPOSITED
      if (paymentStatus === 'PAID') {
        try {
          const payment = await this.getPaymentById(paymentId)
          const orderId = payment.orderId as number
          
          if (orderId) {
            // Get current order status
            const currentOrder = await this.getOrderById(orderId)
            
            // Only update if order is still PENDING
            if (currentOrder.status === 'PENDING') {
              updatedOrder = await this.updateOrderStatus(orderId, 'DEPOSITED')
              console.log(`Auto-updated order ${orderId} to DEPOSITED`)
            }
          }
        } catch (orderError) {
          console.error('Error auto-updating order status:', orderError)
          // Don't throw error, payment update was successful
        }
      }

      return { payment: updatedPayment, order: updatedOrder }
    } catch (error) {
      console.error('Error updating payment and order status:', error)
      throw error
    }
  }

  // Auto-update orders to DONE after 3 days from PAID status
  static async checkAndUpdateOrdersToDone(): Promise<void> {
    try {
      const orders = await this.getOrders()
      const now = new Date()
      const threeDaysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000))

      for (const order of orders as any[]) {
        // Check if order is PAID and has been PAID for more than 3 days
        if (order.status === 'PAID' && order.updatedAt) {
          const updatedAt = new Date(order.updatedAt)
          if (updatedAt < threeDaysAgo) {
            try {
              await this.updateOrderStatus(order.id, 'DONE')
              console.log(`Auto-updated order ${order.id} to DONE after 3 days`)
            } catch (error) {
              console.error(`Error auto-updating order ${order.id} to DONE:`, error)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking and updating orders to DONE:', error)
    }
  }

  // AI Chat API
  static async sendAIChatMessage(message: string, chatHistory: Array<{ role: string; content: string }> = []): Promise<string> {
    const token = localStorage.getItem('authToken')
    const user = this.getCurrentUser()
    
    console.log('📤 Sending chat request to backend...')
    console.log('Endpoint:', `${API_BASE_URL}/api/chat/send`)
    console.log('Message:', message)
    console.log('User:', user?.id?.toString() || 'guest')
    console.log('Chat History:', chatHistory)
    
    const response = await fetch(`${API_BASE_URL}/api/chat/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        message,
        userId: user?.id?.toString() || 'guest',
        chatHistory: chatHistory
      })
    })

    console.log('📥 Response status:', response.status)

    const data = await this.handleResponse<{ message: string; response: string; success: boolean; error?: string }>(response)
    
    console.log('📥 Response data:', data)
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to get AI response')
    }
    
    return data.response
  }

  // Services APIs
  static async getAllServices(): Promise<Record<string, unknown>[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/service`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await this.handleResponse<Record<string, unknown>[]>(response)
    } catch (error) {
      console.error('Error fetching services:', error)
      throw error
    }
  }

  static async getServiceById(id: number): Promise<Record<string, unknown>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/service/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await this.handleResponse<Record<string, unknown>>(response)
    } catch (error) {
      console.error('Error fetching service:', error)
      throw error
    }
  }

  static async createService(service: Record<string, unknown>): Promise<Record<string, unknown>> {
    const response = await fetch(`${API_BASE_URL}/api/service`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(service),
    })

    return this.handleResponse<Record<string, unknown>>(response)
  }

  static async updateService(id: number, service: Record<string, unknown>): Promise<Record<string, unknown>> {
    const response = await fetch(`${API_BASE_URL}/api/service/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(service),
    })

    return this.handleResponse<Record<string, unknown>>(response)
  }

  static async deleteService(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/service/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData?.message || 'Có lỗi xảy ra khi xóa service')
    }
  }

  // Games APIs
  static async getAllGames(): Promise<Record<string, unknown>[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/game`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await this.handleResponse<Record<string, unknown>[]>(response)
    } catch (error) {
      console.error('Error fetching games:', error)
      throw error
    }
  }

  static async getGameById(id: number): Promise<Record<string, unknown>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/game/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await this.handleResponse<Record<string, unknown>>(response)
    } catch (error) {
      console.error('Error fetching game:', error)
      throw error
    }
  }

  static async createGame(game: Record<string, unknown>): Promise<Record<string, unknown>> {
    const response = await fetch(`${API_BASE_URL}/api/game`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(game),
    })

    return this.handleResponse<Record<string, unknown>>(response)
  }

  static async updateGame(id: number, game: Record<string, unknown>): Promise<Record<string, unknown>> {
    const response = await fetch(`${API_BASE_URL}/api/game/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(game),
    })

    return this.handleResponse<Record<string, unknown>>(response)
  }

  static async deleteGame(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/game/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData?.message || 'Có lỗi xảy ra khi xóa game')
    }
  }

  // Feedbacks APIs
  static async getAllOrderFeedbacks(): Promise<Record<string, unknown>[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/order-feedback`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await this.handleResponse<Record<string, unknown>[]>(response)
    } catch (error) {
      console.error('Error fetching order feedbacks:', error)
      throw error
    }
  }

  static async getAllServiceFeedbacks(): Promise<Record<string, unknown>[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/service-feedback`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await this.handleResponse<Record<string, unknown>[]>(response)
    } catch (error) {
      console.error('Error fetching service feedbacks:', error)
      throw error
    }
  }

  static async deleteOrderFeedback(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/order-feedback/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData?.message || 'Có lỗi xảy ra khi xóa feedback')
    }
  }

  static async deleteServiceFeedback(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/service-feedback/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData?.message || 'Có lỗi xảy ra khi xóa feedback')
    }
  }

  static async createOrderFeedback(data: { orderId: number; rating: number; comment: string; userId?: number; createdAt?: string }): Promise<Record<string, unknown>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/order-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData?.message || 'Có lỗi xảy ra khi tạo feedback')
      }

      return await this.handleResponse<Record<string, unknown>>(response)
    } catch (error) {
      console.error('Error creating order feedback:', error)
      throw error
    }
  }

  static async updateOrderFeedback(id: number, data: { orderId?: number; rating?: number; comment?: string; createdAt?: string }): Promise<Record<string, unknown>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/order-feedback/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData?.message || 'Có lỗi xảy ra khi cập nhật feedback')
      }

      return await this.handleResponse<Record<string, unknown>>(response)
    } catch (error) {
      console.error('Error updating order feedback:', error)
      throw error
    }
  }

  static async createServiceFeedback(data: { serviceId: number; rating: number; comment: string; userId?: number; createdAt?: string }): Promise<Record<string, unknown>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/service-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData?.message || 'Có lỗi xảy ra khi tạo feedback')
      }

      return await this.handleResponse<Record<string, unknown>>(response)
    } catch (error) {
      console.error('Error creating service feedback:', error)
      throw error
    }
  }

  static async updateServiceFeedback(id: number, data: { serviceId?: number; rating?: number; comment?: string; createdAt?: string }): Promise<Record<string, unknown>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/service-feedback/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData?.message || 'Có lỗi xảy ra khi cập nhật feedback')
      }

      return await this.handleResponse<Record<string, unknown>>(response)
    } catch (error) {
      console.error('Error updating service feedback:', error)
      throw error
    }
  }

  // User Management APIs (Admin)
  static async getAllUsers(): Promise<Record<string, unknown>[]> {
    const token = localStorage.getItem('authToken')
    if (!token) {
      throw new Error('No authentication token found')
    }

    // Thử nhiều endpoint khác nhau
    const endpoints = [
      `${API_BASE_URL}/api/user`,  // Endpoint chính - có thể trả về danh sách
      `${API_BASE_URL}/api/user/all`,
      `${API_BASE_URL}/api/users`,
      `${API_BASE_URL}/api/admin/users`,
      `${API_BASE_URL}/api/user/list`
    ]

    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`)
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data = await this.handleResponse<Record<string, unknown>[]>(response)
          console.log(`✅ Success with endpoint: ${endpoint}, got ${data.length} users`)
          return data
        } else {
          console.log(`Endpoint ${endpoint} failed with status: ${response.status}`)
        }
      } catch (err) {
        console.log(`Endpoint ${endpoint} error:`, err)
      }
    }

    // Fallback: Thử lấy từng user bằng cách loop qua IDs
    // Tối ưu: Gọi song song nhiều API cùng lúc thay vì tuần tự
    console.log('⚠️ Không tìm thấy endpoint list users, thử lấy từng user (song song)...')
    const maxAttempts = 100 // Thử tối đa 100 users
    const batchSize = 10 // Gọi 10 API cùng lúc để không quá tải
    
    // Tạo array các Promise để gọi song song
    const fetchUser = async (id: number): Promise<Record<string, unknown> | null> => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/user/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          return await this.handleResponse<Record<string, unknown>>(response)
        } else if (response.status === 404) {
          return null // User không tồn tại
        } else if (response.status === 401 || response.status === 403) {
          console.warn('⚠️ Không có quyền truy cập')
          return null
        }
        return null
      } catch (err) {
        console.log(`Error fetching user ${id}:`, err)
        return null
      }
    }

    // Chia thành các batch để gọi song song
    const users: Record<string, unknown>[] = []
    for (let startId = 1; startId <= maxAttempts; startId += batchSize) {
      const endId = Math.min(startId + batchSize - 1, maxAttempts)
      const batchPromises: Promise<Record<string, unknown> | null>[] = []
      
      // Tạo batch requests
      for (let id = startId; id <= endId; id++) {
        batchPromises.push(fetchUser(id))
      }

      // Gọi song song batch này
      try {
        const batchResults = await Promise.all(batchPromises)
        // Lọc bỏ các null (users không tồn tại)
        const validUsers = batchResults.filter(user => user !== null) as Record<string, unknown>[]
        users.push(...validUsers)
        
        // Nếu batch này không có user nào, có thể đã hết users
        if (validUsers.length === 0 && startId > 20) {
          console.log(`Không tìm thấy users từ ID ${startId}, có thể đã hết`)
          break
        }
      } catch (err) {
        console.error(`Error in batch ${startId}-${endId}:`, err)
      }
    }

    if (users.length > 0) {
      console.log(`✅ Lấy được ${users.length} users bằng cách gọi song song API /api/user/{id}`)
      return users
    }

    // Nếu tất cả đều fail
    console.warn('⚠️ Không thể lấy danh sách users. Backend cần có GET /api/user (trả về array) để hiệu quả hơn.')
    return []
  }

  static async getUserById(userId: string): Promise<Record<string, unknown>> {
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

  static async createUser(userData: Record<string, unknown>): Promise<Record<string, unknown>> {
    const token = localStorage.getItem('authToken')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/api/user`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    return this.handleResponse<Record<string, unknown>>(response)
  }

  static async updateUser(userId: string, userData: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.updateUserProfile(userId, userData)
  }

  // Staff Management APIs (Admin)
  // Staff là users có role = "Staff", nên lấy từ users và filter
  static async getAllStaff(): Promise<Record<string, unknown>[]> {
    try {
      // Lấy tất cả users rồi filter role = "Staff"
      const allUsers = await this.getAllUsers()
      return allUsers.filter(user => user.role === 'Staff')
    } catch (err) {
      console.error('Error loading staff:', err)
      return []
    }
  }

  static async getStaffById(staffId: string): Promise<Record<string, unknown>> {
    const token = localStorage.getItem('authToken')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/api/staff/${staffId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    return this.handleResponse<Record<string, unknown>>(response)
  }

  static async createStaff(staffData: Record<string, unknown>): Promise<Record<string, unknown>> {
    const token = localStorage.getItem('authToken')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/api/staff`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(staffData),
    })

    return this.handleResponse<Record<string, unknown>>(response)
  }

  static async updateStaff(staffId: string, staffData: Record<string, unknown>): Promise<Record<string, unknown>> {
    const token = localStorage.getItem('authToken')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/api/staff/${staffId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(staffData),
    })

    return this.handleResponse<Record<string, unknown>>(response)
  }

  static async deleteStaff(staffId: string): Promise<void> {
    const token = localStorage.getItem('authToken')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/api/staff/${staffId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData?.message || 'Có lỗi xảy ra khi xóa staff')
    }
  }

  // AI Management APIs (Admin)
  static async getAllAIConfigs(): Promise<Record<string, unknown>[]> {
    const token = localStorage.getItem('authToken')
    if (!token) {
      throw new Error('No authentication token found')
    }

    // Thử nhiều endpoint khác nhau
    const endpoints = [
      `${API_BASE_URL}/api/ai-config`,
      `${API_BASE_URL}/api/ai-config/all`,
      `${API_BASE_URL}/api/admin/ai-config`,
      `${API_BASE_URL}/api/ai/configs`
    ]

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          return await this.handleResponse<Record<string, unknown>[]>(response)
        }
      } catch (err) {
        console.log(`Endpoint ${endpoint} failed, trying next...`)
      }
    }

    // Nếu tất cả đều fail, trả về empty array và log warning
    console.warn('⚠️ Backend chưa có endpoint để lấy danh sách AI configs. Vui lòng implement GET /api/ai-config hoặc tương tự.')
    return []
  }

  static async getAIConfigById(configId: string): Promise<Record<string, unknown>> {
    const token = localStorage.getItem('authToken')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/api/ai-config/${configId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    return this.handleResponse<Record<string, unknown>>(response)
  }

  static async createAIConfig(configData: Record<string, unknown>): Promise<Record<string, unknown>> {
    const token = localStorage.getItem('authToken')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/api/ai-config`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(configData),
    })

    return this.handleResponse<Record<string, unknown>>(response)
  }

  static async updateAIConfig(configId: string, configData: Record<string, unknown>): Promise<Record<string, unknown>> {
    const token = localStorage.getItem('authToken')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/api/ai-config/${configId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(configData),
    })

    return this.handleResponse<Record<string, unknown>>(response)
  }

  static async deleteAIConfig(configId: string): Promise<void> {
    const token = localStorage.getItem('authToken')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/api/ai-config/${configId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData?.message || 'Có lỗi xảy ra khi xóa AI config')
    }
  }
}

export default ApiService
