/**
 * @fileoverview Partner (brand) login page.
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Lock, AlertCircle, Store } from 'lucide-react'
import toast from 'react-hot-toast'
import { loginPartner } from '../../api/partner.api'
import useAuthStore from '../../stores/authStore'
import { loginSchema } from '../../utils/validators'
import { parseApiError } from '../../utils/parseApiError'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

const PartnerLogin = () => {
  const navigate = useNavigate()
  const { setPartner } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [showPendingMessage, setShowPendingMessage] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data) => {
    setLoading(true)
    setApiError('')
    setFieldErrors({})
    setShowPendingMessage(false)

    try {
      const response = await loginPartner(data)
      const { partner, accessToken } = response.data.data
      setPartner(partner, accessToken)
      toast.success(`Welcome back, ${partner.brandName}!`)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      const { message, fieldErrors } = parseApiError(error)

      if (error.response?.status === 403) {
        setShowPendingMessage(true)
        setApiError('Your account is pending admin approval. We\'ll notify you once approved.')
      } else {
        setApiError(message)
        setFieldErrors(fieldErrors)
      }

      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center">
          <Store className="w-8 h-8 text-brand" />
        </div>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">Partner Login</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">Access your brand dashboard</p>

      {showPendingMessage && (
        <div className="p-4 mb-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            ⏳ Your account is pending approval from our admin team. You'll receive an email once approved.
          </p>
        </div>
      )}

      {apiError && !showPendingMessage && (
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
          placeholder="brand@company.com"
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

        <Button type="submit" loading={loading} className="w-full">
          Sign In to Dashboard
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Don't have a partner account?{' '}
          <Link to="/partner/register" className="text-brand hover:underline font-medium">
            Apply now
          </Link>
        </p>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
        <Link to="/login" className="text-sm text-gray-500 hover:text-brand">
          User Login
        </Link>
      </div>
    </div>
  )
}

export default PartnerLogin
