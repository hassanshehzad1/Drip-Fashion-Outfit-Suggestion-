import { useOutfitStore } from '../stores';

export const useOutfit = () => {
  const {
    outfits,
    currentOutfit,
    partnerOutfits,
    myOutfits,
    isLoading,
    error,
    pagination,
    getFeed,
    getSingleOutfit,
    getPartnerOutfits,
    getMyOutfits,
    createOutfit,
    updateOutfit,
    toggleFeatured,
    deleteOutfit,
    clearCurrentOutfit,
    clearError,
  } = useOutfitStore();

  return {
    outfits,
    currentOutfit,
    partnerOutfits,
    myOutfits,
    isLoading,
    error,
    pagination,
    getFeed,
    getSingleOutfit,
    getPartnerOutfits,
    getMyOutfits,
    createOutfit,
    updateOutfit,
    toggleFeatured,
    deleteOutfit,
    clearCurrentOutfit,
    clearError,
  };
};
