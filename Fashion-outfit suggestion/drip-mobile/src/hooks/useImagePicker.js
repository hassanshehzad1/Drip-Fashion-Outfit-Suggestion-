import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

export const useImagePicker = () => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async (options = {}) => {
    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: options.mediaTypes || ImagePicker.MediaTypeOptions.Images,
        allowsEditing: options.allowsEditing || true,
        aspect: options.aspect || [4, 3],
        quality: options.quality || 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0]);
      }
      return result;
    } catch (error) {
      console.error('Error picking image:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const pickVideo = async () => {
    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0]);
      }
      return result;
    } catch (error) {
      console.error('Error picking video:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async () => {
    setLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0]);
      }
      return result;
    } catch (error) {
      console.error('Error taking photo:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => setImage(null);

  return {
    image,
    loading,
    pickImage,
    pickVideo,
    takePhoto,
    clearImage,
  };
};
