import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { submitStyleQuiz } from '../../api/ai.api'
import { colors, typography } from '../../theme'
import Toast from 'react-native-toast-message'

const { width } = Dimensions.get('window')

const questions = [
  {
    id: 'preferred_style',
    title: "What's your vibe?",
    options: [
      { value: 'casual', label: 'Casual', icon: '👕' },
      { value: 'formal', label: 'Formal', icon: '👔' },
      { value: 'streetwear', label: 'Streetwear', icon: '🧢' },
      { value: 'ethnic', label: 'Ethnic', icon: '👘' },
      { value: 'sportswear', label: 'Sportswear', icon: '🏃' },
      { value: 'luxury', label: 'Luxury', icon: '✨' },
    ],
  },
  {
    id: 'occasion',
    title: 'When do you dress up?',
    options: [
      { value: 'daily_wear', label: 'Daily Wear', icon: '☕' },
      { value: 'office', label: 'Office', icon: '💼' },
      { value: 'party', label: 'Party', icon: '🎉' },
      { value: 'gym', label: 'Gym', icon: '💪' },
    ],
  },
  {
    id: 'budget',
    title: 'Your budget?',
    options: [
      { value: 'budget', label: 'Budget', icon: '💰' },
      { value: 'mid_range', label: 'Mid-Range', icon: '💵' },
      { value: 'premium', label: 'Premium', icon: '💎' },
      { value: 'luxury_budget', label: 'Luxury', icon: '👑' },
    ],
  },
  {
    id: 'colors',
    title: 'Favourite colours?',
    options: [
      { value: 'black', label: 'Black', color: '#000000' },
      { value: 'white', label: 'White', color: '#FFFFFF' },
      { value: 'red', label: 'Red', color: '#E91E63' },
      { value: 'blue', label: 'Blue', color: '#2196F3' },
      { value: 'green', label: 'Green', color: '#4CAF50' },
      { value: 'yellow', label: 'Yellow', color: '#FFC107' },
    ],
    multiSelect: true,
  },
]

const StyleQuizScreen = () => {
  const navigation = useNavigation()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)

  const handleSelect = (questionId, value) => {
    const question = questions.find(q => q.id === questionId)
    if (question.multiSelect) {
      setAnswers(prev => ({
        ...prev,
        [questionId]: prev[questionId]?.includes(value)
          ? prev[questionId].filter(v => v !== value)
          : [...(prev[questionId] || []), value],
      }))
    } else {
      setAnswers(prev => ({ ...prev, [questionId]: value }))
    }
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handleSkip = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      handleSubmit()
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const answersArray = Object.entries(answers).map(([question, answer]) => ({
        question,
        answer: Array.isArray(answer) ? answer.join(',') : answer,
      }))
      await submitStyleQuiz({ answers: answersArray })
      Toast.show({
        type: 'success',
        text1: 'Style profile saved!',
      })
      navigation.reset({
        index: 0,
        routes: [{ name: 'UserTabs' }],
      })
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to save preferences',
      })
    } finally {
      setLoading(false)
    }
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.question}>
          {questions[currentQuestion].title}
        </Text>

        <View style={styles.options}>
          {questions[currentQuestion].options.map((option) => {
            const isSelected = questions[currentQuestion].multiSelect
              ? answers[questions[currentQuestion].id]?.includes(option.value)
              : answers[questions[currentQuestion].id] === option.value

            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.option,
                  isSelected && styles.optionSelected,
                ]}
                onPress={() => handleSelect(questions[currentQuestion].id, option.value)}
              >
                {option.icon && (
                  <Text style={styles.optionIcon}>{option.icon}</Text>
                )}
                {option.color && (
                  <View style={[styles.colorCircle, { backgroundColor: option.color }]} />
                )}
                <Text style={[
                  styles.optionLabel,
                  isSelected && styles.optionLabelSelected,
                ]}>
                  {option.label}
                </Text>
                {isSelected && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            )
          })}
        </View>

        {currentQuestion < questions.length - 1 ? (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.nextButton, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.nextButtonText}>
              {loading ? 'Saving...' : 'Finish'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 24,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.brand,
    borderRadius: 2,
  },
  skipButton: {
    alignSelf: 'flex-end',
  },
  skipText: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
  },
  question: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: 32,
  },
  options: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    borderColor: colors.brand,
    backgroundColor: colors.brand50,
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionLabel: {
    ...typography.body1,
    color: colors.textPrimary,
    flex: 1,
  },
  optionLabelSelected: {
    color: colors.brand,
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 20,
    color: colors.brand,
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: colors.brand,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  nextButtonText: {
    ...typography.button,
    color: colors.textInverse,
    fontWeight: '600',
  },
})

export default StyleQuizScreen
