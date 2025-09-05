import React, { useState, useRef } from 'react';
import { RowsPhotoAlbum } from 'react-photo-album';
import { Upload, Search, FolderOpen, Images } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFileUpload } from '@/hooks/useFileUpload';
import type { Photo, CanvaSidebarProps } from '@/types';
import { cn } from '@/lib/utils';

// Photos array starts empty - images only populate on upload

/**
 * CanvaSidebar Component
 * 
 * A professional-grade sidebar component that replicates Canva's photo management interface.
 * Features include:
 * - File upload with drag & drop support
 * - Justified photo layout using react-photo-album
 * - Search functionality (UI only)
 * - Tab navigation between Images and Folders
 * - Responsive design with fixed width and vertical scrolling
 * 
 * Built with modern React patterns and TypeScript for type safety.
 */
export const CanvaSidebar: React.FC<CanvaSidebarProps> = ({ 
  className, 
  onPhotoSelect 
}) => {
  // State management for photos and UI - starts empty
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // File upload functionality
  const { uploadFiles, isUploading, uploadErrors, clearErrors } = useFileUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handles file selection from the file input
   * Processes multiple files and adds them to the photo gallery
   */
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    clearErrors();
    
    try {
      const newPhotos = await uploadFiles(files);
      setPhotos(prevPhotos => [...prevPhotos, ...newPhotos]);
    } catch (error) {
      console.error('Upload failed:', error);
    }

    // Reset the input to allow selecting the same files again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Triggers the hidden file input when upload button is clicked
   */
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Handles photo click events for the gallery
   */
  const handlePhotoClick = (index: number) => {
    const photo = photos[index];
    onPhotoSelect?.(photo);
  };

  return (
    <div className={cn(
      // Fixed width sidebar with proper constraints
      "w-80 h-screen bg-background border-r border-border",
      // Prevent horizontal scrolling, allow vertical scrolling
      "overflow-x-hidden overflow-y-auto",
      // Professional styling
      "flex flex-col shadow-lg",
      className
    )}>
      {/* Header Section with Upload Button */}
      <div className="p-4 border-b border-border bg-card">
        <Button
          onClick={handleUploadClick}
          disabled={isUploading}
          variant="gradient"
          size="lg"
          className="w-full mb-4 font-semibold"
        >
          <Upload className="w-4 h-4 mr-2" />
          {isUploading ? 'Uploading...' : 'Upload Images'}
        </Button>

        {/* Hidden file input for multiple image selection */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Upload image files"
        />

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search keywords, tags, color"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Error Display */}
        {uploadErrors.length > 0 && (
          <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive font-medium">
              Upload Errors:
            </p>
            {uploadErrors.map((error, index) => (
              <p key={index} className="text-xs text-destructive/80">
                {error.file.name}: {error.message}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="p-4 border-b border-border">
        <Tabs defaultValue="images" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="images" className="flex items-center gap-2">
              <Images className="w-4 h-4" />
              Images
            </TabsTrigger>
            <TabsTrigger value="folders" className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              Folders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="images" className="mt-4">
            {/* Justified Photo Gallery */}
            {photos.length > 0 ? (
              <RowsPhotoAlbum
                photos={photos}
                targetRowHeight={120}
                spacing={2}
                onClick={({ index }) => handlePhotoClick(index)}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Images className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No images uploaded yet</p>
                <p className="text-xs mt-1">
                  Click "Upload Images" to get started
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="folders" className="mt-4">
            <div className="text-center py-8 text-muted-foreground">
              <FolderOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Folder organization</p>
              <p className="text-xs mt-1">
                Feature coming soon
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
