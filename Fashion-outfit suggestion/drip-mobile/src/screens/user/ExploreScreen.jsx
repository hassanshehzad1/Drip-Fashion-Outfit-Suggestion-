import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { searchOutfits, getTrendingTags, getSearchSuggestions } from '../../api/search.api'
import { colors, typography } from '../../theme'
import { formatPrice } from '../../utils/format'
import Toast from 'react-native-toast-message'

const ExploreScreen = () => {
  const navigation = useNavigation()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [trendingTags, setTrendingTags] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const categories = ['All', 'Casual', 'Formal', 'Streetwear', 'Ethnic', 'Sportswear', 'Luxury', 'Accessories', 'Footwear']

  const loadTrending = async () => {
    try {
      const response = await getTrendingTags()
      setTrendingTags(response.data.data.tags || [])
    } catch (error) {
      console.error('Failed to load trending tags:', error)
    }
  }

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([])
      setShowSuggestions(false)
      return
    }

    setLoading(true)
    try {
      const params = { q: searchQuery }
      if (selectedCategory !== 'All') {
        params.category = selectedCategory.toLowerCase()
      }
      const response = await searchOutfits(params)
      setResults(response.data.data.outfits || [])
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Search failed',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestions = async (text) => {
    setQuery(text)
    if (text.length >= 2) {
      try {
        const response = await getSearchSuggestions(text)
        setSuggestions(response.data.data.suggestions || [])
        setShowSuggestions(true)
      } catch (error) {
        console.error('Failed to load suggestions:', error)
      }
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const debouncedSearch = useCallback(
    (text) => {
      const timer = setTimeout(() => {
        handleSearch(text)
      }, 300)
      return () => clearTimeout(timer)
    },
    [selectedCategory]
  )

  React.useEffect(() => {
    loadTrending()
  }, [])

  React.useEffect(() => {
    const cleanup = debouncedSearch(query)
    return cleanup
  }, [query, debouncedSearch])

  const handleTagPress = (tag) => {
    setQuery(tag)
    setShowSuggestions(false)
    handleSearch(tag)
  }

  const handleCategoryPress = (category) => {
    setSelectedCategory(category)
    if (query) {
      handleSearch(query)
    }
  }

  const handleOutfitPress = (outfit) => {
    navigation.navigate('OutfitDetail', { outfitId: outfit._id })
  }

  const renderSuggestion = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleTagPress(item.text)}
    >
      <Text style={styles.suggestionText}>{item.text}</Text>
      <Text style={styles.suggestionType}>{item.type}</Text>
    </TouchableOpacity>
  )

  const renderTrendingTag = ({ item }) => (
    <TouchableOpacity
      style={styles.trendingTag}
      onPress={() => handleTagPress(item.tag)}
    >
      <Text style={styles.trendingTagText}>#{item.tag}</Text>
      <Text style={styles.trendingCount}>{item.count}</Text>
    </TouchableOpacity>
  )

  const renderOutfit = ({ item }) => (
    <TouchableOpacity
      style={styles.outfitCard}
      onPress={() => handleOutfitPress(item)}
    >
      {item.video?.thumbnailUrl || item.images?.[0]?.url ? (
        <View style={styles.outfitImage}>
          <Text style={styles.outfitImagePlaceholder}>📷</Text>
        </View>
      ) : (
        <View style={styles.outfitImagePlaceholder}>
          <Text style={styles.placeholderText}>No image</Text>
        </View>
      )}
      <Text style={styles.outfitTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.outfitPrice}>{formatPrice(item.price)}</Text>
      <Text style={styles.outfitPartner}>{item.partner?.brandName}</Text>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search outfits, brands..."
          value={query}
          onChangeText={handleSuggestions}
          onSubmitEditing={() => {
            setShowSuggestions(false)
            handleSearch(query)
          }}
        />
        {query.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              setQuery('')
              setResults([])
              setShowSuggestions(false)
            }}
          >
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={(item, index) => `${item.text}-${index}`}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.categoryChipActive,
            ]}
            onPress={() => handleCategoryPress(category)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category && styles.categoryTextActive,
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {!query && trendingTags.length > 0 && (
        <View style={styles.trendingSection}>
          <Text style={styles.sectionTitle}>Trending Now 🔥</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.trendingContent}
          >
            {trendingTags.map((tag) => (
              <TouchableOpacity
                key={tag.tag}
                style={styles.trendingPill}
                onPress={() => handleTagPress(tag.tag)}
              >
                <Text style={styles.trendingPillText}>#{tag.tag}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderOutfit}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={styles.resultsGrid}
          columnWrapperStyle={styles.row}
        />
      ) : query ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>No results found</Text>
          <Text style={styles.emptySubtext}>Try different keywords or browse categories</Text>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>👗</Text>
          <Text style={styles.emptyText}>Explore fashion</Text>
          <Text style={styles.emptySubtext}>Search for outfits or browse trending tags</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  clearButton: {
    padding: 8,
    marginLeft: 8,
  },
  clearText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  suggestionsContainer: {
    backgroundColor: colors.card,
    maxHeight: 200,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  suggestionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  suggestionText: {
    ...typography.body1,
    color: colors.textPrimary,
  },
  suggestionType: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  categoriesScroll: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  categoryText: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  categoryTextActive: {
    color: colors.textInverse,
  },
  trendingSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  trendingContent: {
    flexDirection: 'row',
  },
  trendingPill: {
    backgroundColor: colors.brand50,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  trendingPillText: {
    ...typography.body2,
    color: colors.brand,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsGrid: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  outfitCard: {
    width: '48%',
    marginBottom: 16,
  },
  outfitImage: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: colors.surface,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  outfitImagePlaceholder: {
    ...typography.body1,
    color: colors.textMuted,
  },
  placeholderText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  outfitTitle: {
    ...typography.body2,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  outfitPrice: {
    ...typography.price,
    color: colors.brand,
    marginBottom: 4,
  },
  outfitPartner: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtext: {
    ...typography.body2,
    color: colors.textSecondary,
    textAlign: 'center',
  },
})

export default ExploreScreen
