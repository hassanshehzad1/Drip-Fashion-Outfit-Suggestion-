import { usePartnerStore } from '../stores';

export const usePartner = () => {
  const {
    partner,
    isAuthenticated,
    isLoading,
    error,
    register,
    login,
    logout,
    updateProfile,
    refreshPartner,
    clearError,
  } = usePartnerStore();

  return {
    partner,
    isAuthenticated,
    isLoading,
    error,
    register,
    login,
    logout,
    updateProfile,
    refreshPartner,
    clearError,
  };
};
