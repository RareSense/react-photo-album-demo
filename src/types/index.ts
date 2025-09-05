/**
 * Photo interface for react-photo-album
 * Each photo must have src, width, and height for proper layout calculation
 */
export interface Photo {
  src: string;
  width: number;
  height: number;
  alt?: string;
}

/**
 * File upload result containing the processed photo data
 */
export interface UploadResult {
  photo: Photo;
  file: File;
}

/**
 * Upload error information for error handling
 */
export interface UploadError {
  file: File;
  message: string;
}

/**
 * Props for the main CanvaSidebar component
 */
export interface CanvaSidebarProps {
  className?: string;
  onPhotoSelect?: (photo: Photo) => void;
}
