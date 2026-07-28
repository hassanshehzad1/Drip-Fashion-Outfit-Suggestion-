import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { partnerAPI, saveToken, saveRefreshToken, clearTokens } from '../api';

const PARTNER_TOKEN_KEY = '@drip_partner_access_token';
const PARTNER_REFRESH_TOKEN_KEY = '@drip_partner_refresh_token';

const savePartnerToken = async (token) => {
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  try {
    await AsyncStorage.setItem(PARTNER_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error saving partner token:', error);
  }
};

const savePartnerRefreshToken = async (token) => {
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  try {
    await AsyncStorage.setItem(PARTNER_REFRESH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error saving partner refresh token:', error);
  }
};

const clearPartnerTokens = async () => {
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  try {
    await AsyncStorage.multiRemove([PARTNER_TOKEN_KEY, PARTNER_REFRESH_TOKEN_KEY]);
  } catch (error) {
    console.error('Error clearing partner tokens:', error);
  }
};

export const usePartnerStore = create(
  persist(
    (set, get) => ({
      partner: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Register partner
      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await partnerAPI.register(data);
          const { partner, accessToken, refreshToken } = response.data;
          
          await savePartnerToken(accessToken);
          await savePartnerRefreshToken(refreshToken);
          
          set({ partner, isAuthenticated: true, isLoading: false });
          return { success: true };
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Registration failed',
            isLoading: false,
          });
          return { success: false, error: error.response?.data?.message };
        }
      },

      // Login partner
      login: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await partnerAPI.login(data);
          const { partner, accessToken, refreshToken } = response.data;
          
          await savePartnerToken(accessToken);
          await savePartnerRefreshToken(refreshToken);
          
          set({ partner, isAuthenticated: true, isLoading: false });
          return { success: true };
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Login failed',
            isLoading: false,
          });
          return { success: false, error: error.response?.data?.message };
        }
      },

      // Logout partner
      logout: async () => {
        try {
          await partnerAPI.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          await clearPartnerTokens();
          set({ partner: null, isAuthenticated: false, error: null });
        }
      },

      // Update partner profile
      updateProfile: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await partnerAPI.updateProfile(data);
          set({ partner: response.data.partner, isLoading: false });
          return { success: true };
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Profile update failed',
            isLoading: false,
          });
          return { success: false, error: error.response?.data?.message };
        }
      },

      // Refresh partner data
      refreshPartner: async () => {
        try {
          const response = await partnerAPI.getMe();
          set({ partner: response.data.partner });
        } catch (error) {
          console.error('Failed to refresh partner:', error);
        }
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'partner-storage',
      partialize: (state) => ({ partner: state.partner, isAuthenticated: state.isAuthenticated }),
    }
  )
);
