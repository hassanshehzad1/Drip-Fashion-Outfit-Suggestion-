/**
 * @fileoverview Main navigation bar with logo, search, notifications, and cart.
 */

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ShoppingBag, Bell, Menu, X, MessageCircle } from 'lucide-react'
import useAuthStore from '../../stores/authStore'
import useNotificationStore from '../../stores/notificationStore'
import useCartStore from '../../stores/cartStore'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'

const Navbar = () => {
  const navigate = useNavigate()
  const { isAuthenticated, isUser, user } = useAuthStore()
  const { unreadCount, chatUnreadCount } = useNotificationStore()
  const { itemCount } = useCartStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = isUser() ? [
    { to: '/feed', label: 'Feed' },
    { to: '/explore', label: 'Explore' },
    { to: '/orders', label: 'Orders' },
  ] : []

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 z-40 transition-all duration-300
        ${isScrolled ? 'bg-white/90 dark:bg-dark/90 backdrop-blur-lg shadow-sm' : 'bg-transparent'}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="text-xl font-bold text-gradient">Drip</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand dark:hover:text-brand transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {isUser() && (
              <>
                <button
                  onClick={() => navigate('/explore')}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>

                <Link
                  to="/notifications"
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors relative"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-brand text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/chat"
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors relative"
                  aria-label="Messages"
                >
                  <MessageCircle className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  {chatUnreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-pink-500 text-white text-xs rounded-full flex items-center justify-center">
                      {chatUnreadCount > 9 ? '9+' : chatUnreadCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/cart"
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors relative"
                  aria-label="Cart"
                >
                  <ShoppingBag className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  {itemCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-brand text-white text-xs rounded-full flex items-center justify-center">
                      {itemCount > 9 ? '9+' : itemCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/profile"
                  className="ml-2"
                  aria-label="Profile"
                >
                  <Avatar
                    src={user?.avatar}
                    name={user?.name}
                    size="sm"
                  />
                </Link>
              </>
            )}

            {!isAuthenticated() && (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  Log In
                </Button>
                <Button onClick={() => navigate('/register')}>
                  Get Started
                </Button>
              </div>
            )}

            <button
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-surface"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-dark-card border-t border-gray-100 dark:border-gray-800">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="block px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-surface rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {!isAuthenticated() && (
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
                <Button variant="outline" className="w-full" onClick={() => { navigate('/login'); setIsMenuOpen(false) }}>
                  Log In
                </Button>
                <Button className="w-full" onClick={() => { navigate('/register'); setIsMenuOpen(false) }}>
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
