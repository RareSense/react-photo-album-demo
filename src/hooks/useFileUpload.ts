import { useState, useCallback } from 'react';
import type { Photo, UploadResult, UploadError } from '@/types';

/**
 * Custom hook for handling file uploads and converting them to Photo objects
 * Provides comprehensive error handling and image dimension extraction
 */
export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<UploadError[]>([]);

  /**
   * Extracts image dimensions from a file using the Image API
   * This is crucial for react-photo-album's justified layout algorithm
   */
  const getImageDimensions = useCallback((file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        // Clean up the object URL to prevent memory leaks
        URL.revokeObjectURL(url);
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };
      
      img.src = url;
    });
  }, []);

  /**
   * Converts a single file to a Photo object with proper dimensions
   * Handles both the file reading and dimension extraction
   */
  const processFile = useCallback(async (file: File): Promise<UploadResult> => {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      // Extract image dimensions - essential for justified layout
      const { width, height } = await getImageDimensions(file);
      
      // Create object URL for the photo source
      const src = URL.createObjectURL(file);
      
      const photo: Photo = {
        src,
        width,
        height,
        alt: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension for alt text
      };

      return { photo, file };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to process image');
    }
  }, [getImageDimensions]);

  /**
   * Handles multiple file uploads with comprehensive error handling
   * Returns successfully processed photos and collects any errors
   */
  const uploadFiles = useCallback(async (files: FileList | File[]): Promise<Photo[]> => {
    setIsUploading(true);
    setUploadErrors([]);
    
    const fileArray = Array.from(files);
    const results: Photo[] = [];
    const errors: UploadError[] = [];

    // Process all files concurrently for better performance
    const promises = fileArray.map(async (file) => {
      try {
        const result = await processFile(file);
        return { success: true, result };
      } catch (error) {
        return { 
          success: false, 
          error: { 
            file, 
            message: error instanceof Error ? error.message : 'Unknown error' 
          } 
        };
      }
    });

    const outcomes = await Promise.all(promises);

    // Separate successful uploads from errors
    outcomes.forEach((outcome) => {
      if (outcome.success && outcome.result) {
        results.push(outcome.result.photo);
      } else if (!outcome.success && outcome.error) {
        errors.push(outcome.error);
      }
    });

    setUploadErrors(errors);
    setIsUploading(false);
    
    return results;
  }, [processFile]);

  /**
   * Clears any existing upload errors
   * Useful for resetting error state before new uploads
   */
  const clearErrors = useCallback(() => {
    setUploadErrors([]);
  }, []);

  return {
    uploadFiles,
    isUploading,
    uploadErrors,
    clearErrors,
  };
};
