/**
 * @fileoverview Axios instance configuration with interceptors for authentication,
 * token refresh, and error handling.
 */

import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

api.interceptors.request.use((config) => {
  console.log('=== AXIOS INTERCEPTOR DEBUG ===');
  console.log('Request URL:', config.url);
  
  let token = null
  
  // For admin routes, ONLY use admin-storage token
  if (config.url.startsWith('/admin')) {
    console.log('Admin route detected - using admin-storage only');
    const adminStorage = localStorage.getItem('admin-storage')
    console.log('Admin storage raw value:', adminStorage);
    if (adminStorage) {
      try {
        const adminData = JSON.parse(adminStorage)
        console.log('Parsed admin data:', adminData);
        token = adminData.state?.accessToken
        console.log('Token from admin-storage:', token ? 'FOUND' : 'NOT FOUND');
      } catch (e) {
        console.error('Failed to parse admin storage:', e)
      }
    }
  } else {
    // For user/partner routes, use generic accessToken
    console.log('User/Partner route - using accessToken key');
    token = localStorage.getItem('accessToken')
    console.log('Token from accessToken key:', token ? 'FOUND' : 'NOT FOUND');
  }
  
  console.log('Final token being used:', token ? token.substring(0, 20) + '...' : 'NONE');
  
  if (token) config.headers.Authorization = `Bearer ${token}`
  console.log('Authorization header set:', config.headers.Authorization ? 'YES' : 'NO');
  
  return config
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token))
  failedQueue = []
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => failedQueue.push({ resolve, reject }))
          .then(token => { original.headers.Authorization = `Bearer ${token}`; return api(original) })
      }
      original._retry = true
      isRefreshing = true
      try {
        const stored = JSON.parse(localStorage.getItem('drip-auth') || '{}')
        const role = stored?.state?.role
        const url = role === 'partner'
          ? `${BASE_URL}/api/partner/auth/refresh`
          : role === 'admin'
          ? `${BASE_URL}/api/admin/refresh`
          : `${BASE_URL}/api/auth/refresh`
        const { data } = await axios.post(url, {}, { withCredentials: true })
        const newToken = data.data.accessToken
        localStorage.setItem('accessToken', newToken)
        processQueue(null, newToken)
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch (err) {
        processQueue(err, null)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('drip-auth')
        window.location.href = '/login'
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export default api
