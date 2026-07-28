/**
 * @fileoverview Main App component with routing and providers.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Suspense, lazy } from 'react'
import { Toaster } from 'react-hot-toast'
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'
import PartnerLayout from './layouts/PartnerLayout'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AdminProtectedRoute from './components/layout/AdminProtectedRoute'
import Spinner from './components/ui/Spinner'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 60000, refetchOnWindowFocus: false } }
})

const Landing = lazy(() => import('./pages/Landing'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const StyleQuiz = lazy(() => import('./pages/StyleQuiz'))
const Feed = lazy(() => import('./pages/Feed'))
const Explore = lazy(() => import('./pages/Explore'))
const OutfitDetail = lazy(() => import('./pages/OutfitDetail'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const OrderConfirm = lazy(() => import('./pages/OrderConfirm'))
const Orders = lazy(() => import('./pages/Orders'))
const OrderDetail = lazy(() => import('./pages/OrderDetail'))
const Profile = lazy(() => import('./pages/Profile'))
const Notifications = lazy(() => import('./pages/Notifications'))
const Chat = lazy(() => import('./pages/Chat'))
const PartnerPublic = lazy(() => import('./pages/PartnerPublic'))
const PartnerLogin = lazy(() => import('./pages/partner/PartnerLogin'))
const PartnerRegister = lazy(() => import('./pages/partner/PartnerRegister'))
const Dashboard = lazy(() => import('./pages/partner/Dashboard'))
const UploadOutfit = lazy(() => import('./pages/partner/UploadOutfit'))
const ManageOutfits = lazy(() => import('./pages/partner/ManageOutfits'))
const PartnerOrders = lazy(() => import('./pages/partner/PartnerOrders'))
const PartnerProfile = lazy(() => import('./pages/partner/PartnerProfile'))
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
      <Suspense fallback={<div className="h-screen flex items-center justify-center"><Spinner /></div>}>
        <Routes>
          {/* PUBLIC */}
          <Route path="/" element={<Landing />} />
          <Route path="/partner/:partnerId" element={<PartnerPublic />} />
          <Route path="/outfit/:outfitId" element={<OutfitDetail />} />

          {/* AUTH PAGES */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/partner/login" element={<PartnerLogin />} />
            <Route path="/partner/register" element={<PartnerRegister />} />
            <Route path="/admin/login" element={<AdminLogin />} />
          </Route>

          {/* USER PROTECTED */}
          <Route element={<ProtectedRoute role="user" />}>
            <Route element={<MainLayout />}>
              <Route path="/feed" element={<Feed />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-confirm" element={<OrderConfirm />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:orderId" element={<OrderDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/style-quiz" element={<StyleQuiz />} />
            </Route>
          </Route>

          {/* PARTNER PROTECTED */}
          <Route element={<ProtectedRoute role="partner" />}>
            <Route element={<PartnerLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/upload" element={<UploadOutfit />} />
              <Route path="/dashboard/outfits" element={<ManageOutfits />} />
              <Route path="/dashboard/orders" element={<PartnerOrders />} />
              <Route path="/dashboard/profile" element={<PartnerProfile />} />
              <Route path="/dashboard/chat" element={<Chat />} />
            </Route>
          </Route>

          {/* ADMIN PROTECTED */}
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </QueryClientProvider>
)

export default App
