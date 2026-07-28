/**
 * @fileoverview Partner (brand) registration page.
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Store, Mail, Lock, Tag, AlertCircle, Check, Upload, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { registerPartner } from '../../api/partner.api'
import { uploadAvatar } from '../../api/upload.api'
import { partnerRegisterSchema } from '../../utils/validators'
import { parseApiError } from '../../utils/parseApiError'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

const categories = [
  { value: 'casual', label: 'Casual Wear' },
  { value: 'formal', label: 'Formal Wear' },
  { value: 'streetwear', label: 'Streetwear' },
  { value: 'sportswear', label: 'Sportswear' },
  { value: 'ethnic', label: 'Ethnic Wear' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'footwear', label: 'Footwear' },
  { value: 'kids', label: 'Kids Fashion' },
  { value: 'other', label: 'Other' },
]

const PartnerRegister = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(partnerRegisterSchema)
  })

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const removeLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
  }

  const onSubmit = async (data) => {
    setLoading(true)
    setApiError('')
    setFieldErrors({})

    try {
      // Upload logo if provided
      let logoData = null
      if (logoFile) {
        setUploadingLogo(true)
        try {
          const logoRes = await uploadAvatar(logoFile)
          logoData = {
            url: logoRes.data?.data?.url,
            fileId: logoRes.data?.data?.fileId
          }
        } catch (error) {
          toast.error('Failed to upload logo')
          setLoading(false)
          setUploadingLogo(false)
          return
        }
        setUploadingLogo(false)
      }

      await registerPartner({ ...data, logo: logoData })
      setSubmitted(true)
      toast.success('Application submitted!')
    } catch (error) {
      const { message, fieldErrors } = parseApiError(error)
      setApiError(message)
      setFieldErrors(fieldErrors)
      toast.error(message)
    } finally {
      setLoading(false)
      setUploadingLogo(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Application Submitted!</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Thank you for applying to become a Drip partner. Our team will review your application and you'll receive an email once approved.
        </p>
        <Link to="/partner/login">
          <Button variant="outline" className="w-full">
            Go to Login
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center">
          <Store className="w-8 h-8 text-brand" />
        </div>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">Become a Partner</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">Join Pakistan's top fashion brands</p>

      {apiError && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400" role="alert">
          <AlertCircle size={16} />
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Brand Logo (Optional)
          </label>
          <div className="mt-1">
            {logoPreview ? (
              <div className="relative inline-block">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                />
                <button
                  type="button"
                  onClick={removeLogo}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="file"
                  id="logo-upload"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <label
                  htmlFor="logo-upload"
                  className="flex items-center justify-center w-24 h-24 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:border-brand hover:bg-brand/5 transition-all"
                >
                  <div className="text-center">
                    <Upload className="w-6 h-6 mx-auto text-gray-400" />
                    <p className="text-xs text-gray-500 mt-1">Upload</p>
                  </div>
                </label>
              </div>
            )}
            {uploadingLogo && (
              <p className="text-xs text-gray-500 mt-1">Uploading logo...</p>
            )}
          </div>
        </div>

        <Input
          label="Brand Name"
          icon={Store}
          placeholder="Your brand name"
          error={errors.brandName?.message || fieldErrors.brandName}
          {...register('brandName')}
        />

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
          placeholder="Create a strong password"
          error={errors.password?.message || fieldErrors.password}
          {...register('password')}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              {...register('category')}
              className={`
                block w-full rounded-xl border pl-10 pr-4 py-2.5
                ${errors.category?.message || fieldErrors.category
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-200 dark:border-gray-700 focus:border-brand focus:ring-brand'
                }
                bg-white dark:bg-dark-surface
                text-gray-900 dark:text-white
                focus:outline-none focus:ring-1
              `}
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          {(errors.category?.message || fieldErrors.category) && (
            <p className="mt-1 text-xs text-red-500">{errors.category?.message || fieldErrors.category}</p>
          )}
        </div>

        <Button type="submit" loading={loading} className="w-full">
          Submit Application
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Already a partner?{' '}
          <Link to="/partner/login" className="text-brand hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default PartnerRegister
