import api from './axios'

// POST /api/upload/image (partner auth)
export const uploadImage = async (uri, mimeType = 'image/jpeg') => {
  const formData = new FormData()
  formData.append('file', {
    uri,
    type: mimeType,
    name: `outfit_${Date.now()}.jpg`,
  })
  return api.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// POST /api/upload/video (partner auth)
export const uploadVideo = async (uri, onProgress) => {
  const formData = new FormData()
  formData.append('file', {
    uri,
    type: 'video/mp4',
    name: `outfit_video_${Date.now()}.mp4`,
  })
  return api.post('/upload/video', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 300000,
    onUploadProgress: (e) => {
      if (onProgress) {
        onProgress(Math.round((e.loaded * 100) / e.total))
      }
    },
  })
}

// POST /api/upload/avatar (user auth)
export const uploadAvatar = async (uri) => {
  const formData = new FormData()
  formData.append('file', {
    uri,
    type: 'image/jpeg',
    name: `avatar_${Date.now()}.jpg`,
  })
  return api.post('/upload/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// DELETE /api/upload/:fileId (user or partner auth)
export const deleteFile = (fileId) => api.delete(`/upload/${fileId}`)
