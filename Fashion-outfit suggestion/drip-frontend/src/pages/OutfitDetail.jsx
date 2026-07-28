/**
 * @fileoverview Outfit detail page with video, info, and purchase options.
 */

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Heart, Bookmark, Share2, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { getOutfit } from '../api/outfit.api'
import { toggleLike, toggleBookmark, checkFollowStatus, toggleFollow } from '../api/social.api'
import { addToCart } from '../api/cart.api'
import { formatPrice } from '../utils/formatPrice'
import Spinner from '../components/ui/Spinner'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import useAuthStore from '../stores/authStore'

const OutfitDetail = () => {
  const { outfitId } = useParams()
  const { isAuthenticated, isUser, isPartner, partner } = useAuthStore()
  const [selectedSize, setSelectedSize] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [isFollowing, setIsFollowing] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['outfit', outfitId],
    queryFn: async () => {
      const response = await getOutfit(outfitId)
      return response.data.data.outfit
    }
  })

  const likeMutation = useMutation({
    mutationFn: () => toggleLike(outfitId),
    onSuccess: () => toast.success('Liked!')
  })

  const bookmarkMutation = useMutation({
    mutationFn: () => toggleBookmark(outfitId),
    onSuccess: () => toast.success('Saved!')
  })

  const cartMutation = useMutation({
    mutationFn: () => addToCart({ outfitId, size: selectedSize, quantity }),
    onSuccess: () => toast.success('Added to cart!'),
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add to cart')
    }
  })

  const followMutation = useMutation({
    mutationFn: () => toggleFollow(data?.partner?._id),
    onSuccess: () => {
      setIsFollowing(!isFollowing)
      toast.success(isFollowing ? 'Unfollowed' : 'Following!')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update follow status')
    }
  })

  // Fetch initial follow status
  useEffect(() => {
    if (isAuthenticated() && isUser() && data?.partner?._id) {
      checkFollowStatus(data.partner._id)
        .then(res => setIsFollowing(res.data.data.isFollowing))
        .catch(() => {})
    }
  }, [isAuthenticated, isUser, data?.partner?._id])

  const handleFollow = () => {
    if (!isAuthenticated()) {
      toast.error('Please log in to follow')
      return
    }
    if (!isUser()) {
      toast.error('Only users can follow partners')
      return
    }
    followMutation.mutate()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  const outfit = data

  // Check if current viewer is the partner who owns this outfit
  const isOwnOutfit = isPartner() && partner?._id === outfit?.partner?._id

  return (
    <div className="min-h-screen bg-white dark:bg-dark">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-dark/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center gap-4">
          <Link to={isPartner() ? "/partner/my-outfits" : "/feed"} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-surface rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-semibold truncate">{outfit?.title}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Video */}
        <div className="aspect-[9/16] md:aspect-video bg-black">
          <video
            src={outfit?.video?.url}
            poster={outfit?.video?.thumbnailUrl}
            controls
            autoPlay
            muted
            loop
            className="w-full h-full object-contain"
          />
        </div>

        {/* Product Image Thumbnails */}
        {outfit?.images && outfit.images.length > 0 && (
          <div className="p-6 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
            <h3 className="font-semibold mb-4 text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">Product Gallery</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {outfit.images.map((image, index) => (
                <div
                  key={index}
                  className="relative group flex-shrink-0"
                >
                  <img
                    src={image.url}
                    alt={`${outfit?.title} ${index + 1}`}
                    className="w-24 h-24 rounded-xl object-cover border-2 border-transparent group-hover:border-brand/50 transition-all duration-200 shadow-sm"
                  />
                  {index === 0 && (
                    <div className="absolute top-1 right-1 w-3 h-3 bg-brand rounded-full ring-2 ring-white dark:ring-dark-card" />
                  )}
                </div>
              ))}
            </div>
            
            {/* Product Info Section */}
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
              <div>
                <h4 className="font-bold text-lg text-gray-900 dark:text-white leading-tight mb-2">{outfit?.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">{outfit?.description}</p>
              </div>
              
              {/* Colors */}
              {outfit?.colors && outfit.colors.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">Available Colors</p>
                  <div className="flex gap-3 flex-wrap">
                    {outfit.colors.map((color, index) => (
                      <div
                        key={index}
                        className="relative group"
                      >
                        <div
                          className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-200 group-hover:scale-110 group-hover:border-brand/50 cursor-pointer"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                        {index === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full shadow-sm" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Sizes */}
              {outfit?.sizes && outfit.sizes.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">Available Sizes</p>
                  <div className="flex flex-wrap gap-2">
                    {outfit.sizes.map((size, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200 cursor-pointer ${
                          index === 0
                            ? 'bg-brand text-white border-brand shadow-md shadow-brand/20'
                            : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-brand/50 hover:text-brand'
                        }`}
                      >
                        {size}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Price */}
              <div className="flex items-baseline gap-3 pt-2">
                <span className="text-2xl font-bold text-brand">{formatPrice(outfit?.price)}</span>
                {outfit?.originalPrice > outfit?.price && (
                  <div className="flex items-center gap-2">
                    <span className="text-base text-gray-400 line-through">{formatPrice(outfit?.originalPrice)}</span>
                    <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold rounded-full">
                      {Math.round((1 - outfit?.price/outfit?.originalPrice) * 100)}% OFF
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="p-4 space-y-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Avatar
              src={outfit?.partner?.logo}
              name={outfit?.partner?.brandName}
              size="md"
            />
            <div className="flex-1">
              <Link to={`/partner/${outfit?.partner?._id}`} className="font-semibold hover:text-brand">
                {outfit?.partner?.brandName}
              </Link>
              <p className="text-sm text-gray-500">@{outfit?.partner?.brandName?.toLowerCase().replace(/\s+/g, '')}</p>
            </div>
            {!isOwnOutfit && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleFollow}
                disabled={followMutation.isPending}
              >
                {followMutation.isPending ? '...' : isFollowing ? 'Following' : 'Follow'}
              </Button>
            )}
          </div>

          {/* Title & Price */}
          <div>
            <h1 className="text-2xl font-bold mb-2">{outfit?.title}</h1>
            <p className="text-gray-600 dark:text-gray-400">{outfit?.description}</p>
            
            {/* Likes and Views */}
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
              <span>❤️ {outfit?.likesCount || 0} likes</span>
              <span>👁️ {outfit?.viewsCount || 0} views</span>
            </div>
            
            <div className="flex items-center gap-3 mt-4">
              <span className="text-3xl font-bold text-brand">{formatPrice(outfit?.price)}</span>
              {outfit?.originalPrice > outfit?.price && (
                <>
                  <span className="text-xl text-gray-400 line-through">{formatPrice(outfit?.originalPrice)}</span>
                  <Badge variant="danger">{Math.round((1 - outfit?.price/outfit?.originalPrice) * 100)}% OFF</Badge>
                </>
              )}
            </div>
          </div>

          {/* Size Selector */}
          {!isOwnOutfit && (
            <div>
              <h3 className="font-medium mb-3">Select Size</h3>
              <div className="flex flex-wrap gap-2">
                {outfit?.sizes?.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                      selectedSize === size
                        ? 'border-brand bg-brand/10 text-brand'
                        : 'border-gray-200 dark:border-gray-700 hover:border-brand'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {!selectedSize && <p className="text-red-500 text-sm mt-2">Please select a size</p>}
            </div>
          )}

          {/* Quantity */}
          {!isOwnOutfit && (
            <div>
              <h3 className="font-medium mb-3">Quantity</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-dark-surface flex items-center justify-center"
                >
                  -
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-dark-surface flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          {!isOwnOutfit ? (
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => cartMutation.mutate()}
                disabled={!selectedSize || cartMutation.isPending}
              >
                Add to Cart
              </Button>
              <Button variant="secondary" onClick={() => likeMutation.mutate()}>
                <Heart className={`w-5 h-5 ${likeMutation.isSuccess ? 'fill-brand text-brand' : ''}`} />
              </Button>
              <Button variant="secondary" onClick={() => bookmarkMutation.mutate()}>
                <Bookmark className={`w-5 h-5 ${bookmarkMutation.isSuccess ? 'fill-brand text-brand' : ''}`} />
              </Button>
              <Button variant="secondary">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                Edit Outfit
              </Button>
              <Button variant="danger" className="flex-1">
                Delete Outfit
              </Button>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {outfit?.tags?.map(tag => (
              <Link
                key={tag}
                to={`/explore?q=${tag}`}
                className="px-3 py-1 bg-gray-100 dark:bg-dark-surface rounded-full text-sm hover:bg-brand/10 hover:text-brand transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OutfitDetail
