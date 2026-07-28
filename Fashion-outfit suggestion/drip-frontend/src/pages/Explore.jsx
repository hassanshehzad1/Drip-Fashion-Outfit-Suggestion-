/**
 * @fileoverview Explore/search page for discovering outfits and brands.
 */

import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { Search, SlidersHorizontal, TrendingUp, X, Store, Heart } from 'lucide-react'
import { useDebounce } from '../hooks/useDebounce'
import { searchOutfits, getTrendingTags, getSearchSuggestions, searchPartners } from '../api/search.api'
import { formatPrice, formatCompact } from '../utils/formatPrice'
import { useInView } from 'react-intersection-observer'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'

const categories = ['All', 'Casual', 'Formal', 'Streetwear', 'Ethnic', 'Sportswear', 'Luxury', 'Accessories']

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [activeTab, setActiveTab] = useState('outfits')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showFilters, setShowFilters] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const debouncedQuery = useDebounce(query, 300)
  const { ref: loadMoreRef, inView } = useInView({ threshold: 0 })

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      getSearchSuggestions(debouncedQuery).then(res => {
        setSuggestions(res.data.data.suggestions)
        setShowSuggestions(true)
      })
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [debouncedQuery])

  const { data, fetchNextPage, hasNextPage, isFetching, isLoading } = useInfiniteQuery({
    queryKey: ['search', debouncedQuery, selectedCategory, activeTab],
    queryFn: async ({ pageParam = 1 }) => {
      const params = {
        q: debouncedQuery,
        page: pageParam,
        limit: 12,
        category: selectedCategory === 'All' ? undefined : selectedCategory.toLowerCase(),
      }

      if (activeTab === 'outfits') {
        const response = await searchOutfits(params)
        return { items: response.data.data.outfits, pagination: response.data.pagination }
      } else {
        const response = await searchPartners({ q: debouncedQuery, page: pageParam, limit: 12 })
        return { items: response.data.data.partners, pagination: response.data.pagination }
      }
    },
    getNextPageParam: (lastPage, pages) => {
      if (!lastPage.pagination?.hasNextPage) return undefined
      return pages.length + 1
    },
    enabled: activeTab === 'outfits' || activeTab === 'partners'
  })

  const { data: trendingData } = useQuery({
    queryKey: ['trending'],
    queryFn: async () => {
      const response = await getTrendingTags()
      return response.data.data
    },
    enabled: !debouncedQuery
  })

  useEffect(() => {
    if (inView && hasNextPage && !isFetching) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetching, fetchNextPage])

  const items = data?.pages?.flatMap(page => page.items) || []
  const trendingTags = trendingData?.tags?.slice(0, 8) || []

  const handleSearch = (e) => {
    e.preventDefault()
    setShowSuggestions(false)
    if (query) {
      setSearchParams({ q: query })
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-dark">
      {/* Search Header */}
      <div className="sticky top-16 z-30 bg-white/95 dark:bg-dark/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search outfits, brands, or tags..."
              className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-dark-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-brand"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                {suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setQuery(suggestion.text)
                      setShowSuggestions(false)
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-dark-surface flex items-center justify-between"
                  >
                    <span>{suggestion.text}</span>
                    <Badge variant="default" size="sm">{suggestion.type}</Badge>
                  </button>
                ))}
              </div>
            )}
          </form>

          {/* Tabs */}
          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={() => setActiveTab('outfits')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'outfits' ? 'bg-brand text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-surface'
              }`}
            >
              Outfits
            </button>
            <button
              onClick={() => setActiveTab('partners')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'partners' ? 'bg-brand text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-surface'
              }`}
            >
              Brands
            </button>

            <div className="flex-1" />

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Category Filters */}
          {showFilters && activeTab === 'outfits' && (
            <div className="flex flex-wrap gap-2 mt-4 pb-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    selectedCategory === cat
                      ? 'bg-brand text-white'
                      : 'bg-gray-100 dark:bg-dark-surface text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Trending Tags */}
        {!query && !isLoading && activeTab === 'outfits' && trendingTags.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-brand" />
              <h3 className="font-semibold">Trending Now</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {trendingTags.map(tag => (
                <button
                  key={tag.tag}
                  onClick={() => setQuery(tag.tag)}
                  className="px-3 py-1.5 bg-brand/10 text-brand rounded-full text-sm hover:bg-brand/20 transition-colors"
                >
                  #{tag.tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={activeTab === 'outfits' ? Search : Store}
            title="No results found"
            description={query ? `Try adjusting your search for "${query}"` : 'Start typing to search'}
          />
        ) : (
          <>
            <div className={`grid gap-4 ${
              activeTab === 'outfits'
                ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}>
              {activeTab === 'outfits' ? (
                items.map(outfit => (
                  <Link
                    key={outfit._id}
                    to={`/outfit/${outfit._id}`}
                    className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 dark:bg-dark-card"
                  >
                    <img
                      src={outfit.video?.thumbnailUrl || outfit.images?.[0]?.url}
                      alt={outfit.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                      <p className="text-white font-medium text-sm truncate">{outfit.title}</p>
                      <p className="text-white/80 text-sm">{formatPrice(outfit.price)}</p>
                      <div className="flex items-center gap-3 mt-1 text-white/70 text-xs">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" /> {formatCompact(outfit.likesCount)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                items.map(partner => (
                  <Link
                    key={partner._id}
                    to={`/partner/${partner._id}`}
                    className="bg-white dark:bg-dark-card rounded-xl p-4 border border-gray-200 dark:border-gray-800 hover:border-brand transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar
                        src={partner.logo}
                        name={partner.brandName}
                        size="lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{partner.brandName}</h3>
                        <p className="text-sm text-gray-500 capitalize">{partner.category}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatCompact(partner.followersCount)} followers
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>

            <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
              {isFetching && <Spinner />}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Explore
