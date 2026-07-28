/**
 * @fileoverview User registration page with multi-step form.
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { User, Mail, Lock, Phone, AlertCircle, Check, ChevronRight, ChevronLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { registerUser } from '../api/auth.api'
import useAuthStore from '../stores/authStore'
import { registerSchema } from '../utils/validators'
import { parseApiError } from '../utils/parseApiError'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

const Register = () => {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const { register, handleSubmit, watch, formState: { errors }, trigger } = useForm({
    resolver: zodResolver(registerSchema)
  })

  const password = watch('password', '')

  const getPasswordStrength = (pass) => {
    let score = 0
    if (pass.length >= 8) score++
    if (/[A-Z]/.test(pass)) score++
    if (/[a-z]/.test(pass)) score++
    if (/[0-9]/.test(pass)) score++
    if (/[@$!%*?&]/.test(pass)) score++
    return score
  }

  const strength = getPasswordStrength(password)
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']

  const onSubmit = async (data) => {
    if (step === 1) {
      const valid = await trigger(['name', 'email', 'password', 'confirmPassword'])
      if (valid) {
        setStep(2)
      }
      return
    }

    setLoading(true)
    setApiError('')
    setFieldErrors({})

    try {
      const body = {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone
      }
      const response = await registerUser(body)
      const { user, accessToken } = response.data.data
      setUser(user, accessToken)
      toast.success('Account created!')
      navigate('/style-quiz')
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {step === 1 ? 'Create Account' : 'Almost There'}
        </h1>
        <div className="flex items-center gap-1">
          <div className={`w-8 h-1 rounded-full ${step >= 1 ? 'bg-brand' : 'bg-gray-200'}`} />
          <div className={`w-8 h-1 rounded-full ${step >= 2 ? 'bg-brand' : 'bg-gray-200'}`} />
        </div>
      </div>

      {apiError && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400" role="alert">
          <AlertCircle size={16} />
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {step === 1 && (
          <>
            <Input
              label="Full Name"
              icon={User}
              placeholder="Your name"
              error={errors.name?.message || fieldErrors.name}
              {...register('name')}
            />

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
              placeholder="Create a strong password"
              error={errors.password?.message || fieldErrors.password}
              {...register('password')}
            />

            {password && (
              <div className="space-y-2">
                <div className="flex gap-1 h-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-full ${i < strength ? strengthColors[strength - 1] : 'bg-gray-200'}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500">Password strength: {strengthLabels[strength - 1] || 'Enter password'}</p>
              </div>
            )}

            <Input
              label="Confirm Password"
              type="password"
              icon={Lock}
              placeholder="Confirm your password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button type="submit" className="w-full">
              Continue <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-gray-600 dark:text-gray-400">One last step to personalize your experience</p>
            </div>

            <Input
              label="Phone (Optional)"
              icon={Phone}
              placeholder="+92 XXX XXXXXXX"
              error={errors.phone?.message || fieldErrors.phone}
              {...register('phone')}
            />

            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => setStep(1)} className="flex-1">
                <ChevronLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button type="submit" loading={loading} className="flex-1">
                Create Account
              </Button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-sm text-gray-500 hover:text-brand"
            >
              Skip for now
            </button>
          </>
        )}
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-brand hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
