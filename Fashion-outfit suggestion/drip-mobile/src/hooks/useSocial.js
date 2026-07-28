import { useSocialStore } from '../stores';

export const useSocial = () => {
  const {
    likedOutfits,
    bookmarkedOutfits,
    followedPartners,
    followers,
    comments,
    isLoading,
    error,
    pagination,
    toggleLike,
    getLikedOutfits,
    toggleBookmark,
    getBookmarkedOutfits,
    toggleFollow,
    getFollowedPartners,
    getFollowers,
    addComment,
    getComments,
    deleteComment,
    checkLikeBookmarkStatus,
    clearError,
  } = useSocialStore();

  return {
    likedOutfits,
    bookmarkedOutfits,
    followedPartners,
    followers,
    comments,
    isLoading,
    error,
    pagination,
    toggleLike,
    getLikedOutfits,
    toggleBookmark,
    getBookmarkedOutfits,
    toggleFollow,
    getFollowedPartners,
    getFollowers,
    addComment,
    getComments,
    deleteComment,
    checkLikeBookmarkStatus,
    clearError,
  };
};
