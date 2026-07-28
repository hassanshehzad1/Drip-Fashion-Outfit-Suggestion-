/**
 * @fileoverview Landing page with hero section, features, and trending outfits.
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, ShoppingBag, MessageCircle, Sparkles, TrendingUp, Users, ArrowRight } from 'lucide-react'
import { getTrendingOutfits } from '../api/ai.api'
import { formatPrice } from '../utils/formatPrice'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'

const features = [
  { icon: Play, title: 'Fashion Reels', desc: 'Discover outfits through immersive short videos' },
  { icon: Sparkles, title: 'AI Personalization', desc: 'Get outfit recommendations tailored to your style' },
  { icon: ShoppingBag, title: 'Direct Shopping', desc: 'Buy outfits instantly from trending videos' },
  { icon: MessageCircle, title: 'Real-time Chat', desc: 'Connect directly with fashion brands' },
]

const steps = [
  { num: '01', title: 'Watch Reels', desc: 'Browse through thousands of fashion videos' },
  { num: '02', title: 'Discover Style', desc: 'Find outfits that match your vibe' },
  { num: '03', title: 'Shop Instantly', desc: 'Add to cart and checkout in seconds' },
]

const Landing = () => {
  const [trending, setTrending] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTrending = async () => {
      try {
        const { data } = await getTrendingOutfits('7d')
        setTrending(data.data.outfits.slice(0, 6))
      } catch (err) {
        console.error('Failed to load trending')
      } finally {
        setLoading(false)
      }
    }
    loadTrending()
  }, [])

  return (
    <div className="min-h-screen bg-white dark:bg-dark overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand/10 rounded-full mb-8">
              <span className="w-2 h-2 bg-brand rounded-full animate-pulse" />
              <span className="text-sm font-medium text-brand">Pakistan's First Fashion Reels Platform</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-gradient">Drip</span>
              <span className="block text-gray-900 dark:text-white mt-2">Shop Outfit Reels</span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
              Discover trending fashion through immersive videos. Like TikTok meets Daraz — watch, like, and shop outfits instantly.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto px-8">
                  Start Shopping <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/partner/register">
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-8">
                  For Brands
                </Button>
              </Link>
            </div>

            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>10,000+ Fashionistas</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                <span>50,000+ Outfits</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-dark-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why Choose Drip?</h2>
            <p className="text-gray-600 dark:text-gray-400">The ultimate fashion discovery experience</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-dark-card rounded-2xl p-6 card-3d hover:shadow-xl transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-brand" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Outfits */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Trending Now</h2>
              <p className="text-gray-600 dark:text-gray-400">Most popular outfits this week</p>
            </div>
            <Link to="/feed" className="text-brand hover:underline">View All</Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {trending.map((outfit) => (
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-medium text-sm truncate">{outfit.title}</p>
                    <p className="text-white/80 text-xs">{formatPrice(outfit.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50 dark:bg-dark-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
            <p className="text-gray-600 dark:text-gray-400">Three simple steps to your perfect style</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-brand/10 flex items-center justify-center">
                  <span className="text-3xl font-bold text-brand">{step.num}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-brand to-brand-dark rounded-3xl p-8 md:p-16 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Are You a Fashion Brand?</h2>
            <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8">
              Join Drip and showcase your outfits to thousands of fashion enthusiasts. Upload reels, sell directly, and grow your brand.
            </p>
            <Link to="/partner/register">
              <Button variant="secondary" size="lg" className="bg-white text-brand hover:bg-gray-100">
                Become a Partner
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="text-xl font-bold text-gradient">Drip</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              © 2024 Drip. Pakistan's First Fashion Reels Platform.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link to="/login" className="text-gray-600 dark:text-gray-400 hover:text-brand">Login</Link>
              <Link to="/register" className="text-gray-600 dark:text-gray-400 hover:text-brand">Register</Link>
              <Link to="/partner/login" className="text-gray-600 dark:text-gray-400 hover:text-brand">Partner</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
