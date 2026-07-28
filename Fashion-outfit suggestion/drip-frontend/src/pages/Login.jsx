/**
 * @fileoverview User login page.
 */

import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Lock, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { loginUser } from '../api/auth.api'
import useAuthStore from '../stores/authStore'
import { loginSchema } from '../utils/validators'
import { parseApiError } from '../utils/parseApiError'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { setUser } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data) => {
    setLoading(true)
    setApiError('')
    setFieldErrors({})

    try {
      const response = await loginUser(data)
      const { user, accessToken } = response.data.data
      setUser(user, accessToken)
      toast.success('Welcome back!')
      const from = location.state?.from?.pathname || '/feed'
      navigate(from, { replace: true })
    } catch (error) {
      const { message, fieldErrors } = parseApiError(error)
      setApiError(message)
      setFieldErrors(fieldErrors)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Sign in to continue shopping</p>

      {apiError && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400" role="alert">
          <AlertCircle size={16} />
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          icon={Mail}
          placeholder="your@email.com"
          error={errors.email?.message || fieldErrors.email}
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          icon={Lock}
          placeholder="Enter your password"
          error={errors.password?.message || fieldErrors.password}
          {...register('password')}
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <input type="checkbox" className="rounded border-gray-300" />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-brand hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" loading={loading} className="w-full">
          Sign In
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
          Are you a brand?
        </p>
        <Link to="/partner/login">
          <Button variant="outline" className="w-full">
            Partner Login
          </Button>
        </Link>
      </div>

      <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
        10,000+ fashionistas trust Drip
      </p>
    </div>
  )
}

export default Login
