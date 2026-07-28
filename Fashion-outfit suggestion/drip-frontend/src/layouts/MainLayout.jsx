/**
 * @fileoverview Main layout for user pages with navbar and bottom nav.
 */

import Navbar from '../components/layout/Navbar'
import BottomNav from '../components/layout/BottomNav'
import { Outlet } from 'react-router-dom'
import { useSocket } from '../hooks/useSocket'

const MainLayout = () => {
  useSocket()

  return (
    <div className="min-h-screen bg-white dark:bg-dark">
      <Navbar />
      <main className="pt-16 pb-16 md:pb-0">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}

export default MainLayout
