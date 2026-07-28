import api from './axios';

export const adminAPI = {
  // Admin login
  login: async (data) => {
    const response = await api.post('/admin/login', data);
    return response.data;
  },

  // Refresh admin token
  refreshToken: async (refreshToken) => {
    const response = await api.post('/admin/refresh', { refreshToken });
    return response.data;
  },

  // Admin logout
  logout: async () => {
    const response = await api.post('/admin/logout');
    return response.data;
  },

  // User management
  getAllUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  getUserDetails: async (userId) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  banUser: async (userId, data) => {
    const response = await api.patch(`/admin/users/${userId}/ban`, data);
    return response.data;
  },

  unbanUser: async (userId) => {
    const response = await api.patch(`/admin/users/${userId}/unban`);
    return response.data;
  },

  // Partner management
  getAllPartners: async (params = {}) => {
    const response = await api.get('/admin/partners', { params });
    return response.data;
  },

  getPartnerDetails: async (partnerId) => {
    const response = await api.get(`/admin/partners/${partnerId}`);
    return response.data;
  },

  approvePartner: async (partnerId) => {
    const response = await api.patch(`/admin/partners/${partnerId}/approve`);
    return response.data;
  },

  rejectPartner: async (partnerId, data) => {
    const response = await api.patch(`/admin/partners/${partnerId}/reject`, data);
    return response.data;
  },

  banPartner: async (partnerId, data) => {
    const response = await api.patch(`/admin/partners/${partnerId}/ban`, data);
    return response.data;
  },

  unbanPartner: async (partnerId) => {
    const response = await api.patch(`/admin/partners/${partnerId}/unban`);
    return response.data;
  },

  // Content moderation
  getAllOutfits: async (params = {}) => {
    const response = await api.get('/admin/outfits', { params });
    return response.data;
  },

  removeOutfit: async (outfitId) => {
    const response = await api.delete(`/admin/outfits/${outfitId}`);
    return response.data;
  },

  getAllComments: async (params = {}) => {
    const response = await api.get('/admin/comments', { params });
    return response.data;
  },

  removeComment: async (commentId) => {
    const response = await api.delete(`/admin/comments/${commentId}`);
    return response.data;
  },

  // Order management
  getAllOrders: async (params = {}) => {
    const response = await api.get('/admin/orders', { params });
    return response.data;
  },

  getOrderDetails: async (orderId) => {
    const response = await api.get(`/admin/orders/${orderId}`);
    return response.data;
  },

  // Analytics
  getPlatformAnalytics: async () => {
    const response = await api.get('/admin/analytics');
    return response.data;
  },

  // Admin management (superadmin only)
  createAdmin: async (data) => {
    const response = await api.post('/admin/admins', data);
    return response.data;
  },
};
