import { Navigate, useLocation } from 'react-router-dom'
import { ApiService } from '../services/api'
import AccessDeniedPage from '../pages/AccessDenied'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'Admin' | 'Staff' | 'User' | 'Customer'
  fallbackPath?: string
}

function ProtectedRoute({ children, requiredRole, fallbackPath = '/login' }: ProtectedRouteProps) {
  const location = useLocation()
  const currentUser = ApiService.getCurrentUser()

  // Kiểm tra đăng nhập
  if (!currentUser) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />
  }

  // Kiểm tra role nếu có yêu cầu
  if (requiredRole && !ApiService.hasRole(requiredRole)) {
    return <AccessDeniedPage />
  }

  return <>{children}</>
}

export default ProtectedRoute
