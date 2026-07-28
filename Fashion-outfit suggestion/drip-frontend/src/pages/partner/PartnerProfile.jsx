/**
 * @fileoverview Partner profile page to view and edit brand profile.
 */

import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Store, Mail, Phone, MapPin, Camera, Lock, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { getPartnerMe, updatePartnerProfile, changePartnerPassword } from '../../api/partner.api'
import { uploadLogo } from '../../api/upload.api'
import { parseApiError } from '../../utils/parseApiError'
import useAuthStore from '../../stores/authStore'
import Spinner from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'

const PartnerProfile = () => {
  const queryClient = useQueryClient()
  const { partner, updatePartner } = useAuthStore()
  const fileInputRef = useRef(null)

  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    brandName: '',
    description: '',
    phone: '',
    address: ''
  })

  const [passwordMode, setPasswordMode] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordError, setPasswordError] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['partner-profile'],
    queryFn: async () => {
      const response = await getPartnerMe()
      return response.data.data.partner
    }
  })

  const updateMutation = useMutation({
    mutationFn: updatePartnerProfile,
    onSuccess: (response) => {
      updatePartner(response.data.data.partner)
      queryClient.invalidateQueries(['partner-profile'])
      toast.success('Profile updated')
      setEditMode(false)
    },
    onError: (error) => {
      toast.error(parseApiError(error).message)
    }
  })

  const avatarMutation = useMutation({
    mutationFn: uploadLogo,
    onSuccess: (response) => {
      // Use the returned partner object if available, otherwise fall back to URL
      if (response.data.data.partner) {
        updatePartner(response.data.data.partner)
      } else {
        updatePartner({ ...partner, logo: response.data.data.url })
      }
      queryClient.invalidateQueries(['partner-profile'])
      toast.success('Logo updated')
    },
    onError: (error) => {
      toast.error(parseApiError(error).message || 'Failed to upload logo')
    }
  })

  const passwordMutation = useMutation({
    mutationFn: changePartnerPassword,
    onSuccess: () => {
      toast.success('Password changed')
      setPasswordMode(false)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setPasswordError('')
    },
    onError: (error) => {
      toast.error(parseApiError(error).message)
    }
  })

  const currentPartner = data || partner

  const handleEdit = () => {
    setFormData({
      brandName: currentPartner?.brandName || '',
      description: currentPartner?.description || '',
      phone: currentPartner?.phone || '',
      address: currentPartner?.address || ''
    })
    setEditMode(true)
  }

  const handleSave = () => {
    updateMutation.mutate(formData)
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      avatarMutation.mutate(file)
    }
  }

  const handlePasswordSubmit = () => {
    setPasswordError('')
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Passwords don't match")
      return
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return
    }
    passwordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Brand Profile</h1>

      {/* Header Card */}
      <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-gray-800 mb-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Logo */}
          <div className="relative">
            <Avatar
              src={currentPartner?.logo}
              name={currentPartner?.brandName}
              size="xl"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarMutation.isPending}
              className="absolute bottom-0 right-0 w-8 h-8 bg-brand text-white rounded-full flex items-center justify-center shadow-lg disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            {editMode ? (
              <div className="space-y-3">
                <Input
                  placeholder="Brand Name"
                  value={formData.brandName}
                  onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                />
                <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2 bg-white dark:bg-dark-surface"
                />
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold">{currentPartner?.brandName}</h2>
                <Badge variant="primary" className="mt-2">{currentPartner?.category}</Badge>
                <p className="text-gray-600 dark:text-gray-400 mt-2">{currentPartner?.description}</p>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            {editMode ? (
              <>
                <Button onClick={handleSave} loading={updateMutation.isPending}>
                  Save
                </Button>
                <Button variant="outline" onClick={() => setEditMode(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleEdit}>
                  Edit Profile
                </Button>
                <Button variant="ghost" onClick={() => setPasswordMode(true)}>
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-dark-card rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Mail className="w-5 h-5 text-brand" />
            Email
          </h3>
          <p className="text-gray-600 dark:text-gray-400">{currentPartner?.email}</p>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Phone className="w-5 h-5 text-brand" />
            Phone
          </h3>
          {editMode ? (
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Contact phone"
            />
          ) : (
            <p className="text-gray-600 dark:text-gray-400">{currentPartner?.phone || 'Not set'}</p>
          )}
        </div>

        <div className="bg-white dark:bg-dark-card rounded-xl p-4 border border-gray-200 dark:border-gray-800 md:col-span-2">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-brand" />
            Address
          </h3>
          {editMode ? (
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Business address"
              rows={2}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2 bg-white dark:bg-dark-surface"
            />
          ) : (
            <p className="text-gray-600 dark:text-gray-400">{currentPartner?.address || 'Not set'}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <h3 className="font-semibold mb-4">Account Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-dark-surface rounded-lg">
            <p className="text-2xl font-bold">{currentPartner?.followersCount || 0}</p>
            <p className="text-sm text-gray-500">Followers</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-dark-surface rounded-lg">
            <p className="text-2xl font-bold">{currentPartner?.outfitsCount || 0}</p>
            <p className="text-sm text-gray-500">Outfits</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-dark-surface rounded-lg">
            <p className="text-2xl font-bold">{currentPartner?.totalSales || 0}</p>
            <p className="text-sm text-gray-500">Sales</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-dark-surface rounded-lg">
            <Badge variant={currentPartner?.status === 'approved' ? 'success' : 'warning'}>
              {currentPartner?.status}
            </Badge>
            <p className="text-sm text-gray-500 mt-1">Status</p>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {passwordMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-card rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Change Password</h3>

            {passwordError && (
              <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4" />
                {passwordError}
              </div>
            )}

            <div className="space-y-3">
              <Input
                type="password"
                placeholder="Current Password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              />
              <Input
                type="password"
                placeholder="New Password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
              <Input
                type="password"
                placeholder="Confirm New Password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setPasswordMode(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handlePasswordSubmit}
                loading={passwordMutation.isPending}
              >
                Change Password
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PartnerProfile
