import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Picker,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import * as ImagePicker from 'expo-image-picker'
import { createOutfit } from '../../api/outfit.api'
import { uploadImage, uploadVideo } from '../../api/upload.api'
import { colors, typography } from '../../theme'
import { parseApiError } from '../../utils/parseApiError'
import Toast from 'react-native-toast-message'

const UploadOutfitScreen = () => {
  const navigation = useNavigation()
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    originalPrice: '',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 10,
    tags: [],
  })

  const [images, setImages] = useState([])
  const [video, setVideo] = useState(null)

  const categories = [
    'casual', 'formal', 'streetwear', 'sportswear', 'ethnic',
    'luxury', 'accessories', 'footwear', 'kids', 'other'
  ]

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

  const handlePickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      })

      if (!result.canceled) {
        setImages(prev => [...prev, ...result.assets.map(a => a.uri)])
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to pick images',
      })
    }
  }

  const handlePickVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        quality: 0.8,
      })

      if (!result.canceled) {
        setVideo(result.assets[0].uri)
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to pick video',
      })
    }
  }

  const toggleSize = (size) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size],
    }))
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.title.trim()) newErrors.title = 'Required'
    if (!formData.category) newErrors.category = 'Required'
    if (!formData.price || isNaN(formData.price)) newErrors.price = 'Invalid price'
    if (images.length === 0 && !video) newErrors.media = 'At least one image or video required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setLoading(true)
    setUploadProgress(0)

    try {
      const uploadedImages = []
      const uploadedVideo = null

      // Upload images
      for (let i = 0; i < images.length; i++) {
        const response = await uploadImage(images[i])
        uploadedImages.push(response.data.data.url)
        setUploadProgress(((i + 1) / (images.length + (video ? 1 : 0))) * 100)
      }

      // Upload video if present
      if (video) {
        const response = await uploadVideo(video, (progress) => {
          setUploadProgress(progress)
        })
        uploadedVideo = response.data.data.url
      }

      // Create outfit
      const outfitData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        sizes: formData.sizes,
        stock: parseInt(formData.stock),
        tags: formData.tags,
        images: uploadedImages,
        video: uploadedVideo ? { url: uploadedVideo } : undefined,
      }

      await createOutfit(outfitData)
      Toast.show({
        type: 'success',
        text1: 'Outfit uploaded successfully!',
      })
      navigation.goBack()
    } catch (error) {
      const parsed = parseApiError(error)
      setErrors(parsed.fieldErrors)
      Toast.show({
        type: 'error',
        text1: parsed.message,
      })
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upload Outfit</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Media</Text>
        
        <TouchableOpacity style={styles.uploadButton} onPress={handlePickImages}>
          <Text style={styles.uploadButtonText}>+ Add Images</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.uploadButton} onPress={handlePickVideo}>
          <Text style={styles.uploadButtonText}>+ Add Video (Optional)</Text>
        </TouchableOpacity>

        {images.length > 0 && (
          <Text style={styles.mediaCount}>{images.length} images selected</Text>
        )}
        {video && (
          <Text style={styles.mediaCount}>1 video selected</Text>
        )}
        {errors.media && <Text style={styles.errorText}>{errors.media}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Info</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            placeholder="Outfit name"
            value={formData.title}
            onChangeText={(text) => {
              setFormData(prev => ({ ...prev, title: text }))
              setErrors(prev => ({ ...prev, title: null }))
            }}
          />
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your outfit"
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Category *</Text>
          <View style={[styles.picker, errors.category && styles.inputError]}>
            <Picker
              selectedValue={formData.category}
              onValueChange={(value) => {
                setFormData(prev => ({ ...prev, category: value }))
                setErrors(prev => ({ ...prev, category: null }))
              }}
            >
              <Picker.Item label="Select category" value="" />
              {categories.map(cat => (
                <Picker.Item key={cat} label={cat.charAt(0).toUpperCase() + cat.slice(1)} value={cat} />
              ))}
            </Picker>
          </View>
          {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pricing</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Price (PKR) *</Text>
          <TextInput
            style={[styles.input, errors.price && styles.inputError]}
            placeholder="0"
            value={formData.price}
            onChangeText={(text) => {
              setFormData(prev => ({ ...prev, price: text }))
              setErrors(prev => ({ ...prev, price: null }))
            }}
            keyboardType="numeric"
          />
          {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Original Price (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            value={formData.originalPrice}
            onChangeText={(text) => setFormData(prev => ({ ...prev, originalPrice: text }))}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sizes & Stock</Text>
        
        <Text style={styles.label}>Available Sizes</Text>
        <View style={styles.sizesGrid}>
          {availableSizes.map((size) => (
            <TouchableOpacity
              key={size}
              style={[
                styles.sizeChip,
                formData.sizes.includes(size) && styles.sizeChipActive,
              ]}
              onPress={() => toggleSize(size)}
            >
              <Text style={[
                styles.sizeText,
                formData.sizes.includes(size) && styles.sizeTextActive,
              ]}>
                {size}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Stock Quantity</Text>
          <TextInput
            style={styles.input}
            placeholder="10"
            value={String(formData.stock)}
            onChangeText={(text) => setFormData(prev => ({ ...prev, stock: text }))}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tags</Text>
        <TextInput
          style={styles.input}
          placeholder="Comma-separated tags (e.g., summer, casual, trendy)"
          value={formData.tags.join(', ')}
          onChangeText={(text) => {
            setFormData(prev => ({
              ...prev,
              tags: text.split(',').map(t => t.trim()).filter(t => t),
            }))
          }}
        />
      </View>

      {uploadProgress > 0 && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>Uploading... {uploadProgress}%</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.textInverse} />
        ) : (
          <Text style={styles.submitButtonText}>Upload Outfit</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  uploadButton: {
    backgroundColor: colors.surface,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  uploadButtonText: {
    ...typography.body1,
    color: colors.textPrimary,
  },
  mediaCount: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputError: {
    borderColor: colors.danger,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  picker: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    marginTop: 4,
  },
  sizesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  sizeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sizeChipActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  sizeText: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  sizeTextActive: {
    color: colors.textInverse,
  },
  progressContainer: {
    padding: 16,
  },
  progressText: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.brand,
    borderRadius: 2,
  },
  submitButton: {
    backgroundColor: colors.brand,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    margin: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    ...typography.button,
    color: colors.textInverse,
    fontWeight: '600',
  },
})

export default UploadOutfitScreen
