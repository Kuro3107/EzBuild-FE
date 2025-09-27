import { useState } from 'react'
import ApiService from '../services/api'

// Function để sanitize data, loại bỏ thông tin nhạy cảm
function sanitizeForLogging(data: unknown): unknown {
  if (!data || typeof data !== 'object') return data
  
  const sanitized = { ...(data as Record<string, unknown>) }
  
  // Loại bỏ password và các field nhạy cảm
  if (sanitized.user && typeof sanitized.user === 'object') {
    const user = sanitized.user as Record<string, unknown>
    sanitized.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullname: user.fullname,
      phone: user.phone,
      dob: user.dob,
      address: user.address,
      role: user.role,
      createdAt: user.createdAt
      // Loại bỏ password
    }
  }
  
  if (sanitized.password) {
    sanitized.password = '[HIDDEN]'
  }
  
  return sanitized
}

export default function ApiDebugger() {
  const [testResult, setTestResult] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [testCredentials, setTestCredentials] = useState({
    identifier: 'test@example.com',
    password: 'password123'
  })

  const testLogin = async () => {
    setIsLoading(true)
    setTestResult('')
    
    try {
      // Test với dữ liệu từ input
      const result = await ApiService.login(testCredentials)
      
      const tokenInfo = ApiService.decodeToken(result.token)
      setTestResult(`✅ Login thành công:\n${JSON.stringify(sanitizeForLogging(result), null, 2)}\n\n🔑 Token Info:\n${JSON.stringify(tokenInfo, null, 2)}`)
    } catch (error) {
      setTestResult(`❌ Login thất bại:\n${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testRegister = async () => {
    setIsLoading(true)
    setTestResult('')
    
    try {
      // Test với dữ liệu từ input
      const result = await ApiService.register({
        username: testCredentials.identifier.split('@')[0], // Extract username from email
        fullname: 'Test User',
        email: testCredentials.identifier,
        password: testCredentials.password,
        phone: '0123456789',
        dob: '2000-01-01',
        address: 'Test Address'
      })
      
      const tokenInfo = ApiService.decodeToken(result.token)
      setTestResult(`✅ Register thành công:\n${JSON.stringify(sanitizeForLogging(result), null, 2)}\n\n🔑 Token Info:\n${JSON.stringify(tokenInfo, null, 2)}`)
    } catch (error) {
      setTestResult(`❌ Register thất bại:\n${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testTokenValidation = async () => {
    setIsLoading(true)
    setTestResult('')
    
    try {
      const token = localStorage.getItem('authToken')
      const userInfo = localStorage.getItem('authUser')
      
      if (!token) {
        setTestResult('❌ Không có token trong localStorage')
        return
      }

      const isValid = ApiService.isTokenValid(token)
      const tokenInfo = ApiService.decodeToken(token)
      const currentUser = ApiService.getCurrentUser()

      let result = `🔑 Token Validation:\n`
      result += `- Token exists: ${!!token}\n`
      result += `- Token valid: ${isValid}\n`
      result += `- User info in localStorage: ${userInfo}\n`
      result += `- Token info: ${JSON.stringify(tokenInfo, null, 2)}\n`
      result += `- Current user: ${JSON.stringify(currentUser, null, 2)}\n\n`
      
      // Kiểm tra username cụ thể
      if (tokenInfo) {
        result += `🔍 Username Analysis:\n`
        result += `- Username in token: "${tokenInfo.username}"\n`
        result += `- Username type: ${typeof tokenInfo.username}\n`
        result += `- Username length: ${(tokenInfo.username as string)?.length || 0}\n`
      }
      
      if (userInfo) {
        try {
          const user = JSON.parse(userInfo)
          result += `- Username in localStorage: "${user.username}"\n`
          result += `- User object keys: ${Object.keys(user).join(', ')}\n`
        } catch (e) {
          result += `- Error parsing user info: ${e}\n`
        }
      }

      setTestResult(result)
    } catch (error) {
      setTestResult(`❌ Token validation error:\n${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testUsernameIssue = async () => {
    setIsLoading(true)
    setTestResult('')
    
    try {
      // Test với cấu trúc response thực tế từ backend
      const testData = {
        message: "Login successful",
        user: {
          id: 2,
          username: "quankun2303",
          fullname: "Tong Hong Quan 2",
          email: "quanthse183332@fpt.edu.vn",
          phone: "0562001905",
          dob: "2004-03-23",
          address: "Tan Binh, HCM",
          role: "Admin",
          createdAt: "2025-09-23T04:12:38"
        }
      }
      
      // Simulate token generation với cấu trúc mới
      const tokenData = {
        userId: testData.user.id || Date.now(),
        username: testData.user.username || 'unknown_username',
        email: testData.user.email || 'unknown@example.com',
        role: testData.user.role || 'User',
        timestamp: Date.now(),
        type: 'temporary',
        source: 'login_response'
      }
      
      const token = btoa(JSON.stringify(tokenData))
      const decoded = ApiService.decodeToken(token)
      
      let result = `🧪 Username Test (Backend Response Structure):\n`
      result += `- Backend response: ${JSON.stringify(testData, null, 2)}\n`
      result += `- User object: ${JSON.stringify(testData.user, null, 2)}\n`
      result += `- Token data: ${JSON.stringify(tokenData, null, 2)}\n`
      result += `- Generated token: ${token}\n`
      result += `- Decoded token: ${JSON.stringify(decoded, null, 2)}\n`
      result += `- Username in decoded: "${decoded?.username}"\n`
      result += `- Username type: ${typeof decoded?.username}\n`
      result += `- Username === "quankun2303": ${decoded?.username === "quankun2303"}\n`
      result += `- All user fields: ${Object.keys(testData.user).join(', ')}\n`

      setTestResult(result)
    } catch (error) {
      setTestResult(`❌ Username test error:\n${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testRawApi = async () => {
    setIsLoading(true)
    setTestResult('')
    
    try {
      const response = await fetch('http://localhost:8080/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: testCredentials.identifier,
          password: testCredentials.password
        }),
      })
      
      const data = await response.json()
      
      // Sanitize data để không hiển thị thông tin nhạy cảm
      const sanitizedData = sanitizeForLogging(data)
      
      let result = `🔍 Raw API Response (Status: ${response.status}):\n`
      result += `Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}\n\n`
      result += `Body: ${JSON.stringify(sanitizedData, null, 2)}\n\n`
      
      // Phân tích cấu trúc response
      result += `📊 Response Analysis:\n`
      result += `- Has 'token' field: ${data.hasOwnProperty('token')}\n`
      result += `- Has 'accessToken' field: ${data.hasOwnProperty('accessToken')}\n`
      result += `- Has 'access_token' field: ${data.hasOwnProperty('access_token')}\n`
      result += `- Has 'data' field: ${data.hasOwnProperty('data')}\n`
      if (data.data) {
        result += `- data.token: ${data.data.hasOwnProperty('token')}\n`
        result += `- data.accessToken: ${data.data.hasOwnProperty('accessToken')}\n`
        result += `- data.access_token: ${data.data.hasOwnProperty('access_token')}\n`
      }
      result += `- All fields: ${Object.keys(data).join(', ')}\n`
      
      setTestResult(result)
    } catch (error) {
      setTestResult(`❌ Raw API Error:\n${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px', borderRadius: '8px' }}>
      <h3>API Debugger</h3>
      <p>Kiểm tra kết nối API với backend</p>
      
      <div style={{ marginBottom: '15px', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
        <h4>Test Credentials:</h4>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email/Username:</label>
          <input
            type="text"
            value={testCredentials.identifier}
            onChange={(e) => setTestCredentials(prev => ({ ...prev, identifier: e.target.value }))}
            style={{ width: '100%', padding: '5px', marginBottom: '10px' }}
            placeholder="test@example.com"
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
          <input
            type="password"
            value={testCredentials.password}
            onChange={(e) => setTestCredentials(prev => ({ ...prev, password: e.target.value }))}
            style={{ width: '100%', padding: '5px' }}
            placeholder="password123"
          />
        </div>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <button 
          onClick={testRawApi} 
          disabled={isLoading}
          style={{ marginRight: '10px', padding: '8px 16px' }}
        >
          Test Raw Login API
        </button>
        <button 
          onClick={testLogin} 
          disabled={isLoading}
          style={{ marginRight: '10px', padding: '8px 16px' }}
        >
          Test Login
        </button>
        <button 
          onClick={testRegister} 
          disabled={isLoading}
          style={{ marginRight: '10px', padding: '8px 16px' }}
        >
          Test Register
        </button>
        <button 
          onClick={testTokenValidation} 
          disabled={isLoading}
          style={{ marginRight: '10px', padding: '8px 16px' }}
        >
          Test Token
        </button>
        <button 
          onClick={testUsernameIssue} 
          disabled={isLoading}
          style={{ padding: '8px 16px' }}
        >
          Test Username
        </button>
      </div>
      
      {isLoading && <p>Đang test...</p>}
      
      {testResult && (
        <pre style={{ 
          background: '#f5f5f5', 
          padding: '10px', 
          borderRadius: '4px',
          whiteSpace: 'pre-wrap',
          fontSize: '12px'
        }}>
          {testResult}
        </pre>
      )}
    </div>
  )
}
