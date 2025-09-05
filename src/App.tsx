import { useState } from 'react';
import { CanvaSidebar } from '@/components/CanvaSidebar';
import type { Photo } from '@/types';

/**
 * Main App Component
 * 
 * Demonstrates the CanvaSidebar component in a full-screen layout.
 * The sidebar is fixed-width (320px) with the main content area taking the remaining space.
 * 
 * Features:
 * - Responsive layout with sidebar + main content
 * - Photo selection handling
 * - Professional Canva-inspired design
 */
function App() {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  /**
   * Handles photo selection from the sidebar
   * Updates the main content area to show the selected photo
   */
  const handlePhotoSelect = (photo: Photo) => {
    setSelectedPhoto(photo);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar - Fixed width with CanvaSidebar component */}
      <CanvaSidebar onPhotoSelect={handlePhotoSelect} />
      
      {/* Main Content Area - Takes remaining space */}
      <div className="flex-1 flex items-center justify-center bg-muted/20">
        {selectedPhoto ? (
          <div className="max-w-4xl max-h-full p-8">
            <div className="bg-card rounded-lg shadow-lg p-4">
              <img
                src={selectedPhoto.src}
                alt={selectedPhoto.alt || 'Selected image'}
                className="max-w-full max-h-full object-contain rounded-md"
              />
              <div className="mt-4 text-center">
                <h3 className="text-lg font-semibold text-foreground">
                  {selectedPhoto.alt || 'Selected Image'}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Dimensions: {selectedPhoto.width} × {selectedPhoto.height}px
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Select an Image</h2>
            <p className="text-sm max-w-sm">
              Choose an image from the sidebar to view it here. You can upload your own images or use the sample photos provided.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App
