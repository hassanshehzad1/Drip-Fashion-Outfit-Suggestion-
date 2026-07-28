/**
 * @fileoverview Clean layout for authentication pages.
 */

import { Outlet, Link } from 'react-router-dom'

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark dark:to-dark-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center shadow-lg shadow-brand/30">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <span className="text-2xl font-bold text-gradient">Drip</span>
          </Link>
        </div>
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl p-6 sm:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
