import api from './api';
import { ApiResponse, Media, PaginatedResponse } from '../types';
import * as ImagePicker from 'expo-image-picker';

export interface MediaFilters {
  type?: 'IMAGE' | 'VIDEO';
  activityId?: string;
  page?: number;
  limit?: number;
}

export interface UploadOptions {
  activityId?: string;
  caption?: string;
  onProgress?: (progress: number) => void;
}

// Helper to get file info from URI
const getFileInfo = (uri: string, mimeType?: string) => {
  const fileName = uri.split('/').pop() || 'photo.jpg';
  const type = mimeType || (fileName.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg');
  return { fileName, type };
};

export const mediaService = {
  getMedia: async (
    planId: string,
    filters?: MediaFilters
  ): Promise<ApiResponse<PaginatedResponse<Media>>> => {
    const response = await api.get(`/plans/${planId}/media`, { params: filters });
    return response.data;
  },

  uploadMedia: async (
    planId: string,
    asset: ImagePicker.ImagePickerAsset,
    options?: UploadOptions
  ): Promise<ApiResponse<Media>> => {
    const formData = new FormData();
    const { fileName, type } = getFileInfo(asset.uri, asset.mimeType);

    // @ts-ignore - React Native FormData accepts this format
    formData.append('file', {
      uri: asset.uri,
      name: fileName,
      type: type,
    });

    if (options?.activityId) {
      formData.append('activityId', options.activityId);
    }
    if (options?.caption) {
      formData.append('caption', options.caption);
    }

    const response = await api.post(`/plans/${planId}/media`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (options?.onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          options.onProgress(progress);
        }
      },
    });
    return response.data;
  },

  uploadMultipleMedia: async (
    planId: string,
    assets: ImagePicker.ImagePickerAsset[],
    options?: UploadOptions
  ): Promise<ApiResponse<Media[]>> => {
    const formData = new FormData();

    assets.forEach((asset, index) => {
      const { fileName, type } = getFileInfo(asset.uri, asset.mimeType);
      // @ts-ignore - React Native FormData accepts this format
      formData.append('files', {
        uri: asset.uri,
        name: `photo_${index}_${fileName}`,
        type: type,
      });
    });

    if (options?.activityId) {
      formData.append('activityId', options.activityId);
    }
    if (options?.caption) {
      formData.append('caption', options.caption);
    }

    const response = await api.post(`/plans/${planId}/media/multiple`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (options?.onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          options.onProgress(progress);
        }
      },
    });
    return response.data;
  },

  updateCaption: async (
    mediaId: string,
    caption: string
  ): Promise<ApiResponse<Media>> => {
    const response = await api.put(`/media/${mediaId}/caption`, { caption });
    return response.data;
  },

  deleteMedia: async (mediaId: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/media/${mediaId}`);
    return response.data;
  },

  // Helper to request permissions
  requestPermissions: async (): Promise<boolean> => {
    const cameraResult = await ImagePicker.requestCameraPermissionsAsync();
    const mediaResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return cameraResult.granted && mediaResult.granted;
  },

  // Pick images from library
  pickImages: async (allowMultiple = true): Promise<ImagePicker.ImagePickerAsset[] | null> => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: allowMultiple,
      quality: 0.8,
      exif: false,
    });

    if (result.canceled) {
      return null;
    }

    return result.assets;
  },

  // Take photo with camera
  takePhoto: async (): Promise<ImagePicker.ImagePickerAsset | null> => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      exif: false,
    });

    if (result.canceled || !result.assets.length) {
      return null;
    }

    return result.assets[0];
  },
};
