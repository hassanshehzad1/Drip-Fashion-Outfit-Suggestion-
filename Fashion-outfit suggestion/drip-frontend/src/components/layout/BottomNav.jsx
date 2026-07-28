/**
 * @fileoverview Mobile bottom navigation bar.
 */

import { Link, useLocation } from 'react-router-dom'
import { Home, Compass, ShoppingBag, User, MessageCircle } from 'lucide-react'
import useNotificationStore from '../../stores/notificationStore'
import useCartStore from '../../stores/cartStore'

const BottomNav = () => {
  const location = useLocation()
  const { itemCount } = useCartStore()
  const { chatUnreadCount } = useNotificationStore()

  const isActive = (path) => location.pathname === path

  const navItems = [
    { to: '/feed', icon: Home, label: 'Feed' },
    { to: '/explore', icon: Compass, label: 'Explore' },
    { to: '/chat', icon: MessageCircle, label: 'Messages', badge: chatUnreadCount },
    { to: '/cart', icon: ShoppingBag, label: 'Cart', badge: itemCount },
    { to: '/profile', icon: User, label: 'Profile' },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-card border-t border-gray-100 dark:border-gray-800 z-40 safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {navItems.map(item => (
          <Link
            key={item.to}
            to={item.to}
            className={`
              flex flex-col items-center justify-center flex-1 h-full
              ${isActive(item.to) ? 'text-brand' : 'text-gray-500 dark:text-gray-400'}
            `}
          >
            <div className="relative">
              <item.icon className="w-6 h-6" />
              {item.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand text-white text-[10px] rounded-full flex items-center justify-center">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}

export default BottomNav
