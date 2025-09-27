const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8080'

export interface LoginRequest {
  identifier: string // email or username
  password: string
}

export interface RegisterRequest {
  username: string
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
      const errorData = await response.json().catch(() => ({}))
      const error: ApiError = {
        message: errorData?.message || 'Có lỗi xảy ra',
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
        username: user.username || 'unknown_username',
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
      username: 'new_user',
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
    const response = await fetch(`${API_BASE_URL}/api/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    const data = await this.handleResponse<AuthResponse>(response)
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

    const decoded = this.decodeToken(token)
    return decoded || null
  }
}

export default ApiService
