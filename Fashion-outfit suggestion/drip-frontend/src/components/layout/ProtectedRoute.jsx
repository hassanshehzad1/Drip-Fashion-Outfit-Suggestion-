/**
 * @fileoverview Protected route component for role-based access control.
 * @param {Object} props
 * @param {string} [props.role] - Required role for access
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuthStore from '../../stores/authStore'
import Spinner from '../ui/Spinner'

const ProtectedRoute = ({ role }) => {
  const { role: userRole, isAuthenticated, _hasHydrated } = useAuthStore()
  const location = useLocation()

  // Wait for Zustand persist to hydrate from localStorage before checking auth
  if (!_hasHydrated) {
    return <div className="h-screen flex items-center justify-center"><Spinner /></div>
  }

  if (!isAuthenticated()) {
    const loginPath = role === 'partner' ? '/partner/login'
                    : role === 'admin' ? '/admin/login' : '/login'
    return <Navigate to={loginPath} state={{ from: location }} replace />
  }
  if (role && userRole !== role) return <Navigate to="/" replace />
  return <Outlet />
}

export default ProtectedRoute
