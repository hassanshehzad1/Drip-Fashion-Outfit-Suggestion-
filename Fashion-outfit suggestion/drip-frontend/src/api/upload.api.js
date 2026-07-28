/**
 * @fileoverview File upload API endpoints for images, videos, and avatars.
 */

import api from './axios'

export const uploadImage = (file) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/upload/image', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export const uploadVideo = (file, onProgress) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/upload/video', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 300000,
    onUploadProgress: (e) => onProgress && onProgress(Math.round(e.loaded * 100 / e.total))
  })
}

export const uploadAvatar = (file) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/upload/avatar', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export const uploadLogo = (file) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/upload/image?type=logo', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export const deleteFile = (fileId) => api.delete(`/upload/${fileId}`)
