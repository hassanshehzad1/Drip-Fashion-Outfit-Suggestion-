/**
 * @fileoverview Admin dashboard layout with sidebar.
 */

import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { BarChart3, Users, Store, Package, ShoppingBag, Shield, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import useAuthStore from '../stores/authStore'
import toast from 'react-hot-toast'

const AdminLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuthStore()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const isActive = (path) => location.pathname === path

  const navItems = [
    { to: '/admin', icon: BarChart3, label: 'Analytics' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/partners', icon: Store, label: 'Partners' },
    { to: '/admin/outfits', icon: Package, label: 'Outfits' },
    { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  ]

  if (user?.role === 'superadmin') {
    navItems.push({ to: '/admin/admins', icon: Shield, label: 'Admins' })
  }

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-white dark:bg-dark-card border-r border-gray-200 dark:border-gray-800 fixed h-full">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="text-xl font-bold text-gradient">Drip</span>
          </Link>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
                ${isActive(item.to)
                  ? 'bg-brand/10 text-brand'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-surface'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center">
              <span className="text-brand font-bold">{user?.name?.[0]}</span>
            </div>
            <div>
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`
        lg:hidden fixed inset-y-0 left-0 w-64 z-50 bg-white dark:bg-dark-card shadow-xl
        transform transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="text-xl font-bold text-gradient">Drip</span>
          </Link>
          <button onClick={() => setIsSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="px-4 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setIsSidebarOpen(false)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
                ${isActive(item.to)
                  ? 'bg-brand/10 text-brand'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-surface'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
          <button onClick={() => setIsSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-semibold">Admin Dashboard</span>
          <div className="w-6" />
        </div>
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default AdminLayout
