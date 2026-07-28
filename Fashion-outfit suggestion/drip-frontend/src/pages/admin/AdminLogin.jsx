/**
 * @fileoverview Admin login page.
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Shield, Lock, Mail, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { useAdminStore } from '../../stores/adminStore'
import { parseApiError } from '../../utils/parseApiError'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Spinner from '../../components/ui/Spinner'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

const AdminLogin = () => {
  const navigate = useNavigate()
  const setAdmin = useAdminStore(state => state.setAdmin)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  })

  const loginMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/admin/login', data)
      return response.data.data
    },
    onSuccess: (data) => {
      setAdmin(data.admin, data.accessToken)
      toast.success('Welcome back, Admin!')
      navigate('/admin')
    },
    onError: (error) => {
      const { message } = parseApiError(error)
      toast.error(message)
    }
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark">
      <div className="w-full max-w-md mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Portal</h1>
          <p className="text-gray-500 mt-1">Sign in to manage the platform</p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-800">
          <form onSubmit={handleSubmit((data) => loginMutation.mutate(data))} className="space-y-4">
            <Input
              label="Email"
              type="email"
              icon={Mail}
              placeholder="admin@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            {loginMutation.isError && (
              <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-900/10 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                <span>{parseApiError(loginMutation.error).message}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
