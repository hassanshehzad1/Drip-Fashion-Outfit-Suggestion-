/**
 * @fileoverview Main feed page with AI-personalized reels and interactions.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import { useNavigate, Link } from 'react-router-dom'
import { Sparkles, Heart, Bookmark, MessageCircle, Share2, ShoppingBag, X, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { getAIFeed, trackInteraction } from '../api/ai.api'
import { getPersonalizedSearch } from '../api/search.api'
import { toggleLike, toggleBookmark, addComment, addReply, getComments, getReplies, toggleFollow, checkFollowStatus, getSocialStatus } from '../api/social.api'
import { addToCart } from '../api/cart.api'
import { parseApiError } from '../utils/parseApiError'
import useAuthStore from '../stores/authStore'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Avatar from '../components/ui/Avatar'
import Input from '../components/ui/Input'

const ReelCard = ({ outfit, isActive }) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { isAuthenticated, isUser, isPartner, partner } = useAuthStore()
  const videoRef = useRef(null)
  const [isMuted, setIsMuted] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)

  // Local state for optimistic UI updates
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [likesCount, setLikesCount] = useState(outfit.likesCount || 0)
  const [bookmarksCount, setBookmarksCount] = useState(outfit.bookmarksCount || 0)
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [selectedSize, setSelectedSize] = useState(outfit.sizes?.[0] || '')

  // Check if partner is viewing their own outfit
  const isOwnOutfit = isPartner() && outfit.partner?._id === partner?._id

  // Fetch social status on mount
  useEffect(() => {
    if (isAuthenticated() && isUser() && outfit._id && !isOwnOutfit) {
      getSocialStatus(outfit._id).then(res => {
        const status = res.data.data
        setIsLiked(status.isLiked)
        setIsBookmarked(status.isBookmarked)
      }).catch(() => {})

      if (outfit.partner?._id) {
        checkFollowStatus(outfit.partner._id).then(res => {
          setIsFollowing(res.data.data.isFollowing)
        }).catch(() => {})
      }
    }
  }, [outfit._id, outfit.partner?._id])

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play().catch(() => {})
      } else {
        videoRef.current.pause()
      }
    }
  }, [isActive])

  useEffect(() => {
    if (isActive && outfit?._id) {
      trackInteraction(outfit._id, 'view').catch(() => {})
    }
  }, [isActive, outfit?._id])

  const likeMutation = useMutation({
    mutationFn: () => toggleLike(outfit._id),
    onMutate: () => {
      setIsLiked(!isLiked)
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1)
    },
    onError: () => {
      setIsLiked(isLiked)
      setLikesCount(outfit.likesCount || 0)
      toast.error('Failed to like')
    }
  })

  const bookmarkMutation = useMutation({
    mutationFn: () => toggleBookmark(outfit._id),
    onMutate: () => {
      setIsBookmarked(!isBookmarked)
      setBookmarksCount(prev => isBookmarked ? prev - 1 : prev + 1)
    },
    onError: () => {
      setIsBookmarked(isBookmarked)
      setBookmarksCount(outfit.bookmarksCount || 0)
      toast.error('Failed to bookmark')
    }
  })

  const followMutation = useMutation({
    mutationFn: () => toggleFollow(outfit.partner._id),
    onSuccess: () => {
      setIsFollowing(!isFollowing)
      toast.success(isFollowing ? 'Unfollowed' : 'Following!')
    },
    onError: (error) => {
      toast.error(parseApiError(error).message)
    }
  })

  const commentMutation = useMutation({
    mutationFn: (text) => addComment(outfit._id, text),
    onSuccess: () => {
      setNewComment('')
      queryClient.invalidateQueries(['comments', outfit._id])
      toast.success('Comment added')
    },
    onError: (error) => {
      toast.error(parseApiError(error).message)
    }
  })

  const addToCartMutation = useMutation({
    mutationFn: () => addToCart({
      outfitId: outfit._id,
      quantity: 1,
      size: selectedSize
    }),
    onSuccess: () => {
      toast.success('Added to cart!')
    },
    onError: (error) => {
      toast.error(parseApiError(error).message)
    }
  })

  const handleLike = () => {
    if (!isAuthenticated()) {
      navigate('/login')
      return
    }
    if (!isUser()) {
      toast.error('Only users can like outfits')
      return
    }
    likeMutation.mutate()
  }

  const handleBookmark = () => {
    if (!isAuthenticated()) {
      navigate('/login')
      return
    }
    if (!isUser()) {
      toast.error('Only users can bookmark')
      return
    }
    bookmarkMutation.mutate()
  }

  const handleFollow = () => {
    if (!isAuthenticated()) {
      navigate('/login')
      return
    }
    if (!isUser()) {
      toast.error('Only users can follow')
      return
    }
    followMutation.mutate()
  }

  const handleShare = async () => {
    const shareData = {
      title: outfit.title,
      text: `Check out this outfit from ${outfit.partner?.brandName} on Drip!`,
      url: `${window.location.origin}/outfit/${outfit._id}`
    }
    
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(shareData.url)
      toast.success('Link copied to clipboard!')
    }
  }

  const handleShopNow = () => {
    navigate(`/outfit/${outfit._id}`)
  }

  return (
    <div className="relative h-screen w-full snap-start bg-black overflow-hidden">
      {/* Video */}
      <video
        ref={videoRef}
        src={outfit.video?.url}
        poster={outfit.video?.thumbnailUrl}
        muted={isMuted}
        loop
        playsInline
        onLoadedData={() => setIsLoaded(true)}
        className="absolute inset-0 w-full h-full object-contain"
      />

      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark">
          <Spinner size="lg" />
        </div>
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

      {/* Mute Toggle */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute top-20 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white"
      >
        {isMuted ? '🔇' : '🔊'}
      </button>

      {/* Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pb-24 md:pb-6">
        <div className="flex items-end justify-between">
          <div className="flex-1 min-w-0">
            {/* Partner Info with Follow */}
            <div className="flex items-center gap-3 mb-2">
              <Link to={`/partner/${outfit.partner?._id}`}>
                <Avatar
                  src={outfit.partner?.logo}
                  name={outfit.partner?.brandName}
                  size="md"
                  className="border-2 border-white"
                />
              </Link>
              <div className="flex-1">
                <Link to={`/partner/${outfit.partner?._id}`}>
                  <p className="text-white font-semibold">{outfit.partner?.brandName}</p>
                </Link>
                <p className="text-white/70 text-sm">@{outfit.partner?.brandName?.toLowerCase().replace(/\s+/g, '')}</p>
              </div>
              <button
                onClick={handleFollow}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  isFollowing
                    ? 'bg-white/20 text-white'
                    : 'bg-brand text-white'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>

            <Link to={`/outfit/${outfit._id}`}>
              <h3 className="text-white font-bold text-lg mb-1">{outfit.title}</h3>
            </Link>
            <p className="text-white/80 text-sm line-clamp-2 mb-3">{outfit.description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {outfit.tags?.slice(0, 3).map(tag => (
                <span key={tag} className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs">
                  #{tag}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-3 mb-2 text-sm text-white/70">
              <span>❤️ {outfit.likesCount || 0}</span>
              <span>👁️ {outfit.viewsCount || 0}</span>
            </div>
            <p className="text-brand font-bold text-xl">PKR {outfit.price?.toLocaleString()}</p>

            {/* Size Selector */}
            {outfit.sizes?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {outfit.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      selectedSize === size
                        ? 'bg-brand text-white'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col items-center gap-4 ml-4">
            {/* Only show like/bookmark/comment for non-partners or when partner is viewing others' outfits */}
            {!isOwnOutfit && (
              <>
                <button
                  onClick={handleLike}
                  className="flex flex-col items-center gap-1"
                >
                  <div className={`w-12 h-12 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors ${
                    isLiked ? 'bg-red-500/20 text-red-500' : 'bg-white/10 text-white'
                  }`}>
                    <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                  </div>
                  <span className="text-white text-xs">{likesCount}</span>
                </button>

                <button
                  onClick={handleBookmark}
                  className="flex flex-col items-center gap-1"
                >
                  <div className={`w-12 h-12 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors ${
                    isBookmarked ? 'bg-yellow-500/20 text-yellow-500' : 'bg-white/10 text-white'
                  }`}>
                    <Bookmark className={`w-6 h-6 ${isBookmarked ? 'fill-current' : ''}`} />
                  </div>
                  <span className="text-white text-xs">{bookmarksCount}</span>
                </button>

                <button
                  onClick={() => setShowComments(true)}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <span className="text-white text-xs">{outfit.commentsCount || 0}</span>
                </button>
              </>
            )}

            <button
              onClick={handleShare}
              className="flex flex-col items-center gap-1"
            >
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white">
                <Share2 className="w-6 h-6" />
              </div>
              <span className="text-white text-xs">Share</span>
            </button>
          </div>
        </div>

        {/* Shop Button */}
        <button
          onClick={handleShopNow}
          disabled={addToCartMutation.isPending}
          className="mt-4 w-full md:w-auto md:px-8 py-3 bg-brand text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <ShoppingBag className="w-5 h-5" />
          {addToCartMutation.isPending ? 'Adding...' : 'Shop Now'}
        </button>
      </div>

      {/* AI Badge */}
      {outfit.relevanceScore && (
        <div className="absolute top-20 left-4 px-3 py-1 bg-brand/80 backdrop-blur-sm rounded-full text-white text-xs font-medium">
          ✨ {Math.round(outfit.relevanceScore * 100)}% Match
        </div>
      )}

      {/* Comments Modal */}
      <CommentsModal
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        outfitId={outfit._id}
        newComment={newComment}
        setNewComment={setNewComment}
        onSubmit={() => commentMutation.mutate(newComment)}
        isSubmitting={commentMutation.isPending}
      />
    </div>
  )
}

const CommentItem = ({ comment, outfitId, onReply, replyingTo, setReplyingTo, replyText, setReplyText, onSubmitReply, isSubmittingReply }) => {
  const { isAuthenticated, isUser } = useAuthStore()
  const navigate = useNavigate()
  const [showReplies, setShowReplies] = useState(false)
  
  const { data: repliesData } = useQuery({
    queryKey: ['replies', comment._id],
    queryFn: async () => {
      const response = await getReplies(comment._id)
      return response.data.data.replies || []
    },
    enabled: showReplies
  })

  const handleReplyClick = () => {
    if (!isAuthenticated()) {
      navigate('/login')
      return
    }
    if (!isUser()) {
      toast.error('Only users can reply')
      return
    }
    setReplyingTo(replyingTo === comment._id ? null : comment._id)
  }

  const handleSubmitReply = (e) => {
    e.preventDefault()
    if (!replyText.trim()) return
    onSubmitReply(comment._id, replyText)
  }

  return (
    <div className="flex gap-3">
      <Avatar
        src={comment.user?.avatar}
        name={comment.user?.name}
        size="sm"
      />
      <div className="flex-1 min-w-0">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
          <p className="font-semibold text-sm">{comment.user?.name}</p>
          <p className="text-gray-700 dark:text-gray-300 text-sm">{comment.text}</p>
        </div>
        <div className="flex items-center gap-4 mt-1 ml-1">
          <span className="text-xs text-gray-500">
            {new Date(comment.createdAt).toLocaleDateString()}
          </span>
          <button 
            onClick={handleReplyClick}
            className="text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-brand"
          >
            Reply
          </button>
        </div>

        {/* Reply Input */}
        {replyingTo === comment._id && (
          <form onSubmit={handleSubmitReply} className="flex gap-2 mt-2">
            <Input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Reply to ${comment.user?.name}...`}
              className="flex-1 text-sm"
              autoFocus
            />
            <Button 
              type="submit" 
              loading={isSubmittingReply} 
              disabled={!replyText.trim()}
              size="sm"
            >
              <Send className="w-3 h-3" />
            </Button>
          </form>
        )}

        {/* Show Replies Toggle */}
        {comment.replyCount > 0 && (
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="text-xs text-brand font-medium mt-2 hover:underline"
          >
            {showReplies ? 'Hide' : 'View'} {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
          </button>
        )}

        {/* Replies List */}
        {showReplies && repliesData?.length > 0 && (
          <div className="mt-2 space-y-2 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
            {repliesData.map(reply => (
              <div key={reply._id} className="flex gap-2">
                <Avatar
                  src={reply.user?.avatar}
                  name={reply.user?.name}
                  size="xs"
                />
                <div className="flex-1 min-w-0">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-1.5">
                    <p className="font-semibold text-xs">{reply.user?.name}</p>
                    <p className="text-gray-700 dark:text-gray-300 text-xs">{reply.text}</p>
                  </div>
                  <span className="text-[10px] text-gray-500 mt-0.5 block">
                    {new Date(reply.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const CommentsModal = ({ isOpen, onClose, outfitId, newComment, setNewComment, onSubmit, isSubmitting }) => {
  const { isAuthenticated, isUser } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')
  
  const { data, isLoading } = useQuery({
    queryKey: ['comments', outfitId],
    queryFn: async () => {
      const response = await getComments(outfitId)
      return response.data.data.comments
    },
    enabled: isOpen
  })

  const replyMutation = useMutation({
    mutationFn: ({ commentId, text }) => addReply(commentId, text),
    onSuccess: (_, variables) => {
      setReplyText('')
      setReplyingTo(null)
      // Invalidate both the replies query and comments query
      queryClient.invalidateQueries({ queryKey: ['replies', variables.commentId] })
      queryClient.invalidateQueries({ queryKey: ['comments', outfitId] })
      queryClient.invalidateQueries({ queryKey: ['social-status', outfitId] })
      toast.success('Reply added')
    },
    onError: (error) => {
      toast.error(parseApiError(error) || 'Failed to add reply')
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isAuthenticated()) {
      navigate('/login')
      return
    }
    if (!isUser()) {
      toast.error('Only users can comment')
      return
    }
    onSubmit()
  }

  const handleSubmitReply = (commentId, text) => {
    replyMutation.mutate({ commentId, text })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Comments">
      <div className="max-h-[60vh] overflow-y-auto space-y-4 mb-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : data?.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No comments yet. Be the first!</p>
        ) : (
          data?.map(comment => (
            <CommentItem
              key={comment._id}
              comment={comment}
              outfitId={outfitId}
              onReply={handleSubmitReply}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyText={replyText}
              setReplyText={setReplyText}
              onSubmitReply={handleSubmitReply}
              isSubmittingReply={replyMutation.isPending}
            />
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1"
        />
        <Button type="submit" loading={isSubmitting} disabled={!newComment.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </Modal>
  )
}

const Feed = () => {
  const [activeTab, setActiveTab] = useState('for-you')
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef(null)

  const { data, fetchNextPage, hasNextPage, isFetching, isLoading } = useInfiniteQuery({
    queryKey: ['feed', activeTab],
    queryFn: async ({ pageParam = 1 }) => {
      const params = { page: pageParam, limit: 5 }
      const response = activeTab === 'for-you'
        ? await getAIFeed(params)
        : await getPersonalizedSearch(params)
      return response.data.data
    },
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.outfits?.length < 5) return undefined
      return pages.length + 1
    },
  })

  const outfits = data?.pages?.flatMap(page => page.outfits) || []

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return
    const scrollTop = containerRef.current.scrollTop
    const height = window.innerHeight
    const index = Math.round(scrollTop / height)
    setActiveIndex(index)
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const { ref: loadMoreRef, inView } = useInView({ threshold: 0 })

  useEffect(() => {
    if (inView && hasNextPage && !isFetching) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetching, fetchNextPage])

  return (
    <div className="h-screen flex flex-col bg-dark">
      {/* Tab Switcher */}
      <div className="fixed top-16 left-0 right-0 z-30 flex justify-center gap-8 py-4 bg-gradient-to-b from-dark/80 to-transparent">
        <button
          onClick={() => setActiveTab('for-you')}
          className={`text-lg font-semibold transition-colors ${activeTab === 'for-you' ? 'text-white' : 'text-white/50'}`}
        >
          For You
        </button>
        <button
          onClick={() => setActiveTab('following')}
          className={`text-lg font-semibold transition-colors ${activeTab === 'following' ? 'text-white' : 'text-white/50'}`}
        >
          Following
        </button>
      </div>

      {/* Reels Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      >
        {isLoading ? (
          <div className="h-screen flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : outfits.length === 0 ? (
          <div className="h-screen flex items-center justify-center p-4">
            <EmptyState
              icon={Sparkles}
              title="No outfits yet"
              description="Follow some brands to see their latest outfits here"
            />
          </div>
        ) : (
          <>
            {outfits.map((outfit, index) => (
              <ReelCard
                key={outfit._id}
                outfit={outfit}
                isActive={index === activeIndex}
              />
            ))}
            <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
              {isFetching && <Spinner />}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Feed
