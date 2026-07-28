/**
 * @fileoverview Protected route component for admin access control.
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAdminStore } from '../../stores/adminStore'
import Spinner from '../ui/Spinner'

const AdminProtectedRoute = () => {
  const { isAuthenticated, _hasHydrated } = useAdminStore()
  const location = useLocation()

  // Wait for Zustand persist to hydrate from localStorage before checking auth
  if (!_hasHydrated) {
    return <div className="h-screen flex items-center justify-center"><Spinner /></div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return <Outlet />
}

export default AdminProtectedRoute
