/**
 * @fileoverview Partner Public Profile Page - Displays partner details and their outfits
 */

import { useParams, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { 
  ShoppingBag, 
  Users, 
  Calendar,
  CheckCircle,
  ArrowLeft,
  Heart,
  MessageCircle
} from 'lucide-react'
import { getPartnerPublicProfile } from '../api/partner.api'
import { getPartnerOutfits } from '../api/outfit.api'
import { checkFollowStatus, toggleFollow } from '../api/social.api'
import useAuthStore from '../stores/authStore'
import Avatar from '../components/ui/Avatar'
import { formatPrice, formatDate } from '../utils/formatters'
import toast from 'react-hot-toast'
import Spinner from '../components/ui/Spinner'
import Button from '../components/ui/Button'

const PartnerPublic = () => {
  const { partnerId } = useParams()
  const { user, isAuthenticated } = useAuthStore()
  const queryClient = useQueryClient()
  const [imageErrors, setImageErrors] = useState(new Set())

  // Fetch partner profile
  const { data: partnerData, isLoading: partnerLoading, error } = useQuery({
    queryKey: ['partner-public', partnerId],
    queryFn: () => getPartnerPublicProfile(partnerId),
    enabled: !!partnerId
  })

  // Fetch partner outfits separately
  const { data: outfitsData, isLoading: outfitsLoading } = useQuery({
    queryKey: ['partner-outfits', partnerId],
    queryFn: () => getPartnerOutfits(partnerId),
    enabled: !!partnerId
  })

  // Extract data from API response
  const partner = partnerData?.data?.data?.partner || partnerData?.data?.data
  const outfits = outfitsData?.data?.data?.outfits || outfitsData?.data?.outfits || []
  const stats = {
    totalFollowers: partner?.followersCount || 0,
    totalOutfits: outfits?.length || 0,
    totalSales: partner?.totalSales || 0,
    averageRating: partner?.averageRating || 0
  }

  // Check follow status (only for logged in users)
  const { data: followStatusData, refetch: refetchFollowStatus } = useQuery({
    queryKey: ['follow-status', partnerId],
    queryFn: () => checkFollowStatus(partnerId),
    enabled: !!partnerId && isAuthenticated()
  })

  const isLoading = partnerLoading || outfitsLoading
  const isFollowing = followStatusData?.data?.isFollowing || false

  const handleFollow = async () => {
    if (!isAuthenticated()) {
      toast.error('Please login to follow')
      return
    }
    try {
      const result = await toggleFollow(partnerId)
      await refetchFollowStatus()
      
      // The API returns { success: true, data: { following: boolean, followersCount: number } }
      const isNowFollowing = result?.data?.data?.following ?? result?.data?.following
      toast.success(isNowFollowing ? 'Following partner' : 'Unfollowed partner')
    } catch (err) {
      toast.error('Failed to update follow status')
    }
  }

  const handleImageError = (outfitId) => {
    setImageErrors(prev => new Set([...prev, outfitId]))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !partner) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Partner not found</p>
          <Link to="/explore">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Explore
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Cover Image Header */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-purple-600 to-pink-600">
        {partner.coverImage && (
          <img
            src={partner.coverImage}
            alt={partner.brandName}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute top-4 left-4 right-4">
          <Link to="/explore" className="inline-flex items-center text-white hover:text-gray-200 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Explore
          </Link>
        </div>
      </div>

      {/* Partner Info Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="flex flex-col md:flex-row gap-8 -mt-16 relative z-10">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <Avatar
                src={partner.logo}
                name={partner.brandName}
                size="2xl"
                className="border-4 border-white dark:border-gray-800"
              />
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {partner.brandName}
                </h1>
                {partner.isVerified && (
                  <CheckCircle className="w-6 h-6 text-blue-500" />
                )}
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-2xl">
                {partner.description || 'No description available'}
              </p>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
                {partner.category && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                    {partner.category}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {stats.totalFollowers.toLocaleString()} followers
                </span>
                <span className="flex items-center gap-1">
                  <ShoppingBag className="w-4 h-4" />
                  {stats.totalSales.toLocaleString()} sales
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {formatDate(partner.createdAt)}
                </span>
              </div>

              <div className="flex gap-3">
                {isAuthenticated() && user?.role === 'user' && (
                  <>
                    <Button
                      onClick={handleFollow}
                      variant={isFollowing ? 'outline' : 'primary'}
                      className={isFollowing ? '' : 'bg-gradient-to-r from-purple-600 to-pink-600'}
                    >
                      <Heart className={`w-4 h-4 mr-2 ${isFollowing ? '' : 'fill-current'}`} />
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                    <Link to={`/chat?partner=${partnerId}`}>
                      <Button variant="outline">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Chat
                      </Button>
                    </Link>
                  </>
                )}
                {partner.socialLinks?.website && (
                  <a
                    href={partner.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline">
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Website
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Outfits Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Outfits by {partner.brandName}
        </h2>

        {outfits.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No outfits yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {outfits.map((outfit) => (
              <Link
                key={outfit._id}
                to={`/outfit/${outfit._id}`}
                className="group bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-700">
                  {imageErrors.has(outfit._id) ? (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ShoppingBag className="w-12 h-12" />
                    </div>
                  ) : (
                    <img
                      src={outfit.video?.thumbnailUrl || outfit.images?.[0]?.url}
                      alt={outfit.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={() => handleImageError(outfit._id)}
                    />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {outfit.title}
                  </h3>
                  <p className="text-purple-600 dark:text-purple-400 font-medium mt-1">
                    {formatPrice(outfit.price)}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <Heart className="w-4 h-4" />
                    <span>{outfit.likesCount || 0} likes</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default PartnerPublic

