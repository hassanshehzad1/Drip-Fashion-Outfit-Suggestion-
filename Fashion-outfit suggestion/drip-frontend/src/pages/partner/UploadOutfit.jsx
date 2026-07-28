/**
 * @fileoverview Upload outfit page for partners with video upload and form.
 */

import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Upload, X, Video, Image, Loader2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { createOutfit } from '../../api/outfit.api'
import { uploadVideo, uploadImage } from '../../api/upload.api'
import { outfitSchema } from '../../utils/validators'
import { parseApiError } from '../../utils/parseApiError'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

const categories = [
  { value: 'casual', label: 'Casual Wear' },
  { value: 'formal', label: 'Formal Wear' },
  { value: 'streetwear', label: 'Streetwear' },
  { value: 'sportswear', label: 'Sportswear' },
  { value: 'ethnic', label: 'Ethnic Wear' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'footwear', label: 'Footwear' },
]

const sizesList = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size']

const commonColors = [
  { name: 'White', hexCode: '#FFFFFF' },
  { name: 'Black', hexCode: '#000000' },
  { name: 'Red', hexCode: '#EF4444' },
  { name: 'Blue', hexCode: '#3B82F6' },
  { name: 'Green', hexCode: '#22C55E' },
  { name: 'Yellow', hexCode: '#EAB308' },
  { name: 'Pink', hexCode: '#EC4899' },
  { name: 'Purple', hexCode: '#A855F7' },
  { name: 'Orange', hexCode: '#F97316' },
  { name: 'Gray', hexCode: '#6B7280' },
  { name: 'Brown', hexCode: '#92400E' },
  { name: 'Navy', hexCode: '#1E3A8A' },
]

const UploadOutfit = () => {
  const navigate = useNavigate()
  const videoInputRef = useRef(null)
  const imagesInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [videoFile, setVideoFile] = useState(null)
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [videoUrl, setVideoUrl] = useState(null)
  const [thumbnailUrl, setThumbnailUrl] = useState(null)
  const [images, setImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [selectedSizes, setSelectedSizes] = useState([])
  const [selectedColors, setSelectedColors] = useState([])
  const [customColor, setCustomColor] = useState({ name: '', hexCode: '#000000' })
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [apiError, setApiError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(outfitSchema),
    defaultValues: {
      title: '',
      description: '',
      price: '',
      originalPrice: '',
      category: '',
      stock: '',
    }
  })

  const handleVideoSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 100 * 1024 * 1024) {
      toast.error('Video must be less than 100MB')
      return
    }

    setVideoFile(file)
    setVideoUrl(URL.createObjectURL(file))
  }

  const handleThumbnailSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setThumbnailFile(file)
    setThumbnailUrl(URL.createObjectURL(file))
  }

  const handleImagesSelect = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Check file sizes
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      toast.error('Each image must be less than 5MB')
      return
    }

    // Check max images
    if (images.length + files.length > 8) {
      toast.error('Maximum 8 images allowed')
      return
    }

    const newImages = [...images, ...files]
    const newPreviews = files.map(file => URL.createObjectURL(file))
    
    setImages(newImages)
    setImagePreviews(prev => [...prev, ...newPreviews])
  }

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  const toggleSize = (size) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    )
  }

  const toggleColor = (color) => {
    setSelectedColors(prev =>
      prev.find(c => c.hexCode === color.hexCode)
        ? prev.filter(c => c.hexCode !== color.hexCode)
        : [...prev, color]
    )
  }

  const addCustomColor = () => {
    if (customColor.name.trim() && customColor.hexCode) {
      if (!selectedColors.find(c => c.hexCode === customColor.hexCode)) {
        setSelectedColors([...selectedColors, { ...customColor }])
      }
      setCustomColor({ name: '', hexCode: '#000000' })
    }
  }

  const removeColor = (hexCode) => {
    setSelectedColors(selectedColors.filter(c => c.hexCode !== hexCode))
  }

  const addTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()])
      }
      setTagInput('')
    }
  }

  const removeTag = (tag) => {
    setTags(tags.filter(t => t !== tag))
  }

  const onSubmit = async (data) => {
    if (!videoFile) {
      toast.error('Please upload a video')
      return
    }

    if (selectedSizes.length === 0) {
      toast.error('Please select at least one size')
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setApiError('')

    try {
      // Upload video first
      const videoRes = await uploadVideo(videoFile, setUploadProgress)
      const videoData = videoRes.data?.data

      // Upload thumbnail if selected
      let thumbnailData = null
      if (thumbnailFile) {
        const thumbRes = await uploadImage(thumbnailFile)
        thumbnailData = thumbRes.data?.data
      }

      // Upload multiple outfit images
      let uploadedImages = []
      if (images.length > 0) {
        const imageUploadPromises = images.map(file => uploadImage(file))
        const imageResults = await Promise.all(imageUploadPromises)
        uploadedImages = imageResults.map(res => ({
          url: res.data?.data?.url,
          fileId: res.data?.data?.fileId
        })).filter(img => img.url)
      }

      const outfitData = {
        ...data,
        video: {
          url: videoData?.url,
          fileId: videoData?.fileId,
          thumbnailUrl: thumbnailData?.url || videoData?.thumbnailUrl
        },
        images: uploadedImages,
        sizes: selectedSizes,
        colors: selectedColors,
        tags: tags
      }

      await createOutfit(outfitData)
      toast.success('Outfit uploaded successfully!')
      navigate('/dashboard/outfits')
    } catch (error) {
      const { message } = parseApiError(error)
      setApiError(message)
      toast.error(message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Upload New Outfit</h1>

      {apiError && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
          <AlertCircle size={16} />
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Video Upload */}
        <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="font-semibold mb-4">Outfit Video *</h3>

          {videoUrl ? (
            <div className="relative aspect-[9/16] max-w-sm mx-auto bg-black rounded-xl overflow-hidden">
              <video src={videoUrl} controls className="w-full h-full" />
              <button
                type="button"
                onClick={() => { setVideoFile(null); setVideoUrl(null); }}
                className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => videoInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-12 text-center cursor-pointer hover:border-brand transition-colors"
            >
              <Video className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="font-medium text-gray-900 dark:text-white">Click to upload video</p>
              <p className="text-sm text-gray-500 mt-1">MP4, MOV up to 100MB</p>
            </div>
          )}

          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoSelect}
            className="hidden"
          />
        </div>

        {/* Thumbnail Upload */}
        <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="font-semibold mb-4">Thumbnail (Optional)</h3>

          {thumbnailUrl ? (
            <div className="relative w-48 aspect-video bg-gray-100 rounded-xl overflow-hidden">
              <img src={thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => { setThumbnailFile(null); setThumbnailUrl(null); }}
                className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-dark-surface rounded-lg cursor-pointer hover:bg-gray-200 transition-colors w-fit">
              <Image className="w-5 h-5" />
              <span>Choose thumbnail</span>
              <input type="file" accept="image/*" onChange={handleThumbnailSelect} className="hidden" />
            </label>
          )}
        </div>

        {/* Outfit Images Upload */}
        <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Outfit Images (Optional)</h3>
            <span className="text-sm text-gray-500">{images.length}/8</span>
          </div>

          {/* Image Previews Grid */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-4 gap-3 mb-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
                  <img src={preview} alt={`Outfit ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Images Button */}
          {images.length < 8 && (
            <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-dark-surface rounded-lg cursor-pointer hover:bg-gray-200 transition-colors w-fit">
              <Image className="w-5 h-5" />
              <span>Add images</span>
              <input 
                ref={imagesInputRef}
                type="file" 
                accept="image/*" 
                multiple 
                onChange={handleImagesSelect} 
                className="hidden" 
              />
            </label>
          )}

          <p className="text-xs text-gray-500 mt-2">Upload up to 8 images (max 5MB each)</p>
        </div>

        {/* Outfit Details */}
        <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-gray-800 space-y-4">
          <h3 className="font-semibold mb-4">Outfit Details</h3>

          <Input
            label="Title *"
            placeholder="e.g., Summer Floral Dress"
            error={errors.title?.message}
            {...register('title')}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="block w-full rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2.5 bg-white dark:bg-dark-surface focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none"
              placeholder="Describe your outfit..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price (PKR) *"
              type="number"
              placeholder="2999"
              error={errors.price?.message}
              {...register('price')}
            />
            <Input
              label="Original Price (Optional)"
              type="number"
              placeholder="3999"
              {...register('originalPrice')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category *
            </label>
            <select
              {...register('category')}
              className={`block w-full rounded-xl border px-4 py-2.5 bg-white dark:bg-dark-surface focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none ${
                errors.category ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>}
          </div>
        </div>

        {/* Sizes */}
        <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="font-semibold mb-4">Available Sizes *</h3>
          <div className="flex flex-wrap gap-2">
            {sizesList.map(size => (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                  selectedSizes.includes(size)
                    ? 'border-brand bg-brand/10 text-brand'
                    : 'border-gray-200 dark:border-gray-700 hover:border-brand'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="font-semibold mb-4">Available Colors</h3>

          {/* Selected Colors */}
          {selectedColors.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedColors.map(color => (
                <span
                  key={color.hexCode}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-dark-surface rounded-full text-sm"
                >
                  <span
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: color.hexCode }}
                  />
                  {color.name}
                  <button type="button" onClick={() => removeColor(color.hexCode)} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Common Colors */}
          <div className="flex flex-wrap gap-2 mb-4">
            {commonColors.map(color => (
              <button
                key={color.hexCode}
                type="button"
                onClick={() => toggleColor(color)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  selectedColors.find(c => c.hexCode === color.hexCode)
                    ? 'border-brand scale-110'
                    : 'border-gray-300 hover:scale-105'
                }`}
                style={{ backgroundColor: color.hexCode }}
                title={color.name}
              />
            ))}
          </div>

          {/* Custom Color */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Color name (e.g. Maroon)"
              value={customColor.name}
              onChange={(e) => setCustomColor({ ...customColor, name: e.target.value })}
              className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2 bg-white dark:bg-dark-surface text-sm"
            />
            <input
              type="color"
              value={customColor.hexCode}
              onChange={(e) => setCustomColor({ ...customColor, hexCode: e.target.value })}
              className="w-12 h-10 rounded cursor-pointer"
            />
            <button
              type="button"
              onClick={addCustomColor}
              className="px-4 py-2 bg-gray-100 dark:bg-dark-surface rounded-xl text-sm font-medium hover:bg-gray-200"
            >
              Add
            </button>
          </div>
        </div>

        {/* Stock */}
        <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="font-semibold mb-4">Stock Quantity</h3>
          <div className="flex items-center gap-4">
            <input
              type="number"
              {...register('stock')}
              placeholder="e.g. 50"
              min="0"
              className="block w-32 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2.5 bg-white dark:bg-dark-surface focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none"
            />
            <span className="text-gray-500">units available</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">Leave empty or 0 for unlimited stock</p>
        </div>

        {/* Tags */}
        <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="font-semibold mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map(tag => (
              <span
                key={tag}
                className="px-3 py-1 bg-brand/10 text-brand rounded-full text-sm flex items-center gap-1"
              >
                #{tag}
                <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={addTag}
            placeholder="Type tag and press Enter"
            className="block w-full rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2 bg-white dark:bg-dark-surface focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">Press Enter to add tags</p>
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="bg-brand/10 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Loader2 className="w-5 h-5 animate-spin text-brand" />
              <span className="font-medium">Uploading...</span>
              <span className="text-brand">{uploadProgress}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => navigate('/dashboard')}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1"
            loading={uploading}
            disabled={!videoFile}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Outfit
          </Button>
        </div>
      </form>
    </div>
  )
}

export default UploadOutfit
