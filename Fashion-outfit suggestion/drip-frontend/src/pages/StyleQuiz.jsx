/**
 * @fileoverview Style quiz page for onboarding and personalization.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowRight, SkipForward, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { submitStyleQuiz } from '../api/ai.api'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'

const questions = [
  {
    id: 'preferred_style',
    question: 'What\'s your preferred style?',
    options: [
      { value: 'casual', label: 'Casual', icon: '👕' },
      { value: 'formal', label: 'Formal', icon: '👔' },
      { value: 'streetwear', label: 'Streetwear', icon: '🧢' },
      { value: 'ethnic', label: 'Ethnic', icon: '🥻' },
      { value: 'sportswear', label: 'Sportswear', icon: '👟' },
      { value: 'luxury', label: 'Luxury', icon: '💎' },
    ]
  },
  {
    id: 'occasion',
    question: 'What do you usually shop for?',
    options: [
      { value: 'daily_wear', label: 'Daily Wear', icon: '🌅' },
      { value: 'office', label: 'Office/Work', icon: '💼' },
      { value: 'party', label: 'Party/Events', icon: '🎉' },
      { value: 'gym', label: 'Gym/Sports', icon: '💪' },
    ]
  },
  {
    id: 'budget',
    question: 'What\'s your typical budget?',
    options: [
      { value: 'budget', label: 'Budget Friendly', icon: '💰' },
      { value: 'mid_range', label: 'Mid Range', icon: '💵' },
      { value: 'premium', label: 'Premium', icon: '💳' },
      { value: 'luxury_budget', label: 'Luxury', icon: '👑' },
    ]
  },
]

const StyleQuiz = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const progress = ((currentStep + 1) / questions.length) * 100

  const handleAnswer = (answer) => {
    const newAnswers = [...answers, { question: questions[currentStep].id, answer }]
    setAnswers(newAnswers)

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      submitQuiz(newAnswers)
    }
  }

  const submitQuiz = async (finalAnswers) => {
    setSubmitting(true)
    try {
      await submitStyleQuiz(finalAnswers)
      toast.success('Your feed is now personalized!')
      navigate('/feed')
    } catch (error) {
      toast.error('Failed to save preferences, but you can continue')
      navigate('/feed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSkip = () => {
    navigate('/feed')
  }

  if (submitting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-dark">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">Personalizing your feed...</p>
      </div>
    )
  }

  const currentQuestion = questions[currentStep]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-dark-card border-b border-gray-200 dark:border-gray-800 p-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand" />
            <span className="font-semibold">Style Quiz</span>
          </div>
          <button
            onClick={handleSkip}
            className="text-sm text-gray-500 hover:text-brand flex items-center gap-1"
          >
            Skip <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white dark:bg-dark-card">
        <div className="h-1 bg-gray-200 dark:bg-gray-800">
          <motion.div
            className="h-full bg-brand"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
                {currentQuestion.question}
              </h2>
              <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
                Question {currentStep + 1} of {questions.length}
              </p>

              <div className="grid grid-cols-2 gap-3">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(option.value)}
                    className="p-4 bg-white dark:bg-dark-card rounded-xl border-2 border-transparent hover:border-brand transition-all text-center group"
                  >
                    <span className="text-3xl mb-2 block">{option.icon}</span>
                    <span className="font-medium text-gray-900 dark:text-white group-hover:text-brand">
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default StyleQuiz
